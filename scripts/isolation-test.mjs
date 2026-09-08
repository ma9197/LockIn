// Multi-tenant isolation test. Two existing accounts, A and B; proves every surface only ever
// reaches its own user's data. Runs against local dev or production.
//
//   node scripts/isolation-test.mjs http://localhost:8787 a@x.dev pwA b@x.dev pwB
//
// It sets a share PIN and enables booking on both accounts (leaves them like that).
// Two forms:
//   node scripts/isolation-test.mjs <base> emailA pwA emailB pwB [delete]   existing accounts
//   node scripts/isolation-test.mjs <base> fresh                             creates two throwaway
//                                                                            accounts, runs, deletes them
let [base, emailA, pwA, emailB, pwB] = process.argv.slice(2);
const FRESH = emailA === 'fresh';
if (!FRESH && !pwB) { console.error('usage: base emailA pwA emailB pwB [delete]  |  base fresh'); process.exit(2); }
if (FRESH) {
  const tag = Math.random().toString(36).slice(2, 8);
  emailA = 'iso-a-' + tag + '@example.invalid'; emailB = 'iso-b-' + tag + '@example.invalid';
  pwA = 'iso-pass-' + tag + 'AA'; pwB = 'iso-pass-' + tag + 'BB';
  const onboard = { timezone: 'UTC', clock24: true, phases: [{ name: 'P', start: '2026-01-01', end: '2026-01-31', color: '#5EA2FF', low: false }],
    layouts: { morning: [['09:00', '12:00']] }, defaultLayout: 'morning', lowLayout: 'morning',
    categories: [{ name: 'LeetCode', emoji: 'x', color: '#FF6B35', goal_wd: 1, goal_we: 0, goal_low: 0, builtin: 'leetcode' }, { name: 'Applications', emoji: 'x', color: '#5EA2FF', goal_wd: 1, goal_we: 0, goal_low: 0, builtin: 'applications' }],
    sideTasks: [], modules: { leetcode: true, jobs: true, copy: true, friends: true, clock: true }, grindTarget: 6, bookingEnabled: true, availability: [['12:00', '15:00']] };
  for (const [email, pw, h] of [[emailA, pwA, 'iso-a-' + tag], [emailB, pwB, 'iso-b-' + tag]]) {
    const r = await fetch(base + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ email, password: pw, password2: pw }) });
    if (!r.ok) { console.error('signup failed', r.status, await r.text()); process.exit(2); }
    const ck = (r.headers.get('set-cookie') || '').split(';')[0];
    const o = await fetch(base + '/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: ck }, body: JSON.stringify({ ...onboard, displayName: h, handle: h }) });
    if (!o.ok) { console.error('onboarding failed', o.status, await o.text()); process.exit(2); }
    // seed one solve and one job so the isolation assertions have something to compare
    await fetch(base + '/api/lc', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: ck }, body: JSON.stringify({ name: 'Only ' + h, difficulty: 'easy', minutes: 5, finished: 1 }) });
    await fetch(base + '/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: ck }, body: JSON.stringify({ title: 'Job of ' + h, company: h + ' Inc' }) });
  }
  process.argv[7] = 'delete';
  console.log('created ' + emailA + ' and ' + emailB);
}

let fails = 0;
const ok = (cond, label, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); if (!cond) fails++; };
const J = { 'Content-Type': 'application/json', Origin: base };
const cookieOf = r => (r.headers.get('set-cookie') || '').split(';')[0];
const req = (path, opts = {}) => fetch(base + path, { redirect: 'manual', ...opts });

