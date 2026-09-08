import { shell } from './theme.js';

// LeetCode workspace: pick a problem, see what you already learned, time the attempt,
// take structured notes, and sketch arrays with their indices.
export const leetcodePage = (cfg) => shell('LockIn · LeetCode', '/leetcode', `
<style>@media(min-width:1000px){.wrap{max-width:1240px}}@media(min-width:1500px){.wrap{max-width:1420px}}</style>
<div class="ph"><div class="ph-t"><h1>LeetCode</h1><p class="ph-d">Pick a problem, run the timer, log how it went. A problem's state is its newest attempt.</p></div></div>
<div class="tabbar" id="tabs">
  <button data-t="solve" class="on">🧩 Solve</button>
  <button data-t="stats">📊 Stats</button>
</div>

<section class="tabpane on" data-t="solve">
 <div class="lcgrid">
  <div class="full">
  <div class="card acc" id="lkAcc" style="margin-top:14px">
    <div class="acc-h" id="lkHead">
      <div class="grow" style="min-width:0"><b>🔗 My LeetCode tabs</b><div class="tiny" id="lkCount" style="margin-top:2px">the sites you open every session</div></div>
      <span class="tl2-x">›</span>
    </div>
    <div class="acc-b" style="margin-top:14px">
      <div class="row" style="justify-content:flex-end">
        <button class="sm" onclick="openLink()">＋ Link</button>
        <button class="pri sm" id="openAllBtn" onclick="openAll()" style="display:none">🚀 Open all</button>
      </div>
      <div class="snipgrid" id="links"></div>
    </div>
  </div>
  <h2>Problem</h2>
  <div class="card">
    <input id="pkName" autocomplete="off" placeholder="Type the problem name, matches appear below">
    <div id="pkMatch" class="tiny" style="margin-top:6px;min-height:16px"></div>
    <div id="pkSug"></div>
    <div id="probHead"></div>
  </div>
  </div>

  <div>
  <h2>Focus timer</h2>
  <div class="card"><div class="timer-wrap">
    <div class="tring"><svg width="190" height="190" viewBox="0 0 190 190">
      <circle cx="95" cy="95" r="85" fill="none" stroke="var(--surface2)" stroke-width="9"/>
      <circle id="tarc" cx="95" cy="95" r="85" fill="none" stroke="url(#tg2)" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="534" stroke-dashoffset="0"/>
      <defs><linearGradient id="tg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#FFB347"/></linearGradient></defs>
    </svg><div class="tv num"><span id="tmr">25:00</span><span class="tsub" id="tsub"></span></div></div>
    <div class="row" id="tbtns">
      <button class="pri" id="tgo" onclick="tPrimary()">Start</button>
      <button id="tpause" onclick="tPause()" style="display:none">⏸ Pause</button>
      <button id="treset" onclick="tReset()">Reset</button>
      <select id="tlen" style="width:auto" onchange="tReset()"></select>
    </div>
    <div style="width:100%;max-width:300px">
      <div class="seg-ctl" id="lcDiff">
        <button data-d="easy">Easy</button><button data-d="medium" class="on">Medium</button><button data-d="hard">Hard</button>
      </div>
    </div>
    <p class="tiny" id="tHint" style="text-align:center">Pick the problem first, then start. Done opens the log.</p>
  </div></div>
  </div>

  <div>
  <div class="sech">
    <h2>Notes</h2>
    <span class="savetick" id="saveTick">&nbsp;</span>
  </div>
  <div class="card" id="noteCard"><div class="skel">Pick a problem to open its notes.</div></div>
  </div>

  <div class="full">
  <p class="hint" id="noteHelp" style="margin-top:6px">Enter = next point · Tab = sub-point · Shift+Tab = back out · Shift+Enter = new line in the same point · \`\`\` = code box</p>

  <h2>Array visualizer</h2>
  <div class="card">
    <div class="row" style="flex-wrap:wrap;gap:8px">
      <input id="arLabel" style="width:110px;flex:0 0 auto" placeholder="name" maxlength="16">
      <input id="arVals" class="grow" placeholder="[2,7,11,15]  or just  6" style="min-width:150px">
      <button class="pri sm" id="arAdd">＋ Array</button>
    </div>
    <div id="arrHost"></div>
  </div>
  </div>
 </div>
</section>

<section class="tabpane" data-t="stats">
  <div class="statgrid" style="margin-top:14px">
    <div class="stat"><b class="num" id="stSolved" style="color:var(--mint)">–</b><span>problems solved</span></div>
    <div class="stat"><b class="num" id="stOpen" style="color:var(--ember2)">–</b><span>still unsolved</span></div>
    <div class="stat"><b class="num" id="stSlow" style="color:var(--violet)">–</b><span>solved, slow</span></div>
    <div class="stat"><b class="num" id="stTries">–</b><span>tries logged</span></div>
  </div>
  <div class="stgrid">
    <div><h2>Toughest problems</h2><p class="hint" id="stAvg" style="margin:-6px 0 10px"></p>
    <div class="card" id="stTough"><div class="skel">Loading…</div></div></div>
    <div><h2>Come back to these</h2>
    <div class="card" id="stOpenList"><div class="skel">Loading…</div></div></div>
  </div>
  <h2>All problems</h2>
  <div class="card">
    <input id="stSearch" placeholder="🔍 Search names and note text" autocomplete="off">
    <div id="stAll" style="margin-top:10px"><div class="skel">Loading…</div></div>
  </div>
</section>

<div id="modalHost"></div>
`, `<script>
// ---- page state ----
const TODAY=todayU();
let PROB='',NB=[],ARR=[],META=null,STATS=null,HASGRIND=false,SEL=null;
const fmtD=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const mins=m=>m?fmtDur(m):'–';

// the shared timer asks the page what it is timing
window.__TIMER_CTX=()=>({date:TODAY,hasActiveGrind:HASGRIND,record:!!PROB,name:PROB,
difficulty:(document.querySelector('#lcDiff button.on')||{dataset:{}}).dataset.d||'medium',
onSaved:()=>{if(PROB)loadProblem(PROB,true);}});

// ---- tabs ----
const TK='lc_tab';
function setTab(t){localStorage.setItem(TK,t);
document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
document.querySelectorAll('.tabpane').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
if(t==='stats')loadStats();}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
// restore the last tab before anything is fetched, so Stats never flashes Solve first
setTab(localStorage.getItem(TK)||'solve');
document.querySelectorAll('#lcDiff button').forEach(b=>b.onclick=()=>{
document.querySelectorAll('#lcDiff button').forEach(x=>x.classList.remove('on'));b.classList.add('on');});

// ---- problem picker (reuses the shared LCNAMES list) ----
function pkSuggest(){
const q=lcNorm($('pkName').value),box=$('pkSug'),m=$('pkMatch');
if(!q){box.innerHTML='';m.innerHTML='<span style="color:var(--ink3)">Or start a brand new problem by typing its name.</span>';return;}
const exact=LCNAMES.find(n=>lcNorm(n.name)===q);
const hits=LCNAMES.filter(n=>lcNorm(n.name)!==q&&lcNorm(n.name).indexOf(q)>=0).slice(0,6);
const near=(exact||hits.length)?null:lcNear($('pkName').value);
PKNEAR=near;
m.innerHTML=exact?'<span style="color:var(--mint);font-weight:700">✓ Matched \\u201c'+esc(exact.name)+'\\u201d</span>'
:(hits.length?'<span style="color:var(--ember2)">'+hits.length+' similar below. Tap one so notes and tries stack together.</span>'
:near?nearHTML(near,'pkUseNear()')
:'<span style="color:var(--ink3)">New problem. Press Open to start its notes.</span>');
box.innerHTML='<div class="acbox">'+hits.map(n=>
'<button type="button" class="acitem" data-n="'+esc(n.name)+'">'
+'<span class="diff '+n.difficulty+'">'+n.difficulty.toUpperCase()+'</span>'
+'<span class="grow" style="min-width:0">'+esc(n.name)+'</span>'
+'<span class="tiny num">×'+n.tries+'</span>'
+(n.solved?'<span class="tiny" style="color:var(--mint)">solved</span>':'<span class="tiny" style="color:var(--ember2)">open</span>')
+'</button>').join('')+'</div>'
+(exact?'':'<button class="pri sm" id="pkOpen" style="margin-top:8px">Open “'+esc($('pkName').value.trim())+'”</button>');
box.querySelectorAll('.acitem').forEach(b=>b.onclick=()=>{$('pkName').value=b.dataset.n;loadProblem(b.dataset.n);});
if($('pkOpen'))$('pkOpen').onclick=()=>loadProblem($('pkName').value.trim());
if(exact&&exact.name!==PROB)loadProblem(exact.name);}
$('pkName').addEventListener('input',pkSuggest);

async function loadProblem(name,quiet){
name=String(name||'').replace(/\\s+/g,' ').trim();
if(!name)return;
if(!quiet)await flushSave();
let j;
try{j=await api('/api/lc/note?name='+encodeURIComponent(name));}catch(e){return toast(String(e))}
PROB=j.name;META=j;NB=j.blocks&&j.blocks.length?j.blocks:[{type:'text',body:''}];ARR=j.arrays||[];
$('pkName').value=j.name;$('pkSug').innerHTML='';$('pkMatch').innerHTML='';
document.querySelectorAll('#lcDiff button').forEach(x=>x.classList.toggle('on',x.dataset.d===j.difficulty));
$('probHead').innerHTML='<div class="probhead">'
+'<span class="diff '+j.difficulty+'">'+j.difficulty.toUpperCase()+'</span>'
+'<b style="font-size:17px">'+esc(j.name)+'</b>'
+outBadge(j.latest,true)
+'</div>'
+'<div class="row" style="gap:14px;flex-wrap:wrap;margin-top:8px">'
+'<span class="tiny"><b class="num">×'+j.tries+'</b> tr'+(j.tries===1?'y':'ies')+'</span>'
+'<span class="tiny"><b class="num">'+mins(j.totalMin)+'</b> total</span>'
+(j.last?'<span class="tiny">last '+fmtD(j.last)+'</span>':'')
+'</div>'
+(j.history.length?'<div style="margin-top:8px">'+j.history.slice(0,6).map(h=>
'<div class="exp-row"><span class="num" style="color:var(--ink2);min-width:74px">'+fmtD(h.date)+'</span>'
+'<b class="num">'+fmtDur(h.minutes)+'</b>'
+'<span class="grow"></span>'
+outBadge(h.finished)
+'</div>').join('')+'</div>':'');
renderNotes();renderArrays();
if(!quiet)toast('📖 '+j.name+(j.tries?' · '+j.tries+' past tr'+(j.tries===1?'y':'ies'):' · fresh start'));}

// ================= notes editor =================
const RE=/^(\\s*)(\\d+|[a-z]|[ivxlcdm]+)\\.\\s(.*)$/;
const ALPHA='abcdefghijklmnopqrstuvwxyz';
const ROM=['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx'];
const lvlOf=ind=>Math.min(2,Math.round(ind.length/3));
const mk=(lvl,n)=>lvl===0?String(n):lvl===1?(ALPHA[(n-1)%26]):(ROM[(n-1)%20]);
const pad=lvl=>' '.repeat(lvl*3);
const pfxLen=l=>{const m=l.match(RE);return m?m[1].length+m[2].length+2:0;};
// renumber every list item so inserting in the middle never leaves gaps
function ren(lines){const c=[0,0,0];
for(let i=0;i<lines.length;i++){const m=lines[i].match(RE);
if(m){const lv=lvlOf(m[1]);c[lv]++;for(let k=lv+1;k<3;k++)c[k]=0;lines[i]=pad(lv)+mk(lv,c[lv])+'. '+m[3];}
else if(!lines[i].trim()||!/^\\s/.test(lines[i])){c[0]=c[1]=c[2]=0;}}}
function ctxOf(ta){const val=ta.value,pos=ta.selectionStart,lines=val.split('\\n');
let acc=0,idx=lines.length-1;
for(let i=0;i<lines.length;i++){const end=acc+lines[i].length;if(pos<=end){idx=i;break;}acc=end+1;}
let st=0;for(let i=0;i<idx;i++)st+=lines[i].length+1;
return {lines,idx,col:pos-st};}
function put(ta,lines,idx,textOff){ren(lines);
let pos=0;for(let i=0;i<idx;i++)pos+=lines[i].length+1;
pos+=pfxLen(lines[idx])+Math.max(0,Math.min(textOff,lines[idx].length-pfxLen(lines[idx])));
ta.value=lines.join('\\n');ta.selectionStart=ta.selectionEnd=pos;
autosize(ta);}
function autosize(ta){ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';}

function noteKey(e,i){
const ta=e.target;
if(e.key!=='Enter'&&e.key!=='Tab')return;
const {lines,idx,col}=ctxOf(ta);
const m=lines[idx].match(RE);
if(e.key==='Tab'){
if(!m){if(!e.shiftKey)e.preventDefault();return;}
e.preventDefault();
const lv=lvlOf(m[1]),nl=e.shiftKey?Math.max(0,lv-1):Math.min(2,lv+1);
if(nl===lv)return;
const off=Math.max(0,col-pfxLen(lines[idx]));
lines[idx]=pad(nl)+'1. '+m[3];
put(ta,lines,idx,off);sync(i,ta);return;}
// Enter
if(!m){if(e.shiftKey)return;   // plain text: let the browser make a normal newline
return;}
e.preventDefault();
const lv=lvlOf(m[1]),off=Math.max(0,col-pfxLen(lines[idx]));
if(e.shiftKey){   // soft break, aligned under the marker
const cont=' '.repeat(lv*3+m[2].length+2);
lines.splice(idx+1,0,cont+m[3].slice(off));
lines[idx]=pad(lv)+m[2]+'. '+m[3].slice(0,off);
ren(lines);
let pos=0;for(let k=0;k<=idx;k++)pos+=lines[k].length+1;
ta.value=lines.join('\\n');ta.selectionStart=ta.selectionEnd=pos+cont.length;
autosize(ta);sync(i,ta);return;}
if(!m[3].trim()){   // empty point: step out a level, or leave the list
if(lv>0)lines[idx]=pad(lv-1)+'1. ';else lines[idx]='';
put(ta,lines,idx,0);sync(i,ta);return;}
lines[idx]=pad(lv)+m[2]+'. '+m[3].slice(0,off);
lines.splice(idx+1,0,pad(lv)+'1. '+m[3].slice(off));
put(ta,lines,idx+1,0);sync(i,ta);}

function noteInput(e,i){
const ta=e.target;autosize(ta);
const {lines,idx}=ctxOf(ta);
if(lines[idx].trim()==='\\u0060\\u0060\\u0060'){   // three backticks open a real code box
const before=lines.slice(0,idx).join('\\n'),after=lines.slice(idx+1).join('\\n');
NB[i].body=before;
NB.splice(i+1,0,{type:'code',body:''});
NB.splice(i+2,0,{type:'text',body:after});
renderNotes();focusBlock(i+1);scheduleSave();return;}
if(/^(\\s*)-\\s$/.test(lines[idx])){   // "- " becomes a numbered point
const ind=lines[idx].match(/^(\\s*)/)[1];
lines[idx]=ind+'1. ';put(ta,lines,idx,0);}
sync(i,ta);}
function sync(i,ta){NB[i].body=ta.value;scheduleSave();}

function codeKey(e,i){
const ta=e.target;
if(e.key==='Tab'){e.preventDefault();
const p=ta.selectionStart;ta.value=ta.value.slice(0,p)+'  '+ta.value.slice(ta.selectionEnd);
ta.selectionStart=ta.selectionEnd=p+2;NB[i].body=ta.value;autosize(ta);scheduleSave();return;}
if(e.key==='Escape'){e.preventDefault();focusBlock(i+1);}}

function renderNotes(){
const host=$('noteCard');
if(!PROB){host.innerHTML='<div class="skel">Pick a problem to open its notes.</div>';return;}
if(!NB.length)NB=[{type:'text',body:''}];
if(NB[NB.length-1].type==='code')NB.push({type:'text',body:''});
host.innerHTML=NB.map((b,i)=>b.type==='code'
?'<div class="codewrap"><span class="codetag">CODE</span><button class="cx" data-x="'+i+'">✕</button>'
+'<textarea class="codearea" data-i="'+i+'" rows="3" spellcheck="false"></textarea></div>'
:'<textarea class="notearea" data-i="'+i+'" rows="1" placeholder="'+(i===0?'What did you try? What tripped you up?':'')+'"></textarea>').join('');
host.querySelectorAll('textarea').forEach(ta=>{
const i=+ta.dataset.i;
ta.value=NB[i].body||'';
autosize(ta);
if(ta.classList.contains('codearea')){ta.addEventListener('keydown',e=>codeKey(e,i));
ta.addEventListener('input',e=>{NB[i].body=e.target.value;autosize(e.target);scheduleSave();});}
else{ta.addEventListener('keydown',e=>noteKey(e,i));ta.addEventListener('input',e=>noteInput(e,i));}});
host.querySelectorAll('.cx').forEach(b=>b.onclick=()=>{
const i=+b.dataset.x;NB.splice(i,1);
if(!NB.length)NB=[{type:'text',body:''}];
renderNotes();scheduleSave();});}
$('noteCard').addEventListener('mousedown',e=>{
if(!PROB||e.target.tagName==='TEXTAREA'||e.target.closest('.codewrap'))return;
const tas=$('noteCard').querySelectorAll('.notearea');
if(tas.length){e.preventDefault();const ta=tas[tas.length-1];ta.focus();ta.selectionStart=ta.selectionEnd=ta.value.length;}});
function focusBlock(i){const ta=$('noteCard').querySelector('[data-i="'+i+'"]');
if(ta){ta.focus();ta.selectionStart=ta.selectionEnd=ta.value.length;}}

// ---- autosave ----
let saveT=null,saving=false;
function tick(on,txt){const t=$('saveTick');t.className='savetick'+(on?' on':'');t.innerHTML=txt||'&nbsp;';}
function scheduleSave(){tick(false,'typing…');clearTimeout(saveT);saveT=setTimeout(doSave,800);}
async function doSave(){
if(!PROB)return;
clearTimeout(saveT);saveT=null;saving=true;
try{await api('/api/lc/note',{method:'PUT',body:{name:PROB,blocks:NB,arrays:ARR}});tick(true,'saved ✓');}
catch(e){tick(false,'save failed');}
saving=false;}
async function flushSave(){if(saveT)await doSave();}
window.addEventListener('beforeunload',()=>{if(saveT&&PROB&&navigator.sendBeacon)
navigator.sendBeacon('/api/lc/note',new Blob([JSON.stringify({name:PROB,blocks:NB,arrays:ARR})],{type:'application/json'}));});

// ================= array visualizer =================
const PC=['#5EA2FF','#3DDC97','#FF6B35','#9B6EF3','#FF5D73','#FFB347'];
const PNAMES=['i','j','left','right','mid','k'];
function parseArr(raw){const t=String(raw||'').trim();
if(/^\\d{1,3}$/.test(t))return Array(Math.min(200,Math.max(1,+t))).fill('');
return t.replace(/^\\[/,'').replace(/\\]$/,'').split(',').map(x=>x.trim()).slice(0,200);}
$('arAdd').onclick=()=>{
if(!PROB)return toast('Pick a problem first, so the arrays are saved with it');
const vals=parseArr($('arVals').value);
if(!vals.length)return toast('Give values like [2,7,11] or a length like 6');
ARR.push({label:($('arLabel').value.trim()||('nums'+(ARR.length?ARR.length+1:''))).slice(0,16),values:vals,pointers:[]});
$('arVals').value='';$('arLabel').value='';renderArrays();scheduleSave();};
function renderArrays(){
const host=$('arrHost');
if(!ARR.length){host.innerHTML='<div class="skel" style="margin-top:10px">No arrays yet. Paste one above and the indices appear under it.</div>';return;}
host.innerHTML=ARR.map((a,k)=>'<div class="arrcard">'
+'<div class="arrhead"><span class="nm">'+esc(a.label)+'</span>'
+'<span class="tiny num">len '+a.values.length+'</span><span class="grow"></span>'
+'<button class="sm" data-ap="'+k+'">+ pointer</button>'
+'<button class="ghost sm" data-ax="'+k+'">✕</button></div>'
+'<div class="aptr">'+(a.pointers.length?a.pointers.map((p,pi)=>
'<span class="pchip">'
+'<b class="ptag'+(SEL&&SEL[0]===k&&SEL[1]===pi?' sel':'')+'" style="background:'+p.color+'22;color:'+p.color+'" data-sel="'+k+'.'+pi+'">'+esc(p.name)+'</b>'
+'<span class="pnum">'+p.idx+'</span>'
+'<button data-pm="'+k+'.'+pi+'.-1" aria-label="left">◀</button>'
+'<button data-pm="'+k+'.'+pi+'.1" aria-label="right">▶</button>'
+'<button data-pd="'+k+'.'+pi+'" aria-label="remove">✕</button></span>').join('')
:'<span class="tiny">Add a pointer, then tap a cell index to move it.</span>')+'</div>'
+'<div class="arrscroll"><div class="arrrow">'
+a.values.map((v,i)=>'<div class="acell">'
+'<input value="'+esc(v)+'" data-c="'+k+'.'+i+'">'
+'<div class="ix" data-mv="'+k+'.'+i+'" style="cursor:pointer">'+i+'</div>'
+'<div class="pts">'+a.pointers.filter(p=>p.idx===i).map(p=>
'<span class="ptag" style="background:'+p.color+'22;color:'+p.color+'">↑ '+esc(p.name)+'</span>').join('')+'</div>'
+'</div>').join('')
+'</div></div></div>').join('');
host.querySelectorAll('[data-c]').forEach(el=>el.addEventListener('input',()=>{
const [k,i]=el.dataset.c.split('.').map(Number);ARR[k].values[i]=el.value;scheduleSave();}));
host.querySelectorAll('[data-mv]').forEach(el=>el.onclick=()=>{
const [k,i]=el.dataset.mv.split('.').map(Number);
if(!SEL||SEL[0]!==k)return toast('Tap a pointer name first, then a cell');
ARR[k].pointers[SEL[1]].idx=i;renderArrays();scheduleSave();});
host.querySelectorAll('[data-sel]').forEach(el=>el.onclick=()=>{
const [k,pi]=el.dataset.sel.split('.').map(Number);
const name=ARR[k].pointers[pi].name;
SEL=(SEL&&SEL[0]===k&&SEL[1]===pi)?null:[k,pi];
renderArrays();
if(SEL)toast('Now tap a cell index to move “'+name+'”');});
host.querySelectorAll('[data-pm]').forEach(el=>el.onclick=()=>{
const [k,pi,d]=el.dataset.pm.split('.').map(Number);const a=ARR[k];
a.pointers[pi].idx=Math.max(0,Math.min(a.values.length-1,a.pointers[pi].idx+d));
renderArrays();scheduleSave();});
host.querySelectorAll('[data-pd]').forEach(el=>el.onclick=()=>{
const [k,pi]=el.dataset.pd.split('.').map(Number);ARR[k].pointers.splice(pi,1);SEL=null;renderArrays();scheduleSave();});
host.querySelectorAll('[data-ap]').forEach(el=>el.onclick=()=>{
const k=+el.dataset.ap,a=ARR[k];
const used=a.pointers.map(p=>p.name);
const name=PNAMES.find(n=>used.indexOf(n)<0)||('p'+a.pointers.length);
a.pointers.push({name,idx:0,color:PC[a.pointers.length%PC.length]});renderArrays();scheduleSave();});
host.querySelectorAll('[data-ax]').forEach(el=>el.onclick=()=>{
ARR.splice(+el.dataset.ax,1);SEL=null;renderArrays();scheduleSave();});}

// ================= stats =================
async function loadStats(){
try{STATS=await api('/api/lc/stats');}catch(e){return toast(String(e))}
const T=STATS.tiles,P=STATS.problems;
$('stSolved').textContent=T.solved;$('stOpen').textContent=T.open;
$('stSlow').textContent=T.slow;$('stTries').textContent=T.totalTries;
$('stAvg').textContent=(T.avgTries?'avg '+T.avgTries+' tries per solved problem · ':'')+'oldest attempt first';
// still the 25 problems that cost the most tries, but ORDERED oldest attempt first, so the
// list reads chronologically and whatever he has not touched in longest sits at the top.
// The day count already on every row (today / 12d) is what makes that order legible.
const tough=[...P].sort((a,b)=>b.tries-a.tries||b.totalMin-a.totalMin).slice(0,25)
  .sort((a,b)=>b.daysSince-a.daysSince||b.tries-a.tries);
paint($('stTough'),tough,'Log a few problems with names and the ranking builds itself.');
// never solved plus solved-but-slow, whatever has sat longest comes first
const back=P.filter(p=>p.latest!==1).sort((a,b)=>b.daysSince-a.daysSince);
paint($('stOpenList'),back,'Nothing hanging over you. Every named problem is solved cleanly.');
renderAll();}

// one row renderer for all three lists: tap to expand, edit the newest try, run it again
function prow(p){
return '<div class="prow" data-p="'+esc(p.name)+'">'
+'<div class="hd"><span class="cx">▸</span>'
+'<span class="diff '+p.difficulty+'">'+p.difficulty.toUpperCase()+'</span>'
+'<span class="grow pn"><b>'+esc(p.name)+'</b></span>'
+(p.hasNote?'<span class="tiny" title="has notes">📝</span>':'')
+'<span class="tiny num">×'+p.tries+'</span>'
+'<span class="tiny">'+(p.daysSince<=0?'today':p.daysSince+'d')+'</span>'
+outBadge(p.latest)+'</div>'
+'<div class="ppanel"><div class="skel">Loading…</div></div></div>';}
function paint(host,list,empty){
host.innerHTML=list.length?list.map(prow).join(''):'<div class="skel">'+empty+'</div>';
host.querySelectorAll('.prow').forEach(r=>{
r.querySelector('.hd').onclick=()=>{
const open=r.classList.toggle('open');
if(open)fillPanel(r,r.dataset.p);};});}
async function fillPanel(r,name){
const box=r.querySelector('.ppanel');
let j;try{j=await api('/api/lc/note?name='+encodeURIComponent(name));}catch(e){box.innerHTML='<div class="skel">'+esc(String(e))+'</div>';return;}
const avg=j.tries?Math.round(j.totalMin/j.tries):0;
box.innerHTML='<div class="pstats">'
+'<span class="chip">×'+j.tries+' tr'+(j.tries===1?'y':'ies')+'</span>'
+'<span class="chip">'+mins(j.totalMin)+' total</span>'
+'<span class="chip">avg '+mins(avg)+'</span>'
+(j.last?'<span class="chip">last '+fmtD(j.last)+'</span>':'')+'</div>'
+j.history.map((h,i)=>'<div class="parow">'
+'<span class="num" style="color:var(--ink2);min-width:62px">'+fmtD(h.date)+'</span>'
+'<b class="num" style="min-width:44px">'+fmtDur(h.minutes)+'</b>'
+(h.source==='timer'?'<span class="tiny" title="timed live">⏱</span>':'')
+'<span class="grow"></span>'
+(i===0
?'<select data-edit="'+h.id+'">'+[[1,'✓ Solved'],[2,'⚡ Solved, slow'],[0,'✕ Did not finish']]
.map(o=>'<option value="'+o[0]+'"'+(+h.finished===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'
:outBadge(h.finished))
+'</div>').join('')
+'<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">'
+'<button class="pri sm" data-run="'+esc(name)+'">▶ Run again</button>'
+'<button class="sm" data-ren="'+esc(name)+'">✎ Rename</button>'
+'<span class="tiny">Only the newest try is editable, the rest is history.</span></div>';
const sel=box.querySelector('[data-edit]');
if(sel)sel.onchange=async()=>{
try{await api('/api/lc/'+sel.dataset.edit,{method:'PATCH',body:{finished:+sel.value}});
toast('Updated · '+outOf(+sel.value)[1]);
await loadStats();}
catch(e){toast(String(e))}};
box.querySelector('[data-run]').onclick=()=>{
setTab('solve');window.scrollTo(0,0);loadProblem(name);};
box.querySelector('[data-ren]').onclick=()=>openRename(name,j.difficulty,j.tries);}

// ---- rename, which becomes a merge when the new name is already taken ----
let RNFROM='',RNTRIES=0,RNNEAR=null,PKNEAR=null;
function openRename(name,diff,tries){
RNFROM=name;RNTRIES=tries||0;
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:19px">✎ Rename problem</h1>'
+'<p class="muted" style="margin-top:4px">Fixing a typo? Type the correct name. If another problem already has that name, the two are merged into one.</p>'
+'<label class="fld">Currently</label>'
+'<div class="row"><span class="diff '+diff+'">'+diff.toUpperCase()+'</span><b>'+esc(name)+'</b>'
+'<span class="tiny num">×'+RNTRIES+'</span></div>'
+'<label class="fld">New name</label>'
+'<input id="rnName" autocomplete="off" value="'+esc(name)+'" oninput="rnSuggest()" onfocus="rnSuggest()">'
+'<div id="rnMsg" class="tiny" style="margin-top:8px;min-height:18px"></div><div id="rnSug"></div>'
+'<div class="row" style="margin-top:18px">'
+'<button class="pri grow" id="rnGo" onclick="doRename()">Rename</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
setTimeout(()=>{const i=$('rnName');i.focus();i.select();},80);
rnSuggest();}
function rnSuggest(){
const raw=$('rnName').value,q=lcNorm(raw),msg=$('rnMsg'),box=$('rnSug'),go=$('rnGo');
const fromQ=lcNorm(RNFROM);
const target=LCNAMES.find(n=>lcNorm(n.name)===q&&lcNorm(n.name)!==fromQ);
const hits=q?LCNAMES.filter(n=>lcNorm(n.name)!==q&&lcNorm(n.name)!==fromQ&&lcNorm(n.name).indexOf(q)>=0).slice(0,5):[];
const near=(target||hits.length||!q)?null:lcNear(raw);
RNNEAR=near;
if(!q){msg.innerHTML='<span style="color:var(--ink3)">Give it a name.</span>';go.disabled=true;}
else if(q===fromQ&&raw.trim()===RNFROM){msg.innerHTML='<span style="color:var(--ink3)">Same name. Change it or cancel.</span>';go.disabled=true;}
else if(target){
msg.innerHTML='<span style="color:var(--ember2);font-weight:700">⚠ “'+esc(target.name)+'” already exists.</span>'
+'<br>This merges <b class="num">'+RNTRIES+' + '+target.tries+' = '+(RNTRIES+target.tries)+'</b> tries into it, '
+'and every attempt becomes <b>'+target.difficulty.toUpperCase()+'</b>. Notes from both are kept.';
go.disabled=false;go.textContent='Merge them';}
else{msg.innerHTML='<span style="color:var(--mint)">Renames this problem. All '+RNTRIES+' attempt'+(RNTRIES===1?'':'s')+' and its notes follow.</span>'
+(near?nearHTML(near,'rnUseNear()'):'');
go.disabled=false;go.textContent='Rename';}
box.innerHTML=hits.length?'<div class="acbox">'+hits.map(n=>
'<button type="button" class="acitem" data-rn="'+esc(n.name)+'">'
+'<span class="diff '+n.difficulty+'">'+n.difficulty.toUpperCase()+'</span>'
+'<span class="grow" style="min-width:0">'+esc(n.name)+'</span>'
+'<span class="tiny num">×'+n.tries+'</span>'+outBadge(n.latest)+'</button>').join('')+'</div>':'';
box.querySelectorAll('[data-rn]').forEach(b=>b.onclick=()=>{$('rnName').value=b.dataset.rn;rnSuggest();});}
function rnUseNear(){if(RNNEAR){$('rnName').value=RNNEAR.name;rnSuggest();}}
function pkUseNear(){if(PKNEAR){$('pkName').value=PKNEAR.name;loadProblem(PKNEAR.name);}}
async function doRename(){
const to=$('rnName').value.trim();
if(!to)return;
try{
const r=await api('/api/lc/rename',{body:{from:RNFROM,to}});
$('modalHost').innerHTML='';
toast(r.merged?('⇄ Merged into “'+r.name+'” · '+r.tries+' tries now'):('✎ Renamed to “'+r.name+'”'));
try{LCNAMES=(await api('/api/lc/names')).names||[];}catch(e){}
if(PROB&&lcNorm(PROB)===lcNorm(RNFROM))await loadProblem(r.name,true);
await loadStats();}
catch(e){toast(String(e))}}
function renderAll(){
if(!STATS)return;
const q=lcNorm($('stSearch').value);
const list=STATS.problems.filter(p=>!q||lcNorm(p.name).indexOf(q)>=0||(p.blob||'').indexOf(q)>=0)
.sort((a,b)=>a.last<b.last?1:-1);
paint($('stAll'),list,q?'Nothing matches that.':'No named problems yet.');}
$('stSearch').addEventListener('input',renderAll);

// ---- saved session tabs (shared tool from theme.js, this page keeps its own set) ----
LKKIND='leetcode';
$('lkHead').onclick=()=>{
const open=$('lkAcc').classList.toggle('open');
if(open&&!LK.length)loadLinks();};
function lkCount(){const n=LK.length,b=LK.filter(l=>l.in_bundle).length;
$('lkCount').textContent=n?(n+' saved'+(b?' · '+b+' in Open all':'')):'the sites you open every session';}

// ---- boot ----
(async function(){
try{LCNAMES=(await api('/api/lc/names')).names||[];}catch(e){}
try{const d=await api('/api/day');HASGRIND=!!d.active;
const def=String(d.timerDefault||25);
const TO=((window.__U&&window.__U.timerOptions)||[10,15,20,25,50]).map(Number);if(!TO.includes(+def))TO.unshift(+def);$('tlen').innerHTML=TO.map(m=>'<option value="'+m+'">'+m+' min</option>').join('');
$('tlen').value=def;}catch(e){}
tRestore();
const last=localStorage.getItem('lc_prob');
if(last)await loadProblem(last,true);
pkSuggest();})();
setInterval(()=>{if(PROB)localStorage.setItem('lc_prob',PROB);},2000);
// renderLinks lives in the shared runtime, so hook the count on after it paints
const _rl=renderLinks;renderLinks=function(){_rl.apply(this,arguments);lkCount();};
</script>`, { cfg, mclock: cfg && cfg.mclock });
