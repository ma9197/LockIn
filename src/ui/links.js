import { shell } from './theme.js';

// Links: collections of pages you open together (a language course, chess sites, a research rabbit hole),
// each with its own one-tap "Open all". Same link rows as the Jobs / LeetCode tabs, kind 'c<collection id>'.
export const linksPage = (cfg) => shell('LockIn · Links', '/links', `
<div class="ph">
  <div class="ph-t"><h1>Links</h1><p class="ph-d">Collections of tabs you open together: a language you are learning, chess sites, a course. Every collection has its own Open all.</p></div>
  <div class="ph-a"><button class="pri sm" onclick="editCol(0)">＋ New collection</button></div>
</div>
<div id="cols"><div class="skel">Loading…</div></div>
<div id="modalHost"></div>
`, `<script>
let COLS=[],OPENC={};
try{OPENC=JSON.parse(localStorage.getItem('links_open')||'{}')}catch(e){}
const CEMO=['\\uD83D\\uDD17','\\uD83D\\uDCDA','\\uD83E\\uDDE0','\\u265F\\uFE0F','\\uD83C\\uDF10','\\uD83C\\uDFB8','\\uD83E\\uDDEE','\\uD83C\\uDFA8','\\uD83D\\uDCBB','\\uD83D\\uDD2C','\\uD83C\\uDFC3','\\uD83C\\uDFAF','\\uD83C\\uDFAC','\\uD83C\\uDFB5','\\uD83D\\uDCF0','\\uD83D\\uDCB0'];
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\\./,'')}catch(e){return u}};
const col=id=>COLS.find(c=>c.id===id);
function saveOpen(){try{localStorage.setItem('links_open',JSON.stringify(OPENC))}catch(e){}}
function linkCard(c,l){
return '<div class="snip" onclick="openOneC('+c.id+','+l.id+')">'
+'<div class="row" style="align-items:flex-start"><div class="grow" style="min-width:0">'
+'<b class="snip-t">'+esc(l.label||hostOf(l.url))+'</b><div class="snip-v">'+esc(hostOf(l.url))+'</div></div>'
+'<button class="snip-act" onclick="event.stopPropagation();editLink('+c.id+','+l.id+')" aria-label="edit" title="Edit">\\u270E</button>'
+'<button class="snip-act" onclick="event.stopPropagation();delLink('+l.id+')" aria-label="delete" title="Delete">\\u2715</button></div>'
+'<div class="snip-hint">\\u2197 tap to open</div>'
+'<button class="snip-more" title="include in Open all" onclick="event.stopPropagation();tgBundle('+l.id+','+(l.in_bundle?0:1)+')">'+(l.in_bundle?'\\uD83D\\uDE80 in \\u201COpen all\\u201D':'\\u25CB not in \\u201COpen all\\u201D')+'</button></div>';}
function render(){
$('cols').innerHTML=COLS.length?COLS.map(c=>{
const n=c.links.length,b=c.links.filter(l=>l.in_bundle).length;
return '<div class="card acc lkcol'+(OPENC[c.id]?' open':'')+'" id="col-'+c.id+'">'
+'<div class="acc-h" onclick="toggleCol('+c.id+')"><span class="tile">'+esc(c.emoji)+'</span>'
+'<div class="grow" style="min-width:0"><b>'+esc(c.name)+'</b><div class="tiny">'+(n?n+' link'+(n>1?'s':'')+(b?' \\u00b7 '+b+' in Open all':''):'no links yet')+'</div></div>'
+(b?'<button class="pri sm" onclick="event.stopPropagation();openAllC('+c.id+')">\\uD83D\\uDE80 Open all ('+b+')</button>':'')
+'<span class="tl2-x">\\u203A</span></div>'
+'<div class="acc-b" style="margin-top:16px"><div class="row" style="justify-content:flex-end;gap:8px;flex-wrap:wrap">'
+'<button class="sm" onclick="editLink('+c.id+',0)">\\uFF0B Link</button><button class="ghost sm" onclick="editCol('+c.id+')">\\u270E Rename</button><button class="ghost sm" onclick="delCol('+c.id+')">\\u2715 Delete</button></div>'
+'<div class="snipgrid">'+(n?c.links.map(l=>linkCard(c,l)).join(''):'<div class="empty" style="grid-column:1/-1"><b>Nothing in here yet</b>Add every page you open for this. Open all launches them together.</div>')+'</div></div></div>';}).join('')
:'<div class="empty"><b>No collections yet</b>Make one per thing you are learning or tracking, then add the pages you open for it.<br><button class="pri" style="margin-top:16px" onclick="editCol(0)">\\uFF0B New collection</button></div>';}
function toggleCol(id){OPENC[id]=!OPENC[id];saveOpen();const el=$('col-'+id);if(el)el.classList.toggle('open',!!OPENC[id]);}
async function load(){COLS=(await api('/api/collections')).collections;render();}
function openOneC(cid,id){const c=col(cid);const l=c&&c.links.find(x=>x.id===id);if(l&&!popOpen(l.url))toast('Your browser blocked that tab. Allow pop-ups for this site.');}
function openAllC(cid){
const c=col(cid);if(!c)return;const list=c.links.filter(l=>l.in_bundle);if(!list.length)return;
let blocked=0;for(const l of list)if(!popOpen(l.url))blocked++;
if(blocked)toast('\\u26A0\\uFE0F '+blocked+' tab'+(blocked>1?'s':'')+' blocked. Allow pop-ups for this site, then try again.');
else{try{localStorage.lockin_popupOK='1'}catch(e){}toast('\\uD83D\\uDE80 '+list.length+' tabs opened');}}
// ---- collections ----
function editCol(id){
const c=id?col(id):null;
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">'+(c?'\\u270E Rename collection':'\\uFF0B New collection')+'</h1>'
+'<p class="muted" style="margin-top:4px">A name and an emoji. Chinese, Chess, Thesis reading, anything you open a set of tabs for.</p>'
+'<label class="fld">Name</label><input id="col-name" maxlength="40" value="'+(c?esc(c.name):'')+'" placeholder="Chinese">'
+'<label class="fld">Emoji</label><div class="em" id="col-em">'+CEMO.map(e=>'<button type="button" class="'+((c?c.emoji:CEMO[0])===e?'on':'')+'" onclick="pickEmo(this)">'+e+'</button>').join('')+'</div>'
+'<div class="row" style="margin-top:20px"><button class="pri grow" onclick="saveCol('+(c?c.id:0)+')">'+(c?'Save':'Create')+'</button>'
+'<button onclick="closeModal()">Cancel</button></div></div></div>';
setTimeout(()=>$('col-name').focus(),80);}
function pickEmo(b){b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');}
function closeModal(){$('modalHost').innerHTML='';}
async function saveCol(id){
const name=$('col-name').value.trim();if(!name)return toast('Give it a name');
const em=($('col-em').querySelector('button.on')||{}).textContent||CEMO[0];
if(id)await api('/api/collections/'+id,{method:'PATCH',body:{name,emoji:em}});
else{const r=await api('/api/collections',{body:{name,emoji:em}});OPENC[r.id]=true;saveOpen();}
closeModal();load();}
async function delCol(id){const c=col(id);if(!c)return;
if(!confirm('Delete \\u201C'+c.name+'\\u201D and its '+c.links.length+' link'+(c.links.length===1?'':'s')+'?'))return;
await api('/api/collections/'+id,{method:'DELETE'});load();}
// ---- links inside a collection ----
function editLink(cid,id){
const c=col(cid);const l=id?c.links.find(x=>x.id===id):null;
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:20px">'+(l?'\\u270E Edit link':'\\uFF0B Add to '+esc(c.name))+'</h1>'
+'<label class="fld">Link</label><textarea id="lk-url" rows="3" placeholder="https://\\u2026">'+(l?esc(l.url):'')+'</textarea>'
+'<label class="fld">Label (optional)</label><input id="lk-label" value="'+(l?esc(l.label):'')+'" placeholder="Duolingo, HSK 3 deck\\u2026" maxlength="60">'
+'<label class="row" style="gap:8px;margin-top:16px;cursor:pointer"><input type="checkbox" id="lk-bundle" style="width:auto"'+(!l||l.in_bundle?' checked':'')+'><span style="font:700 13px var(--disp)">\\uD83D\\uDE80 Include in Open all</span></label>'
+'<div class="row" style="margin-top:20px"><button class="pri grow" onclick="saveLk('+cid+','+(l?l.id:0)+')">'+(l?'Save':'Add link')+'</button><button onclick="closeModal()">Cancel</button></div></div></div>';
setTimeout(()=>$(l?'lk-label':'lk-url').focus(),80);}
async function saveLk(cid,id){
const url=$('lk-url').value.trim();if(!url)return toast('Paste a link');
const body={url,label:$('lk-label').value.trim(),in_bundle:$('lk-bundle').checked,kind:'c'+cid};
const r=id?await api('/api/links/'+id,{method:'PATCH',body}):await api('/api/links',{body});
if(r&&r.error)return toast(r.error);
closeModal();load();}
async function delLink(id){if(!confirm('Remove this link?'))return;await api('/api/links/'+id,{method:'DELETE'});load();}
async function tgBundle(id,on){await api('/api/links/'+id,{method:'PATCH',body:{in_bundle:!!on}});load();}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
