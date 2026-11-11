"""Test the exact embedded deployment policy with synthetic Docker state."""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).with_name('deploy.sh').read_text().split("<<'RETENTION_PY'\n", 1)[1].split('\nRETENTION_PY', 1)[0]
PREFIX = 'ghcr.io/example/trackflow'
SERVICES = ('landing', 'uis', 'services', 'qdrant')


class RetentionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.versions = [{s: f'sha256:{v}-{s}' for s in SERVICES} for v in range(4)]
        self.images = []
        for v, version in enumerate(self.versions):
            for service, ident in version.items():
                self.images.append({'Id': ident, 'RepoTags': [f'{PREFIX}/{service}:' + str(v)*40]})
        self.containers = [{'Image': image, 'Config': {'Labels': {'com.docker.compose.project': 'trackflow-prod', 'com.docker.compose.service': s}},
                            'State': {'Status': 'running', 'Health': {'Status': 'healthy'}}}
                           for s, image in self.versions[3].items()]
        self.history([0, 1, 2, 3])
        self.removed = []

    def history(self, versions):
        (self.root/'retention-history.json').write_text(json.dumps([
            {'commit': str(v)*40, 'images': self.versions[v]} for v in versions]))

    def docker(self, args, **kwargs):
        a = args[1:]
        if a == ['ps', '-aq']:
            return 'container'
        if a[0] == 'inspect':
            return json.dumps(self.containers)
        if a[:3] == ['image', 'ls', '-aq']:
            return '\n'.join(x['Id'] for x in self.images)
        if a[:2] == ['image', 'inspect']:
            result = []
            for ref in a[2:]:
                found = next((x for x in self.images if ref == x['Id'] or ref in x['RepoTags']), None)
                if not found:
                    raise subprocess.CalledProcessError(1, args)
                result.append(found)
            return json.dumps(result)
        if a[:2] == ['image', 'rm']:
            self.removed.append(a[2:])
            return ''
        raise AssertionError(args)

    def run_policy(self, mode='apply'):
        output = io.StringIO()
        with patch.object(sys, 'argv', ['policy', str(self.root), PREFIX, mode, 'a'*40]), \
                patch('subprocess.check_output', self.docker), contextlib.redirect_stdout(output):
            try:
                exec(compile(SOURCE, 'deploy.sh:retention', 'exec'), {})
            except SystemExit as exc:
                self.assertEqual(exc.code, 0)
        return output.getvalue()

    def test_removes_only_explicit_obsolete_project_tags(self):
        self.run_policy()
        self.assertEqual(self.removed, [[f'{PREFIX}/{s}:'+'0'*40] for s in sorted(SERVICES) if s != 'qdrant'])

    def test_simulation_has_no_mutations(self):
        before = (self.root/'retention-history.json').read_bytes()
        self.assertIn('remove_references', self.run_policy('dry-run'))
        self.assertFalse(self.removed)
        self.assertEqual(before, (self.root/'retention-history.json').read_bytes())

    def test_rollback_and_shared_aliases_are_protected(self):
        directory = self.root/'backups'/'deploy-old'
        directory.mkdir(parents=True)
        text = 'services:\n'
        for image in self.images[:3]:
            tag = 'trackflow-rollback-'+image['Id'].split(':')[1]
            image['RepoTags'].append(tag+':latest')
            text += '  service:\n    image: '+tag+'\n'
        (directory/'rollback-images.yml').write_text(text)
        self.run_policy()
        self.assertFalse(self.removed)

    def test_original_tracker_image_protects_shared_id(self):
        self.images[1]['RepoTags'].append('trackflow-uis:before-tracker-env-original')
        self.run_policy()
        self.assertNotIn([f'{PREFIX}/uis:'+'0'*40], self.removed)

    def test_maintenance_reference_protects_registry_image(self):
        directory = self.root/'maintenance'/'repair'
        directory.mkdir(parents=True)
        (directory/'state.json').write_text(json.dumps({'rollback': f'{PREFIX}/uis:'+'0'*40}))
        self.run_policy()
        self.assertNotIn([f'{PREFIX}/uis:'+'0'*40], self.removed)

    def test_other_projects_are_not_candidates(self):
        self.images.append({'Id': 'sha256:unrelated', 'RepoTags': ['ghcr.io/other/tool/uis:'+'0'*40]})
        self.run_policy()
        self.assertEqual(len(self.removed), 3)

    def test_stopped_containers_also_pin_images(self):
        self.containers.append({'Image': self.versions[0]['services'], 'Config': {'Labels': {}}, 'State': {'Status': 'exited'}})
        self.run_policy()
        self.assertNotIn([f'{PREFIX}/services:'+'0'*40], self.removed)

    def test_unhealthy_service_prevents_cleanup_and_record(self):
        self.containers[0]['State']['Health']['Status'] = 'unhealthy'
        for mode in ('record', 'apply'):
            with self.assertRaises(AssertionError):
                self.run_policy(mode)
        self.assertFalse(self.removed)

    def test_missing_retained_image_prevents_any_deletion(self):
        self.images = [x for x in self.images if x['Id'] != self.versions[1]['uis']]
        with self.assertRaises(subprocess.CalledProcessError):
            self.run_policy()
        self.assertFalse(self.removed)

    def test_duplicate_deployments_do_not_count_as_versions(self):
        self.history([2, 3, 3])
        self.assertIn('need active plus two', self.run_policy())
        self.assertFalse(self.removed)

    def test_corrupt_history_and_unknown_rollback_fail_closed(self):
        (self.root/'retention-history.json').write_text('{')
        with self.assertRaises(ValueError):
            self.run_policy()
        self.history([0, 1, 2, 3])
        directory = self.root/'backups'/'deploy-old'
        directory.mkdir(parents=True)
        (directory/'rollback-images.yml').write_text('unrecognized: true')
        with self.assertRaises(AssertionError):
            self.run_policy()
        self.assertFalse(self.removed)

    def test_record_captures_actual_images_without_deletion(self):
        self.run_policy('record')
        self.assertEqual(json.loads((self.root/'retention-history.json').read_text())[-1]['images'], self.versions[3])
        self.assertFalse(self.removed)


if __name__ == '__main__':
    unittest.main()
