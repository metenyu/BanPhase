# Liquipedia API — Başvuru ve Soru Metni

> Taslak. **Gönderilmedi.** Eksik tek alan: iletişim adresi `{{EPOSTA}}`.
> Kanal: `liquipedia.net/api` formu; yedek: Discord `#api-help`.

## 0. Göndermeden önce tamamlanması gerekenler

| # | Gereken | Durum |
|---|---|---|
| 1 | GitHub kullanıcı adı | ✅ `@metenyu` |
| 2 | Public depo + URL | ✅ `github.com/metenyu/BanPhase` (yayında) |
| 3 | Kod lisansı dosyası (MIT) + `data/` için CC BY-SA 3.0 notu | ✅ `LICENSE`, `README.md` |
| 4 | İletişim e-postası (kişisel değil, proje adresi) | ⬜ son iş |
| 5 | User-Agent dizesi | ✅ aşağıda hazır |
| 6 | Uygulamanın yayın adresi | ✅ `https://metenyu.github.io/BanPhase/` |
| 7 | API şartları (limitler, önbellek ilkesi) | ✅ 24.10.2026'da okundu: 60 istek/saat (LPDB), 1/2 sn (MediaWiki), `action=parse` 1/30 sn |

Hazır User-Agent:

```
BanPhase/0.1 (+https://github.com/metenyu/BanPhase; {{EPOSTA}})
```

---

## 1. E-posta / form metni (İngilizce)

**Subject:** API access request — BanPhase (non-commercial, open-source MLBB draft tool)

```
Hello Liquipedia team,

I would like to request API access for a small, non-commercial open-source project.

Project: BanPhase — "Master the Draft"
Repository: https://github.com/metenyu/BanPhase (license: MIT for code; Liquipedia-derived data will be
published under CC BY-SA 3.0)
Live app: https://metenyu.github.io/BanPhase/ (static, GitHub Pages)
Contact: {{EPOSTA}}
User-Agent: BanPhase/0.1 (+https://github.com/metenyu/BanPhase; {{EPOSTA}})

What it does
BanPhase is a free, ad-free, Turkish-language web app that helps Mobile Legends:
Bang Bang players plan the ban phase of a draft. It shows tournament context
(which heroes are being banned/picked in recent M-Series, MSC and MPL matches)
next to a simple ban board. There is no account system, no advertising, no
paid tier, and no user tracking.

How we would use the API
- A scheduled job (GitHub Actions) runs at most once per day and pulls a small,
  fixed set of tournament/pick-ban data for MLBB.
- We cache aggressively and re-use stored responses instead of re-fetching the
  same data, as your terms ask ("re-use / cache your API results for as long as
  possible"). Only the API is used; we do not scrape non-API endpoints.
- Aggregated results are stored as JSON in the public repository and read by the
  static app. The app never calls Liquipedia directly from the browser.
- We publish only derived aggregates (e.g. "hero X banned in N% of games in
  tournament Y"), not raw page dumps or full database exports.
- A planned statistics view will show pick/ban frequency and win rates per hero,
  and how often a given five-hero composition was picked and how it performed,
  computed from your match records. Only aggregates would be published.
- Every view that uses your data carries the attribution line required by
  CC BY-SA 3.0, linking to the specific Liquipedia article and the access date.

Questions
1. Is our planned usage (daily scheduled job, aggregated statistics published in
   a public GitHub repository under CC BY-SA 3.0) acceptable under the API terms
   of use? We want to be certain that publishing derived data this way is not
   considered redistribution that you disallow.
2. Our reading of the current API terms is: no more than 60 requests per hour for
   the LiquipediaDB API, 1 request per 2 seconds for the MediaWiki API, and 1 per
   30 seconds for action=parse. Could you confirm these are still current, and
   whether short bursts within them are acceptable?
3. Is attribution in the form "Data from Liquipedia Mobile Legends: Bang Bang
   Wiki, CC BY-SA 3.0, <article link>, accessed <date>" sufficient?
4. Is an API key required for this scope, and does free access expire? If so, what
   are the renewal conditions?
5. Which MLBB competitions are available through LiquipediaDB — is it limited to
   M-Series/MSC/MPL, or does it also cover national and third-party leagues?
6. Do you require a specific User-Agent format or a contact address in it?

Thank you for your time and for maintaining the wiki.

Best regards,
{{AD}}
BanPhase
```

