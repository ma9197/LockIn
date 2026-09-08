// Accounts, passwords, sessions, login lockout. All against the central D1 (env.CENTRAL).
// Nothing here knows anything about a user's data; that lives in their Durable Object.

import { sha256hex } from './helpers.js';

// Cloudflare Workers cap PBKDF2 at 100,000 iterations (the local runtime does not enforce it,
// which is how 210k got past local testing). Stored per user, so it can be raised if the cap moves.
export const PW_ITERS = 100000;
export const SESSION_DAYS = 180;
export const SESSION_COOKIE = 'lockin_sess';
const enc = new TextEncoder();

export const randomHex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, '0')).join('');
export const normEmail = e => String(e || '').trim().toLowerCase().slice(0, 254);
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Constant-time compare of two equal-length hex strings.
const hexEq = (a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

async function pbkdf2(password, saltHex, iters) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iters }, key, 256);
  return [...new Uint8Array(bits)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function newPasswordHash(password) {
  const salt = randomHex(16);
  return { hash: await pbkdf2(password, salt, PW_ITERS), salt, iters: PW_ITERS };
}

export async function verifyPassword(password, row) {
  const h = await pbkdf2(password, row.pw_salt, row.pw_iters);
  return hexEq(h, row.pw_hash);
}

// ---------- sessions ----------
const expiresAt = () => new Date(Date.now() + SESSION_DAYS * 864e5).toISOString().slice(0, 19).replace('T', ' ');

export async function createSession(db, userId) {
  const token = randomHex(32);
  await db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at, last_seen) VALUES (?,?,?,datetime(\'now\'))')
    .bind(userId, await sha256hex('sess:' + token), expiresAt()).run();
  return token;
}

export const readCookie = (req, name) => {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : '';
};

// Returns the user row for a valid session cookie, or null. Bumps last_seen at most hourly.
export async function sessionUser(db, req) {
  const tok = readCookie(req, SESSION_COOKIE);
  if (!tok || !/^[0-9a-f]{64}$/.test(tok)) return null;
  const th = await sha256hex('sess:' + tok);
  const row = await db.prepare(`SELECT u.*, s.id AS session_id, s.last_seen FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at > datetime('now')`).bind(th).first();
  if (!row) return null;
  if (!row.last_seen || Date.now() - Date.parse(row.last_seen + 'Z') > 3600e3) {
    await db.prepare("UPDATE sessions SET last_seen=datetime('now') WHERE id=?").bind(row.session_id).run();
  }
  return row;
}

export async function destroySession(db, req) {
  const tok = readCookie(req, SESSION_COOKIE);
  if (!tok) return;
  await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256hex('sess:' + tok)).run();
}

export const destroyAllSessions = (db, userId) => db.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId).run();

export const sessionCookie = token => `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
export const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

// ---------- login lockout ----------
// Same shape as the share-PIN gate: 5 failures lock a key for 15 minutes.
const LOCK_FAILS = 5, LOCK_MIN = 15;
export const gateKeys = async (req, email) => ['ip:' + (req.headers.get('CF-Connecting-IP') || 'local'), 'em:' + await sha256hex(email)];

export async function gateLocked(db, keys) {
  for (const k of keys) {
    const r = await db.prepare('SELECT until FROM login_gate WHERE gate_key=?').bind(k).first();
    if (r && r.until && Date.parse(r.until + 'Z') > Date.now()) {
      return Math.max(1, Math.ceil((Date.parse(r.until + 'Z') - Date.now()) / 60000));
    }
  }
  return 0;
}

export async function gateFail(db, keys) {
  for (const k of keys) {
    const r = await db.prepare('SELECT fails FROM login_gate WHERE gate_key=?').bind(k).first();
    const fails = (r ? r.fails : 0) + 1;
    const until = fails >= LOCK_FAILS ? new Date(Date.now() + LOCK_MIN * 60000).toISOString().slice(0, 19).replace('T', ' ') : null;
    await db.prepare('INSERT INTO login_gate (gate_key, fails, until) VALUES (?,?,?) ON CONFLICT(gate_key) DO UPDATE SET fails=excluded.fails, until=excluded.until')
      .bind(k, fails, until).run();
  }
}

export async function gateClear(db, keys) {
  for (const k of keys) await db.prepare('DELETE FROM login_gate WHERE gate_key=?').bind(k).run();
}

// ---------- CSRF ----------
// Cookies are SameSite=Lax, so cross-site POSTs already lose the cookie. This is the second
// lock: a mutating request must come from our own origin. Bearer-keyed calls have no cookie
// and skip this in the Worker.
export function sameOrigin(req) {
  const host = new URL(req.url).host;
  const origin = req.headers.get('Origin');
  if (origin) { try { return new URL(origin).host === host; } catch (e) { return false; } }
  const sfs = req.headers.get('Sec-Fetch-Site');
  if (sfs) return sfs === 'same-origin' || sfs === 'none';
  return true; // non-browser client without either header, cookie-less anyway
}
