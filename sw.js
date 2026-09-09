/* =========================================================
   ÇEVRİMDIŞI DESTEĞİ (Service Worker)
   ---------------------------------------------------------
   Amaç: fuar alanında yüzlerce kişi aynı anda mobil veri
   kullanırken bağlantı koparsa oyun yine de açılsın.

   İlk açılışta oyun dosyaları telefona kaydedilir. Sonraki
   açılışlarda internet olmasa bile oyun çalışır.

   GÜNCELLEME: Oyunu değiştirdiğinde aşağıdaki SURUM satırını
   artır. Yoksa telefonlarda eski sürüm kalmaya devam eder.
   ========================================================= */
'use strict';

const SURUM  = 'v2';   // Foxy -> Foks adlandırması
const ONBELLEK = 'ataturk-hafiza-' + SURUM;

/* Kurulumda hemen indirilecekler.
   music.mp3 BİLEREK yok: 2,5 MB, ilk açılışı yavaşlatır.
   İlk çalındığında kendiliğinden önbelleğe girer. */
const CEKIRDEK = [
  './',
  './index.html',
  './manifest.json',
  './assets/ulku-child.jpg',
  './assets/sfx/flip.ogg',
  './assets/sfx/match.ogg',
  './assets/sfx/wrong.ogg',
  './assets/sfx/level.ogg'
];

/* Bu adresler ASLA önbelleğe alınmaz — reklam ve ölçüm istekleri
   her zaman canlı olmalı, eski reklam göstermek olmaz. */
function atlanacakMi(url) {
  return /gamemonetize|googlesyndication|doubleclick|imasdk|google-analytics|googletagmanager/i
         .test(url.hostname);
}

/* ---------------------------------------------------------
   KURULUM
   index.html ayrıştırılıp referans verdiği js/css dosyaları da
   alınır. Böylece sürümlü dosya adları (game.2609091110.js gibi)
   elle yazılmadan otomatik önbelleğe girer.
   --------------------------------------------------------- */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(ONBELLEK);
    try { await c.addAll(CEKIRDEK); } catch (err) {}

    try {
      const res  = await fetch('./index.html', { cache: 'reload' });
      const html = await res.text();
      const bulunan = [];
      const kalip = /(?:src|href)="([^"]+\.(?:js|css))"/g;
      let m;
      while ((m = kalip.exec(html)) !== null) {
        if (!/^https?:/i.test(m[1])) bulunan.push(m[1]);
      }
      for (const u of bulunan) {
        try { await c.add(u); } catch (err) {}
      }
    } catch (err) {}

    self.skipWaiting();
  })());
});

/* ---------------------------------------------------------
   ETKİNLEŞME — eski sürümlerin önbelleğini sil
   --------------------------------------------------------- */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const adlar = await caches.keys();
    await Promise.all(
      adlar.filter(a => a.startsWith('ataturk-hafiza-') && a !== ONBELLEK)
           .map(a => caches.delete(a))
    );
    await self.clients.claim();
  })());
});

/* ---------------------------------------------------------
   İSTEKLER
   HTML  : önce ağ (güncelleme hemen gelsin), olmazsa önbellek
   Diğer : önce önbellek (hızlı ve çevrimdışı çalışır)
   --------------------------------------------------------- */
self.addEventListener('fetch', (e) => {
  const istek = e.request;
  if (istek.method !== 'GET') return;

  let url;
  try { url = new URL(istek.url); } catch (err) { return; }
  if (atlanacakMi(url)) return;                 // reklam istekleri dokunulmaz

  // Ses dosyaları Range isteği yapabilir; bunları önce ağa bırak,
  // ağ yoksa önbellekteki tam kopyayı ver.
  if (istek.headers.has('range')) {
    e.respondWith((async () => {
      try { return await fetch(istek); }
      catch (err) {
        const c = await caches.match(istek, { ignoreVary: true });
        return c || Response.error();
      }
    })());
    return;
  }

  if (istek.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(istek);
        const c = await caches.open(ONBELLEK);
        c.put(istek, r.clone());
        return r;
      } catch (err) {
        return (await caches.match(istek)) ||
               (await caches.match('./index.html')) ||
               Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const bulunan = await caches.match(istek, { ignoreVary: true });
    if (bulunan) return bulunan;
    try {
      const r = await fetch(istek);
      if (r && r.status === 200) {
        const c = await caches.open(ONBELLEK);
        c.put(istek, r.clone());
      }
      return r;
    } catch (err) {
      return Response.error();
    }
  })());
});
