// LockIn Overlay window. Polls GET /api/overlay/state with the paired token, draws the chip,
// ticks seconds locally, positions itself on the chosen display, hides when nothing runs.
// Runs inside Tauri with withGlobalTauri: window.__TAURI__ carries core, window, event, store, http.
(async function () {
  const T = window.__TAURI__;
  const { invoke } = T.core;
  const win = T.window.getCurrentWindow();
  const { PhysicalPosition, PhysicalSize } = T.window;
  const store = await T.store.load('settings.json', { autoSave: true });
  const $ = id => document.getElementById(id);

  const SIZES = { s: 0.8, m: 1, l: 1.25 };
  const RING = 2 * Math.PI * 10.5;
  const EDGE = 6;   // transparent margin around the chip, room for its shadow

  let token = await store.get('token') || null;
  let server = (await store.get('server')) || 'https://cslockin.com';
  let monitor = (await store.get('monitor')) ?? 0;
  let prefs = { corner: 'br', size: 'm', opacity: 70, offset: 4, timer: true };
  let state = null, lastOk = 0, doneAt = 0, pollT = null, shown = false;

  // ---- server ----
  async function poll() {
    clearTimeout(pollT);
    if (!token) { setStatus(false, 'Not paired'); hide(); pollT = setTimeout(poll, 15000); return; }
    let ok = false;
    try {
      const r = await T.http.fetch(server + '/api/overlay/state', { method: 'GET', headers: { Authorization: 'Bearer ' + token }, connectTimeout: 8000 });
      if (r.status === 401 || r.status === 403) { state = null; setStatus(false, 'Token revoked · pair again'); hide(); }
      else if (r.ok) { state = await r.json(); prefs = Object.assign(prefs, state.overlay || {}); ok = true; lastOk = Date.now(); setStatus(true, describe()); }
      else { setStatus(false, 'Server error ' + r.status); }
    } catch (e) { setStatus(false, 'Offline'); }
    if (!ok && Date.now() - lastOk > 45000) { state = null; }
    render();
    const live = state && (state.grind || activeTimer());
    pollT = setTimeout(poll, live ? 5000 : 15000);
  }
  function describe() {
    if (!state) return '';
    if (state.grind) return 'grind running';
    if (activeTimer()) return 'timer running';
    return 'idle';
  }
  let lastStatus = '';
  function setStatus(connected, detail) {
    const k = connected + '|' + detail;
    if (k === lastStatus) return;
    lastStatus = k;
    invoke('set_status', { connected, detail: detail || '' }).catch(() => {});
  }

  // ---- what is running ----
  function activeTimer() {
    const t = state && state.timer;
    if (!t || !prefs.timer) return null;
    const left = t.len * 60 - elapsedS(t);
    if (left <= -30) return null;          // 30 s after it finished it goes away
    return t;
  }
  function elapsedS(t) { const end = t.pausedAt || Date.now(); return Math.max(0, Math.round((end - t.startedAt - t.pausedMs) / 1000)); }
  // grind minutes: wall time since start_ts (server local wall time) minus paused minutes
  function grindMin(g) {
    const now = wallNow();
    const start = Date.parse(g.start_ts.replace(' ', 'T') + ':00');
    const end = g.paused_at ? Date.parse(g.paused_at.replace(' ', 'T') + ':00') : now;
    return Math.max(0, Math.floor((end - start) / 60000) - (g.paused_min || 0));
  }
  // the server sends "now" in the user's zone with every poll; keep local wall time in step with it
  let wallOffset = 0;
  function wallNow() { return Date.now() + wallOffset; }
  function syncWall() { if (state && state.now) { const srv = Date.parse(state.now + ':00'); if (!isNaN(srv)) wallOffset = srv - Date.now(); } }
  function overtime(g) {
    if (!g.planned_end) return false;
    const end = Date.parse(g.start_ts.slice(0, 10) + 'T' + g.planned_end + ':00');
    return !g.paused_at && wallNow() > end;
  }
  const fmtDur = m => m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + 'm';
  const fmtTm = s => (s < 0 ? '-' : '') + String(Math.floor(Math.abs(s) / 60)).padStart(2, '0') + ':' + String(Math.abs(s) % 60).padStart(2, '0');

  // ---- draw ----
  function render() {
    syncWall();
    const g = state && state.grind, t = activeTimer();
    if (!g && !t) { hide(); return; }
    const ov = $('ov');
    ov.classList.toggle('has-timer', !!t);
    ov.classList.toggle('timer-only', !g && !!t);
    ov.classList.toggle('paused', !!(g && g.paused_at));
    ov.classList.toggle('over', !!(g && overtime(g)));
    if (g) {
      $('gTime').textContent = fmtDur(grindMin(g));
      $('gLabel').textContent = g.paused_at ? '⏸ Paused' : (overtime(g) ? 'Overtime' : (g.label || 'Grinding'));
      const c = (g.task && g.task.color) || '#FF6B35';
      $('gTask').innerHTML = '<em>' + (g.task && g.task.emoji || '🔥') + '</em> ' + esc(g.task && g.task.name || 'Grind');
      $('gTask').style.background = c + '22'; $('gTask').style.color = c;
    }
    if (t) {
      const total = t.len * 60, left = total - elapsedS(t), tm = $('tmr');
      tm.classList.toggle('tpaused', !!t.pausedAt); tm.classList.toggle('tover', left < 0); tm.classList.toggle('tdone', left <= 0 && left > -30);
      $('tv').textContent = left <= 0 && left > -30 ? 'Done' : fmtTm(left);
      $('ts').textContent = t.pausedAt ? 'Paused' : left <= 0 ? 'Timer done' : 'Focus · ' + t.len + ' min';
      const frac = Math.max(0, Math.min(1, left / total));
      tm.querySelector('circle.p').style.strokeDashoffset = String(RING * (1 - frac));
      tm.querySelector('circle.p').style.stroke = left <= 0 ? '#3DDC97' : '#FF6B35';
    }
    applyPrefs();
    show();
  }
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // ---- placement ----
  let lastKey = '';
  async function applyPrefs() {
    const sc = SIZES[prefs.size] || 1;
    document.documentElement.style.setProperty('--sc', sc);
    document.documentElement.style.setProperty('--op', String((prefs.opacity || 70) / 100));
    // the window is exactly the chip plus the body padding, so the chip really sits at the edge
    const r = $('ov').getBoundingClientRect();
    const w = Math.ceil(r.width) + 2 * EDGE, h = Math.ceil(r.height) + 2 * EDGE;
    if (!(w > 0 && h > 0)) return;
    const key = [w, h, prefs.corner, prefs.offset, monitor].join('|');
    if (key === lastKey) return;
    lastKey = key;
    let mons = [];
    try { mons = await invoke('monitors'); } catch (e) {}
    const m = mons[monitor] || mons[0];
    // work in physical pixels of the target display (the window may sit on a display with another DPI),
    // inside its work area so the taskbar or dock never covers the chip
    const scale = (m && m.scale) || 1;
    const pw = Math.round(w * scale), ph = Math.round(h * scale);
    await win.setSize(new PhysicalSize(pw, ph));
    if (!m) return;
    const off = Math.round((prefs.offset || 0) * scale);
    const ax = m.wx ?? m.x, ay = m.wy ?? m.y, aw = m.ww || m.width, ah = m.wh || m.height;
    const x = prefs.corner.endsWith('l') ? ax + off : ax + aw - pw - off;
    const y = prefs.corner.startsWith('t') ? ay + off : ay + ah - ph - off;
    await win.setPosition(new PhysicalPosition(x, y));
    // the size is re-applied after the move: the first call used the old display's DPI
    await win.setSize(new PhysicalSize(pw, ph));
  }
  async function show() { document.body.classList.remove('hidden'); if (!shown) { shown = true; await win.show(); await win.setAlwaysOnTop(true); await win.setIgnoreCursorEvents(true); } }
  async function hide() { document.body.classList.add('hidden'); if (shown) { shown = false; await win.hide(); } }

  // ---- events from the tray / pairing window ----
  await T.event.listen('monitor', async e => { monitor = +e.payload || 0; await store.set('monitor', monitor); lastKey = ''; render(); });
  await T.event.listen('paired', async () => { token = await store.get('token'); server = (await store.get('server')) || server; lastStatus = ''; poll(); });
  await T.event.listen('unpair', async () => { token = null; await store.delete('token'); state = null; hide(); setStatus(false, 'Not paired'); });

  // ---- updater: once at launch, then daily; silent unless a build is ready ----
  async function checkUpdate() {
    try {
      const u = await T.updater.check();
      if (u) { await u.downloadAndInstall(); await T.process.relaunch(); }
    } catch (e) { /* offline or no updater key in dev: ignore */ }
  }

  if (!token) invoke('open_pair');
  setInterval(render, 1000);
  poll();
  setTimeout(checkUpdate, 20000);
  setInterval(checkUpdate, 24 * 3600 * 1000);
})();
