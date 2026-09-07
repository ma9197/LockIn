// Per-user database schema. Every user gets their own SQLite database inside a Durable
// Object, and this is what it looks like. DDL only: nothing is ever seeded, the onboarding
// wizard writes the first rows.
//
// Versioned: bump SCHEMA and append to MIGRATIONS. migrate() runs on every object wake-up,
// costs one SELECT when already current, and applies anything newer inside a transaction.

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- A plan is a list of phases. The plan window is MIN(start_date) to MAX(end_date).
-- low_load marks stretches with reduced goals and a lighter schedule (exams, travel, guests).
CREATE TABLE IF NOT EXISTS phases (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL,
  color      TEXT NOT NULL,
  low_load   INTEGER NOT NULL DEFAULT 0,
  sort       INTEGER NOT NULL DEFAULT 0
);

-- What the user grinds: each category has a name, an emoji, a colour and optional daily goals.
-- key is the slug stored in daily_goals.type, grind_sessions.cur_task and splits[].t.
-- builtin marks the two with extra powers: 'leetcode' (LeetCode module) and 'applications' (Jobs).
-- Categories are never deleted, only disabled, so old history keeps resolving.
CREATE TABLE IF NOT EXISTS categories (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  key      TEXT NOT NULL UNIQUE,
  name     TEXT NOT NULL,
  emoji    TEXT NOT NULL,
  color    TEXT NOT NULL,
  goal_wd  INTEGER NOT NULL DEFAULT 0,
  goal_we  INTEGER NOT NULL DEFAULT 0,
  goal_low INTEGER NOT NULL DEFAULT 0,
  builtin  TEXT,
  enabled  INTEGER NOT NULL DEFAULT 1,
  sort     INTEGER NOT NULL DEFAULT 0
);

-- Recurring personal blocks that are not grind: gym, a class, a shift, a commute.
-- days is a comma list of weekdays, 0 = Sunday. date_from/date_to optionally bound it.
CREATE TABLE IF NOT EXISTS side_tasks (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  emoji     TEXT NOT NULL DEFAULT '📌',
  days      TEXT NOT NULL,
  start     TEXT NOT NULL,
  end       TEXT NOT NULL,
  date_from TEXT,
  date_to   TEXT,
  enabled   INTEGER NOT NULL DEFAULT 1,
  sort      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  date      TEXT NOT NULL,
  track     TEXT NOT NULL DEFAULT 'other',
  title     TEXT NOT NULL,
  detail    TEXT DEFAULT '',
  status    TEXT NOT NULL DEFAULT 'todo',
  shiftable INTEGER NOT NULL DEFAULT 1,
  sort      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

-- The day counter. type is a category key. done counts every logged unit that day.
CREATE TABLE IF NOT EXISTS daily_goals (
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  goal INTEGER NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, type)
);

CREATE TABLE IF NOT EXISTS grind_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  date          TEXT NOT NULL,
  block_label   TEXT DEFAULT '',
  planned_start TEXT,
  planned_end   TEXT,
  start_ts      TEXT NOT NULL,
  end_ts        TEXT,
  splits        TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  paused_at     TEXT,
  paused_min    INTEGER NOT NULL DEFAULT 0,
  cur_task      TEXT,
  cur_since     TEXT,
  cur_paused    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_grind_date ON grind_sessions(date);

-- Per-day override of a schedule block's start. label holds the stable block id
-- (g1..g4 for grind blocks, st:<side_task id> for side tasks), not the display text.
CREATE TABLE IF NOT EXISTS block_moves (
  date  TEXT NOT NULL,
  label TEXT NOT NULL,
  start TEXT NOT NULL,
  PRIMARY KEY (date, label)
);

CREATE TABLE IF NOT EXISTS lc_solves (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  minutes    INTEGER NOT NULL,
  name       TEXT DEFAULT '',
  source     TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_lc_date ON lc_solves(date);

CREATE TABLE IF NOT EXISTS lc_notes (
  name_key   TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  blocks     TEXT NOT NULL DEFAULT '[]',
  arrays     TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL,
  title      TEXT NOT NULL,
  company    TEXT NOT NULL,
  salary     TEXT DEFAULT '',
  location   TEXT DEFAULT '',
  url        TEXT DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'applied',
  source     TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  platform   TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);

CREATE TABLE IF NOT EXISTS off_days (
  date        TEXT PRIMARY KEY,
  reason      TEXT NOT NULL DEFAULT '',
  saved_goals TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  label      TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL,
  in_bundle  INTEGER NOT NULL DEFAULT 1,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  kind       TEXT NOT NULL DEFAULT 'jobs'
);

CREATE TABLE IF NOT EXISTS snippets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  label      TEXT NOT NULL DEFAULT '',
  value      TEXT NOT NULL,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  subs       TEXT NOT NULL DEFAULT '[]'
);

-- Friends booking queue (the Friends module).
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  start_ts   TEXT NOT NULL,
  end_ts     TEXT NOT NULL,
  activity   TEXT NOT NULL DEFAULT 'other',
  note       TEXT DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'requested',
  created_by TEXT NOT NULL DEFAULT 'owner',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  device_id  TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_ts);

CREATE TABLE IF NOT EXISTS session_friends (
  session_id  INTEGER NOT NULL,
  friend_name TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (session_id, friend_name)
);

-- Share-PIN brute-force lockout, keyed by the visitor's device cookie.
CREATE TABLE IF NOT EXISTS share_gate (
  device TEXT PRIMARY KEY,
  fails  INTEGER NOT NULL DEFAULT 0,
  until  TEXT
);
`;

export const SCHEMA = 1;
export const MIGRATIONS = [{ v: 1, sql: SCHEMA_V1 }];

// DDL only, so splitting on ";" at line ends is safe (no string literals contain it).
const statements = sql => sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);

export function migrate(storage) {
  const sql = storage.sql;
  sql.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const row = sql.exec("SELECT value FROM meta WHERE key='schema_version'").toArray()[0];
  let v = row ? +row.value : 0;
  for (const m of MIGRATIONS) {
    if (m.v <= v) continue;
    storage.transactionSync(() => {
      for (const st of statements(m.sql)) sql.exec(st);
      sql.exec("INSERT INTO meta (key,value) VALUES ('schema_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", String(m.v));
    });
    v = m.v;
  }
  return v;
}
