import { shell } from './theme.js';

export const settingsPage = (cfg) => shell('LockIn · Settings', '/settings', `
<h1>Settings</h1>

<h2>Daily goals</h2>
<div class="card">
  <div class="fgrid">
    <div><label class="fld">LeetCode / day</label><input id="s-lc" type="number" min="1" max="50"></div>
    <div><label class="fld">Applications / day</label><input id="s-apps" type="number" min="1" max="50"></div>
  </div>
  <p class="tiny" style="margin-top:10px">Applies from tomorrow onward. Visitor weeks keep their reduced goals on purpose.</p>
  <button class="pri" style="margin-top:10px" onclick="saveGoals()">Save goals</button>
</div>

<h2>Today page layout</h2>
<div class="card">
  <div class="seg-ctl" id="layoutSeg">
    <button data-l="classic">Classic</button>
    <button data-l="refined">Refined</button>
  </div>
  <p class="tiny" style="margin-top:10px">Refined puts the date, phase, mode and off-day controls in one bordered header card, with roomier spacing and aligned columns.</p>
</div>

<h2>Schedule mode</h2>
<div class="card">
  <div class="seg-ctl" id="modeSeg">
    <button data-m="morning">☀️ Morning</button>
    <button data-m="night">🌙 Night owl</button>
  </div>
  <p class="tiny" style="margin-top:10px">Low-load phases override this automatically.</p>
</div>

<h2>Grind blocks</h2>
<div class="card">
  <div class="row" style="margin-bottom:6px"><b>☀️ Morning mode</b><span class="grow"></span>
    <button class="sm" onclick="addBlk('morning')">+ Add block</button></div>
  <div id="blks-morning"></div>
  <div class="row" style="margin:18px 0 6px"><b>🌙 Night mode</b><span class="grow"></span>
    <button class="sm" onclick="addBlk('night')">+ Add block</button></div>
  <div id="blks-night"></div>
  <p class="tiny" style="margin-top:12px">Whatever is left of the 12:00 PM to 3:00 PM window stays bookable for friends. Google Calendar feed updates too.</p>
  <button class="pri" style="margin-top:8px" onclick="saveSched()">Save blocks</button>
</div>

<h2>Gym & class</h2>
<div class="card">
  <label class="fld">Gym days</label>
  <div class="row" id="gymDays" style="flex-wrap:wrap;gap:6px"></div>
  <div class="fgrid" style="margin-top:10px">
    <div><label class="fld">Gym start</label><input id="s-gyms" type="time"></div>
    <div><label class="fld">Gym end</label><input id="s-gyme" type="time"></div>
  </div>
  <div class="row" style="margin-top:16px">
    <div class="grow"><b>🎓 Class</b><div class="tiny">Classes, gym and shifts are side tasks. Their editor lands here next.</div></div>
    <div class="toggle" id="classT" role="switch" tabindex="0"></div>
  </div>
  <button class="pri" style="margin-top:14px" onclick="saveGym()">Save</button>
</div>

<h2>Booking</h2>
<div class="card">
  <div class="row">
    <div class="grow"><b>Friends can book</b><div class="tiny">The public /book page.</div></div>
    <div class="toggle" id="bookT" role="switch" tabindex="0"></div>
  </div>
  <label class="fld" style="margin-top:14px">Days visible ahead: <span id="bdVal" class="num" style="color:var(--ember)"></span></label>
  <input id="s-bdays" type="range" min="1" max="14" step="1" style="accent-color:var(--ember)">
  <button class="pri" style="margin-top:12px" onclick="saveBooking()">Save booking</button>
</div>

<h2>Timer</h2>
<div class="card row">
  <div class="grow"><b>Default focus length</b><div class="tiny">What the timer starts at.</div></div>
  <select id="s-timer" style="width:auto">
    <option value="25">25 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="50">50 min</option>
  </select>
  <button class="sm pri" onclick="saveTimer()">Save</button>
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
  <p class="tiny" style="margin-top:10px">Changes show on the Today page clock.</p>
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
  <p class="muted">A read-only copy of your Progress tab that friends open with their own PIN. They cannot change anything, and this PIN is separate from yours.</p>
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
    <div class="row" style="margin-top:10px"><div class="grow"><b>Overview</b><div class="tiny">streak, pace, records, off-day count</div></div><div class="toggle" id="shOverview" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>🧩 LeetCode</b><div class="tiny">averages, trends, charts</div></div><div class="toggle" id="shLc" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>🔥 Grind</b><div class="tiny">hours, heatmap, where time went</div></div><div class="toggle" id="shGrind" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>📨 Jobs</b><div class="tiny">funnel and platforms, no company names</div></div><div class="toggle" id="shJobs" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>LeetCode problem names</b><div class="tiny">the per-day history of what you attempted</div></div><div class="toggle" id="shLcNames" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>🎮 Friend time</b><div class="tiny">names of your friends and hours with each</div></div><div class="toggle" id="shFriends" role="switch" tabindex="0"></div></div>
    <div class="row" style="margin-top:10px"><div class="grow"><b>Off-day reasons</b><div class="tiny">why you rested, the count shows either way</div></div><div class="toggle" id="shOffReasons" role="switch" tabindex="0"></div></div>
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
  <p class="muted">Your CV agent has full access to the Jobs tab with this key: read, add, edit, change status and delete. Adding bumps that day's counter, deleting takes it back down.</p>
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
  <p class="tiny" style="margin-top:8px">The URLs below contain the key, so treat one like a password. Anyone holding it can read every job row including company and salary, and your whole LeetCode history. Pasting a URL into a chat puts the key in that transcript, and Cloudflare logs the full URL. Regenerate below if one ever gets loose.</p>
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
<h2>Security</h2>
<div class="card">
  <div class="fgrid">
    <div><label class="fld">Current PIN</label><input id="p-cur" type="password" inputmode="numeric"></div>
    <div><label class="fld">New PIN</label><input id="p-new" type="password" inputmode="numeric"></div>
  </div>
  <button class="pri" style="margin-top:12px" onclick="changePin()">Change PIN</button>
</div>
`, `<script>
let S=null;
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function toggle(el,on){el.classList.toggle('on',on);el.setAttribute('aria-checked',on);}
async function load(){
S=await api('/api/settings');
$('s-lc').value=S.goals.leetcode;$('s-apps').value=S.goals.apps;
document.querySelectorAll('#modeSeg button').forEach(b=>{
b.classList.toggle('on',b.dataset.m===S.baseMode);
b.onclick=async()=>{await api('/api/settings',{body:{baseMode:b.dataset.m}});toast('Mode: '+b.dataset.m);load();};});
document.querySelectorAll('#layoutSeg button').forEach(b=>{
b.classList.toggle('on',b.dataset.l===S.todayLayout);
b.onclick=async()=>{await api('/api/settings',{body:{todayLayout:b.dataset.l}});toast('Layout: '+b.dataset.l);load();};});
BLKS={morning:S.sched.morning.map(g=>[g[0],g[1]]),night:S.sched.night.map(g=>[g[0],g[1]])};
renderBlks('morning');renderBlks('night');
$('gymDays').innerHTML=DAYS.map((d,i)=>'<button class="sm'+(S.gymDays.includes(i)?' pri':'')+'" data-d="'+i+'">'+d+'</button>').join('');
document.querySelectorAll('#gymDays button').forEach(b=>b.onclick=()=>{b.classList.toggle('pri');});
const[gs,ge]=S.gymTime.split('-');$('s-gyms').value=gs;$('s-gyme').value=ge;
toggle($('classT'),S.classEnabled);
toggle($('bookT'),S.bookingEnabled);
$('s-bdays').value=S.bookingDays;$('bdVal').textContent=S.bookingDays;
$('s-bdays').oninput=()=>$('bdVal').textContent=$('s-bdays').value;
if(![...$('s-timer').options].some(o=>+o.value===S.timerDefault)){const o=document.createElement('option');o.value=S.timerDefault;o.textContent=S.timerDefault+' min';$('s-timer').prepend(o);}
$('s-timer').value=S.timerDefault;
renderClockCtl();
$('icsUrl').value=S.icsUrl;
$('shareUrl').value=S.shareUrl;
const SHR=S.share||{};
$('shareTitle').value=SHR.title||'';
[['shOverview','overview'],['shLc','lc'],['shGrind','grind'],['shJobs','jobs'],
 ['shLcNames','lcNames'],['shFriends','friends'],['shOffReasons','offReasons']]
.forEach(([id,k])=>{toggle($(id),!!SHR[k]);$(id).onclick=()=>toggle($(id),!$(id).classList.contains('on'));});
$('shareState').innerHTML=SHR.isOn
?'<span style="color:var(--mint)">\u25cf Sharing is on.</span> Anyone with the link and the PIN can read these stats.'
:'<span style="color:var(--ink3)">\u25cb Sharing is off.</span> Set a PIN below to switch it on.';
$('jobsEp').value=S.jobsEndpoint;$('apiKey').value=S.apiKey;
renderPlats();
const EP=S.jobsEndpoint, AUTH='-H "Authorization: Bearer '+S.apiKey+'" -H "Content-Type: application/json"';
$('agentSnip').value=
'# LockIn job tracker API\\n'
+'Every request needs: '+AUTH+'\\n'
+'Statuses (exact, lowercase): applied, oa, interview, offer, rejected.\\n'
+'Platforms (use one exactly): '+S.jobPlatforms.join(', ')+'. Anything else is filed as "Other · <name>", so send the real name rather than inventing a spelling.\\n\\n'
+'LOG an application (title and company required, date defaults to today NY; this bumps my daily counter, do not count it twice):\\n'
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
$('readKey').value=S.readKey;
$('readLc').value=S.readEndpoints.leetcode;
$('readJb').value=S.readEndpoints.jobs;
$('readPr').value=S.readEndpoints.progress;
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
+'If a response is too big, add &limit=100 for the newest rows only, or &since=2026-09-01 to\\n'
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
+'To WRITE to the job tracker, use the separate agent API key. This one will not work for that.';
$('classT').onclick=()=>toggle($('classT'),!$('classT').classList.contains('on'));
$('bookT').onclick=()=>toggle($('bookT'),!$('bookT').classList.contains('on'));
}
const shOn=id=>$(id).classList.contains('on');
async function saveShare(){
await api('/api/settings',{body:{shareTitle:$('shareTitle').value,
shareOverview:shOn('shOverview'),shareLc:shOn('shLc'),shareGrind:shOn('shGrind'),shareJobs:shOn('shJobs'),
shareLcNames:shOn('shLcNames'),shareFriends:shOn('shFriends'),shareOffReasons:shOn('shOffReasons')}});
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
async function saveGoals(){await api('/api/settings',{body:{goalLC:+$('s-lc').value,goalApps:+$('s-apps').value}});toast('Goals updated from tomorrow');}
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
let BLKS={morning:[],night:[]};
function renderBlks(mode){
$('blks-'+mode).innerHTML=BLKS[mode].map((g,i)=>
'<div class="blkrow">'
+'<span class="blk-lab">Block '+(i+1)+'</span>'
+'<input type="time" value="'+g[0]+'" onchange="BLKS[\\''+mode+'\\']['+i+'][0]=this.value">'
+'<span class="muted">to</span>'
+'<input type="time" value="'+g[1]+'" onchange="BLKS[\\''+mode+'\\']['+i+'][1]=this.value">'
+(BLKS[mode].length>1?'<button class="ghost sm blk-x" onclick="delBlk(\\''+mode+'\\','+i+')" aria-label="remove block">✕</button>':'<span></span>')
+'</div>').join('');}
function addBlk(mode){
if(BLKS[mode].length>=4)return toast('4 blocks max');
BLKS[mode].push(['19:00','21:00']);renderBlks(mode);}
function delBlk(mode,i){BLKS[mode].splice(i,1);renderBlks(mode);}
async function saveSched(){
for(const m of ['morning','night'])for(const g of BLKS[m])if(!g[0]||!g[1])return toast('Fill every time field');
await api('/api/settings',{body:{sched:{morning:BLKS.morning,night:BLKS.night}}});
toast('Blocks saved');load();}
async function saveGym(){
const days=[...document.querySelectorAll('#gymDays button.pri')].map(b=>+b.dataset.d);
await api('/api/settings',{body:{gymDays:days,gymTime:$('s-gyms').value+'-'+$('s-gyme').value,
classEnabled:$('classT').classList.contains('on')}});
toast('Saved');}
async function saveBooking(){
await api('/api/settings',{body:{bookingEnabled:$('bookT').classList.contains('on'),bookingDays:+$('s-bdays').value}});
toast('Booking settings saved');}
async function saveTimer(){await api('/api/settings',{body:{timerDefault:+$('s-timer').value}});toast('Timer default saved');}
async function regenIcs(){
if(!confirm('Old link stops working. Google Calendar must be re-subscribed. Continue?'))return;
const j=await api('/api/ics/regen',{});$('icsUrl').value=j.icsUrl;toast('New link generated');}
function renderPlats(){
$('platChips').innerHTML=S.jobPlatforms.map((p,i)=>
'<span class="chip">'+esc(p)+'<button class="ghost sm" style="padding:0 2px" onclick="delPlat('+i+')" aria-label="remove">✕</button></span>').join('')
+'<span class="chip" style="opacity:.6">Other <span class="tiny">always available</span></span>';}
async function savePlats(){await api('/api/settings',{body:{jobPlatforms:S.jobPlatforms}});S=await api('/api/settings');renderPlats();
$('agentSnip').value=$('agentSnip').value.replace(/Allowed platform values \\(use one exactly\\): [^\\n]*/,'Allowed platform values (use one exactly): '+S.jobPlatforms.join(', ')+'.');}
async function addPlat(){
const v=$('platNew').value.trim();
if(!v)return;
if(S.jobPlatforms.some(p=>p.toLowerCase()===v.toLowerCase()))return toast('Already in the list');
S.jobPlatforms.push(v);$('platNew').value='';await savePlats();toast('Added');}
async function delPlat(i){S.jobPlatforms.splice(i,1);await savePlats();toast('Removed');}
async function regenKey(){
if(!confirm('Old key stops working. Update your agent after. Continue?'))return;
const j=await api('/api/apikey/regen',{});$('apiKey').value=j.apiKey;toast('New key generated');load();}
async function regenReadKey(){
if(!confirm('The three read URLs stop working straight away and you will need to paste the new ones into Claude. Your job tracker agent key is not affected. Continue?'))return;
const j=await api('/api/readkey/regen',{});toast('New read key generated');load();}
async function changePin(){
try{await api('/api/pin/change',{body:{current:$('p-cur').value,next:$('p-new').value}});
$('p-cur').value='';$('p-new').value='';toast('PIN changed');}
catch(e){toast(String(e))}}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
