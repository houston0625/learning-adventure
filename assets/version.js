/* 皮皮學習樂園：首頁的版本號、最後更新日期和「修改歷程」視窗。
   內容讀自 repo 最上層的 CHANGELOG.md：每一版是一行「## V1.2.3 — 2026-10-11」，下面每一項用「- 」開頭。 */
(() => {
  const $ = id => document.getElementById(id);
  const esc = t => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtD = d => d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1/$2/$3');
  function parse(md) {
    const vers = [];
    let cur = null;
    for (const line of md.split(/\r?\n/)) {
      const h = line.match(/^##\s+V?(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})/);
      if (h) { cur = { v: h[1], d: h[2], items: [] }; vers.push(cur); continue; }
      const it = line.match(/^\s*[-*]\s+(.+)/);
      if (it && cur) cur.items.push(it[1].trim());
    }
    return vers;
  }
  fetch('CHANGELOG.md', { cache: 'no-cache' })
    .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
    .then(md => {
      const vers = parse(md);
      if (!vers.length) throw new Error('no versions');
      $('verNum').textContent = 'V' + vers[0].v;
      $('verDate').textContent = '最後更新：' + fmtD(vers[0].d);
      $('verList').innerHTML = vers.map(x =>
        `<section class="ver-item"><h3>V${esc(x.v)}<small>${fmtD(x.d)}</small></h3><ul>${x.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('');
      const pane = $('verPane'), btn = $('verBtn');
      btn.hidden = false;
      btn.onclick = () => { pane.hidden = false; $('verClose').focus(); };
      const close = () => { pane.hidden = true; btn.focus(); };
      $('verClose').onclick = close;
      pane.onclick = e => { if (e.target === pane) close(); };
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) close(); });
    })
    .catch(() => { $('verNum').textContent = ''; });
})();
