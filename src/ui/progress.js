import { shell } from './theme.js';

const hesc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export const progressPage = (cfg, opts = {}) => {
const SH = opts.share ? (cfg.share || {}) : null;
// in share mode only the enabled blocks are rendered at all
const MODK = { lc: 'leetcode', jobs: 'jobs', friends: 'friends' };
const on = k => SH ? !!SH[k] : !(cfg && cfg.modules && MODK[k] && cfg.modules[MODK[k]] === false);
const tab = (k, id, label) => on(k) ? `<button data-t="${id}"${id === firstTab ? ' class="on"' : ''}>${label}</button>` : '';
const firstTab = !SH ? 'overview'
  : (SH.overview ? 'overview' : SH.lc ? 'lc' : SH.grind ? 'grind' : SH.jobs ? 'jobs' : SH.friends ? 'friends' : 'overview');
const pane = (k, html) => on(k) ? html : '';
const sh = (t, d) => `<div class="sech"><h2>${t}</h2></div>${d ? `<p class="secd">${d}</p>` : ''}`;
return shell(SH ? hesc(SH.title) : 'LockIn · Progress', SH ? null : '/progress', `
${SH ? `<style>.refresh-fab{display:none}</style><div class="ph"><div class="ph-t"><h1>🔥 ${hesc(SH.title)}</h1><p class="ph-d">Shared progress, read only. The numbers follow the same counting rules as the owner's own tabs.</p></div><div class="ph-a"><a class="chip" href="/" style="text-decoration:none;color:var(--ink2)">Made with LockIn</a></div></div><div class="race" id="race"></div>` : '<div class="ph"><div class="ph-t"><h1>Progress</h1><p class="ph-d">Streak, pace against the plan, and where the hours went. Every number here follows the same counting rules as the tabs it comes from.</p></div></div>'}
<div class="tabbar" id="tabs">
  ${tab('overview', 'overview', 'Overview')}
  ${tab('lc', 'lc', '🧩 LeetCode')}
  ${tab('grind', 'grind', '🔥 Grind')}
  ${tab('jobs', 'jobs', '📨 Jobs')}
  ${tab('friends', 'friends', '🎮 Friends')}
</div>

${pane('overview', `<section class="tabpane${firstTab === 'overview' ? ' on' : ''}" data-t="overview">
  <div class="statgrid" style="margin-top:16px">
    <div class="stat" style="--ac:var(--ember)"><b class="num" id="streak" style="color:var(--ember)">–</b><span>day streak 🔥</span></div>
    <div class="stat"><b class="num" id="lc">–</b><span id="lcSub">LeetCode solved</span></div>
    <div class="stat"><b class="num" id="apps">–</b><span>Applications</span></div>
    <div class="stat"><b class="num" id="tasks">–</b><span>tasks done</span></div>
  </div>
  ${sh('Finish line', 'Where the plan ends up if the last two weeks keep going like this.')}
  <div class="card" id="proj"><div class="skel">Loading…</div></div>
  ${sh('Pace vs plan', 'Done so far against what the daily goals added up to by today.')}
  <div class="card" id="pace"><div class="skel">Loading…</div></div>
  ${sh('This week vs last week', 'Monday to today, compared with the same days last week.')}
  <div class="card" id="week"></div>
  ${sh('Records', 'Your best single days and longest runs.')}
  <div class="recgrid" id="records"></div>
  ${sh('Off days', 'Days you marked off. They never break a streak.')}
  <div class="card" id="offdays"><div class="skel">None yet. Rest is allowed.</div></div>
</section>`)}

${pane('lc', `<section class="tabpane${firstTab === 'lc' ? ' on' : ''}" data-t="lc">
  <div class="statgrid" style="margin-top:16px">
    <div class="stat" style="--ac:var(--ember)"><b class="num" id="lcAvg" style="color:var(--ember)">–</b><span>avg solve time</span></div>
    <div class="stat" style="--ac:var(--mint)"><b class="num" id="lcEasy" style="color:var(--mint)">–</b><span>easy avg</span></div>
    <div class="stat" style="--ac:var(--ember2)"><b class="num" id="lcMed" style="color:var(--ember2)">–</b><span>medium avg</span></div>
    <div class="stat" style="--ac:var(--rose)"><b class="num" id="lcHard" style="color:var(--rose)">–</b><span>hard avg</span></div>
  </div>
  ${sh('What you are actually training', 'Share of timed solves by difficulty and by outcome.')}
  <div class="card" id="lcMix"><div class="skel">Loading…</div></div>
  <div class="card" id="lcTrendCard"></div>
  ${sh('Avg solve time · last 30 days', 'Average minutes per timed solve, per day. Lower is better.')}
  <div class="card" id="chart-lctime"><div class="skel">Loading…</div></div>
  ${sh('Problems solved · last 30 days', 'Solves per day against that day\u2019s goal.')}
  <div class="card" id="chart-lc"><div class="skel">Loading…</div></div>
  ${SH ? '' : '<div class="linkcard"><a href="/leetcode">Every problem, its tries and its notes live on the LeetCode tab &rarr;</a></div>'}
  ${!SH || SH.lcNames ? sh('History', 'Every day with a logged solve, newest first. Tap a day to expand it.') + '<div id="lcDays"></div>' : ''}
</section>`)}

${pane('grind', `<section class="tabpane${firstTab === 'grind' ? ' on' : ''}" data-t="grind">
  <div class="statgrid" style="margin-top:16px">
    <div class="stat" style="--ac:var(--ember)"><b class="num" id="gh" style="color:var(--ember)">–</b><span>total hours 🔥</span></div>
    <div class="stat"><b class="num" id="gavg">–</b><span>avg h / grind day</span></div>
    <div class="stat" style="--ac:var(--rose)"><b class="num" id="got" style="color:var(--rose)">–</b><span>overtime hours</span></div>
    <div class="stat"><b class="num" id="gdays">–</b><span>days checked in</span></div>
  </div>
  ${sh('Last 8 weeks', 'One square per day. Darker means more checked-in hours.')}
  <div class="card">
    <div style="overflow-x:auto;padding:4px 0"><div class="heat" id="heat"></div></div>
    <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:8px 12px"><span class="tiny">less</span>
    <span style="display:flex;gap:4px">${[0.12, 0.35, 0.6, 1].map(o => `<span style="width:12px;height:12px;border-radius:3px;background:rgba(255,107,53,${o})"></span>`).join('')}</span>
    <span class="tiny">more</span><span class="grow"></span><span class="tiny" id="gtarget">target: 6h/day</span></div>
  </div>
  ${sh('Which weekday carries you', 'Average grind hours by weekday, across every week in the plan.')}
  <div class="card" id="dowCard"><div class="skel">Loading…</div></div>
  ${sh('Grind hours · last 14 days', 'Checked-in hours per day against your grind target.')}
  <div class="card" id="chart-grind"><div class="skel">Loading…</div></div>
  <div class="card" id="modsplit" style="display:none"></div>
</section>`)}

${pane('jobs', `<section class="tabpane${firstTab === 'jobs' ? ' on' : ''}" data-t="jobs">
  <div class="statgrid" style="margin-top:16px">
    <div class="stat" style="--ac:var(--ice)"><b class="num" id="jTot" style="color:var(--ice)">–</b><span>applications</span></div>
    <div class="stat"><b class="num" id="jWeek">–</b><span>per week</span></div>
    <div class="stat" style="--ac:var(--mint)"><b class="num" id="jResp" style="color:var(--mint)">–</b><span>heard back</span></div>
    <div class="stat" style="--ac:var(--ember2)"><b class="num" id="jLast" style="color:var(--ember2)">–</b><span>since last one</span></div>
  </div>
  ${sh('Funnel', 'How far applications get. Each row is a share of the total.')}
  <div class="card" id="funnel"><div class="skel">No applications tracked yet.</div></div>
  ${sh('By platform', 'Where the applications came from.')}
  <div class="card" id="platforms"></div>
  ${sh('Applications · last 30 days', 'Applications sent per day against that day\u2019s goal.')}
  <div class="card" id="chart-apps"><div class="skel">Loading…</div></div>
  ${sh('Daily history', 'Every day with at least one application.')}
  <div class="card"><div id="list-apps" style="max-height:340px;overflow-y:auto"></div></div>
</section>`)}

${pane('friends', `<section class="tabpane${firstTab === 'friends' ? ' on' : ''}" data-t="friends">
  ${sh('Friend time', 'Hours logged with friends, by person and by activity.')}
  <div class="card" id="friends"><div class="skel">Loading…</div></div>
</section>`)}
${SH ? '<p class="tiny" style="text-align:center;margin:28px 0 8px">read only · shared by ' + hesc(SH.title) + '</p>' : ''}
<div class="chart-tip" id="tip"></div>
`, `<script>
const SHARE=${SH ? 'true' : 'false'};
const API=SHARE?((window.__U&&window.__U.base)||'')+'/api/share/progress':'/api/progress';
const fmtD=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
const shortD=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const mins=m=>m?(m>=60?fmtDur(Math.round(m)):(Math.round(m*10)/10)+'m'):'–';
const nf=v=>{const r=Math.round(v*10)/10;return String(r===Math.round(r)?Math.round(r):r);};
const DOWN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOWFULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// tabs
let TAB=localStorage.getItem(SHARE?'lockin_stab':'lockin_ptab')||'overview';
if(!document.querySelector('#tabs button[data-t="'+TAB+'"]')){
const first=document.querySelector('#tabs button');TAB=first?first.dataset.t:'overview';}
function setTab(t){TAB=t;localStorage.setItem(SHARE?'lockin_stab':'lockin_ptab',t);
document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
document.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on',p.dataset.t===t));
// a chart in a hidden pane measures 0 wide, so redraw whatever just became visible
redrawCharts();}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));

