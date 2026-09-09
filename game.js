/* =========================================================
   Atatürk, Ülkü ve Foxy — 50 Bölümlük Hafıza Oyunu
   Bağımlılık yok. Saf JavaScript.
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   AYARLAR
   --------------------------------------------------------- */
const CONFIG = {
  /* Reklam: ads.js içindeki GAME_ID doluysa çalışır, boşsa hiç çıkmaz.
     Yani fuar sürümü için ayrıca bir şey yapmana gerek yok.
     ADS_EVERY_N_LEVELS = 3  →  her 3 bölümde bir reklam (~16 reklam / 50 bölüm).
     Daha sık istersen 2, daha seyrek istersen 4 yap. */
  ADS_EVERY_N_LEVELS: 3,

  LEVELS: 50,
  FLIP_BACK_MS: 900,

  /* Ses dosyaları assets/sfx/ içinde. Hepsi CC0 (bkz. LISANSLAR.txt).
     Dosya yüklenemezse oyun kendi ürettiği seslere düşer — hiçbir
     tarayıcıda sessiz kalmaz. Değiştirmek istersen aynı isimle üzerine yaz. */
  SFX_DIR: 'assets/sfx/',
  SFX_FILES: { flip:'flip.ogg', match:'match.ogg', wrong:'wrong.ogg', level:'level.ogg' },
  MUSIC_FILE: 'music.mp3',
  MUSIC_VOLUME: 0.16,

  /* -------------------------------------------------------
     KART HAVUZU — tamamı özgün çizim (telifsiz)
     Fotoğrafa geçmek istersen karta  img:'assets/x.jpg'  ekle.
     ------------------------------------------------------- */
  POOL: [
    { id:'foxy',       art:'#art-foxy',       tint:'#FFE3C9', name:'Foxy',
      fact:'Foxy, Çankaya Köşkü’nde yaşayan köpekti. Ülkü’nün en yakın oyun arkadaşlarındandı.' },
    { id:'ulku',       art:'#art-ulku',       tint:'#FFD9E4', name:'Ülkü',
      fact:'Ülkü, Atatürk’ün manevi kızlarındandı. Çocukluğu Çankaya Köşkü’nde geçti.' },
    { id:'bayrak',     art:'#art-bayrak',     tint:'#FFD6D2', name:'Türk Bayrağı',
      fact:'Ay ve yıldız, Türk Bayrağı’nın simgesidir.' },
    /* Not: '#art-kalpak' çizimi index.html içinde duruyor. Kart boyutunda
       çay bardağına benzediği için yerine 1923 madalyası konuldu.
       Geri istersen bu satırı eski haline çevirmen yeterli. */
    { id:'madalya',    art:'#art-madalya',    tint:'#FFF0C9', name:'Cumhuriyet 1923',
      fact:'Türkiye Cumhuriyeti 29 Ekim 1923’te ilan edildi.' },
    { id:'anitkabir',  art:'#art-anitkabir',  tint:'#CFEAF8', name:'Anıtkabir',
      fact:'Anıtkabir, Ankara’da Anıttepe’de bulunur ve 1953 yılında tamamlanmıştır.' },
    { id:'ucurtma',    art:'#art-ucurtma',    tint:'#DDF3D6', name:'Uçurtma',
      fact:'23 Nisan, dünyada çocuklara armağan edilen ilk bayramdır.' },
    { id:'kitap',      art:'#art-kitap',      tint:'#FFF0C2', name:'Yeni Harfler',
      fact:'Bugün kullandığımız Türk harfleri 1 Kasım 1928’de kabul edildi.' },
    { id:'tren',       art:'#art-tren',       tint:'#DCE2F8', name:'Tren',
      fact:'Cumhuriyet’in ilk yıllarında yurdun dört bir yanına demiryolu döşendi.' },
    { id:'vapur',      art:'#art-vapur',      tint:'#CFE9F5', name:'Bandırma Vapuru',
      fact:'Atatürk, 19 Mayıs 1919’da Bandırma Vapuru ile Samsun’a çıktı.' },
    { id:'saatkulesi', art:'#art-saatkulesi', tint:'#FBE7CF', name:'İzmir Saat Kulesi',
      fact:'İzmir Saat Kulesi, Konak Meydanı’nda bulunur ve 1901’de yapılmıştır.' },
    { id:'nazar',      art:'#art-nazar',      tint:'#D6ECFA', name:'Nazar Boncuğu',
      fact:'Nazar boncuğu, Anadolu’nun en tanınmış cam el sanatlarındandır.' },
    { id:'cay',        art:'#art-cay',        tint:'#FFE0D2', name:'Türk Çayı',
      fact:'Türkiye, dünyada kişi başına en çok çay tüketen ülkelerden biridir.' },
    { id:'simit',      art:'#art-simit',      tint:'#FBE6C6', name:'Simit',
      fact:'Simit, Türkiye’nin en sevilen sokak lezzetlerindendir.' },
    { id:'karpuz',     art:'#art-karpuz',     tint:'#E4F5DA', name:'Karpuz',
      fact:'Türkiye, dünyanın en çok karpuz yetiştiren ülkelerinden biridir.' },
    { id:'lale',       art:'#art-lale',       tint:'#FFDBDB', name:'Lale',
      fact:'Lale, yüzyıllardır Türk sanatının en sevilen motiflerindendir.' },
    { id:'balon',      art:'#art-balon',      tint:'#E1E7F7', name:'Kapadokya Balonu',
      fact:'Kapadokya’da peribacalarının üzerinde her sabah yüzlerce balon uçar.' }
  ],

  CHEERS: ['Harika!', 'Süper!', 'Aferin!', 'Buldun!', 'Çok iyi!', 'Bravo!', 'Muhteşem!'],

  /* Bölgeler — her biri 10 bölüm. Haritada tek tek sayfalanır,
     böylece 50 bölüm bir liste değil, bir yolculuk gibi görünür. */
  REGIONS: [
    { ad:'Kurtuluş',   renk:'#C4161C' },
    { ad:'Cumhuriyet', renk:'#C98A18' },
    { ad:'İzmir',      renk:'#1F8E84' },
    { ad:'Anadolu',    renk:'#B5651D' },
    { ad:'Çocuklar',   renk:'#CE4468' }
  ],

  // Bu bölümlerde oyun başında kartlar kısa süre açık gösterilir
  PEEK_EVERY: 5,
  PEEK_SECONDS: 3,

  // Her bölümde kaç bedava ipucu
  FREE_HINTS: 1
};

