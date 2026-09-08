// helpers: hashing, per-user config, time zones, schedule blocks, ICS generation.
// Everything here runs inside a user's Durable Object against that user's own database.

export async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
// share PIN only (account passwords are PBKDF2 in auth.js)
export const pinHash = pin => sha256hex('lockin:' + pin);

// Constant-time secret compare: hash both sides, walk all 64 hex chars, no early exit.
export async function keyEq(a, b) {
  if (!a || !b) return false;
  const [x, y] = await Promise.all([sha256hex('k:' + a), sha256hex('k:' + b)]);
  let d = 0;
  for (let i = 0; i < 64; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

// One spelling per problem: collapse whitespace runs, then snap to the name already on record.
export const normName = raw => String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 120);
export async function canonName(db, raw) {
  const name = normName(raw);
  if (!name) return { name: '', key: '', matched: false };
  const ex = await db.prepare("SELECT TRIM(name) name FROM lc_solves WHERE LOWER(TRIM(name))=? ORDER BY id LIMIT 1")
    .bind(name.toLowerCase()).first();
  if (ex && ex.name) return { name: ex.name, key: ex.name.toLowerCase(), matched: true };
  const nt = await db.prepare("SELECT name FROM lc_notes WHERE name_key=?").bind(name.toLowerCase()).first();
  if (nt && nt.name) return { name: nt.name, key: name.toLowerCase(), matched: true };
  return { name, key: name.toLowerCase(), matched: false };
}

export async function setSetting(db, key, value) {
  await db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, value).run();
}

export function isAuthed(c, token, cookieName) {
  const cookie = c.req.header('Cookie') || '';
  const m = cookie.match(new RegExp(cookieName + '=([a-f0-9]{64})'));
  return !!(m && token && m[1] === token);
}
// the share cookie is derived from the share PIN hash, so changing or clearing
// that PIN signs every friend out with no extra bookkeeping
// salted with the user id, so two users with the same PIN never share a cookie value
export const shareToken = async (userId, sharePinHash) => sha256hex('share:' + userId + ':' + sharePinHash);

// ---------- time zones ----------
// Every date in the app is the USER's local wall time, YYYY-MM-DD / YYYY-MM-DDTHH:MM, no zone.
// These three are the only places the zone is applied.
export const validTz = tz => { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; } };
export const todayIn = tz => new Date().toLocaleDateString('en-CA', { timeZone: tz || 'UTC' });
export const nowIn = tz => new Date().toLocaleString('sv-SE', { timeZone: tz || 'UTC' }).replace(' ', 'T').slice(0, 16);

// epoch ms of a wall time in a zone. Two passes so a DST boundary between the guess and the
// answer is corrected. Works for any IANA zone and any year, no hand-written rules.
export function localEpoch(tz, ds, hm) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz || 'UTC', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const aheadBy = t => {
    const g = {}; for (const p of fmt.formatToParts(new Date(t))) g[p.type] = p.value;
    return Date.UTC(+g.year, +g.month - 1, +g.day, +g.hour % 24, +g.minute, +g.second) - t;
  };
  const guess = Date.parse(ds + 'T' + hm + ':00Z');
  let t = guess - aheadBy(guess);
  t = guess - aheadBy(t);
  return t;
}
export const tzAbbr = (tz, at = new Date()) => {
  try { return new Intl.DateTimeFormat('en-US', { timeZone: tz || 'UTC', timeZoneName: 'short' }).formatToParts(at).find(p => p.type === 'timeZoneName').value; }
  catch (e) { return tz || 'UTC'; }
};

// ---------- config: one read per request ----------
const isHM = v => /^\d{2}:\d{2}$/.test(v || '');
const cleanBlocks = v => Array.isArray(v) ? v.filter(g => Array.isArray(g) && isHM(g[0]) && isHM(g[1])).slice(0, 4) : [];

