import { shell } from './theme.js';

export const copyPage = (cfg) => shell('LockIn · Quick Copy', '/copy', `
<div class="ph">
  <div class="ph-t"><h1>Quick Copy</h1><p class="ph-d">Tap a block to copy it. Built for speed-running application forms: name, address, LinkedIn URL, work-auth answer.</p></div>
  <div class="ph-a"><button class="pri sm" onclick="openSnip()">＋ Add block</button></div>
</div>
<div class="snipgrid" id="grid"><div class="skel" style="grid-column:1/-1">Loading…</div></div>
<div id="modalHost"></div>
`, `<script>
let SN=[],OPEN={};
const subsOf=s=>{try{const a=JSON.parse(s.subs||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
function render(){
$('grid').innerHTML=SN.length?SN.map(s=>{
const subs=subsOf(s);
return '<div class="snip" onclick="copyVal(this,'+s.id+',-1)">'
+'<div class="row" style="align-items:flex-start;gap:8px">'
+'<div class="grow" style="min-width:0">'
+(s.label?'<b class="snip-t">'+esc(s.label)+'</b><div class="snip-v">'+esc(s.value)+'</div>'
:'<b class="snip-t">'+esc(s.value)+'</b>')
+'</div>'
+'<button class="snip-act" onclick="event.stopPropagation();openSnip('+s.id+')" aria-label="edit" title="Edit">✎</button>'
+'<button class="snip-act" onclick="event.stopPropagation();delSnip('+s.id+')" aria-label="delete" title="Delete">✕</button>'
+'</div>'
+'<div class="snip-hint">📋 tap to copy</div>'
+(subs.length?'<button class="snip-more" onclick="event.stopPropagation();toggleSubs('+s.id+')">'
+(OPEN[s.id]?'▴ Hide':'▾ Show')+' '+subs.length+' sub-item'+(subs.length>1?'s':'')+'</button>':'')
+(subs.length&&OPEN[s.id]?'<div onclick="event.stopPropagation()">'+subs.map((u,i)=>
'<div class="subrow" onclick="copyVal(this,'+s.id+','+i+')">'
+'<div class="grow" style="min-width:0">'
+(u.label?'<div class="sub-t">'+esc(u.label)+'</div><div class="sub-v">'+esc(u.value)+'</div>'
:'<div class="sub-t">'+esc(u.value)+'</div>')
+'</div><span style="font-size:16px">📋</span></div>').join('')+'</div>':'')
+'</div>';}).join('')
:'<div class="empty" style="grid-column:1/-1"><b>Nothing here yet</b>Add everything you keep retyping into application forms. A block can hold sub-items, like a full address with its ZIP, city and state.<br><button class="pri sm" onclick="openSnip()">＋ Add your first block</button></div>';}
function toggleSubs(id){OPEN[id]=!OPEN[id];render();}
async function load(){SN=(await api('/api/snippets')).snippets;render();}
async function copyVal(el,id,subIdx){
const s=SN.find(x=>x.id===id);if(!s)return;
const item=subIdx<0?s:subsOf(s)[subIdx];
if(!item)return;
try{await navigator.clipboard.writeText(item.value);}
catch(e){
const ta=document.createElement('textarea');ta.value=item.value;document.body.appendChild(ta);ta.select();
document.execCommand('copy');ta.remove();}
el.classList.add('copied');
const hint=el.querySelector('.snip-hint');
if(hint)hint.textContent='✓ copied';
setTimeout(()=>{el.classList.remove('copied');if(hint)hint.textContent='📋 tap to copy';},1200);
toast('📋 Copied'+(item.label?' · '+item.label:''));}
// ---- add / edit modal with sub-items ----
let EDIT_SUBS=[];
function openSnip(id){
const s=id?SN.find(x=>x.id===id):null;
EDIT_SUBS=s?subsOf(s).map(u=>({label:u.label,value:u.value})):[];
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:19px">'+(s?'✎ Edit block':'＋ New copy block')+'</h1>'
+'<div class="fg" style="margin-top:14px"><label class="fld">Value (what gets copied)</label>'
+'<textarea id="sn-value" rows="3" placeholder="123 Main St, Apt 4B, Brooklyn, NY 11101">'+(s?esc(s.value):'')+'</textarea></div>'
+'<div class="fg"><label class="fld">Label (optional, shown as the title)</label>'
+'<input id="sn-label" value="'+(s?esc(s.label):'')+'" placeholder="Address" maxlength="60"></div>'
+'<div class="fg"><label class="fld">Sub-items <span style="text-transform:none;letter-spacing:0">(e.g. ZIP, city, state)</span></label>'
+'<div id="sn-subs"></div>'
+'<button class="sm" style="margin-top:8px" onclick="addSub()">＋ sub-item</button></div>'
+'<div class="row" style="margin-top:18px">'
+'<button class="pri grow" onclick="saveSnip('+(s?s.id:0)+')">'+(s?'Save':'Add block')+'</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
renderSubEdit();
setTimeout(()=>$(s?'sn-label':'sn-value').focus(),80);}
function renderSubEdit(){
$('sn-subs').innerHTML=EDIT_SUBS.map((u,i)=>
'<div class="subedit">'
+'<input placeholder="Label (opt)" value="'+esc(u.label)+'" oninput="EDIT_SUBS['+i+'].label=this.value">'
+'<input placeholder="Value" value="'+esc(u.value)+'" oninput="EDIT_SUBS['+i+'].value=this.value">'
+'<button class="xbtn" onclick="EDIT_SUBS.splice('+i+',1);renderSubEdit()" aria-label="remove">✕</button>'
+'</div>').join('')||'<p class="hint" style="margin-top:2px">None yet.</p>';}
function addSub(){EDIT_SUBS.push({label:'',value:''});renderSubEdit();
const rows=document.querySelectorAll('#sn-subs .subedit');
const last=rows[rows.length-1];if(last)last.querySelector('input').focus();}
async function saveSnip(id){
const value=$('sn-value').value.trim();
if(!value)return toast('Value is required, that is the whole point 🙂');
if(EDIT_SUBS.some(u=>u.value.trim()===''&&u.label.trim()!==''))return toast('A sub-item has a label but no value');
const body={value,label:$('sn-label').value.trim(),subs:EDIT_SUBS.filter(u=>u.value.trim())};
if(id)await api('/api/snippets/'+id,{method:'PATCH',body});
else await api('/api/snippets',{body});
$('modalHost').innerHTML='';toast(id?'Saved':'Block added');load();}
async function delSnip(id){
if(!confirm('Delete this block?'))return;
await api('/api/snippets/'+id,{method:'DELETE'});load();}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
