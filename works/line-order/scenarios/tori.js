// 鳥と炭（下北沢の焼き鳥）：カウンターの席から、少しずつ頼んで最後にお会計。
window.LO = {
  flow: 'later', seats: 11, seat: 7, seq: 426, prefix: '#', guests: true,
  picks: ['om7', 'tsukune', 'kawa', 'junmai'], rank: ['negi', 'tsukune', 'kawa'], calls: true,
  hero: { src: 'torisumi-1.webp', srcset: 'torisumi-1-m.webp 960w, torisumi-1.webp 1920w' },
  otoshi: { p: 330, img: 'lo-otoshi' },
  cats: [{ id: 'picks', ja: 'おすすめ', en: 'Picks' }, { id: 'shio', ja: '塩の串', en: 'Salt skewers' }, { id: 'tare', ja: 'タレの串', en: 'Tare skewers' }, { id: 'ippin', ja: '一品・〆', en: 'Sides & rice' }, { id: 'drink', ja: 'ドリンク', en: 'Drinks' }],
  menu: [
    { id: 'om7', cat: 'picks', pair: ['beer', 'tsuke'], p: 2400, img: 'torisumi-5', ja: ['おまかせ七本', 'その日いちばんの部位を七本。初めての方に。'], en: ['Chef’s seven skewers', 'The seven best cuts of the day. Good for a first visit.'] },
    { id: 'om10', cat: 'picks', p: 3300, img: 'lo-yakitori-platter', ja: ['おまかせ十本', '十本に、季節の野菜を一本。'], en: ['Chef’s ten skewers', 'Ten skewers and one seasonal vegetable.'] },
    { id: 'negi', cat: 'picks', pair: ['beer', 'high'], p: 280, img: 'torisumi-6', tag: ['定番', 'Classic'], ja: ['ねぎま', 'もも肉と東京ねぎ。最初の一本に。'], en: ['Negima', 'Thigh and Tokyo leek. The one to start with.'] },
    { id: 'sasami', cat: 'shio', p: 280, img: 'lo-sasami', ja: ['ささみ わさび', '胸の奥のやわらかい部分に、わさびをのせて。'], en: ['Sasami with wasabi', 'The tender strip under the breast, topped with wasabi.'] },
    { id: 'seseri', cat: 'shio', p: 320, img: 'torisumi-10', ja: ['せせり', 'よく動く首の肉。塩だけで。'], en: ['Seseri (neck)', 'The busiest muscle on the bird. Salt only.'] },
    { id: 'hatsu', cat: 'shio', p: 260, img: 'torisumi-4', ja: ['ハツ', '一羽にひとつ。さっと焼いて。'], en: ['Hatsu (heart)', 'One per bird, grilled quickly.'] },
    { id: 'bonjiri', cat: 'shio', soldout: true, p: 300, img: 'lo-bonjiri', ja: ['ぼんじり', 'いちばん脂ののった部位。'], en: ['Bonjiri (tail)', 'The fattiest, richest cut.'] },
    { id: 'tebasaki', cat: 'shio', p: 340, img: 'lo-tebasaki', ja: ['手羽先', '皮はパリッと、中はふっくら。'], en: ['Tebasaki (wing)', 'Crisp skin, soft inside.'] },
    { id: 'shiitake', cat: 'shio', p: 260, img: 'torisumi-9', ja: ['しいたけ', '群馬の肉厚しいたけ。かさに醤油を一滴。'], en: ['Shiitake', 'Fat shiitake from Gunma, a drop of soy in the cap.'] },
    { id: 'kawa', cat: 'tare', pair: ['high'], p: 240, img: 'torisumi-7', ja: ['かわ', 'きつく巻いて三度焼き。パリッと音がするまで。'], en: ['Kawa (skin)', 'Wound tight, grilled three times until it crackles.'] },
    { id: 'liver', cat: 'tare', pair: ['junmai'], p: 280, img: 'lo-liver', ja: ['レバー', '中はとろり。苦手な方にもぜひ。'], en: ['Liver', 'Creamy inside. Try it even if you think you don’t like liver.'] },
    { id: 'tsukune', cat: 'tare', pair: ['junmai', 'soup'], p: 380, img: 'torisumi-11', opts: [{ def: 0, ja: ['卵黄', ['卵黄あり', '卵黄なし']], en: ['Egg yolk', ['With yolk', 'No yolk']] }], ja: ['つくね', '軟骨入りでコリッと。卵黄につけてどうぞ。'], en: ['Tsukune', 'With cartilage for crunch, and a raw yolk to dip.'] },
    { id: 'yakiton', cat: 'tare', p: 300, img: 'torisumi-8', ja: ['やきとん', '一本だけの豚串。北海道流にからしで。'], en: ['Pork & onion', 'Our one pork skewer, Hokkaido style, with mustard.'] },
    { id: 'uzura', cat: 'tare', p: 220, img: 'lo-uzura', ja: ['うずら', '三つ、タレをからめて。'], en: ['Quail eggs', 'Three, glazed in tare.'] },
    { id: 'tsuke', cat: 'ippin', p: 550, img: 'torisumi-15', ja: ['漬物盛り合わせ', 'ぬか漬けと浅漬け。'], en: ['Pickle plate', 'Rice-bran and quick pickles.'] },
    { id: 'soup', cat: 'ippin', p: 400, img: 'lo-chicken-soup', ja: ['鶏スープ', '骨から八時間。〆の前に。'], en: ['Chicken broth', 'Eight hours from the bones.'] },
    { id: 'soboro', cat: 'ippin', p: 680, img: 'lo-soboro', ja: ['鶏そぼろご飯', '〆にどうぞ。'], en: ['Chicken soboro rice', 'To finish.'] },
    { id: 'beer', cat: 'drink', p: 600, img: 'torisumi-14', tag: ['まずは', 'First round'], ja: ['生ビール（中）', '最初の一本には、やっぱり。'], en: ['Draught beer (medium)', 'For the first skewer, always.'] },
    { id: 'high', cat: 'drink', p: 600, img: 'lo-highball', opts: [{ def: 0, add: [0, 100], ja: ['濃さ', ['ふつう', '濃いめ']], en: ['Strength', ['Regular', 'Strong']] }], ja: ['ハイボール', '炭酸強めで、すっきりと。'], en: ['Highball', 'Extra fizzy and clean.'] },
    { id: 'junmai', cat: 'drink', p: 600, img: 'torisumi-13', opts: [{ def: 0, ja: ['温度', ['冷や', 'お燗']], en: ['Serve', ['Cold', 'Warm']] }], ja: ['鳥と炭 純米（一杯）', '近くの蔵とつくった店の酒。迷ったらこれ。'], en: ['Tori to Sumi junmai (glass)', 'Our house sake, made with a nearby brewery.'] },
    { id: 'hakuto', cat: 'drink', p: 850, img: 'lo-sake-masu', ja: ['白桃（一杯）', '岡山の酒。桃のような華やかな香り。'], en: ['Hakuto (glass)', 'Fragrant sake from Okayama with a hint of peach.'] },
    { id: 'oolong', cat: 'drink', p: 400, img: 'lo-oolong', ja: ['ウーロン茶', ''], en: ['Oolong tea', ''] }
  ],
  t: {
    ja: {
      kind: '焼き鳥 · 下北沢', newsBody: ['10月の日本酒「ひやおろし」が入りました。', 'ぼんじりは一羽に一つの部位のため、今夜の分は終わりました。'], infoRows: [['営業時間', '17:00〜24:00（月曜定休）'], ['お席', 'カウンター11席'], ['お支払い', 'PayPay・クレジットカード・交通系IC・現金'], ['場所', '東京・下北沢（架空のお店です）'], ['メニュー', '日本語・English']], calls: ['お水', '取り皿', 'おしぼり', 'お箸', 'お会計について', 'そのほか'],
      shop: '鳥と炭', title: '鳥と炭 モバイルオーダー', sub: function (s) { return 'カウンター ' + s + '番'; },
      welcome: '鳥と炭へ、ようこそ。', scanned: function (s) { return 'カウンター ' + s + '番 のQRコードを読み取りました。'; },
      notes: ['お一人さまにお通し（キャベツと鶏みそ・¥330）をお出しします。', 'ラストオーダー 23:30'],
      consentFriend: '鳥と炭の公式アカウントを友だち追加',
      otoshi: 'お通し', kOtoshi: 'お通し', notePh: '例：ねぎ抜きで、取り皿を二枚',
      payWhen: 'お会計はお帰りの際に、このアプリかレジでどうぞ。', eta: '焼き上がりまで、およそ12分です。',
      allergy: 'アレルギー：タレには大豆と小麦が入っています。そのほかはスタッフにお尋ねください。',
      st: ['受付済み', '焼いています', 'お席へお持ちしました'],
      toastSent: function (no) { return 'ご注文を受け付けました（' + no + '）。焼き上がりまで少々お待ちください。'; },
      toastCooking: '焼きはじめました。もうしばらくお待ちください。', toastServed: 'お料理をお席へお持ちしました。ごゆっくりどうぞ。',
      couponBody: '鶏スープ一杯サービス', kSeat: function (s) { return 'カウンター ' + s + '番'; }, kStart: '焼きはじめる', kPaid: function (m) { return 'お会計済み · ' + m; }
    },
    en: {
      kind: 'Yakitori · Shimokitazawa', newsBody: ['Our autumn sake, hiyaoroshi, has just arrived.', 'Bonjiri is one cut per bird, and tonight’s are gone.'], infoRows: [['Hours', '17:00–24:00, closed Mondays'], ['Seats', '11 at the counter'], ['Payment', 'PayPay, cards, transit IC, cash'], ['Where', 'Shimokitazawa, Tokyo (a fictional shop)'], ['Menu', 'Japanese and English']], calls: ['Water', 'Extra plates', 'Hand towels', 'Chopsticks', 'About the bill', 'Something else'],
      shop: 'Tori to Sumi', title: 'Tori to Sumi · Order', sub: function (s) { return 'Counter seat ' + s; },
      welcome: 'Welcome to Tori to Sumi.', scanned: function (s) { return 'You scanned the QR code at counter seat ' + s + '.'; },
      notes: ['Each guest gets a small starter (cabbage with chicken miso, ¥330).', 'Last orders 23:30'],
      consentFriend: 'Add Tori to Sumi as a LINE friend',
      otoshi: 'Starter (otoshi)', kOtoshi: 'Starter (otoshi)', notePh: 'e.g. no spring onion, two extra plates',
      payWhen: 'Pay when you leave, in this app or at the till.', eta: 'About 12 minutes on the grill.',
      allergy: 'Allergies: our tare contains soy and wheat. Ask the staff about anything else.',
      st: ['Received', 'On the grill', 'Brought to your seat'],
      toastSent: function (no) { return 'Order received (' + no + '). Your skewers are on their way to the grill.'; },
      toastCooking: 'Your order is on the grill now.', toastServed: 'Your food is at your seat. Enjoy!',
      couponBody: 'A free bowl of chicken broth', kSeat: function (s) { return 'Counter seat ' + s; }, kStart: 'Start grilling', kPaid: function (m) { return 'Paid · ' + m; }
    }
  }
};
