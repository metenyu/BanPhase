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
