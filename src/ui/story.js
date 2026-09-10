// Home page "story": a 9:16 frame that plays a scripted walkthrough of one workflow with a visible
// cursor, clicks, typing, zooms and captions. Pure HTML/CSS/JS, no video file. The scene is laid out
// at 360x640 and scaled to the frame width; zooms are transforms on the scene, so the cursor zooms too.
// Page-script rules apply to STORY_JS: no backticks, no ${, no quotes inside inline handlers.

export const STORY_CSS = `
.story{position:relative;width:100%;max-width:960px;aspect-ratio:16/9;margin:0 auto;border-radius:18px;overflow:hidden;background:var(--bg);border:1px solid var(--line2);box-shadow:0 30px 80px #000a,inset 0 0 0 1px #ffffff08;cursor:pointer;-webkit-tap-highlight-color:transparent}
.st-vp{position:absolute;inset:0;overflow:hidden}
.st-scene{position:absolute;left:0;top:0;width:960px;height:540px;transform-origin:0 0;transition:transform .9s cubic-bezier(.2,.8,.2,1);padding:22px 28px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr;gap:14px 20px;align-content:start;background:var(--bg)}
.st-scene .sh1{grid-column:1/-1;display:flex;align-items:baseline;gap:12px}
.st-scene .sh1 small{font:400 13px var(--body);color:var(--ink2)}
.st-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.st-scene .sh1{font:800 22px var(--disp);letter-spacing:-.01em}
.st-scene .sh2{font:800 13px var(--disp);color:var(--ink);margin:2px 0 6px}
.st-scene .card{margin:0;padding:14px 16px;border-radius:14px}
.st-scene .fld{display:block;font:600 11px var(--body);color:var(--ink2);margin:0 0 6px}
.st-scene .inp{min-height:36px;padding:8px 10px;font:14px var(--body);border-radius:10px;background:var(--well);border:1px solid var(--line2);color:var(--ink);display:flex;align-items:center;gap:6px;position:relative}
.st-scene .inp.ph{color:var(--ink3)}
.st-scene .inp .caret{width:1.5px;height:16px;background:var(--ember);animation:stblink .9s steps(1) infinite;display:none}
.st-scene .inp.on .caret{display:block}
.st-scene .inp.on{border-color:var(--ember);box-shadow:0 0 0 2px #FF6B3533}
@keyframes stblink{50%{opacity:0}}
.st-ac{position:absolute;left:0;right:0;top:calc(100% + 4px);background:var(--surface2);border:1px solid var(--line2);border-radius:10px;padding:4px;z-index:3;display:none}
.st-ac.on{display:block}
.st-ac div{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font:700 13px var(--body)}
.st-ac div.hi{background:var(--surface3)}
.st-ac .diff{font-size:9px;padding:2px 6px}
.st-tm{display:flex;align-items:center;gap:12px}
.st-tring{position:relative;width:120px;height:120px;flex:none}
.st-tring svg{transform:rotate(-90deg);display:block}
.st-tring .tv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 26px var(--disp);font-variant-numeric:tabular-nums}
.st-tring .tv small{font:700 10px var(--disp);color:var(--ink3);letter-spacing:.06em}
.st-btns{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
.st-scene button{min-height:34px;padding:6px 10px;font-size:13px;border-radius:10px;pointer-events:none}
.st-scene button.pri{font-weight:800}
.st-scene .press{transform:scale(.94);filter:brightness(1.15)}
.st-ring{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st-rc{background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:8px 6px;text-align:center;transition:border-color .4s,box-shadow .4s}
.st-rc.hit{border-color:#3DDC97aa;box-shadow:0 0 0 2px #3DDC9733}
.st-rc .lab{font:700 9px var(--disp);color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-rc .rg{position:relative;width:64px;height:64px;margin:8px auto 0}
.st-rc .rg svg{transform:rotate(-90deg);display:block}
.st-rc .rg .v{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 16px var(--disp);line-height:1}
.st-rc .rg .v small{font:700 8px var(--disp);color:var(--ink3);margin-top:2px}
.st-rc circle.p{transition:stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1),stroke .4s}
.st-note{min-height:96px;align-items:flex-start;font-size:13px;line-height:1.5;flex-wrap:wrap;white-space:pre-wrap}
.st-note .caret{height:14px}
.st-tick{font:700 10px var(--disp);letter-spacing:.08em;color:var(--ink3);transition:color .3s}
.st-tick.on{color:var(--mint)}
.st-modal{position:absolute;inset:0;background:rgba(5,7,11,.7);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4}
.st-modal.on{opacity:1}
.st-sheet{background:var(--surface);border:1px solid var(--line2);border-radius:16px;padding:18px;width:380px;max-width:100%;transform:translateY(16px);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.st-modal.on .st-sheet{transform:none}
.st-sheet .t{font:800 16px var(--disp);margin-bottom:2px}
.st-sheet .s{font-size:12px;color:var(--ink2);margin-bottom:10px}
.st-chips{display:flex;gap:6px;margin:6px 0 10px}
.st-chips button{flex:1;min-height:32px;font-size:12px;padding:4px 6px}
.st-chips button.on{border-color:var(--ember);color:var(--ember);background:#FF6B3518}
.st-chips button.on.mint{background:#3DDC9722;border-color:var(--mint);color:var(--mint)}
.st-cur{position:absolute;left:480px;top:300px;width:26px;height:30px;z-index:20;transition:left .75s cubic-bezier(.3,.7,.3,1),top .75s cubic-bezier(.3,.7,.3,1);filter:drop-shadow(0 2px 4px #000a);pointer-events:none}
.st-cur svg{display:block}
.st-cur.press{transform:scale(.85)}
.st-rip{position:absolute;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:99px;border:2px solid var(--ember);opacity:0;z-index:19;pointer-events:none}
.st-rip.go{animation:strip .5s ease-out}
@keyframes strip{0%{transform:scale(.3);opacity:.9}100%{transform:scale(1.4);opacity:0}}
.st-cap{position:absolute;left:14px;right:auto;max-width:min(520px,calc(100% - 28px));bottom:14px;z-index:30;background:rgba(19,24,36,.94);border:1px solid var(--line2);border-radius:12px;padding:10px 12px;font:700 13px/1.35 var(--body);color:var(--ink);display:flex;gap:10px;align-items:center;transform:translateY(8px);opacity:0;transition:transform .3s,opacity .3s}
.st-cap.on{transform:none;opacity:1}
.st-cap i{flex:none;width:22px;height:22px;border-radius:99px;background:var(--grad);color:#1A0D05;display:inline-flex;align-items:center;justify-content:center;font:900 11px var(--disp);font-style:normal}
.st-bar{position:absolute;left:12px;right:12px;top:10px;z-index:30;display:flex;gap:4px}
.st-bar i{flex:1;height:3px;border-radius:99px;background:#ffffff26;overflow:hidden;position:relative}
.st-bar i b{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--ember);border-radius:99px}
.st-bar i.done b{width:100%}
.st-bar i.live b{transition:width linear}
.st-end{position:absolute;inset:0;z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;background:rgba(11,14,20,.9);opacity:0;pointer-events:none;transition:opacity .5s}
.st-end.on{opacity:1}
.st-end b{font:900 clamp(24px,4vw,40px)/1.1 var(--disp);letter-spacing:-.02em}
.st-end b em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.st-end span{color:var(--ink2);font-size:14px}
.st-pause{position:absolute;inset:0;z-index:26;display:none;align-items:center;justify-content:center;background:rgba(11,14,20,.35)}
.story.paused .st-pause{display:flex}
.st-pause b{width:56px;height:56px;border-radius:99px;background:rgba(19,24,36,.9);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font-size:22px}
.st-ff{position:absolute;right:12px;top:22px;z-index:30;font:800 11px var(--disp);letter-spacing:.08em;color:var(--ember2);background:#FFB34718;border:1px solid #FFB34755;border-radius:99px;padding:4px 8px;opacity:0;transition:opacity .3s}
.st-ff.on{opacity:1}
.ld-story{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;margin-top:24px}
.ld-steps{list-style:none;display:grid;gap:8px}
@media(min-width:900px){.ld-steps{grid-template-columns:repeat(6,1fr)}.ld-steps li{flex-direction:column;align-items:flex-start;gap:8px;font-size:13px}}
.ld-steps li{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid transparent;color:var(--ink2);font-size:14px;line-height:1.45;transition:background .3s,border-color .3s,color .3s}
.ld-steps li i{flex:none;width:24px;height:24px;border-radius:8px;background:var(--surface2);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font:800 12px var(--disp);font-style:normal;color:var(--ink2)}
.ld-steps li.on{background:var(--surface);border-color:var(--line2);color:var(--ink)}
.ld-steps li.on i{background:var(--grad);border-color:transparent;color:#1A0D05}
@media(max-width:599px){.ld-steps{display:none}.ld-story{margin-top:16px}.story{border-radius:12px}.st-cap{font-size:11px;padding:8px 10px;bottom:8px;left:8px}.st-bar{left:8px;right:8px;top:6px}}
`;

