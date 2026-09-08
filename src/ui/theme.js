// LockIn design system: "night gym": deep blue-black, molten ember, hyperlegible body
// Display: Archivo · Body: Atkinson Hyperlegible (designed for readability) · Data: tabular numerals

export const CSS = `
:root{
  --bg:#0B0E14;--surface:#131824;--surface2:#1B2231;--surface3:#232C3E;--line:#263045;--line2:#313D57;
  --well:#0E121B;
  --ink:#EDF1F7;--ink2:#97A3B6;--ink3:#5C6779;
  --ember:#FF6B35;--ember2:#FFB347;--ice:#5EA2FF;--mint:#3DDC97;--rose:#FF5D73;--violet:#9B6EF3;
  --grad:linear-gradient(135deg,#FF6B35,#FFB347);
  --r:16px;--rs:10px;
  --disp:'Archivo',system-ui,sans-serif;
  --body:'Atkinson Hyperlegible',system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ink);font:16px/1.55 var(--body);padding-bottom:calc(74px + env(safe-area-inset-bottom))}
a{color:var(--ice);text-decoration:none}
::selection{background:#FF6B3555}
h1{font:800 24px/1.2 var(--disp);letter-spacing:-.01em}
h2{font:700 12px/1 var(--disp);color:var(--ink2);margin:28px 0 12px;text-transform:uppercase;letter-spacing:.14em}
.cardfoot{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}

/* ---------- shared page language: header, section rows, empty states, editable rows ---------- */
.ph{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin:0 0 4px}
.ph-t{flex:1;min-width:180px}
.ph-t h1{font-size:26px;line-height:1.1}
.ph-d{margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--ink2);max-width:60ch}
.ph-a{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding-top:4px}
.sech{display:flex;align-items:center;gap:10px;margin:28px 0 12px}
.sech h2{margin:0;flex:1;min-width:0}
.sech .tiny{white-space:nowrap}
.skel b{display:block;color:var(--ink);font:800 15px var(--disp);margin-bottom:4px}
.empty{padding:26px 16px;text-align:center;color:var(--ink2);font-size:14px;line-height:1.55;border:1px dashed var(--line2);border-radius:var(--r)}
.empty b{display:block;color:var(--ink);font:800 15px var(--disp);margin-bottom:4px}
.empty>button,.empty>a{margin-top:14px}
.hint{font-size:13px;line-height:1.5;color:var(--ink2);opacity:.85;margin-top:8px}
.fg{margin-top:22px}.fg:first-child{margin-top:0}
.fg>label.fld{margin:0 0 8px;color:var(--ink2);letter-spacing:.08em}
.cklab{font:700 11px var(--disp);color:var(--ink2);text-transform:uppercase;letter-spacing:.08em;margin-top:14px}
.cklab:first-child{margin-top:0}
.item{background:var(--surface2);border:1px solid var(--line2);border-left:4px solid var(--ac,var(--line2));border-radius:14px;padding:14px;margin-top:12px}
.item:first-child{margin-top:0}
.item input,.item select,.item textarea{background:var(--well)}
.item.dim{opacity:.5}
.ihead{display:flex;align-items:center;gap:10px}
.ihead input.nm{flex:1;min-width:0;font-weight:700;padding:10px 12px}
.ihead b.nm{flex:1;min-width:0;font:800 16px var(--disp);text-transform:capitalize;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ihead .who,.disc .who{flex:1;min-width:0}
.ihead .who b,.disc .who b{display:block;font:800 15px var(--disp)}
.ihead .who .tiny,.disc .who .tiny{margin-top:2px;font-size:13px}
.tile{width:40px;height:40px;border-radius:11px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;background:var(--surface3);border:1px solid var(--line2);flex:none}
.ibody{margin-top:12px}
.ifoot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.xbtn{width:38px;height:38px;padding:0;border-radius:10px;background:transparent;border:1px solid transparent;color:var(--ink3);font-size:16px;display:inline-flex;align-items:center;justify-content:center;flex:none}
.xbtn:hover{border-color:#FF5D7355;color:var(--rose);background:#FF5D7314}
.addbtn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:13px;border:1px dashed var(--line2);background:transparent;color:var(--ink2);border-radius:12px;font:700 14px var(--disp)}
.addbtn:hover{border-color:var(--ember);color:var(--ember)}
.togrow{display:flex;align-items:center;gap:14px;padding:13px 0;border-top:1px solid var(--line)}
.togrow:first-child{border-top:0;padding-top:0}
.togrow:last-child{padding-bottom:0}
.togrow b{display:block;font:700 15px var(--body)}
.togrow .tiny{margin-top:2px;font-size:13px;color:var(--ink2);opacity:.85}
.kv{display:flex;gap:8px;align-items:center}
.kv input{font:13px var(--mono);color:var(--ink2);background:var(--well)}
.kv button{flex:none}
.disc{display:flex;align-items:center;gap:12px;cursor:pointer;-webkit-tap-highlight-color:transparent}

/* ---------- quiet animated background for the public pages ---------- */
.bgfx{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.bgfx:before,.bgfx:after{content:'';position:absolute;width:70vmax;height:70vmax;border-radius:50%;filter:blur(90px);opacity:.26;will-change:transform}
.bgfx:before{left:-28vmax;top:-32vmax;background:radial-gradient(circle,#FF6B35 0%,rgba(255,107,53,0) 62%);animation:bgdrift1 52s ease-in-out infinite alternate}
.bgfx:after{right:-30vmax;bottom:-34vmax;background:radial-gradient(circle,#5EA2FF 0%,rgba(94,162,255,0) 62%);animation:bgdrift2 68s ease-in-out infinite alternate}
.bgfx i{position:absolute;inset:0;background-image:radial-gradient(rgba(237,241,247,.075) 1px,transparent 1.3px);background-size:26px 26px;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 50%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 50%,transparent 100%)}
@keyframes bgdrift1{from{transform:translate(0,0) scale(1)}to{transform:translate(12vw,10vh) scale(1.12)}}
@keyframes bgdrift2{from{transform:translate(0,0) scale(1)}to{transform:translate(-10vw,-12vh) scale(1.08)}}
@media(prefers-reduced-motion:reduce){.bgfx:before,.bgfx:after{animation:none}}
@media(max-width:600px){.bgfx:before,.bgfx:after{filter:blur(60px);opacity:.22}}
.bgfx.dots:before,.bgfx.dots:after{display:none}

/* ---------- auth + public single-card pages ---------- */
.auth{max-width:440px;margin:5vh auto 0;padding:0 2px}
.auth .logo{font-size:30px;margin-bottom:22px;display:block;text-align:center}
.auth .card{padding:24px 20px;margin:0;box-shadow:0 30px 80px #0007}
@media(min-width:600px){.auth .card{padding:30px 28px}}
.auth h1{font-size:24px;margin:0 0 6px;letter-spacing:-.01em}
.auth .lead{color:var(--ink2);font-size:14px;line-height:1.5;margin:0}
.auth .fg{margin-top:18px}
.auth button.pri{width:100%;margin-top:22px;padding:14px;font:800 16px var(--disp);border-radius:14px}
.auth .alt{text-align:center;margin-top:18px;font-size:13.5px;color:var(--ink2)}
.auth .alt a{font-weight:700}
.auth .foot{text-align:center;margin-top:22px;font-size:12.5px;color:var(--ink3)}
.auth .foot a{color:var(--ink3);font-weight:700}
.pwwrap{position:relative}
.pwwrap input{padding-right:70px}
.pwwrap button{position:absolute;right:6px;top:50%;transform:translateY(-50%);padding:6px 10px;font:700 12px var(--disp);background:var(--surface3);border-color:transparent;color:var(--ink2)}
.ferr{color:var(--rose);font-size:13px;min-height:18px;margin-top:12px;font-weight:700}
.ferr.ok{color:var(--mint)}
.pub{max-width:640px;margin:0 auto}
.pub-hd{text-align:center;padding:14px 0 6px}
.pub-hd .tile{width:64px;height:64px;font-size:32px;border-radius:20px;margin-bottom:12px}
.pub-hd h1{font-size:24px;margin:6px 0 0}
.pub-hd p{color:var(--ink2);font-size:14px;line-height:1.55;max-width:44ch;margin:8px auto 0}
.pub .foot{text-align:center;margin:30px 0 8px;font-size:12.5px;color:var(--ink3)}
.pub .foot a{color:var(--ink3);font-weight:700}

/* ---------- Today header ---------- */
.dh-top{display:flex;align-items:center;gap:10px 12px;flex-wrap:wrap}
.dh-title{flex:1;min-width:120px}
.dh-title h1{font-size:28px;line-height:1.05}
.dh-chips{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}
.dh-chips .chip,.dh-chips .pill{padding:7px 12px;font:700 12.5px var(--disp);border-radius:99px}
.dh-chips .pill:empty{display:none}
.dh-chips button.chip{cursor:pointer;color:var(--ink)}
.dh-chips button.chip:hover{border-color:var(--ink3)}
.dh-nav{display:flex;align-items:center;gap:10px;margin-top:14px}
.dh-date{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font:700 15px var(--disp);color:var(--ink);text-align:center}
.dh-btn{width:40px;height:40px;padding:0;border-radius:12px;background:var(--surface2);border:1px solid var(--line2);color:var(--ink2);font-size:22px;line-height:1;flex:none}
.dh-btn:hover{color:var(--ink);border-color:var(--ink3)}
@media(max-width:560px){.dh-chips{margin-left:0;width:100%}}

/* ---------- goal rings row ---------- */
.ringrow{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(104px,1fr);gap:10px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 6px;scroll-snap-type:x proximity;margin:0 -2px}
.ringrow::-webkit-scrollbar{display:none}
.ringrow.few{grid-auto-columns:1fr}
.ringcard{margin:0;padding:14px 8px 12px;scroll-snap-align:start;min-width:0}
.ringlab{font:700 10.5px/1.25 var(--disp);color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:26px}
.ringrow .ring{width:84px;height:84px}
.ring svg{width:100%;height:100%;display:block}
.ringrow .ring .val b{font-size:24px}
.ringrow .ring .val span{font-size:9.5px}
.ringrow .extra{font-size:10.5px;margin-top:8px}
.ringbtns{display:flex;justify-content:center;gap:8px;margin-top:8px}
.ringbtns button{min-width:44px;padding:8px 0}
@media(min-width:600px){.ringrow{grid-auto-columns:minmax(150px,1fr)}.ringrow .ring{width:112px;height:112px}.ringrow .ring .val b{font-size:30px}.ringrow .ring .val span{font-size:11px}.ringcard{padding:16px 10px 14px}.ringbtns{gap:12px}.ringbtns button{min-width:56px}}
@media(min-width:900px){.ringrow{grid-auto-flow:row;grid-template-columns:repeat(auto-fit,minmax(108px,1fr));overflow:visible}.ringrow .ring{width:96px;height:96px}.ringrow .ring .val b{font-size:26px}.ringbtns button{min-width:44px}}
@media(max-width:899px){
  .cols,#colA,#colB{display:contents}
  #dash{display:flex;flex-direction:column}
  #dash>*{order:0}
  #secRings{order:1}#secSchedule{order:2}#secTimer{order:3}#secTasks{order:4}#secStats{order:5}#clockSection{order:6}
}
.wrap{max-width:660px;margin:0 auto;padding:calc(var(--clkh,46px) + 16px) 16px 18px}
.liveclock{position:fixed;top:10px;right:12px;z-index:70;font-variant-numeric:tabular-nums;color:var(--ink);
  display:flex;align-items:center;gap:6px}
.mc-pill{background:var(--surface);border:1px solid var(--line);border-radius:99px;padding:5px 13px;
  font-weight:800;font-family:var(--disp);box-shadow:0 2px 10px rgba(0,0,0,.35)}
.mc-pill small{color:var(--ink3);font-size:.72em;margin-left:4px}
.mc-led{background:#000;border:1px solid #1c1c1c;border-radius:8px;padding:4px 12px;
  font-family:'VT323',monospace;letter-spacing:1px;box-shadow:inset 0 0 12px rgba(0,0,0,.9),0 2px 10px rgba(0,0,0,.4)}
.mc-led small{font-size:.55em;margin-left:5px;opacity:.8}
.mc-flip{display:flex;align-items:center;gap:3px;font-family:var(--disp);font-weight:800}
.mc-flip .fc{background:linear-gradient(180deg,#222A38 48%,#161C28 52%);border:1px solid var(--line2);
  border-radius:7px;padding:4px 7px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.45)}
.mc-flip .fc:after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.55)}
.mc-flip .fap{font-size:.6em;color:var(--ink3);margin-left:3px;align-self:flex-end}
.mc-analog{background:var(--surface);border:1px solid var(--line);border-radius:99px;padding:3px;
  display:flex;align-items:center;gap:6px;box-shadow:0 2px 10px rgba(0,0,0,.35)}
.mc-analog .aap{font:800 .62em var(--disp);color:var(--ink3);padding-right:8px}
.mc-ring{background:var(--surface);border:1px solid var(--line);border-radius:99px;padding:3px 12px 3px 4px;
  display:flex;align-items:center;gap:8px;font-weight:800;font-family:var(--disp);box-shadow:0 2px 10px rgba(0,0,0,.35)}
.mc-ring small{color:var(--ink3);font-size:.7em;margin-left:3px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px;margin:10px 0}
.row{display:flex;align-items:center;gap:10px}.grow{flex:1;min-width:0}.right{margin-left:auto}
.muted{color:var(--ink2);font-size:14px}.tiny{color:var(--ink3);font-size:12px}
.num{font-family:var(--disp);font-variant-numeric:tabular-nums}

button{background:var(--surface2);color:var(--ink);border:1px solid var(--line2);border-radius:var(--rs);
  padding:10px 16px;font:700 15px var(--body);cursor:pointer;transition:transform .08s,filter .15s;-webkit-tap-highlight-color:transparent}
button:active{transform:scale(.96)}
button.pri{background:var(--grad);border:0;color:#1A0D05}
button.mint{background:var(--mint);border:0;color:#062A1C}
button.rose{background:transparent;border-color:#FF5D7355;color:var(--rose)}
button.ghost{background:transparent;border-color:transparent;color:var(--ink2)}
button.sm{padding:6px 12px;font-size:13px}
button:disabled{opacity:.35;pointer-events:none}
input,select,textarea{background:var(--surface2);color:var(--ink);border:1px solid var(--line2);border-radius:var(--rs);
  padding:11px 12px;font:16px var(--body);width:100%;color-scheme:dark}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--ember);outline-offset:1px}
label.fld{display:block;font:700 12px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.1em;margin:12px 0 5px}

.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;font:700 12px var(--disp);letter-spacing:.02em;white-space:nowrap}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--line2);border-radius:99px;padding:5px 12px;font-size:13px}
.avatar{width:30px;height:30px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;
  font:800 12px var(--disp);color:#0B0E14;flex:none}
.badge{position:absolute;top:4px;right:calc(50% - 22px);min-width:17px;height:17px;border-radius:99px;background:var(--rose);
  color:#fff;font:800 11px/17px var(--disp);text-align:center;padding:0 4px}

/* ---------- race bar (signature) ---------- */
.race{margin:14px 0 4px}
.race-track{display:flex;gap:1.5px;height:26px;border-radius:8px;overflow:hidden}
.race-seg{flex:1;background:var(--seg,#263045);opacity:.28;border-radius:1px;position:relative}
.race-seg.past{opacity:.9}
.race-seg.today{opacity:1;box-shadow:0 0 12px 2px var(--seg);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}
.race-cap{display:flex;justify-content:space-between;margin-top:7px;font:700 12px var(--disp);color:var(--ink3);letter-spacing:.08em}
.race-cap b{color:var(--ink);font-size:13px}

/* ---------- running grind chip: sits beside the clock on every page ---------- */
.grun{display:inline-flex;align-items:center;gap:6px;background:var(--surface);
  border:1px solid #FF6B3555;border-radius:99px;padding:4px 11px;white-space:nowrap;cursor:pointer;
  font:800 12px var(--disp);color:var(--ember);box-shadow:0 2px 10px rgba(0,0,0,.35);
  animation:grunpulse 2.8s ease-in-out infinite}
@keyframes grunpulse{0%,100%{opacity:.55}50%{opacity:1}}
.grun .gdot{width:7px;height:7px;border-radius:99px;background:var(--ember);flex:none}
@media(max-width:420px){.grun{padding:3px 8px;font-size:11px;gap:5px}}
@media(prefers-reduced-motion:reduce){.grun{animation:none;opacity:1}}

/* ---------- paused grind alert: a frozen clock is far too easy to forget ---------- */
.gpbar{position:fixed;top:0;left:0;right:0;z-index:85;display:flex;align-items:center;gap:8px;
  flex-wrap:nowrap;padding:11px 14px;border-bottom:2px solid var(--ember2);backdrop-filter:blur(10px);
  font:800 13px var(--disp);letter-spacing:.06em;color:var(--ember2);
  animation:gppulse 1.7s ease-in-out infinite}
.gpbar b{white-space:nowrap}
.gpbar .tiny{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.gpbar button{flex:none;white-space:nowrap}
@media(max-width:420px){.gpbar{font-size:12px;gap:6px;padding:10px 12px}.gpbar .tiny{font-size:11px}}
@keyframes gppulse{0%,100%{background-color:rgba(255,179,71,.07)}50%{background-color:rgba(255,179,71,.22)}}
.gpbar .tiny{color:var(--ink2);letter-spacing:0}
.gp-dot{width:10px;height:10px;border-radius:99px;background:var(--ember2);flex:none;animation:gpdot 1.7s infinite}
@keyframes gpdot{0%{box-shadow:0 0 0 0 rgba(255,179,71,.75)}70%{box-shadow:0 0 0 11px rgba(255,179,71,0)}100%{box-shadow:0 0 0 0 rgba(255,179,71,0)}}
body.gpaused .wrap{padding-top:calc(var(--gph,50px) + var(--clkh,46px) + 12px)}
body.gpaused .liveclock{top:calc(var(--gph,50px) + 6px)}
@media(min-width:900px){
  .gpbar{left:216px}
  body.gpaused .wrap{padding-top:calc(var(--gph,50px) + var(--clkh,46px) + 14px)}
}
@media(prefers-reduced-motion:reduce){.gpbar,.gp-dot{animation:none}.gpbar{background-color:rgba(255,179,71,.18)}}

/* ---------- nav ---------- */
.navwrap{position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(13,17,26,.92);backdrop-filter:blur(14px);
  border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
.navwrap::after{content:'';position:absolute;right:0;top:0;bottom:0;width:24px;pointer-events:none;
  background:linear-gradient(90deg,rgba(13,17,26,0),rgba(13,17,26,.92))}
.nav{display:flex;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.nav::-webkit-scrollbar{display:none}
.nav a{flex:0 0 auto;min-width:74px;text-align:center;padding:10px 6px 12px;color:var(--ink3);font:700 11px var(--disp);letter-spacing:.04em;position:relative}
.nav a.on{color:var(--ember)}
.nav svg{display:block;margin:0 auto 3px}
.side{display:none}
.logo,a.logo{font:900 20px var(--disp);letter-spacing:-.02em;color:var(--ink)}
.logo em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}

/* ---------- tasks ---------- */
.task{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--line);align-items:flex-start;cursor:pointer}
.task:last-child{border-bottom:0}
.task .box{width:26px;height:26px;border:2px solid var(--line2);border-radius:8px;flex:none;margin-top:1px;
  display:flex;align-items:center;justify-content:center;color:transparent;font:800 15px var(--disp);transition:all .15s}
.task:hover .box{border-color:var(--ember)}
.task.done .box{background:var(--mint);border-color:var(--mint);color:#062A1C}
.task.done .t{text-decoration:line-through;color:var(--ink3)}
.task .t{font-weight:700}
.task .d{font-size:13px;color:var(--ink2);margin-top:2px}
.task.hold{opacity:.55;cursor:default}
.task.hold .box{color:var(--ink3);border-color:var(--ink3)}
.track-ic{font-size:15px;margin-right:4px}

/* ---------- counters ---------- */
.ring{position:relative;width:112px;height:112px;margin:0 auto}
.ring svg{transform:rotate(-90deg)}
.ring .val{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring .val b{font:800 30px/1 var(--disp);font-variant-numeric:tabular-nums}
.ring .val span{font:700 11px var(--disp);color:var(--ink3);letter-spacing:.08em;margin-top:2px}
.extra{color:var(--ember2);font:800 12px var(--disp);letter-spacing:.06em;text-align:center;margin-top:6px;min-height:15px}

/* ---------- timer ---------- */
.lcgrid #tbtns{flex-wrap:wrap;justify-content:center}
.timer-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;min-width:0}
.timer-wrap .row{flex-wrap:wrap;justify-content:center}
.tring{position:relative;width:190px;height:190px}
.tring svg{transform:rotate(-90deg)}
.tring .tv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  font:800 44px var(--disp);font-variant-numeric:tabular-nums}
.tring .tsub{font:700 13px var(--disp);color:var(--ink3);letter-spacing:.06em;margin-top:2px;min-height:16px}

/* ---------- schedule timeline ---------- */
.tl{position:relative;padding-left:14px}
.tl:before{content:'';position:absolute;left:3px;top:8px;bottom:8px;width:2px;background:var(--line)}
.tl-item{position:relative;display:flex;gap:12px;padding:8px 0;align-items:baseline}
.tl-item:before{content:'';position:absolute;left:-15px;top:16px;width:8px;height:8px;border-radius:99px;background:var(--dot,#5C6779)}
.tl-time{font:700 13px var(--disp);color:var(--ink2);min-width:150px;font-variant-numeric:tabular-nums}
.tl-lab{font-weight:700}
.tl-sub{font-size:13px;color:var(--ink2)}

/* ---------- calendar ---------- */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.cal-dow{text-align:center;font:700 11px var(--disp);color:var(--ink3);letter-spacing:.1em;padding:4px 0}
.cell{background:var(--surface);border:1px solid var(--line);border-radius:10px;min-height:64px;padding:6px;
  font-size:11px;cursor:pointer;position:relative;overflow:hidden;transition:border-color .15s}
.cell:hover{border-color:var(--line2)}
.cell .tint{position:absolute;inset:0;background:var(--ph,transparent);opacity:.10;pointer-events:none}
.cell.today{border-color:var(--ember);box-shadow:0 0 0 1px var(--ember)}
.cell .dn{font:800 13px var(--disp);color:var(--ink2)}
.cell.today .dn{color:var(--ember)}
.cell .done-ic{position:absolute;top:5px;right:6px;color:var(--mint);font:800 12px var(--disp)}
.cell .tchip{display:none}
.cell .dots{display:flex;gap:3px;margin-top:5px;flex-wrap:wrap}
.cell .gh{font:800 10px var(--disp);color:var(--ember);margin-top:4px;white-space:nowrap}
.cell .gh .ghf{display:none}
@media(min-width:900px){.cell .gh{position:absolute;bottom:5px;right:6px;margin:0;font-size:11px}.cell .gh .ghf{display:inline}}
.cell .dot{width:6px;height:6px;border-radius:99px}
.leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}

/* ---------- friends / queue ---------- */
.req{border:1px solid var(--line);border-radius:var(--r);padding:14px;margin:10px 0;background:var(--surface)}
.qrow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.qrow:last-child{border-bottom:0}
.rank{font:800 13px var(--disp);color:var(--ink3);min-width:26px}
.win{border:1px solid var(--line);border-radius:var(--r);padding:14px;margin:10px 0;background:var(--surface)}
.editor{background:var(--surface2);border-radius:var(--rs);padding:14px;margin-top:12px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}

/* ---------- progress tabs ---------- */
.tabbar{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;background:var(--surface2);border:1px solid var(--line2);
  border-radius:var(--rs);padding:3px;margin:14px 0 4px;-webkit-overflow-scrolling:touch}
.tabbar::-webkit-scrollbar{display:none}
.tabbar button{flex:1 0 auto;border:0;background:transparent;color:var(--ink2);padding:8px 14px;border-radius:7px;
  font:700 13px var(--disp);white-space:nowrap}
.tabbar button.on{background:var(--surface3);color:var(--ember)}
.tabpane{display:none}.tabpane.on{display:block}
.lcrow{display:flex;align-items:center;gap:8px;padding:7px 2px;border-bottom:1px solid var(--line);font-size:13px}
.lcrow:last-child{border-bottom:0}
.diff{font:800 10px var(--disp);border-radius:99px;padding:2px 8px;letter-spacing:.06em}
.diff.easy{background:#3DDC9722;color:var(--mint)}
.diff.medium{background:#FFB34722;color:var(--ember2)}
.diff.hard{background:#FF5D7322;color:var(--rose)}
/* match-as-you-type list under the LeetCode name field */
.acbox{margin-top:8px;border:1px solid var(--line2);border-radius:var(--rs);background:var(--surface2);
  max-height:230px;overflow-y:auto}
.acitem{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:none;border:0;
  border-bottom:1px solid var(--line);border-radius:0;padding:10px 12px;font:14px var(--body);color:var(--ink);cursor:pointer}
.acitem:last-child{border-bottom:0}
.acitem:hover,.acitem:focus-visible{background:var(--surface3)}
.acitem>.grow{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.outb{display:inline-flex;align-items:center;gap:3px;font:800 11px var(--disp);border-radius:5px;
  padding:2px 7px;white-space:nowrap;letter-spacing:.02em}
/* expandable problem rows on the Stats tab */
.prow{border-bottom:1px solid var(--line)}
.prow:last-child{border-bottom:0}
.prow>.hd{display:flex;align-items:center;gap:8px;padding:9px 2px;font-size:13px;cursor:pointer}
.prow>.hd:hover{background:var(--surface2)}
.prow>.hd .cx{color:var(--ink3);font:700 11px var(--disp);transition:transform .2s;flex:none;width:12px}
.prow>.hd .pn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.prow.open>.hd .pn{white-space:normal}
.prow>.hd>.tiny,.prow>.hd>.outb,.prow>.hd>.diff{flex:none}
.prow.open>.hd .cx{transform:rotate(90deg)}
.ppanel{display:none;padding:4px 2px 14px 20px}
.prow.open .ppanel{display:block}
.pstats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.pstats .chip{padding:4px 10px;font-size:12px}
.parow{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}
.parow:last-child{border-bottom:0}
.parow select{width:auto;padding:5px 8px;font-size:12px}

/* ---------- leetcode workspace ---------- */
@media(min-width:1000px){
  .lcgrid{display:grid;grid-template-columns:360px minmax(0,1fr);gap:14px 30px;align-items:start}
  .lcgrid>.full{grid-column:1/-1}
  .lcgrid #noteCard{min-height:430px;cursor:text}
  .stgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px 30px;align-items:start}
}
@media(min-width:1500px){ .lcgrid{grid-template-columns:400px minmax(0,1fr)} }
.probhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}
.notearea{width:100%;background:transparent;border:0;border-radius:0;padding:4px 2px;
  font:16px/1.65 var(--body);resize:none;overflow:hidden;min-height:34px}
.notearea:focus{outline:none}
.codewrap{position:relative;border:1px solid var(--line2);border-radius:var(--rs);background:#0E121B;margin:10px 0}
.codewrap .cx{position:absolute;top:3px;right:3px;padding:2px 8px;font-size:13px;background:transparent;
  border:0;color:var(--ink3);z-index:2;width:auto}
.codetag{position:absolute;top:7px;left:11px;font:700 10px var(--disp);color:var(--ink3);letter-spacing:.14em}
.codearea{width:100%;background:transparent;border:0;padding:23px 34px 12px 12px;font:13px/1.6 var(--mono);
  color:#CFE3FF;resize:none;overflow-x:auto;white-space:pre;tab-size:2;border-radius:var(--rs)}
.codearea:focus{outline:none}
.savetick{font:700 11px var(--disp);letter-spacing:.1em;color:var(--ink3);text-transform:uppercase;transition:color .2s}
.savetick.on{color:var(--mint)}
/* array visualizer */
.arrcard{border:1px solid var(--line);border-radius:var(--r);padding:16px;margin:16px 0;background:var(--surface2)}
.arrhead{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.arrhead .nm{font:800 15px var(--disp)}
.aptr{display:flex;flex-wrap:wrap;gap:10px;align-items:center;
  margin:0 0 16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.pchip{display:inline-flex;align-items:center;gap:4px;background:var(--surface3);
  border:1px solid var(--line2);border-radius:99px;padding:5px 6px 5px 5px}
.pchip .pnum{font:700 12px var(--disp);color:var(--ink2);min-width:16px;text-align:center}
.pchip button{width:28px;height:28px;padding:0;flex:none;display:flex;align-items:center;
  justify-content:center;font-size:12px;border-radius:99px;background:transparent;border:0;color:var(--ink2)}
.pchip button:hover{background:var(--surface);color:var(--ink)}
.arrscroll{overflow-x:auto;padding-bottom:8px}
.arrrow{display:flex;gap:8px;min-width:min-content;align-items:flex-start}
.acell{flex:0 0 auto;width:54px;text-align:center}
.acell input{width:54px;padding:10px 2px;text-align:center;font:700 16px var(--disp);background:var(--surface3);border-color:var(--line2)}
.acell .ix{font:700 12px var(--disp);color:var(--ink3);margin-top:7px}
.acell .pts{min-height:22px;margin-top:7px;display:flex;flex-direction:column;align-items:center;gap:3px}
.ptag{font:800 11px var(--disp);border-radius:5px;padding:2px 7px;line-height:1.5;white-space:nowrap;cursor:pointer}
.ptag.sel{box-shadow:0 0 0 2px currentColor}

/* ---------- progress extras ---------- */
/* Progress > LeetCode > History day card. These used to reuse .stat, which forced
   34px numerals on the date and minutes and UPPERCASED every problem name. */
.dayc{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:13px 38px 13px 14px;margin:8px 0;cursor:pointer;position:relative}
.dayc:after{content:'▾';position:absolute;top:14px;right:14px;color:var(--ink3);font-size:11px;transition:transform .2s}
.dayc.open:after{transform:rotate(180deg)}
.dayc .dhd{display:flex;align-items:baseline;gap:4px 10px;flex-wrap:wrap}
.dayc .dt{font:800 15px var(--disp);white-space:nowrap}
.dayc .dsum{font:400 12.5px/1.45 var(--body);color:var(--ink2)}
.dayc .dsum b{font-family:var(--disp);font-weight:800;color:var(--ink)}
.dayc .exp-list{max-height:none;overflow:visible;margin-top:6px}
.dayc.open .exp-list{display:block}
.dayc .lcrow{padding:8px 0;gap:7px}
.dayc .lcrow.dim{opacity:.6}
.dayc .lcrow .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dayc .lcrow .mn{font:800 13px var(--disp);font-variant-numeric:tabular-nums;white-space:nowrap}
.dayc .lcrow .diff{flex:none}
.dayc .lcrow .outb{flex:none}
@media(max-width:520px){
  .dayc{padding:12px 32px 12px 12px}
  .dayc .dt{font-size:14px}
  .dayc .dsum{font-size:11.5px}
  .dayc .lcrow{gap:5px;font-size:12px}
  .dayc .lcrow .diff{font-size:9px;padding:2px 6px}
  .dayc .lcrow .outb{font-size:10px;padding:2px 5px}
  .dayc .lcrow .mn{font-size:12px}
}
.stat.exp{cursor:pointer;position:relative}
.stat.exp:after{content:'▾';position:absolute;top:8px;right:10px;color:var(--ink3);font-size:11px;transition:transform .2s}
.stat.exp.open:after{transform:rotate(180deg)}
.exp-list{display:none;max-height:270px;overflow-y:auto;margin-top:10px;text-align:left}
.stat.open .exp-list{display:block}
.exp-row{display:flex;gap:8px;padding:6px 2px;border-bottom:1px solid var(--line);font-size:13px;align-items:center}
.exp-row:last-child{border-bottom:0}
.pace-bar{height:10px;background:var(--surface2);border-radius:99px;overflow:hidden;margin-top:6px}
.pace-bar div{height:100%;border-radius:99px}
.funnel-row{display:grid;grid-template-columns:minmax(64px,34%) 1fr auto;align-items:center;gap:10px;margin:9px 0}
.funnel-row .fp{font:700 11px var(--mono);color:var(--ink3);font-variant-numeric:tabular-nums;text-align:right;min-width:32px}
.funnel-row .fl{font:700 12px/1.25 var(--disp);color:var(--ink2);min-width:0;overflow-wrap:anywhere}
.funnel-row .fb{height:22px;border-radius:6px;min-width:26px;max-width:100%;display:flex;align-items:center;
  padding:0 8px;font:800 12px var(--disp);color:#0B0E14}
.delta{font:800 12px var(--disp)}
.delta.up{color:var(--mint)}.delta.down{color:var(--rose)}.delta.flat{color:var(--ink3)}
.heat{display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;grid-auto-columns:12px;gap:3px}
.heat div{border-radius:3px;background:var(--surface2)}
.rec-chip{display:flex;flex-direction:column;gap:2px;background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:10px 14px;min-width:110px}
.rec-chip b{font:800 18px var(--disp)}
.rec-chip span{font:700 10px var(--disp);color:var(--ink3);letter-spacing:.08em;text-transform:uppercase}

/* ---------- charts ---------- */
/* SVG units are CSS pixels in these charts (the viewBox width is the measured
   width), so these font sizes are the real rendered sizes on a phone too. */
.chart-tip{position:fixed;background:var(--surface3);border:1px solid var(--line2);border-radius:9px;
  padding:8px 11px;font-size:12.5px;line-height:1.45;pointer-events:none;z-index:99;display:none;
  box-shadow:0 8px 22px #0008;max-width:230px}
.chart-tip b{font:800 13px var(--disp)}
svg text.cax{font:600 10px var(--mono);fill:var(--ink3)}
svg text.cvl{font:800 10px var(--disp);fill:var(--ink2)}
.hz{cursor:crosshair}
.hz:hover{fill:rgba(255,255,255,.05)}
/* the headline numbers above a chart: a bar chart alone never says what it is worth */
.csum{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:13px}
.csum .ci{min-width:0;background:var(--surface2);border:1px solid var(--line);
  border-radius:10px;padding:9px 11px}
.csum .ci b{display:block;font:800 18px/1.15 var(--disp);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.csum .ci span{display:block;font:700 9.5px var(--disp);color:var(--ink3);letter-spacing:.07em;
  text-transform:uppercase;margin-top:4px;line-height:1.3}
.clegend{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:10px;align-items:center}
.clegend span{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink3)}
.clegend i{flex:none;width:10px;height:10px;border-radius:3px}
.clegend i.lgd{width:15px;height:0;border-radius:0;border-top:2px dashed var(--ink3)}
.clegend i.lgd.ice{border-color:var(--ice)}
@media(max-width:560px){
  .csum{grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:11px}
  .csum .ci{padding:8px 9px}
  .csum .ci b{font-size:15px}
  .csum .ci span{font-size:9px;letter-spacing:.04em}
  .clegend{gap:4px 10px;margin-top:8px}
  .clegend span{font-size:10.5px}
  svg text.cax{font-size:9px}
  svg text.cvl{font-size:9px}
}
/* finish-line forecast rows */
.pj{padding:13px 0;border-bottom:1px solid var(--line)}
.pj:last-child{border-bottom:0;padding-bottom:2px}
.pjh{display:flex;align-items:center;gap:8px}
.pjh b{font:800 15px var(--disp)}
.pjbar{position:relative;height:13px;border-radius:99px;background:var(--surface2);overflow:hidden;margin:10px 0 9px}
.pjbar i{position:absolute;top:0;left:0;height:100%;border-radius:99px;display:block}
.pjbar i.pr{opacity:.44;background-image:repeating-linear-gradient(135deg,#0000 0 5px,#FFFFFF33 5px 10px)}
.pjm{display:flex;flex-wrap:wrap;gap:5px 16px}
.pjm span{font-size:12px;color:var(--ink3);display:flex;align-items:center;gap:6px}
.pjm i.sw{flex:none;width:11px;height:11px;border-radius:3px}
.pjm i.sw.pr{opacity:.44;background-image:repeating-linear-gradient(135deg,#0000 0 3px,#FFFFFF33 3px 6px)}
.pjm i.sw.tr{background:var(--surface2);border:1px solid var(--line2)}
.pjm b{font:800 15px var(--disp);color:var(--ink);font-variant-numeric:tabular-nums}
.pjn{margin-top:7px;font-size:12.5px;line-height:1.5;color:var(--ink2)}
.pjn b{color:var(--ember2);font-family:var(--disp)}
/* difficulty mix bar */
.mixbar{display:flex;height:28px;border-radius:8px;overflow:hidden;background:var(--surface2)}
.mixbar i{display:flex;align-items:center;justify-content:center;min-width:0;
  font:800 12px var(--disp);color:#0B0E14}
.mixleg{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:10px}
.mixleg span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2)}
.mixleg i{flex:none;width:10px;height:10px;border-radius:3px}
.mixnote{margin-top:11px;font-size:12.5px;line-height:1.55;color:var(--ink2)}
.mixnote b{font-family:var(--disp);color:var(--ink)}
/* weekday grind pattern */
.dow{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px}
.dw{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.dw .bar{width:100%;height:78px;display:flex;align-items:flex-end;background:var(--surface2);
  border-radius:7px;overflow:hidden}
.dw .bar i{width:100%;display:block;border-radius:7px}
.dw b{font:800 13px var(--disp);font-variant-numeric:tabular-nums}
.dw span{font:700 9.5px var(--disp);color:var(--ink3);letter-spacing:.05em;text-transform:uppercase}
@media(max-width:560px){
  .dow{gap:4px}
  .dw .bar{height:62px;border-radius:5px}
  .dw b{font-size:11.5px}
  .dw span{font-size:8.5px;letter-spacing:0}
  .mixleg span,.mixnote,.pjn{font-size:11.5px}
  .pjm b{font-size:13px}
  .pjm span{font-size:11px}
}

/* ---------- misc ---------- */
.statgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px;text-align:center}
.stat b{font:800 34px/1.1 var(--disp);font-variant-numeric:tabular-nums;display:block}
.stat span{font:700 11px var(--disp);color:var(--ink3);letter-spacing:.1em;text-transform:uppercase}
/* a phone does not need 34px numerals: the tiles were eating whole screens */
@media(max-width:560px){
  .stat{padding:12px 10px}
  .stat b{font-size:25px}
  .stat span{font-size:10px;letter-spacing:.05em}
  .statgrid{gap:8px}
}
/* comparison rows (getting faster, week vs week): one line on desktop,
   headline on top and the comparison underneath on a phone */
.trow{display:grid;grid-template-columns:1fr auto auto;column-gap:10px;row-gap:1px;
  align-items:baseline;padding:9px 0;border-bottom:1px solid var(--line)}
.trow:last-child{border-bottom:0}
.trow .trl{grid-area:1/1;font-weight:700;min-width:0}
.trow .trv{grid-area:1/2;font:800 18px var(--disp);font-variant-numeric:tabular-nums;white-space:nowrap}
.trow .trd{grid-area:1/3;white-space:nowrap}
.trow .trs{grid-area:2/1/3/4;color:var(--ink3);font-size:12px}
@media(min-width:620px){
  .trow{grid-template-columns:150px auto 1fr auto;align-items:center;row-gap:0}
  .trow .trl,.trow .trv,.trow .trd{grid-area:auto}
  .trow .trs{grid-area:auto;text-align:right}
}
.banner{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:linear-gradient(135deg,#FF6B3518,#FFB34710);
  border:1px solid #FF6B3540;border-radius:var(--r);padding:14px 16px;margin:10px 0;cursor:pointer}
.banner>.grow{min-width:0}
.banner>button{flex:none}
@media(max-width:560px){
  .banner{gap:10px}
  .banner>.grow{flex:1 1 100%;order:1}
  .banner>span:first-child{order:0}
  .banner>button{order:2;flex:1 1 0;min-width:104px}
}
.toggle{position:relative;width:46px;height:26px;border-radius:99px;background:var(--surface3);border:1px solid var(--line2);
  cursor:pointer;transition:background .2s;flex:none}
.toggle:after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:99px;background:var(--ink2);transition:all .2s}
.toggle.on{background:var(--ember)}
.toggle.on:after{left:22px;background:#fff}
.toast{position:fixed;bottom:calc(86px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%) translateY(20px);
  background:var(--surface3);border:1px solid var(--line2);border-radius:12px;padding:12px 18px;font-weight:700;
  opacity:0;pointer-events:none;transition:all .25s;z-index:99;white-space:nowrap;max-width:92vw}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.seg-ctl{display:flex;background:var(--surface2);border:1px solid var(--line2);border-radius:var(--rs);padding:3px;gap:3px}
.seg-ctl button{flex:1;border:0;background:transparent;padding:7px 10px;font-size:13px;border-radius:7px;color:var(--ink2)}
.seg-ctl button.on{background:var(--surface3);color:var(--ink)}
.skel{color:var(--ink2);text-align:center;padding:24px 14px;font-size:14px;line-height:1.55}

/* ---------- timeline v2 (bubbles + duration line) ---------- */
.tl2{display:flex;flex-direction:column;gap:22px}
.tl2-item{display:grid;grid-template-columns:96px 1fr;gap:14px}
.tl2-rail{display:flex;flex-direction:column;align-items:center;min-width:96px}
.tl2-item.tl2-ov{margin-left:18px;padding-left:12px;border-left:2px dashed var(--line2);margin-top:-8px}
.bub{background:var(--surface2);border:1px solid var(--line2);border-radius:99px;padding:3px 10px;
  font:700 12px var(--disp);font-variant-numeric:tabular-nums;white-space:nowrap;z-index:1}
.tl2-line{flex:1;width:2px;background:var(--rk,#5C6779);min-height:34px;position:relative;margin:4px 0}
.tl2-dur{position:absolute;top:50%;left:8px;transform:translateY(-50%);font:700 11px var(--disp);
  color:var(--ink2);background:var(--surface);padding:1px 6px;border-radius:6px;white-space:nowrap}
.tl2-body{padding:2px 0 14px}
.tl2-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;cursor:pointer}
.tl2-head .lab{font-weight:700}
.tl2-sub{font-size:13px;color:var(--ink2);margin-top:3px}
.modchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.modchip{display:inline-flex;gap:5px;align-items:center;background:var(--surface2);border:1px solid var(--line2);
  border-radius:8px;padding:4px 9px;font:700 12px var(--disp)}
.tl2-x{margin-left:auto;color:var(--ink3);font:800 14px var(--disp);transition:transform .2s}
/* generic accordion: a header row that reveals its body */
.acc>.acc-h{display:flex;align-items:center;gap:10px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.acc>.acc-b{display:none}
.acc.open>.acc-b{display:block}
.acc.open>.acc-h .tl2-x{transform:rotate(90deg)}
.tl2-item.open .tl2-x{transform:rotate(90deg)}
.tl2-detail{display:none;margin-top:10px}
.tl2-item.open .tl2-detail{display:block}

/* ---------- grind bar ---------- */
.grindbar{background:var(--surface2);border-radius:99px;height:14px;overflow:hidden;position:relative;margin:10px 0 6px}
.grindbar .fill{height:100%;background:var(--grad);border-radius:99px;transition:width 1s linear;position:relative}
.grindbar .fill:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
  animation:shimmer 3.5s infinite}
@keyframes shimmer{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
.grindbar.ot .fill{background:var(--rose)}
.grind-live{border:1px solid #FF6B3550;background:linear-gradient(135deg,#FF6B3512,#FFB34708)}
/* the live card used to be one wrapping flex row: on a phone the buttons won the space
   and the title collapsed to one word per line. Stacked on mobile, one row from 640px. */
.grind-live .lg-wrap{display:flex;flex-direction:column;gap:12px}
.grind-live .lg-main{display:flex;align-items:flex-start;gap:10px;min-width:0}
.grind-live .lg-fire{font-size:22px;flex:none;line-height:1.15}
.grind-live .lg-txt{flex:1;min-width:0}
.grind-live .lg-txt b{display:block;font:800 16px/1.25 var(--disp)}
.grind-live .lg-txt .tiny{margin-top:2px}
.grind-live .lg-time{flex:none;text-align:right}
.grind-live .lg-time b{display:block;font:800 22px/1.1 var(--disp);font-variant-numeric:tabular-nums}
.grind-live .lg-time .tiny{display:block;white-space:nowrap}
.grind-live .lg-btns{display:flex;gap:8px;flex-wrap:wrap}
.grind-live .lg-btns button{flex:1 1 0;min-width:92px}
@media(min-width:640px){
  .grind-live .lg-wrap{flex-direction:row;align-items:center;gap:14px}
  .grind-live .lg-main{flex:1;align-items:center}
  .grind-live .lg-btns{flex:none}
  .grind-live .lg-btns button{flex:none}
}
.grind-ot-tag{color:var(--rose);font:800 12px var(--disp);letter-spacing:.06em}

/* ---------- split editor ---------- */
.modal-bg{position:fixed;inset:0;background:rgba(5,7,11,.75);backdrop-filter:blur(4px);z-index:80;
  display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);padding:20px;max-width:560px;width:100%;
  max-height:88vh;overflow-y:auto}
.splitbar{display:flex;height:52px;border-radius:12px;overflow:hidden;margin:14px 0 4px;touch-action:none}
.splitseg{display:flex;align-items:center;justify-content:center;gap:4px;font:800 13px var(--disp);color:#0B0E14;
  min-width:0;overflow:hidden;white-space:nowrap;transition:none}
.splithandle{width:14px;background:var(--bg);cursor:ew-resize;flex:none;display:flex;align-items:center;justify-content:center}
.splithandle:after{content:'⋮';color:var(--ink2);font-size:15px}
.splitlegend{display:flex;justify-content:space-between;gap:8px;margin-top:8px;flex-wrap:wrap}
.splitadj{display:flex;align-items:center;gap:6px;font:700 12px var(--disp)}

/* ---------- jobs table ---------- */
.jtable{width:100%;border-collapse:collapse;font-size:14px}
.jtable th{font:700 11px var(--disp);color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;text-align:left;padding:8px 10px;border-bottom:1px solid var(--line2)}
.jtable td{padding:10px;border-bottom:1px solid var(--line);vertical-align:top}
.jtable tr:last-child td{border-bottom:0}
.jtable select{padding:4px 8px;font-size:12px;width:auto}
.jwrap{overflow-x:auto}
.jcard{display:none}
.status-pill{font:700 11px var(--disp);border-radius:99px;padding:3px 10px;display:inline-block}
@media(max-width:700px){
  .jwrap table{display:none}
  .jcard{display:block;border:1px solid var(--line2);border-left:4px solid var(--ac,var(--line2));border-radius:14px;padding:14px;margin:10px 0;background:var(--surface2)}
  .jcard:first-child{margin-top:0}.jcard:last-child{margin-bottom:0}
  .jcard select{background:var(--well)}
  .jcard .jt{display:block;font:700 15px/1.3 var(--body)}
  .jcard .jm{font-size:13px;margin-top:3px}
  .jcard .jrow{margin-top:12px;gap:8px}
  .jcard .jrow select{flex:1;min-width:0;width:auto;padding:8px 10px;font-size:13px}
  .jcard .jrow .tiny{white-space:nowrap}
}

/* ---------- settings: grind block rows (fit 375px, no shift) ---------- */
.blkrow{display:grid;grid-template-columns:1fr auto 1fr auto;align-items:center;gap:8px;margin:12px 0}
.blkrow .blk-lab{grid-column:1/-1;font:700 10px var(--disp);color:var(--ink3);letter-spacing:.12em;
  text-transform:uppercase;margin-bottom:-4px}
.blkrow input[type=time]{width:100%;min-width:0;padding:9px 6px;font-size:15px}
.blkrow .blk-x{padding:6px 8px;flex:none}
@media(min-width:560px){
  .blkrow{grid-template-columns:auto 1fr auto 1fr auto}
  .blkrow .blk-lab{grid-column:auto;margin:0;min-width:56px}
}

/* ---------- expanded block panel ---------- */
.blockpanel{background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:14px;margin-top:12px}
.bp-label{font:700 10px var(--disp);color:var(--ink3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
.bp-sec{padding-top:12px;margin-top:12px;border-top:1px solid var(--line)}
.bp-sec:first-child{padding-top:0;margin-top:0;border-top:0}
.bp-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.bp-move{display:flex;align-items:center;gap:8px;margin-left:auto}
@media(max-width:520px){.bp-move{margin-left:0;width:100%}}

/* ---------- today in numbers ---------- */
.dstat-top{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(min-width:520px){.dstat-top{grid-template-columns:repeat(4,1fr)}}
.dstat{text-align:center;background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:12px 6px}
.dstat b{display:block;font:800 22px/1.1 var(--disp);font-variant-numeric:tabular-nums}
.dstat b small{font-size:13px;color:var(--ink3);font-weight:700}
.dstat span{font:700 10px var(--disp);color:var(--ink3);letter-spacing:.06em;text-transform:uppercase}

/* ---------- Today layout v2 (refined header) ---------- */
.layout-v2 #dayHeader{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:16px 18px 14px;margin-bottom:6px}
.layout-v2 .dh-top{padding-bottom:12px;border-bottom:1px solid var(--line)}
.layout-v2 #phase{border:1px solid currentColor;padding:6px 14px}
.layout-v2 #streak{border-color:#FF6B3555;background:#FF6B3514;color:var(--ember2)}
.layout-v2 .dh-nav{margin-top:12px}
.layout-v2 .hdr-nav>button{background:var(--surface2);border:1px solid var(--line2);color:var(--ink2);
  width:38px;height:38px;padding:0;border-radius:10px;font-size:18px;flex:none}
.layout-v2 .hdr-nav>button:hover{color:var(--ember);border-color:var(--ember)}
.backtoday{display:inline-flex;align-items:center;gap:4px;background:#5EA2FF18;border:1px solid #5EA2FF55;
  color:var(--ice);border-radius:99px;padding:3px 12px;margin-left:8px;font:700 12px var(--disp);
  white-space:nowrap;vertical-align:middle;width:auto;height:auto}
.backtoday:hover{border-color:var(--ice)}
.layout-v2 #dsub{font-size:16px!important;color:var(--ink)!important}
.layout-v2 .race{margin:16px 0 0}
.layout-v2 .race-track{height:22px;border-radius:7px}
.layout-v2 .cols{margin-top:6px}
.layout-v2 h2{margin:24px 0 10px}
/* both columns start with a heading, so they line up automatically */
.v2only{display:none}
.layout-v2 .v2only{display:block}
.layout-v2 .card{padding:18px}
.layout-v2 .banner{border-radius:var(--r);padding:16px}

/* ---------- quick copy blocks ---------- */
.snipgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
@media(min-width:700px){.snipgrid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:560px){#links.snipgrid{grid-template-columns:1fr}}
.snip{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px 16px;cursor:pointer;
  transition:border-color .15s,transform .08s;-webkit-tap-highlight-color:transparent;min-width:0}
.snip:hover{border-color:var(--line2)}
.snip:active{transform:scale(.98)}
.snip.copied{border-color:var(--mint);box-shadow:0 0 0 1px var(--mint)}
.snip-t{font:700 18px/1.3 var(--body);display:block;overflow-wrap:anywhere;max-height:72px;overflow:hidden}
.snip-v{font-size:13px;color:var(--ink2);margin-top:5px;overflow-wrap:anywhere;max-height:40px;overflow:hidden}
.snip-hint{font:700 11px var(--disp);color:var(--ink3);letter-spacing:.08em;margin-top:12px;text-transform:uppercase}
.snip.copied .snip-hint{color:var(--mint)}
/* big, easy-to-hit action buttons */
.snip-act{width:38px;height:38px;padding:0;display:flex;align-items:center;justify-content:center;flex:none;
  border-radius:11px;background:var(--surface2);border:1px solid var(--line2);color:var(--ink2);font-size:16px}
.snip-act:hover{color:var(--ink);border-color:var(--ink3)}
.snip-more{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:12px;
  border-radius:12px;background:var(--surface2);border:1px solid var(--line2);color:var(--ink2);
  font:700 14px var(--disp)}
.snip-more:hover{border-color:var(--ember);color:var(--ember)}
.subrow{display:flex;align-items:center;gap:10px;padding:14px 4px;border-top:1px solid var(--line);cursor:pointer;min-width:0}
.subrow:hover{background:var(--surface2)}
.subrow:active{background:var(--surface3)}
.subrow.copied .sub-t{color:var(--mint)}
.sub-t{font:700 15px/1.3 var(--body);overflow-wrap:anywhere}
.sub-v{font-size:12px;color:var(--ink2);overflow-wrap:anywhere;margin-top:2px}
.subedit{display:grid;grid-template-columns:1fr 1.4fr auto;gap:6px;margin-top:6px}
.subedit input{padding:8px 9px;font-size:14px}

/* ---------- grind task picker ---------- */
.taskgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.taskbtn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 8px;border-radius:14px;
  background:var(--surface2);border:1px solid var(--line2);font:700 14px var(--disp)}
.taskbtn:active{transform:scale(.95)}

/* ---------- global refresh ---------- */
.refresh-fab{position:fixed;left:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:60;
  width:42px;height:42px;border-radius:99px;background:var(--surface);border:1px solid var(--line2);
  color:var(--ink2);font-size:19px;display:flex;align-items:center;justify-content:center;padding:0;
  box-shadow:0 2px 10px rgba(0,0,0,.4)}
.refresh-fab:active{transform:rotate(180deg) scale(.92)}
@media(min-width:900px){.refresh-fab{left:228px;bottom:16px}}

/* ---------- clock ---------- */
.clockwrap{display:flex;flex-direction:column;align-items:center;gap:6px}
.clock-slider{width:78%;max-width:280px;accent-color:var(--ember)}
.clock-cap{display:flex;justify-content:space-between;width:78%;max-width:280px;font:700 11px var(--disp);color:var(--ink3)}

@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

/* ---------- desktop ---------- */
@media(min-width:900px){
  body{padding-bottom:20px;padding-left:216px}
  body.nonav{padding-left:0}
  body.nonav .refresh-fab{left:12px}
  .nav,.navwrap{display:none}
  .side{display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;width:216px;
    background:rgba(19,24,36,.9);backdrop-filter:blur(12px);border-right:1px solid var(--line);padding:26px 14px;z-index:50;gap:4px}
  .side .logo{padding:0 12px 22px}
  .side a{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:var(--rs);
    color:var(--ink2);font:700 14px var(--disp);position:relative}
  .side a.on{background:var(--surface2);color:var(--ember)}
  .side a:hover{color:var(--ink)}
  .side .badge{position:static;margin-left:auto}
  .wrap{max-width:960px;padding:calc(var(--clkh,46px) + 18px) 34px 30px}
  .cols{display:grid;grid-template-columns:1fr 380px;gap:22px;align-items:start}
  .cols>*{min-width:0}
  .cell{min-height:104px;font-size:12px}
  .cell .tchip{display:block;background:var(--surface2);border-radius:5px;padding:2px 6px;margin-top:4px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;color:var(--ink2)}
  .cell .dots{display:none}
  .statgrid{grid-template-columns:repeat(4,1fr)}
  .fgrid{grid-template-columns:repeat(4,1fr)}
}
@media(min-width:1100px){
  html{zoom:1.25}
}
`;

