"""Exercise data-loss checks and the actual deployment/rollback shell script."""

from copy import deepcopy
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from urllib.error import HTTPError
from unittest.mock import patch

from scripts.verify_deployment import compare, verify_rag


STATE = {"active_user_available": True, "users": ["registered-user"], "suppliers": ["1"], "incidents": [97], "products": [1], "orders": ["inbound:1"], "database_sha256": "original-database", "jwt_sha256": "original-jwt"}


class RAGVerificationTests(unittest.TestCase):
    def unavailable(self, status=503, detail="Servicio temporalmente no disponible"):
        return HTTPError("http://uis:3001/backend/api/rag/query", status, "Unavailable", {},
                         io.BytesIO(json.dumps({"detail": detail}).encode()))

    def test_transient_503_is_retried_and_validated(self):
        payload = {"answer": "Synthetic", "sources": [{"source_document": "returns-policy"}],
                   "retrieved_count": 1, "abstained": False}
        with patch("urllib.request.urlopen", side_effect=[self.unavailable(), self.response(payload)]) as request:
            with patch("scripts.verify_deployment.time.sleep") as sleep:
                verify_rag({"Authorization": "Bearer synthetic"})
        self.assertEqual(request.call_count, 2)
        sleep.assert_called_once_with(1)

    def test_persistent_503_blocks_release_after_three_attempts(self):
        with patch("urllib.request.urlopen", side_effect=[self.unavailable() for _ in range(3)]) as request:
            with patch("scripts.verify_deployment.time.sleep") as sleep:
                with self.assertRaisesRegex(RuntimeError, "HTTP 503"):
                    verify_rag({})
        self.assertEqual(request.call_count, 3)
        self.assertEqual([call.args[0] for call in sleep.call_args_list], [1, 2])

    def test_other_http_errors_are_not_retried_and_credentials_are_redacted(self):
        error = self.unavailable(401, "Bearer private-token api_key=private-key https://user:private-password@example.com sk-abcdefghijklmnop")
        with patch("urllib.request.urlopen", side_effect=error) as request:
            with self.assertRaises(RuntimeError) as raised:
                verify_rag({})
        self.assertEqual(request.call_count, 1)
        message = str(raised.exception)
        self.assertIn("HTTP 401", message)
        for secret in ["private-token", "private-key", "private-password", "sk-abcdefghijklmnop"]:
            self.assertNotIn(secret, message)

    def response(self, payload):
        response = io.BytesIO(json.dumps(payload).encode())
        response.status = 200
        return response

    def test_authenticated_request_passes_through_next_proxy(self):
        payload = {"answer": "Synthetic", "sources": [{"source_document": "returns-policy", "section": "Test"}],
                   "retrieved_count": 1, "abstained": False}
        with patch("urllib.request.urlopen", return_value=self.response(payload)) as request:
            verify_rag({"Authorization": "Bearer synthetic"})
        args, kwargs = request.call_args
        self.assertEqual(args[0].full_url, "http://uis:3001/backend/api/rag/query")
        self.assertEqual(args[0].get_method(), "POST")
        self.assertEqual(args[0].get_header("Authorization"), "Bearer synthetic")
        self.assertEqual(kwargs["timeout"], 40)

    def test_empty_abstained_or_unsourced_answer_blocks_release(self):
        payload = {"answer": "Synthetic", "sources": [{"source_document": "returns-policy"}],
                   "retrieved_count": 1, "abstained": False}
        for change in [{"answer": ""}, {"sources": []}, {"retrieved_count": 0}, {"abstained": True}]:
            with self.subTest(change=change):
                with patch("urllib.request.urlopen", return_value=self.response(payload | change)):
                    with self.assertRaises(AssertionError):
                        verify_rag({"Authorization": "Bearer synthetic"})


class DataPreservationTests(unittest.TestCase):
    def test_new_records_are_allowed(self):
        after = deepcopy(STATE)
        after["users"].append("new-user")
        compare(STATE, after)

    def test_record_loss_is_rejected(self):
        for table in ["users", "suppliers", "incidents", "products", "orders"]:
            with self.subTest(table=table):
                after = deepcopy(STATE)
                after[table] = []
                with self.assertRaises(RuntimeError):
                    compare(STATE, after)

    def test_database_or_session_secret_change_is_rejected(self):
        for field in ["database_sha256", "jwt_sha256"]:
            with self.subTest(field=field):
                after = deepcopy(STATE)
                after[field] = "different"
                with self.assertRaises(RuntimeError):
                    compare(STATE, after)


