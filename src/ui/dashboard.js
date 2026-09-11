import { shell } from './theme.js';

export const dashboardPage = (cfg) => shell('LockIn · Today', '/', `
<style>@media(min-width:900px){.cols>#colB{order:-1}}</style>
<div id="dash" class="${cfg && cfg.todayLayout === 'refined' ? 'layout-v2' : ''}">
<div id="dayHeader" class="dh">
  <div class="dh-top">
    <div class="dh-title"><h1 id="dtitle">Today</h1></div>
    <div class="dh-chips">
      <span id="phase" class="pill"></span>
      <span id="streak" class="chip" style="display:none"></span>
      <button id="modeT" class="chip"></button>
      <button id="offBtn" class="chip" onclick="offDayFlow()" style="display:none">💤 Off day</button>
    </div>
  </div>
  <div class="dh-nav">
    <button class="dh-btn" onclick="nav(-1)" aria-label="Previous day">‹</button>
    <div id="dsub" class="dh-date"></div>
    <button class="dh-btn" onclick="nav(1)" aria-label="Next day">›</button>
  </div>
  <div class="race" id="race"></div>
</div>

<div id="liveGrind" class="card grind-live" style="display:none">
  <div class="lg-wrap">
    <div class="lg-main">
      <span class="lg-fire">🔥</span>
      <div class="lg-txt">
        <b id="lgTitle">Grinding</b>
        <div class="tiny" id="lgSub"></div>
        <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">
          <span class="pill" id="lgTask"></span><span class="tiny" id="lgSegs"></span>
        </div>
      </div>
      <div class="lg-time">
        <b class="num" id="lgElapsed"></b>
        <span class="tiny" id="lgMeta"></span>
        <span id="lgOt" class="grind-ot-tag" style="display:none"></span>
      </div>
    </div>
    <div class="lg-btns">
      <button class="sm" id="lgSwitch" onclick="switchTask()">⇄ Switch</button>
      <button class="sm" id="lgPause" onclick="togglePause()">⏸ Pause</button>
      <button class="pri sm" onclick="checkout()">Check out</button>
    </div>
    <div class="lg-moreWrap"><button class="lg-more" id="lgMore" aria-label="more options" onclick="event.stopPropagation();toggleLgMenu()">⋯</button>
      <div class="lgmenu" id="lgMenu">
        <button onclick="forgotCheckout()">⏱ Forgot to check out…<small>Enter the real stop time, the session is saved as if you had.</small></button>
        <button class="rose" onclick="cancelGrind()">✕ Cancel session<small>Discards it. Nothing is recorded.</small></button>
      </div></div>
  </div>
  <div class="grindbar" id="lgBar"><div class="fill" id="lgFill" style="width:0%"></div></div>
</div>

<div id="offStrip" class="banner" style="display:none;cursor:default;border-color:#5C677955;background:linear-gradient(135deg,#5C677918,#5C677908)">
  <span style="font-size:24px">💤</span>
  <div class="grow"><b>Off day</b><div class="tiny" id="offReasonTxt"></div></div>
  <button class="sm ghost" onclick="undoOffDay()">Undo</button>
</div>
<div id="backlogBanner" class="banner" style="display:none;cursor:default;border-color:#FFB34755">
  <span style="font-size:24px">🎒</span>
  <div class="grow"><b id="backlogTxt"></b><div class="tiny">Bring them into today, or park them on hold.</div></div>
  <button class="pri sm" onclick="bulkBacklog('today')">Bring to today</button>
  <button class="sm" onclick="bulkBacklog('hold')">Hold</button>
</div>
<div id="notifBanner" class="banner" style="display:none" onclick="location.href='/friends'">
  <span style="font-size:24px">👋</span><div class="grow"><b id="notifTxt"></b>
  <div class="tiny">Tap to review requests</div></div><span style="color:var(--ember);font-weight:800">→</span>
</div>
<div id="shift" class="banner" style="display:none;border-color:#3DDC9755;background:linear-gradient(135deg,#3DDC9714,#3DDC9708)">
  <span style="font-size:24px">🔥</span><div class="grow"><b>All course tasks done</b>
  <div class="tiny">Pull the whole future plan 1 day forward?</div></div>
  <button class="mint sm" onclick="event.stopPropagation();doShift()">Shift ↑</button>
</div>

<div class="cols">
<div id="colA">
  <div id="secRings">
  <h2>Goals</h2>
  <div class="ringrow" id="rings"></div>
  </div>
  <div id="clockSection">
  <h2>Day clock</h2>
  <div class="card clockwrap" id="clockCard">
    <div id="clockSvg"></div>
    <p class="tiny" style="text-align:center">Two things at once? The one closer to now takes the outer lane.</p>
  </div>
  </div>
  <div id="secTimer">
  <h2>Focus timer</h2>
  <div class="card"><div class="timer-wrap">
    <div class="tring"><svg width="190" height="190" viewBox="0 0 190 190">
      <circle cx="95" cy="95" r="85" fill="none" stroke="var(--surface2)" stroke-width="9"/>
      <circle id="tarc" cx="95" cy="95" r="85" fill="none" stroke="url(#tg)" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="534" stroke-dashoffset="0"/>
      <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#FFB347"/></linearGradient></defs>
    </svg><div class="tv num"><span id="tmr">25:00</span><span class="tsub" id="tsub"></span></div></div>
    <div class="row" id="tbtns">
      <button class="pri" id="tgo" onclick="tPrimary()">Start</button>
      <button id="tpause" onclick="tPause()" style="display:none">⏸ Pause</button>
      <button id="treset" onclick="tReset()">Reset</button>
      <select id="tlen" style="width:auto" onchange="tReset()"></select>
    </div>
    <label class="row" style="gap:8px;cursor:pointer;justify-content:center">
      <input type="checkbox" id="lcRec" style="width:auto" onchange="lcRecToggle()">
      <span style="font:700 13px var(--disp)">🧩 LeetCode record</span>
    </label>
    <div id="lcRecFields" style="display:none;width:100%;max-width:300px">
      <div class="seg-ctl" id="lcDiff">
        <button data-d="easy">Easy</button><button data-d="medium" class="on">Medium</button><button data-d="hard">Hard</button>
      </div>
      <input id="lcName" placeholder="Problem name (optional)" style="margin-top:8px">
    </div>
    <p class="tiny" id="tHint" style="text-align:center">Stuck at 25? Read the solution. Don't grind for 2 hours.</p>
  </div></div>
  </div>
</div>
<div id="colB">
  <div id="secTasks">
  <h2>Tasks</h2>
  <div class="card" id="tasks"><div class="skel">Loading…</div></div>
  </div>
  <div id="secSchedule">
  <h2>Schedule</h2>
  <div class="card"><div class="tl2" id="blocks"></div>
    <div class="cardfoot"><button class="sm ghost" onclick="openGrindLog()">✍️ Log a past grind</button><button class="sm pri" id="adhocBtn" onclick="startGrind(null)" style="display:none">🔥 Start grind now</button></div>
  </div>
  </div>
  <div id="secStats">
  <h2>Today in numbers</h2>
  <div class="card" id="dayStats"><div class="skel">Loading…</div></div>
  </div>
</div>
</div>
</div>
<div id="modalHost"></div>
`, `<script>
let D=new URLSearchParams(location.search).get('date')||todayU();
const TODAY=todayU();
let J=null,timerInit=false,liveInt=null,openBlocks={};
const MOD=new Proxy(Object.fromEntries(CATS.map(c=>[c.key,{e:c.emoji,n:c.name,c:c.color}])),{get:(t,k)=>t[k]||{e:'⭐',n:String(k),c:'#5C6779'}});
const FIRSTCAT=(CATS[0]||{}).key||'';
const nowNY=nyNowT;
function nav(n){const d=new Date(D+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);D=d.toISOString().slice(0,10);load();}
function goToday(){D=TODAY;load();}

function ringCard(id,label,g,accent,note){
const goal=g.goal||0,done=g.done||0;
const noGoal=goal<=0;
const hit=noGoal?done>0:done>=goal;
const pct=noGoal?(done>0?1:0):Math.min(1,done/goal);
const col=hit?'var(--mint)':accent;const CF=289;
return '<div style="text-align:center"><div class="ringlab">'+label+'</div>'
+'<div class="ring"><svg viewBox="0 0 112 112">'
+'<circle cx="56" cy="56" r="46" fill="none" stroke="var(--surface2)" stroke-width="8"/>'
+'<circle cx="56" cy="56" r="46" fill="none" stroke="'+col+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+CF+'" stroke-dashoffset="'+(CF*(1-pct))+'" style="transition:stroke-dashoffset .4s"/>'
+'</svg><div class="val"><b class="num">'+done+'</b><span>'+(noGoal?'NO GOAL':'OF '+goal)+'</span></div></div>'
+'<div class="extra">'+(done>goal?('+'+(done-goal)+' EXTRA 💪'):(hit?'GOAL HIT ✓':'&nbsp;'))+'</div>'
+(note?'<div class="tiny" style="margin-top:-2px">'+note+'</div>':'')
+'<div class="ringbtns">'
+'<button class="sm" onclick="bump(\\''+id+'\\',-1)" aria-label="one less">−</button>'
+'<button class="sm pri" onclick="bump(\\''+id+'\\',1)" aria-label="one more">+</button></div></div>';}

function counterTask(type,emoji,g,openN,cat){
if(!g||!g.goal)return '';
const done=g.done>=g.goal;
return '<div class="task '+(done?'done':'')+'"><div class="box">✓</div>'
+'<div class="grow"><div class="t"><span class="track-ic">'+emoji+'</span>'
+(type==='leetcode'?g.goal+' LeetCode problem'+(g.goal>1?'s':''):type==='applications'?g.goal+' application'+(g.goal>1?'s':''):(cat?cat.name:type)+' \\u00b7 '+g.goal)+'</div>'
+'<div class="d">'+(type==='leetcode'
?'Attempts count here too'+(openN?' · '+openN+' unsolved tr'+(openN>1?'ies':'y'):'')
:'Auto-checks when the counter hits '+g.goal)+(g.done>g.goal?' · +'+(g.done-g.goal)+' extra 💪':'')+'</div></div>'
+'<div class="row" style="gap:8px">'
+'<button class="sm" onclick="event.stopPropagation();bump(\\''+type+'\\',-1)">−</button>'
+'<b class="num" style="min-width:44px;text-align:center">'+g.done+'/'+g.goal+'</b>'
+'<button class="sm pri" onclick="event.stopPropagation();bump(\\''+type+'\\',1)">+</button></div></div>';}

// ---- schedule (timeline v2) ----
const RAIL={grind:'#FF6B35',free:'#5EA2FF',side:'#3DDC97',class:'#9B6EF3',gym:'#3DDC97'};
const BLK_IC={grind:'🔥',free:'🎮',side:'📌',class:'🎓',gym:'🏋️'};
function grindBlocksOf(blocks){return blocks.filter(b=>b.kind==='grind');}
function modulesFor(bIdx){const gb=grindBlocksOf(J.blocks)[bIdx];return gb?((J.budgets||{})[gb.id]||[]):[];}
function scaleMods(mods,total){
const planned=mods.reduce((a,m)=>a+m.m,0)||1;
return mods.map(m=>({t:m.t,m:Math.round(m.m/planned*total/5)*5}));}
function renderBlocks(){
const confirmed=J.sessions.filter(s=>['confirmed','done'].includes(s.status));
const gblocks=grindBlocksOf(J.blocks);
$('blocks').innerHTML=J.blocks.map((b,i)=>{
const dur=blockMin(b.start,b.end,b.endNextDay);
const gIdx=gblocks.indexOf(b);
let sub='',detail='',expandable=false;
if(b.kind==='free'){
const inside=confirmed.filter(s=>{const st=s.start_ts.slice(11,16);return st>=b.start&&st<b.end;});
if(inside.length)sub='<div class="tl2-sub">'+inside.map(s=>(ACT[s.activity]||'')+' '+esc(s.names||s.activity)+' · '+fmtR(s.start_ts.slice(11,16),s.end_ts.slice(11,16))).join('<br>')+'</div>';
}
if(b.kind==='grind'){
expandable=true;
const mods=scaleMods(modulesFor(gIdx),dur);
const logged=(J.grind||[]).filter(g=>g.end_ts&&g.block_label===b.label);
detail='<div class="tl2-detail"><div class="blockpanel" onclick="event.stopPropagation()">'
+'<div class="bp-sec"><div class="bp-label">Inside this block</div><div class="modchips">'
+mods.map(m=>'<span class="modchip" style="border-color:'+MOD[m.t].c+'55"><span>'+MOD[m.t].e+'</span>'+MOD[m.t].n+' <span class="num" style="color:'+MOD[m.t].c+'">'+fmtDur(m.m)+'</span></span>').join('')
+'</div></div>'
+(logged.length?'<div class="bp-sec"><div class="bp-label">Logged today</div><div class="tl2-sub" style="margin-top:0">'
+logged.map(g=>'✅ '+fmtR(g.start_ts.slice(11,16),g.end_ts.slice(11,16))+' · '+fmtDur(gMin(g))+(otMin(g)>0?' · <span style="color:var(--rose)">+'+otMin(g)+'m overtime</span>':'')).join('<br>')+'</div></div>':'')
+'<div class="bp-sec"><div class="bp-actions">'
+(D===TODAY&&!J.active?'<button class="pri sm" onclick="startGrind('+i+')">🔥 Check in</button>':'')
+'<div class="bp-move"><span class="bp-label" style="margin:0">Move to</span>'
+'<input type="time" id="mv-'+i+'" value="'+b.start+'" style="width:auto;padding:8px 8px">'
+'<button class="sm" onclick="moveBlk('+i+')">Move ↷</button>'
+(b.moved?'<button class="ghost sm" onclick="unmoveBlk('+i+')">reset</button>':'')
+'</div></div></div>'
+'</div></div>';
const mods2=scaleMods(modulesFor(gIdx),dur);
sub='<div class="tl2-sub">'+mods2.map(m=>MOD[m.t].e+' '+fmtDur(m.m)).join(' · ')+'</div>';
}
// a solid block that starts inside an earlier solid block is shown nested under it
const abs=x=>{const s=hmMin(x.start);return [s,hmMin(x.end)+((x.endNextDay||hmMin(x.end)<s)?1440:0)];};
const [bs,be]=abs(b);
const over=b.kind==='free'?null:J.blocks.slice(0,i).find(o=>{if(o.kind==='free')return false;const [os,oe]=abs(o);return bs<oe&&be>os;});
return '<div class="tl2-item'+(openBlocks[i]?' open':'')+(over?' tl2-ov':'')+'" id="blk-'+i+'">'
+'<div class="tl2-rail"><span class="bub">'+fmtT(b.start)+'</span>'
+'<div class="tl2-line" style="--rk:'+RAIL[b.kind]+'"><span class="tl2-dur">'+fmtDur(dur)+'</span></div>'
+'<span class="bub">'+fmtT(b.end)+(b.endNextDay?' ⁺¹':'')+'</span></div>'
+'<div class="tl2-body"><div class="tl2-head" '+(expandable?'onclick="toggleBlk('+i+')"':'')+'>'
+'<span>'+(b.emoji||BLK_IC[b.kind])+'</span><span class="lab">'+esc(b.label)+'</span>'
+(over?'<span class="pill" style="background:#3DDC9722;color:var(--mint)" title="at the same time as '+esc(over.label)+'">⧉ with '+esc(over.label)+'</span>':'')
+(b.moved?'<span class="pill" style="background:#FFB34722;color:var(--ember2)">moved</span>':'')
+(expandable?'<span class="tl2-x">›</span>':'')+'</div>'
+sub+detail+'</div></div>';}).join('')||'<div class="skel">Free day</div>';}
function toggleBlk(i){openBlocks[i]=!openBlocks[i];document.getElementById('blk-'+i).classList.toggle('open');}
async function moveBlk(i){
const b=J.blocks[i];
const t=document.getElementById('mv-'+i).value;
if(!t)return;
await api('/api/blockmove',{body:{date:D,label:b.id,start:t}});
toast('↷ '+b.label+' moved to '+fmtT(t)+'. Overlaps pushed');load();}
async function unmoveBlk(i){
await api('/api/blockmove',{body:{date:D,label:J.blocks[i].label,start:null}});
toast('Back to normal schedule');load();}

// ---- grind check-in ----
// effective minutes: wall time minus paused time (a paused session freezes at paused_at)
const gMin=g=>{
const end=g.end_ts?new Date(g.end_ts):(g.paused_at?new Date(g.paused_at):new Date(nowNY()));
return Math.max(1,Math.round((end-new Date(g.start_ts))/60000)-(g.paused_min||0));};
const otMin=g=>{if(!g.planned_end||!g.planned_start)return 0;
const plan=Math.max(1,Math.round((new Date(g.planned_end)-new Date(g.planned_start))/60000));
return Math.max(0,gMin(g)-plan);};
function taskPicker(title,cb){
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">'+title+'</h1>'
+'<p class="muted" style="margin-top:4px">Time counts toward this until you switch.</p>'
+'<div class="taskgrid">'+Object.entries(MOD).map(([k,m])=>
'<button class="taskbtn" data-t="'+k+'" style="--tc:'+m.c+'">'
+'<span style="font-size:24px">'+m.e+'</span>'+m.n+'</button>').join('')+'</div>'
+'<button class="ghost" style="width:100%;margin-top:12px" onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button>'
+'</div></div>';
document.querySelectorAll('.taskbtn').forEach(b=>b.onclick=()=>{$('modalHost').innerHTML='';cb(b.dataset.t);});}
function startGrind(blockIdx){
let body={date:TODAY};
if(blockIdx!==null){const b=J.blocks[blockIdx];
body.block_label=b.label;body.planned_start=TODAY+'T'+b.start;
body.planned_end=(b.endNextDay?nextDs(TODAY):TODAY)+'T'+b.end;}
else body.block_label='Ad-hoc grind';
taskPicker('🔥 What are you starting with?',async task=>{
body.task=task;
try{await api('/api/grind/start',{body});toast(MOD[task].e+' Checked in. Go.');load();gpCheck();}
catch(e){toast(String(e))}});}
function switchTask(){
const a=J.active;if(!a)return;
taskPicker('⇄ Switch to what?',async task=>{
if(task===a.cur_task)return toast('Already on '+MOD[task].n);
try{await api('/api/grind/switch',{body:{id:a.id,task}});toast('⇄ Now on '+MOD[task].e+' '+MOD[task].n);load();gpCheck();}
catch(e){toast(String(e))}});}
function nextDs(ds){const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);}
async function checkout(){
const j=await api('/api/grind/stop',{body:{id:J.active.id}});
clearInterval(liveInt);liveInt=null;
let splits=[];try{splits=JSON.parse(j.session.splits||'[]')}catch(e){}
toast(splits.length?('💪 Saved · '+splits.map(s=>MOD[s.t].e+' '+fmtDur(s.m)).join(' · ')):'💪 Session saved');
load();gpCheck();}
function toggleLgMenu(force){const m=$('lgMenu');m.classList.toggle('on',force===undefined?!m.classList.contains('on'):force);}
document.addEventListener('click',e=>{if(!e.target.closest('.lg-moreWrap'))toggleLgMenu(false);});
async function cancelGrind(){toggleLgMenu(false);const a=J.active;if(!a)return;
if(!confirm('Discard this session? Nothing will be recorded.'))return;
await api('/api/grind/'+a.id,{method:'DELETE'});clearInterval(liveInt);liveInt=null;toast('Session discarded');load();gpCheck();}
function forgotCheckout(){toggleLgMenu(false);const a=J.active;if(!a)return;
const nowHM=nowNY().slice(11,16);
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">⏱ When did you actually stop?</h1>'
+'<p class="muted" style="margin-top:8px">Checked in at <b>'+fmtT(a.start_ts.slice(11,16))+'</b>. The session is saved as if you had checked out then, so the hours stay honest.</p>'
+'<label class="fld" for="fc-time" style="margin-top:16px">Real check-out time</label><input id="fc-time" type="time" value="'+nowHM+'" max="'+nowHM+'">'
+'<div class="hint">A time earlier than the check-in counts as the next day.</div>'
+'<div class="row" style="margin-top:20px;gap:8px"><button class="pri grow" onclick="forgotSave()">Save session</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
setTimeout(()=>$('fc-time').focus(),60);}
async function forgotSave(){const a=J.active;if(!a)return;const end=$('fc-time').value;
if(!/^\\d{2}:\\d{2}$/.test(end))return toast('Pick a time');
try{const j=await api('/api/grind/stop',{body:{id:a.id,end}});$('modalHost').innerHTML='';clearInterval(liveInt);liveInt=null;
let splits=[];try{splits=JSON.parse(j.session.splits||'[]')}catch(e){}
toast(splits.length?('💪 Saved to '+fmtT(end)+' · '+splits.map(s=>MOD[s.t].e+' '+fmtDur(s.m)).join(' · ')):'💪 Session saved to '+fmtT(end));load();gpCheck();}
catch(e){toast(String(e))}}
function renderLive(){
const a=J.active;
$('adhocBtn').style.display=(!a&&D===TODAY)?'':'none';
if(!a){$('liveGrind').style.display='none';if(liveInt){clearInterval(liveInt);liveInt=null;}return;}
$('liveGrind').style.display='';
const paused=!!a.paused_at;
$('lgTitle').textContent=(paused?'⏸ ':'🔒 ')+(a.block_label||'Grind')+(paused?' · paused':'');
const ct=MOD[a.cur_task];
$('lgTask').innerHTML=ct.e+' '+ct.n;
$('lgTask').style.background=ct.c+'22';$('lgTask').style.color=ct.c;
let segs=[];try{segs=JSON.parse(a.splits||'[]')}catch(e){}
$('lgSegs').textContent=segs.length?('done: '+segs.map(s=>MOD[s.t].e+' '+fmtDur(s.m)).join(' · ')):'';
$('lgPause').textContent=paused?'▶ Resume':'⏸ Pause';
$('lgPause').classList.toggle('mint',paused);
$('liveGrind').style.opacity=paused?'.65':'1';
const draw=()=>{
const el=gMin(a);
const meta=fmtDur(el)+' worked'+(a.paused_min?' · '+a.paused_min+'m paused':'');
if(a.planned_end&&a.planned_start){
const plan=Math.max(1,Math.round((new Date(a.planned_end)-new Date(a.planned_start))/60000));
const left=plan-el;
const pct=Math.min(100,el/plan*100);
$('lgFill').style.width=pct+'%';
const ot=otMin(a);
$('lgBar').classList.toggle('ot',ot>0&&!paused);
$('lgOt').style.display=ot>0?'':'none';
$('lgOt').textContent='+'+ot+'m OVERTIME';
$('lgElapsed').textContent=left>0?fmtDur(left)+' left':'+'+fmtDur(-left)+' over';
$('lgElapsed').style.color=left>0?'':'var(--rose)';
$('lgMeta').textContent=meta;
$('lgSub').textContent='Checked in '+fmtT(a.start_ts.slice(11,16))+' · planned '+fmtDur(plan)+(paused?' · time frozen':'');
}else{
$('lgFill').style.width='100%';$('lgBar').classList.remove('ot');$('lgOt').style.display='none';
$('lgElapsed').textContent=fmtDur(el);$('lgElapsed').style.color='';
$('lgMeta').textContent='elapsed'+(a.paused_min?' · '+a.paused_min+'m paused':'');
$('lgSub').textContent='Ad-hoc session · checked in '+fmtT(a.start_ts.slice(11,16))+(paused?' · time frozen':'');}
$('lgFill').style.animationPlayState=paused?'paused':'';};
draw();
if(liveInt)clearInterval(liveInt);
liveInt=paused?null:setInterval(draw,15000);}
async function togglePause(){
const a=J.active;if(!a)return;
try{
await api('/api/grind/'+(a.paused_at?'resume':'pause'),{body:{id:a.id}});
toast(a.paused_at?'▶ Back to it':'⏸ Paused · clock frozen');load();gpCheck();}
catch(e){toast(String(e))}}

// ---- retroactive grind log ----
let LOGSEGS=[];
function openGrindLog(){
LOGSEGS=[{t:FIRSTCAT,m:''}];
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">✍️ Log a grind you forgot to record</h1>'
+'<p class="muted" style="margin-top:4px">For '+(D===TODAY?'today':D)+'.</p>'
+'<label class="fld">Start time</label>'
+'<input id="logStart" type="time" oninput="logSummary()">'
+'<label class="fld">What you did</label>'
+'<div id="logSegs"></div>'
+'<button class="sm" style="margin-top:8px" onclick="LOGSEGS.push({t:FIRSTCAT,m:\\'\\'});renderLogSegs()">＋ task</button>'
+'<div class="card" id="logSum" style="margin:16px 0 0;padding:12px;background:var(--surface2)"></div>'
+'<div class="row" style="margin-top:16px">'
+'<button class="pri grow" onclick="saveGrindLog()">Record it</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
renderLogSegs();
setTimeout(()=>$('logStart').focus(),80);}
function renderLogSegs(){
$('logSegs').innerHTML=LOGSEGS.map((s,i)=>
'<div class="subedit" style="grid-template-columns:1.3fr 1fr auto">'
+'<select onchange="LOGSEGS['+i+'].t=this.value">'
+Object.entries(MOD).map(([k,m])=>'<option value="'+k+'"'+(s.t===k?' selected':'')+'>'+m.e+' '+m.n+'</option>').join('')+'</select>'
+'<input type="number" min="1" max="720" inputmode="numeric" placeholder="minutes" value="'+s.m+'" oninput="LOGSEGS['+i+'].m=this.value;logSummary()">'
+(LOGSEGS.length>1?'<button class="ghost sm" onclick="LOGSEGS.splice('+i+',1);renderLogSegs()">✕</button>':'<span></span>')
+'</div>').join('');
logSummary();}
function logSummary(){
const total=LOGSEGS.reduce((a,s)=>a+(+s.m>0?+s.m:0),0);
const start=$('logStart').value;
let html='';
if(!start)html='<span class="tiny">Pick a start time to see the summary.</span>';
else if(!total)html='<span class="tiny">Starts <b class="num">'+fmtT(start)+'</b> · add task minutes.</span>';
else{
const end=(hmMin(start)+total)%1440;
const endHM=String(Math.floor(end/60)).padStart(2,'0')+':'+String(end%60).padStart(2,'0');
html='<div class="row"><span>🔥 Total <b class="num">'+fmtDur(total)+'</b></span><span class="grow"></span>'
+'<span class="num">'+fmtT(start)+' → '+fmtT(endHM)+(hmMin(start)+total>=1440?' ⁺¹':'')+'</span></div>';}
$('logSum').innerHTML=html;}
async function saveGrindLog(){
const start=$('logStart').value;
if(!start)return toast('Start time is required');
const segs=LOGSEGS.map(s=>({t:s.t,m:+s.m})).filter(s=>s.m>0);
if(!segs.length)return toast('Enter minutes for at least one task');
try{
const j=await api('/api/grind/log',{body:{date:D,start,segments:segs}});
$('modalHost').innerHTML='';
toast('✍️ '+fmtDur(j.total)+' recorded · '+segs.map(s=>MOD[s.t].e+' '+fmtDur(s.m)).join(' · '));load();}
catch(e){toast(String(e))}}

// ---- today in numbers ----
function renderDayStats(){
const sessions=J.grind||[];
const byTask={};let total=0,overtime=0,paused=0;
const addSeg=(t,m)=>{if(m>0){byTask[t]=(byTask[t]||0)+m;}};
for(const g of sessions){
total+=gMin(g);overtime+=otMin(g);paused+=(g.paused_min||0);
let segs=[];try{segs=JSON.parse(g.splits||'[]')}catch(e){}
let banked=0;
for(const s of segs){addSeg(s.t,s.m);banked+=s.m;}
// running segment of an active session isn't in splits yet
if(!g.end_ts&&g.cur_task){const live=Math.max(0,gMin(g)-banked);addSeg(g.cur_task,live);}}
const solves=(J.solves||[]).filter(s=>+s.finished!==0);
const attempts=(J.solves||[]).length-solves.length;
const lcAvg=solves.length?Math.round(solves.reduce((a,s)=>a+s.minutes,0)/solves.length):0;
const apps=(J.goals.applications||{}).done||0;
const appsGoal=(J.goals.applications||{}).goal||0;
const lcGoal=(J.goals.leetcode||{}).goal||0;
const lcDone=(J.goals.leetcode||{}).done||0;
const maxT=Math.max(1,...Object.values(byTask));
const order=CATS.map(c=>c.key).concat(Object.keys(byTask).filter(k=>!CATS.some(c=>c.key===k))).filter(k=>byTask[k]);
$('dayStats').innerHTML=
'<div class="dstat-top">'
+'<div class="dstat"><b class="num">'+(total?fmtDur(total):'0m')+'</b><span>grind time 🔥</span></div>'
+'<div class="dstat"><b class="num">'+lcDone+(lcGoal?'<small>/'+lcGoal+'</small>':'')+'</b><span>🧩 problems</span></div>'
+'<div class="dstat"><b class="num">'+apps+(appsGoal?'<small>/'+appsGoal+'</small>':'')+'</b><span>📨 applications</span></div>'
+'<div class="dstat"><b class="num">'+sessions.length+'</b><span>sessions</span></div>'
+'</div>'
+(order.length?'<div class="bp-label" style="margin-top:16px">Where the time went</div>'
+order.map(k=>'<div class="funnel-row"><span class="fl">'+MOD[k].e+' '+MOD[k].n+'</span>'
+'<div class="fb" style="width:'+Math.max(8,byTask[k]/maxT*100)+'%;background:'+MOD[k].c+'">'+fmtDur(byTask[k])+'</div></div>').join('')
:'<div class="skel" style="padding:12px 0">No grind logged yet today. Check in and the split shows up here.</div>')
+'<div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px">'
+(solves.length?'<span class="chip">🧩 avg '+fmtDur(lcAvg)+'/problem</span>':'')
+(attempts?'<span class="chip" style="color:var(--ember2)">🧩 +'+attempts+' attempt'+(attempts>1?'s':'')+'</span>':'')
+(overtime?'<span class="chip" style="color:var(--rose)">+'+fmtDur(overtime)+' overtime</span>':'')
+(paused?'<span class="chip" style="color:var(--ink3)">⏸ '+fmtDur(paused)+' paused'
+'<button class="ghost sm" style="padding:0 4px;width:auto;color:var(--mint)" title="Count this as grind time" onclick="reclaimPaused('+paused+')">✕</button></span>':'')
+(J.active?'<span class="chip" style="color:var(--ember)">🔥 session running</span>':'')
+'</div>';}

// ---- clock ----
function pol(cx,cy,r,deg){const a=(deg-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];}
function arcPath(cx,cy,r,a1,a2){
if(a2<=a1)a2+=360;
const large=(a2-a1)>180?1:0;
const[x1,y1]=pol(cx,cy,r,a1),[x2,y2]=pol(cx,cy,r,a2);
return 'M '+x1+' '+y1+' A '+r+' '+r+' 0 '+large+' 1 '+x2+' '+y2;}
const dialDeg=m=>(m/720)*360;
// split an absolute [s,e] minute range into dial pieces (0..720 space)
function dialPieces(s,e){
const span=Math.min(e-s,719);
const a=s%720;
return a+span<=720?[[a,a+span]]:[[a,720],[0,a+span-720]];}
const ivInter=(a,b)=>{const s=Math.max(a[0],b[0]),e=Math.min(a[1],b[1]);return s<e?[s,e]:null;};
function ivSubtract(seg,cuts){
let parts=[seg];
for(const c of cuts){const np=[];
for(const p of parts){const iv=ivInter(p,c);
if(!iv){np.push(p);continue;}
if(p[0]<iv[0]-0.01)np.push([p[0],iv[0]]);
if(iv[1]<p[1]-0.01)np.push([iv[1],p[1]]);}
parts=np;}
return parts;}
const CLOCK_DESIGNS={
ember:{name:'Ember',face:'#10151F',rim:'#263045',tickMin:'rgba(237,241,247,.13)',tickHr:'rgba(237,241,247,.55)',num:'#97A3B6',numFont:'Archivo',
colors:{grind:'#FF6B35',free:'#5EA2FF','class':'#9B6EF3',gym:'#3DDC97'},hand:'#EDF1F7',glow:false,txt:'#97A3B6'},
neon:{name:'Neon',face:'#06080F',rim:'#12203A',tickMin:'rgba(125,249,255,.12)',tickHr:'rgba(125,249,255,.5)',num:'#7DF9FF',numFont:'Archivo',
colors:{grind:'#FF2E88',free:'#00E5FF','class':'#B388FF',gym:'#39FF88'},hand:'#7DF9FF',glow:true,txt:'#7DF9FF'},
mono:{name:'Mono',face:'#0E1114',rim:'#2A2F36',tickMin:'rgba(255,255,255,.10)',tickHr:'rgba(255,255,255,.6)',num:'#C9D1D9',numFont:'Atkinson Hyperlegible',
colors:{grind:'#EDF1F7',free:'#79828E','class':'#565E68',gym:'#AEB8C4'},hand:'#FFFFFF',glow:false,txt:'#8B949E'},
sunset:{name:'Sunset',face:'#191016',rim:'#3A2230',tickMin:'rgba(255,214,165,.15)',tickHr:'rgba(255,214,165,.6)',num:'#FFD6A5',numFont:'Archivo',
colors:{grind:'#FF5D73',free:'#FFB347','class':'#C77DFF',gym:'#FFD166'},hand:'#FFD6A5',glow:false,txt:'#D9A98C'},
terminal:{name:'Terminal',face:'#070D08',rim:'#173322',tickMin:'rgba(61,220,151,.15)',tickHr:'rgba(61,220,151,.65)',num:'#3DDC97',numFont:'Consolas, monospace',
colors:{grind:'#3DDC97',free:'#1E9E68','class':'#8AF5C2',gym:'#0F7A4C'},hand:'#3DDC97',glow:true,txt:'#2FBF83'},
};
for(const dz of Object.values(CLOCK_DESIGNS))dz.colors.side=dz.colors.gym;
function renderClock(){
const CK=(J.clock)||{design:'ember',size:360,font:12,accent:''};
const DS=CLOCK_DESIGNS[CK.design]||CLOCK_DESIGNS.ember;
const col=Object.assign({},DS.colors);
// the hand keeps the design colour; the accent only recolours the planned grind blocks
const hand=DS.hand;
if(CK.accent)col.grind=CK.accent;
// sessions you checked in to yourself: thin inner arcs, green unless customised
col.logged=CK.logged||'#3DDC97';
const C=150,R=100,W=24,FACE=146;
const nowAbs=D===TODAY?hmMin(nowNY().slice(11,16)):null;
const items=[];
for(const b of J.blocks){
const s=hmMin(b.start),e=hmMin(b.end)+((b.endNextDay||hmMin(b.end)<hmMin(b.start))?1440:0);
items.push({s,e,color:col[b.kind]||'#888',emoji:b.emoji||BLK_IC[b.kind]});}
const inner=[];
for(const ses of J.sessions.filter(x=>['confirmed','done'].includes(x.status))){
const s=hmMin(ses.start_ts.slice(11,16)),e=hmMin(ses.end_ts.slice(11,16));
inner.push({s,e:e<s?e+1440:e,color:col.free});}
for(const g of (J.grind||[]).filter(g=>g.end_ts)){
const s=hmMin(g.start_ts.slice(11,16)),e=hmMin(g.end_ts.slice(11,16));
inner.push({s,e:e<s?e+1440:e,color:col.logged});}
const dist=it=>{
if(nowAbs===null)return it.s;
if(nowAbs>=it.s&&nowAbs<it.e)return 0;
return nowAbs<it.s?it.s-nowAbs:nowAbs-it.e;};
items.forEach((it,i)=>{it.d=dist(it);it.i=i;it.pieces=dialPieces(it.s,it.e);});
let svg='<svg width="'+CK.size+'" height="'+CK.size+'" viewBox="0 0 300 300" role="img" aria-label="Day clock" style="width:min('+CK.size+'px,100%);height:auto;display:block;margin:0 auto">';
if(DS.glow)svg+='<defs><filter id="ckglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
// face
svg+='<circle cx="'+C+'" cy="'+C+'" r="'+FACE+'" fill="'+DS.face+'" stroke="'+DS.rim+'" stroke-width="2"/>';
svg+='<circle cx="'+C+'" cy="'+C+'" r="'+(R+W/2+4)+'" fill="none" stroke="'+DS.rim+'" stroke-width="1" opacity=".5"/>';
// ticks: 60 thin minute lines, thick hour lines
for(let m=0;m<60;m++){
const deg=m*6,hr=m%5===0;
const[x1,y1]=pol(C,C,hr?130:136,deg),[x2,y2]=pol(C,C,142,deg);
svg+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(hr?DS.tickHr:DS.tickMin)+'" stroke-width="'+(hr?2.4:0.8)+'" stroke-linecap="round"/>';}
// numbers
for(let h=1;h<=12;h++){const[nx,ny]=pol(C,C,118,h*30);
svg+='<text x="'+nx+'" y="'+(ny+CK.font*0.36)+'" text-anchor="middle" font-size="'+CK.font+'" font-weight="800" fill="'+DS.num+'" font-family="'+DS.numFont+'">'+h+'</text>';}
const g0=DS.glow?' filter="url(#ckglow)"':'';
const arc=(r,w,op,color,p)=>svg+='<path d="'+arcPath(C,C,r,dialDeg(p[0]),dialDeg(p[1]))+'" stroke="'+color+'" stroke-width="'+w+'" fill="none" stroke-linecap="butt" opacity="'+op+'"'+g0+'/>';
// two things at the same time: the one nearer to "now" keeps the main band, the other
// moves to its own thinner ring closer to the centre, so both stay readable
const IR=R-W*0.9,IW=W*0.4;
for(const it of items){it.demoted=0;
for(const piece of it.pieces){
const overlaps=[];
for(const other of items){
if(other.i===it.i)continue;
for(const op of other.pieces){
const iv=ivInter(piece,op);
if(iv)overlaps.push({iv,other});}}
for(const p of ivSubtract(piece,overlaps.map(o=>o.iv)))arc(R,W,.9,it.color,p);
for(const o of overlaps){
const win=it.d<o.other.d||(it.d===o.other.d&&it.i<o.other.i);
if(win)arc(R,W,.95,it.color,o.iv);
else{arc(IR,IW,.9,it.color,o.iv);it.demoted+=o.iv[1]-o.iv[0];}}}}
for(const it of items){
const midDeg=dialDeg(((it.s+it.e)/2)%720);
const inner=it.demoted>=(it.e-it.s)*0.5;
if(inner){
const[ex,ey]=pol(C,C,IR,midDeg-5);
svg+='<text x="'+ex+'" y="'+(ey+4)+'" text-anchor="middle" font-size="10">'+it.emoji+'</text>';
if(it.e-it.s>=60){const[dx,dy]=pol(C,C,IR,midDeg+9);
svg+='<text x="'+dx+'" y="'+(dy+3)+'" text-anchor="middle" font-size="7.5" font-weight="700" fill="'+DS.txt+'" font-family="Archivo">'+fmtDur(it.e-it.s)+'</text>';}
continue;}
const[ex,ey]=pol(C,C,R,midDeg);
svg+='<text x="'+ex+'" y="'+(ey+5)+'" text-anchor="middle" font-size="14">'+it.emoji+'</text>';
if(it.e-it.s>=75){const[dx,dy]=pol(C,C,R-20,midDeg);
svg+='<text x="'+dx+'" y="'+(dy+3)+'" text-anchor="middle" font-size="9" font-weight="700" fill="'+DS.txt+'" font-family="Archivo">'+fmtDur(it.e-it.s)+'</text>';}}
for(const it of inner){
for(const p of dialPieces(it.s,it.e))
svg+='<path d="'+arcPath(C,C,R-W-7,dialDeg(p[0]),dialDeg(p[1]))+'" stroke="'+it.color+'" stroke-width="9" fill="none" stroke-linecap="butt" opacity=".9"'+g0+'/>';}
if(D===TODAY){const nm=hmMin(nowNY().slice(11,16));
const[hx,hy]=pol(C,C,R-W/2-22,dialDeg(nm%720));
svg+='<line x1="'+C+'" y1="'+C+'" x2="'+hx+'" y2="'+hy+'" stroke="'+hand+'" stroke-width="2.5" stroke-linecap="round" opacity=".85"'+g0+'/>';
svg+='<circle cx="'+C+'" cy="'+C+'" r="4.5" fill="'+hand+'"/>';}
svg+='</svg>';
$('clockSvg').innerHTML=svg;
// a big clock deserves the full width, not the 380px side column
const sec=$('clockSection'),cols=document.querySelector('.cols');
if(CK.size>520&&sec.parentElement.id==='colA')cols.parentElement.insertBefore(sec,cols);
else if(CK.size<=520&&sec.parentElement.id!=='colA')document.getElementById('colA').insertBefore(sec,document.getElementById('colA').children[1]);}

// ---- main load ----
async function load(){
J=await api('/api/day?date='+D);
history.replaceState(null,'','/?date='+D);
const dd=new Date(D+'T12:00:00Z');
$('dtitle').textContent=D===TODAY?'Today':dd.toLocaleDateString('en-US',{weekday:'long',timeZone:'UTC'});
$('dsub').innerHTML=esc(dd.toLocaleDateString('en-US',{month:'long',day:'numeric',weekday:'short',timeZone:'UTC'}))
+(D!==TODAY?' <button class="backtoday" onclick="goToday()">↩ back to today</button>':'');
if(J.phase){$('phase').textContent=J.phase.name;$('phase').style.background=J.phase.color+'22';$('phase').style.color=J.phase.color;}
else $('phase').textContent='';
$('streak').style.display=J.streak>0?'':'none';
$('streak').innerHTML='🔥 <b class="num">'+J.streak+'</b>&nbsp;day streak';
const LAY=J.layouts||[];const layIc=n=>/night/i.test(n)?'🌙':/morning/i.test(n)?'☀️':/low/i.test(n)?'🪫':'🗓';
$('modeT').style.display=LAY.length>1||J.lowLoad?'':'none';
$('modeT').textContent=J.lowLoad?'🪫 low load':layIc(J.mode)+' '+J.mode;
$('modeT').onclick=async()=>{if(J.lowLoad)return toast('Low-load phase: the low layout applies on these dates');
const i=LAY.indexOf(J.baseMode);const next=LAY[(i+1)%LAY.length];
await api('/api/mode',{body:{layout:next}});toast(layIc(next)+' '+next+' is now the default layout');load();};
raceBar($('race'),J.phases,D);
const SV=J.solves||[];
const lcCleanT=SV.filter(s=>+s.finished===1).length,lcSlowT=SV.filter(s=>+s.finished===2).length,lcOpenT=SV.filter(s=>+s.finished===0).length;
const lcNote=(lcSlowT||lcOpenT)?[
lcCleanT?'<b style="color:var(--mint)">'+lcCleanT+' solved</b>':'',
lcSlowT?'<b style="color:var(--violet)">'+lcSlowT+' slow</b>':'',
lcOpenT?'<b style="color:var(--ember2)">'+lcOpenT+' unsolved</b>':''].filter(Boolean).join(' · '):'';
const CJ=J.categories||[];
const withGoal=CJ.filter(c=>{const g=J.goals[c.key]||{};return g.goal>0||g.done>0;});
const showCats=withGoal.length?withGoal:CJ.slice(0,2);
$('rings').innerHTML=showCats.map(c=>'<div class="card ringcard">'+ringCard(c.key,c.emoji+' '+esc(c.name),J.goals[c.key]||{goal:0,done:0},c.color,c.builtin==='leetcode'?lcNote:'')+'</div>').join('');
$('rings').classList.toggle('few',showCats.length<=2);
const rows=CJ.map(c=>counterTask(c.key,c.emoji,J.goals[c.key],c.builtin==='leetcode'?lcOpenT:0,c)).join('')
+J.tasks.map(t=>{
if(t.status==='hold')return '<div class="task hold">'
+'<div class="box" style="border-style:dashed">⏸</div><div class="grow"><div class="t"><span class="track-ic">'+(TRACK[t.track]||'📖')+'</span>'+esc(t.title)+'</div>'
+'<div class="d">On hold</div></div>'
+'<button class="sm" onclick="resumeTask('+t.id+')">↺ Resume</button></div>';
return '<div class="task '+(t.status==='done'?'done':'')+'" onclick="toggle('+t.id+')" role="checkbox" aria-checked="'+(t.status==='done')+'" tabindex="0">'
+'<div class="box">✓</div><div class="grow"><div class="t"><span class="track-ic">'+(TRACK[t.track]||'📖')+'</span>'+esc(t.title)+'</div>'
+(t.detail?'<div class="d">'+esc(t.detail)+'</div>':'')+'</div>'
+(t.shiftable?'':'<span class="tiny" title="pinned date">📌</span>')+'<button class="ghost sm" style="padding:0 8px" onclick="event.stopPropagation();delTask('+t.id+')" aria-label="delete task">\u2715</button></div>';}).join('');
$('tasks').innerHTML=(rows||'<div class="skel">Nothing planned for this day. Anything you log still counts.</div>')+'<div id="ntask" class="row" style="margin-top:12px"><button class="sm" onclick="addTaskUI()">\uFF0B Add task</button></div>';
// off day state
$('offBtn').style.display=(!J.offDay&&D>=TODAY)?'':'none';
$('offStrip').style.display=J.offDay?'':'none';
if(J.offDay)$('offReasonTxt').textContent=(J.offDay.reason?'“'+J.offDay.reason+'” · ':'')+'goals forgiven. Grind anyway if you feel like it.';
// backlog catch-up (today only)
const bl=J.backlog;
$('backlogBanner').style.display=(bl&&bl.n>0&&D===TODAY)?'':'none';
if(bl&&bl.n>0)$('backlogTxt').textContent=bl.n+' unfinished task'+(bl.n>1?'s':'')+' from earlier days';
$('shift').style.display=J.canShift?'':'none';
renderBlocks();
renderLive();
if(J.modules&&J.modules.clock===false){$('clockSection').style.display='none';}else renderClock();
renderDayStats();
const pend=await notifyBadge();
$('notifBanner').style.display=pend>0?'':'none';
if(pend>0)$('notifTxt').textContent=pend+(pend===1?' friend wants':' friends want')+' time with you';
if(!timerInit){timerInit=true;
const def=String(J.timerDefault||25);
const TO=((window.__U&&window.__U.timerOptions)||[10,15,20,25,50]).map(Number);if(!TO.includes(+def))TO.unshift(+def);$('tlen').innerHTML=TO.map(m=>'<option value="'+m+'">'+m+' min</option>').join('');
if(!tRead())$('tlen').value=def;
tRestore();}
}
// paused time you never meant to keep: fold it back into the task that was running
async function reclaimPaused(mins){
if(!confirm('Count '+fmtDur(mins)+' of paused time as real grind time?\\n\\nIt goes to whatever task was running when you paused. This cannot be undone.'))return;
try{const j=await api('/api/grind/reclaim',{body:{date:D}});
toast('🔥 '+fmtDur(j.minutes)+' moved back into grind');load();}
catch(e){toast(String(e))}}
async function toggle(id){await api('/api/task/'+id+'/toggle',{});load();}
async function resumeTask(id){event.stopPropagation();await api('/api/tasks/bulk',{body:{ids:[id],action:'todo'}});toast('↺ Back on the list');load();}
async function bulkBacklog(action){
const bl=J.backlog;if(!bl||!bl.n)return;
await api('/api/tasks/bulk',{body:{ids:bl.ids,action}});
toast(action==='today'?('🎒 '+bl.n+' task'+(bl.n>1?'s':'')+' moved to today'):'⏸ Parked on hold');load();}
async function offDayFlow(){
let chips=[];
try{chips=(await api('/api/offday/reasons')).reasons;}catch(e){}
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">💤 Mark '+(D===TODAY?'today':D)+' as an off day</h1>'
+'<p class="muted" style="margin-top:4px">Goals are forgiven for this day and the streak skips it. You can still grind whenever you want.</p>'
+'<label class="fld">Reason</label><input id="offReason" placeholder="migraine / family / event…" maxlength="80">'
+(chips.length?'<div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px">'+chips.map(r=>
'<button class="chip" style="cursor:pointer" onclick="$(\\'offReason\\').value=this.dataset.r" data-r="'+esc(r.reason)+'">'+esc(r.reason)+' <span class="tiny">×'+r.n+'</span></button>').join('')+'</div>':'')
+'<div class="row" style="margin-top:20px">'
+'<button class="pri grow" onclick="saveOffDay()">Mark off day</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
setTimeout(()=>$('offReason').focus(),80);}
async function saveOffDay(){
const reason=$('offReason').value.trim();
if(!reason)return toast('Give a reason, future-you wants to know');
try{await api('/api/offday',{body:{date:D,reason}});$('modalHost').innerHTML='';toast('💤 Off day marked. Rest well.');load();}
catch(e){toast(String(e))}}
async function undoOffDay(){
await api('/api/offday/'+D,{method:'DELETE'});toast('Back on. Goals restored.');load();}
function addTaskUI(){
$('ntask').innerHTML='<div class="item nt" style="--ac:var(--ember)">'
+'<div class="ihead"><span class="tile">\uD83D\uDCDD</span><div class="who"><b>New task</b><div class="tiny">Shows in this day\u2019s list and counts toward tasks done.</div></div></div>'
+'<div class="ibody"><div class="fg"><label class="fld" for="nt-title">Task</label><input id="nt-title" maxlength="120" placeholder="Finish the graph assignment" autocomplete="off"></div>'
+'<div class="fg"><label class="fld" for="nt-detail">Details <span class="opt">optional</span></label><textarea id="nt-detail" rows="2" maxlength="500" placeholder="Anything future-you should know"></textarea></div>'
+'<div class="togrow"><div class="grow"><b>Pin to this date</b><div class="tiny">Pinned tasks stay on this day. Unpinned ones move forward with the plan when you shift it.</div></div><div class="toggle" id="nt-pin" role="switch" tabindex="0" aria-checked="false" aria-label="pin to this date"></div></div></div>'
+'<div class="cardfoot"><button class="ghost sm" onclick="load()">Cancel</button><button class="pri sm" id="nt-save" onclick="saveNewTask()">Add task</button></div></div>';
const pin=$('nt-pin');const flip=()=>{const on=!pin.classList.contains('on');pin.classList.toggle('on',on);pin.setAttribute('aria-checked',on);};
pin.onclick=flip;pin.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip();}};
const esc=e=>{if(e.key==='Escape'){e.preventDefault();load();}};
$('nt-title').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();saveNewTask();}else esc(e);};
$('nt-detail').onkeydown=esc;
$('nt-title').focus();}
async function saveNewTask(){const title=$('nt-title').value.trim();const inp=$('nt-title');
if(!title){inp.classList.add('err');inp.focus();return toast('Give the task a name');}
const btn=$('nt-save');btn.classList.add('busy');
try{await api('/api/task',{body:{title,detail:$('nt-detail').value,date:D,pinned:$('nt-pin').classList.contains('on')}});toast('Task added');load();}
catch(e){btn.classList.remove('busy');toast(String(e))}}
async function delTask(id){if(!confirm('Delete this task?'))return;await api('/api/task/'+id,{method:'DELETE'});load();}
async function bump(t,n){
if(t==='leetcode'&&n>0)return openLcLog({},lcCtx());   // every +1 must carry difficulty + time
await api('/api/goal',{body:{date:D,type:t,delta:n}});load();}
async function doShift(){
try{const j=await api('/api/shift',{body:{from:D}});toast('🔥 '+j.shifted+' tasks pulled forward');load();}
catch(e){toast(String(e))}}
// ---- focus timer + LeetCode log live in the shared runtime (theme.js) ----
// this page only tells them what it is timing and what to refresh afterwards
window.__TIMER_CTX=()=>({date:D,hasActiveGrind:!!(J&&J.active),record:$('lcRec').checked,
name:$('lcName').value.trim(),
difficulty:(document.querySelector('#lcDiff button.on')||{dataset:{}}).dataset.d||'medium',
onSaved:()=>{if($('lcRec').checked){$('lcRec').checked=false;lcRecToggle();$('lcName').value='';}load();}});
function lcCtx(){return window.__TIMER_CTX();}

function lcRecToggle(){
const on=$('lcRec').checked;
$('lcRecFields').style.display=on?'':'none';
if(on)document.querySelectorAll('#lcDiff button').forEach(b=>b.onclick=()=>{
document.querySelectorAll('#lcDiff button').forEach(x=>x.classList.remove('on'));b.classList.add('on');});}

document.addEventListener('keydown',e=>{if(e.target.matches('.task')&&(e.key===' '||e.key==='Enter')){e.preventDefault();e.target.click();}});
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
