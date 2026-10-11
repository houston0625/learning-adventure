/* 皮皮學習樂園：「回報問題」表單（首頁歡迎詞旁）。
   科目、單元、課的選項都讀 assets/catalog.js。
   送出：把內容用 POST 傳給 REPORT_URL（Google Apps Script，見 design/report-backend/），寫進雲端硬碟的文字檔。
   REPORT_URL 還沒設定時，表單照樣可以填，送出後只會顯示整理好的內容（給測試用）。 */
const REPORT_URL = '';
(() => {
  const C = (window.CATALOG || []).filter(s => s.open);   /* only subjects that are open (catalog.js: open:true) */
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TYPES = ['注音或讀音', '文字或內容', '題目或答案', '畫面或按鈕', '聲音', '其他'];
  const MAX = 500;
  const WHOLE_SUBJECT = '整個科目', WHOLE_UNIT = '整個單元（不確定是哪一課）', SITE = { id: 'site', name: '整個網站', open: false, units: [] };

  /* ---------- the dialog ---------- */
  const pane = document.createElement('div');
  pane.className = 'ver-pane'; pane.id = 'repPane'; pane.hidden = true;
  pane.setAttribute('role', 'dialog'); pane.setAttribute('aria-modal', 'true'); pane.setAttribute('aria-labelledby', 'repTitle');
  pane.innerHTML = `<form class="ver-card rep" id="repForm" novalidate>
    <h2 id="repTitle">回報問題</h2>
    <p class="rep-lead">發現錯字、讀音不對、按鈕壞掉……告訴我們，我們會盡快修正！</p>

    <fieldset class="rep-f"><legend>1. 哪一科？<b>必填</b></legend>
      <div class="rep-chips" id="repSubj">${C.concat([SITE]).map(s => `<button type="button" class="rep-chip" data-s="${s.id}">${esc(s.name)}</button>`).join('')}</div>
    </fieldset>

    <div class="rep-two">
      <label class="rep-f"><span class="rep-l">2. 哪一個單元？<b>必填</b></span><select id="repUnit" disabled><option value="">先選科目</option></select></label>
      <label class="rep-f"><span class="rep-l">3. 哪一課？</span><select id="repLesson" disabled><option value="">先選單元</option></select></label>
    </div>

    <fieldset class="rep-f"><legend>4. 是什麼問題？<b>必填</b></legend>
      <div class="rep-chips" id="repType">${TYPES.map(t => `<button type="button" class="rep-chip" data-t="${t}">${t}</button>`).join('')}</div>
    </fieldset>

    <label class="rep-f"><span class="rep-l">5. 在哪裡看到的？<small>選填，例如：生字卡的「螺」、小測驗第 3 題</small></span>
      <input id="repWhere" type="text" maxlength="60" autocomplete="off"></label>

    <label class="rep-f"><span class="rep-l">6. 請說明問題<b>必填</b></span>
      <textarea id="repDesc" rows="4" maxlength="${MAX}" placeholder="例如：螺的部首「虫」應該念ㄏㄨㄟˇ，網頁寫ㄔㄨㄥˊ。"></textarea>
      <span class="rep-count" id="repCount">0 / ${MAX}</span></label>

    <input class="rep-hp" id="repHp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="rep-note">請不要寫姓名、電話、地址等個人資料。</p>
    <p class="rep-err" id="repErr" role="alert"></p>
    <div class="rep-btns"><button type="button" class="rep-cancel" id="repCancel">取消</button><button type="submit" class="ver-close" id="repSend">送出</button></div>
  </form>
  <div class="ver-card rep-done" id="repDone" hidden>
    <h2>謝謝你的回報！</h2>
    <p id="repDoneMsg"></p>
    <pre class="rep-pre" id="repPre" hidden></pre>
    <button type="button" class="ver-close" id="repClose">好</button>
  </div>`;
  document.body.appendChild(pane);

  const form = $('repForm'), unitSel = $('repUnit'), lessonSel = $('repLesson');
  const st = { s: null, t: null };
  const subj = () => C.concat([SITE]).find(x => x.id === st.s);

  function pickChip(box, attr, val) { box.querySelectorAll('.rep-chip').forEach(b => b.classList.toggle('on', b.dataset[attr] === val)); }
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
  $('repSubj').onclick = e => { const b = e.target.closest('.rep-chip'); if (!b) return; st.s = b.dataset.s; pickChip($('repSubj'), 's', st.s); fillUnits(); clearErr(); };
  $('repType').onclick = e => { const b = e.target.closest('.rep-chip'); if (!b) return; st.t = b.dataset.t; pickChip($('repType'), 't', st.t); clearErr(); };
  unitSel.onchange = () => { fillLessons(); clearErr(); };
  $('repDesc').oninput = () => { $('repCount').textContent = `${$('repDesc').value.length} / ${MAX}`; clearErr(); };
  const clearErr = () => { $('repErr').textContent = ''; };

  function reset() {
    form.reset(); st.s = st.t = null;
    pane.querySelectorAll('.rep-chip.on').forEach(b => b.classList.remove('on'));
    unitSel.innerHTML = '<option value="">先選科目</option>'; unitSel.disabled = true;
    lessonSel.innerHTML = '<option value="">先選單元</option>'; lessonSel.disabled = true;
    $('repCount').textContent = `0 / ${MAX}`; clearErr();
    form.hidden = false; $('repDone').hidden = true; $('repSend').disabled = false; $('repSend').textContent = '送出';
  }
  const open = () => { reset(); pane.hidden = false; $('repSubj').querySelector('.rep-chip').focus(); };
  const close = () => { pane.hidden = true; const b = $('repBtn'); if (b) b.focus(); };
  $('repCancel').onclick = close; $('repClose').onclick = close;
  pane.addEventListener('click', e => { if (e.target === pane) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) close(); });

  /* ---------- submit ---------- */
  function lastSent() { try { return +localStorage.getItem('pp-report-at') || 0; } catch (e) { return 0; } }
  function markSent() { try { localStorage.setItem('pp-report-at', String(Date.now())); } catch (e) {} }
  function stamp(d) { const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
  form.onsubmit = e => {
    e.preventDefault();
    const desc = $('repDesc').value.trim();
    const miss = !st.s ? '請選擇是哪一科。' : !unitSel.value ? '請選擇是哪一個單元。' : !st.t ? '請選擇是什麼問題。' : desc.length < 5 ? '請再多寫一點說明（至少 5 個字）。' : '';
    if (miss) { $('repErr').textContent = miss; return; }
    if ($('repHp').value) { close(); return; }                       // a bot filled the hidden field
    if (Date.now() - lastSent() < 60000) { $('repErr').textContent = '剛剛已經送出過了，請等一分鐘再送下一則。'; return; }
    const r = {
      time: stamp(new Date()), subject: subj().name, unit: unitSel.value, lesson: lessonSel.value || '（整個單元）',
      type: st.t, where: $('repWhere').value.trim(), desc,
      version: ($('verNum') && $('verNum').textContent) || '', page: location.pathname.split('/').slice(-3).join('/'),
      device: (navigator.userAgent.match(/iPad|iPhone|Android|Windows|Macintosh/) || ['其他'])[0]
    };
    const text = `時間：${r.time}\n科目：${r.subject}\n單元：${r.unit}\n課：${r.lesson}\n問題類型：${r.type}\n在哪裡：${r.where || '（沒填）'}\n說明：${r.desc}\n網站版本：${r.version}　裝置：${r.device}`;
    const done = (msg, showText) => {
      form.hidden = true; $('repDone').hidden = false; $('repDoneMsg').textContent = msg;
      $('repPre').hidden = !showText; $('repPre').textContent = showText ? text : ''; $('repClose').focus();
    };
    if (!REPORT_URL) { done('（測試模式：回報功能還沒接上雲端，下面是會送出的內容。）', true); return; }
    $('repSend').disabled = true; $('repSend').textContent = '送出中…';
    fetch(REPORT_URL, { method: 'POST', body: JSON.stringify(r) })   // text/plain: no CORS preflight for Apps Script
      .then(res => res.json())
      .then(j => { if (!j.ok) throw new Error(j.error || 'failed'); markSent(); done('我們收到了，會盡快檢查和修正。', false); })
      .catch(() => { $('repSend').disabled = false; $('repSend').textContent = '送出'; $('repErr').textContent = '送出失敗，請檢查網路後再試一次。'; });
  };

  /* ---------- button next to 更新歷程 ---------- */
  const ver = document.querySelector('.ver');
  /* until the cloud URL is set, only show the button when previewing on this computer */
  const preview = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (ver && (REPORT_URL || preview)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ver-btn'; b.id = 'repBtn'; b.textContent = '回報問題';
    b.onclick = open;
    let row = ver.querySelector('.ver-btns');
    if (!row) { row = document.createElement('div'); row.className = 'ver-btns'; const vb = $('verBtn'); ver.insertBefore(row, vb); row.appendChild(vb); }
    row.appendChild(b);
  }
})();
