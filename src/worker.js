// The outer Worker: the only thing the internet talks to.
//
// It signs people up and in (central D1), works out which user a request belongs to (session
// cookie now; /u/<handle>/ public URLs and API keys come in M3), and forwards to that user's
// Durable Object with a trusted context header. It never reads or writes user data itself.

import { Hono } from 'hono';
import { landingPage, signupPage, loginPage } from './ui/auth.js';
import { onboardPage } from './ui/onboard.js';
import {
  normEmail, validEmail, newPasswordHash, verifyPassword, randomHex,
  createSession, sessionUser, destroySession, destroyAllSessions, sessionCookie, clearSessionCookie,
  gateKeys, gateLocked, gateFail, gateClear, sameOrigin,
} from './auth.js';
export { UserDO } from './userdo.js';

const app = new Hono();
const json = (c, o, s = 200) => c.json(o, s);

// Only the Worker can construct a stub, so a user id being derivable is not an exposure.
const userStub = (env, userId) => env.USER_DO.get(env.USER_DO.idFromName(userId));
const withCtx = (req, ctx, path) => {
  const u = new URL(req.url);
  if (path) u.pathname = path;
  const h = new Headers(req.headers);
  h.set('X-LockIn-Ctx', JSON.stringify(ctx));
  return new Request(u.toString(), { method: req.method, headers: h, body: req.body, redirect: 'manual' });
};
const ownerCtx = u => ({ role: 'owner', userId: u.id, handle: u.handle || '', displayName: u.display_name || '', email: u.email, base: '' });

// a thrown error becomes a logged line (tail shows strings, not Error objects) and a plain 500
app.onError((e, c) => {
  console.error('unhandled: ' + (e && e.stack ? e.stack : String(e)));
  const isApi = new URL(c.req.url).pathname.startsWith('/api/');
  return isApi ? c.json({ error: 'server error' }, 500) : c.text('server error', 500);
});

// the PWA manifest must be reachable without a session
app.get('/manifest.json', c => c.json({
  name: 'LockIn', short_name: 'LockIn', start_url: '/', display: 'standalone',
  background_color: '#0B0E14', theme_color: '#0B0E14',
  icons: [{ src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230B0E14'/><text x='50' y='68' font-size='52' text-anchor='middle'>🔥</text></svg>", sizes: 'any', type: 'image/svg+xml' }],
}));

// ---------- health ----------
app.get('/healthz', async c => {
  const central = await c.env.CENTRAL.prepare('SELECT COUNT(*) n FROM users').first().catch(e => ({ error: String(e) }));
  const r = await userStub(c.env, 'healthz-probe').fetch(withCtx(c.req.raw, { role: 'internal' }, '/__internal/health'));
  const dob = await r.json().catch(() => ({ ok: false, status: r.status }));
  const ok = !!dob.ok && central && !central.error;
  return json(c, { ok, central, userDO: dob }, ok ? 200 : 500);
});

// ---------- auth pages ----------
app.get('/signup', async c => (await sessionUser(c.env.CENTRAL, c.req.raw)) ? c.redirect('/') : c.html(signupPage()));
app.get('/login', async c => (await sessionUser(c.env.CENTRAL, c.req.raw)) ? c.redirect('/') : c.html(loginPage()));

// ---------- auth API ----------
app.post('/api/auth/signup', async c => {
  if (!sameOrigin(c.req.raw)) return json(c, { error: 'bad origin' }, 403);
  const b = await c.req.json().catch(() => ({}));
  const email = normEmail(b.email);
  const pw = String(b.password || '');
  if (!validEmail(email)) return json(c, { error: 'enter a real email address' }, 400);
  if (pw.length < 10) return json(c, { error: 'password needs at least 10 characters' }, 400);
  if (pw.length > 200) return json(c, { error: 'password is too long' }, 400);
  if (pw !== String(b.password2 || '')) return json(c, { error: 'the two passwords do not match' }, 400);
  const db = c.env.CENTRAL;
  const exists = await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if (exists) return json(c, { error: 'that email already has an account, sign in instead' }, 409);
  const { hash, salt, iters } = await newPasswordHash(pw);
  const id = randomHex(16);
  await db.prepare('INSERT INTO users (id, email, pw_hash, pw_salt, pw_iters) VALUES (?,?,?,?,?)').bind(id, email, hash, salt, iters).run();
  const tok = await createSession(db, id);
  c.header('Set-Cookie', sessionCookie(tok));
  return json(c, { ok: true, next: '/welcome' });
});

app.post('/api/auth/login', async c => {
  if (!sameOrigin(c.req.raw)) return json(c, { error: 'bad origin' }, 403);
  const b = await c.req.json().catch(() => ({}));
  const email = normEmail(b.email), pw = String(b.password || '');
  const db = c.env.CENTRAL;
  const keys = await gateKeys(c.req.raw, email);
  const locked = await gateLocked(db, keys);
  if (locked) return json(c, { error: 'too many attempts. Try again in ' + locked + ' min' }, 429);
  const u = await db.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  // same message and same timing whether the email exists or not
  const ok = u ? await verifyPassword(pw, u) : (await verifyPassword(pw, { pw_hash: '0'.repeat(64), pw_salt: '0'.repeat(32), pw_iters: 210000 }), false);
  if (!ok) { await gateFail(db, keys); return json(c, { error: 'wrong email or password' }, 401); }
  await gateClear(db, keys);
  const tok = await createSession(db, u.id);
  c.header('Set-Cookie', sessionCookie(tok));
  return json(c, { ok: true, next: u.onboarded ? '/' : '/welcome' });
});

app.post('/api/auth/logout', async c => {
  await destroySession(c.env.CENTRAL, c.req.raw);
  c.header('Set-Cookie', clearSessionCookie());
  return json(c, { ok: true, next: '/login' });
});

// ---------- onboarding ----------
const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,29}$/;
const RESERVED = new Set(['api', 'u', 'login', 'signup', 'logout', 'welcome', 'settings', 'admin', 'static', 'healthz', 'share', 'book', 'about', 'help', 'www', 'mail', 'app']);

app.get('/welcome', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return c.redirect('/login');
  if (u.onboarded) return c.redirect('/settings');
  return c.html(onboardPage(u));
});

