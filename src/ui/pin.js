import { shell } from './theme.js';

// The friends-facing gate for a shared progress page: its own PIN, and it says whose page this is.
// Lives under /u/<handle>/share, so every call is relative to window.__U.base.
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

export const sharePinPage = (cfg, locked) => shell('LockIn · shared progress', null, `
<style>.liveclock,.refresh-fab{display:none}.wrap{padding-top:20px}</style>
<div class="bgfx" aria-hidden="true"><i></i></div>
<div class="auth">
  <a class="logo" href="/">LOCK<em>IN</em> 🔥</a>
  <div class="card" style="text-align:center">
    <span class="tile" style="width:64px;height:64px;font-size:32px;border-radius:20px">🔒</span>
    <h1 style="margin-top:16px">${esc((cfg && cfg.share && cfg.share.title) || 'Shared progress')}</h1>
    <p class="lead">A read-only look at the grind. Enter the PIN you were given.</p>
    <form id="f">
      <div class="fg"><input id="pin" type="password" inputmode="numeric" placeholder="••••" autofocus aria-label="PIN" style="text-align:center;font-size:28px;letter-spacing:12px;font-family:var(--disp);padding:16px"></div>
      <button class="pri" type="submit">View progress</button>
      <p class="ferr" id="err" role="alert" aria-live="polite">${esc(locked || '')}</p>
    </form>
    <p class="tiny">Read only. Nothing here can be changed. Five wrong tries lock it for 15 minutes.</p>
  </div>
  <p class="foot"><a href="/">Made with LockIn</a> · a grind tracker for CS students</p>
</div>
`, `<script>
const B=(window.__U&&window.__U.base)||'';
$('f').onsubmit=async e=>{e.preventDefault();
try{await api(B+'/api/share/login',{body:{pin:$('pin').value}});location.href=B+'/share';}
catch(err){$('err').textContent=err;$('pin').value='';$('pin').focus();}};
</script>`, { cfg, public: true });

// shown when there is no share PIN, so the link simply does not work
export const shareOffPage = () => shell('LockIn', null, `
<style>.liveclock,.refresh-fab{display:none}.wrap{padding-top:20px}</style>
<div class="bgfx" aria-hidden="true"><i></i></div>
<div class="auth">
  <a class="logo" href="/">LOCK<em>IN</em> 🔥</a>
  <div class="card" style="text-align:center">
    <span class="tile" style="width:64px;height:64px;font-size:32px;border-radius:20px">🔒</span>
    <h1 style="margin-top:16px">Not shared right now</h1>
    <p class="lead">The owner has turned sharing off, or has not set a PIN yet. Ask them for a fresh link.</p>
  </div>
  <p class="foot"><a href="/">Made with LockIn</a> · a grind tracker for CS students</p>
</div>
`, '', { public: true });
