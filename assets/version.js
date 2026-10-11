/* 皮皮學習樂園：首頁歡迎詞旁邊的版本號、最後更新日期和「更新歷程」視窗（資料在 assets/changelog.js）。
   每一版一行「## V1.2.3 — 2026-10-11 14:30 — 標題」，最新的在最上面。 */
(() => {
  const $ = id => document.getElementById(id);
  const esc = t => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtD = d => d.replace(/^(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');   /* 2026-10-11 21:31 → 2026/10/11 21:31 */
  function parse(md) {
    const vers = [];
    for (const line of md.split(/\r?\n/)) {
      const h = line.match(/^##\s+V?(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?(?:\s*[—–-]\s*(.+))?/);
      if (h) vers.push({ v: h[1], d: h[2] + (h[3] ? ' ' + h[3].padStart(5, '0') : ''), t: (h[4] || '').trim() });
    }
    return vers;
  }
  /* data comes from assets/changelog.js (loaded with a <script> tag, so it also works when index.html is opened as a file) */
  Promise.resolve(window.CHANGELOG || '')
    .then(md => {
      const vers = parse(md);
      if (!vers.length) throw new Error('no versions');
      $('verNum').textContent = 'V' + vers[0].v;
      $('verDate').textContent = '最後更新：' + fmtD(vers[0].d);
      $('verList').innerHTML = `<ul class="ver-list">${vers.map(x =>
        `<li><span class="v">V${esc(x.v)}</span><span class="d">${fmtD(x.d)}</span><span class="t">${esc(x.t)}</span></li>`).join('')}</ul>`;
      const pane = $('verPane'), btn = $('verBtn');
      btn.hidden = false;
      btn.onclick = () => { pane.hidden = false; $('verClose').focus(); };
      const close = () => { pane.hidden = true; btn.focus(); };
      $('verClose').onclick = close;
      pane.onclick = e => { if (e.target === pane) close(); };
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) close(); });
    })
    .catch(() => {});
})();
