// One Durable Object per user. Its SQLite storage IS that user's database.
//
// The outer Worker (src/worker.js) authenticates the request, decides the caller's role, and
// forwards here with an X-LockIn-Ctx header. Nothing but the Worker can reach a stub, so the
// header is trusted; a request without it is refused anyway.

import { d1Compat } from './db/d1compat.js';
import { migrate } from './db/schema.js';
import { createUserApp } from './app.js';

// Order matters for import: parents before children.
const EXPORT_TABLES = ['settings', 'phases', 'categories', 'side_tasks', 'tasks', 'daily_goals', 'grind_sessions',
  'block_moves', 'lc_solves', 'lc_notes', 'jobs', 'off_days', 'links', 'snippets', 'sessions', 'session_friends'];
// never leave the object in an export, never trust them from an import
const SECRET_KEYS = new Set(['api_key', 'read_key', 'ics_token', 'share_pin_hash', 'pin_hash']);

export class UserDO {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.db = d1Compat(ctx.storage.sql, ctx.storage);
    this.app = createUserApp();
    this.schemaVersion = 0;
    ctx.blockConcurrencyWhile(async () => { this.schemaVersion = migrate(ctx.storage); });
  }

  async fetch(req) {
    const raw = req.headers.get('X-LockIn-Ctx');
    if (!raw) return new Response('forbidden', { status: 403 });
    let c;
    try { c = JSON.parse(raw); } catch (e) { return new Response('bad ctx', { status: 400 }); }
    const path = new URL(req.url).pathname;

    if (path.startsWith('/__internal/')) {
      if (c.role !== 'internal') return new Response('forbidden', { status: 403 });
      if (path === '/__internal/health') return this.health();
      if (path === '/__internal/onboard' && req.method === 'POST') return this.onboard(await req.json().catch(() => null));
      if (path === '/__internal/export') return this.exportAll();
      if (path === '/__internal/import' && req.method === 'POST') return this.importAll(await req.json().catch(() => null));
      if (path === '/__internal/destroy' && req.method === 'POST') { await this.ctx.storage.deleteAll(); return Response.json({ ok: true }); }
      return new Response('not found', { status: 404 });
    }
    // the app sees the adapter as its database and the context as a binding. The zone is read
    // here (one local row) so every handler can say todayIn(c.env.TZ) without loading config.
    const tzRow = this.ctx.storage.sql.exec("SELECT value FROM settings WHERE key='timezone'").toArray()[0];
    // CENTRAL is handed through only so key hashes can be kept in sync for the Worker's lookup
    return this.app.fetch(req, { DB: this.db, CTX: c, STORAGE: this.ctx.storage, TZ: tzRow ? tzRow.value : 'UTC', CENTRAL: this.env.CENTRAL });
  }

  // The setup wizard's one write. Validates everything, then in ONE transaction: settings,
  // phases, categories, side tasks, and the daily goal rows for the whole plan window.
  // Re-runnable: a failed attempt leaves nothing behind, a retry starts clean.
  onboard(b) {
    const bad = m => Response.json({ error: m }, { status: 400 });
    if (!b || typeof b !== 'object') return bad('bad request');
    const hm = v => /^\d{2}:\d{2}$/.test(v || '');
    const ymd = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
    const color = v => /^#[0-9a-fA-F]{6}$/.test(v || '') ? v : '#5EA2FF';
    const emoji = (v, d) => { v = String(v || '').trim(); return v && v.length <= 8 ? v : d; };
    const goal = v => Math.min(50, Math.max(0, Math.round(+v || 0)));
    let tz = String(b.timezone || 'UTC');
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); } catch (e) { return bad('unknown time zone'); }

    const phases = (Array.isArray(b.phases) ? b.phases : []).slice(0, 20).map((p, i) => ({
      name: String(p.name || '').trim().slice(0, 60) || ('Phase ' + (i + 1)),
      start: p.start, end: p.end, color: color(p.color), low: p.low ? 1 : 0 }));
    for (const p of phases) if (!ymd(p.start) || !ymd(p.end) || p.end < p.start) return bad('check the phase dates');

    const layouts = {};
    for (const [n, list] of Object.entries(b.layouts && typeof b.layouts === 'object' ? b.layouts : {})) {
      const key = String(n).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
      if (!key || !Array.isArray(list)) continue;
      const blocks = list.filter(g => Array.isArray(g) && hm(g[0]) && hm(g[1])).slice(0, 4).map(g => [g[0], g[1]]);
      if (blocks.length) layouts[key] = blocks;
    }
    if (!Object.keys(layouts).length) return bad('at least one grind block is needed');
    const def = layouts[b.defaultLayout] ? b.defaultLayout : Object.keys(layouts)[0];
    const low = layouts[b.lowLayout] ? b.lowLayout : (layouts.low ? 'low' : def);

    const cats = [];
    const seen = new Set();
    for (const c of (Array.isArray(b.categories) ? b.categories : []).slice(0, 12)) {
      const name = String(c.name || '').trim().slice(0, 40);
      if (!name) continue;
      const builtin = ['leetcode', 'applications'].includes(c.builtin) ? c.builtin : null;
      let key = builtin || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'cat';
      if (!builtin && ['leetcode', 'applications'].includes(key)) key = key + '-2';
      let k = key, n = 2; while (seen.has(k)) k = key + '-' + (n++);
      seen.add(k);
      cats.push({ key: k, name, emoji: emoji(c.emoji, '⭐'), color: color(c.color), wd: goal(c.goal_wd), we: goal(c.goal_we), low: goal(c.goal_low), builtin });
    }
    if (!cats.length) return bad('keep at least one category');

    const side = [];
    for (const t of (Array.isArray(b.sideTasks) ? b.sideTasks : []).slice(0, 20)) {
      const name = String(t.name || '').trim().slice(0, 40);
      const days = (Array.isArray(t.days) ? t.days : []).map(Number).filter(d => d >= 0 && d <= 6);
      if (!name || !days.length || !hm(t.start) || !hm(t.end)) return bad('check the side task ' + (name || '(unnamed)'));
      side.push({ name, emoji: emoji(t.emoji, '📌'), days: [...new Set(days)].sort().join(','), start: t.start, end: t.end,
        from: ymd(t.date_from) ? t.date_from : null, to: ymd(t.date_to) ? t.date_to : null });
    }

    const modules = { leetcode: true, jobs: true, copy: true, friends: false, clock: true };
    if (b.modules && typeof b.modules === 'object') for (const k of Object.keys(modules)) if (b.modules[k] !== undefined) modules[k] = !!b.modules[k];
    if (!cats.some(c => c.builtin === 'leetcode')) modules.leetcode = false;
    if (!cats.some(c => c.builtin === 'applications')) modules.jobs = false;
    const target = Math.min(16, Math.max(1, +b.grindTarget || 6));
    const availability = (Array.isArray(b.availability) ? b.availability : []).filter(g => Array.isArray(g) && hm(g[0]) && hm(g[1])).slice(0, 4);

    const sql = this.ctx.storage.sql;
    const set = (k, v) => sql.exec('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', k, v);
    let goalRows = 0;
    this.ctx.storage.transactionSync(() => {
      sql.exec('DELETE FROM phases'); sql.exec('DELETE FROM categories'); sql.exec('DELETE FROM side_tasks'); sql.exec('DELETE FROM daily_goals');
      set('timezone', tz); set('clock_24h', b.clock24 ? '1' : '0');
      set('modules', JSON.stringify(modules)); set('grind_target_hours', String(target));
      set('booking_enabled', b.bookingEnabled ? '1' : '0'); set('availability', JSON.stringify(availability));
      set('sched', JSON.stringify({ layouts, default: def, byDow: {}, low }));
      set('timer_default', '25'); set('onboarded_at', new Date().toISOString());
      phases.forEach((p, i) => sql.exec('INSERT INTO phases (name,start_date,end_date,color,low_load,sort) VALUES (?,?,?,?,?,?)', p.name, p.start, p.end, p.color, p.low, i));
      cats.forEach((c, i) => sql.exec('INSERT INTO categories (key,name,emoji,color,goal_wd,goal_we,goal_low,builtin,enabled,sort) VALUES (?,?,?,?,?,?,?,?,1,?)',
        c.key, c.name, c.emoji, c.color, c.wd, c.we, c.low, c.builtin, i));
      side.forEach((t, i) => sql.exec('INSERT INTO side_tasks (name,emoji,days,start,end,date_from,date_to,enabled,sort) VALUES (?,?,?,?,?,?,?,1,?)',
        t.name, t.emoji, t.days, t.start, t.end, t.from, t.to, i));
      // goals for every day of the plan: weekday / weekend / low-load value per category
      if (phases.length) {
        const start = phases.reduce((a, p) => a < p.start ? a : p.start, phases[0].start);
        const end = phases.reduce((a, p) => a > p.end ? a : p.end, phases[0].end);
        const lows = phases.filter(p => p.low);
        const rows = [];
        let d = new Date(start + 'T12:00:00Z');
        const endD = new Date(end + 'T12:00:00Z');
        let guard = 0;
        while (d <= endD && guard++ < 1500) {
          const ds = d.toISOString().slice(0, 10), dow = d.getUTCDay();
          const isLow = lows.some(p => p.start <= ds && ds <= p.end), we = dow === 0 || dow === 6;
          for (const c of cats) { const g = isLow ? c.low : we ? c.we : c.wd; if (g > 0) rows.push(ds, c.key, g); }
          d.setUTCDate(d.getUTCDate() + 1);
        }
        for (let i = 0; i < rows.length; i += 75) {
          const chunk = rows.slice(i, i + 75);
          const ph = Array.from({ length: chunk.length / 3 }, () => '(?,?,?,0)').join(',');
          sql.exec('INSERT INTO daily_goals (date,type,goal,done) VALUES ' + ph + ' ON CONFLICT(date,type) DO UPDATE SET goal=excluded.goal', ...chunk);
          goalRows += chunk.length / 3;
        }
      }
    });
    return Response.json({ ok: true, phases: phases.length, categories: cats.length, sideTasks: side.length, goalRows });
  }

  // Every table, secrets excluded. The same shape importAll() accepts, so a user can take their
  // data anywhere and bring it back.
  exportAll() {
    const sql = this.ctx.storage.sql;
    const tables = {};
    for (const t of EXPORT_TABLES) {
      let rows = sql.exec('SELECT * FROM ' + t).toArray();
      if (t === 'settings') rows = rows.filter(r => !SECRET_KEYS.has(r.key));
      tables[t] = rows;
    }
    return Response.json({ format: 'lockin-export/1', exportedAt: new Date().toISOString(), schema: this.schemaVersion, tables });
  }

  // Replace everything with the file. One transaction: either all of it lands or none of it.
  // Row ids are kept so cross-references (session_friends.session_id, block ids) stay valid.
  importAll(b) {
    const bad = m => Response.json({ error: m }, { status: 400 });
    if (!b || b.format !== 'lockin-export/1' || !b.tables || typeof b.tables !== 'object') return bad('not a LockIn export file');
    const sql = this.ctx.storage.sql;
    const counts = {};
    try {
      this.ctx.storage.transactionSync(() => {
        for (const t of EXPORT_TABLES) {
          const rows = Array.isArray(b.tables[t]) ? b.tables[t] : [];
          const cols = sql.exec('SELECT name FROM pragma_table_info(?)', t).toArray().map(r => r.name);
          sql.exec('DELETE FROM ' + t);
          let n = 0;
          for (const r of rows) {
            if (!r || typeof r !== 'object') continue;
            if (t === 'settings' && SECRET_KEYS.has(r.key)) continue;
            const use = cols.filter(c => r[c] !== undefined);
            if (!use.length) continue;
            sql.exec('INSERT INTO ' + t + ' (' + use.join(',') + ') VALUES (' + use.map(() => '?').join(',') + ')', ...use.map(c => r[c]));
            n++;
          }
          counts[t] = n;
        }
      });
    } catch (e) {
      return Response.json({ error: 'import failed: ' + String(e.message || e) }, { status: 400 });
    }
    return Response.json({ ok: true, counts });
  }

  // Runs the three adapter shapes the app relies on and reports them, so a deploy can be
  // checked with one request instead of trusting that DO SQLite behaves like stock SQLite.
  async health() {
    const db = this.db, sql = this.ctx.storage.sql;
    sql.exec('CREATE TABLE IF NOT EXISTS _probe (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT)');
    try {
      const ins = await db.prepare('INSERT INTO _probe (v) VALUES (?)').bind('x').run();
      const upd0 = await db.prepare('UPDATE _probe SET v=? WHERE id=?').bind('y', -1).run();
      const none = await db.prepare('SELECT * FROM _probe WHERE id=?').bind(-1).first();
      const all = await db.prepare('SELECT * FROM _probe').all();
      // substr, not LIKE: in SQLite LIKE the underscore is a one-character wildcard
      const tables = sql.exec("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND substr(name,1,1)!='_' AND name!='meta'").one().n;
      const ok = typeof ins.meta.last_row_id === 'number' && ins.meta.last_row_id >= 1
        && upd0.meta.changes === 0 && none === null && all.results.length === 1 && tables >= 15;
      return Response.json({ ok, schemaVersion: this.schemaVersion, tables,
        probe: { last_row_id: ins.meta.last_row_id, changes0: upd0.meta.changes, none, rows: all.results.length } });
    } finally {
      sql.exec('DROP TABLE IF EXISTS _probe');
    }
  }
}
