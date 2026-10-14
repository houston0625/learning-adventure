/* 皮皮學習樂園：社會科共用程式（課本頁碼標籤、翻課本提示、拖拉遊戲、臺灣地形地圖）。
   載入順序：pikmin.js → core.js → social.js → 這一課的內容。樣式：core.css + social.css。
   社會科的原則：先玩再說、台詞短；答錯時不給答案，只說「翻到課本第幾頁＋一句方向」（紅皮敏敏說）。 */

/* ---------- 課本頁碼 ---------- */
const ICON_BOOK='<path d="M2 5.5C5 4.2 8 4.4 11 6.4V19C8 17.2 5 17 2 18.2Z" fill="#FFE2B8" stroke="#A35A12" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 5.5C17 4.2 14 4.4 11 6.4V19C14 17.2 17 17 20 18.2Z" fill="#FFF6E6" stroke="#A35A12" stroke-width="1.8" stroke-linejoin="round"/>';
/* 估計文字寬度（中文一個字 = 字級，英數約 0.58 倍） */
const textW=(s,px)=>[...String(s)].reduce((w,c)=>w+(c.charCodeAt(0)>255?px:px*.58),0);
/* 舞台左上角的「課本 p.20～21」：孩子可以把課本翻到同一頁放在旁邊 */
function bookPill(pages,x=12,y=12){
  const t=`課本 p.${pages}`,w=Math.round(textW(t,16)+50);
  return `<g class="book-pill" transform="translate(${x},${y})"><rect width="${w}" height="38" rx="19" fill="#FFFFFF" fill-opacity=".95" stroke="#E8B77A" stroke-width="2"/><g transform="translate(11,7)">${ICON_BOOK}</g><text x="38" y="25" class="pill-t">${t}</text></g>`;
}
/* 答錯時的提示句：「翻到課本第 22 頁，……」 */
const bookTip=(page,tip)=>`翻到課本第 ${page} 頁，${tip}`;
/* 紅皮敏敏說提示 */
function wrongTip(page,tip){talk([{who:'red',t:bookTip(page,tip)}]);}

/* ---------- 拖拉遊戲 ----------
   在舞台裡拖動名牌，放到目標區域；也可以「先點名牌、再點目標」（手指不方便拖的時候）。
   o.tokens：[{k, label, x, y}]（名牌中心點）；o.layer：放名牌的 <g> 的選擇器
   o.zoneAt(x,y)：回傳這一點是哪個區域（沒有就 null）
   o.accept(k,zone)：放對了嗎？ o.onRight(k,zone,pt)、o.onWrong(k,zone) */
