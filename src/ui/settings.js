import { shell } from './theme.js';

// Settings. Every personal thing the single-user app had welded in is an editor here.
// One draft, one save: every control edits the draft `D`; the sticky bar at the bottom appears
// only when the draft differs from what the server holds, and one press writes everything
// through POST /api/settings/all. Buttons that are actions rather than values (regenerate a key,
// set a PIN, change the password, import, delete) still run at once, with their own confirm.
//
// Layout language (shared with the wizard): a tab holds sections; a section is a title + one
// line of description + one card; inside a card, field groups (.fg) are separated by space, and
// editable rows (phases, categories, layouts, side tasks) are .item cards with a colour accent,
// darker "well" inputs, and a footer for secondary actions.
// Page-script rules: no backticks, no ${ }, quotes inside onclick strings are written as \\'.

const tog = (id, label, sub) => `<div class="togrow"><div class="grow"><b>${label}</b><div class="tiny">${sub}</div></div><div class="toggle" id="${id}" role="switch" tabindex="0" aria-label="${label}"></div></div>`;
const sec = (id, title, desc, body) => `<section class="stg sec" id="sec-${id}"><div class="stg-hd"><h2 id="h-${id}" class="stg-t">${title}<span class="dot">●</span></h2>${desc ? `<p class="stg-d">${desc}</p>` : ''}</div>${body}</section>`;
const kv = (id, label, toastMsg) => `<div class="fg"><label class="fld" for="${id}">${label}</label><div class="kv"><input id="${id}" readonly><button class="sm" onclick="navigator.clipboard.writeText($('${id}').value);toast('${toastMsg || 'Copied'}')">Copy</button></div></div>`;
const TABS = [['plan', 'Plan'], ['schedule', 'Schedule'], ['today', 'Today'], ['sharing', 'Sharing'], ['api', 'Integrations'], ['account', 'Account']];
const pane = (id, first) => `${first ? '' : '</div>'}<div class="tabpane" id="tab-${id}">`;