const ICONS = {
  today: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10',
  calendar: 'M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  progress: 'M4 20V10M10 20V4M16 20v-8M2 20h20',
  friends: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zM19 12a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2L14 21h-4l-.4-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 015 12a7 7 0 01.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L10 3h4l.4 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.2.8.2 1.2z',
  jobs: 'M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 13h18',
  leetcode: 'M8 6l-5 6 5 6M16 6l5 6-5 6M13.5 4l-3 16',
  copy: 'M9 9V5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-4M5 9h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z',
};
const NAVITEMS = [['/', 'Today', 'today'], ['/calendar', 'Calendar', 'calendar'], ['/progress', 'Progress', 'progress'], ['/leetcode', 'LeetCode', 'leetcode'], ['/jobs', 'Jobs', 'jobs'], ['/copy', 'Copy', 'copy'], ['/friends', 'Friends', 'friends'], ['/settings', 'Settings', 'settings']];
export const ic = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></svg>`;

// which nav items belong to which optional module
const MODULE_OF_PATH = { '/leetcode': 'leetcode', '/jobs': 'jobs', '/copy': 'copy', '/friends': 'friends' };
const navItems = u => NAVITEMS.filter(([h]) => !MODULE_OF_PATH[h] || !u || !u.modules || u.modules[MODULE_OF_PATH[h]] !== false);
const navHTML = (on, u) => `
<div class="navwrap"><nav class="nav" id="mnav">${navItems(u).map(([h, l, i]) =>
  `<a href="${h}" class="${on === h ? 'on' : ''}" data-nav="${l}">${ic(i)}${l}</a>`).join('')}</nav></div>
