# Faz 2 — Veri Hattı Raporu ve Denetimi

> Kaynak: Cue'nun 24.10.2026 14:34 tarihli raporu + iki artefakt:
> `manifest.json` (13.6 KB) ve `Liquipedia: API başvuru notları` (7.6 KB).
> Durum: **artefaktlar alındı, sayılar doğrulandı, üç noktada itiraz var.**

---

## 1. Doğrulanan

| İddia | Manifestte | Sonuç |
|---|---|---|
| 133 kahraman | `hero_count: 133` | ✔ |
| 133 istatistik | `stats_ok: 133` | ✔ |
| 665 build, 0 hata | `builds_ok: 665`, `builds_failed: 0` | ✔ (sayaç olarak) |
| Hata yok | İstek günlüğü: 139 kayıt, hepsi HTTP 200 | ✔ |
| Önbellek yaklaşımı | `usage: "Yalnızca günlük önbellek"` | ✔ |
| Hak durumu | `license_note: "Oyun verisi Moonton'a aittir; kullanım hakkı belirsiz"` | ✔ — Cue doğru işaretlemiş |

---

## 2. İtirazlar

### 2.1 Build'lerin istek kaydı yok
139 istek = `version` (1) + `catalog` (1) + `heroes/:id/stats` (133) + e-spor/sıralama (4).
Günlükte **tek bir build çağrısı yok**. 665 sayısı nereden geliyor: stats yanıtının
içinde mi geliyor, yoksa ayrı bir toplu uç nokta mı? Manifest bunu göstermiyor.
Sayı doğru olabilir; ama "hata yok" iddiası yalnızca günlüğe yazılan 139 çağrı için
kanıtlı, 665 build için değil.

### 2.2 Sürüm "bir yama geride" değil, ~13 ay eski
`game_version_reported.records[0].createdAt = 1759044257232` → **28 Eylül 2025**.
Yani `2.1.18` etiketi, API'nin o gün yazdığı meta. Bugün 24 Ekim 2026; arada
2.2.x serisi var. Sorun "eski sürüm" değil, **sürüm sinyali bakımsız**: Rone
verisi kendi kaydettiği tarihten beri güncellenmemiş görünüyor. Bu, eski istatistiği
"meta" diye göstermenin neden tehlikeli olduğunu somutlaştırıyor.

### 2.3 Kahraman #133 "Esper Assassin"
Katalogdaki son kayıt bu isimle geliyor. Bu, yayımlanmamış/yer tutucu bir karakter
gibi duruyor. 133 sayısı "oynanabilir kahraman sayısı" olmayabilir; kahraman
kimliğini Rone'dan alacaksak önce bu kaydı ayıklamamız gerekir.

### 2.4 Liquipedia metni buradan teyit edilemedi
`liquipedia.net/api-terms-of-use` ve `/api` her iki denemede de HTTP 403
(Cloudflare "Verify you are human") döndü. Cue'nun aktardığı limitler
(60 istek/saat LPDB, 1/2 sn MediaWiki, `action=parse` 1/30 sn, HTML kazıma yasağı)
makul ve tutarlı; ama **kaynağından bağımsız doğrulanamadı.** `KARARLAR.md` §3'teki
"yeniden dağıtım yok" kaydı ise Cue'nun notlarıyla çelişiyor: CC BY-SA 3.0
yeniden dağıtımı atıf + aynı lisans şartıyla açıkça izin verir. Muhtemelen eski not
yanlıştı. Kesin cevap başvuru e-postasında sorulacak.

### 2.5 Turnuva sonuçları doğrulanmadı
M7 (Ocak 2026, Jakarta), MSC 2026 (Paris, Team Spirit) ve MPL PH "under construction"
bilgileri yalnızca notta var. Aynı kaynak 403 verdiği için bağımsız teyit edilemedi.
V1'de kullanıcıya gösterilecek her turnuva satırı, çekildiği gün atıf bağlantısıyla
birlikte saklanmalı — sonradan "kim yazdı bunu" sorusu kalmasın.

