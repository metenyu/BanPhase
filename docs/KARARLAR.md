# Proje Kararları — **BanPhase**

> **Proje adı: BanPhase** (kesinleşti, 2026-10-24)
> Slogan adayı: *Master the Draft.*
> Bu dosya 4 kişilik ekibin (sen + ChatGPT + Cue + ben) ortak hafızasıdır.

---

## 1. Verilen kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| **İsim** | **BanPhase** | MOBA/esports DNA'sı net, akılda kalıcı, çakışma yok |
| Gelir modeli | Tamamen ücretsiz, reklamsız | Kullanıcı şartı |
| Kahraman görselleri | V1'de Moonton'a ait hiçbir görsel yok. Yer tutucu/orijinal görseller | Telif riski + "resmî uygulama" izlenimi yaratmama |
| Duvar kâğıtları | Özgün ve hakları uygun görseller; MLBB karakter çizimleri sonraki faza | Aynı sebep |
| Turnuva verisi | Liquipedia — açık kaynak + ticari olmayan şartı **kabul edildi** | Ücretsiz ve güvenilir |
| Dil | V1 Türkçe, İngilizce sonra | Kapsamı dar tutmak |
| Hosting | GitHub Pages (statik) | Ücretsiz, PWA uyumlu |
| Hesaplar | Kullanıcı kendisi açacak | Ücretli hizmete geçiş yok |
| Moonton izni | **E-posta gönderilmeyecek** | Hobi projesine yanıt gelmez; haftalar kaybettirir |
| Depo | `github.com/metenyu/banphase` (@metenyu) | GitHub Pages adresi buna bağlı |
| **Veri duruşu (V1)** | Rone istatistik/build **yok**; yalnızca kahraman kimliği. Turnuva verisi Liquipedia'dan | Hak belirsiz + veri 98 yama eski (24.10.2026 kararı) |
| **Önbellek yayını** | Depoda yayımlanır | Sunucu yok; yayımlanmazsa uygulamanın veri kaynağı kalmaz |
| **Kod lisansı** | MIT (kod) + CC BY-SA 3.0 (Liquipedia türevi `data/`) | CC BY-SA şartı; iki lisans ayrı tutulur |

---

## 2. İsim kontrolü — BanPhase

| Kontrol | Sonuç |
|---|---|
| Uygulama mağazası çakışması | Belirgin çakışma bulunamadı |
| `banphase.com` | **Kayıtlı** — 401 auth (park/staging görünümlü, ürün değil) |
| `banphase.app` / `.gg` / `.dev` | DNS kaydı yok → muhtemelen boş |
| GitHub kullanıcı adı `banphase` | Alınmış |

**Neden sorun değil:** GitHub Pages kullanacağız, adres `github.com/<senin-kullanıcıadın>/banphase`
→ `https://<senin-kullanıcıadın>.github.io/banphase/` olacak. `banphase` kullanıcı adı bizim işimizi etkilemiyor.
Domain satın almıyoruz. Bu bir **hukuki görüş değildir**; tam marka taraması (TÜRKPATENT/EUIPO/USPTO)
ancak yayım öncesi gerekirse yapılır.

---

## 3. Veri kaynakları

### Liquipedia
- Durum: kabul edildi.
- Doğrulanan (ikincil kaynak): ücretsiz, **ticari kullanım yok**, atıf zorunlu, rate-limit var, **yeniden dağıtım yok**.
- Doğrulanamayan: resmî şart metni (Cloudflare engeli, 403). Kontrol: <https://liquipedia.net/api-terms-of-use>
- Dikkat: "yeniden dağıtım yok" ifadesi, turnuva verisini toplu kopyalayıp yayınlamak anlamına gelebilir.
  Uygulamada özet/türetilmiş istatistik gösterilecek, ham veri dökümü verilmeyecek.
- **Güncelleme (24.10.2026):** "yeniden dağıtım yok" kısıtı Cue'nun notlarında bulunamadı;
  CC BY-SA 3.0 yeniden dağıtımı atıf + aynı lisans şartıyla izin veriyor. Kesin cevap başvuruda
  yazılı olarak sorulacak. Yine de ham döküm değil, türetilmiş özet yayımlanacak.
