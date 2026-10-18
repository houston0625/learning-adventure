/* 皮皮學習樂園：練習引擎（題庫隨機出題、11 種題型、答錯就翻課本）。
   載入順序：pikmin.js → core.js → drill.js → 這個單元的題庫（例如 sci2.js）。樣式：core.css + drill.css。
   原則（自然第 2 單元起，使用者 2026-10-18 決定）：說明少、練習多；每次打開題目都隨機；
   答錯不給答案，紅皮敏敏說「翻到課本第 N 頁，＋一句方向」；題目不自動朗讀，按喇叭才念。

   題目格式（一題一個物件）：
     共同：id、k（題型）、q（題目）、p（課本頁碼，例如 '44' 或 '44～45'）、tip（答錯時的方向）、ex（測驗解說，可省略）
     one  單選      o:[正確, 錯, 錯…]
     pic  看圖選    o 同上，art:'圖的名字'（DRILL.ART 裡的函式）
     fill 填空      o 同上，q 裡用（　）表示空格
     odd  找不同    o 同上（o[0] 是不一樣的那一個）
     tf   是非      a:true/false
     multi 複選     o:[正確…]，x:[錯…]
     order 排序     o:[照順序]
     match 配對     pairs:[[左,右]…]
     sort  分類     item:'名稱'，b:'正確的籃子'，bs:[所有籃子]
     tap   點圖     fig:'圖的名字'，part:'部位代號'，name:'部位名稱'
     place 放位置   fig:'圖的名字'，item:'植物代號'，name:'植物名稱'，zone:'區域代號' */

