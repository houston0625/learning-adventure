/* 皮皮學習樂園：自然「練習為主」單元的共用程式（第 3 單元起；第 2 單元用自己的 sci2.js）。
   載入順序：pikmin.js → core.js → drill.js → sciunit.js → 單元題庫（sci3.js、sci4.js）。
   題庫檔呼叫 SCIUNIT.make({no, name, LESSONS, BG})，拿到 lesson('3-1')、practicePage()。
     LESSONS['3-1']={title, master, pages, who, levels:[{label, items, n, p, intro, bonus}], notes:[[顏色, 標題, [重點…]]…]}
     BG={'3-1':()=>svg…, all:()=>svg}
   加分關（bonus:true）的題目：小測驗和練習場的一般範圍不出，練習場另外有「加分題」範圍。
   題目可以加 alts:[[…],[…]]，每次換一組選項（找不同用）。 */
const SCIUNIT=(()=>{
  const helpers={
    one:(id,q,o,p,tip,x)=>({id,k:'one',q,o,p,tip,...x}),
    pic:(id,art,q,o,p,tip)=>({id,k:'pic',art,q,o,p,tip}),
    fill:(id,q,o,p,tip)=>({id,k:'fill',q,o,p,tip}),
    odd:(id,q,o,p,tip,alts)=>({id,k:'odd',q,o,p,tip,alts}),
    tf:(id,q,a,p,tip,ex)=>({id,k:'tf',q,a,p,tip,ex}),
    multi:(id,q,o,x,p,tip)=>({id,k:'multi',q,o,x,p,tip}),
    order:(id,q,o,p,tip)=>({id,k:'order',q,o,p,tip}),
    match:(id,q,pairs,p,tip)=>({id,k:'match',q,pairs,p,tip}),
    sort:(id,q,item,b,bs,p,tip)=>({id,k:'sort',q,item,b,bs,p,tip})
  };

  function make(cfg){
    const {no,name,LESSONS,BG}=cfg;
    const unit=`自然四上・第 ${no} 單元 ${name}`;
    const secs=Object.keys(LESSONS);
    const all=secs.flatMap(s=>LESSONS[s].levels.flatMap(l=>l.items));
    /* 找不同：每次換一組 */
    all.forEach(it=>{
      if(!it.alts)return;
      const sets=[it.o].concat(it.alts),base=it.o;
      Object.defineProperty(it,'o',{get(){return this._o||base},set(v){this._o=v},configurable:true});
      it.reroll=()=>{it._o=pick(sets)};
    });
    const reroll=()=>all.forEach(it=>it.reroll&&it.reroll());
    const secItems=sec=>LESSONS[sec].levels.filter(l=>!l.bonus).flatMap(l=>l.items);
    const bonusItems=()=>secs.flatMap(s=>LESSONS[s].levels.filter(l=>l.bonus).flatMap(l=>l.items));
    const notesHTML=L=>L.notes.map(([c,h,li])=>`<section class="note ${c}"><h3><i></i>${h}</h3><ul>${li.map(x=>`<li>${x}</li>`).join('')}</ul></section>`).join('');

    function lesson(sec){
      const L=LESSONS[sec];
      DRILL.setBG(BG[sec]);
      QUIZ_TITLE=`小測驗：${L.title}`;MASTER=L.master;
      document.querySelector('#notes h2').textContent=`重點整理：${L.title}`;
      document.querySelector('#notes .notes-grid').innerHTML=notesHTML(L);
      const lastMain=L.levels.map(l=>!l.bonus).lastIndexOf(true);
      let notesShown=false;
      const talk=[{who:L.who,t:L.hello},{who:'red',t:'答錯了，我會告訴你翻到課本第幾頁。課本放旁邊喔！'}];
      const intro=()=>{
        stage.innerHTML=BG[sec]()+`<text x="400" y="190" text-anchor="middle" class="ttl">${L.title}</text><text x="400" y="236" text-anchor="middle" class="lbl">自然・第 ${no} 單元 ${sec}</text>`+crewRow(110,690,446,.42)+DRILL.bookPill(L.pages);
        setDialog(L.who,'按「開始冒險」！說明很少，題目很多，每次都不一樣喔！');
        introStart(talk,'準備好了！按「下一步」開始練習。');
      };
      const runLevel=(lv,i)=>{
        lv.items.forEach(it=>it.reroll&&it.reroll());
        const nextName=i+1<L.levels.length?L.levels[i+1].label:'小測驗';
        DRILL.level({items:lv.items,n:lv.n,p:lv.p,intro:lv.intro,who:pick(['blue','yellow','purple','white','wing','ice','rock']),notes:true,
          task:lv.bonus?'加分關卡：答對每一題':'答對每一題',
          doneText:`完成了！按「下一步」去「${nextName}」。`,
          onDone:()=>{if(i===lastMain&&!notesShown){notesShown=true;setTimeout(()=>{if(SCENES[cur]&&SCENES[cur].label===lv.label)openNotes()},900)}}});
      };
      SCENES=[{label:'開場',build:intro}].concat(L.levels.map((lv,i)=>({label:lv.label,build:()=>runLevel(lv,i)})),[{label:'小測驗',quiz:true}]);
      done=SCENES.map(()=>false);
      const pools=L.levels.filter(l=>!l.bonus).map(l=>l.items);
      const _bq=buildQuiz;
      buildQuiz=function(){reroll();QUIZ=DRILL.quiz(pools,10);_bq();};
      QUIZ=DRILL.quiz(pools,10);
      goTo(0);
    }

    function practicePage(){
      DRILL.setBG(BG.all);
      const first=secs[0],last=secs[secs.length-1],bonus=bonusItems();
      const sets=[{name:`全部（${first}～${last}）`,sub:`整個單元・課本 p.${cfg.pages}`,items:secs.flatMap(secItems)}]
        .concat(secs.map(s=>({name:`${s} ${LESSONS[s].title}`,sub:`課本 p.${LESSONS[s].mainPages||LESSONS[s].pages}`,items:secItems(s)})));
      if(bonus.length)sets.push({name:'加分題',sub:cfg.bonusSub||'科學閱讀',items:bonus});
      SCENES=[{label:'練習場',build:()=>{reroll();DRILL.practice({title:`第 ${no} 單元 練習場`,n:15,sets});}}];
      done=[false];
      goTo(0);
    }

    return {cfg,unit,LESSONS,lesson,practicePage,secItems,bonusItems};
  }
  return {make,...helpers};
})();
