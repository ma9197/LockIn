// The per-user app. Runs INSIDE a user's Durable Object against that user's own database.
// Every route here is the same route the single-user LockIn had; what changed is identity:
// the Worker has already worked out who is calling and with which role, and put that in
// c.env.CTX. There is no PIN, no cookie check and no key lookup in this file any more.
//
// Derived from the single-user index.js by scripts/port-app.mjs.
import { Hono } from 'hono';
import { sha256hex, pinHash, setSetting, todayIn, nowIn, localEpoch, isAuthed, loadCfg, normSched, validTz, isLowLoad, SIDE_EMOJI, nextDay, shiftDays, modeForDate, blocksFor, bookableWindows, buildICS, dayBlocks, movesFor, canonName, shareToken, keyEq } from './helpers.js';
import { guides, toMarkdown } from './readapi.js';
import { jobsPage } from './ui/jobs.js';
import { sharePinPage, shareOffPage } from './ui/pin.js';
import { dashboardPage } from './ui/dashboard.js';
import { calendarPage } from './ui/calendar.js';
import { progressPage } from './ui/progress.js';
import { friendsPage } from './ui/friends.js';
import { settingsPage } from './ui/settings.js';
import { bookPage } from './ui/book.js';
import { copyPage } from './ui/copy.js';
import { leetcodePage } from './ui/leetcode.js';