const RING = (r, w, color, dash) => `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}"><circle cx="${r}" cy="${r}" r="${r - w / 2}" fill="none" stroke="var(--surface3)" stroke-width="${w}"/><circle class="p" cx="${r}" cy="${r}" r="${r - w / 2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="0"/></svg>`;
const C = 2 * Math.PI * 24;   // small ring circumference (r 28, stroke 8 -> radius 24)
const CT = 2 * Math.PI * 43;  // timer ring (r 48, stroke 10 -> radius 43)

export const STORY_HTML = () => `
<div class="story" id="story" role="img" aria-label="Animated walkthrough: log a LeetCode solve, write the note">
  <div class="st-bar" id="stBar">${[1, 2, 3, 4, 5, 6].map(() => '<i><b></b></i>').join('')}</div>
  <div class="st-ff" id="stFF">⏩ 7 min later</div>
  <div class="st-vp"><div class="st-scene" id="stScene">
    <div class="sh1">🧩 LeetCode <small>Pick a problem, run the timer, log how it went.</small></div>
    <div class="st-col">
    <div class="card" id="stProb"><span class="fld">Problem</span>
      <div class="inp ph" id="stInp"><span id="stInpT">Type the problem name</span><span class="caret"></span>
        <div class="st-ac" id="stAc"><div id="stAc1"><span class="diff easy">EASY</span>Two Sum <span class="tiny">×1 · 9m</span></div><div><span class="diff medium">MEDIUM</span>Two Sum II <span class="tiny">new</span></div></div>
      </div>
    </div>
    <div class="card" id="stTimer"><div class="sh2">Focus timer</div>
      <div class="st-tm"><div class="st-tring">${RING(48, 10, 'var(--ember)', CT)}<div class="tv"><span id="stTv">25:00</span><small>25 MIN</small></div></div>
        <div class="st-btns"><button class="pri" id="stStart">Start</button><button id="stDone">Done</button><button class="ghost" id="stReset">Reset</button></div></div>
    </div>
    </div>
    <div class="st-col">
    <div id="stGoals"><div class="sh2">Today · goals</div>
      <div class="st-ring">
        <div class="st-rc" id="stRc"><div class="lab">🧩 LeetCode</div><div class="rg">${RING(28, 8, 'var(--ember)', C)}<div class="v"><span id="stRv">2</span><small>OF 3</small></div></div></div>
        <div class="st-rc"><div class="lab">📨 Apps</div><div class="rg">${RING(28, 8, 'var(--ice)', C)}<div class="v"><span>1</span><small>OF 2</small></div></div></div>
        <div class="st-rc"><div class="lab">📚 Course</div><div class="rg">${RING(28, 8, 'var(--violet)', C)}<div class="v"><span>0</span><small>OF 1</small></div></div></div>
      </div>
    </div>
    <div class="card" id="stNoteCard"><div class="row" style="margin-bottom:6px"><div class="sh2 grow" style="margin:0">Note · Two Sum</div><span class="st-tick" id="stTick">UNSAVED</span></div>
      <div class="inp st-note ph" id="stNote"><span id="stNoteT">What would you tell yourself next time?</span><span class="caret"></span></div>
    </div>
    </div>
    <div class="st-modal" id="stModal"><div class="st-sheet">
      <div class="t">How did it go?</div><div class="s">7 minutes on the clock</div>
      <span class="fld">Difficulty</span><div class="st-chips"><button id="stEasy">Easy</button><button>Medium</button><button>Hard</button></div>
      <span class="fld">Outcome</span><div class="st-chips"><button class="mint" id="stSolved">✓ Solved</button><button>⚡ Slow</button><button>✕ Open</button></div>
      <button class="pri" id="stSave" style="width:100%">Log it</button>
    </div></div>
    <div class="st-cur" id="stCur"><svg width="26" height="30" viewBox="0 0 26 30"><path d="M3 2 L3 24 L9 18.5 L13.5 28 L17.5 26 L13 17 L21 17 Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg></div>
    <div class="st-rip" id="stRip"></div>
  </div></div>
  <div class="st-cap" id="stCap"><i id="stCapN">1</i><span id="stCapT"></span></div>
  <div class="st-end" id="stEnd"><b>Every solve, <em>every note.</em></b><span>In your own database. Tap to watch again.</span></div>
  <div class="st-pause"><b>▶</b></div>
</div>`;