- **Limitler (teyit bekliyor):** 60 istek/saat (LPDB), 1 istek/2 sn (MediaWiki),
  `action=parse` 1/30 sn. Kaynak sayfa 403 verdiği için bağımsız doğrulanamadı.
- API anahtarı başvurusu gerekli. Projenin **açık kaynak** ve **ticari olmayan** olması şart.

### Rone Arena API
- 133 kahraman, güncel istatistik, build verisi döndürüyor (Cue'nun testi).
- Riskler: sürüm bilgisi eski; veri kullanım hakkı belirsiz (Moonton'a ait olabilir).
- Karar: uygulama doğrudan bağlanmaz; **günlük önbellek** (JSON) üzerinden çalışır + kaynak atfı gösterilir.

### Moonton
- V1'de hiçbir görsel/çizim kullanılmayacak.

---

## 4. Elenen isimler

| İsim | Sebep |
|---|---|
| MetaCore | Metacore Games Oy (Merge Mansion) ile çakışma |
| Mythic Atlas | App Store'da aynı isimde uygulama |
| LaneForge | Aynı isimde uygulama var |
| RiftDeck | riftdecks.com aktif |
| DawnVault | dawnvault.app aktif |

---

## 5. Cue'ya gönderilecek mesaj (kopyala-yapıştır)

```
PROJE ADI: BanPhase (kesinleşti). "MetaCore" adını tamamen bırak; kod, dosya adı,
başlık ve metinlerde BanPhase kullan. Alt başlık: Master the Draft.

Kararlar:

1) İSİM: BanPhase. Avukat taraması, domain sorgusu ve marka başvurusu YAPMA.
   Domain satın almıyoruz; GitHub Pages kullanacağız.

2) LIQUIPEDIA: Açık kaynak + ticari olmayan şartı kabul edildi.
   Faz 2'de şunları hazırla ve raporla:
   - API başvurusu için gereken bilgiler (proje adı, amaç, iletişim, user-agent)
   - Atıf şartının tam metni ve uygulamada nasıl gösterileceği
   - Rate limit değerleri ve önbellekleme stratejisi
   - "Yeniden dağıtım yok" ifadesinin tam olarak neyi kapsadığı
   - MLBB için hangi turnuvaların verisi var (M-World, MPL, MSC vb.)

3) MOONTON: İzin e-postası GÖNDERME, taslak da hazırlama. V1'de Moonton görseli kullanmıyoruz.
   Kahraman portreleri için nötr yer tutucu (renk bloğu + baş harf) tasarla.

4) RONE API: Faz 2'de küçük bir test yap. Şunları raporla: kaç kahraman, hangi alanlar geliyor,
   veri ne kadar eski, kullanım hakkı belirsiz mi. Uygulama doğrudan bağlanmayacak, günlük
   JSON önbelleği kullanacağız.

5) SABİT KARARLAR: Ücretsiz ve reklamsız. V1 Türkçe. GitHub Pages. Kullanıcı hesabı yok,
   veriler cihazda (localStorage).

Şimdi sadece Faz 2'yi yürüt: veri hattı + önbellek. Uygulama kodu yazma.
Sonuçları ölçüm/rapor olarak getir, onayımı bekle.
```

---

## 6. Durum (24.10.2026)

| Adım | Durum |
|---|---|
| Faz 2 — veri hattı | ✅ Cue teslim etti, denetlendi → `docs/FAZ2-RAPORU.md` |
| Faz 3 — iskelet | ✅ `index.html` + `assets/` + PWA; Edge (CDP) ile uçtan uca doğrulandı |
| Liquipedia başvurusu | ⏳ metin hazır → `docs/LIQUIPEDIA-BASVURU.md`, 3 alan bekliyor |
| Yayın | ⬜ GitHub deposu + Pages |

**Açık girdiler:** GitHub kullanıcı adı, iletişim e-postası, veri duruşunun onayı.

**Klasör:** `C:\Users\Cozum\Desktop\BanPhase` — eski `MetaCore` klasörü boş kaldı.