export function createUserApp() {
const app = new Hono();
const json = (c, o, s = 200) => c.json(o, s);
const role = c => (c.env.CTX && c.env.CTX.role) || 'none';

async function requireOwner(c) {
  const cfg = await loadCfg(c.env.DB);
  cfg.user = c.env.CTX;
  c.set('cfg', cfg);
  return role(c) === 'owner';
}

// ---- pages ----
const OWNER_PAGES = { '/': dashboardPage, '/calendar': calendarPage, '/progress': progressPage, '/leetcode': leetcodePage, '/jobs': jobsPage, '/copy': copyPage, '/friends': friendsPage, '/settings': settingsPage };
for (const [path, page] of Object.entries(OWNER_PAGES)) {
  app.get(path, async c => {
    if (role(c) !== 'owner') return c.text('forbidden', 403);
    const cfg = await loadCfg(c.env.DB);
    cfg.user = c.env.CTX;
    return c.html(page(cfg));
  });
}
const getDevice = c => {
  const m = (c.req.header('Cookie') || '').match(/lockin_dev=([a-f0-9]{24})/);
  return m ? m[1] : null;
};
app.get('/book', c => {
  if (!getDevice(c)) {
    const id = [...crypto.getRandomValues(new Uint8Array(12))].map(x => x.toString(16).padStart(2, '0')).join('');
    c.header('Set-Cookie', `lockin_dev=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
  }
  return loadCfg(c.env.DB).then(cfg => { cfg.user = c.env.CTX; return c.html(bookPage(cfg)); });
});
// ---- shared read-only Progress ----
const shareAuthed = async (c, cfg) =>
  !!cfg.share.pinHash && isAuthed(c, await shareToken(c.env.CTX.userId, cfg.share.pinHash), 'lockin_share');
app.get('/share', async c => {
  const cfg = await loadCfg(c.env.DB);
  cfg.user = c.env.CTX;
  if (!cfg.share.pinHash) return c.html(shareOffPage());
  if (!getDevice(c)) {
    const id = [...crypto.getRandomValues(new Uint8Array(12))].map(x => x.toString(16).padStart(2, '0')).join('');
    c.header('Set-Cookie', `lockin_dev=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
  }
  if (!(await shareAuthed(c, cfg))) return c.html(sharePinPage(cfg, ''));
  return c.html(progressPage(cfg, { share: true }));
});
app.get('/manifest.json', c => c.json({
  name: 'LockIn', short_name: 'LockIn', start_url: '/', display: 'standalone',
  background_color: '#0B0E14', theme_color: '#0B0E14',
  icons: [{ src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230B0E14'/><text x='50' y='68' font-size='52' text-anchor='middle'>🔥</text></svg>", sizes: 'any', type: 'image/svg+xml' }]
}));


// ---- API gate: roles, not credentials ----
app.use('/api/*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  const open = ['/api/book', '/api/book/slots', '/api/share/login'];
  if (open.includes(path)) return next();
  // agent API key: allowed for the jobs resource only (list, read, add, edit, delete)
  if (role(c) === 'agent') {
    if (/^\/api\/jobs(\/\d+)?$/.test(path) && ['GET', 'POST', 'PATCH', 'DELETE'].includes(c.req.method)) {
      c.set('cfg', await loadCfg(c.env.DB)); c.set('viaAgent', true); return next();
    }
    return json(c, { error: 'this key only reaches the jobs API' }, 401);
  }
  // read-only data API. The key may arrive as a Bearer header (Claude Code) OR in the query
  // string (claude.ai chat in a browser cannot set headers). Because that URL ends up in chat
  // transcripts and browser history, it carries its OWN secret: read_key opens these three GETs
  // and nothing else, and api_key is deliberately NOT accepted here.
  // The method check is load bearing. Drop it and a future POST on one of these paths would
  // silently inherit read-key auth.
  if (role(c) === 'read') {
    c.set('cfg', await loadCfg(c.env.DB));
    if (/^\/api\/read\/(leetcode|jobs|progress)$/.test(path) && c.req.method === 'GET') { c.set('viaRead', true); return next(); }
    return json(c, { error: 'this key is read-only and only reaches /api/read/*' }, 401);
  }
  // a friend's share cookie reaches this one read-only endpoint and nothing else
  if (path === '/api/share/progress' && c.req.method === 'GET') {
    const cfg = await loadCfg(c.env.DB);
    if (await shareAuthed(c, cfg)) { c.set('cfg', cfg); c.set('viaShare', true); return next(); }
    return json(c, { error: 'unauthorized' }, 401);
  }
  if (!(await requireOwner(c))) return json(c, { error: 'unauthorized' }, 401);
  return next();
});

app.post('/api/share/login', async c => {
  const db = c.env.DB;
  const cfg = await loadCfg(db);
  if (!cfg.share.pinHash) return json(c, { error: 'sharing is off' }, 404);
  const dev = getDevice(c) || 'nocookie';
  const now = Date.now();
  const gate = await db.prepare('SELECT fails, until FROM share_gate WHERE device=?').bind(dev).first();
  if (gate && gate.until && new Date(gate.until).getTime() > now) {
    const mins = Math.max(1, Math.ceil((new Date(gate.until).getTime() - now) / 60000));
    return json(c, { error: `Too many attempts. Try again in ${mins} min.` }, 429);
  }
  const { pin } = await c.req.json().catch(() => ({}));
  if (!pin || (await pinHash(c.env.CTX.userId + ':' + String(pin))) !== cfg.share.pinHash) {
    const fails = ((gate && gate.until ? 0 : (gate ? gate.fails : 0)) || 0) + 1;
    const until = fails >= 5 ? new Date(now + 15 * 60000).toISOString() : null;
    await db.prepare(`INSERT INTO share_gate (device,fails,until) VALUES (?,?,?)
      ON CONFLICT(device) DO UPDATE SET fails=excluded.fails, until=excluded.until`).bind(dev, fails, until).run();
    return json(c, { error: until ? 'Too many attempts. Try again in 15 min.' : 'wrong pin' }, until ? 429 : 401);
  }
  await db.prepare('DELETE FROM share_gate WHERE device=?').bind(dev).run();
  const tok = await shareToken(c.env.CTX.userId, cfg.share.pinHash);
  c.header('Set-Cookie', `lockin_share=${tok}; Path=${c.env.CTX.base || '/'}; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000`);
  return json(c, { ok: true });
});
// hidden blocks are stripped server side, so they never reach the browser at all
app.get('/api/share/progress', async c => {
  const cfg = c.get('cfg');
  const sh = cfg.share;
  const p = await buildProgress(c.env.DB, c.get('cfg'));
  const phases = (await c.env.DB.prepare('SELECT * FROM phases ORDER BY start_date').all()).results;
  const out = { title: sh.title, phases, today: todayIn(c.env.TZ), blocks: {
    overview: sh.overview, lc: sh.lc, grind: sh.grind, jobs: sh.jobs, friends: sh.friends } };
  if (sh.overview) {
    out.streak = p.streak; out.totalLC = p.totalLC; out.totalApps = p.totalApps; out.tasksDone = p.tasksDone;
    out.pace = p.pace; out.week = p.week; out.records = p.records; out.plan = p.plan; out.consistency = p.consistency;
    out.offdays = sh.offReasons ? p.offdays : { total: p.offdays.total, reasons: [], recent: [] };
    out.lcOpen = p.lc ? p.lc.openTotal : 0; out.lcSlow = p.lc ? p.lc.slowTotal : 0;
  }
  if (sh.lc) {
    const lc = { ...p.lc };
    if (!sh.lcNames) { lc.days = []; lc.problems = []; }
    out.lc = lc; out.lc30 = p.lc30;
  }
  if (sh.grind) { out.grind = p.grind; out.heat = p.heat; }
  if (sh.jobs) { out.funnel = p.funnel; out.byPlatform = p.byPlatform; out.apps30 = p.apps30; out.history = { apps: p.history.apps }; out.jobsMeta = p.jobsMeta; }
  if (sh.friends) out.friends = p.friends;
  return json(c, out);
});

// ---- notifications ----
app.get('/api/notify', async c => {
  const r = await c.env.DB.prepare("SELECT COUNT(*) n FROM sessions WHERE status='requested'").first();
  return json(c, { pending: r.n });
});

// ---- day view ----
app.get('/api/day', async c => {
  const db = c.env.DB;
  const cfg = c.get('cfg');
  const date = c.req.query('date') || todayIn(c.env.TZ);
  const mode = await modeForDate(db, date, cfg);
  const tasks = (await db.prepare('SELECT * FROM tasks WHERE date=? ORDER BY shiftable DESC, sort').bind(date).all()).results;
  const goalsRaw = (await db.prepare('SELECT * FROM daily_goals WHERE date=?').bind(date).all()).results;
  const goals = {};
  for (const g of goalsRaw) goals[g.type] = g;
  const phase = await db.prepare('SELECT * FROM phases WHERE start_date<=? AND end_date>=? ORDER BY id LIMIT 1').bind(date, date).first();
  const phases = (await db.prepare('SELECT id,name,start_date,end_date,color,low_load FROM phases ORDER BY start_date').all()).results;
  const sessions = (await db.prepare(`SELECT s.*, GROUP_CONCAT(f.friend_name, ', ') AS names FROM sessions s
    LEFT JOIN session_friends f ON f.session_id=s.id
    WHERE date(s.start_ts)=? AND s.status!='declined' GROUP BY s.id ORDER BY s.start_ts`).bind(date).all()).results;
  const openShiftable = tasks.filter(t => t.shiftable && t.status === 'todo').length;
  const hasShiftable = tasks.some(t => t.shiftable);
  const future = await db.prepare("SELECT COUNT(*) n FROM tasks WHERE shiftable=1 AND status='todo' AND date>?").bind(date).first();
  // streak (for hero)
  const today = todayIn(c.env.TZ);
  const hist = (await db.prepare("SELECT date, goal, done FROM daily_goals WHERE type=? AND date<=? AND goal>0 ORDER BY date DESC").bind(cfg.streakCategory, today).all()).results;
  let streak = 0;
  for (let i = 0; i < hist.length; i++) {
    if (i === 0 && hist[i].date === today && hist[i].done < hist[i].goal) continue;
    if (hist[i].done >= hist[i].goal) streak++; else break;
  }
  const grind = (await db.prepare('SELECT * FROM grind_sessions WHERE date=? ORDER BY start_ts').bind(date).all()).results;
  const active = await db.prepare('SELECT * FROM grind_sessions WHERE end_ts IS NULL ORDER BY id DESC LIMIT 1').first();
  const moves = await movesFor(db, date);
  const offDay = await db.prepare('SELECT * FROM off_days WHERE date=?').bind(date).first();
  const solves = (await db.prepare('SELECT * FROM lc_solves WHERE date=? ORDER BY id').bind(date).all()).results;
  let backlog = null;
  if (date === today) {
    const bl = (await db.prepare("SELECT id FROM tasks WHERE shiftable=1 AND status='todo' AND date<?").bind(today).all()).results;
    backlog = { n: bl.length, ids: bl.map(x => x.id) };
  }
  return json(c, {
    offDay: offDay || null, backlog, solves, todayLayout: cfg.todayLayout,
    date, mode, baseMode: cfg.baseMode, timerDefault: cfg.timerDefault, phase, phases, tasks, goals, sessions, streak,
    blocks: await dayBlocks(db, date, mode, cfg),
    hasMoves: Object.keys(moves).length > 0,
    modules: cfg.modules, budgets: cfg.blockBudgets, categories: cfg.categories, lowLoad: isLowLoad(cfg, date),
    tz: cfg.tz, clock24: cfg.clock24, layouts: Object.keys(cfg.sched.layouts), grind, active, clock: cfg.clock,
    canShift: hasShiftable && openShiftable === 0 && future.n > 0,
  });
});

// ---- per-day block move ----
app.post('/api/blockmove', async c => {
  const { date, label, start } = await c.req.json();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !label) return json(c, { error: 'bad input' }, 400);
  if (start === null || start === '') {
    await c.env.DB.prepare('DELETE FROM block_moves WHERE date=? AND label=?').bind(date, label).run();
  } else {
    if (!/^\d{2}:\d{2}$/.test(start)) return json(c, { error: 'bad time' }, 400);
    await c.env.DB.prepare('INSERT INTO block_moves (date,label,start) VALUES (?,?,?) ON CONFLICT(date,label) DO UPDATE SET start=excluded.start')
      .bind(date, label.slice(0, 60), start).run();
  }
  return json(c, { ok: true });
});
app.post('/api/blockmove/reset', async c => {
  const { date } = await c.req.json();
  await c.env.DB.prepare('DELETE FROM block_moves WHERE date=?').bind(date).run();
  return json(c, { ok: true });
});

// ---- job hunt links ----
const cleanUrl = u => {
  let v = String(u || '').trim().slice(0, 2000);
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try { new URL(v); } catch (e) { return ''; }
  return v;
};
const LINK_KINDS = ['jobs', 'leetcode'];
const linkKind = v => LINK_KINDS.includes(String(v || '')) ? String(v) : 'jobs';
app.get('/api/links', async c => {
  const kind = linkKind(c.req.query('kind'));
  const links = (await c.env.DB.prepare('SELECT * FROM links WHERE kind=? ORDER BY sort, id').bind(kind).all()).results;
  return json(c, { links, kind });
});
app.post('/api/links', async c => {
  const b = await c.req.json();
  const url = cleanUrl(b.url);
  if (!url) return json(c, { error: 'valid link required' }, 400);
  const r = await c.env.DB.prepare('INSERT INTO links (label,url,in_bundle,kind) VALUES (?,?,?,?)')
    .bind(String(b.label || '').trim().slice(0, 60), url, b.in_bundle === false ? 0 : 1, linkKind(b.kind)).run();
  return json(c, { ok: true, id: r.meta.last_row_id });
});
app.patch('/api/links/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const b = await c.req.json();
  if (b.in_bundle !== undefined && b.url === undefined) {
    await db.prepare('UPDATE links SET in_bundle=? WHERE id=?').bind(b.in_bundle ? 1 : 0, id).run();
    return json(c, { ok: true });
  }
  const url = cleanUrl(b.url);
  if (!url) return json(c, { error: 'valid link required' }, 400);
  await db.prepare('UPDATE links SET label=?, url=?, in_bundle=? WHERE id=?')
    .bind(String(b.label || '').trim().slice(0, 60), url, b.in_bundle === false ? 0 : 1, id).run();
  return json(c, { ok: true });
});
app.delete('/api/links/:id', async c => {
  await c.env.DB.prepare('DELETE FROM links WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

// ---- quick copy snippets ----
app.get('/api/snippets', async c => {
  const snippets = (await c.env.DB.prepare('SELECT * FROM snippets ORDER BY sort, id').all()).results;
  return json(c, { snippets });
});
const cleanSubs = raw => JSON.stringify((Array.isArray(raw) ? raw : [])
  .map(s => ({ label: String((s && s.label) || '').trim().slice(0, 60), value: String((s && s.value) || '').slice(0, 2000) }))
  .filter(s => s.value.trim()).slice(0, 20));
app.post('/api/snippets', async c => {
  const b = await c.req.json();
  const value = String(b.value || '').slice(0, 2000);
  if (!value.trim()) return json(c, { error: 'value required' }, 400);
  const r = await c.env.DB.prepare('INSERT INTO snippets (label,value,subs) VALUES (?,?,?)')
    .bind(String(b.label || '').trim().slice(0, 60), value, cleanSubs(b.subs)).run();
  return json(c, { ok: true, id: r.meta.last_row_id });
});
app.patch('/api/snippets/:id', async c => {
  const b = await c.req.json();
  const value = String(b.value || '').slice(0, 2000);
  if (!value.trim()) return json(c, { error: 'value required' }, 400);
  await c.env.DB.prepare('UPDATE snippets SET label=?, value=?, subs=? WHERE id=?')
    .bind(String(b.label || '').trim().slice(0, 60), value, cleanSubs(b.subs), +c.req.param('id')).run();
  return json(c, { ok: true });
});
app.delete('/api/snippets/:id', async c => {
  await c.env.DB.prepare('DELETE FROM snippets WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

// ---- off days ----
app.post('/api/offday', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : todayIn(c.env.TZ);
  const exists = await db.prepare('SELECT date FROM off_days WHERE date=?').bind(date).first();
  if (exists) return json(c, { error: 'already marked as off day' }, 400);
  const goals = (await db.prepare("SELECT type, goal FROM daily_goals WHERE date=?").bind(date).all()).results;
  const saved = {};
  for (const g of goals) saved[g.type] = g.goal;
  await db.prepare('INSERT INTO off_days (date,reason,saved_goals) VALUES (?,?,?)')
    .bind(date, String(b.reason || '').trim().slice(0, 80), JSON.stringify(saved)).run();
  await db.prepare("UPDATE daily_goals SET goal=0 WHERE date=?").bind(date).run();
  return json(c, { ok: true });
});
app.delete('/api/offday/:date', async c => {
  const db = c.env.DB;
  const date = c.req.param('date');
  const row = await db.prepare('SELECT * FROM off_days WHERE date=?').bind(date).first();
  if (row) {
    let saved = {};
    try { saved = JSON.parse(row.saved_goals || '{}'); } catch (e) {}
    for (const [type, goal] of Object.entries(saved))
      await db.prepare('UPDATE daily_goals SET goal=? WHERE date=? AND type=?').bind(goal, date, type).run();
    await db.prepare('DELETE FROM off_days WHERE date=?').bind(date).run();
  }
  return json(c, { ok: true });
});
app.get('/api/offday/reasons', async c => {
  const r = (await c.env.DB.prepare("SELECT reason, COUNT(*) n FROM off_days WHERE reason!='' GROUP BY reason ORDER BY n DESC, reason LIMIT 12").all()).results;
  return json(c, { reasons: r });
});

// ---- bulk task actions (catch-up / hold / resume) ----
app.post('/api/tasks/bulk', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter(n => n > 0).slice(0, 90);
  if (!ids.length) return json(c, { error: 'no ids' }, 400);
  const ph = ids.map(() => '?').join(',');
  if (b.action === 'today')
    await db.prepare(`UPDATE tasks SET date=?, status='todo' WHERE id IN (${ph})`).bind(todayIn(c.env.TZ), ...ids).run();
  else if (b.action === 'hold')
    await db.prepare(`UPDATE tasks SET status='hold' WHERE id IN (${ph}) AND status='todo'`).bind(...ids).run();
  else if (b.action === 'todo')
    await db.prepare(`UPDATE tasks SET status='todo' WHERE id IN (${ph})`).bind(...ids).run();
  else return json(c, { error: 'bad action' }, 400);
  return json(c, { ok: true, n: ids.length });
});

// ---- LeetCode solves ----
const bumpGoal = (db, date, delta) => db.prepare(`INSERT INTO daily_goals (date,type,goal,done) VALUES (?,'leetcode',0,MAX(0,?))
  ON CONFLICT(date,type) DO UPDATE SET done=MAX(0, done + ?)`).bind(date, delta, delta).run();
app.post('/api/lc', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const diff = ['easy', 'medium', 'hard'].includes(String(b.difficulty || '').toLowerCase()) ? String(b.difficulty).toLowerCase() : null;
  const minutes = Math.min(600, Math.max(1, Math.round(+b.minutes || 0)));
  // outcome: 0 did not finish, 1 solved clean, 2 solved but slow
  const finished = b.finished === false ? 0 : b.finished === true ? 1 : [0, 1, 2].includes(+b.finished) ? +b.finished : 1;
  // collapse runs of whitespace so "Two  Sum " and "Two Sum" are the same problem
  let name = String(b.name || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!diff) return json(c, { error: 'difficulty required (easy/medium/hard)' }, 400);
  if (!minutes) return json(c, { error: 'minutes required' }, 400);
  // anything that is not a clean solve joins the revisit queue, so it has to be matchable by name
  if (finished !== 1 && !name) return json(c, { error: 'name required unless it was a clean solve, so the next try matches' }, 400);
  // snap to the spelling already on record, so casing never splits one problem in two
  const cn = await canonName(db, name);
  name = cn.name;
  const matched = cn.matched;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : todayIn(c.env.TZ);
  const r = await db.prepare('INSERT INTO lc_solves (date,difficulty,minutes,name,source,finished) VALUES (?,?,?,?,?,?)')
    .bind(date, diff, minutes, name, b.source === 'timer' ? 'timer' : 'manual', finished).run();
  // every logged problem counts for the day, finished or not: the hour was still spent
  await bumpGoal(db, date, 1);
  let tries = 1;
  if (name) tries = (await db.prepare('SELECT COUNT(*) n FROM lc_solves WHERE LOWER(TRIM(name))=?').bind(name.toLowerCase()).first()).n;
  return json(c, { ok: true, id: r.meta.last_row_id, tries, finished, name, matched });
});
// a problem's state is its most recent attempt, not its best one
const LATEST = `(SELECT s2.finished FROM lc_solves s2
  WHERE LOWER(TRIM(s2.name))=LOWER(TRIM(s.name)) ORDER BY s2.id DESC LIMIT 1)`;
app.get('/api/lc/open', async c => {
  // everything still worth coming back to: never solved, or solved with a bad runtime
  const rows = (await c.env.DB.prepare(`SELECT TRIM(s.name) name, MAX(s.difficulty) difficulty, COUNT(*) tries,
      SUM(s.minutes) total, ${LATEST} latest
    FROM lc_solves s WHERE TRIM(s.name)!='' GROUP BY LOWER(TRIM(s.name))
    HAVING latest IN (0,2) ORDER BY MAX(s.id) DESC LIMIT 15`).all()).results;
  return json(c, { open: rows });
});
app.get('/api/lc/names', async c => {
  // every problem ever named, for the log panel's match-as-you-type list
  const rows = (await c.env.DB.prepare(`SELECT TRIM(s.name) name, MAX(s.difficulty) difficulty, COUNT(*) tries,
    SUM(s.minutes) total, ${LATEST} latest, MAX(s.date) last
    FROM lc_solves s WHERE TRIM(s.name)!='' GROUP BY LOWER(TRIM(s.name)) ORDER BY MAX(s.id) DESC LIMIT 400`).all()).results;
  for (const r of rows) r.solved = r.latest === 1;
  return json(c, { names: rows });
});
// ---- per-problem notes + array visualizer state ----
app.get('/api/lc/note', async c => {
  const db = c.env.DB;
  const { name, key } = await canonName(db, c.req.query('name') || '');
  if (!name) return json(c, { error: 'name required' }, 400);
  const row = await db.prepare('SELECT name, blocks, arrays, updated_at FROM lc_notes WHERE name_key=?').bind(key).first();
  const agg = await db.prepare(`SELECT COUNT(*) tries, SUM(minutes) totalMin,
    MAX(difficulty) difficulty, MAX(date) last FROM lc_solves WHERE LOWER(TRIM(name))=?`).bind(key).first();
  const newest = await db.prepare('SELECT finished FROM lc_solves WHERE LOWER(TRIM(name))=? ORDER BY id DESC LIMIT 1').bind(key).first();
  const history = (await db.prepare(`SELECT id, date, minutes, difficulty, finished, source
    FROM lc_solves WHERE LOWER(TRIM(name))=? ORDER BY id DESC LIMIT 40`).bind(key).all()).results;
  const parse = (v, d) => { try { const j = JSON.parse(v); return Array.isArray(j) ? j : d; } catch (e) { return d; } };
  return json(c, {
    name, blocks: parse(row && row.blocks, []), arrays: parse(row && row.arrays, []),
    updatedAt: row ? row.updated_at : null,
    tries: (agg && agg.tries) || 0, totalMin: (agg && agg.totalMin) || 0,
    latest: newest ? newest.finished : null, solved: !!(newest && newest.finished),
    difficulty: (agg && agg.difficulty) || 'medium',
    last: (agg && agg.last) || null, history,
  });
});
const saveNote = async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const { name, key } = await canonName(db, b.name || '');
  if (!name) return json(c, { error: 'name required' }, 400);
  const clip = v => JSON.stringify(Array.isArray(v) ? v : []).slice(0, 200000);
  await db.prepare(`INSERT INTO lc_notes (name_key,name,blocks,arrays,updated_at) VALUES (?,?,?,?,datetime('now'))
    ON CONFLICT(name_key) DO UPDATE SET name=excluded.name, blocks=excluded.blocks, arrays=excluded.arrays, updated_at=excluded.updated_at`)
    .bind(key, name, clip(b.blocks), clip(b.arrays)).run();
  return json(c, { ok: true, name });
};
app.put('/api/lc/note', saveNote);
app.post('/api/lc/note', saveNote);

// ---- rename a problem, folding it into an existing one when the name is taken ----
// one typo used to split a problem into two records with no way back; this is the way back
app.post('/api/lc/rename', async c => {
  const db = c.env.DB;
  const b = await c.req.json().catch(() => ({}));
  const norm = v => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const from = norm(b.from), fromKey = from.toLowerCase();
  const toRaw = norm(b.to);
  if (!from || !toRaw) return json(c, { error: 'both names are required' }, 400);

  const srcCount = (await db.prepare('SELECT COUNT(*) n FROM lc_solves WHERE LOWER(TRIM(name))=?').bind(fromKey).first()).n;
  const srcNote = await db.prepare('SELECT * FROM lc_notes WHERE name_key=?').bind(fromKey).first();
  if (!srcCount && !srcNote) return json(c, { error: 'no problem with that name' }, 404);

  const toKey = toRaw.toLowerCase();
  // a pure case or spacing fix: same problem, just rewrite the label
  if (toKey === fromKey) {
    await db.prepare('UPDATE lc_solves SET name=? WHERE LOWER(TRIM(name))=?').bind(toRaw, fromKey).run();
    if (srcNote) await db.prepare('UPDATE lc_notes SET name=? WHERE name_key=?').bind(toRaw, fromKey).run();
    return json(c, { ok: true, merged: false, name: toRaw, tries: srcCount });
  }

  // the target's newest attempt decides its spelling and its difficulty, matching latest-wins
  const tgtNewest = await db.prepare('SELECT name, difficulty FROM lc_solves WHERE LOWER(TRIM(name))=? ORDER BY id DESC LIMIT 1').bind(toKey).first();
  const tgtNote = await db.prepare('SELECT * FROM lc_notes WHERE name_key=?').bind(toKey).first();
  const merged = !!(tgtNewest || tgtNote);
  const name = tgtNewest ? String(tgtNewest.name).trim() : (tgtNote ? tgtNote.name : toRaw);

  if (merged && tgtNewest) {
    // one problem has one difficulty: the surviving side's
    await db.prepare('UPDATE lc_solves SET name=?, difficulty=? WHERE LOWER(TRIM(name))=?')
      .bind(name, tgtNewest.difficulty, fromKey).run();
  } else {
    await db.prepare('UPDATE lc_solves SET name=? WHERE LOWER(TRIM(name))=?').bind(name, fromKey).run();
  }

  // notes: never throw writing away, append the source under a divider
  const parse = v => { try { const j = JSON.parse(v); return Array.isArray(j) ? j : []; } catch (e) { return []; } };
  if (srcNote) {
    if (tgtNote) {
      const blocks = [...parse(tgtNote.blocks)];
      const srcBlocks = parse(srcNote.blocks);
      if (srcBlocks.some(x => String(x && x.body || '').trim())) {
        blocks.push({ type: 'text', body: '\u2500\u2500 merged from "' + from + '" \u2500\u2500' }, ...srcBlocks);
      }
      const arrays = [...parse(tgtNote.arrays), ...parse(srcNote.arrays)];
      await db.prepare("UPDATE lc_notes SET blocks=?, arrays=?, updated_at=datetime('now') WHERE name_key=?")
        .bind(JSON.stringify(blocks).slice(0, 200000), JSON.stringify(arrays).slice(0, 200000), toKey).run();
    } else {
      await db.prepare("INSERT INTO lc_notes (name_key,name,blocks,arrays,updated_at) VALUES (?,?,?,?,datetime('now'))")
        .bind(toKey, name, srcNote.blocks, srcNote.arrays).run();
    }
    await db.prepare('DELETE FROM lc_notes WHERE name_key=?').bind(fromKey).run();
  } else if (tgtNote && tgtNote.name !== name) {
    await db.prepare('UPDATE lc_notes SET name=? WHERE name_key=?').bind(name, toKey).run();
  }

  const tries = (await db.prepare('SELECT COUNT(*) n FROM lc_solves WHERE LOWER(TRIM(name))=?').bind(toKey).first()).n;
  return json(c, { ok: true, merged, name, tries, moved: srcCount });
});
// One rollup per problem, grouped in SQL so nothing is capped, with latest-attempt-wins.
// Shared by /api/lc/stats and the read-only API so the two can never disagree.
async function lcProblems(db, today) {
  const rows = (await db.prepare(`SELECT TRIM(s.name) name, MAX(s.difficulty) difficulty, COUNT(*) tries,
      SUM(s.minutes) totalMin, ${LATEST} latest, MAX(s.date) last,
      CAST(julianday(?) - julianday(MAX(s.date)) AS INTEGER) daysSince,
      n.blocks blocks
    FROM lc_solves s LEFT JOIN lc_notes n ON n.name_key = LOWER(TRIM(s.name))
    WHERE TRIM(s.name)!='' GROUP BY LOWER(TRIM(s.name))`).bind(today).all()).results;
  return rows.map(r => {
    let blob = '';
    try { for (const bl of JSON.parse(r.blocks || '[]')) blob += ' ' + (bl.body || ''); } catch (e) {}
    blob = blob.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 500);
    return { name: r.name, difficulty: r.difficulty, tries: r.tries, totalMin: r.totalMin || 0,
      // solved means CLEANLY solved. A slow solve (2) is a working answer but still counts as
      // outstanding work until it is re-run properly, so it is NOT solved here.
      latest: r.latest, solved: r.latest === 1, last: r.last, daysSince: r.daysSince || 0,
      hasNote: blob.length > 0, blob };
  });
}
app.get('/api/lc/stats', async c => {
  const problems = await lcProblems(c.env.DB, todayIn(c.env.TZ));
  // a slow solve is NOT solved: it is a working answer that still owes a clean rerun
  const solved = problems.filter(p => p.latest === 1);
  const open = problems.filter(p => p.latest === 0);
  const slow = problems.filter(p => p.latest === 2);
  const totalTries = problems.reduce((a, p) => a + p.tries, 0);
  const tiles = {
    solved: solved.length, open: open.length, slow: slow.length, totalTries,
    avgTries: solved.length ? Math.round((solved.reduce((a, p) => a + p.tries, 0) / solved.length) * 10) / 10 : 0,
  };
  return json(c, { tiles, problems });
});
app.patch('/api/lc/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const b = await c.req.json().catch(() => ({}));
  const f = +b.finished;
  if (![0, 1, 2].includes(f)) return json(c, { error: 'finished must be 0 (open), 1 (solved) or 2 (slow)' }, 400);
  const row = await db.prepare('SELECT * FROM lc_solves WHERE id=?').bind(id).first();
  if (!row) return json(c, { error: 'no attempt with that id' }, 404);
  if (f !== 1 && !String(row.name || '').trim())
    return json(c, { error: 'name this attempt first, otherwise it cannot be matched next time' }, 400);
  // the attempt happened either way, so the day counter is left alone
  await db.prepare('UPDATE lc_solves SET finished=? WHERE id=?').bind(f, id).run();
  return json(c, { ok: true, solve: { ...row, finished: f } });
});
app.delete('/api/lc/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const s = await db.prepare('SELECT date, finished FROM lc_solves WHERE id=?').bind(id).first();
  if (s) {
    await db.prepare('DELETE FROM lc_solves WHERE id=?').bind(id).run();
    await bumpGoal(db, s.date, -1);
  }
  return json(c, { ok: true });
});

