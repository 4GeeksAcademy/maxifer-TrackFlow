import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const required = [
  'BRIEFING.md', 'AGENTS.md', 'memory-bank/projectbrief.md',
  'memory-bank/techContext.md', 'memory-bank/progress.md',
  '.agents/rules/architecture.md', '.agents/skills/validate-ai-setup/SKILL.md',
];

// The authored frontmatter deliberately uses only scalar fields, not arbitrary YAML.
function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('frontmatter ausente');
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([a-zA-Z][a-zA-Z0-9]*): (.+)$/);
    if (!pair || Object.hasOwn(fields, pair[1])) throw new Error('campo inválido o repetido');
    const value = pair[2].trim();
    if (/^[\[\]{}&*!|>#'"%@`]/.test(value) || /:\s|\s#|^[-?:](?:\s|$)/.test(value)) throw new Error('solo escalares simples');
    fields[pair[1]] = value;
  }
  return fields;
}

export function validate(root, { checkBranch = false } = {}) {
  root = path.resolve(root);
  const results = [];
  const check = (name, fn) => {
    try { fn(); results.push({ name, ok: true }); }
    catch (error) { results.push({ name, ok: false, detail: error.message }); }
  };
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  for (const file of required) {
    check(`archivo ${file}`, () => {
      assert(fs.statSync(path.join(root, file)).isFile(), 'no es archivo');
      assert(fs.readFileSync(path.join(root, file), 'utf8').trim(), 'archivo vacío');
    });
    check(`enlaces ${file}`, () => {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
        const href = match[1].trim().replace(/^<|>$/g, '');
        if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
        assert(!/^[a-z][a-z\d+.-]*:/i.test(href), `esquema no admitido: ${href}`);
        const target = path.resolve(path.dirname(path.join(root, file)), decodeURIComponent(href.split(/[?#]/)[0]));
        const relative = path.relative(root, target);
        assert(relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative), `enlace fuera de raíz: ${href}`);
        assert(fs.existsSync(target), `enlace roto: ${href}`);
        const realRelative = path.relative(fs.realpathSync(root), fs.realpathSync(target));
        assert(realRelative !== '..' && !realRelative.startsWith('..' + path.sep) && !path.isAbsolute(realRelative), `destino fuera de raíz: ${href}`);
      }
    });
  }
  check('frontmatter skill', () => {
    const fields = frontmatter(fs.readFileSync(path.join(root, required.at(-1)), 'utf8'));
    assert(fields.name === 'validate-ai-setup' && /^[a-z0-9-]{1,64}$/.test(fields.name), 'nombre inválido');
    assert(fields.description?.trim() && !/^(?:null|true|false|~|[-+]?\d[\d.e+-]*)$/i.test(fields.description), 'descripción debe ser texto');
  });
  check('frontmatter regla', () => {
    const fields = frontmatter(fs.readFileSync(path.join(root, '.agents/rules/architecture.md'), 'utf8'));
    assert(fields.alwaysApply === 'true' && fields.description?.trim(), 'alcance o descripción inválidos');
  });
  for (const dir of ['uis/website', 'uis/backoffice', 'services']) {
    check(`ruta ${dir}`, () => assert(fs.statSync(path.join(root, dir)).isDirectory(), 'no es directorio'));
  }
  for (const file of ['uis/website/index.html', 'uis/website/application.html', 'uis/website/i18n.js', 'uis/website/validation.js', 'uis/website/assets/trackflow-logo.svg', 'uis/backoffice/package.json', 'uis/backoffice/talent-pipeline-tracker/package.json']) {
    check(`entrada ${file}`, () => assert(fs.statSync(path.join(root, file)).isFile(), 'entrada ausente'));
  }
  for (const old of ['index.html', 'application.html', 'i18n.js', 'validation.js', 'assets', 'tailwind.config.js', 'tailwind.input.css', 'uis/talent-pipeline-tracker']) {
    check(`sin ruta antigua ${old}`, () => assert(!fs.existsSync(path.join(root, old)), 'ruta antigua presente'));
  }
  if (checkBranch) check('rama de entrega', () => {
    const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    assert(branch === 'feature/agent-memory-bank', `rama incorrecta: ${branch || 'detached HEAD'}`);
  });
  return results;
}

export function main(args) {
  let root = process.cwd();
  let checkBranch = false;
  try {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--check-branch') checkBranch = true;
      else if (args[i] === '--root' && args[i + 1] && !args[i + 1].startsWith('--')) root = args[++i];
      else throw new Error(`opción inválida o sin valor: ${args[i]}`);
    }
    const results = validate(root, { checkBranch });
    for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? ': ' + result.detail : ''}`);
    return results.every(result => result.ok) ? 0 : 1;
  } catch (error) { console.error(`FAIL ${error.message}`); return 1; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
