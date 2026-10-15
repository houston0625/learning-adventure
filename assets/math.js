/* 皮皮學習樂園：數學科共用程式（搭配 core.js）。
   載入順序：pikmin.js → core.js → math.js → 這一課的內容。樣式：core.css + math.css。
   數學科的原則（使用者 2026-10-15 決定）：
   - 不朗讀：題目和台詞都不念（孩子自己讀題目），只保留音效；右上角的按鈕是「音效 開/關」。
   - 重點是「讀懂題目、選出算式」；計算用紙筆，算完在網頁上用數字鍵盤對答案（可以看答案、可以跳過）。
   - 題目是「範本＋隨機數字」：同一次打開網頁，同一個情境不會出現兩次。
   題目範本的格式寫在 MATH.make() 前面。 */

/* ---------- 不朗讀，只有音效 ---------- */
say=function(text,onend){if(onend)later(onend,200)};
renderSoundBtn=function(){
  const b=$('#soundBtn');
  b.innerHTML=(soundOn?ICON_SPK:ICON_MUTE)+`<span>音效 ${soundOn?'開':'關'}</span>`;
  b.setAttribute('aria-pressed',soundOn);
};
renderSoundBtn();

/* 一句話的回饋：直接顯示在對話框，不用再按「知道了」 */
function tell(who,t){
  setDialog(who,t);sfx.pop();
  $('#moreBtn').hidden=true;lines=[];
  document.querySelectorAll('#stage .pik').forEach(g=>g.classList.toggle('talking',g.id==='pk-'+who));
}

/* 測驗：每次開始（含「再挑戰一次」）都重新出題；說明文字拿掉「按喇叭聽題目」 */
const _buildQuiz=buildQuiz,_renderQuiz=renderQuiz;
buildQuiz=function(){if(typeof makeQuiz==='function')QUIZ=makeQuiz();_buildQuiz()};
renderQuiz=function(){
  _renderQuiz();
  const p=document.querySelector('.quiz-intro p');
  if(p)p.textContent=`一共 ${QUIZ.length} 題，每題 ${100/QUIZ.length} 分。先讀懂題目，再選答案。準備好紙筆，可以先算一算再選。`;
};