<aside class="side"><div class="logo">LOCK<em>IN</em> 🔥</div>${navItems(u).map(([h, l, i]) =>
  `<a href="${h}" class="${on === h ? 'on' : ''}" data-nav="${l}">${ic(i, 18)}${l}</a>`).join('')}</aside>`;

// shared client runtime: AM/PM, api, toast, avatars, notify badge
const RUNTIME = `<div class="gpbar" id="gpause" style="display:none"></div><div class="toast" id="toast"></div><div class="liveclock" id="liveclock" aria-label="current time"><span class="grun" id="grun" style="display:none"></span><span id="mclockbox"></span></div>
<button class="refresh-fab" onclick="location.reload()" aria-label="Refresh page" title="Refresh">↻</button><script>
window.mclockHTML=function(cfg,now){
const f=cfg.font||13,acc=cfg.accent||'#FF6B35';
const parts=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}).split(' ');
const time=parts[0],ap=parts[1];
if(cfg.design==='led'){
const s=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'}).split(' ');
return '<span class="mc-led" style="font-size:'+(f+7)+'px;color:'+acc+';text-shadow:0 0 6px '+acc+',0 0 16px '+acc+'55">'+s[0]+'<small>'+s[1]+'</small></span>';}
if(cfg.design==='flip'){
const hh=time.split(':')[0],mm=time.split(':')[1];
return '<span class="mc-flip" style="font-size:'+f+'px"><span class="fc">'+hh+'</span><span style="color:'+acc+'">:</span><span class="fc">'+mm+'</span><span class="fap">'+ap+'</span></span>';}
if(cfg.design==='analog'){
const sz=Math.round(f*2.3),c=sz/2;
const h=now.getHours()%12,m=now.getMinutes(),sec=now.getSeconds();
const P=(r,deg)=>[c+r*Math.cos((deg-90)*Math.PI/180),c+r*Math.sin((deg-90)*Math.PI/180)];
const hd=P(c*0.45,(h+m/60)*30),md=P(c*0.7,(m+sec/60)*6),sd=P(c*0.78,sec*6);
let ticks='';for(let i=0;i<12;i++){const a=P(c*0.85,i*30),b=P(c*0.92,i*30);
ticks+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#5C6779" stroke-width="1"/>';}
return '<span class="mc-analog"><svg width="'+sz+'" height="'+sz+'"><circle cx="'+c+'" cy="'+c+'" r="'+(c-1)+'" fill="#0B0E14" stroke="#263045"/>'+ticks
+'<line x1="'+c+'" y1="'+c+'" x2="'+hd[0]+'" y2="'+hd[1]+'" stroke="#EDF1F7" stroke-width="2" stroke-linecap="round"/>'
+'<line x1="'+c+'" y1="'+c+'" x2="'+md[0]+'" y2="'+md[1]+'" stroke="#EDF1F7" stroke-width="1.4" stroke-linecap="round"/>'
+'<line x1="'+c+'" y1="'+c+'" x2="'+sd[0]+'" y2="'+sd[1]+'" stroke="'+acc+'" stroke-width="1" stroke-linecap="round"/>'
+'<circle cx="'+c+'" cy="'+c+'" r="1.6" fill="'+acc+'"/></svg><span class="aap" style="font-size:'+f+'px">'+ap+'</span></span>';}
if(cfg.design==='ring'){
const sz=Math.round(f*2.1),c=sz/2,r=c-3,CF=2*Math.PI*r;
const frac=(now.getHours()*3600+now.getMinutes()*60+now.getSeconds())/86400;
return '<span class="mc-ring" style="font-size:'+f+'px"><svg width="'+sz+'" height="'+sz+'" style="transform:rotate(-90deg)">'
+'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#263045" stroke-width="3"/>'
+'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="'+acc+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="'+CF+'" stroke-dashoffset="'+(CF*(1-frac))+'"/></svg>'
+time+'<small>'+ap+'</small></span>';}
const pillAcc=cfg.accent?';color:'+acc:'';
return '<span class="mc-pill" style="font-size:'+f+'px'+pillAcc+'">'+time+'<small>'+ap+'</small></span>';};
(function(){const lc=document.getElementById('mclockbox');
const cfg=()=>window.__MCLOCK||{design:'pill',font:13,accent:''};
const t=()=>lc.innerHTML=window.mclockHTML(cfg(),new Date());
// the clock is fixed and its height varies by design, size and the grind chip beside it,
// so measure it and let the page padding follow instead of guessing 62px
const pub=()=>{const el=document.getElementById('liveclock');
if(el&&el.offsetHeight)document.documentElement.style.setProperty('--clkh',el.offsetHeight+'px');};
t();pub();setInterval(t,1000);setInterval(pub,2000);
window.addEventListener('resize',pub);})();
</script><script>
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function fmtT(hm){if(!hm)return'';let[h,m]=hm.split(':').map(Number);if(window.__U&&window.__U.clock24)return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+String(m).padStart(2,'0')+' '+ap;}
const fmtR=(a,b)=>fmtT(a)+' – '+fmtT(b);
const hmMin=hm=>{const[a,b]=hm.split(':').map(Number);return a*60+b;};
function fmtDur(min){const h=Math.floor(min/60),m=min%60;return (h?h+'h':'')+(m?(h?' ':'')+m+'m':(h?'':'0m'));}
function blockMin(s,e,nx){let d=hmMin(e)-hmMin(s);if(nx||d<0)d+=1440;return d;}
async function api(p,opts){const r=await fetch(p,opts?{method:opts.method||'POST',headers:{'Content-Type':'application/json'},body:opts.body!==undefined?JSON.stringify(opts.body):undefined}:undefined);
let j=null;try{j=await r.json()}catch(e){}
if(!r.ok)throw(j&&j.error)||('error '+r.status);return j;}
let toastT;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);}
const AV=['#FF6B35','#5EA2FF','#3DDC97','#FFB347','#9B6EF3','#FF5D73','#4FD8D8'];
function avatar(n){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))>>>0;
return '<span class="avatar" style="background:'+AV[h%AV.length]+'" title="'+esc(n)+'">'+esc(n.trim().slice(0,2).toUpperCase())+'</span>';}
const ACT={game:'🎮',talk:'💬',task:'📋',other:'✨'};
const TRACK={course:'📚',sql:'🗄️',mock:'🎙️',behavioral:'💬',sysdesign:'🏗️',other:'⭐'};
async function notifyBadge(){try{const j=await api('/api/notify');
document.querySelectorAll('[data-nav="Friends"]').forEach(a=>{
let b=a.querySelector('.badge');
if(j.pending>0){if(!b){b=document.createElement('span');b.className='badge';a.appendChild(b);}b.textContent=j.pending;}
else if(b)b.remove();});return j.pending;}catch(e){return 0}}
function raceBar(el,phases,current){
const U=window.__U||{};
if(!U.plan){el.innerHTML='';el.style.display='none';return;}
const S=U.plan.start,E=U.plan.end;
const capD=ds=>new Date(ds+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).toUpperCase();
const days=[];let d=new Date(S+'T12:00:00Z');const end=new Date(E+'T12:00:00Z');
while(d<=end){days.push(d.toISOString().slice(0,10));d=new Date(d);d.setUTCDate(d.getUTCDate()+1);}
const idx=days.indexOf(current);
el.innerHTML='<div class="race-track">'+days.map((ds,i)=>{
const p=phases.find(p=>p.start_date<=ds&&p.end_date>=ds);
const cls=ds<current?'past':ds===current?'today':'';
return '<div class="race-seg '+cls+'" style="--seg:'+(p?p.color:'#263045')+'"></div>';}).join('')+'</div>'
+'<div class="race-cap"><span>'+capD(S)+'</span><b>'+(idx<0?(current<S?(()=>{const n=Math.round((new Date(S)-new Date(current))/864e5);return 'STARTS IN '+n+(n===1?' DAY':' DAYS')})():'DONE'):'DAY '+(idx+1)+' OF '+days.length)+'</b><span>'+capD(E)+'</span></div>';}

