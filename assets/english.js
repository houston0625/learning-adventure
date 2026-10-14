/* 皮皮學習樂園：英文科共用程式（中英混合朗讀、跟讀麥克風、天氣圖示與場景、點選拼字、句子積木）。
   載入順序：pikmin.js → core.js → english.js → 這一課的內容。樣式：core.css + english.css。
   英文科的原則：先聽再說、玩中學；英文用 en-US 語音（單字 0.8、句子 0.9），中文台詞照舊用 zh-TW。 */

/* ---------- 英文朗讀 ---------- */
let enVoice=null;
/* 系統的「玩具聲音」（macOS／iOS 內建的怪聲）不拿來念課文 */
const NOVELTY=/albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|pipe|grandma|grandpa|rocko|shelley|eddy|flo|reed|sandy/i;
function enVoices(){
  if(!('speechSynthesis' in window))return[];
  const rank=v=>(/en[-_]US/i.test(v.lang)?0:/en[-_](GB|AU|CA)/i.test(v.lang)?2:4)-(goodVoice(v)?1:0)-(/samantha|ava|allison|susan|zira|aria|jenny|google us/i.test(v.name)?.5:0);
  return speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)&&!NOVELTY.test(v.name)).sort((x,y)=>rank(x)-rank(y));
}
function pickEnVoice(){enVoice=enVoices()[0]||null}
if('speechSynthesis' in window){
  const init=()=>{pickVoice();pickEnVoice();};
  init();
  try{speechSynthesis.addEventListener('voiceschanged',init)}catch(e){}
}
/* 把一句台詞切成中文段和英文段：「答對了！It's rainy. 是下雨。」→ 中、英、中 */
const EN_RUN=/[A-Za-z][A-Za-z'’\-]*(?:[ ,]+[A-Za-z][A-Za-z'’\-]*)*[.!?]?/g;
function splitLang(text){
  const out=[];let last=0;
  text.replace(EN_RUN,(m,off)=>{if(off>last)out.push({en:false,t:text.slice(last,off)});out.push({en:true,t:m});last=off+m.length;return m;});
  if(last<text.length)out.push({en:false,t:text.slice(last)});
  return out.filter(s=>s.en||/[㐀-鿿0-9]/.test(s.t));
}
const enRate=t=>(/\s/.test(t.trim())?.9:.8)*(VS.rate/.9);
/* 取代 core.js 的 say()：中英混合時分段，用各自的語音念 */
say=function(text,onend){
  text=String(text);
  if(!soundOn||!('speechSynthesis' in window)){if(onend)later(onend,Math.min(2400,300+text.length*120));return;}
  try{
    speechSynthesis.cancel();
    const segs=splitLang(text.replace(/[「」『』〈〉（）()]/g,' ').replace(/°C/g,'度').replace(/°/g,'度').replace(/～|~/g,'到'));
    if(!segs.length){if(onend)onend();return;}
    segs.forEach((s,i)=>{
      const u=new SpeechSynthesisUtterance(s.t);
      if(s.en){u.lang='en-US';if(enVoice)u.voice=enVoice;u.rate=enRate(s.t);u.pitch=Math.min(VOICE_PITCH[VS.pitch]||1.2,1.3);}
      else{u.lang='zh-TW';if(voice)u.voice=voice;u.rate=VS.rate;u.pitch=VOICE_PITCH[VS.pitch]||1.35;}
      if(onend&&i===segs.length-1){let fired=false;const f=()=>{if(!fired){fired=true;onend();}};u.onend=f;u.onerror=f;}
      speechSynthesis.speak(u);
    });
  }catch(e){if(onend)onend();}
};
/* 只念英文（單字卡、聽力題） */
function sayEn(text,onend){say(String(text).replace(/[㐀-鿿]/g,' '),onend)}

/* ---------- 跟讀麥克風 ----------
   iPad Safari、電腦的 Chrome／Edge 支援語音辨識；不支援或沒開麥克風時，改成「大聲念一遍，按『我念完了』」。
   語音辨識會把聲音送到 Apple／Google 的伺服器轉成文字，網頁不錄音、不保存。 */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const ICON_MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