app.get('/api/handle/check', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const h = String(c.req.query('h') || '').trim().toLowerCase();
  if (!HANDLE_RE.test(h) || RESERVED.has(h)) return json(c, { ok: true, free: false });
  const row = await c.env.CENTRAL.prepare('SELECT id FROM users WHERE handle=?').bind(h).first();
  return json(c, { ok: true, free: !row || row.id === u.id });
});

app.post('/api/onboarding', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  if (!sameOrigin(c.req.raw)) return json(c, { error: 'bad origin' }, 403);
  const b = await c.req.json().catch(() => null);
  if (!b) return json(c, { error: 'bad request' }, 400);
  const displayName = String(b.displayName || '').trim().slice(0, 40);
  const handle = String(b.handle || '').trim().toLowerCase();
  if (!displayName) return json(c, { error: 'display name is required' }, 400);
  if (!HANDLE_RE.test(handle) || RESERVED.has(handle)) return json(c, { error: 'that handle is not allowed' }, 400);
  const taken = await c.env.CENTRAL.prepare('SELECT id FROM users WHERE handle=? AND id!=?').bind(handle, u.id).first();
  if (taken) return json(c, { error: 'that handle is taken' }, 409);
  // the user's own database is written first; the account row only flips once that succeeded
  const r = await userStub(c.env, u.id).fetch(new Request(new URL('/__internal/onboard', c.req.url).toString(), {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-LockIn-Ctx': JSON.stringify({ role: 'internal', userId: u.id }) }, body: JSON.stringify(b) }));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return json(c, { error: j.error || 'setup failed, try again' }, r.status === 400 ? 400 : 500);
  try {
    await c.env.CENTRAL.prepare('UPDATE users SET handle=?, display_name=?, onboarded=1 WHERE id=?').bind(handle, displayName, u.id).run();
  } catch (e) {
    return json(c, { error: 'that handle was just taken, pick another' }, 409);
  }
  return json(c, { ok: true, next: '/' });
});

// ---------- account ----------
app.post('/api/auth/password', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  if (!sameOrigin(c.req.raw)) return json(c, { error: 'bad origin' }, 403);
  const b = await c.req.json().catch(() => ({}));
  const next = String(b.next || '');
  if (!(await verifyPassword(String(b.current || ''), u))) return json(c, { error: 'current password is wrong' }, 401);
  if (next.length < 10 || next.length > 200) return json(c, { error: 'new password needs 10 to 200 characters' }, 400);
  const { hash, salt, iters } = await newPasswordHash(next);
  await c.env.CENTRAL.prepare('UPDATE users SET pw_hash=?, pw_salt=?, pw_iters=? WHERE id=?').bind(hash, salt, iters, u.id).run();
  // every other device is signed out; this one gets a fresh session
  await destroyAllSessions(c.env.CENTRAL, u.id);
  const tok = await createSession(c.env.CENTRAL, u.id);
  c.header('Set-Cookie', sessionCookie(tok));
  return json(c, { ok: true });
});

// Deletes the account row, its sessions and keys, then wipes the user's database.
// Order: central rows first, so a half-failure leaves an unreachable database, never an
// account whose data is gone.
app.post('/api/auth/delete', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  if (!sameOrigin(c.req.raw)) return json(c, { error: 'bad origin' }, 403);
  const b = await c.req.json().catch(() => ({}));
  if (!(await verifyPassword(String(b.password || ''), u))) return json(c, { error: 'password is wrong' }, 401);
  const db = c.env.CENTRAL;
  await db.prepare('DELETE FROM sessions WHERE user_id=?').bind(u.id).run();
  await db.prepare('DELETE FROM api_keys WHERE user_id=?').bind(u.id).run();
  await db.prepare('DELETE FROM users WHERE id=?').bind(u.id).run();
  await userStub(c.env, u.id).fetch(internalReq(c, u.id, '/__internal/destroy', 'POST', {}));
  c.header('Set-Cookie', clearSessionCookie());
  return json(c, { ok: true, next: '/' });
});

