/* 皮皮學習樂園：8 位角色的畫法和場景小物件（全站共用）。
   每個角色畫在 100 x 170 的框內（viewBox -5 -24 110 178），腳底在 y≈148。
   pikG(角色, 頭頂) 的頭頂可以是 sprout 小芽、leaf 葉子、bud 花苞、flower 花。 */
(()=>{
const T={
  yellow:{name:'黃皮敏敏',body:'#FFD83F',light:'#FFF3B0',shade:'#E0A200',line:'#9A6A00',petal:'#FFFFFF'},
  red:{name:'紅皮敏敏',body:'#EE4A3B',light:'#FF9A84',shade:'#B72A22',line:'#7E1A14',petal:'#F9B3CC'},
  blue:{name:'藍皮敏敏',body:'#3C82E0',light:'#93C1FF',shade:'#2156A8',line:'#163C7A',petal:'#9DBBF5'},
  purple:{name:'紫皮敏敏',body:'#8A5CC9',light:'#C6A6F0',shade:'#5E3799',line:'#3F2370',petal:'#EBDDFF',fat:true},
  white:{name:'白皮敏敏',body:'#F7F6FB',light:'#FFFFFF',shade:'#C9CCDA',line:'#868CA3',petal:'#FFD6E8',slim:true,redEyes:true},
  rock:{name:'岩皮敏敏',body:'#5B5F68',light:'#9AA0AA',shade:'#30333A',line:'#1E2026',petal:'#FFE08A',rock:true},
  wing:{name:'羽皮敏敏',body:'#F7A6CF',light:'#FFD9EC',shade:'#D06AA2',line:'#9A3F74',petal:'#FFFFFF',wings:true},
  ice:{name:'冰克敏',body:'#B9E9FA',light:'#F0FBFF',shade:'#6AB5D8',line:'#3C86AE',petal:'#FFFFFF',ice:true}
};
const KEYS=Object.keys(T);
const STAGES=['sprout','leaf','bud','flower'];   // 小芽 → 葉 → 花苞 → 花

/* watercolour look: wobbly hand-drawn edges + paper grain, plus a soft radial wash per colour */
const PIK_DEFS=`<filter id="wc" filterUnits="userSpaceOnUse" x="-10" y="-30" width="120" height="190" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="wob"/>
    <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="g0"/>
    <feColorMatrix in="g0" type="saturate" values="0" result="g1"/>
    <feComponentTransfer in="g1" result="g"><feFuncR type="linear" slope="0.32" intercept="0.76"/><feFuncG type="linear" slope="0.32" intercept="0.76"/><feFuncB type="linear" slope="0.32" intercept="0.76"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
    <feBlend in="d" in2="g" mode="multiply" result="m"/>
    <feComposite in="m" in2="d" operator="in"/>
  </filter>
  ${Object.entries(T).map(([k,c])=>`<radialGradient id="pg-${k}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c.light}"/><stop offset=".5" stop-color="${c.body}"/><stop offset="1" stop-color="${c.shade}"/></radialGradient>`).join('')}
  <radialGradient id="pg-leaf" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#C4EE8E"/><stop offset=".5" stop-color="#78C84A"/><stop offset="1" stop-color="#3E8E2C"/></radialGradient>
  <radialGradient id="pg-weye" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#E6FAFF"/><stop offset=".45" stop-color="#7FD3F5"/><stop offset="1" stop-color="#2B8FCB"/></radialGradient>
  <radialGradient id="pg-ice" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#CFF1FF"/><stop offset="1" stop-color="#7CC3E3"/></radialGradient>`;

/* stem tip is at (52, 2); what grows there depends on the stage */
function topG(k,stage){
  const c=T[k],lw='stroke-width="1.6" stroke-linejoin="round"';
  if(c.ice){
    const x=(cx,cy,s)=>`<path d="M${cx},${cy-13*s} L${cx+8*s},${cy-2*s} L${cx+5*s},${cy+10*s} L${cx-5*s},${cy+10*s} L${cx-8*s},${cy-2*s}Z" fill="url(#pg-ice)" stroke="${c.line}" ${lw}/><path d="M${cx},${cy-13*s} L${cx},${cy+10*s} M${cx-8*s},${cy-2*s} L${cx},${cy+2*s} L${cx+8*s},${cy-2*s}" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".9"/>`;
    if(stage==='sprout')return x(52,2,.6);
    if(stage==='flower')return x(41,-4,.6)+x(63,-4,.6)+x(52,-9,1.05);
    return x(52,-8,stage==='bud'?1.05:.95);
  }
  if(stage==='sprout')return `<path d="M52,5 C46,5 42,0 42,-5 C47,-5 51,-1 52,5Z M52,5 C58,5 62,0 62,-5 C57,-5 53,-1 52,5Z" fill="url(#pg-leaf)" stroke="#2F6E22" ${lw}/>`;
  if(stage==='bud')return `<path d="M52,3 C43,0 42,-12 52,-22 C62,-12 61,0 52,3Z" fill="${c.petal}" stroke="#C0709F" ${lw}/><path d="M52,-20 C49,-12 49,-4 52,1" stroke="#E7A6D6" stroke-width="1.2" fill="none"/><path d="M44,-3 Q52,8 60,-3 Q52,1 44,-3Z" fill="url(#pg-leaf)" stroke="#2F6E22" stroke-width="1.3"/>`;
  if(stage==='flower'){
    let f='';for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;f+=`<circle cx="${(52+9.6*Math.cos(a)).toFixed(1)}" cy="${(-5+9.6*Math.sin(a)).toFixed(1)}" r="8" fill="${c.petal}" stroke="#B9739D" stroke-width="1.3"/>`;}
    return f+`<circle cx="52" cy="-5" r="6" fill="#FFD43B" stroke="#D99A00" stroke-width="1.2"/><circle cx="50.2" cy="-6.8" r="1.9" fill="#FFF6C8"/>`;
  }
  return `<path d="M52,3 C42,-5 20,-1 14,-17 C32,-28 58,-19 52,3Z" fill="url(#pg-leaf)" stroke="#2F6E22" ${lw}/><path d="M51,1 C44,-7 31,-11 18,-16" stroke="#2F6E22" stroke-width="1.2" fill="none" opacity=".75"/><path d="M24,-19 C31,-23 39,-22 44,-19" stroke="#E2F7C6" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
}

/* one continuous head-and-body shape: pointed crown that becomes the stem, big head, small body */
function silhouette(o){
  const {tip,hw,wy,nw,ny,bw,by,round}=o, k1=round?.6:.25, k2=round?2:16;
  return `M50,${tip} C${50+hw*k1},${tip+(round?0:9)} ${50+hw},${tip+k2} ${50+hw},${wy} C${50+hw},${wy+16} ${50+hw*.72},${ny-6} ${50+nw},${ny} C${50+bw},${ny+8} ${50+bw+1},${ny+20} ${50+bw},${by-12} C${50+bw-1},${by-3} ${50+bw*.5},${by} 50,${by} C${50-bw*.5},${by} ${50-bw+1},${by-3} ${50-bw},${by-12} C${50-bw-1},${ny+20} ${50-bw},${ny+8} ${50-nw},${ny} C${50-hw*.72},${ny-6} ${50-hw},${wy+16} ${50-hw},${wy} C${50-hw},${tip+k2} ${50-hw*k1},${tip+(round?0:9)} 50,${tip}Z`;
}

const baked=new Map();
function bake(inner){
  let u=baked.get(inner);
  if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -24 110 178" width="330" height="534"><defs>${PIK_DEFS}</defs><g filter="url(#wc)">${inner}</g></svg>`);baked.set(inner,u);}
  return u;
}

