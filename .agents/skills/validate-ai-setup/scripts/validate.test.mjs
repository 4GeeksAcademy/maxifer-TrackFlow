import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validate, required } from './validate.mjs';

const sourceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const cli = fileURLToPath(new URL('./validate.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'trackflow-ai-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  // Copy linked documentation too, without dependencies, secrets or product data.
  for (const file of [...required, 'README.md', 'TESTING.md', 'TrackFlow.md', '.agents/skills/validate-ai-setup/scripts/validate.mjs']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, file), path.join(root, file));
  }
  // README has additional links: only mandatory documents are link-validated.
  for (const file of ['uis/website/index.html', 'uis/website/application.html', 'uis/website/i18n.js', 'uis/website/validation.js', 'uis/website/assets/trackflow-logo.svg', 'uis/backoffice/package.json', 'uis/backoffice/talent-pipeline-tracker/package.json']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'fixture');
  }
  fs.mkdirSync(path.join(root, 'services'));
  return root;
}
const failures = root => validate(root).filter(result => !result.ok);

test('configuración válida; el validador no escribe', t => {
  const root = fixture(t);
  const before = fs.readFileSync(path.join(root, 'AGENTS.md'));
  assert.deepEqual(failures(root), []);
  assert.equal(spawnSync(process.execPath, [cli, '--root', root]).status, 0);
  assert.deepEqual(fs.readFileSync(path.join(root, 'AGENTS.md')), before);
});
test('detecta archivo ausente y vacío', t => {
  const root = fixture(t);
  fs.unlinkSync(path.join(root, 'memory-bank/progress.md'));
  fs.writeFileSync(path.join(root, 'BRIEFING.md'), '  ');
  assert(failures(root).some(result => result.name === 'archivo memory-bank/progress.md'));
  assert(failures(root).some(result => result.name === 'archivo BRIEFING.md'));
  assert.equal(spawnSync(process.execPath, [cli, '--root', root]).status, 1);
});
test('detecta enlaces rotos y fuera de raíz', t => {
  const root = fixture(t);
  for (const target of ['inexistente.md', '../fuera.md']) {
    fs.writeFileSync(path.join(root, 'AGENTS.md'), `[enlace](${target})`);
    assert(failures(root).some(result => result.name === 'enlaces AGENTS.md'));
  }
});
test('detecta ruta antigua y entrada canónica ausente', t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'index.html'), 'legacy');
  fs.unlinkSync(path.join(root, 'uis/website/index.html'));
  assert(failures(root).some(result => result.name === 'sin ruta antigua index.html'));
  assert(failures(root).some(result => result.name === 'entrada uis/website/index.html'));
});
test('rechaza frontmatter inválido, campos duplicados y alcance inactivo', t => {
  const root = fixture(t);
  for (const source of ['sin frontmatter', '---\nname: validate-ai-setup\nname: repetido\ndescription: prueba\n---\n', '---\nname: []\ndescription: prueba\n---\n', '---\nname: validate-ai-setup\ndescription: texto: YAML inválido\n---\n', '---\nname: validate-ai-setup\ndescription: null\n---\n']) {
    fs.writeFileSync(path.join(root, required.at(-1)), source);
    assert(failures(root).some(result => result.name === 'frontmatter skill'));
  }
  fs.writeFileSync(path.join(root, '.agents/rules/architecture.md'), '---\ndescription: prueba\nalwaysApply: false\n---\n');
  assert(failures(root).some(result => result.name === 'frontmatter regla'));
});
test('rama obligatoria solo en modo entrega', t => {
  const root = fixture(t);
  execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'pipe' });
  assert.deepEqual(failures(root), []);
  assert(validate(root, { checkBranch: true }).some(result => !result.ok && result.name === 'rama de entrega'));
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/feature/agent-memory-bank'], { cwd: root });
  assert(validate(root, { checkBranch: true }).every(result => result.ok));
});
test('CLI rechaza opciones desconocidas y raíz sin valor', () => {
  for (const args of [['--unknown'], ['--root']]) assert.equal(spawnSync(process.execPath, [cli, ...args]).status, 1);
});
