import { shell } from './theme.js';

const wrap = (title, inner, script) => shell(title, null, `
<div style="max-width:420px;margin:8vh auto 0;padding:0 4px">
  <div class="logo" style="font-size:30px;margin-bottom:18px">LOCK<em>IN</em> 🔥</div>
  ${inner}
</div>`, script, { public: true });

const err = '<p class="tiny" id="err" style="color:var(--rose);min-height:16px;margin:8px 0 0"></p>';

// Shared page script: posts a form as JSON, shows the error, follows the "next" the server returns.
const postForm = (url, fields) => `
async function go(){
const b={${fields.map(f => f + ":$('" + f + "').value").join(',')}};
$('btn').disabled=true;$('err').textContent='';
try{const r=await fetch('${url}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const j=await r.json().catch(()=>({}));
if(!r.ok){$('err').textContent=j.error||('error '+r.status);$('btn').disabled=false;return;}
location.href=j.next||'/';}
catch(e){$('err').textContent='network error, try again';$('btn').disabled=false;}}
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));`;

export const landingPage = () => wrap('LockIn', `
<div class="card">
  <h1 style="font-size:24px;margin:0 0 6px">Lock in. Track the grind.</h1>
  <p class="muted">Daily goals, focus timer, LeetCode log with notes, application tracker, schedule blocks, streaks and progress charts. Built for CS students on the job hunt, phone first.</p>
  <div class="row" style="margin-top:16px;gap:10px">
    <a href="/signup" class="pri" style="flex:1;text-align:center;padding:12px;border-radius:12px;font-weight:800">Create account</a>
    <a href="/login" class="ghost" style="flex:1;text-align:center;padding:12px;border-radius:12px;font-weight:800">Sign in</a>
  </div>
</div>
<p class="tiny" style="text-align:center;margin-top:18px">Your data lives in your own private database. Nobody else can read it, including other users.</p>`, '');

export const signupPage = () => wrap('LockIn · Create account', `
<div class="card">
  <h1 style="font-size:22px;margin:0 0 4px">Create your account</h1>
  <p class="tiny">Takes a minute. The setup wizard comes next.</p>
  <label class="fld">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus>
  <label class="fld">Password <span class="tiny">(10+ characters)</span></label><input id="password" type="password" autocomplete="new-password">
  <label class="fld">Repeat password</label><input id="password2" type="password" autocomplete="new-password">
  ${err}
  <button class="pri" id="btn" style="width:100%;margin-top:14px" onclick="go()">Create account</button>
  <p class="tiny" style="text-align:center;margin-top:14px">Already have one? <a href="/login">Sign in</a></p>
</div>`, `<script>${postForm('/api/auth/signup', ['email', 'password', 'password2'])}</script>`);

export const loginPage = () => wrap('LockIn · Sign in', `
<div class="card">
  <h1 style="font-size:22px;margin:0 0 4px">Sign in</h1>
  <label class="fld">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus>
  <label class="fld">Password</label><input id="password" type="password" autocomplete="current-password">
  ${err}
  <button class="pri" id="btn" style="width:100%;margin-top:14px" onclick="go()">Sign in</button>
  <p class="tiny" style="text-align:center;margin-top:14px">New here? <a href="/signup">Create an account</a> · <a href="/forgot">Forgot password?</a></p>
</div>`, `<script>${postForm('/api/auth/login', ['email', 'password'])}</script>`);

export const forgotPage = () => wrap('LockIn · Forgot password', `
<div class="card">
  <h1 style="font-size:22px;margin:0 0 4px">Forgot your password?</h1>
  <p class="tiny">If the address has an account, a reset link goes there. It works for one hour.</p>
  <label class="fld">Email</label><input id="email" type="email" autocomplete="email" inputmode="email" autofocus>
  ${err}
  <button class="pri" id="btn" style="width:100%;margin-top:14px" onclick="go()">Send reset link</button>
  <p class="tiny" style="text-align:center;margin-top:14px"><a href="/login">Back to sign in</a></p>
</div>`, `<script>
async function go(){$('btn').disabled=true;$('err').textContent='';
try{const r=await fetch('/api/auth/forgot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('email').value})});
if(!r.ok){$('err').textContent='error '+r.status;$('btn').disabled=false;return;}
$('err').style.color='var(--mint)';$('err').textContent='Done. Check your inbox (and spam).';}
catch(e){$('err').textContent='network error, try again';$('btn').disabled=false;}}
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
</script>`);

export const resetPage = token => wrap('LockIn · New password', `
<div class="card">
  <h1 style="font-size:22px;margin:0 0 4px">Set a new password</h1>
  <label class="fld">New password <span class="tiny">(10+ characters)</span></label><input id="password" type="password" autocomplete="new-password" autofocus>
  <label class="fld">Repeat it</label><input id="password2" type="password" autocomplete="new-password">
  ${err}
  <button class="pri" id="btn" style="width:100%;margin-top:14px" onclick="go()">Save password</button>
</div>`, `<script>
const TOKEN=${JSON.stringify(String(token || '').replace(/[^0-9a-f]/g, ''))};
async function go(){if($('password').value!==$('password2').value){$('err').textContent='the two passwords do not match';return;}
$('btn').disabled=true;$('err').textContent='';
try{const r=await fetch('/api/auth/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,password:$('password').value})});
const j=await r.json().catch(()=>({}));
if(!r.ok){$('err').textContent=j.error||('error '+r.status);$('btn').disabled=false;return;}
location.href=j.next||'/';}
catch(e){$('err').textContent='network error, try again';$('btn').disabled=false;}}
document.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
</script>`);