/* ---------------------------------------------------------
   BÖLÜM TASARIMI
   Zorluk yavaşça artar; hiçbir bölümde kaybetmek yok,
   yıldız sayısı performansı gösterir. 50 bölüm ~35 dakika.
   --------------------------------------------------------- */
function levelSpec(n){
  let pairs;
  if      (n <= 8)  pairs = 3;   // 6 kart
  else if (n <= 18) pairs = 4;   // 8 kart
  else if (n <= 30) pairs = 6;   // 12 kart
  else if (n <= 42) pairs = 8;   // 16 kart
  else              pairs = 10;  // 20 kart
  return { pairs: pairs, cols: pairs === 3 ? 3 : 4 };
}

function starThresholds(pairs){
  return { three: pairs + Math.ceil(pairs * 0.6), two: pairs + Math.ceil(pairs * 1.6) };
}

/* Kart açma ilerlemesi.
   Oyun 4 kartla başlar, ilerledikçe havuzdaki 16 kartın hepsi açılır.
   Amaç: her birkaç bölümde bir "yeni bir şey" olması — çocuğun
   devam etmesi için en güçlü sebep bu. Kartlar POOL sırasıyla açılır. */
const BASE_CARDS = 4;
const LEVELS_PER_CARD = 3.8;

function unlockedCardCount(level){
  const n = BASE_CARDS + Math.floor((level - 1) / LEVELS_PER_CARD);
  return Math.min(CONFIG.POOL.length, Math.max(BASE_CARDS, n));
}

// Bu bölümden sonra yeni kart açılıyorsa o kartı döndürür, yoksa null
function cardUnlockedAfter(level){
  if (level >= CONFIG.LEVELS) return null;
  const before = unlockedCardCount(level);
  const after  = unlockedCardCount(level + 1);
  return after > before ? CONFIG.POOL[after - 1] : null;
}

// Bir sonraki yeni kart kaç bölüm sonra?
function levelsToNextCard(level){
  const now = unlockedCardCount(level);
  if (now >= CONFIG.POOL.length) return 0;
  for (let n = level + 1; n <= CONFIG.LEVELS; n++){
    if (unlockedCardCount(n) > now) return n - level;
  }
  return 0;
}

