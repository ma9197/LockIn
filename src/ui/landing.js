import { shell } from './theme.js';

// The public home page. Every panel is a working mock of the real UI, built from the same CSS
// classes the app uses, driven by sample data on the client. Nothing here touches the server.
// Page-script rules: no backticks, no ${ } and no quotes inside inline onclick attributes.

const CF = 289;
const ring = (key, emoji, label, done, goal, color) => {
  const pct = Math.min(1, done / goal), hit = done >= goal;
  return `<div class="ld-ring" data-k="${key}" data-goal="${goal}" data-color="${color}" style="text-align:center">
<div class="tiny" style="font:700 11px var(--disp);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">${emoji} ${label}</div>
<div class="ring" style="width:96px;height:96px"><svg width="96" height="96" viewBox="0 0 112 112">
<circle cx="56" cy="56" r="46" fill="none" stroke="var(--surface2)" stroke-width="8"/>
<circle class="arc" cx="56" cy="56" r="46" fill="none" stroke="${hit ? 'var(--mint)' : color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${CF}" stroke-dashoffset="${CF}" data-off="${CF * (1 - pct)}" style="transition:stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1),stroke .3s"/>
</svg><div class="val"><b class="num" style="font-size:26px">${done}</b><span>OF ${goal}</span></div></div>
<div class="extra">${hit ? 'GOAL HIT ✓' : '&nbsp;'}</div>
<div class="row" style="justify-content:center;gap:10px;margin-top:2px"><button class="sm" data-bump="${key}" data-d="-1" aria-label="minus">−</button><button class="sm pri" style="padding:6px 18px" data-bump="${key}" data-d="1" aria-label="plus">+</button></div></div>`;
};

const RAIL = { grind: '#FF6B35', free: '#5EA2FF', side: '#3DDC97' };
const tl = (a, b, dur, kind, emoji, label, sub) => `<div class="tl2-item"><div class="tl2-rail"><span class="bub">${a}</span><div class="tl2-line" style="--rk:${RAIL[kind]}"><span class="tl2-dur">${dur}</span></div><span class="bub">${b}</span></div>
<div class="tl2-body"><div class="tl2-head"><span>${emoji}</span><span class="lab">${label}</span></div><div class="tl2-sub">${sub}</div></div></div>`;

// plan: 4 phases over 112 days, today is day 14
const PH = [['#5EA2FF', 28], ['#FF6B35', 42], ['#9B6EF3', 7], ['#3DDC97', 35]];
const race = () => { let out = '', i = 0; for (const [c, n] of PH) for (let k = 0; k < n; k++, i++) out += `<div class="race-seg ${i < 13 ? 'past' : i === 13 ? 'today' : ''}" style="--seg:${c}"></div>`; return out; };

const LC = [
  ['medium', 'Coin Change', 2, 2, 31], ['easy', 'Two Sum', 1, 1, 9], ['medium', 'Longest Substring Without Repeating', 1, 1, 22],
  ['hard', 'LRU Cache', 1, 0, 25], ['medium', 'Number of Islands', 2, 1, 18], ['easy', 'Valid Parentheses', 1, 1, 7],
];
const OUTB = { 0: ['✕', 'open', 'var(--ember2)'], 1: ['✓', 'solved', 'var(--mint)'], 2: ['⚡', 'slow', 'var(--violet)'] };
const outb = v => `<span class="outb" style="background:${OUTB[v][2]}22;color:${OUTB[v][2]}">${OUTB[v][0]} ${OUTB[v][1]}</span>`;
const lcRow = ([d, n, t, o, m]) => `<div class="lcrow"><span class="diff ${d}">${d.toUpperCase()}</span><span class="grow" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n}</span><span class="tiny num">×${t}</span>${outb(o)}<b class="num" style="font-size:12px;min-width:34px;text-align:right">${m}m</b></div>`;

const JOBS = [['Stripe', 'Software Engineer, New Grad', 'LinkedIn', 'interview'], ['Datadog', 'SWE Intern → FT', 'Referral', 'oa'],
  ['Cloudflare', 'Systems Engineer I', 'Company site', 'applied'], ['Figma', 'Early Career Engineer', 'Handshake', 'offer'],
  ['Ramp', 'Backend Engineer', 'LinkedIn', 'rejected'], ['Notion', 'Software Engineer, 2027', 'Company site', 'applied']];
const STAT = { applied: ['Applied', '#5EA2FF'], oa: ['OA', '#FFB347'], interview: ['Interview', '#9B6EF3'], offer: ['Offer', '#3DDC97'], rejected: ['Rejected', '#FF5D73'] };
const jobCard = (j, i) => `<div class="jcard" style="display:block"><div class="row" style="align-items:flex-start;gap:8px"><div class="grow" style="min-width:0"><b style="display:block">${j[0]}</b><div class="tiny" style="margin-top:2px">${j[1]}</div><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><span class="chip" style="padding:3px 9px;font-size:11px">${j[2]}</span><span class="tiny">Sep ${8 - i}</span></div></div>
<select data-job="${i}" style="width:auto;padding:6px 8px;font-size:12px">${Object.keys(STAT).map(k => `<option value="${k}"${k === j[3] ? ' selected' : ''}>${STAT[k][0]}</option>`).join('')}</select></div></div>`;

const DOW = [['Sun', 2.1], ['Mon', 5.4], ['Tue', 6.2], ['Wed', 5.8], ['Thu', 4.9], ['Fri', 5.1], ['Sat', 3.0]];
const heat = () => { let s = 7, out = ''; for (let i = 0; i < 84; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = (s >> 8) % 7; const dow = i % 7; const a = i > 76 ? 0 : (dow === 0 || dow === 6 ? [0, .15, .3][v % 3] : [0, .3, .55, .8, 1, .7, .45][v]); out += `<div style="background:${a ? 'rgba(255,107,53,' + (0.15 + a * .85).toFixed(2) + ')' : 'var(--surface2)'}"></div>`; } return out; };

