# BanPhase

**Master the Draft.** — Mobil öncelikli, ücretsiz, reklamsız ban aşaması yardımcısı.
V1 Türkçe. Hesap yok, sunucu yok, veri cihazda.

**Canlı:** <https://metenyu.github.io/BanPhase/>

## Durum

Faz 3 tamam: çalışan ban tahtası + **133 kahramanlık gerçek kimlik listesi**.
Turnuva verisi **henüz yok** (Liquipedia başvurusu bekliyor); uygulama istatistik,
build veya sıralama iddia etmiyor — yalnızca kimlik (ad, rol).

![Mobil ban tahtası](docs/ekran-mobil.png)

## Doğrulama (24.10.2026)

Edge headless + CDP ile gerçek tarayıcıda koşuldu:

- 133 kahraman, 10 ban slotu, 7 rol çipi; 390 px ve 1300 px'te yatay taşma yok
- arama: `hirara` → 1, `suikast` → 29, `destek` → 15, `chang` → 1, `zzzz` → 0
  (Türkçe karakter katlaması çalışıyor)
- baş harfler: `Popol and Kupa` → PK, `X.Borg` → XB, `Chang'e` → CH, `Yi Sun-shin` → YS
- ban → sıra ilerleme → takım sayacı (5/5) → `localStorage`'a yazım
- geri al, sıfırla, 10 ban dolunca özet diyaloğu
- konsol hatası ya da yakalanmamış istisna yok
- service worker `banphase-v2` kayıtlı; **ağ kapalıyken** sayfa 133 kahraman ve
  10 slotla açılıyor

![Ban özeti](docs/ekran-ozet.png)

## Ne yapar (V1)

- 5'e 5 ban tahtası, sırayla mavi/kırmızı
- 30 saniyelik ban süresi (başlat/duraklat, süre dolunca atlama)
- 133 kahraman içinde arama + rol filtresi (Türkçe karakter duyarsız)
- Geri al, tahtayı sıfırla, özeti panoya kopyala
- Durum `localStorage`'da; sayfa yenilenince kaldığın yerden devam
- PWA: çevrimdışı açılır, ana ekrana eklenebilir

## Çalıştırma

Statik dosyalar; ama `fetch()` ve service worker için sunucu gerekir.

```powershell
npx --yes serve . -l 4321     # sonra: http://localhost:4321
```

Kahraman listesini yeniden üretmek için (kaynak dosya değiştiyse):

```powershell
node tools/build-heroes.mjs
```

## Yapı

```
index.html                     tek sayfa
assets/css/style.css           tema + yerleşim
assets/js/app.js               durum, ban mantığı, zamanlayıcı
data/heroes.json               üretilen kimlik listesi (133 kahraman)
data/source/                   ham kaynak (Fandom + Rone eşlemesi)
tools/build-heroes.mjs         kaynaktan data/heroes.json üretir
manifest.webmanifest           PWA tanımı
sw.js                          kabuk önbelleği
icons/                         yer tutucu ikon (svg + 192/512 png)
docs/                          kararlar, Faz 2 denetimi, Liquipedia başvurusu
```

## Veri politikası

1. **Rone istatistik ve build'leri V1'de kullanılmaz.** Verisi Eylül 2025 damgalı
   (`2.1.18`) ve oyun verisi üzerindeki hak belirsiz. Arşiv yalnızca araştırma
   içindir, yayımlanmaz. Ayrıntı: `docs/FAZ2-RAPORU.md`.
2. **Kahraman kimliği** Fandom MLBB Wiki'den (CC BY-SA 3.0) alınır; `roneId`
   yalnızca eşleme içindir. Yayımlanan dosya id + ad + rol içerir; istatistik yok.
3. **Turnuva verisi Liquipedia'dan** gelecek, onay sonrası, günde en fazla bir kez
   çekilip depoda JSON olarak yayımlanacak (statik uygulamanın başka veri kaynağı yok).
4. **Ham veri dökümü yayımlanmaz**; yalnızca türetilmiş özet istatistik.
5. Her turnuva görünümünde makale bağlantısı + erişim tarihi bulunur.
6. Moonton'a ait görsel kullanılmaz; kahraman görselleri renk + baş harf yer tutucusudur.

## Lisans

| Kapsam | Lisans |
|---|---|
| Kod (`index.html`, `assets/`, `sw.js`, `tools/`) | MIT — bkz. `LICENSE` |
| `data/heroes.json`, `data/source/` | CC BY-SA 3.0 — atıf: [Fandom MLBB Wiki](https://mobile-legends.fandom.com/) |
| `data/liquipedia/` (gelecek) | CC BY-SA 3.0 — atıf: Liquipedia |

Veriyi JS paketine gömmeyin; ayrı JSON kalsın ki lisanslar ayrışsın.

## Yayın

`main`'e push otomatik yayına girer (Pages → Deploy from a branch, `/ (root)`).
Tarayıcı tarafında dosya güncellediyseniz **`sw.js` içindeki `VERSION` değerini
artırın**, aksi hâlde dönen ziyaretçi eski dosyayı önbellekten alır.

## Sıradaki adımlar

- [ ] Liquipedia başvurusu (`docs/LIQUIPEDIA-BASVURU.md`, tek eksik: iletişim adresi)
- [ ] Ban sırası varyantları (turnuva formatına göre yapılandırma)
- [ ] Pick aşaması
- [ ] Turnuva/ban istatistiği ekranı (Liquipedia onayı sonrası)
- [ ] Erişilebilirlik turu (ekran okuyucu, klavye ile tam gezinme)

## Bilinen sınırlar

- Ban sırası düz almaşık (mavi başlar); MLBB formatındaki 3+3 / 5+5 varyantları
  `CONFIG` içinden ayarlanacak.
- Roller Fandom verisine dayanıyor; Moonton'un resmî listesiyle karşılaştırılmadı.
- Sayaç durumu sayfa yenilemede sıfırlanır (tahta korunur, süre korunmaz).
- Yeni sürüm yayına girdiğinde dönen ziyaretçi bir sonraki açılışta güncel sürümü alır.
- Sesli/animasyonlu geri bildirim yok; `prefers-reduced-motion` yalnızca geçişleri kapatıyor.