/* ---------------------------------------------------------
   Yardımcılar
   --------------------------------------------------------- */
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function showScreen(id){
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === id));
  document.body.classList.toggle('in-game', id === 'scr-game');
  window.scrollTo(0, 0);
}
function fmtTime(sec){ return Math.floor(sec/60) + ':' + String(sec%60).padStart(2,'0'); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function regionOf(level){ return Math.min(CONFIG.REGIONS.length - 1, Math.floor((level - 1) / 10)); }
function isPeekLevel(level){ return level % CONFIG.PEEK_EVERY === 0; }

/* Kısa titreşim. Desteklemeyen cihazda sessizce yok sayılır.
   Mobilde oyunun "gerçek" hissettirmesini en çok bu sağlıyor. */
function buzz(ms){
  if (!save.sound) return;                 // ses kapalıysa titreşim de kapalı
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e){}
}

function shuffle(arr, rnd){
  const r = rnd || Math.random;
  for (let i = arr.length-1; i > 0; i--){
    const j = Math.floor(r() * (i+1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
// Bölüm numarasına bağlı sabit rastgelelik: her bölüm hep aynı kart setini kullanır
function seeded(seed){
  let s = (seed * 2654435761) >>> 0;
  return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ---------------------------------------------------------
   İlerleme kaydı
   --------------------------------------------------------- */
const SAVE_KEY = 'ataturk-hafiza:v1';
let save = { stars:{}, unlocked:1, sound:true, name:'' };

function loadSave(){
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (raw && typeof raw === 'object'){
      save = Object.assign(save, raw);
      save.stars = save.stars || {};
      save.unlocked = Math.min(Math.max(save.unlocked|0, 1), CONFIG.LEVELS);
    }
  } catch(e){}
}
function persist(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e){}
}
function totalStars(){
  return Object.keys(save.stars).reduce((t,k) => t + save.stars[k], 0);
}

/* ---------------------------------------------------------
   SES
   assets/sfx/ içinde dosya varsa onu çalar; yoksa WebAudio ile
   üretilmiş sesleri kullanır. Her iki durumda da telifsiz.
   --------------------------------------------------------- */
const SFX = {
  files: {},
  ready: {},
  music: null,

  init(){
    Object.keys(CONFIG.SFX_FILES).forEach(k => {
      try {
        const a = new Audio(CONFIG.SFX_DIR + CONFIG.SFX_FILES[k]);
        a.preload = 'auto';
        a.addEventListener('canplaythrough', () => { this.ready[k] = true; }, { once:true });
        a.addEventListener('error', () => { this.ready[k] = false; }, { once:true });
        this.files[k] = a;
      } catch(e){}
    });
    try {
      // preload:'none' → 2.5 MB'lık müzik ancak oyuncu oynamaya başlayınca iner
      const m = new Audio(CONFIG.SFX_DIR + CONFIG.MUSIC_FILE);
      m.loop = true; m.volume = CONFIG.MUSIC_VOLUME; m.preload = 'none';
      m.addEventListener('error', () => { this.music = null; }, { once:true });
      this.music = m;
    } catch(e){ this.music = null; }
  },

  play(key, fallback){
    if (!save.sound) return;
    if (this.ready[key] && this.files[key]){
      try {
        const c = this.files[key].cloneNode();
        c.volume = 0.55;
        c.play().catch(() => { if (fallback) fallback(); });
        return;
      } catch(e){}
    }
    if (fallback) fallback();
  },

  musicOn(){
    if (!save.sound || !this.music) return;
    this.music.play().catch(() => {});
  },
  musicOff(){
    if (this.music){ try { this.music.pause(); } catch(e){} }
  }
};

/* ---- dosya yoksa devreye giren üretilmiş sesler ---- */
let actx = null;
function beep(freq, dur, type, vol){
  if (!save.sound) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, actx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start(); o.stop(actx.currentTime + dur + 0.02);
  } catch(e){}
}
const genFlip  = () => beep(520, 0.06, 'triangle', 0.10);
const genMatch = () => { beep(660, 0.10, 'sine'); setTimeout(() => beep(990, 0.18, 'sine'), 90); };
const genWrong = () => beep(170, 0.15, 'sawtooth', 0.09);
const genLevel = () => [523,659,784,1046,1318].forEach((f,i) => setTimeout(() => beep(f,0.24,'sine'), i*120));

const sndFlip  = () => SFX.play('flip',  genFlip);
const sndMatch = () => SFX.play('match', genMatch);
const sndWrong = () => SFX.play('wrong', genWrong);
const sndLevel = () => SFX.play('level', genLevel);

/* ---------------------------------------------------------
   Konfeti
   --------------------------------------------------------- */
const CONF_COLORS = ['#E23B3B','#F2B33D','#2FA69B','#6BBF59','#ffffff','#C8102E'];
function confetti(n){
  const box = $('#confetti');
  for (let i = 0; i < (n || 60); i++){
    const d = document.createElement('div');
    d.className = 'conf';
    d.style.left = Math.random()*100 + '%';
    d.style.background = pick(CONF_COLORS);
    d.style.animationDuration = (1.6 + Math.random()*1.6) + 's';
    d.style.animationDelay = (Math.random()*0.5) + 's';
    d.style.width  = (7 + Math.random()*7) + 'px';
    d.style.height = (10 + Math.random()*8) + 'px';
    box.appendChild(d);
    setTimeout(() => d.remove(), 4200);
  }
}

/* ---------------------------------------------------------
   Reklam kancası — fuar sürümünde kapalı
   --------------------------------------------------------- */
function adMaybe(level){
  if (!window.ADS || !window.ADS.enabled()) return Promise.resolve();
  if (level % CONFIG.ADS_EVERY_N_LEVELS !== 0) return Promise.resolve();
  return window.ADS.interstitial();
}

// Reklam başlarken müziği kıs, bitince geri aç
document.addEventListener('ads:pause',  () => SFX.musicOff());
document.addEventListener('ads:resume', () => SFX.musicOn());

/* ---------------------------------------------------------
   Oyun durumu
   --------------------------------------------------------- */
const state = {
  level: 1, spec: null, set: [], deck: [], open: [],
  matched: 0, moves: 0, seconds: 0, timer: null, locked: false
};

/* ---------------------------------------------------------
   BÖLÜM HARİTASI
   --------------------------------------------------------- */
let mapRegion = 0;

function renderMap(region){
  if (typeof region === 'number') mapRegion = region;
  mapRegion = Math.max(0, Math.min(CONFIG.REGIONS.length - 1, mapRegion));

  const rg   = CONFIG.REGIONS[mapRegion];
  const scr  = $('#scr-map');
  scr.style.setProperty('--rg', rg.renk);
  $('#rg-name').textContent  = rg.ad;
  $('#rg-index').textContent = 'Bölge ' + (mapRegion + 1) + ' / ' + CONFIG.REGIONS.length;
  $('#rg-prev').disabled = mapRegion === 0;
  $('#rg-next').disabled = mapRegion === CONFIG.REGIONS.length - 1;

  // bölge noktaları
  const dots = $('#rg-dots');
  dots.innerHTML = '';
  CONFIG.REGIONS.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'rg-dot' + (i === mapRegion ? ' on' : '');
    dots.appendChild(d);
  });

  // bu bölgenin 10 bölümü
  const box = $('#levels');
  box.innerHTML = '';
  const ilk = mapRegion * 10 + 1;
  for (let n = ilk; n < ilk + 10; n++){
    const stars  = save.stars[n] || 0;
    const locked = n > save.unlocked;

    const b = document.createElement('button');
    b.className = 'lvl' + (locked ? ' locked' : '') + (stars ? ' done' : '') +
                  (n === save.unlocked && !stars ? ' next' : '');
    b.type = 'button';
    b.disabled = locked;
    b.style.animationDelay = ((n - ilk) * 28) + 'ms';
    b.setAttribute('aria-label', 'Bölüm ' + n + (locked ? ' (kilitli)' : ''));

    let yildiz = '';
    for (let i = 0; i < 3; i++){
      yildiz += '<svg class="lvl-star' + (i < stars ? ' on' : '') + '"><use href="#art-star"></use></svg>';
    }
    b.innerHTML = locked
      ? '<svg class="lvl-lock"><use href="#ui-lock"></use></svg>'
      : '<span class="lvl-n">' + n + '</span><span class="lvl-stars">' + yildiz + '</span>';

    if (!locked) b.addEventListener('click', () => { buzz(12); startLevel(n); });
    box.appendChild(b);
  }

  // bölge ilerlemesi
  let biten = 0;
  for (let n = ilk; n < ilk + 10; n++) if (save.stars[n]) biten++;
  $('#rg-done').textContent = biten + ' / 10';
  $('#rg-fill').style.width = (biten * 10) + '%';

  // bu bölgede açılan kartlar
  const kutu = $('#rg-cards');
  kutu.innerHTML = '';
  const acikSayi = unlockedCardCount(save.unlocked);
  CONFIG.POOL.slice(mapRegion * 3, mapRegion * 3 + 4).forEach(c => {
    const i = CONFIG.POOL.indexOf(c);
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 100 100');
    if (i >= acikSayi) s.setAttribute('class', 'kilit');
    s.innerHTML = '<use href="' + c.art + '"></use>';
    kutu.appendChild(s);
  });

  $('#total-stars').textContent = totalStars();
}

