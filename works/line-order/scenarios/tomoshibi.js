// 大衆酒場ともしび（新橋の居酒屋）：飲み放題を席で選び、残り時間を見ながら注文。グラス交換制で、最後にお会計。
window.LO = {
  flow: 'course', seats: 12, seat: 4, seq: 1203, prefix: '#', guests: true,
  hero: { src: 'torisumi-22.webp' },
  otoshi: { p: 300 },
  courses: [
    { min: 90, p: 1800, ja: ['飲み放題 90分', '生ビール・ハイボール・サワー・日本酒・ソフトドリンク'], en: ['Free flow, 90 minutes', 'Draught beer, highballs, sours, sake and soft drinks'] },
    { min: 120, p: 2300, ja: ['飲み放題 120分', '内容は90分と同じです'], en: ['Free flow, 120 minutes', 'Same drinks as the 90-minute plan'] },
    { min: 0, p: 0, ja: ['単品で注文', 'お飲みものも一杯ずつのお会計'], en: ['À la carte', 'Pay for each drink'] }
  ],
  cats: [{ id: 'drink', ja: 'お飲みもの', en: 'Drinks' }, { id: 'food', ja: 'おつまみ', en: 'Small plates' }, { id: 'main', ja: '揚げもの・焼きもの', en: 'Fried & grilled' }, { id: 'shime', ja: '〆', en: 'To finish' }],
  menu: [
    { id: 'beer', cat: 'drink', drink: true, p: 550, img: 'torisumi-14', tag: ['とりあえず', 'First round'], ja: ['生ビール（中）', ''], en: ['Draught beer (medium)', ''] },
    { id: 'high', cat: 'drink', drink: true, p: 450, ja: ['角ハイボール', ''], en: ['Highball', ''] },
    { id: 'lemon', cat: 'drink', drink: true, p: 450, opts: [{ def: 0, ja: ['濃さ', ['ふつう', '濃いめ']], en: ['Strength', ['Regular', 'Strong']] }], ja: ['レモンサワー', '生のレモンを搾って。'], en: ['Lemon sour', 'With fresh-squeezed lemon.'] },
    { id: 'sake', cat: 'drink', drink: true, p: 600, img: 'torisumi-13', opts: [{ def: 0, ja: ['温度', ['冷や', '熱燗']], en: ['Serve', ['Cold', 'Hot']] }], ja: ['日本酒（一合）', ''], en: ['Sake (180 ml)', ''] },
    { id: 'oolong', cat: 'drink', drink: true, p: 300, ja: ['ウーロン茶', ''], en: ['Oolong tea', ''] },
    { id: 'orange', cat: 'drink', drink: true, p: 300, ja: ['オレンジジュース', ''], en: ['Orange juice', ''] },
    { id: 'edamame', cat: 'food', p: 380, ja: ['枝豆', '塩ゆでで、すぐ出ます。'], en: ['Edamame', 'Salted, out in a minute.'] },
    { id: 'potesara', cat: 'food', p: 480, tag: ['名物', 'House special'], ja: ['ポテトサラダ', 'いぶりがっこ入り。'], en: ['Potato salad', 'With smoked pickled radish.'] },
    { id: 'tsuke', cat: 'food', p: 450, img: 'torisumi-15', ja: ['漬物盛り合わせ', ''], en: ['Pickle plate', ''] },
    { id: 'dashimaki', cat: 'food', p: 580, ja: ['だし巻き玉子', '注文を受けてから焼きます。'], en: ['Dashimaki omelette', 'Rolled to order.'] },
    { id: 'karaage', cat: 'main', p: 680, tag: ['人気', 'Popular'], ja: ['鶏の唐揚げ（5個）', 'にんにく醤油に一晩。'], en: ['Fried chicken (5)', 'Marinated overnight in garlic and soy.'] },
    { id: 'kushi', cat: 'main', p: 980, img: 'torisumi-5', ja: ['焼き鳥盛り合わせ（5本）', '塩とタレ、おまかせで。'], en: ['Yakitori platter (5)', 'Salt and tare, chef’s choice.'] },
    { id: 'onigiri', cat: 'shime', p: 380, ja: ['焼きおにぎり（2個）', '醤油を塗って、香ばしく。'], en: ['Grilled rice balls (2)', 'Brushed with soy and toasted.'] },
    { id: 'ochazuke', cat: 'shime', p: 480, ja: ['鮭茶漬け', ''], en: ['Salmon ochazuke', 'Rice in hot tea broth.'] }
  ],
  t: {
    ja: {
      shop: '大衆酒場ともしび', title: 'ともしび モバイルオーダー', sub: function (s) { return 'テーブル ' + s + '番'; },
      welcome: 'ともしびへ、ようこそ。', scanned: function (s) { return 'テーブル ' + s + '番 のQRコードを読み取りました。'; },
      courseQ: '飲み放題をつけますか？', perHeadUnit: '／人',
      notes: ['お一人さまにお通し（¥300）をお出しします。', '飲み放題はグラス交換制です。ラストオーダーは終了の15分前です。'],
      consentFriend: 'ともしびの公式アカウントを友だち追加',
      otoshi: 'お通し', kOtoshi: 'お通し', notePh: '例：取り皿を三枚、唐揚げにレモンなし',
      payWhen: 'お会計はお帰りの際に、このアプリかレジでどうぞ。', eta: 'お飲みものは、すぐにお持ちします。',
      allergy: 'アレルギーや苦手な食材は、ご要望の欄に書いてください。',
      st: ['受付済み', '用意しています', 'お席へお持ちしました'],
      toastSent: function (no) { return 'ご注文を受け付けました（' + no + '）。'; },
      toastCooking: 'ただいま用意しています。', toastServed: 'お席へお持ちしました。',
      couponBody: '次回、生ビール一杯サービス', kSeat: function (s) { return 'テーブル ' + s + '番'; }, kPaid: function (m) { return 'お会計済み · ' + m; }
    },
    en: {
      shop: 'Tomoshibi', title: 'Tomoshibi · Order', sub: function (s) { return 'Table ' + s; },
      welcome: 'Welcome to Tomoshibi.', scanned: function (s) { return 'You scanned the QR code at table ' + s + '.'; },
      courseQ: 'Add a free-flow drinks plan?', perHeadUnit: ' per person',
      notes: ['Each guest gets a small starter (otoshi, ¥300).', 'Free-flow is one glass per guest per round. Last orders 15 minutes before the end.'],
      consentFriend: 'Add Tomoshibi as a LINE friend',
      otoshi: 'Starter (otoshi)', kOtoshi: 'Starter (otoshi)', notePh: 'e.g. three extra plates, no lemon on the chicken',
      payWhen: 'Pay when you leave, in this app or at the till.', eta: 'Drinks are on their way.',
      allergy: 'Allergies or things you don’t eat? Write them in the notes.',
      st: ['Received', 'Being prepared', 'Brought to your table'],
      toastSent: function (no) { return 'Order received (' + no + ').'; },
      toastCooking: 'We’re getting it ready.', toastServed: 'It’s at your table.',
      couponBody: 'A free draught beer next time', kSeat: function (s) { return 'Table ' + s; }, kPaid: function (m) { return 'Paid · ' + m; }
    }
  }
};
