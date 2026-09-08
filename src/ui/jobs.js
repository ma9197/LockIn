import { shell } from './theme.js';

export const jobsPage = (cfg) => shell('LockIn · Jobs', '/jobs', `
<div class="row" style="flex-wrap:wrap">
  <h1>Job applications</h1>
  <span class="right"></span>
  <span id="todayChip" class="chip"></span>
</div>
<div class="row" style="margin-top:14px">
  <h2 style="margin:0" class="grow">Hunting grounds</h2>
  <button class="sm" onclick="openLink()">＋ Link</button>
  <button class="pri sm" id="openAllBtn" onclick="openAll()" style="display:none">🚀 Open all</button>
</div>
<div class="snipgrid" id="links"></div>

<h2>Log an application</h2>
<div class="card">
  <div class="row" style="cursor:pointer" onclick="document.getElementById('addForm').classList.toggle('hide');this.querySelector('.tl2-x').classList.toggle('open')">
    <b>➕ Add application</b><span class="tiny grow">counts toward today's goal</span><span class="tl2-x">›</span>
  </div>
  <div id="addForm" class="hide" style="margin-top:12px">
    <div class="fgrid">
      <div><label class="fld">Job title *</label><input id="j-title" placeholder="Software Engineer, New Grad"></div>
      <div><label class="fld">Company *</label><input id="j-company" placeholder="Stripe"></div>
      <div><label class="fld">Salary</label><input id="j-salary" placeholder="$120k or range"></div>
      <div><label class="fld">Location</label><input id="j-location" placeholder="NYC / Remote"></div>
      <div><label class="fld">Platform</label><select id="j-platform" onchange="platChange()"></select>
      <input id="j-platform-other" placeholder="Where from?" style="display:none;margin-top:6px"></div>
      <div><label class="fld">Applied date</label><input id="j-date" type="date"></div>
    </div>
    <label class="fld">Link to posting</label><input id="j-url" placeholder="https://…">
    <button class="pri" style="width:100%;margin-top:12px" onclick="addJob()">Add · +1 to counter</button>
  </div>
</div>
<div class="row" style="margin:26px 0 10px">
  <h2 style="margin:0" class="grow">Applications</h2>
  <span class="tiny num" id="jCount"></span>
</div>
<div class="row" style="margin-bottom:10px">
  <input id="jSearch" class="grow" autocomplete="off" placeholder="🔍 Search job title or company">
  <button class="ghost sm" id="jClear" style="display:none">✕ Clear</button>
</div>
<div class="row" id="jFilters" style="flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
<div class="card jwrap" id="list"><div class="skel">Loading…</div></div>
<p class="tiny" style="margin-top:8px">🤖 Your CV agent can add rows here automatically. Grab the API key in <a href="/settings">Settings</a>.</p>
<div id="modalHost"></div>
<style>.hide{display:none}</style>
`, `<script>
const ST={applied:['Applied','#5EA2FF'],oa:['OA','#9B6EF3'],interview:['Interview','#FFB347'],offer:['OFFER 🎉','#3DDC97'],rejected:['Rejected','#5C6779']};
$('j-date').value=todayU();
const fmtD=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
function statusSel(j){
return '<select onchange="setStatus('+j.id+',this.value)" style="background:'+ST[j.status][1]+'22;color:'+ST[j.status][1]+';border-color:'+ST[j.status][1]+'55">'
+Object.entries(ST).map(([k,v])=>'<option value="'+k+'" '+(j.status===k?'selected':'')+'>'+v[0]+'</option>').join('')+'</select>';}
let JOBS=[],FST=localStorage.getItem('jobs_status')||'all';
function renderFilters(){
const n=k=>JOBS.filter(j=>j.status===k).length;
$('jFilters').innerHTML=[['all','All',''],...Object.entries(ST).map(([k,v])=>[k,v[0],v[1]])]
.map(([k,label,col])=>{
const on=FST===k,c=col||'var(--ink2)';
return '<button class="sm" data-st="'+k+'" style="border-radius:99px;'
+(on?'background:'+c+'22;border-color:'+c+';color:'+c+';':'')+'">'
+label+' <b class="num" style="opacity:.65">'+(k==='all'?JOBS.length:n(k))+'</b></button>';}).join('');
$('jFilters').querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{
FST=b.dataset.st;localStorage.setItem('jobs_status',FST);applyFilter();});}
function applyFilter(){
const q=$('jSearch').value.trim().toLowerCase();
$('jClear').style.display=q?'':'none';
let list=JOBS;
if(FST!=='all')list=list.filter(j=>j.status===FST);
if(q)list=list.filter(j=>(j.title||'').toLowerCase().indexOf(q)>=0||(j.company||'').toLowerCase().indexOf(q)>=0);
const filtered=q||FST!=='all';
$('jCount').textContent=filtered?('showing '+list.length+' of '+JOBS.length):(JOBS.length+' logged');
renderFilters();
render(list,q,FST);}
$('jSearch').addEventListener('input',applyFilter);
$('jClear').onclick=()=>{$('jSearch').value='';applyFilter();$('jSearch').focus();};
function render(jobs,q,st){
if(!jobs.length){$('list').innerHTML='<div class="skel">'
+(q?('Nothing matches “'+esc(q)+'”'+(st&&st!=='all'?' in '+ST[st][0]:'')+'. Try part of the job title or the company.')
:(st&&st!=='all'?'Nothing at '+ST[st][0]+' yet.':'No applications logged yet. Add the first one 👆'))
+'</div>';return;}
$('list').innerHTML='<table class="jtable"><thead><tr><th>Date</th><th>Job title</th><th>Company</th><th>Platform</th><th>Salary</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>'
+jobs.map(j=>'<tr>'
+'<td class="num" style="white-space:nowrap;color:var(--ink2)">'+fmtD(j.date)+'</td>'
+'<td><b>'+(j.url?'<a href="'+esc(j.url)+'" target="_blank" rel="noopener">'+esc(j.title)+' ↗</a>':esc(j.title))+'</b>'
+(j.source==='agent'?' <span class="tiny" title="added by your AI agent">🤖</span>':'')+'</td>'
+'<td>'+esc(j.company)+'</td>'
+'<td class="tiny">'+esc(j.platform||'-')+'</td>'
+'<td class="num">'+esc(j.salary||'-')+'</td>'
+'<td>'+esc(j.location||'-')+'</td>'
+'<td>'+statusSel(j)+'</td>'
+'<td><button class="ghost sm" onclick="delJob('+j.id+')" aria-label="delete">✕</button></td>'
+'</tr>').join('')+'</tbody></table>'
+jobs.map(j=>'<div class="jcard"><div class="row"><b>'+esc(j.title)+'</b>'+(j.source==='agent'?' 🤖':'')+'<span class="grow"></span>'+statusSel(j)+'</div>'
+'<div class="muted">'+esc(j.company)+(j.platform?' · '+esc(j.platform):'')+(j.location?' · '+esc(j.location):'')+(j.salary?' · '+esc(j.salary):'')+'</div>'
+'<div class="row" style="margin-top:6px"><span class="tiny num">'+fmtD(j.date)+'</span><span class="grow"></span>'
+(j.url?'<a class="tiny" href="'+esc(j.url)+'" target="_blank" rel="noopener">posting ↗</a>':'')
+'<button class="ghost sm" onclick="delJob('+j.id+')">✕</button></div></div>').join('');}
async function load(){
const j=await api('/api/jobs');
$('todayChip').innerHTML='📨 today: <b class="num">'+j.todayGoal.done+'</b>/'+j.todayGoal.goal;
JOBS=j.jobs;applyFilter();}
async function addJob(){
const v=id=>$(id).value.trim();
if(!v('j-title')||!v('j-company'))return toast('Title and company are required');
await api('/api/jobs',{body:{title:v('j-title'),company:v('j-company'),salary:v('j-salary'),location:v('j-location'),platform:platValue(),url:v('j-url'),date:v('j-date')}});
['j-title','j-salary','j-location','j-url','j-platform-other'].forEach(id=>$(id).value='');platChange();
toast('📨 Logged · counter +1');load();}
async function setStatus(id,status){await api('/api/jobs/'+id,{method:'PATCH',body:{status}});
if(status==='offer')toast('🎉🎉🎉 LFG');load();}
async function delJob(id){if(!confirm('Delete this application? Counter for that day goes down by 1.'))return;
await api('/api/jobs/'+id,{method:'DELETE'});load();}
function platChange(){$('j-platform-other').style.display=$('j-platform').value==='Other'?'':'none';}
function platValue(){return $('j-platform').value==='Other'?($('j-platform-other').value.trim()||'Other'):$('j-platform').value;}
async function loadPlats(){
const s=await api('/api/settings');
$('j-platform').innerHTML='<option value="">-</option>'+s.jobPlatforms.map(p=>'<option>'+esc(p)+'</option>').join('')+'<option>Other</option>';}
loadPlats();loadLinks();load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
