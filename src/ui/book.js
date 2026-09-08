import { shell } from './theme.js';

export const bookPage = (cfg) => { const who = (cfg && cfg.user && cfg.user.displayName) || 'me'; return shell('Book time with ' + who, null, `
<div style="text-align:center;margin:26px 0 10px">
  <div style="font-size:46px">🎮</div>
  <div class="logo" style="font-size:28px;margin:8px 0 4px">LOCK<em>IN</em></div>
  <h1 style="font-size:21px">Book time with ${who}</h1>
  <p class="muted" style="max-width:420px;margin:10px auto 0">These are the free windows in a busy schedule. First come, first served: you can still join a taken slot, you are just next in line.</p>
</div>
<div class="card row">
  <span style="font-size:18px">👤</span>
  <input id="nm" placeholder="Your name" aria-label="Your name">
</div>
<div id="days"><div class="skel card">Loading…</div></div>
`, `<script>
$('nm').value=localStorage.getItem('lockin_name')||'';
$('nm').oninput=()=>localStorage.setItem('lockin_name',$('nm').value);
let MINE=null;
async function load(){
const j=await api('/api/book/slots');
MINE=j.mine||null;
if(j.disabled||!j.days.some(d=>d.windows.length)){
$('days').innerHTML='<div class="card skel">No open windows right now. Check back later. 🔒</div>';return;}
const skewMin=j.serverNow?Math.round((Date.now()-j.serverNow)/60000):0;
const skewNote=Math.abs(skewMin)>=5?'<div class="card row" style="border-color:#FFB34755"><span>⏰</span><div class="tiny grow">Heads up: your device clock looks off by about '+Math.abs(skewMin)+' minutes. Slot times shown are still correct, they follow your time zone, not your clock.</div></div>':'';
const banner=skewNote+(MINE?'<div class="banner" style="cursor:default"><span style="font-size:20px">🔒</span><div class="grow">'
+'<b>You already have a booking'+(MINE.name?', '+esc(MINE.name):'')+'</b>'
+'<div class="tiny">'+(ACT[MINE.activity]||'')+' '+new Date(MINE.start_ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
+' · '+fmtR(MINE.start_ts.slice(11,16),MINE.end_ts.slice(11,16))+' ET · '+MINE.status
+'. One at a time. Book again after it passes.</div></div></div>':'');
$('days').innerHTML=banner+j.days.map(d=>{
if(!d.windows.length)return '';
return '<h2>'+esc(d.label)+(d.today?' · today':'')+'</h2>'+d.windows.map((w,i)=>{
const sid='act-'+d.date+'-'+i;
const wid='whl-'+d.date+'-'+i;
const winLen=hmMin(w.end)-hmMin(w.start)+(w.end<w.start?1440:0);
const opts=[30,60,120,180].filter(m=>m<=winLen);
const q=w.queue.map((r,ri)=>'<div class="qrow"><span class="rank">#'+(ri+1)+'</span>'+avatar(r.name)
+'<b>'+esc(r.name)+'</b><span class="tiny">'+(ACT[r.activity]||'')+' '+esc(r.activity)+'</span>'
+(r.dur?'<span class="chip" style="padding:2px 9px;font-size:11px">⏱ '+fmtDur(r.dur)+'</span>':'')+'</div>').join('');
const TZ=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'';
const isNY=TZ==='America/New_York';
const lt=ts=>new Date(ts).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
const lday=ts=>new Date(ts).toLocaleDateString(undefined,{weekday:'short'});
const sameDay=new Date(w.startUtc).toLocaleDateString('en-CA')===d.date;
const tzLabel=TZ?TZ.split('/').pop().replace(/_/g,' '):('UTC'+(new Date().getTimezoneOffset()<=0?'+':'')+(-new Date().getTimezoneOffset()/60));
const timeMain=isNY?fmtR(w.start,w.end):(sameDay?'':lday(w.startUtc)+' ')+lt(w.startUtc)+' – '+lt(w.endUtc);
return '<div class="win">'
+'<div class="row" style="flex-wrap:wrap">'
+'<b class="num" style="font:800 16px var(--disp)">'+timeMain+'</b>'
+'<span class="tiny">'+(isNY?'ET · New York':'your time · '+esc(tzLabel)+' <span style="opacity:.7">('+fmtR(w.start,w.end)+' ET)</span>')+'</span>'
+'</div>'
+'<div class="row" style="margin-top:10px;align-items:center">'
+'<div style="display:flex;flex-direction:column;gap:8px">'
+'<select id="'+sid+'" style="width:auto" aria-label="activity">'
+'<option value="game">🎮 game</option><option value="talk">💬 talk</option><option value="task">📋 task</option><option value="other">✨ other</option></select>'
+(MINE?'<button class="sm" disabled>🔒 One at a time</button>'
:'<button class="pri sm" onclick="book(\\''+d.date+'\\',\\''+w.start+'\\',\\''+w.end+'\\',\\''+sid+'\\',\\''+wid+'\\')">'
+(w.queue.length>=4?'Queue full':w.queue.length?'Join queue':'Book it')+'</button>')
+'</div>'
+'<span class="grow"></span>'
+(MINE?'':'<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">'
+'<span class="tiny" style="font:700 10px var(--disp);letter-spacing:.1em">DURATION</span>'
+'<select id="'+wid+'" style="width:auto" aria-label="session length">'
+opts.map(m=>'<option value="'+m+'"'+(m===60||(opts.length&&!opts.includes(60)&&m===opts[opts.length-1])?' selected':'')+'>⏱ '+fmtDur(m)+'</option>').join('')
+'</select></div>')
+'</div>'
+(q?'<div style="margin-top:8px">'+q+'</div>':'')
+'</div>';}).join('');}).join('');}
async function book(date,start,end,sid,wid){
const name=$('nm').value.trim();
if(!name){toast('Type your name first 👆');$('nm').focus();return;}
const wh=document.getElementById(wid);
const duration=wh?+wh.value:undefined;
try{
const j=await api('/api/book',{body:{date,start,end,name,duration,activity:document.getElementById(sid).value}});
toast(j.position===1?'🔥 Booked! You are first in this slot':'Requested. You are #'+j.position+' in line');
load();}
catch(e){toast(String(e))}}
load();
</script>`, { public: true });
};