/* ================= charts =================
   SVG units are CSS pixels here (the viewBox width is the measured width), so axis
   labels keep their real size on a phone instead of shrinking with the drawing.
   Every chart redraws on resize and on tab switch. */
const CHARTS=[];
// a gridline step that lands on round numbers, so a count axis never reads 3.8 / 7.5
function niceStep(v){
if(!(v>0))return 1;
const e=Math.pow(10,Math.floor(Math.log10(v))),n=v/e;
const m=n<=1?1:n<=2?2:n<=3?3:n<=5?5:10;
return m*e;}
function chart(el,data,unit,color,o){
if(!el||!data||!data.length)return;
el.__ch={data:data,unit:unit,color:color,o:o||{}};
if(CHARTS.indexOf(el)<0)CHARTS.push(el);
drawChart(el);}
function redrawCharts(){CHARTS.forEach(drawChart);}
let rzT;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(redrawCharts,140);});

function drawChart(el){
const C=el.__ch;if(!C)return;
const data=C.data,unit=C.unit,color=C.color,o=C.o;
const n=data.length;
const fmt=o.fmt||(v=>nf(v));
const vfmt=o.vfmt||fmt;
const W=Math.max(250,Math.round(el.clientWidth||600));
const narrow=W<430;
const H=narrow?170:210;
const padL=narrow?30:36,padR=8,padT=22,padB=narrow?28:30;
const plotW=W-padL-padR,plotH=H-padT-padB;
const vals=data.map(d=>+d.v||0),goals=data.map(d=>+d.g||0);
const rawMax=Math.max.apply(null,vals.concat(goals).concat([0]));
const allInt=vals.concat(goals).every(v=>v===Math.round(v));
let step=niceStep(Math.max(rawMax,1)/(narrow?3:4));
if(allInt)step=Math.max(1,Math.round(step));
const mx=Math.max(step,Math.ceil((rawMax-1e-9)/step)*step);
const y=v=>padT+plotH-(v/mx)*plotH;
const bw=plotW/n,gap=Math.min(4,Math.max(1,bw*0.22)),barW=Math.max(2,bw-gap);
const act=[];for(let i=0;i<n;i++)if(vals[i]>0)act.push(i);
const sum=vals.reduce((a,b)=>a+b,0);
const avg=act.length?sum/act.length:0;
const best=Math.max.apply(null,vals.concat([0]));
const showAvg=o.avg!==false&&act.length>1;

let s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none" style="width:100%;height:'+H+'px;display:block" role="img" aria-label="'+unit+' per day">';
// horizontal grid + scale numbers, so a bar has a readable value without hovering
const ticks=[];for(let v=0;v<=mx+1e-9;v+=step)ticks.push(Math.round(v*1000)/1000);
for(let t=0;t<ticks.length;t++){const tv=ticks[t];
s+='<line x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y(tv)+'" y2="'+y(tv)+'" stroke="'+(tv===0?'var(--line2)':'var(--line)')+'" stroke-width="1"/>'
+'<text x="'+(padL-6)+'" y="'+(y(tv)+3.5)+'" text-anchor="end" class="cax">'+(o.ytick?o.ytick(tv):vfmt(tv))+'</text>';}
// per-day goal dashes
for(let i=0;i<n;i++)if(goals[i]>0)
s+='<line x1="'+(padL+i*bw+gap/2)+'" x2="'+(padL+i*bw+gap/2+barW)+'" y1="'+y(goals[i])+'" y2="'+y(goals[i])+'" stroke="var(--ink3)" stroke-width="1.5" stroke-dasharray="3 3"/>';
// bars, with a flat nub on days that logged nothing so a gap never looks like missing data
for(let i=0;i<n;i++){const d=data[i],v=vals[i],x=padL+i*bw+gap/2;
if(v<=0){s+='<rect x="'+x+'" y="'+(padT+plotH-2)+'" width="'+barW+'" height="2" rx="1" fill="var(--line2)"/>';}
else{const h=Math.max(3,(v/mx)*plotH);
const fill=color||(d.hit?'var(--mint)':(o.dim||'rgba(151,163,182,.55)'));
s+='<rect x="'+x+'" y="'+(padT+plotH-h)+'" width="'+barW+'" height="'+h+'" rx="4" fill="'+fill+'"/>';}}
// value labels: every bar when they fit, otherwise just the peak and the latest
const lab={};
if(barW>=17){for(let i=0;i<act.length;i++)lab[act[i]]=1;}
else if(act.length){lab[vals.indexOf(best)]=1;lab[act[act.length-1]]=1;}
for(const k in lab){const i=+k,v=vals[i];if(!(v>0))continue;
const h=Math.max(3,(v/mx)*plotH);
s+='<text x="'+(padL+i*bw+bw/2)+'" y="'+(padT+plotH-h-5)+'" text-anchor="middle" class="cvl">'+vfmt(v)+'</text>';}
if(showAvg)s+='<line x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y(avg)+'" y2="'+y(avg)+'" stroke="var(--ice)" stroke-width="1.3" stroke-dasharray="5 4" opacity=".85"/>';
// dates along the bottom, walking back from the newest so today is always labelled
const dstep=Math.max(1,Math.ceil(n/Math.max(2,Math.floor(plotW/(narrow?44:60)))));
for(let i=n-1;i>=0;i-=dstep)
s+='<text x="'+(padL+i*bw+bw/2)+'" y="'+(H-padB+15)+'" text-anchor="middle" class="cax">'+shortD(data[i].d)+'</text>';
for(let i=0;i<n;i++)
s+='<rect class="hz" data-i="'+i+'" x="'+(padL+i*bw)+'" y="'+padT+'" width="'+bw+'" height="'+plotH+'" fill="transparent"/>';
s+='</svg>';

const ci=(v,l)=>'<div class="ci"><b class="num">'+v+'</b><span>'+l+'</span></div>';
const cards=o.summary?o.summary({sum:sum,avg:avg,best:best,active:act.length,n:n,vals:vals,data:data})
:[['total',fmt(sum)],['avg / day',fmt(avg)],['best day',fmt(best)],['active days',act.length+' / '+n]];
const top='<div class="csum">'+cards.map(c=>ci(c[1],c[0])).join('')+'</div>';

let leg='';
if(!color)leg+='<span><i class="lgs" style="background:var(--mint)"></i>goal hit</span>'
+'<span><i class="lgs" style="background:'+(o.dim||'rgba(151,163,182,.55)')+'"></i>below goal</span>'
+'<span><i class="lgd"></i>daily goal</span>';
else leg+='<span><i class="lgs" style="background:'+color+'"></i>'+unit+'</span>';
if(showAvg)leg+='<span><i class="lgd ice"></i>avg '+fmt(avg)+'</span>';
leg+='<span><i class="lgs" style="background:var(--line2);height:4px;border-radius:2px"></i>nothing logged</span>';

el.innerHTML=top+s+'<div class="clegend">'+leg+'</div>';

const tipFor=o.tip||(d=>'<b>'+fmtD(d.d)+'</b><br>'+fmt(+d.v||0)+' '+unit
+(d.g>0?' · goal '+d.g:'')+(d.hit?' <span style="color:var(--mint)">✓ hit</span>':''));
const t=$('tip');let hideT;
const show=(cx,cy,i)=>{t.innerHTML=tipFor(data[i]);t.style.display='block';
// the page is zoomed at >=1100px, and a fixed element inside a zoomed root has its
// left/top multiplied too, while clientX/clientY are not: divide it back out
const z=+getComputedStyle(document.documentElement).zoom||1;
const vw=window.innerWidth/z,w=t.offsetWidth;
let x=cx/z+14;if(x+w>vw-8)x=cx/z-w-14;
t.style.left=Math.max(8,x)+'px';t.style.top=Math.max(8,cy/z-46)+'px';};
const hide=()=>{t.style.display='none';};
el.querySelectorAll('.hz').forEach(r=>{
const i=+r.dataset.i;
r.addEventListener('mousemove',e=>{clearTimeout(hideT);show(e.clientX,e.clientY,i);});
r.addEventListener('mouseleave',hide);
// tap on a phone: show it, then get out of the way on its own
r.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;
show(e.clientX,e.clientY,i);clearTimeout(hideT);hideT=setTimeout(hide,2800);});});}

