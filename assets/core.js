/* 皮皮學習樂園：課程頁共用程式（角色、朗讀、音效、對話、任務、重點整理、測驗、導覽）。
   需要先載入 assets/pikmin.js；各課在自己的頁面裡設定 SCENES、QUIZ、QUIZ_TITLE、MASTER，最後呼叫 goTo(0)。 */
/* ================= shared core: characters, voice, dialog, quiz, navigation ================= */
const $=s=>document.querySelector(s);
const stage=$('#stage'), controls=$('#controls'), taskEl=$('#task'), nextBtn=$('#nextBtn'), prevBtn=$('#prevBtn');
const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON_SPK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.6 8.6 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_MUTE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_NEXT='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor"/></svg>';
const ICON_WARN='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2L1 21h22z" fill="currentColor"/><path d="M12 9v6M12 17.5v.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>';
const ICON_CCW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M3 3v5h5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_CW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.1-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M21 3v5h-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let SCENES=[],QUIZ=[],QUIZ_TITLE='小測驗',MASTER='觀察',done=[];

/* home button goes back to this unit's page; stop any speech first */
(()=>{const h=$('#homeBtn');if(h)h.addEventListener('click',()=>stopSay());})();
let cur=0,maxReached=0;
/* FREE_NAV: every tab is open and「下一步」always works (all subjects); set false to require finishing each task first */
let FREE_NAV=true;

/* ---------- sound ---------- */
let soundOn=true,voice=null,actx=null;
/* voice settings: the child can pick a voice and how high it sounds; remembered on this device */
const VOICE_PITCH={normal:1.05,cute:1.35,kid:1.6};
let VS={name:'',pitch:'cute',rate:.9};
try{Object.assign(VS,JSON.parse(localStorage.getItem('pp-voice')||'{}'))}catch(e){}
function saveVS(){try{localStorage.setItem('pp-voice',JSON.stringify(VS))}catch(e){}}
const escH=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\x27':'&#39;'}[c]));
const goodVoice=v=>/natural|premium|enhanced|高品質|增強|neural/i.test(v.name);
function zhVoices(){
  if(!('speechSynthesis' in window))return[];
  const rank=v=>(/zh[-_]TW/i.test(v.lang)?0:/zh[-_](Hant|HK)/i.test(v.lang)?2:4)-(goodVoice(v)?1:0);
  return speechSynthesis.getVoices().filter(v=>/^zh/i.test(v.lang)).sort((x,y)=>rank(x)-rank(y));
}
function pickVoice(){
  const vs=zhVoices();
  voice=vs.find(v=>v.name===VS.name)||vs[0]||null;
}
/* onend (optional) runs when the sentence has been read — or right away-ish when sound is off */
function say(text,onend){
  if(!soundOn||!('speechSynthesis' in window)){if(onend)later(onend,Math.min(2400,300+String(text).length*120));return;}
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/[「」『』〈〉（）()]/g,' ').replace(/°/g,'度').replace(/～|~/g,'到'));
    u.lang='zh-TW';if(voice)u.voice=voice;u.rate=VS.rate;u.pitch=VOICE_PITCH[VS.pitch]||1.35;
    if(onend){let fired=false;const f=()=>{if(!fired){fired=true;onend();}};u.onend=f;u.onerror=f;}
    speechSynthesis.speak(u);
  }catch(e){if(onend)onend();}
}
function stopSay(){try{speechSynthesis.cancel()}catch(e){}}
function unlockAudio(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume();}catch(e){}}
function tone(freqs,dur=.12,type='sine',vol=.16){
  if(!soundOn)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const t0=actx.currentTime;
    freqs.forEach((f,i)=>{
      const o=actx.createOscillator(),g=actx.createGain();
      o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(0,t0+i*dur);
      g.gain.linearRampToValueAtTime(vol,t0+i*dur+.02);
      g.gain.exponentialRampToValueAtTime(.001,t0+i*dur+dur*1.6);
      o.connect(g).connect(actx.destination);
      o.start(t0+i*dur);o.stop(t0+i*dur+dur*1.8);
    });
  }catch(e){}
}
const sfx={
  good:()=>tone([660,880,1175],.1,'triangle'),
  bad:()=>tone([240,190],.15,'square',.06),
  pop:()=>tone([560+Math.random()*240],.06,'triangle',.1),
  win:()=>tone([523,659,784,1046,1318],.1,'triangle'),
  click:()=>tone([420],.05,'triangle',.08),
  whoosh:()=>tone([900,700,500,350],.06,'sine',.08)
};
function renderSoundBtn(){
  const b=$('#soundBtn');
  b.innerHTML=(soundOn?ICON_SPK:ICON_MUTE)+`<span>朗讀 ${soundOn?'開':'關'}</span>`;
  b.setAttribute('aria-pressed',soundOn);
}
$('#soundBtn').onclick=()=>{soundOn=!soundOn;if(!soundOn)stopSay();else unlockAudio();renderSoundBtn();};
renderSoundBtn();