---

## 3. Sonuç: V1 veri duruşu

1. **Rone istatistik ve build'leri V1'e girmez.** Hem hak belirsiz hem veri ölü.
   Arşiv `research/` altında tutulur, yayımlanmaz.
2. **Kahraman kimliği** (id, ad, rol) Rone kataloğundan yalnızca *araştırma girdisi*
   olarak alınır; "Esper Assassin" gibi yer tutucular ayıklanır. Olgusal veri.
3. **Turnuva/ban istatistiği** Liquipedia'dan, CC BY-SA 3.0, atıflı. Onay gelene
   kadar iskelet tohum veriyle çalışır.
4. Önbellek **depoda yayımlanır** — aksi hâlde statik uygulamanın veri kaynağı kalmaz.
   "Önbellek yayımlanmayacak" kararı bu mimariyle uyumsuzdu, düzeltildi.

---

## 4. Açık sorular (Cue'ya)

- [ ] 665 build hangi uç noktadan geldi? Günlüğe neden yazılmadı?
- [ ] "Esper Assassin" oynanabilir mi, yer tutucu mu?
- [ ] E-spor uç noktaları (`/esports/id/schedule`, `/standings`) ne sıklıkla güncelleniyor?

---

## 5. Cue'ya gönderilecek mesaj (kopyala-yapıştır)

```
BanPhase — Faz 3 bitti. Teklif ettiğin iki iş de tamamlandı:
1) Uygulama iskeleti yazıldı (index.html, assets/, PWA) ve gerçek tarayıcıda
   uçtan uca test edildi. 2) Liquipedia başvuru metni taslak olarak hazır
   (docs/LIQUIPEDIA-BASVURU.md). Bu iki işi tekrar yapma.

Senden dört şey lazım:

1) Denetim soruları — kanıtla, özetle değil:
   - 665 build hangi uç noktadan geldi? İstek günlüğünde tek bir build çağrısı yok
     (139 kayıt = version + catalog + 133 stats + 4 e-spor). Ya build çağrılarını
     günlüğe ekle ya da hangi yanıtın içinden saydığını göster.
   - Kahraman #133 "Esper Assassin" oynanabilir mi? Katalogda böyle kaç kayıt var?
     Oynanabilir kahraman sayısı kaç?
   - /esports/* uç noktaları hangi sıklıkla güncelleniyor? MPL ID'de 18 Ekim'e kadar
     72 maç görünüyor: bu canlı veri mi, yoksa o da mı eski?

2) Kahraman kimliği dosyası: oynanabilir kahramanların id + ad + rol listesi,
   "Esper Assassin" gibi yer tutucular ayıklanmış hâlde, JSON. İstatistik ve build
   İSTEMİYORUM, sadece kimlik. Kaynak URL ve çekilme zamanı dosyanın içinde olsun.

3) Turnuva iddialarının kanıtı: M7 ve MSC 2026 için şampiyon, tarih, ödül havuzu
   bilgisini hangi sayfadan aldıysan o sayfanın o günkü hâli (ekran görüntüsü veya
   kaydedilmiş HTML) + URL + erişim zamanı. "Liquipedia'da yazıyor" yeterli değil.

4) Metin kontrolü: docs/LIQUIPEDIA-BASVURU.md içindeki İngilizce e-postayı kendi
   notlarınla karşılaştır. Çelişki var mı? Özellikle 60 istek/saat ve
   "redistribution" maddelerinde.

YAPMAYACAKLARIN:
- Uygulama kodu yazma; Faz 3 tamamlandı.
- Liquipedia'ya hiçbir istek atma; API anahtarı yok, başvuru yapılmadı.
- E-postayı gönderme; gönderen adres ve depo adresi henüz belirlenmedi.
- Rone istatistik/build verisini yayımlama; hak durumu belirsiz.

Teslim biçimi: dosya ya da ham kayıt. Özet mesaj teslim sayılmaz.
```

