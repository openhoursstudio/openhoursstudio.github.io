// انیمیشن‌های اسکرولِ مشترکِ نمونه‌سایت‌های عکس‌محور (Tori to Sumi، Nuvola و بعدی‌ها).
// سبک و بدون کتابخانه: فقط transform و opacity، یک حلقه‌ی rAF که فقط وقتی بخشی در دید است کار می‌کند،
// و اگر کاربر «کاهش حرکت» را روشن کرده باشد، همه‌ی حرکت‌های پیوسته خاموش می‌شوند و فقط محتوا دیده می‌شود.
//
// data-zoom              عکسِ تمام‌صفحه‌ی بالای صفحه که با اسکرول کمی بزرگ و تیره می‌شود
// data-parallax="0.15"   عکسی که آرام‌تر از صفحه حرکت می‌کند (عدد = شدت)
// data-scrolly           بخشِ «داستانِ اسکرولی»: عکس‌ها ثابت می‌مانند و با رسیدنِ هر [data-step] عوض می‌شوند
// data-hscroll           ردیفِ افقی که روی دسکتاپ با اسکرولِ عمودی جلو می‌رود؛ روی گوشی با انگشت کشیده می‌شود
// data-tint="#hex"       بخشی که وقتی وسطِ صفحه می‌رسد، رنگِ پس‌زمینه‌ی صفحه (--tint روی body) را عوض می‌کند
// data-count="120"       عددی که وقتی دیده شد از صفر بالا می‌رود
// data-scrollbar         نوارِ پیشرفتِ خواندن
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('js-scroll');
  if (reduce) root.classList.add('still');

  var vh = window.innerHeight;
  var active = new Set();
  var jobs = [];
  var ticking = false;

  function frame() {
    ticking = false;
    jobs.forEach(function (j) { if (j.always || active.has(j.el)) j.run(); });
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  var watch = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) active.add(e.target); else active.delete(e.target); });
    request();
  }, { rootMargin: '20% 0px 20% 0px' }) : null;
  function track(el, run, always) {
    jobs.push({ el: el, run: run, always: always });
    if (watch && !always) watch.observe(el); else active.add(el);
  }

  // ── عکسِ بالای صفحه ──
  if (!reduce) document.querySelectorAll('[data-zoom]').forEach(function (el) {
    var img = el.querySelector('img');
    track(el, function () {
      var r = el.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / r.height));
      img.style.transform = 'translate3d(0,' + (p * 18).toFixed(2) + '%,0) scale(' + (1.04 + p * 0.12).toFixed(4) + ')';
      el.style.setProperty('--p', p.toFixed(3));
    });
  });

  // ── پارالاکس ──
  if (!reduce) document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var k = parseFloat(el.dataset.parallax) || 0.15;
    var img = el.querySelector('img') || el;
    track(el, function () {
      var r = el.getBoundingClientRect();
      var d = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = 'translate3d(0,' + (d * k * -100).toFixed(2) + 'px,0) scale(' + (1 + k) + ')';
    });
  });

  // ── داستانِ اسکرولی: هر متن که به وسطِ صفحه برسد، عکسِ خودش را روشن می‌کند ──
  document.querySelectorAll('[data-scrolly]').forEach(function (box) {
    var steps = box.querySelectorAll('[data-step]');
    var figs = box.querySelectorAll('[data-frame]');
    var dots = box.querySelector('[data-dots]');
    function show(i) {
      figs.forEach(function (f, n) { f.classList.toggle('on', n === i); });
      steps.forEach(function (s, n) { s.classList.toggle('on', n === i); });
      if (dots) dots.dataset.i = i;
    }
    show(0);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) show(Array.prototype.indexOf.call(steps, e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  });

  // ── ردیفِ افقی ──
  var wide = window.matchMedia('(min-width: 900px)');
  document.querySelectorAll('[data-hscroll]').forEach(function (sec) {
    var track_ = sec.querySelector('[data-track]');
    var dist = 0;
    function measure() {
      var on = wide.matches && !reduce;
      sec.classList.toggle('pinned', on);
      track_.style.transform = '';
      if (!on) { sec.style.height = ''; dist = 0; return; }
      dist = Math.max(0, track_.scrollWidth - window.innerWidth);
      sec.style.height = (vh + dist) + 'px';
      // ارتفاعِ بخش = یک صفحه + طولِ ردیف، تا با اسکرولِ عمودی تا ته برود
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    track(sec, function () {
      if (!dist) return;
      var r = sec.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / dist));
      track_.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      sec.style.setProperty('--hp', p.toFixed(3));
    });
  });

  // ── رنگِ پس‌زمینه بر اساسِ بخش ──
  var tints = document.querySelectorAll('[data-tint]');
  if (tints.length && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) document.body.style.setProperty('--tint', e.target.dataset.tint); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    tints.forEach(function (t) { tio.observe(t); });
  }

  // ── شمارنده ──
  var counts = document.querySelectorAll('[data-count]');
  if (counts.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = Number(el.dataset.count), t0 = null;
        if (reduce) { el.textContent = to; return; }
        (function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1200);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counts.forEach(function (c) { cio.observe(c); });
  }

  // ── نوارِ پیشرفت ──
  var bar = document.querySelector('[data-scrollbar]');
  if (bar) track(bar, function () {
    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
  }, true);

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; request(); });
  request();
})();