function dragGame(o){
  const layer=stage.querySelector(o.layer||'#dragLayer');
  const pos={},home={};
  const tokHTML=t=>{const w=Math.max(84,Math.round(textW(t.label,19)+34));return `<g class="tok" data-k="${t.k}" transform="translate(${t.x},${t.y})" role="button" aria-label="${t.label}"><g class="tok-in"><rect x="${-w/2}" y="-22" width="${w}" height="44" rx="22" class="tok-bg"/><text y="7" text-anchor="middle" class="tok-t">${t.label}</text></g></g>`};
  layer.innerHTML=o.tokens.map(tokHTML).join('');
  o.tokens.forEach(t=>{pos[t.k]={x:t.x,y:t.y};home[t.k]={x:t.x,y:t.y}});
  const el=k=>layer.querySelector(`.tok[data-k="${k}"]`);
  const move=(k,x,y)=>{pos[k]={x,y};const g=el(k);if(g)g.setAttribute('transform',`translate(${x.toFixed(1)},${y.toFixed(1)})`)};
  const goHome=k=>{const a={...pos[k]},b=home[k];tween(0,1,260,f=>move(k,a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))};
  let drag=null,sel=null;
  const select=k=>{sel=k;layer.querySelectorAll('.tok').forEach(g=>g.classList.toggle('sel',g.dataset.k===k))};
  const drop=(k,z,p)=>{
    select(null);
    if(o.accept(k,z)){sfx.good();const g=el(k);if(g)g.remove();delete pos[k];o.onRight&&o.onRight(k,z,p);}
    else{sfx.bad();goHome(k);const g=el(k);if(g)restart(g.querySelector('.tok-in'),'shake');o.onWrong&&o.onWrong(k,z);}
  };
  stage.style.touchAction='none';
  stage.onpointerdown=e=>{
    const g=e.target.closest('.tok');const p=svgPt(e);
    if(!g){if(sel!=null){const z=o.zoneAt(p.x,p.y);if(z!=null)drop(sel,z,p);}return;}
    e.preventDefault();
    const k=g.dataset.k;drag={k,g,dx:p.x-pos[k].x,dy:p.y-pos[k].y,sx:p.x,sy:p.y,moved:false};
    try{stage.setPointerCapture(e.pointerId)}catch(_){}
    layer.appendChild(g);g.classList.add('lift');sfx.click();
  };
  stage.onpointermove=e=>{
    if(!drag)return;const p=svgPt(e);
    if(!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)>6)drag.moved=true;
    if(drag.moved)move(drag.k,p.x-drag.dx,p.y-drag.dy);
  };
  stage.onpointerup=e=>{
    if(!drag)return;const d=drag;drag=null;d.g.classList.remove('lift');
    if(!d.moved){select(sel===d.k?null:d.k);return;}
    const p=svgPt(e),z=o.zoneAt(p.x,p.y);
    if(z==null){goHome(d.k);return;}
    drop(d.k,z,p);
  };
  stage.onpointercancel=()=>{if(drag){drag.g.classList.remove('lift');goHome(drag.k);drag=null;}};
  return {left:()=>Object.keys(pos).length};
}

/* ---------- 臺灣地形地圖（示意圖，依課本 p.114「臺灣主要地形、河川分布圖」簡化） ----------
   座標用經緯度；TW.map({x,y,k}) 畫地圖，TW.proj(o,經度,緯度) 換成舞台座標。 */