/* hand-drawn vector version (kept for the head-growth stages; the pages use the illustrations below) */
function pikSVG(k,stage='leaf'){
  const c=T[k],fill=`url(#pg-${k})`,ln=`stroke="${c.line}" stroke-width="2" stroke-linejoin="round"`;
  const o=c.fat?{tip:10,hw:29,wy:56,nw:14,ny:90,bw:22,by:128}
        :c.slim?{tip:14,hw:21,wy:55,nw:8,ny:88,bw:12,by:124}
        :c.wings?{tip:22,hw:24,wy:52,nw:8,ny:84,bw:11,by:120,round:true}
        :{tip:10,hw:25,wy:54,nw:10,ny:88,bw:15,by:126};
  if(c.rock)Object.assign(o,{tip:20,wy:54,nw:22,ny:96,bw:22,by:112});
  const tube=(d,w,cls='')=>`<g${cls?` class="${cls}"`:''}><path d="${d}" stroke="${c.line}" stroke-width="${w+3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.body}" stroke-width="${w}" fill="none" stroke-linecap="round"/></g>`;

  /* stem in body colour, rising from the crown */
  const stemD=stage==='sprout'?`M50,${o.tip+3} C50,${o.tip-3} 51,9 52,5`:`M50,${o.tip+3} C49,${o.tip-6} 53,9 52,2`;
  const stem=c.rock?`<path d="${stemD}" stroke="#2A2C31" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${stemD}" stroke="#6E737C" stroke-width="2.6" fill="none" stroke-linecap="round"/>`:tube(stemD,3.6);

  /* limbs: short, soft, a bit chunky */
  const legY=o.by-4;
  const legs=tube(`M45,${legY} C45,${legY+10} 44,138 43,144`,6)+tube(`M55,${legY} C55,${legY+10} 56,138 57,144`,6)
    +`<ellipse cx="41" cy="146" rx="6.5" ry="3.4" fill="${c.body}" ${ln}/><ellipse cx="59" cy="146" rx="6.5" ry="3.4" fill="${c.body}" ${ln}/>`;
  const sy=c.rock?o.ny-14:o.ny+8, sx=c.rock?24:o.nw+3, reach=c.fat?14:c.rock?10:12;
  const armL=tube(`M${50-sx},${sy} C${50-sx-reach*.6},${sy+3} ${50-sx-reach},${sy+9} ${50-sx-reach-2},${sy+17}`,5);
  const armR=tube(`M${50+sx},${sy} C${50+sx+reach*.6},${sy+3} ${50+sx+reach},${sy+9} ${50+sx+reach+2},${sy+17}`,5);

  let back='',ears='',bodyShape,extra='';
  if(c.rock){
    bodyShape=`<path d="M29,42 L40,22 L63,19 L77,35 L80,66 L73,97 L58,112 L41,112 L26,98 L21,66Z" fill="${fill}" stroke="${c.line}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M40,22 L46,40 L29,42 M46,40 L66,38 L77,35 M66,38 L70,66 L80,66 M70,66 L58,90 L73,97 M58,90 L36,88 L26,98 M36,88 L28,66 L21,66 M46,40 L28,66" stroke="#8C929B" stroke-width="1.3" fill="none" opacity=".7"/>
      <path d="M46,40 L66,38 L70,66 L58,90 L36,88 L28,66Z" fill="#FFFFFF" opacity=".08"/><path d="M63,19 L77,35 L66,38 L46,40 L40,22Z" fill="#FFFFFF" opacity=".16"/>`;
  }else{
    bodyShape=`<path d="${silhouette(o)}" fill="${fill}" ${ln}/>`;
    bodyShape+=`<ellipse cx="${50-o.hw*.42}" cy="${o.wy-12}" rx="${o.hw*.22}" ry="${o.hw*.34}" fill="#FFFFFF" opacity=".45" transform="rotate(-22 ${50-o.hw*.42} ${o.wy-12})"/>`;
  }
  if(c.wings)back=`${[1,-1].map(d=>`<path d="M${50-d*6},${o.ny+2} C${50-d*20},${o.ny-22} ${50-d*42},${o.ny-30} ${50-d*49},${o.ny-18} C${50-d*48},${o.ny-4} ${50-d*28},${o.ny+8} ${50-d*6},${o.ny+8}Z" fill="#FFFFFF" fill-opacity=".72" stroke="#C9A4E0" stroke-width="1.4"/><path d="M${50-d*10},${o.ny+5} C${50-d*22},${o.ny-6} ${50-d*32},${o.ny-12} ${50-d*40},${o.ny-12}" stroke="#D9C2EE" stroke-width="1" fill="none"/>`).join('')}`;
  if(k==='yellow'){
    ears=[1,-1].map(d=>`<path d="M${50-d*(o.hw-4)},${o.wy-12} C${50-d*(o.hw+6)},${o.wy-24} ${50-d*(o.hw+20)},${o.wy-26} ${50-d*(o.hw+25)},${o.wy-21} C${50-d*(o.hw+21)},${o.wy-6} ${50-d*(o.hw+9)},${o.wy+6} ${50-d*(o.hw-3)},${o.wy+6}Z" fill="${fill}" ${ln}/><path d="M${50-d*(o.hw-1)},${o.wy-8} C${50-d*(o.hw+7)},${o.wy-17} ${50-d*(o.hw+15)},${o.wy-19} ${50-d*(o.hw+19)},${o.wy-17} C${50-d*(o.hw+15)},${o.wy-6} ${50-d*(o.hw+7)},${o.wy+1} ${50-d*(o.hw-1)},${o.wy+1}Z" fill="#F6B04A" opacity=".45"/>`).join('');
  }
  const ey=c.rock?54:o.wy+2, ex=c.rock?12:o.hw*.45, er=c.wings?10.5:c.rock?8.5:o.hw*.38;
  if(k==='red')extra=`<path d="M47.5,${ey+5} C49,${ey+9} 49.6,${ey+12} 50,${ey+15} C50.6,${ey+12} 51.4,${ey+9} 52.5,${ey+5} Q50,${ey+3} 47.5,${ey+5}Z" fill="${c.shade}" stroke="${c.line}" stroke-width="1.2" stroke-linejoin="round"/>`;
  if(k==='blue')extra=`<path d="M46.5,${ey+10} Q50,${ey+9} 53.5,${ey+10} Q51.5,${ey+16} 50,${ey+16} Q48.5,${ey+16} 46.5,${ey+10}Z" fill="#F27C93" stroke="${c.line}" stroke-width="1.3" stroke-linejoin="round"/>`;
  if(k==='purple')extra=`<path d="M44,${o.tip+12} q-2,-7 1,-12 M56,${o.tip+12} q2,-7 -1,-12 M39,${o.tip+16} q-5,-5 -5,-11 M61,${o.tip+16} q5,-5 5,-11" stroke="${c.line}" fill="none" stroke-width="2" stroke-linecap="round"/>`;
  if(c.ice)extra=`<path d="M50,${o.tip+4} L58,${o.wy-14} L${50+o.hw-2},${o.wy+2} M58,${o.wy-14} L${50+o.hw*.4},${o.wy+18} M42,${o.wy-14} L${50-o.hw+3},${o.wy-2} M42,${o.ny+6} L${50+o.bw-3},${o.ny+20}" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".85" stroke-linecap="round"/><path d="M${50+o.hw-4},${o.wy-22} l2,-5 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2z" fill="#FFFFFF"/>`;

  /* eyes stay crisp (outside the watercolour filter) so the face reads well at small sizes */
  let eyes;
  if(c.wings){
    eyes=[-1,1].map(d=>`<ellipse cx="${50+d*ex}" cy="${ey}" rx="${er*.9}" ry="${er}" fill="url(#pg-weye)" stroke="${c.line}" stroke-width="1.4"/><ellipse cx="${50+d*ex-2.5}" cy="${ey-3.5}" rx="2.6" ry="2" fill="#FFFFFF"/>`).join('');
  }else{
    const iris=c.redEyes?'#D3263A':'#1B1B24', pr=er*(c.redEyes?.62:.5);
    eyes=[-1,1].map(d=>`<circle cx="${50+d*ex}" cy="${ey}" r="${er}" fill="#FFFFFF" stroke="${c.line}" stroke-width="1.4"/><circle cx="${50+d*ex-d*er*.12}" cy="${ey+er*.14}" r="${pr}" fill="${iris}"/><circle cx="${50+d*ex-d*er*.12+pr*.35}" cy="${ey+er*.14-pr*.4}" r="${pr*.38}" fill="#FFFFFF"/>`).join('');
  }
  eyes=`<g class="eyes">${eyes}</g>`;

  /* the watercolour parts are baked into cached images (cheap to animate on iPad); eyes stay live vectors so they can blink */
  const W='x="-5" y="-24" width="110" height="178"', at=(x,y)=>`transform-origin:${((x+5)/1.1).toFixed(1)}% ${((y+24)/1.78).toFixed(1)}%`;
  const img=(inner,cls,org)=>`<image${cls?` class="${cls}" style="${org}"`:''} href="${bake(inner)}" ${W}/>`;
  return `<g class="bob">${back?img(back,'wings',at(50,o.ny)):''}${img(stem+topG(k,stage),'stemG',at(50,o.tip+3))}${img(armR,'armR',at(50+sx,sy))}${img(legs+armL+ears+bodyShape+extra)}${eyes}</g>`;
}
/* the watercolour illustrations (assets/pikmin/*.webp, cut out from 腳色圖檔), fitted into the same 100 x 170 box: feet at y=148 */
const IMG={yellow:[456,720],white:[400,720],wing:[467,720],blue:[449,720],ice:[502,720],purple:[433,720],rock:[517,720],red:[409,720]};
const IMG_BASE=new URL('pikmin/',document.currentScript.src).href;
function pikG(k){
  const [w,h]=IMG[k],H=174,W=H*w/h;
  return `<g class="bob"><image href="${IMG_BASE}${k}.webp" x="${(50-W/2).toFixed(1)}" y="${148-H+2}" width="${W.toFixed(1)}" height="${H}" preserveAspectRatio="xMidYMax meet"/></g>`;
}
const pikAt=(k,x,feet,s,cls='',stage)=>`<g class="pik ${cls}" transform="translate(${x-50*s},${feet-148*s}) scale(${s})">${stage?pikSVG(k,stage):pikG(k)}</g>`;