// Steps shown beside the frame on desktop (they light up in sync with the captions).
export const STORY_STEPS = ['Pick the problem', 'Start the focus timer', 'Press Done, log how it went', 'The counter moves', 'Write the note while it is fresh', 'Saved. Next problem.'];

export const STORY_JS = `
(function(){
var root=document.getElementById('story');if(!root)return;
var sc=document.getElementById('stScene'),cur=document.getElementById('stCur'),rip=document.getElementById('stRip'),cap=document.getElementById('stCap');
var bars=Array.prototype.slice.call(document.querySelectorAll('#stBar i')),steps=Array.prototype.slice.call(document.querySelectorAll('.ld-steps li'));
var run=0,paused=false,visible=true,reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var CT=2*Math.PI*43,CR=2*Math.PI*24;
function fit(){var w=root.clientWidth,h=root.clientHeight;root.style.setProperty('--ss',Math.min(w/960,h/540));}
window.addEventListener('resize',function(){fit();applyT();});window.addEventListener('load',function(){fit();applyT();});fit();setTimeout(function(){fit();applyT();},400);
var zoomZ=1,zoomX=0,zoomY=0;
function applyT(){var s=parseFloat(getComputedStyle(root).getPropertyValue('--ss'))||1;sc.style.transform='scale('+(s*zoomZ)+') translate('+zoomX+'px,'+zoomY+'px)';}
function zoomTo(el,z){zoomZ=z;if(!el||z===1){zoomX=0;zoomY=0;applyT();return;}
var cx=el.offsetLeft+el.offsetWidth/2,cy=el.offsetTop+el.offsetHeight/2;
var tx=480/z-cx,ty=270/z-cy;
tx=Math.min(0,Math.max(960/z-960,tx));ty=Math.min(0,Math.max(540/z-540,ty));zoomX=tx;zoomY=ty;applyT();}
var visAt=0;function isVis(){var now=Date.now();if(now-visAt>300){visAt=now;var b=root.getBoundingClientRect();visible=b.height===0||(b.bottom>0&&b.top<(window.innerHeight||800));}return visible;}
function sleep(ms){return new Promise(function(r){var t=0;(function tick(){if(run<0)return r();if(!paused&&isVis())t+=50;if(t>=ms)return r();setTimeout(tick,50);})();});}
function center(el){return [el.offsetLeft+el.offsetWidth/2,el.offsetTop+el.offsetHeight/2];}
function pos(el){var c=[el.offsetLeft,el.offsetTop],p=el.offsetParent;while(p&&p!==sc){c[0]+=p.offsetLeft;c[1]+=p.offsetTop;p=p.offsetParent;}return c;}
function mid(el){var c=pos(el);return [c[0]+el.offsetWidth/2,c[1]+el.offsetHeight/2];}
async function move(el,dx,dy){var m=mid(el);cur.style.left=(m[0]-4+(dx||0))+'px';cur.style.top=(m[1]-4+(dy||0))+'px';await sleep(820);}
async function click(el){var m=mid(el);rip.style.left=m[0]+'px';rip.style.top=m[1]+'px';rip.classList.remove('go');void rip.offsetWidth;rip.classList.add('go');cur.classList.add('press');el.classList.add('press');await sleep(160);cur.classList.remove('press');el.classList.remove('press');await sleep(260);}
async function type(box,txt,text){box.classList.remove('ph');box.classList.add('on');txt.textContent='';for(var i=0;i<text.length;i++){txt.textContent+=text[i];await sleep(text[i]===' '?70:45);}}
function say(n,text){cap.classList.remove('on');setTimeout(function(){document.getElementById('stCapN').textContent=n;document.getElementById('stCapT').textContent=text;cap.classList.add('on');},200);
bars.forEach(function(b,i){b.className=i<n-1?'done':(i===n-1?'live':'');var f=b.firstChild;f.style.transition='none';f.style.width=i<n-1?'100%':'0';});
steps.forEach(function(s,i){s.classList.toggle('on',i===n-1);});}
function bar(n,ms){var b=bars[n-1];if(!b)return;var f=b.firstChild;requestAnimationFrame(function(){f.style.transition='width '+ms+'ms linear';f.style.width='100%';});}
function ringSet(svgEl,circ,frac,color){var p=svgEl.querySelector('circle.p');p.style.strokeDashoffset=String(circ*(1-frac));if(color)p.style.stroke=color;}
function reset(){
zoomTo(null,1);cur.style.left='480px';cur.style.top='300px';
var inp=document.getElementById('stInp');inp.className='inp ph';document.getElementById('stInpT').textContent='Type the problem name';document.getElementById('stAc').classList.remove('on');document.getElementById('stAc1').classList.remove('hi');
document.getElementById('stTv').textContent='25:00';ringSet(document.querySelector('#stTimer svg'),CT,1);
document.getElementById('stModal').classList.remove('on');document.getElementById('stEasy').classList.remove('on');document.getElementById('stSolved').classList.remove('on');
document.getElementById('stRv').textContent='2';document.getElementById('stRc').classList.remove('hit');ringSet(document.querySelector('#stRc svg'),CR,2/3,'var(--ember)');
var note=document.getElementById('stNote');note.className='inp st-note ph';document.getElementById('stNoteT').textContent='What would you tell yourself next time?';
document.getElementById('stTick').className='st-tick';document.getElementById('stTick').textContent='UNSAVED';
document.getElementById('stEnd').classList.remove('on');document.getElementById('stFF').classList.remove('on');cap.classList.remove('on');
bars.forEach(function(b){b.className='';b.firstChild.style.width='0';});steps.forEach(function(s){s.classList.remove('on');});}
async function play(){var my=++run;reset();await sleep(500);
// 1 pick the problem
say(1,'Type the name. Matches come from your own log.');bar(1,5200);
var inp=document.getElementById('stInp');zoomTo(document.getElementById('stProb'),1.7);await sleep(700);
await move(inp,-120,0);await click(inp);await type(inp,document.getElementById('stInpT'),'Two Su');
document.getElementById('stAc').classList.add('on');await sleep(350);var ac1=document.getElementById('stAc1');await move(ac1,-100,0);ac1.classList.add('hi');await click(ac1);
document.getElementById('stInpT').textContent='Two Sum';document.getElementById('stAc').classList.remove('on');inp.classList.remove('on');await sleep(500);if(my!==run)return;
// 2 start the timer
say(2,'Start the timer. It follows you to every tab.');bar(2,4600);
var tm=document.getElementById('stTimer');zoomTo(tm,1.8);await sleep(700);
var st=document.getElementById('stStart');await move(st);await click(st);
var tv=document.getElementById('stTv'),tsvg=document.querySelector('#stTimer svg');
for(var s=1;s<=3;s++){tv.textContent='24:'+String(60-s).padStart(2,'0');ringSet(tsvg,CT,1-s/1500);await sleep(1000);}
document.getElementById('stFF').classList.add('on');
for(var k=0;k<=13;k++){var left=1497-Math.round(k*(417/13));var mm=Math.floor(left/60),ss=left%60;tv.textContent=String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');ringSet(tsvg,CT,left/1500);await sleep(60);}
await sleep(400);document.getElementById('stFF').classList.remove('on');if(my!==run)return;
// 3 done -> log
say(3,'Press Done. The minutes are already filled in.');bar(3,5200);
var dn=document.getElementById('stDone');await move(dn);await click(dn);
zoomTo(null,1);document.getElementById('stModal').classList.add('on');await sleep(700);
var ez=document.getElementById('stEasy');await move(ez);await click(ez);ez.classList.add('on');
var sv=document.getElementById('stSolved');await move(sv);await click(sv);sv.classList.add('on');
var save=document.getElementById('stSave');await move(save);await click(save);
document.getElementById('stModal').classList.remove('on');await sleep(300);if(my!==run)return;
// 4 counter moves
say(4,'The counter moves. Goal hit, streak safe.');bar(4,3600);
var rc=document.getElementById('stRc');zoomTo(document.getElementById('stGoals'),1.7);await sleep(800);
document.getElementById('stRv').textContent='3';ringSet(document.querySelector('#stRc svg'),CR,1,'var(--mint)');rc.classList.add('hit');await sleep(2500);if(my!==run)return;
// 5 write the note
say(5,'One living note per problem. Write it while it is fresh.');bar(5,7200);
var nc=document.getElementById('stNoteCard');zoomTo(nc,1.6);await sleep(700);
var note=document.getElementById('stNote');await move(note,-140,-20);await click(note);
await type(note,document.getElementById('stNoteT'),'Hash map, one pass. Check the complement before you insert.');
await sleep(500);document.getElementById('stTick').textContent='SAVED';document.getElementById('stTick').classList.add('on');note.classList.remove('on');await sleep(1200);if(my!==run)return;
// 6 end card
say(6,'Solve logged, note saved, ring full.');bar(6,3800);
zoomTo(null,1);await sleep(900);document.getElementById('stEnd').classList.add('on');await sleep(3200);if(my!==run)return;
if(!reduced)play();}
root.addEventListener('click',function(){if(document.getElementById('stEnd').classList.contains('on')){play();return;}paused=!paused;root.classList.toggle('paused',paused);});

if(reduced){reset();document.getElementById('stRv').textContent='3';document.getElementById('stEnd').classList.add('on');}else play();
})();
`;
