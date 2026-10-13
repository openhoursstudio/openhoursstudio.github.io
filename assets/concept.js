// コンセプト作品と制作スタジオの共通スクリプト：言語切り替え（基本言語＋英語）、営業中表示（現地時間、5言語）、タブ、表示アニメーション、写真クレジット。
// 設定は <body> の data 属性：data-open="08:00" data-close="18:00" data-closed-day="3"（0=日曜）data-key="kk"
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  var cfg = { open: body.dataset.open || "09:00", close: body.dataset.close || "18:00", closedDay: body.dataset.closedDay == null ? -1 : Number(body.dataset.closedDay), tz: body.dataset.tz || "Asia/Tokyo", key: (body.dataset.key || "concept") + "-lang" };
  var self = document.currentScript;
  // زبانِ پایه‌ی صفحه (متنِ داخلِ HTML) و انگلیسی در data-en. پیش‌فرض ژاپنی؛ برای ایتالیایی، آلمانی، هلندی: data-base="it" و…
  var base = body.dataset.base || 'ja';
  var titles = { en: body.dataset.titleEn || document.title };
  titles[base] = document.title;
  function mins(t) { var p = t.split(":"); return Number(p[0]) * 60 + Number(p[1]); }

  // ── 言語：data-en に英語、元の日本語は data-ja に保存 ──
  var nodes = document.querySelectorAll('[data-en]');
  var alts = document.querySelectorAll('[data-en-alt]');
  function setLang(lang) {
    root.lang = lang;
    root.dataset.l = lang === 'en' ? 'en' : 'base';
    nodes.forEach(function (el) {
      if (el.dataset.ja == null) el.dataset.ja = el.innerHTML;
      var html = el.hasAttribute('data-html');
      var next = lang === 'en' ? el.dataset.en : el.dataset.ja;
      if (html || lang !== 'en') el.innerHTML = next; else el.textContent = next;
    });
    alts.forEach(function (img) {
      if (img.dataset.jaAlt == null) img.dataset.jaAlt = img.alt;
      img.alt = lang === 'en' ? img.dataset.enAlt : img.dataset.jaAlt;
    });
    document.title = titles[lang];
    try { localStorage.setItem(cfg.key, lang); } catch (e) { /* 保存できなくても動く */ }
    renderStatus();
    // بقیه‌ی اسکریپت‌ها (مثلاً فرمِ استودیو) برچسب‌هایشان را با زبانِ تازه به‌روز کنند
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  var toggle = document.querySelector('[data-lang-toggle]');
  if (toggle) toggle.addEventListener('click', function () { setLang(root.lang === 'en' ? base : 'en'); });

  // ── 営業中表示：お店の現地時刻で判定（data-tz、既定は東京）──
  var statusEl = document.querySelector('[data-status]');
  function renderStatus() {
    if (!statusEl) return;
    var now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.tz }));
    var day = now.getDay();
    var m = now.getHours() * 60 + now.getMinutes();
    var closedToday = day === cfg.closedDay;
    var o0 = mins(cfg.open), c0 = mins(cfg.close);
    // ساعتِ بسته‌شدنِ بعد از نیمه‌شب (مثلاً ۱۸:۰۰ تا ۲:۰۰)
    var open = !closedToday && (c0 > o0 ? m >= o0 && m < c0 : m >= o0 || m < c0);
    var o = cfg.open.replace(/^0/, ''), cl = cfg.close.replace(/^0/, '');
    var L = STATUS[root.lang] || STATUS.en;
    var text = open ? L.open(cl) : closedToday ? L.today(L.days[day]) : L.closed(o);
    statusEl.className = 'status' + (open ? ' open' : '');
    statusEl.innerHTML = '<i></i>' + text;
  }

  // متنِ «الان باز است» به پنج زبان
  var STATUS = {
    en: { open: function (c) { return 'Open now · until ' + c; }, closed: function (o) { return 'Closed now · opens at ' + o; }, today: function (d) { return 'Closed today (' + d + ')'; }, days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    ja: { open: function (c) { return 'ただいま営業中 · ' + c + 'まで'; }, closed: function (o) { return '営業時間外 · ' + o + 'から'; }, today: function (d) { return '本日定休日（' + d + '曜）'; }, days: '日月火水木金土'.split('') },
    it: { open: function (c) { return 'Aperto ora · fino alle ' + c; }, closed: function (o) { return 'Chiuso ora · apre alle ' + o; }, today: function (d) { return 'Oggi chiuso (' + d + ')'; }, days: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'] },
    de: { open: function (c) { return 'Jetzt geöffnet · bis ' + c; }, closed: function (o) { return 'Jetzt geschlossen · öffnet um ' + o; }, today: function (d) { return 'Heute geschlossen (' + d + ')'; }, days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'] },
    nl: { open: function (c) { return 'Nu open · tot ' + c; }, closed: function (o) { return 'Nu gesloten · open om ' + o; }, today: function (d) { return 'Vandaag gesloten (' + d + ')'; }, days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'] },
  };

  // ── メニューのタブ（矢印キー対応）──
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"][aria-controls]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus();
    });
  });

  // ── ردیفِ زبانه‌ی صفحه‌ها روی گوشی: زبانه‌ی صفحه‌ی فعلی وسطِ دید بیاید ──
  var cur = document.querySelector('.pages [aria-current="page"]');
  if (cur) {
    var row = cur.parentNode, r = row.getBoundingClientRect(), c = cur.getBoundingClientRect();
    if (c.left < r.left || c.right > r.right) row.scrollLeft += c.left - r.left - (r.width - c.width) / 2;
  }

  // ── 表示アニメーション ──
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });

  // ── 写真クレジット ──
  var list = document.querySelector('[data-credits]');
  if (list) fetch(new URL('photos/CREDITS.json', self.src).href).then(function (r) { return r.json(); }).then(function (rows) {
    var used = {};
    document.querySelectorAll('img[src*="assets/photos/"]').forEach(function (img) { used[img.getAttribute('src').split('/').pop()] = 1; });
    rows.filter(function (r) { return used[r.file]; }).forEach(function (r) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = r.landing; a.rel = 'noopener'; a.target = '_blank';
      a.textContent = (r.title || r.file) + (r.creator ? ' · ' + r.creator : '') + ' · ' + r.source + ' (CC0)';
      li.appendChild(a); list.appendChild(li);
    });
  }).catch(function () { /* クレジットが読めなくてもページは動く */ });

  var saved = null;
  try { saved = new URLSearchParams(location.search).get('lang') || localStorage.getItem(cfg.key); } catch (e) { /* 無視 */ }
  // پیش‌فرض: data-default-lang روی body؛ «auto» یعنی از زبانِ مرورگر (زبانِ پایه اگر مرورگر همان است، وگرنه انگلیسی)
  var def = body.dataset.defaultLang || base;
  if (def === 'auto') def = new RegExp('^' + base, 'i').test(navigator.language || '') ? base : 'en';
  setLang(saved === 'en' || saved === base ? saved : def);
})();
