// 麺屋ほたる（大阪・天満の深夜ラーメン）：券売機の代わりに、店の前で並びながら注文して先に支払う。
window.LO = {
  flow: 'first', seats: 10, seat: 3, seq: 87, prefix: 'No.', guests: false,
  hero: { src: 'hotaru-7.webp' },
  cats: [{ id: 'ramen', ja: 'ラーメン', en: 'Ramen' }, { id: 'top', ja: 'トッピング', en: 'Toppings' }, { id: 'side', ja: 'ごはん・一品', en: 'Sides' }, { id: 'drink', ja: 'ドリンク', en: 'Drinks' }],
  menu: [
    { id: 'shio', cat: 'ramen', p: 950, img: 'hotaru-1', tag: ['いちばん人気', 'Most popular'], opts: [{ def: 1, ja: ['麺のかたさ', ['かため', 'ふつう', 'やわらかめ']], en: ['Noodles', ['Firm', 'Regular', 'Soft']] }], ja: ['塩らーめん', '澄んだスープに沖縄の塩、ゆずの皮。四杯のなかでいちばん軽い一杯。'], en: ['Shio ramen', 'Clear broth, Okinawan sea salt, yuzu peel. Lightest of the four.'] },
    { id: 'shoyu', cat: 'ramen', p: 950, img: 'hotaru-3', opts: [{ def: 1, ja: ['麺のかたさ', ['かため', 'ふつう', 'やわらかめ']], en: ['Noodles', ['Firm', 'Regular', 'Soft']] }], ja: ['醤油らーめん', '小豆島の醤油を三種。色は濃く、味はまるく。'], en: ['Shoyu ramen', 'Three soy sauces from Shodoshima, a darker and rounder bowl.'] },
    { id: 'niboshi', cat: 'ramen', p: 1050, tag: ['辛い', 'Spicy'], opts: [{ def: 1, ja: ['麺のかたさ', ['かため', 'ふつう', 'やわらかめ']], en: ['Noodles', ['Firm', 'Regular', 'Soft']] }, { def: 1, ja: ['辛さ', ['ひかえめ', 'ふつう', '辛め']], en: ['Heat', ['Mild', 'Regular', 'Hot']] }], ja: ['辛口煮干しらーめん', '煮干し倍量に自家製ラー油。少し汗をかく一杯。'], en: ['Spicy niboshi ramen', 'Double the sardines, chilli oil made in house. Sweat a little.'] },
    { id: 'veg', cat: 'ramen', p: 1000, tag: ['一日五杯', 'Five a night'], opts: [{ def: 1, ja: ['麺のかたさ', ['かため', 'ふつう', 'やわらかめ']], en: ['Noodles', ['Firm', 'Regular', 'Soft']] }], ja: ['野菜らーめん', '昆布と椎茸のスープ。肉も魚も使っていません。'], en: ['Vegetable ramen', 'Kombu and shiitake broth, no meat or fish.'] },
    { id: 'egg', cat: 'top', p: 150, img: 'hotaru-2', ja: ['味玉', '半熟、一晩漬け込み。'], en: ['Seasoned egg', 'Soft yolk, marinated overnight.'] },
    { id: 'chashu', cat: 'top', p: 350, ja: ['チャーシュー増し（3枚）', '低温調理の肩ロース。'], en: ['Extra chashu (3 slices)', 'Pork shoulder, slow-cooked at low temperature.'] },
    { id: 'kaedama', cat: 'top', p: 150, ja: ['替え玉', 'スープが残っているうちにどうぞ。'], en: ['Extra noodles', 'Order before you finish the broth.'] },
    { id: 'negi', cat: 'top', p: 100, ja: ['九条ねぎ', '京都の九条ねぎ、注文ごとに刻みます。'], en: ['Spring onion', 'From Kyoto, cut to order.'] },
    { id: 'gyoza', cat: 'side', p: 450, ja: ['餃子（6個）', '羽根つきの焼き餃子。'], en: ['Gyoza (6)', 'Pan-fried, with a crisp lace on the bottom.'] },
    { id: 'don', cat: 'side', p: 400, ja: ['チャーシュー丼', '小ぶり。残ったスープと一緒に。'], en: ['Chashu rice bowl', 'Small, made to go with the last of the broth.'] },
    { id: 'beer', cat: 'drink', p: 550, ja: ['生ビール', '中ジョッキ。'], en: ['Draught beer', 'Medium mug.'] },
    { id: 'sake', cat: 'drink', p: 600, img: 'hotaru-8', ja: ['日本酒（冷）', '奈良の酒蔵から。'], en: ['Sake (cold)', 'From a brewery in Nara.'] },
    { id: 'oolong', cat: 'drink', p: 250, ja: ['烏龍茶', '冷たい烏龍茶。お水はいつでもどうぞ。'], en: ['Oolong tea', 'Iced. Water is always free.'] }
  ],
  t: {
    ja: {
      shop: '麺屋ほたる', title: '麺屋ほたる 事前注文', sub: function () { return '店頭のQR · 並びながら注文'; },
      welcome: '並んでいるあいだに、注文を。', scanned: function () { return '店の前のQRコードを読み取りました。券売機に並ばなくても大丈夫です。'; },
      notes: ['お支払いは先にすませておけるので、席に着いたらラーメンを待つだけです。', 'English menu: tap EN at the top.', 'ラストオーダー 1:30'],
      consentFriend: '麺屋ほたるの公式アカウントを友だち追加', consentFriendSub: '席が空いたら、LINEでお知らせします',
      notePh: '例：ねぎ抜き、子ども用の小さな器', payWhen: 'お支払いは注文と一緒に。現金の方は、席でスタッフにお渡しください。',
      eta: 'いまの待ち時間は、およそ10分です。席が空いたらLINEでお知らせします。',
      allergy: 'アレルギー：麺に小麦、スープに魚介と大豆が入っています。野菜らーめんにも小麦と大豆が入っています。',
      st: ['受付済み（このままお並びください）', 'お席が空きました', 'ラーメンをお出ししました'],
      toastSent: function (no) { return 'ご注文とお支払いを受け付けました（' + no + '）。このままお並びください。'; },
      toastCooking: 'お席が空きました。カウンター3番へどうぞ。麺をゆではじめます。', toastServed: 'お待たせしました。熱いうちにどうぞ。',
      doneTitle: 'ごちそうさまでした', thanks: 'また夜中に、お待ちしています。丼はカウンターの上へどうぞ。',
      mTill: '現金で払う', mTillSub: '席でスタッフにお渡しください', tillBtn: '現金で払う（席で）',
      finish: 'ごちそうさま', couponBody: '次回、味玉ひとつサービス',
      kSeat: function () { return '行列からの事前注文'; }, kStart: '席へ案内する', kPaid: function (m) { return '支払い済み · ' + m; }, kTill: '現金（席で受け取る）'
    },
    en: {
      shop: 'Menya Hotaru', title: 'Menya Hotaru · Order ahead', sub: function () { return 'QR by the door · order in the queue'; },
      welcome: 'Order while you queue.', scanned: function () { return 'You scanned the QR code outside. No need to queue for the ticket machine.'; },
      notes: ['Pay now, and once you sit down there is nothing left to do but wait for your bowl.', 'Japanese menu: tap JA at the top.', 'Last orders 1:30'],
      consentFriend: 'Add Menya Hotaru as a LINE friend', consentFriendSub: 'We message you when your seat is free',
      notePh: 'e.g. no spring onion, a small bowl for a child', payWhen: 'You pay as you order. Paying cash? Hand it to the staff at your seat.',
      eta: 'The wait right now is about 10 minutes. We’ll message you in LINE when a seat is free.',
      allergy: 'Allergies: the noodles contain wheat; the broth contains seafood and soy. The vegetable ramen also contains wheat and soy.',
      st: ['Received (stay in the queue)', 'Your seat is ready', 'Your ramen is served'],
      toastSent: function (no) { return 'Order and payment received (' + no + '). Please stay in the queue.'; },
      toastCooking: 'Your seat is free: counter seat 3. Your noodles are going in now.', toastServed: 'Here’s your bowl. Eat it while it’s hot.',
      doneTitle: 'Gochisōsama!', thanks: 'See you again late one night. Please leave your bowl on the high counter.',
      mTill: 'Pay in cash', mTillSub: 'Hand it to the staff at your seat', tillBtn: 'Pay cash at my seat',
      finish: 'Thanks, all done', couponBody: 'A free seasoned egg next time',
      kSeat: function () { return 'Pre-order from the queue'; }, kStart: 'Seat the guest', kPaid: function (m) { return 'Paid · ' + m; }, kTill: 'Cash, collect at the seat'
    }
  }
};
