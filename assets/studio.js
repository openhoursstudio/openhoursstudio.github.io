// سایتِ استودیو: ساعت‌های زنده‌ی شش شهر، و فرمِ سه‌مرحله‌ای (What / When / You).
// فرم هنوز به سرور وصل نیست؛ در پایان متنِ درخواست را می‌سازد تا مشتری کپی و ایمیل کند. پیش از concept.js بار می‌شود.
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function en() { return root.lang === 'en'; }

  // ── ساعت‌ها: عقربه، ساعتِ دیجیتال، و «مغازه‌ها بازند» بین ۸ تا ۲۰ به وقتِ محلی ──
  function localParts(tz) {
    var d = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    return { h: d.getHours(), m: d.getMinutes() };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    document.querySelectorAll('[data-clocks] [data-tz]').forEach(function (c) {
      var t = localParts(c.dataset.tz);
      var time = c.querySelector('[data-time]');
      if (time) time.textContent = pad(t.h) + ':' + pad(t.m);
      var h = c.querySelector('line.h'), m = c.querySelector('line.m');
      if (h) h.setAttribute('transform', 'rotate(' + ((t.h % 12) * 30 + t.m * 0.5) + ' 24 24)');
      if (m) m.setAttribute('transform', 'rotate(' + (t.m * 6) + ' 24 24)');
      c.classList.toggle('open', t.h >= 8 && t.h < 20);
    });
    document.querySelectorAll('[data-time-only]').forEach(function (el) {
      var t = localParts(el.dataset.tz);
      el.textContent = pad(t.h) + ':' + pad(t.m);
    });
  }
  tick();
  setInterval(tick, 30000);

  // عقربه‌ی ثانیه‌ی ساعتِ بزرگِ صفحه‌ی شهر: از ثانیه‌ی درست شروع کند
  document.querySelectorAll('[data-seconds]').forEach(function (l) { l.style.animationDelay = -(new Date().getSeconds()) + 's'; });

  // ── منوی گوشی ──
  var menuBtn = document.querySelector('[data-menu-btn]'), menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open);
    root.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('on'); }); menu.querySelector('a').focus({ preventScroll: true }); }
    else { menu.classList.remove('on'); setTimeout(function () { if (!menu.classList.contains('on')) menu.hidden = true; }, still ? 0 : 320); }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  // ── سربرگ: با پایین رفتن کنار می‌رود، با بالا آمدن برمی‌گردد ──
  var top = document.querySelector('.top'), lastY = scrollY, ticking = false;
  var progress = document.querySelector('[data-progress]');
  var phones = still ? [] : document.querySelectorAll('.hero-art .phone');
  function onScroll() {
    var y = scrollY;
    if (top && !root.classList.contains('menu-open')) top.classList.toggle('away', y > 160 && y > lastY + 4 ? true : y < lastY - 4 ? false : top.classList.contains('away'));
    lastY = y;
    if (progress) { var h = document.documentElement.scrollHeight - innerHeight; progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')'; }
    // پارالاکسِ ملایمِ گوشی‌های بالای خانه
    phones.forEach(function (p, i) { p.style.translate = '0 ' + (y * (i ? -0.06 : -0.12)).toFixed(1) + 'px'; });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ── دکمه‌ی شناورِ «شروع پروژه»: وقتی دکمه‌ی بالای صفحه، فرم یا پانویس در دید است، تکراری است و کنار می‌رود ──
  var dock = document.querySelector('.dock');
  if (dock && 'IntersectionObserver' in window) {
    var seen = new Set();
    var dockIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      dock.classList.toggle('off', seen.size > 0);
    });
    document.querySelectorAll('main .cta, main .btn[href*="contact"], [data-enquiry], .foot').forEach(function (el) { dockIO.observe(el); });
  }

  // ── جدولِ قیمتِ پهن روی گوشی اسکرول می‌خورد؛ با کیبورد هم قابلِ اسکرول باشد ──
  document.querySelectorAll('.ptable').forEach(function (t) {
    if (t.scrollWidth <= t.clientWidth + 1) return;
    var h = t.closest('section') && t.closest('section').querySelector('h2');
    t.tabIndex = 0;
    t.setAttribute('role', 'region');
    // با aria-labelledby برچسب همراهِ تغییرِ زبان عوض می‌شود
    if (h) { h.id = h.id || 'ptable-h-' + Math.random().toString(36).slice(2, 7); t.setAttribute('aria-labelledby', h.id); }
    else t.setAttribute('aria-label', 'Prices');
  });

  // ── ورودِ آرامِ بخش‌ها هنگامِ اسکرول ──
  // آنچه از اول در دید است پنهان نمی‌شود (هم چشمک نمی‌زند، هم گذارِ بین صفحه‌ها تصویرِ درست می‌گیرد)
  var REVEAL = '.head, .wcard, .city-card, .svc-card, .sec-card, .benefits li, .steps li, .promises article, .plan, .checks li, .ptable, .faq details, .contact-card, .about-grid article, .fly-card, .band-in, .partner-card, .block, .live-phone, .svc-row a';
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  if (io) document.querySelectorAll(REVEAL).forEach(function (el) {
    if (el.closest('.hero, .menu') || el.getBoundingClientRect().top < innerHeight * 0.9) return;
    var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--i', Math.min(sib, 6));
    el.classList.add('rv');
    io.observe(el);
  });

  // خطِ روندِ کار وقتی به دید آمد کشیده شود
  document.querySelectorAll('.steps').forEach(function (st) {
    if (!('IntersectionObserver' in window) || still) { st.classList.add('drawn'); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); st.classList.add('drawn'); } }, { rootMargin: '0px 0px -15% 0px' });
    o.observe(st);
  });

  // ── عددها از صفر می‌شمارند ──
  document.querySelectorAll('[data-count]').forEach(function (b) {
    var to = Number(b.dataset.count);
    if (still || to < 2) return;
    b.textContent = '0';
    var run = function () {
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1100); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
    };
    if (!('IntersectionObserver' in window)) { run(); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); setTimeout(run, 250); } });
    o.observe(b);
  });

  // ── کارتِ ساعتِ خانه: شهرها یکی‌یکی ──
  document.querySelectorAll('[data-rotate]').forEach(function (card) {
    var items = card.querySelectorAll('.hc-item'), i = 0;
    if (items.length < 2 || still) return;
    setInterval(function () { items[i].classList.remove('on'); i = (i + 1) % items.length; items[i].classList.add('on'); }, 2600);
  });

  // ── حبابِ «ببین» که دنبالِ نشانگر روی کارت‌ها می‌آید (فقط ماوس) ──
  var cursor = document.querySelector('[data-cursor]');
  if (cursor && finePointer && !still) {
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;
    var follow = function () { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cursor.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(follow) : null; };
    document.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(follow); }, { passive: true });
    document.querySelectorAll('[data-view]').forEach(function (a) {
      a.addEventListener('pointerenter', function (e) { cx = tx = e.clientX; cy = ty = e.clientY; cursor.classList.add('on'); });
      a.addEventListener('pointerleave', function () { cursor.classList.remove('on'); a.style.removeProperty('--rx'); a.style.removeProperty('--ry'); });
      // کج‌شدنِ ملایمِ قاب با جای نشانگر
      a.addEventListener('pointermove', function (e) { var r = a.getBoundingClientRect(); a.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg'); a.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 5).toFixed(2) + 'deg'); });
    });
  }

  // ── صفحه‌ی کارها: فیلترِ صنف و شهر با جابه‌جاییِ نرم ──
  var filters = document.querySelector('[data-filters]'), grid = document.querySelector('[data-grid]');
  if (filters && grid) {
    var state = { sector: 'all', country: 'all' }, cards = grid.querySelectorAll('.wcard');
    var countEl = filters.querySelector('[data-fcount]'), empty = document.querySelector('[data-empty]');
    var apply = function () {
      var n = 0;
      cards.forEach(function (c) { var ok = (state.sector === 'all' || c.dataset.sector === state.sector) && (state.country === 'all' || c.dataset.country === state.country); c.hidden = !ok; if (ok) n++; });
      empty.hidden = n > 0;
      countEl.textContent = en() ? n + (n === 1 ? ' site' : ' sites') : n + '件の制作例';
    };
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      state[b.dataset.f] = b.dataset.v;
      filters.querySelectorAll('[data-f="' + b.dataset.f + '"]').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      if (document.startViewTransition && !still) document.startViewTransition(apply); else apply();
    });
    document.addEventListener('langchange', apply);
    apply();
  }
  // ── صفحه‌ی خدمات: انتخابِ شهر برای قیمتِ کارت‌ها ──
  document.querySelectorAll('[data-prices]').forEach(function (box) {
    var btns = box.querySelectorAll('[data-city]'), vals = box.querySelectorAll('[data-c]');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-city]'); if (!b) return;
      btns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      vals.forEach(function (v) { v.hidden = v.dataset.c !== b.dataset.city; });
    });
  });
  // ── فرم ──
  document.querySelectorAll('[data-enquiry]').forEach(function (form) {
    var steps = form.querySelectorAll('fieldset[data-step]');
    var dots = form.querySelectorAll('.dots li');
    var back = form.querySelector('[data-back]'), next = form.querySelector('[data-next]');
    var done = form.querySelector('[data-done]'), summary = form.querySelector('[data-summary]');
    var at = 0;
    function en() { return document.documentElement.lang === 'en'; }
    function show(i) {
      at = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      dots.forEach(function (d, k) { d.classList.toggle('on', k <= i); });
      back.hidden = i === 0;
      var last = i === steps.length - 1;
      next.textContent = next.dataset[(last ? 'lFinish' : 'lNext') + (en() ? 'En' : '')];
    }
    function picked(name) {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (c) { return c.parentNode.textContent.trim(); }).join(', ');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (at === 0 && !form.querySelector('input[name="need"]:checked')) { form.querySelector('input[name="need"]').focus(); return; }
      if (at < steps.length - 1) { show(at + 1); return; }
      var missing = Array.prototype.filter.call(steps[at].querySelectorAll('input[required]'), function (i) { return !i.value.trim() || (i.type === 'email' && !/.+@.+\..+/.test(i.value)); });
      if (missing.length) { missing.forEach(function (m) { m.setAttribute('aria-invalid', 'true'); }); missing[0].focus(); return; }
      var v = function (n) { return (form.elements[n].value || '').trim(); };
      var city = form.elements.city.options[form.elements.city.selectedIndex].textContent;
      summary.textContent = [picked('need'), picked('when'), v('name') + (v('shop') ? ' · ' + v('shop') : '') + ' · ' + city, v('email')].join('\n');
      steps.forEach(function (s) { s.hidden = true; });
      form.querySelector('.form-nav').hidden = true;
      form.querySelector('.dots').hidden = true;
      done.hidden = false;
      // ایمیلِ آماده با موضوع و متن
      var mailto = form.querySelector('[data-mailto]');
      if (mailto) mailto.href = 'mailto:' + form.dataset.mail + '?subject=' + encodeURIComponent('Open Hours Studio · ' + (v('shop') || v('name'))) + '&body=' + encodeURIComponent(summary.textContent);
    });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid'); });
    back.addEventListener('click', function () { if (at > 0) show(at - 1); });
    form.querySelector('[data-copy]').addEventListener('click', function (e) {
      var btn = e.currentTarget, text = 'To: ' + form.dataset.mail + '\n\n' + summary.textContent;
      function select() { var r = document.createRange(); r.selectNodeContents(summary); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      try { navigator.clipboard.writeText(text).then(function () { btn.classList.add('copied'); }, select); } catch (err) { select(); }
    });
    document.addEventListener('langchange', function () { if (done.hidden) show(at); });
    show(0);
  });
})();