/* ---------------------------------------------------------
   KOLEKSİYON
   Açılmış kartlar toplanır; kilitliler "?" olarak görünür.
   Bir karta dokununca hikâyesi altta belirir.
   --------------------------------------------------------- */
let collIndex = 0;

// i numaralı kart hangi bölümde açılıyor?
function levelThatUnlocks(i){
  for (let n = 1; n <= CONFIG.LEVELS; n++){
    if (unlockedCardCount(n) > i) return n;
  }
  return CONFIG.LEVELS;
}

function showCollCard(i, yon){
  const acik = unlockedCardCount(save.unlocked);
  collIndex = Math.max(0, Math.min(CONFIG.POOL.length - 1, i));

  const c      = CONFIG.POOL[collIndex];
  const locked = collIndex >= acik;
  const kart   = $('#coll-card');

  kart.classList.toggle('locked', locked);
  kart.style.setProperty('--tint', c.tint);
  $('#coll-use').setAttribute('href', c.art);

  if (locked){
    $('#coll-name').textContent = 'Henüz kilitli';
    $('#coll-fact').textContent = 'Bu kart ' + levelThatUnlocks(collIndex) + '. bölümde açılıyor.';
  } else {
    $('#coll-name').textContent = c.name;
    $('#coll-fact').textContent = c.fact;
  }

  $('#coll-i').textContent = collIndex + 1;
  $('#coll-prev').disabled = collIndex === 0;
  $('#coll-next').disabled = collIndex === CONFIG.POOL.length - 1;

  // giriş animasyonunu geldiği yöne göre yeniden oynat
  kart.style.setProperty('--from', (yon === -1 ? '-24px' : '24px'));
  kart.style.animation = 'none';
  void kart.offsetWidth;
  kart.style.animation = '';
}

