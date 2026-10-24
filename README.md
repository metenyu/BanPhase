# BanPhase

**Master the Draft.** — Mobil öncelikli, ücretsiz, reklamsız ban aşaması yardımcısı.
V1 Türkçe. Hesap yok, sunucu yok, veri cihazda.

## Durum

Faz 3 iskeleti. Çalışan ban tahtası var; turnuva verisi **henüz yok** (Liquipedia
onayı bekleniyor). Arayüz şu an `data/heroes.json` içindeki 12 kahramanlık tohum
veriyle çalışıyor — kimlik alanları dışında bir şey iddia etmiyor.

![Mobil ban tahtası](docs/ekran-mobil.png)

## Doğrulama (24.10.2026)

Edge headless + CDP ile gerçek tarayıcıda koşuldu:

- 12 kahraman, 10 ban slotu, 7 rol çipi yüklendi; 430 px ve 1300 px'te yatay taşma yok
- ban → sıra ilerleme → takım sayacı (5/5) → `localStorage`'a yazım
- geri al, sıfırla, arama ("fanny" → 1, "suikast" → 3, "destek" → 2)
- 10 ban dolunca özet diyaloğu açılıyor, metin doğru, sayaç duruyor
- konsol hatası ya da yakalanmamış istisna yok
- service worker kayıtlı (`banphase-v1`), kabuk önbellekte; ağ kapalıyken sayfa
  12 kahraman ve 10 slotla açılıyor

![Ban özeti](docs/ekran-ozet.png)

## Ne yapar (V1)

- 5'e 5 ban tahtası, sırayla mavi/kırmızı
- 30 saniyelik ban süresi (başlat/duraklat, süre dolunca atlama)
- Kahraman araması + rol filtresi (Türkçe karakter duyarsız)
- Geri al, tahtayı sıfırla, özeti panoya kopyala
- Durum `localStorage`'da; sayfa yenilenince kaldığın yerden devam
- PWA: çevrimdışı açılır, ana ekrana eklenebilir

## Çalıştırma

Statik dosyalar; ama `fetch()` ve service worker için sunucu gerekir.

```powershell
# Node varsa
npx --yes serve . -l 4321
# sonra: http://localhost:4321
```

VS Code kullanıyorsan Live Server eklentisi de yeterli.

## Yapı

```
index.html                 tek sayfa
assets/css/style.css       tema + yerleşim
assets/js/app.js           durum, ban mantığı, zamanlayıcı
data/heroes.json           tohum veri (kimlik: id, ad, rol)
manifest.webmanifest       PWA tanımı
sw.js                      kabuk önbelleği
icons/                     yer tutucu ikon (svg + 192/512 png)
docs/                      kararlar, Faz 2 denetimi, Liquipedia başvurusu
```

## Veri politikası

1. **Rone Arena API'si V1'de kullanılmaz.** Verisi ~13 ay eski damgalı
   (`2.1.18`, Eylül 2025 kaydı) ve oyun verisi üzerindeki hak belirsiz.
   Arşivi yalnızca araştırma içindir, yayımlanmaz. Ayrıntı: `docs/FAZ2-RAPORU.md`.
2. **Turnuva verisi Liquipedia'dan** gelecek, onay sonrası, günde en fazla bir kez
   çekilip depoda JSON olarak yayımlanacak (statik uygulamanın başka veri kaynağı yok).
3. **Ham veri dökümü yayımlanmaz**; yalnızca türetilmiş özet istatistik.
4. Her turnuva görünümünde makale bağlantısı + erişim tarihi bulunur.
5. Moonton'a ait görsel kullanılmaz; kahraman görselleri renk + baş harf yer tutucusudur.

## Lisans

| Kapsam | Lisans |
|---|---|
| Kod (`index.html`, `assets/`, `sw.js`) | MIT — bkz. `LICENSE` |
| `data/liquipedia/` (türetilmiş turnuva verisi) | CC BY-SA 3.0, atıf: Liquipedia |
| `data/heroes.json` (tohum kimlik listesi) | MIT |

Veriyi JS paketine gömmeyin; ayrı JSON kalsın ki iki lisans ayrışsın.

## Sıradaki adımlar

- [ ] GitHub deposu + Pages yayını
- [ ] Liquipedia başvurusu (`docs/LIQUIPEDIA-BASVURU.md`, 3 alan doldurulacak)
- [ ] Ban sırası varyantları (turnuva formatına göre yapılandırma)
- [ ] Pick aşaması
- [ ] Gerçek kahraman listesi (yer tutucu kayıtlar ayıklanmış)
- [ ] `prefers-reduced-motion`, ekran okuyucu turu

## Bilinen sınırlar

- Ban sırası şu an düz almaşık (mavi başlar); MLBB turnuva formatındaki
  3+3 / 5+5 varyantları `CONFIG` içinden ayarlanacak.
- 12 kahraman tohum veri; arama/filtre davranışını denemek için var.
- Sayaç durumu sayfa yenilemede sıfırlanır (tahta korunur, süre korunmaz).
- Sesli/animasyonlu geri bildirim yok; `prefers-reduced-motion` yalnızca geçişleri kapatıyor.
