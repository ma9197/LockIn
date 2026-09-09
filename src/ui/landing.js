import { shell, ic } from './theme.js';

// The public home page. Every panel is a working mock of the real UI, built from the same CSS
// classes the app uses, driven by sample data on the client. Nothing here touches the server.
// The hero is a "device stage": a laptop mock of Today in front, the phone mock behind it on the
// right, dimmed. Tap the phone and the two swap. Both mocks share one state: bump a ring or run
// the timer on one and the other follows.
// Page-script rules: no backticks, no ${ } and no quotes inside inline onclick attributes.

const CF = 289;
const ring = (key, emoji, label, done, goal, color) => {
  const pct = Math.min(1, done / goal), hit = done >= goal;
  return `<div class="ld-ring" data-k="${key}" data-goal="${goal}" data-color="${color}" style="text-align:center">
<div class="ringlab">${emoji} ${label}</div>
<div class="ring"><svg viewBox="0 0 112 112">
<circle cx="56" cy="56" r="46" fill="none" stroke="var(--surface2)" stroke-width="8"/>
<circle class="arc" cx="56" cy="56" r="46" fill="none" stroke="${hit ? 'var(--mint)' : color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${CF}" stroke-dashoffset="${CF}" data-off="${CF * (1 - pct)}" style="transition:stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1),stroke .3s"/>
</svg><div class="val"><b class="num">${done}</b><span>OF ${goal}</span></div></div>
<div class="extra">${hit ? 'GOAL HIT ✓' : '&nbsp;'}</div>
<div class="ringbtns"><button class="sm" data-bump="${key}" data-d="-1" aria-label="one less">−</button><button class="sm pri" data-bump="${key}" data-d="1" aria-label="one more">+</button></div></div>`;
};
const rings = () => ring('lc', '🧩', 'LeetCode', 2, 3, '#FF6B35') + ring('ap', '📨', 'Apps', 1, 2, '#5EA2FF') + ring('sd', '🏗️', 'Design', 0, 1, '#9B6EF3');

const RAIL = { grind: '#FF6B35', free: '#5EA2FF', side: '#3DDC97' };
const tl = (a, b, dur, kind, emoji, label, sub) => `<div class="tl2-item"><div class="tl2-rail"><span class="bub">${a}</span><div class="tl2-line" style="--rk:${RAIL[kind]}"><span class="tl2-dur">${dur}</span></div><span class="bub">${b}</span></div>
<div class="tl2-body"><div class="tl2-head"><span>${emoji}</span><span class="lab">${label}</span></div><div class="tl2-sub">${sub}</div></div></div>`;
const timeline = () => tl('9:00 AM', '12:00 PM', '3h', 'grind', '🔥', 'Block 1', '🧩 2h · 📨 1h')
  + tl('12:00 PM', '3:00 PM', '3h', 'free', '🎮', 'Free · friends can book', '💬 Jordan · 1:00 PM – 2:00 PM')
  + tl('3:00 PM', '6:00 PM', '3h', 'grind', '🔥', 'Block 2', '🧩 1h 30m · 🏗️ 1h 30m')
  + tl('6:00 PM', '7:30 PM', '1h 30m', 'side', '🏋️', 'Gym', 'side task · grind steps around it');

const timer = (size) => `<div class="ld-tmr"><div class="tring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 190 190"><circle cx="95" cy="95" r="85" fill="none" stroke="var(--surface2)" stroke-width="10"/><circle class="dmArc" cx="95" cy="95" r="85" fill="none" stroke="var(--ember)" stroke-width="10" stroke-linecap="round" stroke-dasharray="534" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear"/></svg><div class="tv"><span class="dmT">25:00</span><span class="tsub dmSub">25 min</span></div></div>
<div class="btns"><button class="pri dmGo" data-act="go">Start</button><button class="dmPause" data-act="pause" style="display:none">⏸ Pause</button><button class="ghost sm" data-act="reset">Reset</button></div></div>`;

const task = (emoji, title, sub, done, goal) => `<div class="task"><div class="box">✓</div><div class="grow"><div class="t"><span class="track-ic">${emoji}</span>${title}</div><div class="d">${sub}</div></div><b class="num" style="min-width:40px;text-align:right">${done}/${goal}</b></div>`;

// plan: 4 phases over 112 days, today is day 14
const PH = [['#5EA2FF', 28], ['#FF6B35', 42], ['#9B6EF3', 7], ['#3DDC97', 35]];
const race = (h) => { let out = '', i = 0; for (const [c, n] of PH) for (let k = 0; k < n; k++, i++) out += `<div class="race-seg ${i < 13 ? 'past' : i === 13 ? 'today' : ''}" style="--seg:${c}"></div>`; return `<div class="race"><div class="race-track" style="height:${h}px">${out}</div><div class="race-cap"><span>AUG 26</span><b>DAY 14 OF 112</b><span>DEC 15</span></div></div>`; };
const header = () => `<div class="dh-top"><div class="dh-title"><h1>Today</h1></div><div class="dh-chips"><span class="pill" style="background:#FF6B3522;color:var(--ember);border:1px solid currentColor">Phase 2 · Interview prep</span><span class="chip" style="border-color:#FF6B3555;background:#FF6B3514;color:var(--ember2)">🔥 12 day streak</span><span class="chip">☀️ morning</span><span class="chip">💤 Off day</span></div></div>
<div class="dh-nav"><button class="dh-btn" aria-label="previous day" tabindex="-1">‹</button><div class="dh-date">Tue, September 8</div><button class="dh-btn" aria-label="next day" tabindex="-1">›</button></div>`;