const DRILL=(()=>{
  const KIND={one:'單選',pic:'看圖選',fill:'填空',odd:'找不同',tf:'是非',multi:'複選',order:'排序',match:'配對',sort:'分類',tap:'點圖',place:'放位置'};
  const HOW={one:'選一個答案',pic:'看圖，選一個答案',fill:'選出空格裡的詞',odd:'找出不一樣的那一個',tf:'這句話對不對？',multi:'選出所有對的，再按「好了」',order:'依照順序一個一個點',match:'先點上面的名字，再點下面的說明',sort:'放進正確的籃子（點下面或舞台上的籃子）',tap:'點舞台上的圖',place:'點水池裡的位置'};
  const ART={},FIG={};          /* 單元自己的圖：ART 看圖題（約 300×200，中心 0,0）；FIG 點圖、放位置用的整個舞台 */
  let BG=()=>'<rect width="800" height="450" fill="#CBEAFF"/>';

  /* ---------- 小工具 ---------- */
  const ICON_BOOK='<path d="M2 5.5C5 4.2 8 4.4 11 6.4V19C8 17.2 5 17 2 18.2Z" fill="#FFE2B8" stroke="#A35A12" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 5.5C17 4.2 14 4.4 11 6.4V19C14 17.2 17 17 20 18.2Z" fill="#FFF6E6" stroke="#A35A12" stroke-width="1.8" stroke-linejoin="round"/>';
  const tw=(s,px)=>[...String(s)].reduce((w,c)=>w+(c.charCodeAt(0)>255?px:px*.58),0);
  const NOHEAD='，。、？！；：）」』》…';
  /* 依寬度把一句話切成好幾行（標點不放在行首） */
  function wrap(text,maxW,px){
    const out=[];let line='',w=0;
    for(const c of [...String(text)]){
      const cw=tw(c,px);
      if(w+cw>maxW&&line){
        if(NOHEAD.includes(c)){line+=c;out.push(line);line='';w=0;continue}
        out.push(line);line='';w=0;
      }
      line+=c;w+=cw;
    }
    if(line)out.push(line);
    return out;
  }
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function textBlock(text,x,y,maxW,px,cls='dq-t',anchor='middle',lh=1.35){
    const L=wrap(text,maxW,px);
    return {h:L.length*px*lh,svg:`<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}" style="font-size:${px}px">${L.map((l,i)=>`<tspan x="${x}" dy="${i?px*lh:px}">${esc(l)}</tspan>`).join('')}</text>`};
  }
  function bookPill(pages,x=12,y=12){
    const t=`課本 p.${pages}`,w=Math.round(tw(t,16)+50);
    return `<g transform="translate(${x},${y})"><rect width="${w}" height="38" rx="19" fill="#FFFFFF" fill-opacity=".95" stroke="#E8B77A" stroke-width="2"/><g transform="translate(11,7)">${ICON_BOOK}</g><text x="38" y="25" class="dq-pill">${t}</text></g>`;
  }
  function progPill(t){
    if(!t)return '';
    const w=Math.round(tw(t,18)+30);
    return `<g transform="translate(${788-w},12)"><rect width="${w}" height="38" rx="19" fill="#FFFFFF" fill-opacity=".95" stroke="#9FD3EA" stroke-width="2"/><text x="${w/2}" y="26" text-anchor="middle" class="dq-prog">${esc(t)}</text></g>`;
  }
  const bookTip=(p,tip)=>`翻到課本第 ${p} 頁，${tip}。`;
  const CHEER=['答對了！','好厲害！','沒錯！','答對了，很棒！','完全正確！'];
  const CREWS=['yellow','blue','purple','white','rock','wing','ice'];
  function cheer(ex){const t=pick(CHEER)+(ex?' '+ex:'');const w=pick(CREWS);setDialog(w,t);say(t);}
  function wrongSay(it,extra){const t=(extra?extra+' ':'')+bookTip(it.p,it.tip);setDialog('red',t);say(t);}

  /* ---------- 不重複抽題（同一次打開網頁） ---------- */
  const seen=new Set();
  function draw(pool,n){
    let fresh=pool.filter(q=>!seen.has(q.id));
    if(fresh.length<n){pool.forEach(q=>seen.delete(q.id));fresh=pool.slice();}
    /* 題型輪流抽，同一批題目的題型盡量不一樣 */
    const by={};shuffle(fresh.slice()).forEach(q=>(by[q.k]=by[q.k]||[]).push(q));
    const kinds=shuffle(Object.keys(by)),out=[];
    for(let r=0;out.length<n;r++){const k=kinds[r%kinds.length];if(by[k].length)out.push(by[k].pop());if(!kinds.some(x=>by[x].length))break;}
    out.forEach(q=>seen.add(q.id));
    return shuffle(out);
  }

  /* ---------- 舞台：題目板 ---------- */
  function board(it,{pill,prog,artSvg,body}={}){
    let s=BG()+`<rect x="24" y="60" width="752" height="374" rx="26" class="dq-board"/>`;
    let y=84;
    const big=!artSvg&&!body;
    const tb=textBlock(it.q+(it.k==='multi'?'（複選）':''),400,y,big?640:700,big?36:28);
    if(big){const ty=60+(374-tb.h)/2-10;s+=textBlock(it.q+(it.k==='multi'?'（複選）':''),400,ty,640,36).svg;}
    else s+=tb.svg;
    y+=tb.h+10;
    if(artSvg){
      const bh=420-y,sc=Math.min(bh/210,700/310,1.5);
      s+=`<g transform="translate(400,${(y+bh/2).toFixed(1)}) scale(${sc.toFixed(3)})">${artSvg}</g>`;
    }
    if(body)s+=body(y);
    s+=bookPill(pill||it.p)+progPill(prog);
    return s;
  }
  /* 點圖、放位置：整個舞台是圖，上面一條題目 */
  function banner(text){
    const L=wrap(text,640,24),w=Math.min(720,Math.max(...L.map(l=>tw(l,24)))+48),h=L.length*32+20;
    return `<g transform="translate(${400-w/2},58)"><rect width="${w}" height="${h}" rx="20" fill="#FFFFFF" fill-opacity=".95" stroke="#9FD3EA" stroke-width="3"/>${L.map((l,i)=>`<text x="${w/2}" y="${40+i*32}" text-anchor="middle" class="dq-t" style="font-size:24px">${esc(l)}</text>`).join('')}</g>`;
  }

  /* ---------- 面板 ---------- */
  function panelHead(it){
    return `<div class="dq-head"><span class="dq-kind">${KIND[it.k]}</span><span class="dq-how">${HOW[it.k]}</span><button class="icon-btn dq-say" aria-label="聽題目">${ICON_SPK}</button></div>`;
  }
  function sayText(it,opts){
    let t=it.q;
    if(it.k==='tf')t+='。對，還是不對？';
    else if(opts&&opts.length)t+='。'+opts.join('，');
    return t.replace(/（　）/g,'，空格，');
  }

  /* ---------- 出一題 ----------
     o.onRight(firstTry) 答對後呼叫；o.prog 右上角進度；o.state 同一關共用的狀態（分類的籃子） */
  let current=null;
  function ask(it,o={}){
    current=it;
    let first=true;
    const st=o.state||{};
    controls.innerHTML='';
    const box=document.createElement('div');box.className='controls qbox dq';
    controls.appendChild(box);
    stage.onclick=null;
    const finish=(extra)=>{
      box.querySelectorAll('button:not(.dq-say)').forEach(b=>b.disabled=true);
      stage.onclick=null;
      sfx.good();
      cheer(extra||'');
      o.onRight&&o.onRight(first);
    };
    const miss=(btn,extra)=>{first=false;sfx.bad();if(btn){btn.classList.add('wrong');restart(btn,'wrong');}wrongSay(it,extra);};
    let opts=null;
    const bindSay=()=>{box.querySelector('.dq-say').onclick=()=>{unlockAudio();say(sayText(it,opts))}};

    if(['one','pic','fill','odd'].includes(it.k)){
      opts=shuffle(it.o.slice());
      stage.innerHTML=board(it,{prog:o.prog,artSvg:it.art&&ART[it.art]?ART[it.art]():''});
      box.innerHTML=panelHead(it)+`<div class="answers stack">${opts.map(t=>`<button class="ans" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      box.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
        if(b.dataset.t===it.o[0]){b.classList.add('right');finish();}
        else{b.disabled=true;miss(b);}
      });
    }
    else if(it.k==='tf'){
      stage.innerHTML=board(it,{prog:o.prog});
      box.innerHTML=panelHead(it)+`<div class="answers two dq-tf"><button class="ans" data-v="1"><span class="dq-o">○</span>對</button><button class="ans" data-v="0"><span class="dq-x">✕</span>不對</button></div>`;
      box.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
        if((b.dataset.v==='1')===it.a){b.classList.add('right');finish(it.ex);}
        else{b.disabled=true;miss(b);}
      });
    }
    else if(it.k==='multi'){
      opts=shuffle(it.o.concat(it.x));
      stage.innerHTML=board(it,{prog:o.prog});
      box.innerHTML=panelHead(it)+`<div class="answers two">${opts.map(t=>`<button class="ans tog" data-t="${esc(t)}"><span class="dq-box"></span>${esc(t)}</button>`).join('')}</div><button class="primary-btn wide dq-ok">好了</button>`;
      box.querySelectorAll('.tog').forEach(b=>b.onclick=()=>{b.classList.toggle('on');sfx.pop();});
      box.querySelector('.dq-ok').onclick=()=>{
        const on=[...box.querySelectorAll('.tog.on')];
        const bad=on.filter(b=>!it.o.includes(b.dataset.t));
        const lack=it.o.length-on.filter(b=>it.o.includes(b.dataset.t)).length;
        if(!bad.length&&!lack){on.forEach(b=>b.classList.add('right'));finish();return;}
        bad.forEach(b=>{b.classList.remove('on');b.classList.add('wrong');restart(b,'wrong');b.disabled=true;});
        miss(null,bad.length?`有 ${bad.length} 個選錯了。`:`還少了 ${lack} 個。`);
      };
    }
    else if(it.k==='order'){
      const got=[];
      const drawO=()=>{stage.innerHTML=board(it,{prog:o.prog,body:y=>{
        let s='',yy=y+4;
        it.o.forEach((t,i)=>{
          const tb=textBlock(got[i]?t:'？',112,yy+4,600,22,'dq-t','start');
          const hh=Math.max(48,tb.h+18);
          s+=`<rect x="56" y="${yy}" width="688" height="${hh}" rx="16" fill="${got[i]?'#DFF3E3':'#F4F7FB'}" stroke="${got[i]?'#2F9E44':'#C9D6E6'}" stroke-width="2" ${got[i]?'':'stroke-dasharray="7 5"'}/><circle cx="84" cy="${yy+hh/2}" r="16" fill="${got[i]?'#2F9E44':'#C9D6E6'}"/><text x="84" y="${yy+hh/2+6}" text-anchor="middle" class="dq-n">${i+1}</text>`;
          s+=textBlock(got[i]?t:'？',112,yy+(hh-tb.h)/2-2,600,22,'dq-t','start').svg;
          yy+=hh+8;
        });
        return s;}});};
      drawO();
      opts=shuffle(it.o.slice());
      box.innerHTML=panelHead(it)+`<div class="answers stack">${opts.map(t=>`<button class="ans dq-left" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      box.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
        if(b.dataset.t===it.o[got.length]){got.push(b.dataset.t);b.disabled=true;b.classList.add('right');b.insertAdjacentHTML('afterbegin',`<span class="dq-badge">${got.length}</span>`);drawO();
          if(got.length===it.o.length)finish();else sfx.click();}
        else{miss(b,`第 ${got.length+1} 步不是這個。`);}
      });
    }
    else if(it.k==='match'){
      const pairs=it.pairs.slice(0,4),got=[];
      let sel=null;
      const drawM=()=>{stage.innerHTML=board(it,{prog:o.prog,body:y=>{
        let s='',yy=y+2;const hEach=Math.min(78,(420-y)/pairs.length-6);
        pairs.forEach(([l,r])=>{
          const ok=got.includes(l);
          s+=`<rect x="44" y="${yy}" width="190" height="${hEach}" rx="16" fill="${ok?'#DFF3E3':'#FFF3C4'}" stroke="${ok?'#2F9E44':'#E6C55A'}" stroke-width="2"/>`;
          s+=textBlock(l,139,yy+(hEach-wrap(l,170,20).length*27)/2-2,170,20).svg;
          s+=`<path d="M240,${yy+hEach/2} H272" stroke="${ok?'#2F9E44':'#C9D6E6'}" stroke-width="4" stroke-dasharray="${ok?'0':'6 5'}"/>`;
          s+=`<rect x="276" y="${yy}" width="480" height="${hEach}" rx="16" fill="${ok?'#FFFFFF':'#F4F7FB'}" stroke="${ok?'#2F9E44':'#C9D6E6'}" stroke-width="2"/>`;
          if(ok){const L=wrap(r,450,18).slice(0,3);s+=`<text class="dq-t" style="font-size:18px">${L.map((l,i)=>`<tspan x="292" y="${yy+(hEach-L.length*24)/2+18+i*24}">${esc(l)}</tspan>`).join('')}</text>`;}
          else s+=`<text x="516" y="${yy+hEach/2+8}" text-anchor="middle" class="dq-t" style="font-size:22px;fill:#9AA6B8">？</text>`;
          yy+=hEach+6;
        });
        return s;}});};
      drawM();
      const L=shuffle(pairs.map(p=>p[0])),R=shuffle(pairs.map(p=>p[1]));
      box.innerHTML=panelHead(it)+`<div class="dq-chips">${L.map(t=>`<button class="dq-chip" data-l="${esc(t)}">${esc(t)}</button>`).join('')}</div><div class="answers stack">${R.map(t=>`<button class="ans dq-left dq-r" data-r="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      const chips=[...box.querySelectorAll('.dq-chip')];
      chips.forEach(c=>c.onclick=()=>{sel=c.dataset.l;chips.forEach(x=>x.classList.toggle('on',x===c));sfx.click();});
      box.querySelectorAll('.dq-r').forEach(b=>b.onclick=()=>{
        if(!sel){setDialog('ice','先點上面的名字，再點說明。');say('先點上面的名字，再點說明。');restart(box.querySelector('.dq-chips'),'flash');return;}
        const pr=pairs.find(p=>p[0]===sel);
        if(pr[1]===b.dataset.r){
          got.push(sel);b.classList.add('right');b.disabled=true;
          const c=chips.find(x=>x.dataset.l===sel);c.classList.remove('on');c.classList.add('right');c.disabled=true;sel=null;drawM();
          if(got.length===pairs.length)finish();else{sfx.good();}
        }else miss(b);
      });
    }
    else if(it.k==='sort'){
      st.sorted=st.sorted||[];
      const bs=it.bs,n=bs.length,bw=Math.min(170,(712-(n-1)*14)/n),x0=400-(n*bw+(n-1)*14)/2;
      const drawS=(hi)=>{stage.innerHTML=board(it,{prog:o.prog,body:y=>{
        let s=`<g transform="translate(400,${y+34})"><rect x="${-tw(it.item,30)/2-34}" y="-30" width="${tw(it.item,30)+68}" height="60" rx="30" fill="#FFF3C4" stroke="#E6C55A" stroke-width="3" class="${hi?'':'pop'}"/><text y="11" text-anchor="middle" class="dq-t" style="font-size:30px">${esc(it.item)}</text></g>`;
        const top=y+86;
        bs.forEach((b,i)=>{
          const x=x0+i*(bw+14),items=st.sorted.filter(z=>z.b===b).map(z=>z.item);
          s+=`<g class="hit dq-bin" data-b="${esc(b)}"><path d="M${x},${top+34} L${x+bw},${top+34} L${x+bw-12},420 L${x+12},420Z" fill="${hi===b?'#DFF3E3':'#FFE8C2'}" stroke="#C08A50" stroke-width="3" stroke-linejoin="round"/><rect x="${x-4}" y="${top}" width="${bw+8}" height="38" rx="12" fill="#C08A50"/><text x="${x+bw/2}" y="${top+26}" text-anchor="middle" class="dq-bin-t" style="font-size:${Math.min(20,bw/(b.length+.5))}px">${esc(b)}</text>`;
          items.slice(-4).forEach((t,j)=>{s+=`<text x="${x+bw/2}" y="${top+70+j*28}" text-anchor="middle" class="dq-t" style="font-size:${Math.min(22,(bw-16)/t.length)}px">${esc(t)}</text>`;});
          s+=`</g>`;
        });
        return s;}});};
      drawS();
      opts=bs;
      box.innerHTML=panelHead(it)+`<div class="answers ${n>2?'two':'two'}">${bs.map(b=>`<button class="ans" data-b="${esc(b)}">${esc(b)}</button>`).join('')}</div>`;
      const pickB=(b,btn)=>{
        if(b===it.b){st.sorted.push({item:it.item,b});drawS(b);if(btn)btn.classList.add('right');finish();}
        else{if(btn)btn.disabled=true;miss(btn);}
      };
      box.querySelectorAll('.ans').forEach(btn=>btn.onclick=()=>pickB(btn.dataset.b,btn));
      stage.onclick=e=>{const g=e.target.closest('.dq-bin');if(!g)return;const b=g.dataset.b;pickB(b,box.querySelector(`.ans[data-b="${CSS.escape(b)}"]`));};
    }
    else if(it.k==='tap'){
      const fig=FIG[it.fig];
      stage.innerHTML=BG()+fig.svg()+banner(it.q)+bookPill(it.p)+progPill(o.prog);
      box.innerHTML=panelHead(it)+`<p class="dq-big">${esc(it.q)}</p>`;
      stage.onclick=e=>{
        const g=e.target.closest('.hs');if(!g)return;
        if(g.dataset.part===it.part){g.classList.add('hs-ok');finish();}
        else{g.classList.add('hs-bad');setTimeout(()=>g.classList.remove('hs-bad'),700);miss(null);}
      };
    }
    else if(it.k==='place'){
      const fig=FIG[it.fig];st.placed=st.placed||[];
      const drawP=()=>{stage.innerHTML=BG()+fig.svg(st.placed)+banner(it.q)+bookPill(it.p)+progPill(o.prog);};
      drawP();
      box.innerHTML=panelHead(it)+`<div class="dq-hold"><svg viewBox="-80 -90 160 180" aria-hidden="true">${fig.item(it.item)}</svg><b>${esc(it.name)}</b></div>`;
      stage.onclick=e=>{
        const g=e.target.closest('.zone');if(!g)return;
        if(g.dataset.zone===it.zone){st.placed=st.placed.filter(z=>z.zone!==it.zone);st.placed.push({zone:it.zone,item:it.item});drawP();finish();}
        else{g.classList.add('hs-bad');setTimeout(()=>g.classList.remove('hs-bad'),700);miss(null);}
      };
    }
    bindSay();
  }

  /* ---------- 一關：從題庫抽 n 題，一題一題做 ---------- */
  function setProg(text,p){
    taskEl.className='task'+(done[cur]?' done':'');
    taskEl.innerHTML=`<b>${done[cur]?'完成':'任務'}</b><span>${text}</span>${p?`<em>${p}</em>`:''}`;
  }
  function level(cfg){
    const qs=draw(cfg.items,Math.min(cfg.n||6,cfg.items.length));
    const st={};let i=0,ok=0;
    const task=cfg.task||'答對每一題';
    const step=()=>{
      setProg(task,`${i}/${qs.length}`);
      ask(qs[i],{prog:`${i+1} / ${qs.length}`,state:st,onRight:first=>{
        if(first)ok++;
        i++;
        setProg(task,`${i}/${qs.length}`);
        const last=i>=qs.length;
        const b=document.createElement('button');b.className='more wide dq-next';b.innerHTML=(last?'完成這一關':'下一題')+ICON_NEXT;
        b.onclick=()=>{unlockAudio();if(last)end();else step();};
        controls.appendChild(b);
        b.scrollIntoView({block:'nearest',behavior:'smooth'});
      }});
    };
    const end=()=>{
      stage.innerHTML=BG()+`<rect x="150" y="70" width="500" height="250" rx="30" class="dq-board"/><text x="400" y="150" text-anchor="middle" class="dq-t" style="font-size:32px">這一關完成了！</text><text x="400" y="220" text-anchor="middle" class="dq-big-n">${ok} / ${qs.length}</text><text x="400" y="270" text-anchor="middle" class="dq-t" style="font-size:20px;fill:#56627C">第一次就答對的題數</text>`+crewRow(120,680,446,.4)+bookPill(cfg.p);
      controls.innerHTML='';
      const again=document.createElement('button');again.className='ghost-btn wide';again.innerHTML=ICON_CCW+'換一批題目，再練一次';
      again.onclick=()=>{unlockAudio();goTo(cur);};
      controls.appendChild(again);
      if(cfg.notes){const nb=document.createElement('button');nb.className='ghost-btn wide';nb.innerHTML=ICON_SPK+'打開重點整理';nb.onclick=openNotes;controls.appendChild(nb);}
      taskDone(cfg.doneText||'完成了！按「下一步」繼續。');
      cfg.onDone&&cfg.onDone(ok,qs.length);
    };
    if(cfg.intro){const t=cfg.intro;setDialog(cfg.who||'ice',t);say(t);}
    step();
  }

  /* ---------- 小測驗：把題目換成 core.js 測驗的格式 ---------- */
  function figMini(it){
    const f=FIG[it.fig];
    return f&&f.mini?`<div class="qpic dq-qpic"><svg viewBox="${f.mini.vb}" aria-hidden="true">${f.mini.svg(it.part)}</svg></div>`:'';
  }
  function toQuiz(it){
    const ex=it.ex||`${it.tip}。`,page=it.p;
    const base={ex,page};
    const pic=it.art&&ART[it.art]?`<div class="qpic dq-qpic"><svg viewBox="-160 -105 320 210" aria-hidden="true">${ART[it.art]()}</svg></div>`:'';
    switch(it.k){
      case 'one':case 'pic':case 'fill':case 'odd':return {...base,type:'single',q:it.q,opts:it.o.slice(),a:0,pic};
      case 'tf':return {...base,type:'tf',q:it.q,a:it.a};
      case 'multi':{const opts=it.o.concat(it.x);return {...base,type:'multi',q:it.q,opts,a:it.o.map((_,i)=>i)};}
      case 'order':{const tiles={},right=[];it.o.forEach((t,i)=>{const k='s'+i;tiles[k]={h:esc(t),t};right.push(k)});return {...base,type:'order',q:it.q,text:true,cols:1,tiles,right};}
      case 'match':{const pr=pick(it.pairs),others=shuffle(it.pairs.filter(p=>p!==pr).map(p=>p[1])).slice(0,3);return {...base,type:'single',q:`${it.q}：「${pr[0]}」配哪一個？`,opts:[pr[1],...others],a:0};}
      case 'sort':return {...base,type:'single',q:it.q,opts:[it.b,...it.bs.filter(b=>b!==it.b)],a:0};
      case 'tap':{const f=FIG[it.fig],others=shuffle(f.parts.filter(p=>p.k!==it.part).map(p=>p.n)).slice(0,3);return {...base,type:'single',q:f.quizQ||'圖中圈起來的是哪一個部位？',opts:[it.name,...others],a:0,pic:figMini(it)};}
      case 'place':{const f=FIG[it.fig],z=f.zones.find(z=>z.k===it.zone),others=f.zones.filter(x=>x.k!==it.zone).map(x=>x.d);return {...base,type:'single',q:`${it.name}長在水池的哪裡？`,opts:[z.d,...others],a:0};}
    }
  }
  /* 從每一關輪流抽，湊滿 n 題 */
  function quiz(groups,n=10){
    const pools=shuffle(groups.map(g=>shuffle(g.slice())));
    const out=[];let k=0;
    while(out.length<n&&pools.some(p=>p.length)){const p=pools[k%pools.length];if(p.length)out.push(p.pop());k++;}
    return shuffle(out).map(toQuiz);
  }

  /* ---------- 練習場：選範圍 → 一輪 n 題 → 看成績、錯的再練 ---------- */
  function practice({sets,n=15,title='練習場',bgArt}){
    let range=null,round=[],i=0,first=[],wrongs=[];
    const crew=()=>crewRow(120,680,446,.42);
    const startScreen=()=>{
      stage.onclick=null;
      stage.innerHTML=(bgArt||BG)()+`<rect x="120" y="80" width="560" height="200" rx="30" class="dq-board"/><text x="400" y="160" text-anchor="middle" class="dq-t" style="font-size:40px">${esc(title)}</text><text x="400" y="220" text-anchor="middle" class="dq-t" style="font-size:22px;fill:#56627C">每一輪 ${n} 題，題目每次都不一樣</text>`+crew();
      setProg('選一個範圍，按「開始」');
      setDialog('yellow','選要練習的範圍，按「開始」！答錯了，紅皮敏敏會告訴你翻到課本第幾頁。');
      controls.innerHTML=`<div class="controls qbox"><p class="q-prompt">要練習哪裡？</p><div class="answers stack dq-range">${sets.map((s,k)=>`<button class="ans${range===k?' right':''}" data-k="${k}"><b>${esc(s.name)}</b><small>${esc(s.sub||'')}</small></button>`).join('')}</div><button class="primary-btn wide" id="dqStart" ${range==null?'disabled':''}>開始（${n} 題）</button></div>`;
      controls.querySelectorAll('.dq-range .ans').forEach(b=>b.onclick=()=>{range=+b.dataset.k;sfx.click();startScreen();});
      const sb=$('#dqStart');if(sb)sb.onclick=()=>{unlockAudio();begin(draw(sets[range].items,Math.min(n,sets[range].items.length)));};
    };
    const begin=list=>{round=list;i=0;first=[];wrongs=[];const t=pick(['開始囉！課本放在旁邊。','加油！答錯了就翻課本找一找。']);setDialog(pick(['yellow','blue','ice']),t);say(t);step();};
    const step=()=>{
      const okN=first.filter(Boolean).length;
      setProg(`第 ${i+1} 題，共 ${round.length} 題`,`答對 ${okN}`);
      ask(round[i],{prog:`${i+1} / ${round.length}`,state:{},onRight:f=>{
        first.push(f);if(!f)wrongs.push(round[i]);
        i++;
        setProg(`第 ${Math.min(i+1,round.length)} 題，共 ${round.length} 題`,`答對 ${first.filter(Boolean).length}`);
        const last=i>=round.length;
        const b=document.createElement('button');b.className='more wide dq-next';b.innerHTML=(last?'看成績':'下一題')+ICON_NEXT;
        b.onclick=()=>{unlockAudio();last?result():step();};
        controls.appendChild(b);b.scrollIntoView({block:'nearest',behavior:'smooth'});
      }});
    };
    const result=()=>{
      const ok=first.filter(Boolean).length,tot=round.length,s=Math.round(ok*100/tot);
      const msg=s===100?'全部第一次就答對！太厲害了！':s>=80?'好厲害！把錯的再練一次就全對了！':s>=60?'不錯喔！翻翻課本，再練一次！':'沒關係！翻課本看一看，再練一次！';
      stage.onclick=null;
      stage.innerHTML=(bgArt||BG)()+`<rect x="120" y="54" width="560" height="250" rx="30" class="dq-board"/><text x="400" y="118" text-anchor="middle" class="dq-t" style="font-size:28px">第一次就答對</text><text x="400" y="200" text-anchor="middle" class="dq-big-n">${ok} / ${tot}</text><text x="400" y="260" text-anchor="middle" class="dq-t" style="font-size:22px;fill:#56627C">${esc(msg)}</text>`+crewRow(120,680,446,.42,CREW).replace(/class="pik /g,'class="pik talking ');
      setDialog('yellow',msg);say(`第一次就答對 ${ok} 題。${msg}`);sfx.win();
      setProg(`練完一輪了！`,`${ok}/${tot}`);
      const W=[...new Map(wrongs.map(w=>[w.id,w])).values()];
      controls.innerHTML=`${W.length?`<div class="controls qbox"><p class="q-prompt">要再看一次的題目</p><ul class="dq-wlist">${W.map(w=>`<li><span class="book-pg">p.${esc(w.p)}</span>${esc(w.q)}</li>`).join('')}</ul></div>`:''}
        <div class="dq-actions">${W.length?`<button class="primary-btn wide" id="dqRedo">錯的再練一次（${W.length} 題）</button>`:''}<button class="${W.length?'ghost-btn':'primary-btn'} wide" id="dqAgain">再玩一輪</button><button class="ghost-btn wide" id="dqRange">換範圍</button></div>`;
      const rd=$('#dqRedo');if(rd)rd.onclick=()=>{unlockAudio();begin(shuffle(W.slice()));};
      $('#dqAgain').onclick=()=>{unlockAudio();begin(draw(sets[range].items,Math.min(n,sets[range].items.length)));};
      $('#dqRange').onclick=()=>{unlockAudio();startScreen();};
    };
    startScreen();
  }

  return {get current(){return current},ART,FIG,KIND,setBG:f=>{BG=f},bg:()=>BG(),wrap,tw,esc,textBlock,bookPill,bookTip,draw,ask,level,toQuiz,quiz,practice,setProg};
})();
