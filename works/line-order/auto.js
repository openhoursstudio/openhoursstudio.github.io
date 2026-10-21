// 自動再生（?auto）：制作事例のページに埋め込んだアプリを、指の印つきで一巡させてはまた最初から。
// app.js と svc.js の両方が使う。手順は { t: 押す要素 } { s: スクロールする要素, f: 0〜1 } { e: 現れるのを待つ要素 } { r: 1（最初に戻す） } { w: 次までの待ち ms } の並び。
// 画面に触れたら止まってそのまま操作でき、画面の外にあるあいだは待ち、埋め込んだページのフォーカスやスクロールは動かさない。
window.LOAuto = function (app, steps, restart) {
  'use strict';
  var finger = document.createElement('i'), live = true, tm, i = 0, seen = true;
  finger.className = 'tap'; finger.setAttribute('aria-hidden', 'true'); app.appendChild(finger);
  function stop(e) {
    if (!e.isTrusted || !live) return;
    live = false; clearTimeout(tm); finger.remove();
  }
  // 自動のあいだはフォーカスを動かさない（埋め込んだページの入力欄からフォーカスを奪わないように）
  var nativeFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function () { if (!live) nativeFocus.apply(this, arguments); };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { app.addEventListener(ev, stop, { capture: true, passive: true }); });
  // 画面の外にあるあいだは止めておく（ページに何台も並ぶので）
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; }).observe(app);
  function scroller(el) { while (el && el !== app) { var o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight) return el; el = el.parentElement; } return null; }
  function glide(sc, top) { if (sc) sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); }
  function find(sel) { var el = app.querySelector(sel); if (el && el.matches('input')) el = el.closest('label') || el; return el && !el.disabled ? el : null; }
  function later(ms) { tm = setTimeout(next, ms); }
  function next() {
    if (!live) return;
    if (!seen) return later(600);
    var st = steps[i]; i = (i + 1) % steps.length;
    if (st.r) { restart(); return later(st.w); }
    if (st.s) { var sc = app.querySelector(st.s); if (sc) glide(sc, (sc.scrollHeight - sc.clientHeight) * st.f); return later(st.w); }
    // e: 現れるまで待つだけ（押さない）。時間で進む画面を、出てから少し見せるため
    if (st.e) { if (!app.querySelector(st.e)) { i = (i + steps.length - 1) % steps.length; return later(500); } return later(st.w); }
    if (!st.t) return later(st.w);
    var el = find(st.t); if (!el) return later(200);
    var sc2 = scroller(el);
    if (sc2) { var r = el.getBoundingClientRect(), b = sc2.getBoundingClientRect(); if (r.top < b.top + 40 || r.bottom > b.bottom - 80) glide(sc2, sc2.scrollTop + r.top - b.top - sc2.clientHeight / 2 + r.height / 2); }
    tm = setTimeout(function () {
      if (!live) return;
      var r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
      finger.style.left = (r.left - a.left + r.width / 2) + 'px'; finger.style.top = (r.top - a.top + r.height / 2) + 'px';
      finger.classList.remove('go'); void finger.offsetWidth; finger.classList.add('go');
      // 描き直しで要素が入れ替わっていたら、同じ場所のものを探し直して押す
      tm = setTimeout(function () { var x = document.body.contains(el) ? el : find(st.t); if (live && x) x.click(); later(st.w); }, 380);
    }, sc2 ? 520 : 120);
  }
  later(400);
};
