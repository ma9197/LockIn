-- Central database. Holds ONLY what is needed to find a user and let them in.
-- Every user's actual data (tasks, solves, jobs, settings...) lives in that user's
-- own Durable Object database, so nothing personal is ever in a shared table.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                 -- 16 random bytes as hex; also names the Durable Object
  email         TEXT NOT NULL UNIQUE,             -- stored lowercased and trimmed
  pw_hash       TEXT NOT NULL,                    -- PBKDF2-SHA256, hex
  pw_salt       TEXT NOT NULL,                    -- 16 random bytes, hex, per user
  pw_iters      INTEGER NOT NULL,                 -- stored so the cost can be raised later
  handle        TEXT UNIQUE,                      -- public URL name, NULL until onboarding completes
  display_name  TEXT NOT NULL DEFAULT '',
  onboarded     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  reset_token_hash TEXT,                          -- forgot-password hook, unused until a mailer exists
  reset_expires TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL UNIQUE,               -- sha256 of the cookie value, never the value itself
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  last_seen   TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Lookup only: the presented key is hashed and matched here to find the user.
-- The plaintext key is kept inside that user's own database for display in Settings.
CREATE TABLE IF NOT EXISTS api_keys (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  kind        TEXT NOT NULL,                      -- 'agent' (jobs read/write) | 'read' (read-only data API)
  key_hash    TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_apikeys_user_kind ON api_keys(user_id, kind);

-- Login brute-force lockout, keyed by ip and by email hash.
CREATE TABLE IF NOT EXISTS login_gate (
  gate_key TEXT PRIMARY KEY,
  fails    INTEGER NOT NULL DEFAULT 0,
  until    TEXT
);