function collStep(d){
  const yeni = collIndex + d;
  if (yeni < 0 || yeni >= CONFIG.POOL.length) return;
  beep(620, 0.04, 'sine', 0.07);
  buzz(8);
  showCollCard(yeni, d);
}

function renderCollection(){
  $('#coll-count').textContent = unlockedCardCount(save.unlocked);
  showCollCard(0, 1);
}

/* ---------------------------------------------------------
   TAHTA
   --------------------------------------------------------- */
function faceFront(c){
  if (c.img) return '<img src="' + c.img + '" alt="' + c.name + '">';
  return '<span class="tint" style="--tint:' + c.tint + '"></span>' +
         '<svg class="art"><use href="' + c.art + '"></use></svg>';
}

function renderBoard(){
  const board = $('#board');
  board.innerHTML = '';
  board.dataset.cols = state.spec.cols;
  board.classList.toggle('dense', state.deck.length >= 16);

  state.deck.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    // Kartlar aynı anda değil, dalga halinde diziliyor
    btn.style.animationDelay = (i * 32) + 'ms';
    btn.setAttribute('aria-label', 'Kapalı kart');
    btn.innerHTML =
      '<div class="card-inner">' +
        '<div class="face face-back"><svg class="paw"><use href="#art-back"></use></svg></div>' +
        '<div class="face face-front">' + faceFront(c) + '</div>' +
      '</div>';
    btn.addEventListener('click', () => onFlip(btn, c));
    board.appendChild(btn);
  });
}

function updateHud(){
  const hedef = starThresholds(state.spec.pairs).three;
  $('#hud-level').textContent = state.level;
  // Hamle sayacı 3 yıldız bütçesini gösterir — hedef görünür olunca
  // çocuk tekrar oynamak istiyor.
  $('#hud-moves').textContent = state.moves + '/' + hedef;
  $('#hud-moves').style.color = state.moves > hedef ? 'var(--ink-3)' : '';
  $('#hud-pairs').textContent = state.matched + '/' + state.spec.pairs;
}