// sched = { layouts: { morning: [[s,e],...], night: [...], ... }, default: 'morning', byDow: {0:'sunday'}, low: 'low' }
// A layout is a named list of up to 4 grind blocks. The user switches the default from Today
// ("night mode from tomorrow"), can pin a layout to a weekday, and low-load phases use `low`.
export function normSched(raw) {
  const layouts = {};
  if (raw && raw.layouts && typeof raw.layouts === 'object') {
    for (const [k, v] of Object.entries(raw.layouts)) {
      const key = String(k).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
      if (key) layouts[key] = cleanBlocks(v);
    }
  }
  const names = Object.keys(layouts);
  const def = raw && layouts[raw.default] ? raw.default : (names[0] || null);
  const byDow = {};
  if (raw && raw.byDow && typeof raw.byDow === 'object')
    for (const [d, name] of Object.entries(raw.byDow)) if (/^[0-6]$/.test(d) && layouts[name]) byDow[d] = name;
  const low = raw && layouts[raw.low] ? raw.low : (layouts.low ? 'low' : def);
  return { layouts, default: def, byDow, low };
}

export const SIDE_EMOJI = ['🏋️', '🎓', '💼', '🏃', '🎾', '⚽', '🏊', '🧘', '🚌', '🍽️', '👨‍👩‍👧', '🎮', '📌'];
const DEFAULT_PLATFORMS = ['LinkedIn', 'Indeed', 'Company site', 'Referral', 'Other'];

export async function loadCfg(db) {
  const rows = (await db.prepare('SELECT key,value FROM settings').all()).results;
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  const j = (key, fallback) => { try { return key in s ? JSON.parse(s[key]) : fallback; } catch (e) { return fallback; } };

  const phases = (await db.prepare('SELECT * FROM phases ORDER BY start_date, id').all()).results;
  const plan = phases.length ? { start: phases.reduce((a, p) => a < p.start_date ? a : p.start_date, phases[0].start_date),
    end: phases.reduce((a, p) => a > p.end_date ? a : p.end_date, phases[0].end_date) } : null;
  const categories = (await db.prepare('SELECT * FROM categories WHERE enabled=1 ORDER BY sort, id').all()).results;
  const allCategories = (await db.prepare('SELECT * FROM categories ORDER BY sort, id').all()).results;
  const sideTasks = (await db.prepare('SELECT * FROM side_tasks WHERE enabled=1 ORDER BY sort, id').all()).results;
  const builtin = name => { const c = categories.find(x => x.builtin === name); return c ? c.key : null; };

  const modules = { leetcode: true, jobs: true, copy: true, friends: false, clock: true, ...(j('modules', {}) || {}) };
  if (!builtin('leetcode')) modules.leetcode = false;
  const sched = normSched(j('sched', null));

  return {
    tz: validTz(s.timezone) ? s.timezone : 'UTC',
    clock24: s.clock_24h === '1',
    plan, phases,
    categories, allCategories,
    catKeys: categories.map(c => c.key),
    builtins: { leetcode: builtin('leetcode'), applications: builtin('applications') },
    sideTasks,
    modules,
    sched,
    baseMode: sched.default,                       // the layout Today uses unless a weekday or a low-load phase overrides it
    blockBudgets: j('block_budgets', {}) || {},    // { g1: [{t,m}], ... } minutes per category inside a grind block
    grindTarget: Math.min(16, Math.max(1, parseFloat(s.grind_target_hours || '6') || 6)),
    availability: cleanBlocks(j('availability', [])),
    bookingEnabled: s.booking_enabled === '1',
    bookingDays: Math.min(14, Math.max(1, parseInt(s.booking_days || '6', 10) || 6)),
    bookingPerDevice: Math.min(10, Math.max(1, parseInt(s.booking_per_device_day || '2', 10) || 2)),
    bookingPerSlot: Math.min(20, Math.max(1, parseInt(s.booking_per_slot || '4', 10) || 4)),
    bookingDurations: (j('booking_durations', null) || [30, 60, 120, 180]).map(Number).filter(n => n >= 15 && n <= 480).slice(0, 8),
    timerDefault: parseInt(s.timer_default || '25', 10) || 25,
    timerOptions: (j('timer_options', null) || [10, 15, 20, 25, 50]).map(Number).filter(n => n >= 1 && n <= 180).slice(0, 8),
    streakCategory: s.streak_category || builtin('leetcode') || (categories[0] && categories[0].key) || null,
    icsToken: s.ics_token || null,
    apiKey: s.api_key || null,
    readKey: s.read_key || null,
    clock: {
      design: ['ember', 'neon', 'mono', 'sunset', 'terminal'].includes(s.clock_design) ? s.clock_design : 'ember',
      size: Math.min(920, Math.max(280, parseInt(s.clock_size || '360', 10) || 360)),
      font: Math.min(18, Math.max(9, parseInt(s.clock_font || '12', 10) || 12)),
      accent: /^#[0-9a-fA-F]{6}$/.test(s.clock_accent || '') ? s.clock_accent : '',
    },
    mclock: {
      design: ['pill', 'led', 'analog', 'flip', 'ring'].includes(s.mclock_design) ? s.mclock_design : 'pill',
      font: Math.min(22, Math.max(10, parseInt(s.mclock_font || '13', 10) || 13)),
      accent: /^#[0-9a-fA-F]{6}$/.test(s.mclock_accent || '') ? s.mclock_accent : '',
    },
    todayLayout: s.today_layout === 'refined' ? 'refined' : 'classic',
    bgStyle: ['aurora', 'dots', 'plain'].includes(s.bg_style) ? s.bg_style : 'aurora',
    jobPlatforms: (() => {
      const a = j('job_platforms', null);
      return Array.isArray(a) && a.length ? a.map(String).slice(0, 20) : DEFAULT_PLATFORMS;
    })(),
    // read-only Progress sharing: no PIN set means the feature is off
    share: {
      pinHash: s.share_pin_hash || '',
      title: (s.share_title || 'My grind').slice(0, 60),
      overview: s.share_overview !== '0',
      lc: s.share_lc !== '0',
      grind: s.share_grind !== '0',
      jobs: s.share_jobs !== '0',
      lcNames: s.share_lcnames !== '0',
      friends: s.share_friends === '1',
      offReasons: s.share_offreasons === '1',
    },
  };
}

