# =====================================================================
#  GameMonetize yukleme paketi uretir.
#
#  IKI SORUNU BIRDEN COZER:
#
#  1) Compress-Archive KULLANILMIYOR. PowerShell 5.1 zip yollarini ters
#     boluyle yaziyor (assets\x.jpg); sunucu tarafindaki aciciler bunu
#     klasor saymayip tek dosya adi sanıyor ve dosyalar 404 donuyordu.
#     Burada her girdinin adini duz boluyle biz veriyoruz.
#
#  2) KOD DOSYALARI SURUMLENIYOR (game.js -> game.2609091042.js gibi).
#     GameMonetize'in CDN'i dosyalari ayri ayri onbellege aliyor; yeni
#     index.html ile ESKI game.js eslesince oyun bozuluyordu. Her paket
#     yeni dosya adlari tasidigi icin onbellek eski surumu veremez.
#
#  Kullanim:   powershell -ExecutionPolicy Bypass -File build-zip.ps1
# =====================================================================
param(
  [string]$Version = (Get-Date -Format 'yyMMddHHmm')
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = $PSScriptRoot
$dst = Join-Path (Split-Path $src -Parent) ("hafiza-oyunu-{0}.zip" -f $Version)

# --- index.html'deki kod dosyasi referanslarini surumlu adlarla degistir ---
$html = [System.IO.File]::ReadAllText((Join-Path $src 'index.html'), [System.Text.Encoding]::UTF8)
$html = $html.Replace('href="style.css"', ('href="style.{0}.css"' -f $Version))
$html = $html.Replace('src="ads.js"',     ('src="ads.{0}.js"'     -f $Version))
$html = $html.Replace('src="game.js"',    ('src="game.{0}.js"'    -f $Version))

$tmpHtml = Join-Path $env:TEMP ("index-{0}.html" -f $Version)
[System.IO.File]::WriteAllText($tmpHtml, $html, (New-Object System.Text.UTF8Encoding $false))

# --- zip icerigi: (kaynak dosya, zip icindeki ad) ---
$files = @(
  @{ p = $tmpHtml;                                n = 'index.html' },
  @{ p = (Join-Path $src 'style.css');            n = ('style.{0}.css' -f $Version) },
  @{ p = (Join-Path $src 'ads.js');               n = ('ads.{0}.js'    -f $Version) },
  @{ p = (Join-Path $src 'game.js');              n = ('game.{0}.js'   -f $Version) },
  @{ p = (Join-Path $src 'manifest.json');        n = 'manifest.json' },
  @{ p = (Join-Path $src 'assets\ulku-child.jpg');    n = 'assets/ulku-child.jpg' },
  @{ p = (Join-Path $src 'assets\sfx\flip.ogg');      n = 'assets/sfx/flip.ogg' },
  @{ p = (Join-Path $src 'assets\sfx\match.ogg');     n = 'assets/sfx/match.ogg' },
  @{ p = (Join-Path $src 'assets\sfx\wrong.ogg');     n = 'assets/sfx/wrong.ogg' },
  @{ p = (Join-Path $src 'assets\sfx\level.ogg');     n = 'assets/sfx/level.ogg' },
  @{ p = (Join-Path $src 'assets\sfx\music.mp3');     n = 'assets/sfx/music.mp3' },
  @{ p = (Join-Path $src 'assets\sfx\LISANSLAR.txt'); n = 'assets/sfx/LISANSLAR.txt' }
)

if (Test-Path $dst) { Remove-Item $dst -Force }

$zip = [System.IO.Compression.ZipFile]::Open($dst, 'Create')
try {
  foreach ($f in $files) {
    if (-not (Test-Path -LiteralPath $f.p)) { Write-Output ("  EKSIK: " + $f.n); continue }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip, $f.p, $f.n, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    Write-Output ("  + " + $f.n)
  }
} finally {
  $zip.Dispose()
  Remove-Item $tmpHtml -Force -ErrorAction SilentlyContinue
}

Write-Output ""
Write-Output ("Surum : {0}" -f $Version)
Write-Output ("Zip   : {0}  ({1:N0} bayt)" -f $dst, (Get-Item $dst).Length)