// ---- paused grind watchdog: shows on every page until the session is resumed ----
const uTz=()=>(window.__U&&window.__U.tz)||'UTC';
const nyNowT=()=>new Date().toLocaleString('sv-SE',{timeZone:uTz()}).replace(' ','T').slice(0,16);
const todayU=()=>(window.__U&&window.__U.today)||new Date().toLocaleDateString('en-CA',{timeZone:uTz()});
let GP=null,GA=null;
const CATS=(window.__U&&window.__U.categories)||[];
const CAT=k=>CATS.find(c=>c.key===k)||{key:k,name:k,emoji:'\u2B50',color:'#5C6779'};
const GTASK=Object.fromEntries(CATS.map(c=>[c.key,c.emoji]));
// a running session's elapsed time is wall clock since check-in, minus banked pauses
function gaMin(){if(!GA||!GA.start_ts)return 0;
const a=new Date(GA.start_ts+':00'),b=new Date(nyNowT()+':00');
return Math.max(0,Math.round((b-a)/60000)-(GA.paused_min||0));}
function gaRender(){
const el=$('grun');if(!el)return;
if(!GA){el.style.display='none';el.innerHTML='';return;}
el.style.display='';
el.title='Grind running \u00b7 tap for Today';
el.onclick=()=>{if(location.pathname!=='/')location.href='/';};
el.innerHTML='<span class="gdot"></span>'+(GTASK[GA.cur_task]||'\uD83D\uDD25')+' '+fmtDur(gaMin());}
function gpMin(){if(!GP||!GP.paused_at)return 0;
const a=new Date(GP.paused_at+':00'),b=new Date(nyNowT()+':00');
return Math.max(0,Math.round((b-a)/60000));}
function gpRender(){
const el=$('gpause');if(!el)return;
document.body.classList.toggle('gpaused',!!GP);
if(!GP){el.style.display='none';el.innerHTML='';return;}
el.style.display='';
const m=gpMin();
el.innerHTML='<span class="gp-dot"></span><b>GRIND PAUSED</b>'
+'<span class="tiny">frozen '+(m?fmtDur(m):'just now')+(GP.cur_task?' \u00b7 '+GP.cur_task:'')+'</span>'
+'<span class="grow"></span>'
+'<button class="pri sm" onclick="gpResume()">\u25b6 Resume</button>';
document.documentElement.style.setProperty('--gph',el.offsetHeight+'px');}
async function gpCheck(){
if(window.__PUBLIC){GP=null;GA=null;gpRender();gaRender();return;}
try{const j=await api('/api/grind/active');const a=j.active||null;
GP=(a&&a.paused_at)?a:null;GA=(a&&!a.paused_at)?a:null;}
catch(e){GP=null;GA=null;}
gpRender();gaRender();}
async function gpResume(){
if(!GP)return;
const id=GP.id;GP=null;gpRender();
try{await api('/api/grind/resume',{body:{id}});toast('\u25b6 Back to it');}
catch(e){toast(String(e));}
if(typeof load==='function')try{load()}catch(e){}
gpCheck();}
gpCheck();
setInterval(gpCheck,60000);
setInterval(()=>{gpRender();gaRender();},20000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)gpCheck();});

