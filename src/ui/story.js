// Home page "stories": one 16:9 frame that plays scripted walkthroughs of real workflows with a visible
// cursor, clicks, typing, zooms and captions. Pure HTML/CSS/JS, no video. Each story is a scene laid out
// at 960x540 that mirrors the real page (sidebar, header, cards), kept in a <template> and cloned into the
// frame when its turn comes. The four stories play in a loop; the pills above the frame jump between them.
// Page-script rules apply to STORY_JS: no backticks, no ${, no quotes inside inline handlers.

export const STORY_CSS = `
.story{position:relative;width:100%;max-width:960px;aspect-ratio:16/9;margin:0 auto;border-radius:18px;overflow:hidden;background:var(--bg);border:1px solid var(--line2);box-shadow:0 30px 80px #000a,inset 0 0 0 1px #ffffff08;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:var(--body)}
.st-vp{position:absolute;inset:0;overflow:hidden}
.st-scene{position:absolute;left:0;top:0;width:960px;height:540px;transform-origin:0 0;transition:transform .9s cubic-bezier(.2,.8,.2,1);display:grid;grid-template-columns:150px 1fr;background:var(--bg)}
.st-scene.swap{transition:none}
/* sidebar, like the real desktop nav */
.st-side{background:rgba(19,24,36,.92);border-right:1px solid var(--line);padding:18px 10px;display:flex;flex-direction:column;gap:2px}
.st-side .logo{font-size:15px;padding:0 10px 14px}
.st-side a{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;color:var(--ink2);font:700 12px var(--disp)}
.st-side a svg{width:14px;height:14px}
.st-side a.on{background:var(--surface2);color:var(--ember)}
/* main column */
.st-main{padding:16px 22px 14px;min-width:0;display:flex;flex-direction:column;gap:8px;position:relative;overflow:hidden}
.st-main .h1{font:800 20px/1.1 var(--disp);letter-spacing:-.01em}
.st-main .desc{font-size:11px;color:var(--ink2);margin-top:-4px}
.st-ph{display:flex;align-items:flex-start;gap:12px}
.st-ph>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.st-ph .chip{font-size:11px;padding:4px 10px;white-space:nowrap}
.st-tabs{display:flex;gap:4px;background:var(--surface2);border:1px solid var(--line2);border-radius:10px;padding:3px;margin-top:2px}
.st-tabs span{flex:1;text-align:center;padding:6px;border-radius:7px;font:700 11px var(--disp);color:var(--ink2)}
.st-tabs span.on{background:var(--surface3);color:var(--ember)}
.st-disc{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 12px;font:700 12px var(--disp)}
.st-disc small{font:400 10px var(--body);color:var(--ink2)}
.st-disc i{margin-left:auto;color:var(--ink3);font-style:normal}
.st-main .sh2{font:800 13px var(--disp);margin:4px 0 0}
.st-sech{display:flex;align-items:center;gap:8px;margin-top:4px}
.st-sech .sh2{flex:1;margin:0}
.st-sech .tiny{font-size:10px}
.st-scene .card{margin:0;padding:10px 12px;border-radius:12px}
.st-scene .fld{display:block;font:600 10px var(--body);color:var(--ink2);margin:0 0 4px}
.st-scene .inp{min-height:30px;padding:6px 10px;font:12px var(--body);border-radius:9px;background:var(--well);border:1px solid var(--line2);color:var(--ink);display:flex;align-items:center;gap:5px;position:relative}
.st-scene .inp.ph{color:var(--ink3)}
.st-scene .inp .caret{width:1.5px;height:14px;background:var(--ember);animation:stblink .9s steps(1) infinite;display:none}
.st-scene .inp.on .caret{display:block}
.st-scene .inp.on{border-color:var(--ember);box-shadow:0 0 0 2px #FF6B3533}
@keyframes stblink{50%{opacity:0}}
.st-main .hint{font-size:10px;margin-top:5px;color:var(--ink3)}
.st-ac{position:absolute;left:0;right:0;top:calc(100% + 4px);background:var(--surface2);border:1px solid var(--line2);border-radius:9px;padding:3px;z-index:3;display:none}
.st-ac.on{display:block}
.st-ac div{display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:7px;font:700 11px var(--body)}
.st-ac div.hi{background:var(--surface3)}
.st-ac .diff{font-size:8px;padding:2px 5px}
.st-ac .tiny{font-size:10px}
.st-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
.st-cols>div{display:flex;flex-direction:column;gap:6px;min-width:0}
.st-scene .diff{font-size:8px;padding:2px 6px}
.st-scene button{min-height:28px;padding:4px 12px;font-size:11px;border-radius:9px;pointer-events:none}
.st-scene button.pri{font-weight:800}
.st-scene button.sm{min-height:26px;padding:3px 10px;font-size:11px}
.st-scene .sel{min-height:28px;padding:4px 10px;font:700 11px var(--body);border-radius:9px;background:var(--surface2);border:1px solid var(--line2);display:inline-flex;align-items:center;gap:6px}
.st-scene .press{transform:scale(.94);filter:brightness(1.15)}
.st-scene .tog{width:34px;height:20px;border-radius:99px;background:var(--surface3);border:1px solid var(--line2);position:relative;flex:none;transition:background .2s}
.st-scene .tog:after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:99px;background:var(--ink2);transition:left .2s,background .2s}
.st-scene .tog.on{background:var(--ember)}.st-scene .tog.on:after{left:16px;background:#fff}
/* LeetCode: timer + notes */
.st-tcard{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px}
.st-tring{position:relative;width:110px;height:110px;flex:none}
.st-tring svg{transform:rotate(-90deg);display:block}
.st-tring .tv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 24px var(--disp);font-variant-numeric:tabular-nums}
.st-tring .tv small{font:700 9px var(--disp);color:var(--ink3);letter-spacing:.06em}
.st-tbtns{display:flex;gap:6px;align-items:center}
.st-seg{display:flex;background:var(--surface2);border:1px solid var(--line2);border-radius:9px;padding:2px;width:100%}
.st-seg span{flex:1;text-align:center;padding:4px;border-radius:7px;font:700 10px var(--disp);color:var(--ink2)}
.st-seg span.on{background:var(--surface3);color:var(--ink)}
.st-ncard{min-height:212px;display:flex;flex-direction:column}
.st-nempty{flex:1;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--ink2);text-align:center;padding:20px}
.st-ned{display:none;flex-direction:column;gap:6px;flex:1}
.st-ned.on{display:flex}
.st-ned .nh{display:flex;align-items:center;gap:8px}
.st-ned .nh b{font:800 12px var(--disp);flex:1}
.st-tick{font:700 9px var(--disp);letter-spacing:.08em;color:var(--ink3);transition:color .3s}
.st-tick.on{color:var(--mint)}
.st-note{min-height:64px;align-items:flex-start;font-size:11px;line-height:1.5;flex-wrap:wrap;white-space:pre-wrap}
.st-note .caret{height:12px}
.st-code{background:#0E121B;border:1px solid var(--line2);border-radius:9px;padding:8px 10px;font:10px/1.5 var(--mono);color:#CFE3FF;white-space:pre;position:relative;min-height:54px}
.st-code:before{content:'PYTHON';position:absolute;right:8px;top:5px;font:700 8px var(--disp);letter-spacing:.12em;color:var(--ink3)}
/* LeetCode: stats page */
.st-page{display:none;flex-direction:column;gap:8px;min-width:0}
.st-page.on{display:flex}
.st-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.st-stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center}
.st-stat b{display:block;font:800 22px/1.1 var(--disp)}
.st-stat span{font:700 8px var(--disp);color:var(--ink2);letter-spacing:.08em;text-transform:uppercase}
.st-lists{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;align-items:start;min-height:0}
.st-lists>div{min-width:0}
.st-lists .card{padding:6px 10px}
.st-lwrap{height:262px;overflow:hidden;position:relative}
.st-list{display:flex;flex-direction:column;transition:transform 1.4s cubic-bezier(.4,0,.2,1)}
.st-prow{border-bottom:1px solid var(--line)}
.st-prow:last-child{border-bottom:0}
.st-prow .hd{display:flex;align-items:center;gap:8px;padding:7px 2px;font:700 11px var(--body)}
.st-prow .hd .cx{color:var(--ink3);font-size:9px;width:10px;transition:transform .2s}
.st-prow.open .hd .cx{transform:rotate(90deg)}
.st-prow .hd .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-prow .hd .tiny{font-size:10px}
.st-outb{font:800 10px var(--disp);border-radius:5px;padding:2px 6px}
.st-tries{display:none;padding:2px 0 8px 22px;flex-direction:column;gap:3px}
.st-prow.open .st-tries{display:flex}
.st-try{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--ink2)}
.st-try b{color:var(--ink);font:700 10px var(--disp);min-width:44px}
/* Jobs */
.st-hg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st-hgc{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 10px}
.st-hgc b{display:block;font:800 12px var(--disp)}
.st-hgc small{display:block;font-size:10px;color:var(--ink2)}
.st-hgc em{display:block;font:700 9px var(--disp);color:var(--ink2);margin-top:4px;font-style:normal}
.st-search{min-height:30px}
.st-chips{display:flex;gap:6px;margin:4px 0 8px}
.st-chips button{flex:1;min-height:30px;font-size:11px;padding:4px 6px}
.st-chips button.on{border-color:var(--ember);color:var(--ember);background:#FF6B3518}
.st-chips button.on.mint{background:#3DDC9722;border-color:var(--mint);color:var(--mint)}
.st-fchips{display:flex;gap:6px}
.st-fchips span{padding:4px 10px;border-radius:99px;border:1px solid var(--line2);background:var(--surface2);font:700 10px var(--disp);color:var(--ink2)}
.st-fchips span.on{border-color:var(--ink3);color:var(--ink)}
.st-tbl{width:100%;border-collapse:collapse;font-size:11px}
.st-tbl th{font:600 9px var(--body);color:var(--ink2);text-align:left;padding:5px 6px;border-bottom:1px solid var(--line2)}
.st-tbl td{padding:7px 6px;border-bottom:1px solid var(--line);vertical-align:middle;white-space:nowrap}
.st-tbl tr.new td{background:#5EA2FF12}
.st-tbl tr.hide{display:none}
.st-tbl .jt{color:var(--ice);font-weight:700}
.st-tbl .sel{min-height:24px;padding:2px 8px;font-size:10px}
.st-tbl .sel.oa{background:#9B6EF322;color:var(--violet);border-color:#9B6EF355}
.st-tbl .sel.ap{background:#5EA2FF22;color:var(--ice);border-color:#5EA2FF55}
.st-term{position:absolute;right:16px;top:16px;width:380px;background:#0A0D13;border:1px solid var(--line2);border-radius:12px;box-shadow:0 20px 60px #000c;font:11px/1.6 var(--mono);color:#CFE3FF;z-index:6;transform:translateX(30px);opacity:0;transition:transform .4s cubic-bezier(.2,.8,.2,1),opacity .4s}
.st-term.on{transform:none;opacity:1}
.st-term .th{display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid var(--line);font:700 10px var(--disp);color:var(--ink2);letter-spacing:.06em}
.st-term .th i{width:8px;height:8px;border-radius:99px;background:#FF5D73;display:inline-block}.st-term .th i+i{background:#FFB347}.st-term .th i+i+i{background:#3DDC97}
.st-term .tb{padding:10px 12px;min-height:96px;white-space:pre-wrap}
.st-term .k{color:var(--ember2)}.st-term .ok{color:var(--mint)}.st-term .c{color:var(--ink3)}
/* Today */
.st-dh{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px 14px}
.st-dh .top{display:flex;align-items:center;gap:8px}
.st-dh .top .h1{flex:1}
.st-dh .nav{display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--line)}
.st-dh .nav b{flex:1;text-align:center;font:700 12px var(--disp)}
.st-dh .nav span{width:26px;height:26px;border-radius:8px;background:var(--surface2);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:var(--ink2)}
.st-race{display:flex;gap:1px;height:12px;border-radius:5px;overflow:hidden;margin-top:8px}
.st-race i{flex:1;background:#263045;opacity:.28}
.st-race i.p{opacity:.9}.st-race i.t{opacity:1;box-shadow:0 0 6px 1px var(--ice)}
.st-racec{display:flex;justify-content:space-between;font:700 8px var(--disp);color:var(--ink2);margin-top:3px}
.st-task{display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);align-items:flex-start;font-size:11px}
.st-task:last-child{border-bottom:0}
.st-task .bx{width:18px;height:18px;border:2px solid var(--line2);border-radius:6px;flex:none;display:flex;align-items:center;justify-content:center;font:800 10px var(--disp);color:transparent}
.st-task.done .bx{background:var(--mint);border-color:var(--mint);color:#062A1C}
.st-task.done .t{text-decoration:line-through;color:var(--ink3)}
.st-task .t{font-weight:700}
.st-task .d{font-size:10px;color:var(--ink2)}
.st-task .cnt{display:flex;align-items:center;gap:4px;margin-left:auto;font:800 11px var(--disp)}
.st-task .cnt button{min-height:22px;min-width:22px;padding:0;font-size:12px;border-radius:7px}
.st-nt{display:none;background:var(--surface2);border:1px solid var(--line2);border-left:3px solid var(--ember);border-radius:10px;padding:8px 10px;margin-top:6px;flex-direction:column;gap:6px}
.st-nt.on{display:flex}
.st-nt .nh{display:flex;gap:8px;align-items:center}
.st-nt .nh b{font:800 11px var(--disp)}.st-nt .nh small{font-size:9px;color:var(--ink2);display:block}
.st-nt .tile{width:24px;height:24px;font-size:12px;border-radius:7px}
.st-nt .row{display:flex;align-items:center;gap:8px}
.st-nt .foot{display:flex;justify-content:flex-end;gap:6px;padding-top:6px;border-top:1px solid var(--line)}
.st-rings{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.st-rc{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 6px;text-align:center}
.st-rc .lab{font:700 8px var(--disp);color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-rc .rg{position:relative;width:56px;height:56px;margin:6px auto 0}
.st-rc .rg svg{transform:rotate(-90deg);display:block}
.st-rc .rg .v{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 16px var(--disp);line-height:1}
.st-rc .rg .v small{font:700 7px var(--disp);color:var(--ink3);margin-top:2px}
.st-rc .bt{display:flex;justify-content:center;gap:6px;margin-top:6px}
.st-rc .bt button{min-height:22px;min-width:26px;padding:0;font-size:11px;border-radius:7px}
.st-tl{display:flex;flex-direction:column;gap:6px}
.st-tli{display:grid;grid-template-columns:56px 1fr;gap:8px;align-items:start;font-size:11px}
.st-tli .tm{font:700 9px var(--disp);color:var(--ink2);background:var(--surface2);border-radius:6px;padding:2px 4px;text-align:center}
.st-tli b{font:800 11px var(--disp)}
.st-tli small{display:block;font-size:9px;color:var(--ink2)}
.st-foot{display:flex;justify-content:flex-end;gap:6px;padding-top:8px;margin-top:8px;border-top:1px solid var(--line)}
.st-live{display:none;border:1px solid #FF6B3550;background:linear-gradient(135deg,#FF6B3512,#FFB34708);border-radius:12px;padding:10px 12px;flex-direction:column;gap:8px}
.st-live.on{display:flex}
.st-live .lm{display:flex;align-items:center;gap:10px}
.st-live .fire{font-size:22px;line-height:1.1;flex:none}
.st-live .tx{flex:1;min-width:0}
.st-live .tx b{display:block;font:800 13px var(--disp)}
.st-live .tx small{display:block;font-size:10px;color:var(--ink2);margin-top:1px}
.st-live .tx .pill{font-size:9px;padding:2px 8px;margin-top:6px;display:inline-flex}
.st-live .tm{text-align:right;flex:none}
.st-live .tm b{display:block;font:800 18px/1.1 var(--disp);font-variant-numeric:tabular-nums}
.st-live .tm small{font-size:10px;color:var(--ink2)}
.st-live .bt{display:flex;gap:6px;flex:none}
.st-live .bar{height:8px;border-radius:99px;background:var(--grad)}
.st-pick{position:absolute;inset:0;background:rgba(5,7,11,.7);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .3s;z-index:4}
.st-pick.on{opacity:1}
.st-pick .sheet{background:var(--surface);border:1px solid var(--line2);border-radius:16px;padding:16px;width:340px}
.st-pick .sheet .t{font:800 15px var(--disp);margin-bottom:8px}
.st-pick .sheet button{display:flex;align-items:center;gap:8px;width:100%;justify-content:flex-start;margin-top:6px;min-height:32px}
/* Quick Copy */
.st-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st-snip{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:9px 10px;position:relative;transition:border-color .2s}
.st-snip.copied{border-color:#3DDC97aa}
.st-snip b{display:block;font:800 12px var(--disp)}
.st-snip .v{font-size:10px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.st-snip .acts{position:absolute;right:8px;top:8px;display:flex;gap:4px}
.st-snip .acts span{width:20px;height:20px;border-radius:6px;background:var(--surface2);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font-size:9px;color:var(--ink2)}
.st-snip em{display:block;font:700 9px var(--disp);color:var(--ink2);margin-top:5px;font-style:normal}
.st-snip .sub{display:none;margin-top:6px;border-top:1px solid var(--line);padding-top:5px;flex-direction:column;gap:3px}
.st-snip.open .sub{display:flex}
.st-snip .sub div{display:flex;gap:6px;font-size:10px}.st-snip .sub div b{font:700 10px var(--body);color:var(--ink2);min-width:56px}
.st-snip .more{margin-top:6px;border:1px solid var(--line2);border-radius:8px;padding:4px;text-align:center;font:700 9px var(--disp);color:var(--ink2)}
.st-snip.new{animation:stpop .5s cubic-bezier(.2,.8,.2,1)}
@keyframes stpop{0%{transform:scale(.9);opacity:0}100%{transform:none;opacity:1}}
.st-sub{display:flex;gap:6px;align-items:center;margin-top:4px}
.st-sub .inp{flex:1;min-height:26px;font-size:11px}
/* shared: modal, toast, cursor, chrome */
.st-modal{position:absolute;inset:0;background:rgba(5,7,11,.7);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4}
.st-modal.on{opacity:1}
.st-sheet{background:var(--surface);border:1px solid var(--line2);border-radius:16px;padding:16px;width:360px;max-width:100%;transform:translateY(14px);transition:transform .35s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;gap:6px}
.st-modal.on .st-sheet{transform:none}
.st-sheet .t{font:800 16px var(--disp);margin-bottom:2px}
.st-sheet .s{font-size:11px;color:var(--ink2);margin-bottom:4px}
.st-toast{position:absolute;right:14px;bottom:14px;transform:translate(0,16px);background:var(--surface3);border:1px solid var(--line2);border-radius:12px;padding:10px 14px;font:700 13px var(--disp);box-shadow:0 12px 40px #000a;opacity:0;transition:opacity .3s,transform .3s;z-index:32;white-space:nowrap}
.st-toast.on{opacity:1;transform:none}
.st-cur{position:absolute;left:480px;top:300px;width:22px;height:26px;z-index:20;transition:left .75s cubic-bezier(.3,.7,.3,1),top .75s cubic-bezier(.3,.7,.3,1);filter:drop-shadow(0 2px 4px #000a);pointer-events:none}
.st-cur svg{display:block}
.st-cur.press{transform:scale(.85)}
.st-rip{position:absolute;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:99px;border:2px solid var(--ember);opacity:0;z-index:19;pointer-events:none}
.st-rip.go{animation:strip .5s ease-out}
@keyframes strip{0%{transform:scale(.3);opacity:.9}100%{transform:scale(1.4);opacity:0}}
.st-top{position:absolute;left:0;right:0;top:0;height:34px;z-index:30;background:linear-gradient(180deg,rgba(11,14,20,.85),rgba(11,14,20,0));pointer-events:none}
.st-bar{position:absolute;left:14px;right:14px;top:10px;display:flex;gap:4px}
.st-bar i{flex:1;height:3px;border-radius:99px;background:#ffffff26;overflow:hidden;position:relative}
.st-bar i b{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--ember);border-radius:99px}
.st-bar i.done b{width:100%}
.st-bar i.live b{transition:width linear}
.st-bot{position:absolute;left:0;right:0;bottom:0;height:64px;z-index:30;background:linear-gradient(0deg,rgba(11,14,20,.92),rgba(11,14,20,0));pointer-events:none}
.st-cap{position:absolute;left:14px;bottom:14px;max-width:calc(100% - 28px);z-index:31;background:rgba(19,24,36,.96);border:1px solid var(--line2);border-radius:12px;padding:9px 12px;font:700 13px/1.35 var(--body);color:var(--ink);display:flex;gap:10px;align-items:center;transform:translateY(8px);opacity:0;transition:transform .3s,opacity .3s}
.st-cap.on{transform:none;opacity:1}
.st-cap i{flex:none;width:22px;height:22px;border-radius:99px;background:var(--grad);color:#1A0D05;display:inline-flex;align-items:center;justify-content:center;font:900 11px var(--disp);font-style:normal}
.st-ff{position:absolute;right:14px;top:22px;z-index:31;font:800 11px var(--disp);letter-spacing:.08em;color:var(--ember2);background:#FFB34718;border:1px solid #FFB34755;border-radius:99px;padding:4px 8px;opacity:0;transition:opacity .3s}
.st-ff.on{opacity:1}
.st-end{position:absolute;inset:0;z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;background:rgba(11,14,20,.92);opacity:0;pointer-events:none;transition:opacity .5s}
.st-end.on{opacity:1}
.st-end b{font:900 clamp(24px,4vw,40px)/1.1 var(--disp);letter-spacing:-.02em}
.st-end b em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.st-end span{color:var(--ink2);font-size:14px}
.st-pause{position:absolute;inset:0;z-index:26;display:none;align-items:center;justify-content:center;background:rgba(11,14,20,.35)}
.story.paused .st-pause{display:flex}
.st-pause b{width:56px;height:56px;border-radius:99px;background:rgba(19,24,36,.9);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font-size:22px}
/* around the frame: story pills above, step rows below */
.ld-story{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin-top:20px}
.st-pills{display:flex;gap:6px;flex-wrap:wrap}
.st-pills button{padding:8px 14px;font:700 13px var(--disp);border-radius:99px;min-height:36px}
.st-pills button.on{background:var(--surface3);border-color:var(--ink3);color:var(--ember)}
.ld-steps{list-style:none;display:none;gap:8px}
.ld-steps.on{display:grid}
@media(min-width:900px){.ld-steps{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}.ld-steps li{flex-direction:column;align-items:flex-start;gap:8px;font-size:13px}}
.ld-steps li{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid transparent;color:var(--ink2);font-size:14px;line-height:1.45;transition:background .3s,border-color .3s,color .3s}
.ld-steps li i{flex:none;width:24px;height:24px;border-radius:8px;background:var(--surface2);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font:800 12px var(--disp);font-style:normal;color:var(--ink2)}
.ld-steps li.on{background:var(--surface);border-color:var(--line2);color:var(--ink)}
.ld-steps li.on i{background:var(--grad);border-color:transparent;color:#1A0D05}
@media(max-width:599px){.ld-steps{display:none!important}.ld-story{margin-top:16px}.story{border-radius:12px}.st-cap{font-size:11px;padding:7px 10px;bottom:8px;left:8px}.st-bar{left:8px;right:8px;top:6px}.st-bot{height:44px}.st-pills button{padding:6px 10px;font-size:12px;min-height:32px}}
`;

