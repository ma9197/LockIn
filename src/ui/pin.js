import { shell } from './theme.js';

export const pinPage = mode => shell('LockIn', null, `
<div style="max-width:340px;margin:16vh auto 0;text-align:center">
<div style="font-size:56px">🔥</div>
<div class="logo" style="font-size:32px;margin:10px 0 4px">LOCK<em>IN</em></div>
<p class="muted" style="margin:6px 0 22px">${mode === 'setup' ? 'First time here. Set your owner PIN.' : 'Enter your PIN to continue.'}</p>
<form id="f"><input id="pin" type="password" inputmode="numeric" placeholder="••••" autofocus
  style="text-align:center;font-size:26px;letter-spacing:10px;font-family:var(--disp)">
<button class="pri" style="width:100%;margin-top:12px">${mode === 'setup' ? 'Set PIN' : 'Unlock'}</button>
<p id="err" style="color:var(--rose);margin-top:12px;font-weight:700;min-height:20px"></p></form></div>
`, `<script>
$('f').onsubmit=async e=>{e.preventDefault();
try{await api('/api/pin/${mode === 'setup' ? 'setup' : 'login'}',{body:{pin:$('pin').value}});location.href='/';}
catch(err){$('err').textContent=err;$('pin').value='';$('pin').focus();}};
</script>`, { public: true });

// the friends-facing gate: same look, its own PIN, and it says whose page this is
export const sharePinPage = (title, locked) => shell('LockIn', null, `
<div style="max-width:340px;margin:14vh auto 0;text-align:center">
<div style="font-size:56px">🔥</div>
<div class="logo" style="font-size:26px;margin:10px 0 4px">${title}</div>
<p class="muted" style="margin:6px 0 22px">Enter the PIN to see the stats.</p>
<form id="f"><input id="pin" type="password" inputmode="numeric" placeholder="••••" autofocus
  style="text-align:center;font-size:26px;letter-spacing:10px;font-family:var(--disp)">
<button class="pri" style="width:100%;margin-top:12px">View</button>
<p id="err" style="color:var(--rose);margin-top:12px;font-weight:700;min-height:20px">${locked || ''}</p></form>
<p class="tiny" style="margin-top:18px">Read only. Nothing here can be changed.</p></div>
`, `<script>
$('f').onsubmit=async e=>{e.preventDefault();
try{await api('/api/share/login',{body:{pin:$('pin').value}});location.href='/share';}
catch(err){$('err').textContent=err;$('pin').value='';$('pin').focus();}};
</script>`, { public: true });

// shown when there is no share PIN, so the link simply does not work
export const shareOffPage = () => shell('LockIn', null, `
<div style="max-width:360px;margin:18vh auto 0;text-align:center">
<div style="font-size:48px">🔒</div>
<h1 style="margin-top:12px">Not available</h1>
<p class="muted" style="margin-top:8px">This page is not being shared right now.</p></div>
`, '', { public: true });
