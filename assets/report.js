/* 皮皮學習樂園：「回報問題」（首頁歡迎詞旁）。
   先在網站上選好科目、單元、課（選項讀 assets/catalog.js），再打開 Google 表單（要求登入，自動記錄 Email），
   科目／單元／課／網站版本會自動帶入表單。表單的建立方法見 design/report-form/設定步驟.md。
   REPORT_FORM.url 還沒設定時，正式網站不顯示按鈕；本機預覽會顯示，按「下一步」只會顯示將帶入的內容。 */
const REPORT_FORM = {
  url: '',                       // 例：https://docs.google.com/forms/d/e/……/viewform
  entry: { subject: '', unit: '', lesson: '', version: '' }   // 例：'entry.123456789'
};
(() => {
  const C = (window.CATALOG || []).filter(s => s.open);   /* only subjects that are open (catalog.js: open:true) */
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const WHOLE_SUBJECT = '整個科目', WHOLE_UNIT = '整個單元（不確定是哪一課）', SITE = { id: 'site', name: '整個網站', open: false, units: [] };
  const ready = !!(REPORT_FORM.url && REPORT_FORM.entry.subject);

  /* ---------- the dialog ---------- */
  const pane = document.createElement('div');
  pane.className = 'ver-pane'; pane.id = 'repPane'; pane.hidden = true;
  pane.setAttribute('role', 'dialog'); pane.setAttribute('aria-modal', 'true'); pane.setAttribute('aria-labelledby', 'repTitle');
  pane.innerHTML = `<form class="ver-card rep" id="repForm" novalidate>
    <h2 id="repTitle">回報問題</h2>
    <p class="rep-lead">發現錯字、讀音不對、按鈕壞掉……告訴我們，我們會盡快修正！先選是哪裡的問題：</p>

    <fieldset class="rep-f"><legend>1. 哪一科？<b>必填</b></legend>
      <div class="rep-chips" id="repSubj">${C.concat([SITE]).map(s => `<button type="button" class="rep-chip" data-s="${s.id}">${esc(s.name)}</button>`).join('')}</div>
    </fieldset>

    <div class="rep-two">
      <label class="rep-f"><span class="rep-l">2. 哪一個單元？<b>必填</b></span><select id="repUnit" disabled><option value="">先選科目</option></select></label>
      <label class="rep-f"><span class="rep-l">3. 哪一課？</span><select id="repLesson" disabled><option value="">先選單元</option></select></label>
    </div>

    <p class="rep-note">按「下一步」會打開 Google 表單（需要登入 Google 帳號），科目、單元、課會自動帶入，再填寫問題說明就可以送出。</p>
    <p class="rep-err" id="repErr" role="alert"></p>
    <div class="rep-btns"><button type="button" class="rep-cancel" id="repCancel">取消</button><button type="submit" class="ver-close" id="repSend">下一步</button></div>
  </form>
  <div class="ver-card rep-done" id="repDone" hidden>
    <h2>測試模式</h2>
    <p>回報表單還沒接上 Google 表單，下面是會自動帶入的內容：</p>
    <pre class="rep-pre" id="repPre"></pre>
    <button type="button" class="ver-close" id="repClose">好</button>
  </div>`;
  document.body.appendChild(pane);

  const form = $('repForm'), unitSel = $('repUnit'), lessonSel = $('repLesson');
  let subjId = null;
  const subj = () => C.concat([SITE]).find(x => x.id === subjId);
  const clearErr = () => { $('repErr').textContent = ''; };

  function fillUnits() {
    const s = subj();
    if (!s) return;
    const opts = s.open && s.units.length ? s.units.map(u => u.name) : [s.id === 'site' ? '首頁或整個網站' : WHOLE_SUBJECT];
    unitSel.innerHTML = (opts.length > 1 ? '<option value="">請選擇</option>' : '') + opts.map(o => `<option>${esc(o)}</option>`).join('');
    unitSel.disabled = false;
    fillLessons();
  }
  function fillLessons() {
    const s = subj(), u = s && s.units.find(x => x.name === unitSel.value);
    if (!u) { lessonSel.innerHTML = `<option value="">${unitSel.value ? '—' : '先選單元'}</option>`; lessonSel.disabled = true; return; }
    lessonSel.innerHTML = `<option value="">${WHOLE_UNIT}</option>` + u.lessons.map(l => `<option>${esc(l)}</option>`).join('');
    lessonSel.disabled = false;
  }
  $('repSubj').onclick = e => {
    const b = e.target.closest('.rep-chip'); if (!b) return;
    subjId = b.dataset.s;
    $('repSubj').querySelectorAll('.rep-chip').forEach(x => x.classList.toggle('on', x === b));
    fillUnits(); clearErr();
  };
  unitSel.onchange = () => { fillLessons(); clearErr(); };

  function reset() {
    form.reset(); subjId = null;
    pane.querySelectorAll('.rep-chip.on').forEach(b => b.classList.remove('on'));
    unitSel.innerHTML = '<option value="">先選科目</option>'; unitSel.disabled = true;
    lessonSel.innerHTML = '<option value="">先選單元</option>'; lessonSel.disabled = true;
    clearErr(); form.hidden = false; $('repDone').hidden = true;
  }
  const open = () => { reset(); pane.hidden = false; $('repSubj').querySelector('.rep-chip').focus(); };
  const close = () => { pane.hidden = true; const b = $('repBtn'); if (b) b.focus(); };
  $('repCancel').onclick = close; $('repClose').onclick = close;
  pane.addEventListener('click', e => { if (e.target === pane) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) close(); });

  /* ---------- 下一步: open the Google Form with 科目／單元／課 filled in ---------- */
  form.onsubmit = e => {
    e.preventDefault();
    const miss = !subjId ? '請選擇是哪一科。' : !unitSel.value ? '請選擇是哪一個單元。' : '';
    if (miss) { $('repErr').textContent = miss; return; }
    const v = {
      subject: subj().name,
      unit: unitSel.value,
      lesson: lessonSel.value || '',
      version: ($('verNum') && $('verNum').textContent) || ''
    };
    if (!ready) {
      form.hidden = true; $('repDone').hidden = false;
      $('repPre').textContent = `科目：${v.subject}\n單元：${v.unit}\n課：${v.lesson || '（整個單元）'}\n網站版本：${v.version}`;
      $('repClose').focus();
      return;
    }
    const q = new URLSearchParams({ usp: 'pp_url' });
    for (const k of Object.keys(v)) if (REPORT_FORM.entry[k] && v[k]) q.set(REPORT_FORM.entry[k], v[k]);
    window.open(`${REPORT_FORM.url}?${q.toString()}`, '_blank', 'noopener');
    close();
  };

  /* ---------- button next to 更新歷程 ---------- */
  const ver = document.querySelector('.ver');
  const preview = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (ver && (ready || preview)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ver-btn'; b.id = 'repBtn'; b.textContent = '回報問題';
    b.onclick = open;
    let row = ver.querySelector('.ver-btns');
    if (!row) { row = document.createElement('div'); row.className = 'ver-btns'; const vb = $('verBtn'); ver.insertBefore(row, vb); row.appendChild(vb); }
    row.appendChild(b);
  }
})();
