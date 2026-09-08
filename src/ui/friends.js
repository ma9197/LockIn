import { shell } from './theme.js';

export const friendsPage = (cfg) => shell('LockIn · Friends', '/friends', `
<h1>Friends & sessions</h1>
<div class="card row" style="gap:10px">
  <span style="font-size:20px">🔗</span>
  <div class="grow"><b>Booking link</b><div class="tiny">Send this to your friends. They grab free slots there.</div></div>
  <button class="sm" id="copyLink">Copy link</button>
</div>
<h2>Requests <span id="reqN" class="pill" style="background:var(--rose);color:#fff;display:none"></span></h2>
<div id="reqs"><div class="skel card">Loading…</div></div>
<h2>Upcoming</h2>
<div id="upc"></div>
<h2>Log a session</h2>
<div class="card">
  <div class="fgrid">
    <div><label class="fld">Date</label><input id="m-date" type="date"></div>
    <div><label class="fld">Activity</label><select id="m-act"><option value="game">🎮 game</option><option value="talk">💬 talk</option><option value="task">📋 task</option><option value="other">✨ other</option></select></div>
    <div><label class="fld">Start</label><input id="m-start" type="time" value="12:00"></div>
    <div><label class="fld">End</label><input id="m-end" type="time" value="15:00"></div>
  </div>
  <label class="fld">Who (comma separated)</label><input id="m-names" placeholder="Alex, Sam">
  <label class="fld">Note</label><input id="m-note" placeholder="optional">
  <button class="pri" style="width:100%;margin-top:14px" onclick="logManual()">Log session as done</button>
</div>
<h2>History</h2>
<div id="hist"></div>
`, `<script>
$('m-date').value=todayU();
$('copyLink').onclick=()=>{navigator.clipboard.writeText(location.origin+'/book');toast('Link copied');};
let SES=[];
const fmtD=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
const avatars=names=>(names||'').split(',').map(s=>s.trim()).filter(Boolean).map(avatar).join('');
function sesCard(s,btns){
return '<div class="req" id="ses-'+s.id+'"><div class="row" style="flex-wrap:wrap">'
+avatars(s.names)
+'<div class="grow"><b>'+(ACT[s.activity]||'')+' '+esc(s.names||'(no name)')+'</b>'
+(s.device_id?' <span class="tiny" title="device fingerprint: same tag = same phone">📱#'+esc(s.device_id.slice(0,3))+'</span>':'')
+'<div class="muted num">'+fmtD(s.start_ts.slice(0,10))+' · '+fmtR(s.start_ts.slice(11,16),s.end_ts.slice(11,16))+'</div>'
+(s.note?'<div class="tiny">“'+esc(s.note)+'”</div>':'')+'</div>'
+'<div class="row">'+btns+'</div></div><div id="ed-'+s.id+'"></div></div>';}
function render(){
const today=todayU();
const reqs=SES.filter(s=>s.status==='requested');
const upc=SES.filter(s=>s.status==='confirmed').sort((a,b)=>a.start_ts<b.start_ts?-1:1);
const hist=SES.filter(s=>s.status==='done').slice(0,15);
$('reqN').style.display=reqs.length?'':'none';$('reqN').textContent=reqs.length;
$('reqs').innerHTML=reqs.length?reqs.map(s=>sesCard(s,
'<button class="mint sm" onclick="setStatus('+s.id+',\\'confirmed\\')">Confirm</button>'
+'<button class="rose sm" onclick="setStatus('+s.id+',\\'declined\\')">Decline</button>')).join('')
:'<div class="card skel">No pending requests.</div>';
$('upc').innerHTML=upc.length?upc.map(s=>sesCard(s,
'<button class="mint sm" onclick="setStatus('+s.id+',\\'done\\')">Done ✓</button>'
+'<button class="sm" onclick="openEd('+s.id+')">Edit</button>')).join('')
:'<div class="card skel">Nothing confirmed yet.</div>';
$('hist').innerHTML=hist.length?hist.map(s=>sesCard(s,
'<button class="ghost sm" onclick="openEd('+s.id+')">Edit</button>')).join('')
:'<div class="card skel">No finished sessions yet.</div>';
notifyBadge();}
function openEd(id){
const s=SES.find(x=>x.id===id);
const el=$('ed-'+id);
if(el.innerHTML){el.innerHTML='';return;}
el.innerHTML='<div class="editor"><div class="fgrid">'
+'<div><label class="fld">Date</label><input id="e-date-'+id+'" type="date" value="'+s.start_ts.slice(0,10)+'"></div>'
+'<div><label class="fld">Activity</label><select id="e-act-'+id+'">'
+['game','talk','task','other'].map(a=>'<option value="'+a+'" '+(s.activity===a?'selected':'')+'>'+ACT[a]+' '+a+'</option>').join('')+'</select></div>'
+'<div><label class="fld">Start</label><input id="e-start-'+id+'" type="time" value="'+s.start_ts.slice(11,16)+'"></div>'
+'<div><label class="fld">End</label><input id="e-end-'+id+'" type="time" value="'+s.end_ts.slice(11,16)+'"></div>'
+'</div>'
+'<label class="fld">Who (comma separated)</label><input id="e-names-'+id+'" value="'+esc(s.names||'')+'">'
+'<label class="fld">Status</label><select id="e-status-'+id+'">'
+['requested','confirmed','done','declined'].map(a=>'<option '+(s.status===a?'selected':'')+'>'+a+'</option>').join('')+'</select>'
+'<div class="row" style="margin-top:14px">'
+'<button class="pri grow" onclick="saveEd('+id+')">Save</button>'
+'<button onclick="openEd('+id+')">Cancel</button>'
+'<button class="rose" onclick="delSes('+id+')">Delete</button></div></div>';}
async function saveEd(id){
const g=k=>document.getElementById('e-'+k+'-'+id).value;
const d=g('date');
await api('/api/sessions/'+id,{method:'PATCH',body:{
start_ts:d+'T'+g('start'),end_ts:d+'T'+g('end'),activity:g('act'),status:g('status'),
friends:g('names').split(',').map(x=>x.trim()).filter(Boolean)}});
toast('Saved');load();}
async function delSes(id){if(!confirm('Delete this session? Stats lose it too.'))return;
await api('/api/sessions/'+id,{method:'DELETE'});toast('Deleted');load();}
async function setStatus(id,status){await api('/api/sessions/'+id,{method:'PATCH',body:{status}});
toast(status==='confirmed'?'Confirmed. It is on your schedule':status==='done'?'Logged ✓':'Declined');load();}
async function logManual(){
const names=$('m-names').value.split(',').map(x=>x.trim()).filter(Boolean);
if(!$('m-date').value||!names.length)return toast('Need a date and at least one name');
await api('/api/sessions',{body:{start_ts:$('m-date').value+'T'+$('m-start').value,end_ts:$('m-date').value+'T'+$('m-end').value,
activity:$('m-act').value,note:$('m-note').value,status:'done',friends:names}});
$('m-names').value='';$('m-note').value='';toast('Session logged');load();}
async function load(){SES=(await api('/api/sessions')).sessions;render();}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