const ICON_STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="currentColor"/></svg>';
const normEn=t=>String(t).toLowerCase().replace(/[’`]/g,"'").replace(/\bit is\b/g,"it's").replace(/\bhow is\b/g,"how's").replace(/\blet us\b/g,"let's").replace(/[^a-z' ]/g,' ').split(/\s+/).filter(Boolean);
function editDist(a,b){const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}}return d[b.length]}
/* 0～1：目標句子的字，有多少被聽到（拼字差一點也算） */
function matchScore(target,heard){
  const T=normEn(target),H=normEn(heard);if(!T.length)return 0;
  const near=(w,h)=>w===h||w.replace(/'/g,'')===h.replace(/'/g,'')||(w.length>=4&&editDist(w,h)<=1);
  const Hj=H.join('').replace(/'/g,'');   /* 「lineup」也算聽到 line、up */
  return T.filter(w=>H.some(h=>near(w,h))||(w.length>=2&&Hj.includes(w.replace(/'/g,'')))).length/T.length;
}
let recog=null;
function stopListen(){if(recog){try{recog.abort()}catch(e){}recog=null;}}
/* cb({ok,score,heard,error}) */
function listenEn(target,cb){
  stopSay();stopListen();
  if(!SR){cb({error:'unsupported'});return;}
  let alts=[],ended=false;
  const r=new SR();recog=r;
  r.lang='en-US';r.interimResults=false;r.maxAlternatives=5;r.continuous=false;
  r.onresult=e=>{alts=[...e.results[0]].map(a=>a.transcript)};
  r.onerror=e=>{if(ended)return;ended=true;recog=null;cb({error:e.error||'error'})};
  r.onend=()=>{if(ended)return;ended=true;recog=null;
    if(!alts.length){cb({error:'no-speech'});return;}
    let best=alts[0],bs=-1;alts.forEach(a=>{const s=matchScore(target,a);if(s>bs){bs=s;best=a}});
    cb({ok:true,score:bs,heard:best});
  };
  try{r.start()}catch(e){ended=true;recog=null;cb({error:'error'});return;}
  later(()=>{if(recog===r){try{r.stop()}catch(e){}}},7000);
}
/* 控制區裡的「跟讀」小卡：句子、聽一次、換我說。onDone 在第一次念完（不論分數）時呼叫一次 */
function readAlong(target,{title='換你說說看',onDone,host=controls}={}){
  const box=document.createElement('div');box.className='readalong';
  box.innerHTML=`<p class="ra-title">${ICON_MIC}${title}</p><p class="ra-text">${escH(target)}</p>
    <div class="tools"><button class="tool" data-a="listen">${ICON_SPK}聽一次</button><button class="tool primary" data-a="mic">${ICON_MIC}<span>換我說</span></button></div>
    <div class="ra-res" aria-live="polite"></div>`;
  host.appendChild(box);
  const res=box.querySelector('.ra-res'),mic=box.querySelector('[data-a="mic"]');
  let first=true;
  const finish=()=>{if(first){first=false;onDone&&onDone();}};
  const stars=n=>`<span class="ra-stars">${[0,1,2].map(i=>`<i class="${i<n?'on':''}">${ICON_STAR}</i>`).join('')}</span>`;
  box.onclick=e=>{
    const b=e.target.closest('button');if(!b)return;unlockAudio();
    if(b.dataset.a==='listen'){stopListen();sayEn(target);return;}
    if(b.dataset.a==='done'){res.innerHTML=`${stars(3)}<b>好棒！大聲念出來就對了！</b>`;sfx.win();finish();return;}
    if(mic.classList.contains('rec')){stopListen();return;}
    mic.classList.add('rec');mic.querySelector('span').textContent='我在聽…';
    res.innerHTML='<b>請對著 iPad 說英文…</b>';
    listenEn(target,r=>{
      mic.classList.remove('rec');mic.querySelector('span').textContent='再說一次';
      if(r.error){
        if(r.error==='no-speech'){res.innerHTML='<b>皮皮沒有聽到聲音，按「再說一次」，大聲一點喔！</b>';return;}
        if(r.error==='aborted'){res.innerHTML='';return;}
        const why=r.error==='unsupported'?'這台裝置不能用麥克風跟讀。':(r.error==='not-allowed'||r.error==='service-not-allowed')?'麥克風沒有打開（請爸爸媽媽在 Safari 允許使用麥克風）。':'麥克風現在不能用。';
        res.innerHTML=`<b>${why}</b>沒關係，看著句子大聲念一遍，再按下面的按鈕。<button class="tool" data-a="done">我念完了</button>`;
        return;
      }
      const s=r.score,n=s>=.75?3:s>=.4?2:1;
      const msg=n===3?'說得很好！':n===2?'很接近了！再聽一次，再試試看？':'皮皮聽得不太清楚，聽一次再試試看！';
      res.innerHTML=`${stars(n)}<b>${msg}</b><span class="ra-heard">皮皮聽到：「${escH(r.heard)}」</span>`;
      n===3?sfx.win():sfx.good();
      finish();
    });
  };
  return box;
}

/* ---------- 天氣：圖示和場景 ---------- */
const WX=(()=>{
  const WORD={sunny:'sunny',cloudy:'cloudy',rainy:'rainy',windy:'windy',hot:'hot',cold:'cold'};
  const ZH={sunny:'晴朗的',cloudy:'多雲的',rainy:'下雨的',windy:'颳風的',hot:'熱的',cold:'冷的'};
  const KEYS=Object.keys(WORD);
  const SKY={sunny:['#4AA8F0','#CBEAFF'],cloudy:['#8FA4BA','#DCE4EC'],rainy:['#5C6E88','#A9B7C8'],windy:['#6CB8E6','#D6EEF9'],hot:['#FF9E3D','#FFE6A8'],cold:['#9CC6E6','#EEF8FF']};
  const GROUND={sunny:'#79C05A',cloudy:'#86B36A',rainy:'#6FA35A',windy:'#7FBF5C',hot:'#C9C25A',cold:'#DDEBF2'};
  /* 漸層放進頁面的 <defs> */
  const defs=Object.entries(SKY).map(([k,[a,b]])=>`<linearGradient id="sky-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')
    +`<radialGradient id="wxGlow"><stop offset="0" stop-color="#FFF7C7" stop-opacity=".95"/><stop offset=".45" stop-color="#FFE066" stop-opacity=".45"/><stop offset="1" stop-color="#FFD84D" stop-opacity="0"/></radialGradient>`;
  const holder=document.querySelector('.defs-holder defs');if(holder)holder.insertAdjacentHTML('beforeend',defs);

  const sunG=(x,y,r,big)=>{let rays='';for(let i=0;i<12;i++)rays+=`<line y1="${-r-7}" y2="${-r-(big?24:16)}" stroke="#FFC12E" stroke-width="${big?5:4}" stroke-linecap="round" transform="rotate(${i*30})"/>`;return `<g transform="translate(${x},${y})"><circle r="${r*2.4}" fill="url(#wxGlow)"/><g class="rays">${rays}</g><circle r="${r}" fill="${big?'#FFB52E':'#FFD23F'}" stroke="#F5A524" stroke-width="3"/></g>`};
  const cl=(x,y,s,fill='#FFFFFF',op=1)=>cloud(x,y,s,fill,op);
  const drop=(x,y,s=1)=>`<path transform="translate(${x},${y}) scale(${s})" d="M0,-9 C4,-3 6,1 6,4 A6,6 0 0 1 -6,4 C-6,1 -4,-3 0,-9Z" fill="#3F86E6"/>`;
  const swirl=(x,y,s=1,c='#FFFFFF')=>`<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"><path d="M-40,-14 H14 C30,-14 32,-34 18,-36 C8,-37 6,-26 13,-24"/><path d="M-52,4 H30"/><path d="M-40,22 H6 C22,22 24,40 10,42 C2,43 0,34 6,32"/></g>`;
  const leaf=(x,y,r=0,s=1)=>`<path transform="translate(${x},${y}) rotate(${r}) scale(${s})" d="M0,0 C6,-10 18,-10 22,0 C18,10 6,10 0,0Z" fill="#5BAE3C" stroke="#3F7F28" stroke-width="1.5"/>`;
  const thermo=(x,y,s,hot)=>`<g transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-46" width="18" height="60" rx="9" fill="#FFFFFF" stroke="#1E2A45" stroke-width="3"/><circle cy="22" r="14" fill="${hot?'#E2483D':'#3F86E6'}" stroke="#1E2A45" stroke-width="3"/><rect x="-4" y="${hot?-38:4}" width="8" height="${hot?54:14}" rx="4" fill="${hot?'#E2483D':'#3F86E6'}"/></g>`;
  const flake=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round">${[0,60,120].map(a=>`<path d="M0,-12 V12" transform="rotate(${a})"/>`).join('')}</g>`;

  /* 小圖示：viewBox -50 -50 100 100 */
  function icon(k){
    if(k==='sunny')return sunG(0,0,20).replace('url(#wxGlow)','none');
    if(k==='cloudy')return cl(-14,-4,.78,'#AEBBCB')+cl(12,14,.72,'#D5DDE6');
    if(k==='rainy')return cl(-4,-10,.85,'#8394AA')+drop(-22,28)+drop(0,36)+drop(22,28);
    if(k==='windy')return swirl(4,-4,.78,'#3F9CC8')+leaf(-34,30,-20,.8);
    if(k==='hot')return sunG(-10,-10,16).replace('url(#wxGlow)','none')+thermo(26,8,.62,true);
    if(k==='cold')return thermo(-18,4,.62,false)+`<g transform="translate(22,-14)">${flake(0,0,1.3).replace(/#FFFFFF/g,'#6AB5D8')}</g>`;
    return '';
  }
  const iconSVG=(k,cls='')=>`<svg class="wx-ico ${cls}" viewBox="-50 -50 100 100" aria-hidden="true">${icon(k)}</svg>`;

  /* 天氣場景：畫在 x0～x0+w 的範圍（舞台高 450），地面在 gy */
  let uid=0;
  function scene(k,{x0=0,w=800,gy=370}={}){
    const id='wxc'+(++uid),cx=x0+w/2,r=rng(k.length*97+x0+7);
    let fx='';
    if(k==='sunny')fx=sunG(x0+w*.8,80,30)+cl(x0+w*.25,70,.7)+cl(x0+w*.55,110,.45);
    if(k==='hot')fx=sunG(x0+w*.78,90,42,true)+[0,1,2].map(i=>`<path class="heat" style="animation-delay:${i*.4}s" d="M${x0+w*(.2+i*.25)},${gy-12} q10,-14 0,-28 q-10,-14 0,-28" stroke="#FF8A3D" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`).join('')+thermo(x0+w*.1,130,.9,true);
    if(k==='cloudy')fx=cl(x0+w*.2,80,.9,'#E4EAF0')+cl(x0+w*.55,60,1.1,'#FFFFFF')+cl(x0+w*.85,100,.8,'#D2DAE3')+cl(x0+w*.4,140,.7,'#EEF2F6');
    if(k==='rainy'){fx=cl(x0+w*.22,70,1,'#7A8BA3')+cl(x0+w*.55,52,1.2,'#6B7C95')+cl(x0+w*.86,80,.9,'#8394AA');
      let rain='';for(let i=0;i<Math.round(w/16);i++){const x=x0+r()*w,y=100+r()*250;rain+=`<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x-6).toFixed(0)}" y2="${(y+22).toFixed(0)}" stroke="#DCEBFF" stroke-width="3" stroke-linecap="round"/>`;}
      fx+=`<g class="rainfall">${rain}</g><g class="rainfall b">${rain}</g>`;}
    if(k==='windy'){fx=cl(x0+w*.3,70,.6)+cl(x0+w*.75,100,.5)
      +`<g class="gust">${swirl(x0+w*.3,170,1)}${swirl(x0+w*.75,250,.8)}</g><g class="gust b">${swirl(x0+w*.55,120,.7)}</g>`
      +`<g class="leaves">${[0,1,2,3,4].map(i=>leaf(x0+r()*w,140+r()*180,r()*360,1.1)).join('')}</g>`
      +`<g transform="translate(${x0+w*.12},${gy})"><path d="M0,0 V-70" stroke="#7A4A1A" stroke-width="8"/><g class="bend"><ellipse cx="18" cy="-90" rx="36" ry="24" fill="#4FA046"/></g></g>`;}
    if(k==='cold'){fx=cl(x0+w*.3,70,.7,'#F4FAFF')+cl(x0+w*.75,90,.6,'#F4FAFF')+thermo(x0+w*.88,140,.9,false);
      let s='';for(let i=0;i<Math.round(w/40);i++)s+=flake(x0+r()*w,90+r()*240,.6+r()*.5);fx+=`<g class="snowfall">${s}</g>`;}
    return `<clipPath id="${id}"><rect x="${x0}" y="0" width="${w}" height="450"/></clipPath><g clip-path="url(#${id})">
      <rect x="${x0}" y="0" width="${w}" height="450" fill="url(#sky-${k})"/>${fx}
      <path d="M${x0},${gy} C${x0+w*.3},${gy-14} ${x0+w*.6},${gy+8} ${x0+w},${gy-6} L${x0+w},450 L${x0},450Z" fill="${GROUND[k]}"/></g>`;
  }
  /* 角色在這種天氣的樣子（hot 流汗、cold 發抖） */
  const mood=k=>k==='cold'?'shiver':'';
  const sweat=(x,y)=>`<g class="sweat">${drop(x,y,.9)}${drop(x+16,y+14,.7)}</g>`;
  return {KEYS,WORD,ZH,icon,iconSVG,scene,mood,sweat,sunG,cl,drop,swirl,leaf,thermo,flake};
})();