// ---- bottom nav: keep the active tab in view without scrolling the page ----
(function(){const n=document.getElementById('mnav');if(!n)return;
const a=n.querySelector('a.on');if(!a)return;
n.scrollLeft=Math.max(0,a.offsetLeft-(n.clientWidth-a.offsetWidth)/2);})();

// ---- shared focus timer: one clock across pages, survives navigation and refresh ----
const TKEY='lockin_timer';
let TS=null,tInt=null;
const fmtTm=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function tRead(){try{TS=JSON.parse(localStorage.getItem(TKEY)||'null')}catch(e){TS=null}
if(!TS||typeof TS.len!=='number'||!TS.startedAt)TS=null;return TS;}
function tWrite(){try{TS?localStorage.setItem(TKEY,JSON.stringify(TS)):localStorage.removeItem(TKEY)}catch(e){}}
// elapsed comes from the wall clock, so a refresh or a sleeping phone cannot drift it
function tElapsedS(){if(!TS)return 0;const end=TS.pausedAt||Date.now();
return Math.max(0,Math.round((end-TS.startedAt-TS.pausedMs)/1000));}
function tTotalS(){return (TS?TS.len:(+(($('tlen')||{}).value)||25))*60;}
function tCtx(){return (window.__TIMER_CTX?window.__TIMER_CTX():{})||{};}
function tDraw(){const el=$('tmr');if(!el)return;
const tot=tTotalS(),el4=tElapsedS(),left=tot-el4;
if(left>=0){el.textContent=fmtTm(left);el.style.color='';}
else{el.textContent='+'+fmtTm(-left);el.style.color='var(--rose)';}
const sub=$('tsub');
if(sub)sub.textContent=TS?(fmtTm(el4)+' elapsed'):'';
const arc=$('tarc');
if(arc){const CF=+arc.getAttribute('stroke-dasharray')||534;
arc.style.strokeDashoffset=CF*(1-Math.max(0,left)/tot);
arc.style.stroke=left<0?'var(--rose)':'';}}
function tBtns(){const go=$('tgo');if(!go)return;
const run=!!TS;
go.textContent=run?'\u2713 Done':'Start';
if($('tpause')){$('tpause').style.display=run?'':'none';$('tpause').textContent=(TS&&TS.pausedAt)?'\u25B6 Resume':'\u23F8 Pause';}
if($('treset'))$('treset').style.display=run?'none':'';
if($('tlen'))$('tlen').disabled=run;}
function tLoop(){clearInterval(tInt);tInt=null;
if(TS&&!TS.pausedAt)tInt=setInterval(tTick,1000);}
function tTick(){tDraw();
if(!TS)return;
if(tTotalS()-tElapsedS()<=0&&!TS.beeped){TS.beeped=true;tWrite();
try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);
o.frequency.value=880;g.gain.value=.3;o.start();setTimeout(()=>o.stop(),900);}catch(e){}
if($('tHint'))$('tHint').textContent='\u23F0 Past the timer. Still counting, press Done when you finish.';}}
function tPrimary(){TS?tDone():tStart();}
function tStart(){TS={len:(+(($('tlen')||{}).value)||25),startedAt:Date.now(),pausedMs:0,pausedAt:null,beeped:false};
tWrite();tLoop();tDraw();tBtns();
if($('tHint'))$('tHint').textContent=tCtx().record?'\uD83E\uDDE9 Recording \u00b7 press Done when the problem is solved':'Press Done when you finish.';}
function tPause(){if(!TS)return;
if(TS.pausedAt){TS.pausedMs+=Date.now()-TS.pausedAt;TS.pausedAt=null;
if($('tHint'))$('tHint').textContent='Back at it.';}
else{TS.pausedAt=Date.now();
const left=tTotalS()-tElapsedS();
if($('tHint'))$('tHint').textContent='\u23F8 Paused \u00b7 '+(left>=0?fmtTm(left)+' left':'+'+fmtTm(-left)+' over')+' \u00b7 '+fmtDur(Math.max(1,Math.round(tElapsedS()/60)))+' worked';}
tWrite();tLoop();tDraw();tBtns();}
function tReset(){TS=null;tWrite();tLoop();tDraw();tBtns();
if($('tHint'))$('tHint').textContent='Stuck at 25? Read the solution. Do not grind for 2 hours.';}
async function tDone(){
const secs=tElapsedS(),mins=Math.max(1,Math.round(secs/60));
TS=null;tWrite();tLoop();tBtns();tDraw();
if($('tHint'))$('tHint').innerHTML='\u2705 Finished \u00b7 <b class="num">'+fmtTm(secs)+'</b> elapsed';
const c=tCtx();
if(c.record)openLcLog({minutes:mins,difficulty:c.difficulty||'medium',name:c.name||'',source:'timer'},c);}
function tRestore(){tRead();
if(TS&&$('tlen')){if(![...$('tlen').options].some(o=>+o.value===TS.len)){
const o=document.createElement('option');o.value=TS.len;o.textContent=TS.len+' min';$('tlen').prepend(o);}
$('tlen').value=TS.len;}
tLoop();tDraw();tBtns();
if(TS&&$('tHint'))$('tHint').textContent=TS.pausedAt?'\u23F8 Paused \u00b7 still yours when you come back':'\u23F3 Running \u00b7 the same clock on every page';}
window.addEventListener('storage',e=>{if(e.key===TKEY){tRead();tLoop();tDraw();tBtns();}});