/* 「聲音」settings panel next to the 朗讀 button */
(()=>{
  const sb=$('#soundBtn');if(!sb)return;
  const btn=document.createElement('button');btn.className='sound';btn.id='voiceBtn';btn.setAttribute('aria-haspopup','dialog');
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span>聲音</span>';
  sb.after(btn);
  const pane=document.createElement('div');pane.className='voice-pane';pane.hidden=true;pane.setAttribute('role','dialog');pane.setAttribute('aria-label','選擇朗讀的聲音');pane.dataset.nozy='';
  document.body.appendChild(pane);
  const SAMPLE='嗨！我是黃皮敏敏，我們一起來讀課文吧！';
  function render(){
    const vs=zhVoices();
    pane.innerHTML=`<div class="vp-card"><h2>朗讀的聲音</h2>
      <p class="vp-l">聲音高低</p><div class="vp-row">${[['normal','平常'],['cute','可愛'],['kid','小朋友']].map(([k,t])=>`<button class="vp-opt ${VS.pitch===k?'on':''}" data-p="${k}">${t}</button>`).join('')}</div>
      <p class="vp-l">說話速度</p><div class="vp-row">${[[.75,'慢慢說'],[.9,'剛剛好'],[1.05,'快一點']].map(([k,t])=>`<button class="vp-opt ${VS.rate===k?'on':''}" data-r="${k}">${t}</button>`).join('')}</div>
      <p class="vp-l">選一個聲音</p><div class="vp-list">${vs.length?vs.map(v=>`<button class="vp-opt ${voice&&v.name===voice.name?'on':''}" data-v="${escH(v.name)}">${escH(v.name)}${goodVoice(v)?' ★':''}</button>`).join(''):'<p>這台裝置沒有中文語音。</p>'}</div>
      <p class="vp-tip">iPad 可以下載更自然的聲音：設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文（台灣），下載「美佳（高品質）」，下載後回來這裡選它。</p>
      <div class="vp-row"><button class="vp-try" id="vpTry">試聽</button><button class="vp-done" id="vpDone">好了</button></div></div>`;
  }
  btn.onclick=()=>{unlockAudio();render();pane.hidden=false;};
  pane.onclick=e=>{
    const t=e.target.closest('button');
    if(e.target===pane||(t&&t.id==='vpDone')){pane.hidden=true;stopSay();return;}
    if(!t)return;
    if(t.dataset.p){VS.pitch=t.dataset.p;}
    else if(t.dataset.r){VS.rate=+t.dataset.r;}
    else if(t.dataset.v!=null){VS.name=t.dataset.v;pickVoice();}
    saveVS();render();
    const was=soundOn;soundOn=true;say(SAMPLE);soundOn=was;
  };
})();

