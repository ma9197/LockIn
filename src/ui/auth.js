import { shell } from './theme.js';

// Sign up, sign in, forgot, reset. One card on the quiet animated background the home page uses.
// Page-script rule: no backticks, no ${ } and no quotes inside inline handlers.

const wrap = (title, inner, script) => shell(title, null, `
<style>.liveclock,.refresh-fab{display:none}.wrap{padding-top:20px}</style>
<div class="bgfx" aria-hidden="true"><i></i></div>
<div class="auth">
  <a class="logo" href="/">LOCK<em>IN</em> 🔥</a>
  ${inner}
  <p class="foot"><a href="/">What is LockIn?</a> · your own private database · open source</p>
</div>`, script, { public: true });

const err = '<p class="ferr" id="err" role="alert" aria-live="polite"></p>';
const pw = (id, label, auto, ph) => `<div class="fg"><label class="fld" for="${id}">${label}</label><div class="pwwrap"><input id="${id}" type="password" autocomplete="${auto}" placeholder="${ph || ''}"><button type="button" data-eye="${id}" aria-label="show password">Show</button></div></div>`;

// Shared page script: posts a form as JSON, shows the error, follows the "next" the server returns.
const postForm = (url, fields, checks) => `
document.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const i=$(b.dataset.eye);const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show';});
async function go(){
const b={${fields.map(f => f + ":$('" + f + "').value").join(',')}};
${checks || ''}
$('btn').disabled=true;$('btn').textContent='One moment\\u2026';$('err').textContent='';
try{const r=await fetch('${url}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const j=await r.json().catch(()=>({}));
if(!r.ok){$('err').textContent=j.error||('error '+r.status);$('btn').disabled=false;$('btn').textContent=BTN;return;}
location.href=j.next||'/';}
catch(e){$('err').textContent='Network error. Try again.';$('btn').disabled=false;$('btn').textContent=BTN;}}
const BTN=$('btn').textContent;
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));`;

// the home page moved to landing.js (interactive tour); re-exported so the worker import stays put
export { landingPage } from './landing.js';

export const signupPage = () => wrap('LockIn · Create account', `
<div class="card">
  <h1>Create your account</h1>
  <p class="lead">Email and password, nothing else. The setup wizard comes next and takes about three minutes.</p>
  <div class="fg"><label class="fld" for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus placeholder="you@school.edu"></div>
  ${pw('password', 'Password', 'new-password', '10 or more characters')}
  ${pw('password2', 'Repeat password', 'new-password', '')}
  ${err}
  <button class="pri" id="btn" onclick="go()">Create account</button>
  <p class="alt">Already have one? <a href="/login">Sign in</a></p>
</div>`, `<script>${postForm('/api/auth/signup', ['email', 'password', 'password2'], "if(b.password.length<10){$('err').textContent='Password needs 10 or more characters.';$('password').focus();return;}if(b.password!==b.password2){$('err').textContent='The two passwords do not match.';$('password2').focus();return;}")}</script>`);

export const loginPage = () => wrap('LockIn · Sign in', `
<div class="card">
  <h1>Welcome back</h1>
  <p class="lead">Sign in to pick up the grind where you left it.</p>
  <div class="fg"><label class="fld" for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus placeholder="you@school.edu"></div>
  ${pw('password', 'Password', 'current-password', '')}
  ${err}
  <button class="pri" id="btn" onclick="go()">Sign in</button>
  <p class="alt">New here? <a href="/signup">Create an account</a> · <a href="/forgot">Forgot password?</a></p>
</div>`, `<script>${postForm('/api/auth/login', ['email', 'password'])}</script>`);

export const forgotPage = () => wrap('LockIn · Forgot password', `
<div class="card">
  <h1>Forgot your password?</h1>
  <p class="lead">If the address has an account, a reset link goes there. It works for one hour.</p>
  <div class="fg"><label class="fld" for="email">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus placeholder="you@school.edu"></div>
  ${err}
  <button class="pri" id="btn" onclick="go()">Send reset link</button>
  <p class="alt"><a href="/login">Back to sign in</a></p>
</div>`, `<script>
async function go(){$('btn').disabled=true;$('err').textContent='';$('err').classList.remove('ok');
try{const r=await fetch('/api/auth/forgot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('email').value})});
if(!r.ok){$('err').textContent='error '+r.status;$('btn').disabled=false;return;}
$('err').classList.add('ok');$('err').textContent='Done. Check your inbox (and spam).';$('btn').textContent='Sent';}
catch(e){$('err').textContent='Network error. Try again.';$('btn').disabled=false;}}
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
</script>`);

export const resetPage = token => wrap('LockIn · New password', `
<div class="card">
  <h1>Set a new password</h1>
  <p class="lead">Every other signed-in device is signed out once you save.</p>
  ${pw('password', 'New password', 'new-password', '10 or more characters')}
  ${pw('password2', 'Repeat it', 'new-password', '')}
  ${err}
  <button class="pri" id="btn" onclick="go()">Save password</button>
</div>`, `<script>
const TOKEN=${JSON.stringify(String(token || '').replace(/[^0-9a-f]/g, ''))};
document.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const i=$(b.dataset.eye);const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show';});
async function go(){if($('password').value.length<10){$('err').textContent='Password needs 10 or more characters.';return;}
if($('password').value!==$('password2').value){$('err').textContent='The two passwords do not match.';return;}
$('btn').disabled=true;$('err').textContent='';
try{const r=await fetch('/api/auth/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,password:$('password').value})});
const j=await r.json().catch(()=>({}));
if(!r.ok){$('err').textContent=j.error||('error '+r.status);$('btn').disabled=false;return;}
location.href=j.next||'/';}
catch(e){$('err').textContent='Network error. Try again.';$('btn').disabled=false;}}
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
</script>`);
