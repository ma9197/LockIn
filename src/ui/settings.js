import { shell } from './theme.js';

// Settings. Every personal thing the single-user app had welded in is an editor here.
// One draft, one save: every control edits the draft `D`; the sticky bar at the bottom appears
// only when the draft differs from what the server holds, and one press writes everything
// through POST /api/settings/all. Buttons that are actions rather than values (regenerate a key,
// set a PIN, change the password, import, delete) still run at once, with their own confirm.
// Page-script rules: no backticks, no ${ }, quotes inside onclick strings are written as \\'.

const tog = (id, label, sub) => `<div class="row" style="margin-top:10px"><div class="grow"><b>${label}</b><div class="tiny">${sub}</div></div><div class="toggle" id="${id}" role="switch" tabindex="0"></div></div>`;
const h2 = (id, label) => `<h2 id="h-${id}">${label}<span class="dot">●</span></h2>`;
// Six tabs, each a short page. The draft spans all of them: switching tabs never loses an edit,
// and the save bar names the tabs that hold changes.
const TABS = [['plan', 'Plan'], ['schedule', 'Schedule'], ['today', 'Today'], ['sharing', 'Sharing'], ['api', 'Integrations'], ['account', 'Account']];
const pane = (id, first) => `${first ? '' : '</div>'}<div class="tabpane" id="tab-${id}">`;