// ---------- schedule ----------
export const isLowLoad = (cfg, ds) => cfg.phases.some(p => p.low_load && p.start_date <= ds && ds <= p.end_date);

// Which layout a date uses: a low-load phase wins, then a weekday pin, then the default.
// Returns the layout name; async only to keep the old call shape.
export async function modeForDate(db, ds, cfg) {
  const day = new Date(ds + 'T12:00:00Z').getUTCDay();
  if (isLowLoad(cfg, ds) && cfg.sched.low) return cfg.sched.low;
  return cfg.sched.byDow[day] || cfg.sched.default;
}

const hm2m = v => { const [a, b] = v.split(':').map(Number); return a * 60 + b; };
const m2hm = m => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

// [{id,start,end,endNextDay?,label,kind,emoji?}] kind: grind | side | free
// id is stable (g1..g4, st:<side task id>) and is what block_moves keys on; label is display only.
export function blocksFor(ds, layoutName, cfg) {
  const day = new Date(ds + 'T12:00:00Z').getUTCDay();
  const blocks = [];
  const solids = []; // [start,end] in minutes, for carving the free windows
  const side = cfg.sideTasks.filter(t => String(t.days).split(',').map(Number).includes(day)
    && (!t.date_from || ds >= t.date_from) && (!t.date_to || ds <= t.date_to));
  for (const t of side) {
    blocks.push({ id: 'st:' + t.id, start: t.start, end: t.end, endNextDay: t.end < t.start, label: t.name, kind: 'side', emoji: t.emoji });
    solids.push([hm2m(t.start), hm2m(t.end) + (t.end < t.start ? 1440 : 0)]);
  }
  const list = (cfg.sched.layouts[layoutName] || cfg.sched.layouts[cfg.sched.default] || []);
  list.forEach((g, idx) => {
    let start = g[0], end = g[1];
    const s = hm2m(start), e0 = hm2m(end) + (end < start ? 1440 : 0);
    let e = e0;
    // a grind block that runs into a side task stops when the side task starts
    for (const [ss, se] of solids) if (ss > s && ss < e && se > s) e = ss;
    if (e - s < 15) return;
    blocks.push({ id: 'g' + (idx + 1), start, end: m2hm(e), endNextDay: e > 1440, label: 'Grind block ' + (idx + 1), kind: 'grind' });
    solids.push([s, e]);
  });
  if (cfg.bookingEnabled) {
    let frees = cfg.availability.map(([a, b]) => [hm2m(a), hm2m(b) + (b < a ? 1440 : 0)]);
    for (const [gs, ge] of solids) {
      frees = frees.flatMap(([fs, fe]) => {
        if (ge <= fs || gs >= fe) return [[fs, fe]];
        const parts = [];
        if (gs > fs) parts.push([fs, gs]);
        if (ge < fe) parts.push([ge, fe]);
        return parts;
      });
    }
    frees.forEach(([fs, fe], i) => { if (fe - fs >= 30) blocks.push({ id: 'f' + (i + 1), start: m2hm(fs), end: m2hm(fe), endNextDay: fe > 1440, label: 'Free · bookable', kind: 'free' }); });
  }
  return blocks.sort((a, b) => hm2m(a.start) - hm2m(b.start));
}

