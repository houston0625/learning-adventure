/* 皮皮學習樂園：成語挑戰（每一課的 idioms-N.html 共用）。載入順序：pikmin.js → 這一課的 IDIOMS → idioms.js
   成語挑戰不加注音（使用者 2026-10-13 決定）。
   IDIOMS = {
     bank: [{w:'成語', m:'意思', qs:[...6 題]}],   每題 {k:'mean'|'fill'|'tf'|'spell', q, opts, a, why}
            mean：q 不用寫（自動是「『成語』是什麼意思？」）；fill：句子裡用（_）表示空格；
            tf：a 是 true/false，用得不對時 why 寫原因；spell：q 可以省略。opts 的 a 是正確選項的位置。
     cover: ['封面上的四個成語'], coverInk:'#A8281F', coverLine:'#E2A8A0', coverBg:'#FFF1D6'
   }
   規則：每次打開（或按「換一組題目」），每個成語隨機抽一題；成語的順序、選項的順序也打亂。 */
(() => {
const $ = s => document.querySelector(s);
const { pikG, pikAt, shuffle, KEYS } = Pik;
const { bank, cover = [], coverInk = '#A8281F', coverLine = '#E2A8A0', coverBg = '#FFF1D6' } = IDIOMS;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.6 8.6 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

/* ---------- voice and sounds ---------- */
let voice = null;
function pickVoice() { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /zh[-_]TW/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null; }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/[「」（）()_]/g, ' ')); u.lang = 'zh-TW'; if (voice) u.voice = voice; u.rate = .92; u.pitch = 1.15; speechSynthesis.speak(u); } catch (e) {} }
let actx = null;
function tone() {}   /* 音效全部關掉（使用者 2026-10-18 決定） */
const sfx = { pop: () => tone([620], .06, 'triangle', .08), good: () => tone([660, 880, 1175]), bad: () => tone([240, 190], .15, 'square', .05), win: () => tone([523, 659, 784, 1046, 1318]) };

/* ---------- questions ---------- */
const KIND = { mean: '意思', fill: '填空', tf: '用得對不對', spell: '正確寫法' };
/* the heading above each question; fill and tf questions show their sentence below it */
const head = (b, x) => x.k === 'fill' ? '選出最適合放進括號裡的成語。' : x.k === 'tf' ? '下面這句話，成語用得對不對？' : x.k === 'mean' ? `「${b.w}」是什麼意思？` : x.q || '選出寫法正確的成語。';
const label = (x, v) => x.k === 'tf' ? (v ? '對' : '不對') : x.opts[v];

let S;
function fresh() {
  S = { list: shuffle(bank.map(b => { const x = b.qs[Math.floor(Math.random() * b.qs.length)]; return { b, x, perm: x.k === 'tf' ? [true, false] : shuffle(x.opts.map((_, i) => i)) }; })), sub: false };
  S.ans = S.list.map(() => null);
}
const isRight = i => S.ans[i] === S.list[i].x.a;
const nRight = () => S.list.filter((_, i) => isRight(i)).length;