FAKE_DOCKER = r'''#!/usr/bin/env python3
import json,os,pathlib,sys
if os.environ.get('FAIL_RESTORE_AND_VERIFY')=='1':
    os.environ['FAIL_VERIFY']='1';os.environ['FAIL_RESTORE']='1'
a=sys.argv[1:]
with open(os.environ['DOCKER_CALLS'],'a') as stream:stream.write(json.dumps(a)+'\n')
if a[0]=='login':sys.stdin.read();sys.exit(0)
if a[0]=='inspect':
    if '--format' in a:print('sha256:previous-image')
    else:print(json.dumps([{'Image':'sha256:current-'+s,'Config':{'Labels':{'com.docker.compose.project':'trackflow-prod','com.docker.compose.service':s}},'State':{'Status':'running','Health':{'Status':'healthy'}}} for s in ['landing','uis','services','qdrant']]))
    sys.exit(0)
if a[0]=='ps':print('synthetic-container');sys.exit(0)
if a[0]!='compose':sys.exit(0)
if 'run' in a:
    action=a[a.index('data.pipelines.production_rag')+1]
    if action=='prepare' and os.environ.get('FAIL_PREPARE_TIMEOUT')=='1':sys.exit(124)
    if os.environ.get('FAIL_'+action.upper())=='1':sys.exit(1)
    if action=='prepare':
        print(json.dumps({'alias':'trackflow_knowledge_prod','previous':'previous-index' if os.environ.get('EXISTING_RAG')=='1' else None,'candidate':'new-index','fingerprint':'test','chunks':20,'documents':4,'reused':False}))
    else:print('{"ok":true}')
    sys.exit(0)
if 'ps' in a:print('previous-'+a[-1]);sys.exit(0)
if 'exec' in a:
    sys.stdin.read()
    if '--snapshot' in a:
        state=json.loads(os.environ['TEST_STATE'])
        if os.environ.get('FAIL_NO_ACTIVE_USER')=='1':state['active_user_available']=False
        print(json.dumps(state))
    elif os.environ.get('FAIL_VERIFY')=='1':sys.exit(1)
    else:print('verified')
    sys.exit(0)
if 'config' in a and 'json' in a:
    environment={'DEMO_DATA_ENABLED':'false','QDRANT_URL':'http://qdrant:6333','RAG_COLLECTION_NAME':'trackflow_knowledge_prod','LITELLM_API_BASE':'http://synthetic','LITELLM_API_KEY':'synthetic','RAG_EMBEDDING_MODEL':'embedding','RAG_LLM_MODEL':'chat'}
    if os.environ.get('FAIL_CONFIG')=='1':environment.pop('LITELLM_API_KEY')
    print(json.dumps({'volumes':{'api_data':{'name':'trackflow-prod_api_data'},'qdrant_data':{'name':'trackflow-prod_qdrant_data'}},'services':{'services':{'volumes':[{'type':'volume','source':'api_data','target':'/app/services/api/data'}],'environment':environment},'qdrant':{},'uis':{'environment':{'BACKEND_INTERNAL_URL':'http://services:8000','NEXT_PUBLIC_API_URL':''}}}}))
if 'pull' in a and os.environ.get('FAIL_PULL')=='1':sys.exit(1)
if 'up' in a and a[-1]!='qdrant' and os.environ.get('FAIL_UP')=='1' and not any(v.endswith('rollback-images.yml') for v in a):sys.exit(1)
'''