// ---- jobs tracker ----
const JOB_STATUS = ['applied', 'oa', 'interview', 'offer', 'rejected'];
const normStatus = v => {
  const t = String(v == null ? '' : v).trim().toLowerCase();
  return JOB_STATUS.includes(t) ? t : null;
};
// platform: canonical match against the configured list, else "Other · <what they said>"
const normPlatform = (raw, list) => {
  const v = String(raw == null ? '' : raw).slice(0, 300).trim();
  if (!v) return '';
  const hit = list.find(p => p.toLowerCase() === v.toLowerCase());
  return hit || (/^other\b/i.test(v) ? v.slice(0, 60) : 'Other · ' + v.slice(0, 50));
};
const bumpApps = (db, date, delta) => db.prepare(`INSERT INTO daily_goals (date,type,goal,done) VALUES (?,'applications',0,MAX(0,?))
  ON CONFLICT(date,type) DO UPDATE SET done=MAX(0, done + ?)`).bind(date, delta, delta).run();

app.get('/api/jobs', async c => {
  const q = k => c.req.query(k);
  const limit = Math.min(500, +(q('limit') || 200));
  // filters exist so an agent can find the row it needs to update without pulling everything
  const where = [], vals = [];
  const st = normStatus(q('status'));
  if (q('status') && !st) return json(c, { error: 'bad status, use one of: ' + JOB_STATUS.join(', ') }, 400);
  if (st) { where.push('status=?'); vals.push(st); }
  if (q('company')) { where.push('LOWER(company)=?'); vals.push(String(q('company')).trim().toLowerCase()); }
  if (q('since')) { where.push('date>=?'); vals.push(String(q('since')).slice(0, 10)); }
  if (q('date')) { where.push('date=?'); vals.push(String(q('date')).slice(0, 10)); }
  if (q('q')) { where.push('(LOWER(title) LIKE ? OR LOWER(company) LIKE ?)');
    const like = '%' + String(q('q')).trim().toLowerCase() + '%'; vals.push(like, like); }
  const sql = 'SELECT * FROM jobs' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY date DESC, id DESC LIMIT ?';
  const jobs = (await c.env.DB.prepare(sql).bind(...vals, limit).all()).results;
  const today = todayIn(c.env.TZ);
  const g = await c.env.DB.prepare("SELECT goal,done FROM daily_goals WHERE date=? AND type='applications'").bind(today).first();
  return json(c, { jobs, count: jobs.length, statuses: JOB_STATUS, todayGoal: g || { goal: 0, done: 0 } });
});
app.get('/api/jobs/:id', async c => {
  const job = await c.env.DB.prepare('SELECT * FROM jobs WHERE id=?').bind(+c.req.param('id')).first();
  if (!job) return json(c, { error: 'no job with that id' }, 404);
  return json(c, { job });
});
app.post('/api/jobs', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  if (!b.title || !b.company) return json(c, { error: 'title and company are required' }, 400);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : todayIn(c.env.TZ);
  const clean = k => String(b[k] || '').slice(0, 300);
  const platform = normPlatform(b.platform, (c.get('cfg') || await loadCfg(db)).jobPlatforms);
  if (b.status !== undefined && !normStatus(b.status))
    return json(c, { error: 'bad status, use one of: ' + JOB_STATUS.join(', ') }, 400);
  const r = await db.prepare('INSERT INTO jobs (date,title,company,salary,location,url,platform,status,source) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(date, clean('title'), clean('company'), clean('salary'), clean('location'), clean('url'), platform,
      normStatus(b.status) || 'applied', c.get('viaAgent') ? 'agent' : 'manual').run();
  await bumpApps(db, date, 1);
  const job = await db.prepare('SELECT * FROM jobs WHERE id=?').bind(r.meta.last_row_id).first();
  return json(c, { ok: true, id: r.meta.last_row_id, counted: date, job });
});
app.patch('/api/jobs/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const b = await c.req.json().catch(() => ({}));
  const cur = await db.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no job with that id' }, 404);
  const fields = [], vals = [];
  for (const k of ['title', 'company', 'salary', 'location', 'url'])
    if (b[k] !== undefined) { fields.push(k + '=?'); vals.push(String(b[k]).slice(0, 300)); }
  if (b.platform !== undefined) {
    fields.push('platform=?');
    vals.push(normPlatform(b.platform, (c.get('cfg') || await loadCfg(db)).jobPlatforms));
  }
  if (b.status !== undefined) {
    const st = normStatus(b.status);
    if (!st) return json(c, { error: 'bad status, use one of: ' + JOB_STATUS.join(', ') }, 400);
    fields.push('status=?'); vals.push(st);
  }
  // moving an application to another day has to move its counter too
  let moved = null;
  if (b.date !== undefined) {
    const nd = String(b.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nd)) return json(c, { error: 'date must be YYYY-MM-DD' }, 400);
    if (nd !== cur.date) { fields.push('date=?'); vals.push(nd); moved = nd; }
  }
  if (!fields.length) return json(c, { ok: true, unchanged: true, job: cur });
  await db.prepare('UPDATE jobs SET ' + fields.join(',') + ' WHERE id=?').bind(...vals, id).run();
  if (moved) { await bumpApps(db, cur.date, -1); await bumpApps(db, moved, 1); }
  const job = await db.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first();
  return json(c, { ok: true, job });
});
app.delete('/api/jobs/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const job = await db.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first();
  if (!job) return json(c, { error: 'no job with that id' }, 404);
  await db.prepare('DELETE FROM jobs WHERE id=?').bind(id).run();
  await bumpApps(db, job.date, -1);
  return json(c, { ok: true, deleted: job });
});
app.post('/api/apikey/regen', async c => {
  const key = 'lockin_' + [...crypto.getRandomValues(new Uint8Array(18))].map(x => x.toString(16).padStart(2, '0')).join('');
  await setSetting(c.env.DB, 'api_key', key);
  await syncKey(c, 'agent', key);
  return json(c, { ok: true, apiKey: key });
});

