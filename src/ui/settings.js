import { shell } from './theme.js';

// Settings. Every personal thing the single-user app had welded in is an editor here.
// Page-script rules: no backticks, no ${ }, quotes inside onclick strings are written as \\'.

const tog = (id, label, sub) => `<div class="row" style="margin-top:10px"><div class="grow"><b>${label}</b><div class="tiny">${sub}</div></div><div class="toggle" id="${id}" role="switch" tabindex="0"></div></div>`;

export const settingsPage = (cfg) => shell('LockIn · Settings', '/settings', `
<style>
.ed{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px}
.ed .row{gap:8px;flex-wrap:wrap}
.ed input,.ed select{padding:8px 10px;font-size:14px}
.ed input.nm{flex:1;min-width:130px}
.ed input.hm{width:118px}
.ed input.dt{width:auto}
.ed input.g{width:64px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chips button{padding:6px 10px;font-size:12px}
.chips button.on{background:var(--ember);color:#0B0E14;border-color:var(--ember)}
.sw{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.sw button{width:28px;height:28px;border-radius:8px;border:2px solid transparent;padding:0}
.sw button.on{border-color:#fff}
.em{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}
.em button{width:34px;height:34px;font-size:17px;padding:0;border-radius:9px}
.em button.on{background:var(--surface3);border-color:var(--ember)}
.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.gl label{font:700 10px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px}
.gl input{width:100%;padding:8px}
.dim{opacity:.55}
.hint{font-size:12px;color:var(--ink3);margin-top:6px;line-height:1.45}
.danger{border-color:#FF5D7355}
</style>
<h1>Settings</h1>

<h2>Time</h2>
<div class="card">
  <label class="fld" style="margin-top:0">Time zone</label>
  <select id="s-tz"></select>
  <label class="fld">Clock</label>
  <div class="seg-ctl" id="clkSeg"><button data-c="0">12-hour</button><button data-c="1">24-hour</button></div>
  <button class="pri" style="margin-top:12px" onclick="saveTime()">Save</button>
  <div class="hint">Every day, streak and deadline is counted in this zone.</div>
</div>

<h2>Plan</h2>
<div class="card">
  <p class="muted">Phases with dates. The first start and the last end are your plan window. <b>Low load</b> phases drop goals and use the low-load layout.</p>
  <div id="phases"></div>
  <div class="row" style="margin-top:10px;flex-wrap:wrap">
    <button class="sm" onclick="addPhase()">＋ Add phase</button>
    <span class="grow"></span>
    <button class="sm" onclick="regen()">↻ Regenerate daily goals</button>
  </div>
  <div class="hint">Regenerate rewrites the goal of every future day in the plan from the category values below. Days you already logged work on are never touched.</div>
</div>

<h2>Categories</h2>
<div class="card">
  <p class="muted">What you grind, with a daily goal for weekdays, weekends and low-load days. LeetCode and Applications carry extra tools and cannot be renamed.</p>
  <div id="cats"></div>
  <button class="sm" style="margin-top:10px" onclick="addCat()">＋ Add category</button>
  <div class="hint">Turning a category off hides it. History is kept, so it can come back any time.</div>
</div>

<h2>Grind layouts</h2>
<div class="card">
  <p class="muted">A layout is up to four grind blocks. The Today page switches between layouts; one is the default.</p>
  <div id="layouts"></div>
  <div class="row" style="margin-top:10px;flex-wrap:wrap">
    <input id="layNew" placeholder="New layout name, e.g. weekend" style="flex:1;min-width:160px">
    <button class="sm" onclick="addLayout()">＋ Add layout</button>
  </div>
  <label class="fld">Weekday overrides</label>
  <div id="byDow" class="row" style="flex-wrap:wrap;gap:6px"></div>
  <label class="fld">Low-load days use</label>
  <select id="lowSel" style="width:auto"></select>
  <button class="pri" style="margin-top:12px" onclick="saveLayouts()">Save layouts</button>
</div>

<h2>Side tasks</h2>
<div class="card">
  <p class="muted">Recurring blocks that are not grind: gym, a class, a shift. Grind blocks step out of their way.</p>
  <div id="sides"></div>
  <button class="sm" style="margin-top:10px" onclick="addSide()">＋ Add side task</button>
</div>

<h2>Modules</h2>
<div class="card">
  <div id="modToggles"></div>
  <label class="fld" style="margin-top:14px">Daily grind target (hours)</label>
  <input id="s-target" type="number" min="1" max="16" step="0.5" style="width:120px">
  <button class="pri" style="margin-top:12px" onclick="saveModules()">Save</button>
</div>

<h2>Today page layout</h2>
<div class="card">
  <div class="seg-ctl" id="layoutSeg">
    <button data-l="classic">Classic</button>
    <button data-l="refined">Refined</button>
  </div>
  <p class="tiny" style="margin-top:10px">Refined puts the date, phase, mode and off-day controls in one bordered header card.</p>
</div>

<h2>Booking</h2>
<div class="card">
  <div class="row">
    <div class="grow"><b>Friends can book</b><div class="tiny">Your public booking page.</div></div>
    <div class="toggle" id="bookT" role="switch" tabindex="0"></div>
  </div>
  <label class="fld" style="margin-top:14px">Bookable windows</label>
  <div id="avail"></div>
  <button class="sm" style="margin-top:6px" onclick="addAvail()">＋ Add window</button>
  <div class="hint">Whatever is left of these windows after grind and side tasks is what friends can book.</div>
  <label class="fld">Days visible ahead: <span id="bdVal" class="num" style="color:var(--ember)"></span></label>
  <input id="s-bdays" type="range" min="1" max="14" step="1" style="accent-color:var(--ember)">
  <div class="fgrid" style="margin-top:10px">
    <div><label class="fld">Requests per phone per day</label><input id="s-bdev" type="number" min="1" max="10"></div>
    <div><label class="fld">People per slot</label><input id="s-bslot" type="number" min="1" max="20"></div>
  </div>
  <label class="fld">Session lengths (minutes, comma separated)</label>
  <input id="s-bdur" placeholder="30, 60, 120, 180">
  <button class="pri" style="margin-top:12px" onclick="saveBooking()">Save booking</button>
</div>

<h2>Timer</h2>
<div class="card">
  <div class="fgrid">
    <div><label class="fld" style="margin-top:0">Default length (min)</label><input id="s-timer" type="number" min="5" max="120"></div>
    <div><label class="fld" style="margin-top:0">Choices on the timer</label><input id="s-topts" placeholder="10, 15, 20, 25, 50"></div>
  </div>
  <button class="pri" style="margin-top:12px" onclick="saveTimer()">Save timer</button>
</div>

<h2>Day clock</h2>
<div class="card">
  <label class="fld" style="margin-top:0">Design</label>
  <div class="row" id="ckDesigns" style="flex-wrap:wrap;gap:10px"></div>
  <label class="fld" style="margin-top:16px">Size: <span id="ckSizeVal" class="num" style="color:var(--ember)"></span>px</label>
  <input id="ck-size" type="range" min="280" max="920" step="20" style="accent-color:var(--ember)">
  <label class="fld">Number size: <span id="ckFontVal" class="num" style="color:var(--ember)"></span></label>
  <input id="ck-font" type="range" min="9" max="18" step="1" style="accent-color:var(--ember)">
  <label class="fld">Grind color override</label>
  <div class="row">
    <input id="ck-accent" type="color" style="width:56px;height:40px;padding:3px">
    <button class="sm" onclick="saveClock({clockAccent:$('ck-accent').value})">Apply color</button>
    <button class="ghost sm" onclick="saveClock({clockAccent:''})">Use design color</button>
  </div>
</div>
<h2>Top-right clock</h2>
<div class="card">
  <label class="fld" style="margin-top:0">Design</label>
  <div class="row" id="mcDesigns" style="flex-wrap:wrap;gap:10px"></div>
  <label class="fld" style="margin-top:16px">Size: <span id="mcFontVal" class="num" style="color:var(--ember)"></span></label>
  <input id="mc-font" type="range" min="10" max="22" step="1" style="accent-color:var(--ember)">
  <label class="fld">Accent color</label>
  <div class="row">
    <input id="mc-accent" type="color" style="width:56px;height:40px;padding:3px">
    <button class="sm" onclick="saveClock({mclockAccent:$('mc-accent').value})">Apply color</button>
    <button class="ghost sm" onclick="saveClock({mclockAccent:''})">Default color</button>
  </div>
</div>

<h2>Google Calendar</h2>
<div class="card">
  <p class="muted">Subscribe to this feed in Google Calendar (Settings → Add calendar → From URL). Google refreshes it every few hours.</p>
  <div class="row" style="margin-top:10px">
    <input id="icsUrl" readonly style="font-size:12px">
    <button class="sm" onclick="navigator.clipboard.writeText($('icsUrl').value);toast('Copied')">Copy</button>
  </div>
  <button class="rose sm" style="margin-top:10px" onclick="regenIcs()">Regenerate link (if leaked)</button>
</div>

<h2>Shared progress</h2>
<div class="card">
  <p class="muted">A read-only copy of your Progress tab that friends open with a PIN you set. They cannot change anything.</p>
  <label class="fld">Link</label>
  <div class="row"><input id="shareUrl" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('shareUrl').value);toast('Copied')">Copy</button></div>
  <div id="shareState" class="tiny" style="margin-top:8px"></div>
  <label class="fld">Title friends see</label>
  <input id="shareTitle" maxlength="60" placeholder="My grind">
  <label class="fld">Share PIN</label>
  <div class="row"><input id="sharePin" type="password" inputmode="numeric" placeholder="at least 4 characters">
  <button class="pri sm" onclick="saveSharePin()">Set</button></div>
  <p class="tiny" style="margin-top:6px">Changing it signs every friend out, they will need the new one.</p>
  <label class="fld">What they can see</label>
  ${tog('shOverview', 'Overview', 'streak, pace, records, off-day count')}
  ${tog('shLc', '🧩 LeetCode', 'averages, trends, charts')}
  ${tog('shGrind', '🔥 Grind', 'hours, heatmap, where time went')}
  ${tog('shJobs', '📨 Jobs', 'funnel and platforms, no company names')}
  ${tog('shLcNames', 'LeetCode problem names', 'the per-day history of what you attempted')}
  ${tog('shFriends', '🎮 Friend time', 'names of your friends and hours with each')}
  ${tog('shOffReasons', 'Off-day reasons', 'why you rested, the count shows either way')}
  <div class="row" style="margin-top:14px">
    <button class="pri grow" onclick="saveShare()">Save</button>
    <button class="rose" onclick="shareOff()">Turn off sharing</button>
  </div>
</div>

<h2>Job platforms</h2>
<div class="card">
  <p class="muted">The dropdown on the Jobs tab. Anything not listed gets filed under "Other".</p>
  <div class="row" id="platChips" style="flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="row" style="margin-top:12px">
    <input id="platNew" placeholder="Add a platform, e.g. Simplify" onkeydown="if(event.key==='Enter')addPlat()">
    <button class="sm" onclick="addPlat()">Add</button>
  </div>
</div>

<h2>Agent API · job tracker</h2>
<div class="card">
  <p class="muted">An AI agent (or any script) gets full access to the Jobs tab with this key: read, add, edit, change status and delete. Adding bumps that day's counter, deleting takes it back down.</p>
  <label class="fld">Endpoint</label>
  <div class="row"><input id="jobsEp" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('jobsEp').value);toast('Copied')">Copy</button></div>
  <label class="fld">API key</label>
  <div class="row"><input id="apiKey" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('apiKey').value);toast('Copied')">Copy</button></div>
  <label class="fld">Instruction for your agent (paste into its CLAUDE.md)</label>
  <textarea id="agentSnip" readonly rows="14" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:10px">
    <button class="sm" onclick="navigator.clipboard.writeText($('agentSnip').value);toast('Snippet copied')">Copy snippet</button>
    <button class="rose sm" onclick="regenKey()">Regenerate key</button>
  </div>
</div>
<h2>Read-only API · for Claude</h2>
<div class="card">
  <p class="muted">Lets Claude read your LeetCode log, your job applications and your progress. <b>Read only</b>: this key cannot add, change or delete anything, and it never returns your problem notes. Works in Claude Code and in claude.ai chat in a browser (which cannot send headers, so the key rides in the URL).</p>
  <p class="tiny" style="margin-top:8px">The URLs below contain the key, so treat one like a password. Anyone holding it can read every job row including company and salary, and your whole LeetCode history. Regenerate below if one ever gets loose.</p>
  <label class="fld">Read key</label>
  <div class="row"><input id="readKey" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readKey').value);toast('Copied')">Copy</button></div>
  <label class="fld">LeetCode URL</label>
  <div class="row"><input id="readLc" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readLc').value);toast('Copied')">Copy</button></div>
  <label class="fld">Jobs URL</label>
  <div class="row"><input id="readJb" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readJb').value);toast('Copied')">Copy</button></div>
  <label class="fld">Progress URL</label>
  <div class="row"><input id="readPr" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readPr').value);toast('Copied')">Copy</button></div>
  <label class="fld">For Claude chat in a browser (paste into a Claude Project's instructions)</label>
  <textarea id="browserSnip" readonly rows="12" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:8px">
    <button class="sm" onclick="navigator.clipboard.writeText($('browserSnip').value);toast('Copied for browser Claude')">Copy</button>
  </div>
  <label class="fld">For Claude Code (paste into its CLAUDE.md)</label>
  <textarea id="ccSnip" readonly rows="10" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:10px">
    <button class="sm" onclick="navigator.clipboard.writeText($('ccSnip').value);toast('Copied for Claude Code')">Copy</button>
    <button class="rose sm" onclick="regenReadKey()">Regenerate read key</button>
  </div>
</div>

<h2>Account</h2>
<div class="card">
  <div class="row"><div class="grow"><b id="accEmail"></b><div class="tiny">Handle: <span id="accHandle" class="num"></span></div></div>
  <a class="sm" href="/api/export" style="text-decoration:none">⬇ Export my data</a></div>
  <label class="fld">Change password</label>
  <div class="fgrid">
    <div><input id="p-cur" type="password" autocomplete="current-password" placeholder="current"></div>
    <div><input id="p-new" type="password" autocomplete="new-password" placeholder="new, 10+ characters"></div>
  </div>
  <button class="pri" style="margin-top:12px" onclick="changePw()">Change password</button>
  <div class="hint">Every other signed-in device is signed out.</div>
  <label class="fld">Import a LockIn export</label>
  <div class="row" style="flex-wrap:wrap"><input type="file" id="impFile" accept="application/json,.json" style="flex:1;min-width:180px"><input id="p-imp" type="password" placeholder="your password" style="width:150px"><button class="rose sm" onclick="importFile()">Replace everything</button></div>
  <div class="hint">Replaces every table with the file. Export first if you are unsure. Keys and PINs are never in an export.</div>
  <div class="row" style="margin-top:18px"><button class="ghost sm" onclick="logout()">Sign out</button></div>
</div>
<div class="card danger">
  <b style="color:var(--rose)">Delete account</b>
  <p class="tiny" style="margin-top:4px">Removes your account and your entire database. There is no undo. Export first if you want a copy.</p>
  <div class="row" style="margin-top:8px"><input id="p-del" type="password" placeholder="your password"><button class="rose sm" onclick="delAccount()">Delete everything</button></div>
</div>
`, `<script>
let S=null;
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PAL=['#FF6B35','#5EA2FF','#3DDC97','#9B6EF3','#FFB347','#FF5D73','#4f8ef7','#f3a33c'];
const CEMO=['\\uD83E\\uDDE9','\\uD83D\\uDCE8','\\uD83D\\uDCDA','\\uD83D\\uDDC4\\uFE0F','\\uD83C\\uDFD7\\uFE0F','\\uD83D\\uDCAC','\\uD83C\\uDF99\\uFE0F','\\uD83D\\uDCDD','\\u2B50','\\uD83C\\uDFAF'];
function toggle(el,on){el.classList.toggle('on',on);el.setAttribute('aria-checked',on);}
const isOn=id=>$(id).classList.contains('on');
const hmOk=v=>/^\\d{2}:\\d{2}$/.test(v||'');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const q=v=>String(v).replace(/'/g,'');
let PH=[],CT=[],SD=[],LAY=null,AVW=[];

async function load(){
S=await api('/api/settings');
// time
let zones=[];try{zones=Intl.supportedValuesOf('timeZone')}catch(e){zones=['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo']}
if(!zones.includes(S.tz))zones.unshift(S.tz);
$('s-tz').innerHTML=zones.map(z=>'<option value="'+z+'"'+(z===S.tz?' selected':'')+'>'+z.replace(/_/g,' ')+'</option>').join('');
document.querySelectorAll('#clkSeg button').forEach(b=>{b.classList.toggle('on',(b.dataset.c==='1')===!!S.clock24);b.onclick=()=>{document.querySelectorAll('#clkSeg button').forEach(x=>x.classList.toggle('on',x===b));};});
// editors
PH=S.phases.map(p=>({...p}));renderPhases();
CT=S.categories.map(c=>({...c}));renderCats();
SD=S.sideTasks.map(t=>({...t,days:String(t.days).split(',').map(Number)}));renderSides();
LAY=JSON.parse(JSON.stringify(S.sched));renderLayouts();
// modules
const MODS=[['leetcode','🧩 LeetCode tab','problem log, notes, visualizer, solve-time stats'],['jobs','📨 Jobs tab','application tracker, funnel, platforms'],['copy','📋 Quick Copy','snippets for application forms'],['clock','🕒 Day clock','the 12-hour dial on Today'],['friends','🎮 Friends booking','public page where friends grab free slots']];
$('modToggles').innerHTML=MODS.map(([k,l,s])=>'<div class="row" style="margin-top:10px"><div class="grow"><b>'+l+'</b><div class="tiny">'+s+'</div></div><div class="toggle" id="mod-'+k+'" role="switch" tabindex="0"></div></div>').join('');
MODS.forEach(([k])=>{toggle($('mod-'+k),!!S.modules[k]);$('mod-'+k).onclick=()=>toggle($('mod-'+k),!isOn('mod-'+k));});
$('s-target').value=S.grindTarget;
// today layout
document.querySelectorAll('#layoutSeg button').forEach(b=>{
b.classList.toggle('on',b.dataset.l===S.todayLayout);
b.onclick=async()=>{await api('/api/settings',{body:{todayLayout:b.dataset.l}});toast('Layout: '+b.dataset.l);load();};});
// booking
toggle($('bookT'),S.bookingEnabled);$('bookT').onclick=()=>toggle($('bookT'),!isOn('bookT'));
AVW=S.availability.map(a=>[a[0],a[1]]);renderAvail();
$('s-bdays').value=S.bookingDays;$('bdVal').textContent=S.bookingDays;
$('s-bdays').oninput=()=>$('bdVal').textContent=$('s-bdays').value;
$('s-bdev').value=S.bookingPerDevice;$('s-bslot').value=S.bookingPerSlot;$('s-bdur').value=S.bookingDurations.join(', ');
// timer
$('s-timer').value=S.timerDefault;$('s-topts').value=S.timerOptions.join(', ');
renderClockCtl();
$('icsUrl').value=S.icsUrl;
$('shareUrl').value=S.shareUrl;
const SHR=S.share||{};
$('shareTitle').value=SHR.title||'';
[['shOverview','overview'],['shLc','lc'],['shGrind','grind'],['shJobs','jobs'],
 ['shLcNames','lcNames'],['shFriends','friends'],['shOffReasons','offReasons']]
.forEach(([id,k])=>{toggle($(id),!!SHR[k]);$(id).onclick=()=>toggle($(id),!isOn(id));});
$('shareState').innerHTML=SHR.isOn
?'<span style="color:var(--mint)">\u25cf Sharing is on.</span> Anyone with the link and the PIN can read these stats.'
:'<span style="color:var(--ink3)">\u25cb Sharing is off.</span> Set a PIN below to switch it on.';
$('jobsEp').value=S.jobsEndpoint;$('apiKey').value=S.apiKey;
renderPlats();renderSnips();
$('readKey').value=S.readKey;
$('readLc').value=S.readEndpoints.leetcode;$('readJb').value=S.readEndpoints.jobs;$('readPr').value=S.readEndpoints.progress;
$('accEmail').textContent=(S.user&&S.user.email)||'';$('accHandle').textContent=(S.user&&S.user.handle)||'';
}

// ---- time ----
async function saveTime(){
const c24=[...document.querySelectorAll('#clkSeg button')].find(b=>b.classList.contains('on')).dataset.c==='1';
await api('/api/settings',{body:{timezone:$('s-tz').value,clock24:c24}});toast('Time settings saved');load();}

// ---- phases ----
function renderPhases(){
$('phases').innerHTML=PH.length?PH.map((p,i)=>'<div class="ed"><div class="row"><input class="nm" value="'+esc2(p.name)+'" oninput="PH['+i+'].name=this.value" placeholder="Phase name">'
+'<button class="ghost sm" onclick="delPhase('+i+')">\\u2715</button></div>'
+'<div class="row" style="margin-top:6px"><input type="date" class="dt" value="'+p.start_date+'" onchange="PH['+i+'].start_date=this.value"><span class="tiny">to</span><input type="date" class="dt" value="'+p.end_date+'" onchange="PH['+i+'].end_date=this.value">'
+'<button class="sm '+(p.low_load?'on':'')+'" onclick="PH['+i+'].low_load=PH['+i+'].low_load?0:1;renderPhases()">'+(p.low_load?'\\uD83E\\uDEAB low load':'normal')+'</button></div>'
+'<div class="sw">'+PAL.map(c=>'<button style="background:'+c+'" class="'+(p.color===c?'on':'')+'" onclick="PH['+i+'].color=\\''+c+'\\';renderPhases()"></button>').join('')+'</div>'
+'<div class="row" style="margin-top:8px"><span class="grow"></span><button class="sm pri" onclick="savePhase('+i+')">Save</button></div></div>').join('')
:'<div class="skel">No plan yet. Add a phase to get the progress bar, pace and forecast.</div>';}
function addPhase(){const last=PH[PH.length-1];const d=new Date((last?last.end_date:new Date().toISOString().slice(0,10))+'T12:00:00Z');if(last)d.setUTCDate(d.getUTCDate()+1);
const s=d.toISOString().slice(0,10);const e=new Date(d);e.setUTCDate(e.getUTCDate()+27);
PH.push({id:null,name:'Phase '+(PH.length+1),start_date:s,end_date:e.toISOString().slice(0,10),color:PAL[PH.length%PAL.length],low_load:0});renderPhases();}
async function savePhase(i){const p=PH[i];if(!p.name.trim())return toast('Name the phase');
try{if(p.id)await api('/api/phases/'+p.id,{method:'PATCH',body:p});else await api('/api/phases',{body:p});toast('Phase saved');load();}catch(e){toast(String(e))}}
async function delPhase(i){const p=PH[i];if(p.id){if(!confirm('Delete this phase?'))return;await api('/api/phases/'+p.id,{method:'DELETE'});}PH.splice(i,1);renderPhases();}
async function regen(){if(!confirm('Rewrite the goals of every future day from the category values? Days with logged work are kept.'))return;
try{const j=await api('/api/goals/regenerate',{body:{}});toast('Goals regenerated, '+j.touched+' rows');}catch(e){toast(String(e))}}

// ---- categories ----
function renderCats(){
$('cats').innerHTML=CT.map((c,i)=>'<div class="ed'+(c.enabled?'':' dim')+'"><div class="row"><span style="font-size:20px">'+c.emoji+'</span>'
+'<input class="nm" value="'+esc2(c.name)+'" oninput="CT['+i+'].name=this.value"'+(c.builtin?' readonly':'')+'>'
+'<button class="sm '+(c.enabled?'':'pri')+'" onclick="CT['+i+'].enabled=CT['+i+'].enabled?0:1;saveCat('+i+')">'+(c.enabled?'Turn off':'Turn on')+'</button></div>'
+'<div class="gl"><div><label>Weekday goal</label><input type="number" min="0" max="50" value="'+c.goal_wd+'" oninput="CT['+i+'].goal_wd=+this.value"></div>'
+'<div><label>Weekend goal</label><input type="number" min="0" max="50" value="'+c.goal_we+'" oninput="CT['+i+'].goal_we=+this.value"></div>'
+'<div><label>Low-load goal</label><input type="number" min="0" max="50" value="'+c.goal_low+'" oninput="CT['+i+'].goal_low=+this.value"></div></div>'
+(c.builtin?'<div class="hint">Built in: '+(c.builtin==='leetcode'?'the LeetCode module.':'the Jobs tracker.')+'</div>'
:'<div class="em">'+CEMO.map(e=>'<button class="'+(c.emoji===e?'on':'')+'" onclick="CT['+i+'].emoji=this.textContent;renderCats()">'+e+'</button>').join('')+'</div>'
+'<div class="sw">'+PAL.map(col=>'<button style="background:'+col+'" class="'+(c.color===col?'on':'')+'" onclick="CT['+i+'].color=\\''+col+'\\';renderCats()"></button>').join('')+'</div>')
+'<div class="row" style="margin-top:8px"><span class="grow"></span><button class="sm pri" onclick="saveCat('+i+')">Save</button></div></div>').join('');}
function addCat(){CT.push({id:null,name:'',emoji:CEMO[2],color:PAL[CT.length%PAL.length],goal_wd:1,goal_we:0,goal_low:0,enabled:1,builtin:null});renderCats();}
async function saveCat(i){const c=CT[i];if(!c.name.trim())return toast('Name the category');
try{if(c.id)await api('/api/categories/'+c.id,{method:'PATCH',body:c});else await api('/api/categories',{body:c});toast('Category saved. Regenerate goals to apply new values to future days.');load();}catch(e){toast(String(e))}}

// ---- layouts ----
function renderLayouts(){
const names=Object.keys(LAY.layouts);
$('layouts').innerHTML=names.map(n=>'<div class="ed"><div class="row"><b style="flex:1;text-transform:capitalize">'+esc2(n)+'</b>'
+(n===LAY.default?'<span class="tiny">default</span>':'<button class="ghost sm" onclick="LAY.default=\\''+q(n)+'\\';renderLayouts()">make default</button>')
+(names.length>1?'<button class="ghost sm" onclick="delLayout(\\''+q(n)+'\\')">\\u2715</button>':'')+'</div>'
+LAY.layouts[n].map((b,i)=>'<div class="row" style="margin-top:6px"><span class="tiny" style="width:52px">Block '+(i+1)+'</span><input type="time" class="hm" value="'+b[0]+'" onchange="LAY.layouts[\\''+q(n)+'\\']['+i+'][0]=this.value"><span class="tiny">to</span><input type="time" class="hm" value="'+b[1]+'" onchange="LAY.layouts[\\''+q(n)+'\\']['+i+'][1]=this.value">'
+(LAY.layouts[n].length>1?'<button class="ghost sm" onclick="LAY.layouts[\\''+q(n)+'\\'].splice('+i+',1);renderLayouts()">\\u2715</button>':'')+'</div>').join('')
+(LAY.layouts[n].length<4?'<button class="sm" style="margin-top:8px" onclick="LAY.layouts[\\''+q(n)+'\\'].push([\\'19:00\\',\\'21:00\\']);renderLayouts()">\\uFF0B block</button>':'')+'</div>').join('');
$('byDow').innerHTML=DN.map((d,i)=>'<label class="tiny" style="display:flex;flex-direction:column;gap:3px">'+d+'<select onchange="if(this.value)LAY.byDow['+i+']=this.value;else delete LAY.byDow['+i+']" style="padding:6px"><option value="">default</option>'+names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.byDow[i]===n?' selected':'')+'>'+esc2(n)+'</option>').join('')+'</select></label>').join('');
$('lowSel').innerHTML=names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.low===n?' selected':'')+'>'+esc2(n)+'</option>').join('');
$('lowSel').onchange=()=>{LAY.low=$('lowSel').value;};}
function addLayout(){const n=$('layNew').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);if(!n)return toast('Letters and numbers only');if(LAY.layouts[n])return toast('Already exists');
LAY.layouts[n]=[['09:00','12:00']];$('layNew').value='';renderLayouts();}
function delLayout(n){delete LAY.layouts[n];if(LAY.default===n)LAY.default=Object.keys(LAY.layouts)[0];if(LAY.low===n)LAY.low=LAY.default;for(const d of Object.keys(LAY.byDow))if(LAY.byDow[d]===n)delete LAY.byDow[d];renderLayouts();}
async function saveLayouts(){for(const [n,l] of Object.entries(LAY.layouts))for(const b of l)if(!hmOk(b[0])||!hmOk(b[1]))return toast('Fill every time in '+n);
try{await api('/api/settings',{body:{sched:LAY}});toast('Layouts saved');load();}catch(e){toast(String(e))}}

// ---- side tasks ----
function renderSides(){
const EM=S.sideEmoji||['\\uD83D\\uDCCC'];
$('sides').innerHTML=SD.length?SD.map((t,i)=>'<div class="ed'+(t.enabled?'':' dim')+'"><div class="row"><span style="font-size:20px">'+t.emoji+'</span><input class="nm" value="'+esc2(t.name)+'" oninput="SD['+i+'].name=this.value" placeholder="Gym, class, shift...">'
+'<button class="sm" onclick="SD['+i+'].enabled=SD['+i+'].enabled?0:1;renderSides()">'+(t.enabled?'On':'Off')+'</button>'
+'<button class="ghost sm" onclick="delSide('+i+')">\\u2715</button></div>'
+'<div class="em">'+EM.map(e=>'<button class="'+(t.emoji===e?'on':'')+'" onclick="SD['+i+'].emoji=this.textContent;renderSides()">'+e+'</button>').join('')+'</div>'
+'<div class="chips">'+DN.map((d,di)=>'<button class="'+(t.days.includes(di)?'on':'')+'" onclick="tgDay('+i+','+di+')">'+d+'</button>').join('')+'</div>'
+'<div class="row" style="margin-top:8px"><input type="time" class="hm" value="'+t.start+'" onchange="SD['+i+'].start=this.value"><span class="tiny">to</span><input type="time" class="hm" value="'+t.end+'" onchange="SD['+i+'].end=this.value"></div>'
+'<div class="row" style="margin-top:8px"><span class="tiny">only between</span><input type="date" class="dt" value="'+(t.date_from||'')+'" onchange="SD['+i+'].date_from=this.value||null"><span class="tiny">and</span><input type="date" class="dt" value="'+(t.date_to||'')+'" onchange="SD['+i+'].date_to=this.value||null"></div>'
+'<div class="row" style="margin-top:8px"><span class="hint" style="margin:0">Empty dates = every week.</span><span class="grow"></span><button class="sm pri" onclick="saveSide('+i+')">Save</button></div></div>').join('')
:'<div class="skel">Nothing yet. Gym, a class, a shift: add what takes real time each week.</div>';}
function tgDay(i,d){const t=SD[i];const k=t.days.indexOf(d);if(k<0)t.days.push(d);else t.days.splice(k,1);renderSides();}
function addSide(){SD.push({id:null,name:'',emoji:(S.sideEmoji||['\\uD83D\\uDCCC'])[0],days:[1,3,5],start:'19:00',end:'20:30',date_from:null,date_to:null,enabled:1});renderSides();}
async function saveSide(i){const t=SD[i];if(!t.name.trim())return toast('Name it');if(!t.days.length)return toast('Pick at least one day');
try{if(t.id)await api('/api/side_tasks/'+t.id,{method:'PATCH',body:t});else await api('/api/side_tasks',{body:t});toast('Side task saved');load();}catch(e){toast(String(e))}}
async function delSide(i){const t=SD[i];if(t.id){if(!confirm('Delete '+t.name+'?'))return;await api('/api/side_tasks/'+t.id,{method:'DELETE'});}SD.splice(i,1);renderSides();}

// ---- modules, booking, timer ----
async function saveModules(){const m={};['leetcode','jobs','copy','clock','friends'].forEach(k=>m[k]=isOn('mod-'+k));
await api('/api/settings',{body:{modules:m,grindTarget:+$('s-target').value||6}});toast('Saved. Reloading the menu.');location.reload();}
function renderAvail(){$('avail').innerHTML=AVW.map((a,i)=>'<div class="row" style="margin-top:6px"><input type="time" class="hm" value="'+a[0]+'" onchange="AVW['+i+'][0]=this.value"><span class="tiny">to</span><input type="time" class="hm" value="'+a[1]+'" onchange="AVW['+i+'][1]=this.value"><button class="ghost sm" onclick="AVW.splice('+i+',1);renderAvail()">\\u2715</button></div>').join('')||'<div class="tiny">No windows: nothing is bookable.</div>';}
function addAvail(){if(AVW.length>=4)return toast('4 windows max');AVW.push(['12:00','15:00']);renderAvail();}
const nums=s=>String(s).split(',').map(x=>+x.trim()).filter(n=>n>0);
async function saveBooking(){
await api('/api/settings',{body:{bookingEnabled:isOn('bookT'),bookingDays:+$('s-bdays').value,availability:AVW,bookingPerDevice:+$('s-bdev').value,bookingPerSlot:+$('s-bslot').value,bookingDurations:nums($('s-bdur').value)}});
toast('Booking settings saved');load();}
async function saveTimer(){await api('/api/settings',{body:{timerDefault:+$('s-timer').value,timerOptions:nums($('s-topts').value)}});toast('Timer saved');load();}

// ---- share ----
async function saveShare(){
await api('/api/settings',{body:{shareTitle:$('shareTitle').value,
shareOverview:isOn('shOverview'),shareLc:isOn('shLc'),shareGrind:isOn('shGrind'),shareJobs:isOn('shJobs'),
shareLcNames:isOn('shLcNames'),shareFriends:isOn('shFriends'),shareOffReasons:isOn('shOffReasons')}});
toast('Shared page updated');load();}
async function saveSharePin(){
const pin=$('sharePin').value.trim();
if(pin.length<4)return toast('Share PIN must be at least 4 characters');
try{await api('/api/settings',{body:{sharePin:pin}});$('sharePin').value='';
toast('\uD83D\uDD17 Share PIN set. Friends will need the new one.');load();}
catch(e){toast(String(e))}}
async function shareOff(){
if(!confirm('Turn off sharing? The link stops working and every friend is signed out.'))return;
await api('/api/settings',{body:{sharePin:''}});toast('Sharing turned off');load();}

// ---- clocks ----
const CKD={ember:{face:'#10151F',cols:['#FF6B35','#5EA2FF','#3DDC97']},neon:{face:'#06080F',cols:['#FF2E88','#00E5FF','#39FF88']},
mono:{face:'#0E1114',cols:['#EDF1F7','#79828E','#AEB8C4']},sunset:{face:'#191016',cols:['#FF5D73','#FFB347','#FFD166']},
terminal:{face:'#070D08',cols:['#3DDC97','#1E9E68','#8AF5C2']}};
const CKNAMES={ember:'Ember',neon:'Neon',mono:'Mono',sunset:'Sunset',terminal:'Terminal'};
function ckPreview(k){const d=CKD[k];
const arc=(col,a1,a2,r)=>{const p=a=>[27+r*Math.cos((a-90)*Math.PI/180),27+r*Math.sin((a-90)*Math.PI/180)];
const[x1,y1]=p(a1),[x2,y2]=p(a2);
return '<path d="M '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+'" stroke="'+col+'" stroke-width="6" fill="none"/>';};
return '<svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="26" fill="'+d.face+'" stroke="#333c4f"/>'
+arc(d.cols[0],20,120,17)+arc(d.cols[1],140,200,17)+arc(d.cols[2],230,320,17)+'</svg>';}
function renderClockCtl(){
$('ckDesigns').innerHTML=Object.keys(CKD).map(k=>
'<button class="ghost" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:12px;'
+(S.clock.design===k?'outline:2px solid var(--ember);':'')+'" onclick="saveClock({clockDesign:\\''+k+'\\'})">'
+ckPreview(k)+'<span style="font:700 11px var(--disp);color:'+(S.clock.design===k?'var(--ember)':'var(--ink2)')+'">'+CKNAMES[k]+'</span></button>').join('');
$('ck-size').value=S.clock.size;$('ckSizeVal').textContent=S.clock.size;
$('ck-font').value=S.clock.font;$('ckFontVal').textContent=S.clock.font;
$('ck-accent').value=S.clock.accent||'#FF6B35';
$('ck-size').oninput=()=>$('ckSizeVal').textContent=$('ck-size').value;
$('ck-size').onchange=()=>saveClock({clockSize:+$('ck-size').value});
$('ck-font').oninput=()=>$('ckFontVal').textContent=$('ck-font').value;
$('ck-font').onchange=()=>saveClock({clockFont:+$('ck-font').value});
renderMClockCtl();}
const MCNAMES={pill:'Pill',led:'LED',analog:'Analog',flip:'Flip',ring:'Day ring'};
let mcInt=null;
function renderMClockCtl(){
$('mcDesigns').innerHTML=Object.keys(MCNAMES).map(k=>
'<button class="ghost" style="display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px;border-radius:12px;min-width:96px;'
+(S.mclock.design===k?'outline:2px solid var(--ember);':'')+'" onclick="saveClock({mclockDesign:\\''+k+'\\'})">'
+'<span class="mc-prev" data-d="'+k+'"></span>'
+'<span style="font:700 11px var(--disp);color:'+(S.mclock.design===k?'var(--ember)':'var(--ink2)')+'">'+MCNAMES[k]+'</span></button>').join('');
const draw=()=>document.querySelectorAll('.mc-prev').forEach(el=>{
el.innerHTML=window.mclockHTML({design:el.dataset.d,font:12,accent:S.mclock.accent},new Date());});
draw();clearInterval(mcInt);mcInt=setInterval(draw,1000);
$('mc-font').value=S.mclock.font;$('mcFontVal').textContent=S.mclock.font;
$('mc-accent').value=S.mclock.accent||'#FF6B35';
$('mc-font').oninput=()=>$('mcFontVal').textContent=$('mc-font').value;
$('mc-font').onchange=()=>saveClock({mclockFont:+$('mc-font').value});}
async function saveClock(body){await api('/api/settings',{body});toast('Clock updated');
if(body.mclockDesign||body.mclockAccent!==undefined||body.mclockFont){
S=await api('/api/settings');window.__MCLOCK=S.mclock;renderMClockCtl();}else load();}

// ---- calendar, platforms, keys ----
async function regenIcs(){
if(!confirm('Old link stops working. Google Calendar must be re-subscribed. Continue?'))return;
const j=await api('/api/ics/regen',{});$('icsUrl').value=j.icsUrl;toast('New link generated');}
function renderPlats(){
$('platChips').innerHTML=S.jobPlatforms.map((p,i)=>
'<span class="chip">'+esc(p)+'<button class="ghost sm" style="padding:0 2px" onclick="delPlat('+i+')" aria-label="remove">\\u2715</button></span>').join('')
+'<span class="chip" style="opacity:.6">Other <span class="tiny">always available</span></span>';}
async function savePlats(){await api('/api/settings',{body:{jobPlatforms:S.jobPlatforms}});S=await api('/api/settings');renderPlats();renderSnips();}
async function addPlat(){
const v=$('platNew').value.trim();
if(!v)return;
if(S.jobPlatforms.some(p=>p.toLowerCase()===v.toLowerCase()))return toast('Already in the list');
S.jobPlatforms.push(v);$('platNew').value='';await savePlats();toast('Added');}
async function delPlat(i){S.jobPlatforms.splice(i,1);await savePlats();toast('Removed');}
function renderSnips(){
const EP=S.jobsEndpoint, AUTH='-H "Authorization: Bearer '+S.apiKey+'" -H "Content-Type: application/json"';
$('agentSnip').value=
'# LockIn job tracker API\\n'
+'Every request needs: '+AUTH+'\\n'
+'Statuses (exact, lowercase): applied, oa, interview, offer, rejected.\\n'
+'Platforms (use one exactly): '+S.jobPlatforms.join(', ')+'. Anything else is filed as "Other · <name>", so send the real name rather than inventing a spelling.\\n\\n'
+'LOG an application (title and company required, date defaults to today in my time zone; this bumps my daily counter, do not count it twice):\\n'
+'curl -X POST '+EP+' '+AUTH+' -d \\'{"title":"...","company":"...","salary":"","location":"","platform":"...","url":"..."}\\'\\n\\n'
+'LIST / FIND (filters: status, company, q, date, since, limit):\\n'
+'curl "'+EP+'?status=applied&limit=50" '+AUTH+'\\n'
+'curl "'+EP+'?q=stripe" '+AUTH+'   # search title and company, use this to get the id before editing\\n\\n'
+'READ one:\\ncurl '+EP+'/<id> '+AUTH+'\\n\\n'
+'CHANGE STATUS (for example applied -> rejected):\\n'
+'curl -X PATCH '+EP+'/<id> '+AUTH+' -d \\'{"status":"rejected"}\\'\\n\\n'
+'EDIT any field (title, company, salary, location, url, platform, status, date):\\n'
+'curl -X PATCH '+EP+'/<id> '+AUTH+' -d \\'{"company":"Correct Name","salary":"$95k"}\\'\\n\\n'
+'DELETE (also takes that day\\'s counter back down):\\ncurl -X DELETE '+EP+'/<id> '+AUTH+'\\n\\n'
+'PATCH and DELETE return 404 if the id does not exist, and PATCH returns the updated row so you can confirm the change landed.';
const LC=S.readEndpoints.leetcode, JB=S.readEndpoints.jobs, PR=S.readEndpoints.progress;
$('browserSnip').value=
'# LockIn, my grind tracker. Read-only data feed.\\n\\n'
+'These URLs return my live data as JSON. Fetch one when you need facts about my LeetCode\\n'
+'practice, my job applications, or my overall progress. They are READ ONLY: nothing can be\\n'
+'added, changed or deleted through them, so never offer to log or edit anything here.\\n\\n'
+'LeetCode, every attempt plus per-problem rollups and solve times:\\n'+LC+'\\n\\n'
+'Job applications, every application plus the funnel and my pace:\\n'+JB+'\\n\\n'
+'Overall progress, grind hours, streak, pace vs plan, weekday pattern:\\n'+PR+'\\n\\n'
+'ALWAYS read the "guide" object at the top of the response before interpreting anything.\\n'
+'It defines every field and the counting rules. The one that trips people up: I rerun problems,\\n'
+'so attempt rows are NOT problems. Never count rows to say how many I have solved, use\\n'
+'stats.totals.solvedTotal.\\n\\n'
+'If a response is too big, add &limit=100 for the newest rows only, or &since=YYYY-MM-DD to\\n'
+'narrow by date. Add &format=md if plain text is easier to read than JSON. Always compare\\n'
+'"total" with "returned": if they differ you are looking at a slice, and you should say so.\\n\\n'
+'These URLs contain my key. Treat them as secret and do not repeat them back in your answers.';
$('ccSnip').value=
'# LockIn read-only data API\\n'
+'GET only. This key cannot write anything, it will 401 on every write path.\\n'
+'Key goes in the header below, or as ?key=... in the URL.\\n\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/leetcode\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/jobs\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/progress\\n\\n'
+'Params, all optional: limit, offset, since=YYYY-MM-DD, format=json|md.\\n'
+'jobs also takes status, company, q, date.\\n\\n'
+'Read the "guide" object in the response before interpreting fields. The rules that matter:\\n'
+'- finished: 0 did not finish, 1 solved clean, 2 solved but slow.\\n'
+'- a problem state is its NEWEST attempt, not its best one.\\n'
+'- reruns are normal, so never count attempt rows when you mean problems solved.\\n'
+'- "total" is the SQL count, "returned" is what came back. If they differ you have a slice.\\n'
+'- per-problem notes are never exposed by this API.\\n\\n'
+'To WRITE to the job tracker, use the separate agent API key. This one will not work for that.';}
async function regenKey(){
if(!confirm('Old key stops working. Update your agent after. Continue?'))return;
await api('/api/apikey/regen',{});toast('New key generated');load();}
async function regenReadKey(){
if(!confirm('The three read URLs stop working straight away and you will need to paste the new ones into Claude. Your job tracker agent key is not affected. Continue?'))return;
await api('/api/readkey/regen',{});toast('New read key generated');load();}

// ---- account ----
async function changePw(){
try{await api('/api/auth/password',{body:{current:$('p-cur').value,next:$('p-new').value}});
$('p-cur').value='';$('p-new').value='';toast('Password changed');}
catch(e){toast(String(e))}}
async function logout(){await api('/api/auth/logout',{});location.href='/login';}
async function importFile(){
const f=$('impFile').files[0];if(!f)return toast('Pick an export file first');
if(!$('p-imp').value)return toast('Type your password');
if(!confirm('Replace EVERYTHING in your account with this file? There is no undo.'))return;
let file;try{file=JSON.parse(await f.text());}catch(e){return toast('That is not a JSON file');}
try{const j=await api('/api/import',{body:{password:$('p-imp').value,file}});toast('Imported: '+Object.values(j.counts||{}).reduce((a,b)=>a+b,0)+' rows');setTimeout(()=>location.href='/',900);}
catch(e){toast(String(e))}}
async function delAccount(){
if(!$('p-del').value)return toast('Type your password first');
if(!confirm('Delete your account and every bit of data in it? This cannot be undone.'))return;
if(!confirm('Last chance. Delete everything?'))return;
try{await api('/api/auth/delete',{body:{password:$('p-del').value}});location.href='/';}catch(e){toast(String(e))}}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
