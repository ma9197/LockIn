// A D1-shaped face over a Durable Object's SQLite storage.
//
// The whole app was written against D1: db.prepare(sql).bind(...).first() / .all() / .run().
// Inside a Durable Object the API is a synchronous sql.exec(query, ...params) returning a cursor.
// This adapter lets every existing query run unchanged. Return shapes match D1:
//   first()  -> row object, or null when there is no row
//   all()    -> { results: [...], success, meta }
//   run()    -> { success, results: [], meta: { last_row_id, changes } }
//
// run() reads last_insert_rowid() and changes() in a second synchronous exec with no await
// in between. A Durable Object cannot interleave another request inside a synchronous span,
// so the value always belongs to the statement that just ran. Do not merge the two into one
// multi-statement string: bindings only apply to the last statement in a string.

const MAX_PARAMS = 100; // Durable Object SQLite limit per statement

export function d1Compat(sql, storage) {
  const exec = (q, args) => {
    if (args.length > MAX_PARAMS) throw new Error('too many bound parameters (' + args.length + ' > ' + MAX_PARAMS + '); chunk the statement');
    return sql.exec(q, ...args);
  };
  // callers await these, so a synchronous throw must become a rejection
  const wrap = fn => { try { return Promise.resolve(fn()); } catch (e) { return Promise.reject(e); } };

  const stmt = (q, args = []) => ({
    bind: (...a) => stmt(q, a),
    first: col => wrap(() => {
      const r = exec(q, args).toArray()[0];
      if (r === undefined) return null;
      return col ? r[col] : r;
    }),
    all: () => wrap(() => {
      const c = exec(q, args);
      const results = c.toArray();
      return { results, success: true, meta: { rows_read: c.rowsRead, rows_written: c.rowsWritten } };
    }),
    run: () => wrap(() => {
      const c = exec(q, args);
      c.toArray();
      const m = sql.exec('SELECT last_insert_rowid() AS id, changes() AS ch').one();
      return { success: true, results: [], meta: { last_row_id: m.id, changes: m.ch, rows_written: c.rowsWritten } };
    }),
    raw: () => wrap(() => [...exec(q, args).raw()]),
    _sync: () => exec(q, args).toArray(),
  });

  return {
    prepare: q => stmt(q),
    batch: stmts => wrap(() => storage.transactionSync(() => stmts.map(s => ({ results: s._sync(), success: true })))),
    exec: q => wrap(() => { sql.exec(q); return { count: 1 }; }),
  };
}