/* a fresh random order every page load */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let bag=[];
const next=()=>{if(!bag.length)bag=shuffle(KEYS);return bag.pop()};   // deals every colour before repeating

function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
function stars(seed,n,x0,x1,y1){const r=rng(seed);let s='';for(let i=0;i<n;i++){s+=`<circle cx="${(x0+r()*(x1-x0)).toFixed(1)}" cy="${(r()*y1).toFixed(1)}" r="${(.7+r()*1.4).toFixed(2)}" fill="#FFFFFF" opacity="${(.4+r()*.6).toFixed(2)}"${i%5===0?` class="twinkle" style="animation-delay:${(r()*2.4).toFixed(2)}s"`:''}/>`}return s}
let mid=0;
function moonG(f,r){
  const id='m'+(++mid),k=Math.cos(2*Math.PI*f),wax=f<.5,rx=(Math.abs(k)*r).toFixed(2);
  let lit=f<.02||f>.98?'':Math.abs(f-.5)<.02?`<circle r="${r}"/>`:wax?`<path d="M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${k>0?0:1} 0,${-r}Z"/>`:`<path d="M0,${-r} A${r},${r} 0 0 0 0,${r} A${rx},${r} 0 0 ${k>0?1:0} 0,${-r}Z"/>`;
  return `<circle r="${r*2.3}" fill="url(#mglow)"/><circle r="${r}" fill="#2B3260"/>${lit?`<clipPath id="${id}">${lit}</clipPath><g clip-path="url(#${id})"><circle r="${r}" fill="#FFF4C4"/><g fill="#E6D89E" opacity=".85"><circle cx="${-.3*r}" cy="${-.25*r}" r="${.22*r}"/><circle cx="${.28*r}" cy="${.2*r}" r="${.16*r}"/></g></g>`:''}`;
}
function sun(x,y,r){let rays='';for(let i=0;i<12;i++)rays+=`<line y1="${-r-7}" y2="${-r-17}" stroke="#FFC12E" stroke-width="4" stroke-linecap="round" transform="rotate(${i*30})"/>`;return `<g transform="translate(${x},${y})"><circle r="${r*2.4}" fill="url(#glow)"/>${rays}<circle r="${r}" fill="#FFD23F" stroke="#F5A524" stroke-width="3"/></g>`}
const cloud=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})" fill="#FFFFFF"><ellipse cx="0" cy="0" rx="34" ry="16"/><circle cx="-14" cy="-10" r="16"/><circle cx="12" cy="-14" r="20"/></g>`;
const flower=(x,y,c)=>`<g transform="translate(${x},${y})"><path d="M0,0 V-12" stroke="#3F8A2C" stroke-width="2"/>${[0,72,144,216,288].map(a=>`<circle cx="0" cy="-17" r="3.6" fill="${c}" transform="rotate(${a} 0 -12)"/>`).join('')}<circle cx="0" cy="-12" r="2.6" fill="#FFD43B"/></g>`;