@unittest.skipUnless(sys.platform == "linux" and shutil.which("bash") and shutil.which("flock"), "Deployment script runs on Linux")
class DeploymentScriptTests(unittest.TestCase):
    def run_deployment(self, failure=None, existing_rag=False, mode=None, minimum=None):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        app = Path(temporary.name)
        commit = "a" * 40
        release = app / "releases" / commit
        release.mkdir(parents=True)
        original = b"name: original-deployment\n"
        (app / "docker-compose.prod.yml").write_bytes(original)
        (app / ".env").write_text("JWT_SECRET=unchanged\nDATABASE_URL=unchanged\n")
        (release / "docker-compose.prod.yml").write_text("services:\n  landing:\n    image: ${LANDING_IMAGE:-trackflow-prod-landing:latest}\n  uis:\n    image: ${UIS_IMAGE:-trackflow-prod-uis:latest}\n  services:\n    image: ${API_IMAGE:-trackflow-prod-services:latest}\n")
        (release / "release.json").write_text(json.dumps({"commit": commit, "public_api_url": ""}))
        (release / "verify_deployment.py").write_text("# supplied to mocked docker exec\n")
        executable = app / "bin" / "docker"
        executable.parent.mkdir()
        executable.write_text(FAKE_DOCKER)
        executable.chmod(0o755)
        calls = app / "docker-calls.jsonl"
        env = os.environ | {"PATH": str(executable.parent) + os.pathsep + os.environ["PATH"], "DOCKER_CALLS": str(calls), "TEST_STATE": json.dumps(STATE)}
        if failure:
            env[failure] = "1"
        if existing_rag:
            env["EXISTING_RAG"] = "1"
        if minimum:
            env['TRACKFLOW_MIN_FREE_BYTES'] = str(minimum)
        command = ["bash", str(Path(__file__).with_name("deploy.sh")), str(app), commit, "ghcr.io/example/trackflow", "ci-user"]
        if mode:
            command.append(mode)
        result = subprocess.run(command, input="short-lived-token\n", text=True, capture_output=True, env=env)
        call_text = calls.read_text() if calls.exists() else ''
        log = [json.loads(line) for line in call_text.splitlines()]
        self.assertEqual((app / ".env").read_text(), "JWT_SECRET=unchanged\nDATABASE_URL=unchanged\n")
        self.assertNotIn("short-lived-token", result.stdout + result.stderr + call_text)
        self.assertFalse(any("down" in call for call in log))
        return result, log, app, original

    def test_success_persists_images_and_release(self):
        result, _, app, _ = self.run_deployment()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual((app / "current-release").read_text().strip(), "a" * 40)
        self.assertIn("ghcr.io/example/trackflow/services:", (app / "docker-compose.prod.yml").read_text())
        self.assertEqual(len(json.loads((app/'retention-history.json').read_text())), 1)

    def test_dry_run_and_insufficient_space_do_not_deploy(self):
        for mode, minimum, expected in [('--dry-run', None, 0), (None, 999999999999999, 1)]:
            with self.subTest(mode=mode):
                result, calls, app, original = self.run_deployment(mode=mode, minimum=minimum)
                self.assertEqual(result.returncode, expected, result.stderr)
                self.assertEqual(calls, [])
                self.assertEqual((app/'docker-compose.prod.yml').read_bytes(), original)
                self.assertFalse((app/'backups').exists())

    def test_pull_failure_keeps_running_stack(self):
        result, calls, app, original = self.run_deployment("FAIL_PULL")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("stop" in call or "up" in call for call in calls))
        self.assertEqual((app / "docker-compose.prod.yml").read_bytes(), original)
        self.assertFalse((app/'retention-history.json').exists())

    def test_startup_and_verification_failures_restore_previous_images(self):
        for failure in ["FAIL_UP", "FAIL_VERIFY", "FAIL_ACTIVATE"]:
            with self.subTest(failure=failure):
                result, calls, app, original = self.run_deployment(failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue(any("up" in call and any(v.endswith("rollback-images.yml") for v in call) for call in calls))
                self.assertEqual((app / "docker-compose.prod.yml").read_bytes(), original)
                self.assertFalse((app / "current-release").exists())
                self.assertFalse((app/'retention-history.json').exists())
                self.assertTrue(any("restore" in call for call in calls))

    def test_configuration_or_preparation_failure_does_not_stop_api(self):
        for failure in ["FAIL_CONFIG", "FAIL_CHECK", "FAIL_PREPARE", "FAIL_PREPARE_TIMEOUT", "FAIL_NO_ACTIVE_USER"]:
            with self.subTest(failure=failure):
                result, calls, app, original = self.run_deployment(failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(any("stop" in call for call in calls))
                self.assertFalse(any("activate" in call for call in calls))
                self.assertEqual((app / "docker-compose.prod.yml").read_bytes(), original)
                self.assertTrue(any(call[:2] == ["rm", "-f"] and call[-1] == "trackflow-rag-" + "a" * 40 for call in calls))

    def test_existing_index_saved_and_rollback_precedes_previous_api(self):
        result, calls, app, _ = self.run_deployment("FAIL_VERIFY", existing_rag=True)
        self.assertNotEqual(result.returncode, 0)
        import base64
        restore = next(call for call in calls if "restore" in call)
        state = json.loads(base64.b64decode(restore[restore.index("--state-b64") + 1]))
        self.assertEqual(state["previous"], "previous-index")
        restore_position = calls.index(restore)
        rollback_position = next(i for i, call in enumerate(calls)
                                 if "up" in call and any(v.endswith("rollback-images.yml") for v in call))
        self.assertLess(restore_position, rollback_position)

    def test_alias_restore_failure_keeps_api_stopped(self):
        # Simulate both verification and rollback failure with a composite flag.
        result, calls, _, _ = self.run_deployment("FAIL_RESTORE_AND_VERIFY")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("up" in call and any(v.endswith("rollback-images.yml") for v in call) for call in calls))


if __name__ == "__main__":
    unittest.main()
