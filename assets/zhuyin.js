/* 皮皮學習樂園：注音顯示（國語科）。
   讀音資料由 design/tools/zhuyin.py 產生（ZY.add），本檔負責把頁面上的國字加上注音：
   每個字包成 <span class="zy" data-s="ㄓㄨㄤ" data-t="ˋ">壯</span>，注音用 CSS 畫在字的右邊，
   所以 textContent 和朗讀都不會帶到注音符號。
   ZY.watch(selector) 之後，符合 selector 的區塊裡新出現的文字都會自動加上注音。 */
window.ZY = (() => {
  const RUN = {}, CH = {};
  const CJK = /[㐀-鿿豈-﫿]+/g;
  const TONES = 'ˊˇˋ˙';
  function add(runs) {
    for (const [run, s] of Object.entries(runs)) {
      const syl = s.split(' ');
      RUN[run] = syl;
      [...run].forEach((c, i) => { if (!CH[c]) CH[c] = syl[i]; });   // fallback for text not seen by the tool
    }
  }
  function syllables(run) {
    return RUN[run] || [...run].map(c => CH[c] || '');
  }
  function split(s) {                       // 'ㄇㄣ˙' -> ['ㄇㄣ','˙']
    const last = s.slice(-1);
    return TONES.includes(last) ? [s.slice(0, -1), last] : [s, ''];
  }
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function cell(c, s) {
    if (!s) return esc(c);
    const [sym, tone] = split(s);
    return `<span class="zy n${[...sym].length}${tone === '˙' ? ' lt' : ''}" data-s="${sym}" data-t="${tone}">${c}</span>`;
  }
  /* text -> HTML with zhuyin */
  function html(text) {
    let out = '', last = 0;
    String(text).replace(CJK, (run, at) => {
      out += esc(text.slice(last, at));
      const syl = syllables(run);
      [...run].forEach((c, i) => { out += cell(c, syl[i]); });
      last = at + run.length;
    });
    out += esc(String(text).slice(last));
    /* keep punctuation on the same line as its character (no line may start with ，。 or end with 「) */
    return out
      .replace(/(<span class="zy[^"]*"[^>]*>[^<]*<\/span>)([，。、！？；：」』）…—]+)/g, '<span class="zyw">$1$2</span>')
      .replace(/([「『（]+)(<span class="zy[^"]*"[^>]*>[^<]*<\/span>)/g, '<span class="zyw">$1$2</span>');
  }
  const SKIP = 'svg,script,style,.zy,.zyw,[data-nozy],textarea,input,.tool,.chip,.card-btn,.hz-btn,.task>b,.big-start,.primary-btn,.ghost-btn,.qnum,#progress,.more';   /* buttons keep plain labels */
  function annotate(root) {
    if (!root) return;
    if (root.nodeType === 3) { annotateText(root); return; }
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (CJK.test(n.data) && (CJK.lastIndex = 0, !n.parentElement.closest(SKIP))) ? 1 : 3
    });
    const list = [];
    while (walker.nextNode()) list.push(walker.currentNode);
    list.forEach(annotateText);
  }
  function annotateText(node) {
    CJK.lastIndex = 0;
    if (!node.parentNode || !CJK.test(node.data) || node.parentElement.closest(SKIP)) return;
    CJK.lastIndex = 0;
    const tpl = document.createElement('template');
    tpl.innerHTML = html(node.data);
    node.replaceWith(tpl.content);
  }
  let scope = null;
  const inScope = el => el && el.closest && el.closest(scope);
  function watch(selector) {
    scope = selector;
    document.querySelectorAll(selector).forEach(annotate);
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'characterData') { const p = m.target.parentElement; if (inScope(p)) annotateText(m.target); continue; }
        m.addedNodes.forEach(n => {
          const el = n.nodeType === 1 ? n : n.parentElement;
          if (!el) return;
          if (inScope(el)) annotate(n);
          else if (n.nodeType === 1) n.querySelectorAll(selector).forEach(annotate);
        });
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  return { add, html, annotate, watch, syllables, one: cell };
})();
