// The outer Worker: the only thing the internet talks to.
//
// Responsibilities: sign-up and sign-in (central D1), finding the right user for a request
// (session cookie, /u/<handle>/ public URL, or an API key), and forwarding to that user's
// Durable Object with a trusted context header. It never touches user data itself.
//
// M0: health check and a landing placeholder. Auth, onboarding and forwarding land in M1.

import { Hono } from 'hono';
export { UserDO } from './userdo.js';

const app = new Hono();

// Only the Worker can construct a stub, so a user id being derivable is not an exposure.
const userStub = (env, userId) => env.USER_DO.get(env.USER_DO.idFromName(userId));
const withCtx = (req, ctx, path) => {
  const u = new URL(req.url);
  if (path) u.pathname = path;
  const h = new Headers(req.headers);
  h.set('X-LockIn-Ctx', JSON.stringify(ctx));
  return new Request(u.toString(), { method: req.method, headers: h, body: req.body });
};

app.get('/healthz', async c => {
  const central = await c.env.CENTRAL.prepare('SELECT COUNT(*) n FROM users').first().catch(e => ({ error: String(e) }));
  const stub = userStub(c.env, 'healthz-probe');
  const r = await stub.fetch(withCtx(c.req.raw, { role: 'internal' }, '/__internal/health'));
  const dob = await r.json().catch(() => ({ ok: false, status: r.status }));
  const ok = !!dob.ok && central && !central.error;
  return c.json({ ok, central, userDO: dob }, ok ? 200 : 500);
});

app.get('/', c => c.html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LockIn</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B0E14;color:#EDF1F7;font:16px/1.5 system-ui,sans-serif}
b{font-size:34px;letter-spacing:.02em}em{font-style:normal;color:#FF6B35}p{color:#97A3B6;margin:6px 0 0}</style>
<div style="text-align:center"><b>LOCK<em>IN</em> 🔥</b><p>A grind tracker for CS students on the job hunt.</p><p>Opening soon.</p></div>`));

export default app;
