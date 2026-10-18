/* 皮皮學習樂園：自然第 2 單元「水域環境」的圖（全部自己畫，不用課本照片）。
   載入順序：pikmin.js → core.js → drill.js → sci2-art.js → sci2.js。
   ART：看圖題用的小圖（約 300×200，中心在 0,0）。FIG：點圖、放位置用的整個舞台（800×450）。 */
const SCI2ART=(()=>{
  let cid=0;
  /* 圓角框，裡面的東西不會超出去 */
  const box=(inner)=>{const id='s2c'+(++cid);return `<clipPath id="${id}"><rect x="-150" y="-100" width="300" height="200" rx="16"/></clipPath><g clip-path="url(#${id})">${inner}</g><rect x="-150" y="-100" width="300" height="200" rx="16" fill="none" stroke="#FFFFFF" stroke-width="5"/>`};
  const waves=(y,c='#FFFFFF',op=.8,n=6,w=300)=>{let s='';for(let i=0;i<n;i++){const x=-150+i*w/n;s+=`<path d="M${x},${y} q${w/n/4},-8 ${w/n/2},0 t${w/n/2},0" stroke="${c}" stroke-width="3" fill="none" opacity="${op}" stroke-linecap="round"/>`}return s};
  const tuft=(x,y,s=1,c='#3E8F3A')=>`<g transform="translate(${x},${y}) scale(${s})" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M0,0 L-6,-16 M0,0 L0,-20 M0,0 L6,-16"/></g>`;
  const person=(x,y,c='#F08A24')=>`<g transform="translate(${x},${y})"><circle cy="-34" r="9" fill="#F3C9A0"/><path d="M-10,-38 A10,10 0 0 1 10,-38Z" fill="#FFFFFF" stroke="#C9CFDA" stroke-width="1.5"/><rect x="-10" y="-25" width="20" height="24" rx="5" fill="${c}"/><path d="M-6,-1 L-8,16 M6,-1 L8,16" stroke="#3A4A6A" stroke-width="5" stroke-linecap="round"/></g>`;

  /* ---------- 水生動物（中心 0,0，寬約 120） ---------- */
  const A={
    fish:()=>`<path d="M-50,0 C-38,-24 14,-28 40,-8 L62,-24 L56,0 L62,24 L40,8 C14,28 -38,24 -50,0Z" fill="#8FA27A" stroke="#4E5E3E" stroke-width="2.5" stroke-linejoin="round"/><path d="M-10,-20 C0,-34 18,-32 24,-18" fill="#7A8C66" stroke="#4E5E3E" stroke-width="2"/><path d="M-30,-14 C-24,-4 -24,6 -30,14" stroke="#4E5E3E" stroke-width="2" fill="none"/><circle cx="-38" cy="-5" r="4" fill="#1E2A45"/>`,
    shrimp:()=>`<path d="M-44,-6 C-30,-24 10,-26 34,-10 C44,-2 44,10 34,16 C24,8 14,4 0,4 C-20,4 -36,6 -44,-6Z" fill="#E9D3B0" fill-opacity=".9" stroke="#A88A5A" stroke-width="2.5"/>${[-24,-10,4,18].map(x=>`<path d="M${x},-18 C${x+4},-8 ${x+4},0 ${x},6" stroke="#A88A5A" stroke-width="1.6" fill="none"/>`).join('')}<path d="M34,16 L52,26 M34,16 L48,32" stroke="#A88A5A" stroke-width="3" stroke-linecap="round"/><path d="M-44,-6 C-70,-30 -90,-34 -110,-30 M-44,-6 C-66,-40 -84,-50 -100,-56" stroke="#A88A5A" stroke-width="1.6" fill="none"/>${[-30,-18,-6,6].map(x=>`<path d="M${x},2 L${x-4},22" stroke="#A88A5A" stroke-width="2" stroke-linecap="round"/>`).join('')}<circle cx="-38" cy="-12" r="3.5" fill="#1E2A45"/>`,
    crab:()=>`${[-1,1].map(d=>`<g transform="scale(${d},1)"><path d="M26,6 L50,20 L58,36 M24,12 L44,30 L48,44 M18,16 L32,36 L32,48" stroke="#9E3B24" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M28,-10 L48,-30" stroke="#9E3B24" stroke-width="6" stroke-linecap="round"/><path d="M42,-38 C58,-46 66,-30 54,-22 C50,-30 46,-32 42,-38Z" fill="#C2512F" stroke="#7E2E18" stroke-width="2"/></g>`).join('')}<ellipse rx="36" ry="24" fill="#C2512F" stroke="#7E2E18" stroke-width="2.5"/><ellipse cx="-6" cy="-8" rx="14" ry="6" fill="#D8744F"/><circle cx="-10" cy="-26" r="4" fill="#1E2A45"/><circle cx="10" cy="-26" r="4" fill="#1E2A45"/>`,
    snail:()=>`<path d="M-40,22 C-30,14 30,14 44,22 C40,30 -36,30 -40,22Z" fill="#7A6A58" stroke="#4E4034" stroke-width="2"/><path d="M-22,20 C-34,-6 -10,-36 16,-30 C38,-24 40,4 24,20Z" fill="#2E4B4A" stroke="#1B2E2D" stroke-width="2.5"/><path d="M-8,14 C-14,-4 4,-20 18,-12 C28,-4 22,10 12,12" stroke="#5E8A86" stroke-width="3" fill="none"/><path d="M38,20 L52,6 M42,22 L58,14" stroke="#4E4034" stroke-width="2.5" stroke-linecap="round"/>`,
    tadpole:()=>`<path d="M10,0 C30,-10 50,8 74,-4 C56,10 34,8 10,6Z" fill="#5A4E3E" opacity=".85"/><ellipse rx="18" ry="13" fill="#4A3F33"/><circle cx="-8" cy="-4" r="3" fill="#E8E2D6"/>`,
    turtle:()=>`<path d="M-44,10 C-44,-30 40,-34 46,8Z" fill="#6E5A3A" stroke="#3E321E" stroke-width="2.5"/><path d="M-30,-6 L-12,-18 L8,-18 L26,-6 L8,6 L-12,6Z M-12,-18 L-12,6 M8,-18 L8,6" stroke="#3E321E" stroke-width="2" fill="none"/><ellipse cx="58" cy="2" rx="14" ry="9" fill="#8A8A5A" stroke="#3E321E" stroke-width="2"/><circle cx="64" cy="-1" r="2.5" fill="#1E2A45"/><path d="M-30,10 L-36,22 M30,10 L36,22" stroke="#8A8A5A" stroke-width="8" stroke-linecap="round"/><path d="M-50,10 L52,10" stroke="#3E321E" stroke-width="2.5"/>`,
    frog:()=>`<path d="M-30,24 C-44,10 -36,-18 -6,-22 C24,-24 40,-6 30,22Z" fill="#7F8B4A" stroke="#4A5228" stroke-width="2.5"/><path d="M-30,24 C-50,30 -56,16 -44,10 M30,22 C50,30 58,14 44,8" stroke="#4A5228" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-14" cy="-22" r="8" fill="#9AA65E" stroke="#4A5228" stroke-width="2"/><circle cx="12" cy="-22" r="8" fill="#9AA65E" stroke="#4A5228" stroke-width="2"/><circle cx="-14" cy="-23" r="3.5" fill="#1E2A45"/><circle cx="12" cy="-23" r="3.5" fill="#1E2A45"/><path d="M-12,-6 Q0,0 12,-6" stroke="#4A5228" stroke-width="2" fill="none"/>`,
    bug:()=>`<path d="M-40,0 C-30,-8 26,-8 34,0 C26,8 -30,8 -40,0Z" fill="#6A4A36" stroke="#3A2618" stroke-width="2"/><path d="M34,0 L92,2" stroke="#3A2618" stroke-width="2.5" stroke-linecap="round"/><path d="M-34,-4 L-52,-22 L-60,-10 M-34,4 L-52,22 L-60,10" stroke="#3A2618" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-6,-6 L-20,-36 L-34,-48 M-6,6 L-20,36 L-34,48 M10,-6 L22,-38 L34,-54 M10,6 L22,38 L34,54" stroke="#3A2618" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-38" cy="-4" r="2.5" fill="#E2483D"/>`,
    lizard:()=>`<path d="M-56,0 C-46,-10 20,-12 40,-4 C60,2 80,10 104,6 C80,16 60,12 40,8 C20,12 -46,10 -56,0Z" fill="#8A5A36" stroke="#4E2E18" stroke-width="2"/><path d="M-30,-6 L-40,-24 M-30,6 L-40,24 M20,-8 L28,-28 M20,8 L28,28" stroke="#4E2E18" stroke-width="4" stroke-linecap="round"/><circle cx="-44" cy="-3" r="2.5" fill="#1E2A45"/><path d="M-50,-2 L30,-3" stroke="#E8C48A" stroke-width="2"/>`
  };

  /* ---------- 水生植物 ---------- */
  /* 布袋蓮：sy 是水面，膨大的葉柄浮在水面，根垂在水裡 */
  const hyacinth=(x,sy,s=1)=>`<g transform="translate(${x},${sy}) scale(${s})">${[-26,-12,0,12,26].map((d,i)=>`<path d="M${d*.4},40 C${d*.4-4},56 ${d*.6},70 ${d*.5},${80+i%2*8}" stroke="#4A3A5A" stroke-width="2" fill="none"/>`).join('')}<path d="M-14,32 C-20,44 14,44 14,32" fill="#3A2E46"/>${[[-30,-4,-30],[-14,-10,-14],[2,-12,6],[18,-8,24],[32,-2,34]].map(([dx,dy,r])=>`<g transform="translate(${dx},${dy}) rotate(${r})"><ellipse cy="14" rx="10" ry="15" fill="#8CC85A" stroke="#3E7A2A" stroke-width="2"/><ellipse cy="-14" rx="14" ry="13" fill="#5FA83E" stroke="#3E7A2A" stroke-width="2"/></g>`).join('')}<path d="M4,-18 L4,-56" stroke="#5FA83E" stroke-width="3"/>${[-50,-42,-34,-26].map(y=>`<circle cx="${y%3?6:1}" cy="${y}" r="5" fill="#9B7FD1"/>`).join('')}</g>`;
  /* 大萍：一朵一朵蓮座狀的葉子 */
  const lettuce=(x,sy,s=1)=>`<g transform="translate(${x},${sy}) scale(${s})">${[-14,-5,4,13].map((d,i)=>`<path d="M${d},6 C${d-3},26 ${d+2},40 ${d},${54+i%2*6}" stroke="#E8E2D6" stroke-width="1.6" fill="none"/>`).join('')}${[-40,-20,0,20,40].map((r,i)=>`<g transform="rotate(${r})"><path d="M0,4 C-16,-4 -18,-30 0,-36 C18,-30 16,-4 0,4Z" fill="${i%2?'#A9D67A':'#93C964'}" stroke="#5E9A3A" stroke-width="2"/><path d="M0,0 L0,-30 M-6,-6 L-10,-24 M6,-6 L10,-24" stroke="#5E9A3A" stroke-width="1.2"/></g>`).join('')}</g>`;
  /* 水蘊草：by 是土，top 是頂端；bend 讓莖往旁邊彎 */
  const weed=(x,by,top,bend=0)=>{let s='';[-14,0,14].forEach((d,k)=>{const h=by-top-k*14,cx=x+d+bend*.1,ex=x+d+bend*(1-k*.12),ey=by-h,cyy=by-(bend?h*.98:h*.6);s+=`<path d="M${x+d},${by} Q${cx},${cyy} ${ex},${ey}" stroke="#4E8F3A" stroke-width="3" fill="none"/>`;for(let t=.15;t<1;t+=.12){const px=(1-t)*(1-t)*(x+d)+2*(1-t)*t*cx+t*t*ex,py=(1-t)*(1-t)*by+2*(1-t)*t*cyy+t*t*ey;s+=`<path d="M${(px-9).toFixed(1)},${(py-4).toFixed(1)} L${(px+9).toFixed(1)},${(py+4).toFixed(1)} M${(px-9).toFixed(1)},${(py+4).toFixed(1)} L${(px+9).toFixed(1)},${(py-4).toFixed(1)}" stroke="#6BB04A" stroke-width="2.2" stroke-linecap="round"/>`}});return `<g>${s}</g>`};
  /* 睡蓮：根在土裡（x,by），柔軟的葉柄到水面 sy，葉片平貼水面 */
  const lilyPad=(x,y,r=34)=>`<path d="M${x},${y} L${x+r*.9},${y-5} A${r},${r*.26} 0 1 0 ${x+r*.9},${y+5}Z" fill="#4E9A4A" stroke="#2F6A2A" stroke-width="2"/>`;
  const waterlily=(x,by,sy,spread=1)=>{const tips=[-90,-46,46,90].map(d=>x+d*spread);return `<g>${tips.map((tx,i)=>`<path d="M${x+(i-1.5)*4},${by} Q${x+(tx-x)*.15},${(by+sy)/2} ${tx},${sy+2}" stroke="#7A5A3A" stroke-width="2.6" fill="none"/>`).join('')}${tips.map(tx=>lilyPad(tx,sy,30)).join('')}<path d="M${x},${by} L${x+4},${sy}" stroke="#6A8A3A" stroke-width="2.6"/><g transform="translate(${x+4},${sy-6})">${[-40,-20,0,20,40].map(r=>`<path d="M0,0 C-6,-10 -4,-24 0,-30 C4,-24 6,-10 0,0Z" transform="rotate(${r})" fill="#9B7FD1" stroke="#6A4FA8" stroke-width="1.5"/>`).join('')}<circle r="4" cy="-4" fill="#FFD23F"/></g><path d="M${x-16},${by} q-8,10 -16,14 M${x+16},${by} q8,10 16,14 M${x},${by} l0,16" stroke="#E8DCC8" stroke-width="2"/></g>`};
  /* 蓮：根在土裡（x,by），葉和花挺出水面（sy 是水面）；蓮藕在土裡 */
  const lotusLeaf=(x,y,rx=54)=>`<path d="M${x-rx},${y} C${x-rx*.7},${y-rx*.42} ${x+rx*.7},${y-rx*.42} ${x+rx},${y} C${x+rx*.6},${y-rx*.12} ${x-rx*.6},${y-rx*.12} ${x-rx},${y}Z" fill="#4E9A4A" stroke="#2F6A2A" stroke-width="2.5"/><path d="M${x},${y-rx*.1} L${x-rx*.6},${y-rx*.2} M${x},${y-rx*.1} L${x+rx*.6},${y-rx*.2} M${x},${y-rx*.1} L${x},${y-rx*.3}" stroke="#7BC06A" stroke-width="1.6"/>`;
  const lotusFlower=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})">${[-50,-25,0,25,50].map(r=>`<path d="M0,0 C-12,-14 -10,-36 0,-44 C10,-36 12,-14 0,0Z" transform="rotate(${r})" fill="#F3A6C0" stroke="#C85A85" stroke-width="2"/>`).join('')}<path d="M-8,-6 C-4,-12 4,-12 8,-6Z" fill="#FFD23F"/></g>`;
  const lotusPod=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M-20,-8 C-20,-20 20,-20 20,-8 L8,12 L-8,12Z" fill="#7CA64E" stroke="#4E6E2E" stroke-width="2.5"/>${[[-10,-12],[0,-14],[10,-12],[-5,-6],[5,-6]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="3" fill="#3E5A22"/>`).join('')}</g>`;
  const rhizome=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})">${[-80,0,80].map(dx=>`<ellipse cx="${dx}" rx="40" ry="17" fill="#F2E3C6" stroke="#B89A6A" stroke-width="2.5"/>`).join('')}<path d="M-40,0 L-40,0 M40,0" stroke="#B89A6A"/>${[-40,40].map(dx=>`<rect x="${dx-6}" y="-8" width="12" height="16" rx="5" fill="#D9C49A" stroke="#B89A6A" stroke-width="2"/>`).join('')}${[-80,0,80].map(dx=>`<path d="M${dx-10},14 l-6,14 M${dx+10},14 l6,14 M${dx},16 l0,14" stroke="#C9B48A" stroke-width="2"/>`).join('')}</g>`;
  const lotus=(x,by,sy)=>`<g>${rhizome(x,by+16,.55)}<path d="M${x-30},${by+8} C${x-34},${sy} ${x-46},${sy-40} ${x-60},${sy-52}" stroke="#5E8A3A" stroke-width="3.2" fill="none"/><path d="M${x+10},${by+8} C${x+12},${sy} ${x+18},${sy-60} ${x+20},${sy-78}" stroke="#5E8A3A" stroke-width="3.2" fill="none"/><path d="M${x+30},${by+8} C${x+40},${sy} ${x+52},${sy-24} ${x+60},${sy-36}" stroke="#5E8A3A" stroke-width="3.2" fill="none"/>${lotusLeaf(x-60,sy-52,46)}${lotusLeaf(x+60,sy-36,40)}${lotusFlower(x+20,sy-76,.8)}</g>`;

  /* ---------- 看圖題的小圖 ---------- */
  const ART={
    ocean:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#BFE3FA"/><rect x="-150" y="-30" width="300" height="130" fill="#2F86C9"/><rect x="-150" y="-30" width="300" height="20" fill="#5FA9D0"/>${waves(0)}${waves(26,'#FFFFFF',.7,5)}${waves(52,'#FFFFFF',.6,7)}<path d="M-150,100 L-150,46 C-96,52 -40,76 6,100Z" fill="#EBD9A8"/><path d="M-150,46 C-96,52 -40,76 6,100" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".85"/>`),
    stream:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#79C05A"/><path d="M40,-100 C10,-40 -10,20 -60,100 L60,100 C80,30 100,-40 120,-100Z" fill="#8CCBEA"/>${[[46,-60,18,10],[-6,10,24,12],[54,30,20,11],[-30,62,26,13],[88,-20,16,9]].map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#9AA0A8" stroke="#6E747C" stroke-width="2"/>`).join('')}${[[70,-80],[30,-30],[10,40],[60,70]].map(([x,y])=>`<path d="M${x},${y} q10,10 0,22" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".9"/>`).join('')}<rect x="66" y="-100" width="40" height="22" fill="#FFFFFF" opacity=".75"/>${tuft(-120,-60)}${tuft(-100,40)}${tuft(130,60)}`),
    lake:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#CBEAFF"/><path d="M-150,10 L-90,-60 L-30,0 L30,-74 L100,-6 L150,-40 L150,100 L-150,100Z" fill="#6FAE5A"/><path d="M-150,30 C-80,10 80,8 150,26 L150,100 L-150,100Z" fill="#9CCB6E"/><ellipse cx="0" cy="50" rx="110" ry="34" fill="#2F6FC0"/><ellipse cx="-20" cy="42" rx="60" ry="10" fill="#6FA6E0" opacity=".7"/>${tuft(-130,80)}${tuft(124,84)}`),
    paddy:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#CBEAFF"/><rect x="-150" y="-50" width="300" height="150" fill="#A9D8EE"/><path d="M-150,-50 H150 M-150,10 H150 M-40,-50 L-90,100 M60,-50 L110,100" stroke="#B58B5A" stroke-width="6"/>${[-40,-20,0,24,52,82].map((y,r)=>{const n=8+r,sp=300/n,sc=.55+r*.12;let s='';for(let i=0;i<n;i++)s+=tuft(-150+sp/2+i*sp,y,sc,'#4E9A3A');return s}).join('')}`),
    wetland:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#FFE9C7"/><rect x="-150" y="-100" width="300" height="70" fill="#F9D7A6"/><rect x="-150" y="-20" width="300" height="120" fill="#9C8F7A"/>${[[-90,10,60,9],[40,0,80,8],[-20,46,90,12],[100,60,50,10],[-110,74,40,7]].map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#B7DDF0"/>`).join('')}<path d="M-150,-20 H150" stroke="#C9B48A" stroke-width="3"/>${[[-60,-62],[-40,-70],[60,-58]].map(([x,y])=>`<path d="M${x-8},${y} q8,-6 8,0 q0,-6 8,0" stroke="#3A4A6A" stroke-width="2.5" fill="none"/>`).join('')}${tuft(-130,90,.8,'#6E7A45')}${tuft(130,40,.8,'#6E7A45')}`),
    ecopond:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#9CCB6E"/><rect x="-150" y="-100" width="300" height="40" fill="#CBEAFF"/><rect x="-140" y="-72" width="12" height="44" fill="#7A5A3A"/><circle cx="-134" cy="-80" r="30" fill="#4E9A4A"/><path d="M-100,10 C-110,-30 -40,-40 20,-34 C90,-28 120,0 104,40 C90,74 -60,80 -90,50 C-100,40 -98,24 -100,10Z" fill="#6FB8E0" stroke="#8B6B4A" stroke-width="4"/>${lilyPad(-30,20,18)}${lilyPad(30,40,16)}${[70,82,94].map((x,i)=>`<path d="M${x},${10+i*6} L${x},${-40+i*6}" stroke="#5E8A3A" stroke-width="2.5"/><rect x="${x-4}" y="${-40+i*6}" width="8" height="20" rx="4" fill="#8A5A2A"/>`).join('')}${tuft(-120,80)}${tuft(130,86)}`),
    magnifier:()=>`<rect x="-26" y="40" width="22" height="80" rx="11" transform="rotate(-40)" fill="#3A2A1A"/><circle cx="-20" cy="-20" r="60" fill="#D8F0FF" fill-opacity=".7" stroke="#6E747C" stroke-width="12"/><path d="M-52,-40 A40,40 0 0 1 -30,-62" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    net:()=>`<path d="M-130,90 L10,-30" stroke="#7A5A3A" stroke-width="10" stroke-linecap="round"/><path d="M10,-30 C20,-80 110,-90 120,-40 C100,30 40,40 10,-30Z" fill="#FFFFFF" fill-opacity=".5" stroke="#9AA0A8" stroke-width="5"/>${[0,1,2,3,4].map(i=>`<path d="M${24+i*18},-62 L${30+i*14},16" stroke="#C9CFDA" stroke-width="2"/><path d="M${18},${-50+i*16} L${112},${-56+i*16}" stroke="#C9CFDA" stroke-width="2"/>`).join('')}`,
    obsbox:()=>`<rect x="-100" y="-40" width="200" height="120" rx="10" fill="#DFF3FB" fill-opacity=".7" stroke="#8FB8CC" stroke-width="5"/><rect x="-108" y="-56" width="216" height="22" rx="8" fill="#3F7FC0"/><path d="M-30,-56 C-30,-90 30,-90 30,-56" stroke="#3F7FC0" stroke-width="8" fill="none"/>${[-80,-50,-20,10,40,70].map(x=>`<path d="M${x},-52 L${x+16},-52" stroke="#9CC6E8" stroke-width="3"/>`).join('')}<rect x="-100" y="30" width="200" height="50" fill="#9FD3EA" opacity=".55"/>`,
    trek:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#6E747C"/><path d="M-150,-10 C-60,-30 60,0 150,-20 L150,100 L-150,100Z" fill="#8CCBEA"/>${waves(20)}${waves(54,'#FFFFFF',.8,5)}${[[-110,-40,30,16],[90,-50,36,18],[120,40,28,14]].map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#9AA0A8" stroke="#5E646C" stroke-width="2"/>`).join('')}<path d="M-80,30 L80,10" stroke="#F2D84F" stroke-width="3"/>${person(-70,46)}${person(0,36)}${person(70,28)}`),
    dive:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#1E5F9A"/><rect x="-150" y="-100" width="300" height="40" fill="#3E8ED0"/><path d="M-150,100 C-110,60 -80,70 -60,100Z M60,100 C80,50 120,40 150,70 L150,100Z" fill="#E87A5D"/><path d="M90,100 C96,70 110,60 116,80 C122,60 136,66 134,100Z" fill="#F2B84F"/><g transform="translate(-10,0) rotate(-10)"><rect x="-50" y="-12" width="70" height="24" rx="12" fill="#1E2A45"/><rect x="-36" y="-28" width="40" height="14" rx="7" fill="#F2D84F"/><circle cx="34" cy="-2" r="14" fill="#F3C9A0"/><rect x="28" y="-12" width="18" height="10" rx="4" fill="#9FD3EA" stroke="#1E2A45" stroke-width="2"/><path d="M-50,-6 L-86,-20 L-82,-2Z M-50,6 L-86,14 L-80,24Z" fill="#3F9CC8"/></g>${[[40,-40,5],[50,-60,4],[44,-80,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="2"/>`).join('')}${[[-110,-50],[-90,-30],[100,-20]].map(([x,y])=>`<path d="M${x},${y} c6,-6 14,-6 18,0 c-4,6 -12,6 -18,0Z M${x},${y} l-6,-5 l0,10Z" fill="#F08A24"/>`).join('')}`),
    ship:()=>box(`<rect x="-150" y="-100" width="300" height="200" fill="#CBEAFF"/><rect x="-150" y="10" width="300" height="90" fill="#2F86C9"/>${waves(40)}${waves(76,'#FFFFFF',.6,7)}<path d="M-130,0 L120,0 L104,34 L-114,34Z" fill="#1E2A45"/><path d="M-130,0 L120,0 L118,8 L-128,8Z" fill="#C0533A"/>${[['#E2483D',-110],['#3F9CC8',-80],['#F2B84F',-50],['#4E9A4A',-20],['#E2483D',10],['#3F9CC8',40]].map(([c,x],i)=>`<rect x="${x}" y="-20" width="28" height="20" fill="${c}" stroke="#1E2A45" stroke-width="1"/>${i%2?`<rect x="${x}" y="-40" width="28" height="20" fill="${['#F2B84F','#9B7FD1','#E87A5D'][i%3]}" stroke="#1E2A45" stroke-width="1"/>`:''}`).join('')}<rect x="76" y="-56" width="36" height="56" fill="#FFFFFF" stroke="#9AA0A8" stroke-width="2"/><rect x="82" y="-48" width="24" height="8" fill="#9FD3EA"/>`)
  };
  /* 動物也可以當看圖題的圖 */
  Object.keys(A).forEach(k=>{ART['an_'+k]=()=>`<g transform="scale(1.5)">${A[k]()}</g>`});

  /* ---------- 點圖：魚的構造（課本 p.67） ---------- */
  const FISHP=[
    {k:'scale',n:'鱗',c:[30,-4],a:'<ellipse cx="30" cy="-4" rx="62" ry="30"/>'},
    {k:'mouth',n:'口',c:[-134,6],a:'<circle cx="-134" cy="6" r="18"/>'},
    {k:'gill',n:'鰓蓋',c:[-80,2],a:'<ellipse cx="-80" cy="2" rx="18" ry="40"/>'},
    {k:'dorsal',n:'背鰭',c:[24,-74],a:'<ellipse cx="24" cy="-72" rx="50" ry="24"/>'},
    {k:'tail',n:'尾鰭',c:[150,0],a:'<ellipse cx="150" cy="0" rx="30" ry="52"/>'},
    {k:'pectoral',n:'胸鰭',c:[-46,40],a:'<ellipse cx="-46" cy="40" rx="24" ry="16"/>'},
    {k:'pelvic',n:'腹鰭',c:[16,66],a:'<ellipse cx="16" cy="66" rx="22" ry="16"/>'},
    {k:'anal',n:'臀鰭',c:[76,52],a:'<ellipse cx="76" cy="52" rx="22" ry="16"/>'}
  ];
  const fishBody=()=>{
    let sc='';for(let x=-50;x<=100;x+=16)for(let y=-40;y<=40;y+=14){if(((x-20)/120)**2+(y/52)**2<.9)sc+=`<path d="M${x},${y} a8,8 0 0 0 0,12" stroke="#5E6E4A" stroke-width="1.6" fill="none"/>`;}
    return {
      scale:`<path d="M-136,4 C-120,-52 20,-70 100,-28 C112,-18 118,-8 122,0 C118,8 112,18 100,28 C20,70 -120,58 -136,4Z" fill="#9AAA7E" stroke="#4E5E3E" stroke-width="3"/>${sc}`,
      mouth:`<path d="M-138,0 C-142,4 -142,10 -136,12" stroke="#3E321E" stroke-width="4" fill="none" stroke-linecap="round"/>`,
      gill:`<path d="M-88,-38 C-62,-14 -62,18 -86,42 C-74,18 -74,-14 -88,-38Z" fill="#7A8A5E" stroke="#3E4A2A" stroke-width="2.5"/>`,
      dorsal:`<path d="M-24,-58 C-6,-104 48,-100 74,-38 C40,-48 10,-56 -24,-58Z" fill="#B7A27A" stroke="#6E5A3A" stroke-width="2.5"/>${[-6,12,30,48].map(x=>`<path d="M${x},-58 L${x+8},-90" stroke="#6E5A3A" stroke-width="1.5"/>`).join('')}`,
      tail:`<path d="M118,0 L178,-56 C164,-18 164,18 178,56Z" fill="#B7A27A" stroke="#6E5A3A" stroke-width="2.5" stroke-linejoin="round"/>${[-36,-18,0,18,36].map(y=>`<path d="M124,0 L170,${y}" stroke="#6E5A3A" stroke-width="1.4"/>`).join('')}`,
      pectoral:`<path d="M-64,26 C-44,52 -24,56 -18,46 C-34,36 -50,28 -64,26Z" fill="#C9B48A" stroke="#6E5A3A" stroke-width="2.5"/>`,
      pelvic:`<path d="M-2,50 C8,80 30,84 36,66 C24,58 12,52 -2,50Z" fill="#C9B48A" stroke="#6E5A3A" stroke-width="2.5"/>`,
      anal:`<path d="M58,38 C66,66 88,66 96,48 C84,42 70,40 58,38Z" fill="#C9B48A" stroke="#6E5A3A" stroke-width="2.5"/>`
    };
  };
  const fishWhole=(hi)=>{const B=fishBody();return `${B.dorsal}${B.tail}${B.scale}${B.gill}${B.pectoral}${B.pelvic}${B.anal}${B.mouth}<circle cx="-110" cy="-14" r="9" fill="#FFFFFF" stroke="#3E321E" stroke-width="2"/><circle cx="-108" cy="-14" r="5" fill="#1E2A45"/>${hi?(()=>{const p=FISHP.find(x=>x.k===hi);return `<circle cx="${p.c[0]}" cy="${p.c[1]}" r="${hi==='scale'?40:28}" fill="none" stroke="#E2483D" stroke-width="6"/>`})():''}`};
  const FIG={};
  FIG.fish={
    parts:FISHP,quizQ:'圖中圈起來的是魚的哪一個部位？',
    svg:()=>{const B=fishBody();const g=(k,shape)=>`<g class="hs" data-part="${k}">${shape}<g class="hs-a">${FISHP.find(p=>p.k===k).a}</g></g>`;
      return `<g transform="translate(410,290) scale(1.7)">${g('dorsal',B.dorsal)}${g('tail',B.tail)}${g('scale',B.scale)}${g('gill',B.gill)}${g('pectoral',B.pectoral)}${g('pelvic',B.pelvic)}${g('anal',B.anal)}${g('mouth',B.mouth)}<circle cx="-110" cy="-14" r="9" fill="#FFFFFF" stroke="#3E321E" stroke-width="2" pointer-events="none"/><circle cx="-108" cy="-14" r="5" fill="#1E2A45" pointer-events="none"/></g>`},
    mini:{vb:'-190 -120 390 210',svg:p=>fishWhole(p)}
  };

  /* ---------- 點圖：蓮（課本 p.58～59） ---------- */
  const LOTP=[{k:'leaf',n:'葉片'},{k:'flower',n:'花'},{k:'stalk',n:'葉柄'},{k:'root',n:'蓮藕'},{k:'pod',n:'蓮蓬'}];
  const LOTC={leaf:[270,168],flower:[470,148],stalk:[300,300],root:[400,416],pod:[600,172]};
  const lotusScene=(hi,interactive)=>{
    const g=(k,shape,a)=>interactive?`<g class="hs" data-part="${k}">${shape}<g class="hs-a">${a}</g></g>`:shape;
    return `<rect x="0" y="200" width="800" height="250" fill="#7CC3E6" opacity=".8"/><path d="M0,200 H800" stroke="#FFFFFF" stroke-width="3" opacity=".8"/><rect x="0" y="384" width="800" height="66" fill="#8B6B4A"/>
      ${g('stalk',`<path d="M330,388 C320,320 300,240 280,170" stroke="#5E8A3A" stroke-width="7" fill="none"/>`,`<rect x="270" y="210" width="60" height="170" rx="20"/>`)}
      <path d="M400,388 C410,300 450,220 468,150" stroke="#5E8A3A" stroke-width="6" fill="none" pointer-events="none"/><path d="M470,388 C500,300 570,230 600,184" stroke="#5E8A3A" stroke-width="6" fill="none" pointer-events="none"/>
      ${g('root',rhizome(400,414,.8),`<rect x="290" y="390" width="220" height="50" rx="20"/>`)}
      ${g('leaf',lotusLeaf(270,170,90),`<ellipse cx="270" cy="150" rx="96" ry="34"/>`)}
      ${g('flower',lotusFlower(468,150,1.1),`<circle cx="468" cy="124" r="44"/>`)}
      ${g('pod',lotusPod(600,180,1.6),`<circle cx="600" cy="176" r="40"/>`)}
      ${hi?`<circle cx="${LOTC[hi][0]}" cy="${LOTC[hi][1]}" r="${hi==='root'?70:hi==='stalk'?60:50}" fill="none" stroke="#E2483D" stroke-width="7"/>`:''}`;
  };
  FIG.lotus={parts:LOTP,quizQ:'圖中圈起來的是蓮的哪一個部位？',svg:()=>lotusScene(null,true),mini:{vb:'160 80 520 370',svg:p=>`<rect x="160" y="80" width="520" height="370" fill="#E8F6FD"/>${lotusScene(p,false)}`}};

  /* ---------- 點圖：池塘裡的水生動物（課本 p.64～65） ---------- */
  const PONDP=[
    {k:'turtle',n:'龜',x:150,y:176,s:.9},{k:'frog',n:'青蛙',x:690,y:186,s:.9},{k:'fish',n:'魚',x:410,y:250,s:1},
    {k:'bug',n:'紅娘華',x:600,y:290,s:.9},{k:'shrimp',n:'蝦',x:200,y:318,s:.8},{k:'tadpole',n:'蝌蚪',x:380,y:390,s:.8},
    {k:'snail',n:'螺',x:540,y:400,s:.8},{k:'crab',n:'蟹',x:700,y:400,s:.8}
  ];
  FIG.pond={
    parts:PONDP,quizQ:'這是哪一種水生動物？',
    svg:()=>`<rect x="0" y="0" width="800" height="200" fill="#DFF3D8"/><path d="M0,190 C40,150 200,150 250,196 Z" fill="#9AA0A8" stroke="#6E747C" stroke-width="3"/><path d="M600,214 C640,160 760,150 800,160 L800,230 Z" fill="#8BC86A"/><rect x="0" y="200" width="800" height="250" fill="#7CC3E6"/><path d="M0,200 H800" stroke="#FFFFFF" stroke-width="3" opacity=".8"/><path d="M0,430 C200,410 500,416 800,428 L800,450 L0,450Z" fill="#8B6B4A"/><path d="M470,420 L640,404" stroke="#7A5A3A" stroke-width="16" stroke-linecap="round"/>${tuft(40,450,1.4)}${tuft(780,450,1.4)}
      ${PONDP.map(p=>`<g class="hs" data-part="${p.k}"><g transform="translate(${p.x},${p.y}) scale(${p.s})">${A[p.k==='tadpole'?'tadpole':p.k]()}${p.k==='tadpole'?`<g transform="translate(-40,18) scale(.7)">${A.tadpole()}</g><g transform="translate(30,26) scale(.6)">${A.tadpole()}</g>`:''}</g><g class="hs-a"><circle cx="${p.x}" cy="${p.y}" r="58"/></g></g>`).join('')}`,
    mini:{vb:'-90 -70 180 140',svg:p=>`<rect x="-90" y="-70" width="180" height="140" rx="16" fill="#E8F6FD"/>${A[p]()}`}
  };

  /* ---------- 放位置：水池剖面（課本 p.62～63） ---------- */
  const SY=200;
  const ZONES=[
    {k:'float',n:'①',d:'浮在水面上，根漂在水裡',x:40,y:150,w:200,h:150},
    {k:'sub',n:'②',d:'整株在水中，根長在土裡',x:252,y:226,w:180,h:178},
    {k:'leaf',n:'③',d:'葉片平貼水面，根長在土裡',x:444,y:160,w:166,h:236},
    {k:'emerge',n:'④',d:'葉挺出水面，根長在土裡（水位較淺處）',x:622,y:122,w:162,h:196}
  ];
  const PLANTS={
    hyacinth:{n:'布袋蓮',at:{float:x=>hyacinth(140,SY+8,1.3)},icon:()=>hyacinth(0,10,1.4)},
    lettuce:{n:'大萍',at:{float:x=>lettuce(140,SY+6,1.4)},icon:()=>lettuce(0,12,1.6)},
    weed:{n:'水蘊草',at:{sub:x=>weed(342,410,236)},icon:()=>`<g transform="translate(0,6) scale(.75)">${weed(0,100,-110)}</g>`},
    lily:{n:'睡蓮',at:{leaf:x=>waterlily(527,398,SY,.7)},icon:()=>`<g transform="scale(.6)">${waterlily(0,120,-40,.7)}</g>`},
    lotus:{n:'蓮',at:{emerge:x=>lotus(703,306,SY)},icon:()=>`<g transform="translate(0,-10) scale(.7)">${lotus(0,80,10)}</g>`}
  };
  FIG.pool={
    zones:ZONES,
    item:k=>PLANTS[k].icon(),
    svg:(placed=[])=>`<rect x="0" y="0" width="800" height="${SY}" fill="#DFF3FB"/><rect x="0" y="${SY}" width="800" height="250" fill="#7CC3E6"/><path d="M0,${SY} H800" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><path d="M0,410 L430,410 C520,410 560,380 620,330 L800,300 L800,450 L0,450Z" fill="#8B6B4A"/>
      ${placed.map(p=>`<g class="pop-in">${PLANTS[p.item].at[p.zone]()}</g>`).join('')}
      ${ZONES.map(z=>{const has=placed.find(p=>p.zone===z.k);return `<g class="zone" data-zone="${z.k}"><rect class="z-a" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="18" ${has?'style="stroke-dasharray:0;stroke:#2F9E44;fill:rgba(47,158,68,.08)"':''}/>${has?`<text x="${z.x+z.w/2}" y="${z.y+z.h-12}" text-anchor="middle" class="fig-l">${PLANTS[has.item].n}</text>`:`<text x="${z.x+z.w/2}" y="${z.y+30}" text-anchor="middle" class="z-n">${z.n}</text>`}</g>`}).join('')}`
  };

  /* ---------- 水位玩具（2-2 柔軟的身體，課本 p.60～61）：h=1 水位高、0 水位低 ---------- */
  function waterToy(h){
    const sy=150+(1-h)*130,by=404;
    const depth=by-sy,L=262,sp=Math.sqrt(Math.max(0,L*L-depth*depth))/90;
    const v=Math.min(212,by-(sy+30)),top=by-v,bend=Math.sqrt(Math.max(0,212*212-v*v));
    return `<rect width="800" height="450" fill="#DFF3FB"/><rect x="0" y="${sy}" width="800" height="${450-sy}" fill="#7CC3E6"/><path d="M0,${sy} H800" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><rect x="0" y="${by}" width="800" height="${450-by}" fill="#8B6B4A"/>
      <path d="M40,150 H70 M40,280 H70" stroke="#2C6F93" stroke-width="3"/><text x="78" y="157" class="fig-l">水位高</text><text x="78" y="287" class="fig-l">水位低</text>
      ${waterlily(280,by,sy,Math.max(.25,Math.min(1.6,sp)))}
      ${weed(520,by,top,bend)}
      <text x="280" y="438" text-anchor="middle" class="fig-l">睡蓮</text><text x="520" y="438" text-anchor="middle" class="fig-l">水蘊草</text>`;
  }

  /* ---------- 每一節的背景 ---------- */
  const BG={
    '2-1':()=>`<rect width="800" height="450" fill="#CBEAFF"/><path d="M0,300 C160,250 320,280 480,260 C620,244 720,262 800,250 L800,450 L0,450Z" fill="#8BC86A"/><path d="M0,380 C200,350 420,400 800,360 L800,450 L0,450Z" fill="#6FB8E0"/>`,
    '2-2':()=>`<rect width="800" height="450" fill="#DFF3FB"/><rect y="230" width="800" height="220" fill="#7CC3E6"/>${lilyPad(60,240,34)}${lilyPad(740,236,30)}`,
    '2-3':()=>`<rect width="800" height="450" fill="#5FA9D0"/><rect width="800" height="160" fill="#7CC3E6"/><path d="M0,420 C200,400 500,410 800,418 L800,450 L0,450Z" fill="#C9B48A"/>${[[40,120,8],[60,80,5],[760,140,7],[740,100,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>`).join('')}`,
    '2-4':()=>`<rect width="800" height="450" fill="#CBEAFF"/><rect y="200" width="800" height="250" fill="#2F86C9"/><path d="M0,360 C200,330 400,370 800,340 L800,450 L0,450Z" fill="#EBD9A8"/>`,
    'all':()=>`<rect width="800" height="450" fill="#CBEAFF"/><rect y="230" width="800" height="220" fill="#7CC3E6"/>${waves(0)}`
  };

  return {ART,FIG,A,BG,PLANTS,waterToy,lilyPad,hyacinth,lettuce,weed,waterlily,lotus,lotusLeaf,lotusFlower,tuft};
})();
Object.assign(DRILL.ART,SCI2ART.ART);
Object.assign(DRILL.FIG,SCI2ART.FIG);
