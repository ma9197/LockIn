import { shell } from './theme.js';

export const jobsPage = (cfg) => shell('LockIn · Jobs', '/jobs', `
<div class="ph">
  <div class="ph-t"><h1>Applications</h1><p class="ph-d">Every application you send, with where it stands. Adding one bumps today's goal.</p></div>
  <div class="ph-a"><span id="todayChip" class="chip"></span></div>
</div>
<div class="sech">
  <h2>Hunting grounds</h2>
  <button class="sm" onclick="openLink()">＋ Link</button>
  <button class="pri sm" id="openAllBtn" onclick="openAll()" style="display:none">🚀 Open all</button>
</div>
<div class="snipgrid" id="links"></div>

<h2>Log an application</h2>
<div class="card">
  <div class="disc" id="addDisc" onclick="document.getElementById('addForm').classList.toggle('hide');this.querySelector('.tl2-x').classList.toggle('open')">
    <span class="tile">➕</span><div class="who"><b>Add application</b><div class="tiny">Title and company are enough. Counts toward today's goal.</div></div><span class="tl2-x">›</span>
  </div>
  <div id="addForm" class="hide" style="margin-top:18px">
    <div class="fgrid">
      <div><label class="fld">Job title *</label><input id="j-title" placeholder="Software Engineer, New Grad"></div>
      <div><label class="fld">Company *</label><input id="j-company" placeholder="Stripe"></div>
      <div><label class="fld">Salary</label><input id="j-salary" placeholder="$120k or range"></div>
      <div><label class="fld">Location</label><input id="j-location" placeholder="NYC / Remote"></div>
      <div><label class="fld">Platform</label><select id="j-platform" onchange="platChange()"></select>
      <input id="j-platform-other" placeholder="Where from?" style="display:none;margin-top:6px"></div>
      <div><label class="fld">Applied date</label><input id="j-date" type="date"></div>
    </div>
    <div class="fg" style="margin-top:14px"><label class="fld">Link to posting</label><input id="j-url" placeholder="https://…"></div>
    <button class="pri" style="width:100%;margin-top:16px" onclick="addJob()">Add · +1 to counter</button>
  </div>
</div>
<div class="sech">
  <h2>Applications</h2>
  <span class="tiny num" id="jCount"></span>
</div>
<div class="row" style="margin-bottom:10px;gap:8px">
  <input id="jSearch" class="grow" autocomplete="off" placeholder="🔍 Search job title or company">
  <button class="ghost sm" id="jClear" style="display:none">✕ Clear</button>
</div>
<div class="row" id="jFilters" style="flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
<div class="card jwrap" id="list"><div class="skel">Loading…</div></div>
<p class="hint">🤖 An agent can log applications here for you. The key is in <a href="/settings#api">Settings → Integrations</a>.</p>
<div id="modalHost"></div>
<style>.hide{display:none}.fgrid>div>label.fld{margin-top:0}.fgrid>div{margin-top:4px}</style>
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
+(q?('<b>Nothing matches “'+esc(q)+'”</b>'+(st&&st!=='all'?'in '+ST[st][0]+'. ':'')+'Try part of the job title or the company.')
:(st&&st!=='all'?'<b>Nothing at '+ST[st][0]+' yet</b>Change a status above and it lands here.':'<b>No applications yet</b>Add the first one above. Every row here counts toward the day it was sent.'))
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
+jobs.map(j=>'<div class="jcard" style="--ac:'+ST[j.status][1]+'"><b class="jt">'+esc(j.title)+(j.source==='agent'?' <span title="logged by your agent">🤖</span>':'')+'</b>'
+'<div class="muted jm">'+esc(j.company)+(j.platform?' · '+esc(j.platform):'')+(j.location?' · '+esc(j.location):'')+(j.salary?' · '+esc(j.salary):'')+'</div>'
+'<div class="row jrow">'+statusSel(j)+'<span class="tiny num">'+fmtD(j.date)+'</span>'
+(j.url?'<a class="tiny" href="'+esc(j.url)+'" target="_blank" rel="noopener">posting ↗</a>':'')
+'<button class="ghost sm" onclick="delJob('+j.id+')" aria-label="delete">✕</button></div></div>').join('');}
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
