# Architecture

## The shape

```
browser / agent / friend
   |
src/worker.js      the only thing the internet talks to
   - sign up / sign in (PBKDF2-SHA256, 100k iterations, per-user salt) against central D1
   - session cookie -> users row; /u/<handle>/... -> handle lookup; Bearer or ?key= -> api_keys hash lookup
   - forwards to the user's Durable Object with one trusted header: X-LockIn-Ctx {role, userId, handle, displayName, base}
   |
src/userdo.js      class UserDO, one object per user, SQLite storage = that user's whole database
   - migrates its schema on wake (src/db/schema.js, meta.schema_version)
   - mounts src/app.js with env { DB: d1compat adapter, CTX, TZ, STORAGE, CENTRAL }
   - /__internal/health, onboard, export, import, destroy (role "internal", set only by the Worker)
src/app.js         the per-user app: every page and API route, gated by ROLE, not by credentials
src/db/d1compat.js prepare().bind().first()/all()/run() over the DO's synchronous sql.exec
src/helpers.js     loadCfg, time zones (any IANA zone via Intl), schedule blocks, ICS
src/ui/*.js        pages; theme.js is the shell + shared client runtime
```

## Roles

The Worker decides who is calling; the per-user app only checks the role against the path.

| role | how it is obtained | reaches |
|---|---|---|
| owner | session cookie `lockin_sess` (random token, sha256 stored) | everything |
| public | `/u/<handle>/` allow-list: share, book, calendar.ics and their APIs | those paths only |
| share | share PIN cookie, `Path=/u/<handle>`, value derived from the user id + PIN hash | `GET /api/share/progress` |
| agent | `Authorization: Bearer <key>` whose hash matches an `api_keys` row of kind `agent` | `/api/jobs*` |
| read | Bearer or `?key=` on `GET /api/read/*`, kind `read` | the three read-only endpoints |
| internal | set by the Worker itself for onboarding, export, import, destroy | `/__internal/*` |

Anything under `/u/` that is not on the allow-list is a 404 in the Worker and never reaches a
database. A key of one kind on the other kind's paths is a 401. There is no shared table with
user data, so a missed `WHERE user_id=?` cannot exist.

## Per-user database

Fifteen application tables plus three that make the app configurable: `phases` (the plan, with a
`low_load` flag), `categories` (what you grind, with goals per weekday / weekend / low-load day;
`leetcode` and `applications` are built-ins with extra tools), `side_tasks` (gym, class, shift).
`settings` is a key/value table: time zone, clock format, schedule layouts, modules, targets,
booking rules, the plaintext API keys (only their hashes leave the object).

Counting rules that matter:

- A LeetCode problem's state is its **newest** attempt. Reruns are normal, so attempt rows are
  never problems. "Solved" means the newest attempt was a clean solve.
- The daily counter counts every attempt. Solve-time stats count solved + slow. Pace counts clean
  solves only. Three different questions, three different sets.
- Grind time is wall clock minus paused minutes, everywhere.
- Off days zero that day's goals, which makes them neutral for the streak.
- Every date is the user's local wall time, `YYYY-MM-DD`, computed with `Intl` for their zone.

## The D1-compat adapter

The app was written against D1. Inside a Durable Object the API is a synchronous
`sql.exec(query, ...params)` returning a cursor. `src/db/d1compat.js` gives the same
`prepare().bind().first()/all()/run()` surface with D1's return shapes. `run()` reads
`last_insert_rowid()` and `changes()` in the very next synchronous statement, which is safe
because nothing can interleave inside a synchronous span. It throws on more than 100 bound
parameters, the platform limit, so bulk statements are chunked.

## Requests you can trace

- **Sign up** → `users` row → session → `/welcome` wizard → `POST /api/onboarding` → the DO writes
  settings, phases, categories, side tasks and the daily goal rows for the plan window in one
  transaction → only then `users.onboarded = 1`.
- **Today** → session → DO → `loadCfg` (settings, phases, categories, side tasks) → `blocksFor`
  picks the layout (low-load phase, weekday pin, or default), adds side tasks, carves the
  bookable windows → the page reads everything else from `window.__U`.
- **Friend books a slot** → `/u/<handle>/book` → Worker looks up the handle → DO renders with
  the owner's zone → `POST /u/<handle>/api/book` → anti-spam by device cookie → `sessions` row.
- **Claude reads the log** → `?key=` on `/api/read/leetcode` → hash lookup → role `read` → the DO
  answers with the data and a `guide` object that spells out the counting rules for that user.

## Things that only bite in production

- Workers cap PBKDF2 at 100,000 iterations; the local runtime does not enforce it.
- A request body streamed into a Durable Object that answers before reading it kills the isolate.
  The Worker buffers bodies before forwarding.
- `wrangler tail` shows `console.error` strings; an Error object logs as an empty message.