/* ---------- helpers ---------- */
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function hex2rgb(h){h=h.slice(1);return[0,2,4].map(i=>parseInt(h.substr(i,2),16))}
function lerpC(a,b,f){const A=hex2rgb(a),B=hex2rgb(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*f)).join(',')})`}
function fmt(t){t=((t%24)+24)%24;let h=Math.floor(t+1e-6),m=Math.round((t-h)*60);if(m===60){h=(h+1)%24;m=0}return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}
const rad=d=>d*Math.PI/180;
let animId=0,loopId=0;const timers=[];
function later(fn,ms){timers.push(setTimeout(fn,ms))}
function tween(from,to,dur,step,done){
  cancelAnimationFrame(animId);
  if(reduceMotion||dur<=0){step(to);done&&done();return}
  const t0=performance.now();
  const f=now=>{
    const p=Math.min(1,(now-t0)/dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    step(from+(to-from)*e);
    if(p<1)animId=requestAnimationFrame(f);else done&&done();
  };
  animId=requestAnimationFrame(f);
}
function svgPt(e){const p=stage.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(stage.getScreenCTM().inverse())}
function restart(el,cls){el.classList.remove(cls);void el.getBoundingClientRect();el.classList.add(cls)}

/* ---------- characters (the illustrations come from assets/pikmin.js) ---------- */
const SOFT={yellow:'#FFF3C4',red:'#FFE0DC',blue:'#DDEBFF',purple:'#EDE3FA',white:'#EEF0F6',rock:'#E6E8EC',wing:'#FDE4F0',ice:'#E2F5FD'};
const PIK=Object.fromEntries(Pik.KEYS.map(k=>[k,{name:Pik.T[k].name,body:Pik.T[k].body,soft:SOFT[k]}]));
const CREW=Pik.KEYS;   /* all eight; every lesson brings everyone along */
const pikG=Pik.pikG;
function pikAt(k,x,feetY,s=.55,cls=''){
  return `<g id="pk-${k}" class="pik ${cls}" transform="translate(${(x-50*s).toFixed(1)},${(feetY-148*s).toFixed(1)}) scale(${s})">${pikG(k)}</g>`;
}
function portrait(k,cls=''){return `<svg viewBox="-5 -24 110 178" aria-hidden="true"><g class="pik ${cls}">${pikG(k)}</g></svg>`}
/* the whole crew standing in a row, every other one waving (opening scenes) */
function crewRow(x0,x1,feetY,s=.5,order=CREW){const n=order.length;return order.map((k,i)=>pikAt(k,x0+(x1-x0)*i/(n-1),feetY,s,i%2?'':'wave')).join('')}

/* ---------- dialog ---------- */
let lines=[],li=0,onLinesDone=null;
function setDialog(who,text,warn){
  const c=PIK[who];
  $('#portrait').innerHTML=portrait(who);
  $('#portrait').style.background=c.soft;
  $('#who').textContent=c.name;
  $('#who').style.background=c.body;
  $('#line').innerHTML=(warn?`<span class="warn-tag">${ICON_WARN}注意安全</span><br>`:'')+text;
  $('#dialog').classList.toggle('warn',!!warn);
  $('#line').dataset.say=text;
}
function talk(arr,done){lines=arr;li=0;onLinesDone=done||null;showLine();}
function showLine(){
  const L=lines[li];
  setDialog(L.who,L.t,L.warn);
  document.querySelectorAll('#stage .pik').forEach(g=>g.classList.toggle('talking',g.id==='pk-'+L.who));
  say(L.t);sfx.pop();
  const mb=$('#moreBtn');
  mb.hidden=false;
  mb.innerHTML=(li<lines.length-1?'繼續':'知道了')+ICON_NEXT;
}
$('#moreBtn').onclick=()=>{
  li++;
  if(li<lines.length){showLine();return}
  $('#moreBtn').hidden=true;stopSay();
  document.querySelectorAll('#stage .pik.talking').forEach(g=>g.classList.remove('talking'));
  const d=onLinesDone;onLinesDone=null;d&&d();
};
$('#replayBtn').innerHTML=ICON_SPK;
$('#replayBtn').onclick=()=>{unlockAudio();say($('#line').dataset.say||'')};

function setTask(text,prog){
  if(done[cur])return;
  taskEl.className='task';
  taskEl.innerHTML=`<b>任務</b><span>${text}</span>${prog?`<em>${prog}</em>`:''}`;
}
function taskDone(text){
  taskEl.className='task done';
  taskEl.innerHTML=`<b>完成</b><span>${text||'做得好！按「下一步」繼續。'}</span>`;
  if(!done[cur]){done[cur]=true;sfx.win();}
  updateNav();renderSteps();
}
/* an in-panel question; resolves when answered correctly */
function askQ(prompt,opts,rightIdx,onRight,{hint,cls='stack',who='red',append=true}={}){
  const box=document.createElement('div');
  box.className='controls qbox';
  box.innerHTML=`<p class="q-prompt">${prompt}</p><div class="answers ${cls}">${opts.map((o,i)=>`<button class="ans" data-i="${i}">${o}</button>`).join('')}</div>`;
  if(append)controls.appendChild(box);else{controls.innerHTML='';controls.appendChild(box);}
  box.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(+b.dataset.i===rightIdx){
      sfx.good();b.classList.add('right');box.querySelectorAll('.ans').forEach(x=>x.disabled=true);onRight&&onRight();
    }else{
      sfx.bad();b.classList.add('wrong');b.disabled=true;if(hint)talk([{who,t:hint}]);
    }
  });
  return box;
}

/* ---------- scenery ---------- */
function cloud(x,y,s,fill='#FFFFFF',op=1){
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}"><g fill="${fill}"><ellipse cx="0" cy="0" rx="48" ry="20"/><circle cx="-20" cy="-10" r="20"/><circle cx="12" cy="-17" r="25"/><circle cx="34" cy="-4" r="14"/></g></g>`;
}
function dirLabels(){
  return `<g class="dir"><g transform="translate(14,410)"><rect width="74" height="30" rx="15" fill="#FFFFFF" fill-opacity=".92"/><path d="M14,15 L25,8 L25,22Z" fill="#1E2A45"/><text x="47" y="21" text-anchor="middle">東</text></g><g transform="translate(712,410)"><rect width="74" height="30" rx="15" fill="#FFFFFF" fill-opacity=".92"/><text x="28" y="21" text-anchor="middle">西</text><path d="M60,15 L49,8 L49,22Z" fill="#1E2A45"/></g></g>`;
}
function timePill(t){
  return `<g transform="translate(14,14)"><rect width="122" height="42" rx="21" fill="#FFFFFF" fill-opacity=".92"/><circle cx="22" cy="21" r="9" fill="none" stroke="#1E2A45" stroke-width="2"/><path d="M22,15 V21 L26,24" stroke="#1E2A45" stroke-width="2" fill="none" stroke-linecap="round"/><text id="timeTxt" x="78" y="29" text-anchor="middle" class="clockTxt">${fmt(t)}</text></g>`;
}
function sparkle(r){const q=r*.24;return `M0,${-r} L${q},${-q} L${r},0 L${q},${q} L0,${r} L${-q},${q} L${-r},0 L${-q},${-q}Z`}
function starField(seed,n,xmin,xmax,ymax,twk=true){
  const r=rng(seed);let s='';
  for(let i=0;i<n;i++){
    const x=xmin+r()*(xmax-xmin),y=r()*ymax,rr=.7+r()*1.5,o=.35+r()*.65,d=(r()*2.4).toFixed(2);
    s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(2)}" fill="#FFFFFF" opacity="${o.toFixed(2)}"${twk&&i%5===0?` class="twinkle" style="animation-delay:${d}s"`:''}/>`;
  }
  return s;
}
/* moon phase: f=0 new, .25 first quarter (right side lit, as seen from Taiwan), .5 full, .75 last quarter */
let _mid=0;
const lunarF=d=>((d-1)/29.53)%1;
function moonG(f,r,{glow=false,dark='#2B3260',dash=true}={}){
  const id='mc'+(++_mid);
  f=((f%1)+1)%1;
  const k=Math.cos(2*Math.PI*f),wax=f<.5,rx=(Math.abs(k)*r).toFixed(2);
  let lit;
  if(f<.02||f>.98)lit='';
  else if(Math.abs(f-.5)<.02)lit=`<circle r="${r}"/>`;
  else lit=wax?`<path d="M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${k>0?0:1} 0,${-r}Z"/>`
              :`<path d="M0,${-r} A${r},${r} 0 0 0 0,${r} A${rx},${r} 0 0 ${k>0?1:0} 0,${-r}Z"/>`;
  const cr=`<circle cx="${(-.3*r).toFixed(1)}" cy="${(-.25*r).toFixed(1)}" r="${(.22*r).toFixed(1)}"/><circle cx="${(.28*r).toFixed(1)}" cy="${(.2*r).toFixed(1)}" r="${(.16*r).toFixed(1)}"/><circle cx="${(-.1*r).toFixed(1)}" cy="${(.42*r).toFixed(1)}" r="${(.12*r).toFixed(1)}"/><circle cx="${(.35*r).toFixed(1)}" cy="${(-.42*r).toFixed(1)}" r="${(.1*r).toFixed(1)}"/>`;
  const sw=Math.max(1,r*.06).toFixed(1);
  return `${glow&&lit?`<circle r="${r*2.4}" fill="url(#mglow)"/>`:''}<circle r="${r}" fill="${dark}"${!lit&&dash?` stroke="#C9CFF0" stroke-width="${sw}" stroke-dasharray="${(r*.2).toFixed(1)} ${(r*.14).toFixed(1)}"`:''}/>${lit?`<clipPath id="${id}">${lit}</clipPath><g clip-path="url(#${id})"><circle r="${r}" fill="#FFF4C4"/><g fill="#E6D89E" opacity=".85">${cr}</g></g>`:''}`;
}
function moonIcon(f,size=60){return `<svg viewBox="-30 -30 60 60" width="${size}" height="${size}" aria-hidden="true">${moonG(f,22)}</svg>`}
function timeControls(min,max,val,cps,cls,step=5/60){
  return `<div class="slider"><div class="slider-head"><span>拖拉時間條</span><span><b>${fmt(min)}</b> 到 <b>${fmt(max)}</b></span></div>
    <input id="tRange" class="${cls}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="時間"></div>
    <div class="chips">${cps.map(([h,l])=>`<button class="chip" data-t="${h}"><span class="ct">${fmt(h)}</span><span class="cl">${l}</span><span class="tick" aria-hidden="true"></span></button>`).join('')}</div>`;
}