const pj = (emoji, name, done, total, proj, note, col) => `<div class="pj"><div class="pjh"><span>${emoji}</span><b>${name}</b><span class="grow"></span><b class="num">${done}<span class="tiny"> / ${total}</span></b></div>
<div class="pjbar"><i class="pr" style="width:${Math.min(100, proj / total * 100)}%;background:${col}"></i><i style="width:${done / total * 100}%;background:${col}"></i></div>
<div class="pjm"><span><i class="sw" style="background:${col}"></i>done ${done}</span><span><i class="sw pr" style="background:${col}"></i>on pace for <b>${proj}</b></span><span><i class="sw tr"></i>target ${total}</span></div><div class="pjn">${note}</div></div>`;

const STEP_NAMES = ['Name & handle', 'Time zone', 'Plan phases', 'Grind blocks', 'Categories & goals', 'Side tasks', 'Modules'];

export const landingPage = () => shell('LockIn · the grind tracker for CS students', null, `
<style>
.liveclock,.refresh-fab{display:none}
.wrap{max-width:1100px;padding:0 16px 40px}
@media(min-width:900px){.wrap{padding:0 34px 60px}}
.ld-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 0}
.ld-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border-radius:12px;font:800 14px var(--disp);color:var(--ink);background:var(--surface2);border:1px solid var(--line2);white-space:nowrap;transition:transform .08s,filter .15s}
.ld-btn:active{transform:scale(.97)}
.ld-btn.pri{background:var(--grad);border:0;color:#1A0D05}
.ld-btn.ghost{background:transparent;border-color:transparent;color:var(--ink2)}
.ld-btn.big{padding:14px 22px;font-size:16px;border-radius:14px}
.ld-hero{display:grid;gap:28px;padding:18px 0 10px;align-items:center}
@media(min-width:900px){.ld-hero{grid-template-columns:1.05fr .95fr;gap:40px;padding:36px 0 30px}}
.ld-eyebrow{display:inline-flex;align-items:center;gap:8px;font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember2);background:#FF6B3514;border:1px solid #FF6B3540;border-radius:99px;padding:6px 12px}
.ld-h1{font:900 clamp(38px,7vw,64px)/1.02 var(--disp);letter-spacing:-.03em;margin:16px 0 14px}
.ld-h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.ld-lead{color:var(--ink2);font-size:17px;line-height:1.6;max-width:540px}
.ld-lead b{color:var(--ink)}
.ld-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.ld-trust{display:flex;gap:6px 14px;flex-wrap:wrap;margin-top:18px;font-size:12.5px;color:var(--ink3)}
.ld-trust span{display:flex;align-items:center;gap:6px}
.ld-trust i{width:6px;height:6px;border-radius:99px;background:var(--mint);flex:none}
.phone{position:relative;width:100%;max-width:400px;margin:0 auto;background:var(--bg);border:1px solid var(--line2);border-radius:30px;padding:14px 12px 16px;box-shadow:0 40px 90px #0009,inset 0 0 0 1px #ffffff08}
.phone:before{content:'';position:absolute;left:50%;top:9px;width:86px;height:5px;border-radius:99px;background:var(--surface3);transform:translateX(-50%)}
.phone .card{margin:8px 0;padding:14px}
.phone h2{margin:14px 0 6px}
.ld-dh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px}
.ld-dh b{font:800 18px var(--disp)}
.ld-rings{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.ld-tmr{display:flex;align-items:center;gap:14px}
.ld-tmr .tring{width:118px;height:118px;flex:none}
.ld-tmr .tring .tv{font-size:28px}
.ld-tmr .tring .tsub{font-size:11px}
.ld-tmr .btns{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
.ld-tmr .btns button{width:100%}
.phone .tl2{gap:14px}
.phone .tl2-item{grid-template-columns:84px 1fr;gap:10px}
.phone .tl2-rail{min-width:84px}
.phone .tl2-line{min-height:22px}
.ld-sec{padding:44px 0 10px}
.ld-h2{font:900 clamp(26px,4.5vw,40px)/1.1 var(--disp);letter-spacing:-.02em;margin:8px 0 10px;color:var(--ink);text-transform:none}
.ld-kick{font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember)}
.ld-sub{color:var(--ink2);font-size:16px;line-height:1.6;max-width:640px}
.ld-tabs{margin:20px 0 12px;position:sticky;top:8px;z-index:6}
.ld-tabs button{padding:9px 14px}
.ld-panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px}
@media(min-width:760px){.ld-panel{padding:22px}}
.ld-two{display:grid;gap:16px}
.ld-two>*{min-width:0}
.ld-panel,.ld-panel .card{min-width:0;overflow:hidden}
.ld-panel .codewrap{max-width:100%}
.ld-panel .codearea{max-width:100%;overflow-x:auto}
@media(min-width:760px){.ld-two{grid-template-columns:1fr 1fr;gap:22px}}
.ld-top .logo{white-space:nowrap}
.ld-dh b{white-space:nowrap}
.ld-ring .tiny{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ld-panel .card{background:var(--surface2);border-color:var(--line2)}
.ld-feat{display:grid;gap:12px;margin-top:22px}
@media(min-width:700px){.ld-feat{grid-template-columns:repeat(3,1fr)}}
.ld-fc{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.ld-fc .n{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:var(--grad);color:#1A0D05;font:900 15px var(--disp);margin-bottom:12px}
.ld-fc b{display:block;font:800 17px var(--disp);margin-bottom:6px}
.ld-fc p{color:var(--ink2);font-size:14px;line-height:1.55}
.ld-steps{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ld-steps span{background:var(--surface2);border:1px solid var(--line2);border-radius:99px;padding:5px 10px;font:700 11.5px var(--disp);color:var(--ink2)}
.ld-steps span b{color:var(--ember);margin-right:4px}
.ld-shape{display:grid;gap:10px;margin-top:22px}
@media(min-width:700px){.ld-shape{grid-template-columns:repeat(3,1fr)}}
.ld-sh{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start}
.ld-sh .e{font-size:22px;flex:none;line-height:1.2}
.ld-sh b{display:block;font:800 15px var(--disp);margin-bottom:3px}
.ld-sh p{color:var(--ink2);font-size:13.5px;line-height:1.5}
.ld-priv{background:linear-gradient(135deg,#FF6B3512,#5EA2FF0e);border:1px solid var(--line2);border-radius:var(--r);padding:22px;margin-top:22px;display:grid;gap:18px}
@media(min-width:760px){.ld-priv{grid-template-columns:1.2fr 1fr;padding:30px}}
.ld-priv ul{list-style:none;display:grid;gap:10px}
.ld-priv li{display:flex;gap:10px;color:var(--ink2);font-size:14px;line-height:1.5}
.ld-priv li i{flex:none;width:22px;height:22px;border-radius:99px;background:#3DDC9722;color:var(--mint);display:inline-flex;align-items:center;justify-content:center;font:800 12px var(--disp);margin-top:2px}
.ld-foot{margin-top:50px;padding:34px 0 10px;border-top:1px solid var(--line);display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}
.ld-foot .tiny a{color:var(--ink3)}
.ld-code{background:#0E121B;border:1px solid var(--line2);border-radius:var(--rs);padding:14px;font:12.5px/1.6 var(--mono);color:#CFE3FF;overflow-x:auto;white-space:pre;margin-top:10px}
.ld-code .k{color:var(--ember2)}.ld-code .s{color:var(--mint)}.ld-code .c{color:var(--ink3)}
.ld-slot{padding:9px 12px;font:700 13px var(--disp)}
.ld-slot.on{background:var(--mint);border-color:var(--mint);color:#062A1C}
.ld-modal{position:fixed;inset:0;background:rgba(5,7,11,.75);backdrop-filter:blur(4px);z-index:80;display:none;align-items:center;justify-content:center;padding:16px}
.ld-modal.on{display:flex}
.rv{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none}}
.ld-stat b{transition:none}
</style>

<header class="ld-top">
  <div class="logo" style="font-size:22px">LOCK<em>IN</em> 🔥</div>
  <div class="row" style="gap:4px"><a href="/login" class="ld-btn ghost" style="padding:10px 12px">Sign in</a><a href="/signup" class="ld-btn pri" style="padding:10px 14px">Create account</a></div>
</header>

<section class="ld-hero">
  <div>
    <span class="ld-eyebrow">🎓 For CS students on the job hunt</span>
    <h1 class="ld-h1">Lock in.<br>Track the grind.<br><em>Land the offer.</em></h1>
    <p class="ld-lead">Daily goals for every category you grind, a focus timer, a <b>LeetCode log</b> that knows a rerun from a solve, an <b>application tracker</b> with a funnel, schedule blocks that step around your gym and classes, streaks, pace against your plan and a finish-line forecast. <b>Phone first.</b></p>
    <div class="ld-cta"><a class="ld-btn pri big" href="/signup">Create your account</a><a class="ld-btn big" href="#tour">See every tab ↓</a></div>
    <div class="ld-trust"><span><i></i>Free</span><span><i></i>Open source, MIT</span><span><i></i>Your own private database</span><span><i></i>Set up in three minutes</span></div>
  </div>

  <div class="phone rv" id="demoToday">
    <div class="ld-dh"><div class="grow"><b>Tuesday, Sep 8</b><div class="tiny" style="margin-top:2px">🎯 Interview prep · 98 days to the finish line</div></div><span class="pill" style="background:#FFB34722;color:var(--ember2)">🔥 12 days</span></div>
    <div class="race"><div class="race-track" style="height:18px">${race()}</div><div class="race-cap"><span>AUG 26</span><b>DAY 14 OF 112</b><span>DEC 15</span></div></div>
    <h2>Today's goals</h2>
    <div class="card"><div class="ld-rings">${ring('lc', '🧩', 'LeetCode', 2, 3, '#FF6B35')}${ring('ap', '📨', 'Apps', 1, 2, '#5EA2FF')}${ring('sd', '🏗️', 'Design', 0, 1, '#9B6EF3')}</div><p class="tiny" style="text-align:center;margin-top:6px">Tap + to log. Try it.</p></div>
    <h2>Focus timer</h2>
    <div class="card"><div class="ld-tmr"><div class="tring"><svg width="118" height="118" viewBox="0 0 190 190"><circle cx="95" cy="95" r="85" fill="none" stroke="var(--surface2)" stroke-width="10"/><circle id="dmArc" cx="95" cy="95" r="85" fill="none" stroke="var(--ember)" stroke-width="10" stroke-linecap="round" stroke-dasharray="534" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear"/></svg><div class="tv"><span id="dmT">25:00</span><span class="tsub" id="dmSub">25 min</span></div></div>
      <div class="btns"><button class="pri" id="dmGo" data-act="go">Start</button><button id="dmPause" data-act="pause" style="display:none">⏸ Pause</button><button class="ghost sm" data-act="reset">Reset</button></div></div>
      <p class="tiny" id="dmHint" style="text-align:center;margin-top:10px">The same clock follows you to every tab. Press Done and it asks how the problem went.</p></div>
    <h2>Schedule</h2>
    <div class="card"><div class="tl2">
      ${tl('9:00 AM', '12:00 PM', '3h', 'grind', '🔥', 'Block 1', '🧩 2h · 📨 1h')}
      ${tl('12:00 PM', '3:00 PM', '3h', 'free', '🎮', 'Free · friends can book', '💬 Jordan · 1:00 PM – 2:00 PM')}
      ${tl('3:00 PM', '6:00 PM', '3h', 'grind', '🔥', 'Block 2', '🧩 1h 30m · 🏗️ 1h 30m')}
      ${tl('6:00 PM', '7:30 PM', '1h 30m', 'side', '🏋️', 'Gym', 'side task · grind steps around it')}
    </div></div>
  </div>
</section>

<section class="ld-sec" id="tour">
  <div class="ld-kick">The tour</div>
  <h2 class="ld-h2">Every tab, working.</h2>
  <p class="ld-sub">These are the real components on sample data. Change a status, log an attempt, type the PIN, book a slot.</p>
  <div class="tabbar ld-tabs" id="ldTabs"><button class="on" data-tab="lc">🧩 LeetCode</button><button data-tab="jobs">📨 Jobs</button><button data-tab="prog">📈 Progress</button><button data-tab="share">🔒 Share & book</button><button data-tab="api">🤖 API</button></div>

  <div class="tabpane on ld-panel" id="ldp-lc">
    <div class="ld-two">
      <div>
        <div class="row" style="margin-bottom:10px"><b style="font:800 17px var(--disp)" class="grow">Attempts</b><button class="pri sm" data-act="log">＋ Log attempt</button></div>
        <div class="tiny" style="margin-bottom:8px">Come back to these</div>
        <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:12px"><span class="chip">${outb(2)} Coin Change <span class="tiny">×2 · 48m</span></span><span class="chip">${outb(0)} LRU Cache <span class="tiny">×1 · 25m</span></span></div>
        <div id="ldLcRows">${LC.map(lcRow).join('')}</div>
        <p class="tiny" style="margin-top:10px">A problem's state is its <b>newest</b> attempt. Reruns stack on the same name, so "solved" means solved clean, not "touched once".</p>
      </div>
      <div>
        <div class="card" style="margin:0"><div class="row" style="flex-wrap:wrap;gap:8px"><span class="diff medium">MEDIUM</span><b style="font:800 16px var(--disp)">Coin Change</b><span class="grow"></span><span class="savetick on">SAVED</span></div>
          <p style="margin-top:10px;font-size:15px;line-height:1.6">Bottom-up DP over amounts. dp[a] = min coins for a. Slow the first time because I recomputed subproblems; second try 31m.</p>
          <div class="codewrap"><span class="codetag">PYTHON</span><pre class="codearea" style="margin:0">dp = [0] + [inf] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c &lt;= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
return dp[amount] if dp[amount] &lt; inf else -1</pre></div>
          <div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip" style="font-size:12px">⏱ median 18m</span><span class="chip" style="font-size:12px;color:var(--mint)">↓ 4m vs last week</span><span class="chip" style="font-size:12px">38 solved · 150 target</span></div>
        </div>
        <p class="tiny" style="margin-top:10px">One living note per problem, with a code block and an array visualiser for pointer problems. The timer's "Done" opens the log with the minutes filled in.</p>
      </div>
    </div>
  </div>

  <div class="tabpane ld-panel" id="ldp-jobs">
    <div class="ld-two">
      <div>
        <b style="font:800 17px var(--disp)">Funnel</b>
        <div id="ldFunnel" style="margin-top:8px"></div>
        <p class="tiny" style="margin-top:8px">Change a status on the right and watch it move.</p>
        <div class="tiny" style="margin:16px 0 6px">Platforms</div>
        <div class="row" style="flex-wrap:wrap;gap:6px"><span class="chip">LinkedIn <b class="num">11</b></span><span class="chip">Handshake <b class="num">6</b></span><span class="chip">Company site <b class="num">5</b></span><span class="chip">Referral <b class="num">2</b></span></div>
        <div class="card" style="margin:16px 0 0"><b style="font:800 14px var(--disp)">🤖 Let an agent do the typing</b><p class="tiny" style="margin-top:4px">A separate API key gives Claude Code full access to this tab only: log, find, edit, change status, delete. Adding bumps today's counter, deleting takes it back.</p></div>
      </div>
      <div id="ldJobs">${JOBS.map(jobCard).join('')}</div>
    </div>
  </div>

  <div class="tabpane ld-panel" id="ldp-prog">
    <div class="csum" style="grid-template-columns:repeat(2,1fr)"><div class="ci ld-stat"><b data-n="12">0</b><span>🔥 day streak</span></div><div class="ci ld-stat"><b data-n="4" data-pre="+">0</b><span>ahead of pace</span></div><div class="ci ld-stat"><b data-n="61" data-suf="h">0</b><span>grind logged</span></div><div class="ci ld-stat"><b data-n="9" data-suf="/14">0</b><span>days target hit</span></div></div>
    <div class="ld-two">
      <div>
        <b style="font:800 15px var(--disp)">Pace vs plan</b>
        <div class="tiny" style="margin-top:2px">38 clean solves · the plan asked for 34 by today</div>
        <div class="pace-bar"><div style="width:78%;background:var(--grad)"></div></div>
        <b style="display:block;font:800 15px var(--disp);margin-top:18px">When you actually grind</b>
        <div class="dow">${DOW.map(([d, h]) => `<div class="dw"><div class="bar"><i style="height:${Math.round(h / 6.2 * 100)}%;background:${h >= 5 ? 'var(--ember)' : h >= 3 ? 'var(--ember2)' : 'var(--surface3)'}"></i></div><b>${h}</b><span>${d}</span></div>`).join('')}</div>
        <b style="display:block;font:800 15px var(--disp);margin-top:18px">Last 12 weeks</b>
        <div style="overflow-x:auto;padding-bottom:4px;margin-top:8px"><div class="heat">${heat()}</div></div>
      </div>
      <div>
        <b style="font:800 15px var(--disp)">Finish line · Dec 15</b>
        ${pj('🧩', 'LeetCode', 38, 150, 152, 'At this pace you cross <b>150</b> with two days to spare.', '#FF6B35')}
        ${pj('📨', 'Applications', 24, 120, 96, 'On pace for <b>96</b>. One extra application a week closes the gap.', '#5EA2FF')}
        <p class="tiny" style="margin-top:10px">Pace counts clean solves only. Attempts count for the daily goal. Solve-time stats count solved and slow. Three questions, three sets.</p>
      </div>
    </div>
  </div>

  <div class="tabpane ld-panel" id="ldp-share">
    <div class="ld-two">
      <div class="card" style="margin:0">
        <b style="font:800 16px var(--disp)">🔒 Progress for friends</b>
        <p class="tiny" style="margin-top:4px">A read-only copy of your Progress tab behind a PIN you choose. You decide what shows: overview, LeetCode, grind hours, jobs funnel without company names, off-day reasons.</p>
        <div id="ldShareGate"><label class="fld">PIN</label><div class="row"><input id="ldPin" inputmode="numeric" placeholder="try 1234" style="flex:1"><button class="pri" data-act="pin">Open</button></div><div class="tiny" id="ldPinMsg" style="margin-top:6px;min-height:14px"></div></div>
        <div id="ldShareOpen" style="display:none">
          <div class="csum" style="grid-template-columns:repeat(2,1fr);margin-top:12px"><div class="ci"><b>12</b><span>🔥 streak</span></div><div class="ci"><b>38</b><span>solved</span></div><div class="ci"><b>61h</b><span>grind</span></div><div class="ci"><b>24</b><span>applied</span></div></div>
          <div class="tiny">Friends see numbers, never your notes and never company names unless you allow it.</div>
        </div>
      </div>
      <div class="card" style="margin:0">
        <b style="font:800 16px var(--disp)">🎮 Book Sam's free time</b>
        <p class="tiny" style="margin-top:4px">Your public page at <span class="num">/u/sam/book</span>. Whatever is left of your bookable windows after grind blocks and side tasks is what friends can grab. Approve or decline from the Friends tab.</p>
        <label class="fld">Tue, Sep 8 · 12:00 PM – 3:00 PM</label>
        <div class="row" style="flex-wrap:wrap;gap:6px" id="ldSlots"><button class="ld-slot" data-slot="12:00 PM">12:00</button><button class="ld-slot" data-slot="12:30 PM">12:30</button><button class="ld-slot" data-slot="2:00 PM">2:00</button><button class="ld-slot" data-slot="2:30 PM">2:30</button></div>
        <div class="tiny" style="margin-top:6px">1:00 to 2:00 is already Jordan's.</div>
        <div class="row" style="gap:6px;margin-top:12px;flex-wrap:wrap"><span class="chip">🎮 game</span><span class="chip">💬 talk</span><span class="chip">📋 task</span></div>
        <div id="ldBookMsg" class="tiny" style="margin-top:10px;min-height:16px;color:var(--mint)"></div>
      </div>
    </div>
    <p class="tiny" style="margin-top:12px">Both live under your handle. Turn the Friends module off and the booking page disappears entirely. The share link stops working the moment you clear the PIN.</p>
  </div>

  <div class="tabpane ld-panel" id="ldp-api">
    <div class="ld-two">
      <div>
        <b style="font:800 17px var(--disp)">Let Claude read your log</b>
        <p class="ld-sub" style="font-size:14.5px;margin-top:6px">A read-only key exposes three endpoints: LeetCode, jobs, progress. Every response starts with a <b>guide</b> that spells out the counting rules for your account, so the model reads the numbers the way the app counts them. Works in Claude Code and in claude.ai chat.</p>
        <div class="seg-ctl" style="margin-top:14px;max-width:320px" id="ldApiSeg"><button class="on" data-api="cc">Claude Code</button><button data-api="web">Browser Claude</button></div>
        <div class="ld-code" id="ldApiCode"></div>
      </div>
      <div>
        <b style="font:800 14px var(--disp)">What comes back</b>
        <div class="ld-code">{
  <span class="k">"guide"</span>: {
    <span class="k">"solvedTotal"</span>: <span class="s">"problems whose NEWEST attempt was a clean solve"</span>,
    <span class="k">"attempts"</span>:    <span class="s">"rows are attempts, not problems; reruns are normal"</span>,
    <span class="k">"timezone"</span>:    <span class="s">"America/New_York; dates are local days"</span>
  },
  <span class="k">"meta"</span>: { <span class="k">"total"</span>: 47, <span class="k">"returned"</span>: 47, <span class="k">"plan"</span>: { <span class="s">"2026-08-26"</span> … <span class="s">"2026-12-15"</span> } },
  <span class="k">"stats"</span>: { <span class="k">"totals"</span>: { <span class="k">"solvedTotal"</span>: 38, <span class="k">"slow"</span>: 3, <span class="k">"open"</span>: 6 }, <span class="k">"medianMin"</span>: 18 },
  <span class="k">"attempts"</span>: [ { <span class="k">"date"</span>: <span class="s">"2026-09-08"</span>, <span class="k">"name"</span>: <span class="s">"Coin Change"</span>, <span class="k">"finished"</span>: 1, <span class="k">"minutes"</span>: 31 }, … ]
}</div>
        <p class="tiny" style="margin-top:8px">Notes are never returned. The key cannot write. Regenerate it any time from Settings.</p>
      </div>
    </div>
  </div>
</section>

<section class="ld-sec">
  <div class="ld-kick">Three minutes</div>
  <h2 class="ld-h2">Sign up, answer seven questions, grind.</h2>
  <p class="ld-sub">Nothing is seeded and nothing is assumed. The wizard builds your plan, your categories and your schedule, and every answer can be changed later in Settings.</p>
  <div class="ld-feat rv">
    <div class="ld-fc"><span class="n">1</span><b>Create an account</b><p>Email and password. No social sign-in, no tracking, no newsletter.</p></div>
    <div class="ld-fc"><span class="n">2</span><b>Set up in seven steps</b><p>Each one is a single screen with a live preview.</p><div class="ld-steps">${STEP_NAMES.map((s, i) => `<span><b>${i + 1}</b>${s}</span>`).join('')}</div></div>
    <div class="ld-fc"><span class="n">3</span><b>Open Today</b><p>Your goals, your blocks, your timer. Log a problem, press + on a ring, check in to a block. The streak starts counting.</p></div>
  </div>
</section>

<section class="ld-sec">
  <div class="ld-kick">Yours to shape</div>
  <h2 class="ld-h2">Built around your week, not ours.</h2>
  <div class="ld-shape rv">
    <div class="ld-sh"><span class="e">🧩</span><div><b>Your categories</b><p>LeetCode and Applications come with tools. Add system design, a course, reading. Each gets a weekday, weekend and low-load goal.</p></div></div>
    <div class="ld-sh"><span class="e">🏋️</span><div><b>Side tasks</b><p>Gym, a class, a shift. Pick the days and hours, optionally a date range. Grind blocks step out of their way.</p></div></div>
    <div class="ld-sh"><span class="e">🌙</span><div><b>Named layouts</b><p>Morning, Night owl, Weekend. Switch the default from the Today page, pin one to a weekday.</p></div></div>
    <div class="ld-sh"><span class="e">🪫</span><div><b>Low-load phases</b><p>Exams, travel, guests. Goals drop, a lighter layout applies, the streak stays fair.</p></div></div>
    <div class="ld-sh"><span class="e">🌍</span><div><b>Any time zone</b><p>Every day, streak and deadline is counted in your own local time. 12 or 24 hour clock.</p></div></div>
    <div class="ld-sh"><span class="e">🧰</span><div><b>Modules</b><p>Turn off what you do not use: LeetCode, Jobs, Quick Copy, the day clock, friends booking. The tab and its routes disappear.</p></div></div>
  </div>
</section>

<section class="ld-sec">
  <div class="ld-priv rv">
    <div>
      <div class="ld-kick">Private by construction</div>
      <h2 class="ld-h2" style="font-size:clamp(24px,4vw,34px)">Your data lives in its own database.</h2>
      <p class="ld-sub" style="font-size:15px">Every account gets a separate SQLite database inside a Cloudflare Durable Object. There is no shared table of user data, so one user's rows are unreachable from another's by design, not by discipline. A small central store holds only accounts, sessions and key hashes.</p>
    </div>
    <ul>
      <li><i>✓</i><span>Export everything as JSON any time. Import it back into any LockIn.</span></li>
      <li><i>✓</i><span>Delete the account and the database is gone with it.</span></li>
      <li><i>✓</i><span>Public pages (share, booking) are opt-in and sit under your handle.</span></li>
      <li><i>✓</i><span>Open source under MIT. <a href="https://github.com/ma9197/LockIn" target="_blank" rel="noopener">Read the code, run your own.</a></span></li>
    </ul>
  </div>
</section>

<footer class="ld-foot">
  <div class="logo" style="font-size:26px">LOCK<em>IN</em> 🔥</div>
  <p class="ld-sub" style="text-align:center">The finish line is a date. Start counting.</p>
  <div class="ld-cta" style="margin-top:4px;justify-content:center"><a class="ld-btn pri big" href="/signup">Create your account</a><a class="ld-btn big" href="/login">Sign in</a></div>
  <p class="tiny"><a href="https://github.com/ma9197/LockIn" target="_blank" rel="noopener">GitHub</a> · MIT license · built on Cloudflare Workers</p>
</footer>

<div class="ld-modal" id="ldModal"></div>
`, `<script>
// ---- reveal on scroll ----
(function(){const els=document.querySelectorAll('.rv');
if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));ldRingsIn();ldCount();return;}
const io=new IntersectionObserver(en=>{en.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);
if(x.target.id==='demoToday')ldRingsIn();}})},{threshold:.15});
els.forEach(e=>io.observe(e));})();
function ldRingsIn(){document.querySelectorAll('.ld-ring .arc').forEach(a=>{setTimeout(()=>{a.style.strokeDashoffset=a.dataset.off;},120);});}

// ---- goal rings ----
const LDR={lc:2,ap:1,sd:0};
function ldRing(k,done){const el=document.querySelector('.ld-ring[data-k="'+k+'"]');if(!el)return;
const goal=+el.dataset.goal,col=el.dataset.color,hit=done>=goal,pct=Math.min(1,done/goal);
const arc=el.querySelector('.arc');arc.style.strokeDashoffset=String(289*(1-pct));arc.style.stroke=hit?'var(--mint)':col;
el.querySelector('.val b').textContent=done;
el.querySelector('.extra').innerHTML=done>goal?'+'+(done-goal)+' EXTRA \\uD83D\\uDCAA':hit?'GOAL HIT \\u2713':'&nbsp;';}
function ldBump(k,d){LDR[k]=Math.max(0,LDR[k]+d);ldRing(k,LDR[k]);
if(d>0&&LDR[k]===+document.querySelector('.ld-ring[data-k="'+k+'"]').dataset.goal)toast('Goal hit. The streak keeps counting.');}

// ---- focus timer (its own clock, so it never touches the real one) ----
let DM={len:25,left:1500,run:false,paused:false,int:null,elapsed:0};
const dmFmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function dmDraw(){$('dmT').textContent=(DM.left>=0?'':'+')+dmFmt(Math.abs(DM.left));$('dmT').style.color=DM.left<0?'var(--rose)':'';
$('dmArc').style.strokeDashoffset=String(534*(1-Math.max(0,DM.left)/(DM.len*60)));$('dmArc').style.stroke=DM.left<0?'var(--rose)':'var(--ember)';
$('dmSub').textContent=DM.run?(dmFmt(DM.elapsed)+' elapsed'):(DM.len+' min');
$('dmGo').textContent=DM.run?'\\u2713 Done':'Start';$('dmPause').style.display=DM.run?'':'none';$('dmPause').textContent=DM.paused?'\\u25B6 Resume':'\\u23F8 Pause';}
function dmTick(){if(DM.paused)return;DM.left--;DM.elapsed++;dmDraw();
if(DM.left===0)$('dmHint').textContent='\\u23F0 Past the timer. Still counting, press Done when you finish.';}
function dmGo(){if(DM.run){dmDone();return;}
DM.run=true;DM.paused=false;DM.elapsed=0;DM.left=DM.len*60;clearInterval(DM.int);DM.int=setInterval(dmTick,1000);dmDraw();
$('dmHint').textContent='\\uD83E\\uDDE9 Recording \\u00b7 press Done when the problem is solved';}
function dmPause(){if(!DM.run)return;DM.paused=!DM.paused;dmDraw();
$('dmHint').textContent=DM.paused?'\\u23F8 Paused \\u00b7 still yours when you come back':'Back at it.';}
function dmReset(){clearInterval(DM.int);DM.run=false;DM.paused=false;DM.left=DM.len*60;DM.elapsed=0;dmDraw();
$('dmHint').textContent='Stuck at 25? Read the solution. Do not grind for 2 hours.';}
function dmDone(){const mins=Math.max(1,Math.round(DM.elapsed/60));clearInterval(DM.int);DM.run=false;DM.paused=false;DM.left=DM.len*60;DM.elapsed=0;dmDraw();
$('dmHint').innerHTML='\\u2705 Finished \\u00b7 <b class="num">'+mins+'m</b> \\u00b7 now log it';ldLogOpen(mins);}

// ---- log modal ----
let LDLOG={diff:'medium'};
function ldLogOpen(mins){LDLOG={diff:'medium'};
$('ldModal').innerHTML='<div class="modal" onclick="event.stopPropagation()"><h1 style="font-size:19px">\\uD83E\\uDDE9 Log a LeetCode problem</h1>'
+'<p class="muted" style="margin-top:4px">All three count for today. \\u26a1 Solved, slow is not counted as solved and stays in your come-back list.</p>'
+'<label class="fld">Difficulty</label><div class="seg-ctl" id="ldDiff"><button data-diff="easy">Easy</button><button data-diff="medium" class="on">Medium</button><button data-diff="hard">Hard</button></div>'
+'<label class="fld">Minutes spent</label><input id="ldMin" type="number" inputmode="numeric" value="'+(mins||'')+'" placeholder="e.g. 22">'
+'<label class="fld">Problem name</label><input id="ldName" placeholder="Start typing, past attempts match here" value="Merge Intervals">'
+'<div class="tiny" style="margin-top:6px;color:var(--ink3)">New problem, nothing like it logged before.</div>'
+'<div class="row" style="margin-top:18px;flex-wrap:wrap"><button class="mint grow" data-out="1">\\u2713 Solved \\u00b7 +1</button><button class="grow" style="border-color:#9B6EF388;color:var(--violet)" data-out="2">\\u26a1 Solved, slow</button><button class="grow" data-out="0">\\u2715 Did not finish</button></div>'
+'<button class="ghost" style="width:100%;margin-top:10px" data-act="close">Cancel</button></div>';
$('ldModal').classList.add('on');}
function ldLogSave(out){const m=+$('ldMin').value||1,n=$('ldName').value.trim()||'Untitled';
const row=document.createElement('div');row.className='lcrow';
const OB={0:['\\u2715','open','var(--ember2)'],1:['\\u2713','solved','var(--mint)'],2:['\\u26a1','slow','var(--violet)']}[out];
row.innerHTML='<span class="diff '+LDLOG.diff+'">'+LDLOG.diff.toUpperCase()+'</span><span class="grow" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(n)+'</span><span class="tiny num">\\u00d71</span><span class="outb" style="background:'+OB[2]+'22;color:'+OB[2]+'">'+OB[0]+' '+OB[1]+'</span><b class="num" style="font-size:12px;min-width:34px;text-align:right">'+m+'m</b>';
$('ldLcRows').prepend(row);row.style.background='#3DDC9718';setTimeout(()=>row.style.background='',1200);
$('ldModal').classList.remove('on');ldBump('lc',1);
toast(out===1?'\\uD83E\\uDDE9 Solved \\u00b7 '+LDLOG.diff+' \\u00b7 '+m+'m':out===2?'\\u26a1 Solved but slow \\u00b7 saved to your come-back list':'\\uD83E\\uDDE9 Attempt #1 \\u00b7 +1 for today, not solved yet');
const t=document.querySelector('#ldTabs button[data-tab="lc"]');if(t&&!t.classList.contains('on'))ldTab('lc');}

// ---- tour tabs ----
function ldTab(t){document.querySelectorAll('#ldTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
document.querySelectorAll('#tour .tabpane').forEach(p=>p.classList.toggle('on',p.id==='ldp-'+t));
if(t==='prog')ldCount();}

// ---- jobs funnel ----
const LDJ=${JSON.stringify(JOBS.map(j => j[3]))};
const LDBASE={applied:24,oa:9,interview:4,offer:1,rejected:6};
const STC={applied:['Applied','#5EA2FF'],oa:['OA','#FFB347'],interview:['Interview','#9B6EF3'],offer:['Offer','#3DDC97'],rejected:['Rejected','#FF5D73']};
function ldFunnel(){const c={applied:0,oa:0,interview:0,offer:0,rejected:0};
LDJ.forEach(s=>c[s]++);
// the sample account has more rows than the six shown; the six move the totals
const base=${JSON.stringify(JOBS.map(j => j[3]))}.reduce((a,s)=>{a[s]=(a[s]||0)+1;return a;},{});
const tot={};for(const k of Object.keys(c))tot[k]=LDBASE[k]-(base[k]||0)+c[k];
const reached={applied:tot.applied+tot.oa+tot.interview+tot.offer+tot.rejected,oa:tot.oa+tot.interview+tot.offer,interview:tot.interview+tot.offer,offer:tot.offer};
const max=reached.applied||1;
$('ldFunnel').innerHTML=['applied','oa','interview','offer'].map(k=>'<div class="funnel-row"><span class="fl">'+STC[k][0]+'</span><div><div class="fb" style="width:'+Math.max(8,Math.round(reached[k]/max*100))+'%;background:'+STC[k][1]+'">'+reached[k]+'</div></div><span class="fp">'+Math.round(reached[k]/max*100)+'%</span></div>').join('')
+'<div class="tiny" style="margin-top:6px">'+tot.rejected+' rejected \\u00b7 '+Math.round(reached.interview/max*100)+'% of applications reach an interview</div>';}
ldFunnel();

// ---- API snippets ----
const LDAPI={cc:'<span class="c"># CLAUDE.md</span>\\n<span class="c"># LockIn read-only data API. GET only; this key cannot write.</span>\\ncurl -s -H <span class="s">"Authorization: Bearer lockin_read_\\u2026"</span> https://cslockin.com/api/read/leetcode\\ncurl -s -H <span class="s">"Authorization: Bearer lockin_read_\\u2026"</span> https://cslockin.com/api/read/jobs\\ncurl -s -H <span class="s">"Authorization: Bearer lockin_read_\\u2026"</span> https://cslockin.com/api/read/progress\\n\\n<span class="c"># params: limit, offset, since=YYYY-MM-DD, format=json|md</span>\\n<span class="c"># read the "guide" object before interpreting any field</span>',
web:'<span class="c"># Paste into a Claude Project\\u2019s instructions</span>\\nThese URLs return my live data. Fetch one when you need facts\\nabout my LeetCode practice, applications or progress. READ ONLY.\\n\\nhttps://cslockin.com/api/read/leetcode?key=lockin_read_\\u2026\\nhttps://cslockin.com/api/read/jobs?key=lockin_read_\\u2026\\nhttps://cslockin.com/api/read/progress?key=lockin_read_\\u2026\\n\\nALWAYS read the "guide" first. Reruns are normal, so attempt\\nrows are NOT problems. Use stats.totals.solvedTotal.'};
function ldApi(k){document.querySelectorAll('#ldApiSeg button').forEach(b=>b.classList.toggle('on',b.dataset.api===k));$('ldApiCode').innerHTML=LDAPI[k];}
ldApi('cc');

// ---- counters ----
let LDC=false;
function ldCount(){if(LDC)return;LDC=true;document.querySelectorAll('.ld-stat b[data-n]').forEach(b=>{const n=+b.dataset.n,pre=b.dataset.pre||'',suf=b.dataset.suf||'';const t0=performance.now();
const step=now=>{const p=Math.min(1,(now-t0)/900),e=1-Math.pow(1-p,3);b.textContent=pre+Math.round(n*e)+suf;if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);});}

// ---- share PIN, booking ----
function ldPin(){const v=$('ldPin').value.trim();
if(v==='1234'){$('ldShareGate').style.display='none';$('ldShareOpen').style.display='';toast('\\uD83D\\uDD13 Opened. This is what a friend sees.');}
else{$('ldPinMsg').textContent='Wrong PIN. 5 misses lock it for 15 minutes.';$('ldPinMsg').style.color='var(--rose)';}}
function ldBook(btn){document.querySelectorAll('#ldSlots button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
$('ldBookMsg').textContent='\\u2713 Requested '+btn.dataset.slot+' \\u00b7 Sam gets a badge on the Friends tab and confirms with one tap.';}

// ---- one delegated click handler; no inline quotes anywhere ----
document.addEventListener('click',e=>{
const t=e.target.closest('[data-bump],[data-act],[data-tab],[data-api],[data-diff],[data-out],[data-slot]');if(!t)return;
if(t.dataset.bump){ldBump(t.dataset.bump,+t.dataset.d);return;}
if(t.dataset.tab){ldTab(t.dataset.tab);return;}
if(t.dataset.api){ldApi(t.dataset.api);return;}
if(t.dataset.diff){LDLOG.diff=t.dataset.diff;document.querySelectorAll('#ldDiff button').forEach(b=>b.classList.toggle('on',b===t));return;}
if(t.dataset.out!==undefined){ldLogSave(+t.dataset.out);return;}
if(t.dataset.slot){ldBook(t);return;}
const a=t.dataset.act;
if(a==='go')dmGo();else if(a==='pause')dmPause();else if(a==='reset')dmReset();else if(a==='log')ldLogOpen(0);else if(a==='close')$('ldModal').classList.remove('on');else if(a==='pin')ldPin();});
$('ldModal').addEventListener('click',()=>$('ldModal').classList.remove('on'));
$('ldPin').addEventListener('keydown',e=>{if(e.key==='Enter')ldPin();});
document.querySelectorAll('#ldJobs select').forEach(s=>s.addEventListener('change',()=>{LDJ[+s.dataset.job]=s.value;ldFunnel();toast('Status \\u2192 '+STC[s.value][0]);}));
dmDraw();
</script>`, { public: true });