const RING = (r, w, color, dash, cls) => `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}"><circle cx="${r}" cy="${r}" r="${r - w / 2}" fill="none" stroke="var(--surface3)" stroke-width="${w}"/><circle class="p${cls ? ' ' + cls : ''}" cx="${r}" cy="${r}" r="${r - w / 2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="0" style="transition:stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1),stroke .3s"/></svg>`;
const CT = 2 * Math.PI * 50;   // timer ring: r 55, stroke 10
const CR = 2 * Math.PI * 24;   // goal ring: r 28, stroke 8
const NAV = [['today', 'Today'], ['calendar', 'Calendar'], ['progress', 'Progress'], ['leetcode', 'LeetCode'], ['jobs', 'Jobs'], ['copy', 'Copy'], ['friends', 'Friends'], ['settings', 'Settings']];
const side = (ic, on) => `<aside class="st-side"><div class="logo">LOCK<em>IN</em> 🔥</div>${NAV.map(([i, l]) => `<a class="${l === on ? 'on' : ''}">${ic(i, 14)}${l}</a>`).join('')}</aside>`;
const outb = (k) => k === 'solved' ? '<span class="st-outb" style="background:#3DDC9722;color:var(--mint)">✓ solved</span>' : k === 'slow' ? '<span class="st-outb" style="background:#9B6EF322;color:var(--violet)">⚡ slow</span>' : '<span class="st-outb" style="background:#FFB34722;color:var(--ember2)">✕ open</span>';
const prow = (id, d, name, n, age, out, tries) => `<div class="st-prow"${id ? ` id="${id}"` : ''}><div class="hd"><span class="cx">▸</span><span class="diff ${d}">${d.toUpperCase()}</span><span class="nm">${name}</span><span class="tiny">×${n} ${age}</span>${outb(out)}</div>${tries ? `<div class="st-tries">${tries.map(t => `<div class="st-try"><b>${t[0]}</b><span>${t[1]}</span>${outb(t[2])}</div>`).join('')}</div>` : ''}</div>`;

