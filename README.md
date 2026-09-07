# LockIn

A grind tracker for CS students on the job hunt. Daily goals, focus timer, LeetCode practice
log with notes, application tracker, schedule blocks, streaks and progress charts, all in one
fast, phone-first page. Hosted at [cslockin.com](https://cslockin.com).

## How it is built

- Cloudflare Worker (Hono) with server-rendered pages, no framework, no build step.
- Every user gets their own SQLite database inside a Durable Object. A tiny central D1 holds
  only accounts and sessions. One user's data is unreachable from another's by construction.
- Deploys on every push to `main` through Cloudflare Workers Builds.

See `ARCHITECTURE.md` for the full picture (coming with the first release).

## Local development

```bash
npm install
npm run db:migrate:local   # central database, local copy
npm run dev                # http://localhost:8787
npm run check              # parses every module and every rendered page script
```

## License

MIT
