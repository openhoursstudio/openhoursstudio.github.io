// かえでとケトル（京都・北白川の珈琲店）：公式アカウントのメニューから、テイクアウトを事前に注文して受け取るだけ。
window.LO = {
  flow: 'pickup', seats: 1, seat: 1, seq: 11, prefix: 'A-', guests: false,
  picks: ['latte', 'blend', 'cake', 'hoji'], rank: ['latte', 'blend', 'hoji'], stamps: {'have': 3, 'need': 10},
  hero: { src: 'cafe-window-counter.webp' },
  slots: [0, 15, 30, 45],
  cats: [{ id: 'coffee', ja: 'コーヒー', en: 'Coffee' }, { id: 'tea', ja: 'お茶・ほか', en: 'Tea & more' }, { id: 'sweet', ja: 'お菓子', en: 'Sweets' }],
  menu: [
    { id: 'blend', cat: 'coffee', pair: ['shortbread', 'macaron'], p: 620, img: 'cafe-pour-over', tag: ['定番', 'House'], opts: [{ def: 0, ja: ['温度', ['ホット', 'アイス']], en: ['Temperature', ['Hot', 'Iced']] }], ja: ['ハンドドリップ かえでブレンド', 'ビターチョコとローストくるみの余韻。'], en: ['Hand drip · Kaede blend', 'Dark chocolate and roasted walnut.'] },
    { id: 'single', cat: 'coffee', pair: ['cake'], p: 720, img: 'cafe-pour-over-window', ja: ['ハンドドリップ シングルオリジン', '豆は週替わり。今週はエチオピアの浅煎り。'], en: ['Hand drip · Single origin', 'Changes weekly. This week, a light roast from Ethiopia.'] },
    { id: 'latte', cat: 'coffee', pair: ['cake', 'shortbread'], p: 650, img: 'cafe-latte-art', opts: [{ def: 0, ja: ['温度', ['ホット', 'アイス']], en: ['Temperature', ['Hot', 'Iced']] }, { def: 0, add: [0, 50], ja: ['ミルク', ['牛乳', 'オーツミルク']], en: ['Milk', ['Dairy', 'Oat']] }], ja: ['カフェラテ', 'ブレンドのエスプレッソで。'], en: ['Caffè latte', 'Made with our blend as espresso.'] },
    { id: 'espresso', cat: 'coffee', pair: ['macaron'], p: 450, img: 'cafe-espresso-machine', ja: ['エスプレッソ', ''], en: ['Espresso', ''] },
    { id: 'cold', cat: 'coffee', soldout: true, p: 600, img: 'lo-iced-coffee', tag: ['夏季', 'Summer'], ja: ['水出し珈琲', '一晩かけて、ゆっくり抽出。'], en: ['Cold brew', 'Steeped slowly overnight.'] },
    { id: 'hoji', cat: 'tea', pair: ['macaron', 'shortbread'], p: 620, img: 'lo-hojicha-latte', opts: [{ def: 0, ja: ['温度', ['ホット', 'アイス']], en: ['Temperature', ['Hot', 'Iced']] }, { def: 0, add: [0, 50], ja: ['ミルク', ['牛乳', 'オーツミルク']], en: ['Milk', ['Dairy', 'Oat']] }], ja: ['ほうじ茶ラテ', '宇治のほうじ茶で。'], en: ['Hojicha latte', 'With roasted green tea from Uji.'] },
    { id: 'sencha', cat: 'tea', p: 550, img: 'lo-sencha', ja: ['煎茶', '宇治の煎茶を、ちょうどいい温度で。'], en: ['Sencha', 'Uji green tea at just the right temperature.'] },
    { id: 'ginger', cat: 'tea', p: 580, img: 'lo-ginger', ja: ['自家製ジンジャーソーダ', '生姜とレモン、黒糖を少し。'], en: ['House ginger soda', 'Ginger, lemon and a little brown sugar.'] },
    { id: 'apple', cat: 'tea', p: 500, img: 'lo-apple', ja: ['りんごジュース', '長野のりんご、ストレート。'], en: ['Apple juice', 'Pressed apples from Nagano.'] },
    { id: 'cake', cat: 'sweet', p: 560, img: 'lo-pound-cake', tag: ['季節限定', 'Seasonal'], ja: ['季節のケーキ', '今の季節は、栗のパウンドケーキ。'], en: ['Cake of the season', 'Right now, a chestnut pound cake.'] },
    { id: 'shortbread', cat: 'sweet', p: 320, img: 'lo-shortbread', ja: ['メープルショートブレッド', 'コーヒーによく合う、さくっと軽い一枚。'], en: ['Maple shortbread', 'Light and crumbly, made for coffee.'] },
    { id: 'macaron', cat: 'sweet', p: 300, img: 'cafe-macarons', ja: ['マカロン（1個）', 'ほうじ茶、ピスタチオ、木いちご。'], en: ['Macaron (1)', 'Hojicha, pistachio or raspberry.'] }
  ],
  t: {
    ja: {
      kind: '珈琲店 · 京都 北白川', newsBody: ['今週のシングルオリジンは、エチオピアの浅煎りです。', '季節のケーキが、栗のパウンドケーキになりました。'], infoRows: [['営業時間', '8:00〜18:00（水曜定休）'], ['受け取り', '入口の受け取り棚'], ['お支払い', 'PayPay・クレジットカード・交通系IC・現金'], ['場所', '京都・北白川（架空のお店です）'], ['メニュー', '日本語・English']], stampName: 'かえでとケトル スタンプカード', stampReward: '10個でドリンク一杯無料',
      shop: 'かえでとケトル', title: 'かえでとケトル テイクアウト', sub: function () { return 'テイクアウトの事前注文'; },
      welcome: '並ばずに、受け取るだけ。', scanned: function () { return '公式アカウントのメニューから「テイクアウト」を開きました。'; },
      slotQ: 'いつ受け取りますか？', slotNow: 'できしだい（約10分）', slotIn: function (m, t) { return m + '分後（' + t + '）'; },
      pickBanner: function (s) { return '受け取り：' + s; },
      notes: ['お支払いは注文と一緒に。お店ではお名前も番号も言わずに、受け取り棚から取っていくだけです。', '営業時間 8:00〜18:00（水曜定休）'],
      consentFriend: 'かえでとケトルの公式アカウントを友だち追加', consentFriendSub: 'できあがったら、LINEでお知らせします',
      notePh: '例：氷少なめ、ふたにストローの穴なし', payWhen: 'お支払いは注文と一緒にすませます。店頭で払うこともできます。',
      eta: 'できあがったら、LINEでお知らせします。', pickNo: '受け取り番号', pickAt: function (t) { return t ? t + 'ごろ、受け取り棚にご用意します' : 'できしだい、受け取り棚にご用意します'; },
      allergy: 'アレルギー：お菓子には小麦・卵・乳が入っています。マカロンにはアーモンドが入っています。',
      st: ['受付済み', 'いれています', 'できあがりました'],
      toastSent: function (no) { return 'ご注文を受け付けました。受け取り番号は ' + no + ' です。'; },
      toastCooking: 'いま、コーヒーをいれています。', toastServed: 'できあがりました。入口の受け取り棚にご用意しています。',
      doneTitle: 'ありがとうございました', thanks: 'いってらっしゃい。また北白川でお待ちしています。',
      mTill: '店頭で支払う', mTillSub: '受け取りのときに、現金・交通系ICで', tillBtn: '店頭で支払う',
      finish: '受け取りました', couponBody: '次回、ドリンク50円引き',
      kSeat: function () { return 'テイクアウト'; }, kStart: 'いれはじめる', kServe: 'できあがり', kDone: 'できあがり（通知済み）',
      kPaid: function (m) { return '支払い済み · ' + m; }, kTill: '店頭で支払い', kPick: function (t) { return t + ' 受け取り'; }
    },
    en: {
      kind: 'Coffee · Kitashirakawa, Kyoto', newsBody: ['This week’s single origin is a light roast from Ethiopia.', 'The cake of the season is now a chestnut pound cake.'], infoRows: [['Hours', '8:00–18:00, closed Wednesdays'], ['Pick-up', 'The shelf by the door'], ['Payment', 'PayPay, cards, transit IC, cash'], ['Where', 'Kitashirakawa, Kyoto (a fictional shop)'], ['Menu', 'Japanese and English']], stampName: 'Kaede & Kettle stamp card', stampReward: '10 stamps, a free drink',
      shop: 'Kaede & Kettle', title: 'Kaede & Kettle · Takeaway', sub: function () { return 'Order ahead for takeaway'; },
      welcome: 'Skip the queue. Just pick it up.', scanned: function () { return 'You opened “Takeaway” from the shop’s LINE menu.'; },
      slotQ: 'When will you pick it up?', slotNow: 'As soon as it’s ready (about 10 min)', slotIn: function (m, t) { return 'In ' + m + ' min (' + t + ')'; },
      pickBanner: function (s) { return 'Pick-up: ' + s; },
      notes: ['You pay as you order. At the shop, just take your cup from the pick-up shelf.', 'Open 8:00–18:00, closed Wednesdays'],
      consentFriend: 'Add Kaede & Kettle as a LINE friend', consentFriendSub: 'We message you when it’s ready',
      notePh: 'e.g. light ice, no straw', payWhen: 'You pay as you order. You can also pay at the shop.',
      eta: 'We’ll message you in LINE when it’s ready.', pickNo: 'Pick-up number', pickAt: function (t) { return t ? 'On the pick-up shelf around ' + t : 'On the pick-up shelf as soon as it’s ready'; },
      allergy: 'Allergies: the sweets contain wheat, egg and milk. The macarons contain almonds.',
      st: ['Received', 'Brewing', 'Ready'],
      toastSent: function (no) { return 'Order received. Your pick-up number is ' + no + '.'; },
      toastCooking: 'We’re brewing your coffee now.', toastServed: 'It’s ready, on the pick-up shelf by the door.',
      doneTitle: 'Thank you', thanks: 'Have a good day. See you again in Kitashirakawa.',
      mTill: 'Pay at the shop', mTillSub: 'Cash or transit IC card when you pick up', tillBtn: 'Pay at the shop',
      finish: 'Picked it up', couponBody: '¥50 off a drink next time',
      kSeat: function () { return 'Takeaway'; }, kStart: 'Start brewing', kServe: 'Ready', kDone: 'Ready (guest notified)',
      kPaid: function (m) { return 'Paid · ' + m; }, kTill: 'Pays at the shop', kPick: function (t) { return 'pick-up ' + t; }
    }
  }
};