function updateHintBtn(){
  const b = $('#btn-hint');
  const reklamVar = window.ADS && window.ADS.enabled();
  if (state.hints > 0){
    b.disabled = false;
    b.classList.remove('ad');
    $('#hint-badge').textContent = state.hints;
    b.setAttribute('aria-label', 'İpucu (' + state.hints + ' hakkın var)');
  } else if (reklamVar){
    b.disabled = false;
    b.classList.add('ad');
    $('#hint-badge').textContent = 'AD';
    b.setAttribute('aria-label', 'Reklam izleyip ipucu al');
  } else {
    b.disabled = true;
    b.classList.remove('ad');
    $('#hint-badge').textContent = '0';
  }
}

/* İpucu: eşleşmemiş kartları kısa süre gösterir. */
function revealCards(ms){
  if (state.locked) return;
  state.locked = true;
  const acilan = $$('.card:not(.is-done):not(.is-open)');
  acilan.forEach(c => c.classList.add('is-open', 'peeking'));
  setTimeout(() => {
    acilan.forEach(c => c.classList.remove('is-open', 'peeking'));
    state.locked = false;
  }, ms);
}

function useHint(){
  if (state.locked) return;
  if (state.hints > 0){
    state.hints--;
    updateHintBtn();
    buzz(20);
    beep(880, 0.08, 'sine');
    revealCards(1400);
    return;
  }
  if (window.ADS && window.ADS.enabled()){
    SFX.musicOff();
    window.ADS.rewarded().then(odul => {
      SFX.musicOn();
      if (odul){
        buzz(20);
        revealCards(1400);
      } else {
        showTip('Reklam yüklenemedi');
      }
    });
  }
}

/* Ezberleme anı: bazı bölümlerde başta tüm kartlar açık gösterilir. */
function runPeek(done){
  const kutu = $('#peek');
  const sayi = $('#peek-n');
  let kalan = CONFIG.PEEK_SECONDS;

  state.locked = true;
  $$('.card').forEach(c => c.classList.add('is-open', 'peeking'));
  kutu.hidden = false;
  sayi.textContent = kalan;
  beep(700, 0.1, 'sine');

  const t = setInterval(() => {
    kalan--;
    if (kalan > 0){
      sayi.textContent = kalan;
      beep(700, 0.08, 'sine');
      buzz(10);
    } else {
      clearInterval(t);
      kutu.hidden = true;
      $$('.card').forEach(c => c.classList.remove('is-open', 'peeking'));
      state.locked = false;
      beep(420, 0.12, 'triangle');
      done();
    }
  }, 1000);
}

let tipTimer = null;
function showTip(text){
  const el = $('#tip');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

function startTimer(){
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.seconds++;
    // Süre üst barda gösterilmiyor (yerini 3 yıldız hamle bütçesi aldı),
    // ama ölçülmeye devam ediyor; bölüm sonunda gösteriliyor.
  }, 1000);
}

function onFlip(btn, card){
  if (state.locked) return;
  if (btn.classList.contains('is-open') || btn.classList.contains('is-done')) return;

  btn.classList.add('is-open');
  btn.setAttribute('aria-label', 'Açık kart: ' + card.name);
  state.open.push({ btn: btn, card: card });
  sndFlip();
  buzz(10);

  if (state.open.length < 2) return;

  state.moves++;
  const a = state.open[0], b = state.open[1];

  if (a.card.id === b.card.id){
    state.open = [];
    state.matched++;
    state.combo++;
    setTimeout(() => {
      a.btn.classList.add('is-done'); b.btn.classList.add('is-done');
      a.btn.disabled = true;          b.btn.disabled = true;
      sndMatch();
      buzz(state.combo >= 3 ? [18,40,18] : 26);
      // Seri arttıkça kutlama büyür
      confetti(10 + state.combo * 6);
      showTip(state.combo >= 2
        ? state.combo + ' SERİ! ' + a.card.name
        : pick(CONFIG.CHEERS) + ' ' + a.card.name);
      updateHud();
      if (state.matched === state.spec.pairs) setTimeout(finishLevel, 700);
    }, 250);
  } else {
    state.locked = true;
    state.combo = 0;
    sndWrong();
    buzz(55);
    setTimeout(() => { a.btn.classList.add('is-wrong'); b.btn.classList.add('is-wrong'); }, 220);
    setTimeout(() => {
      [a, b].forEach(x => {
        x.btn.classList.remove('is-open', 'is-wrong');
        x.btn.setAttribute('aria-label', 'Kapalı kart');
      });
      state.open = [];
      state.locked = false;
    }, CONFIG.FLIP_BACK_MS);
  }
}

/* ---------------------------------------------------------
   BÖLÜM AKIŞI
   --------------------------------------------------------- */