// the day clock, drawn once on the server: a 12-hour dial with the day's blocks around the face
const clockSvg = () => {
  const P = (r, deg) => [150 + r * Math.cos((deg - 90) * Math.PI / 180), 150 + r * Math.sin((deg - 90) * Math.PI / 180)];
  const arc = (r, a1, a2, col, w) => { const [x1, y1] = P(r, a1), [x2, y2] = P(r, a2); return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none"/>`; };
  const lab = (r, deg, txt, size, col) => { const [x, y] = P(r, deg); return `<text x="${x.toFixed(1)}" y="${(y + size * .35).toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${col}" font-family="Archivo">${txt}</text>`; };
  let s = '<svg viewBox="0 0 300 300" width="100%" style="max-width:340px;display:block;margin:0 auto" aria-hidden="true">';
  s += '<circle cx="150" cy="150" r="146" fill="#10151F" stroke="#263045" stroke-width="2"/><circle cx="150" cy="150" r="116" fill="none" stroke="#263045" opacity=".5"/>';
  for (let m = 0; m < 60; m++) { const hr = m % 5 === 0; const [x1, y1] = P(hr ? 130 : 136, m * 6), [x2, y2] = P(142, m * 6); s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${hr ? 'rgba(237,241,247,.55)' : 'rgba(237,241,247,.13)'}" stroke-width="${hr ? 2.4 : .8}" stroke-linecap="round"/>`; }
  for (let h = 1; h <= 12; h++) s += lab(118, h * 30, h, 12, '#97A3B6');
  // 9:30-12 grind · 12-3 free · 3:30-6 grind · 7-8:30 gym, then the hand at 5:40
  s += arc(100, 285, 360, '#FF6B35', 24) + arc(100, 0, 90, '#5EA2FF', 24) + arc(100, 105, 180, '#FF6B35', 24) + arc(100, 210, 255, '#3DDC97', 24);
  s += lab(100, 322, '🔥', 14, '') + lab(80, 322, '2h 30m', 9, '#97A3B6') + lab(100, 45, '🎮', 14, '') + lab(80, 45, '3h', 9, '#97A3B6') + lab(100, 142, '🔥', 14, '') + lab(80, 142, '2h 30m', 9, '#97A3B6') + lab(100, 232, '🏋️', 14, '') + lab(80, 232, '1h 30m', 9, '#97A3B6');
  const [hx, hy] = P(66, 170); s += `<line x1="150" y1="150" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#EDF1F7" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><circle cx="150" cy="150" r="4.5" fill="#EDF1F7"/>`;
  return s + '</svg>';
};

const NAV = [['today', 'Today', 1], ['calendar', 'Calendar'], ['progress', 'Progress'], ['leetcode', 'LeetCode'], ['jobs', 'Jobs'], ['copy', 'Copy'], ['friends', 'Friends'], ['settings', 'Settings']];

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
const jobCard = (j, i) => `<div class="item" style="--ac:${STAT[j[3]][1]}"><b style="display:block;font:700 15px/1.3 var(--body)">${j[0]}</b><div class="tiny" style="margin-top:2px">${j[1]}</div><div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><select data-job="${i}" style="flex:1;min-width:120px;width:auto;padding:8px 8px;font-size:13px;background:var(--well)">${Object.keys(STAT).map(k => `<option value="${k}"${k === j[3] ? ' selected' : ''}>${STAT[k][0]}</option>`).join('')}</select><span class="chip" style="padding:4px 8px;font-size:11px">${j[2]}</span><span class="tiny num">Sep ${8 - i}</span></div></div>`;

const DOW = [['Sun', 2.1], ['Mon', 5.4], ['Tue', 6.2], ['Wed', 5.8], ['Thu', 4.9], ['Fri', 5.1], ['Sat', 3.0]];
const heat = () => { let s = 7, out = ''; for (let i = 0; i < 84; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = (s >> 8) % 7; const dow = i % 7; const a = i > 76 ? 0 : (dow === 0 || dow === 6 ? [0, .15, .3][v % 3] : [0, .3, .55, .8, 1, .7, .45][v]); out += `<div style="background:${a ? 'rgba(255,107,53,' + (0.15 + a * .85).toFixed(2) + ')' : 'var(--surface2)'}"></div>`; } return out; };

const pj = (emoji, name, done, total, proj, note, col) => `<div class="pj"><div class="pjh"><span>${emoji}</span><b>${name}</b><span class="grow"></span><b class="num">${done}<span class="tiny"> / ${total}</span></b></div>
<div class="pjbar"><i class="pr" style="width:${Math.min(100, proj / total * 100)}%;background:${col}"></i><i style="width:${done / total * 100}%;background:${col}"></i></div>
<div class="pjm"><span><i class="sw" style="background:${col}"></i>done ${done}</span><span><i class="sw pr" style="background:${col}"></i>on pace for <b>${proj}</b></span><span><i class="sw tr"></i>target ${total}</span></div><div class="pjn">${note}</div></div>`;

const STEP_NAMES = ['Name', 'Time zone', 'Plan', 'Blocks', 'Categories', 'Side tasks', 'Modules'];

export const landingPage = () => shell('LockIn · the grind tracker for CS students', null, `
<style>
.liveclock,.refresh-fab{display:none}
.wrap{max-width:1160px;padding:0 16px 40px}
@media(min-width:900px){.wrap{padding:0 32px 70px}}
.ld-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 0}
.ld-top .logo{white-space:nowrap}
.ld-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:12px;font:800 14px var(--disp);color:var(--ink);background:var(--surface2);border:1px solid var(--line2);white-space:nowrap;transition:transform .08s,filter .15s,border-color .15s}
.ld-btn:hover{border-color:var(--ink3)}
.ld-btn:active{transform:scale(.97)}
.ld-btn.pri{background:var(--grad);border:0;color:#1A0D05}
.ld-btn.ghost{background:transparent;border-color:transparent;color:var(--ink2)}
.ld-btn.big{padding:16px 24px;font-size:16px;border-radius:12px}

/* hero */
.ld-hero{padding:24px 0 0;text-align:left}
.ld-eyebrow{display:inline-flex;align-items:center;gap:8px;font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember2);background:#FF6B3514;border:1px solid #FF6B3540;border-radius:99px;padding:8px 12px}
.ld-h1{font:900 clamp(38px,7vw,68px)/1.02 var(--disp);letter-spacing:-.03em;margin:20px 0 16px;max-width:14ch}
.ld-h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.ld-lead{color:var(--ink2);font-size:18px;line-height:1.6;max-width:58ch}
.ld-lead b{color:var(--ink)}
.ld-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.ld-trust{display:flex;gap:8px 16px;flex-wrap:wrap;margin-top:20px;font-size:13px;color:var(--ink3)}
.ld-trust span{display:flex;align-items:center;gap:8px}
.ld-trust i{width:6px;height:6px;border-radius:99px;background:var(--mint);flex:none}
@media(min-width:900px) and (max-width:1099px){
  .ld-hero{text-align:center;padding:40px 0 0}
  .ld-h1{margin:20px auto 20px}
  .ld-lead{margin:0 auto}
  .ld-cta,.ld-trust{justify-content:center}
}
/* desktop: the words on the left, the working demo on the right */
@media(min-width:1100px){
  .ld-hero{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:48px;align-items:center;padding:32px 0 0}
  .ld-copy{min-width:0}
  .ld-h1{font-size:clamp(40px,4.4vw,56px);margin:20px 0 16px;max-width:none}
  .ld-lead{font-size:17px}
  .ld-demo{min-width:0}
  .ld-demo .stage{margin-top:0}
  .ld-demo .stage .phwrap{width:216px;margin-left:-100px}
  .ld-demo .stage.front{--pps:calc(var(--ppb,.6) * 1.45)}
  .ld-demo .stagecap{margin-top:16px}
}

/* device stage */
.stage{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:28px;margin-top:40px}
.stagecap{display:flex;justify-content:center;gap:8px;margin-top:20px}
.stagecap button{padding:8px 16px;font:700 13px var(--disp);border-radius:99px}
.stagecap button.on{background:var(--surface3);border-color:var(--ink3);color:var(--ember)}
.laptop{position:relative;width:100%;transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .6s,filter .6s;transform-origin:left bottom}
.lp-screen{position:relative;background:#0A0D13;border:1px solid var(--line2);border-radius:16px 16px 4px 4px;padding:8px 8px 12px;box-shadow:0 40px 90px #000b,inset 0 0 0 1px #ffffff08}
.lp-view{position:relative;overflow:hidden;border-radius:6px;background:var(--bg);height:calc(820px * var(--lps,.6))}
.lp-canvas{position:absolute;left:0;top:0;width:1180px;height:820px;transform:scale(var(--lps,.6));transform-origin:0 0;display:grid;grid-template-columns:196px 1fr;pointer-events:auto}
.lp-base{height:13px;margin:0 -2.5%;background:linear-gradient(180deg,#2A3447,#141a26);border:1px solid var(--line2);border-top:0;border-radius:0 0 12px 12px}
.lp-base:after{content:'';display:block;width:110px;height:4px;margin:0 auto;background:#0B0E14;border-radius:0 0 6px 6px}
.lp-side{background:var(--surface);border-right:1px solid var(--line);padding:24px 12px;display:flex;flex-direction:column;gap:4px}
.lp-side .logo{padding:0 12px 20px}
.lp-side a{display:flex;align-items:center;gap:12px;padding:12px 12px;border-radius:12px;color:var(--ink2);font:700 14px var(--disp)}
.lp-side a.on{background:var(--surface2);color:var(--ember)}
.lp-main{padding:24px 28px;min-width:0}
.lp-hdr{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 20px 16px}
.lp-hdr .dh-top{padding-bottom:12px;border-bottom:1px solid var(--line)}
.lp-hdr .race{margin:16px 0 0}
.lp-cols{display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start;margin-top:8px}
.lp-cols h2{margin:24px 0 12px}
.lp-cols>div>h2:first-child{margin-top:16px}
.lp-main .card{margin:0}
.lp-main .ringrow{grid-auto-flow:row;grid-template-columns:repeat(2,1fr);overflow:visible;gap:12px}
.lp-main .ringrow .ring{width:104px;height:104px}
.lp-main .ringrow .ring .val b{font-size:28px}
.lp-main .task .d{font-size:13px}
.lp-main .dstat-top{grid-template-columns:repeat(2,1fr)}
.lp-main .ld-tmr{display:flex;align-items:center;gap:16px}
.lp-main .ld-tmr .btns{display:flex;flex-direction:column;gap:8px;flex:1}
.lp-main .ld-tmr .tring .tv{font-size:32px}

.phwrap{display:flex;justify-content:center}
.stage{--pps:var(--ppb,.6)}
.stage.front{--pps:calc(var(--ppb,.6) * 1.3)}
.phone{position:relative;background:#0A0D13;border:1px solid var(--line2);border-radius:calc(36px * var(--pps,1));padding:calc(10px * var(--pps,1));box-shadow:0 40px 90px #000a,inset 0 0 0 1px #ffffff08;transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .6s,filter .6s,padding .6s,border-radius .6s}
.ph-view{position:relative;overflow:hidden;background:var(--bg);border-radius:calc(28px * var(--pps,1));width:calc(375px * var(--pps,1));height:calc(812px * var(--pps,1));transition:width .6s cubic-bezier(.2,.8,.2,1),height .6s cubic-bezier(.2,.8,.2,1),border-radius .6s}
.ph-canvas{position:absolute;left:0;top:0;width:375px;height:812px;transform:scale(var(--pps,1));transform-origin:0 0;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.ph-scroll{height:812px;overflow-y:auto;scrollbar-width:none;padding:20px 16px 40px}
.ph-scroll::-webkit-scrollbar{display:none}
.phone .dh-chips{margin-left:0;width:100%}
.phone .dh-nav{margin-top:12px}
.phone .card{margin:8px 0;padding:16px}
.phone h2{margin:16px 0 8px}
.phone .ringrow{grid-auto-flow:row;grid-template-columns:repeat(3,1fr);overflow:visible;gap:8px}
.phone .ringrow .ringcard{padding:12px 4px 8px}
.phone .ringrow .ring{width:72px;height:72px}
.phone .ringrow .ring .val b{font-size:20px}
.phone .ringrow .ring .val span{font-size:11px}
.phone .ringbtns button{min-width:36px;padding:8px 0}
.phone .ld-tmr{display:flex;align-items:center;gap:16px}
.phone .ld-tmr .btns{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
.phone .ld-tmr .tring .tv{font-size:28px}
.phone .ld-tmr .tring .tsub{font-size:11px}
.phone .tl2{gap:16px}
.phone .tl2-item{grid-template-columns:84px 1fr;gap:12px}
.phone .tl2-rail{min-width:84px}
.phone .tl2-line{min-height:22px}
.phone .dh-title h1{font-size:24px}
.phone .dh-chips .chip,.phone .dh-chips .pill{padding:4px 12px;font-size:12px}
.devhint{display:none}
@media(min-width:900px){
  .stage{flex-direction:row;align-items:flex-end;gap:0}
  .stage .laptop{flex:1;min-width:0;z-index:2;position:relative}
  .stage .phwrap{flex:none;width:250px;margin-left:-120px;justify-content:flex-end;align-items:flex-end;z-index:1;position:relative;transform:translateY(-14px)}
  .stage.front .phwrap{z-index:3}
  .stage .phone{flex:none;opacity:.5;filter:saturate(.5);cursor:pointer}
  .stage .phone:hover{opacity:.82;filter:saturate(.9);transform:translateY(-8px)}
  .stage .ph-scroll{pointer-events:none}
  .stage.front .phone{transform:none;opacity:1;filter:none;cursor:default;box-shadow:0 50px 110px #000c}
  .stage.front .ph-scroll{pointer-events:auto}
  .stage.front .laptop{opacity:.42;filter:saturate(.4);transform:translateX(-3%) scale(.94);cursor:pointer;z-index:1}
  .stage.front .laptop:hover{opacity:.62}
  .stage.front .lp-canvas{pointer-events:none}
  .devhint{display:block;text-align:center;margin-top:12px;font-size:13px;color:var(--ink3)}
}
@media(max-width:899px){
  .stagecap{display:none}
  .stage{gap:0;margin-top:32px}
  .stage .laptop{display:none}
  .phwrap{position:relative;justify-content:center}
  .phone{pointer-events:none}
  .ph-view{max-height:min(540px,68vh)}
  .phwrap::after{content:'';position:absolute;left:0;right:0;bottom:0;height:140px;background:linear-gradient(180deg,rgba(11,14,20,0),var(--bg) 92%);pointer-events:none}
  .ld-hero{padding-top:16px}
  .ld-eyebrow{font-size:11px;padding:8px 12px}
  .ld-h1{font-size:clamp(36px,10.5vw,44px);margin:16px 0 12px}
  .ld-lead{font-size:16px;line-height:1.55}
  .ld-cta{flex-direction:column;margin-top:24px}
  .ld-cta a{width:100%;text-align:center}
  .ld-trust{margin-top:16px;gap:8px 16px}
}

/* sections */
.ld-sec{padding:64px 0 0}
@media(min-width:900px){.ld-sec{padding:96px 0 0}}
.ld-h2{font:900 clamp(26px,4.5vw,42px)/1.08 var(--disp);letter-spacing:-.02em;margin:8px 0 12px;color:var(--ink);text-transform:none}
.ld-kick{font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember)}
.ld-sub{color:var(--ink2);font-size:16px;line-height:1.6;max-width:640px}
.ld-tabs{margin:28px 0 16px;position:sticky;top:8px;z-index:6}
.ld-tabs button{padding:12px 16px}
.ld-panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px 16px}
@media(min-width:760px){.ld-panel{padding:28px}}
.ld-two{display:grid;gap:20px}
.ld-two>*{min-width:0}
.ld-panel,.ld-panel .card{min-width:0;overflow:hidden}
.ld-panel .codewrap{max-width:100%}
.ld-panel .codearea{max-width:100%;overflow-x:auto}
@media(min-width:760px){.ld-two{grid-template-columns:1fr 1fr;gap:28px}}
.ld-panel .card{background:var(--surface2);border-color:var(--line2)}
.ld-feat{display:grid;gap:16px;margin-top:28px}
@media(min-width:700px){.ld-feat{grid-template-columns:repeat(3,1fr);gap:20px}}
.ld-fc{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px 20px}
.ld-fc .n{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:12px;background:var(--grad);color:#1A0D05;font:900 15px var(--disp);margin-bottom:16px}
.ld-fc b{display:block;font:800 18px var(--disp);margin-bottom:8px}
.ld-fc p{color:var(--ink2);font-size:14px;line-height:1.55}
/* the seven wizard screens, in a speech bubble hanging off card 2 */
.snakewrap{position:relative;margin-top:28px;background:var(--surface);border:1px solid var(--line2);border-radius:16px;padding:16px 16px 16px}
.snakewrap::before{content:'';position:absolute;top:-8px;left:50%;width:14px;height:14px;background:var(--surface);border-left:1px solid var(--line2);border-top:1px solid var(--line2);transform:translateX(-50%) rotate(45deg)}
.snakecap{font:700 11px var(--disp);letter-spacing:.14em;text-transform:uppercase;color:var(--ember);margin-bottom:12px}
.snake{list-style:none;display:flex;flex-direction:column;gap:24px;margin:0;padding:0}
.snake li{position:relative;display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:8px 12px 8px 8px;font:700 13px var(--body);color:var(--ink);white-space:nowrap}
.snake li b{flex:none;width:22px;height:22px;border-radius:8px;background:var(--grad);color:#1A0D05;font:900 12px var(--disp);display:inline-flex;align-items:center;justify-content:center}
.snake li::after{position:absolute;color:var(--ember);font:900 15px var(--disp);line-height:1}
.snake li:not(:last-child)::after{content:'↓';left:50%;bottom:-20px;transform:translateX(-50%)}
@media(min-width:760px){
  .snake{flex-direction:row;justify-content:space-between;gap:20px}
  .snake li{flex:0 1 auto;min-width:0}
  .snake li:not(:last-child)::after{content:'→';left:auto;right:-16px;bottom:auto;top:50%;transform:translateY(-50%)}
}

.ld-shape{display:grid;gap:12px;margin-top:28px}
@media(min-width:700px){.ld-shape{grid-template-columns:repeat(3,1fr);gap:16px}}
.ld-sh{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 20px;display:flex;gap:12px;align-items:flex-start}
.ld-sh .e{font-size:24px;flex:none;line-height:1.2}
.ld-sh b{display:block;font:800 15px var(--disp);margin-bottom:4px}
.ld-sh p{color:var(--ink2);font-size:14px;line-height:1.5}
.ld-priv{background:linear-gradient(135deg,#FF6B3512,#5EA2FF0e);border:1px solid var(--line2);border-radius:var(--r);padding:24px 20px;margin-top:8px;display:grid;gap:20px}
@media(min-width:760px){.ld-priv{grid-template-columns:1.2fr 1fr;padding:36px;gap:32px}}
.ld-priv ul{list-style:none;display:grid;gap:12px}
.ld-priv li{display:flex;gap:12px;color:var(--ink2);font-size:14px;line-height:1.5}
.ld-priv li i{flex:none;width:22px;height:22px;border-radius:99px;background:#3DDC9722;color:var(--mint);display:inline-flex;align-items:center;justify-content:center;font:800 12px var(--disp);margin-top:2px}
.ld-foot{margin-top:70px;padding:40px 0 12px;border-top:1px solid var(--line);display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px}
.ld-foot .tiny a{color:var(--ink3)}
.ld-code{background:#0E121B;border:1px solid var(--line2);border-radius:var(--rs);padding:16px;font:13px/1.6 var(--mono);color:#CFE3FF;overflow-x:auto;white-space:pre;margin-top:12px}
.ld-code .k{color:var(--ember2)}.ld-code .s{color:var(--mint)}.ld-code .c{color:var(--ink3)}
.ld-slot{padding:8px 12px;font:700 13px var(--disp)}
.ld-slot.on{background:var(--mint);border-color:var(--mint);color:#062A1C}
.ld-modal{position:fixed;inset:0;background:rgba(5,7,11,.75);backdrop-filter:blur(4px);z-index:80;display:none;align-items:center;justify-content:center;padding:16px}
.ld-modal.on{display:flex}
.rv{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none}.laptop,.phone{transition:none}}
</style>
<div class="bgfx" aria-hidden="true"><i></i></div>

<header class="ld-top">
  <a class="logo" href="/" style="font-size:24px">LOCK<em>IN</em> 🔥</a>
  <div class="row" style="gap:4px"><a href="/login" class="ld-btn ghost" style="padding:12px 12px">Sign in</a><a href="/signup" class="ld-btn pri" style="padding:12px 16px">Create account</a></div>
</header>

<section class="ld-hero">
  <div class="ld-copy">
  <span class="ld-eyebrow">🎓 For CS students on the job hunt</span>
  <h1 class="ld-h1">Lock in. Track the grind. <em>Land your Goal.</em></h1>
  <p class="ld-lead">Daily goals for every category you grind, a focus timer, a <b>LeetCode log</b> that knows a rerun from a solve, an <b>application tracker</b> with a funnel, schedule blocks that step around your gym and classes, streaks, pace against your plan and a finish-line forecast. <b>Phone first, laptop ready.</b></p>
  <div class="ld-cta"><a class="ld-btn pri big" href="/signup">Create your account</a><a class="ld-btn big" href="#tour">See every tab ↓</a></div>
  <div class="ld-trust"><span><i></i>Free</span><span><i></i>Open source, MIT</span><span><i></i>Your own private database</span><span><i></i>Set up in three minutes</span></div>
  </div>

  <div class="ld-demo">
  <div class="stage rv" id="stage">
    <div class="laptop" id="devLaptop" title="Show the laptop view">
      <div class="lp-screen"><div class="lp-view"><div class="lp-canvas">
        <aside class="lp-side"><div class="logo">LOCK<em>IN</em> 🔥</div>${NAV.map(([i, l, on]) => `<a class="${on ? 'on' : ''}">${ic(i, 18)}${l}</a>`).join('')}</aside>
        <main class="lp-main">
          <div class="lp-hdr">${header()}${race(22)}</div>
          <div class="lp-cols">
            <div>
              <h2>Tasks</h2>
              <div class="card">${task('🧩', '3 LeetCode problems', 'Attempts count here too', 2, 3)}${task('📨', '2 applications', 'Auto-checks when the counter hits 2', 1, 2)}<div class="task"><div class="box">✓</div><div class="grow"><div class="t"><span class="track-ic">📚</span>Graph algorithms · week 3 assignment</div><div class="d">Day 2 of 3. Shortest paths on a weighted graph, then the write-up. Sort the edges first, the rest follows.</div></div></div></div>
              <h2>Schedule</h2>
              <div class="card"><div class="tl2">${timeline()}</div><div class="cardfoot"><button class="sm ghost" tabindex="-1">✍️ Log a past grind</button><button class="sm pri" tabindex="-1">🔥 Start grind now</button></div></div>
            </div>
            <div>
              <h2>Daily counters</h2>
              <div class="ringrow two">${(ring('lc', '🧩', 'LeetCode', 2, 3, '#FF6B35') + ring('ap', '📨', 'Applications', 1, 2, '#5EA2FF')).replace(/<div class="ld-ring"/g, '<div class="card ringcard ld-ring"')}</div>
              <h2>Day clock</h2>
              <div class="card">${clockSvg()}<p class="tiny" style="text-align:center;margin-top:12px">Two things at once? The one closer to now takes the outer lane.</p></div>
              <h2>Focus timer</h2>
              <div class="card">${timer(132)}</div>
            </div>
          </div>
        </main>
      </div></div></div>
      <div class="lp-base"></div>
    </div>
    <div class="phwrap"><div class="phone" id="devPhone" title="Show the phone view"><div class="ph-view"><div class="ph-canvas"><div class="ph-scroll">
      ${header()}
      ${race(18)}
      <h2>Goals</h2>
      <div class="ringrow">${rings().replace(/<div class="ld-ring"/g, '<div class="card ringcard ld-ring"')}</div>
      <h2>Focus timer</h2>
      <div class="card">${timer(108)}<p class="tiny" style="text-align:center;margin-top:12px" id="dmHint">The same clock follows you to every tab. Press Done and it asks how the problem went.</p></div>
      <h2>Schedule</h2>
      <div class="card"><div class="tl2">${timeline()}</div></div>
    </div></div></div></div></div>
  </div>
  <div class="stagecap" role="tablist" aria-label="device"><button class="on" data-dev="laptop">💻 Laptop</button><button data-dev="phone">📱 Phone</button></div>
  <p class="devhint">Tap the phone to bring it forward. Tap + on a ring, start the timer: both screens follow.</p>
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
        <div class="row" style="margin-bottom:12px"><b style="font:800 18px var(--disp)" class="grow">Attempts</b><span class="tiny">newest first</span></div>
        <div class="tiny" style="margin-bottom:8px">Come back to these</div>
        <div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:16px"><span class="chip">${outb(2)} Coin Change <span class="tiny">×2 · 48m</span></span><span class="chip">${outb(0)} LRU Cache <span class="tiny">×1 · 25m</span></span></div>
        <div id="ldLcRows">${LC.map(lcRow).join('')}</div>
        <p class="hint">A problem's state is its <b>newest</b> attempt. Reruns stack on the same name, so "solved" means solved clean, not "touched once".</p>
      </div>
      <div>
        <div class="card" style="margin:0"><div class="row" style="flex-wrap:wrap;gap:8px"><span class="diff medium">MEDIUM</span><b style="font:800 16px var(--disp)">Coin Change</b><span class="grow"></span><span class="savetick on">SAVED</span></div>
          <p style="margin-top:12px;font-size:15px;line-height:1.6">Bottom-up DP over amounts. dp[a] = min coins for a. Slow the first time because I recomputed subproblems; second try 31m.</p>
          <div class="codewrap"><span class="codetag">PYTHON</span><pre class="codearea" style="margin:0">dp = [0] + [inf] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c &lt;= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
return dp[amount] if dp[amount] &lt; inf else -1</pre></div>
          <div class="row" style="gap:8px;flex-wrap:wrap"><span class="chip" style="font-size:12px">⏱ median 18m</span><span class="chip" style="font-size:12px;color:var(--mint)">↓ 4m vs last week</span><span class="chip" style="font-size:12px">38 solved · 150 target</span></div>
        </div>
        <p class="hint">One living note per problem, with a code block and an array visualiser for pointer problems. The timer's "Done" opens the log with the minutes filled in.</p>
      </div>
    </div>
  </div>

  <div class="tabpane ld-panel" id="ldp-jobs">
    <div class="ld-two">
      <div>
        <b style="font:800 18px var(--disp)">Funnel</b>
        <div id="ldFunnel" style="margin-top:12px"></div>
        <p class="hint">Change a status on the right and watch it move.</p>
        <div class="tiny" style="margin:20px 0 8px">Platforms</div>
        <div class="row" style="flex-wrap:wrap;gap:8px"><span class="chip">LinkedIn <b class="num">11</b></span><span class="chip">Handshake <b class="num">6</b></span><span class="chip">Company site <b class="num">5</b></span><span class="chip">Referral <b class="num">2</b></span></div>
        <div class="card" style="margin:20px 0 0"><b style="font:800 14px var(--disp)">🤖 Let an agent do the typing</b><p class="tiny" style="margin-top:4px">A separate API key gives Claude Code full access to this tab only: log, find, edit, change status, delete. Adding bumps today's counter, deleting takes it back.</p></div>
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
        <b style="display:block;font:800 15px var(--disp);margin-top:24px">When you actually grind</b>
        <div class="dow">${DOW.map(([d, h]) => `<div class="dw"><div class="bar"><i style="height:${Math.round(h / 6.2 * 100)}%;background:${h >= 5 ? 'var(--ember)' : h >= 3 ? 'var(--ember2)' : 'var(--surface3)'}"></i></div><b>${h}</b><span>${d}</span></div>`).join('')}</div>
        <b style="display:block;font:800 15px var(--disp);margin-top:24px">Last 12 weeks</b>
        <div style="overflow-x:auto;padding-bottom:4px;margin-top:8px"><div class="heat">${heat()}</div></div>
      </div>
      <div>
        <b style="font:800 15px var(--disp)">Finish line · Dec 15</b>
        ${pj('🧩', 'LeetCode', 38, 150, 152, 'At this pace you cross <b>150</b> with two days to spare.', '#FF6B35')}
        ${pj('📨', 'Applications', 24, 120, 96, 'On pace for <b>96</b>. One extra application a week closes the gap.', '#5EA2FF')}
        <p class="hint">Pace counts clean solves only. Attempts count for the daily goal. Solve-time stats count solved and slow. Three questions, three sets.</p>
      </div>
    </div>
  </div>

  <div class="tabpane ld-panel" id="ldp-share">
    <div class="ld-two">
      <div class="card" style="margin:0">
        <b style="font:800 16px var(--disp)">🔒 Progress for friends</b>
        <p class="tiny" style="margin-top:4px">A read-only copy of your Progress tab behind a PIN you choose. You decide what shows: overview, LeetCode, grind hours, jobs funnel without company names, off-day reasons.</p>
        <div id="ldShareGate"><label class="fld">PIN</label><div class="row"><input id="ldPin" inputmode="numeric" placeholder="try 1234" style="flex:1"><button class="pri" data-act="pin">Open</button></div><div class="tiny" id="ldPinMsg" style="margin-top:8px;min-height:14px"></div></div>
        <div id="ldShareOpen" style="display:none">
          <div class="csum" style="grid-template-columns:repeat(2,1fr);margin-top:12px"><div class="ci"><b>12</b><span>🔥 streak</span></div><div class="ci"><b>38</b><span>solved</span></div><div class="ci"><b>61h</b><span>grind</span></div><div class="ci"><b>24</b><span>applied</span></div></div>
          <div class="tiny">Friends see numbers, never your notes and never company names unless you allow it.</div>
        </div>
      </div>
      <div class="card" style="margin:0">
        <b style="font:800 16px var(--disp)">🎮 Book Sam's free time</b>
        <p class="tiny" style="margin-top:4px">Your public page at <span class="num">/u/sam/book</span>. Whatever is left of your bookable windows after grind blocks and side tasks is what friends can grab. Approve or decline from the Friends tab.</p>
        <label class="fld">Tue, Sep 8 · 12:00 PM – 3:00 PM</label>
        <div class="row" style="flex-wrap:wrap;gap:8px" id="ldSlots"><button class="ld-slot" data-slot="12:00 PM">12:00</button><button class="ld-slot" data-slot="12:30 PM">12:30</button><button class="ld-slot" data-slot="2:00 PM">2:00</button><button class="ld-slot" data-slot="2:30 PM">2:30</button></div>
        <div class="tiny" style="margin-top:8px">1:00 to 2:00 is already Jordan's.</div>
        <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><span class="chip">🎮 game</span><span class="chip">💬 talk</span><span class="chip">📋 task</span></div>
        <div id="ldBookMsg" class="tiny" style="margin-top:12px;min-height:16px;color:var(--mint)"></div>
      </div>
    </div>
    <p class="hint" style="margin-top:16px">Both live under your handle. Turn the Friends module off and the booking page disappears entirely. The share link stops working the moment you clear the PIN.</p>
  </div>

  <div class="tabpane ld-panel" id="ldp-api">
    <div class="ld-two">
      <div>
        <b style="font:800 18px var(--disp)">Let Claude read your log</b>
        <p class="ld-sub" style="font-size:15px;margin-top:8px">A read-only key exposes three endpoints: LeetCode, jobs, progress. Every response starts with a <b>guide</b> that spells out the counting rules for your account, so the model reads the numbers the way the app counts them. Works in Claude Code and in claude.ai chat.</p>
        <div class="seg-ctl" style="margin-top:16px;max-width:320px" id="ldApiSeg"><button class="on" data-api="cc">Claude Code</button><button data-api="web">Browser Claude</button></div>
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
        <p class="hint">Notes are never returned. The key cannot write. Regenerate it any time from Settings.</p>
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
    <div class="ld-fc"><span class="n">2</span><b>Set up in seven steps</b><p>Each one is a single screen with a live preview. The seven screens run in the order shown below.</p></div>
    <div class="ld-fc"><span class="n">3</span><b>Open Today</b><p>Your goals, your blocks, your timer. Log a problem, press + on a ring, check in to a block. The streak starts counting.</p></div>
  </div>
  <div class="snakewrap rv"><div class="snakecap">Step 2, screen by screen</div><ol class="snake" aria-label="the seven setup screens, in order">${STEP_NAMES.map((s, i) => `<li class="s${i + 1}"><b>${i + 1}</b><span>${s}</span></li>`).join('')}</ol></div>
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
  <div class="logo" style="font-size:28px">LOCK<em>IN</em> 🔥</div>
  <p class="ld-sub" style="text-align:center">The finish line is a date. Start counting.</p>
  <div class="ld-cta" style="margin-top:4px;justify-content:center"><a class="ld-btn pri big" href="/signup">Create your account</a><a class="ld-btn big" href="/login">Sign in</a></div>
  <p class="tiny"><a href="https://github.com/ma9197/LockIn" target="_blank" rel="noopener">GitHub</a> · MIT license · built on Cloudflare Workers</p>
</footer>

<div class="ld-modal" id="ldModal"></div>
`, `<script>
// ---- laptop mock: render the desktop layout at 1180x720 and scale it to the frame ----
function lpScale(){document.querySelectorAll('.stage').forEach(st=>{const l=st.querySelector('.laptop'),v=st.querySelector('.lp-view'),lw=v?v.clientWidth:0;
if(lw>0){const s=(lw/1180).toFixed(4);l.style.setProperty('--lps',s);st.style.setProperty('--lps',s);st.style.setProperty('--ppb',s);}
else{const w=st.querySelector('.phwrap');st.style.setProperty('--ppb',Math.min(1,((w?w.clientWidth:375)-24)/375).toFixed(4));}});}
window.addEventListener('resize',lpScale);lpScale();
setTimeout(lpScale,700);

// ---- device stage: tap the phone to bring it forward, tap the laptop to send it back ----
const STG=$('stage');
function ldDev(which){const front=which==='phone';STG.classList.toggle('front',front);
document.querySelectorAll('.stagecap button').forEach(b=>b.classList.toggle('on',b.dataset.dev===which));
setTimeout(lpScale,650);}
$('devPhone').addEventListener('click',e=>{if(!STG.classList.contains('front')&&window.innerWidth>=900){ldDev('phone');}});
$('devLaptop').addEventListener('click',e=>{if(STG.classList.contains('front')){ldDev('laptop');}});
document.querySelectorAll('.stagecap button').forEach(b=>b.onclick=()=>ldDev(b.dataset.dev));

// ---- reveal on scroll ----
(function(){const els=document.querySelectorAll('.rv');
if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));ldRingsIn();ldCount();return;}
const io=new IntersectionObserver(en=>{en.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);
if(x.target.id==='stage')ldRingsIn();}})},{threshold:.12});
els.forEach(e=>io.observe(e));})();
function ldRingsIn(){document.querySelectorAll('.ld-ring .arc').forEach(a=>{setTimeout(()=>{a.style.strokeDashoffset=a.dataset.off;},120);});}

// ---- goal rings (both devices share the numbers) ----
const LDR={lc:2,ap:1,sd:0};
function ldRing(k,done){document.querySelectorAll('.ld-ring[data-k="'+k+'"]').forEach(el=>{
const goal=+el.dataset.goal,col=el.dataset.color,hit=done>=goal,pct=Math.min(1,done/goal);
const arc=el.querySelector('.arc');arc.style.strokeDashoffset=String(289*(1-pct));arc.style.stroke=hit?'var(--mint)':col;
el.querySelector('.val b').textContent=done;
el.querySelector('.extra').innerHTML=done>goal?'+'+(done-goal)+' EXTRA \\uD83D\\uDCAA':hit?'GOAL HIT \\u2713':'&nbsp;';});}
function ldBump(k,d){LDR[k]=Math.max(0,LDR[k]+d);ldRing(k,LDR[k]);
const goal=+document.querySelector('.ld-ring[data-k="'+k+'"]').dataset.goal;
if(d>0&&LDR[k]===goal)toast('Goal hit. The streak keeps counting.');}

// ---- focus timer (its own clock, mirrored on both devices) ----
let DM={len:25,left:1500,run:false,paused:false,int:null,elapsed:0};
const dmFmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const all=(c,f)=>document.querySelectorAll('.'+c).forEach(f);
function dmDraw(){const t=(DM.left>=0?'':'+')+dmFmt(Math.abs(DM.left));
all('dmT',el=>{el.textContent=t;el.style.color=DM.left<0?'var(--rose)':'';});
all('dmArc',el=>{el.style.strokeDashoffset=String(534*(1-Math.max(0,DM.left)/(DM.len*60)));el.style.stroke=DM.left<0?'var(--rose)':'var(--ember)';});
all('dmSub',el=>{el.textContent=DM.run?(dmFmt(DM.elapsed)+' elapsed'):(DM.len+' min');});
all('dmGo',el=>{el.textContent=DM.run?'\\u2713 Done':'Start';});
all('dmPause',el=>{el.style.display=DM.run?'':'none';el.textContent=DM.paused?'\\u25B6 Resume':'\\u23F8 Pause';});}
function hint(t){const h=$('dmHint');if(h)h.innerHTML=t;}
function dmTick(){if(DM.paused)return;DM.left--;DM.elapsed++;dmDraw();
if(DM.left===0)hint('\\u23F0 Past the timer. Still counting, press Done when you finish.');}
function dmGo(){if(DM.run){dmDone();return;}
DM.run=true;DM.paused=false;DM.elapsed=0;DM.left=DM.len*60;clearInterval(DM.int);DM.int=setInterval(dmTick,1000);dmDraw();
hint('\\uD83E\\uDDE9 Recording \\u00b7 press Done when the problem is solved');}
function dmPause(){if(!DM.run)return;DM.paused=!DM.paused;dmDraw();
hint(DM.paused?'\\u23F8 Paused \\u00b7 still yours when you come back':'Back at it.');}
function dmReset(){clearInterval(DM.int);DM.run=false;DM.paused=false;DM.left=DM.len*60;DM.elapsed=0;dmDraw();
hint('Stuck at 25? Read the solution. Do not grind for 2 hours.');}
function dmDone(){const mins=Math.max(1,Math.round(DM.elapsed/60));clearInterval(DM.int);DM.run=false;DM.paused=false;DM.left=DM.len*60;DM.elapsed=0;dmDraw();
hint('\\u2705 Finished \\u00b7 <b class="num">'+mins+'m</b> \\u00b7 now log it');ldLogOpen(mins);}

// ---- log modal ----
let LDLOG={diff:'medium'};
function ldLogOpen(mins){LDLOG={diff:'medium'};
$('ldModal').innerHTML='<div class="modal" onclick="event.stopPropagation()"><h1 style="font-size:20px">\\uD83E\\uDDE9 Log a LeetCode problem</h1>'
+'<p class="muted" style="margin-top:4px">All three count for today. \\u26a1 Solved, slow is not counted as solved and stays in your come-back list.</p>'
+'<div class="fg" style="margin-top:16px"><label class="fld">Difficulty</label><div class="seg-ctl" id="ldDiff"><button data-diff="easy">Easy</button><button data-diff="medium" class="on">Medium</button><button data-diff="hard">Hard</button></div></div>'
+'<div class="fg"><label class="fld">Minutes spent</label><input id="ldMin" type="number" inputmode="numeric" value="'+(mins||'')+'" placeholder="e.g. 22"></div>'
+'<div class="fg"><label class="fld">Problem name</label><input id="ldName" placeholder="Start typing, past attempts match here" value="Merge Intervals">'
+'<div class="hint">New problem, nothing like it logged before.</div></div>'
+'<div class="row" style="margin-top:20px;flex-wrap:wrap"><button class="mint grow" data-out="1">\\u2713 Solved \\u00b7 +1</button><button class="grow" style="border-color:#9B6EF388;color:var(--violet)" data-out="2">\\u26a1 Solved, slow</button><button class="grow" data-out="0">\\u2715 Did not finish</button></div>'
+'<button class="ghost" style="width:100%;margin-top:12px" data-act="close">Cancel</button></div>';
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
const LDJ0=${JSON.stringify(JOBS.map(j => j[3]))};
function ldFunnel(){const c={applied:0,oa:0,interview:0,offer:0,rejected:0};
LDJ.forEach(s=>c[s]++);
const base=LDJ0.reduce((a,s)=>{a[s]=(a[s]||0)+1;return a;},{});
const tot={};for(const k of Object.keys(c))tot[k]=LDBASE[k]-(base[k]||0)+c[k];
const reached={applied:tot.applied+tot.oa+tot.interview+tot.offer+tot.rejected,oa:tot.oa+tot.interview+tot.offer,interview:tot.interview+tot.offer,offer:tot.offer};
const max=reached.applied||1;
$('ldFunnel').innerHTML=['applied','oa','interview','offer'].map(k=>'<div class="funnel-row"><span class="fl">'+STC[k][0]+'</span><div><div class="fb" style="width:'+Math.max(8,Math.round(reached[k]/max*100))+'%;background:'+STC[k][1]+'">'+reached[k]+'</div></div><span class="fp">'+Math.round(reached[k]/max*100)+'%</span></div>').join('')
+'<div class="tiny" style="margin-top:8px">'+tot.rejected+' rejected \\u00b7 '+Math.round(reached.interview/max*100)+'% of applications reach an interview</div>';
document.querySelectorAll('#ldJobs .item').forEach((el,i)=>{el.style.setProperty('--ac',STC[LDJ[i]][1]);});}
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
