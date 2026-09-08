// npm run check: parse every module, then render every page and parse every emitted
// <script> in isolation. The second step catches the class of bug node --check cannot:
// a page script is a template literal inside a template literal, so a stray backtick or a
// single-escaped quote only explodes once the HTML is generated.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  const mod = await import(pathToFileURL(path.join(root, 'src', 'ui', 'pages.js')).href);
  for (const [name, fn] of Object.entries(mod)) if (typeof fn === 'function') PAGES.push([name, fn]);
} catch (e) { failed++; console.error('PAGE INDEX FAIL: ' + e.message); }

// the shape loadCfg() returns, with two categories and a plan, so every branch renders
const fakeCfg = () => ({
  tz: 'UTC', clock24: false,
  plan: { start: '2026-01-01', end: '2026-04-30' },
  phases: [{ id: 1, name: 'Phase 1', start_date: '2026-01-01', end_date: '2026-04-30', color: '#4f8ef7', low_load: 0 }],
  categories: [
    { id: 1, key: 'leetcode', name: 'LeetCode', emoji: '🧩', color: '#FF6B35', goal_wd: 3, goal_we: 1, goal_low: 1, builtin: 'leetcode', enabled: 1 },
    { id: 2, key: 'applications', name: 'Applications', emoji: '📨', color: '#5EA2FF', goal_wd: 2, goal_we: 0, goal_low: 1, builtin: 'applications', enabled: 1 },
  ],
  get allCategories() { return this.categories; },
  catKeys: ['leetcode', 'applications'], builtins: { leetcode: 'leetcode', applications: 'applications' },
  sideTasks: [], modules: { leetcode: true, jobs: true, copy: true, friends: true, clock: true },
  sched: { layouts: { morning: [['09:00', '12:00'], ['14:00', '17:00']] }, default: 'morning', byDow: {}, low: 'morning' },
  baseMode: 'morning', blockBudgets: {}, grindTarget: 6, availability: [], bookingEnabled: false, bookingDays: 6,
  bookingPerDevice: 2, bookingPerSlot: 4, bookingDurations: [30, 60, 120, 180], timerDefault: 25, timerOptions: [10, 15, 20, 25, 50],
  streakCategory: 'leetcode', icsToken: 'x', apiKey: 'k', readKey: 'r',
  clock: { design: 'ember', size: 360, font: 12, accent: '' }, mclock: { design: 'pill', font: 13, accent: '' },
  todayLayout: 'classic', jobPlatforms: ['LinkedIn'],
  share: { pinHash: 'h', title: 'My grind', overview: true, lc: true, grind: true, jobs: true, lcNames: true, friends: false, offReasons: false },
  user: { role: 'owner', userId: 'u', handle: 'alex', displayName: 'Alex', base: '' },
});
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
