# Cue'ya verilecek işler (24.10.2026)

> Kural: **kod yazma**, yalnızca veri ve kaynak. Her teslim JSON + kaynak URL + erişim zamanı.
> Uydurma değer yok: emin olmadığın alanı `null` bırak, `"confidence": "low"` yaz.

## 1. Eşya kataloğu (öncelik: yüksek)

BanPhase'e eşya/build bölümü ekliyoruz. Önce katalog lazım.

**Kaynak:** Fandom MLBB Wiki (CC BY-SA 3.0) — `Module:Item/data` veya eşya listesi sayfası.
Erişemezsen başka açık kaynak dene, ama kaynağı yaz.

**Çıktı:** `data/source/items.json`

```json
{
  "generated_at_utc": "2026-10-24T...",
  "sources": [{ "name": "...", "url": "...", "license": "CC BY-SA 3.0", "access": "..." }],
  "count": 0,
  "items": [
    {
      "id": "endless-battle",
      "name": "Endless Battle",
      "category": "attack",
      "price": 2470,
      "stats": { "physical_attack": 65, "hp": 250, "mana_regen": 10 },
      "passive": "Kısa metin (İngilizce kaynaktan, aynen)",
      "confidence": "high"
    }
  ]
}
```

Kurallar:
- `category`: `attack | magic | defense | movement | jungle | roam | other`
- İsimler İngilizce kalsın (çeviriyi biz yaparız).
- Fiyat/pasif bilinmiyorsa `null`.
- Aynı eşyanın iki kaydı varsa tekilleştir, çakışmayı raporla.

## 2. Kahraman etiketleri (öncelik: yüksek)

Comp analizi için 133 kahramanın etiketleri gerekiyor. **Hepsi birden değil**: önce en çok oynanan 30 kahraman, sonra kalanı.

**Çıktı:** `data/source/hero_tags.json`

```json
{
  "generated_at_utc": "...",
  "sources": [{ "name": "Fandom / resmî kahraman sayfası", "url": "...", "access": "..." }],
  "heroes": [
    {
      "heroId": "fanny",
      "lanes": ["jungle"],
      "style": ["assassin", "split-push"],
      "damage": "physical",
      "power_spike": "early",
      "engage": "low",
      "confidence": "medium",
      "evidence": "Fandom sayfasında 'high mobility assassin' ifadesi"
    }
  ]
}
```

Alan sözlüğü (bunun dışına çıkma):
- `lanes`: `gold | exp | mid | jungle | roam` (birden fazla olabilir)
- `style`: `engage | poke | teamfight | split-push | pickoff | sustain | dive | zone`
- `damage`: `physical | magic | mixed`
- `power_spike`: `early | mid | late`
- `engage`: `high | medium | low` (takımı savaşa sokma kabiliyeti)
- `confidence`: `high | medium | low`

Kurallar:
- Etiketleri **kahramanın kendi kitinden** çıkar, tier list'ten değil.
- Emin değilsen `confidence: low`; uydurma.
- Her kahraman için tek satır `evidence` yaz (hangi cümleden çıkardın).

## 3. Yapma

- `index.html`, `assets/`, `sw.js` dosyalarına dokunma; bu benim tarafım.
- Liquipedia'ya istek atma (onay yok).
- Rone istatistik/build verisini yayımlama.
- Comp/istatistik verisi üretme — o bizim işimiz, veri kaynağı belli değil.

---

## 4. İkinci tur — gelen veride düzeltme istekleri (24.10.2026)

`items.json` (92 eşya) ve `hero_tags.json` (30 kahraman) alındı, işe yarıyor. Düzeltilecekler:

1. **`power_spike` 30/30 kayıtta `null`.** Alan tamamen boş; ya doldur (early/mid/late)
   ya da şemadan çıkarıp haber ver. Şu an kullanılmıyor.
2. **`style` içinde `pickoff` fazla kullanılmış.** `miya` ve `hanabi` (marksman, gold lane)
   `pickoff` etiketi almış; bunlar takım savaşı/menzilli hasar profiline daha yakın.
   `style` etiketlerini kahramanın kitine göre yeniden gözden geçir; emin olmadığında
   `confidence: low` yaz.
