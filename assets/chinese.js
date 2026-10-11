/* 皮皮學習樂園：國語課共用元件。載入順序：pikmin.js → zhuyin.js → zhuyin-data.js → core.js → chinese.js → 各課資料。
   提供：
     CN.reader   直式課文朗讀（一句一句點來聽，或整段連續念）
     CN.words    詞語卡（詞語、解釋、課文例句）
     CN.hanzi    生字卡（注音、部首、筆畫、造詞）＋寫寫看描字板
     CN.sorter   分類遊戲（把卡片放進對的籃子）
   舞台上的文字放在 #stageText（.zy-area，會自動加注音）；換關卡時自動清空。 */
const CN = (() => {
  const wrap = document.querySelector('.stage-wrap');
  const box = document.createElement('div');
  box.id = 'stageText'; box.className = 'stage-text zy-area';
  wrap.appendChild(box);
  new ResizeObserver(() => {
    const w = wrap.clientWidth;
    wrap.style.setProperty('--u', (w / 800) + 'px');
    wrap.classList.toggle('narrow', w < 560);
  }).observe(wrap);

  function clear() { chain++; box.innerHTML = ''; box.className = 'stage-text zy-area'; }
  function show(html, cls = '') { box.className = 'stage-text zy-area ' + cls; box.innerHTML = html; }
  /* leaving a scene clears the text layer and stops any reading chain */
  const coreGoTo = goTo;
  goTo = function (i) { clear(); coreGoTo(i); };
  const coreStop = stopSay;
  stopSay = function () { chain++; coreStop(); };

  /* read several sentences one after another; a newer chain (or stopSay) cancels the older one */
  let chain = 0;
  function readAll(texts, each, end) {
    const my = ++chain;
    const step = k => {
      if (my !== chain) return;
      if (k >= texts.length) { end && end(); return; }
      each && each(k);
      say(texts[k], () => later(() => step(k + 1), 350));
    };
    step(0);
  }
  const tick = '<span class="tick" aria-hidden="true"></span>';

  /* ---------- 1. reading ----------
     parts: [{label, lines:[...], art:()=>svg}]   title/author show on the first part */
  function reader({ title, author, parts, task = '每一句都點來聽一聽', doneText }) {
    const heard = parts.map(p => p.lines.map(() => false));
    const total = heard.flat().length;
    let pi = 0;
    const count = () => heard.flat().filter(Boolean).length;
    function progress() {
      if (done[cur]) return;
      if (count() === total) taskDone(doneText || '每一句都聽過了！按「下一步」繼續。');
      else setTask(task, `${count()}/${total}`);
    }
    function mark(i) {
      heard[pi][i] = true;
      box.querySelectorAll('.vline').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('heard', heard[pi][k]); });
      renderTabs(); progress();
    }
    function readLine(i) { unlockAudio(); chain++; sfx.pop(); mark(i); say(parts[pi].lines[i]); }
    function renderTabs() {
      controls.innerHTML = `${parts.length > 1 ? `<div class="chips">${parts.map((p, k) => `<button class="chip ${k === pi ? 'on' : ''} ${heard[k].every(Boolean) ? 'seen' : ''}" data-p="${k}"><span class="ct">${k + 1}</span><span class="cl">${p.label}</span>${tick}</button>`).join('')}</div>` : ''}
        <div class="tools"><button class="tool primary" id="readPart">${ICON_SPK}念這一段</button><button class="tool" id="stopRead">停下來</button></div>`;
      controls.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { sfx.click(); chain++; stopSay(); pi = +b.dataset.p; render(); });
      $('#readPart').onclick = () => { unlockAudio(); readAll(parts[pi].lines, mark); };
      $('#stopRead').onclick = () => { stopSay(); box.querySelectorAll('.vline.on').forEach(b => b.classList.remove('on')); };
    }
    function render() {
      const p = parts[pi];
      stage.innerHTML = p.art ? p.art() : '';
      const head = pi === 0 && title ? `<div class="vtitle">${title}${author ? `<small>${author}</small>` : ''}</div>` : '';
      show(`<div class="paper"><div class="vcols">${head}${p.lines.map((l, i) => `<button class="vline ${heard[pi][i] ? 'heard' : ''}" data-i="${i}">${l}</button>`).join('')}</div></div>`, 'reading');
      box.querySelectorAll('.vline').forEach(b => b.onclick = () => readLine(+b.dataset.i));
      renderTabs(); progress();
    }
    render();
  }

  /* ---------- 2. word cards ----------
     items: [{w, m, ex}] — ex is a sentence that contains w */
  function words({ items, art, doneText, who = 'white', task = '點每一張詞語卡，看看它的意思', extra = '' }) {
    const seen = items.map(() => false);
    let on = -1;
    stage.innerHTML = art ? art() : '';
    function progress() {
      const n = seen.filter(Boolean).length;
      if (done[cur]) return;
      if (n === items.length) taskDone(doneText || '每個詞語都看過了！按「下一步」繼續。');
      else setTask(task, `${n}/${items.length}`);
    }
    function open(i) {
      on = i; seen[i] = true; unlockAudio(); sfx.pop();
      const it = items[i];
      const ex = (it.ex || '').split(it.w).join(`<b>${it.w}</b>`);
      show(`<div class="board"><div class="wcard"><div class="w">${it.w}</div><div class="m">${it.m}</div><div class="ex">${ex}</div></div></div>`);
      say(`${it.w}。${it.m}。${it.ex ? '例句：' + it.ex : ''}`);
      renderGrid(); progress();
    }
    function renderGrid() {
      controls.innerHTML = `<div class="card-grid">${items.map((it, i) => `<button class="card-btn ${seen[i] ? 'seen' : ''} ${i === on ? 'on' : ''}" data-i="${i}" data-nozy><i>${i + 1}</i>${it.w}</button>`).join('')}</div>${extra}`;
      controls.querySelectorAll('.card-btn').forEach(b => b.onclick = () => open(+b.dataset.i));
    }
    show(`<div class="board"><p class="hint-empty">點右邊的詞語卡，看看它的意思。</p></div>`);
    renderGrid(); progress();
  }

  /* ---------- 3. new characters + writing pad ----------
     chars: [{c, zy, bu, n, total, words:[...]}] */
  /* speech engines often misread radicals; say a common character with the same (textbook) sound instead */
  const RAD_SAY = { '虫': '毀', '辵': '綽', '阜': '富', '糸': '密', '疒': '床', '彳': '斥', '艸': '草', '宀': '棉', '丨': '滾', '几': '機', '臼': '救', '爪': '找', '曰': '約', '酉': '有', '犬': '犬', '干': '甘' };
  function hanzi({ chars, art, doneText }) {
    const seen = chars.map(() => false);
    let on = -1;
    stage.innerHTML = art ? art() : '';
    function progress() {
      const n = seen.filter(Boolean).length;
      if (done[cur]) return;
      if (n === chars.length) taskDone(doneText || '生字都認識了！按「下一步」繼續。');
      else setTask('點每一個生字，看看部首和筆畫，再寫寫看', `${n}/${chars.length}`);
    }
    function open(i) {
      on = i; seen[i] = true; unlockAudio(); sfx.pop();
      const h = chars[i];
      show(`<div class="board"><div class="hz"><div class="big" data-nozy>${ZY.one(h.c, h.zy)}</div>
        <dl><dt>部首</dt><dd data-nozy>${h.buzy ? ZY.one(h.bu, h.buzy) : h.bu}</dd><dt>筆畫</dt><dd>部首外 ${h.n} 畫，總共 ${h.total} 畫</dd><dt>造詞</dt><dd>${h.words.join('、')}</dd></dl></div></div>`);
      say(`${h.c}，${h.words[0]}的${h.c}。部首是${RAD_SAY[h.bu] || h.bu}，總共${h.total}畫。`);
      renderSide(); pad(h.c); progress();
    }
    function renderSide() {
      controls.innerHTML = `<div class="hz-grid" data-nozy>${chars.map((h, i) => `<button class="hz-btn ${seen[i] ? 'seen' : ''} ${i === on ? 'on' : ''}" data-i="${i}" aria-label="${h.c}">${h.c}</button>`).join('')}</div>
        ${on >= 0 ? `<div class="pad panel"><canvas id="padCv" width="600" height="600" aria-label="寫寫看"></canvas><div class="padbar"><span>用手指照著寫寫看</span><button id="padClr">擦掉</button></div></div>` : ''}`;
      controls.querySelectorAll('.hz-btn').forEach(b => b.onclick = () => open(+b.dataset.i));
    }
    function pad(c) {
      const cv = $('#padCv'); if (!cv) return;
      const g = cv.getContext('2d');
      function guide() {
        g.clearRect(0, 0, 600, 600);
        g.strokeStyle = '#f0c4be'; g.lineWidth = 3; g.setLineDash([14, 12]);
        g.beginPath(); g.moveTo(300, 0); g.lineTo(300, 600); g.moveTo(0, 300); g.lineTo(600, 300); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#e9e9ef'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = `480px ${getComputedStyle(document.documentElement).getPropertyValue('--f-kai')}`;
        g.fillText(c, 300, 318);
      }
      guide();
      let drawing = false, last = null;
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 600 / r.height]; };
      cv.onpointerdown = e => { drawing = true; last = pt(e); cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => {
        if (!drawing) return;
        const p = pt(e);
        g.strokeStyle = '#1e2a45'; g.lineWidth = 22; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke(); last = p;
      };
      cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
      $('#padClr').onclick = () => { sfx.click(); guide(); };
    }
    show(`<div class="board"><p class="hint-empty">點右邊的生字，看看它的注音、部首和筆畫。</p></div>`);
    renderSide(); progress();
  }

  /* ---------- 4. sorting ----------
     bins: [{k, label}], items: [{t, k, ok?:'答對時的說明', no?:'答錯時的提示'}] */
  function sorter({ bins, items, task, prompt, art, doneText, who = 'yellow', hintWho = 'red' }) {
    const placed = items.map(() => false);
    const order = shuffle(items.map((_, i) => i));
    let sel = -1;
    stage.innerHTML = art ? art() : '';
    function progress() {
      const n = placed.filter(Boolean).length;
      if (done[cur]) return;
      if (n === items.length) taskDone(doneText || '全部分好了！按「下一步」繼續。');
      else setTask(task || '把卡片放進對的籃子', `${n}/${items.length}`);
    }
    function render() {
      show(`<div class="board"><div class="sorter">
        <div class="tray">${order.filter(i => !placed[i]).map(i => `<button class="stile ${i === sel ? 'sel' : ''}" data-i="${i}">${items[i].t}</button>`).join('') || '<span class="hint-empty">全部分好了！</span>'}</div>
        <div class="bins">${bins.map(b => `<button class="bin ${sel >= 0 ? 'hot' : ''}" data-k="${b.k}"><span class="bl">${b.label}</span><span class="placed">${items.map((it, i) => placed[i] && it.k === b.k ? `<span class="stile">${it.t}</span>` : '').join('')}</span></button>`).join('')}</div>
      </div></div>`);
      box.querySelectorAll('.tray .stile').forEach(b => b.onclick = () => { unlockAudio(); sfx.click(); sel = +b.dataset.i; say(items[sel].t); render(); });
      box.querySelectorAll('.bin').forEach(b => b.onclick = () => drop(b.dataset.k, b));
    }
    function drop(k, el) {
      if (sel < 0) { talk([{ who, t: prompt || '先點上面的一張卡片，再點籃子。' }]); return; }
      const it = items[sel];
      if (it.k === k) {
        placed[sel] = true; sel = -1; sfx.good(); render(); progress();
        if (it.ok) talk([{ who, t: it.ok }]);
      } else {
        sfx.bad(); restart(el, 'wrong-bin');
        const t = box.querySelector(`.stile[data-i="${sel}"]`); if (t) restart(t, 'wrong');
        talk([{ who: hintWho, t: it.no || '再想一想，換一個籃子試試看。' }]);
      }
    }
    render(); progress();
  }

  /* ---------- 5. put things in order ----------
     items: [...] in the right order; the child taps them one by one */
  function order({ items, task, art, doneText, who = 'yellow', hintWho = 'red', hint = '想一想，哪一件事先發生？', endText }) {
    const shuffled = shuffle(items.map((_, i) => i));
    let n = 0;
    stage.innerHTML = art ? art() : '';
    function render() {
      show(`<div class="board"><div class="sorter">
        <div class="tray">${shuffled.filter(i => i >= n).map(i => `<button class="stile" data-i="${i}">${items[i]}</button>`).join('') || '<span class="hint-empty">排好了！</span>'}</div>
        <ol class="olist">${items.slice(0, n).map(t => `<li>${t}</li>`).join('')}${n < items.length ? '<li class="next">？</li>' : ''}</ol>
      </div></div>`);
      box.querySelectorAll('.tray .stile').forEach(b => b.onclick = () => pick(+b.dataset.i, b));
    }
    function progress() {
      if (done[cur]) return;
      if (n === items.length) { taskDone(doneText || '順序排好了！按「下一步」繼續。'); if (endText) talk([{ who, t: endText }]); }
      else setTask(task || '依照順序一個一個點', `${n}/${items.length}`);
    }
    function pick(i, el) {
      unlockAudio();
      if (i === n) { n++; sfx.good(); say(items[i]); render(); progress(); }
      else { sfx.bad(); restart(el, 'wrong'); talk([{ who: hintWho, t: hint }]); }
    }
    if (done[cur]) n = items.length;
    render(); progress();
  }

  /* ---------- 6. reading questions, one after another ----------
     list: [{q, opts, a, ok, no, cls}] — answering right moves on */
  function chainQ(list, { art, who = 'ice', doneText, task = '回答問題' }) {
    let k = 0;
    function next() {
      if (done[cur]) return;
      if (k >= list.length) { taskDone(doneText); return; }
      const q = list[k];
      if (art) stage.innerHTML = art(k);
      setTask(task, `${k}/${list.length}`);
      controls.innerHTML = '';
      askQ(q.q, q.opts, q.a, () => { k++; talk([{ who, t: q.ok }], next); }, { hint: q.no, cls: q.cls || 'stack' });
    }
    if (done[cur]) { if (art) stage.innerHTML = art(list.length); return; }
    next();
  }
  /* a calm paper background for word / character scenes */
  const plainArt = () => `<rect width="800" height="450" fill="#EAF4E2"/>${[...Array(9)].map((_, i) => `<circle cx="${60 + i * 90}" cy="${i % 2 ? 60 : 400}" r="30" fill="#DCEFD2"/>`).join('')}`;

  return { clear, show, readAll, reader, words, hanzi, sorter, order, chainQ, plainArt, box };
})();
ZY.watch('#line,#task,#controls,#quizView,#notes,.zy-area');