function startLevel(n){
  state.level   = n;
  state.spec    = levelSpec(n);
  state.combo   = 0;
  // Bölümün kart seti sabit (aynı bölüm hep aynı kartlar), dizilim rastgele.
  // Yalnızca o bölüme kadar AÇILMIŞ kartlardan seçilir.
  const havuz   = CONFIG.POOL.slice(0, unlockedCardCount(n));
  state.set     = shuffle(havuz, seeded(n)).slice(0, state.spec.pairs);
  state.deck    = shuffle(state.set.concat(state.set));
  state.open    = [];
  state.matched = 0;
  state.moves   = 0;
  state.seconds = 0;
  state.locked  = false;

  state.hints = CONFIG.FREE_HINTS;

  clearInterval(state.timer);
  $('#tip').classList.remove('show');
  $('#peek').hidden = true;
  renderBoard();
  updateHud();
  updateHintBtn();
  showScreen('scr-game');
  SFX.musicOn();

  // Ezberleme bölümüyse önce kartları göster, sonra sayacı başlat
  if (isPeekLevel(n)) runPeek(startTimer);
  else startTimer();
}

function finishLevel(){
  clearInterval(state.timer);
  sndLevel();
  buzz([25,60,25,60,90]);
  confetti(90);

  const t = starThresholds(state.spec.pairs);
  const stars = state.moves <= t.three ? 3 : (state.moves <= t.two ? 2 : 1);

  // kayıt
  const prev = save.stars[state.level] || 0;
  if (stars > prev) save.stars[state.level] = stars;
  if (state.level === save.unlocked && save.unlocked < CONFIG.LEVELS) save.unlocked++;
  persist();

  // ekran
  $('#win-level').textContent = 'Bölüm ' + state.level;
  $('#win-title').textContent = stars === 3 ? 'Mükemmel!' : (stars === 2 ? 'Çok iyi!' : 'Aferin!');
  $('#win-time').textContent  = fmtTime(state.seconds);
  $('#win-moves').textContent = state.moves;
  $$('#win-stars .star').forEach((s, i) => s.classList.toggle('on', i < stars));

  // Yeni kart açıldı mı?
  const yeni = cardUnlockedAfter(state.level);
  const nc = $('#new-card');
  if (yeni){
    nc.hidden = false;
    $('#new-card-use').setAttribute('href', yeni.art);
    $('#new-card-name').textContent = yeni.name;
    $('#fact-text').textContent = yeni.fact;
    $('#fact-use').setAttribute('href', yeni.art);
    confetti(40);
  } else {
    nc.hidden = true;
    const f = pick(state.set);
    $('#fact-text').textContent = f.fact;
    $('#fact-use').setAttribute('href', f.art);
  }

  // "Sonraki kart X bölüm sonra" — devam etmek için ileriye dönük sebep
  const kalan = levelsToNextCard(state.level + (yeni ? 1 : 0));
  const nu = $('#next-unlock');
  if (kalan > 0 && state.level < CONFIG.LEVELS){
    nu.hidden = false;
    nu.innerHTML = 'Sonraki yeni kart: <b>' + kalan + ' bölüm</b> sonra';
  } else {
    nu.hidden = true;
  }

  const last = state.level >= CONFIG.LEVELS;
  $('#btn-next').textContent = last ? 'Bitir' : 'Sonraki Bölüm';

  adMaybe(state.level).then(() => showScreen('scr-win'));
}

function nextLevel(){
  if (state.level >= CONFIG.LEVELS){
    $('#final-stars').textContent = totalStars() + ' / ' + (CONFIG.LEVELS * 3);
    confetti(120);
    showScreen('scr-final');
    return;
  }
  startLevel(state.level + 1);
}

/* ---------------------------------------------------------
   Ana menü
   --------------------------------------------------------- */
function refreshStart(){
  const cont = $('#btn-continue');
  const done = totalStars() > 0;
  cont.hidden = !done;
  cont.querySelector('small').textContent = 'Bölüm ' + save.unlocked;

  const line = $('#best-line');
  if (done){
    line.hidden = false;
    line.innerHTML = 'Toplam yıldız: <b>' + totalStars() + '</b> / ' + (CONFIG.LEVELS * 3) +
                     ' &middot; Kart: <b>' + unlockedCardCount(save.unlocked) + '</b>/' + CONFIG.POOL.length;
  } else {
    line.hidden = true;
  }
}

function updateSoundBtn(){
  $('#sound-use').setAttribute('href', save.sound ? '#ui-sound' : '#ui-mute');
}