---

## 2. Kısa sürüm (Discord `#api-help`)

```
Hi — building BanPhase, a free non-commercial open-source MLBB draft helper
(https://github.com/metenyu/BanPhase). Plan: one GitHub Actions job per day, LPDB only, publish
aggregated pick/ban stats as CC BY-SA 3.0 JSON with per-article attribution.
Two things I could not confirm from the docs (they returned 403 to my client):
(1) is publishing derived aggregates in a public repo OK, or is that considered
redistribution? (2) what are the current LPDB rate limits (per hour/day)?
```

---

## 3. Notlar

- **"Ticari değil" iddiasını abartmayın.** Uygulama ücretsiz ve reklamsız; ileride
  bağış/Sponsor olursa bunu başvuruda değişiklik olarak bildirin.
- **Ham veri yayımlamayacağız.** Taahhüt edilen şey özet/türetilmiş istatistik;
  bunu tutmak kod tarafında da kolay (depoda yalnızca `data/liquipedia/*.json`
  özetleri olacak).
- **Lisans ayrımı net olsun.** Kod MIT, `data/` CC BY-SA 3.0. Veriyi JS paketine
  gömmeyin; ayrı JSON kalsın ki iki lisans ayrışsın.
- **Atıf görünür olsun.** Footer'da tek satır yetmez; her turnuva sayfasında
  makale bağlantısı + erişim tarihi.
- Onay gelmeden hiçbir LPDB çağrısı yapılmayacak (Cue'nun notu da bunu söylüyor).

---

## 4. Gönderim adımları

1. **Proje adresi** (2 dakika, telefonsuz): <https://duckduckgo.com/email> → *Get Started*
   → kendi e-postanı doğrula → `banphase` önekli bir `@duck.com` adresi üret.
   Alternatif: Firefox Relay (`@mozmail.com`) veya SimpleLogin.
   Kişisel adresi kullanma; başvuru herkese açık bir projeye ait olmalı.
2. Aşağıdaki iki alanı doldur: `{{EPOSTA}}` ve `{{AD}}` (imzada görünecek ad).
   `{{EPOSTA}}` üç yerde geçiyor: iletişim, User-Agent ve imza altı.
3. **Kanal:** önce <https://liquipedia.net/api> formu. Form yoksa/çalışmazsa
   Discord `#api-help` kanalında Bölüm 2'deki kısa metni gönder.
4. Gönderdikten sonra `docs/` altına tek satır not düş: tarih + kanal + kopya.

## 5. Gönderim sonrası

- **7 gün** yanıt yoksa Discord'da kibarca hatırlat (aynı metni tekrar yapıştırma,
  "hâlâ bekliyorum" de).
- Onay gelirse: API anahtarını **depoya koymayın**; GitHub Actions secret olarak ekle.
- Red gelirse: istatistik sekmesi "veri yok" hâlinde kalır; Rone arşivine dönmeyiz
  (Eylül 2025 verisi, hak belirsiz).

## 6. Göndermeden önce son kontrol

- [ ] `{{EPOSTA}}` ve `{{AD}}` kalmadı
- [ ] Depo public, lisans dosyası yerinde
- [ ] Site canlı ve açılıyor (`metenyu.github.io/BanPhase`)
- [ ] Metinde "ham veri yayımlamayacağız" cümlesi duruyor
- [ ] Rate limit değerleri teyit sorusu olarak yazılı (iddia olarak değil)