// ---------- data portability ----------
const internalReq = (c, userId, path, method = 'GET', body) => new Request(new URL(path, c.req.url).toString(), {
  method, headers: { 'Content-Type': 'application/json', 'X-LockIn-Ctx': JSON.stringify({ role: 'internal', userId }) },
  body: body === undefined ? undefined : JSON.stringify(body) });

app.get('/api/export', async c => {
  const u = await sessionUser(c.env.CENTRAL, c.req.raw);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const r = await userStub(c.env, u.id).fetch(internalReq(c, u.id, '/__internal/export'));
  const body = await r.text();
  return c.body(body, r.status, { 'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': 'attachment; filename="lockin-' + (u.handle || 'export') + '.json"', 'Cache-Control': 'no-store' });
});

// Owner operations, only when an ADMIN_KEY secret is configured on the Worker and presented.
// Used once to load the owner's old instance into his account; not part of the product.
app.post('/admin/import', async c => {
  const key = c.env.ADMIN_KEY;
  const given = (c.req.header('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!key || !given || given.length !== key.length || [...given].some((ch, i) => ch !== key[i])) return c.text('not found', 404);
  const b = await c.req.json().catch(() => null);
  if (!b || !b.email || !b.file) return json(c, { error: 'email and file required' }, 400);
  const u = await c.env.CENTRAL.prepare('SELECT * FROM users WHERE email=?').bind(normEmail(b.email)).first();
  if (!u) return json(c, { error: 'no account with that email, sign up first' }, 404);
  const r = await userStub(c.env, u.id).fetch(internalReq(c, u.id, '/__internal/import', 'POST', b.file));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return json(c, j, r.status);
  if (b.handle || b.displayName) {
    await c.env.CENTRAL.prepare('UPDATE users SET handle=COALESCE(?, handle), display_name=COALESCE(?, display_name), onboarded=1 WHERE id=?')
      .bind(b.handle || null, b.displayName || null, u.id).run();
  }
  return json(c, { ok: true, user: u.email, counts: j.counts });
});

// ---------- everything else belongs to the signed-in user ----------
app.all('*', async c => {
  const req = c.req.raw;
  const path = new URL(req.url).pathname;
  const isApi = path.startsWith('/api/');
  const user = await sessionUser(c.env.CENTRAL, req);
  if (!user) {
    if (isApi) return json(c, { error: 'unauthorized' }, 401);
    if (path === '/') return c.html(landingPage());
    return c.redirect('/login');
  }
  if (!user.onboarded && path !== '/welcome' && path !== '/api/onboarding' && path !== '/api/handle/check') {
    return isApi ? json(c, { error: 'finish setup first' }, 403) : c.redirect('/welcome');
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) return json(c, { error: 'bad origin' }, 403);
  return userStub(c.env, user.id).fetch(withCtx(req, ownerCtx(user)));
});

export default app;