function trendChip(label,now,prev){
if(!now&&!prev)return '';
const d=prev&&now?Math.round((now-prev)/prev*100):0;
const better=d<0; // less time = better
const cls=!d?'flat':(better?'up':'down');
return '<div class="trow"><b class="trl">'+label+'</b>'
+'<span class="trv">'+mins(now)+'</span>'
+'<span class="trd delta '+cls+'">'+(prev&&now?((better?'▼':'▲')+' '+Math.abs(d)+'%'):'')+'</span>'
+'<span class="trs">last 7 days'+(prev?' · prev '+mins(prev):' · no earlier data')+'</span></div>';}

function paceRow(label,p,color,cons){
const pct=p.target>0?Math.min(1,p.done/p.target):0;
const ok=p.diff>=0;
const c=cons&&cons.days?'<div style="margin-top:4px"><span class="tiny">goal hit on <b class="num">'+cons.hit+'</b> of '+cons.days+' days · '+Math.round(cons.hit/cons.days*100)+'%</span></div>':'';
return '<div class="pacei"><div class="row" style="flex-wrap:wrap;gap:4px 8px"><b>'+label+'</b><span class="grow"></span>'
+'<span class="num">'+p.done+' / '+p.target+' planned</span>'
+'<span class="delta '+(ok?'up':'down')+'">'+(ok?(p.diff>0?'+'+p.diff+' ahead':'on pace'):p.diff+' behind')+'</span></div>'
+'<div class="pace-bar"><div style="width:'+(pct*100)+'%;background:'+(ok?'var(--mint)':color)+'"></div></div>'+c+'</div>';}

