# Atatürk, Ülkü ve Foxy — Hafıza Oyunu

50 bölümlük, mobil tarayıcıda çalışan çocuk hafıza oyunu (8–11 yaş).
Kurulum yok, derleme yok, paket yok — saf HTML + CSS + JavaScript.

---

## Dosyalar

```
fuar-oyunu/
├─ index.html      Tüm ekranlar + illüstrasyon kitaplığı (SVG <symbol>)
├─ style.css       Tema, kart tasarımı, bölüm haritası, arka plan
├─ game.js         Oyun mantığı, 50 bölüm, kayıt, ses
├─ ads.js          GameMonetize reklam katmanı (GAME_ID burada)
├─ manifest.json   "Ana ekrana ekle" desteği (PWA)
└─ assets/
   ├─ ulku-child.jpg          Kapak fotoğrafı (kamu malı)
   ├─ ataturk-*.jpg/png       Yedek kamu malı fotoğraflar
   └─ sfx/
      ├─ flip.ogg match.ogg wrong.ogg level.ogg   (Kenney, CC0)
      ├─ music.mp3                                 (Cleyton Kauffman, CC0)
      └─ LISANSLAR.txt                             Lisans kayıtları
```

---

## Yerelde çalıştırma

`index.html` dosyasına çift tıklamak **yetmez** — ses ve `fetch` için
bir sunucu gerekir. Node/Python yoksa PowerShell ile:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Sonra tarayıcıda `http://localhost:8181`.

---

## Bölüm tasarımı

| Bölüm | Çift | Kart | Izgara |
|-------|------|------|--------|
| 1–8   | 3    | 6    | 3×2    |
| 9–18  | 4    | 8    | 4×2    |
| 19–30 | 6    | 12   | 4×3    |
| 31–42 | 8    | 16   | 4×4    |
| 43–50 | 10   | 20   | 4×5    |

- **Kaybetmek yok.** Süre sınırı yok, can yok. Çocuk her bölümü bitirir.
- Performans **yıldızla** ölçülür (1–3). Toplam 150 yıldız.
- Her bölümün kart seti sabittir (bölüm numarasına bağlı), dizilim her
  denemede karışır — yani bölümler birbirinden ayırt edilir ama ezberlenmez.
- Toplam süre ≈ 35 dakika.

Zorluğu değiştirmek için `game.js` içindeki `levelSpec()` fonksiyonuna bak.

---

## Sık yapılacak değişiklikler

Hepsi `game.js` başındaki `CONFIG` bloğunda:

| Ne | Nerede |
|----|--------|
| Bölüm sayısı | `CONFIG.LEVELS` |
| Kart görselleri, isimleri, bilgi metinleri | `CONFIG.POOL` |
| Yanlış eşleşmede kartların açık kalma süresi | `CONFIG.FLIP_BACK_MS` |
| Müzik sesi | `CONFIG.MUSIC_VOLUME` |
| Reklam sıklığı | `CONFIG.ADS_EVERY_N_LEVELS` (şu an 3) |
| Reklam açma/kapama | `ads.js` → `GAME_ID` (boşsa reklam yok) |

**Bilgi metinlerini fuara çıkmadan önce kendi kaynağınla doğrula.**

### Kart görselini fotoğrafla değiştirmek

`CONFIG.POOL` içinde ilgili karta `img` alanı ekle; kod otomatik
fotoğrafı kullanır, çizimi yok sayar:

```js
{ id:'foxy', art:'#art-foxy', tint:'#FFE3C9', name:'Foxy',
  img:'assets/foxy.jpg',
  fact:'...' },
```

### Sesi değiştirmek

`assets/sfx/` içindeki dosyanın **üzerine aynı isimle** yaz.
Dosya bozuksa veya silinirse oyun kendi ürettiği seslere düşer —
hiçbir tarayıcıda sessiz kalmaz.

---

## Reklamlar

Ağ: **GameMonetize**. Game ID `ads.js` içinde bağlı:

```js
GAME_ID: 'aot3i031m3o60mzd9scv1sxbrsptjfd4',
```