// ---------- scene 1: LeetCode (Solve page + Stats page) ----------
const sceneLc = (ic) => `${side(ic, 'LeetCode')}
<main class="st-main">
  <div class="h1">LeetCode</div>
  <div class="desc">Pick a problem, run the timer, log how it went. A problem's state is its newest attempt.</div>
  <div class="st-tabs"><span class="on" id="stTabSolve">🧩 Solve</span><span id="stTabStats">📊 Stats</span></div>
  <div class="st-page on" id="stPgSolve">
    <div class="st-disc">🔗 My LeetCode tabs <small>the sites you open every session</small><i>›</i></div>
    <div class="sh2">Problem</div>
    <div class="card" id="stProb">
      <div class="inp ph" id="stInp"><span id="stInpT">Type the problem name, matches appear below</span><span class="caret"></span>
        <div class="st-ac" id="stAc"><div id="stAc1"><span class="diff easy">EASY</span>Two Sum <span class="tiny">×1 · 9m · solved</span></div><div><span class="diff medium">MEDIUM</span>Two Sum II <span class="tiny">new</span></div></div>
      </div>
      <div class="hint">Or start a brand new problem by typing its name.</div>
    </div>
    <div class="st-cols">
      <div><div class="sh2">Focus timer</div>
        <div class="card st-tcard" id="stTimer">
          <div class="st-tring">${RING(55, 10, 'var(--ember)', CT)}<div class="tv"><span id="stTv">25:00</span><small>25 MIN</small></div></div>
          <div class="st-tbtns"><button class="pri" id="stStart">Start</button><button id="stReset">Reset</button><span class="sel">25 min <span style="color:var(--ink3)">⌄</span></span></div>
          <div class="st-seg"><span>Easy</span><span class="on">Medium</span><span>Hard</span></div>
        </div>
      </div>
      <div><div class="sh2">Notes</div>
        <div class="card st-ncard" id="stNoteCard">
          <div class="st-nempty" id="stNempty">Pick a problem to open its notes.</div>
          <div class="st-ned" id="stNed"><div class="nh"><span class="diff easy" id="stNdiff">EASY</span><b id="stNname">Two Sum</b><span class="st-tick" id="stTick">UNSAVED</span></div>
            <div class="inp st-note ph" id="stNote"><span id="stNoteT">What would you tell yourself next time?</span><span class="caret"></span></div>
            <div class="st-code" id="stCode">seen = {}
for i, x in enumerate(nums):
    if target - x in seen: return [seen[target - x], i]
    seen[x] = i</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="st-page" id="stPgStats">
    <div class="st-stats"><div class="st-stat"><b style="color:var(--mint)">26</b><span>problems solved</span></div><div class="st-stat"><b style="color:var(--ember2)">1</b><span>still unsolved</span></div><div class="st-stat"><b style="color:var(--violet)">1</b><span>solved, slow</span></div><div class="st-stat"><b>70</b><span>tries logged</span></div></div>
    <div class="st-lists">
      <div><div class="st-sech"><div class="sh2">Toughest problems</div><span class="tiny">avg 2.6 tries per solved · oldest first</span></div>
        <div class="card"><div class="st-lwrap"><div class="st-list" id="stList">
          ${prow('', 'medium', 'Reverse Words in a String', 2, '8d', 'solved')}
          ${prow('', 'easy', 'Kids With the Greatest Number of Candies', 2, '8d', 'solved')}
          ${prow('', 'easy', 'Merge Strings Alternately', 2, '8d', 'solved')}
          ${prow('', 'easy', 'Maximum Average Subarray I', 5, '7d', 'solved')}
          ${prow('', 'easy', 'Find the Difference of Two Arrays', 4, '7d', 'solved')}
          ${prow('', 'easy', 'Greatest Common Divisor of Strings', 3, '7d', 'solved')}
          ${prow('', 'easy', 'Move Zeroes', 3, '7d', 'solved')}
          ${prow('stRowX', 'medium', 'String Compression', 7, '4d', 'solved', [['Sep 2', '41m', 'open'], ['Sep 3', '38m', 'open'], ['Sep 4', '29m', 'slow'], ['Sep 5', '33m', 'open'], ['Sep 6', '19m', 'solved']])}
          ${prow('', 'medium', 'Longest Subarray of 1s After Deleting One', 4, '4d', 'solved')}
          ${prow('', 'medium', 'Max Consecutive Ones III', 3, '4d', 'solved')}
          ${prow('', 'medium', 'Increasing Triplet Subsequence', 3, '4d', 'solved')}
          ${prow('', 'easy', 'Is Subsequence', 2, '6d', 'solved')}
        </div></div></div>
      </div>
      <div><div class="sh2">Come back to these</div>
        <div class="card">${prow('stBack', 'hard', 'LRU Cache', 1, '1d', 'open')}${prow('', 'medium', 'Asteroid Collision', 2, '1d', 'slow')}</div>
        <div class="hint" style="margin-top:6px">Unsolved or slow on the newest attempt. Tap one to load it on Solve.</div>
      </div>
    </div>
  </div>
</main>
<div class="st-modal" id="stModal"><div class="st-sheet">
  <div class="t">How did it go?</div><div class="s">Two Sum · 7 minutes on the clock</div>
  <span class="fld">Difficulty</span><div class="st-chips"><button id="stEasy">Easy</button><button>Medium</button><button>Hard</button></div>
  <span class="fld">Outcome</span><div class="st-chips"><button class="mint" id="stSolved">✓ Solved</button><button>⚡ Slow</button><button>✕ Open</button></div>
  <button class="pri" id="stSave" style="width:100%">Log it</button>
</div></div>`;

