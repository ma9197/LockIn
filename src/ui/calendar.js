import { shell } from './theme.js';

export const calendarPage = (cfg) => shell('LockIn · Calendar', '/calendar', `
<div class="row">
  <h1>Calendar</h1>
  <span class="right"></span>
  <button class="ghost sm" onclick="nav(-1)" aria-label="Previous month">‹</button>
  <b id="mt" class="num" style="font:800 16px var(--disp);min-width:150px;text-align:center"></b>
  <button class="ghost sm" onclick="nav(1)" aria-label="Next month">›</button>
</div>
<div class="race" id="race"></div>
<div class="cal-grid" style="margin-top:14px" id="dows"></div>
<div class="cal-grid" id="grid" style="margin-top:5px"><div class="skel" style="grid-column:1/-1">Loading…</div></div>
<div class="leg" id="legend"></div>
`, `<script>
const TODAY=todayU();
let Y=+TODAY.slice(0,4),M=+TODAY.slice(5,7);
$('dows').innerHTML=['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=>'<div class="cal-dow">'+d+'</div>').join('');
function nav(n){M+=n;if(M<1){M=12;Y--}if(M>12){M=1;Y++}load();}
const DOTC={course:'var(--ice)',sql:'var(--violet)',mock:'var(--ember)',behavioral:'var(--ember2)',sysdesign:'var(--mint)',other:'var(--ink3)'};
async function load(){
const j=await api('/api/month?year='+Y+'&month='+M);
$('mt').textContent=new Date(Y,M-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
raceBar($('race'),j.phases,TODAY);
const startDow=new Date(Date.UTC(Y,M-1,1)).getUTCDay(),dim=new Date(Y,M,0).getDate();
let h='';for(let i=0;i<startDow;i++)h+='<div></div>';
for(let d=1;d<=dim;d++){
const ds=Y+'-'+String(M).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const info=j.days[ds]||{tasks:[],goals:{},sessions:0};
const tasks=(info.tasks||[]).filter(t=>t.status!=='hold');
const total=tasks.length,done=tasks.filter(t=>t.status==='done').length;
const g=info.goals||{};
const goalsOk=['leetcode','apps'].every(t=>!g[t]||g[t].goal===0||g[t].done>=g[t].goal);
const allDone=total>0&&done===total&&goalsOk&&ds<=TODAY;
const cp=tasks.some(t=>t.title.startsWith('CHECKPOINT'));
const mock=tasks.some(t=>t.track==='mock');
h+='<div class="cell'+(ds===TODAY?' today':'')+'" onclick="location.href=\\'/?date='+ds+'\\'" title="'+esc((info.phase||{}).name||'')+'">'
+(info.phase?'<div class="tint" style="--ph:'+info.phase.color+'"></div>':'')
+(info.off?'<div class="tint" style="--ph:#5C6779;opacity:.22"></div>':'')
+'<div class="dn num">'+d+(info.off?' 💤':'')+'</div>'
+(allDone?'<div class="done-ic">✓</div>':'')
+(info.grindH?'<div class="gh">'+info.grindH+'h<span class="ghf">🔥</span></div>':'')
+(cp?'<div style="position:absolute;top:5px;right:6px">🚩</div>':(mock&&!allDone?'<div style="position:absolute;top:5px;right:6px">🎙️</div>':''))
+((g.leetcode&&g.leetcode.goal)||(g.apps&&g.apps.goal)?
'<div class="tchip" style="color:'+(goalsOk&&ds<=TODAY?'var(--mint)':'var(--ink2)')+'">'
+(g.leetcode&&g.leetcode.goal?'🧩 '+g.leetcode.done+'/'+g.leetcode.goal:'')
+(g.leetcode&&g.leetcode.goal&&g.apps&&g.apps.goal?' · ':'')
+(g.apps&&g.apps.goal?'📨 '+g.apps.done+'/'+g.apps.goal:'')+'</div>':'')
+tasks.slice(0,2).map(t=>'<div class="tchip">'+(t.status==='done'?'✓ ':'')+esc(t.title)+'</div>').join('')
+(total>2?'<div class="tchip" style="color:var(--ink3)">+'+(total-2)+' more</div>':'')
+'<div class="dots">'
+(g.leetcode&&g.leetcode.goal?'<span class="dot" style="background:'+(g.leetcode.done>=g.leetcode.goal?'var(--mint)':'var(--ember)')+'"></span>':'')
+(g.apps&&g.apps.goal?'<span class="dot" style="background:'+(g.apps.done>=g.apps.goal?'var(--mint)':'var(--ice)')+'"></span>':'')
+tasks.slice(0,4).map(t=>'<span class="dot" style="background:'+(t.status==='done'?'var(--mint)':(DOTC[t.track]||'var(--ink3)'))+'"></span>').join('')
+(info.sessions?'<span class="dot" style="background:var(--ember2)"></span>':'')+'</div>'
+'</div>';}
$('grid').innerHTML=h;
$('legend').innerHTML=j.phases.map(p=>'<span class="chip"><span class="dot" style="width:8px;height:8px;border-radius:99px;background:'+p.color+'"></span>'
+esc(p.name)+'<span class="tiny">'+p.start_date.slice(5).replace('-','/')+'–'+p.end_date.slice(5).replace('-','/')+'</span></span>').join('');
}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
