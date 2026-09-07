// npm run check: parse every module, then render every page and parse every emitted
// <script> in isolation. The second step catches the class of bug node --check cannot:
// a page script is a template literal inside a template literal, so a stray backtick or a
// single-escaped quote only explodes once the HTML is generated.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []);

let failed = 0;
for (const f of walk(path.join(root, 'src'))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { failed++; console.error('PARSE FAIL ' + path.relative(root, f) + '\n' + e.stderr); }
}

// page renderers: each export takes (cfg, opts) and returns HTML. Filled in as pages are ported.
const PAGES = [];
try {
  const mod = await import(path.join(root, 'src', 'ui', 'pages.js').replace(/\\/g, '/'));
  for (const [name, fn] of Object.entries(mod)) if (typeof fn === 'function') PAGES.push([name, fn]);
} catch (e) { /* no page index yet */ }

const fakeCfg = () => ({});
for (const [name, fn] of PAGES) {
  let html;
  try { html = await fn(fakeCfg(), {}); } catch (e) { failed++; console.error('RENDER FAIL ' + name + ': ' + e.message); continue; }
  const scripts = [...String(html).matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  scripts.forEach((s, i) => {
    try { new vm.Script(s, { filename: name + '#' + i }); }
    catch (e) { failed++; console.error('SCRIPT FAIL ' + name + ' script #' + i + ': ' + e.message); }
  });
}

if (failed) { console.error(failed + ' problem(s)'); process.exit(1); }
console.log('check ok: ' + walk(path.join(root, 'src')).length + ' modules, ' + PAGES.length + ' pages');