// ---------- scene 2: Jobs, logged by an agent ----------
const jrow = (id, date, title, co, plat, sal, loc, status, cls) => `<tr${id ? ` id="${id}"` : ''}${cls ? ` class="${cls}"` : ''}><td>${date}</td><td class="jt">${title} ↗</td><td>${co}</td><td style="color:var(--ink2)">${plat}</td><td><b>${sal}</b></td><td>${loc}</td><td><span class="sel ${status === 'OA' ? 'oa' : 'ap'}"${id ? ` id="${id}S"` : ''}>${status} ⌄</span></td><td style="color:var(--ink3)">✕</td></tr>`;
const sceneJobs = (ic) => `${side(ic, 'Jobs')}
<main class="st-main">
  <div class="st-ph"><div><div class="h1">Applications</div><div class="desc">Every application you send, with where it stands. Adding one bumps today's goal.</div></div><span class="chip" id="stJToday">📨 today: <b id="stJn">0</b> / 10</span></div>
  <div class="st-sech"><div class="sh2">Hunting grounds</div><button class="sm">＋ Link</button><button class="pri sm">🚀 Open all (3)</button></div>
  <div class="st-hg"><div class="st-hgc"><b>LinkedIn</b><small>linkedin.com</small><em>↗ tap to open</em></div><div class="st-hgc"><b>Handshake</b><small>app.joinhandshake.com</small><em>↗ tap to open</em></div><div class="st-hgc"><b>Migrate</b><small>migratemate.co</small><em>↗ tap to open</em></div></div>
  <div class="sh2">Log an application</div>
  <div class="st-disc"><span class="tile" style="width:24px;height:24px;font-size:12px;border-radius:7px;background:#9B6EF322;border-color:#9B6EF355">＋</span>Add application <small>Title and company are enough. Counts toward today's goal.</small><i>›</i></div>
  <div class="st-sech"><div class="sh2">Applications</div><span class="tiny" id="stJtot">154 logged</span></div>
  <div class="inp ph st-search">🔍 Search job title or company</div>
  <div class="st-fchips"><span class="on">All <b id="stJall">154</b></span><span>Applied <b id="stJap">130</b></span><span>OA <b id="stJoa">1</b></span><span>Interview 0</span><span>Offer 🎉 0</span><span>Rejected 23</span></div>
  <div class="card" style="padding:0 6px"><table class="st-tbl"><thead><tr><th>Date</th><th>Job title</th><th>Company</th><th>Platform</th><th>Salary</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>
    ${jrow('stJnew', 'Sep 10', 'Front-End Developer 🤖', 'T-Mobile', 'LinkedIn', '$61k–$111k', 'New York, NY', 'Applied', 'new hide')}
    ${jrow('', 'Sep 9', 'Software Engineer', 'Interstate', 'LinkedIn', '$80k–$110k', 'Teaneck, NJ', 'Applied')}
    ${jrow('', 'Sep 9', 'Developer, Analytics', 'Versant Media', 'LinkedIn', '–', 'New York, NY', 'Applied')}
  </tbody></table></div>
</main>
<div class="st-term" id="stTerm"><div class="th"><i></i><i></i><i></i> CLAUDE CODE · agent key</div><div class="tb" id="stTb"></div></div>`;