/* 天氣選項按鈕（圖＋字），在控制區用 */
function wxButtons(keys,{withWord=true}={}){
  return `<div class="wx-grid">${keys.map(k=>`<button class="wx-btn" data-k="${k}" aria-label="${WX.WORD[k]}">${WX.iconSVG(k)}${withWord?`<span>${WX.WORD[k]}</span>`:''}</button>`).join('')}</div>`;
}

/* ---------- 單字卡、句子用的文字框（舞台上） ---------- */
function wordBanner(text,x=400,y=60,{size=44,sub=''}={}){
  const w=Math.max(160,Math.round(text.length*size*.56+60));
  return `<g class="pop"><rect x="${x-w/2}" y="${y-size*.95}" width="${w}" height="${size*1.5+(sub?26:0)}" rx="22" fill="#FFFFFF" fill-opacity=".94" stroke="#2C6F93" stroke-width="3"/>
    <text x="${x}" y="${y+size*.18}" text-anchor="middle" class="en-big" style="font-size:${size}px">${escH(text)}</text>
    ${sub?`<text x="${x}" y="${y+size*.18+30}" text-anchor="middle" class="ink-txt">${escH(sub)}</text>`:''}</g>`;
}
/* 對話泡泡（舞台上，英文）。tail：泡泡尾巴指向的方向 left/right */
function bubbleG(text,x,y,{w,tail='left',cls=''}={}){
  w=w||Math.max(150,Math.round(text.length*13.5+44));
  const h=54,tx=tail==='left'?x+30:x+w-30;
  return `<g class="pop ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#FFFFFF" stroke="#2C6F93" stroke-width="3"/>
    <path d="M${tx-10},${y+h-2} L${tx+(tail==='left'?-14:14)},${y+h+18} L${tx+10},${y+h-2}Z" fill="#FFFFFF" stroke="#2C6F93" stroke-width="3" stroke-linejoin="round"/><rect x="${tx-12}" y="${y+h-6}" width="24" height="6" fill="#FFFFFF"/>
    <text x="${x+w/2}" y="${y+35}" text-anchor="middle" class="en-bub">${escH(text)}</text></g>`;
}