const TW=(()=>{
  const OUT=[[121.52,25.30],[121.63,25.22],[121.75,25.15],[121.87,25.13],[122.00,25.01],[121.90,24.95],[121.83,24.85],[121.80,24.70],[121.86,24.58],[121.82,24.45],[121.70,24.20],[121.62,24.00],[121.55,23.75],[121.48,23.45],[121.42,23.25],[121.35,23.05],[121.20,22.80],[121.05,22.62],[120.92,22.40],[120.88,22.20],[120.85,21.95],[120.82,21.90],[120.73,21.95],[120.72,22.08],[120.62,22.30],[120.55,22.40],[120.45,22.48],[120.33,22.55],[120.27,22.65],[120.20,22.80],[120.13,23.00],[120.10,23.15],[120.12,23.35],[120.15,23.55],[120.20,23.75],[120.30,23.90],[120.42,24.10],[120.53,24.28],[120.62,24.45],[120.72,24.60],[120.85,24.75],[120.95,24.86],[121.05,25.00],[121.18,25.08],[121.30,25.13],[121.42,25.18],[121.45,25.25]];
  const MTN=[[121.45,25.00],[121.62,24.95],[121.72,24.80],[121.68,24.62],[121.76,24.45],[121.66,24.18],[121.58,24.00],[121.52,23.75],[121.46,23.45],[121.40,23.25],[121.32,23.05],[121.18,22.82],[121.03,22.63],[120.90,22.42],[120.86,22.10],[120.79,22.05],[120.72,22.30],[120.65,22.65],[120.62,22.95],[120.57,23.25],[120.64,23.50],[120.76,23.72],[120.86,23.95],[120.92,24.20],[121.02,24.45],[121.16,24.70],[121.30,24.86]];
  const HILL=[[121.10,24.97],[121.30,24.90],[121.16,24.70],[121.02,24.45],[120.92,24.20],[120.86,23.95],[120.76,23.72],[120.64,23.50],[120.57,23.25],[120.62,22.95],[120.65,22.65],[120.58,22.72],[120.45,22.95],[120.42,23.15],[120.48,23.38],[120.56,23.60],[120.66,23.80],[120.74,24.02],[120.76,24.28],[120.80,24.52],[120.92,24.75]];
  const VALLEY=[[121.60,23.98],[121.45,23.60],[121.35,23.30],[121.22,22.98],[121.12,22.80]];
  const TAI=[[121.15,24.93,.13,.07],[121.34,25.08,.06,.04],[120.56,24.18,.04,.12],[120.55,23.92,.035,.09]];
  const BASIN=[[121.52,25.05,.08,.06],[120.67,24.13,.05,.11],[120.97,23.97,.045,.035],[121.34,22.99,.03,.03]];
  const ISLES=[[119.58,23.57,.06,.08],[119.52,23.40,.03,.03],[121.49,22.66,.025,.025],[121.55,22.05,.04,.03]];
  const COL={plain:'#9CC456',basin:'#3E9450',tai:'#F2D84F',hill:'#E3AE5E',mtn:'#C9703F'};
  const NAME={plain:'平原',basin:'盆地',tai:'台地',hill:'丘陵',mtn:'山地'};
  let uid=0;
  const proj=(o,lon,lat)=>[o.x+(lon-120)*.917*o.k,o.y+(25.35-lat)*o.k];
  const pts=(o,a)=>a.map(p=>proj(o,p[0],p[1]).map(v=>v.toFixed(1)).join(',')).join(' ');
  const ell=(o,[lon,lat,rx,ry])=>{const[x,y]=proj(o,lon,lat);return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(rx*.917*o.k).toFixed(1)}" ry="${(ry*o.k).toFixed(1)}"/>`};
  function map(o={x:470,y:12,k:125},{terrain=true}={}){
    const id='twc'+(++uid),line=pts(o,OUT);
    return `<g class="tw-map"><clipPath id="${id}"><polygon points="${line}"/></clipPath>
      <g fill="${terrain?COL.plain:'#FFF6E6'}" stroke="#6E7A55" stroke-width="1.5">${ISLES.map(i=>ell(o,i)).join('')}</g>
      <polygon points="${line}" fill="${terrain?COL.plain:'#FFF6E6'}"/>
      ${terrain?`<g clip-path="url(#${id})">
        <polygon points="${pts(o,HILL)}" fill="${COL.hill}" stroke-linejoin="round"/>
        <polygon points="${pts(o,MTN)}" fill="${COL.mtn}" stroke-linejoin="round"/>
        <polyline points="${pts(o,VALLEY)}" fill="none" stroke="${COL.plain}" stroke-width="${(o.k*.05).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>
        <g fill="${COL.tai}">${TAI.map(t=>ell(o,t)).join('')}</g>
        <g fill="${COL.basin}">${BASIN.map(b=>ell(o,b)).join('')}</g></g>`:''}
      <polygon points="${line}" fill="none" stroke="#5D6B4A" stroke-width="2.2" stroke-linejoin="round"/></g>`;
  }
  /* 圖例（直排五格） */
  function legend(x,y){
    return `<g transform="translate(${x},${y})"><rect width="92" height="186" rx="12" fill="#FFFFFF" fill-opacity=".95" stroke="#C9B48A" stroke-width="2"/><text x="46" y="24" text-anchor="middle" class="ink-txt">圖例</text>
      ${['plain','basin','tai','hill','mtn'].map((k,i)=>`<rect x="12" y="${36+i*29}" width="26" height="20" rx="4" fill="${COL[k]}"/><text x="46" y="${52+i*29}" class="ink-txt">${NAME[k]}</text>`).join('')}</g>`;
  }
  return {proj,map,legend,COL,NAME};
})();

/* 指北針（社會科地圖右上角） */
function northArrow(x,y,s=1){
  return `<g transform="translate(${x},${y}) scale(${s})"><circle r="22" fill="#FFFFFF" fill-opacity=".95" stroke="#A35A12" stroke-width="2"/><path d="M0,-16 L7,6 L0,1 L-7,6Z" fill="#E2483D"/><text y="17" text-anchor="middle" class="north-t">北</text></g>`;
}