// ---- saved link sets: job hunting grounds, and the tabs opened for a LeetCode session ----
// shared by /jobs and /leetcode; each page sets LKKIND before calling loadLinks()
let LK=[],LKKIND='jobs',LCNEAR=null;
const LKTXT={
jobs:{empty:'No links yet. Save your filtered LinkedIn / Handshake searches here so every session starts in one tap.',
 title:'New hunting link',blurb:'Paste the URL <b>with your filters applied</b>. Next time it opens pre-filtered.',
 ph:'LinkedIn \u00b7 new grad, last 24h',url:'https://www.linkedin.com/jobs/search/?f_E=1&f_TPR=r86400\u2026'},
leetcode:{empty:'No tabs yet. Save the sites you open every LeetCode session here, then start them all in one tap.',
 title:'New LeetCode tab',blurb:'Paste a site you always want open while grinding: the problem list, your editor, a complexity cheat sheet.',
 ph:'NeetCode 150 \u00b7 arrays',url:'https://neetcode.io/practice\u2026'}};
const lkT=()=>LKTXT[LKKIND]||LKTXT.jobs;
const host=u=>{try{return new URL(u).hostname.replace(/^www\\./,'')}catch(e){return u}};
function renderLinks(){
const inb=LK.filter(l=>l.in_bundle).length;
$('openAllBtn').style.display=inb>1?'':'none';
$('openAllBtn').textContent='🚀 Open all ('+inb+')';
$('links').innerHTML=LK.length?LK.map(l=>
'<div class="snip" onclick="openOne('+l.id+')">'
+'<div class="row" style="align-items:flex-start">'
+'<div class="grow" style="min-width:0">'
+'<b class="snip-t">'+esc(l.label||host(l.url))+'</b>'
+'<div class="snip-v">'+esc(host(l.url))+'</div></div>'
+'<button class="snip-act" onclick="event.stopPropagation();openLink('+l.id+')" aria-label="edit" title="Edit">✎</button>'
+'<button class="snip-act" onclick="event.stopPropagation();delLink('+l.id+')" aria-label="delete" title="Delete">✕</button>'
+'</div>'
+'<div class="snip-hint">↗ tap to open</div>'
+'<button class="snip-more" title="include in Open all" onclick="event.stopPropagation();toggleBundle('+l.id+')">'
+(l.in_bundle?'🚀 in “Open all”':'○ not in “Open all”')+'</button>'
+'</div>').join('')
:'<div class="empty" style="grid-column:1/-1">'+lkT().empty+'</div>';}
async function loadLinks(){LK=(await api('/api/links?kind='+LKKIND)).links;renderLinks();}
// NOTE: no 'noopener' feature string here — with it window.open always returns null,
// which makes it impossible to tell "opened" from "blocked by Chrome".
function popOpen(url){
const w=window.open(url,'_blank');
if(w){try{w.opener=null}catch(e){}return true;}
return false;}
function openOne(id){const l=LK.find(x=>x.id===id);if(l&&!popOpen(l.url))toast('Chrome blocked that tab. Allow pop-ups for this site.');}
function openAll(){
const list=LK.filter(l=>l.in_bundle);
if(!list.length)return;
const blocked=[];
for(const l of list)if(!popOpen(l.url))blocked.push(l);
if(!blocked.length)return toast('🚀 '+list.length+' tabs opened. Go get them.');
// Chrome allows only the first pop-up per click until the site is allow-listed.
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:19px">⚠️ Chrome blocked '+blocked.length+' tab'+(blocked.length>1?'s':'')+'</h1>'
+'<p class="muted" style="margin-top:6px">Chrome only lets one tab open per click until you allow pop-ups for this site. '
+'Look for the blocked-pop-up icon <b>🚫</b> at the right of the address bar → <b>Always allow pop-ups from '+location.hostname+'</b> → then Open all works in one tap forever.</p>'
+'<label class="fld">Meanwhile, open the rest here</label>'
+blocked.map(l=>'<button class="snip-more" style="margin-top:8px;justify-content:flex-start" onclick="popOpen(\\''+esc(l.url).replace(/'/g,"\\\\'")+'\\');this.style.opacity=.4;this.textContent=\\'✓ opened\\'">↗ '
+esc(l.label||host(l.url))+'</button>').join('')
+'<button class="pri" style="width:100%;margin-top:16px" onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Done</button>'
+'</div></div>';}
async function toggleBundle(id){
const l=LK.find(x=>x.id===id);if(!l)return;
await api('/api/links/'+id,{method:'PATCH',body:{in_bundle:!l.in_bundle}});loadLinks();}
function openLink(id){
const l=id?LK.find(x=>x.id===id):null;
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:19px">'+(l?'✎ Edit link':'＋ '+lkT().title)+'</h1>'
+'<p class="muted" style="margin-top:4px">'+lkT().blurb+'</p>'
+'<label class="fld">Link</label>'
+'<textarea id="lk-url" rows="3" placeholder="'+lkT().url+'">'+(l?esc(l.url):'')+'</textarea>'
+'<label class="fld">Label (optional)</label>'
+'<input id="lk-label" value="'+(l?esc(l.label):'')+'" placeholder="'+lkT().ph+'" maxlength="60">'
+'<label class="row" style="gap:8px;margin-top:14px;cursor:pointer">'
+'<input type="checkbox" id="lk-bundle" style="width:auto"'+(!l||l.in_bundle?' checked':'')+'>'
+'<span style="font:700 13px var(--disp)">🚀 Include in "Open all"</span></label>'
+'<div class="row" style="margin-top:18px">'
+'<button class="pri grow" onclick="saveLink('+(l?l.id:0)+')">'+(l?'Save':'Add link')+'</button>'
+'<button onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button></div></div></div>';
setTimeout(()=>$(l?'lk-label':'lk-url').focus(),80);}
async function saveLink(id){
const url=$('lk-url').value.trim();
if(!url)return toast('Paste a link first');
const body={url,label:$('lk-label').value.trim(),in_bundle:$('lk-bundle').checked,kind:LKKIND};
try{
if(id)await api('/api/links/'+id,{method:'PATCH',body});
else await api('/api/links',{body});
$('modalHost').innerHTML='';toast(id?'Saved':'Link added');loadLinks();}
catch(e){toast(String(e))}}
async function delLink(id){
if(!confirm('Delete this link?'))return;
await api('/api/links/'+id,{method:'DELETE'});loadLinks();}

