/* =========================================================
   REKLAM KATMANI — GameMonetize
   ---------------------------------------------------------
   NASIL ÇALIŞIR
   1) gamemonetize.com'da yayıncı hesabı aç (ücretsiz).
   2) "Add Game" ile oyununu ekle; oyunun yayınlandığı URL'yi ver
      (örn. https://kullanici.github.io/hafiza-oyunu/).
   3) Sana 32 haneli bir Game ID verirler.
   4) O ID'yi aşağıdaki GAME_ID satırına yapıştır. Bitti.

   GAME_ID boş kaldığı sürece reklam katmanı tamamen devre dışıdır;
   oyun hiçbir şey göstermeden normal akışına devam eder. Yani fuar
   sürümünü ayrıca değiştirmene gerek yok.
   ========================================================= */
'use strict';

window.ADS = (function () {

  const CFG = {
    // GameMonetize Game ID — "Ataturk, Ulku ve Foks"
    // Boşaltırsan reklam katmanı tamamen devre dışı kalır (fuar sürümü için).
    GAME_ID: 'aot3i031m3o60mzd9scv1sxbrsptjfd4',

    /* DİKKAT: Çocuk içeriği bildirimi KODDAN yapılamaz. GameMonetize
       SDK'sının böyle bir ayarı yok. Bildirimi yayıncı panelinden
       (oyun ayarları / kategori) yapman gerekir. AB'de DSA 28. madde
       gereği reşit olmayanlara profil bazlı reklam yasaktır. */

    /* Reklamın BAŞLAMASI için tanınan süre. Bu sürede reklam
       başlamazsa oyun serbest bırakılır — çocuk boş ekrana bakmasın.
       Reklam başlarsa (SDK_GAME_PAUSE) bu sayaç iptal edilir, yani
       gerçek bir reklam asla yarıda kesilmez. */
    START_TIMEOUT_MS: 3000,

    // İki reklam arasında en az bu kadar süre geçsin (saniye).
    MIN_GAP_S: 45
  };

  let ready = false;
  let loading = false;
  let lastShown = 0;
  let pending = null;      // sonucu bekleyen fonksiyon
  let guardTimer = null;   // "reklam hiç başlamadı" sayacı

  function clearGuard(){
    if (guardTimer){ clearTimeout(guardTimer); guardTimer = null; }
  }

  const enabled = () => CFG.GAME_ID.trim().length > 0;

  /* ---------- SDK yükleme ---------- */
  function load() {
    if (!enabled() || loading) return;
    loading = true;

    /* SDK yalnızca gameId ve onEvent tanır (resmî SDK belgesi).
       Buraya başka anahtar eklemeyin — tanınmayan ayarlar en iyi
       ihtimalle yok sayılır, kötü ihtimalle doğrulamayı bozar. */
    window.SDK_OPTIONS = {
      gameId: CFG.GAME_ID.trim(),
      onEvent: function (e) {
        switch (e.name) {
          case 'SDK_READY':
            ready = true;
            break;
          case 'SDK_GAME_PAUSE':
            /* Reklam GERÇEKTEN başladı. Zaman aşımı sayacını iptal et:
               o sayaç "reklam hiç başlamadı" durumu için; başlamış bir
               reklamı yarıda kesmemeli. */
            clearGuard();
            document.dispatchEvent(new CustomEvent('ads:pause'));
            break;
          case 'SDK_GAME_START':
            // Reklam bitti — oyuna dön
            document.dispatchEvent(new CustomEvent('ads:resume'));
            finish();
            break;
          case 'SDK_ERROR':
          case 'AD_ERROR':
            settle(false);
            break;
        }
      }
    };

    /* Resmî SDK belgesindeki yükleyicinin birebir aynısı:
       ilk <script> etiketinden önce ekler ve id verir (id, çifte
       yüklemeye karşı onların koruması). Sapma bırakmıyoruz. */
    (function (a, b, c) {
      var d = a.getElementsByTagName(b)[0];
      if (!a.getElementById(c)) {
        var e = a.createElement(b);
        e.id = c;
        e.src = 'https://api.gamemonetize.com/sdk.js';
        e.onerror = function () { ready = false; settle(false); };
        d.parentNode.insertBefore(e, d);
      }
    })(document, 'script', 'gamemonetize-sdk');
  }

  /* ---------- örtü ---------- */
  function cover(on) {
    const el = document.getElementById('ad-cover');
    if (el) el.classList.toggle('show', !!on);
  }

  /* Bekleyen reklam isteğini sonuçlandırır.
     ok = true  → reklam gerçekten baştan sona gösterildi
     ok = false → hata, doluluk yok veya zaman aşımı */
  function settle(ok) {
    clearGuard();
    cover(false);
    if (pending) { const p = pending; pending = null; p(!!ok); }
  }
  function finish() { settle(true); }

  /* ---------- dışa açık API ---------- */

  /* Araya giren (interstitial) reklam.
     Her durumda çözülen bir Promise döner — reklam yoksa, hata
     verirse veya zaman aşımına uğrarsa bile oyun asla kilitlenmez. */
  function interstitial() {
    if (!enabled()) return Promise.resolve('devre-disi');

    const now = Date.now() / 1000;
    if (now - lastShown < CFG.MIN_GAP_S) return Promise.resolve('cok-erken');
    if (!ready || !window.sdk || typeof window.sdk.showBanner !== 'function') {
      return Promise.resolve('hazir-degil');
    }

    lastShown = now;
    cover(true);

    return new Promise(function (resolve) {
      pending = resolve;
      // Reklam BAŞLAMAZSA devreye girer. Başlarsa SDK_GAME_PAUSE bunu
      // iptal eder, böylece gerçek reklam yarıda kesilmez.
      guardTimer = setTimeout(function () {
        document.dispatchEvent(new CustomEvent('ads:resume'));
        settle(false);
      }, CFG.START_TIMEOUT_MS);

      try { window.sdk.showBanner(); }
      catch (err) { settle(false); }
    });
  }

  /* Ödüllü (rewarded) reklam.
     Oyuncu İSTEYEREK izler, karşılığında ipucu kazanır. Araya giren
     reklamdan hem daha çok kazandırır hem de rahatsız etmez.
     Çözülen değer: true → ödül verilebilir, false → verilmemeli. */
  function rewarded(){
    if (!enabled()) return Promise.resolve(false);
    if (!ready || !window.sdk || typeof window.sdk.showBanner !== 'function'){
      return Promise.resolve(false);
    }

    lastShown = Date.now() / 1000;
    cover(true);

    return new Promise(function (resolve) {
      pending = resolve;
      guardTimer = setTimeout(function () {
        document.dispatchEvent(new CustomEvent('ads:resume'));
        settle(false);
      }, CFG.START_TIMEOUT_MS);

      try { window.sdk.showBanner(); }
      catch (err) { settle(false); }
    });
  }

  load();

  return {
    enabled: enabled,
    interstitial: interstitial,
    rewarded: rewarded,
    config: CFG
  };
})();
