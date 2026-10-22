// デモ「観光のお客さま向け多言語メニュー」のエンジン。お店の設定とメニューは scenarios/yunagi.js が window.LT に入れる。
// LINEミニアプリのデモ（app.js）と同じ画面の作りだが、LINEの許可画面はなく、ブラウザで開く。お客さまの言語は5つ（ja・en・zh・tw・ko）から
// アプリの中で選び、ページの JA/EN とは別に持つ。厨房の画面はページの言語（ふだんは日本語）で、料理名はかならず日本語で出す。
// 食べられないもの（アレルギー・ベジタリアン・豚肉・アルコール）を選ぶと、当てはまる料理に印がつき、厨房の伝票にも書かれる。決済も通信もしない見本。
(function () {
  'use strict';
  var C = window.LT;
  var root = document.documentElement;
  var app = document.querySelector('[data-app]');
  var screens = app.querySelector('[data-screens]');
  var sheetWrap = app.querySelector('[data-sheet]'), sheetBody = app.querySelector('[data-sheet-body]');
  var toastEl = app.querySelector('[data-toast]');
  var kitchen = document.querySelector('[data-kitchen]');
  var ticketsEl = document.querySelector('[data-tickets]'), kEmpty = document.querySelector('[data-k-empty]'), kTotal = document.querySelector('[data-k-total]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var P = '../../assets/photos/';
  var LANGS = [['ja', '日本語', 'ja'], ['en', 'English', 'en'], ['zh', '简体中文', 'zh-Hans'], ['tw', '繁體中文', 'zh-Hant'], ['ko', '한국어', 'ko']];
  var table = (function () { var s = Number(new URLSearchParams(location.search).get('table')); return s >= 1 && s <= C.tables ? s : C.table; })();

  // ── お客さま側の文言（5言語） ──
  var T = {
    ja: {
      shop: '居酒屋 ゆうなぎ', kind: '浅草の居酒屋', table: function (n) { return n + '番テーブル'; },
      detected: 'お使いのスマホの言語から選んでいます。', langNote: 'あとからいつでも変えられます。', change: '言語', edit: '変更', filt: '選んだもの：',
      welcome: 'ようこそ、ゆうなぎへ', noApp: 'アプリもLINEもいりません。このままブラウザで注文できます。',
      guestsQ: '何名さまですか？', dietQ: '食べられないものはありますか？', dietLead: '選んだものは、メニューに印がつき、厨房にも伝わります。',
      allergyH: 'アレルギー', dietH: 'お食事の制限', none: 'とくになし',
      notes: ['お通し（小さな前菜）が、お一人さま ¥400 つきます。日本の居酒屋のならわしです。', 'チップは必要ありません。表示はすべて税込です。'],
      start: 'メニューを見る', picks: 'おすすめ', restart: 'デモを最初から',
      contains: '含まれています：', avoid: function (x) { return '食べられないもの：' + x; }, tip: '食べ方', jaName: '日本語',
      addFor: function (p) { return '注文に入れる  ' + p; }, qty: '数量', taxin: '税込',
      cartBar: function (n, p) { return '注文を確認する（' + n + '点）' + p; }, cartTitle: 'ご注文の確認', backMenu: 'メニューに戻る', empty: 'まだ何も入っていません。',
      otoshi: 'お通し', otoshiSub: '最初のご注文に、人数分つきます。', subtotal: '合計', taxNote: function (t) { return '税込（うち消費税 ' + t + '）'; },
      toKitchen: '厨房への伝言（日本語で届きます）', send: 'この内容で注文する',
      sentTitle: 'ご注文を受け付けました', orderNo: '注文番号', jaTicket: '厨房には、日本語でこう届いています', st: ['受付', '調理中', 'お届け'],
      more: '追加で注文する', toBill: 'お会計へ', history: 'これまでのご注文', seeKitchen: 'お店側の画面を見る（デモ）',
      billTitle: 'お会計', noTip: 'チップは不要です。', split: '割り勘で表示', perPerson: function (n) { return n + '名で割ると、お一人さま'; },
      method: 'お支払い方法', mCard: 'クレジットカード', mCardSub: 'Visa・Mastercard・AMEX・JCB・銀聯', mWallet: 'Apple Pay・Google Pay', mQr: 'Alipay+・WeChat Pay', mTill: 'レジで支払う', mTillSub: '現金など',
      payBtn: function (p) { return p + ' を支払う'; }, tillBtn: 'レジで支払う', demoPay: 'デモのため、実際の支払いは発生しません。',
      paying: 'お支払いの処理中です…', paidTitle: 'お支払いが完了しました', tillTitle: 'レジでお会計をお願いします', tillLead: 'お帰りの際に、この画面をお見せください。',
      thanks: 'ありがとうございました。', review: 'よろしければ、Googleマップにご感想を', reviewBtn: 'レビューを書く（デモ）',
      call: 'スタッフに伝える', callTitle: 'スタッフに伝える', callLead: '押すと、スタッフの端末に日本語で届きます。この画面を見せてもかまいません。',
      callSent: 'スタッフに伝えました。少々お待ちください。',
      toastSent: function (n) { return 'ご注文 ' + n + ' を厨房に送りました。'; }, toastCooking: 'お料理を作りはじめました。', toastServed: 'お料理をお持ちしました。',
      toastPaid: function (p) { return 'お支払いありがとうございました（' + p + '）。'; },
      allergyNote: 'アレルギー表示は目安です。同じ厨房ですべての食材を扱っているため、重いアレルギーの方はスタッフにお知らせください。', credits: '写真クレジット', close: '閉じる', cancel: 'キャンセル'
    },
    en: {
      shop: 'Izakaya Yunagi', kind: 'Izakaya · Asakusa, Tokyo', table: function (n) { return 'Table ' + n; },
      detected: 'Picked from your phone’s language.', langNote: 'You can change it at any time.', change: 'Language', edit: 'Change', filt: 'Your filters: ',
      welcome: 'Welcome to Yunagi', noApp: 'No app, no LINE, no sign-up. Order right here in your browser.',
      guestsQ: 'How many of you?', dietQ: 'Anything you can’t eat?', dietLead: 'We’ll mark those dishes on the menu and tell the kitchen.',
      allergyH: 'Allergies', dietH: 'Diet', none: 'Nothing',
      notes: ['There is a ¥400 per person otoshi, a small starter every guest receives. It’s a normal izakaya custom.', 'No tipping in Japan. All prices include tax.'],
      start: 'See the menu', picks: 'Our picks', restart: 'Restart the demo',
      contains: 'Contains: ', avoid: function (x) { return 'You avoid: ' + x; }, tip: 'How to eat it', jaName: 'In Japanese',
      addFor: function (p) { return 'Add to order  ' + p; }, qty: 'Quantity', taxin: 'incl. tax',
      cartBar: function (n, p) { return 'Review order (' + n + ') ' + p; }, cartTitle: 'Your order', backMenu: 'Back to menu', empty: 'Nothing here yet.',
      otoshi: 'Otoshi (small starter)', otoshiSub: 'One per guest, with your first order.', subtotal: 'Total', taxNote: function (t) { return 'Includes consumption tax ' + t; },
      toKitchen: 'What the kitchen will see (in Japanese)', send: 'Send order',
      sentTitle: 'Order received', orderNo: 'Order no.', jaTicket: 'The kitchen got this, in Japanese', st: ['Received', 'Cooking', 'Served'],
      more: 'Order more', toBill: 'Go to the bill', history: 'Your orders so far', seeKitchen: 'See the shop’s screen (demo)',
      billTitle: 'Bill', noTip: 'No tip needed.', split: 'Split the bill', perPerson: function (n) { return 'Split ' + n + ' ways, each pays'; },
      method: 'Payment method', mCard: 'Credit card', mCardSub: 'Visa, Mastercard, AMEX, JCB, UnionPay', mWallet: 'Apple Pay / Google Pay', mQr: 'Alipay+ / WeChat Pay', mTill: 'Pay at the till', mTillSub: 'Cash and more',
      payBtn: function (p) { return 'Pay ' + p; }, tillBtn: 'I’ll pay at the till', demoPay: 'This is a demo. No real payment is made.',
      paying: 'Processing your payment…', paidTitle: 'Payment complete', tillTitle: 'Please pay at the till', tillLead: 'Show this screen at the till on your way out.',
      thanks: 'Thank you. Arigatou gozaimashita!', review: 'Enjoyed it? Tell others on Google Maps', reviewBtn: 'Write a review (demo)',
      call: 'Ask staff', callTitle: 'Ask a member of staff', callLead: 'Tap one and it reaches the staff in Japanese. You can also just show them this screen.',
      callSent: 'We’ve told the staff. Someone will be right with you.',
      toastSent: function (n) { return 'Order ' + n + ' has gone to the kitchen.'; }, toastCooking: 'The kitchen has started cooking.', toastServed: 'Your food is on its way to the table.',
      toastPaid: function (p) { return 'Thank you for your payment (' + p + ').'; },
      allergyNote: 'Allergy labels are a guide. One kitchen handles every ingredient, so please tell staff about a serious allergy.', credits: 'Photo credits', close: 'Close', cancel: 'Cancel'
    },
    zh: {
      shop: '居酒屋 Yunagi', kind: '东京浅草的居酒屋', table: function (n) { return n + '号桌'; },
      detected: '已根据您手机的语言选择。', langNote: '随时可以更改。', change: '语言', edit: '更改', filt: '已选：',
      welcome: '欢迎光临 Yunagi', noApp: '无需下载应用，也不用LINE，直接在浏览器中点餐。',
      guestsQ: '请问几位？', dietQ: '有不能吃的东西吗？', dietLead: '选择后，菜单上会标注相关菜品，并告知厨房。',
      allergyH: '过敏', dietH: '饮食限制', none: '没有',
      notes: ['每位客人收取 ¥400 的“お通し”（开胃小菜），这是日本居酒屋的惯例。', '日本没有小费文化。所有价格均已含税。'],
      start: '查看菜单', picks: '推荐', restart: '重新开始演示',
      contains: '含有：', avoid: function (x) { return '您不吃：' + x; }, tip: '吃法', jaName: '日文',
      addFor: function (p) { return '加入订单  ' + p; }, qty: '数量', taxin: '含税',
      cartBar: function (n, p) { return '确认订单（' + n + '件）' + p; }, cartTitle: '确认订单', backMenu: '返回菜单', empty: '还没有选择菜品。',
      otoshi: 'お通し（开胃小菜）', otoshiSub: '首次点餐时按人数提供。', subtotal: '合计', taxNote: function (t) { return '含消费税 ' + t; },
      toKitchen: '厨房将看到的内容（日文）', send: '确认下单',
      sentTitle: '已收到您的订单', orderNo: '订单号', jaTicket: '厨房收到的日文订单', st: ['已接单', '制作中', '已上菜'],
      more: '继续点餐', toBill: '去结账', history: '已点菜品', seeKitchen: '查看店家画面（演示）',
      billTitle: '结账', noTip: '无需小费。', split: 'AA 平分', perPerson: function (n) { return n + '人平分，每人'; },
      method: '支付方式', mCard: '信用卡', mCardSub: 'Visa · Mastercard · AMEX · JCB · 银联', mWallet: 'Apple Pay · Google Pay', mQr: 'Alipay+ · 微信支付', mTill: '在收银台付款', mTillSub: '现金等',
      payBtn: function (p) { return '支付 ' + p; }, tillBtn: '在收银台付款', demoPay: '这是演示，不会实际扣款。',
      paying: '正在处理付款…', paidTitle: '付款完成', tillTitle: '请到收银台结账', tillLead: '离店时请出示此画面。',
      thanks: '谢谢光临！ありがとうございました。', review: '满意的话，请在谷歌地图上留下评价', reviewBtn: '写评价（演示）',
      call: '呼叫店员', callTitle: '告诉店员', callLead: '点击后，店员的设备会收到日文消息。也可以直接把这个画面给店员看。',
      callSent: '已通知店员，请稍候。',
      toastSent: function (n) { return '订单 ' + n + ' 已发送到厨房。'; }, toastCooking: '厨房已开始制作。', toastServed: '菜品已送到您的桌上。',
      toastPaid: function (p) { return '感谢您的付款（' + p + '）。'; },
      allergyNote: '过敏标示仅供参考。所有食材在同一厨房处理，如有严重过敏，请告知店员。', credits: '图片来源', close: '关闭', cancel: '取消'
    },
    tw: {
      shop: '居酒屋 Yunagi', kind: '東京淺草的居酒屋', table: function (n) { return n + '號桌'; },
      detected: '已依您手機的語言選擇。', langNote: '隨時都可以更改。', change: '語言', edit: '更改', filt: '已選：',
      welcome: '歡迎光臨 Yunagi', noApp: '不用下載App，也不用LINE，直接在瀏覽器點餐。',
      guestsQ: '請問幾位？', dietQ: '有不能吃的東西嗎？', dietLead: '選擇後，菜單上會標示相關餐點，也會告知廚房。',
      allergyH: '過敏', dietH: '飲食限制', none: '沒有',
      notes: ['每位客人收取 ¥400 的「お通し」（開胃小菜），這是日本居酒屋的習慣。', '日本不用給小費。所有價格皆已含稅。'],
      start: '查看菜單', picks: '推薦', restart: '重新開始示範',
      contains: '含有：', avoid: function (x) { return '您不吃：' + x; }, tip: '吃法', jaName: '日文',
      addFor: function (p) { return '加入訂單  ' + p; }, qty: '數量', taxin: '含稅',
      cartBar: function (n, p) { return '確認訂單（' + n + '項）' + p; }, cartTitle: '確認訂單', backMenu: '回到菜單', empty: '還沒有選擇餐點。',
      otoshi: 'お通し（開胃小菜）', otoshiSub: '第一次點餐時依人數提供。', subtotal: '合計', taxNote: function (t) { return '含消費稅 ' + t; },
      toKitchen: '廚房會看到的內容（日文）', send: '確認點餐',
      sentTitle: '已收到您的訂單', orderNo: '訂單編號', jaTicket: '廚房收到的日文訂單', st: ['已接單', '製作中', '已上菜'],
      more: '繼續點餐', toBill: '去結帳', history: '已點的餐點', seeKitchen: '查看店家畫面（示範）',
      billTitle: '結帳', noTip: '不需要小費。', split: '平均分攤', perPerson: function (n) { return n + '人平分，每人'; },
      method: '付款方式', mCard: '信用卡', mCardSub: 'Visa · Mastercard · AMEX · JCB · 銀聯', mWallet: 'Apple Pay · Google Pay', mQr: 'Alipay+ · 微信支付', mTill: '在櫃台付款', mTillSub: '現金等',
      payBtn: function (p) { return '支付 ' + p; }, tillBtn: '在櫃台付款', demoPay: '這是示範，不會實際扣款。',
      paying: '正在處理付款…', paidTitle: '付款完成', tillTitle: '請到櫃台結帳', tillLead: '離開時請出示這個畫面。',
      thanks: '謝謝光臨！ありがとうございました。', review: '喜歡的話，請在 Google 地圖留下評論', reviewBtn: '寫評論（示範）',
      call: '呼叫店員', callTitle: '告訴店員', callLead: '點選後，店員的裝置會收到日文訊息。也可以直接把這個畫面給店員看。',
      callSent: '已通知店員，請稍候。',
      toastSent: function (n) { return '訂單 ' + n + ' 已送到廚房。'; }, toastCooking: '廚房已開始製作。', toastServed: '餐點已送到您的桌上。',
      toastPaid: function (p) { return '感謝您的付款（' + p + '）。'; },
      allergyNote: '過敏標示僅供參考。所有食材在同一個廚房處理，如有嚴重過敏，請告知店員。', credits: '照片來源', close: '關閉', cancel: '取消'
    },
    ko: {
      shop: '이자카야 유나기', kind: '도쿄 아사쿠사의 이자카야', table: function (n) { return n + '번 테이블'; },
      detected: '휴대폰 언어에 맞춰 선택했습니다.', langNote: '언제든지 바꿀 수 있습니다.', change: '언어', edit: '변경', filt: '선택: ',
      welcome: '유나기에 오신 것을 환영합니다', noApp: '앱도 LINE도 필요 없습니다. 브라우저에서 바로 주문하세요.',
      guestsQ: '몇 분이세요?', dietQ: '못 드시는 음식이 있나요?', dietLead: '선택하신 항목은 메뉴에 표시되고 주방에도 전달됩니다.',
      allergyH: '알레르기', dietH: '식사 제한', none: '없음',
      notes: ['1인당 ¥400의 오토오시(작은 기본 안주)가 나옵니다. 일본 이자카야의 관습입니다.', '일본에는 팁 문화가 없습니다. 모든 가격은 세금 포함입니다.'],
      start: '메뉴 보기', picks: '추천 메뉴', restart: '데모 처음부터',
      contains: '포함: ', avoid: function (x) { return '못 드시는 것: ' + x; }, tip: '먹는 법', jaName: '일본어',
      addFor: function (p) { return '주문에 담기  ' + p; }, qty: '수량', taxin: '세금 포함',
      cartBar: function (n, p) { return '주문 확인(' + n + '개) ' + p; }, cartTitle: '주문 확인', backMenu: '메뉴로 돌아가기', empty: '아직 담은 메뉴가 없습니다.',
      otoshi: '오토오시(기본 안주)', otoshiSub: '첫 주문 때 인원수만큼 나옵니다.', subtotal: '합계', taxNote: function (t) { return '소비세 ' + t + ' 포함'; },
      toKitchen: '주방에 전달되는 내용(일본어)', send: '이대로 주문하기',
      sentTitle: '주문이 접수되었습니다', orderNo: '주문 번호', jaTicket: '주방에는 일본어로 이렇게 전달됩니다', st: ['접수', '조리 중', '서빙 완료'],
      more: '추가 주문', toBill: '계산하기', history: '지금까지의 주문', seeKitchen: '가게 화면 보기(데모)',
      billTitle: '계산', noTip: '팁은 필요 없습니다.', split: '나눠서 계산', perPerson: function (n) { return n + '명이 나누면 1인당'; },
      method: '결제 방법', mCard: '신용카드', mCardSub: 'Visa · Mastercard · AMEX · JCB · 은련', mWallet: 'Apple Pay · Google Pay', mQr: 'Alipay+ · WeChat Pay', mTill: '카운터에서 결제', mTillSub: '현금 등',
      payBtn: function (p) { return p + ' 결제하기'; }, tillBtn: '카운터에서 결제', demoPay: '데모이므로 실제 결제는 이루어지지 않습니다.',
      paying: '결제를 처리하고 있습니다…', paidTitle: '결제가 완료되었습니다', tillTitle: '카운터에서 계산해 주세요', tillLead: '나가실 때 이 화면을 보여 주세요.',
      thanks: '감사합니다! ありがとうございました。', review: '마음에 드셨다면 구글 지도에 후기를 남겨 주세요', reviewBtn: '후기 쓰기(데모)',
      call: '직원에게 전하기', callTitle: '직원에게 전하기', callLead: '누르면 직원 단말기에 일본어로 전달됩니다. 이 화면을 직원에게 보여 주셔도 됩니다.',
      callSent: '직원에게 전달했습니다. 잠시만 기다려 주세요.',
      toastSent: function (n) { return '주문 ' + n + '을(를) 주방에 보냈습니다.'; }, toastCooking: '조리를 시작했습니다.', toastServed: '음식이 테이블로 나갑니다.',
      toastPaid: function (p) { return '결제해 주셔서 감사합니다(' + p + ').'; },
      allergyNote: '알레르기 표시는 참고용입니다. 같은 주방에서 모든 재료를 다루므로, 심한 알레르기가 있으면 직원에게 알려 주세요.', credits: '사진 출처', close: '닫기', cancel: '취소'
    }
  };
  // アレルゲンと食事の制限の名前（伝票では日本語を使う）
  var AL = {
    egg: { ja: '卵', en: 'Egg', zh: '鸡蛋', tw: '雞蛋', ko: '달걀' }, milk: { ja: '乳', en: 'Milk', zh: '乳制品', tw: '乳製品', ko: '우유' },
    wheat: { ja: '小麦', en: 'Wheat', zh: '小麦', tw: '小麥', ko: '밀' }, soba: { ja: 'そば', en: 'Buckwheat', zh: '荞麦', tw: '蕎麥', ko: '메밀' },
    peanut: { ja: '落花生', en: 'Peanut', zh: '花生', tw: '花生', ko: '땅콩' }, shrimp: { ja: 'えび', en: 'Shrimp', zh: '虾', tw: '蝦', ko: '새우' },
    crab: { ja: 'かに', en: 'Crab', zh: '蟹', tw: '蟹', ko: '게' }, walnut: { ja: 'くるみ', en: 'Walnut', zh: '核桃', tw: '核桃', ko: '호두' },
    soy: { ja: '大豆', en: 'Soy', zh: '大豆', tw: '大豆', ko: '대두' }, sesame: { ja: 'ごま', en: 'Sesame', zh: '芝麻', tw: '芝麻', ko: '참깨' },
    fish: { ja: '魚', en: 'Fish', zh: '鱼', tw: '魚', ko: '생선' }
  };
  var DIET = {
    veg: { ja: 'ベジタリアン', en: 'Vegetarian', zh: '素食', tw: '素食', ko: '채식' },
    pork: { ja: '豚肉なし', en: 'No pork', zh: '不吃猪肉', tw: '不吃豬肉', ko: '돼지고기 제외' },
    alc: { ja: 'アルコールなし', en: 'No alcohol', zh: '不含酒精', tw: '不含酒精', ko: '알코올 제외' }
  };
  // 料理に当てはまる理由の言い方
  var WHY = {
    veg: { ja: '肉・魚', en: 'meat or fish', zh: '肉类或鱼类', tw: '肉類或魚類', ko: '고기·생선' },
    pork: { ja: '豚肉', en: 'pork', zh: '猪肉', tw: '豬肉', ko: '돼지고기' },
    alc: { ja: 'アルコール（調理用を含む）', en: 'alcohol (incl. cooking sake or mirin)', zh: '酒精（含料理酒、味醂）', tw: '酒精（含料理酒、味醂）', ko: '알코올(요리용 술·미림 포함)' }
  };
  // スタッフへの伝言：お客さまの言葉と、スタッフの端末に届く日本語
  var CALLS = [
    { ja: 'お水をください', en: 'Some water, please', zh: '请给我水', tw: '請給我水', ko: '물 좀 주세요' },
    { ja: '取り皿をください', en: 'Small plates to share, please', zh: '请给我小碟子', tw: '請給我小盤子', ko: '앞접시 주세요' },
    { ja: 'おすすめを教えてください', en: 'What do you recommend?', zh: '有什么推荐的吗？', tw: '有什麼推薦的嗎？', ko: '추천 메뉴를 알려 주세요' },
    { ja: 'お会計をお願いします', en: 'The bill, please', zh: '请结账', tw: '請結帳', ko: '계산해 주세요' }
  ];
  // 厨房の画面（ページの言語：ja か en）
  var K = {
    ja: { seat: function (n) { return n + '番'; }, guests: function (n) { return n + '名'; }, lang: function (l) { return { ja: '日本語', en: '英語', zh: '中国語（簡体字）', tw: '中国語（繁体字）', ko: '韓国語' }[l] + 'のお客さま'; },
      avoid: '除去・注意：', otoshi: 'お通し', start: '作りはじめる', serve: '提供済みにする', done: '提供済み', call: '呼び出し', callDone: '対応済み',
      paid: function (m) { return '支払い済み · ' + m; }, till: 'レジでお会計予定' },
    en: { seat: function (n) { return 'Table ' + n; }, guests: function (n) { return n + (n > 1 ? ' guests' : ' guest'); }, lang: function (l) { return 'Guest language: ' + { ja: 'Japanese', en: 'English', zh: 'Chinese (Simplified)', tw: 'Chinese (Traditional)', ko: 'Korean' }[l]; },
      avoid: 'Avoid: ', otoshi: 'Otoshi', start: 'Start', serve: 'Mark as served', done: 'Served', call: 'Call', callDone: 'Done',
      paid: function (m) { return 'Paid · ' + m; }, till: 'Will pay at the till' }
  };

  function pageLang() { return root.lang === 'en' ? 'en' : 'ja'; }
  function detect() {
    var n = (navigator.languages && navigator.languages[0] || navigator.language || '').toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(n)) return 'tw';
    if (/^zh/.test(n)) return 'zh';
    if (/^ko/.test(n)) return 'ko';
    if (/^ja/.test(n)) return 'ja';
    return 'en';
  }
  var MENU = C.menu, byId = {};
  MENU.forEach(function (m) { byId[m.id] = m; });

  var S;
  function reset() {
    S = { screen: 'lang', gl: Q.get('gl') && T[Q.get('gl')] ? Q.get('gl') : detect(), guests: 2, avoid: [], cart: [], orders: [], split: false, method: 'card', paid: null, seq: C.seq, calls: [] };
  }
  var Q = new URLSearchParams(location.search);
  reset();
  function t() { return T[S.gl]; }
  function pick(o) { return o[S.gl] != null ? o[S.gl] : o.en; }
  function yen(n) { return '¥' + n.toLocaleString('ja-JP'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function name(m) { return m[S.gl][0]; }
  function clock() { var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function thumb(m, cls) { return '<img class="' + cls + '" src="' + P + m.img + '-s.webp" width="360" height="360" loading="lazy" alt="">'; }

  // 料理（と選んだ選択肢）の中身：アレルゲン・肉・豚肉・アルコール
  function facts(m, o) {
    var f = { a: (m.a || []).slice(), meat: !!m.meat, pork: !!m.pork, alc: !!m.alc };
    (m.opts || []).forEach(function (g, gi) { var x = g.add && g.add[o ? o[gi] : g.def]; if (!x) return; (x.a || []).forEach(function (a) { if (f.a.indexOf(a) < 0) f.a.push(a); }); if (x.alc) f.alc = true; });
    return f;
  }
  // お客さまの「食べられないもの」に当たる理由の一覧
  function clash(m, o) {
    var f = facts(m, o), out = [];
    S.avoid.forEach(function (k) {
      if (AL[k] && f.a.indexOf(k) >= 0) out.push(pick(AL[k]));
      else if (k === 'veg' && (f.meat || f.a.indexOf('fish') >= 0)) out.push(pick(WHY.veg));
      else if (k === 'pork' && f.pork) out.push(pick(WHY.pork));
      else if (k === 'alc' && f.alc) out.push(pick(WHY.alc));
    });
    return out;
  }
  // 選択肢のうち、ほかの選択肢なら当たらないもの（例：焼き鳥はタレだとアルコール、塩なら大丈夫）
  function safeOpt(m) {
    if (!m.opts) return null;
    var o = m.opts.map(function (g) { return g.def; });
    m.opts.forEach(function (g, gi) { for (var i = 0; i < g.en[1].length; i++) { var x = o.slice(); x[gi] = i; if (clash(m, x).length < clash(m, o).length) o = x; } });
    return o;
  }
  function optText(l, lg) {
    var m = byId[l.id]; if (!m.opts) return '';
    return m.opts.map(function (g, i) { return g[lg || S.gl][1][l.o[i]]; }).join('・');
  }
  function sep() { return S.gl === 'en' || S.gl === 'ko' ? ', ' : '、'; }
  function par(p) { return !p ? '' : S.gl === 'en' || S.gl === 'ko' ? ' (' + p + ')' : '（' + p + '）'; }
  function unit(l) { return byId[l.id].p; }
  function cartCount() { return S.cart.reduce(function (a, l) { return a + l.q; }, 0); }
  function otoshi() { return S.orders.length === 0 ? C.otoshi.p * S.guests : 0; }
  function cartTotal() { return S.cart.reduce(function (a, l) { return a + unit(l) * l.q; }, 0) + otoshi(); }
  function billTotal() { return S.orders.reduce(function (a, o) { return a + o.total; }, 0); }
  function tax(n) { return Math.floor(n * 10 / 110); }
  function avoidJa() { return S.avoid.map(function (k) { return (AL[k] || DIET[k])[pageLang() === 'en' ? 'en' : 'ja']; }).join('・'); }

  // ── 画面 ──
  var VIEWS = {
    lang: function (x) {
      return '<div class="scr welcome tb-lang"><div class="pad"><figure class="w-hero"><img src="' + P + C.hero + '-s.webp" alt=""><figcaption><span class="w-shop"><b>' + esc(x.shop) + '</b><small>' + x.kind + '</small></span></figcaption></figure>' +
        '<div class="w-in"><h2 class="w-title tb-multi" lang="en">Choose your language<small lang="ja">言語を選んでください</small><small lang="zh-Hans">请选择语言</small><small lang="ko">언어를 선택하세요</small></h2>' +
        '<div class="tb-langs" role="radiogroup">' + LANGS.map(function (l) {
          return '<button type="button" role="radio" aria-checked="' + (S.gl === l[0]) + '" data-gl="' + l[0] + '" lang="' + l[2] + '">' + l[1] + '</button>';
        }).join('') + '</div><p class="small center">' + x.detected + ' ' + x.langNote + '</p></div></div>' +
        '<div class="bar"><button type="button" class="cta" data-go="welcome">' + ({ ja: 'つぎへ', en: 'Continue', zh: '继续', tw: '繼續', ko: '계속' })[S.gl] + '</button></div></div>';
    },
    welcome: function (x) {
      var g = ''; for (var i = 1; i <= 6; i++) g += '<button type="button" class="g" aria-pressed="' + (S.guests === i) + '" data-guests="' + i + '">' + i + '</button>';
      function chip(k, lab) { return '<button type="button" class="tb-chip" aria-pressed="' + (S.avoid.indexOf(k) >= 0) + '" data-avoid="' + k + '">' + lab + '</button>'; }
      var diet = Object.keys(DIET).map(function (k) { return chip(k, pick(DIET[k])); }).join('');
      var al = C.allergens.map(function (k) { return chip(k, pick(AL[k])); }).join('');
      var picks = '<h3 class="w-h">' + x.picks + '</h3><div class="w-picks">' + C.picks.map(function (id) {
        var m = byId[id];
        return '<button type="button" class="pk" data-pick="' + id + '">' + thumb(m, 'pk-img') + '<b>' + esc(name(m)) + '</b><span>' + yen(m.p) + '</span></button>';
      }).join('') + '</div>';
      return '<div class="scr welcome"><div class="pad"><figure class="w-hero"><img src="' + P + C.hero + '-s.webp" alt=""><figcaption><span class="w-shop"><b>' + esc(x.shop) + '</b><small>' + x.kind + '</small></span></figcaption></figure>' +
        '<div class="w-in"><h2 class="w-title">' + x.welcome + '</h2><p class="w-scan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 12h8"/></svg>' + x.table(table) + ' · ' + x.noApp + '</p>' +
        '<p class="w-q" id="g-label">' + x.guestsQ + '</p><div class="guests" role="group" aria-labelledby="g-label">' + g + '</div>' +
        '<p class="w-q">' + x.dietQ + '</p><p class="small">' + x.dietLead + '</p>' +
        '<p class="tb-h">' + x.dietH + '</p><div class="tb-chips">' + diet + '</div><p class="tb-h">' + x.allergyH + '</p><div class="tb-chips">' + al + '</div>' +
        picks + '<div class="w-notes">' + x.notes.map(function (n) { return '<p class="small">' + n + '</p>'; }).join('') + '<p class="small">' + x.allergyNote + '</p></div>' +
        '<button type="button" class="link small cr-link" data-credits-open>' + x.credits + '</button></div></div>' +
        '<div class="bar"><button type="button" class="cta" data-go="menu">' + x.start + '</button></div></div>';
    },
    menu: function (x) {
      var tabs = C.cats.map(function (c) { return '<a href="#c-' + c.id + '" data-cat="' + c.id + '">' + pick(c) + '</a>'; }).join('');
      var body = C.cats.map(function (c) {
        return '<section class="cat" id="c-' + c.id + '"><h3>' + pick(c) + '</h3><ul class="items">' + MENU.filter(function (m) { return m.cat === c.id; }).map(function (m) {
          var bad = clash(m, safeOpt(m)), al = facts(m).a.map(function (a) { return pick(AL[a]); }).join(' · ');
          var tags = (m.tag ? '<i class="tag">' + ({ ja: '人気', en: 'Popular', zh: '人气', tw: '人氣', ko: '인기' })[S.gl] + '</i>' : '') + (m.veg ? '<i class="tag tb-veg">' + pick(DIET.veg) + '</i>' : '');
          return '<li><button type="button" class="item' + (bad.length ? ' tb-bad' : '') + '" data-item="' + m.id + '">' + thumb(m, 'thumb') +
            '<span class="i-text"><b>' + esc(name(m)) + tags + '</b>' + (S.gl !== 'ja' ? '<small class="tb-ja" lang="ja">' + esc(m.ja[0]) + '</small>' : '') + '<span>' + esc(m[S.gl][1]) + '</span>' +
            (al ? '<small class="tb-al">' + x.contains + al + '</small>' : '') + (bad.length ? '<small class="tb-warn">' + x.avoid(bad.join(sep())) + '</small>' : '') + '<em>' + yen(m.p) + '</em></span>' +
            '<span class="plus" aria-hidden="true">+</span></button></li>';
        }).join('') + '</ul></section>';
      }).join('');
      var n = cartCount();
      var filt = S.avoid.length ? '<div class="timer tb-filt"><span>' + x.filt + S.avoid.map(function (k) { return pick(AL[k] || DIET[k]); }).join(sep()) + '</span><button type="button" data-go="welcome">' + x.edit + '</button></div>' : '';
      return '<div class="scr menu"><nav class="cats" aria-label="Menu">' + tabs + '</nav>' + filt + '<div class="menu-body" data-menu-body>' + body + '<p class="small allergy">' + x.allergyNote + '</p></div>' +
        (n ? '<div class="bar"><button type="button" class="cta" data-go="cart">' + x.cartBar(n, yen(cartTotal())) + '</button></div>' :
          (S.orders.length ? '<div class="bar"><button type="button" class="cta ghost" data-go="sent">' + x.history + '</button></div>' : '')) + '</div>';
    },
    cart: function (x) {
      var rows = S.cart.map(function (l, i) {
        var m = byId[l.id], o = optText(l), bad = clash(m, l.o);
        return '<li class="line">' + thumb(m, 'thumb sm') + '<span class="l-name"><b>' + esc(name(m)) + '</b>' + (o ? '<small>' + o + '</small>' : '') + (bad.length ? '<small class="tb-warn">' + x.avoid(bad.join(sep())) + '</small>' : '') + '<em>' + yen(unit(l) * l.q) + '</em></span>' +
          '<span class="step" role="group" aria-label="' + x.qty + '"><button type="button" data-dec="' + i + '" aria-label="−">' + (l.q === 1 ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>' : '−') + '</button><output>' + l.q + '</output><button type="button" data-inc="' + i + '" aria-label="+">+</button></span></li>';
      }).join('');
      if (S.orders.length === 0) rows += '<li class="line otoshi"><img class="thumb sm" src="' + P + C.otoshi.img + '-s.webp" width="360" height="360" alt=""><span class="l-name"><b>' + x.otoshi + '</b><small>' + x.otoshiSub + '</small><em>' + yen(otoshi()) + '</em></span><span class="step"><output>' + yen(C.otoshi.p) + ' × ' + S.guests + '</output></span></li>';
      var tot = cartTotal();
      return '<div class="scr cart"><div class="pad"><button type="button" class="back" data-go="menu">← ' + x.backMenu + '</button><h2>' + x.cartTitle + '</h2>' +
        (S.cart.length ? '<ul class="lines">' + rows + '</ul>' : '<p class="small">' + x.empty + '</p>') +
        (S.cart.length ? '<div class="tb-ticket"><p class="small">' + x.toKitchen + '</p>' + jaTicket(S.cart, true) + '</div>' : '') +
        '<div class="total"><span>' + x.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + x.taxNote(yen(tax(tot))) + ' · ' + x.noTip + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" data-send' + (S.cart.length ? '' : ' disabled') + '>' + x.send + '</button></div></div>';
    },
    sent: function (x) {
      var last = S.orders[S.orders.length - 1];
      var steps = x.st.map(function (s, i) { return '<li class="' + (i <= last.stage ? 'on' : '') + '"><i></i><span>' + s + '</span>' + (last.times[i] ? '<small>' + last.times[i] + '</small>' : '') + '</li>'; }).join('');
      var hist = S.orders.slice().reverse().map(function (o) {
        return '<li><span class="h-no">' + o.no + ' · ' + o.time + '</span><span class="h-items">' + o.lines.map(function (l) { var p = optText(l); return esc(name(byId[l.id])) + par(p) + ' × ' + l.q; }).join(sep()) + '</span><b>' + yen(o.total) + '</b></li>';
      }).join('');
      return '<div class="scr sent"><div class="pad"><div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div>' +
        '<h2>' + x.sentTitle + '</h2><p class="no">' + x.orderNo + ' <b>' + last.no + '</b></p>' +
        '<ol class="track" aria-live="polite">' + steps + '</ol>' +
        '<div class="tb-ticket"><p class="small">' + x.jaTicket + '</p>' + jaTicket(last.lines, last.first) + '</div>' +
        '<h3 class="h-title">' + x.history + '</h3><ul class="hist">' + hist + '</ul>' +
        '<button type="button" class="link see-k" data-kitchen-open>' + x.seeKitchen + ' →</button></div>' +
        '<div class="bar two"><button type="button" class="cta ghost" data-go="menu">' + x.more + '</button><button type="button" class="cta" data-go="bill">' + x.toBill + '</button></div></div>';
    },
    bill: function (x) {
      var rows = [];
      S.orders.forEach(function (o) {
        if (o.first) rows.push('<li><span>' + x.otoshi + ' ' + yen(C.otoshi.p) + ' × ' + S.guests + '</span><b>' + yen(C.otoshi.p * S.guests) + '</b></li>');
        o.lines.forEach(function (l) { var p = optText(l); rows.push('<li><span>' + esc(name(byId[l.id])) + par(p) + ' × ' + l.q + '</span><b>' + yen(unit(l) * l.q) + '</b></li>'); });
      });
      var tot = billTotal(), per = Math.ceil(tot / S.guests / 10) * 10;
      var methods = [['card', x.mCard, x.mCardSub], ['wallet', x.mWallet, ''], ['qr', x.mQr, ''], ['till', x.mTill, x.mTillSub]].map(function (m) {
        return '<label class="pm"><input type="radio" name="pm" value="' + m[0] + '"' + (S.method === m[0] ? ' checked' : '') + '><span class="pm-ic pm-' + m[0] + '" aria-hidden="true"></span><span><b>' + m[1] + '</b>' + (m[2] ? '<small>' + m[2] + '</small>' : '') + '</span></label>';
      }).join('');
      return '<div class="scr bill"><div class="pad"><button type="button" class="back" data-go="sent">← ' + x.history + '</button><h2>' + x.billTitle + '</h2>' +
        '<ul class="receipt">' + rows.join('') + '</ul><div class="total"><span>' + x.subtotal + '</span><b>' + yen(tot) + '</b></div><p class="small">' + x.taxNote(yen(tax(tot))) + ' · ' + x.noTip + '</p>' +
        (S.guests > 1 ? '<label class="switch"><input type="checkbox" data-split' + (S.split ? ' checked' : '') + '><span>' + x.split + '</span></label>' + (S.split ? '<p class="per">' + x.perPerson(S.guests) + ' <b>' + yen(per) + '</b></p>' : '') : '') +
        '<fieldset class="pms"><legend>' + x.method + '</legend>' + methods + '</fieldset><p class="small">' + x.demoPay + '</p></div>' +
        '<div class="bar"><button type="button" class="cta" data-pay>' + (S.method === 'till' ? x.tillBtn : x.payBtn(yen(tot))) + '</button></div></div>';
    },
    paying: function (x) { return '<div class="scr paying"><div class="spin" aria-hidden="true"></div><p role="status">' + x.paying + '</p></div>'; },
    done: function (x) {
      var head = S.paid === 'till' ? '<h2>' + x.tillTitle + '</h2><p class="center">' + x.tillLead + '</p><div class="till-code"><b>' + x.table(table) + '</b><span>' + yen(billTotal()) + '</span><i aria-hidden="true"></i></div>'
        : '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div><h2>' + x.paidTitle + '</h2><p class="paid-sum">' + yen(billTotal()) + ' · ' + methodName(S.paid) + '</p>';
      return '<div class="scr done"><div class="pad">' + head + '<p class="center">' + x.thanks + '</p>' +
        '<div class="coupon tb-review"><small>Google Maps</small><b aria-hidden="true">★★★★★</b><span>' + x.review + '</span><button type="button" class="cta ghost" data-review>' + x.reviewBtn + '</button></div>' +
        '<button type="button" class="link see-k" data-kitchen-open>' + x.seeKitchen + ' →</button></div>' +
        '<div class="bar"><button type="button" class="cta ghost" data-restart-btn>' + x.restart + '</button></div></div>';
    }
  };
  function methodName(m) { var x = t(); return { card: x.mCard, wallet: x.mWallet, qr: x.mQr, till: x.mTill }[m] || ''; }
  // お客さまにも見せる、日本語の伝票
  function jaTicket(lines, first) {
    var items = (first ? '<li><b>' + S.guests + '</b> お通し</li>' : '') + lines.map(function (l) { var p = optText(l, 'ja'); return '<li><b>' + l.q + '</b> ' + esc(byId[l.id].ja[0]) + (p ? ' <small>' + p + '</small>' : '') + '</li>'; }).join('');
    var av = S.avoid.length ? '<p class="t-note">除去・注意：' + S.avoid.map(function (k) { return (AL[k] || DIET[k]).ja; }).join('・') + '</p>' : '';
    return '<div class="tb-slip" lang="ja"><p><b>' + table + '番</b> · ' + S.guests + '名 · ' + K.ja.lang(S.gl) + '</p><ul>' + items + '</ul>' + av + '</div>';
  }

  function render(focus) {
    var x = t();
    app.lang = LANGS.filter(function (l) { return l[0] === S.gl; })[0][2];
    app.dataset.gl = S.gl;
    app.querySelector('[data-mh-title]').textContent = x.shop;
    app.querySelector('[data-mh-sub]').textContent = x.table(table);
    app.querySelector('[data-mh-restart]').textContent = x.restart;
    callBtn.hidden = S.screen === 'lang'; callBtn.querySelector('span').textContent = x.call; callBtn.title = x.call;
    langBtn.hidden = S.screen === 'lang'; langBtn.querySelector('span').textContent = LANGS.filter(function (l) { return l[0] === S.gl; })[0][1]; langBtn.title = x.change;
    var y = S.screen === 'menu' ? (screens.querySelector('[data-menu-body]') || {}).scrollTop : 0;
    screens.innerHTML = VIEWS[S.screen](x);
    var mb = screens.querySelector('[data-menu-body]');
    if (mb && y) mb.scrollTop = y;
    if (focus) { var h = screens.querySelector('h2, .cats a'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    if (S.screen === 'menu') spy();
    renderKitchen();
  }
  function go(s) { S.screen = s; closeSheet(); render(true); var sc = screens.querySelector('.pad, .menu-body'); if (sc) sc.scrollTop = 0; }

  function spy() {
    var mb = screens.querySelector('[data-menu-body]'), tabs = screens.querySelectorAll('.cats a');
    function upd() {
      var cur = C.cats[0].id, top = mb.getBoundingClientRect().top;
      C.cats.forEach(function (c) { var s = document.getElementById('c-' + c.id); if (s && s.getBoundingClientRect().top - top < 60) cur = c.id; });
      tabs.forEach(function (a) { var on = a.dataset.cat === cur; a.classList.toggle('on', on); if (on && a.parentNode.scrollWidth > a.parentNode.clientWidth) { var p = a.parentNode; p.scrollLeft = a.offsetLeft - (p.clientWidth - a.offsetWidth) / 2; } });
    }
    mb.addEventListener('scroll', upd, { passive: true }); upd();
  }

  // ── ヘッダーのボタン：言語とスタッフ呼び出し ──
  var head = app.querySelector('.mh'), rb = app.querySelector('[data-restart]');
  var langBtn = document.createElement('button'); langBtn.type = 'button'; langBtn.className = 'mh-call tb-lbtn'; langBtn.dataset.langOpen = '';
  langBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/></svg><span></span>';
  var callBtn = document.createElement('button'); callBtn.type = 'button'; callBtn.className = 'mh-call'; callBtn.dataset.callOpen = '';
  callBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg><span></span>';
  head.insertBefore(langBtn, rb); head.insertBefore(callBtn, rb);

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
  function langSheet() {
    openSheet('<div class="call-sheet"><h2 id="sheet-title">' + t().change + '</h2><div class="tb-langs">' + LANGS.map(function (l) {
      return '<button type="button" role="radio" aria-checked="' + (S.gl === l[0]) + '" data-gl="' + l[0] + '" data-gl-close lang="' + l[2] + '">' + l[1] + '</button>';
    }).join('') + '</div><button type="button" class="cta ghost" data-close-sheet>' + t().close + '</button></div>');
  }
  function callSheet() {
    var x = t();
    openSheet('<div class="call-sheet"><h2 id="sheet-title">' + x.callTitle + '</h2><p class="small">' + x.callLead + '</p><div class="calls tb-calls">' +
      CALLS.map(function (c, i) { return '<button type="button" data-call="' + i + '"><b lang="ja">' + c.ja + '</b>' + (S.gl !== 'ja' ? '<small>' + pick(c) + '</small>' : '') + '</button>'; }).join('') +
      '</div><button type="button" class="cta ghost" data-close-sheet>' + x.cancel + '</button></div>');
  }
  var draft = null;
  function itemSheet(id) {
    var m = byId[id], x = t();
    draft = { id: id, q: 1, o: safeOpt(m) || [] };
    var opts = (m.opts || []).map(function (g, gi) {
      var o = g[S.gl];
      return '<fieldset class="opts"><legend>' + o[0] + '</legend>' + o[1].map(function (v, i) {
        return '<label><input type="radio" name="opt' + gi + '" data-g="' + gi + '" value="' + i + '"' + (i === draft.o[gi] ? ' checked' : '') + '><span>' + v + (S.gl !== 'ja' ? ' <small lang="ja">' + g.ja[1][i] + '</small>' : '') + '</span></label>';
      }).join('') + '</fieldset>';
    }).join('');
    openSheet('<img class="s-img" src="' + P + m.img + '-s.webp" width="360" height="360" alt="">' +
      '<div class="s-body"><h2 id="sheet-title">' + esc(name(m)) + '</h2>' + (S.gl !== 'ja' ? '<p class="tb-ja-big" lang="ja"><small>' + x.jaName + '</small>' + esc(m.ja[0]) + '</p>' : '') + '<p>' + esc(m[S.gl][1]) + '</p>' +
      '<p class="small tb-al" data-al></p><p class="small tb-warn" data-warn hidden></p>' +
      (m.tip ? '<p class="tb-tip"><b>' + x.tip + '</b>' + esc(pick(m.tip)) + '</p>' : '') +
      '<p class="s-price">' + yen(m.p) + ' <small>' + x.taxin + '</small></p>' + opts +
      '<div class="s-qty"><span>' + x.qty + '</span><span class="step"><button type="button" data-dq="-1" aria-label="−">−</button><output data-q>1</output><button type="button" data-dq="1" aria-label="+">+</button></span></div>' +
      '<button type="button" class="cta" data-add>' + x.addFor(yen(m.p)) + '</button></div>');
    updDraft();
  }
  function updDraft() {
    var m = byId[draft.id], x = t(), f = facts(m, draft.o), bad = clash(m, draft.o);
    var al = sheetBody.querySelector('[data-al]'), w = sheetBody.querySelector('[data-warn]');
    al.textContent = f.a.length ? x.contains + f.a.map(function (a) { return pick(AL[a]); }).join(' · ') : '';
    al.hidden = !f.a.length;
    w.hidden = !bad.length; w.textContent = bad.length ? x.avoid(bad.join(sep())) : '';
    sheetBody.querySelector('[data-q]').textContent = draft.q;
    sheetBody.querySelector('[data-add]').textContent = x.addFor(yen(unit(draft) * draft.q));
  }
  function addLine(l) {
    var key = l.o.join(',');
    var same = S.cart.filter(function (c) { return c.id === l.id && c.o.join(',') === key; })[0];
    if (same) same.q += l.q; else S.cart.push({ id: l.id, q: l.q, o: l.o.slice() });
  }

  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = '<span class="mh-icon" aria-hidden="true">' + app.querySelector('.mh-icon').innerHTML + '</span><span><b>' + esc(t().shop) + '</b>' + esc(msg) + '</span>';
    toastEl.hidden = false; toastEl.classList.remove('in'); void toastEl.offsetWidth; toastEl.classList.add('in');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('in'); setTimeout(function () { toastEl.hidden = true; }, 300); }, 4200);
  }

  // ── 注文と厨房 ──
  function sendOrder() {
    S.seq += 1;
    var o = { no: C.prefix + S.seq, time: clock(), lines: S.cart, first: S.orders.length === 0, total: cartTotal(), stage: 0, times: [clock()], timers: [] };
    S.orders.push(o); S.cart = [];
    go('sent'); toast(t().toastSent(o.no));
    o.timers.push(setTimeout(function () { advance(o, 1); }, 7000));
    o.timers.push(setTimeout(function () { advance(o, 2); }, 16000));
  }
  function advance(o, stage) {
    if (S.orders.indexOf(o) < 0 || o.stage >= stage) return;
    o.stage = stage; o.times[stage] = clock();
    if (stage === 2) o.timers.forEach(clearTimeout);
    if (S.screen === 'sent' && o === S.orders[S.orders.length - 1]) render(); else renderKitchen();
    toast(stage === 1 ? t().toastCooking : t().toastServed);
  }
  function renderKitchen() {
    var k = K[pageLang()], en = pageLang() === 'en';
    kEmpty.hidden = S.orders.length > 0 || S.calls.length > 0;
    kTotal.textContent = yen(billTotal());
    var who = '<p class="t-paid tb-who">' + k.lang(S.gl) + (S.avoid.length ? ' · ' + k.avoid + avoidJa() : '') + '</p>';
    var calls = S.calls.map(function (c, i) { return c.done ? '' : '<li class="ticket call"><div class="t-top"><b>' + k.seat(table) + '</b><span>' + k.call + ' · ' + c.time + '</span></div><p class="k-call" lang="ja">' + CALLS[c.i].ja + (en ? ' <small lang="en">' + CALLS[c.i].en + '</small>' : '') + '</p><div class="t-foot"><span></span><button type="button" class="k-btn" data-kc="' + i + '">' + k.callDone + '</button></div></li>'; }).join('');
    ticketsEl.innerHTML = calls + S.orders.slice().reverse().map(function (o) {
      var i = S.orders.indexOf(o);
      var items = (o.first ? '<li><b>' + S.guests + '</b> <span lang="ja">お通し</span></li>' : '') + o.lines.map(function (l) {
        var p = optText(l, 'ja'), bad = clash(byId[l.id], l.o).length;
        return '<li' + (bad ? ' class="tb-kbad"' : '') + '><b>' + l.q + '</b> <span lang="ja">' + esc(byId[l.id].ja[0]) + '</span>' + (p ? ' <small lang="ja">' + p + '</small>' : '') + (en ? ' <small lang="en">' + esc(byId[l.id].en[0]) + '</small>' : '') + (bad ? ' <small>⚠</small>' : '') + '</li>';
      }).join('');
      var act = o.stage === 0 ? '<button type="button" class="k-btn" data-k="' + i + '" data-to="1">' + k.start + '</button>' : o.stage === 1 ? '<button type="button" class="k-btn hot" data-k="' + i + '" data-to="2">' + k.serve + '</button>' : '<span class="k-done">✓ ' + k.done + '</span>';
      return '<li class="ticket st' + o.stage + '"><div class="t-top"><b>' + k.seat(table) + '</b><span>' + [o.no, o.time, k.guests(S.guests)].join(' · ') + '</span></div>' + who + '<ul>' + items + '</ul><div class="t-foot"><span>' + yen(o.total) + '</span>' + act + '</div></li>';
    }).join('') + (S.paid ? '<li class="ticket paid"><div class="t-top"><b>' + k.seat(table) + '</b><span>' + (S.paid === 'till' ? k.till : k.paid(methodNameK(S.paid))) + '</span></div><div class="t-foot"><span>' + yen(billTotal()) + '</span></div></li>' : '');
  }
  function methodNameK(m) { var x = T[pageLang()]; return { card: x.mCard, wallet: x.mWallet, qr: x.mQr, till: x.mTill }[m]; }

  // ── 操作 ──
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a, [data-close-sheet]'); if (!el || el.disabled) return;
    var d = el.dataset;
    if (d.gl) { S.gl = d.gl; if (d.glClose !== undefined) { closeSheet(); render(); } else { render(); screens.querySelector('[data-gl="' + d.gl + '"]').focus({ preventScroll: true }); } }
    else if (d.guests) { S.guests = Number(d.guests); render(); screens.querySelector('[data-guests="' + d.guests + '"]').focus({ preventScroll: true }); }
    else if (d.avoid) {
      var at = S.avoid.indexOf(d.avoid); if (at >= 0) S.avoid.splice(at, 1); else S.avoid.push(d.avoid);
      var sc = screens.querySelector('.pad').scrollTop; render(); screens.querySelector('.pad').scrollTop = sc; screens.querySelector('[data-avoid="' + d.avoid + '"]').focus({ preventScroll: true });
    }
    else if (d.pick) { go('menu'); var b = screens.querySelector('[data-item="' + d.pick + '"]'), mb = screens.querySelector('[data-menu-body]'); if (b && mb) mb.scrollTop = b.getBoundingClientRect().top - mb.getBoundingClientRect().top + mb.scrollTop - 60; itemSheet(d.pick); }
    else if (d.langOpen !== undefined) langSheet();
    else if (d.callOpen !== undefined) callSheet();
    else if (d.call) { S.calls.push({ i: Number(d.call), time: clock() }); closeSheet(); toast(t().callSent); renderKitchen(); }
    else if (d.go) go(d.go);
    else if (d.item) itemSheet(d.item);
    else if (d.dq) { draft.q = Math.max(1, Math.min(20, draft.q + Number(d.dq))); updDraft(); }
    else if (d.add !== undefined) { addLine(draft); closeSheet(); render(); }
    else if (d.inc) { S.cart[d.inc].q += 1; render(); }
    else if (d.dec) { var l = S.cart[d.dec]; l.q -= 1; if (!l.q) S.cart.splice(Number(d.dec), 1); render(); }
    else if (d.send !== undefined) sendOrder();
    else if (d.pay !== undefined) pay();
    else if (d.review !== undefined) { el.disabled = true; el.textContent = '✓'; }
    else if (d.restart !== undefined || d.restartBtn !== undefined) restart();
    else if (d.closeSheet !== undefined) closeSheet();
    else if (d.kitchenOpen !== undefined) openKitchen();
    else if (d.creditsOpen !== undefined) openSheet('<div class="cr-sheet"><h2 id="sheet-title">' + t().credits + '</h2><ul>' + document.querySelector('[data-credits]').innerHTML + '</ul><button type="button" class="cta ghost" data-close-sheet>' + t().close + '</button></div>');
    else if (el.matches('.cats a')) { e.preventDefault(); var s = document.getElementById(el.getAttribute('href').slice(1)), m2 = screens.querySelector('[data-menu-body]'); m2.scrollTo({ top: s.offsetTop - m2.offsetTop, behavior: reduce.matches ? 'auto' : 'smooth' }); }
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset.g) { draft.o[Number(el.dataset.g)] = Number(el.value); updDraft(); }
    else if (el.name === 'pm') { S.method = el.value; render(); screens.querySelector('input[value="' + el.value + '"]').focus({ preventScroll: true }); }
    else if (el.matches('[data-split]')) { S.split = el.checked; render(); screens.querySelector('[data-split]').focus({ preventScroll: true }); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheetWrap.hidden) closeSheet(); else if (document.body.classList.contains('k-open')) closeKitchen();
  });
  function pay() {
    var m = S.method;
    if (m === 'till') { S.paid = 'till'; go('done'); return; }
    go('paying');
    setTimeout(function () { S.paid = m; S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); go('done'); toast(t().toastPaid(yen(billTotal()))); }, reduce.matches ? 400 : 1600);
  }
  function restart() { S.orders.forEach(function (o) { o.timers.forEach(clearTimeout); }); reset(); go('lang'); }

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

  // ページの JA/EN を切り替えても、お客さまの言語はそのまま。厨房の画面だけ描き直す
  document.addEventListener('langchange', function () { renderKitchen(); });
  var pre = document.createElement('div'); pre.hidden = true;
  pre.innerHTML = MENU.map(function (m) { return m.img; }).concat([C.otoshi.img, C.hero]).map(function (n) { return '<img src="' + P + n + '-s.webp" loading="lazy" alt="">'; }).join('');
  document.body.appendChild(pre);

  // ?embed … アプリだけ。?auto … 指の印つきで一巡（英語のお客さまが、豚肉なしを選んで注文する）
  if (Q.has('embed')) document.body.classList.add('embed');
  if (Q.has('auto') && !reduce.matches && window.LOAuto) {
    if (!Q.get('gl')) S.gl = 'en';
    window.LOAuto(app, [{ w: 1400 }, { t: '[data-gl="zh"]', w: 900 }, { t: '[data-gl="ko"]', w: 900 }, { t: '[data-gl="' + (Q.get('gl') || 'en') + '"]', w: 900 }, { t: '[data-go="welcome"]', w: 1500 },
      { t: '[data-guests="2"]', w: 700 }, { t: '[data-avoid="pork"]', w: 1200 }, { t: '[data-go="menu"]', w: 1600 },
      { s: '.menu-body', f: .3, w: 1800 }, { t: '[data-item="yakitori"]', w: 2200 }, { t: '[data-add]', w: 1000 },
      { t: '[data-item="karaage"]', w: 1500 }, { t: '[data-add]', w: 1000 }, { t: '[data-go="cart"]', w: 2600 },
      { t: '[data-send]', w: 6500 }, { t: '[data-go="bill"]', w: 2000 }, { t: '[data-pay]', w: 5200 },
      { s: '.done .pad', f: 1, w: 2600 }, { r: 1, w: 600 }], function () { restart(); if (!Q.get('gl')) S.gl = 'en'; render(); });
  }
  render();
})();