// ---------- scene 3: Today, add a task, start a grind ----------
const goal = (id, emoji, lab, v, g, color) => `<div class="st-rc"><div class="lab">${emoji} ${lab}</div><div class="rg">${RING(28, 8, color, CR, id)}<div class="v"><span>${v}</span><small>OF ${g}</small></div></div><div class="bt"><button>−</button><button class="pri">+</button></div></div>`;
const sceneToday = (ic) => `${side(ic, 'Today')}
<main class="st-main">
  <div class="st-dh"><div class="top"><div class="h1">Wednesday</div><span class="chip" style="color:var(--ice);border-color:#5EA2FF55">Phase 1 · Fundamentals</span><span class="chip" style="color:var(--ember2)">🔥 1 day streak</span><span class="chip">🌞 morning</span></div>
    <div class="nav"><span>‹</span><b>Wed, September 9</b><span>›</span></div>
    <div class="st-race">${Array.from({ length: 56 }, (_, i) => `<i class="${i < 14 ? 'p' : ''}${i === 14 ? 't' : ''}" style="background:${i < 26 ? '#5EA2FF' : i < 40 ? '#FFB347' : '#3DDC97'}"></i>`).join('')}</div>
    <div class="st-racec"><span>AUG 26</span><span style="color:var(--ink)">DAY 15 OF 112</span><span>DEC 15</span></div>
  </div>
  <div class="st-live" id="stLive"><div class="lm"><span class="fire">🔥</span><div class="tx"><b>🔒 Ad-hoc grind</b><small>Ad-hoc session · checked in 3:27 PM</small><span class="pill" style="background:#9B6EF322;color:var(--violet)">📚 Course</span></div><div class="tm"><b id="stLtm">0m</b><small>elapsed</small></div><div class="bt"><button class="sm">⇄ Switch</button><button class="sm">⏸ Pause</button><button class="pri sm">Check out</button></div></div><div class="bar"></div></div>
  <div class="st-cols" style="grid-template-columns:1.25fr 1fr">
    <div>
      <div class="sh2">Tasks</div>
      <div class="card" id="stTasks">
        <div class="st-task done"><span class="bx">✓</span><div><div class="t">🧩 4 LeetCode problems</div><div class="d">Attempts count here too · +4 extra 💪</div></div><div class="cnt"><button>−</button>8/4<button class="pri">+</button></div></div>
        <div class="st-task done"><span class="bx">✓</span><div><div class="t">📨 10 applications</div><div class="d">Auto-checks when the counter hits 10</div></div><div class="cnt"><button>−</button>14/10<button class="pri">+</button></div></div>
        <div class="st-task" id="stTnew" style="display:none"><span class="bx">✓</span><div><div class="t">📌 Finish the graph assignment</div><div class="d">Pinned to this date</div></div></div>
        <div class="st-nt" id="stNt"><div class="nh"><span class="tile">📝</span><div><b>New task</b><small>Shows in this day’s list and counts toward tasks done.</small></div></div>
          <span class="fld">Task</span><div class="inp ph" id="stTin"><span id="stTinT">What needs doing?</span><span class="caret"></span></div>
          <div class="row"><div style="flex:1"><b style="font:800 11px var(--disp)">Pin to this date</b><small style="display:block;font-size:9px;color:var(--ink2)">Pinned tasks stay on this day.</small></div><span class="tog" id="stPin"></span></div>
          <div class="foot"><button class="sm">Cancel</button><button class="pri sm" id="stTadd">Add task</button></div>
        </div>
        <div style="margin-top:6px"><button class="sm" id="stAddT">＋ Add task</button></div>
      </div>
      <div class="sh2">Schedule</div>
      <div class="card" id="stSched">
        <div class="st-tl"><div class="st-tli"><span class="tm">9:00 AM</span><div><b>🔥 Block 1</b><small>🧩 2h · 📨 1h</small></div></div><div class="st-tli"><span class="tm">12:00 PM</span><div><b>🎮 Free · friends can book</b><small>💬 Jordan · 1:00 PM – 2:00 PM</small></div></div><div class="st-tli"><span class="tm">3:00 PM</span><div><b>🔥 Block 2</b><small>📚 2h · 🧩 1h</small></div></div></div>
        <div class="st-foot"><button class="sm">✍️ Log a past grind</button><button class="pri sm" id="stGo">🔥 Start grind now</button></div>
      </div>
    </div>
    <div>
      <div class="sh2">Goals</div>
      <div class="st-rings">${goal('r1', '🧩', 'LeetCode', 8, 4, 'var(--mint)')}${goal('r2', '📨', 'Applications', 14, 10, 'var(--mint)')}</div>
      <div class="sh2">Day clock</div>
      <div class="card" style="display:flex;justify-content:center;padding:8px"><svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="72" fill="#10151F" stroke="#263045"/><path d="M75 15 A60 60 0 0 1 135 75" fill="none" stroke="#5EA2FF" stroke-width="12"/><path d="M27 40 A60 60 0 0 1 75 15" fill="none" stroke="#FF6B35" stroke-width="12"/><path d="M75 135 A60 60 0 0 1 22 96" fill="none" stroke="#3DDC97" stroke-width="12"/><path d="M135 75 A60 60 0 0 1 108 126" fill="none" stroke="#FF6B35" stroke-width="12"/><line x1="75" y1="75" x2="75" y2="30" stroke="#EDF1F7" stroke-width="2" stroke-linecap="round"/><circle cx="75" cy="75" r="3" fill="#EDF1F7"/>${[12, 3, 6, 9].map((h, i) => `<text x="${[75, 128, 75, 22][i]}" y="${[24, 79, 132, 79][i]}" text-anchor="middle" font-size="9" font-weight="800" fill="#97A3B6" font-family="Archivo">${h}</text>`).join('')}</svg></div>
    </div>
  </div>
</main>
<div class="st-pick" id="stPick"><div class="sheet"><div class="t">What are you grinding?</div><div class="s" style="font-size:11px;color:var(--ink2)">Switch any time. Splits are kept per task.</div><button>🧩 LeetCode</button><button>📨 Applications</button><button id="stPickC" style="border-color:#9B6EF355">📚 Course</button></div></div>`;