export const settingsPage = (cfg) => shell('LockIn · Settings', '/settings', `
<style>
.ed{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px}
.ed .row{gap:8px;flex-wrap:wrap}
.ed input,.ed select{padding:8px 10px;font-size:14px}
.ed input.nm{flex:1;min-width:130px}
.ed input.dt{flex:1;min-width:0;width:auto}
.ed input.g{width:64px}
.rng{display:flex;align-items:center;gap:8px;margin-top:8px}
.rng input{flex:1;min-width:0;width:auto;padding:8px 10px;font-size:14px}
.rng .tiny{flex:none}
.rng button{flex:none}
.chips{display:flex;gap:5px;margin-top:8px}
.chips button{flex:1;min-width:0;padding:7px 0;font-size:12px}
.chips button.on{background:var(--ember);color:#0B0E14;border-color:var(--ember)}
.cklab{font:700 10px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-top:10px}
.picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;margin-top:8px}
.picks .pick{width:100%;min-height:92px;justify-content:center;background:var(--surface2);border:1px solid var(--line2)}
.picks .pick.on{border-color:var(--ember);outline:0}
.picks .mc-prev{display:flex;align-items:center;justify-content:center;transform:scale(.85);max-width:100%;overflow:hidden}
.filebtn{display:inline-flex;align-items:center;gap:8px;flex:1;min-width:0}
.filebtn input{display:none}
.filebtn .fname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:var(--ink2)}
.btnlink{display:inline-flex;align-items:center;background:var(--surface2);color:var(--ink);border:1px solid var(--line2);border-radius:var(--rs);padding:6px 12px;font:700 13px var(--disp);text-decoration:none;white-space:nowrap}
.row>button{white-space:nowrap}
.sw{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.sw button{width:28px;height:28px;border-radius:8px;border:2px solid transparent;padding:0}
.sw button.on{border-color:#fff}
.em{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}
.em button{width:34px;height:34px;font-size:17px;padding:0;border-radius:9px}
.em button.on{background:var(--surface3);border-color:var(--ember)}
.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.gl label{font:700 10px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px;white-space:nowrap}
.gl input{width:100%;padding:8px}
.dim{opacity:.55}
.hint{font-size:12px;color:var(--ink3);margin-top:6px;line-height:1.45}
.danger{border-color:#FF5D7355}
.sec{scroll-margin-top:calc(var(--clkh,46px) + 70px)}
.tabwrap{position:sticky;top:0;z-index:5;background:var(--bg);margin:0 -16px;padding:calc(var(--clkh,46px) + 10px) 16px 10px;border-bottom:1px solid var(--line)}
@media(min-width:900px){.tabwrap{margin:0 -34px;padding-left:34px;padding-right:34px}}
.tabbar{margin:0}
.tabbar button{position:relative}
.tabbar button.chg::after{content:'';position:absolute;top:5px;right:5px;width:6px;height:6px;border-radius:99px;background:var(--ember)}
.tabpane>.sec:first-child h2{margin-top:14px}
h2 .dot{display:none;color:var(--ember);margin-left:6px;font-size:10px;vertical-align:middle}
h2.chg .dot{display:inline}
.savebar{position:fixed;left:0;right:0;bottom:calc(74px + env(safe-area-inset-bottom));z-index:49;background:rgba(13,17,26,.94);backdrop-filter:blur(14px);
  border-top:1px solid var(--ember);padding:10px 14px;display:none;align-items:center;gap:8px}
.savebar.show{display:flex}
.savebar .msg{flex:1;min-width:0;font-size:12px;color:var(--ink2);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.savebar .msg b{display:block;color:var(--ink);font:700 13px var(--disp)}
body.dirty{padding-bottom:calc(74px + 66px + env(safe-area-inset-bottom))}
body.dirty .refresh-fab{display:none}
@media(min-width:900px){.savebar{left:216px;bottom:0;padding:12px 34px}body.dirty{padding-bottom:80px}}
.pick{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:12px}
.pick.on{outline:2px solid var(--ember)}
.pick span{font:700 11px var(--disp);color:var(--ink2)}
.pick.on span{color:var(--ember)}
</style>
<h1>Settings</h1>
<div class="tabwrap"><div class="tabbar" id="tabs">${TABS.map(([id, l]) => `<button id="tb-${id}" onclick="showTab('${id}')">${l}</button>`).join('')}</div></div>
<p class="tiny" style="margin:10px 0 0">Nothing is applied until you press the save bar, which appears as soon as something differs from what is stored.</p>

${pane('plan', true)}
<div class="sec" id="sec-time">${h2('time', 'Time')}
<div class="card">
  <label class="fld" style="margin-top:0">Time zone</label>
  <select id="s-tz"></select>
  <label class="fld">Clock</label>
  <div class="seg-ctl" id="clkSeg"><button data-c="0">12-hour</button><button data-c="1">24-hour</button></div>
  <div class="hint">Every day, streak and deadline is counted in this zone.</div>
</div></div>

<div class="sec" id="sec-plan">${h2('plan', 'Plan')}
<div class="card">
  <p class="muted">Phases with dates. The first start and the last end are your plan window. <b>Low load</b> phases drop goals and use the low-load layout.</p>
  <div id="phases"></div>
  <div class="row" style="margin-top:10px;flex-wrap:wrap">
    <button class="sm" onclick="addPhase()">＋ Add phase</button>
    <span class="grow"></span>
    <button class="ghost sm" onclick="regen()">↻ Rewrite future goals</button>
  </div>
  <div class="hint">Saving a change to the plan or to a category rewrites the goals of today and every future day on its own. Days you already logged work on are never touched. The button does the same by hand.</div>
</div></div>

<div class="sec" id="sec-cats">${h2('cats', 'Categories')}
<div class="card">
  <p class="muted">What you grind, with a daily goal for weekdays, weekends and low-load days. LeetCode and Applications carry extra tools and cannot be renamed.</p>
  <div id="cats"></div>
  <button class="sm" style="margin-top:10px" onclick="addCat()">＋ Add category</button>
  <div class="hint">Turning a category off hides it. History is kept, so it can come back any time.</div>
</div></div>

${pane('schedule')}
<div class="sec" id="sec-layouts">${h2('layouts', 'Grind layouts')}
<div class="card">
  <p class="muted">A layout is up to four grind blocks. The Today page switches between layouts; one is the default.</p>
  <div id="layouts"></div>
  <div class="row" style="margin-top:10px;flex-wrap:wrap">
    <input id="layNew" placeholder="New layout name, e.g. weekend" style="flex:1;min-width:160px" onkeydown="if(event.key==='Enter')addLayout()">
    <button class="sm" onclick="addLayout()">＋ Add layout</button>
  </div>
  <div id="layAssign">
  <label class="fld">Weekday overrides</label>
  <div id="byDow" class="row" style="flex-wrap:wrap;gap:6px"></div>
  <label class="fld">Low-load days use</label>
  <select id="lowSel" style="width:auto"></select>
  </div>
  <div class="hint" id="layHint"></div>
</div></div>

<div class="sec" id="sec-sides">${h2('sides', 'Side tasks')}
<div class="card">
  <p class="muted">Recurring blocks that are not grind: gym, a class, a shift. Grind blocks step out of their way.</p>
  <div id="sides"></div>
  <button class="sm" style="margin-top:10px" onclick="addSide()">＋ Add side task</button>
</div></div>

${pane('today')}
<div class="sec" id="sec-modules">${h2('modules', 'Modules')}
<div class="card">
  <p class="muted">Turn off what you do not use. The tab, its routes and its stats disappear; nothing is deleted.</p>
  <div id="modToggles"></div>
  <div class="hint" id="modHint"></div>
  <label class="fld" style="margin-top:14px">Daily grind target (hours)</label>
  <input id="s-target" type="number" min="1" max="16" step="0.5" style="width:120px">
</div></div>

<div class="sec" id="sec-today">${h2('today', 'Today page')}
<div class="card">
  <label class="fld" style="margin-top:0">Header style</label>
  <div class="seg-ctl" id="layoutSeg">
    <button data-l="classic">Classic</button>
    <button data-l="refined">Refined</button>
  </div>
  <p class="tiny" style="margin-top:8px">Refined puts the date, phase, mode and off-day controls in one bordered header card.</p>
  <div class="fgrid" style="margin-top:6px">
    <div><label class="fld">Timer default (min)</label><input id="s-timer" type="number" min="5" max="120"></div>
    <div><label class="fld">Timer choices</label><input id="s-topts" placeholder="10, 15, 20, 25, 50"></div>
  </div>
</div></div>

<div class="sec" id="sec-clock">${h2('clock', 'Day clock')}
<div class="card">
  <label class="fld" style="margin-top:0">Design</label>
  <div class="picks" id="ckDesigns"></div>
  <label class="fld" style="margin-top:16px">Size: <span id="ckSizeVal" class="num" style="color:var(--ember)"></span>px</label>
  <input id="ck-size" type="range" min="280" max="920" step="20" style="accent-color:var(--ember)">
  <label class="fld">Number size: <span id="ckFontVal" class="num" style="color:var(--ember)"></span></label>
  <input id="ck-font" type="range" min="9" max="18" step="1" style="accent-color:var(--ember)">
  <label class="fld">Grind color override</label>
  <div class="row">
    <input id="ck-accent" type="color" style="width:56px;height:40px;padding:3px">
    <span class="tiny" id="ck-accent-state"></span>
    <button class="ghost sm" onclick="D.clock.accent='';renderClockCtl();mark()">Use design color</button>
  </div>
</div></div>

<div class="sec" id="sec-mclock">${h2('mclock', 'Top-right clock')}
<div class="card">
  <label class="fld" style="margin-top:0">Design</label>
  <div class="picks" id="mcDesigns"></div>
  <label class="fld" style="margin-top:16px">Size: <span id="mcFontVal" class="num" style="color:var(--ember)"></span></label>
  <input id="mc-font" type="range" min="10" max="22" step="1" style="accent-color:var(--ember)">
  <label class="fld">Accent color</label>
  <div class="row">
    <input id="mc-accent" type="color" style="width:56px;height:40px;padding:3px">
    <span class="tiny" id="mc-accent-state"></span>
    <button class="ghost sm" onclick="D.mclock.accent='';renderMClockCtl();mark()">Default color</button>
  </div>
  <div class="hint">The clock at the top of this page previews your pick before you save.</div>
</div></div>

${pane('sharing')}
<div class="sec" id="sec-booking">${h2('booking', 'Booking')}
<div class="card">
  <div class="row">
    <div class="grow"><b>Friends can book</b><div class="tiny">Your public booking page.</div></div>
    <div class="toggle" id="bookT" role="switch" tabindex="0"></div>
  </div>
  <label class="fld" style="margin-top:14px">Bookable windows</label>
  <div id="avail"></div>
  <button class="sm" style="margin-top:6px" onclick="addAvail()">＋ Add window</button>
  <div class="hint">Whatever is left of these windows after grind and side tasks is what friends can book.</div>
  <label class="fld">Days visible ahead: <span id="bdVal" class="num" style="color:var(--ember)"></span></label>
  <input id="s-bdays" type="range" min="1" max="14" step="1" style="accent-color:var(--ember)">
  <div class="fgrid" style="margin-top:10px">
    <div><label class="fld">Requests per phone per day</label><input id="s-bdev" type="number" min="1" max="10"></div>
    <div><label class="fld">People per slot</label><input id="s-bslot" type="number" min="1" max="20"></div>
  </div>
  <label class="fld">Session lengths (minutes, comma separated)</label>
  <input id="s-bdur" placeholder="30, 60, 120, 180">
</div></div>

<div class="sec" id="sec-share">${h2('share', 'Shared progress')}
<div class="card">
  <p class="muted">A read-only copy of your Progress tab that friends open with a PIN you set. They cannot change anything.</p>
  <label class="fld">Link</label>
  <div class="row"><input id="shareUrl" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('shareUrl').value);toast('Copied')">Copy</button></div>
  <div id="shareState" class="tiny" style="margin-top:8px"></div>
  <label class="fld">Share PIN</label>
  <div class="row" style="flex-wrap:wrap"><input id="sharePin" type="password" inputmode="numeric" placeholder="at least 4 characters" style="flex:1;min-width:150px">
  <button class="pri sm" onclick="saveSharePin()">Set now</button>
  <button class="rose sm" id="shareOffBtn" onclick="shareOff()">Turn off</button></div>
  <p class="tiny" style="margin-top:6px">The PIN applies at once. Changing it signs every friend out.</p>
  <label class="fld">Title friends see</label>
  <input id="shareTitle" maxlength="60" placeholder="My grind">
  <label class="fld">What they can see</label>
  ${tog('shOverview', 'Overview', 'streak, pace, records, off-day count')}
  ${tog('shLc', '🧩 LeetCode', 'averages, trends, charts')}
  ${tog('shGrind', '🔥 Grind', 'hours, heatmap, where time went')}
  ${tog('shJobs', '📨 Jobs', 'funnel and platforms, no company names')}
  ${tog('shLcNames', 'LeetCode problem names', 'the per-day history of what you attempted')}
  ${tog('shFriends', '🎮 Friend time', 'names of your friends and hours with each')}
  ${tog('shOffReasons', 'Off-day reasons', 'why you rested, the count shows either way')}
</div></div>

<div class="sec" id="sec-calendar">${h2('calendar', 'Google Calendar')}
<div class="card">
  <p class="muted">Subscribe to this feed in Google Calendar (Settings → Add calendar → From URL). Google refreshes it every few hours.</p>
  <div class="row" style="margin-top:10px">
    <input id="icsUrl" readonly style="font-size:12px">
    <button class="sm" onclick="navigator.clipboard.writeText($('icsUrl').value);toast('Copied')">Copy</button>
  </div>
  <button class="rose sm" style="margin-top:10px" onclick="regenIcs()">Regenerate link (if leaked)</button>
</div></div>

${pane('api')}
<div class="sec" id="sec-platforms">${h2('platforms', 'Job platforms')}
<div class="card">
  <p class="muted">The dropdown on the Jobs tab. Anything not listed gets filed under "Other".</p>
  <div class="row" id="platChips" style="flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="row" style="margin-top:12px">
    <input id="platNew" placeholder="Add a platform, e.g. Simplify" onkeydown="if(event.key==='Enter')addPlat()">
    <button class="sm" onclick="addPlat()">Add</button>
  </div>
</div></div>

<div class="sec" id="sec-api">${h2('api', 'Agent API · job tracker')}
<div class="card">
  <p class="muted">An AI agent (or any script) gets full access to the Jobs tab with this key: read, add, edit, change status and delete. Adding bumps that day's counter, deleting takes it back down.</p>
  <label class="fld">Endpoint</label>
  <div class="row"><input id="jobsEp" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('jobsEp').value);toast('Copied')">Copy</button></div>
  <label class="fld">API key</label>
  <div class="row"><input id="apiKey" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('apiKey').value);toast('Copied')">Copy</button></div>
  <label class="fld">Instruction for your agent (paste into its CLAUDE.md)</label>
  <textarea id="agentSnip" readonly rows="14" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:10px">
    <button class="sm" onclick="navigator.clipboard.writeText($('agentSnip').value);toast('Snippet copied')">Copy snippet</button>
    <button class="rose sm" onclick="regenKey()">Regenerate key</button>
  </div>
</div>
<h2>Read-only API · for Claude</h2>
<div class="card">
  <p class="muted">Lets Claude read your LeetCode log, your job applications and your progress. <b>Read only</b>: this key cannot add, change or delete anything, and it never returns your problem notes. Works in Claude Code and in claude.ai chat in a browser (which cannot send headers, so the key rides in the URL).</p>
  <p class="tiny" style="margin-top:8px">The URLs below contain the key, so treat one like a password. Anyone holding it can read every job row including company and salary, and your whole LeetCode history. Regenerate below if one ever gets loose.</p>
  <label class="fld">Read key</label>
  <div class="row"><input id="readKey" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readKey').value);toast('Copied')">Copy</button></div>
  <label class="fld">LeetCode URL</label>
  <div class="row"><input id="readLc" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readLc').value);toast('Copied')">Copy</button></div>
  <label class="fld">Jobs URL</label>
  <div class="row"><input id="readJb" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readJb').value);toast('Copied')">Copy</button></div>
  <label class="fld">Progress URL</label>
  <div class="row"><input id="readPr" readonly style="font-size:12px">
  <button class="sm" onclick="navigator.clipboard.writeText($('readPr').value);toast('Copied')">Copy</button></div>
  <label class="fld">For Claude chat in a browser (paste into a Claude Project's instructions)</label>
  <textarea id="browserSnip" readonly rows="12" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:8px">
    <button class="sm" onclick="navigator.clipboard.writeText($('browserSnip').value);toast('Copied for browser Claude')">Copy</button>
  </div>
  <label class="fld">For Claude Code (paste into its CLAUDE.md)</label>
  <textarea id="ccSnip" readonly rows="10" style="font-size:12px;font-family:var(--mono)"></textarea>
  <div class="row" style="margin-top:10px">
    <button class="sm" onclick="navigator.clipboard.writeText($('ccSnip').value);toast('Copied for Claude Code')">Copy</button>
    <button class="rose sm" onclick="regenReadKey()">Regenerate read key</button>
  </div>
</div></div>

${pane('account')}
<div class="sec" id="sec-account">${h2('account', 'Account')}
<div class="card">
  <div class="row"><div class="grow"><b id="accEmail"></b><div class="tiny">Handle: <span id="accHandle" class="num"></span></div></div>
  <a class="btnlink" href="/api/export">⬇ Export my data</a></div>
  <label class="fld">Change password</label>
  <div class="fgrid">
    <div><input id="p-cur" type="password" autocomplete="current-password" placeholder="current"></div>
    <div><input id="p-new" type="password" autocomplete="new-password" placeholder="new, 10+ characters"></div>
  </div>
  <button class="pri" style="margin-top:12px" onclick="changePw()">Change password</button>
  <div class="hint">Every other signed-in device is signed out.</div>
  <label class="fld">Import a LockIn export</label>
  <div class="row" style="flex-wrap:wrap">
    <label class="filebtn"><input type="file" id="impFile" accept="application/json,.json" onchange="$('impName').textContent=this.files[0]?this.files[0].name:'no file chosen'"><span class="btnlink" style="cursor:pointer">Choose file</span><span class="fname" id="impName">no file chosen</span></label>
  </div>
  <div class="row" style="flex-wrap:wrap;margin-top:8px"><input id="p-imp" type="password" placeholder="your password" style="flex:1;min-width:140px"><button class="rose sm" onclick="importFile()">Replace everything</button></div>
  <div class="hint">Replaces every table with the file. Export first if you are unsure. Keys and PINs are never in an export.</div>
  <div class="row" style="margin-top:18px"><button class="ghost sm" onclick="logout()">Sign out</button></div>
</div>
<div class="card danger">
  <b style="color:var(--rose)">Delete account</b>
  <p class="tiny" style="margin-top:4px">Removes your account and your entire database. There is no undo. Export first if you want a copy.</p>
  <div class="row" style="margin-top:8px;flex-wrap:wrap"><input id="p-del" type="password" placeholder="your password" style="flex:1;min-width:140px"><button class="rose sm" onclick="delAccount()">Delete everything</button></div>
</div></div>
</div>

<div class="savebar" id="savebar">
  <div class="msg" id="sbMsg" onclick="gotoChanged()" style="cursor:pointer"></div>
  <button class="ghost sm" onclick="discard()">Discard</button>
  <button class="pri sm" id="sbSave" onclick="saveAll()">Save changes</button>
</div>
`, `<script>
let S=null,D=null,B={};
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PAL=['#FF6B35','#5EA2FF','#3DDC97','#9B6EF3','#FFB347','#FF5D73','#4f8ef7','#f3a33c'];
const CEMO=['\\uD83E\\uDDE9','\\uD83D\\uDCE8','\\uD83D\\uDCDA','\\uD83D\\uDDC4\\uFE0F','\\uD83C\\uDFD7\\uFE0F','\\uD83D\\uDCAC','\\uD83C\\uDF99\\uFE0F','\\uD83D\\uDCDD','\\u2B50','\\uD83C\\uDFAF'];
const MODS=[['leetcode','\\uD83E\\uDDE9 LeetCode tab','problem log, notes, visualizer, solve-time stats'],['jobs','\\uD83D\\uDCE8 Jobs tab','application tracker, funnel, platforms'],['copy','\\uD83D\\uDCCB Quick Copy','snippets for application forms'],['clock','\\uD83D\\uDD52 Day clock','the 12-hour dial on Today'],['friends','\\uD83C\\uDFAE Friends booking','public page where friends grab free slots']];
const SHK=[['shOverview','overview'],['shLc','lc'],['shGrind','grind'],['shJobs','jobs'],['shLcNames','lcNames'],['shFriends','friends'],['shOffReasons','offReasons']];
// which draft keys belong to which section, for the change markers and the save bar text
const SEC={time:['tz','clock24'],plan:['phases'],cats:['cats'],layouts:['sched'],sides:['sides'],modules:['modules','grindTarget'],today:['todayLayout','timerDefault','timerOptions'],clock:['clock'],mclock:['mclock'],booking:['booking'],share:['share'],platforms:['platforms']};
const TABOF={time:'plan',plan:'plan',cats:'plan',layouts:'schedule',sides:'schedule',modules:'today',today:'today',clock:'today',mclock:'today',booking:'sharing',share:'sharing',platforms:'api'};
const TABN={plan:'Plan',schedule:'Schedule',today:'Today',sharing:'Sharing',api:'Integrations',account:'Account'};
let TAB='plan';
try{history.scrollRestoration='manual';}catch(e){}
function showTab(t){if(!TABN[t])t='plan';TAB=t;
document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.id==='tb-'+t));
document.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on',p.id==='tab-'+t));
if(location.hash!=='#'+t)history.replaceState(null,'','#'+t);
const bar=$('tabs'),b=$('tb-'+t);bar.scrollTo({left:b.offsetLeft-(bar.clientWidth-b.offsetWidth)/2,behavior:'smooth'});
window.scrollTo({top:0});}
function gotoChanged(){const t=Object.keys(TABN).find(t=>$('tb-'+t).classList.contains('chg'));if(t)showTab(t);}
function toggle(el,on){el.classList.toggle('on',on);el.setAttribute('aria-checked',on);}
const hmOk=v=>/^\\d{2}:\\d{2}$/.test(v||'');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const q=v=>String(v).replace(/'/g,'');
const nums=s=>String(s).split(',').map(x=>+x.trim()).filter(n=>n>0);
const snap=k=>JSON.stringify(D[k]);

function draftFrom(S){const sh=S.share||{};return {
tz:S.tz,clock24:!!S.clock24,
phases:S.phases.map(p=>({id:p.id,name:p.name,start_date:p.start_date,end_date:p.end_date,color:p.color,low_load:p.low_load?1:0})),
cats:S.categories.map(c=>({id:c.id,name:c.name,emoji:c.emoji,color:c.color,goal_wd:c.goal_wd,goal_we:c.goal_we,goal_low:c.goal_low,enabled:c.enabled?1:0,builtin:c.builtin||null})),
sides:S.sideTasks.map(t=>({id:t.id,name:t.name,emoji:t.emoji,days:String(t.days).split(',').filter(x=>x!=='').map(Number),start:t.start,end:t.end,date_from:t.date_from||null,date_to:t.date_to||null,enabled:t.enabled?1:0})),
sched:JSON.parse(JSON.stringify(S.sched)),modules:{...S.modules},grindTarget:S.grindTarget,todayLayout:S.todayLayout,
timerDefault:S.timerDefault,timerOptions:S.timerOptions.join(', '),
clock:{design:S.clock.design,size:S.clock.size,font:S.clock.font,accent:S.clock.accent||''},
mclock:{design:S.mclock.design,font:S.mclock.font,accent:S.mclock.accent||''},
booking:{enabled:!!S.bookingEnabled,days:S.bookingDays,avail:S.availability.map(a=>[a[0],a[1]]),perDevice:S.bookingPerDevice,perSlot:S.bookingPerSlot,durations:S.bookingDurations.join(', ')},
share:{title:sh.title||'',overview:!!sh.overview,lc:!!sh.lc,grind:!!sh.grind,jobs:!!sh.jobs,lcNames:!!sh.lcNames,friends:!!sh.friends,offReasons:!!sh.offReasons},
platforms:[...S.jobPlatforms]};}

// ---- change tracking ----
function mark(){const tabs={};
for(const [sec,keys] of Object.entries(SEC)){const d=keys.some(k=>snap(k)!==B[k]);$('h-'+sec).classList.toggle('chg',d);if(d)tabs[TABOF[sec]]=1;}
Object.keys(TABN).forEach(t=>$('tb-'+t).classList.toggle('chg',!!tabs[t]));
const names=Object.keys(TABN).filter(t=>tabs[t]).map(t=>TABN[t]);
const dirty=names.length>0;$('savebar').classList.toggle('show',dirty);document.body.classList.toggle('dirty',dirty);
$('sbMsg').innerHTML=dirty?'<b>Unsaved changes</b>'+esc(names.join(' \\u00b7 ')):'';
syncModHint();}
function baseline(){B={};for(const k of Object.keys(D))B[k]=snap(k);mark();}
window.addEventListener('beforeunload',e=>{if(document.body.classList.contains('dirty')){e.preventDefault();e.returnValue='';}});
function bad(sec,msg){toast(msg);showTab(TABOF[sec]||'plan');const el=$('sec-'+sec);if(el)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),50);return false;}
// the LeetCode tab only exists while the LeetCode category is on, so the two move together
const lcCat=()=>D.cats.find(c=>c.builtin==='leetcode');
function syncModHint(){const c=lcCat();const el=$('modHint');if(!el)return;
el.textContent=(c&&!c.enabled&&D.modules.leetcode)?'The LeetCode tab needs the LeetCode category, which is off. Saving turns the category back on.':'';}

async function load(){
S=await api('/api/settings');D=draftFrom(S);
renderAll();renderStatic();baseline();}
showTab(location.hash.slice(1));
window.addEventListener('hashchange',()=>showTab(location.hash.slice(1)));
function renderAll(){
let zones=[];try{zones=Intl.supportedValuesOf('timeZone')}catch(e){zones=['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo']}
if(!zones.includes(D.tz))zones.unshift(D.tz);
$('s-tz').innerHTML=zones.map(z=>'<option value="'+z+'"'+(z===D.tz?' selected':'')+'>'+z.replace(/_/g,' ')+'</option>').join('');
$('s-tz').onchange=()=>{D.tz=$('s-tz').value;mark();};
seg('clkSeg','c',D.clock24?'1':'0',v=>{D.clock24=v==='1';});
renderPhases();renderCats();renderLayouts();renderSides();
$('modToggles').innerHTML=MODS.map(([k,l,s])=>'<div class="row" style="margin-top:10px"><div class="grow"><b>'+l+'</b><div class="tiny">'+s+'</div></div><div class="toggle" id="mod-'+k+'" role="switch" tabindex="0"></div></div>').join('');
MODS.forEach(([k])=>tg('mod-'+k,()=>!!D.modules[k],v=>{D.modules[k]=v;
if(k==='leetcode'&&v){const c=lcCat();if(c&&!c.enabled){c.enabled=1;renderCats();toast('LeetCode category turned on too');}}}));
num('s-target',()=>D.grindTarget,v=>{D.grindTarget=v;});
seg('layoutSeg','l',D.todayLayout,v=>{D.todayLayout=v;});
num('s-timer',()=>D.timerDefault,v=>{D.timerDefault=v;});
txt('s-topts',()=>D.timerOptions,v=>{D.timerOptions=v;});
renderClockCtl();renderMClockCtl();
tg('bookT',()=>D.booking.enabled,v=>{D.booking.enabled=v;});
renderAvail();
$('s-bdays').value=D.booking.days;$('bdVal').textContent=D.booking.days;
$('s-bdays').oninput=()=>{D.booking.days=+$('s-bdays').value;$('bdVal').textContent=D.booking.days;mark();};
num('s-bdev',()=>D.booking.perDevice,v=>{D.booking.perDevice=v;});
num('s-bslot',()=>D.booking.perSlot,v=>{D.booking.perSlot=v;});
txt('s-bdur',()=>D.booking.durations,v=>{D.booking.durations=v;});
txt('shareTitle',()=>D.share.title,v=>{D.share.title=v;});
SHK.forEach(([id,k])=>tg(id,()=>D.share[k],v=>{D.share[k]=v;}));
renderPlats();}
// static = things that are not part of the draft (keys, links, account); safe to refresh any time
function renderStatic(){
const SHR=S.share||{};
$('shareUrl').value=S.shareUrl;
$('shareState').innerHTML=SHR.isOn
?'<span style="color:var(--mint)">\\u25cf Sharing is on.</span> Anyone with the link and the PIN can read these stats.'
:'<span style="color:var(--ink3)">\\u25cb Sharing is off.</span> Set a PIN to switch it on.';
$('shareOffBtn').style.display=SHR.isOn?'':'none';
$('icsUrl').value=S.icsUrl;
$('jobsEp').value=S.jobsEndpoint;$('apiKey').value=S.apiKey;
$('readKey').value=S.readKey;
$('readLc').value=S.readEndpoints.leetcode;$('readJb').value=S.readEndpoints.jobs;$('readPr').value=S.readEndpoints.progress;
renderSnips();
$('accEmail').textContent=(S.user&&S.user.email)||'';$('accHandle').textContent=(S.user&&S.user.handle)||'';}
async function refreshStatic(){S=await api('/api/settings');renderStatic();}

// small binders: every control writes into D and calls mark()
function tg(id,get,set){toggle($(id),get());$(id).onclick=()=>{set(!get());toggle($(id),get());mark();};}
function num(id,get,set){$(id).value=get();$(id).oninput=()=>{set(+$(id).value);mark();};}
function txt(id,get,set){$(id).value=get();$(id).oninput=()=>{set($(id).value);mark();};}
function seg(id,attr,cur,set){document.querySelectorAll('#'+id+' button').forEach(b=>{b.classList.toggle('on',b.dataset[attr]===cur);
b.onclick=()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));set(b.dataset[attr]);mark();};});}

// ---- phases ----
function renderPhases(){const PH=D.phases;
$('phases').innerHTML=PH.length?PH.map((p,i)=>'<div class="ed"><div class="row"><input class="nm" value="'+esc2(p.name)+'" oninput="D.phases['+i+'].name=this.value;mark()" placeholder="Phase name">'
+'<button class="ghost sm" onclick="D.phases.splice('+i+',1);renderPhases();mark()" aria-label="remove">\\u2715</button></div>'
+'<div class="rng"><input type="date" value="'+p.start_date+'" onchange="D.phases['+i+'].start_date=this.value;mark()"><span class="tiny">to</span><input type="date" value="'+p.end_date+'" onchange="D.phases['+i+'].end_date=this.value;mark()"></div>'
+'<div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="sm '+(p.low_load?'on':'')+'" onclick="D.phases['+i+'].low_load=D.phases['+i+'].low_load?0:1;renderPhases();mark()">'+(p.low_load?'\\uD83E\\uDEAB low load':'normal load')+'</button><span class="grow"></span>'
+'<div class="sw" style="margin:0">'+PAL.map(c=>'<button style="background:'+c+'" class="'+(p.color===c?'on':'')+'" onclick="D.phases['+i+'].color=\\''+c+'\\';renderPhases();mark()" aria-label="colour"></button>').join('')+'</div></div></div>').join('')
:'<div class="skel">No plan yet. Add a phase to get the progress bar, pace and forecast.</div>';}
function addPhase(){const PH=D.phases;const last=PH[PH.length-1];const d=new Date((last?last.end_date:new Date().toISOString().slice(0,10))+'T12:00:00Z');if(last)d.setUTCDate(d.getUTCDate()+1);
const s=d.toISOString().slice(0,10);const e=new Date(d);e.setUTCDate(e.getUTCDate()+27);
PH.push({id:null,name:'Phase '+(PH.length+1),start_date:s,end_date:e.toISOString().slice(0,10),color:PAL[PH.length%PAL.length],low_load:0});renderPhases();mark();}
async function regen(){if(!confirm('Rewrite the goals of today and every future day from the category values? Days with logged work are kept.'))return;
try{const j=await api('/api/goals/regenerate',{body:{}});toast('Goals rewritten, '+j.touched+' rows');}catch(e){toast(String(e))}}

// ---- categories ----
function renderCats(){
$('cats').innerHTML=D.cats.map((c,i)=>'<div class="ed'+(c.enabled?'':' dim')+'"><div class="row"><span style="font-size:20px">'+c.emoji+'</span>'
+'<input class="nm" value="'+esc2(c.name)+'" oninput="D.cats['+i+'].name=this.value;mark()"'+(c.builtin?' readonly':'')+' placeholder="Category name">'
+'<button class="sm '+(c.enabled?'':'pri')+'" onclick="tgCat('+i+')">'+(c.enabled?'Turn off':'Turn on')+'</button></div>'
+'<div class="cklab">Daily goal</div><div class="gl" style="margin-top:4px"><div><label>Weekday</label><input type="number" min="0" max="50" value="'+c.goal_wd+'" oninput="D.cats['+i+'].goal_wd=+this.value;mark()"></div>'
+'<div><label>Weekend</label><input type="number" min="0" max="50" value="'+c.goal_we+'" oninput="D.cats['+i+'].goal_we=+this.value;mark()"></div>'
+'<div><label>Low load</label><input type="number" min="0" max="50" value="'+c.goal_low+'" oninput="D.cats['+i+'].goal_low=+this.value;mark()"></div></div>'
+(c.builtin?'<div class="hint">Built in: '+(c.builtin==='leetcode'?'the LeetCode module.':'the Jobs tracker.')+'</div>'
:'<div class="em">'+CEMO.map(e=>'<button class="'+(c.emoji===e?'on':'')+'" onclick="D.cats['+i+'].emoji=this.textContent;renderCats();mark()">'+e+'</button>').join('')+'</div>'
+'<div class="sw">'+PAL.map(col=>'<button style="background:'+col+'" class="'+(c.color===col?'on':'')+'" onclick="D.cats['+i+'].color=\\''+col+'\\';renderCats();mark()"></button>').join('')+'</div>')
+'</div>').join('');}
function tgCat(i){const c=D.cats[i];c.enabled=c.enabled?0:1;
if(c.builtin==='leetcode'){D.modules.leetcode=!!c.enabled;const t=$('mod-leetcode');if(t)toggle(t,!!c.enabled);toast(c.enabled?'LeetCode tab turned on too':'LeetCode tab turned off too');}
renderCats();mark();}
function addCat(){D.cats.push({id:null,name:'',emoji:CEMO[2],color:PAL[D.cats.length%PAL.length],goal_wd:1,goal_we:0,goal_low:0,enabled:1,builtin:null});renderCats();mark();
const inputs=document.querySelectorAll('#cats input.nm');const last=inputs[inputs.length-1];if(last)last.focus();}

// ---- layouts ----
function renderLayouts(){const LAY=D.sched;
const names=Object.keys(LAY.layouts);
$('layouts').innerHTML=names.map(n=>'<div class="ed"><div class="row"><b style="flex:1;text-transform:capitalize">'+esc2(n)+'</b>'
+(n===LAY.default?'<span class="tiny">default</span>':'<button class="ghost sm" onclick="D.sched.default=\\''+q(n)+'\\';renderLayouts();mark()">make default</button>')
+(names.length>1?'<button class="ghost sm" onclick="delLayout(\\''+q(n)+'\\')" aria-label="remove">\\u2715</button>':'')+'</div>'
+LAY.layouts[n].map((b,i)=>'<div class="rng"><span class="tiny" style="width:48px">Block '+(i+1)+'</span><input type="time" value="'+b[0]+'" onchange="D.sched.layouts[\\''+q(n)+'\\']['+i+'][0]=this.value;mark()"><span class="tiny">to</span><input type="time" value="'+b[1]+'" onchange="D.sched.layouts[\\''+q(n)+'\\']['+i+'][1]=this.value;mark()">'
+(LAY.layouts[n].length>1?'<button class="ghost sm" onclick="D.sched.layouts[\\''+q(n)+'\\'].splice('+i+',1);renderLayouts();mark()" aria-label="remove">\\u2715</button>':'<span style="width:34px"></span>')+'</div>').join('')
+(LAY.layouts[n].length<4?'<button class="sm" style="margin-top:8px" onclick="D.sched.layouts[\\''+q(n)+'\\'].push([\\'19:00\\',\\'21:00\\']);renderLayouts();mark()">\\uFF0B block</button>':'')+'</div>').join('');
const one=names.length<2;$('layAssign').style.display=one?'none':'';
$('layHint').textContent=one?'One layout means every day uses it. Add a second one (a night-owl day, a weekend shape) to assign it to weekdays or to low-load days.':'Weekday overrides beat the default; low-load days always use their own pick.';
$('byDow').innerHTML=DN.map((d,i)=>'<label class="tiny" style="display:flex;flex-direction:column;gap:3px">'+d+'<select onchange="if(this.value)D.sched.byDow['+i+']=this.value;else delete D.sched.byDow['+i+'];mark()" style="padding:6px"><option value="">default</option>'+names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.byDow[i]===n?' selected':'')+'>'+esc2(n)+'</option>').join('')+'</select></label>').join('');
$('lowSel').innerHTML=names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.low===n?' selected':'')+'>'+esc2(n)+'</option>').join('');
$('lowSel').onchange=()=>{D.sched.low=$('lowSel').value;mark();};}
function addLayout(){const n=$('layNew').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);if(!n)return toast('Letters and numbers only');if(D.sched.layouts[n])return toast('Already exists');
D.sched.layouts[n]=[['09:00','12:00']];$('layNew').value='';renderLayouts();mark();}
function delLayout(n){const LAY=D.sched;delete LAY.layouts[n];if(LAY.default===n)LAY.default=Object.keys(LAY.layouts)[0];if(LAY.low===n)LAY.low=LAY.default;for(const d of Object.keys(LAY.byDow))if(LAY.byDow[d]===n)delete LAY.byDow[d];renderLayouts();mark();}

// ---- side tasks ----
function renderSides(){const SD=D.sides;
const EM=S.sideEmoji||['\\uD83D\\uDCCC'];
$('sides').innerHTML=SD.length?SD.map((t,i)=>'<div class="ed'+(t.enabled?'':' dim')+'"><div class="row"><span style="font-size:20px">'+t.emoji+'</span><input class="nm" value="'+esc2(t.name)+'" oninput="D.sides['+i+'].name=this.value;mark()" placeholder="Gym, class, shift...">'
+'<button class="sm" onclick="D.sides['+i+'].enabled=D.sides['+i+'].enabled?0:1;renderSides();mark()">'+(t.enabled?'On':'Off')+'</button>'
+'<button class="ghost sm" onclick="D.sides.splice('+i+',1);renderSides();mark()" aria-label="remove">\\u2715</button></div>'
+'<div class="em">'+EM.map(e=>'<button class="'+(t.emoji===e?'on':'')+'" onclick="D.sides['+i+'].emoji=this.textContent;renderSides();mark()">'+e+'</button>').join('')+'</div>'
+'<div class="chips">'+DN.map((d,di)=>'<button class="'+(t.days.includes(di)?'on':'')+'" onclick="tgDay('+i+','+di+')">'+d+'</button>').join('')+'</div>'
+'<div class="rng"><input type="time" value="'+t.start+'" onchange="D.sides['+i+'].start=this.value;mark()"><span class="tiny">to</span><input type="time" value="'+t.end+'" onchange="D.sides['+i+'].end=this.value;mark()"></div>'
+'<div class="cklab">Only between (optional)</div>'
+'<div class="rng" style="margin-top:4px"><input type="date" value="'+(t.date_from||'')+'" onchange="D.sides['+i+'].date_from=this.value||null;mark()"><span class="tiny">and</span><input type="date" value="'+(t.date_to||'')+'" onchange="D.sides['+i+'].date_to=this.value||null;mark()"></div>'
+'<div class="row" style="margin-top:8px"><span class="hint" style="margin:0">Empty dates = every week.</span><span class="grow"></span><button class="ghost sm" onclick="cloneSide('+i+')" title="the same task at another time of day">\\uFF0B another time</button></div></div>').join('')
:'<div class="skel">Nothing yet. Gym, a class, a shift: add what takes real time each week.</div>';}
// gym twice a day: a second row with the same name and days, so both show on the timeline
function cloneSide(i){const t=D.sides[i];const [h,m]=t.end.split(':').map(Number);const s=String(Math.min(23,h+1)).padStart(2,'0')+':'+String(m).padStart(2,'0');const e=String(Math.min(23,h+2)).padStart(2,'0')+':'+String(m).padStart(2,'0');
D.sides.splice(i+1,0,{id:null,name:t.name,emoji:t.emoji,days:[...t.days],start:s,end:e,date_from:t.date_from,date_to:t.date_to,enabled:1});renderSides();mark();}
function tgDay(i,d){const t=D.sides[i];const k=t.days.indexOf(d);if(k<0)t.days.push(d);else t.days.splice(k,1);t.days.sort();renderSides();mark();}
function addSide(){D.sides.push({id:null,name:'',emoji:(S.sideEmoji||['\\uD83D\\uDCCC'])[0],days:[1,3,5],start:'19:00',end:'20:30',date_from:null,date_to:null,enabled:1});renderSides();mark();
const inputs=document.querySelectorAll('#sides input.nm');const last=inputs[inputs.length-1];if(last)last.focus();}

// ---- booking windows ----
function renderAvail(){const AVW=D.booking.avail;$('avail').innerHTML=AVW.map((a,i)=>'<div class="rng" style="margin-top:6px"><input type="time" value="'+a[0]+'" onchange="D.booking.avail['+i+'][0]=this.value;mark()"><span class="tiny">to</span><input type="time" value="'+a[1]+'" onchange="D.booking.avail['+i+'][1]=this.value;mark()"><button class="ghost sm" onclick="D.booking.avail.splice('+i+',1);renderAvail();mark()" aria-label="remove">\\u2715</button></div>').join('')||'<div class="tiny">No windows: nothing is bookable.</div>';}
function addAvail(){if(D.booking.avail.length>=4)return toast('4 windows max');D.booking.avail.push(['12:00','15:00']);renderAvail();mark();}

// ---- clocks (the top-right one previews live through window.__MCLOCK) ----
const CKD={ember:{face:'#10151F',cols:['#FF6B35','#5EA2FF','#3DDC97']},neon:{face:'#06080F',cols:['#FF2E88','#00E5FF','#39FF88']},
mono:{face:'#0E1114',cols:['#EDF1F7','#79828E','#AEB8C4']},sunset:{face:'#191016',cols:['#FF5D73','#FFB347','#FFD166']},
terminal:{face:'#070D08',cols:['#3DDC97','#1E9E68','#8AF5C2']}};
const CKNAMES={ember:'Ember',neon:'Neon',mono:'Mono',sunset:'Sunset',terminal:'Terminal'};
function ckPreview(k){const d=CKD[k];
const arc=(col,a1,a2,r)=>{const p=a=>[27+r*Math.cos((a-90)*Math.PI/180),27+r*Math.sin((a-90)*Math.PI/180)];
const[x1,y1]=p(a1),[x2,y2]=p(a2);
return '<path d="M '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+'" stroke="'+col+'" stroke-width="6" fill="none"/>';};
return '<svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="26" fill="'+d.face+'" stroke="#333c4f"/>'
+arc(d.cols[0],20,120,17)+arc(d.cols[1],140,200,17)+arc(d.cols[2],230,320,17)+'</svg>';}
function renderClockCtl(){const C=D.clock;
$('ckDesigns').innerHTML=Object.keys(CKD).map(k=>'<button class="ghost pick'+(C.design===k?' on':'')+'" onclick="D.clock.design=\\''+k+'\\';renderClockCtl();mark()">'+ckPreview(k)+'<span>'+CKNAMES[k]+'</span></button>').join('');
$('ck-size').value=C.size;$('ckSizeVal').textContent=C.size;
$('ck-font').value=C.font;$('ckFontVal').textContent=C.font;
$('ck-accent').value=C.accent||'#FF6B35';$('ck-accent-state').textContent=C.accent?'custom '+C.accent:'design color';
$('ck-size').oninput=()=>{D.clock.size=+$('ck-size').value;$('ckSizeVal').textContent=D.clock.size;mark();};
$('ck-font').oninput=()=>{D.clock.font=+$('ck-font').value;$('ckFontVal').textContent=D.clock.font;mark();};
$('ck-accent').oninput=()=>{D.clock.accent=$('ck-accent').value;$('ck-accent-state').textContent='custom '+D.clock.accent;mark();};}
const MCNAMES={pill:'Pill',led:'LED',analog:'Analog',flip:'Flip',ring:'Day ring'};
let mcInt=null;
function mcPreview(){window.__MCLOCK={design:D.mclock.design,font:D.mclock.font,accent:D.mclock.accent};}
function renderMClockCtl(){const M=D.mclock;
$('mcDesigns').innerHTML=Object.keys(MCNAMES).map(k=>'<button class="ghost pick'+(M.design===k?' on':'')+'" onclick="D.mclock.design=\\''+k+'\\';renderMClockCtl();mark()"><span class="mc-prev" data-d="'+k+'"></span><span>'+MCNAMES[k]+'</span></button>').join('');
const draw=()=>document.querySelectorAll('.mc-prev').forEach(el=>{el.innerHTML=window.mclockHTML({design:el.dataset.d,font:12,accent:D.mclock.accent},new Date());});
draw();clearInterval(mcInt);mcInt=setInterval(draw,1000);
$('mc-font').value=M.font;$('mcFontVal').textContent=M.font;
$('mc-accent').value=M.accent||'#FF6B35';$('mc-accent-state').textContent=M.accent?'custom '+M.accent:'default';
$('mc-font').oninput=()=>{D.mclock.font=+$('mc-font').value;$('mcFontVal').textContent=D.mclock.font;mcPreview();mark();};
$('mc-accent').oninput=()=>{D.mclock.accent=$('mc-accent').value;$('mc-accent-state').textContent='custom '+D.mclock.accent;renderMClockCtl();mark();};
mcPreview();}

// ---- platforms (part of the draft) ----
function renderPlats(){
$('platChips').innerHTML=D.platforms.map((p,i)=>
'<span class="chip">'+esc(p)+'<button class="ghost sm" style="padding:0 2px" onclick="D.platforms.splice('+i+',1);renderPlats();mark()" aria-label="remove">\\u2715</button></span>').join('')
+'<span class="chip" style="opacity:.6">Other <span class="tiny">always available</span></span>';}
function addPlat(){
const v=$('platNew').value.trim();
if(!v)return;
if(D.platforms.some(p=>p.toLowerCase()===v.toLowerCase()))return toast('Already in the list');
D.platforms.push(v);$('platNew').value='';renderPlats();mark();}

// ---- save / discard ----
function discard(){D=draftFrom(S);renderAll();baseline();toast('Changes discarded');}
async function saveAll(){
for(const p of D.phases){if(!p.name.trim())return bad('plan','Name every phase');if(p.end_date<p.start_date)return bad('plan','"'+p.name+'" ends before it starts');}
if(!D.cats.some(c=>c.enabled))return bad('cats','Keep at least one category on');
for(const c of D.cats)if(!c.builtin&&!c.name.trim())return bad('cats','Name every category');
for(const [n,l] of Object.entries(D.sched.layouts))for(const b of l)if(!hmOk(b[0])||!hmOk(b[1]))return bad('layouts','Fill every time in '+n);
for(const t of D.sides){if(!t.name.trim())return bad('sides','Name every side task');if(!t.days.length)return bad('sides',t.name+': pick at least one day');}
const sh=D.share;
const body={settings:{timezone:D.tz,clock24:D.clock24,modules:D.modules,grindTarget:+D.grindTarget||6,todayLayout:D.todayLayout,
timerDefault:+D.timerDefault,timerOptions:nums(D.timerOptions),
clockDesign:D.clock.design,clockSize:+D.clock.size,clockFont:+D.clock.font,clockAccent:D.clock.accent||'',
mclockDesign:D.mclock.design,mclockFont:+D.mclock.font,mclockAccent:D.mclock.accent||'',
bookingEnabled:D.booking.enabled,bookingDays:+D.booking.days,availability:D.booking.avail,bookingPerDevice:+D.booking.perDevice,bookingPerSlot:+D.booking.perSlot,bookingDurations:nums(D.booking.durations),
shareTitle:sh.title,shareOverview:sh.overview,shareLc:sh.lc,shareGrind:sh.grind,shareJobs:sh.jobs,shareLcNames:sh.lcNames,shareFriends:sh.friends,shareOffReasons:sh.offReasons,
jobPlatforms:D.platforms,sched:D.sched},
phases:D.phases,categories:D.cats,sideTasks:D.sides};
// the nav, the time zone and the header style live in the page shell, so those need a fresh page
const needReload=['modules','tz','clock24','todayLayout'].some(k=>snap(k)!==B[k]);
const btn=$('sbSave');btn.disabled=true;btn.textContent='Saving\\u2026';
try{const j=await api('/api/settings/all',{body});
toast(j.regenerated?'Saved. Goals for '+j.regenerated+' upcoming days updated.':'Saved');
if(needReload){document.body.classList.remove('dirty');setTimeout(()=>location.reload(),500);return;}
await load();}
catch(e){toast(String(e))}
finally{btn.disabled=false;btn.textContent='Save changes';}}

// ---- immediate actions (each one confirms on its own) ----
async function saveSharePin(){
const pin=$('sharePin').value.trim();
if(pin.length<4)return toast('Share PIN must be at least 4 characters');
try{await api('/api/settings',{body:{sharePin:pin}});$('sharePin').value='';
toast('\\uD83D\\uDD17 Share PIN set. Friends will need the new one.');refreshStatic();}
catch(e){toast(String(e))}}
async function shareOff(){
if(!confirm('Turn off sharing? The link stops working and every friend is signed out.'))return;
await api('/api/settings',{body:{sharePin:''}});toast('Sharing turned off');refreshStatic();}
async function regenIcs(){
if(!confirm('Old link stops working. Google Calendar must be re-subscribed. Continue?'))return;
const j=await api('/api/ics/regen',{});$('icsUrl').value=j.icsUrl;toast('New link generated');}
async function regenKey(){
if(!confirm('Old key stops working. Update your agent after. Continue?'))return;
await api('/api/apikey/regen',{});toast('New key generated');refreshStatic();}
async function regenReadKey(){
if(!confirm('The three read URLs stop working straight away and you will need to paste the new ones into Claude. Your job tracker agent key is not affected. Continue?'))return;
await api('/api/readkey/regen',{});toast('New read key generated');refreshStatic();}
function renderSnips(){
const EP=S.jobsEndpoint, AUTH='-H "Authorization: Bearer '+S.apiKey+'" -H "Content-Type: application/json"';
$('agentSnip').value=
'# LockIn job tracker API\\n'
+'Every request needs: '+AUTH+'\\n'
+'Statuses (exact, lowercase): applied, oa, interview, offer, rejected.\\n'
+'Platforms (use one exactly): '+S.jobPlatforms.join(', ')+'. Anything else is filed as "Other · <name>", so send the real name rather than inventing a spelling.\\n\\n'
+'LOG an application (title and company required, date defaults to today in my time zone; this bumps my daily counter, do not count it twice):\\n'
+'curl -X POST '+EP+' '+AUTH+' -d \\'{"title":"...","company":"...","salary":"","location":"","platform":"...","url":"..."}\\'\\n\\n'
+'LIST / FIND (filters: status, company, q, date, since, limit):\\n'
+'curl "'+EP+'?status=applied&limit=50" '+AUTH+'\\n'
+'curl "'+EP+'?q=stripe" '+AUTH+'   # search title and company, use this to get the id before editing\\n\\n'
+'READ one:\\ncurl '+EP+'/<id> '+AUTH+'\\n\\n'
+'CHANGE STATUS (for example applied -> rejected):\\n'
+'curl -X PATCH '+EP+'/<id> '+AUTH+' -d \\'{"status":"rejected"}\\'\\n\\n'
+'EDIT any field (title, company, salary, location, url, platform, status, date):\\n'
+'curl -X PATCH '+EP+'/<id> '+AUTH+' -d \\'{"company":"Correct Name","salary":"$95k"}\\'\\n\\n'
+'DELETE (also takes that day\\'s counter back down):\\ncurl -X DELETE '+EP+'/<id> '+AUTH+'\\n\\n'
+'PATCH and DELETE return 404 if the id does not exist, and PATCH returns the updated row so you can confirm the change landed.';
const LC=S.readEndpoints.leetcode, JB=S.readEndpoints.jobs, PR=S.readEndpoints.progress;
$('browserSnip').value=
'# LockIn, my grind tracker. Read-only data feed.\\n\\n'
+'These URLs return my live data as JSON. Fetch one when you need facts about my LeetCode\\n'
+'practice, my job applications, or my overall progress. They are READ ONLY: nothing can be\\n'
+'added, changed or deleted through them, so never offer to log or edit anything here.\\n\\n'
+'LeetCode, every attempt plus per-problem rollups and solve times:\\n'+LC+'\\n\\n'
+'Job applications, every application plus the funnel and my pace:\\n'+JB+'\\n\\n'
+'Overall progress, grind hours, streak, pace vs plan, weekday pattern:\\n'+PR+'\\n\\n'
+'ALWAYS read the "guide" object at the top of the response before interpreting anything.\\n'
+'It defines every field and the counting rules. The one that trips people up: I rerun problems,\\n'
+'so attempt rows are NOT problems. Never count rows to say how many I have solved, use\\n'
+'stats.totals.solvedTotal.\\n\\n'
+'If a response is too big, add &limit=100 for the newest rows only, or &since=YYYY-MM-DD to\\n'
+'narrow by date. Add &format=md if plain text is easier to read than JSON. Always compare\\n'
+'"total" with "returned": if they differ you are looking at a slice, and you should say so.\\n\\n'
+'These URLs contain my key. Treat them as secret and do not repeat them back in your answers.';
$('ccSnip').value=
'# LockIn read-only data API\\n'
+'GET only. This key cannot write anything, it will 401 on every write path.\\n'
+'Key goes in the header below, or as ?key=... in the URL.\\n\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/leetcode\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/jobs\\n'
+'curl -s -H "Authorization: Bearer '+S.readKey+'" '+S.readBase+'/progress\\n\\n'
+'Params, all optional: limit, offset, since=YYYY-MM-DD, format=json|md.\\n'
+'jobs also takes status, company, q, date.\\n\\n'
+'Read the "guide" object in the response before interpreting fields. The rules that matter:\\n'
+'- finished: 0 did not finish, 1 solved clean, 2 solved but slow.\\n'
+'- a problem state is its NEWEST attempt, not its best one.\\n'
+'- reruns are normal, so never count attempt rows when you mean problems solved.\\n'
+'- "total" is the SQL count, "returned" is what came back. If they differ you have a slice.\\n'
+'- per-problem notes are never exposed by this API.\\n\\n'
+'To WRITE to the job tracker, use the separate agent API key. This one will not work for that.';}

// ---- account ----
async function changePw(){
try{await api('/api/auth/password',{body:{current:$('p-cur').value,next:$('p-new').value}});
$('p-cur').value='';$('p-new').value='';toast('Password changed');}
catch(e){toast(String(e))}}
async function logout(){await api('/api/auth/logout',{});location.href='/login';}
async function importFile(){
const f=$('impFile').files[0];if(!f)return toast('Pick an export file first');
if(!$('p-imp').value)return toast('Type your password');
if(!confirm('Replace EVERYTHING in your account with this file? There is no undo.'))return;
let file;try{file=JSON.parse(await f.text());}catch(e){return toast('That is not a JSON file');}
try{const j=await api('/api/import',{body:{password:$('p-imp').value,file}});toast('Imported: '+Object.values(j.counts||{}).reduce((a,b)=>a+b,0)+' rows');document.body.classList.remove('dirty');setTimeout(()=>location.href='/',900);}
catch(e){toast(String(e))}}
async function delAccount(){
if(!$('p-del').value)return toast('Type your password first');
if(!confirm('Delete your account and every bit of data in it? This cannot be undone.'))return;
if(!confirm('Last chance. Delete everything?'))return;
try{await api('/api/auth/delete',{body:{password:$('p-del').value}});document.body.classList.remove('dirty');location.href='/';}catch(e){toast(String(e))}}
load();
</script>`, { cfg, mclock: cfg && cfg.mclock });