**Bu satırı boşaltırsan reklam katmanı tamamen kapanır** — reklamsız bir
fuar sürümü istersen tek yapman gereken bu.

> GameMonetize yeni oyunlara, içerik yöneticisi **onaylayana kadar**
> reklam sunmaz. Onaydan önce "reklam gelmiyor" normaldir.

Kurulu güvenlik önlemleri:

| Ayar | Değer | Neden |
|------|-------|-------|
| `TIMEOUT_MS` | 8000 | Araya giren reklam cevap vermezse oyun kilitlenmesin (fuarda kritik) |
| `REWARD_TIMEOUT_MS` | 3500 | Ödüllü reklamda çocuk ekrana bakıp bekliyor, kısa tutuldu |
| `MIN_GAP_S` | 45 | İki reklam arası en az 45 saniye |
| `CHILD_DIRECTED` | `true` | Çocuk içeriği bildirimi |

**İpucu reklamı başarısız olsa bile ipucu verilir.** Reklam ağının doluluk
sorunu oyuncunun cezası değildir; bkz. `game.js` → `useHint()`.

### Paket üretme

GameMonetize'a yüklenecek zip'i **her zaman** şu betikle üret:

```bash
powershell -ExecutionPolicy Bypass -File build-zip.ps1
```

Betik iki tuzağı birden aşar: zip yollarını düz bölüyle yazar
(`Compress-Archive` ters bölü yazıyor ve dosyalar 404 dönüyor) ve kod
dosyalarını sürümler (`game.js` → `game.2609091040.js`) — böylece CDN
yeni `index.html` ile eski `game.js`'i eşleştiremez.

### Çocuk oyunu olması gelirini etkiler

AB'de **DSA 28. madde**, reşit olmayanlara profil bazlı hedefli reklamı
yasaklar. Oyun yalnızca **kişiselleştirilmemiş** reklam alabilir; bu reklam
başına geliri kabaca yarıya indirir. Ağın panelinde oyunu "child-directed"
işaretlemeyi unutma.

Kaba tahmin: 1000 tam oynayış ≈ 15–20 bin gösterim ≈ **$20–60**.
GameMonetize'ın çekim eşiği $30, ödeme Net30.

**Fuarda reklamı kapalı tutmayı düşün.** Standda oynayan ziyaretçiye reklam
çıkarmak kötü görünür; birkaç yüz oynanmadan gelen gelir zaten sıfıra yakın.
Reklamın asıl anlamı, fuardan sonra QR ile oynamaya devam edenlerde.

---

## Yayınlama

### Seçenek A — GitHub Pages (kalıcı, temiz URL, ücretsiz)

Git deposu ve uzak adres HAZIR. Kalan iki adım:

1. github.com/new → repo adı `hafiza-oyunu`, **Public**, hiçbir kutuyu işaretleme, Create.
2. Bu klasörde:

```bash
git push -u origin main
```

3. Repo → **Settings → Pages → Source: Deploy from a branch → main / (root)** → Save.
4. 1–2 dakika sonra adres: `https://princeagonie.github.io/hafiza-oyunu/`

### Seçenek B — itch.io (en hızlı, git gerekmez)

Klasörü zip'le, itch.io'da yeni proje aç, **Kind of project: HTML**
seçip zip'i yükle, "This file will be played in the browser" işaretle.

### QR kodu

URL hazır olunca herhangi bir ücretsiz QR üreticiye yapıştır, SVG olarak
indir ve fuar afişine bas. **Fuar öncesi gerçek bir telefonla mutlaka test et.**

---

## Lisanslar

- **Kart illüstrasyonları:** bu proje için özgün çizildi — serbest kullanım.
- **Sesler:** CC0 (kamu malı). Ayrıntı: `assets/sfx/LISANSLAR.txt`.
- **Fotoğraflar:** Wikimedia Commons, "Public domain in Turkey".

Atatürk'ün fotoğrafı yalnızca **kapakta** ve ağırbaşlı biçimde kullanılır;
oyun kartlarında portresi yer almaz. Kartlarda onunla özdeşleşen simgeler
(Bandırma Vapuru, 1923 madalyası, Anıtkabir, yeni harfler, tren, bayrak) kullanılır.
