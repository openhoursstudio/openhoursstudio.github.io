// デモ「LINEでテーブルオーダー」：席のQR → LINEの許可 → メニュー → 注文 → 厨房の画面 → お会計。
// 決済も通信もしない、ページの中だけで完結する見本。文言は STR（日本語・英語）にまとめ、concept.js の langchange で描き直す。
(function () {
  'use strict';
  var root = document.documentElement;
  var app = document.querySelector('[data-app]');
  var screens = app.querySelector('[data-screens]');
  var sheetWrap = app.querySelector('[data-sheet]'), sheetBody = app.querySelector('[data-sheet-body]');
  var toastEl = app.querySelector('[data-toast]');
  var kitchen = document.querySelector('[data-kitchen]');
  var ticketsEl = document.querySelector('[data-tickets]'), kEmpty = document.querySelector('[data-k-empty]'), kTotal = document.querySelector('[data-k-total]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var P = '../../assets/photos/';
  var seat = (function () { var s = Number(new URLSearchParams(location.search).get('seat')); return s >= 1 && s <= 11 ? s : 7; })();

  // ── 文言 ──
  var STR = {
    ja: {
      title: '鳥と炭 モバイルオーダー', sub: function () { return 'カウンター ' + seat + '番'; }, restart: 'デモを最初から', credits: '写真クレジット', close: '閉じる',
      hello: 'いらっしゃいませ', welcome: '鳥と炭へ、ようこそ。', scanned: function () { return 'カウンター ' + seat + '番 のQRコードを読み取りました。'; },
      guests: '何名さまですか？', guestUnit: '名', otoshiNote: 'お一人さまにお通し（キャベツと鶏みそ・¥330）をお出しします。',
      start: '注文をはじめる', lo: 'ラストオーダー 23:30',
      consentTitle: '鳥と炭 モバイルオーダー', consentLead: 'このサービスが、次の情報へのアクセスを求めています。',
      consentProfile: 'メインプロフィール情報', consentProfileSub: '表示名とプロフィール画像', consentFriend: '鳥と炭の公式アカウントを友だち追加', consentFriendSub: 'ご注文やお会計のお知らせが届きます',
      allow: '許可する', cancel: 'キャンセル', consentNote: '実際のLINEでは、この画面は初回だけ表示されます。',
      cats: { picks: 'おすすめ', shio: '塩の串', tare: 'タレの串', ippin: '一品・〆', drink: 'ドリンク' },
      add: '追加', addFor: function (p) { return 'カートに入れる  ' + p; }, qty: '数量', taxin: '税込',
      cartBar: function (n, p) { return '注文を確認する（' + n + '点）' + p; },
      cartTitle: 'ご注文の確認', otoshi: 'お通し', perHead: function (n) { return '¥330 × ' + n + '名'; }, otoshiOnce: '最初のご注文に含まれます',
      note: 'お店へのご要望', notePh: '例：ねぎ抜きで、取り皿を二枚', subtotal: '合計', taxNote: function (t) { return '表示価格はすべて税込です（うち消費税 ' + t + '）'; },
      send: 'この内容で注文する', backMenu: 'メニューに戻る', remove: '削除', empty: 'カートは空です。',
      payLater: 'お会計はお帰りの際に、このアプリかレジでどうぞ。',
      sentTitle: 'ご注文を受け付けました', orderNo: '注文番号', eta: '焼き上がりまで、およそ12分です。',
      st: ['受付済み', '焼いています', 'お席へお持ちしました'], more: '追加で注文する', toBill: 'お会計へ進む', history: 'これまでのご注文',
      seeKitchen: 'お店側の画面を見る（デモ）',
      toastSent: function (no) { return 'ご注文を受け付けました（' + no + '）。焼き上がりまで少々お待ちください。'; },
      toastCooking: '焼きはじめました。もうしばらくお待ちください。', toastServed: 'お料理をお席へお持ちしました。ごゆっくりどうぞ。',
      billTitle: 'お会計', split: '割り勘で表示', perPerson: function (n) { return n + '名で割ると、お一人さま'; },
      method: 'お支払い方法', mPay: 'PayPay', mCard: 'クレジットカード', mCardSub: 'Visa・Mastercard・JCB・AMEX', mWallet: 'Apple Pay・Google Pay',
      mTill: 'レジで支払う', mTillSub: '現金・交通系ICなど',
      payBtn: function (p) { return p + ' を支払う'; }, tillBtn: 'レジでのお会計にする', demoPay: 'デモのため、実際の支払いは発生しません。',
      paying: 'お支払いの処理中です…', paidTitle: 'お支払いが完了しました', thanks: 'ありがとうございました。またのお越しをお待ちしております。',
      receipt: '領収書をLINEでお送りしました。', tillTitle: 'レジでお会計をお願いします', tillLead: 'お帰りの際に、この画面をレジでお見せください。',
      coupon: '次回のご来店で使えるクーポン', couponBody: '鶏スープ一杯サービス', couponSub: '公式アカウントのトーク画面に届いています',
      again: 'デモを最初から', toastPaid: function (p) { return 'お支払いありがとうございました（' + p + '）。領収書をお送りします。'; },
      kSeat: function () { return 'カウンター ' + seat + '番'; }, kStart: '焼きはじめる', kServe: '提供済みにする', kDone: '提供済み',
      kPaid: function (m) { return 'お会計済み · ' + m; }, kTill: 'レジでお会計予定', kOtoshi: function (n) { return '<b>' + n + '</b> お通し'; },
      kGuests: function (n) { return n + '名'; }, from: 'LINE', minAgo: 'たった今'
    },
    en: {
      title: 'Tori to Sumi · Order', sub: function () { return 'Counter seat ' + seat; }, restart: 'Restart the demo', credits: 'Photo credits', close: 'Close',
      hello: 'Welcome', welcome: 'Welcome to Tori to Sumi.', scanned: function () { return 'You scanned the QR code at counter seat ' + seat + '.'; },
      guests: 'How many of you?', guestUnit: '', otoshiNote: 'Each guest gets a small starter (cabbage with chicken miso, ¥330).',
      start: 'Start ordering', lo: 'Last orders 23:30',
      consentTitle: 'Tori to Sumi · Order', consentLead: 'This service is asking for access to:',
      consentProfile: 'Your main profile', consentProfileSub: 'Display name and profile picture', consentFriend: 'Add Tori to Sumi as a LINE friend', consentFriendSub: 'Get order and bill updates in your chats',
      allow: 'Allow', cancel: 'Cancel', consentNote: 'In real LINE this screen only appears the first time.',
      cats: { picks: 'Picks', shio: 'Salt skewers', tare: 'Tare skewers', ippin: 'Sides & rice', drink: 'Drinks' },
      add: 'Add', addFor: function (p) { return 'Add to order  ' + p; }, qty: 'Quantity', taxin: 'incl. tax',
      cartBar: function (n, p) { return 'Review order (' + n + ') ' + p; },
      cartTitle: 'Your order', otoshi: 'Starter (otoshi)', perHead: function (n) { return '¥330 × ' + n; }, otoshiOnce: 'Added to your first order',
      note: 'Notes for the kitchen', notePh: 'e.g. no spring onion, two extra plates', subtotal: 'Total', taxNote: function (t) { return 'All prices include tax (consumption tax ' + t + ')'; },
      send: 'Send order', backMenu: 'Back to menu', remove: 'Remove', empty: 'Your order is empty.',
      payLater: 'Pay when you leave, in this app or at the till.',
      sentTitle: 'Order received', orderNo: 'Order no.', eta: 'About 12 minutes on the grill.',
      st: ['Received', 'On the grill', 'Brought to your seat'], more: 'Order more', toBill: 'Go to the bill', history: 'Your orders so far',
      seeKitchen: 'See the shop’s screen (demo)',
      toastSent: function (no) { return 'Order received (' + no + '). Your skewers are on their way to the grill.'; },
      toastCooking: 'Your order is on the grill now.', toastServed: 'Your food is at your seat. Enjoy!',
      billTitle: 'Bill', split: 'Split the bill', perPerson: function (n) { return 'Split ' + n + ' ways, each pays'; },
      method: 'Payment method', mPay: 'PayPay', mCard: 'Credit card', mCardSub: 'Visa, Mastercard, JCB, AMEX', mWallet: 'Apple Pay / Google Pay',
      mTill: 'Pay at the till', mTillSub: 'Cash, transit IC cards and more',
      payBtn: function (p) { return 'Pay ' + p; }, tillBtn: 'I’ll pay at the till', demoPay: 'This is a demo. No real payment is made.',
      paying: 'Processing your payment…', paidTitle: 'Payment complete', thanks: 'Thank you. We hope to see you again soon.',
      receipt: 'Your receipt has been sent in LINE.', tillTitle: 'Please pay at the till', tillLead: 'Show this screen at the till on your way out.',
      coupon: 'A coupon for your next visit', couponBody: 'A free bowl of chicken broth', couponSub: 'Waiting in your chat with the shop',
      again: 'Restart the demo', toastPaid: function (p) { return 'Thank you for your payment (' + p + '). Your receipt is on its way.'; },
      kSeat: function () { return 'Counter seat ' + seat; }, kStart: 'Start grilling', kServe: 'Mark as served', kDone: 'Served',
      kPaid: function (m) { return 'Paid · ' + m; }, kTill: 'Will pay at the till', kOtoshi: function (n) { return '<b>' + n + '</b> Starter (otoshi)'; },
      kGuests: function (n) { return n + (n > 1 ? ' guests' : ' guest'); }, from: 'LINE', minAgo: 'just now'
    }
  };

  // ── メニュー（「鳥と炭」のお品書きと同じ価格） ──
  var MENU = [
    { id: 'om7', cat: 'picks', p: 2400, img: '5', tag: ['人気', 'Popular'], ja: ['おまかせ七本', 'その日いちばんの部位を七本。初めての方に。'], en: ['Chef’s seven skewers', 'The seven best cuts of the day. Good for a first visit.'] },
    { id: 'om10', cat: 'picks', p: 3300, ja: ['おまかせ十本', '十本に、季節の野菜を一本。'], en: ['Chef’s ten skewers', 'Ten skewers and one seasonal vegetable.'] },
    { id: 'negi', cat: 'picks', p: 280, img: '6', tag: ['定番', 'Classic'], ja: ['ねぎま', 'もも肉と東京ねぎ。最初の一本に。'], en: ['Negima', 'Thigh and Tokyo leek. The one to start with.'] },
    { id: 'sasami', cat: 'shio', p: 280, ja: ['ささみ わさび', '胸の奥のやわらかい部分に、わさびをのせて。'], en: ['Sasami with wasabi', 'The tender strip under the breast, topped with wasabi.'] },
    { id: 'seseri', cat: 'shio', p: 320, img: '10', ja: ['せせり', 'よく動く首の肉。塩だけで。'], en: ['Seseri (neck)', 'The busiest muscle on the bird. Salt only.'] },
    { id: 'hatsu', cat: 'shio', p: 260, ja: ['ハツ', '一羽にひとつ。さっと焼いて。'], en: ['Hatsu (heart)', 'One per bird, grilled quickly.'] },
    { id: 'bonjiri', cat: 'shio', p: 300, ja: ['ぼんじり', 'いちばん脂ののった部位。'], en: ['Bonjiri (tail)', 'The fattiest, richest cut.'] },
    { id: 'tebasaki', cat: 'shio', p: 340, ja: ['手羽先', '皮はパリッと、中はふっくら。'], en: ['Tebasaki (wing)', 'Crisp skin, soft inside.'] },
    { id: 'shiitake', cat: 'shio', p: 260, img: '9', ja: ['しいたけ', '群馬の肉厚しいたけ。かさに醤油を一滴。'], en: ['Shiitake', 'Fat shiitake from Gunma, a drop of soy in the cap.'] },
    { id: 'kawa', cat: 'tare', p: 240, img: '7', ja: ['かわ', 'きつく巻いて三度焼き。パリッと音がするまで。'], en: ['Kawa (skin)', 'Wound tight, grilled three times until it crackles.'] },
    { id: 'liver', cat: 'tare', p: 280, ja: ['レバー', '中はとろり。苦手な方にもぜひ。'], en: ['Liver', 'Creamy inside. Try it even if you think you don’t like liver.'] },
    { id: 'tsukune', cat: 'tare', p: 380, img: '11', opt: { ja: ['卵黄', ['卵黄あり', '卵黄なし']], en: ['Egg yolk', ['With yolk', 'No yolk']] }, ja: ['つくね', '軟骨入りでコリッと。卵黄につけてどうぞ。'], en: ['Tsukune', 'With cartilage for crunch, and a raw yolk to dip.'] },
    { id: 'yakiton', cat: 'tare', p: 300, img: '8', ja: ['やきとん', '一本だけの豚串。北海道流にからしで。'], en: ['Pork & onion', 'Our one pork skewer, Hokkaido style, with mustard.'] },
    { id: 'uzura', cat: 'tare', p: 220, ja: ['うずら', '三つ、タレをからめて。'], en: ['Quail eggs', 'Three, glazed in tare.'] },
    { id: 'tsuke', cat: 'ippin', p: 550, img: '15', ja: ['漬物盛り合わせ', 'ぬか漬けと浅漬け。'], en: ['Pickle plate', 'Rice-bran and quick pickles.'] },
    { id: 'soup', cat: 'ippin', p: 400, ja: ['鶏スープ', '骨から八時間。〆の前に。'], en: ['Chicken broth', 'Eight hours from the bones.'] },
    { id: 'soboro', cat: 'ippin', p: 680, ja: ['鶏そぼろご飯', '〆にどうぞ。'], en: ['Chicken soboro rice', 'To finish.'] },
    { id: 'beer', cat: 'drink', p: 600, img: '14', tag: ['まずは', 'First round'], ja: ['生ビール（中）', '最初の一本には、やっぱり。'], en: ['Draught beer (medium)', 'For the first skewer, always.'] },
    { id: 'high', cat: 'drink', p: 600, opt: { ja: ['濃さ', ['ふつう', '濃いめ']], en: ['Strength', ['Regular', 'Strong']] }, ja: ['ハイボール', '炭酸強めで、すっきりと。'], en: ['Highball', 'Extra fizzy and clean.'] },
    { id: 'junmai', cat: 'drink', p: 600, img: '13', opt: { ja: ['温度', ['冷や', 'お燗']], en: ['Serve', ['Cold', 'Warm']] }, ja: ['鳥と炭 純米（一杯）', '近くの蔵とつくった店の酒。迷ったらこれ。'], en: ['Tori to Sumi junmai (glass)', 'Our house sake, made with a nearby brewery.'] },
    { id: 'hakuto', cat: 'drink', p: 850, ja: ['白桃（一杯）', '岡山の酒。桃のような華やかな香り。'], en: ['Hakuto (glass)', 'Fragrant sake from Okayama with a hint of peach.'] },
    { id: 'oolong', cat: 'drink', p: 400, ja: ['ウーロン茶', ''], en: ['Oolong tea', ''] }
  ];
  var byId = {}; MENU.forEach(function (m) { byId[m.id] = m; });
  var CATS = ['picks', 'shio', 'tare', 'ippin', 'drink'];

  // ── 状態 ──
  var S;
  function reset() {
    S = { screen: 'welcome', guests: 2, friend: true, cart: [], orders: [], note: '', split: false, method: 'paypay', paid: null, seq: 426 };
  }
  reset();

  function L() { return STR[root.lang === 'en' ? 'en' : 'ja']; }
  function lang() { return root.lang === 'en' ? 'en' : 'ja'; }
  function yen(n) { return '¥' + n.toLocaleString('ja-JP'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function name(m) { return m[lang()][0]; }
  function optLabel(line) { var m = byId[line.id]; return m.opt && line.opt != null ? m.opt[lang()][1][line.opt] : ''; }
  function linePrice(line) { return (byId[line.id].p + (line.id === 'high' && line.opt === 1 ? 100 : 0)) * line.q; }
  function cartCount() { return S.cart.reduce(function (a, l) { return a + l.q; }, 0); }
  function otoshiDue() { return S.orders.length === 0; }
  function cartTotal() { return S.cart.reduce(function (a, l) { return a + linePrice(l); }, 0) + (otoshiDue() ? 330 * S.guests : 0); }
  function billTotal() { return S.orders.reduce(function (a, o) { return a + o.total; }, 0); }
  function tax(t) { return Math.floor(t * 10 / 110); }
  function img(m, cls) {
    if (!m.img) return '<span class="' + cls + ' ph" aria-hidden="true">' + esc(name(m).charAt(0)) + '</span>';
    return '<img class="' + cls + '" src="' + P + 'torisumi-' + m.img + '-s.webp" width="360" height="360" loading="lazy" alt="">';
  }

  // ── 画面 ──
  var VIEWS = {
    welcome: function (t) {
      var g = '';
      for (var i = 1; i <= 6; i++) g += '<button type="button" class="g" aria-pressed="' + (S.guests === i) + '" data-guests="' + i + '">' + i + (t.guestUnit ? '<small>' + t.guestUnit + '</small>' : '') + '</button>';
      return '<div class="scr welcome">' +
        '<figure class="w-hero"><img src="' + P + 'torisumi-1.webp" srcset="' + P + 'torisumi-1-m.webp 960w, ' + P + 'torisumi-1.webp 1920w" sizes="400px" alt=""><figcaption><span>' + t.hello + '</span></figcaption></figure>' +
        '<div class="pad"><h2 class="w-title">' + t.welcome + '</h2><p class="w-scan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 12h8"/></svg>' + t.scanned() + '</p>' +
        '<p class="w-q" id="g-label">' + t.guests + '</p><div class="guests" role="group" aria-labelledby="g-label">' + g + '</div>' +
        '<p class="small">' + t.otoshiNote + '</p><p class="small lo">' + t.lo + '</p><button type="button" class="link small cr-link" data-credits-open>' + t.credits + '</button></div>' +
        '<div class="bar"><button type="button" class="cta" data-go="consent">' + t.start + '</button></div></div>';
    },
    menu: function (t) {
      var tabs = CATS.map(function (c) { return '<a href="#c-' + c + '" data-cat="' + c + '">' + t.cats[c] + '</a>'; }).join('');
      var body = CATS.map(function (c) {
        return '<section class="cat" id="c-' + c + '"><h3>' + t.cats[c] + '</h3><ul class="items">' + MENU.filter(function (m) { return m.cat === c; }).map(function (m) {
          var tag = m.tag ? '<i class="tag">' + m.tag[lang() === 'en' ? 1 : 0] + '</i>' : '';
          return '<li><button type="button" class="item" data-item="' + m.id + '">' + img(m, 'thumb') +
            '<span class="i-text"><b>' + esc(name(m)) + tag + '</b>' + (m[lang()][1] ? '<span>' + esc(m[lang()][1]) + '</span>' : '') + '<em>' + yen(m.p) + '</em></span>' +
            '<span class="plus" aria-hidden="true">+</span></button></li>';
        }).join('') + '</ul></section>';
      }).join('');
      var n = cartCount();
      return '<div class="scr menu"><nav class="cats" aria-label="Menu">' + tabs + '</nav><div class="menu-body" data-menu-body>' + body + '<p class="small allergy">' + (lang() === 'en' ? 'Allergies: our tare contains soy and wheat. Ask the staff about anything else.' : 'アレルギー：タレには大豆と小麦が入っています。そのほかはスタッフにお尋ねください。') + '</p></div>' +
        (n ? '<div class="bar"><button type="button" class="cta" data-go="cart">' + t.cartBar(n, yen(cartTotal())) + '</button></div>' :
          (S.orders.length ? '<div class="bar"><button type="button" class="cta ghost" data-go="sent">' + t.history + '</button></div>' : '')) + '</div>';
    },
    cart: function (t) {
      var rows = S.cart.map(function (l, i) {
        var m = byId[l.id], o = optLabel(l);
        return '<li class="line">' + img(m, 'thumb sm') + '<span class="l-name"><b>' + esc(name(m)) + '</b>' + (o ? '<small>' + o + '</small>' : '') + '<em>' + yen(linePrice(l)) + '</em></span>' +
          '<span class="step" role="group" aria-label="' + t.qty + '"><button type="button" data-dec="' + i + '" aria-label="−">' + (l.q === 1 ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>' : '−') + '</button><output>' + l.q + '</output><button type="button" data-inc="' + i + '" aria-label="+">+</button></span></li>';
      }).join('');
      if (otoshiDue()) rows += '<li class="line otoshi"><span class="thumb sm ph" aria-hidden="true">通</span><span class="l-name"><b>' + t.otoshi + '</b><small>' + t.otoshiOnce + '</small><em>' + yen(330 * S.guests) + '</em></span><span class="step"><output>' + t.perHead(S.guests) + '</output></span></li>';
      var tot = cartTotal();
      return '<div class="scr cart"><div class="pad"><button type="button" class="back" data-go="menu">← ' + t.backMenu + '</button><h2>' + t.cartTitle + '</h2>' +
        (S.cart.length ? '<ul class="lines">' + rows + '</ul>' : '<p class="small">' + t.empty + '</p>') +
        '<label class="note"><span>' + t.note + '</span><textarea rows="2" data-note placeholder="' + esc(t.notePh) + '">' + esc(S.note) + '</textarea></label>' +
        '<div class="total"><span>' + t.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + t.taxNote(yen(tax(tot))) + '</p><p class="small">' + t.payLater + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" data-send' + (S.cart.length ? '' : ' disabled') + '>' + t.send + '</button></div></div>';
    },
    sent: function (t) {
      var last = S.orders[S.orders.length - 1];
      var steps = t.st.map(function (s, i) { return '<li class="' + (i <= last.stage ? 'on' : '') + '"><i></i><span>' + s + '</span>' + (last.times[i] ? '<small>' + last.times[i] + '</small>' : '') + '</li>'; }).join('');
      var hist = S.orders.slice().reverse().map(function (o) {
        return '<li><span class="h-no">' + o.no + ' · ' + o.time + '</span><span class="h-items">' + o.lines.map(function (l) { return esc(name(byId[l.id])) + (optLabel(l) ? '（' + optLabel(l) + '）' : '') + ' × ' + l.q; }).join('、') + '</span><b>' + yen(o.total) + '</b></li>';
      }).join('');
      return '<div class="scr sent"><div class="pad"><div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div>' +
        '<h2>' + t.sentTitle + '</h2><p class="no">' + t.orderNo + ' <b>' + last.no + '</b></p><p class="small center">' + t.eta + '</p>' +
        '<ol class="track" aria-live="polite">' + steps + '</ol>' +
        '<h3 class="h-title">' + t.history + '</h3><ul class="hist">' + hist + '</ul>' +
        '<button type="button" class="link see-k" data-kitchen-open>' + t.seeKitchen + ' →</button></div>' +
        '<div class="bar two"><button type="button" class="cta ghost" data-go="menu">' + t.more + '</button><button type="button" class="cta" data-go="bill">' + t.toBill + '</button></div></div>';
    },
    bill: function (t) {
      var tot = billTotal();
      var rows = [];
      S.orders.forEach(function (o) {
        if (o.otoshi) rows.push('<li><span>' + t.otoshi + ' × ' + o.otoshi + '</span><b>' + yen(330 * o.otoshi) + '</b></li>');
        o.lines.forEach(function (l) { rows.push('<li><span>' + esc(name(byId[l.id])) + (optLabel(l) ? '（' + optLabel(l) + '）' : '') + ' × ' + l.q + '</span><b>' + yen(linePrice(l)) + '</b></li>'); });
      });
      var per = Math.ceil(tot / S.guests / 10) * 10;
      var methods = [['paypay', t.mPay, ''], ['card', t.mCard, t.mCardSub], ['wallet', t.mWallet, ''], ['till', t.mTill, t.mTillSub]].map(function (m) {
        return '<label class="pm"><input type="radio" name="pm" value="' + m[0] + '"' + (S.method === m[0] ? ' checked' : '') + '><span class="pm-ic pm-' + m[0] + '" aria-hidden="true"></span><span><b>' + m[1] + '</b>' + (m[2] ? '<small>' + m[2] + '</small>' : '') + '</span></label>';
      }).join('');
      return '<div class="scr bill"><div class="pad"><button type="button" class="back" data-go="sent">← ' + t.history + '</button><h2>' + t.billTitle + '</h2>' +
        '<ul class="receipt">' + rows.join('') + '</ul><div class="total"><span>' + t.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + t.taxNote(yen(tax(tot))) + '</p>' +
        (S.guests > 1 ? '<label class="switch"><input type="checkbox" data-split' + (S.split ? ' checked' : '') + '><span>' + t.split + '</span></label>' + (S.split ? '<p class="per">' + t.perPerson(S.guests) + ' <b>' + yen(per) + '</b></p>' : '') : '') +
        '<fieldset class="pms"><legend>' + t.method + '</legend>' + methods + '</fieldset><p class="small">' + t.demoPay + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" data-pay>' + (S.method === 'till' ? t.tillBtn : t.payBtn(yen(tot))) + '</button></div></div>';
    },
    paying: function (t) {
      return '<div class="scr paying"><div class="spin" aria-hidden="true"></div><p role="status">' + t.paying + '</p></div>';
    },
    done: function (t) {
      var till = S.paid === 'till';
      return '<div class="scr done"><div class="pad">' +
        (till ? '<h2>' + t.tillTitle + '</h2><p class="center">' + t.tillLead + '</p><div class="till-code"><b>' + t.kSeat() + '</b><span>' + yen(billTotal()) + '</span><i aria-hidden="true"></i></div>'
          : '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div><h2>' + t.paidTitle + '</h2><p class="paid-sum">' + yen(billTotal()) + ' · ' + methodName(S.paid) + '</p><p class="center">' + t.receipt + '</p>') +
        '<p class="center">' + t.thanks + '</p>' +
        (S.friend ? '<div class="coupon"><small>' + t.coupon + '</small><b>' + t.couponBody + '</b><span>' + t.couponSub + '</span></div>' : '') +
        '<button type="button" class="link see-k" data-kitchen-open>' + t.seeKitchen + ' →</button></div>' +
        '<div class="bar"><button type="button" class="cta ghost" data-restart-btn>' + t.again + '</button></div></div>';
    }
  };
  function methodName(m) { var t = L(); return { paypay: t.mPay, card: t.mCard, wallet: t.mWallet, till: t.mTill }[m] || ''; }

  function render(focus) {
    var t = L();
    app.querySelector('[data-mh-title]').textContent = t.title;
    app.querySelector('[data-mh-sub]').textContent = t.sub();
    app.querySelector('[data-mh-restart]').textContent = t.restart;
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
      var cur = CATS[0], top = mb.getBoundingClientRect().top;
      CATS.forEach(function (c) { var s = document.getElementById('c-' + c); if (s && s.getBoundingClientRect().top - top < 60) cur = c; });
      tabs.forEach(function (a) { var on = a.dataset.cat === cur; a.classList.toggle('on', on); if (on && a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) { var p = a.parentNode; p.scrollLeft = a.offsetLeft - (p.clientWidth - a.offsetWidth) / 2; } });
    }
    mb.addEventListener('scroll', upd, { passive: true }); upd();
  }

  // ── ボトムシート ──
  var lastFocus = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    sheetBody.innerHTML = html; sheetWrap.hidden = false;
    requestAnimationFrame(function () { sheetWrap.classList.add('open'); var f = sheetBody.querySelector('.cta, button'); if (f) f.focus(); });
  }
  function closeSheet() {
    if (sheetWrap.hidden) return;
    sheetWrap.classList.remove('open'); sheetWrap.hidden = true; sheetBody.innerHTML = '';
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  }
  function consentSheet() {
    var t = L();
    openSheet('<div class="consent"><span class="mh-icon big" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><h2 id="sheet-title">' + t.consentTitle + '</h2><p>' + t.consentLead + '</p>' +
      '<ul class="perm"><li><b>' + t.consentProfile + '</b><small>' + t.consentProfileSub + '</small></li></ul>' +
      '<label class="switch fr"><input type="checkbox" data-friend' + (S.friend ? ' checked' : '') + '><span><b>' + t.consentFriend + '</b><small>' + t.consentFriendSub + '</small></span></label>' +
      '<div class="two"><button type="button" class="cta ghost" data-consent="0">' + t.cancel + '</button><button type="button" class="cta" data-consent="1">' + t.allow + '</button></div><p class="small center">' + t.consentNote + '</p></div>');
  }
  var draft = null;
  function itemSheet(id) {
    var m = byId[id], t = L();
    draft = { id: id, q: 1, opt: m.opt ? 0 : null };
    var opt = '';
    if (m.opt) {
      var o = m.opt[lang()];
      opt = '<fieldset class="opts"><legend>' + o[0] + '</legend>' + o[1].map(function (v, i) { return '<label><input type="radio" name="opt" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span>' + v + (id === 'high' && i === 1 ? ' +¥100' : '') + '</span></label>'; }).join('') + '</fieldset>';
    }
    openSheet((m.img ? '<img class="s-img" src="' + P + 'torisumi-' + m.img + '-s.webp" width="360" height="360" alt="">' : '') +
      '<div class="s-body"><h2 id="sheet-title">' + esc(name(m)) + '</h2>' + (m[lang()][1] ? '<p>' + esc(m[lang()][1]) + '</p>' : '') + '<p class="s-price">' + yen(m.p) + ' <small>' + t.taxin + '</small></p>' + opt +
      '<div class="s-qty"><span>' + t.qty + '</span><span class="step"><button type="button" data-dq="-1" aria-label="−">−</button><output data-q>1</output><button type="button" data-dq="1" aria-label="+">+</button></span></div>' +
      '<button type="button" class="cta" data-add>' + t.addFor(yen(m.p)) + '</button></div>');
  }
  function updDraft() {
    var tmp = { id: draft.id, q: draft.q, opt: draft.opt };
    sheetBody.querySelector('[data-q]').textContent = draft.q;
    sheetBody.querySelector('[data-add]').textContent = L().addFor(yen(linePrice(tmp)));
  }
  function addLine(l) {
    var same = S.cart.filter(function (c) { return c.id === l.id && c.opt === l.opt; })[0];
    if (same) same.q += l.q; else S.cart.push({ id: l.id, q: l.q, opt: l.opt });
  }

  // ── 通知（LINEのトークに届くお知らせのイメージ） ──
  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = '<span class="mh-icon" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><span><b>鳥と炭 <small>' + L().from + ' · ' + L().minAgo + '</small></b>' + esc(msg) + '</span>';
    toastEl.hidden = false; toastEl.classList.remove('in'); void toastEl.offsetWidth; toastEl.classList.add('in');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('in'); setTimeout(function () { toastEl.hidden = true; }, 300); }, 4200);
  }

  // ── 注文と厨房 ──
  function clock() { var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function sendOrder() {
    S.seq += 1;
    var o = { no: '#' + String(S.seq).padStart(4, '0'), time: clock(), lines: S.cart, note: S.note, otoshi: otoshiDue() ? S.guests : 0, total: cartTotal(), stage: 0, times: [clock()], timers: [] };
    S.orders.push(o); S.cart = []; S.note = '';
    go('sent'); toast(L().toastSent(o.no));
    // 厨房が操作しなくても、デモは自動で進む
    o.timers.push(setTimeout(function () { advance(o, 1, true); }, 7000));
    o.timers.push(setTimeout(function () { advance(o, 2, true); }, 16000));
  }
  function advance(o, stage, auto) {
    if (S.orders.indexOf(o) < 0 || o.stage >= stage) return;
    o.stage = stage; o.times[stage] = clock();
    if (stage === 2) o.timers.forEach(clearTimeout);
    if (S.screen === 'sent' && o === S.orders[S.orders.length - 1]) render(); else renderKitchen();
    toast(stage === 1 ? L().toastCooking : L().toastServed);
  }
  function renderKitchen() {
    var t = L();
    kEmpty.hidden = S.orders.length > 0;
    kTotal.textContent = yen(billTotal());
    ticketsEl.innerHTML = S.orders.slice().reverse().map(function (o) {
      var i = S.orders.indexOf(o);
      var items = (o.otoshi ? '<li>' + t.kOtoshi(o.otoshi) + '</li>' : '') + o.lines.map(function (l) { return '<li><b>' + l.q + '</b> ' + esc(name(byId[l.id])) + (optLabel(l) ? ' <small>' + optLabel(l) + '</small>' : '') + '</li>'; }).join('');
      var act = o.stage === 0 ? '<button type="button" class="k-btn" data-k="' + i + '" data-to="1">' + t.kStart + '</button>' : o.stage === 1 ? '<button type="button" class="k-btn hot" data-k="' + i + '" data-to="2">' + t.kServe + '</button>' : '<span class="k-done">✓ ' + t.kDone + '</span>';
      return '<li class="ticket st' + o.stage + '"><div class="t-top"><b>' + t.kSeat() + '</b><span>' + o.no + ' · ' + o.time + ' · ' + t.kGuests(S.guests) + '</span></div><ul>' + items + '</ul>' + (o.note ? '<p class="t-note">' + esc(o.note) + '</p>' : '') + '<div class="t-foot"><span>' + yen(o.total) + '</span>' + act + '</div></li>';
    }).join('') + (S.paid ? '<li class="ticket paid"><div class="t-top"><b>' + t.kSeat() + '</b><span>' + (S.paid === 'till' ? t.kTill : t.kPaid(methodName(S.paid))) + '</span></div><div class="t-foot"><span>' + yen(billTotal()) + '</span></div></li>' : '');
  }

  // ── 操作 ──
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a, [data-close-sheet]'); if (!el) return;
    var d = el.dataset;
    if (d.guests) { S.guests = Number(d.guests); render(); screens.querySelector('[data-guests="' + d.guests + '"]').focus(); }
    else if (d.go === 'consent') consentSheet();
    else if (d.consent) { var f = sheetBody.querySelector('[data-friend]'); S.friend = d.consent === '1' && !!(f && f.checked); go('menu'); }
    else if (d.go) go(d.go);
    else if (d.item) itemSheet(d.item);
    else if (d.dq) { draft.q = Math.max(1, Math.min(20, draft.q + Number(d.dq))); updDraft(); }
    else if (d.add !== undefined) { addLine(draft); closeSheet(); render(); }
    else if (d.inc) { S.cart[d.inc].q += 1; render(); }
    else if (d.dec) { var l = S.cart[d.dec]; l.q -= 1; if (!l.q) S.cart.splice(Number(d.dec), 1); render(); }
    else if (d.send !== undefined) sendOrder();
    else if (d.pay !== undefined) pay();
    else if (d.restart !== undefined || d.restartBtn !== undefined) restart();
    else if (d.closeSheet !== undefined) closeSheet();
    else if (d.kitchenOpen !== undefined) openKitchen();
    else if (d.creditsOpen !== undefined) openSheet('<div class="cr-sheet"><h2 id="sheet-title">' + L().credits + '</h2><ul>' + document.querySelector('[data-credits]').innerHTML + '</ul><button type="button" class="cta ghost" data-close-sheet>' + L().close + '</button></div>');
    else if (el.matches('.cats a')) { e.preventDefault(); var s = document.getElementById(el.getAttribute('href').slice(1)), mb = screens.querySelector('[data-menu-body]'); mb.scrollTo({ top: s.offsetTop - mb.offsetTop, behavior: reduce.matches ? 'auto' : 'smooth' }); }
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'opt') { draft.opt = Number(el.value); updDraft(); }
    else if (el.name === 'pm') { S.method = el.value; render(); screens.querySelector('input[value="' + el.value + '"]').focus(); }
    else if (el.matches('[data-split]')) { S.split = el.checked; render(); screens.querySelector('[data-split]').focus(); }
  });
  app.addEventListener('input', function (e) { if (e.target.matches('[data-note]')) S.note = e.target.value.slice(0, 120); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheetWrap.hidden) closeSheet(); else if (document.body.classList.contains('k-open')) closeKitchen();
  });
  function pay() {
    var m = S.method;
    if (m === 'till') { S.paid = 'till'; go('done'); return; }
    go('paying');
    setTimeout(function () { S.paid = m; S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); go('done'); toast(L().toastPaid(yen(billTotal()))); }, reduce.matches ? 400 : 1600);
  }
  function restart() { S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); reset(); go('welcome'); }

  // 厨房：スマホでは全画面で重ねて見せる
  ticketsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'); if (!b) return;
    advance(S.orders[Number(b.dataset.k)], Number(b.dataset.to));
    var nb = ticketsEl.querySelector('[data-k="' + b.dataset.k + '"]'); if (nb) nb.focus();
  });
  var kBack = null;
  function openKitchen() { kBack = document.activeElement; document.body.classList.add('k-open'); kitchen.querySelector('[data-kitchen-close]').focus(); }
  function closeKitchen() { document.body.classList.remove('k-open'); if (kBack && document.body.contains(kBack)) kBack.focus(); }
  kitchen.querySelector('[data-kitchen-close]').addEventListener('click', closeKitchen);

  document.addEventListener('langchange', function () { var open = !sheetWrap.hidden; closeSheet(); render(); if (open && S.screen === 'welcome') consentSheet(); });
  // 写真クレジット用に、メニューの写真も最初からページに置いておく（読み込みは遅延）
  var pre = document.createElement('div'); pre.hidden = true;
  pre.innerHTML = MENU.filter(function (m) { return m.img; }).map(function (m) { return '<img src="' + P + 'torisumi-' + m.img + '-s.webp" loading="lazy" alt="">'; }).join('');
  document.body.appendChild(pre);
  render();
})();