/* shared gradients */
const defs=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="glow"><stop offset="0" stop-color="#FFF7C7" stop-opacity=".95"/><stop offset=".45" stop-color="#FFE066" stop-opacity=".45"/><stop offset="1" stop-color="#FFD84D" stop-opacity="0"/></radialGradient>
  <radialGradient id="mglow"><stop offset="0" stop-color="#FFFBE0" stop-opacity=".5"/><stop offset="1" stop-color="#FFFBE0" stop-opacity="0"/></radialGradient>
  <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4AA8F0"/><stop offset="1" stop-color="#CBEAFF"/></linearGradient>
  <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1446"/><stop offset="1" stop-color="#2E3379"/></linearGradient>
  <linearGradient id="coverSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6FB8EE"/><stop offset=".45" stop-color="#8A7FD0"/><stop offset="1" stop-color="#141A45"/></linearGradient>
  ${PIK_DEFS}
</defs></svg>`;
if(!document.getElementById('glow'))document.body.insertAdjacentHTML('afterbegin',defs);   /* lesson pages bring their own copies */

/* tap a character to make it hop */
document.addEventListener('click',e=>{
  const p=e.target.closest&&e.target.closest('.hopper .pik');if(!p)return;
  p.classList.remove('hop');void p.getBoundingClientRect();p.classList.add('hop');
  p.addEventListener('animationend',()=>p.classList.remove('hop'),{once:true});
});

window.Pik={T,KEYS,STAGES,topG,pikG,pikSVG,pikAt,shuffle,next,stars,moonG,sun,cloud,flower,name:k=>T[k].name};
})();
