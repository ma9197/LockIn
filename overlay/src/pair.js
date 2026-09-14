// Pairing window: exchange the 6-character code from Settings for the overlay token.
(async function () {
  const T = window.__TAURI__;
  const store = await T.store.load('settings.json', { autoSave: true });
  const $ = id => document.getElementById(id);
  $('server').value = (await store.get('server')) || 'https://cslockin.com';
  $('code').focus();
  $('code').addEventListener('input', () => { $('code').value = $('code').value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); });
  $('code').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('go').addEventListener('click', go);

  async function go() {
    const code = $('code').value.trim();
    const server = ($('server').value.trim() || 'https://cslockin.com').replace(/\/+$/, '');
    if (code.length !== 6) { $('err').textContent = 'The code has six characters.'; return; }
    $('go').disabled = true; $('err').textContent = ''; $('err').className = 'err';
    try {
      const r = await T.http.fetch(server + '/api/overlay/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }), connectTimeout: 10000 });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) throw new Error(j.error || ('error ' + r.status));
      await store.set('server', server);
      await store.set('token', j.token);
      await store.save();
      $('err').className = 'err ok'; $('err').textContent = 'Paired. The overlay appears when a grind or timer runs. You can close this window.';
      await T.event.emit('paired', {});
      setTimeout(() => T.window.getCurrentWindow().close(), 1600);
    } catch (e) {
      $('err').textContent = String(e.message || e).replace(/^Error:\s*/, '');
      $('go').disabled = false;
    }
  }
})();