const MATH=(()=>{
  /* ---------- 亂數 ---------- */
  const R=(lo,hi,step=1)=>lo+step*Math.floor(Math.random()*(Math.floor((hi-lo)/step)+1));
  const NAMES=['安安','小宇','品妍','柏翰','子晴','宥辰','芊芊','承恩','家安','維維','芯語','志明'];

  /* ---------- 題庫抽題：同一次打開網頁不重複（抽完一輪才重新洗牌） ---------- */
  const used=new Set();
  function draw(list,n,filter){
    const pool=list.filter(s=>!filter||filter(s));
    let fresh=shuffle(pool.filter(s=>!used.has(s.id)));
    if(fresh.length<n){pool.forEach(s=>used.delete(s.id));fresh=shuffle([...pool]);}
    const out=fresh.slice(0,n);out.forEach(s=>used.add(s.id));
    return out;
  }

  /* ---------- 題目範本 ----------
     {id, op:'mul'|'div'|'ceil'|'custom', kind:'group'|'array'|'pack'|'share'|'ceil',
      s:'題幹（{a}{b}{n}{d}{x}{who} 會換成數字或人名；⟪…⟫ 是重點，答錯時會變黃色）',
      q:'問句'（乘法、或沒有餘數的除法）／ qq:'問商的句子' + rq:'問餘數的句子'（有餘數的除法）,
      r:{a:[最小,最大,間隔], b:[…]}（乘法：a=每份、b=份數）／{n:[…], d:[…]}（除法：n=總數、d=除數）／
        exact:true 時用 {d:[…], q:[…]}，總數 = d×q（剛好整除）,
      sm:{…}（第 1 關用的小數字，有填才會出現在第 1 關）,
      u:'答案的單位', ru:'餘數的單位', ic:'小圖示', box:'box'|'kid'（第 1 關的容器）,
      extra:v=>[錯誤算式…]（題目裡多餘的數字）, ok:v=>true/false（數字不合理就重抽）, trap:'陷阱說明' } */
  function fill(str,v){
    return str.replace(/\{(\w+)\}/g,(_,k)=>typeof v[k]==='number'?`<b class="num">${v[k]}</b>`:v[k])
              .replace(/⟪/g,'<span class="kw">').replace(/⟫/g,'</span>');
  }
  const ex2=(a,o,b)=>`${a} ${o} ${b}`;
  function make(st,small){
    const rr=(small&&st.sm)||st.r||{};
    for(let k=0;k<80;k++){
      const v={who:pick(NAMES)};
      for(const key in rr)v[key]=R(...rr[key]);
      if(st.exact)v.n=v.d*v.q;
      if(st.calc)Object.assign(v,st.calc(v));
      if(st.op==='mul')v.ans=v.a*v.b;
      else if(st.op==='div'||st.op==='ceil'){v.q=Math.floor(v.n/v.d);v.r=v.n%v.d;v.ans=v.q+(st.op==='ceil'&&v.r?1:0);}
      if(st.op==='ceil'&&!v.r)continue;
      if(st.op==='div'&&!st.zeroQ&&v.q<1)continue;
      if(st.exact&&v.r)continue;
      if(st.ok&&!st.ok(v))continue;
      /* 第 1 關要真的排出東西：最多 5 盒、24 個 */
      if(small&&st.op!=='mul'&&(v.q>5||v.n>24))continue;
      const I=build(st,v,!!small);
      if(I.opts.length<(st.nOpts||4)||new Set(I.opts.map(o=>o.t)).size<I.opts.length)continue;
      return I;
    }
    throw new Error('題目數字產生失敗：'+st.id);
  }
  function build(st,v,small){
    const I={st,v,small,op:st.op,kind:st.kind,u:st.u,ru:st.ru||''};
    I.stem=fill(st.s,v);
    I.ask=st.q?fill(st.q,v):st.qq?fill(st.qq,v)+(st.rq?fill(st.rq,v):''):'';
    I.html=`${I.stem}<span class="ask">${I.ask}</span>`;
    if(st.res)I.res=st.res(v);
    else if(st.op==='mul'){I.expr=ex2(v.a,'×',v.b);I.res=`${v.a} × ${v.b} = ${v.ans}`;}
    else if(st.op==='div'||st.op==='ceil'){I.expr=ex2(v.n,'÷',v.d);I.res=`${v.n} ÷ ${v.d} = ${v.q}`+(v.r||st.rq||st.op==='ceil'?`…${v.r}`:'');}
    else I.res='';
    I.opts=st.opts?st.opts(v):defaultOpts(st,v);
    /* 對答案的格子 */
    if(st.fields)I.fields=st.fields(v);
    else if(st.op==='mul')I.fields=[{k:'ans',label:'答案',unit:st.u,v:v.ans}];
    else if(st.op==='div'&&st.rq)I.fields=[{k:'q',label:'商',unit:st.u,v:v.q},{k:'r',label:'餘數',unit:st.ru,v:v.r}];
    else if(st.op==='div'||st.op==='ceil')I.fields=[{k:'ans',label:'答案',unit:st.u,v:v.ans}];
    else I.fields=null;
    return I;
  }
  /* 錯誤選項：乘法 → 大÷小、加、減；除法 → 乘、對調、減、加；有多餘數字時優先放 */
  function defaultOpts(st,v){
    const right={t:'',ok:true};let cand;
    if(st.op==='mul'){
      right.t=ex2(v.a,'×',v.b);
      const [hi,lo]=v.a>=v.b?[v.a,v.b]:[v.b,v.a];
      cand=[{t:ex2(hi,'÷',lo),why:'op'},{t:ex2(v.a,'+',v.b),why:'add'},{t:ex2(hi,'−',lo),why:'sub'}];
    }else{
      right.t=ex2(v.n,'÷',v.d);
      cand=[{t:ex2(v.n,'×',v.d),why:'op'},{t:ex2(v.d,'÷',v.n),why:'swap'},{t:ex2(v.n,'−',v.d),why:'sub'},{t:ex2(v.n,'+',v.d),why:'add'}];
    }
    const ext=st.extra?st.extra(v).map(t=>({t,why:'extra'})):[];
    const seen=new Set([right.t]),out=[right];
    [...shuffle(ext),...shuffle(cand)].forEach(o=>{if(out.length<4&&!seen.has(o.t)){seen.add(o.t);out.push(o)}});
    return out;
  }
  /* 選錯時紅皮敏敏的提示（看選了哪一種錯的算式） */
  function whyTip(I,o){
    if(o.tip)return o.tip;
    const mul=I.op==='mul';
    return {
      op:mul?'題目是把好幾份「合起來」，要算一共有多少，不是分開喔！':'題目是把東西「分開」，看可以分成幾份、或每份有多少，不是合起來喔！',
      swap:'誰被分？要把「總數」寫在 ÷ 的前面。',
      add:'每一份都一樣多的時候，要用乘或除，不是加法喔！',
      sub:'題目不是問「少了多少」。想一想，是合起來還是分開？',
      extra:'這個數字跟問題有關係嗎？再讀一次最後的問題。'
    }[o.why]||'再讀一次題目，看看黃色的地方。';
  }
  /* 答對後的一句解釋 */
  function explain(I){
    const v=I.v,st=I.st;
    if(st.ex)return typeof st.ex==='function'?st.ex(v):st.ex;
    const pu=st.partU||'份',it=st.itemU||st.ru||st.u||'';
    return {
      group:pu==='倍'?`${v.a} ${st.u}的 ${v.b} 倍，合起來用乘法。`:`每一${pu} ${v.a} ${st.u}，有 ${v.b} ${pu}，合起來用乘法。`,
      array:`每一${pu} ${v.a} ${st.u}，有 ${v.b} ${pu}，合起來用乘法。`,
      pack:`每 ${v.d} ${it}一${st.partU||st.u}，看 ${v.n} 裡面有幾個 ${v.d}，用除法。`,
      share:`平分成 ${v.d} 份，看每一份有多少，用除法。`,
      ceil:`除完還剩 ${v.r} ${st.ru}，剩下的也要再 1 ${st.u}，所以是 ${v.q} + 1 = ${v.ans} ${st.u}。`
    }[I.kind]||'';
  }

  /* ---------- 題目卡（舞台上方） ---------- */
  function showProb(I,tag,given){
    const el=$('#probCard');
    el.className='prob';
    el.innerHTML=`<div class="prob-h"><span class="prob-tag">${tag||''}</span></div><p class="prob-t">${I.html}</p>${given?`<p class="given">${given}</p>`:''}`;
  }
  const hl=()=>{const p=$('#probCard');if(p)p.classList.add('hl')};
  function clearProb(text){const el=$('#probCard');el.className='prob idle';el.innerHTML=`<p class="prob-t">${text||''}</p>`;}

  /* ---------- 選項（算式或答案） ----------
     opts:[{t,ok,why,tip}]；選對 → onRight()；選錯 → 搖一下、變黃色、紅皮敏敏提示 */
  function choose(I,opts,onRight,{cls='exprs',prompt='選出正確的算式'}={}){
    const list=shuffle([...opts]);
    const box=document.createElement('div');
    box.className='qbox';
    box.innerHTML=`<p class="q-prompt">${prompt}</p><div class="answers ${cls}">${list.map((o,i)=>`<button class="ans" data-i="${i}">${o.t}</button>`).join('')}</div>`;
    controls.appendChild(box);
    let wrongs=0;
    box.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
      const o=list[+b.dataset.i];
      if(o.ok){sfx.good();b.classList.add('right');box.querySelectorAll('.ans').forEach(x=>x.disabled=true);onRight&&onRight(wrongs);}
      else{sfx.bad();wrongs++;b.classList.add('wrong');b.disabled=true;hl();tell('red',whyTip(I,o));}
    });
    return box;
  }

  /* ---------- 對答案：數字鍵盤 ----------
     fields:[{k,label,unit,v}]；done(result) result = 'right'|'shown'|'skip' */
  function calc(I,done,{skip=true,head='用紙筆算一算，再填答案'}={}){
    const F=I.fields;if(!F){done&&done('skip');return;}
    const val=F.map(()=>''),box=document.createElement('div');let at=0,tries=0,fin=false;
    box.className='calc';
    /* 高度要省：iPad 橫放時整個面板要放得進一個畫面 */
    const draw=()=>{
      box.innerHTML=`${fin?'':`<div class="calc-top"><p class="calc-h">${head}</p>${skip?'<button class="skip-btn" data-x="skip">跳過</button>':''}</div>`}
        <div class="flds">${F.map((f,i)=>`<button class="fld ${i===at&&!fin?'on':''} ${f.st||''}" data-f="${i}" ${fin?'disabled':''}><span class="fl">${f.label}</span><span class="fv">${val[i]||'&nbsp;'}</span><span class="fu">${f.unit||''}</span></button>`).join('')}</div>
        ${fin?'':`<div class="pad">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button class="key" data-n="${n}">${n}</button>`).join('')}<button class="key del" data-n="del" aria-label="刪除">⌫</button><button class="key show" data-x="show">看答案</button><button class="key go" data-n="go">對答案</button></div>`}`;
    };
    const finish=r=>{fin=true;draw();done&&done(r);};
    box.onclick=e=>{
      const b=e.target.closest('button');if(!b||fin)return;
      if(b.dataset.f!=null){at=+b.dataset.f;sfx.click();draw();return;}
      if(b.dataset.x==='skip'){finish('skip');return;}
      if(b.dataset.x==='show'){F.forEach((f,i)=>{val[i]=String(f.v);f.st='shown'});sfx.click();tell('blue',`答案是 ${ansText(I)}。${checkTip(I)}`);finish('shown');return;}
      const n=b.dataset.n;
      if(n==='del'){val[at]=val[at].slice(0,-1);sfx.click();draw();return;}
      if(n==='go'){
        const empty=val.findIndex(x=>x==='');
        if(empty>=0){at=empty;sfx.bad();draw();tell('red',`「${F[empty].label}」還沒有填喔！`);return;}
        const wrong=F.map((f,i)=>+val[i]!==f.v);
        if(!wrong.includes(true)){F.forEach(f=>f.st='good');sfx.good();tell('yellow',`算對了！${I.res}`);finish('right');return;}
        tries++;sfx.bad();F.forEach((f,i)=>f.st=wrong[i]?'bad':'good');at=wrong.indexOf(true);draw();
        tell('red',calcTip(I,val));
        return;
      }
      if(n!=null&&val[at].length<7){val[at]=(val[at]==='0'?'':val[at])+n;F[at].st='';sfx.pop();draw();}
    };
    draw();controls.appendChild(box);
  }
  const ansText=I=>I.fields.map(f=>`${f.label} ${f.v} ${f.unit||''}`).join('，');
  function checkTip(I){
    const v=I.v;
    if(I.op==='mul')return '';
    if(I.op==='div'||I.op==='ceil')return `驗算：${v.d} × ${v.q} + ${v.r} = ${v.n}。`;
    return '';
  }
  /* 算錯時的提示：乘法用估算，除法用驗算 */
  function calcTip(I,val){
    const v=I.v;
    const round=x=>{const p=Math.pow(10,String(x).length-1);return Math.round(x/p)*p};
    if(I.op==='mul'){const A=round(v.a),B=v.b<10?v.b:round(v.b);return `有一個數字不對。估估看：${v.a} 大約是 ${A}，${v.b} 大約是 ${B}，答案大約是 ${A*B}。再算一次！`;}
    if(I.op==='div'||I.op==='ceil'){
      const iq=I.fields.findIndex(f=>f.k==='q'),ir=I.fields.findIndex(f=>f.k==='r');
      if(ir>=0&&+val[ir]>=v.d)return `餘數一定要比除數 ${v.d} 小喔！商要再大一點。`;
      if(I.op==='ceil')return '先算出商和餘數。剩下的也要再 1 個，答案要想一想喔！';
      return `用驗算檢查：${v.d} × 商 + 餘數，要等於 ${v.n}。再算一次！`;
    }
    return '再算一次！';
  }

  /* ---------- 舞台：方格紙背景、小圖示 ---------- */
  function paper(){
    let g='';
    for(let x=0;x<=800;x+=25)g+=`<path d="M${x},0 V450" stroke="#D6E6F5" stroke-width="${x%100?1:1.8}"/>`;
    for(let y=0;y<=450;y+=25)g+=`<path d="M0,${y} H800" stroke="#D6E6F5" stroke-width="${y%100?1:1.8}"/>`;
    return `<rect width="800" height="450" fill="#FCFDFF"/>${g}`;
  }
  /* 小圖示：中心在 (0,0)，大約 30×30 */
  const ICONS={
    apple:'<circle r="13" fill="#E2483D"/><circle cx="-4" cy="-4" r="4" fill="#FF8A80" opacity=".8"/><path d="M0,-12 Q2,-18 6,-19" stroke="#6B3E12" stroke-width="2.4" fill="none"/><path d="M2,-15 C8,-20 14,-16 12,-12 C7,-11 4,-12 2,-15Z" fill="#5FAE49"/>',
    orange:'<circle r="13" fill="#F59E2A"/><circle cx="-4" cy="-4" r="4" fill="#FFD08A"/><circle cy="-12" r="2.4" fill="#5FAE49"/>',
    egg:'<ellipse rx="10" ry="13" fill="#FFF8EC" stroke="#C9B48E" stroke-width="2"/>',
    bun:'<path d="M-14,6 C-14,-14 14,-14 14,6Z" fill="#FFFFFF" stroke="#C9B48E" stroke-width="2"/><path d="M-14,6 H14" stroke="#C9B48E" stroke-width="2"/>',
    ball:'<circle r="12" fill="#3F86E6"/><path d="M-12,0 H12 M0,-12 C6,-6 6,6 0,12" stroke="#FFFFFF" stroke-width="2" fill="none"/>',
    candy:'<path d="M-16,-7 L-9,0 L-16,7Z M16,-7 L9,0 L16,7Z" fill="#F7A6CF"/><circle r="9" fill="#E2483D"/><path d="M-5,-6 L5,6" stroke="#FFFFFF" stroke-width="2.4"/>',
    bead:'<circle r="9" fill="#8A5CC9"/><circle r="3" fill="#EDE3FA"/>',
    coin:'<circle r="13" fill="#FFC93C" stroke="#D9A21F" stroke-width="2.5"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#8A6400" font-family="Fredoka,sans-serif">10</text>',
    pencil:'<g transform="rotate(-35)"><rect x="-4" y="-15" width="8" height="24" fill="#FFC93C" stroke="#A87600" stroke-width="1.5"/><path d="M-4,9 L4,9 L0,17Z" fill="#E9C98A"/><rect x="-4" y="-18" width="8" height="4" fill="#F7A6CF"/></g>',
    sheet:'<rect x="-11" y="-13" width="22" height="26" rx="2" fill="#FFFFFF" stroke="#7B9AB8" stroke-width="2"/><path d="M-6,-5 H6 M-6,1 H6 M-6,7 H3" stroke="#B9CCE0" stroke-width="2"/>',
    paper:'<rect x="-12" y="-12" width="24" height="24" fill="#7CCB4E" stroke="#3F8A2C" stroke-width="2" transform="rotate(8)"/>',
    book:'<rect x="-11" y="-14" width="22" height="28" rx="2" fill="#3F86E6"/><rect x="-7" y="-14" width="2" height="28" fill="#2156A8"/><rect x="-3" y="-8" width="10" height="4" fill="#FFFFFF"/>',
    bottle:'<rect x="-7" y="-10" width="14" height="24" rx="4" fill="#9FD3EA" stroke="#3F9CC8" stroke-width="2"/><rect x="-4" y="-16" width="8" height="7" fill="#3F9CC8"/>',
    cake:'<rect x="-13" y="-4" width="26" height="14" rx="2" fill="#FFE0DC" stroke="#E2483D" stroke-width="2"/><path d="M-13,-4 C-8,-10 8,-10 13,-4" fill="#FFFFFF" stroke="#E2483D" stroke-width="2"/><circle cy="-10" r="3.5" fill="#E2483D"/>',
    kid:'<circle cy="-8" r="7" fill="#FFD9B8" stroke="#A86B3C" stroke-width="1.6"/><path d="M-10,14 C-10,0 10,0 10,14Z" fill="#3F9CC8"/>',
    car:'<rect x="-16" y="-8" width="32" height="14" rx="4" fill="#FFC93C" stroke="#A87600" stroke-width="2"/><rect x="-11" y="-5" width="7" height="6" fill="#E2F5FD"/><rect x="-2" y="-5" width="7" height="6" fill="#E2F5FD"/><circle cx="-9" cy="8" r="3.5" fill="#1E2A45"/><circle cx="9" cy="8" r="3.5" fill="#1E2A45"/>',
    ribbon:'<path d="M-14,0 L-4,-8 L-4,8Z M14,0 L4,-8 L4,8Z" fill="#E2483D"/><circle r="4" fill="#B72A22"/>',
    weight:'<path d="M-12,12 L-8,-6 H8 L12,12Z" fill="#7C8594"/><circle cy="-9" r="4" fill="none" stroke="#7C8594" stroke-width="3"/>',
    drop:'<path d="M0,-14 C8,-2 11,4 11,7 A11,11 0 0 1 -11,7 C-11,4 -8,-2 0,-14Z" fill="#6FB8EE"/>',
    money:'<rect x="-15" y="-9" width="30" height="18" rx="2" fill="#B7E2B0" stroke="#3F8A2C" stroke-width="2"/><circle r="5" fill="none" stroke="#3F8A2C" stroke-width="2"/>'
  };
  const icon=(k,x,y,s=1,cls='')=>`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s})"><g class="${cls}">${ICONS[k]||ICONS.ball}</g></g>`;

  /* ---------- 線段圖（大數字用）：一份一份冒出來 ----------
     I.kind：group/array（乘）、pack（包含除）、share（等分除）、ceil（最少要幾個）。
     show：false = 答案用「?」，true = 顯示答案 */
  const TAPE_KINDS=['group','array','pack','share','ceil'];
  function tape(I,show){
    if(!TAPE_KINDS.includes(I.kind))return show&&I.res?`<text x="400" y="235" text-anchor="middle" class="tp-res seq">${I.res}</text>`:'';
    const v=I.v,X0=90,W=620,Y=200,H=48;
    const it=I.st.itemU||I.ru||I.u;      /* 每一小段的單位 */
    let s='',k=0;
    const seq=()=>`class="seq" style="animation-delay:${(k++*0.12).toFixed(2)}s"`;
    const lab=(x,y,t,cls='tp-l')=>`<text x="${x.toFixed(1)}" y="${y}" text-anchor="middle" class="${cls}">${t}</text>`;
    const braceTop=(x1,x2,y,t)=>`<g ${seq()}><path d="M${x1},${y} q0,-12 12,-12 H${(x1+x2)/2-10} l10,-10 l10,10 H${x2-12} q12,0 12,12" fill="none" stroke="#1E2A45" stroke-width="2.5"/>${lab((x1+x2)/2,y-30,t,'tp-b')}</g>`;
    const braceBot=(x1,x2,y,t)=>`<g ${seq()}><path d="M${x1},${y} q0,12 12,12 H${(x1+x2)/2-10} l10,10 l10,-10 H${x2-12} q12,0 12,-12" fill="none" stroke="#1E2A45" stroke-width="2.5"/>${lab((x1+x2)/2,y+50,t,'tp-b')}</g>`;
    /* 一排段落：count 段，太多時只畫 3 段 + …… + 1 段 */
    const segs=(x,w,count,label,fill)=>{
      let out='';const many=count>10;
      const shown=many?[0,1,2,'gap',count-1]:[...Array(count).keys()];
      const cw=many?w/5:w/count;
      shown.forEach((c,i)=>{
        const sx=x+i*cw;
        if(c==='gap'){out+=`<g ${seq()}>${lab(sx+cw/2,Y+H/2+8,'……','tp-gap')}</g>`;return;}
        out+=`<g ${seq()}><rect x="${(sx+2).toFixed(1)}" y="${Y}" width="${(cw-4).toFixed(1)}" height="${H}" rx="8" fill="${fill}" stroke="#1E2A45" stroke-width="2"/>${lab(sx+cw/2,Y+H/2+7,label,cw>70?'tp-in':'tp-in sm')}</g>`;
      });
      return out;
    };
    const ic=I.st.ic||'ball';
    if(I.kind==='group'||I.kind==='array'){
      s+=segs(X0,W,v.b,`${v.a}`,'#FFF3C4');
      s+=braceBot(X0,X0+W,Y+H+6,`${v.b} ${I.st.partU||'份'}`);
      s+=braceTop(X0,X0+W,Y-8,show?`一共 ${v.ans} ${I.u}`:`一共 ? ${I.u}`);
      s+=icon(ic,X0-40,Y+H/2,1.3);
    }else{
      /* 除法：整條是總數；右邊的灰色是剩下的 */
      const many=v.q>10,remW=v.r?(many?70:Math.max(36,W*v.r/v.n)):0;
      const segW=W-remW;
      if(I.kind==='share'){
        s+=segs(X0,segW,v.d,show?`${v.q}`:'?','#DDEBFF');
        s+=braceBot(X0,X0+segW,Y+H+6,`平分成 ${v.d} 份`);
      }else{
        s+=segs(X0,segW,Math.max(v.q,1),`${v.d}`,'#DFF3E3');
        s+=braceBot(X0,X0+segW,Y+H+6,show?`${v.q} ${I.st.partU||I.u}`:`? ${I.st.partU||I.u}`);
      }
      if(v.r){
        const rx=X0+segW;
        s+=`<g ${seq()}><rect x="${rx+2}" y="${Y}" width="${remW-4}" height="${H}" rx="8" fill="${I.kind==='ceil'?'#FFE0DC':'#EEF0F6'}" stroke="#1E2A45" stroke-width="2" stroke-dasharray="6 4"/>${lab(rx+remW/2,Y+H/2+7,show?`${v.r}`:'?','tp-in sm')}</g>`;
        s+=`<g ${seq()}>${lab(rx+remW/2,Y+H+34,'剩下','tp-s')}</g>`;
        if(I.kind==='ceil'&&show)s+=`<g ${seq()}>${lab(rx+remW/2,Y-60,'還要 1 個！','tp-warn')}</g>`;
      }
      s+=braceTop(X0,X0+W,Y-8,`總數 ${v.n} ${it}`);
      s+=icon(ic,X0-40,Y+H/2,1.3);
    }
    if(show)s+=`<g ${seq()}>${lab(400,420,I.res+(I.kind==='ceil'?` → ${v.ans} ${I.u}`:''),'tp-res')}</g>`;
    return `<g class="tape">${s}</g>`;
  }
  /* 舞台：出題前（大問號＋圖示） */
  function stageAsk(I,who='ice',hint='讀一讀題目，想一想要用哪一種算法'){
    const ic=I.st.ic||'ball';
    stage.innerHTML=`${paper()}<g transform="translate(400,190)"><circle r="92" fill="#FFF3C4" stroke="#FFC93C" stroke-width="5"/><text y="40" text-anchor="middle" class="qmark">?</text></g>
      ${[[-170,-40],[170,-30],[-140,70],[150,80]].map(([x,y],i)=>icon(ic,400+x,190+y,1.6,'bobi')).join('')}
      <text x="400" y="340" text-anchor="middle" class="stage-hint">${hint}</text>
      ${pikAt(who,720,440,.55)}`;
  }
  function stageTape(I,show,who='yellow'){
    stage.innerHTML=`${paper()}${tape(I,show)}${pikAt(who,740,446,.46)}`;
  }

  /* ---------- 第 1 關：小數字，用真的東西排給你看 ---------- */
  function objects(I,onEnd){
    const v=I.v,ic=I.st.ic||'ball',SC0=SC;
    const boxSVG=(x,y,w,h,kid)=>kid?`<g transform="translate(${x},${y})"><ellipse cx="0" cy="${h/2+6}" rx="${w/2}" ry="10" fill="#E9D3AE"/><g transform="translate(0,${h/2+40}) scale(2.2)">${ICONS.kid}</g></g>`
      :`<g transform="translate(${x},${y})"><rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="10" fill="#F3E3C3" stroke="#A35A12" stroke-width="3"/><path d="M${-w/2},${-h/2} l10,-12 h${w-20} l10,12" fill="#E8C9A6" stroke="#A35A12" stroke-width="3" stroke-linejoin="round"/></g>`;
    let html=paper(),items=[];
    const kid=I.st.box==='kid';
    /* 每個容器裡的位置：最多 3 欄 */
    const slot=(cx,cy,j,cols=3)=>({x:cx+((j%cols)-(cols-1)/2)*30,y:cy-26+Math.floor(j/cols)*30});
    if(I.kind==='group'||I.kind==='array'){
      const n=v.b,w=Math.min(130,640/n-16);
      const cx=i=>400+(i-(n-1)/2)*(w+16);
      for(let i=0;i<n;i++)html+=boxSVG(cx(i),230,w,120,false);
      for(let i=0;i<n;i++)for(let j=0;j<v.a;j++){const p=slot(cx(i),230,j);items.push({to:p,from:{x:p.x,y:-30}});}
      html+=`<text id="objCount" x="400" y="380" text-anchor="middle" class="obj-n"></text>`;
    }else{
      const n=I.kind==='share'?v.d:v.q+(v.r?1:0);
      const w=Math.min(120,560/Math.max(n,1)-14);
      const cx=i=>220+(i+.5)*(560/Math.max(n,1));
      /* 左邊一堆 */
      const pile=j=>({x:70+(j%3)*34,y:110+Math.floor(j/3)*32});
      html+=`<rect x="40" y="80" width="128" height="${Math.ceil(v.n/3)*32+20}" rx="14" fill="#FFFFFF" stroke="#CDE2C1" stroke-width="3"/>`;
      const boxes=I.kind==='share'?v.d:v.q;
      for(let i=0;i<boxes;i++)html+=boxSVG(cx(i),230,w,120,kid);
      /* 誰放到哪裡 */
      for(let j=0;j<v.n;j++){
        let to=null;
        if(I.kind==='share'){if(j<v.q*v.d){const b=j%v.d,k=Math.floor(j/v.d);to=slot(cx(b),230,k,w>90?3:2);}}
        else{const b=Math.floor(j/v.d);if(b<v.q)to=slot(cx(b),230,j%v.d,w>90?3:2);}
        items.push({from:pile(j),to:to||pile(j),stay:!to});
      }
      html+=`<text id="objCount" x="480" y="410" text-anchor="middle" class="obj-n"></text>`;
    }
    html+=`<g id="objL">${items.map((p,i)=>`<g id="ob${i}" transform="translate(${p.from.x},${p.from.y})">${ICONS[ic]}</g>`).join('')}</g>`;
    stage.innerHTML=html;
    /* 一個一個飛過去 */
    const moving=items.map((p,i)=>i).filter(i=>!items[i].stay);
    let k=0;
    const step=()=>{
      if(SC!==SC0)return;
      if(k>=moving.length){
        const L=items.filter(p=>p.stay);L.forEach((p,i)=>{const g=$('#ob'+items.indexOf(p));if(g)g.classList.add('left-over')});
        if(L.length)stage.insertAdjacentHTML('beforeend',`<text x="104" y="64" text-anchor="middle" class="lbl seq">剩下 ${L.length} ${I.ru}</text>`);
        $('#objCount').textContent=resultLine(I);
        onEnd&&onEnd();return;
      }
      const i=moving[k++],p=items[i],g=$('#ob'+i);
      sfx.pop();
      anim(reduceMotion?0:(moving.length>12?170:240),f=>g.setAttribute('transform',`translate(${(p.from.x+(p.to.x-p.from.x)*f).toFixed(1)},${(p.from.y+(p.to.y-p.from.y)*f).toFixed(1)})`),()=>later(step,reduceMotion?0:40));
    };
    later(step,400);
  }
  function resultLine(I){
    const v=I.v;
    if(I.op==='mul')return `${v.a} × ${v.b} = ${v.ans}，一共 ${v.ans} ${I.u}`;
    if(I.kind==='share')return `${v.n} ÷ ${v.d} = ${v.q}…${v.r}，每份 ${v.q} ${I.ru||I.u}${v.r?`，剩 ${v.r} ${I.ru}`:''}`;
    return `${v.n} ÷ ${v.d} = ${v.q}…${v.r}，${v.q} ${I.u}${v.r?`，剩 ${v.r} ${I.ru}`:''}`;
  }

  /* ---------- 動畫小工具（換關卡會停止） ---------- */
  let SC=0;
  const _goTo=goTo;
  goTo=function(i){SC++;_goTo(i)};
  function anim(dur,step,fin){
    const my=SC;
    if(reduceMotion||dur<=0){step(1);fin&&fin();return}
    const t0=performance.now();
    const f=n=>{if(my!==SC)return;const p=Math.min(1,(n-t0)/dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;step(e);if(p<1)requestAnimationFrame(f);else fin&&fin()};
    requestAnimationFrame(f);
  }

  /* ---------- 面板小工具 ---------- */
  function btn(html,cls,on){const b=document.createElement('button');b.className=cls;b.innerHTML=html;b.onclick=on;controls.appendChild(b);return b}
  /* 選對後把選項收起來，只留一行「✓ 算式」 */
  function collapse(box,text){box.outerHTML=`<p class="picked"><span class="ok-dot"></span>${text}</p>`;}

  return {R,NAMES,draw,make,fill,showProb,clearProb,hl,choose,calc,explain,tape,stageAsk,stageTape,objects,resultLine,paper,icon,ICONS,anim,btn,collapse,whyTip,get SC(){return SC}};
})();
