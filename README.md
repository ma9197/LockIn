# LockIn

A grind tracker for CS students on the job hunt. Daily goals per category, a focus timer,
a LeetCode log with per-problem notes and an array visualiser, an application tracker with a
funnel, schedule blocks that step around your gym and classes, streaks, pace against your plan
and a Dec-15-style finish-line forecast. Phone first, fast, no framework.

Hosted at **[cslockin.com](https://cslockin.com)**. Sign up, answer the setup wizard, grind.

## What you get

- **Today**: goal rings for every category you track, your grind blocks for the day, side tasks
  (gym, class, shift), a live grind timer with pause and task switching, a day clock, off days.
- **LeetCode**: log every attempt (solved / slow / did not finish), one living note per problem,
  a pointer-array sketchpad, solve-time trends. A problem's state is its newest attempt.
- **Jobs**: applications with status, platform and salary, a funnel, per-platform stats, and an
  API key so an AI agent or a script can log applications for you.
- **Progress**: streak, pace vs plan, weekday patterns, heatmap, charts with real axes.
- **Share**: a read-only progress page for friends behind its own PIN, at `/u/<you>/share`.
- **Book**: friends grab your free windows at `/u/<you>/book`.
- **Calendar**: an ICS feed of your plan for Google Calendar or Apple Calendar.
- **Read-only API** for Claude or any assistant, with a built-in field guide so the model reads
  the numbers the way the app counts them.
- **Your data is yours**: export everything as JSON any time, import it back, delete the account
  and it is gone.

## How it is built

- One Cloudflare Worker (Hono), server-rendered pages as template strings. No build step.
- **Every user gets their own SQLite database** inside a Durable Object. A small central D1 holds
  only accounts, sessions, key hashes and login lockouts. One user's data is unreachable from
  another's by construction, not by discipline. See `ARCHITECTURE.md`.
- Deploys on every push to `main` through Cloudflare Workers Builds.

## Run it yourself

You need a Cloudflare account (the free plan works; the Paid plan gives more headroom) and Node.

```bash
git clone https://github.com/ma9197/LockIn.git && cd LockIn
npm install
npx wrangler login
npx wrangler d1 create lockin-central        # paste the database_id it prints into wrangler.jsonc
npm run db:migrate:remote                     # creates the central tables
npx wrangler deploy                           # first deploy; remove or change the custom domain route first
```

Local development:

```bash
npm run db:migrate:local
npm run dev                # http://localhost:8787
npm run check              # parses every module and every rendered page script
node scripts/isolation-test.mjs http://localhost:8787 fresh   # two throwaway accounts, 33 checks, cleaned up
```

Optional Worker secrets: `RESEND_API_KEY` and `MAIL_FROM` to enable password-reset email
(without them, "forgot password" is a no-op that never reveals whether an address exists),
and `ADMIN_KEY` to enable the `/admin/import` owner operation.

## License

MIT. See `LICENSE`.
