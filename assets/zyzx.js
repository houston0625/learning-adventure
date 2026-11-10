/* 皮皮學習樂園：國語「字音字形」測驗（chinese/zyzx/test-N.html 共用）。
   載入順序：pikmin.js → zyzx-data.js（window.ZYZX，4 卷 × 100 題）→ 頁面設定 ZYZX_PAGE = 1～8 → zyzx.js
   每頁 50 題：第 1、2 頁是字音（一）1～50、51～100，第 3、4 頁字形（一），第 5、6 頁字音（二），第 7、8 頁字形（二）。
   題目照順序出，選項順序每次打亂；全部作答完按「交卷」，每題 2 分。不朗讀（念出來就知道答案了）。 */
(() => {
const $ = s => document.querySelector(s);
const { pikG, pikAt, shuffle, KEYS } = Pik;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const page = ZYZX_PAGE;
const sheet = ZYZX[Math.floor((page - 1) / 2)];
const first = (page - 1) % 2 ? 51 : 1;
const items = sheet.items.slice(first - 1, first + 49);
const yin = sheet.kind === 'yin';

let S;
function fresh() {
  S = { order: items.map(it => shuffle([it.a, ...it.o])), ans: items.map(() => null), sub: false };
}
const isRight = i => S.ans[i] === items[i].a;
const nRight = () => items.filter((_, i) => isRight(i)).length;

/* the word with the asked character marked: 字音 highlights it, 字形 leaves a blank */
function word(it) {
  const w = [...it.w], k = it.p - 1;
  const mid = yin ? `<b class="tg">${esc(w[k])}</b>` : `<span class="gap">（　　）</span>`;
  return esc(w.slice(0, k).join('')) + mid + esc(w.slice(k + 1).join(''));
}
function render() {
  $('#qlist').innerHTML = items.map((it, i) => {
    const n = first + i, a = S.ans[i];
    const cls = S.sub ? (isRight(i) ? 'right' : 'wrong') : '';
    const opts = S.order[i].map(o => {
      let c = 'opt ' + (yin ? 'zy' : 'hz');
      if (a === o) c += ' sel';
      if (S.sub) { if (o === it.a) c += ' correct'; else if (a === o) c += ' wrongpick'; }
      return `<button class="${c}" data-i="${i}" data-v="${esc(o)}" ${S.sub ? 'disabled' : ''}>${esc(o)}</button>`;
    }).join('');
    const fb = S.sub && !isRight(i) ? `<div class="fb no"><b>正確答案：${esc(it.a)}</b>　${esc(it.w)}</div>` : '';
    return `<article class="qc ${cls}" id="q${i}"><div class="qh"><span class="qn">第 ${n} 題</span></div>
      <p class="word">${word(it)}</p><div class="opts">${opts}</div>${fb}</article>`;
  }).join('');
  const done = S.ans.filter(v => v !== null).length;
  $('#bar').innerHTML = S.sub
    ? `<span class="prog">${nRight() * 2} 分（答對 ${nRight()} / 50 題）</span><button class="btn ghost" id="again">再做一次</button>${page < 8 ? `<a class="btn" href="test-${page + 1}.html">下一頁</a>` : ''}`
    : `<span class="prog" id="prog">已作答 ${done} / 50</span><button class="btn" id="submit">交卷</button>`;
  bind(); renderResult();
}
function bind() {
  document.querySelectorAll('.opt').forEach(el => el.onclick = () => { S.ans[+el.dataset.i] = el.dataset.v; render(); });
  const sub = $('#submit');
  if (sub) sub.onclick = () => {
    const k = S.ans.findIndex(v => v === null);
    if (k >= 0) { const p = $('#prog'); p.textContent = `第 ${first + k} 題還沒有作答喔！`; p.classList.add('warn'); $('#q' + k).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    S.sub = true; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const ag = $('#again'); if (ag) ag.onclick = () => { fresh(); render(); window.scrollTo(0, 0); };
}
function renderResult() {
  if (!S.sub) { $('#result').innerHTML = ''; return; }
  const n = nRight(), s = n * 2;
  const msg = s === 100 ? '全部答對！你是字音字形大師！' : s >= 80 ? '好厲害！看看答錯的題目，下次就全對了！' : s >= 60 ? '不錯喔！把答錯的題目再看一次。' : '沒關係！看看正確答案，我們再試一次！';
  $('#result').innerHTML = `<section class="result"><div class="sc">${s}<small> 分</small></div><div style="flex:1;min-width:200px"><p><b>${msg}</b></p><p>答對 ${n} 題，答錯 ${50 - n} 題。答錯的題目下面有正確答案。</p></div><div class="crew">${KEYS.map(k => `<svg viewBox="-5 -24 110 178" aria-hidden="true"><g class="pik wave">${pikG(k)}</g></svg>`).join('')}</div></section>`;
}

/* ---------- header, page tabs, cover ---------- */
const NAMES = ['字音（一）', '字音（一）', '字形（一）', '字形（一）', '字音（二）', '字音（二）', '字形（二）', '字形（二）'];
$('#unitLine').textContent = `${sheet.name}　第 ${first}～${first + 49} 題`;
$('#howto').textContent = yin ? '看看詞語裡顏色不一樣的字，選出它正確的注音。50 題都選好以後，按「交卷」。' : '選出括號裡應該填的正確國字。50 題都選好以後，按「交卷」。';
$('#pages').innerHTML = NAMES.map((nm, k) => `<a class="pg ${k + 1 === page ? 'on' : ''}" href="test-${k + 1}.html"><b>${k + 1}</b>${nm}<small>${k % 2 ? '51～100' : '1～50'}</small></a>`).join('');
$('#coverArt').innerHTML = `<rect width="1000" height="220" fill="${yin ? '#E2F5FD' : '#FDE4E1'}"/>
  <path d="M0,170 C250,150 500,166 750,160 C850,158 930,152 1000,160 L1000,220 L0,220Z" fill="#E9C98A"/>
  ${shuffle([...KEYS]).slice(0, 4).map((k, i) => pikAt(k, 120 + i * 250, 214, .4, i % 2 ? '' : 'wave')).join('')}`;
fresh(); render();
window.__zyzx = { state: () => S, items, render };
})();
