// Local, one-off: read the owner's single-user LockIn database (read-only, via wrangler) and
// write owner-export.json in the lockin-export/1 shape. Never deployed, never committed
// (owner-export.json is git-ignored).
//
//   CLOUDFLARE_ACCOUNT_ID=... env -u CLOUDFLARE_API_TOKEN node scripts/import-legacy.mjs
//
// Then, once the owner has signed up on cslockin.com:
//   curl -X POST https://cslockin.com/admin/import -H "Authorization: Bearer $ADMIN_KEY" \
//        -H 'Content-Type: application/json' --data-binary @payload.json
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const LEGACY_DIR = 'D:/Files/NYU/Work/lockin-platform';
const OUT = new URL('../owner-export.json', import.meta.url);
const TABLES = ['settings', 'phases', 'tasks', 'daily_goals', 'grind_sessions', 'block_moves', 'lc_solves', 'lc_notes', 'jobs', 'off_days', 'links', 'snippets', 'sessions', 'session_friends'];

const pull = t => {
  // shell:true on Windows means quoting the SQL ourselves
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'lockin-db', '--remote', '--json', '--command', '"SELECT * FROM ' + t + '"'],
    { cwd: LEGACY_DIR, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });
  const i = out.indexOf('['); const j = out.lastIndexOf(']');
  return JSON.parse(out.slice(i, j + 1))[0].results;
};

const src = {};
for (const t of TABLES) { src[t] = pull(t); console.log(t.padEnd(16), src[t].length); }

const S = {}; for (const r of src.settings) S[r.key] = r.value;
const j = (v, d) => { try { return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const isHM = v => /^\d{2}:\d{2}$/.test(v || '');
const blocks = v => { if (v && !Array.isArray(v) && v.g1) v = [v.g1, v.g2].filter(Boolean); return Array.isArray(v) ? v.filter(g => Array.isArray(g) && isHM(g[0]) && isHM(g[1])).slice(0, 4) : []; };
const renameKey = k => k === 'apps' ? 'applications' : k;

// ---- schedule: the four old modes become named layouts ----
const old = j(S.sched, {});
const layouts = {
  morning: blocks(old.morning).length ? blocks(old.morning) : [['09:30', '12:00'], ['15:00', '18:30']],
  night: blocks(old.night).length ? blocks(old.night) : [['15:00', '18:00'], ['22:00', '01:30']],
  sunday: old.sunday && old.sunday.g1 ? [old.sunday.g1] : [['11:00', '13:00']],
  low: old.visitor && old.visitor.g1 ? [old.visitor.g1] : [['23:00', '03:00']],
};
const sched = { layouts, default: ['morning', 'night'].includes(S.base_mode) ? S.base_mode : 'morning', byDow: { 0: 'sunday' }, low: 'low' };

// ---- side tasks: gym + class ----
const [gs, ge] = (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(S.gym_time || '') ? S.gym_time : '19:00-20:30').split('-');
const side_tasks = [
  { id: 1, name: 'Gym', emoji: '🏋️', days: (S.gym_days || '1,3,5'), start: gs, end: ge, date_from: null, date_to: null, enabled: 1, sort: 0 },
  { id: 2, name: 'Deep Learning class', emoji: '🎓', days: '4', start: '18:00', end: '20:00', date_from: '2026-09-03', date_to: '2026-12-10', enabled: S.class_enabled === '0' ? 0 : 1, sort: 1 },
];

// ---- categories: the old fixed four ----
const categories = [
  { id: 1, key: 'leetcode', name: 'LeetCode', emoji: '🧩', color: '#FF6B35', goal_wd: 3, goal_we: 1, goal_low: 1, builtin: 'leetcode', enabled: 1, sort: 0 },
  { id: 2, key: 'applications', name: 'Applications', emoji: '📨', color: '#5EA2FF', goal_wd: 2, goal_we: 0, goal_low: 1, builtin: 'applications', enabled: 1, sort: 1 },
  { id: 3, key: 'course', name: 'Course', emoji: '📚', color: '#9B6EF3', goal_wd: 0, goal_we: 0, goal_low: 0, builtin: null, enabled: 1, sort: 2 },
  { id: 4, key: 'other', name: 'Other', emoji: '⭐', color: '#5C6779', goal_wd: 0, goal_we: 0, goal_low: 0, builtin: null, enabled: 1, sort: 3 },
];

// ---- settings ----
const budgets = j(S.modules, {});
for (const k of Object.keys(budgets)) if (Array.isArray(budgets[k])) budgets[k] = budgets[k].map(x => ({ t: renameKey(x.t), m: x.m }));
const keep = ['booking_days', 'timer_default', 'today_layout', 'job_platforms', 'clock_design', 'clock_size', 'clock_font', 'clock_accent',
  'mclock_design', 'mclock_font', 'mclock_accent', 'share_title', 'share_overview', 'share_lc', 'share_grind', 'share_jobs', 'share_lcnames', 'share_friends', 'share_offreasons'];
const settings = [
  ['timezone', 'America/New_York'], ['clock_24h', '0'],
  ['sched', JSON.stringify(sched)], ['block_budgets', JSON.stringify(budgets)],
  ['modules', JSON.stringify({ leetcode: true, jobs: true, copy: true, friends: true, clock: true })],
  ['grind_target_hours', '6'], ['availability', JSON.stringify([['12:00', '15:00']])],
  ['booking_enabled', S.booking_enabled === '0' ? '0' : '1'],
  ['imported_from', 'lockin-platform ' + new Date().toISOString()],
  ...keep.filter(k => S[k] !== undefined).map(k => [k, S[k]]),
].map(([key, value]) => ({ key, value }));

// ---- rows ----
const phases = src.phases.map((p, i) => ({ id: p.id, name: p.name, start_date: p.start_date, end_date: p.end_date, color: p.color, low_load: p.mode === 'visitor' ? 1 : 0, sort: i }));
const daily_goals = src.daily_goals.map(r => ({ ...r, type: renameKey(r.type) }));
const grind_sessions = src.grind_sessions.map(r => ({ ...r, cur_task: r.cur_task ? renameKey(r.cur_task) : r.cur_task,
  splits: JSON.stringify(j(r.splits, []).map(s => ({ ...s, t: renameKey(s.t) }))) }));
const off_days = src.off_days.map(r => { const g = j(r.saved_goals, {}); const o = {}; for (const [k, v] of Object.entries(g)) o[renameKey(k)] = v; return { ...r, saved_goals: JSON.stringify(o) }; });
const block_moves = src.block_moves.map(r => {
  const m = /^Grind block (\d)$/.exec(r.label);
  const id = m ? 'g' + m[1] : r.label === 'Gym' ? 'st:1' : /class/i.test(r.label) ? 'st:2' : null;
  return id ? { ...r, label: id } : null;
}).filter(Boolean);

const out = {
  format: 'lockin-export/1', exportedAt: new Date().toISOString(), schema: 1,
  tables: { settings, phases, categories, side_tasks, tasks: src.tasks, daily_goals, grind_sessions, block_moves,
    lc_solves: src.lc_solves, lc_notes: src.lc_notes, jobs: src.jobs, off_days, links: src.links, snippets: src.snippets,
    sessions: src.sessions, session_friends: src.session_friends },
};
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('wrote owner-export.json:', Object.entries(out.tables).map(([k, v]) => k + '=' + v.length).join(' '));