// moves: { blockId: 'HH:MM' }: shift the block, push overlapping solid blocks, trim frees
export function applyMoves(blocks, moves) {
  if (!moves || !Object.keys(moves).length) return blocks;
  const bs = blocks.map(b => {
    const s = hm2m(b.start);
    const e = hm2m(b.end) + ((b.endNextDay || hm2m(b.end) < s) ? 1440 : 0);
    return { ...b, _s: s, _e: e };
  });
  for (const b of bs) {
    if (moves[b.id]) {
      const d = b._e - b._s;
      b._s = hm2m(moves[b.id]); b._e = b._s + d; b.moved = true;
    }
  }
  const solids = bs.filter(b => b.kind !== 'free').sort((a, b) => a._s - b._s);
  for (let i = 1; i < solids.length; i++) {
    if (solids[i]._s < solids[i - 1]._e) {
      const d = solids[i]._e - solids[i]._s;
      solids[i]._s = solids[i - 1]._e; solids[i]._e = solids[i]._s + d;
      if (!solids[i].moved) solids[i].moved = 'bumped';
    }
  }
  for (const f of bs.filter(b => b.kind === 'free')) {
    for (const s of solids) {
      if (s._s < f._e && s._e > f._s) {
        if (s._s > f._s) f._e = Math.min(f._e, s._s);
        else f._s = Math.max(f._s, s._e);
      }
    }
    if (f._e - f._s < 15) f.gone = true;
  }
  return bs.filter(b => !b.gone).sort((a, b) => a._s - b._s)
    .map(b => ({ id: b.id, start: m2hm(b._s), end: m2hm(b._e), endNextDay: b._e > 1440, label: b.label, kind: b.kind, emoji: b.emoji, moved: b.moved || undefined }));
}

export async function movesFor(db, ds) {
  const r = (await db.prepare('SELECT label,start FROM block_moves WHERE date=?').bind(ds).all()).results;
  const m = {};
  for (const x of r) m[x.label] = x.start;
  return m;
}