// صفحه‌ی خدمات: دسکتاپ = هر بار یک بخش (پیش‌فرض: اولی)؛ موبایل = هر بخش در یک مودال با دکمه‌ی بستن؛ بدون جاوااسکریپت همه دیده می‌شوند.
(function () {
  var cards = document.querySelectorAll('.svc-list .svc-card'), secs = document.querySelectorAll('.svc-head.svc-sec[id]');
  if (!cards.length || !secs.length) return;
  var wide = window.matchMedia('(min-width: 900px)'), root = document.documentElement, tab, lastCard;
  function reset() {
    root.classList.remove('svc-lock');
    cards.forEach(function (c) { c.removeAttribute('aria-current'); });
    secs.forEach(function (s) { s.classList.remove('svc-modal'); s.removeAttribute('role'); s.removeAttribute('aria-modal'); });
  }
  function show(id, scroll) {
    var hit = null;
    secs.forEach(function (s) { s.hidden = s.id !== id; if (!s.hidden) hit = s; });
    cards.forEach(function (c) { c.toggleAttribute('aria-current', c.hash === '#' + id); });
    if (hit && scroll) hit.scrollIntoView();
  }
  function openModal(id) {
    reset();
    secs.forEach(function (s) { s.hidden = s.id !== id; });
    var s = document.getElementById(id);
    s.classList.add('svc-modal'); s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true');
    s.scrollTop = 0; root.classList.add('svc-lock');
    s.querySelector('.svc-x').focus();
  }
  function closeModal() { reset(); secs.forEach(function (s) { s.hidden = true; }); }
  function dismiss() {
    closeModal();
    history.replaceState(null, '', location.pathname + location.search);
    if (lastCard) lastCard.focus();
  }
  function fromHash() {
    var id = location.hash.slice(1), known = Array.prototype.some.call(secs, function (s) { return s.id === id; });
    if (wide.matches) { reset(); if (known) show(tab = id, true); else show(tab = tab || secs[0].id, false); }
    else if (known) openModal(id); else closeModal();
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      // desktop: skip the browser's own jump to the (still hidden) target, which can scroll to the top
      if (wide.matches) { if (location.hash !== c.hash) history.pushState(null, '', c.hash); fromHash(); return; }
      lastCard = c; openModal(c.hash.slice(1)); history.pushState(null, '', c.hash);
    });
  });
  secs.forEach(function (s) { s.querySelector('.svc-x').addEventListener('click', dismiss); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('svc-lock')) dismiss(); });
  fromHash();
  window.addEventListener('hashchange', fromHash);
  wide.addEventListener('change', fromHash);
})();

// «روش کار» و فهرست هر پلن در موبایل جمع‌شونده‌اند (پیش‌فرض بسته)؛ در دسکتاپ همیشه باز.
(function () {
  var boxes = document.querySelectorAll('.svc-steps, .plan-more'), wide = window.matchMedia('(min-width: 900px)');
  if (!boxes.length) return;
  function sync() { boxes.forEach(function (d) { d.open = wide.matches; }); }
  boxes.forEach(function (d) {
    d.querySelector('summary').addEventListener('click', function (e) { if (wide.matches) e.preventDefault(); });
  });
  sync();
  wide.addEventListener('change', sync);
})();

// منوی بالا: صفحه‌ی فعلی (و زیرصفحه‌هایش) علامت می‌خورد.
(function () {
  document.querySelectorAll('.nav a, .menu-links a').forEach(function (a) {
    if (location.pathname.indexOf(a.pathname.replace(/[^\/]*$/, '')) === 0) a.setAttribute('aria-current', 'page');
  });
})();
