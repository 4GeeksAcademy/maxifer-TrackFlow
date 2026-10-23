"""Exercise data-loss checks and the actual deployment/rollback shell script."""

from copy import deepcopy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from scripts.verify_deployment import compare


STATE = {"users": ["registered-user"], "suppliers": ["1"], "incidents": [97], "products": [1], "orders": ["inbound:1"], "database_sha256": "original-database", "jwt_sha256": "original-jwt"}


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
a=sys.argv[1:]
with open(os.environ['DOCKER_CALLS'],'a') as stream:stream.write(json.dumps(a)+'\n')
if a[0]=='login':sys.stdin.read();sys.exit(0)
if a[0]=='inspect':print('sha256:previous-image');sys.exit(0)
if a[0]!='compose':sys.exit(0)
if 'ps' in a:print('previous-'+a[-1]);sys.exit(0)
if 'exec' in a:
    sys.stdin.read()
    if '--snapshot' in a:print(os.environ['TEST_STATE'])
    elif os.environ.get('FAIL_VERIFY')=='1':sys.exit(1)
    else:print('verified')
    sys.exit(0)
if 'config' in a and 'json' in a:
    print(json.dumps({'volumes':{'api_data':{'name':'trackflow-prod_api_data'}},'services':{'services':{'volumes':[{'type':'volume','source':'api_data','target':'/app/services/api/data'}],'environment':{'DEMO_DATA_ENABLED':'false'}},'uis':{'environment':{'BACKEND_INTERNAL_URL':'http://services:8000','NEXT_PUBLIC_API_URL':''}}}}))
if 'pull' in a and os.environ.get('FAIL_PULL')=='1':sys.exit(1)
if 'up' in a and os.environ.get('FAIL_UP')=='1' and not any(v.endswith('rollback-images.yml') for v in a):sys.exit(1)
'''


@unittest.skipUnless(sys.platform == "linux" and shutil.which("bash") and shutil.which("flock"), "Deployment script runs on Linux")
class DeploymentScriptTests(unittest.TestCase):
    def run_deployment(self, failure=None):
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
        result = subprocess.run(["bash", str(Path(__file__).with_name("deploy.sh")), str(app), commit, "ghcr.io/example/trackflow", "ci-user"], input="short-lived-token\n", text=True, capture_output=True, env=env)
        log = [json.loads(line) for line in calls.read_text().splitlines()]
        self.assertEqual((app / ".env").read_text(), "JWT_SECRET=unchanged\nDATABASE_URL=unchanged\n")
        self.assertNotIn("short-lived-token", result.stdout + result.stderr + calls.read_text())
        self.assertFalse(any("down" in call for call in log))
        return result, log, app, original

    def test_success_persists_images_and_release(self):
        result, _, app, _ = self.run_deployment()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual((app / "current-release").read_text().strip(), "a" * 40)
        self.assertIn("ghcr.io/example/trackflow/services:", (app / "docker-compose.prod.yml").read_text())

    def test_pull_failure_keeps_running_stack(self):
        result, calls, app, original = self.run_deployment("FAIL_PULL")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("stop" in call or "up" in call for call in calls))
        self.assertEqual((app / "docker-compose.prod.yml").read_bytes(), original)

    def test_startup_and_verification_failures_restore_previous_images(self):
        for failure in ["FAIL_UP", "FAIL_VERIFY"]:
            with self.subTest(failure=failure):
                result, calls, app, original = self.run_deployment(failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue(any("up" in call and any(v.endswith("rollback-images.yml") for v in call) for call in calls))
                self.assertEqual((app / "docker-compose.prod.yml").read_bytes(), original)
                self.assertFalse((app / "current-release").exists())


if __name__ == "__main__":
    unittest.main()
