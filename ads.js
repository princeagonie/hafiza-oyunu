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
    // ↓↓↓ GameMonetize'dan aldığın Game ID'yi buraya yapıştır ↓↓↓
    GAME_ID: '',

    // Oyun çocuklara yönelik. Bu bayrak reklam ağına kişiselleştirilmemiş
    // reklam sunmasını bildirir. ÇOCUK OYUNLARINDA AÇIK BIRAK.
    CHILD_DIRECTED: true,

    // Reklam en fazla bu kadar bekletir; süre dolarsa oyun devam eder.
    // Fuarda takılı kalan bir reklam = ölü oyun. Bu yüzden şart.
    TIMEOUT_MS: 8000,

    // İki reklam arasında en az bu kadar süre geçsin (saniye).
    MIN_GAP_S: 45
  };

  let ready = false;
  let loading = false;
  let lastShown = 0;
  let pending = null;      // { resolve }

  const enabled = () => CFG.GAME_ID.trim().length > 0;

  /* ---------- SDK yükleme ---------- */
  function load() {
    if (!enabled() || loading) return;
    loading = true;

    window.SDK_OPTIONS = {
      gameId: CFG.GAME_ID.trim(),
      // Çocuklara yönelik içerik bildirimi
      advertisementSettings: { autoplay: false },
      childDirected: CFG.CHILD_DIRECTED,
      onEvent: function (e) {
        switch (e.name) {
          case 'SDK_READY':
            ready = true;
            break;
          case 'SDK_GAME_PAUSE':
            // Reklam başladı — oyun sesini kıs
            document.dispatchEvent(new CustomEvent('ads:pause'));
            break;
          case 'SDK_GAME_START':
            // Reklam bitti — oyuna dön
            document.dispatchEvent(new CustomEvent('ads:resume'));
            finish();
            break;
          case 'SDK_ERROR':
          case 'AD_ERROR':
            finish();
            break;
        }
      }
    };

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://api.gamemonetize.com/sdk.js';
    s.onerror = function () { ready = false; finish(); };
    document.head.appendChild(s);
  }

  /* ---------- örtü ---------- */
  function cover(on) {
    const el = document.getElementById('ad-cover');
    if (el) el.classList.toggle('show', !!on);
  }

  function finish() {
    cover(false);
    if (pending) { const p = pending; pending = null; p.resolve(); }
  }

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
      pending = { resolve: resolve };
      const guard = setTimeout(function () {
        // SDK cevap vermedi → oyunu serbest bırak
        document.dispatchEvent(new CustomEvent('ads:resume'));
        finish();
      }, CFG.TIMEOUT_MS);

      const orig = resolve;
      pending.resolve = function () { clearTimeout(guard); orig('gosterildi'); };

      try { window.sdk.showBanner(); }
      catch (err) { clearTimeout(guard); finish(); }
    });
  }

  load();

  return {
    enabled: enabled,
    interstitial: interstitial,
    config: CFG
  };
})();
