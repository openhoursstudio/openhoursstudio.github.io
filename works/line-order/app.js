// デモ「LINEで注文」の共通エンジン。お店ごとの設定（メニュー・文言・流れ）は各ページの scenario ファイルが window.LO に入れる。
// 流れは4種類：later＝何度も頼んで最後にお会計（焼き鳥）／first＝先に払ってから作る（券売機の代わり）／
// pickup＝テイクアウトの事前注文と受け取り番号／course＝飲み放題（時間制・グラス交換制・最後にお会計）。
// 決済も通信もしない、ページの中だけで完結する見本。文言は日本語と英語、concept.js の langchange で描き直す。
(function () {
  'use strict';
  var C = window.LO;
  var root = document.documentElement;
  var app = document.querySelector('[data-app]');
  var screens = app.querySelector('[data-screens]');
  var sheetWrap = app.querySelector('[data-sheet]'), sheetBody = app.querySelector('[data-sheet-body]');
  var toastEl = app.querySelector('[data-toast]');
  var kitchen = document.querySelector('[data-kitchen]');
  var ticketsEl = document.querySelector('[data-tickets]'), kEmpty = document.querySelector('[data-k-empty]'), kTotal = document.querySelector('[data-k-total]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var P = '../../assets/photos/';
  var FLOW = C.flow;
  var PAY_FIRST = FLOW === 'first' || FLOW === 'pickup';
  var seat = (function () { var s = Number(new URLSearchParams(location.search).get('seat')); return s >= 1 && s <= C.seats ? s : C.seat; })();

  // ── 共通の文言（お店ごとの設定 C.t で上書き） ──
  var BASE = {
    ja: {
      restart: 'デモを最初から', credits: '写真クレジット', close: '閉じる', hello: 'いらっしゃいませ',
      guestsQ: '何名さまですか？', guestUnit: '名', start: '注文をはじめる',
      consentLead: 'このサービスが、次の情報へのアクセスを求めています。',
      consentProfile: 'メインプロフィール情報', consentProfileSub: '表示名とプロフィール画像', consentFriendSub: 'ご注文やお会計のお知らせが届きます',
      allow: '許可する', cancel: 'キャンセル', consentNote: '実際のLINEでは、この画面は初回だけ表示されます。',
      addFor: function (p) { return 'カートに入れる  ' + p; }, qty: '数量', taxin: '税込',
      cartBar: function (n, p) { return '注文を確認する（' + n + '点）' + p; },
      cartTitle: 'ご注文の確認', firstOrder: '最初のご注文に含まれます',
      note: 'お店へのご要望', subtotal: '合計', taxNote: function (t) { return '表示価格はすべて税込です（うち消費税 ' + t + '）'; },
      send: 'この内容で注文する', toPay: 'お支払いへ進む', backMenu: 'メニューに戻る', empty: 'カートは空です。',
      sentTitle: 'ご注文を受け付けました', orderNo: '注文番号',
      more: '追加で注文する', toBill: 'お会計へ進む', finish: '注文を終える', history: 'これまでのご注文',
      seeKitchen: 'お店側の画面を見る（デモ）',
      billTitle: 'お会計', payTitle: 'お支払い', split: '割り勘で表示', perPerson: function (n) { return n + '名で割ると、お一人さま'; },
      method: 'お支払い方法', mPay: 'PayPay', mCard: 'クレジットカード', mCardSub: 'Visa・Mastercard・JCB・AMEX', mWallet: 'Apple Pay・Google Pay',
      mTill: 'レジで支払う', mTillSub: '現金・交通系ICなど',
      payBtn: function (p) { return p + ' を支払う'; }, tillBtn: 'レジでのお会計にする', demoPay: 'デモのため、実際の支払いは発生しません。',
      paying: 'お支払いの処理中です…', paidTitle: 'お支払いが完了しました', thanks: 'ありがとうございました。またのお越しをお待ちしております。',
      receipt: '領収書をLINEでお送りしました。', tillTitle: 'レジでお会計をお願いします', tillLead: 'お帰りの際に、この画面をレジでお見せください。',
      coupon: '次回のご来店で使えるクーポン', couponSub: '公式アカウントのトーク画面に届いています',
      toastPaid: function (p) { return 'お支払いありがとうございました（' + p + '）。領収書をお送りします。'; },
      kStart: '作りはじめる', kServe: '提供済みにする', kDone: '提供済み',
      kPaid: function (m) { return '支払い済み · ' + m; }, kTill: 'レジでお会計予定', kGuests: function (n) { return n + '名'; },
      from: 'LINE', minAgo: 'たった今', free: '飲み放題',
      timer: function (m) { return '飲み放題 残り ' + m; }, skip: '時間を進める（デモ）',
      lo: 'ラストオーダーの時間です。お飲みものは、あと一回ご注文いただけます。', over: '飲み放題の時間が終わりました。',
      cupRule: function (n) { return '飲み放題は、お一人さま一杯ずつのご注文です（グラス交換制）。今回は' + n + '杯までです。'; },
      drinksClosed: '飲み放題は終了しました',
      openNow: function (c) { return '営業中 · ' + c + 'まで'; }, openAt: function (o) { return '本日 ' + o + 'から営業'; }, closedToday: '本日定休日',
      news: 'お知らせ', picks: '本日のおすすめ', rank: '人気ランキング', rankTag: function (n) { return '人気No.' + n; }, info: 'お店の情報',
      soldout: '本日分終了', pairQ: '一緒にいかがですか？', pairAdd: '追加', pairDone: '追加しました',
      member: 'LINE会員証', stampLeft: function (n) { return 'あと' + n + '個で特典'; }, stampGot: 'スタンプが1つたまりました',
      call: '店員を呼ぶ', callTitle: 'スタッフを呼びます', callLead: 'ご用件を選ぶと、スタッフの端末に届きます。',
      callSent: function (x) { return 'スタッフに伝えました：' + x + '。少々お待ちください。'; }, kCall: '呼び出し', kCallDone: '対応済み'
    },
    en: {
      restart: 'Restart the demo', credits: 'Photo credits', close: 'Close', hello: 'Welcome',
      guestsQ: 'How many of you?', guestUnit: '', start: 'Start ordering',
      consentLead: 'This service is asking for access to:',
      consentProfile: 'Your main profile', consentProfileSub: 'Display name and profile picture', consentFriendSub: 'Get order and bill updates in your chats',
      allow: 'Allow', cancel: 'Cancel', consentNote: 'In real LINE this screen only appears the first time.',
      addFor: function (p) { return 'Add to order  ' + p; }, qty: 'Quantity', taxin: 'incl. tax',
      cartBar: function (n, p) { return 'Review order (' + n + ') ' + p; },
      cartTitle: 'Your order', firstOrder: 'Added to your first order',
      note: 'Notes for the shop', subtotal: 'Total', taxNote: function (t) { return 'All prices include tax (consumption tax ' + t + ')'; },
      send: 'Send order', toPay: 'Go to payment', backMenu: 'Back to menu', empty: 'Your order is empty.',
      sentTitle: 'Order received', orderNo: 'Order no.',
      more: 'Order more', toBill: 'Go to the bill', finish: 'I’m done', history: 'Your orders so far',
      seeKitchen: 'See the shop’s screen (demo)',
      billTitle: 'Bill', payTitle: 'Payment', split: 'Split the bill', perPerson: function (n) { return 'Split ' + n + ' ways, each pays'; },
      method: 'Payment method', mPay: 'PayPay', mCard: 'Credit card', mCardSub: 'Visa, Mastercard, JCB, AMEX', mWallet: 'Apple Pay / Google Pay',
      mTill: 'Pay at the till', mTillSub: 'Cash, transit IC cards and more',
      payBtn: function (p) { return 'Pay ' + p; }, tillBtn: 'I’ll pay at the till', demoPay: 'This is a demo. No real payment is made.',
      paying: 'Processing your payment…', paidTitle: 'Payment complete', thanks: 'Thank you. We hope to see you again soon.',
      receipt: 'Your receipt has been sent in LINE.', tillTitle: 'Please pay at the till', tillLead: 'Show this screen at the till on your way out.',
      coupon: 'A coupon for your next visit', couponSub: 'Waiting in your chat with the shop',
      toastPaid: function (p) { return 'Thank you for your payment (' + p + '). Your receipt is on its way.'; },
      kStart: 'Start', kServe: 'Mark as served', kDone: 'Served',
      kPaid: function (m) { return 'Paid · ' + m; }, kTill: 'Will pay at the till', kGuests: function (n) { return n + (n > 1 ? ' guests' : ' guest'); },
      from: 'LINE', minAgo: 'just now', free: 'Free flow',
      timer: function (m) { return 'Free flow · ' + m + ' left'; }, skip: 'Skip ahead (demo)',
      lo: 'Last orders. You can order one more round of drinks.', over: 'Your free-flow time is over.',
      cupRule: function (n) { return 'Free-flow drinks are one per guest per round, a fresh glass for an empty one. Up to ' + n + ' this time.'; },
      drinksClosed: 'Free flow has ended',
      openNow: function (c) { return 'Open now · until ' + c; }, openAt: function (o) { return 'Opens today at ' + o; }, closedToday: 'Closed today',
      news: 'News', picks: 'Today’s picks', rank: 'Most ordered', rankTag: function (n) { return 'No.' + n; }, info: 'About the shop',
      soldout: 'Sold out today', pairQ: 'Goes well with', pairAdd: 'Add', pairDone: 'Added',
      member: 'LINE member card', stampLeft: function (n) { return n + ' more for a reward'; }, stampGot: 'You earned a stamp',
      call: 'Call staff', callTitle: 'Call a member of staff', callLead: 'Pick what you need and it goes straight to the staff’s device.',
      callSent: function (x) { return 'We’ve let the staff know: ' + x + '. Someone will be right with you.'; }, kCall: 'Call', kCallDone: 'Done'
    }
  };
  function L() { var l = lang(), t = {}, k; for (k in BASE[l]) t[k] = BASE[l][k]; for (k in C.t[l]) t[k] = C.t[l][k]; return t; }
  function lang() { return root.lang === 'en' ? 'en' : 'ja'; }

  var MENU = C.menu, byId = {};
  MENU.forEach(function (m) { byId[m.id] = m; });

  // ── 状態 ──
  var S;
  function reset() {
    S = { screen: 'welcome', guests: FLOW === 'first' || FLOW === 'pickup' ? 1 : 2, friend: true, cart: [], orders: [], note: '', split: false,
      method: 'paypay', paid: null, seq: C.seq, course: 0, slot: 1, end: 0, loSaid: false, overSaid: false, started: false, pending: null, calls: [] };
  }
  reset();

  function yen(n) { return '¥' + n.toLocaleString('ja-JP'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function name(m) { return m[lang()][0]; }
  function course() { return FLOW === 'course' ? C.courses[S.course] : null; }
  function free(m) { var c = course(); return !!(c && c.min && m.drink); }
  function optText(l) {
    var m = byId[l.id]; if (!m.opts) return '';
    return m.opts.map(function (g, i) { return g[lang()][1][l.o[i]]; }).filter(function (v, i) { return l.o[i] !== m.opts[i].def; }).join('・');
  }
  function unit(l) {
    var m = byId[l.id];
    if (free(m) && l.free !== false) return 0;
    return m.p + (m.opts ? m.opts.reduce(function (a, g, i) { return a + (g.add ? g.add[l.o[i]] : 0); }, 0) : 0);
  }
  function linePrice(l) { return unit(l) * l.q; }
  function cartCount() { return S.cart.reduce(function (a, l) { return a + l.q; }, 0); }
  function firstOrder() { return S.orders.length === 0; }
  // 最初の注文だけに付くもの：お通し、またはコース料金（人数分）
  function extras() {
    var out = [], t = C.t[lang()];
    if (!firstOrder()) return out;
    if (C.otoshi) out.push({ label: t.otoshi, sub: C.otoshi.p === 0 ? '' : yen(C.otoshi.p) + ' × ' + S.guests, total: C.otoshi.p * S.guests, kind: 'otoshi', img: C.otoshi.img });
    var c = course();
    if (c && c.p) out.push({ label: c[lang()][0], sub: yen(c.p) + ' × ' + S.guests, total: c.p * S.guests, kind: 'course', img: C.courseImg });
    return out;
  }
  function cartTotal() { return S.cart.reduce(function (a, l) { return a + linePrice(l); }, 0) + extras().reduce(function (a, e) { return a + e.total; }, 0); }
  function billTotal() { return S.orders.reduce(function (a, o) { return a + o.total; }, 0); }
  function tax(t) { return Math.floor(t * 10 / 110); }
  function img(name, cls, alt) { return '<img class="' + cls + '" src="' + P + name + '-s.webp" width="360" height="360" loading="lazy" alt="' + (alt || '') + '">'; }
  function thumb(m, cls) {
    if (!m.img) return '<span class="' + cls + ' ph" aria-hidden="true">' + esc(m.ja[0].charAt(0)) + '</span>';
    return '<img class="' + cls + '" src="' + P + m.img + '-s.webp" width="360" height="360" loading="lazy" alt="">';
  }
  function clock(d) { d = d || new Date(); d = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function slotTime(i) { return i === 0 ? null : clock(new Date(Date.now() + C.slots[i] * 60000)); }
  function slotLabel(i) { var t = L(); return i === 0 ? t.slotNow : t.slotIn(C.slots[i], slotTime(i)); }
  function left() { return Math.max(0, S.end - Date.now()); }
  function mmss(ms) { var s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s %= 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); }
  function rankOf(m) { return C.rank ? C.rank.indexOf(m.id) + 1 : 0; }
  // 営業時間は <body> の data 属性から（concept.js と同じ設定）
  function hours(t) {
    var b = document.body.dataset, now = new Date(new Date().toLocaleString('en-US', { timeZone: b.tz || 'Asia/Tokyo' }));
    var o = b.open.split(':').map(Number), c = b.close.split(':').map(Number), min = now.getHours() * 60 + now.getMinutes();
    var om = o[0] * 60 + o[1], cm = c[0] * 60 + c[1], close = b.close === '00:00' ? '24:00' : b.close;
    var yday = (now.getDay() + 6) % 7, closedDay = Number(b.closedDay);
    var open = cm > om ? (min >= om && min < cm && now.getDay() !== closedDay) : ((min >= om && now.getDay() !== closedDay) || (min < cm && yday !== closedDay));
    if (open) return { on: true, text: t.openNow(close) };
    return { on: false, text: now.getDay() === closedDay ? t.closedToday : t.openAt(b.open) };
  }
  function drinksOpen() { var c = course(); return !(c && c.min && S.end && left() === 0); }

  // 店員呼び出し（店内で食べるお店だけ）
  var callBtn = null;
  if (C.calls) {
    callBtn = document.createElement('button'); callBtn.type = 'button'; callBtn.className = 'mh-call'; callBtn.dataset.callOpen = '';
    callBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg><span></span>';
    app.querySelector('.mh').insertBefore(callBtn, app.querySelector('[data-restart]'));
  }

  // ── 画面 ──
  var VIEWS = {
    welcome: function (t) {
      var extra = '';
      if (C.guests) {
        var g = '';
        for (var i = 1; i <= 6; i++) g += '<button type="button" class="g" aria-pressed="' + (S.guests === i) + '" data-guests="' + i + '">' + i + (t.guestUnit ? '<small>' + t.guestUnit + '</small>' : '') + '</button>';
        extra += '<p class="w-q" id="g-label">' + t.guestsQ + '</p><div class="guests" role="group" aria-labelledby="g-label">' + g + '</div>';
      }
      if (FLOW === 'course') {
        extra += '<fieldset class="pms courses"><legend>' + t.courseQ + '</legend>' + C.courses.map(function (c, i) {
          return '<label class="pm"><input type="radio" name="course" value="' + i + '"' + (S.course === i ? ' checked' : '') + '><span><b>' + c[lang()][0] + '</b><small>' + c[lang()][1] + '</small></span><em>' + (c.p ? yen(c.p) + t.perHeadUnit : '') + '</em></label>';
        }).join('') + '</fieldset>';
      }
      if (FLOW === 'pickup') {
        extra += '<fieldset class="slots"><legend>' + t.slotQ + '</legend>' + C.slots.map(function (s, i) {
          return '<label><input type="radio" name="slot" value="' + i + '"' + (S.slot === i ? ' checked' : '') + '><span>' + slotLabel(i) + '</span></label>';
        }).join('') + '</fieldset>';
      }
      var h = hours(t);
      var queue = C.queue ? '<div class="w-queue"><span><small>' + t.queueLabel + '</small><b>' + t.queueNow(C.queue.groups) + '</b></span><span><small>' + t.queueWaitLabel + '</small><b>' + t.queueWait(C.queue.min) + '</b></span><p>' + t.queueNote + '</p></div>' : '';
      var news = t.newsBody ? '<div class="w-news"><b>' + t.news + '</b><ul>' + t.newsBody.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul></div>' : '';
      var picks = C.picks ? '<h3 class="w-h">' + t.picks + '</h3><div class="w-picks">' + C.picks.map(function (id) {
        var m = byId[id];
        return '<button type="button" class="pk" data-pick="' + id + '">' + thumb(m, 'pk-img') + '<b>' + esc(name(m)) + '</b><span>' + (free(m) ? t.free : yen(m.p)) + '</span></button>';
      }).join('') + '</div>' : '';
      var rank = C.rank ? '<h3 class="w-h">' + t.rank + '</h3><ol class="w-rank">' + C.rank.map(function (id, i) {
        var m = byId[id];
        return '<li><button type="button" data-pick="' + id + '"><span class="rk rk' + (i + 1) + '">' + (i + 1) + '</span>' + thumb(m, 'thumb sm') + '<span class="rk-t"><b>' + esc(name(m)) + '</b><small>' + esc(m[lang()][1]) + '</small></span><em>' + yen(m.p) + '</em></button></li>';
      }).join('') + '</ol>' : '';
      var card = C.stamps ? stampCard(t, C.stamps.have, false) : '';
      var info = t.infoRows ? '<h3 class="w-h">' + t.info + '</h3><dl class="w-info">' + t.infoRows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' : '';
      return '<div class="scr welcome"><div class="pad">' +
        '<figure class="w-hero"><img src="' + P + C.hero.src + '"' + (C.hero.srcset ? ' srcset="' + C.hero.srcset.replace(/(\S+\.webp)/g, P + '$1') + '" sizes="400px"' : '') + ' alt=""><figcaption>' +
        '<span class="w-open' + (h.on ? ' on' : '') + '"><i></i>' + h.text + '</span><span class="w-shop"><b>' + esc(t.shop) + '</b><small>' + t.kind + '</small></span></figcaption></figure>' +
        '<div class="w-in"><h2 class="w-title">' + t.welcome + '</h2><p class="w-scan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 12h8"/></svg>' + t.scanned(seat) + '</p>' +
        queue + extra + news + picks + rank + card + info +
        '<div class="w-notes">' + t.notes.map(function (n, i) { return '<p class="small' + (i === t.notes.length - 1 ? ' lo' : '') + '">' + n + '</p>'; }).join('') + '</div>' +
        '<button type="button" class="link small cr-link" data-credits-open>' + t.credits + '</button></div></div>' +
        '<div class="bar"><button type="button" class="cta" data-go="consent">' + t.start + '</button></div></div>';
    },
    menu: function (t) {
      var tabs = C.cats.map(function (c) { return '<a href="#c-' + c.id + '" data-cat="' + c.id + '">' + c[lang()] + '</a>'; }).join('');
      var body = C.cats.map(function (c) {
        return '<section class="cat" id="c-' + c.id + '"><h3>' + c[lang()] + '</h3><ul class="items">' + MENU.filter(function (m) { return m.cat === c.id; }).map(function (m) {
          var r = rankOf(m);
          var tag = (r ? '<i class="tag rank">' + t.rankTag(r) + '</i>' : '') + (m.tag ? '<i class="tag">' + m.tag[lang() === 'en' ? 1 : 0] + '</i>' : '');
          var off = (m.drink && !drinksOpen()) || m.soldout;
          var price = free(m) ? '<em class="freep">' + t.free + '</em>' : '<em>' + yen(m.p) + (m.from ? '〜' : '') + '</em>';
          return '<li><button type="button" class="item' + (m.soldout ? ' sold' : '') + '" data-item="' + m.id + '"' + (off ? ' disabled' : '') + '>' + thumb(m, 'thumb') +
            '<span class="i-text"><b>' + esc(name(m)) + tag + '</b>' + (m[lang()][1] ? '<span>' + esc(m[lang()][1]) + '</span>' : '') + (m.soldout ? '<em class="so">' + t.soldout + '</em>' : off ? '<em>' + t.drinksClosed + '</em>' : price) + '</span>' +
            '<span class="plus" aria-hidden="true">+</span></button></li>';
        }).join('') + '</ul></section>';
      }).join('');
      var n = cartCount(), c = course();
      var timer = c && c.min ? '<div class="timer" role="timer"><span data-timer>' + t.timer(mmss(left())) + '</span><button type="button" data-skip>' + t.skip + '</button></div>' : '';
      var pick = FLOW === 'pickup' ? '<div class="timer pick"><span>' + t.pickBanner(slotLabel(S.slot)) + '</span></div>' : '';
      return '<div class="scr menu"><nav class="cats" aria-label="Menu">' + tabs + '</nav>' + timer + pick + '<div class="menu-body" data-menu-body>' + body + '<p class="small allergy">' + t.allergy + '</p></div>' +
        (n ? '<div class="bar"><button type="button" class="cta" data-go="cart">' + t.cartBar(n, yen(cartTotal())) + '</button></div>' :
          (S.orders.length ? '<div class="bar"><button type="button" class="cta ghost" data-go="sent">' + t.history + '</button></div>' : '')) + '</div>';
    },
    cart: function (t) {
      var rows = S.cart.map(function (l, i) {
        var m = byId[l.id], o = optText(l);
        return '<li class="line">' + thumb(m, 'thumb sm') + '<span class="l-name"><b>' + esc(name(m)) + '</b>' + (o ? '<small>' + o + '</small>' : '') + '<em>' + (free(m) ? t.free : yen(linePrice(l))) + '</em></span>' +
          '<span class="step" role="group" aria-label="' + t.qty + '"><button type="button" data-dec="' + i + '" aria-label="−">' + (l.q === 1 ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>' : '−') + '</button><output>' + l.q + '</output><button type="button" data-inc="' + i + '" aria-label="+">+</button></span></li>';
      }).join('');
      rows += extras().map(function (e) { return '<li class="line otoshi">' + (e.img ? img(e.img, 'thumb sm') : '<span class="thumb sm ph" aria-hidden="true">' + e.label.charAt(0) + '</span>') + '<span class="l-name"><b>' + e.label + '</b><small>' + t.firstOrder + '</small><em>' + yen(e.total) + '</em></span><span class="step"><output>' + e.sub + '</output></span></li>'; }).join('');
      var tot = cartTotal();
      return '<div class="scr cart"><div class="pad"><button type="button" class="back" data-go="menu">← ' + t.backMenu + '</button><h2>' + t.cartTitle + '</h2>' +
        (S.cart.length ? '<ul class="lines">' + rows + '</ul>' : '<p class="small">' + t.empty + '</p>') +
        (FLOW === 'pickup' ? '<p class="w-scan pick-at">' + t.pickBanner(slotLabel(S.slot)) + '</p>' : '') +
        '<label class="note"><span>' + t.note + '</span><textarea rows="2" data-note placeholder="' + esc(t.notePh) + '">' + esc(S.note) + '</textarea></label>' +
        '<div class="total"><span>' + t.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + t.taxNote(yen(tax(tot))) + '</p><p class="small">' + t.payWhen + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" ' + (PAY_FIRST ? 'data-go="bill"' : 'data-send') + (S.cart.length ? '' : ' disabled') + '>' + (PAY_FIRST ? t.toPay : t.send) + '</button></div></div>';
    },
    sent: function (t) {
      var last = S.orders[S.orders.length - 1];
      var steps = t.st.map(function (s, i) { return '<li class="' + (i <= last.stage ? 'on' : '') + '"><i></i><span>' + s + '</span>' + (last.times[i] ? '<small>' + last.times[i] + '</small>' : '') + '</li>'; }).join('');
      var hist = S.orders.slice().reverse().map(function (o) {
        return '<li><span class="h-no">' + o.no + ' · ' + o.time + (o.paid ? ' · ' + t.kPaid(methodName(o.paid)) : '') + '</span><span class="h-items">' + o.lines.map(function (l) { var x = optText(l); return esc(name(byId[l.id])) + (x ? '（' + x + '）' : '') + ' × ' + l.q; }).join('、') + '</span><b>' + yen(o.total) + '</b></li>';
      }).join('');
      var head = FLOW === 'pickup' ? '<p class="pick-no"><small>' + t.pickNo + '</small><b>' + last.no + '</b><span>' + t.pickAt(last.pick) + '</span></p>'
        : '<p class="no">' + t.orderNo + ' <b>' + last.no + '</b></p>';
      var bar = PAY_FIRST ? '<div class="bar two"><button type="button" class="cta ghost" data-go="menu">' + t.more + '</button><button type="button" class="cta" data-finish>' + t.finish + '</button></div>'
        : '<div class="bar two"><button type="button" class="cta ghost" data-go="menu">' + t.more + '</button><button type="button" class="cta" data-go="bill">' + t.toBill + '</button></div>';
      return '<div class="scr sent"><div class="pad"><div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div>' +
        '<h2>' + t.sentTitle + '</h2>' + head + (C.queue ? '<p class="ahead' + (last.stage ? ' ready' : '') + '">' + (last.stage ? t.seatReady : t.ahead(2)) + '</p>' : '') + '<p class="small center">' + t.eta + '</p>' +
        '<ol class="track" aria-live="polite">' + steps + '</ol>' +
        '<h3 class="h-title">' + t.history + '</h3><ul class="hist">' + hist + '</ul>' +
        '<button type="button" class="link see-k" data-kitchen-open>' + t.seeKitchen + ' →</button></div>' + bar + '</div>';
    },
    bill: function (t) {
      // 先払いならカートの中身、後払いならこれまでの注文すべて
      var rows = [], tot;
      function row(label, price) { rows.push('<li><span>' + label + '</span><b>' + price + '</b></li>'); }
      function lineRow(l) { var x = optText(l), m = byId[l.id]; row(esc(name(m)) + (x ? '（' + x + '）' : '') + ' × ' + l.q, free(m) ? t.free : yen(linePrice(l))); }
      if (PAY_FIRST) { extras().forEach(function (e) { row(e.label, yen(e.total)); }); S.cart.forEach(lineRow); tot = cartTotal(); }
      else { S.orders.forEach(function (o) { o.extras.forEach(function (e) { row(e.label + ' ' + e.sub, yen(e.total)); }); o.lines.forEach(lineRow); }); tot = billTotal(); }
      var per = Math.ceil(tot / S.guests / 10) * 10;
      var methods = [['paypay', t.mPay, ''], ['card', t.mCard, t.mCardSub], ['wallet', t.mWallet, ''], ['till', t.mTill, t.mTillSub]].map(function (m) {
        return '<label class="pm"><input type="radio" name="pm" value="' + m[0] + '"' + (S.method === m[0] ? ' checked' : '') + '><span class="pm-ic pm-' + m[0] + '" aria-hidden="true"></span><span><b>' + m[1] + '</b>' + (m[2] ? '<small>' + m[2] + '</small>' : '') + '</span></label>';
      }).join('');
      return '<div class="scr bill"><div class="pad"><button type="button" class="back" data-go="' + (PAY_FIRST ? 'cart' : 'sent') + '">← ' + (PAY_FIRST ? t.cartTitle : t.history) + '</button><h2>' + (PAY_FIRST ? t.payTitle : t.billTitle) + '</h2>' +
        '<ul class="receipt">' + rows.join('') + '</ul><div class="total"><span>' + t.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + t.taxNote(yen(tax(tot))) + '</p>' +
        (S.guests > 1 ? '<label class="switch"><input type="checkbox" data-split' + (S.split ? ' checked' : '') + '><span>' + t.split + '</span></label>' + (S.split ? '<p class="per">' + t.perPerson(S.guests) + ' <b>' + yen(per) + '</b></p>' : '') : '') +
        '<fieldset class="pms"><legend>' + t.method + '</legend>' + methods + '</fieldset><p class="small">' + t.demoPay + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" data-pay>' + (S.method === 'till' ? t.tillBtn : t.payBtn(yen(tot))) + '</button></div></div>';
    },
    paying: function (t) {
      return '<div class="scr paying"><div class="spin" aria-hidden="true"></div><p role="status">' + t.paying + '</p></div>';
    },
    done: function (t) {
      var till = S.paid === 'till', head;
      if (PAY_FIRST) head = '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div><h2>' + t.doneTitle + '</h2><p class="paid-sum">' + yen(billTotal()) + '</p>';
      else if (till) head = '<h2>' + t.tillTitle + '</h2><p class="center">' + t.tillLead + '</p><div class="till-code"><b>' + t.sub(seat) + '</b><span>' + yen(billTotal()) + '</span><i aria-hidden="true"></i></div>';
      else head = '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div><h2>' + t.paidTitle + '</h2><p class="paid-sum">' + yen(billTotal()) + ' · ' + methodName(S.paid) + '</p><p class="center">' + t.receipt + '</p>';
      return '<div class="scr done"><div class="pad">' + head + '<p class="center">' + t.thanks + '</p>' +
        (C.stamps ? stampCard(t, C.stamps.have + 1, true) : '') +
        (S.friend ? '<div class="coupon"><small>' + t.coupon + '</small><b>' + t.couponBody + '</b><span>' + t.couponSub + '</span></div>' : '') +
        '<button type="button" class="link see-k" data-kitchen-open>' + t.seeKitchen + ' →</button></div>' +
        '<div class="bar"><button type="button" class="cta ghost" data-restart-btn>' + t.restart + '</button></div></div>';
    }
  };
  function stampCard(t, have, got) {
    var dots = ''; for (var i = 1; i <= C.stamps.need; i++) dots += '<li class="' + (i <= have ? 'on' : '') + (got && i === have ? ' new' : '') + '"></li>';
    return '<div class="w-card"><div class="wc-top"><small>' + t.member + '</small><b>' + t.stampName + '</b></div><ol class="stamps" aria-label="' + have + ' / ' + C.stamps.need + '">' + dots + '</ol>' +
      '<p>' + (got ? t.stampGot + ' · ' : '') + t.stampLeft(C.stamps.need - have) + '（' + t.stampReward + '）</p></div>';
  }
  function methodName(m) { var t = L(); return { paypay: t.mPay, card: t.mCard, wallet: t.mWallet, till: t.mTill }[m] || ''; }

  function render(focus) {
    var t = L();
    app.querySelector('[data-mh-title]').textContent = t.title;
    app.querySelector('[data-mh-sub]').textContent = t.sub(seat);
    app.querySelector('[data-mh-restart]').textContent = t.restart;
    if (callBtn) { callBtn.hidden = S.screen === 'welcome'; callBtn.querySelector('span').textContent = t.call; callBtn.title = t.call; }
    var y = S.screen === 'menu' ? (screens.querySelector('[data-menu-body]') || {}).scrollTop : 0;
    screens.innerHTML = VIEWS[S.screen](t);
    var mb = screens.querySelector('[data-menu-body]');
    if (mb && y) mb.scrollTop = y;
    if (focus) { var h = screens.querySelector('h2, .cats a'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    if (S.screen === 'menu') spy();
    renderKitchen();
  }
  function go(s) { S.screen = s; closeSheet(); render(true); var sc = screens.querySelector('.pad, .menu-body'); if (sc) sc.scrollTop = 0; }

  // ── カテゴリーの見出しに合わせてタブを光らせる ──
  function spy() {
    var mb = screens.querySelector('[data-menu-body]'), tabs = screens.querySelectorAll('.cats a');
    function upd() {
      var cur = C.cats[0].id, top = mb.getBoundingClientRect().top;
      C.cats.forEach(function (c) { var s = document.getElementById('c-' + c.id); if (s && s.getBoundingClientRect().top - top < 60) cur = c.id; });
      tabs.forEach(function (a) { var on = a.dataset.cat === cur; a.classList.toggle('on', on); if (on && a.parentNode.scrollWidth > a.parentNode.clientWidth) { var p = a.parentNode; p.scrollLeft = a.offsetLeft - (p.clientWidth - a.offsetWidth) / 2; } });
    }
    mb.addEventListener('scroll', upd, { passive: true }); upd();
  }

  // ── 飲み放題の残り時間 ──
  setInterval(function () {
    var c = course(); if (!c || !c.min || !S.end) return;
    var el = screens.querySelector('[data-timer]'), ms = left(), t = L();
    if (el) el.textContent = t.timer(mmss(ms));
    if (!S.loSaid && ms <= 15 * 60000) { S.loSaid = true; toast(t.lo); }
    if (!S.overSaid && ms === 0) { S.overSaid = true; toast(t.over); if (S.screen === 'menu') render(); }
  }, 1000);

  // ── ボトムシート ──
  var lastFocus = null;
  function openSheet(html) {
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
    openSheet('<div class="consent"><span class="mh-icon big" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><h2 id="sheet-title">' + t.title + '</h2><p>' + t.consentLead + '</p>' +
      '<ul class="perm"><li><b>' + t.consentProfile + '</b><small>' + t.consentProfileSub + '</small></li></ul>' +
      '<label class="switch fr"><input type="checkbox" data-friend' + (S.friend ? ' checked' : '') + '><span><b>' + t.consentFriend + '</b><small>' + t.consentFriendSub + '</small></span></label>' +
      '<div class="two"><button type="button" class="cta ghost" data-consent="0">' + t.cancel + '</button><button type="button" class="cta" data-consent="1">' + t.allow + '</button></div><p class="small center">' + t.consentNote + '</p></div>');
  }
  function callSheet() {
    var t = L();
    openSheet('<div class="call-sheet"><h2 id="sheet-title">' + t.callTitle + '</h2><p class="small">' + t.callLead + '</p><div class="calls">' +
      t.calls.map(function (c, i) { return '<button type="button" data-call="' + i + '">' + c + '</button>'; }).join('') + '</div><button type="button" class="cta ghost" data-close-sheet>' + t.cancel + '</button></div>');
  }
  function scrollToItem(id) {
    var b = screens.querySelector('[data-item="' + id + '"]'), mb = screens.querySelector('[data-menu-body]');
    if (b && mb) mb.scrollTop = b.getBoundingClientRect().top - mb.getBoundingClientRect().top + mb.scrollTop - 60;
  }
  var draft = null;
  function itemSheet(id) {
    var m = byId[id], t = L();
    draft = { id: id, q: 1, o: m.opts ? m.opts.map(function (g) { return g.def; }) : [] };
    var opts = (m.opts || []).map(function (g, gi) {
      var o = g[lang()];
      return '<fieldset class="opts"><legend>' + o[0] + '</legend>' + o[1].map(function (v, i) {
        var add = g.add && g.add[i] ? ' +' + yen(g.add[i]) : '';
        return '<label><input type="radio" name="opt' + gi + '" data-g="' + gi + '" value="' + i + '"' + (i === g.def ? ' checked' : '') + '><span>' + v + add + '</span></label>';
      }).join('') + '</fieldset>';
    }).join('');
    openSheet((m.img ? '<img class="s-img" src="' + P + m.img + '-s.webp" width="360" height="360" alt="">' : '') +
      '<div class="s-body"><h2 id="sheet-title">' + esc(name(m)) + '</h2>' + (m[lang()][1] ? '<p>' + esc(m[lang()][1]) + '</p>' : '') +
      '<p class="s-price">' + (free(m) ? t.free : yen(m.p) + ' <small>' + t.taxin + '</small>') + '</p>' + opts +
      '<div class="s-qty"><span>' + t.qty + '</span><span class="step"><button type="button" data-dq="-1" aria-label="−">−</button><output data-q>1</output><button type="button" data-dq="1" aria-label="+">+</button></span></div>' +
      '<p class="small cup" data-cup hidden></p>' +
      (m.pair ? '<div class="pair"><p>' + t.pairQ + '</p><div class="pair-row">' + m.pair.map(function (id) {
        var x = byId[id];
        return '<button type="button" data-pair="' + id + '">' + thumb(x, 'thumb sm') + '<span><b>' + esc(name(x)) + '</b><small>' + (free(x) ? t.free : '+' + yen(x.p)) + '</small></span><i>' + t.pairAdd + '</i></button>';
      }).join('') + '</div></div>' : '') +
      '<button type="button" class="cta" data-add>' + t.addFor(free(m) ? t.free : yen(m.p)) + '</button></div>');
    updDraft();
  }
  // 飲み放題はグラス交換制：一回の注文で、お飲みものは人数分まで
  function cupRoom() { return S.guests - S.cart.filter(function (l) { return free(byId[l.id]); }).reduce(function (a, l) { return a + l.q; }, 0); }
  function updDraft() {
    var m = byId[draft.id], t = L(), cup = sheetBody.querySelector('[data-cup]'), add = sheetBody.querySelector('[data-add]');
    if (free(m)) {
      var room = cupRoom();
      draft.q = Math.max(1, Math.min(draft.q, Math.max(room, 1)));
      cup.hidden = false; cup.textContent = t.cupRule(Math.max(room, 0));
      add.disabled = room <= 0;
    }
    sheetBody.querySelector('[data-q]').textContent = draft.q;
    add.textContent = t.addFor(free(m) ? t.free : yen(unit(draft) * draft.q));
  }
  function addLine(l) {
    var key = l.o.join(',');
    var same = S.cart.filter(function (c) { return c.id === l.id && c.o.join(',') === key; })[0];
    if (same) same.q += l.q; else S.cart.push({ id: l.id, q: l.q, o: l.o.slice() });
  }

  // ── 通知（LINEのトークに届くお知らせのイメージ） ──
  var toastTimer;
  function toast(msg) {
    var t = L();
    toastEl.innerHTML = '<span class="mh-icon" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><span><b>' + esc(t.shop) + ' <small>' + t.from + ' · ' + t.minAgo + '</small></b>' + esc(msg) + '</span>';
    toastEl.hidden = false; toastEl.classList.remove('in'); void toastEl.offsetWidth; toastEl.classList.add('in');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('in'); setTimeout(function () { toastEl.hidden = true; }, 300); }, 4200);
  }

  // ── 注文と厨房 ──
  function sendOrder(paid) {
    S.seq += 1;
    var no = C.prefix + String(S.seq).padStart(C.prefix ? 2 : 4, '0');
    var o = { no: no, time: clock(), lines: S.cart, note: S.note, extras: extras(), total: cartTotal(), stage: 0, times: [clock()], timers: [], paid: paid || null,
      pick: FLOW === 'pickup' ? (S.slot === 0 ? null : slotTime(S.slot)) : null };
    S.orders.push(o); S.cart = []; S.note = '';
    go('sent'); toast(L().toastSent(o.no));
    // お店が操作しなくても、デモは自動で進む
    o.timers.push(setTimeout(function () { advance(o, 1); }, 7000));
    o.timers.push(setTimeout(function () { advance(o, 2); }, 16000));
  }
  function advance(o, stage) {
    if (S.orders.indexOf(o) < 0 || o.stage >= stage) return;
    o.stage = stage; o.times[stage] = clock();
    if (stage === 2) o.timers.forEach(clearTimeout);
    if (S.screen === 'sent' && o === S.orders[S.orders.length - 1]) render(); else renderKitchen();
    toast(stage === 1 ? L().toastCooking : L().toastServed);
  }
  function renderKitchen() {
    var t = L();
    kEmpty.hidden = S.orders.length > 0 || S.calls.length > 0;
    kTotal.textContent = yen(billTotal());
    var calls = S.calls.map(function (c, i) { return c.done ? '' : '<li class="ticket call"><div class="t-top"><b>' + t.kSeat(seat) + '</b><span>' + t.kCall + ' · ' + c.time + '</span></div><p class="k-call">' + t.calls[c.i] + '</p><div class="t-foot"><span></span><button type="button" class="k-btn" data-kc="' + i + '">' + t.kCallDone + '</button></div></li>'; }).join('');
    ticketsEl.innerHTML = calls + S.orders.slice().reverse().map(function (o) {
      var i = S.orders.indexOf(o);
      var items = o.extras.map(function (e) { return '<li><b>' + S.guests + '</b> ' + (e.kind === 'otoshi' ? t.kOtoshi : course()[lang()][0]) + '</li>'; }).join('') + o.lines.map(function (l) { var x = optText(l); return '<li><b>' + l.q + '</b> ' + esc(name(byId[l.id])) + (x ? ' <small>' + x + '</small>' : '') + '</li>'; }).join('');
      var act = o.stage === 0 ? '<button type="button" class="k-btn" data-k="' + i + '" data-to="1">' + t.kStart + '</button>' : o.stage === 1 ? '<button type="button" class="k-btn hot" data-k="' + i + '" data-to="2">' + t.kServe + '</button>' : '<span class="k-done">✓ ' + t.kDone + '</span>';
      var meta = [o.no, o.time]; if (C.guests) meta.push(t.kGuests(S.guests)); if (o.pick !== null && FLOW === 'pickup') meta.push(t.kPick(o.pick));
      return '<li class="ticket st' + o.stage + '"><div class="t-top"><b>' + t.kSeat(seat) + '</b><span>' + meta.join(' · ') + '</span></div>' + (o.paid ? '<p class="t-paid">' + (o.paid === 'till' ? t.kTill : t.kPaid(methodName(o.paid))) + '</p>' : '') + '<ul>' + items + '</ul>' + (o.note ? '<p class="t-note">' + esc(o.note) + '</p>' : '') + '<div class="t-foot"><span>' + yen(o.total) + '</span>' + act + '</div></li>';
    }).join('') + (S.paid && !PAY_FIRST ? '<li class="ticket paid"><div class="t-top"><b>' + t.kSeat(seat) + '</b><span>' + (S.paid === 'till' ? t.kTill : t.kPaid(methodName(S.paid))) + '</span></div><div class="t-foot"><span>' + yen(billTotal()) + '</span></div></li>' : '');
  }

  // ── 操作 ──
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a, [data-close-sheet]'); if (!el || el.disabled) return;
    var d = el.dataset;
    if (d.guests) { S.guests = Number(d.guests); render(); screens.querySelector('[data-guests="' + d.guests + '"]').focus({ preventScroll: true }); }
    else if (d.go === 'consent') consentSheet();
    else if (d.consent) {
      if (d.consent === '0') { S.pending = null; closeSheet(); return; }
      var f = sheetBody.querySelector('[data-friend]'); S.friend = !!(f && f.checked); S.started = true;
      if (course() && course().min && !S.end) S.end = Date.now() + course().min * 60000;
      go('menu');
      if (S.pending) { var pid = S.pending; S.pending = null; scrollToItem(pid); itemSheet(pid); }
    }
    else if (d.pick) { if (S.started) { go('menu'); scrollToItem(d.pick); itemSheet(d.pick); } else { S.pending = d.pick; consentSheet(); } }
    else if (d.pair) { var px = byId[d.pair]; addLine({ id: d.pair, q: 1, o: px.opts ? px.opts.map(function (g) { return g.def; }) : [] }); el.disabled = true; el.classList.add('done'); el.querySelector('i').textContent = '✓ ' + L().pairDone; }
    else if (d.callOpen !== undefined) callSheet();
    else if (d.call) { S.calls.push({ i: Number(d.call), time: clock() }); closeSheet(); toast(L().callSent(L().calls[Number(d.call)])); renderKitchen(); }
    else if (d.go) go(d.go);
    else if (d.item) itemSheet(d.item);
    else if (d.dq) { draft.q = Math.max(1, Math.min(20, draft.q + Number(d.dq))); updDraft(); }
    else if (d.add !== undefined) { addLine(draft); closeSheet(); render(); }
    else if (d.inc) { var li = S.cart[d.inc]; if (!free(byId[li.id]) || cupRoom() > 0) li.q += 1; else toast(L().cupRule(0)); render(); }
    else if (d.dec) { var l = S.cart[d.dec]; l.q -= 1; if (!l.q) S.cart.splice(Number(d.dec), 1); render(); }
    else if (d.send !== undefined) sendOrder();
    else if (d.pay !== undefined) pay();
    else if (d.finish !== undefined) { S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); go('done'); }
    else if (d.skip !== undefined) { S.end -= 30 * 60000; if (S.end < Date.now()) S.end = Date.now(); var tm = screens.querySelector('[data-timer]'); if (tm) tm.textContent = L().timer(mmss(left())); }
    else if (d.restart !== undefined || d.restartBtn !== undefined) restart();
    else if (d.closeSheet !== undefined) closeSheet();
    else if (d.kitchenOpen !== undefined) openKitchen();
    else if (d.creditsOpen !== undefined) openSheet('<div class="cr-sheet"><h2 id="sheet-title">' + L().credits + '</h2><ul>' + document.querySelector('[data-credits]').innerHTML + '</ul><button type="button" class="cta ghost" data-close-sheet>' + L().close + '</button></div>');
    else if (el.matches('.cats a')) { e.preventDefault(); var s = document.getElementById(el.getAttribute('href').slice(1)), mb = screens.querySelector('[data-menu-body]'); mb.scrollTo({ top: s.offsetTop - mb.offsetTop, behavior: reduce.matches ? 'auto' : 'smooth' }); }
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset.g) { draft.o[Number(el.dataset.g)] = Number(el.value); updDraft(); }
    else if (el.name === 'pm') { S.method = el.value; render(); screens.querySelector('input[value="' + el.value + '"]').focus({ preventScroll: true }); }
    else if (el.name === 'course') { S.course = Number(el.value); }
    else if (el.name === 'slot') { S.slot = Number(el.value); }
    else if (el.matches('[data-split]')) { S.split = el.checked; render(); screens.querySelector('[data-split]').focus({ preventScroll: true }); }
  });
  app.addEventListener('input', function (e) { if (e.target.matches('[data-note]')) S.note = e.target.value.slice(0, 120); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheetWrap.hidden) closeSheet(); else if (document.body.classList.contains('k-open')) closeKitchen();
  });
  function pay() {
    var m = S.method;
    if (PAY_FIRST) {
      if (m === 'till') { sendOrder('till'); return; }
      go('paying');
      setTimeout(function () { sendOrder(m); toast(L().toastPaid(yen(S.orders[S.orders.length - 1].total))); }, reduce.matches ? 400 : 1600);
      return;
    }
    if (m === 'till') { S.paid = 'till'; go('done'); return; }
    go('paying');
    setTimeout(function () { S.paid = m; S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); go('done'); toast(L().toastPaid(yen(billTotal()))); }, reduce.matches ? 400 : 1600);
  }
  function restart() { S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); reset(); go('welcome'); }

  // 厨房：スマホでは全画面で重ねて見せる
  ticketsEl.addEventListener('click', function (e) {
    var kc = e.target.closest('[data-kc]');
    if (kc) { S.calls[Number(kc.dataset.kc)].done = true; renderKitchen(); return; }
    var b = e.target.closest('[data-k]'); if (!b) return;
    advance(S.orders[Number(b.dataset.k)], Number(b.dataset.to));
    var nb = ticketsEl.querySelector('[data-k="' + b.dataset.k + '"]'); if (nb) nb.focus({ preventScroll: true });
  });
  var kBack = null;
  function openKitchen() { kBack = document.activeElement; document.body.classList.add('k-open'); kitchen.querySelector('[data-kitchen-close]').focus({ preventScroll: true }); }
  function closeKitchen() { document.body.classList.remove('k-open'); if (kBack && document.body.contains(kBack)) kBack.focus({ preventScroll: true }); }
  kitchen.querySelector('[data-kitchen-close]').addEventListener('click', closeKitchen);

  document.addEventListener('langchange', function () { toastEl.hidden = true; var open = !sheetWrap.hidden; closeSheet(); render(); if (open && S.screen === 'welcome') consentSheet(); });
  // 写真クレジット用に、メニューの写真も最初からページに置いておく（読み込みは遅延）
  var pre = document.createElement('div'); pre.hidden = true;
  pre.innerHTML = MENU.map(function (m) { return m.img; }).concat([C.otoshi && C.otoshi.img, C.courseImg]).filter(Boolean).map(function (n) { return '<img src="' + P + n + '-s.webp" loading="lazy" alt="">'; }).join('');
  document.body.appendChild(pre);
  // ── 埋め込みと自動再生：制作事例のページでは、触らなくても注文の流れがひとりでに進む ──
  // ?embed … アプリだけを表示。?auto … 指の印つきで一巡して、また最初から。画面に触れたら自動は止まり、そのまま操作できる。
  var Q = new URLSearchParams(location.search);
  if (Q.has('embed')) document.body.classList.add('embed');
  if (Q.has('auto') && !reduce.matches && window.LOAuto) {
    var A = (C.rank || []).filter(function (id) { return !byId[id].soldout; });
    var steps = [{ w: 1600 }, { s: '.welcome .pad', f: .45, w: 2200 }, { s: '.welcome .pad', f: 0, w: 900 }];
    if (C.guests) steps.push({ t: '[data-guests="2"]', w: 700 });
    if (FLOW === 'pickup') steps.push({ t: 'input[name="slot"][value="1"]', w: 800 });
    steps.push({ t: '[data-go="consent"]', w: 1300 }, { t: '[data-consent="1"]', w: 1600 });
    A.slice(0, 2).forEach(function (id) { steps.push({ t: '[data-item="' + id + '"]', w: 1500 }, { t: '[data-add]', w: 1000 }); });
    steps.push({ t: '[data-go="cart"]', w: 2000 });
    if (PAY_FIRST) steps.push({ t: '[data-go="bill"]', w: 1800 }, { t: '[data-pay]', w: 6500 }, { t: '[data-finish]', w: 3800 });
    else steps.push({ t: '[data-send]', w: 6500 }, { t: '[data-go="bill"]', w: 2000 }, { t: '[data-pay]', w: 5200 });
    steps.push({ s: '.done .pad', f: 1, w: 2600 }, { r: 1, w: 600 });
    window.LOAuto(app, steps, restart);
  }
  render();
})();