export const settingsPage = (cfg) => shell('LockIn · Settings', '/settings', `
<style>
.stg-h1{margin:0;font-size:22px;line-height:1.2}
.tabwrap{position:sticky;top:0;z-index:5;background:transparent;margin:0 -16px -16px;padding:12px 16px 28px;-webkit-mask-image:linear-gradient(#000 calc(100% - 22px),transparent);mask-image:linear-gradient(#000 calc(100% - 22px),transparent);transition:background .25s}
.tabwrap.stuck{background:rgba(11,14,20,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}

/* account rows: icon + title + description on the left, the controls on the right */
.stg .card.acct{padding:0;overflow:hidden}
.acct .idrow{padding:18px 20px}
.acct .idrow .who b{font-size:17px}
.acrow{display:grid;grid-template-columns:1fr;gap:14px;padding:18px 20px;border-top:1px solid var(--line)}
@media(min-width:760px){.acrow{grid-template-columns:minmax(0,.85fr) minmax(0,1.45fr);gap:28px;align-items:start}}
.acl{display:flex;gap:14px;align-items:flex-start}
.acl b{display:block;font:800 15px var(--disp);margin-bottom:4px}
.acl p{font-size:13.5px;color:var(--ink2);line-height:1.5}
.acl .tile{width:44px;height:44px;border-radius:12px}
.acl .tile.rose{background:#FF5D7318;border-color:#FF5D7355}
.stg .acr label.fld{margin:0 0 6px;text-transform:none;letter-spacing:0;font:600 13px var(--body);color:var(--ink2)}
.acr .fgrid{grid-template-columns:1fr;gap:12px}
.acr-end{display:flex;justify-content:flex-end;align-items:center}
button.rose.outl{background:transparent;color:var(--rose);border:1px solid var(--rose);padding:9px 18px}
button.rose.outl:hover{background:#FF5D7318}
.drop{display:flex;align-items:center;gap:14px;border:1px dashed var(--line2);border-radius:12px;padding:14px;cursor:pointer;background:var(--well)}
.drop:hover{border-color:var(--ink3)}
.drop input{display:none}
.drop b{display:block;font:700 14px var(--body)}
.note{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:12px 14px;border-radius:10px;background:#5EA2FF12;border:1px solid #5EA2FF40;font-size:13px;color:var(--ink2);line-height:1.5}
.note b{color:var(--ice)}
.meter{display:flex;align-items:center;gap:4px;margin-top:8px}
.meter i{width:26px;height:4px;border-radius:2px;background:var(--surface3)}
.meter i.on{background:var(--mint)}.meter.weak i.on{background:var(--rose)}.meter.mid i.on{background:var(--ember2)}
.meter span{margin-left:8px;font-size:12px;color:var(--ink2)}
@media(min-width:900px){.tabwrap{margin:0 -34px -16px;padding-left:34px;padding-right:34px}}
.tabbar{margin:10px 0 0}
.regrow{display:flex;flex-direction:column;gap:10px;align-items:flex-start;margin-top:14px}
@media(min-width:560px){.regrow{flex-direction:row;align-items:center}}
.regrow .hint{margin:0;flex:1}
.tabbar button{position:relative;padding:10px 16px}
.tabbar button.chg::after{content:'';position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:99px;background:var(--ember)}

.stg{margin-top:30px;scroll-margin-top:calc(var(--clkh,46px) + 76px)}
.tabpane>.stg:first-child{margin-top:20px}
.stg-hd{margin:0 0 12px;padding:0 2px}
.stg .stg-t{font:800 19px/1.25 var(--disp);color:var(--ink);letter-spacing:-.01em;text-transform:none;margin:0}
.stg .stg-t .dot{display:none;color:var(--ember);margin-left:8px;font-size:10px;vertical-align:middle}
.stg .stg-t.chg .dot{display:inline}
.stg-d{margin:5px 0 0;font-size:14px;line-height:1.55;color:var(--ink2);max-width:64ch}
.stg .card{padding:18px 16px;margin:0}
@media(min-width:760px){.stg .card{padding:22px}}
.stg label.fld{margin:0 0 8px;color:var(--ink2);letter-spacing:.08em}
.stg .hint{font-size:13px;line-height:1.5;color:var(--ink2);opacity:.85;margin-top:8px}

.lowbtn.on{background:#9B6EF322;border-color:#9B6EF388;color:var(--violet)}
.defpill{background:#FF6B3522;color:var(--ember)}

.rng{display:flex;align-items:center;gap:8px}
.rng input{flex:1;min-width:0;width:auto;padding:9px 10px;font-size:14px}
.rng .tiny{flex:none}
.rng button{flex:none}
.rng .lbl{flex:none;width:56px;font:700 11px var(--disp);color:var(--ink2);text-transform:uppercase;letter-spacing:.06em}
.rng+.rng{margin-top:8px}
.rng input[type=time],.rng input[type=date]{font-size:14px;padding:9px 8px;font-variant-numeric:tabular-nums}
@media(max-width:560px){.rng.blk{flex-wrap:wrap;gap:6px}.rng.blk .lbl{width:100%;margin-bottom:-2px}.rng.blk .xbtn{width:30px}.rng input[type=time]{font-size:13px;padding:9px 4px}}
.chips{display:flex;gap:6px}
.chips button{flex:1;min-width:0;padding:9px 0;font-size:12px}
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


.snip{width:100%;font:12.5px/1.55 var(--mono);color:var(--ink2);background:var(--well);min-height:170px}
.picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}
.pick{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:12px;width:100%;min-height:96px;background:var(--well);border:1px solid var(--line2)}
.pick span{font:700 11px var(--disp);color:var(--ink2)}
.pick.on{border-color:var(--ember);background:#FF6B3512}
.pick.on span{color:var(--ember)}
.pick .mc-prev{display:flex;align-items:center;justify-content:center;transform:scale(.85);max-width:100%;overflow:hidden}
.bgprev{width:100%;height:52px;border-radius:9px;border:1px solid var(--line2);background:#0B0E14;position:relative;overflow:hidden}
.bgprev.aurora{background:radial-gradient(circle at 18% 22%,rgba(255,107,53,.55),transparent 55%),radial-gradient(circle at 86% 88%,rgba(94,162,255,.5),transparent 55%),#0B0E14}
.bgprev.aurora:after,.bgprev.dots:after{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(237,241,247,.22) 1px,transparent 1.3px);background-size:9px 9px}
.rangerow{display:flex;align-items:center;gap:12px}
.rangerow input[type=range]{flex:1;accent-color:var(--ember);padding:0}
.rangerow .num{min-width:52px;text-align:right;font:800 15px var(--disp);color:var(--ember)}
.colorrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.colorrow input[type=color]{width:56px;height:40px;padding:3px;flex:none}
.idrow{display:flex;align-items:center;gap:12px}
.idrow .who{flex:1;min-width:0}
.idrow .who b{display:block;font:800 16px var(--disp);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.idrow .who .tiny{margin-top:2px}
.filebtn{display:inline-flex;align-items:center;gap:10px;width:100%;min-width:0}
.filebtn input{display:none}
.filebtn .fname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:var(--ink2)}
.btnlink{display:inline-flex;align-items:center;gap:6px;background:var(--surface2);color:var(--ink);border:1px solid var(--line2);border-radius:var(--rs);padding:8px 14px;font:700 13px var(--disp);text-decoration:none;white-space:nowrap;cursor:pointer}
.danger{border-color:#FF5D7345;background:linear-gradient(180deg,#FF5D730d,var(--surface) 60%)}
.row>button{white-space:nowrap}
.savebar{position:fixed;left:0;right:0;bottom:calc(74px + env(safe-area-inset-bottom));z-index:49;background:rgba(13,17,26,.96);backdrop-filter:blur(14px);border-top:1px solid var(--ember);padding:12px 16px;display:none;align-items:center;gap:8px}
.savebar.show{display:flex}
.savebar .msg{flex:1;min-width:0;font-size:12.5px;color:var(--ink2);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer}
.savebar .msg b{display:block;color:var(--ink);font:700 13px var(--disp)}
body.dirty{padding-bottom:calc(74px + 70px + env(safe-area-inset-bottom))}
body.dirty .refresh-fab{display:none}
@media(min-width:900px){.savebar{left:216px;bottom:0;padding:14px 34px}body.dirty{padding-bottom:84px}}
</style>
<div id="tabSentinel" style="height:1px"></div>
<div class="tabwrap" id="tabwrap"><h1 class="stg-h1">Settings</h1><div class="tabbar" id="tabs">${TABS.map(([id, l]) => `<button id="tb-${id}" onclick="showTab('${id}')">${l}</button>`).join('')}</div></div>

${pane('plan', true)}
${sec('time', 'Time zone and clock', 'Every day, streak and deadline is counted in this zone.', `
<div class="card">
  <div class="fg"><label class="fld" for="s-tz">Time zone</label><select id="s-tz"></select></div>
  <div class="fg"><label class="fld">Clock</label><div class="seg-ctl" id="clkSeg"><button data-c="0">12-hour · 9:30 PM</button><button data-c="1">24-hour · 21:30</button></div></div>
</div>`)}
${sec('plan', 'Plan', 'Phases with dates. The first start and the last end are your plan window. A <b>low load</b> phase drops the goals and uses the low-load layout.', `
<div class="card">
  <div id="phases"></div>
  <button class="addbtn" onclick="addPhase()">＋ Add phase</button>
  <div class="regrow"><div class="hint">Saving a change to the plan or to a category rewrites the goals of today and every future day. Days with logged work are never touched.</div><button class="ghost sm" onclick="regen()">↻ Rewrite future goals</button></div>
</div>`)}
${sec('cats', 'Categories', 'What you grind, with a daily goal for weekdays, weekends and low-load days. LeetCode and Applications carry extra tools and keep their names.', `
<div class="card">
  <div id="cats"></div>
  <button class="addbtn" onclick="addCat()">＋ Add category</button>
  <div class="hint">Turning a category off hides it everywhere. History is kept, so it can come back any time.</div>
</div>`)}

${pane('schedule')}
${sec('layouts', 'Grind layouts', 'A layout is up to four grind blocks. The Today page switches between layouts; one is the default.', `
<div class="card">
  <div id="layouts"></div>
  <div class="row" style="margin-top:12px;gap:8px"><input id="layNew" placeholder="New layout name, e.g. weekend" style="flex:1;min-width:0" onkeydown="if(event.key==='Enter')addLayout()"><button class="sm" onclick="addLayout()">＋ Add layout</button></div>
  <div id="layAssign">
    <div class="fg"><label class="fld">Weekday overrides</label><div id="byDow" class="row" style="flex-wrap:wrap;gap:8px"></div></div>
    <div class="fg"><label class="fld" for="lowSel">Low-load days use</label><select id="lowSel" style="width:auto"></select></div>
  </div>
  <div class="hint" id="layHint"></div>
</div>`)}
${sec('sides', 'Side tasks', 'Recurring blocks that are not grind: gym, a class, a shift. Grind blocks step out of their way.', `
<div class="card">
  <div id="sides"></div>
  <button class="addbtn" onclick="addSide()">＋ Add side task</button>
</div>`)}

${pane('today')}
${sec('modules', 'Modules', 'Turn off what you do not use. The tab, its routes and its stats disappear; nothing is deleted.', `
<div class="card">
  <div id="modToggles"></div>
  <div class="hint" id="modHint" style="margin-top:4px"></div>
  <div class="fg"><label class="fld" for="s-target">Daily grind target (hours)</label><input id="s-target" type="number" min="1" max="16" step="0.5" style="width:140px"><div class="hint">Drives the heat map and the "target hit" stats. 6 is a full day of focus.</div></div>
</div>`)}
${sec('today', 'Today page', 'The header style and the focus timer.', `
<div class="card">
  <div class="fg"><label class="fld">Header style</label><div class="seg-ctl" id="layoutSeg"><button data-l="classic">Classic</button><button data-l="refined">Refined</button></div><div class="hint">Refined puts the date, phase, mode and off-day controls in one bordered header card.</div></div>
  <div class="fg"><label class="fld">Focus timer</label><div class="fgrid"><div><div class="gl" style="margin:0"><div><label>Default (min)</label><input id="s-timer" type="number" min="5" max="120"></div></div></div><div><div class="gl" style="margin:0;grid-template-columns:1fr"><div><label>Choices</label><input id="s-topts" placeholder="10, 15, 20, 25, 50"></div></div></div></div></div>
</div>`)}
${sec('bg', 'Background', 'What sits behind every page. The glow is the default; Plain is the quietest.', `
<div class="card"><div class="picks" id="bgPicks"></div></div>`)}
${sec('clock', 'Day clock', 'The 12-hour dial on Today that shows your blocks around the face.', `
<div class="card">
  <div class="fg"><label class="fld">Design</label><div class="picks" id="ckDesigns"></div></div>
  <div class="fg"><label class="fld">Size</label><div class="rangerow"><input id="ck-size" type="range" min="280" max="920" step="20"><span class="num"><span id="ckSizeVal"></span>px</span></div></div>
  <div class="fg"><label class="fld">Number size</label><div class="rangerow"><input id="ck-font" type="range" min="9" max="18" step="1"><span class="num" id="ckFontVal"></span></div></div>
  <div class="fg"><label class="fld">Grind colour</label><div class="colorrow"><input id="ck-accent" type="color" aria-label="grind colour"><span class="tiny" id="ck-accent-state"></span><button class="ghost sm" onclick="D.clock.accent='';renderClockCtl();mark()">Use the design colour</button></div></div>
</div>`)}
${sec('mclock', 'Top-right clock', 'The small clock that follows you on every page. It previews here as you change it.', `
<div class="card">
  <div class="fg"><label class="fld">Design</label><div class="picks" id="mcDesigns"></div></div>
  <div class="fg"><label class="fld">Size</label><div class="rangerow"><input id="mc-font" type="range" min="10" max="22" step="1"><span class="num" id="mcFontVal"></span></div></div>
  <div class="fg"><label class="fld">Accent colour</label><div class="colorrow"><input id="mc-accent" type="color" aria-label="accent colour"><span class="tiny" id="mc-accent-state"></span><button class="ghost sm" onclick="D.mclock.accent='';renderMClockCtl();mark()">Default colour</button></div></div>
</div>`)}

${pane('sharing')}
${sec('booking', 'Booking', 'A public page where friends grab your free time. Whatever is left of the windows below after grind blocks and side tasks is bookable.', `
<div class="card">
  <div class="togrow"><div class="grow"><b>Friends can book</b><div class="tiny">Your public booking page, under your handle.</div></div><div class="toggle" id="bookT" role="switch" tabindex="0" aria-label="Friends can book"></div></div>
  <div class="fg"><label class="fld">Bookable windows</label><div id="avail"></div><button class="addbtn" onclick="addAvail()">＋ Add window</button></div>
  <div class="fg"><label class="fld">Days visible ahead</label><div class="rangerow"><input id="s-bdays" type="range" min="1" max="14" step="1"><span class="num" id="bdVal"></span></div></div>
  <div class="fg"><label class="fld">Limits</label><div class="gl" style="grid-template-columns:1fr 1fr;margin:0"><div><label>Requests per phone per day</label><input id="s-bdev" type="number" min="1" max="10"></div><div><label>People per slot</label><input id="s-bslot" type="number" min="1" max="20"></div></div></div>
  <div class="fg"><label class="fld" for="s-bdur">Session lengths (minutes)</label><input id="s-bdur" placeholder="30, 60, 120, 180"><div class="hint">Comma separated. Friends pick one when they book.</div></div>
</div>`)}
${sec('share', 'Shared progress', 'A read-only copy of your Progress tab that friends open with a PIN you set. They cannot change anything.', `
<div class="card">
  ${kv('shareUrl', 'Link')}
  <div id="shareState" class="hint"></div>
  <div class="fg"><label class="fld" for="sharePin">Share PIN</label><div class="row" style="flex-wrap:wrap;gap:8px"><input id="sharePin" type="password" inputmode="numeric" placeholder="at least 4 characters" style="flex:1;min-width:150px"><button class="pri sm" onclick="saveSharePin()">Set now</button><button class="rose sm" id="shareOffBtn" onclick="shareOff()">Turn off</button></div><div class="hint">The PIN applies at once. Changing it signs every friend out.</div></div>
  <div class="fg"><label class="fld" for="shareTitle">Title friends see</label><input id="shareTitle" maxlength="60" placeholder="My grind"></div>
  <div class="fg"><label class="fld">What they can see</label>
    ${tog('shOverview', 'Overview', 'streak, pace, records, off-day count')}
    ${tog('shLc', '🧩 LeetCode', 'averages, trends, charts')}
    ${tog('shGrind', '🔥 Grind', 'hours, heatmap, where time went')}
    ${tog('shJobs', '📨 Jobs', 'funnel and platforms, no company names')}
    ${tog('shLcNames', 'LeetCode problem names', 'the per-day history of what you attempted')}
    ${tog('shFriends', '🎮 Friend time', 'names of your friends and hours with each')}
    ${tog('shOffReasons', 'Off-day reasons', 'why you rested, the count shows either way')}
  </div>
</div>`)}
${sec('calendar', 'Google Calendar', 'Subscribe to this feed in Google Calendar (Settings → Add calendar → From URL). Google refreshes it every few hours.', `
<div class="card">
  ${kv('icsUrl', 'Feed link')}
  <div class="fg"><button class="rose sm" onclick="regenIcs()">Regenerate link (if leaked)</button></div>
</div>`)}

${pane('api')}
${sec('platforms', 'Job platforms', 'The dropdown on the Jobs tab. Anything not listed is filed under "Other".', `
<div class="card">
  <div class="row" id="platChips" style="flex-wrap:wrap;gap:8px"></div>
  <div class="row" style="margin-top:14px;gap:8px"><input id="platNew" placeholder="Add a platform, e.g. Simplify" onkeydown="if(event.key==='Enter')addPlat()"><button class="sm" onclick="addPlat()">Add</button></div>
</div>`)}
${sec('api', 'Agent API · job tracker', 'An AI agent (or any script) gets full access to the Jobs tab with this key: read, add, edit, change status and delete. Adding bumps that day’s counter, deleting takes it back down.', `
<div class="card">
  ${kv('jobsEp', 'Endpoint')}
  ${kv('apiKey', 'API key')}
  <div class="fg"><label class="fld" for="agentSnip">Instruction for your agent (paste into its CLAUDE.md)</label><textarea id="agentSnip" class="snip" readonly rows="14"></textarea></div>
  <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="sm" onclick="navigator.clipboard.writeText($('agentSnip').value);toast('Snippet copied')">Copy snippet</button><span class="grow"></span><button class="rose sm" onclick="regenKey()">Regenerate key</button></div>
</div>`)}
${sec('read', 'Read-only API · for Claude', 'Lets Claude read your LeetCode log, your job applications and your progress. <b>Read only</b>: this key cannot add, change or delete anything, and it never returns your problem notes. Works in Claude Code and in claude.ai chat.', `
<div class="card">
  <div class="hint" style="margin:0 0 4px">The URLs below contain the key, so treat one like a password. Anyone holding it can read every job row and your whole LeetCode history. Regenerate below if one ever gets loose.</div>
  ${kv('readKey', 'Read key')}
  ${kv('readLc', 'LeetCode URL')}
  ${kv('readJb', 'Jobs URL')}
  ${kv('readPr', 'Progress URL')}
  <div class="fg"><label class="fld" for="browserSnip">For Claude chat in a browser (paste into a Claude Project’s instructions)</label><textarea id="browserSnip" class="snip" readonly rows="12"></textarea><div class="row" style="margin-top:8px"><button class="sm" onclick="navigator.clipboard.writeText($('browserSnip').value);toast('Copied for browser Claude')">Copy</button></div></div>
  <div class="fg"><label class="fld" for="ccSnip">For Claude Code (paste into its CLAUDE.md)</label><textarea id="ccSnip" class="snip" readonly rows="10"></textarea><div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap"><button class="sm" onclick="navigator.clipboard.writeText($('ccSnip').value);toast('Copied for Claude Code')">Copy</button><span class="grow"></span><button class="rose sm" onclick="regenReadKey()">Regenerate read key</button></div></div>
</div>`)}

${pane('account')}
${sec('account', 'Account', '', `
<div class="card acct">
  <div class="idrow"><span id="accAvatar"></span><div class="who"><b id="accEmail"></b><div class="tiny">Handle: <span id="accHandle" class="num"></span> · <span id="accName"></span></div></div><button class="sm" onclick="toggleProfile()">✎ Edit profile</button></div>
  <div class="acrow" id="profileEd" style="display:none">
    <div class="acl"><span class="tile">🪪</span><div><b>Profile</b><p>Your display name shows on your shared progress and booking pages. The handle is fixed, it is part of those links.</p></div></div>
    <div class="acr"><label class="fld" for="p-name">Display name</label><div class="row" style="gap:8px;flex-wrap:wrap"><input id="p-name" maxlength="40" style="flex:1;min-width:160px"><button class="pri sm" onclick="saveProfile()">Save name</button><button class="ghost sm" onclick="toggleProfile()">Cancel</button></div></div>
  </div>
  <div class="acrow">
    <div class="acl"><span class="tile">⬇</span><div><b>Export my data</b><p>One JSON file with every table. Keys and PINs are never included.</p></div></div>
    <div class="acr acr-end"><a class="btnlink" href="/api/export">Download export</a></div>
  </div>
  <div class="acrow">
    <div class="acl"><span class="tile">🔒</span><div><b>Change password</b><p>Choose a strong password to keep your account secure. Every other signed-in device is signed out.</p></div></div>
    <div class="acr"><div class="fgrid"><div><label class="fld" for="p-cur">Current password</label><div class="pwwrap"><input id="p-cur" type="password" autocomplete="current-password" placeholder="Enter current password"><button type="button" data-eye="p-cur" aria-label="show password">Show</button></div></div>
      <div><label class="fld" for="p-new">New password</label><div class="pwwrap"><input id="p-new" type="password" autocomplete="new-password" placeholder="At least 10 characters" oninput="pwMeter(this.value)"><button type="button" data-eye="p-new" aria-label="show password">Show</button></div><div class="meter" id="pwMeter"><i></i><i></i><i></i><i></i><span>Use 10+ characters</span></div></div></div>
      <button class="pri sm" style="margin-top:14px" onclick="changePw()">Update password ›</button></div>
  </div>
  <div class="acrow">
    <div class="acl"><span class="tile">📥</span><div><b>Import a LockIn export</b><p>Replace all your data with the contents of an export file.</p></div></div>
    <div class="acr"><label class="drop"><input type="file" id="impFile" accept="application/json,.json" onchange="impPick(this)"><span class="tile">📄</span><div><b id="impName">Choose file</b><div class="tiny" id="impSub">No file chosen</div></div></label>
      <div class="note">ℹ️ <span>This replaces every table with the file. <b>Export first if you are unsure.</b></span></div>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><input id="p-imp" type="password" placeholder="Your password" style="flex:1;min-width:140px"><button class="rose sm" onclick="importFile()">Replace everything</button></div></div>
  </div>
  <div class="acrow">
    <div class="acl"><span class="tile rose">⏏</span><div><b style="color:var(--rose)">Sign out</b><p>Signs out this device only. Other devices stay signed in.</p></div></div>
    <div class="acr acr-end"><button class="rose outl" onclick="logout()">Sign out</button></div>
  </div>
</div>`)}
${sec('danger', 'Danger zone', 'There is no undo below. Export first if you want a copy.', `
<div class="card acct danger">
  <div class="acrow" style="border-top:0">
    <div class="acl"><span class="tile rose">🗑️</span><div><b style="color:var(--rose)">Delete account</b><p>Removes your account and your entire database. Nothing is kept.</p></div></div>
    <div class="acr"><label class="fld" for="p-del">Confirm with your password</label><div class="row" style="gap:8px;flex-wrap:wrap"><input id="p-del" type="password" placeholder="Your password" style="flex:1;min-width:140px"><button class="rose sm" onclick="delAccount()">Delete everything</button></div></div>
  </div>
</div>`)}
</div>

<div class="savebar" id="savebar">
  <div class="msg" id="sbMsg" onclick="gotoChanged()"></div>
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
const LAYEMO={morning:'\\uD83C\\uDF05',night:'\\uD83C\\uDF19',low:'\\uD83E\\uDEAB',weekend:'\\uD83C\\uDFD6\\uFE0F',sunday:'\\uD83C\\uDFD6\\uFE0F'};
// which draft keys belong to which section, for the change markers and the save bar text
const SEC={time:['tz','clock24'],plan:['phases'],cats:['cats'],layouts:['sched'],sides:['sides'],modules:['modules','grindTarget'],today:['todayLayout','timerDefault','timerOptions'],bg:['bgStyle'],clock:['clock'],mclock:['mclock'],booking:['booking'],share:['share'],platforms:['platforms']};
const TABOF={time:'plan',plan:'plan',cats:'plan',layouts:'schedule',sides:'schedule',modules:'today',today:'today',bg:'today',clock:'today',mclock:'today',booking:'sharing',share:'sharing',platforms:'api'};
const BGS=[['aurora','Glow','two soft lights and a dot grid'],['dots','Grid','the dot grid only'],['plain','Plain','one solid colour']];
function renderBg(){$('bgPicks').innerHTML=BGS.map(([k,n,d])=>'<button class="pick'+(D.bgStyle===k?' on':'')+'" onclick="D.bgStyle=\\''+k+'\\';renderBg();mark()" title="'+d+'"><div class="bgprev '+k+'"></div><span>'+n+'</span></button>').join('');}
const TABN={plan:'Plan',schedule:'Schedule',today:'Today',sharing:'Sharing',api:'Integrations',account:'Account'};
let TAB='plan';
try{history.scrollRestoration='manual';}catch(e){}
// the page header only gets its frosted band once it is actually stuck to the top
function tabStick(){const w=$('tabwrap');if(w)w.classList.toggle('stuck',w.getBoundingClientRect().top<=0.5&&window.scrollY>4);}
document.addEventListener('scroll',tabStick,{passive:true,capture:true});window.addEventListener('resize',tabStick);setInterval(tabStick,300);tabStick();
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
const sw=(sel,on,i,color)=>'<button style="background:'+color+'" class="'+(on?'on':'')+'" onclick="'+sel+'['+i+'].color=\\''+color+'\\';'+(sel==='D.phases'?'renderPhases()':'renderCats()')+';mark()" aria-label="colour '+color+'"></button>';

function draftFrom(S){const sh=S.share||{};return {
tz:S.tz,clock24:!!S.clock24,
phases:S.phases.map(p=>({id:p.id,name:p.name,start_date:p.start_date,end_date:p.end_date,color:p.color,low_load:p.low_load?1:0})),
cats:S.categories.map(c=>({id:c.id,name:c.name,emoji:c.emoji,color:c.color,goal_wd:c.goal_wd,goal_we:c.goal_we,goal_low:c.goal_low,enabled:c.enabled?1:0,builtin:c.builtin||null})),
sides:S.sideTasks.map(t=>({id:t.id,name:t.name,emoji:t.emoji,days:String(t.days).split(',').filter(x=>x!=='').map(Number),start:t.start,end:t.end,date_from:t.date_from||null,date_to:t.date_to||null,enabled:t.enabled?1:0})),
sched:JSON.parse(JSON.stringify(S.sched)),modules:{...S.modules},grindTarget:S.grindTarget,todayLayout:S.todayLayout,bgStyle:S.bgStyle||'aurora',
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
$('modToggles').innerHTML=MODS.map(([k,l,s])=>'<div class="togrow"><div class="grow"><b>'+l+'</b><div class="tiny">'+s+'</div></div><div class="toggle" id="mod-'+k+'" role="switch" tabindex="0" aria-label="'+l+'"></div></div>').join('');
MODS.forEach(([k])=>tg('mod-'+k,()=>!!D.modules[k],v=>{D.modules[k]=v;
if(k==='leetcode'&&v){const c=lcCat();if(c&&!c.enabled){c.enabled=1;renderCats();toast('LeetCode category turned on too');}}}));
num('s-target',()=>D.grindTarget,v=>{D.grindTarget=v;});
seg('layoutSeg','l',D.todayLayout,v=>{D.todayLayout=v;});
num('s-timer',()=>D.timerDefault,v=>{D.timerDefault=v;});
txt('s-topts',()=>D.timerOptions,v=>{D.timerOptions=v;});
renderBg();renderClockCtl();renderMClockCtl();
tg('bookT',()=>D.booking.enabled,v=>{D.booking.enabled=v;});
renderAvail();
$('s-bdays').value=D.booking.days;$('bdVal').textContent=D.booking.days+(D.booking.days===1?' day':' days');
$('s-bdays').oninput=()=>{D.booking.days=+$('s-bdays').value;$('bdVal').textContent=D.booking.days+(D.booking.days===1?' day':' days');mark();};
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
?'<span style="color:var(--mint)">\\u25cf Sharing is on.</span> Anyone with the link and the PIN can read the stats you allow below.'
:'<span style="color:var(--ink3)">\\u25cb Sharing is off.</span> Set a PIN to switch it on.';
$('shareOffBtn').style.display=SHR.isOn?'':'none';
$('icsUrl').value=S.icsUrl;
$('jobsEp').value=S.jobsEndpoint;$('apiKey').value=S.apiKey;
$('readKey').value=S.readKey;
$('readLc').value=S.readEndpoints.leetcode;$('readJb').value=S.readEndpoints.jobs;$('readPr').value=S.readEndpoints.progress;
renderSnips();
const u=S.user||{};
$('accEmail').textContent=u.email||'';$('accHandle').textContent=u.handle||'';$('accName').textContent=u.displayName||'';$('accAvatar').innerHTML=avatar(u.displayName||u.handle||'?');
$('p-name').value=u.displayName||'';}
function toggleProfile(){const el=$('profileEd');el.style.display=el.style.display==='none'?'':'none';if(el.style.display!=='none')$('p-name').focus();}
async function saveProfile(){const name=$('p-name').value.trim();if(!name)return toast('Type a name');
try{await api('/api/auth/profile',{body:{displayName:name}});toast('Name saved');$('profileEd').style.display='none';refreshStatic();}catch(e){toast(String(e))}}
function impPick(inp){const f=inp.files[0];$('impName').textContent=f?f.name:'Choose file';$('impSub').textContent=f?Math.round(f.size/1024)+' KB · ready to import':'No file chosen';}
function pwMeter(v){const m=$('pwMeter');if(!m)return;let n=0;if(v.length>=10)n++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))n++;if(/[0-9]/.test(v))n++;if(/[^A-Za-z0-9]/.test(v))n++;if(v.length<10)n=Math.min(n,1);
m.className='meter '+(n<=1?'weak':n<=2?'mid':'');m.querySelectorAll('i').forEach((i,k)=>i.classList.toggle('on',k<n));
m.querySelector('span').textContent=!v?'Use 10+ characters':v.length<10?(10-v.length)+' more character'+(10-v.length>1?'s':''):n>=3?'Strong':'Add a number or a symbol';}
document.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const i=$(b.dataset.eye);const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show';});
async function refreshStatic(){S=await api('/api/settings');renderStatic();}

// small binders: every control writes into D and calls mark()
function tg(id,get,set){toggle($(id),get());$(id).onclick=()=>{set(!get());toggle($(id),get());mark();};
$(id).onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();$(id).click();}};}
function num(id,get,set){$(id).value=get();$(id).oninput=()=>{set(+$(id).value);mark();};}
function txt(id,get,set){$(id).value=get();$(id).oninput=()=>{set($(id).value);mark();};}
function seg(id,attr,cur,set){document.querySelectorAll('#'+id+' button').forEach(b=>{b.classList.toggle('on',b.dataset[attr]===cur);
b.onclick=()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));set(b.dataset[attr]);mark();};});}

// ---- phases ----
function renderPhases(){const PH=D.phases;
$('phases').innerHTML=PH.length?PH.map((p,i)=>'<div class="item" style="--ac:'+p.color+'"><div class="ihead"><input class="nm" value="'+esc2(p.name)+'" oninput="D.phases['+i+'].name=this.value;mark()" placeholder="Phase name" aria-label="Phase name">'
+'<button class="sm lowbtn '+(p.low_load?'on':'')+'" onclick="D.phases['+i+'].low_load=D.phases['+i+'].low_load?0:1;renderPhases();mark()">'+(p.low_load?'\\uD83E\\uDEAB Low load':'Normal')+'</button>'
+'<button class="xbtn" onclick="D.phases.splice('+i+',1);renderPhases();mark()" aria-label="Remove phase">\\u2715</button></div>'
+'<div class="ibody"><div class="rng"><input type="date" value="'+p.start_date+'" onchange="D.phases['+i+'].start_date=this.value;mark()" aria-label="start"><span class="tiny">to</span><input type="date" value="'+p.end_date+'" onchange="D.phases['+i+'].end_date=this.value;mark()" aria-label="end"></div></div>'
+'<div class="ifoot"><span class="cklab" style="margin:0;flex:none">Colour</span><div class="sw">'+PAL.map(c=>sw('D.phases',p.color===c,i,c)).join('')+'</div></div></div>').join('')
:'<div class="empty">No plan yet.<br><span class="tiny">Add a phase to get the race bar, pace and the finish-line forecast.</span></div>';}
function addPhase(){const PH=D.phases;const last=PH[PH.length-1];const d=new Date((last?last.end_date:new Date().toISOString().slice(0,10))+'T12:00:00Z');if(last)d.setUTCDate(d.getUTCDate()+1);
const s=d.toISOString().slice(0,10);const e=new Date(d);e.setUTCDate(e.getUTCDate()+27);
PH.push({id:null,name:'Phase '+(PH.length+1),start_date:s,end_date:e.toISOString().slice(0,10),color:PAL[PH.length%PAL.length],low_load:0});renderPhases();mark();
const ins=document.querySelectorAll('#phases input.nm');const last2=ins[ins.length-1];if(last2){last2.focus();last2.select();}}
async function regen(){if(!confirm('Rewrite the goals of today and every future day from the category values? Days with logged work are kept.'))return;
try{const j=await api('/api/goals/regenerate',{body:{}});toast('Goals rewritten, '+j.touched+' rows');}catch(e){toast(String(e))}}

// ---- categories ----
function renderCats(){
$('cats').innerHTML=D.cats.map((c,i)=>'<div class="item'+(c.enabled?'':' dim')+'" style="--ac:'+c.color+'"><div class="ihead"><span class="tile">'+c.emoji+'</span>'
+'<input class="nm" value="'+esc2(c.name)+'" oninput="D.cats['+i+'].name=this.value;mark()"'+(c.builtin?' readonly':'')+' placeholder="Category name" aria-label="Category name">'
+'<div class="toggle'+(c.enabled?' on':'')+'" role="switch" tabindex="0" aria-checked="'+(!!c.enabled)+'" aria-label="'+esc2(c.name)+' on" onclick="tgCat('+i+')" onkeydown="if(event.key===\\' \\'||event.key===\\'Enter\\'){event.preventDefault();tgCat('+i+')}"></div></div>'
+'<div class="ibody"><div class="cklab">Daily goal</div><div class="gl"><div><label>Weekday</label><input type="number" min="0" max="50" value="'+c.goal_wd+'" oninput="D.cats['+i+'].goal_wd=+this.value;mark()"></div>'
+'<div><label>Weekend</label><input type="number" min="0" max="50" value="'+c.goal_we+'" oninput="D.cats['+i+'].goal_we=+this.value;mark()"></div>'
+'<div><label>Low load</label><input type="number" min="0" max="50" value="'+c.goal_low+'" oninput="D.cats['+i+'].goal_low=+this.value;mark()"></div></div>'
+(c.builtin?'<div class="hint">Built in: '+(c.builtin==='leetcode'?'the LeetCode tab, timer records and problem notes.':'the Jobs tracker, every logged application counts here.')+'</div>':'')+'</div>'
+(c.builtin?'':'<div class="ifoot"><div class="em">'+CEMO.map(e=>'<button class="'+(c.emoji===e?'on':'')+'" onclick="D.cats['+i+'].emoji=this.textContent;renderCats();mark()" aria-label="emoji">'+e+'</button>').join('')+'</div><span class="grow"></span><div class="sw">'+PAL.map(col=>sw('D.cats',c.color===col,i,col)).join('')+'</div></div>')
+'</div>').join('');}
function tgCat(i){const c=D.cats[i];c.enabled=c.enabled?0:1;
if(c.builtin==='leetcode'){D.modules.leetcode=!!c.enabled;const t=$('mod-leetcode');if(t)toggle(t,!!c.enabled);toast(c.enabled?'LeetCode tab turned on too':'LeetCode tab turned off too');}
renderCats();mark();}
function addCat(){D.cats.push({id:null,name:'',emoji:CEMO[2],color:PAL[D.cats.length%PAL.length],goal_wd:1,goal_we:0,goal_low:0,enabled:1,builtin:null});renderCats();mark();
const inputs=document.querySelectorAll('#cats input.nm');const last=inputs[inputs.length-1];if(last)last.focus();}

// ---- layouts ----
function renderLayouts(){const LAY=D.sched;
const names=Object.keys(LAY.layouts);
$('layouts').innerHTML=names.map(n=>'<div class="item" style="--ac:'+(n===LAY.default?'var(--ember)':n==='low'?'var(--violet)':'var(--line2)')+'"><div class="ihead"><span class="tile">'+(LAYEMO[n]||'\\uD83D\\uDDD3\\uFE0F')+'</span><b class="nm">'+esc2(n)+'</b>'
+(n===LAY.default?'<span class="pill defpill">default</span>':'<button class="ghost sm" onclick="D.sched.default=\\''+q(n)+'\\';renderLayouts();mark()">Make default</button>')
+(names.length>1?'<button class="xbtn" onclick="delLayout(\\''+q(n)+'\\')" aria-label="Remove layout">\\u2715</button>':'')+'</div>'
+'<div class="ibody">'+LAY.layouts[n].map((b,i)=>'<div class="rng blk"><span class="lbl">Block '+(i+1)+'</span><input type="time" value="'+b[0]+'" onchange="D.sched.layouts[\\''+q(n)+'\\']['+i+'][0]=this.value;mark()" aria-label="start"><span class="tiny">to</span><input type="time" value="'+b[1]+'" onchange="D.sched.layouts[\\''+q(n)+'\\']['+i+'][1]=this.value;mark()" aria-label="end">'
+(LAY.layouts[n].length>1?'<button class="xbtn" onclick="D.sched.layouts[\\''+q(n)+'\\'].splice('+i+',1);renderLayouts();mark()" aria-label="Remove block">\\u2715</button>':'<span style="width:38px;flex:none"></span>')+'</div>').join('')+'</div>'
+(LAY.layouts[n].length<4?'<div class="ifoot"><button class="sm" onclick="D.sched.layouts[\\''+q(n)+'\\'].push([\\'19:00\\',\\'21:00\\']);renderLayouts();mark()">\\uFF0B Add block</button><span class="tiny">up to four</span></div>':'')+'</div>').join('');
const one=names.length<2;$('layAssign').style.display=one?'none':'';
$('layHint').textContent=one?'One layout means every day uses it. Add a second one (a night-owl day, a weekend shape) to assign it to weekdays or to low-load days.':'Weekday overrides beat the default; low-load days always use their own pick.';
$('byDow').innerHTML=DN.map((d,i)=>'<label class="tiny" style="display:flex;flex-direction:column;gap:4px;color:var(--ink2)">'+d+'<select onchange="if(this.value)D.sched.byDow['+i+']=this.value;else delete D.sched.byDow['+i+'];mark()" style="padding:7px 8px;width:auto"><option value="">default</option>'+names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.byDow[i]===n?' selected':'')+'>'+esc2(n)+'</option>').join('')+'</select></label>').join('');
$('lowSel').innerHTML=names.map(n=>'<option value="'+esc2(n)+'"'+(LAY.low===n?' selected':'')+'>'+esc2(n)+'</option>').join('');
$('lowSel').onchange=()=>{D.sched.low=$('lowSel').value;mark();};}
function addLayout(){const n=$('layNew').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);if(!n)return toast('Letters and numbers only');if(D.sched.layouts[n])return toast('Already exists');
D.sched.layouts[n]=[['09:00','12:00']];$('layNew').value='';renderLayouts();mark();}
function delLayout(n){const LAY=D.sched;delete LAY.layouts[n];if(LAY.default===n)LAY.default=Object.keys(LAY.layouts)[0];if(LAY.low===n)LAY.low=LAY.default;for(const d of Object.keys(LAY.byDow))if(LAY.byDow[d]===n)delete LAY.byDow[d];renderLayouts();mark();}

// ---- side tasks ----
function renderSides(){const SD=D.sides;
const EM=S.sideEmoji||['\\uD83D\\uDCCC'];
$('sides').innerHTML=SD.length?SD.map((t,i)=>'<div class="item'+(t.enabled?'':' dim')+'" style="--ac:var(--mint)"><div class="ihead"><span class="tile">'+t.emoji+'</span><input class="nm" value="'+esc2(t.name)+'" oninput="D.sides['+i+'].name=this.value;mark()" placeholder="Gym, class, shift\\u2026" aria-label="Side task name">'
+'<div class="toggle'+(t.enabled?' on':'')+'" role="switch" tabindex="0" aria-checked="'+(!!t.enabled)+'" aria-label="on" onclick="D.sides['+i+'].enabled=D.sides['+i+'].enabled?0:1;renderSides();mark()"></div>'
+'<button class="xbtn" onclick="D.sides.splice('+i+',1);renderSides();mark()" aria-label="Remove side task">\\u2715</button></div>'
+'<div class="ibody"><div class="cklab">Days</div><div class="chips" style="margin-top:6px">'+DN.map((d,di)=>'<button class="'+(t.days.includes(di)?'on':'')+'" onclick="tgDay('+i+','+di+')">'+d+'</button>').join('')+'</div>'
+'<div class="cklab">Time</div><div class="rng" style="margin-top:6px"><input type="time" value="'+t.start+'" onchange="D.sides['+i+'].start=this.value;mark()" aria-label="start"><span class="tiny">to</span><input type="time" value="'+t.end+'" onchange="D.sides['+i+'].end=this.value;mark()" aria-label="end"></div>'
+'<div class="cklab">Only between (optional)</div><div class="rng" style="margin-top:6px"><input type="date" value="'+(t.date_from||'')+'" onchange="D.sides['+i+'].date_from=this.value||null;mark()" aria-label="from"><span class="tiny">and</span><input type="date" value="'+(t.date_to||'')+'" onchange="D.sides['+i+'].date_to=this.value||null;mark()" aria-label="to"></div><div class="hint" style="margin-top:6px">Empty dates = every week.</div></div>'
+'<div class="ifoot"><div class="em">'+EM.map(e=>'<button class="'+(t.emoji===e?'on':'')+'" onclick="D.sides['+i+'].emoji=this.textContent;renderSides();mark()" aria-label="emoji">'+e+'</button>').join('')+'</div><span class="grow"></span><button class="sm" onclick="cloneSide('+i+')" title="the same task at another time of day">\\uFF0B Another time</button></div></div>').join('')
:'<div class="empty">Nothing yet.<br><span class="tiny">Gym, a class, a shift: add what takes real time each week.</span></div>';}
function tgDay(i,d){const t=D.sides[i];const k=t.days.indexOf(d);if(k<0)t.days.push(d);else t.days.splice(k,1);t.days.sort();renderSides();mark();}
function addSide(){D.sides.push({id:null,name:'',emoji:(S.sideEmoji||['\\uD83D\\uDCCC'])[0],days:[1,3,5],start:'19:00',end:'20:30',date_from:null,date_to:null,enabled:1});renderSides();mark();
const inputs=document.querySelectorAll('#sides input.nm');const last=inputs[inputs.length-1];if(last)last.focus();}
// gym twice a day: a second row with the same name and days, so both show on the timeline
function cloneSide(i){const t=D.sides[i];const [h,m]=t.end.split(':').map(Number);const p=n=>String(Math.min(23,n)).padStart(2,'0')+':'+String(m).padStart(2,'0');
D.sides.splice(i+1,0,{id:null,name:t.name,emoji:t.emoji,days:[...t.days],start:p(h+1),end:p(h+2),date_from:t.date_from,date_to:t.date_to,enabled:1});renderSides();mark();}

// ---- booking windows ----
function renderAvail(){const AVW=D.booking.avail;$('avail').innerHTML=AVW.map((a,i)=>'<div class="rng"><input type="time" value="'+a[0]+'" onchange="D.booking.avail['+i+'][0]=this.value;mark()" aria-label="from"><span class="tiny">to</span><input type="time" value="'+a[1]+'" onchange="D.booking.avail['+i+'][1]=this.value;mark()" aria-label="to"><button class="xbtn" onclick="D.booking.avail.splice('+i+',1);renderAvail();mark()" aria-label="Remove window">\\u2715</button></div>').join('')||'<div class="hint" style="margin:0">No windows: nothing is bookable.</div>';}
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
$('ckDesigns').innerHTML=Object.keys(CKD).map(k=>'<button class="pick'+(C.design===k?' on':'')+'" onclick="D.clock.design=\\''+k+'\\';renderClockCtl();mark()">'+ckPreview(k)+'<span>'+CKNAMES[k]+'</span></button>').join('');
$('ck-size').value=C.size;$('ckSizeVal').textContent=C.size;
$('ck-font').value=C.font;$('ckFontVal').textContent=C.font;
$('ck-accent').value=C.accent||'#FF6B35';$('ck-accent-state').textContent=C.accent?'custom '+C.accent:'design colour';
$('ck-size').oninput=()=>{D.clock.size=+$('ck-size').value;$('ckSizeVal').textContent=D.clock.size;mark();};
$('ck-font').oninput=()=>{D.clock.font=+$('ck-font').value;$('ckFontVal').textContent=D.clock.font;mark();};
$('ck-accent').oninput=()=>{D.clock.accent=$('ck-accent').value;$('ck-accent-state').textContent='custom '+D.clock.accent;mark();};}
const MCNAMES={pill:'Pill',led:'LED',analog:'Analog',flip:'Flip',ring:'Day ring'};
let mcInt=null;
function mcPreview(){window.__MCLOCK={design:D.mclock.design,font:D.mclock.font,accent:D.mclock.accent};}
function renderMClockCtl(){const M=D.mclock;
$('mcDesigns').innerHTML=Object.keys(MCNAMES).map(k=>'<button class="pick'+(M.design===k?' on':'')+'" onclick="D.mclock.design=\\''+k+'\\';renderMClockCtl();mark()"><span class="mc-prev" data-d="'+k+'"></span><span>'+MCNAMES[k]+'</span></button>').join('');
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
'<span class="chip" style="padding:7px 8px 7px 14px">'+esc(p)+'<button class="ghost sm" style="padding:2px 6px;margin-left:2px" onclick="D.platforms.splice('+i+',1);renderPlats();mark()" aria-label="remove '+esc(p)+'">\\u2715</button></span>').join('')
+'<span class="chip" style="opacity:.6;padding:7px 14px">Other <span class="tiny">always available</span></span>';}
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
const body={settings:{timezone:D.tz,clock24:D.clock24,modules:D.modules,grindTarget:+D.grindTarget||6,todayLayout:D.todayLayout,bgStyle:D.bgStyle,
timerDefault:+D.timerDefault,timerOptions:nums(D.timerOptions),
clockDesign:D.clock.design,clockSize:+D.clock.size,clockFont:+D.clock.font,clockAccent:D.clock.accent||'',
mclockDesign:D.mclock.design,mclockFont:+D.mclock.font,mclockAccent:D.mclock.accent||'',
bookingEnabled:D.booking.enabled,bookingDays:+D.booking.days,availability:D.booking.avail,bookingPerDevice:+D.booking.perDevice,bookingPerSlot:+D.booking.perSlot,bookingDurations:nums(D.booking.durations),
shareTitle:sh.title,shareOverview:sh.overview,shareLc:sh.lc,shareGrind:sh.grind,shareJobs:sh.jobs,shareLcNames:sh.lcNames,shareFriends:sh.friends,shareOffReasons:sh.offReasons,
jobPlatforms:D.platforms,sched:D.sched},
phases:D.phases,categories:D.cats,sideTasks:D.sides};
// the nav, the time zone and the header style live in the page shell, so those need a fresh page
const needReload=['modules','tz','clock24','todayLayout','bgStyle'].some(k=>snap(k)!==B[k]);
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
$('p-cur').value='';$('p-new').value='';pwMeter('');toast('Password changed');}
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