/* ---------------------------------------------------------
   Bağlantılar
   --------------------------------------------------------- */
$('#btn-play').addEventListener('click', () => {
  beep(560, 0.05, 'sine');            // sesi ilk dokunuşta uyandır
  SFX.musicOn();
  renderMap(regionOf(save.unlocked));
  showScreen('scr-map');
});

$('#btn-continue').addEventListener('click', () => {
  SFX.musicOn();
  startLevel(save.unlocked);
});

$('#btn-hint').addEventListener('click', useHint);

/* ---------- koleksiyonda gezinme ---------- */
$('#coll-prev').addEventListener('click', () => collStep(-1));
$('#coll-next').addEventListener('click', () => collStep(1));

// parmakla kaydırma
let swipeX = null;
const stage = $('#coll-stage');
stage.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive:true });
stage.addEventListener('touchend', e => {
  if (swipeX === null) return;
  const fark = e.changedTouches[0].clientX - swipeX;
  swipeX = null;
  if (Math.abs(fark) > 40) collStep(fark < 0 ? 1 : -1);
});
// klavye (masaüstünde test için)
document.addEventListener('keydown', e => {
  if (!$('#scr-collection').classList.contains('is-active')) return;
  if (e.key === 'ArrowRight') collStep(1);
  if (e.key === 'ArrowLeft')  collStep(-1);
});

$('#rg-prev').addEventListener('click', () => { buzz(8); renderMap(mapRegion - 1); });
$('#rg-next').addEventListener('click', () => { buzz(8); renderMap(mapRegion + 1); });

/* ---------- sertifika ---------- */
$('#btn-cert').addEventListener('click', () => {
  $('#cert-ask').hidden   = false;
  $('#cert-paper').hidden = true;
  $('#cert-hint').hidden  = true;
  $('#btn-cert-back').hidden = true;
  $('#cert-name').value = save.name || '';
  showScreen('scr-cert');
  setTimeout(() => $('#cert-name').focus(), 250);
});

$('#btn-cert-make').addEventListener('click', () => {
  const ad = ($('#cert-name').value || '').trim();
  if (!ad){ $('#cert-name').focus(); buzz(50); return; }

  save.name = ad;
  persist();

  $('#cert-out-name').textContent = ad;
  $('#cert-stars').textContent = totalStars() + ' / ' + (CONFIG.LEVELS * 3) + ' yıldız';
  $('#cert-date').textContent = new Date().toLocaleDateString('tr-TR',
    { day:'numeric', month:'long', year:'numeric' });

  $('#cert-ask').hidden   = true;
  $('#cert-paper').hidden = false;
  $('#cert-hint').hidden  = false;
  $('#btn-cert-back').hidden = false;

  sndLevel();
  buzz([25,60,25,60,90]);
  confetti(120);
});

$('#btn-cert-back').addEventListener('click', () => {
  renderMap(regionOf(save.unlocked));
  showScreen('scr-map');
});

$('#btn-collection').addEventListener('click', () => {
  beep(560, 0.05, 'sine');
  renderCollection();
  showScreen('scr-collection');
});

$('#btn-next').addEventListener('click', nextLevel);
$('#btn-retry').addEventListener('click', () => startLevel(state.level));

$('#btn-quit').addEventListener('click', () => {
  clearInterval(state.timer);
  renderMap(regionOf(state.level));
  showScreen('scr-map');
});

$('#btn-sound').addEventListener('click', () => {
  save.sound = !save.sound;
  persist();
  updateSoundBtn();
  if (save.sound) SFX.musicOn(); else SFX.musicOff();
});

// data-go="ekran-id" olan bütün butonlar
$$('[data-go]').forEach(b => b.addEventListener('click', () => {
  const target = b.dataset.go;
  if (target === 'scr-map') renderMap(regionOf(save.unlocked));
  if (target === 'scr-start') refreshStart();
  showScreen(target);
}));

document.addEventListener('visibilitychange', () => {
  if (document.hidden){ clearInterval(state.timer); SFX.musicOff(); }
  else if ($('#scr-game').classList.contains('is-active')){ startTimer(); SFX.musicOn(); }
});

document.addEventListener('dblclick', e => e.preventDefault(), { passive:false });

/* ---------------------------------------------------------
   Başlat
   --------------------------------------------------------- */
loadSave();
SFX.init();
updateSoundBtn();
refreshStart();
document.body.classList.toggle('ads-on', !!(window.ADS && window.ADS.enabled()));