// ---- how the three LeetCode outcomes look everywhere ----
// 0 did not finish · 1 solved clean · 2 solved but the runtime was bad
const OUT={0:['\u2715','open','var(--ember2)'],1:['\u2713','solved','var(--mint)'],2:['\u26a1','slow','var(--violet)']};
const outOf=v=>OUT[v===null||v===undefined?0:+v]||OUT[0];
function outBadge(v,long){const o=outOf(v);
return '<span class="outb" style="background:'+o[2]+'22;color:'+o[2]+'">'+o[0]+' '+(long&&+v===2?'solved, slow':o[1])+'</span>';}

// ---- LeetCode log panel (shared by Today and the LeetCode tab) ----
let LCNAMES=[],LCCTX={};
const lcNorm=s=>String(s||'').replace(/\\s+/g,' ').trim().toLowerCase();
async function openLcLog(pre,ctx){
const p=pre||{};LCCTX=ctx||{};
let open=[];
try{const r=await Promise.all([api('/api/lc/open'),api('/api/lc/names')]);open=r[0].open;LCNAMES=r[1].names||[];}catch(e){}
$('modalHost').innerHTML='<div class="modal-bg"><div class="modal">'
+'<h1 style="font-size:19px">\uD83E\uDDE9 Log a LeetCode problem</h1>'
+'<p class="muted" style="margin-top:4px">All three count for today. \u26a1 Solved, slow is not counted as solved and stays in your come-back list.</p>'
+(open.length?'<label class="fld">Come back to one of these</label>'
+'<div class="row" style="flex-wrap:wrap;gap:6px">'+open.map(o=>
'<button class="chip" style="cursor:pointer" data-n="'+esc(o.name)+'" data-d="'+o.difficulty+'" onclick="lcPickOpen(this)">'
+outBadge(o.latest)+' '+esc(o.name)+' <span class="tiny">\u00d7'+o.tries+' \u00b7 '+fmtDur(o.total)+'</span></button>').join('')+'</div>':'')
+'<label class="fld">Difficulty</label>'
+'<div class="seg-ctl" id="lgDiff">'+['easy','medium','hard'].map(d=>
'<button data-d="'+d+'"'+((p.difficulty||'medium')===d?' class="on"':'')+'>'+d[0].toUpperCase()+d.slice(1)+'</button>').join('')+'</div>'
+'<label class="fld">Minutes spent</label><input id="lgMin" type="number" min="1" max="600" inputmode="numeric" value="'+(p.minutes||'')+'" placeholder="e.g. 22">'
+'<label class="fld">Problem name</label>'
+'<input id="lgName" autocomplete="off" oninput="lcSuggest()" onfocus="lcSuggest()" value="'+esc(p.name||'')+'" placeholder="Start typing, matches appear below">'
+'<div id="lgMatch" class="tiny" style="margin-top:6px;min-height:16px"></div><div id="lgSug"></div>'
+'<div class="row" style="margin-top:18px;flex-wrap:wrap">'
+'<button class="mint grow" onclick="saveLcLog(\\''+(p.source||'manual')+'\\',1)">\u2713 Solved \u00b7 +1</button>'
+'<button class="grow" style="border-color:#9B6EF388;color:var(--violet)" onclick="saveLcLog(\\''+(p.source||'manual')+'\\',2)">\u26a1 Solved, slow</button>'
+'<button class="grow" onclick="saveLcLog(\\''+(p.source||'manual')+'\\',0)">\u2715 Did not finish</button>'
+'</div>'
+'<button class="ghost" style="width:100%;margin-top:10px" onclick="$(\\'modalHost\\').innerHTML=\\'\\'">Cancel</button>'
+'</div></div>';
document.querySelectorAll('#lgDiff button').forEach(b=>b.onclick=()=>{
document.querySelectorAll('#lgDiff button').forEach(x=>x.classList.remove('on'));b.classList.add('on');});
lcSuggest();
if(!p.minutes)setTimeout(()=>$('lgMin').focus(),80);}
// live match list: pick a past problem so tries stack on the same one
function lcSuggest(){
const box=$('lgSug'),m=$('lgMatch');
if(!box||!m)return;
const q=lcNorm($('lgName').value);
if(!q){box.innerHTML='';m.innerHTML='<span style="color:var(--ink3)">Name it and past attempts will match here.</span>';return;}
const exact=LCNAMES.find(n=>lcNorm(n.name)===q);
const hits=LCNAMES.filter(n=>lcNorm(n.name)!==q&&lcNorm(n.name).indexOf(q)>=0).slice(0,6);
const near=exact||hits.length?null:lcNear(q);
m.innerHTML=exact
?'<span style="color:var(--mint);font-weight:700">\u2713 Matched \u00b7 this is try #'+(exact.tries+1)+' of \u201c'+esc(exact.name)+'\u201d</span>'
:(hits.length?'<span style="color:var(--ember2)">'+hits.length+' similar below. Tap one so it counts as the same problem.</span>'
:near?nearHTML(near,'lcUseNear()')
:'<span style="color:var(--ink3)">New problem, nothing like it logged before.</span>');
LCNEAR=near;
box.innerHTML=hits.length?'<div class="acbox">'+hits.map(n=>
'<button type="button" class="acitem" data-n="'+esc(n.name)+'" data-d="'+n.difficulty+'" onclick="lcPickName(this)">'
+'<span class="diff '+n.difficulty+'">'+n.difficulty.toUpperCase()+'</span>'
+'<span class="grow" style="min-width:0">'+esc(n.name)+'</span>'
+'<span class="tiny num">\u00d7'+n.tries+'</span>'
+outBadge(n.latest)
+'</button>').join('')+'</div>':'';}
// substring matching cannot catch a typo like "Vowles" for "Vowels", so fall back to edit distance
function lcDist(a,b,cap){
const m=a.length,n=b.length;
if(Math.abs(m-n)>cap)return cap+1;
let prev=new Array(n+1),cur=new Array(n+1);
for(let j=0;j<=n;j++)prev[j]=j;
for(let i=1;i<=m;i++){
cur[0]=i;let best=i;
for(let j=1;j<=n;j++){
cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
if(cur[j]<best)best=cur[j];}
if(best>cap)return cap+1;
const tmp=prev;prev=cur;cur=tmp;}
return prev[n];}
function lcNear(raw){
const q=lcNorm(raw);
if(q.length<4)return null;
const cap=q.length>=12?3:2;
let best=null,bestD=cap+1;
for(const n of LCNAMES){
const c=lcNorm(n.name);
if(c===q||c.indexOf(q)>=0)return null;          // already an exact or substring hit
if(Math.abs(c.length-q.length)>cap)continue;
const d=lcDist(q,c,cap);
if(d<=cap&&d<bestD){bestD=d;best=n;}}
return best;}
function nearHTML(n,fn){
return '<div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap">'
+'<span style="color:var(--ember2)">\u26a0 Did you mean \u201c'+esc(n.name)+'\u201d?</span>'
+'<span class="tiny num">\u00d7'+n.tries+(n.last?' \u00b7 last '+n.last.slice(5):'')+'</span>'
+'<button class="sm" onclick="'+fn+'">use it</button></div>';}
function lcSetDiff(d){document.querySelectorAll('#lgDiff button').forEach(x=>x.classList.toggle('on',x.dataset.d===d));}
function lcPickName(el){$('lgName').value=el.dataset.n;lcSetDiff(el.dataset.d);lcSuggest();}
function lcUseNear(){if(!LCNEAR)return;$('lgName').value=LCNEAR.name;lcSetDiff(LCNEAR.difficulty);lcSuggest();}
function lcPickOpen(el){$('lgName').value=el.dataset.n;lcSetDiff(el.dataset.d);lcSuggest();
toast('Continuing \u201c'+el.dataset.n+'\u201d');}
async function saveLcLog(source,finished){
const sel=document.querySelector('#lgDiff button.on');
const mins=+$('lgMin').value;
const name=$('lgName').value.trim();
if(!sel)return toast('Pick a difficulty');
if(!mins||mins<1)return toast('Enter how many minutes it took');
if(finished!==1&&!name)return toast('Name the problem so your next try matches it');
const ctx=LCCTX||{};
try{
const res=await api('/api/lc',{body:{difficulty:sel.dataset.d,minutes:mins,name,date:ctx.date,source,finished}});
// timed effort outside a grind session is still grind, solved or not.
// check live: a running session already covers this wall clock time, logging again would double it
let grindNote='';
if(source==='timer'){
let live=ctx.hasActiveGrind?true:null;
try{live=!!(await api('/api/grind/active')).active;}catch(e){}
if(!live){
try{await api('/api/grind/log',{body:{date:ctx.date,segments:[{t:'leetcode',m:mins}]}});grindNote=' \u00b7 +'+fmtDur(mins)+' grind';}
catch(e){}}}
$('modalHost').innerHTML='';
toast(finished===1
?('\uD83E\uDDE9 Solved \u00b7 '+sel.dataset.d+' \u00b7 '+fmtDur(mins)+(res.tries>1?' \u00b7 cracked on try #'+res.tries+' \uD83C\uDF89':'')+grindNote)
:finished===2
?('\u26a1 Solved but slow \u00b7 '+fmtDur(mins)+' \u00b7 saved to your come-back list'+grindNote)
:('\uD83E\uDDE9 Attempt #'+res.tries+' \u00b7 +1 for today, not solved yet'+grindNote));
if(ctx.onSaved)ctx.onSaved(res);}
catch(e){toast(String(e))}}
</script>`;

// what every page script may rely on: the user's zone, clock format, plan, categories, modules
export const userCtx = cfg => cfg ? {
  tz: cfg.tz, clock24: !!cfg.clock24, today: new Date().toLocaleDateString('en-CA', { timeZone: cfg.tz || 'UTC' }),
  plan: cfg.plan || null, modules: cfg.modules || {}, layouts: cfg.sched ? Object.keys(cfg.sched.layouts) : [],
  categories: (cfg.categories || []).map(c => ({ key: c.key, name: c.name, emoji: c.emoji, color: c.color, builtin: c.builtin || null })),
  streakCategory: cfg.streakCategory || null, grindTarget: cfg.grindTarget || 6, timerOptions: cfg.timerOptions || [10, 15, 20, 25, 50], timerDefault: cfg.timerDefault || 25,
  displayName: cfg.user ? cfg.user.displayName : '', handle: cfg.user ? cfg.user.handle : '', base: cfg.user ? (cfg.user.base || '') : '',
} : null;

export const shell = (title, active, body, pageScript = '', opts = {}) => {
const u = opts.u || userCtx(opts.cfg);
return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0B0E14"><link rel="manifest" href="/manifest.json">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Atkinson+Hyperlegible:wght@400;700&family=Orbitron:wght@600;800&family=VT323&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<title>${title}</title><style>${CSS}</style></head>
<body${active ? '' : ' class="nonav"'}>${(!opts.public && opts.cfg && (opts.cfg.bgStyle || 'aurora') !== 'plain') ? `<div class="bgfx ${opts.cfg.bgStyle || 'aurora'}" aria-hidden="true"><i></i></div>` : ''}${active ? navHTML(active, u) : ''}<div class="wrap">${body}</div>
<script>window.__U=${JSON.stringify(u)}${opts.public ? ';window.__PUBLIC=1' : ''}</script>
${opts.mclock ? `<script>window.__MCLOCK=${JSON.stringify(opts.mclock)}</script>` : ''}
${RUNTIME}${(opts.public || !u || u.modules.friends === false) ? '' : '<script>notifyBadge()</script>'}
${pageScript}</body></html>`;
};