/* ---------- notes modal ---------- */
function openNotes(){$('#notes').hidden=false;$('#closeNotes').focus();}
function closeNotes(){$('#notes').hidden=true;stopSay();}
$('#closeNotes').onclick=closeNotes;
$('#readNotes').innerHTML=ICON_SPK+'朗讀筆記';
$('#readNotes').onclick=()=>{unlockAudio();say([...document.querySelectorAll('#notes h3, #notes li')].map(e=>e.textContent).join('。'))};
$('#notes').onclick=e=>{if(e.target.id==='notes')closeNotes()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#notes').hidden)closeNotes()});

/* ---------- quiz engine ----------
   types: single {opts,a} · multi {opts,a:[]} · tf {a:bool} · order {tiles:{key:{h,t}},right:[keys],cols,text}
   an option may be a string or {h:html,t:text-for-voice-and-answers} */
let Q=null;
const oH=o=>typeof o==='string'?o:o.h, oT=o=>typeof o==='string'?o:o.t;
function answered(i){const q=QUIZ[i],a=Q.ans[i];return q.type==='multi'?a.length>0:q.type==='order'?a.length===q.right.length:a!==null}
function correct(i){const q=QUIZ[i],a=Q.ans[i];if(q.type==='multi')return[...a].sort().join()===[...q.a].sort().join();if(q.type==='order')return a.join()===q.right.join();return a===q.a}
function rightText(q){if(q.rightText)return q.rightText;if(q.type==='tf')return q.a?'對':'不對';if(q.type==='multi')return q.a.map(i=>oT(q.opts[i])).join('、');if(q.type==='order')return q.right.map(k=>q.tiles[k].t).join(' → ');return oT(q.opts[q.a])}
function optBtn(i,v,o,q){
  const a=Q.ans[i],sel=q.type==='multi'?a.includes(v):a===v;
  let cls='opt'+(q.type==='multi'?' multi':'')+(sel?' sel':'');
  if(Q.sub){const isR=q.type==='multi'?q.a.includes(v):q.a===v;if(isR)cls+=' correct';else if(sel)cls+=' wrongpick';}
  return `<button class="${cls}" data-q="${i}" data-v="${String(v)}" ${Q.sub?'disabled':''}><span class="mk"></span><span class="ot">${oH(o)}</span></button>`;
}
function cardHTML(i){
  const q=QUIZ[i],st=Q.sub?(correct(i)?'right':'wrong'):'';
  let body='';
  if(q.pic)body+=q.pic;
  if(q.type==='order'){
    const n=q.right.length,cols=q.cols||Math.min(n,4);
    body+=`<div class="order" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${Q.perm[i].map(p=>{const k=Q.ans[i].indexOf(p);const pc=Q.sub?(k>=0&&q.right[k]===p?'okpos':'badpos'):'';return `<button class="otile ${q.text?'text':''} ${q.dark?'dark':''} ${pc}" data-q="${i}" data-v="${p}" ${Q.sub?'disabled':''}>${k>=0?`<span class="badge">${k+1}</span>`:''}${q.tiles[p].h}</button>`}).join('')}</div>
      <p class="hint">${q.hint||'依照順序一個一個點。點錯了，再點一次就可以取消。'}</p>`;
  }else if(q.type==='tf'){
    body+=`<div class="opts tf">${[[true,'對'],[false,'不對']].map(([v,l])=>optBtn(i,v,l,q)).join('')}</div>`;
  }else{
    body+=`<div class="opts ${q.pics?'pics':''}">${Q.perm[i].map(oi=>optBtn(i,oi,q.opts[oi],q)).join('')}</div>`;
  }
  let fb='';
  if(Q.sub)fb=`<div class="fb ${correct(i)?'ok':'no'}"><b>${correct(i)?'答對了！':'答錯了'}</b>${correct(i)?'':`　正確答案：${rightText(q)}`}<br>${q.ex}${q.page?`<span class="book-pg">課本第 ${q.page} 頁</span>`:''}</div>`;
  return `<article class="qcard ${st}" id="q${i}"><div class="qhead"><span class="qnum">第 ${i+1} 題${q.type==='multi'?'（複選）':''}</span><button class="icon-btn" data-say="${i}" aria-label="聽題目">${ICON_SPK}</button></div><p class="qtext">${q.q}</p>${body}${fb}</article>`;
}
function buildQuiz(){
  Q={ans:QUIZ.map(q=>q.type==='multi'||q.type==='order'?[]:null),
     perm:QUIZ.map(q=>q.type==='order'?shuffle([...q.right]):q.opts?(q.fixed?q.opts.map((_,i)=>i):shuffle(q.opts.map((_,i)=>i))):null),
     sub:false};
  renderQuiz();
  say(`小測驗開始！一共 ${QUIZ.length} 題，加油！`);
}
function renderQuiz(){
  let h=`<section class="quiz-intro">${portrait('yellow')}<div><h2>${QUIZ_TITLE}</h2><p>一共 ${QUIZ.length} 題，每題 ${100/QUIZ.length} 分。按喇叭可以聽題目。答錯沒關係，可以再挑戰一次！</p></div></section><div id="result"></div>`;
  QUIZ.forEach((_,i)=>h+=cardHTML(i));
  h+=`<div class="submitbar" id="submitbar"></div>`;
  $('#quizView').innerHTML=h;
  renderBar();
}
function score(){return Math.round(QUIZ.filter((_,i)=>correct(i)).length*100/QUIZ.length)}
function renderBar(){
  const n=QUIZ.filter((_,i)=>answered(i)).length;
  $('#submitbar').innerHTML=Q.sub
    ?`<span id="progress">得到 ${score()} 分</span><button class="ghost-btn" id="quizBack">回到課程</button><button class="primary-btn" id="retryBtn2">再挑戰一次</button>`
    :`<span id="progress">已作答 ${n} / ${QUIZ.length}</span><button class="ghost-btn" id="quizBack">回到課程</button><button class="primary-btn" id="submitBtn">交卷</button>`;
}
function showResult(){
  const s=score(),n=QUIZ.filter((_,i)=>correct(i)).length;
  const msg=s===100?`全部答對！你是${MASTER}大師！`:s>=80?'好厲害！看看答錯的題目，下次就全對了！':s>=60?'不錯喔！看看解說，再挑戰一次！':'沒關係！看看下面的解說，我們再試一次！';
  const crew=CREW;
  $('#result').innerHTML=`<section class="result"><div class="score-box"><span class="score">${s}</span><span class="score-l">分</span></div>
    <div><p class="msg">${msg}</p><p>答對 ${n} 題，答錯 ${QUIZ.length-n} 題。往下看每一題的答案和解說。</p>
    <div class="piks-row">${crew.map(k=>portrait(k,'talking')).join('')}</div>
    <div class="result-actions"><button class="primary-btn" id="retryBtn">再挑戰一次</button><button class="ghost-btn" id="readRes">${ICON_SPK}聽成績</button></div></div></section>`;
  say(`你得到 ${s} 分！${msg}`);
}
$('#quizView').onclick=e=>{
  const sp=e.target.closest('[data-say]');
  if(sp){
    unlockAudio();const i=+sp.dataset.say,q=QUIZ[i];
    let t=q.say||q.q;
    if(q.type==='tf')t+='。對，還是不對？';
    else if(q.opts&&!q.pics)t+='。'+Q.perm[i].map(k=>oT(q.opts[k])).join('，');
    say(t);return;
  }
  if(e.target.closest('#retryBtn,#retryBtn2')){buildQuiz();window.scrollTo(0,0);return;}
  if(e.target.closest('#quizBack')){goTo(cur-1);return;}
  if(e.target.closest('#readRes')){say(`你得到 ${score()} 分！`);return;}
  if(e.target.closest('#submitBtn')){
    const k=QUIZ.findIndex((_,i)=>!answered(i));
    if(k>=0){
      const p=$('#progress');p.textContent=`第 ${k+1} 題還沒有作答完喔！`;p.classList.add('warn');
      const c=$('#q'+k);c.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
      restart(c,'flash');
      say(`第 ${k+1} 題還沒有作答完喔！`);sfx.bad();
      return;
    }
    Q.sub=true;
    QUIZ.forEach((_,i)=>{$('#q'+i).outerHTML=cardHTML(i)});
    renderBar();showResult();
    score()>=60?sfx.win():sfx.good();
    window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
    return;
  }
  const b=e.target.closest('.opt,.otile');
  if(b&&!Q.sub){
    const i=+b.dataset.q,q=QUIZ[i];let v=b.dataset.v;
    if(q.type==='tf')v=v==='true';else if(q.type!=='order')v=+v;
    if(q.type==='multi'){const a=Q.ans[i],k=a.indexOf(v);k>=0?a.splice(k,1):a.push(v);}
    else if(q.type==='order'){const a=Q.ans[i],k=a.indexOf(v);if(k>=0)a.splice(k);else if(a.length<q.right.length)a.push(v);}
    else Q.ans[i]=v;
    sfx.pop();
    $('#q'+i).outerHTML=cardHTML(i);
    renderBar();
  }
};

/* ---------- navigation ---------- */
function renderSteps(){
  $('#steps').innerHTML=SCENES.map((s,i)=>`<li><button class="step ${i===cur?'cur':''} ${done[i]?'ok':''}" data-i="${i}" ${!FREE_NAV&&i>maxReached?'disabled':''} aria-label="第 ${i+1} 關：${s.label}"><span class="n">${i+1}</span><span class="l">${s.label}</span></button></li>`).join('');
  /* keep the current tab visible when the bar scrolls */
  const on=$('#steps .step.cur');if(on){const bar=$('#steps'),r=on.getBoundingClientRect(),br=bar.getBoundingClientRect();if(r.left<br.left||r.right>br.right)bar.scrollTo({left:bar.scrollLeft+r.left-br.left-(br.width-r.width)/2,behavior:'instant'});}
}
$('#steps').onclick=e=>{const b=e.target.closest('.step');if(b&&!b.disabled){unlockAudio();goTo(+b.dataset.i)}};
function updateNav(){
  prevBtn.disabled=cur===0;
  nextBtn.disabled=FREE_NAV?cur>=SCENES.length-1:!done[cur];
  nextBtn.textContent=cur===SCENES.length-2?'開始小測驗':'下一步';
  nextBtn.classList.toggle('ready',!!done[cur]);
}
function goTo(i){
  stopSay();cancelAnimationFrame(animId);cancelAnimationFrame(loopId);timers.splice(0).forEach(clearTimeout);
  $('#notes').hidden=true;
  cur=i;maxReached=Math.max(maxReached,i);
  const q=!!SCENES[i].quiz;
  $('#playView').hidden=q;$('#quizView').hidden=!q;
  if(q){buildQuiz();}
  else{
    stage.onclick=null;stage.onpointerdown=null;stage.onpointermove=null;stage.onpointerup=null;stage.onpointercancel=null;
    stage.style.touchAction='';
    controls.innerHTML='';lines=[];$('#moreBtn').hidden=true;
    taskEl.className='task';taskEl.innerHTML='';
    SCENES[i].build();
    if(done[cur]&&!taskEl.classList.contains('done'))taskDone();
  }
  renderSteps();updateNav();
  window.scrollTo(0,0);
}
prevBtn.onclick=()=>{if(cur>0)goTo(cur-1)};
nextBtn.onclick=()=>{if((FREE_NAV||done[cur])&&cur<SCENES.length-1){unlockAudio();goTo(cur+1)}};

/* shared opening screen: start button unlocks audio on iPad */
function introStart(lines,doneText){
  setTask('按「開始冒險」，出發吧！');
  controls.innerHTML=`<button class="big-start" id="startBtn">開始冒險</button>`;
  $('#startBtn').onclick=()=>{
    unlockAudio();$('#startBtn').hidden=true;
    /* the start button is gone now, so the task box tells what to do next */
    setTask('聽八位小夥伴自我介紹，按「繼續」聽下一位');
    talk(lines,()=>taskDone(doneText));
  };
  if(done[cur])taskDone(doneText);
}
