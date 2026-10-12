/* 皮皮學習樂園：「回報問題」（首頁歡迎詞旁、各科／各單元頁上方、每一課右上角）。
   所有欄位先在網站上填好（科目／單元／課的選項讀 assets/catalog.js）；
   在某一科、某一單元或某一課裡打開時，會自動選好目前的科目、單元、課（靠 catalog.js 的 dir／file 對應網址），
   在課程裡還會把目前這一關填進「在哪裡看到的？」。
   按「送出」會開新分頁打開 Google 表單，全部內容自動帶入；使用者登入 Google 後按「提交」即可（Email 由 Google 記錄）。
   表單的建立方法見 design/report-form/設定步驟.md。REPORT_FORM.url 沒設定時，正式網站不顯示按鈕。 */
const REPORT_FORM = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSdKg-WCxy8DAzO44UREl0gtRaEmVpJ61kVOknavjrShcNTRJg/viewform',
  /* 欄位代號：表單裡每一題的 entry.xxx */
  entry: {
    subject: 'entry.1992172387', unit: 'entry.362611408', lesson: 'entry.318668339',
    type: 'entry.1522249560', desc: 'entry.1182767033', name: 'entry.61780073', version: 'entry.874862283'
  }
};
(() => {
  /* styles live next to this file (report.css); reuse this script's ?v= so both refresh together */
  const SRC = (document.currentScript && document.currentScript.src) || '';
  if (SRC) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = SRC.replace(/report\.js(\?[^#]*)?$/, 'report.css$1'); document.head.appendChild(l); }
  const C = (window.CATALOG || []).filter(s => s.open);   /* only subjects that are open (catalog.js: open:true) */
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TYPES = ['注音或讀音', '文字或內容', '題目或答案', '畫面或按鈕', '聲音', '其他'];   /* must match the Google Form options */
  const MAX = 500;
  const WHOLE_SUBJECT = '整個科目', WHOLE_UNIT = '整個單元（不確定是哪一課）', SITE = { id: 'site', name: '整個網站', open: false, units: [] };
  const ready = !!(REPORT_FORM.url && REPORT_FORM.entry.subject);

  /* ---------- the dialog ---------- */
  const pane = document.createElement('div');
  pane.className = 'ver-pane'; pane.id = 'repPane'; pane.hidden = true; pane.dataset.nozy = '';
  pane.setAttribute('role', 'dialog'); pane.setAttribute('aria-modal', 'true'); pane.setAttribute('aria-labelledby', 'repTitle');
  pane.innerHTML = `<form class="ver-card rep" id="repForm" novalidate>
    <header class="rep-head">
      <h2 id="repTitle">回報問題</h2>
      <p>發現錯字、讀音不對、按鈕壞掉……告訴我們，我們會盡快修正！</p>
      <p class="rep-auto" id="repAuto" hidden></p>
    </header>

    <section class="rep-q">
      <div class="rep-l"><span class="rep-n">1</span>哪一科？<b class="rep-req">必填</b></div>
      <div class="rep-chips" id="repSubj">${C.concat([SITE]).map(s => `<button type="button" class="rep-chip" data-s="${s.id}">${esc(s.name)}</button>`).join('')}</div>
    </section>

    <div class="rep-two">
      <section class="rep-q">
        <label class="rep-l" for="repUnit"><span class="rep-n">2</span>哪一個單元？<b class="rep-req">必填</b></label>
        <select id="repUnit" disabled><option value="">先選科目</option></select>
      </section>
      <section class="rep-q">
        <label class="rep-l" for="repLesson"><span class="rep-n">3</span>哪一課？</label>
        <select id="repLesson" disabled><option value="">先選單元</option></select>
      </section>
    </div>

    <section class="rep-q">
      <div class="rep-l"><span class="rep-n">4</span>是什麼問題？<b class="rep-req">必填</b></div>
      <div class="rep-chips" id="repType">${TYPES.map(t => `<button type="button" class="rep-chip" data-t="${t}">${t}</button>`).join('')}</div>
    </section>

    <section class="rep-q">
      <label class="rep-l" for="repWhere"><span class="rep-n">5</span>在哪裡看到的？<small>選填</small></label>
      <input id="repWhere" type="text" maxlength="60" autocomplete="off" placeholder="例如：生字卡的「螺」、小測驗第 3 題">
    </section>

    <section class="rep-q">
      <label class="rep-l" for="repDesc"><span class="rep-n">6</span>請說明問題<b class="rep-req">必填</b></label>
      <textarea id="repDesc" rows="4" maxlength="${MAX}" placeholder="例如：螺的部首「虫」應該念ㄏㄨㄟˇ，網頁寫ㄔㄨㄥˊ。"></textarea>
      <span class="rep-count" id="repCount">0 / ${MAX}</span>
    </section>

    <section class="rep-q">
      <label class="rep-l" for="repName"><span class="rep-n">7</span>你的暱稱<small>選填</small></label>
      <input id="repName" type="text" maxlength="20" autocomplete="nickname">
    </section>

    <p class="rep-note">按「送出」會打開 Google 表單，剛剛填的內容都會自動帶入。<b>請登入 Google 帳號，再按表單最下面的「提交」</b>，才算送出喔！說明裡請不要寫電話、地址等個人資料。</p>
    <p class="rep-err" id="repErr" role="alert"></p>
    <div class="rep-btns">
      <button type="button" class="rep-btn rep-btn-ghost" id="repCancel">取消</button>
      <button type="submit" class="rep-btn rep-btn-main" id="repSend">送出</button>
    </div>
  </form>
  <div class="ver-card rep-done" id="repDone" hidden>
    <h2 id="repDoneTitle"></h2>
    <p id="repDoneMsg"></p>
    <pre class="rep-pre" id="repPre" hidden></pre>
    <button type="button" class="rep-btn rep-btn-main" id="repClose">好</button>
  </div>`;
  document.body.appendChild(pane);

  const form = $('repForm'), unitSel = $('repUnit'), lessonSel = $('repLesson');
  const st = { s: null, t: null };
  const subj = () => C.concat([SITE]).find(x => x.id === st.s);
  const clearErr = () => { $('repErr').textContent = ''; };
  const pick = (box, attr, val) => box.querySelectorAll('.rep-chip').forEach(b => b.classList.toggle('on', b.dataset[attr] === val));

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
    lessonSel.innerHTML = `<option value="">${WHOLE_UNIT}</option>` + u.lessons.map(l => `<option>${esc(l.name)}</option>`).join('');
    lessonSel.disabled = false;
  }
  $('repSubj').onclick = e => { const b = e.target.closest('.rep-chip'); if (!b) return; st.s = b.dataset.s; pick($('repSubj'), 's', st.s); fillUnits(); clearErr(); };
  $('repType').onclick = e => { const b = e.target.closest('.rep-chip'); if (!b) return; st.t = b.dataset.t; pick($('repType'), 't', st.t); clearErr(); };
  unitSel.onchange = () => { fillLessons(); clearErr(); };
  $('repDesc').oninput = () => { $('repCount').textContent = `${$('repDesc').value.length} / ${MAX}`; clearErr(); };

  function reset() {
    form.reset(); st.s = st.t = null;
    pane.querySelectorAll('.rep-chip.on').forEach(b => b.classList.remove('on'));
    unitSel.innerHTML = '<option value="">先選科目</option>'; unitSel.disabled = true;
    lessonSel.innerHTML = '<option value="">先選單元</option>'; lessonSel.disabled = true;
    $('repCount').textContent = `0 / ${MAX}`; clearErr(); $('repAuto').hidden = true;
    form.hidden = false; $('repDone').hidden = true;
  }
  /* where am I? match the page address against catalog.js (subject dir / unit dir / lesson file) */
  function here() {
    const seg = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    for (let i = 0; i < seg.length; i++) {
      const s = C.find(x => x.dir === seg[i]);
      if (!s) continue;
      const u = s.units.find(x => x.dir === seg[i + 1]);
      const l = u && u.lessons.find(x => x.file === seg[i + 2]);
      return { s, u, l };
    }
    return null;
  }
  /* inside a lesson: the tab that is open right now, e.g. 第 3 關「游泳小問答」 */
  function curStep() {
    const c = document.querySelector('#steps .step.cur');
    if (!c) return '';
    const n = c.querySelector('.n'), l = c.querySelector('.l');
    const name = l ? l.textContent.trim() : '';
    return n ? `第 ${n.textContent.trim()} 關${name ? `「${name}」` : ''}` : '';
  }
  function prefill() {
    const h = here();
    if (!h) return false;
    st.s = h.s.id; pick($('repSubj'), 's', st.s); fillUnits();
    if (h.u) { unitSel.value = h.u.name; fillLessons(); if (h.l) lessonSel.value = h.l.name; }
    const step = h.l ? curStep() : '';
    if (step) $('repWhere').value = step;
    $('repAuto').textContent = `已經幫你選好：${[h.s.name, h.u && h.u.name, h.l && h.l.name].filter(Boolean).join(' › ')}${step ? `，${step}` : ''}。不對的話可以改。`;
    $('repAuto').hidden = false;
    return true;
  }
  const open = () => {
    reset(); pane.hidden = false;
    $(prefill() ? 'repType' : 'repSubj').querySelector('.rep-chip').focus();
  };
  const close = () => { pane.hidden = true; const b = $('repBtn'); if (b) b.focus(); };
  $('repCancel').onclick = close; $('repClose').onclick = close;
  pane.addEventListener('click', e => { if (e.target === pane) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pane.hidden) close(); });

  /* ---------- 送出: open the Google Form with everything filled in ---------- */
  form.onsubmit = e => {
    e.preventDefault();
    const desc = $('repDesc').value.trim();
    const miss = !st.s ? '請選擇是哪一科。' : !unitSel.value ? '請選擇是哪一個單元。' : !st.t ? '請選擇是什麼問題。' : desc.length < 5 ? '請再多寫一點說明（至少 5 個字）。' : '';
    if (miss) { $('repErr').textContent = miss; return; }
    const where = $('repWhere').value.trim();
    const v = {
      subject: subj().name, unit: unitSel.value, lesson: lessonSel.value || '', type: st.t,
      desc: where ? `【在哪裡】${where}\n${desc}` : desc,
      name: $('repName').value.trim(),
      version: ($('verNum') && $('verNum').textContent) || ''
    };
    const show = (title, msg, text) => {
      form.hidden = true; $('repDone').hidden = false;
      $('repDoneTitle').textContent = title; $('repDoneMsg').textContent = msg;
      $('repPre').hidden = !text; $('repPre').textContent = text || ''; $('repClose').focus();
    };
    if (!ready) {
      show('測試模式', '回報表單還沒接上 Google 表單，下面是會帶入的內容：',
        `科目：${v.subject}\n單元：${v.unit}\n課：${v.lesson || '（整個單元）'}\n問題類型：${v.type}\n說明：${v.desc}\n暱稱：${v.name || '（沒填）'}\n網站版本：${v.version}`);
      return;
    }
    const q = new URLSearchParams({ usp: 'pp_url' });
    for (const k of Object.keys(v)) if (REPORT_FORM.entry[k] && v[k]) q.set(REPORT_FORM.entry[k], v[k]);
    window.open(`${REPORT_FORM.url}?${q.toString()}`, '_blank', 'noopener');
    show('還差一步！', '已經在新分頁打開 Google 表單，內容都幫你填好了。請登入 Google 帳號，再按表單最下面的「提交」，就完成回報囉！');
  };

  /* ---------- the 回報問題 button ----------
     home page: next to 更新歷程 · lessons: right end of the top bar · subject / unit / 成語挑戰 pages: right end of the nav row */
  const preview = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (ready || preview) {
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'repBtn'; b.dataset.nozy = ''; b.onclick = open;
    const ver = document.querySelector('.ver'), bar = document.querySelector('.topbar'), nav = document.querySelector('nav.nav[aria-label]');
    if (ver) {
      b.className = 'ver-btn'; b.textContent = '回報問題';
      let row = ver.querySelector('.ver-btns');
      if (!row) { row = document.createElement('div'); row.className = 'ver-btns'; const vb = $('verBtn'); ver.insertBefore(row, vb); row.appendChild(vb); }
      row.appendChild(b);
    } else if (bar || nav) {
      b.className = 'rep-open';
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M6 4.5h11.5l-2.6 4 2.6 4H6z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>回報問題</span>';
      (bar || nav).appendChild(b);
    }
  }
})();