function weekRow(label,cur,prev,unit){
const d=Math.round((cur-prev)*10)/10;
const cls=d>0?'up':d<0?'down':'flat';
const arrow=d>0?'▲':d<0?'▼':'●';
return '<div class="trow"><b class="trl">'+label+'</b>'
+'<span class="trv">'+cur+'</span>'
+'<span class="trd delta '+cls+'">'+arrow+' '+Math.abs(d)+'</span>'
+'<span class="trs">'+unit+' this week · last week '+prev+'</span></div>';}

// finish-line forecast: where today's rate lands on Dec 15
function projRow(label,done,target,color,P){
if(!target)return '';
const rate=P.elapsed>0?done/P.elapsed:0;
const proj=Math.round(done+rate*P.left);
const need=P.left>0?(target-done)/P.left:0;
const ok=proj>=target;
const dPct=Math.min(100,done/target*100);
const pPct=Math.min(100,proj/target*100);
return '<div class="pj"><div class="pjh"><b>'+label+'</b><span class="grow"></span>'
+'<span class="delta '+(ok?'up':'down')+'">'+(ok?'on track for '+shortD(P.end):(target-proj)+' short by '+shortD(P.end))+'</span></div>'
+'<div class="pjbar"><i class="pr" style="width:'+pPct+'%;background-color:'+color+'"></i>'
+'<i class="dn" style="width:'+dPct+'%;background-color:'+color+'"></i></div>'
+'<div class="pjm"><span><i class="sw" style="background-color:'+color+'"></i><b>'+done+'</b> done today</span>'
+'<span><i class="sw pr" style="background-color:'+color+'"></i><b>~'+proj+'</b> by '+shortD(P.end)+' at this rate</span>'
+'<span><i class="sw tr"></i><b>'+target+'</b> the plan wants</span></div>'
+'<div class="pjn">'+nf(rate)+' / day so far'+(P.left>0?(' · need <b>'+nf(Math.max(0,need))+' / day</b> for the last '+P.left+' days'):' · plan is over')+'</div></div>';}

