import { shell } from './theme.js';

// The setup wizard. Seven steps, one final POST to /api/onboarding.
// Everything a user could not change in the single-user app is asked here.
// Page-script rule: no backticks, no ${ } and no quotes inside inline onclick attributes.

export const onboardPage = (user) => shell('LockIn · Setup', null, `
<style>
.wiz{max-width:560px;margin:0 auto;padding-bottom:40px}
.steps{display:flex;gap:4px;margin:14px 0 18px}
.steps i{flex:1;height:4px;border-radius:2px;background:var(--surface3)}
.steps i.on{background:var(--ember)}
.wiz h1{font-size:22px;margin:0 0 4px}
.wiz .lead{color:var(--ink2);margin:0 0 14px;line-height:1.5}
.wiz label.fld{margin-top:12px}
.wrow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lst{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.li{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.li .row{gap:8px;flex-wrap:wrap}
.li input,.li select{padding:8px 10px;font-size:14px}
.li input.sm{width:96px}
.li input.nm{flex:1;min-width:120px}
.li input.hm{width:88px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chips button{padding:6px 10px;font-size:12px}
.chips button.on{background:var(--ember);color:#0B0E14;border-color:var(--ember)}
.sw{display:flex;gap:6px;flex-wrap:wrap}
.sw button{width:30px;height:30px;border-radius:8px;border:2px solid transparent;padding:0}
.sw button.on{border-color:#fff}
.em{display:flex;gap:4px;flex-wrap:wrap}
.em button{width:36px;height:36px;font-size:18px;padding:0;border-radius:9px}
.em button.on{background:var(--surface3);border-color:var(--ember)}
.nav2{display:flex;gap:10px;margin-top:22px}
.nav2 button{flex:1;padding:13px;font-weight:800;border-radius:12px}
.hint{font-size:12px;color:var(--ink3);margin-top:4px}
.ok{color:var(--mint)}.bad{color:var(--rose)}
.tog{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
.tog:last-child{border-bottom:0}
.tog b{font-size:14px}.tog .tiny{margin-top:2px}
.tog button{min-width:64px}
.tog button.on{background:var(--mint);color:#0B0E14;border-color:var(--mint)}
.goalrow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px}
.goalrow label{font:700 10px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px}
.goalrow input{width:100%;padding:8px}
</style>
<div class="wiz">
  <div class="logo" style="font-size:24px;margin-top:6px">LOCK<em>IN</em> 🔥</div>
  <div class="steps" id="steps"></div>
  <div id="wiz"></div>
  <p class="tiny" id="err" style="color:var(--rose);min-height:16px;margin:10px 0 0"></p>
  <div class="nav2"><button class="ghost" id="back" onclick="go(-1)">Back</button><button class="pri" id="next" onclick="go(1)">Next</button></div>
</div>`, `<script>
const PAL=['#FF6B35','#5EA2FF','#3DDC97','#9B6EF3','#FFB347','#FF5D73','#4f8ef7','#f3a33c'];
const CEMO=['\\uD83E\\uDDE9','\\uD83D\\uDCE8','\\uD83D\\uDCDA','\\uD83D\\uDDC4\\uFE0F','\\uD83C\\uDFD7\\uFE0F','\\uD83D\\uDCAC','\\uD83C\\uDF99\\uFE0F','\\uD83D\\uDCDD','\\u2B50','\\uD83C\\uDFAF'];
const SEMO=['\\uD83C\\uDFCB\\uFE0F','\\uD83C\\uDF93','\\uD83D\\uDCBC','\\uD83C\\uDFC3','\\uD83C\\uDFBE','\\u26BD','\\uD83C\\uDFCA','\\uD83E\\uDDD8','\\uD83D\\uDE8C','\\uD83C\\uDF7D\\uFE0F','\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67','\\uD83C\\uDFAE','\\uD83D\\uDCCC'];
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const guessTz=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}catch(e){return 'UTC'}})();
const S={name:${JSON.stringify(user.display_name || '')},handle:${JSON.stringify(user.handle || '')},tz:guessTz,clock24:false,
noPlan:false,phases:[],
layouts:{morning:[['09:00','12:00'],['14:00','17:00']]},def:'morning',
cats:[{key:'leetcode',name:'LeetCode',emoji:CEMO[0],color:PAL[0],wd:3,we:1,low:1,builtin:'leetcode'},
      {key:'applications',name:'Applications',emoji:CEMO[1],color:PAL[1],wd:2,we:0,low:1,builtin:'applications'}],
side:[],modules:{leetcode:true,jobs:true,copy:true,friends:false,clock:true},target:6,booking:false,avail:[['12:00','15:00']]};
let step=0;const N=7;
const $$=q=>document.querySelectorAll(q);
const val=id=>{const e=$(id);return e?e.value:''};
const today=new Date().toLocaleDateString('en-CA',{timeZone:S.tz});
const plus=(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const hm=v=>/^\\d{2}:\\d{2}$/.test(v||'');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

function render(){
$('steps').innerHTML=Array.from({length:N},(_,i)=>'<i class="'+(i<=step?'on':'')+'"></i>').join('');
$('err').textContent='';
$('back').style.visibility=step?'visible':'hidden';
$('next').textContent=step===N-1?'Finish setup':'Next';
$('wiz').innerHTML=[stIdentity,stTime,stPlan,stBlocks,stCats,stSide,stModules][step]();
window.scrollTo(0,0);
if(step===0)checkHandle();}

function stIdentity(){
return '<h1>Welcome. Who is grinding?</h1><p class="lead">Your name shows on your shared progress page and booking page. The handle becomes their web address.</p>'
+'<label class="fld">Display name</label><input id="name" maxlength="40" value="'+esc2(S.name)+'" placeholder="e.g. Alex">'
+'<label class="fld">Handle</label><input id="handle" maxlength="30" value="'+esc2(S.handle)+'" placeholder="alex" oninput="checkHandle()" autocapitalize="none" autocorrect="off">'
+'<div class="hint" id="hh">3 to 30 characters: letters, numbers, dashes. Your pages will live at cslockin.com/u/handle/...</div>';}
let hT;
function checkHandle(){clearTimeout(hT);const h=(val('handle')||'').toLowerCase().trim();const el=$('hh');if(!el)return;
if(!/^[a-z0-9][a-z0-9-]{2,29}$/.test(h)){el.className='hint';el.textContent='3 to 30 characters: letters, numbers, dashes.';return;}
hT=setTimeout(async()=>{try{const j=await api('/api/handle/check?h='+encodeURIComponent(h));
el.className='hint '+(j.free?'ok':'bad');el.textContent=j.free?('cslockin.com/u/'+h+' is yours'):'That handle is taken';}catch(e){}},350);}

function stTime(){
let zones=[];try{zones=Intl.supportedValuesOf('timeZone')}catch(e){zones=['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo','Asia/Kolkata','Australia/Sydney']}
if(!zones.includes(S.tz))zones.unshift(S.tz);
return '<h1>Where are you?</h1><p class="lead">Every day, streak and deadline is counted in your own local time.</p>'
+'<label class="fld">Time zone</label><select id="tz">'+zones.map(z=>'<option value="'+z+'"'+(z===S.tz?' selected':'')+'>'+z.replace(/_/g,' ')+'</option>').join('')+'</select>'
+'<label class="fld">Clock</label><div class="chips"><button class="'+(S.clock24?'':'on')+'" onclick="S.clock24=false;render()">12-hour, 9:30 PM</button><button class="'+(S.clock24?'on':'')+'" onclick="S.clock24=true;render()">24-hour, 21:30</button></div>';}

function stPlan(){
return '<h1>Your plan</h1><p class="lead">A plan is a few phases with dates. It powers the progress bar, the pace tracking and the finish-line forecast. Mark a phase <b>low load</b> for exams, travel or guests: goals drop and a lighter schedule applies.</p>'
+'<div class="tog"><div><b>No plan yet</b><div class="tiny">Skip this, add phases later in Settings.</div></div><button class="sm '+(S.noPlan?'on':'')+'" onclick="S.noPlan=!S.noPlan;render()">'+(S.noPlan?'Skipped':'Off')+'</button></div>'
+(S.noPlan?'':'<div class="lst" id="phl">'+S.phases.map((p,i)=>'<div class="li"><div class="row"><input class="nm" placeholder="Phase name" value="'+esc2(p.name)+'" oninput="S.phases['+i+'].name=this.value">'
+'<button class="ghost sm" onclick="S.phases.splice('+i+',1);render()">\\u2715</button></div>'
+'<div class="row" style="margin-top:6px"><input type="date" class="sm" value="'+p.start+'" onchange="S.phases['+i+'].start=this.value" style="width:auto"><span class="tiny">to</span><input type="date" value="'+p.end+'" onchange="S.phases['+i+'].end=this.value" style="width:auto">'
+'<button class="sm '+(p.low?'on':'')+'" onclick="S.phases['+i+'].low=!S.phases['+i+'].low;render()">'+(p.low?'\\uD83E\\uDEAB low load':'normal')+'</button></div>'
+'<div class="sw" style="margin-top:8px">'+PAL.map(c=>'<button style="background:'+c+'" class="'+(p.color===c?'on':'')+'" onclick="S.phases['+i+'].color=\\''+c+'\\';render()"></button>').join('')+'</div></div>').join('')
+'</div><button class="sm" style="margin-top:10px" onclick="addPhase()">\\uFF0B Add phase</button>'
+'<div class="hint">Phases run back to back. The first start and the last end are your plan window.</div>');}
function addPhase(){const last=S.phases[S.phases.length-1];const start=last?plus(last.end,1):today;
S.phases.push({name:S.phases.length?'Phase '+(S.phases.length+1):'Phase 1',start,end:plus(start,27),color:PAL[S.phases.length%PAL.length],low:false});render();}

function stBlocks(){
const names=Object.keys(S.layouts);const hasLow=!S.noPlan&&S.phases.some(p=>p.low);
if(hasLow&&!S.layouts.low)S.layouts.low=[['11:00','13:00']];
return '<h1>Grind blocks</h1><p class="lead">When do you sit down and grind? A layout is up to four blocks. Make a second one (say, Night owl) and switch between them from the Today page whenever you like.</p>'
+Object.keys(S.layouts).map(n=>'<div class="li" style="margin-top:8px"><div class="row"><b style="flex:1;text-transform:capitalize">'+(n==='low'?'\\uD83E\\uDEAB Low-load days':n)+'</b>'
+(n===S.def?'<span class="tiny">default</span>':'<button class="ghost sm" onclick="S.def=\\''+n+'\\';render()">make default</button>')
+(names.length>1&&n!=='low'?'<button class="ghost sm" onclick="delete S.layouts[\\''+n+'\\'];if(S.def===\\''+n+'\\')S.def=Object.keys(S.layouts)[0];render()">\\u2715</button>':'')+'</div>'
+'<div class="lst">'+S.layouts[n].map((b,i)=>'<div class="row"><input type="time" class="hm" value="'+b[0]+'" onchange="S.layouts[\\''+n+'\\']['+i+'][0]=this.value"><span class="tiny">to</span><input type="time" class="hm" value="'+b[1]+'" onchange="S.layouts[\\''+n+'\\']['+i+'][1]=this.value">'
+'<button class="ghost sm" onclick="S.layouts[\\''+n+'\\'].splice('+i+',1);render()">\\u2715</button></div>').join('')+'</div>'
+(S.layouts[n].length<4?'<button class="sm" style="margin-top:8px" onclick="S.layouts[\\''+n+'\\'].push([\\'19:00\\',\\'21:00\\']);render()">\\uFF0B block</button>':'')+'</div>').join('')
+(S.layouts.night?'':'<button class="sm" style="margin-top:10px" onclick="S.layouts.night=[[\\'15:00\\',\\'18:00\\'],[\\'22:00\\',\\'01:00\\']];render()">\\uD83C\\uDF19 Add a Night owl layout</button>')
+'<div class="hint">A block ending after midnight is fine, it just runs into the next day.</div>';}

function stCats(){
return '<h1>What are you grinding?</h1><p class="lead">Each category gets a daily goal: one for weekdays, one for weekends, one for low-load days. LeetCode and Applications come with extra tools (the problem tracker and the job tracker). Add your own: a course, system design, reading.</p>'
+'<div class="lst">'+S.cats.map((c,i)=>'<div class="li"><div class="row"><span style="font-size:22px">'+c.emoji+'</span><input class="nm" value="'+esc2(c.name)+'" oninput="S.cats['+i+'].name=this.value" placeholder="Name">'
+'<button class="ghost sm" onclick="S.cats.splice('+i+',1);render()">\\u2715</button></div>'
+'<div class="goalrow"><div><label>Weekday goal</label><input type="number" min="0" max="50" value="'+c.wd+'" oninput="S.cats['+i+'].wd=+this.value"></div>'
+'<div><label>Weekend goal</label><input type="number" min="0" max="50" value="'+c.we+'" oninput="S.cats['+i+'].we=+this.value"></div>'
+'<div><label>Low-load goal</label><input type="number" min="0" max="50" value="'+c.low+'" oninput="S.cats['+i+'].low=+this.value"></div></div>'
+(c.builtin?'<div class="hint">Built in: '+(c.builtin==='leetcode'?'unlocks the LeetCode tab, timer records and problem notes.':'wired to the Jobs tracker, every logged application counts here.')+'</div>'
:'<div class="em" style="margin-top:8px">'+CEMO.map(e=>'<button class="'+(c.emoji===e?'on':'')+'" onclick="S.cats['+i+'].emoji=this.textContent;render()">'+e+'</button>').join('')+'</div>'
+'<div class="sw" style="margin-top:8px">'+PAL.map(col=>'<button style="background:'+col+'" class="'+(c.color===col?'on':'')+'" onclick="S.cats['+i+'].color=\\''+col+'\\';render()"></button>').join('')+'</div>')+'</div>').join('')+'</div>'
+'<button class="sm" style="margin-top:10px" onclick="S.cats.push({key:\\'\\',name:\\'\\',emoji:CEMO[2],color:PAL[S.cats.length%PAL.length],wd:1,we:0,low:0});render()">\\uFF0B Add category</button>'
+'<div class="hint">A goal of 0 means nothing is expected that day. Categories can be changed later; history is never lost.</div>';}

function stSide(){
return '<h1>Side tasks</h1><p class="lead">Recurring things that are not grind but take real time: gym, a class, a shift, a commute. They show on the timeline and the grind blocks step out of their way.</p>'
+'<div class="lst">'+S.side.map((t,i)=>'<div class="li"><div class="row"><span style="font-size:22px">'+t.emoji+'</span><input class="nm" value="'+esc2(t.name)+'" oninput="S.side['+i+'].name=this.value" placeholder="Gym, Algorithms class, Shift...">'
+'<button class="ghost sm" onclick="S.side.splice('+i+',1);render()">\\u2715</button></div>'
+'<div class="em" style="margin-top:8px">'+SEMO.map(e=>'<button class="'+(t.emoji===e?'on':'')+'" onclick="S.side['+i+'].emoji=this.textContent;render()">'+e+'</button>').join('')+'</div>'
+'<div class="chips">'+DN.map((d,di)=>'<button class="'+(t.days.includes(di)?'on':'')+'" onclick="tgDay('+i+','+di+')">'+d+'</button>').join('')+'</div>'
+'<div class="row" style="margin-top:8px"><input type="time" class="hm" value="'+t.start+'" onchange="S.side['+i+'].start=this.value"><span class="tiny">to</span><input type="time" class="hm" value="'+t.end+'" onchange="S.side['+i+'].end=this.value"></div>'
+'<div class="row" style="margin-top:8px"><span class="tiny">only between</span><input type="date" value="'+(t.from||'')+'" onchange="S.side['+i+'].from=this.value" style="width:auto"><span class="tiny">and</span><input type="date" value="'+(t.to||'')+'" onchange="S.side['+i+'].to=this.value" style="width:auto"></div>'
+'<div class="hint">Leave the dates empty for every week.</div></div>').join('')+'</div>'
+'<button class="sm" style="margin-top:10px" onclick="S.side.push({name:\\'\\',emoji:SEMO[0],days:[1,3,5],start:\\'19:00\\',end:\\'20:30\\',from:\\'\\',to:\\'\\'});render()">\\uFF0B Add side task</button>'
+'<div class="hint">You can skip this and add them later in Settings.</div>';}
function tgDay(i,d){const t=S.side[i];const k=t.days.indexOf(d);if(k<0)t.days.push(d);else t.days.splice(k,1);render();}

function stModules(){
const T=(k,label,sub)=>'<div class="tog"><div><b>'+label+'</b><div class="tiny">'+sub+'</div></div><button class="sm '+(S.modules[k]?'on':'')+'" onclick="S.modules.'+k+'=!S.modules.'+k+';render()">'+(S.modules[k]?'On':'Off')+'</button></div>';
const hasLc=S.cats.some(c=>c.builtin==='leetcode'),hasJobs=S.cats.some(c=>c.builtin==='applications');
if(!hasLc)S.modules.leetcode=false;if(!hasJobs)S.modules.jobs=false;
return '<h1>Last one: what is on</h1><p class="lead">Turn off what you will not use. Everything can be switched back in Settings.</p><div class="card" style="padding:4px 14px">'
+(hasLc?T('leetcode','LeetCode tab','Problem log, notes, array visualizer, solve-time stats.'):'')
+(hasJobs?T('jobs','Jobs tab','Application tracker with funnel and platform stats.'):'')
+T('copy','Quick Copy','Snippets for speed-filling application forms.')
+T('clock','Day clock','A 12-hour dial of your day on the Today page.')
+T('friends','Friends booking','A public page where friends grab your free slots. Off for most people.')
+'</div>'
+'<label class="fld">Daily grind target (hours)</label><input id="target" type="number" min="1" max="16" step="0.5" value="'+S.target+'" style="width:120px">'
+'<div class="hint">Drives the heat map and the "target hit" stats. 6 is a full day of focus.</div>'
+(S.modules.friends?'<label class="fld">Bookable window</label><div class="row"><input type="time" class="hm" id="av0" value="'+S.avail[0][0]+'"><span class="tiny">to</span><input type="time" class="hm" id="av1" value="'+S.avail[0][1]+'"></div><div class="hint">Whatever is left of this window after grind and side tasks is what friends can book.</div>':'');}

function collect(){
if(step===0){S.name=val('name').trim();S.handle=val('handle').trim().toLowerCase();
if(S.name.length<1)return 'Enter a display name';
if(!/^[a-z0-9][a-z0-9-]{2,29}$/.test(S.handle))return 'Handle: 3 to 30 characters, letters, numbers, dashes';}
if(step===1){S.tz=val('tz');}
if(step===2&&!S.noPlan){
if(!S.phases.length)return 'Add at least one phase, or choose No plan yet';
for(const p of S.phases){if(!p.name.trim())return 'Every phase needs a name';if(!p.start||!p.end||p.end<p.start)return 'Check the phase dates';}}
if(step===3){for(const [n,l] of Object.entries(S.layouts)){for(const b of l)if(!hm(b[0])||!hm(b[1]))return 'Every block needs a start and an end';}
if(!S.layouts[S.def]||!S.layouts[S.def].length)return 'The default layout needs at least one block';}
if(step===4){if(!S.cats.length)return 'Keep at least one category';
for(const c of S.cats){if(!c.name.trim())return 'Every category needs a name';}}
if(step===5){for(const t of S.side){if(!t.name.trim())return 'Every side task needs a name';if(!t.days.length)return t.name+': pick at least one day';if(!hm(t.start)||!hm(t.end))return t.name+': set a start and an end';}}
if(step===6){S.target=+val('target')||6;S.booking=!!S.modules.friends;if(S.booking){S.avail=[[val('av0')||'12:00',val('av1')||'15:00']];}}
return '';}

async function go(dir){
if(dir<0){step=Math.max(0,step-1);render();return;}
const e=collect();if(e){$('err').textContent=e;return;}
if(step<N-1){step++;render();return;}
$('next').disabled=true;$('err').textContent='';
const body={displayName:S.name,handle:S.handle,timezone:S.tz,clock24:S.clock24,
phases:S.noPlan?[]:S.phases.map(p=>({name:p.name.trim(),start:p.start,end:p.end,color:p.color,low:!!p.low})),
layouts:S.layouts,defaultLayout:S.def,lowLayout:S.layouts.low?'low':S.def,
categories:S.cats.map(c=>({name:c.name.trim(),emoji:c.emoji,color:c.color,goal_wd:c.wd,goal_we:c.we,goal_low:c.low,builtin:c.builtin||null})),
sideTasks:S.side.map(t=>({name:t.name.trim(),emoji:t.emoji,days:t.days,start:t.start,end:t.end,date_from:t.from||null,date_to:t.to||null})),
modules:S.modules,grindTarget:S.target,bookingEnabled:S.booking,availability:S.booking?S.avail:[]};
try{const r=await fetch('/api/onboarding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const j=await r.json().catch(()=>({}));
if(!r.ok){$('err').textContent=j.error||('error '+r.status);$('next').disabled=false;return;}
location.href='/';}catch(err){$('err').textContent='network error, try again';$('next').disabled=false;}}
render();
</script>`, { public: true });
