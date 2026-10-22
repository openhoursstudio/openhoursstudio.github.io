// صفحه‌ی «Googleマップの毎月の運用» (services/meo/): سه نمونه‌ی تعاملی، همه با متنِ ثابت در HTML (زبان را concept.js عوض می‌کند).
// ۱) قبل و بعدِ صفحه‌ی نقشه، که تا کاربر دست نزده خودش هر چند ثانیه عوض می‌شود.
// ۲) نظرها: انتخابِ نظر، دیدنِ پیش‌نویسِ جواب، و «OK در LINE».
// ۳) گزارشِ ماهانه با سه ماه، و کارتِ QR با چهار زبان و دو شکل.
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(root, sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); }
  function press(root, sel, on) { each(root, sel, function (b) { b.setAttribute('aria-pressed', b === on); }); }

  // ۱) قبل و بعد
  var stage = document.querySelector('[data-meo-stage]');
  if (stage) {
    var timer = null, seen = false;
    var set = function (st) { stage.dataset.state = st; each(stage, '[data-meo-state]', function (b) { b.setAttribute('aria-pressed', b.dataset.meoState === st); }); };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () { if (timer || reduce) return; timer = setInterval(function () { set(stage.dataset.state === 'after' ? 'before' : 'after'); }, 3600); };
    each(stage, '[data-meo-state]', function (b) { b.addEventListener('click', function () { stop(); seen = true; set(b.dataset.meoState); }); });
    if (!reduce) {
      set('before');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen) play(); else stop(); }); }, { threshold: .35 }).observe(stage);
      } else play();
    }
  }

  // ۲) نظرها
  var rv = document.querySelector('[data-meo-reviews]');
  if (rv) {
    var cur = 0, done = {};
    var ok = rv.querySelector('[data-rv-ok]');
    var show = function (i) {
      cur = i;
      each(rv, '[data-rv]', function (b) { b.setAttribute('aria-selected', +b.dataset.rv === i); b.tabIndex = +b.dataset.rv === i ? 0 : -1; });
      each(rv, '[data-rvp]', function (p) { p.hidden = +p.dataset.rvp !== i; });
      rv.classList.toggle('is-ok', !!done[i]);
    };
    each(rv, '[data-rv]', function (b) {
      b.addEventListener('click', function () { show(+b.dataset.rv); });
      b.addEventListener('keydown', function (e) {
        var n = rv.querySelectorAll('[data-rv]').length, k = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return; e.preventDefault(); show((cur + k + n) % n); rv.querySelector('[data-rv="' + cur + '"]').focus();
      });
    });
    ok.addEventListener('click', function () {
      done[cur] = true;
      rv.querySelector('[data-rv="' + cur + '"]').classList.add('is-done');
      rv.classList.add('is-ok');
    });
    show(0);
  }

  // ۳) گزارشِ ماهانه
  var rp = document.querySelector('[data-meo-report]');
  if (rp) {
    var month = function (m) {
      press(rp, '[data-m]', rp.querySelector('[data-m="' + m + '"]'));
      each(rp, '[data-v]', function (el) {
        var v = el.dataset.v.split(',')[m];
        el.textContent = /^\d+$/.test(v) ? Number(v).toLocaleString('en-US') : v;
      });
      each(rp, '[data-w]', function (el) { el.style.setProperty('--w', el.dataset.w.split(',')[m] + '%'); });
    };
    each(rp, '[data-m]', function (b) { b.addEventListener('click', function () { month(+b.dataset.m); }); });
    month(2);
  }

  // ۳) کارتِ QR
  var cd = document.querySelector('[data-meo-card]');
  if (cd) {
    each(cd, '[data-cl]', function (b) { b.addEventListener('click', function () { cd.dataset.lang = b.dataset.cl; press(cd, '[data-cl]', b); }); });
    each(cd, '[data-cf]', function (b) { b.addEventListener('click', function () { cd.dataset.fmt = b.dataset.cf; press(cd, '[data-cf]', b); }); });
  }
})();