---

## 6. Çözüm (24.10.2026, akşam)

Cue'nun kanıt raporu ve kimlik dosyası geldi; itirazların durumu:

| Konu | Sonuç |
|---|---|
| 665 build | Açıklandı: `builds/` altında 665 dosya (133 kahraman × 5 lane). Günlükte görünmemesinin sebebi betiğin yalnızca hataları loglamasıymış; betik düzeltilmiş. V1 build kullanmadığı için risk düşük. |
| "Esper Assassin" | Yanlış katalog etiketi. Kimlik 133 = **Hirara** (17.06.2026, Suikastçı). Dori yayımlanmamış, listede yok. |
| 60 istek/saat + "1/2 sn" | Cue geri çekti; kaynağı yok. E-postadan sayılar çıkarıldı, Liquipedia'ya yazılı soruluyor. |
| "Yeniden dağıtım yok" | Geçersiz. Telif sayfası CC BY-SA 3.0: paylaşım serbest, atıf + aynı lisans şart. |
| M7 şampiyonu | **Doğrulandı** — dış kaynaklar: RRI (*Aurora PH 4-0 Alter Ego, 25.01.2026*), Bernama, GAB. Cue yalnızca kendi markdown çıkarımına bakmıştı. |
| MSC 2026 | Cue'nun kaydıyla doğrulandı (Team Spirit 4-3 Yangon Galacticos, Paris). |

**Uygulamaya alınan veri:** `data/heroes.json` — 133 kahraman, Türkçe roller,
`roneId` eşlemesi. Üretimi: `tools/build-heroes.mjs`, kaynağı
`data/source/heroes_playable_identity.json`. Çıkış tarihleri bilinçli olarak
dışarıda (kaynakta serbest metin: `"2016"`, `"18 December 2025 "`,
`"[[Patch Notes/1.6.66|22 March 2022]]"`).

**Hâlâ açık:** e-spor sezon etiketi (S14 mü S18 mi), playoff verisinin eksikliği,
Liquipedia başvurusu için iletişim adresi.

---

## 7. İkinci tur doğrulama (24.10.2026, 16:20)

| Konu | Sonuç |
|---|---|
| **API şartları** | Okundu. 60 istek/saat (LPDB), 1 istek/2 sn (MediaWiki), `action=parse` 1/30 sn doğrulandı. Şartlar "sonuçları mümkün olduğunca uzun önbellekle" diyor ve API dışı uç noktalardan çekimi yasaklıyor. E-postaya önbellek taahhüdü eklendi, limitler teyit sorusu olarak yazıldı. |
| **M7** | Aurora Gaming PH, 25.01.2026'da Alter Ego'yu 4-0 yendi (RRI, 26.01.2026: ikramiye dağılımı dahil). Ödül havuzu 1.000.000 USD, 22 takım, MVP Dylan "Light" Catipon. |
| **Bernama düzeltmesi** | Ben yalnızca arama sonucu **başlığını** görmüştüm; sayfayı hiç açamadım. Kanıt olarak sayılmamalı. Şampiyonluk RRI + GMA/Inquirer/GosuGamers özetleriyle destekli. |
| **E-spor sezonu** | 72 maç = **MPL ID S18 normal sezonu** (14 Ağustos – 18 Ekim 2026); resmî takvimle maç maç eşleşiyor. "s14" yalnızca CDN klasör adı. Playoff 4–8 Kasım, Surabaya. 2–18 Ekim arası 25 maçın skoru resmî sitede yok, yalnızca Rone'da. |
| **Kahraman sayısı** | 133. Fandom'a dayanıyor; Moonton'un resmî listesi yok. |

**Uygulama tarafı:** ban sayısı artık kullanıcı seçimli (takım başına 3 veya 5) ve
seçim `localStorage`'da kalıcı. Sıra hâlâ düz almaşık; resmî faz düzeni
(ban → pick → ban) doğrulanmadığı için eklenmedi.