// ---------- scene 4: Quick Copy ----------
const snip = (id, title, v, subs, cls) => `<div class="st-snip${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''}><b>${title}</b><div class="v">${v}</div><div class="acts"><span>✎</span><span>✕</span></div><em>📋 tap to copy</em>${subs ? `<div class="sub">${subs.map(s => `<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div><div class="more"${id ? ` id="${id}M"` : ''}>▾ Show ${subs.length} sub-item${subs.length > 1 ? 's' : ''}</div>` : ''}</div>`;
const sceneCopy = (ic) => `${side(ic, 'Copy')}
<main class="st-main">
  <div class="st-ph"><div><div class="h1">Quick Copy</div><div class="desc">Tap a block to copy it. Built for speed-running application forms: name, address, LinkedIn URL, work-auth answer.</div></div><button class="pri sm" id="stAddB">＋ Add block</button></div>
  <div class="st-grid" id="stGrid">
    ${snip('stS1', 'Address', '315 West 33rd Street, New York, NY 10001', [['Street', '315 West 33rd Street'], ['City', 'New York'], ['State', 'NY'], ['ZIP', '10001']])}
    ${snip('', 'LinkedIn URL', 'https://www.linkedin.com/in/sam-lee-dev')}
    ${snip('', 'Portfolio', 'https://samlee.dev')}
    ${snip('', 'Names', 'Sam Lee', [['First', 'Sam'], ['Last', 'Lee']])}
    ${snip('', 'Email', 'sl1234@nyu.edu')}
    ${snip('', 'Phone number', '+1 585 555 0142')}
    ${snip('stSnew', 'Work authorization', 'F-1 OPT, then STEM OPT extension (3 years)', [['Short', 'Yes, OPT'], ['Sponsorship', 'Yes, in 3 years']], 'new')}
  </div>
</main>
<div class="st-modal" id="stBm"><div class="st-sheet">
  <div class="t">＋ Add block</div>
  <span class="fld">Title</span><div class="inp ph" id="stBt"><span id="stBtT">e.g. Address</span><span class="caret"></span></div>
  <span class="fld">Value · what gets copied</span><div class="inp ph st-note" id="stBv" style="min-height:44px"><span id="stBvT">Paste the full answer</span><span class="caret"></span></div>
  <span class="fld" style="margin-top:4px">Sub-items · each copies on its own</span>
  <div class="st-sub" id="stSub1" style="display:none"><div class="inp" style="flex:.5"><span>Short</span></div><div class="inp" id="stSubV"><span id="stSubVT"></span><span class="caret"></span></div></div>
  <div class="st-sub" id="stSub2" style="display:none"><div class="inp" style="flex:.5"><span>Sponsorship</span></div><div class="inp"><span>Yes, in 3 years</span></div></div>
  <button class="sm" id="stSubAdd" style="align-self:flex-start">＋ sub-item</button>
  <div class="row" style="gap:6px;margin-top:6px"><button class="pri" id="stBsave" style="flex:1">Add block</button><button>Cancel</button></div>
</div></div>`;

export const STORY_META = [
  { id: 'lc', title: '🧩 Solve, note, come back', steps: ['Pick the problem', 'Start the focus timer', 'Press Done, log it', 'Today counts it', 'Write the note', 'Stats: every try', 'Come back to these'], end: ['Every solve, <em>every note.</em>', 'Reruns stack on the same problem. Nothing is lost.'] },
  { id: 'jobs', title: '📨 Log a job with an agent', steps: ['Tell the agent about the job', 'It writes through the Jobs key', 'The row appears, the goal moves', 'Update the status as it moves'], end: ['Applications, <em>logged for you.</em>', 'A separate key gives an agent this tab and nothing else.'] },
  { id: 'today', title: '📅 Add a task, start a grind', steps: ['Add a task to today', 'Pin it', 'Start grind now', 'Pick what you are grinding', 'The session runs'], end: ['Check in. <em>Grind.</em>', 'Every minute lands on a category. Splits are kept.'] },
  { id: 'copy', title: '📋 Quick Copy', steps: ['Add a block', 'Give it sub-items', 'Tap to copy'], end: ['Type it once, <em>copy it forever.</em>', 'Forms take minutes, not evenings.'] },
];

export const STORY_HTML = (ic) => `
<div class="st-pills" id="stPills" role="tablist" aria-label="walkthroughs">${STORY_META.map((m, i) => `<button data-st="${i}"${i === 0 ? ' class="on"' : ''}>${m.title}</button>`).join('')}</div>
<div class="story" id="story" role="img" aria-label="Animated walkthroughs of LockIn">
  <div class="st-top"><div class="st-bar" id="stBar"></div></div>
  <div class="st-ff" id="stFF">⏩ 7 min later</div>
  <div class="st-vp"><div class="st-scene" id="stScene"></div></div>
  <div class="st-bot"></div>
  <div class="st-toast" id="stToast"></div>
  <div class="st-cap" id="stCap"><i id="stCapN">1</i><span id="stCapT"></span></div>
  <div class="st-end" id="stEnd"><b id="stEndT"></b><span id="stEndS"></span></div>
  <div class="st-pause"><b>▶</b></div>
</div>
${STORY_META.map((m, i) => `<ol class="ld-steps${i === 0 ? ' on' : ''}" data-st="${i}">${m.steps.map((t, j) => `<li><i>${j + 1}</i>${t}</li>`).join('')}</ol>`).join('')}
<template id="stT-lc">${sceneLc(ic)}</template>
<template id="stT-jobs">${sceneJobs(ic)}</template>
<template id="stT-today">${sceneToday(ic)}</template>
<template id="stT-copy">${sceneCopy(ic)}</template>`;

export const STORY_JS = `
(function(){
var root=document.getElementById('story');if(!root)return;
var IDS=${JSON.stringify(STORY_META.map(m => m.id))},N=${JSON.stringify(STORY_META.map(m => m.steps.length))},ENDS=${JSON.stringify(STORY_META.map(m => m.end))};
var sc=document.getElementById('stScene'),cap=document.getElementById('stCap'),barEl=document.getElementById('stBar'),toast=document.getElementById('stToast');
var pills=Array.prototype.slice.call(document.querySelectorAll('#stPills button')),rows=Array.prototype.slice.call(document.querySelectorAll('.ld-steps'));
var cur=document.createElement('div');cur.className='st-cur';cur.innerHTML='<svg width="22" height="26" viewBox="0 0 26 30"><path d="M3 2 L3 24 L9 18.5 L13.5 28 L17.5 26 L13 17 L21 17 Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
var rip=document.createElement('div');rip.className='st-rip';
var run=0,paused=false,visible=true,story=0,bars=[],reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var CT=2*Math.PI*50,CR=2*Math.PI*24;
function q(id){return sc.querySelector('#'+id);}
function fit(){var w=root.clientWidth,h=root.clientHeight;root.style.setProperty('--ss',Math.min(w/960,h/540));}
var zoomZ=1,zoomX=0,zoomY=0;
function applyT(){var s=parseFloat(getComputedStyle(root).getPropertyValue('--ss'))||1;sc.style.transform='scale('+(s*zoomZ)+') translate('+zoomX+'px,'+zoomY+'px)';}
window.addEventListener('resize',function(){fit();applyT();});window.addEventListener('load',function(){fit();applyT();});fit();setTimeout(function(){fit();applyT();},400);
function pos(el){var c=[el.offsetLeft,el.offsetTop],p=el.offsetParent;while(p&&p!==sc){c[0]+=p.offsetLeft;c[1]+=p.offsetTop;p=p.offsetParent;}return c;}
function mid(el){var c=pos(el);return [c[0]+el.offsetWidth/2,c[1]+el.offsetHeight/2];}
function zoomTo(el,z,ax,ay){zoomZ=z;if(!el||z===1){zoomX=0;zoomY=0;applyT();return;}
var c=pos(el),m=[c[0]+el.offsetWidth*(ax===undefined?.5:ax),c[1]+el.offsetHeight*(ay===undefined?.5:ay)],tx=480/z-m[0],ty=270/z-m[1];
tx=Math.min(0,Math.max(960/z-960,tx));ty=Math.min(0,Math.max(540/z-540,ty));zoomX=tx;zoomY=ty;applyT();}
var visAt=0;function isVis(){var now=Date.now();if(now-visAt>300){visAt=now;var b=root.getBoundingClientRect();visible=b.height===0||(b.bottom>0&&b.top<(window.innerHeight||800));}return visible;}
function sleep(ms){var mr=run;return new Promise(function(r){var t=0;(function tick(){if(run!==mr)return r();if(!paused&&isVis())t+=50;if(t>=ms)return r();setTimeout(tick,50);})();});}
async function move(el,dx,dy){var m=mid(el);cur.style.left=(m[0]-3+(dx||0))+'px';cur.style.top=(m[1]-3+(dy||0))+'px';await sleep(820);}
async function click(el,dx,dy){var m=mid(el);rip.style.left=(m[0]+(dx||0))+'px';rip.style.top=(m[1]+(dy||0))+'px';rip.classList.remove('go');void rip.offsetWidth;rip.classList.add('go');cur.classList.add('press');el.classList.add('press');await sleep(160);cur.classList.remove('press');el.classList.remove('press');await sleep(260);}
async function type(box,txt,text){box.classList.remove('ph');box.classList.add('on');txt.textContent='';for(var i=0;i<text.length;i++){txt.textContent+=text[i];await sleep(text[i]===' '?60:40);}}
async function typeIn(el,text,speed){for(var i=0;i<text.length;i++){el.innerHTML+=text[i]==='<'?'&lt;':text[i];await sleep(speed||28);}}
function say(n,text){cap.classList.remove('on');document.getElementById('stFF').classList.remove('on');setTimeout(function(){document.getElementById('stCapN').textContent=n;document.getElementById('stCapT').textContent=text;cap.classList.add('on');},200);
bars.forEach(function(b,i){b.className=i<n-1?'done':(i===n-1?'live':'');var f=b.firstChild;f.style.transition='none';f.style.width=i<n-1?'100%':'0';});
var row=rows[story];if(row)Array.prototype.forEach.call(row.children,function(s,i){s.classList.toggle('on',i===n-1);});}
function bar(n,ms){var b=bars[n-1];if(!b)return;var f=b.firstChild;requestAnimationFrame(function(){f.style.transition='width '+ms+'ms linear';f.style.width='100%';});}
function ringSet(svgEl,circ,frac){var p=svgEl.querySelector('circle.p');p.style.strokeDashoffset=String(circ*(1-frac));}
function pop(text,ms){toast.textContent=text;toast.classList.add('on');setTimeout(function(){toast.classList.remove('on');},ms||2600);}
function load(i){story=i;document.getElementById('stFF').textContent='⏩ 7 min later';var t=document.getElementById('stT-'+IDS[i]);sc.classList.add('swap');sc.innerHTML=t.innerHTML;sc.appendChild(rip);sc.appendChild(cur);
zoomZ=1;zoomX=0;zoomY=0;applyT();void sc.offsetWidth;sc.classList.remove('swap');
cur.style.left='480px';cur.style.top='300px';
barEl.innerHTML='';bars=[];for(var k=0;k<N[i];k++){var b=document.createElement('i');b.innerHTML='<b></b>';barEl.appendChild(b);bars.push(b);}
pills.forEach(function(p,k){p.classList.toggle('on',k===i);});rows.forEach(function(r,k){r.classList.toggle('on',k===i);});
document.getElementById('stEnd').classList.remove('on');document.getElementById('stFF').classList.remove('on');toast.classList.remove('on');cap.classList.remove('on');}
async function endCard(i){var e=ENDS[i];document.getElementById('stEndT').innerHTML=e[0];document.getElementById('stEndS').textContent=e[1];zoomTo(null,1);await sleep(900);document.getElementById('stEnd').classList.add('on');await sleep(3000);}

// ---- story 1: LeetCode ----
async function playLc(my){
say(1,'Type the name. Matches come from your own log.');bar(1,5600);
var inp=q('stInp');zoomTo(q('stProb'),1.35,.28,.5);await sleep(700);
await move(inp,-330,0);await click(inp);await type(inp,q('stInpT'),'Two Su');
q('stAc').classList.add('on');await sleep(350);var ac1=q('stAc1');await move(ac1,-300,0);ac1.classList.add('hi');await click(ac1);
q('stInpT').textContent='Two Sum';q('stAc').classList.remove('on');inp.classList.remove('on');
q('stNempty').style.display='none';q('stNed').classList.add('on');await sleep(600);if(my!==run)return;
say(2,'Start the timer. It follows you to every tab.');bar(2,5000);
var tm=q('stTimer');zoomTo(tm,1.4);await sleep(700);
var st=q('stStart');await move(st);await click(st);st.textContent='Done';
var tv=q('stTv'),tsvg=tm.querySelector('svg');
for(var s=1;s<=3;s++){tv.textContent='24:'+String(60-s).padStart(2,'0');ringSet(tsvg,CT,1-s/1500);await sleep(1000);}
document.getElementById('stFF').classList.add('on');
for(var k=0;k<=13;k++){var left=1497-Math.round(k*(417/13));tv.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');ringSet(tsvg,CT,left/1500);await sleep(60);}
await sleep(500);document.getElementById('stFF').classList.remove('on');if(my!==run)return;
say(3,'Press Done. The minutes are already filled in.');bar(3,5400);
await move(st);await click(st);
zoomTo(null,1);q('stModal').classList.add('on');await sleep(700);
var ez=q('stEasy');await move(ez);await click(ez);ez.classList.add('on');
var sv=q('stSolved');await move(sv);await click(sv);sv.classList.add('on');
var save=q('stSave');await move(save);await click(save);
q('stModal').classList.remove('on');await sleep(200);if(my!==run)return;
say(4,'Today counts it: 3 of 3, goal hit, streak safe.');bar(4,3200);
pop('🧩 Two Sum solved · 3 of 3 today · goal hit ✓',2600);tv.textContent='25:00';ringSet(tsvg,CT,1);st.textContent='Start';await sleep(3000);if(my!==run)return;
say(5,'One living note per problem. Write it while it is fresh.');bar(5,7000);
zoomTo(q('stNoteCard'),1.35);await sleep(700);
var note=q('stNote');await move(note,-130,-14);await click(note);
await type(note,q('stNoteT'),'Hash map, one pass. Check the complement before you insert.');
await sleep(400);q('stTick').textContent='SAVED';q('stTick').classList.add('on');note.classList.remove('on');await sleep(1000);if(my!==run)return;
say(6,'Stats: every problem, every try, oldest first.');bar(6,8200);
zoomTo(null,1);var tabS=q('stTabStats');await move(tabS);await click(tabS);
tabS.classList.add('on');q('stTabSolve').classList.remove('on');q('stPgSolve').classList.remove('on');q('stPgStats').classList.add('on');await sleep(900);
var list=q('stList');zoomTo(list.parentElement,1.3,.5,.5);await sleep(600);
list.style.transform='translateY(-150px)';await sleep(1700);
var rx=q('stRowX');await move(rx,-150,-150);await click(rx,-150,-150);rx.classList.add('open');await sleep(2200);if(my!==run)return;
say(7,'Come back to these: the newest try was not a solve. Tap it to load it.');bar(7,5200);
var back=q('stBack');zoomTo(back.parentElement,1.35,.5,.3);await sleep(700);
await move(back,-60,0);await click(back);await sleep(300);
zoomTo(null,1);q('stTabSolve').classList.add('on');tabS.classList.remove('on');q('stPgStats').classList.remove('on');q('stPgSolve').classList.add('on');
q('stInpT').textContent='LRU Cache';inp.classList.remove('ph');q('stNdiff').className='diff hard';q('stNdiff').textContent='HARD';q('stNname').textContent='LRU Cache';q('stNoteT').textContent='Doubly linked list + dict. Move to front on get.';q('stNote').classList.remove('ph');q('stTick').textContent='SAVED';q('stTick').classList.add('on');q('stCode').textContent='class LRUCache:\\n    def __init__(self, cap):\\n        self.d = OrderedDict()';
await sleep(2400);}

// ---- story 2: Jobs with an agent ----
async function playJobs(my){
say(1,'Tell Claude Code about the job, in plain words.');bar(1,7600);
var term=q('stTerm'),tb=q('stTb');await sleep(400);term.classList.add('on');await sleep(600);
zoomTo(term,1.3,.5,.5);await sleep(600);
tb.innerHTML='<span class="k">›</span> ';await typeIn(tb,'log this job: Front-End Developer at T-Mobile, LinkedIn, $61,400-$110,800, New York',30);await sleep(900);if(my!==run)return;
say(2,'The agent key can only touch the Jobs tab. It posts the row.');bar(2,4200);
tb.innerHTML+='\\n<span class="c">POST /api/jobs  Bearer lk_agent_…</span>';await sleep(900);tb.innerHTML+='\\n<span class="ok">✓ 201 logged #155 · today 1 / 10</span>';await sleep(2400);if(my!==run)return;
say(3,'The row is in the table, today\\u2019s goal moved with it.');bar(3,4600);
term.classList.remove('on');zoomTo(null,1);await sleep(600);
var nr=q('stJnew');nr.classList.remove('hide');q('stJn').textContent='1';q('stJtot').textContent='155 logged';q('stJall').textContent='155';q('stJap').textContent='131';
zoomTo(nr,1.15,.62,.5);await sleep(3200);if(my!==run)return;
say(4,'Got an online assessment? Change the status right there.');bar(4,4200);
var sel=q('stJnewS');await move(sel);await click(sel);await sleep(300);sel.textContent='OA ⌄';sel.className='sel oa';q('stJoa').textContent='2';q('stJap').textContent='130';pop('📨 T-Mobile → OA',2000);await sleep(2600);}

// ---- story 3: Today ----
async function playToday(my){
say(1,'Anything on your plate goes on today\\u2019s list.');bar(1,7200);
var tasks=q('stTasks');zoomTo(tasks,1.3,.5,.6);await sleep(700);
var addb=q('stAddT');await move(addb);await click(addb);q('stNt').classList.add('on');addb.style.display='none';await sleep(400);
zoomTo(q('stNt'),1.35,.5,.5);await sleep(500);
var tin=q('stTin');await move(tin,-90,0);await click(tin);await type(tin,q('stTinT'),'Finish the graph assignment');await sleep(400);if(my!==run)return;
say(2,'Pin it and it stays on this day when the plan shifts.');bar(2,3600);
var pin=q('stPin');await move(pin);await click(pin);pin.classList.add('on');await sleep(600);
var tadd=q('stTadd');await move(tadd);await click(tadd);q('stNt').classList.remove('on');q('stTnew').style.display='';addb.style.display='';tin.classList.remove('on');await sleep(900);if(my!==run)return;
say(3,'Off-plan grind? Start grind now, no block needed.');bar(3,4200);
zoomTo(q('stSched'),1.2,.5,.85);await sleep(700);
var go=q('stGo');await move(go);await click(go);zoomTo(null,1);q('stPick').classList.add('on');await sleep(900);if(my!==run)return;
say(4,'Pick what you are grinding. Switch any time, splits are kept.');bar(4,3400);
var pc=q('stPickC');await move(pc,-80,0);await click(pc);q('stPick').classList.remove('on');await sleep(400);
zoomTo(null,1);q('stLive').classList.add('on');await sleep(900);if(my!==run)return;
say(5,'The session runs across every tab until you check out.');bar(5,5600);
zoomTo(q('stLive'),1.25,.5,.5);var t=q('stLtm');await sleep(1200);t.textContent='1m';await sleep(1200);document.getElementById('stFF').classList.add('on');document.getElementById('stFF').textContent='⏩ later';await sleep(500);t.textContent='47m';await sleep(2200);}

// ---- story 4: Quick Copy ----
async function playCopy(my){
say(1,'Everything you keep retyping into forms lives here. Add a block.');bar(1,7800);
var ab=q('stAddB');await move(ab);await click(ab);q('stBm').classList.add('on');await sleep(700);
var bt=q('stBt');await move(bt,-110,0);await click(bt);await type(bt,q('stBtT'),'Work authorization');bt.classList.remove('on');
var bv=q('stBv');await move(bv,-110,-6);await click(bv);await type(bv,q('stBvT'),'F-1 OPT, then STEM OPT extension (3 years)');bv.classList.remove('on');await sleep(300);if(my!==run)return;
say(2,'Sub-items copy on their own: the short answer, the sponsorship line.');bar(2,6400);
var sa=q('stSubAdd');await move(sa);await click(sa);q('stSub1').style.display='';await sleep(300);
var sv=q('stSubV');await move(sv,-60,0);await click(sv);await type(sv,q('stSubVT'),'Yes, OPT');sv.classList.remove('on');
await move(sa);await click(sa);q('stSub2').style.display='';await sleep(500);
var bs=q('stBsave');await move(bs);await click(bs);q('stBm').classList.remove('on');await sleep(200);
var nw=q('stSnew');nw.style.display='';nw.classList.add('new');await sleep(1200);if(my!==run)return;
say(3,'Tap a block, it is on your clipboard. Sub-items unfold.');bar(3,6400);
zoomTo(q('stGrid'),1.25,.5,.5);await sleep(700);
await move(nw,-40,-10);await click(nw);nw.classList.add('copied');pop('📋 Copied · Work authorization',1800);await sleep(1400);
var m=q('stS1M');await move(m,0,0);await click(m);q('stS1').classList.add('open');m.textContent='▴ Hide 4 sub-items';await sleep(2200);}

var PLAYS=[playLc,playJobs,playToday,playCopy];
async function playFrom(i){var my=++run;while(true){load(i);if(my!==run)return;
if(IDS[i]==='copy'){q('stSnew').style.display='none';q('stSnew').classList.remove('new');}
await sleep(500);await PLAYS[i](my);if(my!==run)return;await endCard(i);if(my!==run)return;i=(i+1)%IDS.length;if(reduced)return;}}
pills.forEach(function(p){p.addEventListener('click',function(e){e.stopPropagation();paused=false;root.classList.remove('paused');playFrom(+p.dataset.st);});});
root.addEventListener('click',function(){if(document.getElementById('stEnd').classList.contains('on'))return;paused=!paused;root.classList.toggle('paused',paused);});
if(reduced){load(0);q('stNempty').style.display='none';q('stNed').classList.add('on');}else playFrom(0);
})();
`;
