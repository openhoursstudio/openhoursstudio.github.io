// デモ「LINEミニアプリ」の注文以外の使い方：予約・順番受付・会員証。注文のデモ（app.js）と同じページの作りで、お店ごとの設定と文言は scenario ファイルが window.LS に入れる。
// 流れは3種類：book＝美容室の予約（メニュー→担当→日時→確認）／queue＝クリニックの順番受付（家で待って、近づいたらLINEでお知らせ）／
// member＝パン屋の会員証（ポイント・クーポン・焼き上がりのお知らせ）。通信も決済もしない、ページの中だけで完結する見本。
(function () {
  'use strict';
  var C = window.LS;
  var root = document.documentElement;
  var app = document.querySelector('[data-app]');
  var screens = app.querySelector('[data-screens]');
  var sheetWrap = app.querySelector('[data-sheet]'), sheetBody = app.querySelector('[data-sheet-body]');
  var toastEl = app.querySelector('[data-toast]');
  var kitchen = document.querySelector('[data-kitchen]'), side = document.querySelector('[data-side]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var P = '../../assets/photos/';

  // ── 共通の文言（お店ごとの設定 C.t で上書き） ──
  var BASE = {
    ja: {
      restart: 'デモを最初から', credits: '写真クレジット', close: '閉じる',
      consentLead: 'このサービスが、次の情報へのアクセスを求めています。',
      consentProfile: 'メインプロフィール情報', consentProfileSub: '表示名とプロフィール画像',
      allow: '許可する', cancel: 'キャンセル', consentNote: '実際のLINEでは、この画面は初回だけ表示されます。',
      from: 'LINE', minAgo: 'たった今', news: 'お知らせ', info: 'お店の情報', member: 'LINE会員証',
      seeSide: 'お店側の画面を見る（デモ）', skip: '時間を進める（デモ）',
      openNow: function (c) { return '営業中 · ' + c + 'まで'; }, openAt: function (o) { return '本日 ' + o + 'から営業'; }, closedToday: '本日定休日',
      stampLeft: function (n) { return 'あと' + n + '回で特典'; }
    },
    en: {
      restart: 'Restart the demo', credits: 'Photo credits', close: 'Close',
      consentLead: 'This service is asking for access to:',
      consentProfile: 'Your main profile', consentProfileSub: 'Display name and profile picture',
      allow: 'Allow', cancel: 'Cancel', consentNote: 'In real LINE this screen only appears the first time.',
      from: 'LINE', minAgo: 'just now', news: 'News', info: 'About the shop', member: 'LINE member card',
      seeSide: 'See the shop’s screen (demo)', skip: 'Skip ahead (demo)',
      openNow: function (c) { return 'Open now · until ' + c; }, openAt: function (o) { return 'Opens today at ' + o; }, closedToday: 'Closed today',
      stampLeft: function (n) { return n + ' more visits for a reward'; }
    }
  };
  function lang() { return root.lang === 'en' ? 'en' : 'ja'; }
  function L() { var l = lang(), t = {}, k; for (k in BASE[l]) t[k] = BASE[l][k]; for (k in C.t[l]) t[k] = C.t[l][k]; return t; }
  function yen(n) { return '¥' + n.toLocaleString('ja-JP'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nm(x) { return x[lang()][0]; }
  function sub(x) { return x[lang()][1] || ''; }
  function tokyo() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })); }
  function clock() { var d = tokyo(); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function hm(min) { return Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0'); }
  function toMin(s) { var a = s.split(':').map(Number); return a[0] * 60 + a[1]; }
  function mins(m) {
    var h = Math.floor(m / 60), r = m % 60;
    if (lang() === 'en') return (h ? h + ' h' : '') + (h && r ? ' ' : '') + (r ? r + ' min' : '');
    return (h ? h + '時間' : '') + (r ? r + '分' : '');
  }
  var WD = { ja: ['日', '月', '火', '水', '木', '金', '土'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dLabel(d) { return lang() === 'en' ? WD.en[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] : (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD.ja[d.getDay()] + '）'; }
  // 毎回同じ結果になる乱数（予約の埋まり方などを、リロードしても変えないため）
  function rng(seed) { seed = seed % 2147483647 || 1; return function () { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; }; }
  // 営業時間は <body> の data 属性から（concept.js と同じ設定）
  function hours(t) {
    var b = document.body.dataset, now = tokyo();
    var min = now.getHours() * 60 + now.getMinutes(), om = toMin(b.open), cm = toMin(b.close);
    var open = now.getDay() !== Number(b.closedDay) && min >= om && min < cm;
    if (open) return { on: true, text: t.openNow(b.close.replace(/^0/, '')) };
    return { on: false, text: now.getDay() === Number(b.closedDay) ? t.closedToday : t.openAt(b.open.replace(/^0/, '')) };
  }
  function pic(name, cls) { return '<img class="' + cls + '" src="' + P + name + '.webp" width="360" height="360" loading="lazy" alt="">'; }

  // ── どの流れにも出てくる部品 ──
  var SCAN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 12h8"/></svg>';
  var OK = '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div>';
  function hero(t) {
    var h = hours(t);
    return '<figure class="w-hero' + (C.hero ? '' : ' sv-art') + '">' + (C.hero ? '<img src="' + P + C.hero + '.webp" alt="">' : C.art) + '<figcaption>' +
      '<span class="w-open' + (h.on ? ' on' : '') + '"><i></i>' + h.text + '</span><span class="w-shop"><b>' + esc(t.shop) + '</b><small>' + t.kind + '</small></span></figcaption></figure>';
  }
  function intro(t) { return '<h2 class="w-title">' + t.welcome + '</h2><p class="w-scan">' + SCAN + t.scanned + '</p>'; }
  function news(t) { return '<div class="w-news"><b>' + t.news + '</b><ul>' + t.newsBody.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul></div>'; }
  function info(t) { return '<h3 class="w-h">' + t.info + '</h3><dl class="w-info">' + t.infoRows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; }
  function notes(t) { return '<div class="w-notes">' + t.notes.map(function (n) { return '<p class="small">' + n + '</p>'; }).join('') + '</div>' + (C.photos.length ? '<button type="button" class="link small cr-link" data-credits-open>' + t.credits + '</button>' : ''); }
  function bar(html, two) { return '<div class="bar' + (two ? ' two' : '') + '">' + html + '</div>'; }
  function seeSide(t) { return '<button type="button" class="link see-k" data-kitchen-open>' + t.seeSide + ' →</button>'; }
  function stampCard(t, have) {
    var need = C.stamps.need, dots = '';
    for (var i = 1; i <= need; i++) dots += '<li class="' + (i <= have ? 'on' : '') + '"></li>';
    return '<div class="w-card"><div class="wc-top"><small>' + t.member + '</small><b>' + t.stampName + '</b></div><ol class="stamps" style="grid-template-columns:repeat(' + need + ',1fr)" aria-label="' + have + ' / ' + need + '">' + dots + '</ol>' +
      '<p>' + t.stampLeft(need - have) + '（' + t.stampReward + '）</p></div>';
  }
  function barcode(seed) {
    var r = rng(seed), s = '', x = 0;
    while (x < 196) { var w = 1 + Math.floor(r() * 3), g = 1 + Math.floor(r() * 3); s += 'M' + x + ' 0h' + w + 'v40h-' + w + 'z'; x += w + g; }
    return '<svg class="sv-bc" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><path d="' + s + '"/></svg>';
  }

  // ════════ book：美容室の予約 ════════
  function Book() {
    var mBy = {}, aBy = {}, sBy = {}, cache = {};
    C.menus.forEach(function (m) { mBy[m.id] = m; });
    C.addons.forEach(function (a) { aBy[a.id] = a; });
    C.staff.forEach(function (s, i) { s.i = i; sBy[s.id] = s; });
    var DAYS = 14;
    function day(i) {
      var d = tokyo(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i);
      var h = d.getDay() === 0 || d.getDay() === 6 ? C.hours.we : C.hours.wk, open = toMin(h[0]);
      return { d: d, i: i, open: open, n: (toMin(h[1]) - open) / 30, closed: d.getDay() === C.closed, key: d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() };
    }
    // ほかのお客さまの予約（架空）。よく埋まっているけれど、どの日も長めの施術が入る空きを二つは残しておく
    function appts(D, st) {
      var id = D.key + st.id;
      if (cache[id]) return cache[id];
      var r = rng(D.key * 31 + st.i * 977), half = Math.floor(D.n / 2), out = [];
      var holes = [Math.floor(r() * (half - 3)), half + Math.floor(r() * (D.n - half - 3))];
      var k = Math.floor(r() * 2);
      while (k < D.n) {
        var len = 2 + Math.floor(r() * 3);
        var hit = holes.filter(function (h) { return k < h + 4 && h < k + len; })[0];
        if (hit !== undefined) { if (hit - k >= 2) len = hit - k; else { k = hit + 4; continue; } }
        if (k + len > D.n) break;
        out.push({ from: k, len: len, lab: Math.floor(r() * 6) % (st.spa ? 2 : 6) });
        var g = r(); k += len + (g < .5 ? 0 : g < .8 ? 1 : 2);
      }
      return (cache[id] = out);
    }
    function addMin() { return S.adds.reduce(function (a, id) { return a + aBy[id].min; }, 0); }
    function dur(menu) { return mBy[menu || S.menu].min + (menu ? 0 : addMin()); }
    function eligible(menu) { var m = mBy[menu || S.menu]; return C.staff.filter(function (s) { return m.spa ? s.spa : s.hair; }); }
    function freeFor(st, di, k, n) {
      var D = day(di);
      if (D.closed || k + n > D.n) return false;
      if (di === 0) { var nw = tokyo(); if (D.open + k * 30 < nw.getHours() * 60 + nw.getMinutes() + 30) return false; }
      if (S.booked && S.booked.di === di && S.booked.st === st.id && k < S.booked.k + S.booked.n && S.booked.k < k + n) return false;
      return !appts(D, st).some(function (a) { return k < a.from + a.len && a.from < k + n; });
    }
    function who(di, k, staff, menu) {
      var n = Math.ceil(dur(menu) / 30), list = (staff || S.staff) === 'any' ? eligible(menu) : [sBy[staff || S.staff]];
      for (var i = 0; i < list.length; i++) if (freeFor(list[i], di, k, n)) return list[i];
      return null;
    }
    function first(staff, menu) {
      for (var di = 0; di < DAYS; di++) { var D = day(di); for (var k = 0; k < D.n; k++) if (who(di, k, staff, menu)) return { di: di, k: k }; }
      return null;
    }
    function dayFree(di) { var D = day(di); for (var k = 0; k < D.n; k++) if (who(di, k)) return true; return false; }
    function when(x, t) { var D = day(x.di); return (x.di === 0 ? t.today + ' ' : x.di === 1 ? t.tomorrow + ' ' : dLabel(D.d) + ' ') + hm(D.open + x.k * 30); }
    function fee() { var st = sBy[S.booked ? S.booked.st : S.staff]; return st && st.top && mBy[S.menu].top ? C.topFee : 0; }
    function base() { return mBy[S.menu].p + S.adds.reduce(function (a, id) { return a + aBy[id].p; }, 0) + fee(); }
    function off() { return S.first ? Math.floor(base() * C.firstOff / 10) * 10 : 0; }
    function addonsFor() { var m = mBy[S.menu]; return C.addons.filter(function (a) { return !(m.spa && a.spa) && !(m.noAdd || []).some(function (x) { return x === a.id; }); }); }
    function stepper(n, t) {
      return '<ol class="sv-steps" aria-label="' + t.stepOf(n, 4) + '">' + t.stepNames.map(function (s, i) {
        return '<li class="' + (i < n - 1 ? 'done' : i === n - 1 ? 'on' : '') + '"' + (i === n - 1 ? ' aria-current="step"' : '') + '><i>' + (i < n - 1 ? '✓' : i + 1) + '</i><span>' + s + '</span></li>';
      }).join('') + '</ol>';
    }
    function av(st) { return st ? '<span class="sv-av" aria-hidden="true">' + (lang() === 'en' ? st.en[0].charAt(0) : st.ini) + '</span>' : '<span class="sv-av any" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/></svg></span>'; }
    function staffName(id) { return id === 'any' ? L().anyName : nm(sBy[id]); }
    function menuSheet(id) {
      var m = mBy[id], t = L();
      S.menu = id; S.adds = [];
      sheet((m.img ? '<img class="s-img" src="' + P + m.img + '.webp" width="360" height="360" alt="">' : '') +
        '<div class="s-body"><h2 id="sheet-title">' + esc(nm(m)) + '</h2>' + (sub(m) ? '<p>' + esc(sub(m)) + '</p>' : '') +
        '<p class="s-price">' + yen(m.p) + ' <small>' + t.taxin + ' · ' + t.about(mins(m.min)) + '</small></p>' +
        '<fieldset class="sv-adds"><legend>' + t.addQ + '</legend>' + addonsFor().map(function (a) {
          return '<label class="sv-add"><input type="checkbox" data-addon="' + a.id + '"><span><b>' + esc(nm(a)) + '</b><small>' + esc(sub(a)) + '</small></span><em>+' + yen(a.p) + '<small>+' + mins(a.min) + '</small></em></label>';
        }).join('') + '</fieldset>' +
        '<p class="sv-sum" data-sum></p><button type="button" class="cta" data-go="staff">' + t.toStaff + '</button></div>');
      updSum();
    }
    function updSum() { var el = sheetBody.querySelector('[data-sum]'); if (el) el.textContent = L().sheetSum(yen(base()), mins(dur())); }

    var views = {
      home: function (t) {
        var soon = first('any', C.soonMenu);
        var picks = '<h3 class="w-h">' + t.picks + '</h3><div class="w-picks">' + C.picks.map(function (id) {
          var m = mBy[id];
          return '<button type="button" class="pk" data-pick="' + id + '">' + pic(m.img, 'pk-img') + '<b>' + esc(nm(m)) + '</b><span>' + yen(m.p) + ' · ' + mins(m.min) + '</span></button>';
        }).join('') + '</div>';
        return '<div class="scr welcome"><div class="pad">' + hero(t) + '<div class="w-in">' + intro(t) +
          (soon ? '<div class="sv-soon"><small>' + t.soonLabel + '</small><b>' + when(soon, t) + '</b><span>' + t.soonFor(nm(mBy[C.soonMenu])) + '</span></div>' : '') +
          news(t) + picks + stampCard(t, C.stamps.have) + info(t) + notes(t) + '</div></div>' +
          bar('<button type="button" class="cta" data-go="consent">' + t.start + '</button>') + '</div>';
      },
      menu: function (t) {
        return '<div class="scr book"><div class="pad">' + stepper(1, t) + '<h2>' + t.menuTitle + '</h2>' + C.cats.map(function (c) {
          return '<section class="cat"><h3>' + c[lang()] + '</h3><ul class="items">' + C.menus.filter(function (m) { return m.cat === c.id; }).map(function (m) {
            return '<li><button type="button" class="item" data-menu="' + m.id + '">' + (m.img ? pic(m.img, 'thumb') : '<span class="thumb ph" aria-hidden="true">' + esc(nm(m).charAt(0)) + '</span>') +
              '<span class="i-text"><b>' + esc(nm(m)) + (m.tag ? '<i class="tag">' + m.tag[lang() === 'en' ? 1 : 0] + '</i>' : '') + '</b>' + (sub(m) ? '<span>' + esc(sub(m)) + '</span>' : '') +
              '<em>' + yen(m.p) + ' <small class="sv-min">' + mins(m.min) + '</small></em></span><span class="plus" aria-hidden="true">›</span></button></li>';
          }).join('') + '</ul></section>';
        }).join('') + '<p class="small">' + t.menuNote + '</p></div></div>';
      },
      staff: function (t) {
        var m = mBy[S.menu];
        var list = ['any'].concat(eligible().map(function (s) { return s.id; })).map(function (id) {
          var st = sBy[id], f = first(id), extra = st && st.top && m.top ? '<em>+' + yen(C.topFee) + '</em>' : '';
          return '<li><button type="button" class="sv-staff" data-staff="' + id + '">' + av(st) + '<span class="i-text"><b>' + esc(staffName(id)) + '</b><span>' + (st ? esc(sub(st)) + '<br>' + esc(st[lang()][2]) : t.anyRole) + '</span>' +
            '<small class="sv-next">' + (f ? t.firstFree(when(f, t)) : t.noFree) + '</small></span>' + extra + '</button></li>';
        }).join('');
        return '<div class="scr book"><div class="pad">' + stepper(2, t) + '<button type="button" class="back" data-go="menu">← ' + t.backMenu + '</button><h2>' + t.staffTitle + '</h2>' +
          '<p class="sv-pick">' + esc(nm(m)) + (S.adds.length ? ' ＋ ' + S.adds.map(function (id) { return esc(nm(aBy[id])); }).join('・') : '') + ' · ' + mins(dur()) + '</p>' +
          '<ul class="sv-staffs">' + list + '</ul>' + (C.topNote ? '<p class="small">' + t.topNote + '</p>' : '') + '</div></div>';
      },
      when: function (t) {
        var D = day(S.day), first0 = null;
        var days = '';
        for (var i = 0; i < DAYS; i++) {
          var x = day(i), free = !x.closed && dayFree(i);
          days += '<button type="button" class="sv-day" data-day="' + i + '" aria-pressed="' + (i === S.day) + '"' + (free ? '' : ' disabled') + '><small>' + WD[lang()][x.d.getDay()] + '</small><b>' + x.d.getDate() + '</b><i>' + (x.closed ? t.closedShort : free ? '○' : '×') + '</i></button>';
        }
        var times = '';
        for (var k = 0; k < D.n; k++) {
          var ok = !!who(S.day, k);
          if (ok && first0 === null) first0 = k;
          times += '<button type="button" class="sv-time" data-time="' + k + '"' + (ok ? '' : ' disabled') + '>' + hm(D.open + k * 30) + '</button>';
        }
        return '<div class="scr book"><div class="pad">' + stepper(3, t) + '<button type="button" class="back" data-go="staff">← ' + t.backStaff + '</button><h2>' + t.whenTitle + '</h2>' +
          '<p class="sv-pick">' + esc(nm(mBy[S.menu])) + ' · ' + esc(staffName(S.staff)) + ' · ' + mins(dur()) + '</p>' +
          '<p class="sv-month">' + (lang() === 'en' ? MON[D.d.getMonth()] + ' ' + D.d.getFullYear() : D.d.getFullYear() + '年' + (D.d.getMonth() + 1) + '月') + '</p>' +
          '<div class="sv-days" role="group" aria-label="' + t.whenTitle + '">' + days + '</div>' +
          '<h3 class="sv-h">' + t.timesFor(dLabel(D.d)) + '</h3>' + (first0 === null ? '<p class="small">' + t.noTime + '</p>' : '<div class="sv-times">' + times + '</div>') +
          '<p class="small">' + t.legend + '</p></div></div>';
      },
      confirm: function (t) {
        var m = mBy[S.menu], D = day(S.day), st = who(S.day, S.slot);
        var rows = [[t.rMenu, esc(nm(m))]];
        if (S.adds.length) rows.push([t.rAdd, S.adds.map(function (id) { return esc(nm(aBy[id])); }).join('・')]);
        rows.push([t.rStaff, esc(staffName(S.staff)) + (S.staff === 'any' && st ? '<small>' + t.assigned(nm(st)) + '</small>' : '')], [t.rWhen, dLabel(D.d) + ' ' + hm(D.open + S.slot * 30)], [t.rDur, t.about(mins(dur()))]);
        var lines = [[esc(nm(m)), yen(m.p)]].concat(S.adds.map(function (id) { return [esc(nm(aBy[id])), yen(aBy[id].p)]; }));
        if (fee()) lines.push([t.topFeeLine, yen(fee())]);
        if (S.first) lines.push([t.firstOffLine, '−' + yen(off())]);
        return '<div class="scr book confirm"><div class="pad">' + stepper(4, t) + '<button type="button" class="back" data-go="when">← ' + t.backWhen + '</button><h2>' + t.confirmTitle + '</h2>' +
          '<dl class="w-info sv-sumtbl">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
          '<label class="switch fr"><input type="checkbox" data-first' + (S.first ? ' checked' : '') + '><span><b>' + t.firstVisit + '</b><small>' + t.firstVisitSub + '</small></span></label>' +
          '<label class="switch fr"><input type="checkbox" data-remind' + (S.remind ? ' checked' : '') + '><span><b>' + t.remind + '</b><small>' + t.remindSub + '</small></span></label>' +
          '<ul class="receipt sv-rc">' + lines.map(function (l) { return '<li><span>' + l[0] + '</span><b>' + l[1] + '</b></li>'; }).join('') + '</ul>' +
          '<div class="total"><span>' + t.total + '</span><b>' + yen(base() - off()) + '</b></div><p class="small">' + t.payAt + '</p>' +
          '<label class="note"><span>' + t.note + '</span><textarea rows="2" data-note placeholder="' + esc(t.notePh) + '">' + esc(S.note) + '</textarea></label></div>' +
          bar('<button type="button" class="cta" data-book>' + t.bookBtn + '</button>') + '</div>';
      },
      done: function (t) {
        var b = S.booked, D = day(b.di);
        return '<div class="scr done"><div class="pad">' + OK + '<h2>' + t.doneTitle + '</h2>' +
          '<div class="sv-ticket"><small>' + t.bookNo + ' ' + b.no + '</small><b>' + dLabel(D.d) + '<span>' + hm(D.open + b.k * 30) + (lang() === 'ja' ? '〜' : '') + '</span></b>' +
          '<p>' + esc(nm(mBy[S.menu])) + (S.adds.length ? ' ＋ ' + S.adds.map(function (id) { return esc(nm(aBy[id])); }).join('・') : '') + '</p>' +
          '<p>' + t.rStaff + (lang() === 'ja' ? '：' : ': ') + esc(nm(sBy[b.st])) + ' · ' + t.about(mins(dur())) + ' · ' + yen(b.total) + '</p></div>' +
          '<p class="center small">' + (S.remind ? t.remindNote : t.noRemind) + '</p>' +
          '<h3 class="h-title">' + t.nextTitle + '</h3><ol class="sv-flow">' + t.nextList.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('') + '</ol>' +
          '<button type="button" class="link" data-change>' + t.change + '</button>' + seeSide(t) + '</div>' +
          bar('<button type="button" class="cta ghost" data-restart-btn>' + t.restart + '</button>') + '</div>';
      }
    };
    return {
      reset: function () { return { menu: null, adds: [], staff: 'any', day: 0, slot: null, first: true, remind: true, note: '', booked: null, pending: null }; },
      views: views,
      start: function () { if (S.pending) { var p = S.pending; S.pending = null; go('menu'); menuSheet(p); } else go('menu'); },
      click: function (d) {
        var t = L();
        if (d.pick) { if (S.started) { go('menu'); menuSheet(d.pick); } else { S.pending = d.pick; consentSheet(); } }
        else if (d.menu) menuSheet(d.menu);
        else if (d.staff) {
          S.staff = d.staff;
          // いま選んでいる日に空きがなければ、空きのある最初の日へ
          if (!dayFree(S.day)) { var f = first(); S.day = f ? f.di : 0; }
          go('when');
        }
        else if (d.day) { S.day = Number(d.day); render(); }
        else if (d.time) { S.slot = Number(d.time); go('confirm'); }
        else if (d.book !== undefined) {
          var st = who(S.day, S.slot);
          S.booked = { di: S.day, k: S.slot, n: Math.ceil(dur() / 30), st: st.id, no: C.prefix + String(C.seq + 1), total: 0 };
          S.booked.total = base() - off();
          go('done');
          var D = day(S.day), at = hm(D.open + S.slot * 30);
          toast(t.toastBooked(dLabel(D.d) + ' ' + at));
          if (S.remind) later(function () { if (S.screen === 'done') toast(L().toastRemind(dLabel(D.d), at, nm(mBy[S.menu]))); }, 5200);
        }
        else if (d.change !== undefined) toast(t.changeToast);
        else return false;
        return true;
      },
      change: function (el) {
        if (el.dataset.addon) {
          var id = el.dataset.addon;
          S.adds = S.adds.filter(function (x) { return x !== id; });
          if (el.checked) S.adds.push(id);
          updSum();
        }
        else if (el.matches('[data-first]')) { S.first = el.checked; render(); app.querySelector('[data-first]').focus({ preventScroll: true }); }
        else if (el.matches('[data-remind]')) S.remind = el.checked;
      },
      input: function (el) { if (el.matches('[data-note]')) S.note = el.value.slice(0, 120); },
      // 予約台帳：選んでいる日（予約したらその日）の、担当ごとの埋まり方
      side: function (t) {
        var di = S.booked ? S.booked.di : S.day, D = day(di), cells = '', count = 0;
        var head = '<div class="k-sum"><span>' + t.ledgerFor(dLabel(D.d)) + '</span><b>' + '{n}' + '</b></div>';
        if (D.closed) return head.replace('{n}', '—') + '<p class="k-empty">' + t.closedDay + '</p>';
        cells += '<span class="sv-lh"></span>' + C.staff.map(function (s) { return '<span class="sv-lh">' + esc(nm(s)) + '</span>'; }).join('');
        for (var k = 0; k < D.n; k++) cells += '<span class="sv-lt" style="grid-row:' + (k + 2) + '">' + (k % 2 ? '' : hm(D.open + k * 30)) + '</span>';
        C.staff.forEach(function (s) {
          appts(D, s).forEach(function (a) { count++; cells += '<span class="sv-ap" style="grid-column:' + (s.i + 2) + ';grid-row:' + (a.from + 2) + ' / span ' + a.len + '">' + (s.spa ? t.busySpa : t.busy)[a.lab] + '</span>'; });
        });
        if (S.booked && S.booked.di === di) {
          count++;
          cells += '<span class="sv-ap new" style="grid-column:' + (sBy[S.booked.st].i + 2) + ';grid-row:' + (S.booked.k + 2) + ' / span ' + S.booked.n + '"><b>' + t.newLine + '</b>' + esc(nm(mBy[S.menu])) + '</span>';
        }
        return head.replace('{n}', t.ledCount(count)) + '<div class="sv-led" style="--cols:' + C.staff.length + ';--rows:' + D.n + '">' + cells + '</div>' +
          (S.booked ? '' : '<p class="k-note">' + t.ledHint + '</p>');
      },
      auto: function () {
        return [{ w: 1600 }, { s: '.welcome .pad', f: .4, w: 2200 }, { s: '.welcome .pad', f: 0, w: 900 },
          { t: '[data-go="consent"]', w: 1300 }, { t: '[data-consent="1"]', w: 1500 },
          { t: '[data-menu="' + C.auto.menu + '"]', w: 1300 }, { t: 'input[data-addon="' + C.auto.addon + '"]', w: 1200 }, { t: '[data-go="staff"]', w: 1500 },
          { t: '[data-staff="' + C.auto.staff + '"]', w: 1500 }, { t: '.sv-day[aria-pressed="true"] ~ .sv-day:not([disabled])', w: 1300 },
          { t: '.sv-time:not([disabled])', w: 1500 }, { s: '.confirm .pad', f: 1, w: 1600 }, { t: '[data-book]', w: 3200 },
          { s: '.done .pad', f: 1, w: 4200 }, { r: 1, w: 600 }];
      }
    };
  }

  // ════════ queue：クリニックの順番受付 ════════
  function Queue() {
    var tick = null;
    function ahead() { return S.mine ? S.waiting.filter(function (w) { return w.no < S.mine; }).length : S.waiting.length; }
    function stop() { clearInterval(tick); tick = null; }
    function run() { stop(); tick = setInterval(function () { if (S.screen === 'ticket') next(); }, C.step); }
    function next() {
      var t = L(), w = S.waiting.shift(); if (!w) return;
      S.called = w.no;
      // 窓口や電話の受付も、ときどき列の後ろに加わる
      if (S.waiting.length < 6) { S.seq += 1; S.waiting.push({ no: S.seq, src: S.seq % 3 ? 'w' : 'l', dept: S.seq % 2, visit: S.seq % 4 ? 1 : 0, sym: [] }); }
      var a = ahead();
      if (w.no === S.mine) { stop(); go('called'); toast(t.toastCalled(S.mine)); return; }
      if (S.mine && a === C.notifyAt && !S.near) { S.near = true; toast(t.toastNear(a)); }
      render();
    }
    function chip(name, val, label, type, on) { return '<label class="sv-chip"><input type="' + (type || 'radio') + '" name="' + name + '" value="' + val + '"' + (on ? ' checked' : '') + '><span>' + label + '</span></label>'; }
    var views = {
      home: function (t) {
        var a = ahead();
        return '<div class="scr welcome"><div class="pad">' + hero(t) + '<div class="w-in">' + intro(t) +
          '<div class="w-queue sv-live"><span><small>' + t.nowCalling + '</small><b>' + t.numUnit(S.called) + '</b></span><span><small>' + t.waitingLabel + '</small><b>' + t.people(a) + '</b></span><p>' + t.waitAbout(a * C.perMin) + '</p></div>' +
          '<div class="sv-alert"><b>' + t.feverTitle + '</b>' + t.feverBody + '</div>' +
          news(t) + info(t) + notes(t) + '</div></div>' +
          bar('<button type="button" class="cta" data-go="consent">' + t.start + '</button>') + '</div>';
      },
      form: function (t) {
        var f = S.form;
        return '<div class="scr form"><div class="pad"><button type="button" class="back" data-go="home">← ' + t.backHome + '</button><h2>' + t.formTitle + '</h2><p class="small">' + t.formLead + '</p>' +
          '<fieldset class="sv-field"><legend>' + t.whoQ + '</legend><div class="sv-chips">' + t.who.map(function (x, i) { return chip('who', i, x, 'radio', f.who === i); }).join('') + '</div></fieldset>' +
          '<fieldset class="sv-field"><legend>' + t.deptQ + '</legend><div class="sv-chips">' + t.dept.map(function (x, i) { return chip('dept', i, x, 'radio', f.dept === i); }).join('') + '</div></fieldset>' +
          '<fieldset class="sv-field"><legend>' + t.visitQ + '</legend><div class="sv-chips">' + t.visit.map(function (x, i) { return chip('visit', i, x, 'radio', f.visit === i); }).join('') + '</div></fieldset>' +
          '<fieldset class="sv-field"><legend>' + t.symQ + '</legend><div class="sv-chips">' + C.syms.map(function (s) { return chip('sym', s.id, s[lang()], 'checkbox', f.sym.indexOf(s.id) >= 0); }).join('') + '</div></fieldset>' +
          (f.sym.indexOf('fever') >= 0 ? '<div class="sv-alert"><b>' + t.feverTitle + '</b>' + t.feverForm + '</div>' : '') +
          '<p class="small">' + t.bring + '</p></div>' +
          bar('<button type="button" class="cta" data-take>' + t.take + '</button>') + '</div>';
      },
      ticket: function (t) {
        var a = ahead(), total = S.startAhead || 1, pct = Math.round((1 - a / total) * 100);
        return '<div class="scr qt"><div class="pad">' +
          '<div class="sv-num"><small>' + t.yourNo + '</small><b>' + S.mine + '</b><span>' + t.dept[S.form.dept] + ' · ' + t.visit[S.form.visit] + '</span></div>' +
          '<div class="sv-ahead"><p>' + t.aheadOf(a) + '</p><div class="sv-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div><small>' + t.waitAbout(a * C.perMin) + ' · ' + t.nowCallingIs(S.called) + '</small></div>' +
          '<p class="sv-rule">' + t.rule(C.notifyAt) + '</p>' +
          (S.form.sym.indexOf('fever') >= 0 ? '<div class="sv-alert"><b>' + t.feverTitle + '</b>' + t.feverArrive + '</div>' : '') +
          '<ol class="track">' + t.track.map(function (s, i) { var on = i === 0 || (i === 1 && S.near); return '<li class="' + (on ? 'on' : '') + '"><i></i><span>' + s + '</span></li>'; }).join('') + '</ol>' +
          '<button type="button" class="link" data-skip>' + t.skip + '</button>' + seeSide(t) + '<p class="small">' + t.demoFast + '</p></div>' +
          bar('<button type="button" class="cta ghost" data-cancel>' + t.cancelTicket + '</button>') + '</div>';
      },
      called: function (t) {
        return '<div class="scr called"><div class="pad"><div class="sv-call"><small>' + t.callingYou + '</small><b>' + S.mine + '</b><p>' + t.room + '</p></div>' +
          '<p class="center">' + t.calledLead + '</p>' + seeSide(t) + '</div>' +
          bar('<button type="button" class="cta" data-go="after">' + t.finishVisit + '</button>') + '</div>';
      },
      after: function (t) {
        return '<div class="scr done"><div class="pad">' + OK + '<h2>' + t.afterTitle + '</h2><p class="center">' + t.afterLead + '</p>' +
          '<h3 class="h-title">' + t.nextTitle + '</h3><ol class="sv-flow">' + t.nextList.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('') + '</ol></div>' +
          bar('<button type="button" class="cta ghost" data-restart-btn>' + t.restart + '</button>') + '</div>';
      },
      cancelled: function (t) {
        return '<div class="scr done"><div class="pad"><h2>' + t.cancelledTitle + '</h2><p class="center">' + t.cancelledLead + '</p></div>' +
          bar('<button type="button" class="cta ghost" data-restart-btn>' + t.restart + '</button>') + '</div>';
      }
    };
    return {
      reset: function () { stop(); return { called: C.called, waiting: C.waiting.map(function (w) { return { no: w.no, src: w.src, dept: w.dept, visit: w.visit, sym: w.sym.slice() }; }), seq: C.waiting[C.waiting.length - 1].no, mine: 0, near: false, startAhead: 0, form: { who: 1, dept: 1, visit: 1, sym: [] } }; },
      views: views,
      start: function () { go('form'); },
      click: function (d) {
        var t = L();
        if (d.take !== undefined) {
          S.seq += 1; S.mine = S.seq; S.startAhead = ahead();
          S.waiting.push({ no: S.mine, src: 'l', dept: S.form.dept, visit: S.form.visit, sym: S.form.sym.slice(), me: true });
          go('ticket'); toast(t.toastTaken(S.mine, ahead())); run();
        }
        else if (d.skip !== undefined) next();
        else if (d.cancel !== undefined) { stop(); S.waiting = S.waiting.filter(function (w) { return !w.me; }); S.mine = 0; go('cancelled'); }
        else return false;
        return true;
      },
      change: function (el) {
        var f = S.form, v = el.value;
        if (el.name === 'sym') { f.sym = f.sym.filter(function (x) { return x !== v; }); if (el.checked) f.sym.push(v); if (v === 'fever') { render(); app.querySelector('input[name="sym"][value="fever"]').focus({ preventScroll: true }); } }
        else if (el.name in f) f[el.name] = Number(v);
      },
      sideClick: function (d) { if (d.next !== undefined) next(); },
      // 受付の画面：呼び出し中の番号と、待っている方の一覧
      side: function (t) {
        var rows = S.waiting.map(function (w) {
          var fever = w.sym.indexOf('fever') >= 0;
          return '<li class="ticket sv-qrow' + (w.me ? ' me' : '') + '"><b class="sv-qno">' + w.no + '</b><span>' + t.dept[w.dept] + ' · ' + t.visit[w.visit] + (fever ? ' <i class="sv-flag">' + t.feverShort + '</i>' : '') + '</span><small>' + (w.src === 'l' ? 'LINE' : t.walkIn) + (w.me ? ' · ' + t.thisDemo : '') + '</small></li>';
        }).join('');
        return '<div class="k-sum"><span>' + t.nowCalling + '</span><b>' + t.numUnit(S.called) + '</b></div>' +
          '<button type="button" class="k-btn hot sv-nextbtn" data-next' + (S.waiting.length ? '' : ' disabled') + '>' + t.callNext + '</button>' +
          '<p class="k-note">' + t.sideCount(S.waiting.length, S.waiting.filter(function (w) { return w.src === 'l'; }).length) + '</p>' +
          '<ol class="tickets">' + rows + '</ol>';
      },
      restart: stop,
      auto: function () {
        return [{ w: 1600 }, { s: '.welcome .pad', f: .45, w: 2200 }, { s: '.welcome .pad', f: 0, w: 900 },
          { t: '[data-go="consent"]', w: 1300 }, { t: '[data-consent="1"]', w: 1500 },
          { t: 'input[name="visit"][value="0"]', w: 900 }, { t: 'input[name="sym"][value="cough"]', w: 900 }, { t: 'input[name="sym"][value="throat"]', w: 1100 },
          { t: '[data-take]', w: 3000 }, { s: '.qt .pad', f: 1, w: 2600 }, { s: '.qt .pad', f: 0, w: 1500 },
          { e: '.sv-call', w: 3000 }, { t: '[data-go="after"]', w: 3200 }, { s: '.done .pad', f: 1, w: 3000 }, { r: 1, w: 600 }];
      }
    };
  }

  // ════════ member：パン屋の会員証 ════════
  function Member() {
    var cBy = {}, bBy = {};
    C.coupons.forEach(function (c) { cBy[c.id] = c; });
    C.bakes.forEach(function (b) { bBy[b.id] = b; });
    function sale() { return C.buy.reduce(function (a, l) { return a + l.p * l.q; }, 0); }
    function disc() { return S.use ? cBy[S.use].off : 0; }
    function earned() { return Math.floor((sale() - disc()) / C.rate); }
    function card(t, pts) {
      return '<div class="sv-card"><div class="sv-card-top"><small>' + t.member + '</small><b>' + esc(t.shop) + '</b><i>' + t.rank + '</i></div>' +
        '<p class="sv-pts"><span>' + t.points + '</span><b>' + pts.toLocaleString('ja-JP') + '<small>pt</small></b></p>' +
        '<div class="sv-bcw">' + barcode(4123307) + '<span>' + C.no + '</span></div></div>';
    }
    function goal(t, pts) {
      var left = C.goal - pts % C.goal, pct = Math.round(pts % C.goal / C.goal * 100);
      return '<div class="sv-goal"><p>' + t.toGoal(left) + '</p><div class="sv-prog"><i style="width:' + pct + '%"></i></div></div>';
    }
    var views = {
      home: function (t) {
        return '<div class="scr welcome"><div class="pad">' + hero(t) + '<div class="w-in">' + intro(t) +
          '<ul class="sv-perks">' + t.perks.map(function (p, i) { return '<li><i aria-hidden="true">' + C.perkIcons[i] + '</i><span><b>' + p[0] + '</b><small>' + p[1] + '</small></span></li>'; }).join('') + '</ul>' +
          '<h3 class="w-h">' + t.bakesTitle + '</h3><ul class="sv-bakes">' + C.bakes.map(function (b) { return '<li>' + pic(b.img, 'thumb sm') + '<span><b>' + esc(nm(b)) + '</b><small>' + t.bakeAt(b.at) + '</small></span></li>'; }).join('') + '</ul>' +
          news(t) + info(t) + notes(t) + '</div></div>' +
          bar('<button type="button" class="cta" data-go="consent">' + t.start + '</button>') + '</div>';
      },
      card: function (t) {
        var cps = C.coupons.filter(function (c) { return S.used.indexOf(c.id) < 0; });
        return '<div class="scr mcard"><div class="pad">' + card(t, S.pts) + goal(t, S.pts) +
          '<h3 class="w-h">' + t.couponsTitle + ' <small class="sv-count">' + cps.length + '</small></h3>' +
          (cps.length ? '<ul class="sv-coupons">' + cps.map(function (c) { return '<li><button type="button" class="sv-cp" data-coupon="' + c.id + '"><span><small>' + c[lang()][0] + '</small><b>' + c[lang()][1] + '</b><em>' + c[lang()][2] + '</em></span><i>' + t.useIt + '</i></button></li>'; }).join('') + '</ul>' : '<p class="small">' + t.noCoupons + '</p>') +
          '<h3 class="w-h">' + t.bellTitle + '</h3><p class="small">' + t.bellLead + '</p><ul class="sv-bells">' + C.bakes.map(function (b) {
            return '<li><label class="switch">' + pic(b.img, 'thumb sm') + '<span><b>' + esc(nm(b)) + '</b><small>' + t.bakeAt(b.at) + '</small></span><input type="checkbox" data-bell="' + b.id + '"' + (S.bells.indexOf(b.id) >= 0 ? ' checked' : '') + ' aria-label="' + esc(t.bellLabel(nm(b))) + '"></label></li>';
          }).join('') + '</ul>' + seeSide(t) + '</div>' +
          bar('<button type="button" class="cta" data-show>' + t.showCard + '</button>') + '</div>';
      },
      use: function (t) {
        var c = S.use ? cBy[S.use] : null;
        return '<div class="scr use"><div class="pad"><button type="button" class="back" data-go="card">← ' + t.backCard + '</button><h2>' + t.useTitle + '</h2><p class="small">' + t.useLead + '</p>' +
          '<div class="sv-scan">' + barcode(4123307) + '<span>' + C.no + '</span></div>' +
          (c ? '<div class="sv-cpbig"><small>' + c[lang()][0] + '</small><b>' + c[lang()][1] + '</b><span data-left>' + t.validFor('5:00') + '</span></div>' : '') +
          '<p class="small center">' + t.autoScan + '</p>' + seeSide(t) + '</div></div>';
      },
      thanks: function (t) {
        var lines = C.buy.map(function (l) { return '<li><span>' + esc(l[lang()]) + ' × ' + l.q + '</span><b>' + yen(l.p * l.q) + '</b></li>'; }).join('') +
          (S.paidUse ? '<li class="sv-off"><span>' + cBy[S.paidUse][lang()][1] + '</span><b>−' + yen(cBy[S.paidUse].off) + '</b></li>' : '');
        return '<div class="scr done"><div class="pad">' + OK + '<h2>' + t.thanksTitle + '</h2>' +
          '<p class="sv-got">+' + S.got + '<small>pt</small></p><p class="center small">' + t.gotLead(S.got) + '</p>' +
          '<ul class="receipt">' + lines + '</ul><div class="total"><span>' + t.total + '</span><b>' + yen(S.paid) + '</b></div>' +
          goal(t, S.pts) + '<p class="small">' + t.receiptNote + '</p></div>' +
          bar('<button type="button" class="cta ghost" data-restart-btn>' + t.again + '</button><button type="button" class="cta" data-go="card">' + t.backCard + '</button>', true) + '</div>';
      }
    };
    function scan() {
      if (S.screen !== 'use' && S.screen !== 'card') return;
      var t = L();
      S.paidUse = S.use; S.got = earned(); S.paid = sale() - disc(); S.pts += S.got;
      if (S.use) S.used.push(S.use);
      S.use = null; S.scanned = true;
      go('thanks'); toast(t.toastScan(S.got, S.pts));
    }
    var countdown = null;
    return {
      reset: function () { clearInterval(countdown); return { pts: 0, used: [], bells: [], use: null, paidUse: null, got: 0, paid: 0, scanned: false }; },
      views: views,
      start: function () { S.pts = C.join; go('card'); toast(L().toastJoin(C.join)); },
      click: function (d) {
        var t = L();
        if (d.coupon) {
          var c = cBy[d.coupon];
          sheet('<div class="s-body sv-cpsheet"><p class="sv-cplabel">' + c[lang()][0] + '</p><h2 id="sheet-title">' + c[lang()][1] + '</h2><p>' + c[lang()][2] + '</p><p class="small">' + c[lang()][3] + '</p>' +
            '<button type="button" class="cta" data-use="' + c.id + '">' + t.useNow + '</button><button type="button" class="cta ghost" data-close-sheet>' + t.later + '</button></div>');
        }
        else if (d.use) { S.use = d.use; enterUse(); }
        else if (d.show !== undefined) { S.use = null; enterUse(); }
        else return false;
        return true;
      },
      change: function (el) {
        if (!el.dataset.bell) return;
        var b = bBy[el.dataset.bell], t = L();
        S.bells = S.bells.filter(function (x) { return x !== b.id; });
        if (!el.checked) return;
        S.bells.push(b.id); toast(t.bellOn(nm(b), b.at));
        later(function () { if (S.bells.indexOf(b.id) >= 0) toast(L().bellNow(nm(b))); }, 3800);
      },
      sideClick: function (d) { if (d.scan !== undefined) scan(); },
      // レジ（POS）の画面：会計中の品物と、会員証の読み取り
      side: function (t) {
        var ready = S.screen === 'use' || S.screen === 'card', c = S.use ? cBy[S.use] : null;
        var lines = C.buy.map(function (l) { return '<li><b>' + l.q + '</b> ' + esc(l[lang()]) + '<span>' + yen(l.p * l.q) + '</span></li>'; }).join('');
        var status = S.screen === 'thanks' ? '<p class="t-paid">' + t.posDone(S.got) + '</p>' : ready ? '<p class="t-note">' + (c ? t.posCoupon(c[lang()][1]) : t.posReady) + '</p>' : '<p class="t-note">' + t.posWait + '</p>';
        return '<div class="k-sum"><span>' + t.posSum + '</span><b>' + yen(S.screen === 'thanks' ? S.paid : sale() - (c ? c.off : 0)) + '</b></div>' +
          '<div class="ticket sv-pos"><div class="t-top"><b>' + t.posTitle + '</b><span>' + clock() + '</span></div><ul>' + lines + '</ul>' + status +
          '<div class="t-foot"><span>' + (S.pts ? C.no + ' · ' + S.pts + 'pt' : '') + '</span><button type="button" class="k-btn hot" data-scan' + (ready ? '' : ' disabled') + '>' + t.posScan + '</button></div></div>' +
          '<p class="k-note">' + t.posNote + '</p>';
      },
      restart: function () { clearInterval(countdown); },
      auto: function () {
        return [{ w: 1600 }, { s: '.welcome .pad', f: .45, w: 2200 }, { s: '.welcome .pad', f: 0, w: 900 },
          { t: '[data-go="consent"]', w: 1300 }, { t: '[data-consent="1"]', w: 2600 },
          { t: 'input[data-bell="' + C.auto.bell + '"]', w: 5600 }, { s: '.mcard .pad', f: 0, w: 600 },
          { t: '[data-coupon="' + C.auto.coupon + '"]', w: 1500 }, { t: '[data-use]', w: 5600 },
          { s: '.done .pad', f: 1, w: 3200 }, { r: 1, w: 600 }];
      }
    };
    // クーポンは表示してから5分間有効。デモでは数秒でレジが読み取る
    function enterUse() {
      go('use'); clearInterval(countdown);
      var end = Date.now() + 5 * 60000, t0 = S.use;
      countdown = setInterval(function () {
        var el = screens.querySelector('[data-left]'); if (!el || S.screen !== 'use') return clearInterval(countdown);
        var s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        el.textContent = L().validFor(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'));
      }, 1000);
      later(function () { if (S.screen === 'use' && S.use === t0) scan(); }, C.scanAfter);
    }
  }

  var F = { book: Book, queue: Queue, member: Member }[C.flow]();

  // ── 状態と描画 ──
  var S, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function reset() {
    timers.forEach(clearTimeout); timers = [];
    S = F.reset(); S.screen = 'home'; S.friend = true; S.started = false;
  }
  function render(focus) {
    var t = L(), cur = screens.firstElementChild, same = !!cur && cur.dataset.s === S.screen;
    app.querySelector('[data-mh-title]').textContent = t.title;
    app.querySelector('[data-mh-sub]').textContent = t.sub;
    app.querySelector('[data-mh-restart]').textContent = t.restart;
    var pad = screens.querySelector('.pad'), y = same && pad ? pad.scrollTop : 0;
    screens.innerHTML = F.views[S.screen](t);
    var scr = screens.firstElementChild; scr.dataset.s = S.screen;
    if (same) scr.classList.add('still');
    pad = screens.querySelector('.pad'); if (pad && y) pad.scrollTop = y;
    if (focus) { var h = screens.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    side.innerHTML = F.side(t);
  }
  function go(s) { S.screen = s; closeSheet(); render(true); var sc = screens.querySelector('.pad'); if (sc) sc.scrollTop = 0; }
  function restart() { if (F.restart) F.restart(); reset(); go('home'); }

  // ── ボトムシート ──
  var lastFocus = null;
  function sheet(html) {
    lastFocus = document.activeElement;
    sheetBody.innerHTML = html; sheetWrap.hidden = false;
    requestAnimationFrame(function () { sheetWrap.classList.add('open'); var f = sheetBody.querySelector('.cta, button'); if (f) f.focus({ preventScroll: true }); });
  }
  function closeSheet() {
    if (sheetWrap.hidden) return;
    sheetWrap.classList.remove('open'); sheetWrap.hidden = true; sheetBody.innerHTML = '';
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function consentSheet() {
    var t = L();
    sheet('<div class="consent"><span class="mh-icon big" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><h2 id="sheet-title">' + t.title + '</h2><p>' + t.consentLead + '</p>' +
      '<ul class="perm"><li><b>' + t.consentProfile + '</b><small>' + t.consentProfileSub + '</small></li></ul>' +
      '<label class="switch fr"><input type="checkbox" data-friend' + (S.friend ? ' checked' : '') + '><span><b>' + t.consentFriend + '</b><small>' + t.consentFriendSub + '</small></span></label>' +
      '<div class="two"><button type="button" class="cta ghost" data-consent="0">' + t.cancel + '</button><button type="button" class="cta" data-consent="1">' + t.allow + '</button></div><p class="small center">' + t.consentNote + '</p></div>');
  }

  // ── 通知（LINEのトークに届くお知らせのイメージ） ──
  var toastTimer;
  function toast(msg) {
    var t = L();
    toastEl.innerHTML = '<span class="mh-icon" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><span><b>' + esc(t.shop) + ' <small>' + t.from + ' · ' + t.minAgo + '</small></b>' + esc(msg) + '</span>';
    toastEl.hidden = false; toastEl.classList.remove('in'); void toastEl.offsetWidth; toastEl.classList.add('in');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('in'); setTimeout(function () { toastEl.hidden = true; }, 300); }, 4200);
  }

  // ── 操作 ──
  // 描き直しで押したボタンが消えたら、同じ役目のボタンにフォーカスを戻す
  function keyOf(el) {
    for (var i = 0; i < el.attributes.length; i++) { var a = el.attributes[i]; if (a.name.indexOf('data-') === 0) return '[' + a.name + '="' + a.value + '"]'; }
    return null;
  }
  function refocus(box, sel) { if (sel && !box.contains(document.activeElement)) { var n = box.querySelector(sel); if (n) n.focus({ preventScroll: true }); } }
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a, [data-close-sheet]'); if (!el || el.disabled) return;
    var d = el.dataset, sel = keyOf(el);
    if (d.go === 'consent') consentSheet();
    else if (d.consent) {
      if (d.consent === '0') { S.pending = null; closeSheet(); return; }
      var f = sheetBody.querySelector('[data-friend]'); S.friend = !!(f && f.checked); S.started = true;
      closeSheet(); F.start();
    }
    else if (d.restart !== undefined || d.restartBtn !== undefined) restart();
    else if (d.closeSheet !== undefined) closeSheet();
    else if (d.kitchenOpen !== undefined) openKitchen();
    else if (d.creditsOpen !== undefined) sheet('<div class="cr-sheet"><h2 id="sheet-title">' + L().credits + '</h2><ul>' + document.querySelector('[data-credits]').innerHTML + '</ul><button type="button" class="cta ghost" data-close-sheet>' + L().close + '</button></div>');
    else if (F.click(d, el)) { /* 流れごとの操作 */ }
    else if (d.go) go(d.go);
    refocus(app, sel);
  });
  app.addEventListener('change', function (e) { if (F.change) F.change(e.target); });
  app.addEventListener('input', function (e) { if (F.input) F.input(e.target); });
  side.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled || !F.sideClick) return;
    var sel = keyOf(b); F.sideClick(b.dataset, b); refocus(side, sel);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheetWrap.hidden) closeSheet(); else if (document.body.classList.contains('k-open')) closeKitchen();
  });

  // お店側の画面：スマホでは全画面で重ねて見せる
  var kBack = null;
  function openKitchen() { kBack = document.activeElement; document.body.classList.add('k-open'); kitchen.querySelector('[data-kitchen-close]').focus({ preventScroll: true }); }
  function closeKitchen() { document.body.classList.remove('k-open'); if (kBack && document.body.contains(kBack)) kBack.focus({ preventScroll: true }); }
  kitchen.querySelector('[data-kitchen-close]').addEventListener('click', closeKitchen);

  document.addEventListener('langchange', function () {
    toastEl.hidden = true;
    var consent = !!sheetBody.querySelector('.consent'); closeSheet(); render();
    if (consent) consentSheet();
  });
  // 写真クレジット用に、画面に出てくる写真を最初からページに置いておく（読み込みは遅延）
  var pre = document.createElement('div'); pre.hidden = true;
  pre.innerHTML = C.photos.map(function (n) { return '<img src="' + P + n + '.webp" loading="lazy" alt="">'; }).join('');
  document.body.appendChild(pre);

  // ── 埋め込みと自動再生（app.js と同じ）：?embed はアプリだけ、?auto は指の印つきで一巡して、また最初から ──
  var Q = new URLSearchParams(location.search);
  if (Q.has('embed')) document.body.classList.add('embed');
  reset();
  if (Q.has('auto') && !reduce.matches && window.LOAuto) window.LOAuto(app, F.auto(), restart);
  render();
})();
