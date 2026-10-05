/* DSRPT extras: offline, reminders/warnings, onboarding, export, settings, sync fixes.
   يتحمّل بعد السكربت الرئيسي في index.html */
(() => {
  const $ = id => document.getElementById(id);
  const ICON = 'https://img.icons8.com/fluency-systems-filled/192/FF4D00/flash-on.png';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  S.settings = S.settings || {};
  let loaded = false, pending = false, timer, installEvt;
  const cfg = () => Object.assign({ on: false, morning: '08:00', evening: '21:00', limit: 0, done: false }, S.settings);
  const payload = () => ({ tasks: S.tasks, dayTasks: S.dayTasks, taskLinks: S.taskLinks, weekGoals: S.weekGoals, notes: S.notes, exp: S.exp, inc: S.inc, saved: S.saved, globalCourses: S.globalCourses, settings: S.settings });

  /* ---------- CSS ---------- */
  document.head.insertAdjacentHTML('beforeend', `<style>
  html{-webkit-text-size-adjust:100%}body{touch-action:manipulation;overflow:visible!important}
  #alerts .al{background:rgba(255,77,0,.1);border:1px solid rgba(255,77,0,.35);color:#ffb08a;border-radius:6px;padding:9px 14px;margin-bottom:8px;font-size:12px;font-weight:700}
  #toast{position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#1a1a1a;border:1px solid #FF4D00;color:#F5F0EB;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:700;z-index:9999999;max-width:90%;display:none;text-align:center}
  #offline-bar{display:none;position:sticky;top:0;z-index:200;background:#f39c12;color:#0a0a0a;text-align:center;font-size:12px;font-weight:800;padding:6px}
  .st-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;color:var(--text2)}.st-row label{flex:1}
  .st-row input,.st-row select{padding:8px;border-radius:4px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-family:Cairo}
  .st-card{margin-bottom:16px}.st-btns{display:flex;flex-wrap:wrap;gap:8px}
  #onb{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999998;display:flex;align-items:center;justify-content:center;padding:20px}
  #onb .box{background:#141414;border:1px solid #242424;border-radius:12px;max-width:380px;width:100%;padding:28px 22px;text-align:center}
  #onb h3{color:#FF4D00;font-size:19px;margin:8px 0}#onb p{color:#b5b0a9;font-size:13px;line-height:1.9;margin-bottom:18px}
  #onb .dots{margin-bottom:14px;color:#42403d}#onb .dots b{color:#FF4D00}
  #print-root{display:none}
  @media print{body>*:not(#print-root){display:none!important}html,body{background:#fff!important}
  #print-root{display:block!important;direction:rtl;color:#000;font-family:Cairo,sans-serif;font-size:12px}
  #print-root table{width:100%;border-collapse:collapse;margin-bottom:18px}#print-root td,#print-root th{border:1px solid #999;padding:4px 6px;text-align:right}#print-root th{background:#eee}}
  .sb-icon,.brand-badge,#auth-overlay>div>div:first-child{background:transparent!important;box-shadow:none!important;padding:0!important;overflow:hidden}
  .sb-icon img,.brand-badge img,#auth-overlay>div>div:first-child img{width:100%;height:100%;display:block}
  .content{max-width:1320px;margin-inline:auto;width:100%}
  .day-layout>*,.right-col>*{min-width:0}
  .crs-table-wrap{overflow-x:auto}.crs-table{min-width:560px}.crs-table td{word-break:break-word}
  .task-item{flex-wrap:wrap}.task-edit-input,.task-link-clickable{flex:1 1 140px;min-width:0}
  .day-header-card{flex-wrap:wrap;gap:10px}
  @media(min-width:901px){.day-layout{grid-template-columns:minmax(0,1fr) 360px}}
  @media(max-width:900px){.sidebar{display:block!important;position:fixed!important;top:auto!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;min-width:0!important;min-height:0!important;height:calc(64px + env(safe-area-inset-bottom))!important;padding:0 0 env(safe-area-inset-bottom)!important;background:rgba(10,10,10,.98)!important;border-top:1px solid #242424!important;border-left:none!important;z-index:99999!important}
  .sb-logo,.sb-today,.sb-prog,.nav-sec{display:none!important}
  nav{display:grid!important;grid-template-columns:repeat(5,1fr)!important;height:100%!important;padding:0!important}
  .nav-item{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;height:100%!important;padding:4px 2px!important;margin:0!important;border-radius:0!important;border:none!important;gap:3px!important;font-size:10px!important;color:#888!important;background:transparent!important}
  .nav-item.active{color:#FF4D00!important;border-top:2px solid #FF4D00!important}
  .main{margin-right:0!important;width:100%!important}
  .topbar{padding-top:env(safe-area-inset-top);height:calc(56px + env(safe-area-inset-top))!important}
  .content{padding:16px 12px calc(100px + env(safe-area-inset-bottom))!important}
  .day-layout{grid-template-columns:minmax(0,1fr)!important}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.crs-form{grid-template-columns:1fr!important}.tb-date{display:none}}
  @media(max-width:480px){.cal-grid{gap:3px!important}.cal-cell{min-height:44px;padding:6px 2px}.cal-section{padding:12px}.sec-hd-title{font-size:19px}.sec-hd{flex-wrap:wrap;gap:8px}.add-task-row{flex-direction:column}.add-task-input,.add-task-select,.add-task-btn{width:100%}}
  </style>`);
  document.body.insertAdjacentHTML('beforeend', '<div id="toast"></div><div id="print-root"></div>');
  $('dsrpt-x') || document.querySelector('.main').insertAdjacentHTML('afterbegin', '<div id="offline-bar">📴 أنت أوفلاين — كل حاجة بتتحفظ على جهازك وهتتزامن لما النت يرجع</div>');

  /* ---------- قفل الزوم ---------- */
  ['gesturestart','gesturechange','gestureend'].forEach(e => document.addEventListener(e, ev => ev.preventDefault()));
  document.addEventListener('touchmove', ev => { if (ev.touches.length > 1) ev.preventDefault(); }, { passive: false });

  /* ---------- الحالة والأوفلاين ---------- */
  function status(m) {
    const e = $('sync-status'); if (!e) return;
    const c = { ok: ['#00ff88', 'متصل'], save: ['#FF6B2B', 'جاري الحفظ...'], off: ['#f39c12', 'أوفلاين — محفوظ عندك'], err: ['#e02424', 'خطأ مزامنة'] }[m];
    e.innerHTML = `<span class="pulse-dot" style="background:${c[0]};box-shadow:0 0 8px ${c[0]}"></span><span class="cloud-txt">${c[1]}</span>`;
  }
  const net = () => { $('offline-bar').style.display = navigator.onLine ? 'none' : 'block'; status(navigator.onLine ? 'ok' : 'off'); };
  addEventListener('online', net); addEventListener('offline', net); net();
  try { db.enablePersistence({ synchronizeTabs: true }).catch(() => { }); } catch (e) { }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });

  /* ---------- المزامنة (مصلّحة) ---------- */
  window.syncToCloud = function () {
    if (!docRef || !loaded) return;
    pending = true; status(navigator.onLine ? 'save' : 'off');
    clearTimeout(timer);
    timer = setTimeout(() => { pending = false; docRef.set(payload()).catch(() => status('err')); }, 400);
  };
  window.listenToCloud = function () {
    if (!docRef) return;
    docRef.onSnapshot({ includeMetadataChanges: true }, doc => {
      if (doc.metadata.hasPendingWrites || pending) { status(navigator.onLine ? 'save' : 'off'); return; }
      status(navigator.onLine ? 'ok' : 'off');
      const me = isYoussef(currentUser && currentUser.email);
      let reseed = false;
      if (doc.exists) {
        const d = doc.data();
        ['tasks', 'dayTasks', 'taskLinks', 'weekGoals', 'notes', 'exp', 'inc', 'saved', 'settings'].forEach(k => S[k] = d[k] || {});
        S.globalCourses = (d.globalCourses && d.globalCourses.length) ? d.globalCourses : (me ? [...SAVED_COURSES] : []);
        if (me && !(d.globalCourses && d.globalCourses.length)) reseed = true;
      } else {
        if (doc.metadata.fromCache) return;
        if (me) S.globalCourses = [...SAVED_COURSES];
      }
      const first = !loaded; loaded = true;
      if (!doc.exists || reseed) syncToCloud();
      loadDay(S.cur); updateSidebar(); renderGlobalCourses(); refreshCal(); refreshStats(); fillSettings();
      if (first) { if (!cfg().done) onboard(); tick(); }
    });
  };

  /* ---------- Toast + إشعارات ---------- */
  function toast(t) { const e = $('toast'); e.textContent = t; e.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => e.style.display = 'none', 6000); }
  function notify(title, body) {
    toast(title + ' — ' + body);
    if ('Notification' in window && Notification.permission === 'granted') {
      const o = { body, icon: ICON, dir: 'rtl', lang: 'ar' };
      (navigator.serviceWorker ? navigator.serviceWorker.ready.then(r => r.showNotification(title, o)) : Promise.reject()).catch(() => { try { new Notification(title, o); } catch (e) { } });
    }
  }
  function once(k) {
    try {
      const f = JSON.parse(localStorage.dsrpt_f || '{}'), now = Date.now();
      Object.keys(f).forEach(x => { if (now - f[x] > 3 * 864e5) delete f[x]; });
      if (f[k]) return false; f[k] = now; localStorage.dsrpt_f = JSON.stringify(f); return true;
    } catch (e) { return true; }
  }
  const mm = s => { const a = (s || '0:0').split(':'); return +a[0] * 60 + +a[1]; };
  function tick() {
    const c = cfg(); if (!c.on || !loaded) return;
    const i = ti(), n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    const L = S.dayTasks[i] || [], ck = S.tasks[i] || {}, open = L.filter(t => !ck[t.id]);
    if (open.length && m >= mm(c.morning) && m < mm(c.morning) + 240 && once('m' + i)) notify('☀️ صباح الخير', `عندك ${open.length} مهام النهارده`);
    L.forEach(t => { const d = m - mm(t.time); if (t.time && !ck[t.id] && d >= 0 && d <= 180 && once('t' + t.id)) notify('⏰ ' + t.label, 'وقتها جه'); });
    if (m >= mm(c.evening) && !S.saved[i] && once('e' + i)) notify('🌙 خلّص يومك', `${open.length} مهام لسه، ومتنساش تحفظ اليوم`);
  }
  setInterval(tick, 30000); document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  /* ---------- التحذيرات داخل الشاشة ---------- */
  const spent = i => (S.exp[i] || []).reduce((s, e) => s + e.amt, 0);
  function alerts() {
    const box = $('alerts'); if (!box) return;
    const i = S.cur, out = [];
    if (i === ti()) {
      const L = S.dayTasks[i] || [], ck = S.tasks[i] || {}, p1 = L.filter(t => t.priority === '⭐⭐⭐⭐⭐' && !ck[t.id]);
      if (p1.length) out.push(`🔥 عندك ${p1.length} مهمة P1 لسه مخلصتش`);
      if (i > 0 && !S.saved[i - 1] && (S.dayTasks[i - 1] || []).length) out.push('⚠️ امبارح ما اتحفظش كيوم منجز — الستريك في خطر');
      const lim = +cfg().limit; if (lim && spent(i) > lim) out.push(`💸 عديت حد الصرف اليومي (${spent(i)} / ${lim} ج)`);
    }
    box.innerHTML = out.map(t => `<div class="al">${t}</div>`).join('');
  }
  $('day-header').insertAdjacentHTML('beforebegin', '<div id="alerts"></div>');
  const _ld = loadDay; window.loadDay = i => { _ld(i); alerts(); };
  const _rt = renderTasks;
  window.renderTasks = i => {
    _rt(i); const L = S.dayTasks[i] || [];
    document.querySelectorAll('#tasks-body .task-cat').forEach((c, k) => { if (L[k] && L[k].time) c.textContent = '⏰ ' + L[k].time + ' · ' + L[k].cat; });
    alerts();
  };
  const _at = addCustomTask;
  window.addCustomTask = () => {
    const l = getDayTasksList(S.cur), n = l.length; _at();
    const tm = $('new-task-time');
    if (l.length > n && tm.value) { l[l.length - 1].time = tm.value; renderTasks(S.cur); syncToCloud(); }
    if (l.length > n) tm.value = '';
  };
  const _ae = addExpense;
  window.addExpense = () => {
    _ae(); const lim = +cfg().limit, i = S.cur, t = spent(i); if (!lim || i !== ti()) return;
    if (t > lim && once('bo' + i)) notify('💸 عديت الحد', `صرفت ${t} من ${lim} ج`);
    else if (t >= lim * .8 && t <= lim && once('bw' + i)) notify('💸 قربت من الحد', `صرفت ${t} من ${lim} ج`);
    alerts();
  };
  document.querySelector('.add-task-row .add-task-btn').insertAdjacentHTML('beforebegin', '<input type="time" id="new-task-time" class="add-task-select" title="وقت التذكير (اختياري)">');

  /* ---------- الإعدادات + التصدير ---------- */
  document.querySelector('nav').insertAdjacentHTML('beforeend', '<div class="nav-sec">SETTINGS</div><div class="nav-item" onclick="showPanel(\'settings\',this)"><span class="nav-icon">⚙️</span> الإعدادات</div>');
  document.querySelector('.content').insertAdjacentHTML('beforeend', `<div class="panel" id="panel-settings">
  <div class="sec-hd"><div><div class="sec-hd-title">الإعدادات <span>والتصدير</span></div><div class="sec-hd-sub">تذكيرات · تحذيرات · تصدير</div></div></div>
  <div class="notes-card st-card"><div class="nc-header">🔔 التذكيرات والتحذيرات</div><div class="nc-body">
   <div class="st-row"><label id="st-state"></label><button class="btn btn-gold" onclick="toggleRem()">تفعيل / إيقاف</button></div>
   <div class="st-row"><label>تذكير الصبح</label><input type="time" id="st-morning" onchange="stSet('morning',this.value)"></div>
   <div class="st-row"><label>تذكير المساء (حفظ اليوم)</label><input type="time" id="st-evening" onchange="stSet('evening',this.value)"></div>
   <div class="st-row"><label>حد الصرف اليومي (ج) — 0 = بدون</label><input type="number" id="st-limit" style="width:90px" onchange="stSet('limit',+this.value)"></div>
   <div class="st-row"><label>التذكيرات بتشتغل والتطبيق مفتوح أو شغال في الخلفية. وعلى iPhone لازم تضيفه للشاشة الرئيسية الأول.</label><button class="btn" onclick="notify('🔔 تجربة','التذكيرات شغالة')">جرّب</button></div>
  </div></div>
  <div class="notes-card st-card"><div class="nc-header">📦 تصدير البيانات</div><div class="nc-body">
   <div class="st-row"><label>الفترة</label><select id="st-range"></select></div>
   <div class="st-btns"><button class="btn" onclick="exportData('exp')">CSV المصاريف</button><button class="btn" onclick="exportData('tasks')">CSV المهام</button><button class="btn btn-gold" onclick="exportData('pdf')">PDF تقرير</button></div>
  </div></div>
  <div class="notes-card st-card"><div class="nc-header">📲 التطبيق</div><div class="nc-body"><div class="st-btns">
   <button class="btn" id="st-install" style="display:none" onclick="installApp()">ثبّت التطبيق</button><button class="btn" onclick="onboard()">إعادة الشرح</button></div></div></div></div>`);
  const _sp = showPanel; window.showPanel = (id, el) => { _sp(id, el); if (id === 'settings') fillSettings(); };
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('st-install').style.display = 'inline-block'; });
  window.installApp = () => installEvt && installEvt.prompt();
  window.notify = notify;
  function fillSettings() {
    const c = cfg(); if (!$('st-morning')) return;
    $('st-morning').value = c.morning; $('st-evening').value = c.evening; $('st-limit').value = c.limit || '';
    $('st-state').textContent = c.on ? '✅ التذكيرات شغالة' + ('Notification' in window && Notification.permission !== 'granted' ? ' (تنبيهات داخل التطبيق بس — الإشعارات مش مسموحة)' : '') : '⏸ التذكيرات واقفة';
    const r = $('st-range'), keep = r.value, seen = {};
    Object.keys(S.exp).concat(Object.keys(S.dayTasks), Object.keys(S.inc)).forEach(i => { const d = gd(+i); seen[d.getFullYear() + '-' + d.getMonth()] = AR_M[d.getMonth()] + ' ' + d.getFullYear(); });
    r.innerHTML = '<option value="all">كل الفترة</option>' + Object.keys(seen).sort().map(k => `<option value="${k}">${seen[k]}</option>`).join('');
    r.value = keep || 'all';
  }
  window.stSet = (k, v) => { S.settings[k] = v; syncToCloud(); alerts(); };
  window.toggleRem = async () => {
    const on = !cfg().on; S.settings.on = on;
    if (on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) { } }
    syncToCloud(); fillSettings(); if (on) tick();
  };

  function dataset(range) {
    const ds = i => { const d = gd(i); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const inR = i => { if (range === 'all') return true; const d = gd(i); return d.getFullYear() + '-' + d.getMonth() === range; };
    const keys = o => Object.keys(o).map(Number).filter(inR).sort((a, b) => a - b);
    const exp = [], tasks = [];
    keys(S.exp).forEach(i => S.exp[i].forEach(e => exp.push([ds(i), 'مصروف', e.desc, e.cat, e.amt])));
    keys(S.inc).forEach(i => S.inc[i] && exp.push([ds(i), 'دخل', 'دخل اليوم', '', S.inc[i]]));
    exp.sort((a, b) => a[0] < b[0] ? -1 : 1);
    keys(S.dayTasks).forEach(i => S.dayTasks[i].forEach(t => tasks.push([ds(i), t.label, t.cat, 'P' + (6 - [...(t.priority || '⭐⭐⭐')].length), t.time || '', (S.tasks[i] || {})[t.id] ? 'تم' : 'لم يتم', (S.taskLinks[i] || {})[t.id] || ''])));
    return { exp, tasks };
  }
  const HE = ['التاريخ', 'النوع', 'الوصف', 'الفئة', 'المبلغ'], HT = ['التاريخ', 'المهمة', 'التصنيف', 'الأولوية', 'الوقت', 'الحالة', 'الرابط'];
  function download(name, text) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  const csv = (h, r) => '\ufeff' + [h, ...r].map(x => x.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const tbl = (h, r) => `<table><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr>${r.map(x => `<tr>${x.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table>`;
  window.exportData = kind => {
    const range = $('st-range').value, D = dataset(range), tag = range === 'all' ? 'all' : range;
    if (kind === 'exp') return download(`dsrpt-expenses-${tag}.csv`, csv(HE, D.exp));
    if (kind === 'tasks') return download(`dsrpt-tasks-${tag}.csv`, csv(HT, D.tasks));
    const out = D.exp.filter(r => r[1] === 'مصروف').reduce((s, r) => s + r[4], 0), inc = D.exp.filter(r => r[1] === 'دخل').reduce((s, r) => s + r[4], 0);
    $('print-root').innerHTML = `<h2>DSRPT — تقرير ${range === 'all' ? 'كل الفترة' : $('st-range').selectedOptions[0].text}</h2>
    <p>الدخل: ${inc} ج · المصاريف: ${out} ج · الصافي: ${inc - out} ج · المهام المنجزة: ${D.tasks.filter(t => t[5] === 'تم').length}/${D.tasks.length}</p>
    <h3>المصاريف والدخل</h3>${tbl(HE, D.exp)}<h3>المهام</h3>${tbl(HT.slice(0, 6), D.tasks.map(t => t.slice(0, 6)))}`;
    addEventListener('afterprint', () => $('print-root').innerHTML = '', { once: true });
    window.print();
  };

  /* ---------- Onboarding ---------- */
  const SL = [
    ['⚡', 'أهلاً في DSRPT', 'مكان واحد لمهامك وفلوسك وكورساتك. بياناتك بتتحفظ على حسابك وبتتزامن بين موبايلك وجهازك.'],
    ['✅', 'يومك', 'ضيف مهام بأولوية (P1 الأهم) ووقت لو عايز تذكير، واكتب أهم 3 مهام (MIT) وإنجازاتك. في آخر اليوم اضغط «حفظ وإنهاء اليوم» عشان يتلوّن أخضر في التقويم.'],
    ['💰', 'الفلوس والكورسات', 'سجّل مصاريفك ودخلك اليومي وشوف الصافي الشهري. وفي الكورسات احفظ كل لينك مع ملاحظة بموعد الخلاص.'],
    ['🔔', 'التذكيرات', 'فعّلها عشان توصلك تنبيهات الصبح والمساء ومواعيد المهام وتحذير لو عديت حد الصرف. على iPhone ضيف التطبيق للشاشة الرئيسية الأول (مشاركة ← Add to Home Screen).']
  ];
  let step = 0;
  window.onboard = () => { step = 0; drawOnb(); };
  function drawOnb() {
    let o = $('onb'); if (!o) { document.body.insertAdjacentHTML('beforeend', '<div id="onb"></div>'); o = $('onb'); }
    const s = SL[step], last = step === SL.length - 1;
    o.innerHTML = `<div class="box"><div style="font-size:42px">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p>
    <div class="dots">${SL.map((_, k) => k === step ? '<b>●</b>' : '●').join(' ')}</div>
    <button class="btn btn-gold" style="width:100%;padding:12px" onclick="onbNext()">${last ? 'فعّل التذكيرات وابدأ' : 'التالي'}</button>
    ${last ? '<button class="btn" style="width:100%;margin-top:8px" onclick="onbEnd()">ابدأ من غير تذكيرات</button>' : '<button class="btn" style="width:100%;margin-top:8px" onclick="onbEnd()">تخطي</button>'}</div>`;
  }
  window.onbNext = async () => { if (step < SL.length - 1) { step++; drawOnb(); } else { if (!cfg().on) await toggleRem(); onbEnd(); } };
  window.onbEnd = () => { S.settings.done = true; syncToCloud(); const o = $('onb'); if (o) o.remove(); };

  /* ---------- اللوجو والاسم ---------- */
  const LOGO = '<img src="icon.svg" alt="DSRPT">';
  document.querySelectorAll('.sb-icon,.brand-badge').forEach(e => e.innerHTML = LOGO);
  const ai = document.querySelector('#auth-overlay>div>div'); if (ai) ai.innerHTML = LOGO;
  document.querySelectorAll('link[rel*="icon"]').forEach(l => { if (l.rel === 'apple-touch-icon') l.href = 'icon-512.png'; else { l.type = 'image/svg+xml'; l.href = 'icon.svg'; } });
  document.title = 'DSRPT Tasks'; const bs = document.querySelector('.brand-sub'); if (bs) bs.textContent = 'TASKS';

  /* ---------- شاشة الدخول ---------- */
  const p = document.querySelector('#auth-overlay p');
  if (p) p.innerHTML = 'بياناتك خاصة بحسابك ومحمية بتسجيل الدخول — محدش غيرك يشوفها<br><br>✅ مهام بأولويات &nbsp; 💰 مصاريف ودخل &nbsp; 📚 كورسات &nbsp; 🔔 تذكيرات<br>📴 بيشتغل أوفلاين وبيتزامن لما النت يرجع';
})();