async function login(email, password) {
  const r = await req('/api/auth/login', { method: 'POST', headers: J, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('login failed for ' + email + ': ' + r.status);
  return cookieOf(r);
}
const jget = async (path, cookie, extra = {}) => { const r = await req(path, { headers: { Cookie: cookie, ...extra } }); return { status: r.status, body: await r.json().catch(() => null) }; };

const A = { email: emailA, cookie: await login(emailA, pwA) };
const B = { email: emailB, cookie: await login(emailB, pwB) };
for (const U of [A, B]) {
  const s = await jget('/api/settings', U.cookie);
  Object.assign(U, { handle: s.body.user.handle, apiKey: s.body.apiKey, readKey: s.body.readKey, ics: s.body.icsUrl, share: s.body.shareUrl });
  await req('/api/settings', { method: 'POST', headers: { ...J, Cookie: U.cookie }, body: JSON.stringify({ sharePin: 'pin' + U.handle, bookingEnabled: true, availability: [['12:00', '15:00']] }) });
}
console.log('A=' + A.handle + '  B=' + B.handle);

// 1. owner APIs return own rows only
const namesA = (await jget('/api/lc/names', A.cookie)).body.names.map(x => x.name);
const namesB = (await jget('/api/lc/names', B.cookie)).body.names.map(x => x.name);
ok(!namesA.some(n => namesB.includes(n)) || namesA.length === 0 || namesB.length === 0, 'owner solve lists do not overlap', namesA.length + ' vs ' + namesB.length);
const jobsA = (await jget('/api/jobs', A.cookie)).body, jobsB = (await jget('/api/jobs', B.cookie)).body;
const compA = jobsA.jobs.map(j => j.company), compB = jobsB.jobs.map(j => j.company);
ok(!compA.some(x => compB.includes(x)) || !compA.length || !compB.length, 'job lists do not overlap', jobsA.count + ' vs ' + jobsB.count);

// 2. owner cookie cannot reach another user's private routes under /u/
for (const p of ['/api/day', '/api/settings', '/api/jobs', '/api/lc/names']) {
  const r = await req('/u/' + B.handle + p, { headers: { Cookie: A.cookie } });
  ok(r.status === 404, 'A cookie on /u/' + B.handle + p + ' -> 404', String(r.status));
}

// 3. share: PIN login is per user and path-scoped
const sl = await req('/u/' + B.handle + '/api/share/login', { method: 'POST', headers: J, body: JSON.stringify({ pin: 'pin' + B.handle }) });
const shareB = cookieOf(sl);
ok(sl.ok && shareB.startsWith('lockin_share='), 'share login on B', String(sl.status));
ok((sl.headers.get('set-cookie') || '').includes('Path=/u/' + B.handle), 'share cookie scoped to /u/' + B.handle);
const sp = await req('/u/' + B.handle + '/api/share/progress', { headers: { Cookie: shareB } });
ok(sp.status === 200, 'B share cookie reads B shared progress', String(sp.status));
const spA = await req('/u/' + A.handle + '/api/share/progress', { headers: { Cookie: shareB } });
ok(spA.status === 401, 'B share cookie on A shared progress -> 401', String(spA.status));
const spOwner = await req('/u/' + B.handle + '/api/share/progress', { headers: { Cookie: A.cookie } });
ok(spOwner.status === 401, 'A owner cookie on B shared progress -> 401', String(spOwner.status));
const wrongPin = await req('/u/' + B.handle + '/api/share/login', { method: 'POST', headers: J, body: JSON.stringify({ pin: 'nope' }) });
ok(wrongPin.status === 401, 'wrong share PIN -> 401', String(wrongPin.status));

// 4. booking lands in the right database
const slots = await (await req('/u/' + A.handle + '/api/book/slots')).json();
const win = (slots.days || []).flatMap(d => d.windows.map(w => ({ ...w, date: d.date }))).find(Boolean);
if (win) {
  const dev = [...crypto.getRandomValues(new Uint8Array(12))].map(x => x.toString(16).padStart(2, '0')).join('');
  const bk = await req('/u/' + A.handle + '/api/book', { method: 'POST', headers: { ...J, Cookie: 'lockin_dev=' + dev }, body: JSON.stringify({ date: win.date, start: win.start, end: win.end, name: 'Iso' + dev.slice(0, 6), duration: 60, activity: 'other' }) });
  ok(bk.ok, 'booking on A accepted', String(bk.status));
  const sesA = (await jget('/api/sessions', A.cookie)).body.sessions.some(s => (s.names || '').includes('Iso' + dev.slice(0, 6)));
  const sesB = (await jget('/api/sessions', B.cookie)).body.sessions.some(s => (s.names || '').includes('Iso' + dev.slice(0, 6)));
  ok(sesA && !sesB, 'booking visible to A only', 'A=' + sesA + ' B=' + sesB);
} else console.log('SKIP booking (no free window on A)');

// 5. keys
const bearer = k => ({ Authorization: 'Bearer ' + k });
ok((await req('/api/jobs', { headers: bearer(A.apiKey) })).status === 200, 'A agent key lists jobs');
const agentJobs = await (await req('/api/jobs', { headers: bearer(A.apiKey) })).json();
ok(agentJobs.count === jobsA.count, 'agent key sees exactly A rows', agentJobs.count + ' vs ' + jobsA.count);
ok((await req('/api/read/jobs', { headers: bearer(A.apiKey) })).status === 401, 'agent key on read endpoint -> 401');
ok((await req('/api/read/leetcode?key=' + A.readKey)).status === 200, 'A read key via ?key= works');
ok((await req('/api/read/leetcode', { headers: bearer(A.readKey) })).status === 200, 'A read key via Bearer works');
ok((await req('/api/jobs', { method: 'POST', headers: { ...J, ...bearer(A.readKey) }, body: '{}' })).status === 401, 'read key cannot write jobs');
ok((await req('/api/day', { headers: bearer(A.readKey) })).status === 401, 'read key cannot read /api/day');
ok((await req('/api/lc/note?name=x', { headers: bearer(A.readKey) })).status === 401, 'read key cannot read notes');
const flipped = A.readKey.slice(0, -1) + (A.readKey.endsWith('a') ? 'b' : 'a');
ok((await req('/api/read/leetcode?key=' + flipped)).status === 401, 'flipped key -> 401');
ok((await req('/api/jobs?key=' + A.apiKey)).status === 401, 'api key in URL on jobs -> 401 (query keys only on read routes)');
const readA = await (await req('/api/read/leetcode?key=' + A.readKey)).json();
ok(readA.stats && readA.rows.every(r => !namesB.includes(r.name) || namesA.includes(r.name)), 'read key rows are A rows');

// 6. ICS
const icsPath = A.ics.replace(/^https?:\/\/[^/]+/, '');
ok((await req(icsPath)).status === 200, 'ICS with token -> 200');
ok((await req(icsPath.replace(/token=.*/, 'token=nope'))).status === 403, 'ICS wrong token -> 403');
ok((await req('/u/' + A.handle + '/share')).headers.get('x-robots-tag') === 'noindex, nofollow', 'noindex on /u/ pages');

// 7. sessions
ok((await req('/api/day', { headers: { Cookie: 'lockin_sess=' + '0'.repeat(64) } })).status === 401, 'forged session cookie -> 401');
ok((await req('/u/nobody-here/share')).status === 404, 'unknown handle -> 404');

// optional 6th argument "delete": remove both accounts afterwards (for throwaway accounts on production)
if (process.argv[7] === 'delete') {
  for (const [U, pw] of [[A, pwA], [B, pwB]]) {
    const r = await req('/api/auth/delete', { method: 'POST', headers: { ...J, Cookie: U.cookie }, body: JSON.stringify({ password: pw }) });
    ok(r.ok, 'deleted ' + U.email, String(r.status));
  }
  ok((await req('/u/' + A.handle + '/share')).status === 404, 'deleted handle -> 404');
}
console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
process.exit(fails ? 1 : 0);