async function load(){
const j=await api(API);
if(SHARE&&j.phases&&$('race'))raceBar($('race'),j.phases,j.today);
// ---- overview ----
if(j.streak!==undefined){
$('streak').textContent=j.streak;$('lc').textContent=j.totalLC;$('apps').textContent=j.totalApps;$('tasks').textContent=j.tasksDone;
const openN=j.lcOpen!==undefined?j.lcOpen:((j.lc&&j.lc.openTotal)||0);
const slowN=j.lcSlow!==undefined?j.lcSlow:((j.lc&&j.lc.slowTotal)||0);
// solved means cleanly solved, so both of these are still outstanding work and must be visible,
// otherwise the tile silently loses problems from the count
const sub=[];
if(openN)sub.push(openN+' still unsolved');
if(slowN)sub.push(slowN+' solved slow');
$('lcSub').innerHTML='LeetCode solved'+(sub.length?'<br><span style="color:var(--ember2)">'+sub.join(' · ')+'</span>':'');
const P=j.plan;
if(P&&$('proj'))$('proj').innerHTML='<p class="tiny" style="margin-bottom:8px">Day <b class="num">'+P.elapsed+'</b> of the plan · <b class="num">'+P.left+'</b> days left until '+shortD(P.end)+'. This is a forecast for the <b>whole plan</b>, not a debt you owe today: it carries your rate so far forward to '+shortD(P.end)+'.</p>'
+projRow('🧩 LeetCode',j.pace.leetcode.done,P.lc,'var(--ember)',P)
+projRow('📨 Applications',j.pace.apps.done,P.apps,'var(--ice)',P);
const CO=j.consistency||{};
$('pace').innerHTML='<p class="tiny" style="margin-bottom:2px">Since '+(j.plan?shortD(j.plan.start):'the start')+' vs what the plan asked for by today. LeetCode counts <b>problems cracked</b>, one per problem: a rerun of something you already solved does not add another. Slow solves and unfinished attempts are still work, but they do not move the plan.</p>'
+paceRow('🧩 LeetCode',j.pace.leetcode,'var(--ember)',CO.leetcode)
+paceRow('📨 Applications',j.pace.apps,'var(--ice)',CO.apps);
$('week').innerHTML=weekRow('🧩 LeetCode',j.week.lc[0],j.week.lc[1],'logged')
+weekRow('📨 Applications',j.week.apps[0],j.week.apps[1],'sent')
+weekRow('🔥 Grind',j.week.grind[0],j.week.grind[1],'hours');
const R=j.records;
const rec=(v,label)=>'<div class="rec-chip"><b class="num">'+v+'</b><span>'+label+'</span></div>';
$('records').innerHTML=
rec(R.longestStreak+'d','longest streak')
+(R.bestLC&&R.bestLC.v>0?rec(R.bestLC.v,'best LC day · '+fmtD(R.bestLC.d)):'')
+(R.bestApps&&R.bestApps.v>0?rec(R.bestApps.v,'best apps day · '+fmtD(R.bestApps.d)):'')
+(R.bestGrind?rec(R.bestGrind.v+'h','biggest grind · '+fmtD(R.bestGrind.d)):'')
||'<span class="muted">Records appear once you start logging.</span>';
const OD=j.offdays||{total:0,reasons:[],recent:[]};
if(OD.total){$('offdays').innerHTML=
'<div class="row"><b class="num" style="font:800 28px var(--disp)">'+OD.total+'</b><span class="tiny">off day'+(OD.total>1?'s':'')+' total</span></div>'
+'<div class="row" style="flex-wrap:wrap;gap:8px;margin-top:12px">'+OD.reasons.map(r=>'<span class="chip">💤 '+esc(r.r)+' <b class="num">×'+r.n+'</b></span>').join('')+'</div>'
+'<div style="margin-top:12px">'+OD.recent.map(o=>'<div class="exp-row"><span class="num" style="color:var(--ink2);min-width:96px">'+fmtD(o.date)+'</span><span class="tiny">'+esc(o.reason||'')+'</span></div>').join('')+'</div>';}
}

// ---- leetcode ----
if(j.lc){
const L=j.lc||{total:0,avg:0,easy:{},medium:{},hard:{},trend:[],days:[]};
$('lcAvg').textContent=mins(L.avg);$('lcEasy').textContent=mins(L.easy.avg);
$('lcMed').textContent=mins(L.medium.avg);$('lcHard').textContent=mins(L.hard.avg);
// difficulty mix + crack rate: what the training actually consists of
const dn=L.easy.n+L.medium.n+L.hard.n;
// every problem ever opened: cleanly solved + never solved + solved but slow
const cracked=L.solvedTotal||0,unsolved=L.openTotal||0,slowN2=L.slowTotal||0,seen=cracked+unsolved+slowN2;
const seg=(v,c,lbl)=>v?'<i style="width:'+(v/dn*100)+'%;background:'+c+'" title="'+lbl+'">'+(v/dn>0.09?v:'')+'</i>':'';
const hardShare=dn?Math.round((L.medium.n+L.hard.n)/dn*100):0;
$('lcMix').innerHTML=dn?('<div class="bp-label">Difficulty mix of your '+dn+' timed solves</div>'
+'<div class="mixbar">'+seg(L.easy.n,'var(--mint)','easy')+seg(L.medium.n,'var(--ember2)','medium')+seg(L.hard.n,'var(--rose)','hard')+'</div>'
+'<div class="mixleg"><span><i style="background:var(--mint)"></i>'+L.easy.n+' easy</span>'
+'<span><i style="background:var(--ember2)"></i>'+L.medium.n+' medium</span>'
+'<span><i style="background:var(--rose)"></i>'+L.hard.n+' hard</span></div>'
+'<div class="mixnote">'+(hardShare<50
?'<b>'+hardShare+'%</b> of your solves are medium or hard. Interviews are mostly medium, so this is the number to push up.'
:'<b>'+hardShare+'%</b> medium or hard. That is interview-shaped, keep it there.')+'</div>'
+(seen?('<div class="mixleg" style="margin-top:12px"><span>cracked <b class="num">'+cracked+'</b> of '+seen+' problems opened · <b class="num">'+Math.round(cracked/seen*100)+'%</b> crack rate</span>'
+(L.slowTotal?'<span><b class="num">'+L.slowTotal+'</b> solved but slow, not counted as solved until you rerun it</span>':'')+'</div>'):''))
:'<div class="skel"><b>No timed solves yet</b>Log a few with the Focus timer and the mix shows up here.</div>';
$('lcTrendCard').innerHTML=L.total?('<div class="bp-label">Getting faster? (lower is better)</div>'
+trendChip('Overall',L.avgNow,L.avgPrev)
+trendChip('🟢 Easy',L.easy.avgNow,L.easy.avgPrev)
+trendChip('🟡 Medium',L.medium.avgNow,L.medium.avgPrev)
+trendChip('🔴 Hard',L.hard.avgNow,L.hard.avgPrev)
+'<div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px 16px">'
+'<span class="tiny">solves timed: <b class="num">'+L.total+'</b>'+(L.attempts?' · '+L.attempts+' unfinished tr'+(L.attempts>1?'ies':'y')+' not counted here':'')+'</span>'
+'<span class="tiny">'+L.easy.n+' easy · '+L.medium.n+' medium · '+L.hard.n+' hard</span></div>')
:'<div class="skel"><b>No solve times yet</b>Use the Focus timer with 🧩 LeetCode record on, and they land here.</div>';
if(L.trend&&L.trend.length)chart($('chart-lctime'),L.trend,'min avg','var(--ember)',{
fmt:v=>nf(v)+'m',vfmt:v=>String(Math.round(v)),
tip:d=>'<b>'+fmtD(d.d)+'</b><br>'+(d.v?nf(d.v)+' min average over '+d.n+' solve'+(d.n===1?'':'s'):'no solves logged'),
summary:st=>{const won=st.data.filter(d=>d.v>0);
const fast=won.length?Math.min.apply(null,won.map(d=>d.v)):0;
const slow=won.length?Math.max.apply(null,won.map(d=>d.v)):0;
const tot=won.reduce((a,d)=>a+(d.n||0),0);
return [['fastest day',fast?nf(fast)+'m':'–'],['slowest day',slow?nf(slow)+'m':'–'],
['day average',won.length?nf(won.reduce((a,d)=>a+d.v,0)/won.length)+'m':'–'],['solves timed',String(tot)]];}});
chart($('chart-lc'),j.lc30,'problems',null,{dim:'rgba(255,107,53,.45)',
summary:st=>{const hit=st.data.filter(d=>d.hit).length,withGoal=st.data.filter(d=>d.g>0).length;
return [['logged',String(Math.round(st.sum))],['best day',String(Math.round(st.best))],
['active days',st.active+' / '+st.n],['goal hit',hit+(withGoal?' / '+withGoal:'')]];}});
if($('lcDays'))$('lcDays').innerHTML=L.days&&L.days.length?L.days.map(d=>{
const finRows=d.solves.filter(s=>s.finished!==0),att=d.solves.length-finRows.length;
const slowN=d.solves.filter(s=>+s.finished===2).length;
const avg=finRows.length?Math.round(finRows.reduce((a,s)=>a+s.minutes,0)/finRows.length):0;
return '<div class="dayc" onclick="this.classList.toggle(\\'open\\')">'
+'<div class="dhd"><span class="dt">'+fmtD(d.d)+'</span>'
+'<span class="dsum"><b>'+finRows.length+'</b> solved'
+(slowN?' · <b>'+slowN+'</b> slow':'')
+(att?' · <b>+'+att+'</b> attempt'+(att>1?'s':''):'')
+(avg?' · avg <b>'+mins(avg)+'</b>':'')+'</span></div>'
+'<div class="exp-list" onclick="event.stopPropagation()">'+d.solves.map(s=>
'<div class="lcrow'+(s.finished===0?' dim':'')+'"><span class="diff '+s.difficulty+'">'+s.difficulty.toUpperCase()+'</span>'
+'<span class="nm" title="'+esc(s.name||'')+'">'+esc(s.name||'(no name)')+'</span>'
+outBadge(s.finished)
+'<b class="mn">'+mins(s.minutes)+'</b>'
+(s.source==='timer'?'<span class="tiny" title="timed live">⏱</span>':'')
+(SHARE?'':'<button class="ghost sm" style="padding:0 8px" onclick="delSolve('+s.id+')">✕</button>')+'</div>').join('')
+'</div></div>';}).join(''):'<div class="empty"><b>No solves recorded yet</b>Every attempt you log lands here, day by day.</div>';
}

// ---- grind ----
if(j.grind){
const G=j.grind||{total:0,avg:0,overtime:0,days:0,last14:[],moduleTotals:{}};
$('gh').textContent=G.total;$('gavg').textContent=G.avg;$('got').textContent=G.overtime;$('gdays').textContent=G.days;
if($('gtarget')&&G.days)$('gtarget').innerHTML='6h target hit on <b class="num">'+(G.targetDays||0)+'</b> of '+G.days+' days';
$('heat').innerHTML=j.heat.map(h=>{
const o=h.v<=0?0:Math.min(1,0.15+h.v/6*0.85);
return '<div title="'+fmtD(h.d)+' · '+h.v+'h" style="background:'+(o?'rgba(255,107,53,'+o+')':'var(--surface2)')+'"></div>';}).join('');
// weekday pattern: which day of the week actually carries the grind
const DW=G.dow||[];
const dwAct=DW.filter(x=>x.n>0);
if($('dowCard')){
if(dwAct.length){
const mxd=Math.max.apply(null,dwAct.map(x=>x.avg));
const bestD=dwAct.slice().sort((a,b)=>b.avg-a.avg)[0];
const worstD=dwAct.slice().sort((a,b)=>a.avg-b.avg)[0];
const order=[1,2,3,4,5,6,0];
$('dowCard').innerHTML='<div class="bp-label">Average grind hours by weekday</div>'
+'<div class="dow">'+order.map(w=>{const x=DW[w]||{avg:0,n:0};
const h=mxd>0?(x.avg>0?Math.max(6,x.avg/mxd*100):0):0;
const col=!x.n?'var(--line2)':(w===bestD.w?'var(--mint)':(w===worstD.w&&dwAct.length>1?'var(--rose)':'var(--ember)'));
return '<div class="dw"><div class="bar" title="'+DOWFULL[w]+' · '+x.n+' day'+(x.n===1?'':'s')+' logged"><i style="height:'+h+'%;background:'+col+'"></i></div>'
+'<b>'+(x.n?nf(x.avg):'–')+'</b><span>'+DOWN[w]+'</span></div>';}).join('')+'</div>'
+'<div class="mixnote">Strongest: <b>'+DOWFULL[bestD.w]+'</b> at '+nf(bestD.avg)+'h avg'
+(dwAct.length>1?('. Weakest: <b>'+DOWFULL[worstD.w]+'</b> at '+nf(worstD.avg)+'h. '
+(worstD.avg<3?'That is the day to attack next week.':'The week is fairly even, which is what you want.')):'')+'</div>';}
else $('dowCard').innerHTML='<div class="skel"><b>No pattern yet</b>Check in to a few grind blocks and the weekly shape appears here.</div>';}
chart($('chart-grind'),G.last14.length?G.last14:[{d:new Date().toISOString().slice(0,10),v:0,g:6,hit:false}],'hours',null,{dim:'rgba(255,107,53,.45)',
fmt:v=>nf(v)+'h',vfmt:v=>nf(v),
tip:d=>'<b>'+fmtD(d.d)+'</b><br>'+(d.v?nf(d.v)+' hours grinded':'no grind logged')+(d.g?' · target '+d.g+'h':'')+(d.hit?' <span style="color:var(--mint)">✓ hit</span>':''),
summary:st=>{const hit=st.data.filter(d=>d.hit).length;
return [['total',nf(st.sum)+'h'],['avg / day',nf(st.avg)+'h'],['biggest day',nf(st.best)+'h'],['6h target',hit+' / '+st.n]];}});
const MODN=Object.fromEntries(CATS.map(c=>[c.key,c.emoji+' '+c.name]));
const mt=Object.entries(G.moduleTotals||{});
if(mt.length){$('modsplit').style.display='';
const grand=mt.reduce((a,b)=>a+b[1],0);
$('modsplit').innerHTML='<div class="bp-label">Where grind time went · tap a row for the day by day</div>'
+mt.sort((a,b)=>b[1]-a[1]).map(([t,m])=>{
const days=Object.entries((G.moduleDays||{})[t]||{}).sort((a,b)=>a[0]<b[0]?1:-1);
return '<div class="prow"><div class="hd"><span class="cx">▸</span>'
+'<span class="grow" style="min-width:0">'+(MODN[t]||t)+'</span>'
+'<span class="tiny">'+(grand?Math.round(m/grand*100):0)+'% · '+days.length+'d</span>'
+'<b class="num">'+Math.round(m/60*10)/10+'h</b></div>'
+'<div class="ppanel">'+(days.length?days.map(([d,mm])=>
'<div class="exp-row"><span class="num" style="color:var(--ink2);min-width:88px">'+fmtD(d)+'</span>'
+'<b class="num">'+fmtDur(mm)+'</b><span class="grow"></span>'
+'<span class="tiny">'+(m?Math.round(mm/m*100):0)+'%</span></div>').join('')
:'<div class="skel">No days recorded.</div>')+'</div></div>';}).join('');
$('modsplit').querySelectorAll('.prow>.hd').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));}
}