/* ---------- render ---------- */
function body(i) {
  const { b, x, perm } = S.list[i], a = S.ans[i];
  const sent = x.k === 'fill' ? `<p class="sent">${x.q.split('（_）').map(esc).join('<span class="blank">（　　）</span>')}</p>`
             : x.k === 'tf' ? `<p class="sent">${esc(x.q)}</p>` : '';
  const cls = v => { let c = 'opt'; if (x.k === 'spell' || x.k === 'fill') c += ' word'; if (a === v) c += ' sel'; if (S.sub) { if (v === x.a) c += ' correct'; else if (a === v) c += ' wrongpick'; } return c; };
  const opts = `<div class="opts">${perm.map(v => `<button class="${cls(v)}" data-i="${i}" data-v="${v}" ${S.sub ? 'disabled' : ''}>${label(x, v)}</button>`).join('')}</div>`;
  let fb = '';
  if (S.sub) {
    const ok = isRight(i);
    const why = x.k === 'tf' && !x.a ? `這句話用得不對：${x.why}<br>` : '';
    fb = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? '答對了！' : '正確答案：' + label(x, x.a)}</b><br>${why}${b.w}：${b.m}</div>`;
  }
  return `${sent}${opts}${fb}`;
}
function render() {
  $('#qlist').innerHTML = S.list.map(({ b, x }, i) => {
    const cls = S.sub ? (isRight(i) ? 'right' : 'wrong') : '';
    return `<article class="qc ${cls}" id="q${i}"><div class="qh"><span class="qn">第 ${i + 1} 題</span><span class="qt">${KIND[x.k]}</span><button class="spk" data-say="${i}" aria-label="聽題目">${SPK}</button></div>
      <p class="qhead">${esc(head(b, x))}</p>${body(i)}</article>`;
  }).join('');
  const n = S.ans.filter(v => v !== null).length;
  $('#bar').innerHTML = S.sub
    ? `<span class="prog">答對 ${nRight()} / ${S.list.length} 題</span><button class="btn" id="again">換一組題目</button>`
    : `<span class="prog" id="prog">已作答 ${n} / ${S.list.length}</span><button class="btn ghost" id="again">換一組題目</button><button class="btn" id="submit">交卷</button>`;
  bind(); renderResult();
}
function bind() {
  document.querySelectorAll('[data-say]').forEach(el => el.onclick = () => {
    const { b, x } = S.list[+el.dataset.say];
    const opts = x.k === 'tf' ? '對，還是不對？' : x.opts.join('，');
    say(x.k === 'fill' ? `${head(b, x)}${x.q.replace('（_）', '，空格，')} 選項：${opts}` : x.k === 'tf' ? `${head(b, x)}${x.q}` : `${head(b, x)} 選項：${opts}`);
  });
  document.querySelectorAll('.opt').forEach(el => el.onclick = () => {
    const i = +el.dataset.i, raw = el.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : +raw;
    S.ans[i] = v; sfx.pop();
    const { x } = S.list[i]; if (x.k === 'fill' || x.k === 'spell') say(x.opts[v]);
    render();
  });
  const sub = $('#submit');
  if (sub) sub.onclick = () => {
    const k = S.ans.findIndex(v => v === null);
    if (k >= 0) { const p = $('#prog'); p.textContent = `第 ${k + 1} 題還沒有作答喔！`; p.classList.add('warn'); $('#q' + k).scrollIntoView({ behavior: 'smooth', block: 'center' }); say(`第 ${k + 1} 題還沒有作答喔！`); sfx.bad(); return; }
    S.sub = true;
    nRight() >= S.list.length * .75 ? sfx.win() : sfx.good();
    render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  $('#again').onclick = () => { fresh(); sfx.pop(); render(); window.scrollTo(0, 0); };
}
function renderResult() {
  if (!S.sub) { $('#result').innerHTML = ''; return; }
  const n = nRight(), all = S.list.length;
  const msg = n === all ? '全部答對！你是成語大師！' : n >= all * .75 ? '好厲害！看看答錯的題目，下次就全對了！' : n >= all * .5 ? '不錯喔！看看解說，再挑戰一次！' : '沒關係！看看每個成語的意思，我們再試一次！';
  $('#result').innerHTML = `<section class="result"><div class="sc">${n}<small> / ${all}</small></div><div style="flex:1;min-width:200px"><p><b>${msg}</b></p><p>答對 ${n} 題，答錯 ${all - n} 題。按「換一組題目」，會出現新的題目喔！</p></div><div class="crew">${KEYS.map(k => `<svg viewBox="-5 -24 110 178" aria-hidden="true"><g class="pik wave">${pikG(k)}</g></svg>`).join('')}</div></section>`;
  say(`你答對了 ${n} 題！${msg}`);
}

/* ---------- cover: four idiom cards and four characters ---------- */
$('#howto').textContent = `${bank.length} 個成語，每個成語出一題。每次打開或按「換一組題目」，題目都不一樣喔！選好答案後按「交卷」。`;
$('#coverArt').innerHTML = `<rect width="1000" height="220" fill="${coverBg}"/>
  ${cover.slice(0, 4).map((w, i) => `<g transform="translate(${[30, 40, 820, 810][i]},${[30, 96, 30, 96][i]}) rotate(${i % 2 ? 4 : -4})"><rect width="150" height="46" rx="10" fill="#FFFFFF" stroke="${coverLine}" stroke-width="3"/><text x="75" y="32" text-anchor="middle" font-size="24" fill="${coverInk}" font-family="BiauKai,DFKai-SB,serif">${w}</text></g>`).join('')}
  <path d="M0,170 C250,150 500,166 750,160 C850,158 930,152 1000,160 L1000,220 L0,220Z" fill="#E9C98A"/>
  ${shuffle([...KEYS]).slice(0, 4).map((k, i) => pikAt(k, 120 + i * 250, 214, .4, i % 2 ? '' : 'wave')).join('')}`;
fresh(); render();
/* for tests: window.__idioms.state() */
window.__idioms = { state: () => S, render };
})();
