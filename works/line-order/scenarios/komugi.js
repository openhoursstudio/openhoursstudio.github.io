// こむぎ日和（神奈川・鎌倉 長谷のパン屋）：紙のポイントカードの代わりに、LINEの中の会員証。ポイント・クーポン・焼き上がりのお知らせ。
// 架空のお店。レジでの読み取りはデモ用に C.scanAfter ミリ秒で自動。
window.LS = {
  flow: 'member', hero: 'larkspur-8', join: 100, rate: 100, goal: 500, scanAfter: 3600, no: 'No. 0412 3307',
  auto: { bell: 'campagne', coupon: 'welcome' },
  photos: ['larkspur-8', 'larkspur-1', 'larkspur-3', 'larkspur-6', 'kuchen-1'],
  perkIcons: [
    '<svg viewBox="0 0 24 24"><path d="M4 9h16v11H4zM2.5 6h19v3h-19zM12 6v14M12 6c-1.5-3-5-3.5-5-1.2S9.5 6 12 6c2.5 0 5 .8 5-1.2S13.5 3 12 6"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 8h3.2a2.3 2.3 0 0 1 0 4.6H9.5V8zm0 4.6V16"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M5 11h14v9H5zM8 11V8.5M12 11V8.5M16 11V8.5M8 6.5c0-1 .8-1.5.8-2.5M12 6.5c0-1 .8-1.5.8-2.5M16 6.5c0-1 .8-1.5.8-2.5M5 15.5c2 1.3 4 1.3 7 0s5-1.3 7 0"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>'
  ],
  bakes: [
    { id: 'croissant', at: '7:30', img: 'larkspur-1', ja: ['クロワッサン'], en: ['Croissants'] },
    { id: 'campagne', at: '10:00', img: 'larkspur-3', ja: ['カンパーニュ'], en: ['Pain de campagne'] },
    { id: 'cinnamon', at: '11:30', img: 'larkspur-6', ja: ['シナモンロール'], en: ['Cinnamon rolls'] },
    { id: 'applepie', at: '14:00', img: 'kuchen-1', ja: ['りんごのパイ'], en: ['Apple pie'] }
  ],
  coupons: [
    { id: 'welcome', off: 320, ja: ['入会特典', 'クロワッサン1個 無料', '次のお買いもので使えます。', '1回かぎり · 入会から30日間有効'], en: ['Welcome gift', 'A free croissant', 'Use it on your next visit.', 'One use · valid for 30 days'] },
    { id: 'rain', off: 50, ja: ['雨の日クーポン', '全品から50円引き', '雨の日だけ、LINEに届きます。', '1回かぎり · 1,000円以上のお買いもので'], en: ['Rainy-day coupon', '¥50 off', 'Arrives in LINE on rainy days only.', 'One use · on purchases over ¥1,000'] }
  ],
  buy: [
    { ja: 'クロワッサン', en: 'Croissant', p: 320, q: 2 },
    { ja: 'カンパーニュ（ハーフ）', en: 'Pain de campagne (half)', p: 520, q: 1 },
    { ja: 'シナモンロール', en: 'Cinnamon roll', p: 380, q: 1 }
  ],
  t: {
    ja: {
      shop: 'こむぎ日和', kind: 'パン屋 · 鎌倉 長谷', title: 'こむぎ日和 会員証', sub: 'LINE会員証',
      welcome: '会員証は、LINEの中に。', scanned: 'レジ横のQRコードから友だち追加して、会員証を開きました。',
      perks: [['入会で100ポイント', 'いまなら、クロワッサン無料のクーポンつき'], ['100円で1ポイント', '500ポイントたまると、500円引き'], ['誕生月のプレゼント', 'お好きなパンをひとつ'], ['焼き上がりのお知らせ', '好きなパンだけ選んで、LINEでお知らせ']],
      bakesTitle: '今日の焼き上がり', bakeAt: function (at) { return at + 'ごろ焼き上がり'; },
      newsBody: ['秋の新作、りんごのパイが焼き上がる時間は14時ごろです。', '紙のポイントカードは、レジでLINE会員証に移せます。'],
      infoRows: [['営業時間', '7:30〜18:00（売り切れしだい終了）'], ['定休日', '月曜日'], ['お支払い', '現金・クレジットカード・交通系IC・PayPay'], ['場所', '神奈川・鎌倉 長谷（架空のお店です）']],
      notes: ['会員証は、LINEのトーク画面の下のメニューからいつでも開けます。'],
      start: '無料で会員になる', consentFriend: 'こむぎ日和を友だち追加', consentFriendSub: 'クーポンと焼き上がりのお知らせが届きます',
      rank: 'レギュラー', points: '保有ポイント',
      toGoal: function (n) { return 'あと<b>' + n + 'pt</b>で、500円引きのクーポンになります'; },
      couponsTitle: 'クーポン', useIt: '使う', noCoupons: 'いま使えるクーポンはありません。',
      useNow: 'レジでこのクーポンを使う', later: 'あとで使う',
      bellTitle: '焼き上がりのお知らせ', bellLead: 'オンにしたパンが焼き上がると、LINEでお知らせします。',
      bellLabel: function (n) { return n + 'の焼き上がりをお知らせ'; },
      bellOn: function (n, at) { return '毎日' + at + 'ごろ、' + n + 'の焼き上がりをお知らせします。'; },
      bellNow: function (n) { return n + 'が焼き上がりました。あたたかいうちにどうぞ。（お知らせのイメージ）'; },
      showCard: 'レジで会員証を見せる', backCard: '会員証',
      useTitle: 'レジでお見せください', useLead: 'バーコードを読み取ると、ポイントがたまります。',
      validFor: function (s) { return 'この画面の有効時間 あと ' + s; }, autoScan: 'デモでは、数秒でレジが読み取ります。',
      thanksTitle: 'ありがとうございました', gotLead: function (n) { return n + 'ポイントがたまりました。'; },
      total: 'お支払い', receiptNote: 'レシートはLINEにも届いています。', again: 'もう一度',
      toastJoin: function (n) { return 'ご入会ありがとうございます。' + n + 'ポイントとクーポンをお送りしました。'; },
      toastScan: function (g, p) { return 'ポイントがたまりました：+' + g + 'pt（合計 ' + p + 'pt）'; },
      posTitle: 'レジ 1', posSum: 'お会計', posScan: '会員証を読み取る',
      posWait: 'お客さまが会員証を出すと、ここで読み取れます。', posReady: '会員証が表示されています。',
      posCoupon: function (c) { return 'クーポン：' + c; }, posDone: function (g) { return '読み取り済み · +' + g + 'pt'; },
      posNote: 'POSレジやバーコードリーダーと連携すると、ポイントもクーポンも自動で反映されます。紙のカードやスタンプは要りません。'
    },
    en: {
      shop: 'Komugi Biyori', kind: 'Bakery · Hase, Kamakura', title: 'Komugi Biyori · Member card', sub: 'LINE member card',
      welcome: 'Your loyalty card lives in LINE.', scanned: 'You added us from the QR code by the till and opened the member card.',
      perks: [['100 points for joining', 'Plus a coupon for a free croissant'], ['1 point per ¥100', '500 points become ¥500 off'], ['A birthday treat', 'Any bread you like, in your birthday month'], ['Fresh-from-the-oven alerts', 'Pick your favourites and we message you']],
      bakesTitle: 'Out of the oven today', bakeAt: function (at) { return 'ready around ' + at; },
      newsBody: ['Our new autumn apple pie comes out of the oven around 14:00.', 'Bring your paper card and we’ll move your points to LINE.'],
      infoRows: [['Hours', '7:30–18:00, or until sold out'], ['Closed', 'Mondays'], ['Payment', 'Cash, cards, transit IC, PayPay'], ['Where', 'Hase, Kamakura (a fictional bakery)']],
      notes: ['Open the card any time from the menu under the chat.'],
      start: 'Join for free', consentFriend: 'Add Komugi Biyori as a LINE friend', consentFriendSub: 'Get coupons and fresh-bread alerts',
      rank: 'Regular', points: 'Points',
      toGoal: function (n) { return '<b>' + n + ' pt</b> more for a ¥500 coupon'; },
      couponsTitle: 'Coupons', useIt: 'Use', noCoupons: 'No coupons right now.',
      useNow: 'Use this coupon at the till', later: 'Later',
      bellTitle: 'Fresh-bread alerts', bellLead: 'Switch one on and we message you when it comes out of the oven.',
      bellLabel: function (n) { return 'Fresh-bread alert for ' + n; },
      bellOn: function (n, at) { return 'Alert on: ' + n + '. We’ll message you around ' + at + ' each day it comes out of the oven.'; },
      bellNow: function (n) { return n + ', fresh out of the oven. Come by while it’s warm. (sample alert)'; },
      showCard: 'Show my card at the till', backCard: 'Member card',
      useTitle: 'Show this at the till', useLead: 'We scan the barcode and your points are added.',
      validFor: function (s) { return 'This screen is valid for ' + s; }, autoScan: 'In this demo, the till scans it after a few seconds.',
      thanksTitle: 'Thank you', gotLead: function (n) { return 'You earned ' + n + ' points.'; },
      total: 'Paid', receiptNote: 'Your receipt is in LINE too.', again: 'Start over',
      toastJoin: function (n) { return 'Welcome! We’ve sent you ' + n + ' points and a coupon.'; },
      toastScan: function (g, p) { return 'Points added: +' + g + ' pt (' + p + ' pt in total)'; },
      posTitle: 'Till 1', posSum: 'This sale', posScan: 'Scan member card',
      posWait: 'When the customer shows their card, scan it here.', posReady: 'The member card is on screen.',
      posCoupon: function (c) { return 'Coupon: ' + c; }, posDone: function (g) { return 'Scanned · +' + g + ' pt'; },
      posNote: 'Connected to the till and barcode reader, points and coupons update by themselves. No paper cards or stamps.'
    }
  }
};