// ---- jobs ----
if(j.funnel){
const F=j.funnel,JM=j.jobsMeta||{},P=j.plan;
if($('jTot')){
$('jTot').textContent=F.applied;
const wks=P&&P.elapsed?P.elapsed/7:0;
$('jWeek').textContent=wks?nf(F.applied/wks):'–';
$('jResp').textContent=F.applied?Math.round(F.heardBack/F.applied*100)+'%':'–';
if(JM.lastDate&&j.today){
const dd=Math.round((Date.parse(j.today+'T00:00:00Z')-Date.parse(JM.lastDate+'T00:00:00Z'))/86400000);
$('jLast').textContent=dd<=0?'today':dd+'d';}
else $('jLast').textContent='–';}
if(F.applied>0){
const mx=Math.max(1,F.applied);
const bar=(label,v,color)=>'<div class="funnel-row"><span class="fl">'+label+'</span>'
+'<div class="fb" style="width:'+Math.max(5,v/mx*100)+'%;background:'+color+'">'+v+'</div>'
+'<span class="fp">'+Math.round(v/mx*100)+'%</span></div>';
$('funnel').innerHTML=bar('Applied',F.applied,'var(--ice)')+bar('OA',F.oa,'var(--violet)')
+bar('Interview',F.interview,'var(--ember2)')+bar('Offer 🎉',F.offer,'var(--mint)')
+'<div class="row" style="margin-top:12px;flex-wrap:wrap;gap:4px 12px"><span class="tiny">heard back: <b class="num">'+F.heardBack+'</b> ('+Math.round(F.heardBack/mx*100)+'%)</span>'
+'<span class="grow"></span><span class="tiny">rejected: '+F.rejected+'</span></div>';}
const PL=j.byPlatform||[];
$('platforms').innerHTML=PL.length?PL.map(p=>{
const mx=Math.max.apply(null,PL.map(x=>x.n));
const tot=PL.reduce((a,x)=>a+x.n,0);
return '<div class="funnel-row"><span class="fl">'+esc(p.p)+'</span>'
+'<div class="fb" style="width:'+Math.max(6,p.n/mx*100)+'%;background:var(--ice)">'+p.n+'</div>'
+'<span class="fp">'+Math.round(p.n/tot*100)+'%</span></div>';}).join('')
:'<div class="skel">Nothing yet.</div>';
chart($('chart-apps'),j.apps30,'apps',null,{dim:'rgba(94,162,255,.45)',
summary:st=>{const hit=st.data.filter(d=>d.hit).length,withGoal=st.data.filter(d=>d.g>0).length;
return [['sent',String(Math.round(st.sum))],['best day',String(Math.round(st.best))],
['active days',st.active+' / '+st.n],['goal hit',hit+(withGoal?' / '+withGoal:'')]];}});
$('list-apps').innerHTML=j.history.apps.length?j.history.apps.map(r=>
'<div class="exp-row"><span class="num" style="color:var(--ink2);min-width:96px">'+fmtD(r.d)+'</span>'
+'<b class="num">'+r.v+'</b><span class="tiny">/ '+r.g+'</span><span class="grow"></span>'
+(r.g>0?(r.v>=r.g?'<span style="color:var(--mint)">✓</span>':'<span style="color:var(--ink3)">✗</span>'):'')+'</div>').join('')
:'<div class="skel">Nothing yet.</div>';
}

// ---- friends ----
if(j.friends){
$('friends').innerHTML=j.friends.length?j.friends.map(f=>
'<div class="qrow">'+avatar(f.name)+'<b>'+esc(f.name)+'</b><span class="grow"></span>'
+'<span class="num" style="font:800 16px var(--disp)">'+f.hours+'h</span>'
+'<span class="tiny">'+f.sessions+' session'+(f.sessions>1?'s':'')+' · '+esc(f.acts||'')+'</span></div>').join('')
:'<div class="skel"><b>No sessions yet</b>Time with friends shows up here once you confirm a booking or log one.</div>';
}
redrawCharts();
}
async function delSolve(id){
if(!confirm('Delete this solve? The day counter goes down by 1.'))return;
await api('/api/lc/'+id,{method:'DELETE'});toast('Deleted');load();}
setTab(TAB);
load();
</script>`, { cfg, mclock: cfg && cfg.mclock, public: !!SH });
};
