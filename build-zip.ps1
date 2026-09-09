# GameMonetize icin zip uretir.
# Compress-Archive KULLANILMIYOR: PowerShell 5.1 yollari ters boluyle yaziyor
# (assets\x.jpg) ve sunucu tarafindaki aciciler bunu klasor saymiyor -> 404.
# Burada her girdinin adini duz boluyle biz veriyoruz.
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = 'C:\Users\Enes\Documents\fuar-oyunu'
$dst = 'C:\Users\Enes\Documents\fuar-oyunu-gamemonetize.zip'

# Zip'e girecek dosyalar (yol, zip icindeki ad)
$files = @(
  @{ p = 'index.html';                  n = 'index.html' },
  @{ p = 'style.css';                   n = 'style.css' },
  @{ p = 'game.js';                     n = 'game.js' },
  @{ p = 'ads.js';                      n = 'ads.js' },
  @{ p = 'manifest.json';               n = 'manifest.json' },
  @{ p = 'assets\ulku-child.jpg';       n = 'assets/ulku-child.jpg' },
  @{ p = 'assets\sfx\flip.ogg';         n = 'assets/sfx/flip.ogg' },
  @{ p = 'assets\sfx\match.ogg';        n = 'assets/sfx/match.ogg' },
  @{ p = 'assets\sfx\wrong.ogg';        n = 'assets/sfx/wrong.ogg' },
  @{ p = 'assets\sfx\level.ogg';        n = 'assets/sfx/level.ogg' },
  @{ p = 'assets\sfx\music.mp3';        n = 'assets/sfx/music.mp3' },
  @{ p = 'assets\sfx\LISANSLAR.txt';    n = 'assets/sfx/LISANSLAR.txt' }
)

if (Test-Path $dst) { Remove-Item $dst -Force }

$zip = [System.IO.Compression.ZipFile]::Open($dst, 'Create')
try {
  foreach ($f in $files) {
    $full = Join-Path $src $f.p
    if (-not (Test-Path -LiteralPath $full)) { Write-Output ("EKSIK: " + $f.p); continue }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip, $full, $f.n, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    Write-Output ("  + " + $f.n)
  }
} finally {
  $zip.Dispose()
}

Write-Output ""
Write-Output ("Zip: {0}  ({1} bayt)" -f $dst, (Get-Item $dst).Length)