// ---- grind check-in / check-out ----
app.get('/api/grind/active', async c => {
  const a = await c.env.DB.prepare('SELECT * FROM grind_sessions WHERE end_ts IS NULL ORDER BY id DESC LIMIT 1').first();
  return json(c, { active: a || null });
});
app.post('/api/grind/start', async c => {
  const db = c.env.DB;
  const b = await c.req.json().catch(() => ({}));
  const existing = await db.prepare('SELECT id FROM grind_sessions WHERE end_ts IS NULL').first();
  if (existing) return json(c, { error: 'already checked in' }, 400);
  const now = nowIn(c.env.TZ);
  const date = b.date || now.slice(0, 10);
  const task = c.get('cfg').catKeys.includes(b.task) ? b.task : c.get('cfg').catKeys[0];
  const r = await db.prepare('INSERT INTO grind_sessions (date,block_label,planned_start,planned_end,start_ts,cur_task,cur_since) VALUES (?,?,?,?,?,?,?)')
    .bind(date, String(b.block_label || '').slice(0, 60), b.planned_start || null, b.planned_end || null, now, task, now).run();
  const a = await db.prepare('SELECT * FROM grind_sessions WHERE id=?').bind(r.meta.last_row_id).first();
  return json(c, { ok: true, active: a });
});
const nyNow = c => nowIn(c.env.TZ);
const foldPause = async (db, id) => {
  const s = await db.prepare('SELECT paused_at, paused_min FROM grind_sessions WHERE id=?').bind(id).first();
  if (s && s.paused_at) {
    const extra = Math.max(0, Math.round((new Date(nyNow(c)) - new Date(s.paused_at)) / 60000));
    await db.prepare('UPDATE grind_sessions SET paused_min=paused_min+?, cur_paused=cur_paused+?, paused_at=NULL WHERE id=?').bind(extra, extra, id).run();
  }
};
// close the running task segment: append its worked minutes to splits, restart the segment clock
const foldSegment = async (db, id, nextTask) => {
  const s = await db.prepare('SELECT * FROM grind_sessions WHERE id=?').bind(id).first();
  if (!s) return;
  const now = nyNow(c);
  if (s.cur_task && s.cur_since) {
    const m = Math.max(0, Math.round((new Date(now) - new Date(s.cur_since)) / 60000) - (s.cur_paused || 0));
    if (m >= 1) {
      let splits = [];
      try { splits = JSON.parse(s.splits || '[]'); } catch (e) {}
      const last = splits[splits.length - 1];
      if (last && last.t === s.cur_task) last.m += m; else splits.push({ t: s.cur_task, m });
      await db.prepare('UPDATE grind_sessions SET splits=? WHERE id=?').bind(JSON.stringify(splits), id).run();
    }
  }
  await db.prepare('UPDATE grind_sessions SET cur_task=?, cur_since=?, cur_paused=0 WHERE id=?').bind(nextTask || null, now, id).run();
};
app.post('/api/grind/switch', async c => {
  const db = c.env.DB;
  const { id, task } = await c.req.json();
  if (!c.get('cfg').catKeys.includes(task)) return json(c, { error: 'bad task' }, 400);
  const s = await db.prepare('SELECT id FROM grind_sessions WHERE id=? AND end_ts IS NULL').bind(+id).first();
  if (!s) return json(c, { error: 'no active session' }, 400);
  await foldPause(db, +id);
  await foldSegment(db, +id, task);
  return json(c, { ok: true });
});
app.post('/api/grind/pause', async c => {
  const db = c.env.DB;
  const { id } = await c.req.json();
  const r = await db.prepare('UPDATE grind_sessions SET paused_at=? WHERE id=? AND end_ts IS NULL AND paused_at IS NULL').bind(nyNow(c), +id).run();
  if (!r.meta.changes) return json(c, { error: 'not running or already paused' }, 400);
  return json(c, { ok: true });
});
app.post('/api/grind/resume', async c => {
  const db = c.env.DB;
  const { id } = await c.req.json();
  const s = await db.prepare('SELECT paused_at FROM grind_sessions WHERE id=? AND end_ts IS NULL').bind(+id).first();
  if (!s || !s.paused_at) return json(c, { error: 'not paused' }, 400);
  await foldPause(db, +id);
  return json(c, { ok: true });
});
// paused time you meant to resume is not rest, it is lost grind: hand it back to the task
app.post('/api/grind/reclaim', async c => {
  const db = c.env.DB;
  const b = await c.req.json().catch(() => ({}));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : todayIn(c.env.TZ);
  const rows = (await db.prepare('SELECT * FROM grind_sessions WHERE date=? AND paused_min>0').bind(date).all()).results;
  if (!rows.length) return json(c, { error: 'no paused time on that day' }, 400);
  let minutes = 0;
  for (const g of rows) {
    let segs = [];
    try { const p = JSON.parse(g.splits || '[]'); if (Array.isArray(p)) segs = p; } catch (e) {}
    // credit whatever was running when it was paused, else the last thing worked on
    const task = c.get('cfg').catKeys.includes(g.cur_task) ? g.cur_task
      : (segs.length && c.get('cfg').catKeys.includes(segs[segs.length - 1].t) ? segs[segs.length - 1].t : c.get('cfg').catKeys[0]);
    const hit = segs.find(x => x && x.t === task);
    if (hit) hit.m += g.paused_min; else segs.push({ t: task, m: g.paused_min });
    minutes += g.paused_min;
    await db.prepare('UPDATE grind_sessions SET splits=?, paused_min=0 WHERE id=?')
      .bind(JSON.stringify(segs), g.id).run();
  }
  return json(c, { ok: true, minutes, sessions: rows.length });
});
// retroactively log a finished grind session (forgot to check in)
app.post('/api/grind/log', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const segs = (Array.isArray(b.segments) ? b.segments : [])
    .map(s => ({ t: c.get('cfg').catKeys.includes(s && s.t) ? s.t : null, m: Math.min(720, Math.max(1, Math.round(+(s && s.m) || 0))) }))
    .filter(s => s.t && s.m).slice(0, 10);
  if (!segs.length) return json(c, { error: 'at least one task with minutes' }, 400);
  const total = segs.reduce((a, s) => a + s.m, 0);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : todayIn(c.env.TZ);
  let start;
  if (/^\d{2}:\d{2}$/.test(b.start || '')) start = `${date}T${b.start}`;
  else {
    // no start given: assume it just ended now (or midday for past dates)
    const now = nyNow(c);
    if (date === now.slice(0, 10)) {
      const endMin = +now.slice(11, 13) * 60 + +now.slice(14, 16);
      const sMin = Math.max(0, endMin - total);
      start = `${date}T${String(Math.floor(sMin / 60)).padStart(2, '0')}:${String(sMin % 60).padStart(2, '0')}`;
    } else start = `${date}T12:00`;
  }
  const sMin = +start.slice(11, 13) * 60 + +start.slice(14, 16);
  const eMin = sMin + total;
  const endDate = eMin >= 1440 ? (() => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })() : date;
  const end = `${endDate}T${String(Math.floor((eMin % 1440) / 60)).padStart(2, '0')}:${String(eMin % 60).padStart(2, '0')}`;
  const r = await db.prepare('INSERT INTO grind_sessions (date,block_label,start_ts,end_ts,splits) VALUES (?,?,?,?,?)')
    .bind(date, 'Logged manually', start, end, JSON.stringify(segs)).run();
  return json(c, { ok: true, id: r.meta.last_row_id, total });
});
app.post('/api/grind/stop', async c => {
  const db = c.env.DB;
  const { id } = await c.req.json();
  await foldPause(db, +id);
  await foldSegment(db, +id, null);
  await db.prepare('UPDATE grind_sessions SET end_ts=? WHERE id=? AND end_ts IS NULL').bind(nyNow(c), +id).run();
  const s = await db.prepare('SELECT * FROM grind_sessions WHERE id=?').bind(+id).first();
  return json(c, { ok: true, session: s });
});
app.patch('/api/grind/:id', async c => {
  const b = await c.req.json();
  if (Array.isArray(b.splits)) {
    const clean = b.splits.filter(s => s && typeof s.t === 'string' && s.m >= 0)
      .map(s => ({ t: s.t.slice(0, 20), m: Math.round(s.m) }));
    await c.env.DB.prepare('UPDATE grind_sessions SET splits=? WHERE id=?').bind(JSON.stringify(clean), +c.req.param('id')).run();
  }
  return json(c, { ok: true });
});
app.delete('/api/grind/:id', async c => {
  await c.env.DB.prepare('DELETE FROM grind_sessions WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

app.post('/api/task/:id/toggle', async c => {
  await c.env.DB.prepare("UPDATE tasks SET status = CASE status WHEN 'done' THEN 'todo' ELSE 'done' END WHERE id=?").bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

app.post('/api/goal', async c => {
  const { date, type, delta } = await c.req.json();
  if (!c.get('cfg').catKeys.includes(type)) return json(c, { error: 'bad type' }, 400);
  await c.env.DB.prepare(`INSERT INTO daily_goals (date,type,goal,done) VALUES (?,?,0,MAX(0,?))
    ON CONFLICT(date,type) DO UPDATE SET done=MAX(0, done + ?)`).bind(date, type, delta, delta).run();
  return json(c, { ok: true });
});

app.post('/api/shift', async c => {
  const db = c.env.DB;
  const { from } = await c.req.json();
  const date = from || todayIn(c.env.TZ);
  const open = await db.prepare("SELECT COUNT(*) n FROM tasks WHERE date=? AND shiftable=1 AND status='todo'").bind(date).first();
  if (open.n > 0) return json(c, { error: 'finish today first' }, 400);
  const r = await db.prepare("UPDATE tasks SET date = date(date, '-1 day') WHERE shiftable=1 AND status='todo' AND date > ?").bind(date).run();
  return json(c, { ok: true, shifted: r.meta.changes });
});

// "night mode from tomorrow": switch which layout is the default
app.post('/api/mode', async c => {
  const b = await c.req.json();
  const cfg = c.get('cfg');
  const layout = String(b.layout || b.base_mode || '');
  if (!cfg.sched.layouts[layout]) return json(c, { error: 'no layout called ' + layout }, 400);
  await setSetting(c.env.DB, 'sched', JSON.stringify({ ...cfg.sched, default: layout }));
  return json(c, { ok: true, layout });
});

// ---- month view ----
app.get('/api/month', async c => {
  const db = c.env.DB;
  const y = +c.req.query('year'), m = +c.req.query('month');
  const mm = String(m).padStart(2, '0');
  const a = `${y}-${mm}-01`, b = `${y}-${mm}-31`;
  const phases = (await db.prepare('SELECT * FROM phases ORDER BY start_date').all()).results;
  const tasks = (await db.prepare("SELECT id,date,track,title,status,shiftable FROM tasks WHERE date>=? AND date<=? ORDER BY date, shiftable DESC, sort").bind(a, b).all()).results;
  const goals = (await db.prepare("SELECT date,type,goal,done FROM daily_goals WHERE date>=? AND date<=?").bind(a, b).all()).results;
  const sessions = (await db.prepare("SELECT s.id, date(s.start_ts) d, s.activity, s.status FROM sessions s WHERE date(s.start_ts)>=? AND date(s.start_ts)<=? AND s.status IN ('confirmed','done')").bind(a, b).all()).results;
  const grind = (await db.prepare(`SELECT date, ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),1) h
    FROM grind_sessions WHERE end_ts IS NOT NULL AND date>=? AND date<=? GROUP BY date`).bind(a, b).all()).results;
  const offRows = (await db.prepare('SELECT date, reason FROM off_days WHERE date>=? AND date<=?').bind(a, b).all()).results;
  const days = {};
  const day = ds => (days[ds] = days[ds] || { tasks: [], goals: {}, sessions: 0 });
  for (const t of tasks) day(t.date).tasks.push(t);
  for (const g of goals) day(g.date).goals[g.type] = g;
  for (const s of sessions) day(s.d).sessions++;
  for (const g of grind) day(g.date).grindH = g.h;
  for (const o of offRows) { day(o.date).off = true; day(o.date).offReason = o.reason; }
  for (let d = 1; d <= 31; d++) {
    const ds = `${y}-${mm}-${String(d).padStart(2, '0')}`;
    const p = phases.find(p => p.start_date <= ds && p.end_date >= ds);
    if (p) day(ds).phase = { color: p.color, name: p.name, mode: p.mode };
  }
  return json(c, { days, phases });
});

// ---- progress ----
// the Progress payload, shared by the owner route and the read-only /share route
async function buildProgress(db, cfg) {
  const today = todayIn(cfg.tz);
  // every 'since the plan started' filter; with no plan the whole history counts
  const P0 = cfg.plan ? cfg.plan.start : '0001-01-01';
  const sums = await db.prepare("SELECT SUM(CASE WHEN type='leetcode' THEN done ELSE 0 END) lc, SUM(CASE WHEN type='applications' THEN done ELSE 0 END) apps FROM daily_goals").first();
  const tasksDone = (await db.prepare("SELECT COUNT(*) n FROM tasks WHERE status='done'").first()).n;
  const g30 = (await db.prepare("SELECT * FROM daily_goals WHERE date > date(?, '-30 day') AND date<=? ORDER BY date").bind(today, today).all()).results;
  const byDate = {};
  for (const g of g30) { byDate[g.date] = byDate[g.date] || {}; byDate[g.date][g.type] = g; }
  const lc30 = [], apps30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const l = (byDate[ds] || {}).leetcode, a = (byDate[ds] || {}).apps;
    lc30.push({ d: ds, v: l ? l.done : 0, g: l ? l.goal : 0, hit: !!(l && l.goal > 0 && l.done >= l.goal) });
    apps30.push({ d: ds, v: a ? a.done : 0, g: a ? a.goal : 0, hit: !!(a && a.goal > 0 && a.done >= a.goal) });
  }
  const hist = (await db.prepare("SELECT date, goal, done FROM daily_goals WHERE type=? AND date<=? AND goal>0 ORDER BY date DESC").bind(cfg.streakCategory, today).all()).results;
  let streak = 0;
  for (let i = 0; i < hist.length; i++) {
    if (i === 0 && hist[i].date === today && hist[i].done < hist[i].goal) continue;
    if (hist[i].done >= hist[i].goal) streak++; else break;
  }
  const fr = (await db.prepare(`SELECT f.friend_name name,
      ROUND(SUM((julianday(s.end_ts) - julianday(s.start_ts)) * 24), 1) hours,
      COUNT(DISTINCT s.id) sessions,
      GROUP_CONCAT(DISTINCT s.activity) acts
    FROM session_friends f JOIN sessions s ON s.id=f.session_id
    WHERE s.status='done' GROUP BY f.friend_name ORDER BY hours DESC`).all()).results;
  // grind aggregates
  const g = await db.prepare(`SELECT
      ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),1) total,
      COUNT(DISTINCT date) days,
      ROUND(SUM(CASE WHEN planned_end IS NOT NULL AND planned_start IS NOT NULL
        THEN MAX(0, ((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0) - (julianday(planned_end)-julianday(planned_start))*24) ELSE 0 END),1) overtime
    FROM grind_sessions WHERE end_ts IS NOT NULL`).first();
  const g14raw = (await db.prepare(`SELECT date, ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),2) h
    FROM grind_sessions WHERE end_ts IS NOT NULL AND date > date(?, '-14 day') GROUP BY date`).bind(today).all()).results;
  const gmap = {}; for (const r of g14raw) gmap[r.date] = r.h;
  const grind14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - i);
    const ds = d.toISOString().slice(0, 10);
    grind14.push({ d: ds, v: gmap[ds] || 0, g: cfg.grindTarget, hit: (gmap[ds] || 0) >= cfg.grindTarget });
  }
  const splitsRaw = (await db.prepare("SELECT date, splits FROM grind_sessions WHERE end_ts IS NOT NULL").all()).results;
  const moduleTotals = {}, moduleDays = {};
  for (const r of splitsRaw) {
    try {
      for (const s of JSON.parse(r.splits)) {
        moduleTotals[s.t] = (moduleTotals[s.t] || 0) + s.m;
        moduleDays[s.t] = moduleDays[s.t] || {};
        moduleDays[s.t][r.date] = (moduleDays[s.t][r.date] || 0) + s.m;
      }
    } catch (e) {}
  }
  // full day-by-day history (for expandable tiles)
  const histAll = (await db.prepare("SELECT date d, type, goal g, done v FROM daily_goals WHERE date>=? AND date<=? AND (done>0 OR goal>0) ORDER BY date DESC").bind(P0, today).all()).results;
  const history = { leetcode: histAll.filter(x => x.type === 'leetcode'), apps: histAll.filter(x => x.type === 'applications') };
  // pace vs plan (from plan start through today)
  // pace answers "am I on track for the plan", so LeetCode counts problems actually cracked:
  // a slow solve or an abandoned attempt is work, but it does not move the plan forward.
  // (the daily counter and streak still count every attempt, on purpose)
  const paceRow = async type => {
    const r = await db.prepare("SELECT SUM(done) done, SUM(goal) target FROM daily_goals WHERE type=? AND date>=? AND date<=?").bind(type, P0, today).first();
    const target = r.target || 0;
    let done = r.done || 0;
    if (type === 'leetcode') {
      // count PROBLEMS cracked, not attempt rows: re-running a problem you already solved
      // used to add +1 to the plan every time (24 rows over 20 real problems).
      // Same latest-attempt-wins grouping the LeetCode tab uses, narrowed to a clean solve.
      const named = (await db.prepare(`SELECT COUNT(*) n FROM (SELECT ${LATEST} latest FROM lc_solves s
        WHERE TRIM(s.name)!='' AND s.date>=? AND s.date<=?
        GROUP BY LOWER(TRIM(s.name)) HAVING latest=1)`).bind(P0, today).first()).n;
      const unnamed = (await db.prepare("SELECT COUNT(*) n FROM lc_solves WHERE finished=1 AND TRIM(name)='' AND date>=? AND date<=?").bind(P0, today).first()).n;
      done = named + unnamed;
    }
    return { done, target, diff: done - target };
  };
  const pace = { leetcode: await paceRow('leetcode'), apps: await paceRow('applications') };
  // records
  const best = async type => await db.prepare("SELECT date d, done v FROM daily_goals WHERE type=? ORDER BY done DESC, date ASC LIMIT 1").bind(type).first();
  const lcAsc = (await db.prepare("SELECT date, goal, done FROM daily_goals WHERE type='leetcode' AND goal>0 AND date<=? ORDER BY date").bind(today).all()).results;
  let longest = 0, run = 0;
  for (const r of lcAsc) { if (r.done >= r.goal) { run++; longest = Math.max(longest, run); } else run = 0; }
  const bestGrind = await db.prepare("SELECT date d, ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),1) v FROM grind_sessions WHERE end_ts IS NOT NULL GROUP BY date ORDER BY v DESC LIMIT 1").first();
  const records = { bestLC: await best('leetcode'), bestApps: await best('applications'), longestStreak: longest, bestGrind: bestGrind || null };
  // job funnel
  const fRows = (await db.prepare('SELECT status, COUNT(*) n FROM jobs GROUP BY status').all()).results;
  const fc = {}; for (const r of fRows) fc[r.status] = r.n;
  const totalJobs = Object.values(fc).reduce((a, b) => a + b, 0);
  const funnel = {
    applied: totalJobs,
    oa: (fc.oa || 0) + (fc.interview || 0) + (fc.offer || 0),
    interview: (fc.interview || 0) + (fc.offer || 0),
    offer: fc.offer || 0,
    rejected: fc.rejected || 0,
    heardBack: totalJobs - (fc.applied || 0),
  };
  // this week vs last week (rolling 7 days)
  const sumRange = async (type, a, b) => (await db.prepare("SELECT SUM(done) s FROM daily_goals WHERE type=? AND date>=? AND date<=?").bind(type, a, b).first()).s || 0;
  const grindRange = async (a, b) => (await db.prepare("SELECT ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),1) s FROM grind_sessions WHERE end_ts IS NOT NULL AND date>=? AND date<=?").bind(a, b).first()).s || 0;
  const shift = (ds, n) => { const d = new Date(ds + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const week = {
    lc: [await sumRange('leetcode', shift(today, -6), today), await sumRange('leetcode', shift(today, -13), shift(today, -7))],
    apps: [await sumRange('applications', shift(today, -6), today), await sumRange('applications', shift(today, -13), shift(today, -7))],
    grind: [await grindRange(shift(today, -6), today), await grindRange(shift(today, -13), shift(today, -7))],
  };
  // grind heatmap: last 56 days
  const heatRows = (await db.prepare("SELECT date d, ROUND(SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)),2) v FROM grind_sessions WHERE end_ts IS NOT NULL AND date > date(?, '-56 day') GROUP BY date").bind(today).all()).results;
  const heatMap = {}; for (const r of heatRows) heatMap[r.d] = r.v;
  const heat = [];
  for (let i = 55; i >= 0; i--) { const ds = shift(today, -i); heat.push({ d: ds, v: heatMap[ds] || 0 }); }
  // ---- LeetCode solve analytics ----
  // this window feeds every LeetCode average, trend and difficulty tile on the Progress tab AND
  // the read-only API. It was 400, which would have started quietly dropping his oldest attempts
  // around November without either surface saying so.
  const solves = (await db.prepare('SELECT * FROM lc_solves ORDER BY date DESC, id DESC LIMIT 5000').all()).results;
  // these stats answer "how fast do I solve", so only attempts that reached a working
  // answer belong: solved (1) and solved-slow (2). An abandoned try has no solve time,
  // it is just however long he gave up after, which would poison the average.
  const fin = solves.filter(s => +s.finished !== 0);
  // one decimal, because three averages rounding to the same whole minute looks like a bug
  const avgOf = arr => arr.length ? Math.round(arr.reduce((a, s) => a + s.minutes, 0) / arr.length * 10) / 10 : 0;
  const win = (from, to) => fin.filter(s => s.date >= from && s.date <= to);
  const cur7 = win(shift(today, -6), today), prev7 = win(shift(today, -13), shift(today, -7));
  const byDiff = d => ({
    n: fin.filter(s => s.difficulty === d).length,
    avg: avgOf(fin.filter(s => s.difficulty === d)),
    avgNow: avgOf(cur7.filter(s => s.difficulty === d)),
    avgPrev: avgOf(prev7.filter(s => s.difficulty === d)),
  });
  const lcDayMap = {};
  for (const s of solves) (lcDayMap[s.date] = lcDayMap[s.date] || []).push(s);
  const lcTrend = [];
  for (let i = 29; i >= 0; i--) {
    const ds = shift(today, -i), day = (lcDayMap[ds] || []).filter(s => +s.finished !== 0);
    lcTrend.push({ d: ds, v: avgOf(day), g: 0, hit: false, n: day.length });
  }
  // problem ledger: group attempts by name
  const probMap = {};
  for (const s of solves) {
    const key = (s.name || '').trim().toLowerCase();
    if (!key) continue;
    const p = probMap[key] = probMap[key] || { name: s.name.trim(), difficulty: s.difficulty, tries: 0, total: 0, solved: false, last: s.date };
    p.tries++; p.total += s.minutes;
    if (s.finished) p.solved = true;
    if (s.date > p.last) p.last = s.date;
  }
  // WARNING: p.solved here is MAX-wins (any finished attempt marks it solved), which contradicts
  // the latest-attempt-wins rule. Nothing renders this array and the read API deliberately uses
  // lcProblems() instead. Do not start using it without fixing the rule first.
  const problems = Object.values(probMap).sort((a, b) => a.last < b.last ? 1 : -1).slice(0, 150);
  // headline totals count distinct PROBLEMS, and only ones actually cracked
  const cntLatest = async set => (await db.prepare(`SELECT COUNT(*) n FROM (SELECT ${LATEST} latest FROM lc_solves s
    WHERE TRIM(s.name)!='' GROUP BY LOWER(TRIM(s.name)) HAVING latest IN (${set}))`).first()).n;
  // clean solves only. A slow solve lives in slowTotal and is deliberately not counted here.
  const solvedTotal = await cntLatest('1')
    + (await db.prepare("SELECT COUNT(*) n FROM lc_solves WHERE finished=1 AND TRIM(name)=''").first()).n;
  const openTotal = await cntLatest('0');
  const slowTotal = await cntLatest('2');
  const lc = {
    total: fin.length, attempts: solves.filter(s => !s.finished).length, solvedTotal, openTotal, slowTotal,
    avg: avgOf(fin), avgNow: avgOf(cur7), avgPrev: avgOf(prev7),
    easy: byDiff('easy'), medium: byDiff('medium'), hard: byDiff('hard'),
    trend: lcTrend, problems,
    days: Object.keys(lcDayMap).sort().reverse().map(d => ({ d, solves: lcDayMap[d] })),
  };
  // applications by platform
  const byPlatform = (await db.prepare("SELECT COALESCE(NULLIF(platform,''),'(not set)') p, COUNT(*) n FROM jobs GROUP BY p ORDER BY n DESC").all()).results;
  // off days
  const offAll = (await db.prepare('SELECT date, reason FROM off_days ORDER BY date DESC LIMIT 60').all()).results;
  const offReasons = (await db.prepare("SELECT COALESCE(NULLIF(reason,''),'(no reason)') r, COUNT(*) n FROM off_days GROUP BY r ORDER BY n DESC").all()).results;
  const offdays = { total: (await db.prepare('SELECT COUNT(*) n FROM off_days').first()).n, reasons: offReasons, recent: offAll.slice(0, 10) };
  // ---- finish-line projection + consistency ----
  // the plan already has goal rows written all the way to Dec 15, so the full target
  // is just the sum of them; "elapsed" and "left" turn that into a required daily rate
  const PSTART = cfg.plan ? cfg.plan.start : null, PEND = cfg.plan ? cfg.plan.end : null;
  const dnum = ds => Math.floor(Date.parse(ds + 'T00:00:00Z') / 86400000);
  const planTot = async type => (await db.prepare('SELECT SUM(goal) t FROM daily_goals WHERE type=? AND date>=? AND date<=?').bind(type, PSTART, PEND).first()).t || 0;
  const plan = !PSTART ? null : {
    start: PSTART, end: PEND,
    elapsed: Math.max(1, dnum(today) - dnum(PSTART) + 1),
    left: Math.max(0, dnum(PEND) - dnum(today)),
    lc: await planTot('leetcode'), apps: await planTot('applications'),
  };
  // consistency stops at yesterday: a day still in progress is not a miss
  const consist = async type => {
    const r = await db.prepare('SELECT COUNT(*) n, SUM(CASE WHEN done>=goal THEN 1 ELSE 0 END) hit FROM daily_goals WHERE type=? AND goal>0 AND date>=? AND date<?').bind(type, P0, today).first();
    return { days: r.n || 0, hit: r.hit || 0 };
  };
  const consistency = { leetcode: await consist('leetcode'), apps: await consist('applications') };
  // grind: days that reached the 6h target, and the average by weekday
  const GDAY = `SELECT date, SUM(((julianday(end_ts)-julianday(start_ts))*24 - paused_min/60.0)) h
    FROM grind_sessions WHERE end_ts IS NOT NULL AND date>=? GROUP BY date`;
  const gtar = await db.prepare(`SELECT COUNT(*) n, SUM(CASE WHEN h>=? THEN 1 ELSE 0 END) hit FROM (${GDAY})`).bind(cfg.grindTarget, P0).first();
  const dowRows = (await db.prepare(`SELECT CAST(strftime('%w', date) AS INTEGER) w, ROUND(AVG(h),2) avg, COUNT(*) n FROM (${GDAY}) GROUP BY w`).bind(P0).all()).results;
  const dow = [];
  for (let w = 0; w < 7; w++) { const r = dowRows.find(x => +x.w === w); dow.push({ w, avg: r ? r.avg : 0, n: r ? r.n : 0 }); }
  const jobsMeta = { lastDate: (await db.prepare('SELECT MAX(date) d FROM jobs').first()).d || null, total: totalJobs };
  return { streak, totalLC: solvedTotal, totalLogged: sums.lc || 0, totalApps: sums.apps || 0, tasksDone, lc30, apps30, friends: fr,
    history, pace, records, funnel, week, heat, lc, byPlatform, offdays, plan, consistency, jobsMeta, today,
    grind: { target: cfg.grindTarget, total: g.total || 0, days: g.days || 0, avg: g.days ? Math.round((g.total / g.days) * 10) / 10 : 0, overtime: g.overtime || 0,
      targetDays: gtar.hit || 0, dow, last14: grind14, moduleTotals, moduleDays } };
}
app.get('/api/progress', async c => json(c, await buildProgress(c.env.DB, c.get('cfg'))));

// ---- sessions (owner) ----
app.get('/api/sessions', async c => {
  const ses = (await c.env.DB.prepare(`SELECT s.*, GROUP_CONCAT(f.friend_name, ', ') AS names FROM sessions s
    LEFT JOIN session_friends f ON f.session_id=s.id GROUP BY s.id ORDER BY s.start_ts DESC LIMIT 100`).all()).results;
  return json(c, { sessions: ses });
});
app.post('/api/sessions', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const r = await db.prepare('INSERT INTO sessions (start_ts,end_ts,activity,note,status,created_by) VALUES (?,?,?,?,?,?)')
    .bind(b.start_ts, b.end_ts, b.activity || 'game', b.note || '', b.status || 'confirmed', 'owner').run();
  const id = r.meta.last_row_id;
  for (const [i, n] of (b.friends || []).entries())
    await db.prepare('INSERT OR IGNORE INTO session_friends (session_id,friend_name,position) VALUES (?,?,?)').bind(id, n, i + 1).run();
  return json(c, { ok: true, id });
});
app.patch('/api/sessions/:id', async c => {
  const db = c.env.DB;
  const id = +c.req.param('id');
  const b = await c.req.json();
  const fields = [], vals = [];
  for (const k of ['start_ts', 'end_ts', 'activity', 'note', 'status'])
    if (b[k] !== undefined) { fields.push(`${k}=?`); vals.push(b[k]); }
  if (fields.length) await db.prepare(`UPDATE sessions SET ${fields.join(',')} WHERE id=?`).bind(...vals, id).run();
  if (Array.isArray(b.friends)) {
    await db.prepare('DELETE FROM session_friends WHERE session_id=?').bind(id).run();
    for (const [i, n] of b.friends.entries())
      await db.prepare('INSERT OR IGNORE INTO session_friends (session_id,friend_name,position) VALUES (?,?,?)').bind(id, String(n).trim().slice(0, 40), i + 1).run();
  }
  return json(c, { ok: true });
});
app.delete('/api/sessions/:id', async c => {
  const id = +c.req.param('id');
  await c.env.DB.prepare('DELETE FROM session_friends WHERE session_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(id).run();
  return json(c, { ok: true });
});

// ---- settings ----
// central lookup row for a key: the Worker maps sha256('key:'+presented) -> user + kind
const syncKey = async (c, kind, key) => {
  if (!c.env.CENTRAL || !key) return;
  await c.env.CENTRAL.prepare('INSERT INTO api_keys (user_id, kind, key_hash) VALUES (?,?,?) ON CONFLICT(user_id, kind) DO UPDATE SET key_hash=excluded.key_hash')
    .bind(c.env.CTX.userId, kind, await sha256hex('key:' + key)).run();
};
app.get('/api/settings', async c => {
  const cfg = c.get('cfg');
  const host = new URL(c.req.url).origin;
  const mint = async (key, current, prefix, bytes) => {
    if (current) return current;
    const v = prefix + [...crypto.getRandomValues(new Uint8Array(bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
    await setSetting(c.env.DB, key, v);
    return v;
  };
  const apiKey = await mint('api_key', cfg.apiKey, 'lockin_', 18);
  const readKey = await mint('read_key', cfg.readKey, 'lockin_read_', 18);
  const icsToken = await mint('ics_token', cfg.icsToken, '', 12);
  await syncKey(c, 'agent', apiKey); await syncKey(c, 'read', readKey);
  const pub = host + '/u/' + (cfg.user && cfg.user.handle || '');
  const readUrl = n => `${host}/api/read/${n}?key=${readKey}`;
  const sideTasks = (await c.env.DB.prepare('SELECT * FROM side_tasks ORDER BY sort, id').all()).results;
  return json(c, {
    user: cfg.user,
    apiKey, jobsEndpoint: `${host}/api/jobs`,
    readKey, readBase: `${host}/api/read`,
    readEndpoints: { leetcode: readUrl('leetcode'), jobs: readUrl('jobs'), progress: readUrl('progress') },
    tz: cfg.tz, clock24: cfg.clock24, modules: cfg.modules,
    sched: cfg.sched, blockBudgets: cfg.blockBudgets, grindTarget: cfg.grindTarget,
    availability: cfg.availability, bookingDays: cfg.bookingDays, bookingEnabled: cfg.bookingEnabled,
    bookingPerDevice: cfg.bookingPerDevice, bookingPerSlot: cfg.bookingPerSlot, bookingDurations: cfg.bookingDurations,
    timerDefault: cfg.timerDefault, timerOptions: cfg.timerOptions, streakCategory: cfg.streakCategory,
    categories: cfg.allCategories, sideTasks, phases: cfg.phases, sideEmoji: SIDE_EMOJI,
    clock: cfg.clock, mclock: cfg.mclock, jobPlatforms: cfg.jobPlatforms, todayLayout: cfg.todayLayout, bgStyle: cfg.bgStyle,
    icsUrl: pub + '/calendar.ics?token=' + icsToken,
    shareUrl: pub + '/share', bookUrl: pub + '/book', share: { ...cfg.share, pinHash: undefined, isOn: !!cfg.share.pinHash },
  });
});
// Applies every recognised key of a settings body. Returns an error string or null. Shared by
// POST /api/settings (single keys, used by Today's mode switch and the like) and the one-shot save.
const applySettings = async (c, b) => {
  const db = c.env.DB;
  const cfg = c.get('cfg');
  const hm = v => /^\d{2}:\d{2}$/.test(v || '');
  const blocks = v => Array.isArray(v) ? v.filter(g => Array.isArray(g) && hm(g[0]) && hm(g[1])).slice(0, 4).map(g => [g[0], g[1]]) : null;
  if (b.timezone !== undefined) { if (!validTz(b.timezone)) return 'unknown time zone'; await setSetting(db, 'timezone', b.timezone); }
  if (b.clock24 !== undefined) await setSetting(db, 'clock_24h', b.clock24 ? '1' : '0');
  if (b.modules !== undefined && typeof b.modules === 'object') {
    const m = { ...cfg.modules };
    for (const k of ['leetcode', 'jobs', 'copy', 'friends', 'clock']) if (b.modules[k] !== undefined) m[k] = !!b.modules[k];
    await setSetting(db, 'modules', JSON.stringify(m));
  }
  if (b.grindTarget !== undefined) await setSetting(db, 'grind_target_hours', String(Math.min(16, Math.max(1, +b.grindTarget || 6))));
  if (b.availability !== undefined) await setSetting(db, 'availability', JSON.stringify(blocks(b.availability) || []));
  if (b.bookingDays !== undefined) await setSetting(db, 'booking_days', String(Math.min(14, Math.max(1, +b.bookingDays || 6))));
  if (b.bookingEnabled !== undefined) await setSetting(db, 'booking_enabled', b.bookingEnabled ? '1' : '0');
  if (b.bookingPerDevice !== undefined) await setSetting(db, 'booking_per_device_day', String(Math.min(10, Math.max(1, +b.bookingPerDevice || 2))));
  if (b.bookingPerSlot !== undefined) await setSetting(db, 'booking_per_slot', String(Math.min(20, Math.max(1, +b.bookingPerSlot || 4))));
  if (Array.isArray(b.bookingDurations)) await setSetting(db, 'booking_durations', JSON.stringify(b.bookingDurations.map(Number).filter(n => n >= 15 && n <= 480).slice(0, 8)));
  if (b.sharePin !== undefined) {
    // an empty PIN turns sharing off; either way the derived cookie changes, so friends re-enter it
    if (!b.sharePin) await setSetting(db, 'share_pin_hash', '');
    else if (String(b.sharePin).length < 4) return 'share PIN must be at least 4 characters';
    else await setSetting(db, 'share_pin_hash', await pinHash(c.env.CTX.userId + ':' + String(b.sharePin)));
  }
  if (b.shareTitle !== undefined) await setSetting(db, 'share_title', String(b.shareTitle).trim().slice(0, 60) || 'My grind');
  for (const [k, key] of [['shareOverview', 'share_overview'], ['shareLc', 'share_lc'], ['shareGrind', 'share_grind'],
    ['shareJobs', 'share_jobs'], ['shareLcNames', 'share_lcnames'], ['shareFriends', 'share_friends'],
    ['shareOffReasons', 'share_offreasons']])
    if (b[k] !== undefined) await setSetting(db, key, b[k] ? '1' : '0');
  if (b.timerDefault !== undefined) await setSetting(db, 'timer_default', String(Math.min(120, Math.max(5, +b.timerDefault || 25))));
  if (Array.isArray(b.timerOptions)) await setSetting(db, 'timer_options', JSON.stringify(b.timerOptions.map(Number).filter(n => n >= 1 && n <= 180).slice(0, 8)));
  if (b.streakCategory !== undefined && cfg.catKeys.includes(b.streakCategory)) await setSetting(db, 'streak_category', b.streakCategory);
  if (b.clockDesign !== undefined && ['ember', 'neon', 'mono', 'sunset', 'terminal'].includes(b.clockDesign)) await setSetting(db, 'clock_design', b.clockDesign);
  if (b.clockSize !== undefined) await setSetting(db, 'clock_size', String(Math.min(920, Math.max(280, +b.clockSize || 360))));
  if (b.clockFont !== undefined) await setSetting(db, 'clock_font', String(Math.min(18, Math.max(9, +b.clockFont || 12))));
  if (b.clockAccent !== undefined) await setSetting(db, 'clock_accent', /^#[0-9a-fA-F]{6}$/.test(b.clockAccent) ? b.clockAccent : '');
  if (b.todayLayout !== undefined && ['classic', 'refined'].includes(b.todayLayout)) await setSetting(db, 'today_layout', b.todayLayout);
  if (b.bgStyle !== undefined && ['aurora', 'dots', 'plain'].includes(b.bgStyle)) await setSetting(db, 'bg_style', b.bgStyle);
  if (b.mclockDesign !== undefined && ['pill', 'led', 'analog', 'flip', 'ring'].includes(b.mclockDesign)) await setSetting(db, 'mclock_design', b.mclockDesign);
  if (b.mclockFont !== undefined) await setSetting(db, 'mclock_font', String(Math.min(22, Math.max(10, +b.mclockFont || 13))));
  if (b.mclockAccent !== undefined) await setSetting(db, 'mclock_accent', /^#[0-9a-fA-F]{6}$/.test(b.mclockAccent) ? b.mclockAccent : '');
  if (Array.isArray(b.jobPlatforms)) {
    const seen = new Set(), list = [];
    for (const p of b.jobPlatforms) {
      const v = String(p || '').trim().slice(0, 40);
      if (v && !/^other$/i.test(v) && !seen.has(v.toLowerCase())) { seen.add(v.toLowerCase()); list.push(v); }
      if (list.length >= 20) break;
    }
    await setSetting(db, 'job_platforms', JSON.stringify(list));
  }
  if (b.sched !== undefined) {
    // whole-object replace: { layouts:{name:[[s,e]..]}, default, byDow, low }
    const next = normSched(b.sched);
    if (!next.default) return 'at least one layout with one grind block is needed';
    await setSetting(db, 'sched', JSON.stringify(next));
  }
  if (b.blockBudgets !== undefined && typeof b.blockBudgets === 'object') {
    const out = {};
    for (const [id, segs] of Object.entries(b.blockBudgets)) {
      if (!/^g[1-4]$/.test(id) || !Array.isArray(segs)) continue;
      out[id] = segs.filter(x => x && cfg.catKeys.includes(x.t)).map(x => ({ t: x.t, m: Math.min(720, Math.max(5, Math.round(+x.m || 0))) })).slice(0, 6);
    }
    await setSetting(db, 'block_budgets', JSON.stringify(out));
  }
  return null;
};
app.post('/api/settings', async c => {
  const err = await applySettings(c, await c.req.json());
  return err ? json(c, { error: err }, 400) : json(c, { ok: true });
});
// rotating the read key breaks only the three read URLs; the CV agent's api_key is untouched
app.post('/api/readkey/regen', async c => {
  const key = 'lockin_read_' + [...crypto.getRandomValues(new Uint8Array(18))].map(x => x.toString(16).padStart(2, '0')).join('');
  await setSetting(c.env.DB, 'read_key', key);
  await syncKey(c, 'read', key);
  const host = new URL(c.req.url).origin;
  return json(c, { ok: true, readKey: key,
    readEndpoints: { leetcode: `${host}/api/read/leetcode?key=${key}`, jobs: `${host}/api/read/jobs?key=${key}`, progress: `${host}/api/read/progress?key=${key}` } });
});
app.post('/api/ics/regen', async c => {
  const tok = [...crypto.getRandomValues(new Uint8Array(12))].map(x => x.toString(16).padStart(2, '0')).join('');
  await setSetting(c.env.DB, 'ics_token', tok);
  const host = new URL(c.req.url).origin;
  return json(c, { ok: true, icsUrl: `${host}/u/${c.env.CTX.handle}/calendar.ics?token=${tok}` });
});

// ---- public booking ----
app.get('/api/book/slots', async c => {
  const db = c.env.DB;
  const cfg = await loadCfg(db);
  if (!cfg.bookingEnabled) return json(c, { days: [], disabled: true });
  const today = todayIn(c.env.TZ);
  const days = [];
  for (let i = 0; i < cfg.bookingDays; i++) {
    const d = new Date(today + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const mode = await modeForDate(db, ds, cfg);
    const nowWall = nowIn(c.env.TZ);
    const wins = bookableWindows(await dayBlocks(db, ds, mode, cfg), mode, cfg)
      .filter(w => `${ds}T${w.end}` > nowWall); // hide windows that already ended
    const windows = [];
    for (const w of wins) {
      const q = (await db.prepare(`SELECT s.id, s.activity, s.created_at, f.friend_name name,
          CAST(ROUND((julianday(s.end_ts)-julianday(s.start_ts))*1440) AS INTEGER) dur
        FROM sessions s
        JOIN session_friends f ON f.session_id=s.id
        WHERE date(s.start_ts)=? AND s.status IN ('requested','confirmed')
          AND time(s.start_ts) < ? AND time(s.end_ts) > ?
        ORDER BY s.created_at`).bind(ds, w.end + ':00', w.start + ':00').all()).results;
      windows.push({ start: w.start, end: w.end, startUtc: localEpoch(cfg.tz, ds, w.start), endUtc: localEpoch(cfg.tz, ds, w.end) + (w.end < w.start ? 864e5 : 0), queue: q });
    }
    days.push({ date: ds, today: i === 0, label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' }), windows });
  }
  // this device's active booking (for the banner + disabling UI)
  let mine = null;
  const dev = getDevice(c);
  if (dev) {
    const nowTs = nowIn(c.env.TZ);
    mine = await db.prepare(`SELECT s.start_ts, s.end_ts, s.activity, s.status, f.friend_name name
      FROM sessions s JOIN session_friends f ON f.session_id=s.id
      WHERE s.device_id=? AND s.status IN ('requested','confirmed') AND s.end_ts >= ?
      ORDER BY s.start_ts LIMIT 1`).bind(dev, nowTs).first();
  }
  return json(c, { days, mine, serverNow: Date.now() });
});
app.post('/api/book', async c => {
  const db = c.env.DB;
  const b = await c.req.json();
  const name = String(b.name || '').trim().slice(0, 40);
  if (!name) return json(c, { error: 'name required' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.start || '') || !/^\d{2}:\d{2}$/.test(b.end || ''))
    return json(c, { error: 'bad slot' }, 400);
  const cfg = await loadCfg(db);
  if (!cfg.bookingEnabled) return json(c, { error: 'booking is off right now' }, 400);
  // inside booking horizon
  const today = todayIn(c.env.TZ);
  const max = new Date(today + 'T12:00:00Z'); max.setUTCDate(max.getUTCDate() + cfg.bookingDays - 1);
  if (b.date < today || b.date > max.toISOString().slice(0, 10)) return json(c, { error: 'slot out of booking window' }, 400);
  const mode = await modeForDate(db, b.date, cfg);
  const valid = bookableWindows(await dayBlocks(db, b.date, mode, cfg), mode, cfg).some(w => w.start === b.start && w.end === b.end);
  if (!valid) return json(c, { error: 'slot not available' }, 400);
  const nowWall = nowIn(c.env.TZ);
  if (`${b.date}T${b.end}` <= nowWall) return json(c, { error: 'that window already passed' }, 400);
  const act = ['game', 'talk', 'task', 'other'].includes(b.activity) ? b.activity : 'game';
  // ---- anti-spam: device lock ----
  const dev = getDevice(c);
  if (!dev) return json(c, { error: 'enable cookies to book (open the page normally, not in a weird embedded browser)' }, 400);
  const nowTs = nowIn(c.env.TZ);
  const activeMine = await db.prepare(`SELECT id FROM sessions
    WHERE device_id=? AND status IN ('requested','confirmed') AND end_ts >= ?`).bind(dev, nowTs).first();
  if (activeMine) return json(c, { error: 'one booking at a time. You can book again after your current one passes' }, 429);
  const attempts = await db.prepare(`SELECT COUNT(*) n FROM sessions WHERE device_id=? AND date(created_at) = date('now')`).bind(dev).first();
  if (attempts.n >= cfg.bookingPerDevice) return json(c, { error: 'too many requests today from this phone. Try tomorrow' }, 429);
  const qlen = await db.prepare(`SELECT COUNT(*) n FROM sessions WHERE date(start_ts)=? AND time(start_ts)=? AND status IN ('requested','confirmed')`)
    .bind(b.date, b.start + ':00').first();
  if (qlen.n >= cfg.bookingPerSlot) return json(c, { error: 'this slot queue is full' }, 429);
  const dup = await db.prepare(`SELECT s.id FROM sessions s JOIN session_friends f ON f.session_id=s.id
    WHERE date(s.start_ts)=? AND time(s.start_ts)=? AND f.friend_name=? AND s.status IN ('requested','confirmed')`)
    .bind(b.date, b.start + ':00', name).first();
  if (dup) return json(c, { error: 'you already have a request in this slot' }, 400);
  // requested duration: 30 / 60 / 120 / 180 min, capped by the window length
  const hm2min = hm => { const [x, y] = hm.split(':').map(Number); return x * 60 + y; };
  const winLen = hm2min(b.end) - hm2min(b.start);
  const dur = cfg.bookingDurations.includes(+b.duration) ? Math.min(+b.duration, winLen) : winLen;
  const endMin = hm2min(b.start) + dur;
  const endHM = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');
  const r = await db.prepare('INSERT INTO sessions (start_ts,end_ts,activity,note,status,created_by,device_id) VALUES (?,?,?,?,?,?,?)')
    .bind(`${b.date}T${b.start}`, `${b.date}T${endHM}`, act, String(b.note || '').slice(0, 200), 'requested', 'friend', dev).run();
  await db.prepare('INSERT INTO session_friends (session_id,friend_name,position) VALUES (?,?,1)').bind(r.meta.last_row_id, name).run();
  const pos = await db.prepare(`SELECT COUNT(*) n FROM sessions WHERE date(start_ts)=? AND time(start_ts)=? AND status IN ('requested','confirmed') AND created_at <= (SELECT created_at FROM sessions WHERE id=?)`)
    .bind(b.date, b.start + ':00', r.meta.last_row_id).first();
  return json(c, { ok: true, position: pos.n });
});

// ---- read-only data API for Claude (guides live in src/readapi.js) ----
// Registered down here on purpose: a handler declared above the app.use('/api/*') gate would
// bypass it entirely. Read-only by construction, every query below is a SELECT.
const READ_MAX = 5000;
const readParams = c => {
  const q = k => c.req.query(k);
  const since = q('since') || null;
  if (since !== null && !/^\d{4}-\d{2}-\d{2}$/.test(since)) return { err: 'since must be a date like 2026-01-31' };
  const rawLimit = q('limit');
  let limit = null;
  if (rawLimit !== undefined && rawLimit !== '') {
    limit = parseInt(rawLimit, 10);
    if (!Number.isFinite(limit) || limit < 1) return { err: 'limit must be a whole number from 1 to ' + READ_MAX };
    limit = Math.min(READ_MAX, limit);
  }
  let offset = 0;
  if (q('offset')) {
    offset = parseInt(q('offset'), 10);
    if (!Number.isFinite(offset) || offset < 0) return { err: 'offset must be 0 or more' };
  }
  const format = String(q('format') || 'json').toLowerCase();
  if (format !== 'json' && format !== 'md') return { err: 'format must be json or md' };
  return { since, limit, offset, format };
};
const READ_HEAD = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'no-store, private',
  // the key is in the URL, so never let it ride along in a Referer
  'Referrer-Policy': 'no-referrer',
  'Vary': 'Authorization, Cookie',
};
// no CORS header on purpose: claude.ai fetches server side, and allowing any origin would let a
// random page read this response out of a logged-in browser
const readRes = (c, payload, format) => format === 'md'
  ? c.body(toMarkdown(payload), 200, { ...READ_HEAD, 'Content-Type': 'text/plain; charset=utf-8' })
  : c.body(JSON.stringify(payload, null, 2), 200, { ...READ_HEAD, 'Content-Type': 'application/json; charset=utf-8' });
const readMeta = (name, today, plan, P, tz) => ({
  endpoint: name, today, timezone: tz || 'UTC',
  planStart: plan ? plan.start : null, planEnd: plan ? plan.end : null,
  params: { limit: P.limit, offset: P.offset, since: P.since, format: P.format },
});
const OUTCOME = ['unfinished', 'solved', 'slow'];

app.get('/api/read/leetcode', async c => {
  const db = c.env.DB, today = todayIn(c.env.TZ);
  const P = readParams(c);
  if (P.err) return json(c, { error: P.err }, 400);
  const w = P.since ? ' WHERE date>=?' : '', bind = P.since ? [P.since] : [];
  const total = (await db.prepare('SELECT COUNT(*) n FROM lc_solves' + w).bind(...bind).first()).n;
  const raw = (await db.prepare('SELECT id, date, name, difficulty, minutes, finished, source FROM lc_solves' + w
    + ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?').bind(...bind, P.limit === null ? -1 : P.limit, P.offset).all()).results;
  const rows = raw.map(r => ({ id: r.id, date: r.date, name: (r.name || '').trim(), difficulty: r.difficulty,
    minutes: r.minutes, finished: r.finished, outcome: OUTCOME[+r.finished] || 'unfinished', source: r.source }));
  // notes never leave the building: drop blob and hasNote, which are note-derived
  const problems = (await lcProblems(db, today)).map(p => ({ name: p.name, difficulty: p.difficulty,
    tries: p.tries, totalMin: p.totalMin, latest: p.latest, outcome: OUTCOME[+p.latest] || 'unfinished',
    solved: p.solved, last: p.last, daysSince: p.daysSince }));
  const p = await buildProgress(db, c.get('cfg'));
  const { problems: _drop1, days: _drop2, ...totals } = p.lc;
  return readRes(c, {
    guide: guides(c.get('cfg')).leetcode,
    meta: readMeta('leetcode', today, p.plan, P, c.get('cfg').tz),
    total, returned: rows.length,
    stats: {
      problemCount: problems.length, totals,
      pace: p.pace.leetcode, plan: p.plan, consistency: p.consistency.leetcode, streak: p.streak,
      records: { bestLC: p.records.bestLC, longestStreak: p.records.longestStreak },
      problems, daily: p.history.leetcode, last30: p.lc30,
    },
    rows,
  }, P.format);
});

app.get('/api/read/jobs', async c => {
  const db = c.env.DB, today = todayIn(c.env.TZ);
  const P = readParams(c);
  if (P.err) return json(c, { error: P.err }, 400);
  const q = k => c.req.query(k);
  const where = [], vals = [];
  const st = normStatus(q('status'));
  if (q('status') && !st) return json(c, { error: 'bad status, use one of: ' + JOB_STATUS.join(', ') }, 400);
  if (st) { where.push('status=?'); vals.push(st); }
  if (q('company')) { where.push('LOWER(company)=?'); vals.push(String(q('company')).trim().toLowerCase()); }
  if (P.since) { where.push('date>=?'); vals.push(P.since); }
  if (q('date')) { where.push('date=?'); vals.push(String(q('date')).slice(0, 10)); }
  if (q('q')) { where.push('(LOWER(title) LIKE ? OR LOWER(company) LIKE ?)');
    const like = '%' + String(q('q')).trim().toLowerCase() + '%'; vals.push(like, like); }
  const w = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const total = (await db.prepare('SELECT COUNT(*) n FROM jobs' + w).bind(...vals).first()).n;
  const rows = (await db.prepare('SELECT * FROM jobs' + w + ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?')
    .bind(...vals, P.limit === null ? -1 : P.limit, P.offset).all()).results;
  const p = await buildProgress(db, c.get('cfg'));
  return readRes(c, {
    guide: guides(c.get('cfg')).jobs,
    meta: { ...readMeta('jobs', today, p.plan, P, c.get('cfg').tz),
      filters: { status: st || null, company: q('company') || null, q: q('q') || null, date: q('date') || null } },
    total, returned: rows.length,
    stats: {
      funnel: p.funnel, byPlatform: p.byPlatform, statuses: JOB_STATUS,
      pace: p.pace.apps, plan: p.plan, consistency: p.consistency.apps,
      jobsMeta: p.jobsMeta, records: { bestApps: p.records.bestApps },
      week: { apps: p.week.apps }, history: p.history.apps, last30: p.apps30,
    },
    rows,
  }, P.format);
});

app.get('/api/read/progress', async c => {
  const db = c.env.DB, today = todayIn(c.env.TZ);
  const P = readParams(c);
  if (P.err) return json(c, { error: P.err }, 400);
  const p = await buildProgress(db, c.get('cfg'));
  // the guarantee: this IS what the Progress tab renders, so no number can drift between them
  const stats = { ...p };
  // lc.problems is the MAX-wins array flagged in buildProgress: nothing renders it, and it would
  // tell a model that a problem reopened by a failed rerun is still solved. The leetcode endpoint
  // serves the correct latest-wins rollup instead.
  stats.lc = { ...p.lc };
  delete stats.lc.problems;
  let clipped = false;
  if (P.since) {
    const keep = a => Array.isArray(a) ? a.filter(x => (x.d || x.date || '') >= P.since) : a;
    const before = JSON.stringify([stats.history, stats.heat, stats.lc30, stats.apps30]).length;
    stats.history = { leetcode: keep(p.history.leetcode), apps: keep(p.history.apps) };
    stats.heat = keep(p.heat); stats.lc30 = keep(p.lc30); stats.apps30 = keep(p.apps30);
    stats.lc = { ...stats.lc, days: keep(p.lc.days), trend: keep(p.lc.trend) };
    stats.grind = { ...p.grind, last14: keep(p.grind.last14) };
    clipped = JSON.stringify([stats.history, stats.heat, stats.lc30, stats.apps30]).length !== before;
  }
  if (P.limit !== null || P.offset) {
    const cut = a => Array.isArray(a) ? a.slice(P.offset, P.limit === null ? undefined : P.offset + P.limit) : a;
    stats.history = { leetcode: cut(stats.history.leetcode), apps: cut(stats.history.apps) };
    clipped = true;
  }
  const total = (await db.prepare("SELECT COUNT(DISTINCT date) n FROM daily_goals WHERE date>=? AND date<=?"
    + (P.since ? ' AND date>=?' : '')).bind(p.plan ? p.plan.start : '0001-01-01', today, ...(P.since ? [P.since] : [])).first()).n;
  return readRes(c, {
    guide: guides(c.get('cfg')).progress,
    meta: { ...readMeta('progress', today, p.plan, P, c.get('cfg').tz), clipped },
    total, returned: (stats.history.leetcode || []).length + (stats.history.apps || []).length,
    stats,
  }, P.format);
});

// ---- plan, categories, side tasks: the editors behind Settings ----
const ymd = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
const hmOk = v => /^\d{2}:\d{2}$/.test(v || '');
const colorOk = v => /^#[0-9a-fA-F]{6}$/.test(v || '');
const emojiOk = (v, d) => { v = String(v || '').trim(); return v && v.length <= 8 ? v : d; };
const goalN = v => Math.min(50, Math.max(0, Math.round(+v || 0)));

app.get('/api/phases', async c => json(c, { phases: c.get('cfg').phases }));
app.post('/api/phases', async c => {
  const b = await c.req.json();
  const name = String(b.name || '').trim().slice(0, 60);
  if (!name || !ymd(b.start_date) || !ymd(b.end_date) || b.end_date < b.start_date) return json(c, { error: 'name, start and end are required' }, 400);
  const n = (await c.env.DB.prepare('SELECT COUNT(*) n FROM phases').first()).n;
  const r = await c.env.DB.prepare('INSERT INTO phases (name,start_date,end_date,color,low_load,sort) VALUES (?,?,?,?,?,?)')
    .bind(name, b.start_date, b.end_date, colorOk(b.color) ? b.color : '#5EA2FF', b.low_load ? 1 : 0, n).run();
  return json(c, { ok: true, id: r.meta.last_row_id });
});
app.patch('/api/phases/:id', async c => {
  const b = await c.req.json(), id = +c.req.param('id');
  const cur = await c.env.DB.prepare('SELECT * FROM phases WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no such phase' }, 404);
  const name = b.name !== undefined ? String(b.name).trim().slice(0, 60) || cur.name : cur.name;
  const start = ymd(b.start_date) ? b.start_date : cur.start_date, end = ymd(b.end_date) ? b.end_date : cur.end_date;
  if (end < start) return json(c, { error: 'end is before start' }, 400);
  await c.env.DB.prepare('UPDATE phases SET name=?, start_date=?, end_date=?, color=?, low_load=?, sort=? WHERE id=?')
    .bind(name, start, end, colorOk(b.color) ? b.color : cur.color, b.low_load !== undefined ? (b.low_load ? 1 : 0) : cur.low_load,
      b.sort !== undefined ? +b.sort || 0 : cur.sort, id).run();
  return json(c, { ok: true });
});
app.delete('/api/phases/:id', async c => {
  await c.env.DB.prepare('DELETE FROM phases WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

app.get('/api/categories', async c => json(c, { categories: c.get('cfg').allCategories }));
// A new category gets a slug key derived from its name; the two builtin keys are reserved.
const insertCategory = async (db, b, sort) => {
  const name = String(b.name || '').trim().slice(0, 40);
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'cat';
  let key = ['leetcode', 'applications'].includes(base) ? base + '-2' : base, n = 2;
  while (await db.prepare('SELECT 1 FROM categories WHERE key=?').bind(key).first()) key = base + '-' + (n++);
  const r = await db.prepare('INSERT INTO categories (key,name,emoji,color,goal_wd,goal_we,goal_low,builtin,enabled,sort) VALUES (?,?,?,?,?,?,?,NULL,?,?)')
    .bind(key, name, emojiOk(b.emoji, '⭐'), colorOk(b.color) ? b.color : '#5C6779', goalN(b.goal_wd), goalN(b.goal_we), goalN(b.goal_low),
      b.enabled === undefined || b.enabled ? 1 : 0, sort).run();
  return { id: r.meta.last_row_id, key };
};
app.post('/api/categories', async c => {
  const b = await c.req.json(), db = c.env.DB;
  if (!String(b.name || '').trim()) return json(c, { error: 'name is required' }, 400);
  const cnt = (await db.prepare('SELECT COUNT(*) n FROM categories').first()).n;
  const r = await insertCategory(db, b, cnt);
  return json(c, { ok: true, id: r.id, key: r.key });
});
app.patch('/api/categories/:id', async c => {
  const b = await c.req.json(), id = +c.req.param('id'), db = c.env.DB;
  const cur = await db.prepare('SELECT * FROM categories WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no such category' }, 404);
  const pick = (k, f) => b[k] !== undefined ? f(b[k]) : cur[k];
  await db.prepare('UPDATE categories SET name=?, emoji=?, color=?, goal_wd=?, goal_we=?, goal_low=?, enabled=?, sort=? WHERE id=?')
    .bind(pick('name', v => String(v).trim().slice(0, 40) || cur.name), pick('emoji', v => emojiOk(v, cur.emoji)),
      pick('color', v => colorOk(v) ? v : cur.color), pick('goal_wd', goalN), pick('goal_we', goalN), pick('goal_low', goalN),
      pick('enabled', v => v ? 1 : 0), pick('sort', v => +v || 0), id).run();
  return json(c, { ok: true });
});
// history keeps pointing at the key, so a category is only ever disabled, never deleted
app.delete('/api/categories/:id', async c => {
  const id = +c.req.param('id');
  const cur = await c.env.DB.prepare('SELECT * FROM categories WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no such category' }, 404);
  const enabled = (await c.env.DB.prepare('SELECT COUNT(*) n FROM categories WHERE enabled=1 AND id!=?').bind(id).first()).n;
  if (!enabled) return json(c, { error: 'keep at least one category on' }, 400);
  await c.env.DB.prepare('UPDATE categories SET enabled=0 WHERE id=?').bind(id).run();
  return json(c, { ok: true, disabled: true });
});

app.get('/api/side_tasks', async c => json(c, { sideTasks: (await c.env.DB.prepare('SELECT * FROM side_tasks ORDER BY sort, id').all()).results, emoji: SIDE_EMOJI }));
const sideBody = (b, cur = {}) => {
  const name = b.name !== undefined ? String(b.name).trim().slice(0, 40) : cur.name;
  const days = b.days !== undefined ? [...new Set((Array.isArray(b.days) ? b.days : String(b.days).split(',')).map(Number).filter(d => d >= 0 && d <= 6))].sort().join(',') : cur.days;
  const start = hmOk(b.start) ? b.start : cur.start, end = hmOk(b.end) ? b.end : cur.end;
  if (!name || !days || !start || !end) return null;
  return { name, days, start, end, emoji: emojiOk(b.emoji, cur.emoji || '📌'),
    date_from: b.date_from !== undefined ? (ymd(b.date_from) ? b.date_from : null) : (cur.date_from || null),
    date_to: b.date_to !== undefined ? (ymd(b.date_to) ? b.date_to : null) : (cur.date_to || null),
    enabled: b.enabled !== undefined ? (b.enabled ? 1 : 0) : (cur.enabled === undefined ? 1 : cur.enabled),
    sort: b.sort !== undefined ? +b.sort || 0 : (cur.sort || 0) };
};
app.post('/api/side_tasks', async c => {
  const t = sideBody(await c.req.json());
  if (!t) return json(c, { error: 'name, days, start and end are required' }, 400);
  const r = await c.env.DB.prepare('INSERT INTO side_tasks (name,emoji,days,start,end,date_from,date_to,enabled,sort) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(t.name, t.emoji, t.days, t.start, t.end, t.date_from, t.date_to, t.enabled, t.sort).run();
  return json(c, { ok: true, id: r.meta.last_row_id });
});
app.patch('/api/side_tasks/:id', async c => {
  const id = +c.req.param('id');
  const cur = await c.env.DB.prepare('SELECT * FROM side_tasks WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no such side task' }, 404);
  const t = sideBody(await c.req.json(), cur);
  if (!t) return json(c, { error: 'name, days, start and end are required' }, 400);
  await c.env.DB.prepare('UPDATE side_tasks SET name=?, emoji=?, days=?, start=?, end=?, date_from=?, date_to=?, enabled=?, sort=? WHERE id=?')
    .bind(t.name, t.emoji, t.days, t.start, t.end, t.date_from, t.date_to, t.enabled, t.sort, id).run();
  return json(c, { ok: true });
});
app.delete('/api/side_tasks/:id', async c => {
  await c.env.DB.prepare('DELETE FROM side_tasks WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

// Rewrite the daily goals from the categories' weekday / weekend / low-load values.
// Never touches a day with logged work (done>0) and never touches off days.
const regenGoals = async (db, cfg, from) => {
  const off = new Set((await db.prepare('SELECT date FROM off_days').all()).results.map(r => r.date));
  let touched = 0;
  for (let ds = from < cfg.plan.start ? cfg.plan.start : from; ds <= cfg.plan.end; ds = nextDay(ds)) {
    if (off.has(ds)) continue;
    const dow = new Date(ds + 'T12:00:00Z').getUTCDay(), low = isLowLoad(cfg, ds), we = dow === 0 || dow === 6;
    for (const cat of cfg.categories) {
      const g = low ? cat.goal_low : we ? cat.goal_we : cat.goal_wd;
      const r = g > 0
        ? await db.prepare('INSERT INTO daily_goals (date,type,goal,done) VALUES (?,?,?,0) ON CONFLICT(date,type) DO UPDATE SET goal=excluded.goal WHERE done=0').bind(ds, cat.key, g).run()
        : await db.prepare('UPDATE daily_goals SET goal=0 WHERE date=? AND type=? AND done=0').bind(ds, cat.key).run();
      touched += r.meta.changes || 0;
    }
  }
  return touched;
};
app.post('/api/goals/regenerate', async c => {
  const cfg = c.get('cfg'), db = c.env.DB;
  if (!cfg.plan) return json(c, { error: 'no plan: add a phase first' }, 400);
  const b = await c.req.json().catch(() => ({}));
  const from = b.from === 'start' ? cfg.plan.start : shiftDays(todayIn(c.env.TZ), 1);
  const touched = await regenGoals(db, cfg, from);
  return json(c, { ok: true, from, to: cfg.plan.end, touched });
});

// One-shot save from the Settings page: settings keys + phases + categories + side tasks in one
// request, so the page can hold a draft and show a single "Save changes" bar. Rows carry ids; rows
// without one are inserted; phases and side tasks missing from the payload are deleted (categories
// are only ever disabled). Everything is validated before the first write. If the plan or any
// category changed, the goals of today and every future day are rewritten (logged days untouched),
// so a separate "regenerate" step is never needed.
app.post('/api/settings/all', async c => {
  const db = c.env.DB, b = await c.req.json().catch(() => null);
  if (!b || typeof b !== 'object') return json(c, { error: 'bad body' }, 400);
  const P = Array.isArray(b.phases) ? b.phases : null, C = Array.isArray(b.categories) ? b.categories : null, T = Array.isArray(b.sideTasks) ? b.sideTasks : null;
  if (P) for (const p of P) {
    if (!String(p.name || '').trim()) return json(c, { error: 'every phase needs a name' }, 400);
    if (!ymd(p.start_date) || !ymd(p.end_date) || p.end_date < p.start_date) return json(c, { error: 'phase "' + String(p.name).slice(0, 40) + '" ends before it starts' }, 400);
  }
  if (C) {
    if (!C.some(x => x.enabled)) return json(c, { error: 'keep at least one category on' }, 400);
    for (const x of C) if (!x.builtin && !String(x.name || '').trim()) return json(c, { error: 'every category needs a name' }, 400);
  }
  const sides = T ? T.map(t => ({ id: t.id ? +t.id : 0, row: sideBody(t) })) : null;
  if (sides) for (const s of sides) if (!s.row) return json(c, { error: 'a side task is missing its name, days or times' }, 400);
  if (b.settings && typeof b.settings === 'object') {
    const err = await applySettings(c, b.settings);
    if (err) return json(c, { error: err }, 400);
  }
  const cfg0 = c.get('cfg');
  const before = JSON.stringify([cfg0.phases, cfg0.allCategories]);
  if (P) {
    const keep = new Set();
    for (let i = 0; i < P.length; i++) {
      const p = P[i], name = String(p.name).trim().slice(0, 60), color = colorOk(p.color) ? p.color : '#5EA2FF', low = p.low_load ? 1 : 0;
      if (p.id && (await db.prepare('SELECT 1 FROM phases WHERE id=?').bind(+p.id).first())) {
        await db.prepare('UPDATE phases SET name=?, start_date=?, end_date=?, color=?, low_load=?, sort=? WHERE id=?').bind(name, p.start_date, p.end_date, color, low, i, +p.id).run();
        keep.add(+p.id);
      } else {
        const r = await db.prepare('INSERT INTO phases (name,start_date,end_date,color,low_load,sort) VALUES (?,?,?,?,?,?)').bind(name, p.start_date, p.end_date, color, low, i).run();
        keep.add(r.meta.last_row_id);
      }
    }
    for (const r of (await db.prepare('SELECT id FROM phases').all()).results) if (!keep.has(r.id)) await db.prepare('DELETE FROM phases WHERE id=?').bind(r.id).run();
  }
  if (C) for (let i = 0; i < C.length; i++) {
    const x = C[i];
    const cur = x.id ? await db.prepare('SELECT * FROM categories WHERE id=?').bind(+x.id).first() : null;
    if (cur) {
      // builtin rows keep their name and look; only goals, on/off and order move
      const name = cur.builtin ? cur.name : (String(x.name).trim().slice(0, 40) || cur.name);
      await db.prepare('UPDATE categories SET name=?, emoji=?, color=?, goal_wd=?, goal_we=?, goal_low=?, enabled=?, sort=? WHERE id=?')
        .bind(name, cur.builtin ? cur.emoji : emojiOk(x.emoji, cur.emoji), cur.builtin ? cur.color : (colorOk(x.color) ? x.color : cur.color),
          goalN(x.goal_wd), goalN(x.goal_we), goalN(x.goal_low), x.enabled ? 1 : 0, i, cur.id).run();
    } else await insertCategory(db, x, i);
  }
  if (sides) {
    const keep = new Set();
    for (let i = 0; i < sides.length; i++) {
      const { id, row: t } = sides[i];
      if (id && (await db.prepare('SELECT 1 FROM side_tasks WHERE id=?').bind(id).first())) {
        await db.prepare('UPDATE side_tasks SET name=?, emoji=?, days=?, start=?, end=?, date_from=?, date_to=?, enabled=?, sort=? WHERE id=?')
          .bind(t.name, t.emoji, t.days, t.start, t.end, t.date_from, t.date_to, t.enabled, i, id).run();
        keep.add(id);
      } else {
        const r = await db.prepare('INSERT INTO side_tasks (name,emoji,days,start,end,date_from,date_to,enabled,sort) VALUES (?,?,?,?,?,?,?,?,?)')
          .bind(t.name, t.emoji, t.days, t.start, t.end, t.date_from, t.date_to, t.enabled, i).run();
        keep.add(r.meta.last_row_id);
      }
    }
    for (const r of (await db.prepare('SELECT id FROM side_tasks').all()).results) if (!keep.has(r.id)) await db.prepare('DELETE FROM side_tasks WHERE id=?').bind(r.id).run();
  }
  const cfg = await loadCfg(db);
  let regenerated = 0;
  if (cfg.plan && JSON.stringify([cfg.phases, cfg.allCategories]) !== before) regenerated = await regenGoals(db, cfg, todayIn(cfg.tz));
  return json(c, { ok: true, regenerated });
});

// ---- tasks: create, edit, delete (the Today list used to be seed-only) ----
app.post('/api/task', async c => {
  const b = await c.req.json();
  const title = String(b.title || '').trim().slice(0, 140);
  if (!title) return json(c, { error: 'title is required' }, 400);
  const date = ymd(b.date) ? b.date : todayIn(c.env.TZ);
  const sort = (await c.env.DB.prepare('SELECT COALESCE(MAX(sort),0)+1 s FROM tasks WHERE date=?').bind(date).first()).s;
  const r = await c.env.DB.prepare("INSERT INTO tasks (date,track,title,detail,status,shiftable,sort) VALUES (?,?,?,?,'todo',?,?)")
    .bind(date, String(b.track || 'other').slice(0, 20), title, String(b.detail || '').trim().slice(0, 500), b.pinned ? 0 : 1, sort).run();
  return json(c, { ok: true, id: r.meta.last_row_id });
});
app.patch('/api/task/:id', async c => {
  const b = await c.req.json(), id = +c.req.param('id');
  const cur = await c.env.DB.prepare('SELECT * FROM tasks WHERE id=?').bind(id).first();
  if (!cur) return json(c, { error: 'no such task' }, 404);
  await c.env.DB.prepare('UPDATE tasks SET title=?, detail=?, date=?, shiftable=? WHERE id=?')
    .bind(b.title !== undefined ? String(b.title).trim().slice(0, 140) || cur.title : cur.title,
      b.detail !== undefined ? String(b.detail).trim().slice(0, 500) : cur.detail,
      ymd(b.date) ? b.date : cur.date, b.pinned !== undefined ? (b.pinned ? 0 : 1) : cur.shiftable, id).run();
  return json(c, { ok: true });
});
app.delete('/api/task/:id', async c => {
  await c.env.DB.prepare('DELETE FROM tasks WHERE id=?').bind(+c.req.param('id')).run();
  return json(c, { ok: true });
});

// ---- ICS feed ----
app.get('/calendar.ics', async c => {
  const db = c.env.DB;
  const cfg = await loadCfg(db);
  if (!cfg.icsToken || !(await keyEq(c.req.query('token') || '', cfg.icsToken))) return c.text('forbidden', 403);
  const ics = await buildICS(db, cfg);
  return c.body(ics, 200, { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="lockin.ics"' });
});

return app;
}
