// One Durable Object per user. Its SQLite storage IS that user's database.
//
// The outer Worker (src/worker.js) authenticates the request, decides the caller's role, and
// forwards here with an X-LockIn-Ctx header. Nothing but the Worker can reach a stub, so the
// header is trusted; a request without it is refused anyway.
//
// M0: schema bootstrap, the D1-compat adapter, and a health probe that proves the adapter's
// return shapes on the real platform. The app routes mount here in M1.

import { d1Compat } from './db/d1compat.js';
import { migrate } from './db/schema.js';

export class UserDO {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.db = d1Compat(ctx.storage.sql, ctx.storage);
    this.schemaVersion = 0;
    ctx.blockConcurrencyWhile(async () => { this.schemaVersion = migrate(ctx.storage); });
  }

  async fetch(req) {
    const raw = req.headers.get('X-LockIn-Ctx');
    if (!raw) return new Response('forbidden', { status: 403 });
    let ctx;
    try { ctx = JSON.parse(raw); } catch (e) { return new Response('bad ctx', { status: 400 }); }
    const path = new URL(req.url).pathname;

    if (path === '/__internal/health' && ctx.role === 'internal') return this.health();
    return new Response('not found', { status: 404 });
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
