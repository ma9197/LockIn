import { shell } from './theme.js';

// The setup wizard. Seven screens, one final POST to /api/onboarding. Every screen shows a live
// preview of what its answer builds (the race bar, the day strip, the goal rings), the draft
// survives a refresh (sessionStorage), and the last screen is a summary before the single write.
// Same language as Settings: .item rows with a colour accent, well inputs, .addbtn, .togrow.
// Page-script rules: no backticks, no ${ } in the client code, and no quotes inside inline
// handlers: every button carries data-a / data-i / data-v and one delegated listener routes it.

export const onboardPage = (user) => shell('LockIn · Setup', null, `
<style>
.liveclock,.refresh-fab{display:none}
.wrap{padding-top:18px}
.wiz{max-width:620px;margin:0 auto;padding-bottom:40px}
.wiz-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}
.wiz-top .logo{white-space:nowrap}
.wiz-cap{font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember);white-space:nowrap}
.steps{display:flex;gap:4px;margin:14px 0 18px}
.steps i{flex:1;height:5px;border-radius:3px;background:var(--surface3);transition:background .3s}
.steps i.done{background:var(--ember2);opacity:.6}
.steps i.on{background:var(--ember);box-shadow:0 0 10px #FF6B3588}
.wiz-body{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px 18px;box-shadow:0 30px 80px #0006}
@media(min-width:600px){.wiz-body{padding:28px 26px}}
.wiz h1{font-size:24px;margin:0 0 6px;letter-spacing:-.02em}
.wiz .lead{color:var(--ink2);margin:0 0 4px;line-height:1.55;font-size:14.5px}
.wiz .fg{margin-top:18px}
.wiz-body.enter{animation:wizin .32s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes wizin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.lst{margin-top:16px}
.item.first{margin-top:0}
.rng{display:flex;align-items:center;gap:8px}
.rng input{flex:1;min-width:0;width:auto;padding:9px 10px;font-size:14px;font-variant-numeric:tabular-nums}
.rng .tiny{flex:none}
.rng .lbl{flex:none;width:56px;font:700 11px var(--disp);color:var(--ink2);text-transform:uppercase;letter-spacing:.06em}
.rng+.rng{margin-top:8px}
@media(max-width:560px){.rng.blk{flex-wrap:wrap;gap:6px}.rng.blk .lbl{width:100%;margin-bottom:-2px}.rng.blk .xbtn{width:30px}.rng input[type=time]{font-size:13px;padding:9px 4px}}
.chips{display:flex;gap:5px}
.chips button{flex:1;min-width:0;padding:8px 0;font-size:12px}
.chips button.on{background:var(--ember);color:#0B0E14;border-color:var(--ember)}
.sw{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;flex:1;min-width:0;max-width:300px}
.sw button{width:100%;aspect-ratio:1;height:auto;min-height:28px;border-radius:9px;border:2px solid transparent;padding:0}
.sw button.on{border-color:#fff;box-shadow:0 0 0 2px var(--surface2)}
.em{display:flex;gap:5px;flex-wrap:wrap}
.em button{width:36px;height:36px;font-size:18px;padding:0;border-radius:10px;background:var(--well)}
.em button.on{background:var(--surface3);border-color:var(--ember)}
.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}
.gl label{font:700 10.5px var(--disp);color:var(--ink2);text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px;white-space:nowrap}
.gl input{width:100%;padding:9px 10px}
.lowbtn.on{background:#9B6EF322;border-color:#9B6EF388;color:var(--violet)}
.defpill{background:#FF6B3522;color:var(--ember)}
.nav2{display:flex;gap:10px;margin-top:18px}
.nav2 button{flex:1;padding:14px;font:800 15px var(--disp);border-radius:14px}
.ok{color:var(--mint)}.bad{color:var(--rose)}
.prev{background:var(--surface2);border:1px solid var(--line2);border-radius:14px;padding:14px;margin-top:18px}
.prev .pl{font:700 10px var(--disp);color:var(--ink2);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
.strip{position:relative;height:24px;background:var(--surface3);border-radius:6px;overflow:hidden}
.strip i{position:absolute;top:0;bottom:0;border-radius:3px;opacity:.92}
.strip-ax{display:flex;justify-content:space-between;font:700 9.5px var(--disp);color:var(--ink3);margin-top:4px}
.race-seg.lowp{background-image:repeating-linear-gradient(135deg,#0000 0 4px,#00000066 4px 8px)}
.rings{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.rings .r{width:74px;text-align:center}
.rings .r .ring{width:60px;height:60px}
.rings .r .ring .val b{font-size:16px}
.rings .r .ring .val span{font-size:8px;letter-spacing:.04em}
.rings .r .nm{font:700 10px var(--disp);color:var(--ink2);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.big{background:var(--surface2);border:1px solid var(--line2);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;width:100%;text-align:left;font:inherit}
.big.on{border-color:var(--ember);background:#FF6B3514}
.big .e{font-size:22px;flex:none}
.big b{display:block;font:800 15px var(--disp)}
.big .tiny{margin-top:2px}
.sum{display:grid;gap:0;margin-top:8px}
.sum div{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}
.sum div:last-child{border-bottom:0}
.sum span:first-child{flex:none;width:96px;font:700 11px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;padding-top:2px}
.sum span:last-child{color:var(--ink2);min-width:0}
.sum b{color:var(--ink)}
.tzclock{font:800 28px var(--disp);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.idrow{display:flex;align-items:center;gap:12px}
.idrow .who{flex:1;min-width:0}
.emptybig{text-align:center;padding:26px 0 8px}
.emptybig .hint{margin-top:10px}
</style>
<div class="bgfx" aria-hidden="true"><i></i></div>
<div class="wiz">
  <div class="wiz-top"><div class="logo" style="font-size:22px">LOCK<em>IN</em> 🔥</div><span class="wiz-cap" id="stepCap"></span></div>
  <div class="steps" id="steps"></div>
  <div class="wiz-body" id="wiz"></div>
  <p class="ferr" id="err" role="alert" aria-live="polite"></p>
  <div class="nav2"><button class="ghost" id="back" data-a="back">← Back</button><button class="pri" id="next" data-a="next">Next →</button></div>
</div>`, `<script>
const PAL=['#FF6B35','#5EA2FF','#3DDC97','#9B6EF3','#FFB347','#FF5D73','#4f8ef7','#f3a33c'];
const CEMO=['\\uD83E\\uDDE9','\\uD83D\\uDCE8','\\uD83D\\uDCDA','\\uD83D\\uDDC4\\uFE0F','\\uD83C\\uDFD7\\uFE0F','\\uD83D\\uDCAC','\\uD83C\\uDF99\\uFE0F','\\uD83D\\uDCDD','\\u2B50','\\uD83C\\uDFAF'];
const SEMO=['\\uD83C\\uDFCB\\uFE0F','\\uD83C\\uDF93','\\uD83D\\uDCBC','\\uD83C\\uDFC3','\\uD83C\\uDFBE','\\u26BD','\\uD83C\\uDFCA','\\uD83E\\uDDD8','\\uD83D\\uDE8C','\\uD83C\\uDF7D\\uFE0F','\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67','\\uD83C\\uDFAE','\\uD83D\\uDCCC'];
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const NAMES=['You','Time zone','Plan','Grind blocks','Categories','Side tasks','Wrap up'];
const LAYEMO={morning:'\\uD83C\\uDF05',night:'\\uD83C\\uDF19',low:'\\uD83E\\uDEAB',weekend:'\\uD83C\\uDFD6\\uFE0F'};
const guessTz=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}catch(e){return 'UTC'}})();
let S={name:${JSON.stringify(user.display_name || '')},handle:${JSON.stringify(user.handle || '')},tz:guessTz,clock24:false,
noPlan:false,phases:[],
layouts:{morning:[['09:00','12:00'],['14:00','17:00']]},def:'morning',
cats:[{key:'leetcode',name:'LeetCode',emoji:CEMO[0],color:PAL[0],wd:3,we:1,low:1,builtin:'leetcode'},
      {key:'applications',name:'Applications',emoji:CEMO[1],color:PAL[1],wd:2,we:0,low:1,builtin:'applications'}],
side:[],modules:{leetcode:true,jobs:true,copy:true,friends:false,clock:true},target:6,booking:false,avail:[['12:00','15:00']]};
let step=0;const N=7;
try{const sv=JSON.parse(sessionStorage.getItem('lockin_wiz')||'null');if(sv&&sv.v===2&&sv.S){S=Object.assign(S,sv.S);step=Math.min(N-1,sv.step||0);}}catch(e){}
function persist(){try{sessionStorage.setItem('lockin_wiz',JSON.stringify({v:2,S,step}))}catch(e){}}
const val=id=>{const e=$(id);return e?e.value:''};
const today=new Date().toLocaleDateString('en-CA',{timeZone:S.tz});
const plus=(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const hm=v=>/^\\d{2}:\\d{2}$/.test(v||'');
const ymd=v=>/^\\d{4}-\\d{2}-\\d{2}$/.test(v||'');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const cap=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).toUpperCase();
const mn=v=>{const[a,b]=v.split(':').map(Number);return a*60+b;};
const fmtH=v=>{let[h,m]=v.split(':').map(Number);if(S.clock24)return v;const ap=h>=12?'PM':'AM';h=h%12||12;return h+(m?':'+String(m).padStart(2,'0'):'')+' '+ap;};
const first=i=>i===0?' first':'';

// ---- previews ----
function strip(blocks,sides){
const seg=(s,e,col,lab)=>{let a=mn(s),b=mn(e);if(b<=a)b+=1440;const one=(x,y)=>'<i style="left:'+(x/1440*100)+'%;width:'+((y-x)/1440*100)+'%;background:'+col+'" title="'+esc2(lab)+'"></i>';
return b>1440?one(a,1440)+one(0,b-1440):one(a,b);};
return '<div class="strip">'+(blocks||[]).filter(b=>hm(b[0])&&hm(b[1])).map(b=>seg(b[0],b[1],'var(--ember)','grind')).join('')
+(sides||[]).filter(t=>hm(t.start)&&hm(t.end)).map(t=>seg(t.start,t.end,'var(--mint)',t.name||'side task')).join('')
+'</div><div class="strip-ax"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span></div>';}
const dayCount=p=>Math.max(1,Math.round((new Date(p.end+'T12:00:00Z')-new Date(p.start+'T12:00:00Z'))/864e5)+1);
function racePrev(){const ph=S.phases.filter(p=>ymd(p.start)&&ymd(p.end)&&p.end>=p.start);if(S.noPlan||!ph.length)return '';
const tot=ph.reduce((a,p)=>a+dayCount(p),0);
return '<div class="prev"><div class="pl">Your race bar</div><div class="race" style="margin:0"><div class="race-track" style="height:16px">'
+ph.map(p=>'<div class="race-seg past'+(p.low?' lowp':'')+'" style="flex:'+dayCount(p)+';--seg:'+p.color+'" title="'+esc2(p.name)+'"></div>').join('')
+'</div><div class="race-cap"><span>'+cap(ph[0].start)+'</span><b>'+tot+' DAYS</b><span>'+cap(ph[ph.length-1].end)+'</span></div></div>'
+'<div class="hint" style="margin-top:8px">'+ph.map(p=>'<span style="color:'+p.color+'">\\u25cf</span> '+esc2(p.name||'?')+' '+dayCount(p)+'d'+(p.low?' (low load)':'')).join(' \\u00b7 ')+'</div></div>';}
function ringsPrev(){
return '<div class="prev"><div class="pl">A weekday on your Today page</div><div class="rings">'+S.cats.map(c=>{
return '<div class="r"><div class="ring"><svg width="60" height="60" viewBox="0 0 112 112"><circle cx="56" cy="56" r="46" fill="none" stroke="'+c.color+'" stroke-width="9" opacity=".22"/></svg><div class="val"><b class="num">0</b><span>OF '+(c.wd||0)+'</span></div></div><div class="nm">'+c.emoji+' '+esc2(c.name||'?')+'</div></div>';}).join('')+'</div><div class="hint" style="text-align:center;margin-top:8px">Each ring fills as you log. Tap + on it, or let the LeetCode log and the Jobs tracker count for you.</div></div>';}
function stripPrev(){const lay=S.layouts[S.def]||[];
return '<div class="prev"><div class="pl">'+(S.side.length?'Your default day with side tasks':'Your default day')+'</div>'+strip(lay,S.side)
+'<div class="hint" style="margin-top:6px"><span style="color:var(--ember)">\\u25a0</span> grind '+(lay.length?lay.map(b=>fmtH(b[0])+'\\u2013'+fmtH(b[1])).join(', '):'none yet')
+(S.side.length?' \\u00a0 <span style="color:var(--mint)">\\u25a0</span> side tasks':'')+'</div></div>';}
function prev(){const el=$('prev');if(!el)return;el.innerHTML=step===2?racePrev():step===3?stripPrev():step===4?ringsPrev():step===5?stripPrev():'';}

// ---- steps ----
// render(true) = a new step: slide it in and scroll to the top.
// render(false) = the same step after a click: swap the markup in place, no motion, no scroll.
function render(anim){
$('steps').innerHTML=Array.from({length:N},(_,i)=>'<i class="'+(i<step?'done':i===step?'on':'')+'"></i>').join('');
$('stepCap').textContent='Step '+(step+1)+' of '+N+' \\u00b7 '+NAMES[step];
$('err').textContent='';
$('back').style.visibility=step?'visible':'hidden';
$('next').textContent=step===N-1?'Finish setup \\uD83D\\uDD25':'Next \\u2192';
const w=$('wiz');w.classList.remove('enter');
if(anim!==false)void w.offsetWidth;
w.innerHTML=[stIdentity,stTime,stPlan,stBlocks,stCats,stSide,stWrap][step]()+'<div id="prev"></div>';
if(anim!==false){w.classList.add('enter');window.scrollTo(0,0);}
prev();
if(step===0)checkHandle();if(step===1)tickClock();
persist();}
const rerender=()=>render(false);

function stIdentity(){
return '<h1>Welcome. Who is grinding?</h1><p class="lead">Your name shows on your shared progress page and your booking page. The handle is their address.</p>'
+'<div class="fg"><label class="fld" for="name">Display name</label><div class="idrow"><span id="avPrev">'+avatar(S.name||'?')+'</span><div class="who"><input id="name" maxlength="40" value="'+esc2(S.name)+'" placeholder="e.g. Alex" oninput="S.name=this.value;avPrev()"></div></div></div>'
+'<div class="fg"><label class="fld" for="handle">Handle</label><input id="handle" maxlength="30" value="'+esc2(S.handle)+'" placeholder="alex" oninput="S.handle=this.value;checkHandle()" autocapitalize="none" autocorrect="off" spellcheck="false">'
+'<div class="hint" id="hh">3 to 30 characters: letters, numbers, dashes.</div></div>';}
function avPrev(){const el=$('avPrev');if(el)el.innerHTML=avatar(S.name||'?');}
let hT;
function checkHandle(){clearTimeout(hT);const h=(val('handle')||'').toLowerCase().trim();const el=$('hh');if(!el)return;
if(!/^[a-z0-9][a-z0-9-]{2,29}$/.test(h)){el.className='hint';el.textContent='3 to 30 characters: letters, numbers, dashes. Your pages will live at '+location.host+'/u/'+(h||'handle')+'/';return;}
el.className='hint';el.textContent='Checking '+location.host+'/u/'+h+'/ \\u2026';
hT=setTimeout(async()=>{try{const j=await api('/api/handle/check?h='+encodeURIComponent(h));
el.className='hint '+(j.free?'ok':'bad');el.textContent=j.free?('\\u2713 '+location.host+'/u/'+h+'/ is yours'):'\\u2715 That handle is taken';}catch(e){}},350);}

let clkInt=null;
function tickClock(){clearInterval(clkInt);const f=()=>{const el=$('tzNow');if(!el){clearInterval(clkInt);return;}
try{el.textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:!S.clock24,timeZone:S.tz});}catch(e){el.textContent='';}};f();clkInt=setInterval(f,1000);}
function stTime(){
let zones=[];try{zones=Intl.supportedValuesOf('timeZone')}catch(e){zones=['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo','Asia/Kolkata','Australia/Sydney']}
if(!zones.includes(S.tz))zones.unshift(S.tz);
return '<h1>Where are you?</h1><p class="lead">Every day, streak and deadline is counted in your own local time. We guessed from your browser.</p>'
+'<div class="fg"><label class="fld" for="tz">Time zone</label><select id="tz" onchange="S.tz=this.value;tickClock()">'+zones.map(z=>'<option value="'+z+'"'+(z===S.tz?' selected':'')+'>'+z.replace(/_/g,' ')+'</option>').join('')+'</select></div>'
+'<div class="fg"><label class="fld">Clock</label><div class="seg-ctl"><button class="'+(S.clock24?'':'on')+'" data-a="clock" data-v="0">12-hour \\u00b7 9:30 PM</button><button class="'+(S.clock24?'on':'')+'" data-a="clock" data-v="1">24-hour \\u00b7 21:30</button></div></div>'
+'<div class="prev"><div class="pl">Right now, for you</div><div class="tzclock" id="tzNow"></div><div class="hint" style="margin-top:2px">If that is wrong, pick another zone above.</div></div>';}

function stPlan(){
return '<h1>Your plan</h1><p class="lead">A plan is a few phases with dates. It powers the race bar, the pace tracking and the finish-line forecast. Mark a phase <b>low load</b> for exams, travel or guests: goals drop and a lighter schedule applies.</p>'
+'<div class="row" style="gap:8px;margin-top:16px;flex-wrap:wrap"><button class="big" style="flex:1;min-width:200px" data-a="template"><span class="e">\\u26A1</span><span><b>Start from a template</b><span class="tiny">Foundations \\u00b7 Interview prep \\u00b7 Finals (low load) \\u00b7 Sprint</span></span></button>'
+'<button class="big'+(S.noPlan?' on':'')+'" style="flex:1;min-width:200px" data-a="noplan"><span class="e">\\uD83E\\uDD37</span><span><b>No plan yet</b><span class="tiny">Skip for now, add phases later in Settings.</span></span></button></div>'
+(S.noPlan?'':'<div class="lst" id="phl">'+S.phases.map((p,i)=>'<div class="item'+first(i)+'" style="--ac:'+p.color+'"><div class="ihead"><input class="nm" placeholder="Phase name" value="'+esc2(p.name)+'" oninput="S.phases['+i+'].name=this.value;prev()" aria-label="Phase name">'
+'<button class="sm lowbtn '+(p.low?'on':'')+'" data-a="lowPhase" data-i="'+i+'">'+(p.low?'\\uD83E\\uDEAB Low load':'Normal')+'</button>'
+'<button class="xbtn" data-a="delPhase" data-i="'+i+'" aria-label="Remove phase">\\u2715</button></div>'
+'<div class="ibody"><div class="rng"><input type="date" value="'+p.start+'" onchange="S.phases['+i+'].start=this.value;prev()" aria-label="start"><span class="tiny">to</span><input type="date" value="'+p.end+'" onchange="S.phases['+i+'].end=this.value;prev()" aria-label="end"></div></div>'
+'<div class="ifoot"><span class="cklab" style="margin:0;flex:none">Colour</span><div class="sw">'+PAL.map(c=>'<button style="background:'+c+'" class="'+(p.color===c?'on':'')+'" data-a="phaseColor" data-i="'+i+'" data-v="'+c+'" aria-label="colour"></button>').join('')+'</div></div></div>').join('')
+'</div><button class="addbtn" data-a="addPhase">\\uFF0B Add phase</button>'
+'<div class="hint">Phases run back to back. The first start and the last end are your plan window.</div>');}
function addPhase(){const last=S.phases[S.phases.length-1];const start=last?plus(last.end,1):today;
S.phases.push({name:'Phase '+(S.phases.length+1),start,end:plus(start,27),color:PAL[S.phases.length%PAL.length],low:false});S.noPlan=false;rerender();
const ins=document.querySelectorAll('#phl input.nm');const l=ins[ins.length-1];if(l){l.focus();l.select();}}
function template(){S.phases=[];S.noPlan=false;const add=(name,weeks,color,low)=>{const last=S.phases[S.phases.length-1];const start=last?plus(last.end,1):today;S.phases.push({name,start,end:plus(start,weeks*7-1),color,low});};
add('Foundations',4,PAL[1],false);add('Interview prep',6,PAL[0],false);add('Finals',1,PAL[3],true);add('Application sprint',5,PAL[2],false);rerender();}

function stBlocks(){
const names=Object.keys(S.layouts);const hasLow=!S.noPlan&&S.phases.some(p=>p.low);
if(hasLow&&!S.layouts.low)S.layouts.low=[['11:00','13:00']];
return '<h1>When do you grind?</h1><p class="lead">A layout is up to four blocks. Make a second one (Night owl, say) and switch between them from the Today page whenever you like. Blocks step around your side tasks automatically.</p>'
+'<div class="lst">'+names.map((n,ni)=>'<div class="item'+first(ni)+'" style="--ac:'+(n===S.def?'var(--ember)':n==='low'?'var(--violet)':'var(--line2)')+'"><div class="ihead"><span class="tile">'+(LAYEMO[n]||'\\uD83D\\uDDD3\\uFE0F')+'</span><b class="nm">'+(n==='low'?'Low-load days':esc2(n))+'</b>'
+(n===S.def?'<span class="pill defpill">default</span>':(n==='low'?'':'<button class="ghost sm" data-a="layoutDef" data-v="'+n+'">Make default</button>'))
+(names.length>1&&n!=='low'?'<button class="xbtn" data-a="layoutDel" data-v="'+n+'" aria-label="Remove layout">\\u2715</button>':'')+'</div>'
+'<div class="ibody">'+S.layouts[n].map((b,i)=>'<div class="rng blk"><span class="lbl">Block '+(i+1)+'</span><input type="time" value="'+b[0]+'" onchange="S.layouts[this.dataset.n][this.dataset.i][0]=this.value;prev()" data-n="'+n+'" data-i="'+i+'" aria-label="start"><span class="tiny">to</span><input type="time" value="'+b[1]+'" onchange="S.layouts[this.dataset.n][this.dataset.i][1]=this.value;prev()" data-n="'+n+'" data-i="'+i+'" aria-label="end">'
+(S.layouts[n].length>1?'<button class="xbtn" data-a="blockDel" data-v="'+n+'" data-i="'+i+'" aria-label="Remove block">\\u2715</button>':'<span style="width:38px;flex:none"></span>')+'</div>').join('')+'</div>'
+(S.layouts[n].length<4?'<div class="ifoot"><button class="sm" data-a="blockAdd" data-v="'+n+'">\\uFF0B Add block</button><span class="tiny">up to four</span></div>':'')+'</div>').join('')+'</div>'
+(S.layouts.night?'':'<button class="addbtn" data-a="addNight">\\uD83C\\uDF19 Add a Night owl layout</button>')
+'<div class="hint">A block ending after midnight is fine, it just runs into the next day.</div>';}

function stCats(){
return '<h1>What are you grinding?</h1><p class="lead">Each category gets a daily goal for weekdays, weekends and low-load days. LeetCode and Applications bring their own tools. Add your own: system design, a course, reading.</p>'
+'<div class="lst">'+S.cats.map((c,i)=>'<div class="item'+first(i)+'" style="--ac:'+c.color+'"><div class="ihead"><span class="tile">'+c.emoji+'</span><input class="nm" value="'+esc2(c.name)+'" oninput="S.cats['+i+'].name=this.value;prev()" placeholder="Name"'+(c.builtin?' readonly':'')+' aria-label="Category name">'
+'<button class="xbtn" data-a="catDel" data-i="'+i+'" aria-label="Remove category">\\u2715</button></div>'
+'<div class="ibody"><div class="cklab">Daily goal</div><div class="gl"><div><label>Weekday</label><input type="number" min="0" max="50" value="'+c.wd+'" oninput="S.cats['+i+'].wd=+this.value;prev()"></div>'
+'<div><label>Weekend</label><input type="number" min="0" max="50" value="'+c.we+'" oninput="S.cats['+i+'].we=+this.value"></div>'
+'<div><label>Low load</label><input type="number" min="0" max="50" value="'+c.low+'" oninput="S.cats['+i+'].low=+this.value"></div></div>'
+(c.builtin?'<div class="hint">Built in: '+(c.builtin==='leetcode'?'unlocks the LeetCode tab, timer records and problem notes.':'wired to the Jobs tracker, every logged application counts here.')+'</div>':'')+'</div>'
+(c.builtin?'':'<div class="ifoot"><div class="em">'+CEMO.map(e=>'<button class="'+(c.emoji===e?'on':'')+'" data-a="catEmoji" data-i="'+i+'" data-v="'+e+'" aria-label="emoji">'+e+'</button>').join('')+'</div><span class="grow"></span><div class="sw">'+PAL.map(col=>'<button style="background:'+col+'" class="'+(c.color===col?'on':'')+'" data-a="catColor" data-i="'+i+'" data-v="'+col+'" aria-label="colour"></button>').join('')+'</div></div>')+'</div>').join('')+'</div>'
+'<button class="addbtn" data-a="addCat">\\uFF0B Add category</button>'
+'<div class="hint">A goal of 0 means nothing is expected that day. Categories can change later; history is never lost.</div>';}

function stSide(){
return '<h1>What else takes time?</h1><p class="lead">Recurring things that are not grind: gym, a class, a shift, a commute. They show on the timeline and the grind blocks step out of their way.</p>'
+(S.side.length?'<div class="lst">'+S.side.map((t,i)=>'<div class="item'+first(i)+'" style="--ac:var(--mint)"><div class="ihead"><span class="tile">'+t.emoji+'</span><input class="nm" value="'+esc2(t.name)+'" oninput="S.side['+i+'].name=this.value;prev()" placeholder="Gym, Algorithms class, Shift\\u2026" aria-label="Side task name">'
+'<button class="xbtn" data-a="sideDel" data-i="'+i+'" aria-label="Remove side task">\\u2715</button></div>'
+'<div class="ibody"><div class="cklab">Days</div><div class="chips" style="margin-top:6px">'+DN.map((d,di)=>'<button class="'+(t.days.includes(di)?'on':'')+'" data-a="sideDay" data-i="'+i+'" data-v="'+di+'">'+d+'</button>').join('')+'</div>'
+'<div class="cklab">Time</div><div class="rng" style="margin-top:6px"><input type="time" value="'+t.start+'" onchange="S.side['+i+'].start=this.value;prev()" aria-label="start"><span class="tiny">to</span><input type="time" value="'+t.end+'" onchange="S.side['+i+'].end=this.value;prev()" aria-label="end"></div>'
+'<div class="cklab">Only between (optional)</div><div class="rng" style="margin-top:6px"><input type="date" value="'+(t.from||'')+'" onchange="S.side['+i+'].from=this.value" aria-label="from"><span class="tiny">and</span><input type="date" value="'+(t.to||'')+'" onchange="S.side['+i+'].to=this.value" aria-label="to"></div>'
+'<div class="hint" style="margin-top:6px">Leave the dates empty for every week.</div></div>'
+'<div class="ifoot"><div class="em">'+SEMO.map(e=>'<button class="'+(t.emoji===e?'on':'')+'" data-a="sideEmoji" data-i="'+i+'" data-v="'+e+'" aria-label="emoji">'+e+'</button>').join('')+'</div><span class="grow"></span><button class="sm" data-a="sideClone" data-i="'+i+'" title="the same task at another time of day">\\uFF0B Another time</button></div></div>').join('')+'</div>'
+'<button class="addbtn" data-a="addSide">\\uFF0B Add side task</button>'
:'<div class="emptybig"><button class="pri" style="padding:14px 28px;font:800 16px var(--disp);border-radius:14px" data-a="addSide">\\uFF0B Add a side task</button><div class="hint">Nothing yet. Add what takes real time each week, or press Next to skip.</div></div>');}

function stWrap(){
const T=(k,label,sub)=>'<div class="togrow"><div class="grow"><b>'+label+'</b><div class="tiny">'+sub+'</div></div><div class="toggle'+(S.modules[k]?' on':'')+'" role="switch" tabindex="0" aria-checked="'+(!!S.modules[k])+'" aria-label="'+label+'" data-a="mod" data-v="'+k+'"></div></div>';
const hasLc=S.cats.some(c=>c.builtin==='leetcode'),hasJobs=S.cats.some(c=>c.builtin==='applications');
if(!hasLc)S.modules.leetcode=false;if(!hasJobs)S.modules.jobs=false;
const ph=S.noPlan?[]:S.phases;const tot=ph.reduce((a,p)=>a+(ymd(p.start)&&ymd(p.end)?dayCount(p):0),0);
return '<h1>Last one: what is on</h1><p class="lead">Turn off what you will not use. Everything can be switched back in Settings.</p><div class="prev" style="padding:6px 14px">'
+(hasLc?T('leetcode','\\uD83E\\uDDE9 LeetCode tab','Problem log, notes, array visualizer, solve-time stats.'):'')
+(hasJobs?T('jobs','\\uD83D\\uDCE8 Jobs tab','Application tracker with funnel and platform stats.'):'')
+T('copy','\\uD83D\\uDCCB Quick Copy','Snippets for speed-filling application forms.')
+T('clock','\\uD83D\\uDD52 Day clock','A 12-hour dial of your day on the Today page.')
+T('friends','\\uD83C\\uDFAE Friends booking','A public page where friends grab your free slots. Off for most people.')
+'</div>'
+'<div class="fg"><label class="fld" for="target">Daily grind target (hours)</label><input id="target" type="number" min="1" max="16" step="0.5" value="'+S.target+'" style="width:140px" oninput="S.target=+this.value||6">'
+'<div class="hint">Drives the heat map and the "target hit" stats. 6 is a full day of focus.</div></div>'
+(S.modules.friends?'<div class="fg"><label class="fld">Bookable window</label><div class="rng"><input type="time" id="av0" value="'+S.avail[0][0]+'" aria-label="from"><span class="tiny">to</span><input type="time" id="av1" value="'+S.avail[0][1]+'" aria-label="to"></div><div class="hint">Whatever is left of this window after grind and side tasks is what friends can book.</div></div>':'')
+'<div class="prev"><div class="pl">Ready to build</div><div class="sum">'
+'<div><span>You</span><span><b>'+esc2(S.name||'?')+'</b> \\u00b7 '+location.host+'/u/'+esc2(S.handle||'?')+'/</span></div>'
+'<div><span>Time</span><span>'+esc2(S.tz.replace(/_/g,' '))+' \\u00b7 '+(S.clock24?'24-hour':'12-hour')+'</span></div>'
+'<div><span>Plan</span><span>'+(ph.length?'<b>'+ph.length+' phase'+(ph.length>1?'s':'')+'</b> \\u00b7 '+tot+' days \\u00b7 '+ph.map(p=>esc2(p.name)).join(', '):'none yet')+'</span></div>'
+'<div><span>Layouts</span><span>'+Object.keys(S.layouts).map(n=>'<b>'+esc2(n)+'</b> '+S.layouts[n].length+' block'+(S.layouts[n].length>1?'s':'')).join(' \\u00b7 ')+'</span></div>'
+'<div><span>Categories</span><span>'+S.cats.map(c=>c.emoji+' '+esc2(c.name)+' <b>'+c.wd+'</b>/day').join(' \\u00b7 ')+'</span></div>'
+'<div><span>Side tasks</span><span>'+(S.side.length?S.side.map(t=>t.emoji+' '+esc2(t.name)+' '+t.days.map(d=>DN[d]).join(' ')+' '+fmtH(t.start)+'\\u2013'+fmtH(t.end)).join(' \\u00b7 '):'none')+'</span></div>'
+'</div><div class="hint">Your daily goals for every day of the plan are generated from these. Nothing else is seeded.</div></div>';}

// ---- validation per step ----
function collect(){
if(step===0){S.name=val('name').trim();S.handle=val('handle').trim().toLowerCase();
if(S.name.length<1)return 'Enter a display name';
if(!/^[a-z0-9][a-z0-9-]{2,29}$/.test(S.handle))return 'Handle: 3 to 30 characters, letters, numbers, dashes';
if($('hh').classList.contains('bad'))return 'That handle is taken, pick another';}
if(step===1){S.tz=val('tz')||S.tz;}
if(step===2&&!S.noPlan){
if(!S.phases.length)return 'Add at least one phase, use the template, or choose No plan yet';
for(const p of S.phases){if(!p.name.trim())return 'Every phase needs a name';if(!ymd(p.start)||!ymd(p.end)||p.end<p.start)return 'Check the dates of "'+p.name+'"';}}
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
try{sessionStorage.removeItem('lockin_wiz')}catch(e2){}
location.href='/';}catch(err){$('err').textContent='network error, try again';$('next').disabled=false;}}

// ---- one delegated handler for every button ----
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;
const a=t.dataset.a,i=+t.dataset.i,v=t.dataset.v;
if(a==='back')return go(-1);if(a==='next')return go(1);
if(a==='clock'){S.clock24=v==='1';rerender();return;}
if(a==='template')return template();
if(a==='noplan'){S.noPlan=!S.noPlan;rerender();return;}
if(a==='addPhase')return addPhase();
if(a==='delPhase'){S.phases.splice(i,1);rerender();return;}
if(a==='lowPhase'){S.phases[i].low=!S.phases[i].low;rerender();return;}
if(a==='phaseColor'){S.phases[i].color=v;rerender();return;}
if(a==='layoutDef'){S.def=v;rerender();return;}
if(a==='layoutDel'){delete S.layouts[v];if(S.def===v)S.def=Object.keys(S.layouts).filter(n=>n!=='low')[0]||Object.keys(S.layouts)[0];rerender();return;}
if(a==='blockDel'){S.layouts[v].splice(i,1);rerender();return;}
if(a==='blockAdd'){S.layouts[v].push(['19:00','21:00']);rerender();return;}
if(a==='addNight'){S.layouts.night=[['15:00','18:00'],['22:00','01:00']];rerender();return;}
if(a==='catDel'){S.cats.splice(i,1);rerender();return;}
if(a==='catEmoji'){S.cats[i].emoji=v;rerender();return;}
if(a==='catColor'){S.cats[i].color=v;rerender();return;}
if(a==='addCat'){S.cats.push({key:'',name:'',emoji:CEMO[2],color:PAL[S.cats.length%PAL.length],wd:1,we:0,low:0});rerender();const ins=document.querySelectorAll('#wiz input.nm');const last=ins[ins.length-1];if(last)last.focus();return;}
if(a==='sideDel'){S.side.splice(i,1);rerender();return;}
if(a==='sideEmoji'){S.side[i].emoji=v;rerender();return;}
if(a==='sideDay'){const t2=S.side[i];const k=t2.days.indexOf(+v);if(k<0)t2.days.push(+v);else t2.days.splice(k,1);t2.days.sort();rerender();return;}
if(a==='addSide'){S.side.push({name:'',emoji:SEMO[0],days:[1,3,5],start:'19:00',end:'20:30',from:'',to:''});rerender();const ins=document.querySelectorAll('#wiz input.nm');const last=ins[ins.length-1];if(last)last.focus();return;}
if(a==='sideClone'){const t2=S.side[i];const [h,m]=t2.end.split(':').map(Number);const p=n=>String(Math.min(23,n)).padStart(2,'0')+':'+String(m).padStart(2,'0');
S.side.splice(i+1,0,{name:t2.name,emoji:t2.emoji,days:[...t2.days],start:p(h+1),end:p(h+2),from:t2.from,to:t2.to});rerender();return;}
if(a==='mod'){S.modules[v]=!S.modules[v];rerender();return;}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='date'&&e.target.type!=='time'){e.preventDefault();go(1);}});
render();
</script>`, { public: true });