export async function dayBlocks(db, ds, layoutName, cfg) {
  return applyMoves(blocksFor(ds, layoutName, cfg), await movesFor(db, ds));
}

export function bookableWindows(blocks, layoutName, cfg) {
  if (!cfg.bookingEnabled) return [];
  return blocks.filter(b => b.kind === 'free');
}

// ---------- ICS ----------
// Every timed event is written in UTC (computed from the user's zone), so no VTIMEZONE rules.
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const utcStamp = ms => new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
export const nextDay = ds => {
  const d = new Date(ds + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
export const shiftDays = (ds, n) => { const d = new Date(ds + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export async function buildICS(db, cfg) {
  const tz = cfg.tz, host = (cfg.user && cfg.user.handle ? cfg.user.handle + '.' : '') + 'cslockin.com';
  const stamp = utcStamp(Date.now());
  const ev = [];
  const V = (uid, dtstart, dtend, summary, desc = '', allDay = false) => {
    ev.push(['BEGIN:VEVENT', `UID:${uid}@${host}`,
      allDay ? `DTSTART;VALUE=DATE:${dtstart}` : `DTSTART:${dtstart}`,
      allDay ? `DTEND;VALUE=DATE:${dtend}` : `DTEND:${dtend}`,
      `DTSTAMP:${stamp}`, `SUMMARY:${icsEsc(summary)}`,
      desc ? `DESCRIPTION:${icsEsc(desc)}` : null, 'END:VEVENT'].filter(Boolean).join('\r\n'));
  };
  const T = (ds, hm) => utcStamp(localEpoch(tz, ds, hm));
  for (const p of cfg.phases)
    V(`phase-${p.id}`, p.start_date.replace(/-/g, ''), nextDay(p.end_date).replace(/-/g, ''), `LockIn: ${p.name}`, '', true);

  const movesByDate = {};
  for (const m of (await db.prepare('SELECT * FROM block_moves').all()).results)
    (movesByDate[m.date] = movesByDate[m.date] || {})[m.label] = m.start;
  const today = todayIn(tz);
  const start = cfg.plan ? cfg.plan.start : shiftDays(today, -30);
  const end = cfg.plan ? cfg.plan.end : shiftDays(today, 90);
  for (let ds = start; ds <= end; ds = nextDay(ds)) {
    const layout = await modeForDate(db, ds, cfg);
    for (const b of applyMoves(blocksFor(ds, layout, cfg), movesByDate[ds])) {
      if (b.kind === 'free') continue;
      const endDs = b.endNextDay ? nextDay(ds) : ds;
      V(`blk-${ds}-${b.id}`, T(ds, b.start), T(endDs, b.end), `LockIn: ${b.emoji ? b.emoji + ' ' : ''}${b.label}`);
    }
  }
  // pinned tasks (the ones that do not slide) show up as all-day events
  const pinned = (await db.prepare('SELECT * FROM tasks WHERE shiftable=0 ORDER BY date').all()).results;
  for (const t of pinned) V(`task-${t.id}`, t.date.replace(/-/g, ''), nextDay(t.date).replace(/-/g, ''), `LockIn: ${t.title}`, t.detail, true);
  if (cfg.modules.friends) {
    const ses = (await db.prepare("SELECT s.*, GROUP_CONCAT(f.friend_name, ', ') AS names FROM sessions s LEFT JOIN session_friends f ON f.session_id=s.id WHERE s.status IN ('confirmed','done') GROUP BY s.id").all()).results;
    for (const s of ses)
      V(`ses-${s.id}`, T(s.start_ts.slice(0, 10), s.start_ts.slice(11, 16)), T(s.end_ts.slice(0, 10), s.end_ts.slice(11, 16)), `LockIn: ${s.activity}${s.names ? ' with ' + s.names : ''}`, s.note || '');
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LockIn//EN', 'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:LockIn', `X-WR-TIMEZONE:${tz}`, ...ev, 'END:VCALENDAR'].join('\r\n');
}