3. **Kapsam 30/133.** Kalan 103 kahramanın etiketlerini aynı şemayla tamamla.
   Öncelik: sık oynananlar (bu 30'un dışında kalan popülerler).
4. **`items.json` içinde 92 kaydın 34'ünde `passive` yok.** Bunlar gerçekten pasifi
   olmayan eşyalar mı (ör. saf stat eşyası), yoksa çıkarımda mı atlandı? Liste hâlinde
   hangisi hangi sebeple boş, yaz.
5. **`items_excluded.json` iyi olmuş.** Aynı mantıkla: çıkarılan 21 kaydın
   "Removed" olanları doğru; "kişiye özel kit öğesi" olanlar da doğru ayrım.

### Üçüncü tur (24.10.2026, akşam)

133 kayıtlık etiket dosyası alındı. Durum:

- **Kimlik yazımı uyuşmadı:** dosyada `chang'e` ve `x.borg`, bizde `change` ve `x-borg`.
  Biz kendi tarafımızda slug ile eşitledik (artık 133/133 eşleşiyor). Bundan sonra
  `heroId` alanını `data/heroes.json` içindeki `id` ile **birebir** aynı yaz.
- **`power_spike` alanı kaldırıldı:** kaynakta veri yok, bizde de kullanılmıyor.
  Bir daha doldurma; şemadan çıkarıldı.
- **`style: pickoff` hâlâ fazla:** 133 kaydın **68'inde** var. Örnek: `miya`,
  `hanabi`, `chang'e` (mid poke büyücü) — bunlarda pickoff ana profil değil.
  `Finisher` uzmanlığını doğrudan pickoff'a çevirmek yanlış. Kiti olan kahramanlarda
  `pickoff` sadece gerçekten tek hedef avlayan sette kalsın.
- **5 kayıtta `style` boş** (angela, valir, kimmy, baxia, xavier) — medium güven.
  Bunlar için tek tek karar ver; boş bırakma.
- **Engage tahmini:** kabul edildi, arayüzde "tahmin" olarak etiketlendi.

---

## 5. Birleşik görev listesi (24.10.2026 — güncel, öncekilerin yerine geçer)

Öncelik sırası: **A → B → C → D**. Her teslimde dosya + kaynak + erişim zamanı.
Kod yazma, Liquipedia'ya istek atma.

### A. Kahraman etiketleri — düzeltme (dosya: `data/source/hero_tags.json`)

1. **`style: pickoff` fazla.** 133 kaydın 68'inde var; gerçekten tek hedef avlayan
   setler dışında çıkar. Örnek yanlışlar: `miya`, `hanabi` (gold lane marksman),
   `chang'e` (mid poke büyücü). "Finisher" uzmanlığını doğrudan pickoff'a çevirme.
2. **`style` boş 5 kayıt:** `angela`, `valir`, `kimmy`, `baxia`, `xavier`.
   Her biri için tek tek karar ver; boş bırakma.
3. **`heroId` bizim `id` ile birebir aynı olacak** (`data/heroes.json`):
   `chang'e` → `change`, `x.borg` → `x-borg`. Kural: küçük harf, boşluk yerine `-`,
   kesme işareti ve nokta yok.
4. **`power_spike` gönderme** — şemadan çıkarıldı, kaynakta veri yok.
5. Şema aynı kalsın: `heroId, lanes[], style[], damage, engage, confidence, evidence`.
   `count: 133` ve her kayıtta `evidence` zorunlu.

### B. Eşyalar (dosya: `data/source/items.json`)

> **Düzeltme (24.10.2026, akşam):** "Jungle kategorisi eksik" tespiti **yanlıştı**.
> `Raptor Machete` ve eski jungle hattı oyundan 2020'de kaldırıldı. Bugün "ormancı
> eşyası" diye ayrı bir katalog kategorisi yok; orman için **Pençe Kutsaması**
> (Retribution blessing) kullanılıyor. Katalogda o eşyalar ayrı kategori (`kutsama`).
> Aşağıdaki 1. madde iptal.

1. ~~Jungle kategorisi eksik~~ — **iptal.** Kaldırılmış eşyalar (`availability=Removed`)
   katalogda yer almamalı; `items_excluded.json` doğru davranmış.
2. **92 kaydın 34'ünde `passive` boş.** Ama her eşyanın pasifi olmak zorunda değil
   (ör. botlar yalnızca stat verir). Yine de listele: hangisi gerçekten pasifsiz,
   hangisi çıkarımda atlanmış. Atlananları doldur.
3. **Yeni/eksik eşya kontrolü:** "Kaotik Silah" (TR) katalogda yoktu; kullanıcı metni
   verdi, işlendi. Son yamalarda eklenen eşyaların tam listesini kontrol et.
4. **`winter-crown` doğrulaması:** Türkçe "kış tacı" mı, yoksa `Winter Truncheon`
   (kendini dondurma) mi? İkisi karışmış olabilir; doğru kaydı ayır.
5. **`stats` anahtar sözlüğü:** kullandığın her anahtar için tek satır: ne demek,
   birimi ne (`_pct` = yüzde, düz sayı = puan).
6. **(Opsiyonel) Türkçe ad:** eşyanın oyun içi resmî Türkçe adı varsa `name_tr`
   alanı ekle. Yoksa boş bırak, uydurma.
7. Teslim: güncel `items.json` + `docs/items-passive-gap.md`.

### C. Build önerileri (yeni, düşük öncelik)

Fandom kahraman sayfalarında "Build" / "Recommended items" bölümü var mı? Varsa
**10 popüler kahraman** için çıkar:

```json
{ "heroId": "fanny", "role": "jungle", "items": ["raptor-machete", "..."], "note": "tek cümle", "sourceUrl": "..." }
```

Eşya adlarını B'deki `items.json` id'leriyle eşle. Yoksa "Fandom'da build bölümü yok"
de, uydurma.

### D. Liquipedia hazırlığı (istek yok, yalnızca şema)

Onay gelmeden hiçbir API çağrısı yapma. Sadece:

- LPDB `match2` kayıtlarında pick/ban ve sonuç alanlarının **adlarını** derle
  (public doküman/örnek JSON üzerinden).
- Bize iki dosya şeması öner: `data/tournaments/<turnuva>/matches.json` ve
  `stats.json` — hangi alanlar, hangi tipler.

### Yapma

- `index.html`, `assets/`, `sw.js`, `data/heroes.json` dosyalarına dokunma.
- Liquipedia'ya istek atma, API anahtarı isteme.
- Rone istatistik/build yayımlama.
- Uydurma build/etiket/istatistik üretme; emin değilsen `confidence: low` + gerekçe.
