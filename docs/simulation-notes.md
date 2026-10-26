# Draft simülasyonu V1

Simülasyon yalnızca yerel etiket dosyasını (`data/source/hero_tags.json`) kullanır. Dış API, Rone istatistiği, kahraman görseli veya gerçek maç verisi kullanılmaz. Sonuç deterministiktir ve maç tahmini değildir.

## Kurallar ve varsayılanlar

`assets/js/simulation.js` içindeki `SIM_CONFIG`:

- Koridorlar: gold, exp, mid, jungle, roam; lane analiz ağırlığı `0.50`.
- Hasar dengesi ağırlığı `0.25`; fiziksel ve büyü ikisi varsa 100, tek tür varsa 50, etiket yoksa 0 puan.
- Engage ağırlığı `0.25`; en az bir high veya iki medium varsa 100, değilse 0 puan.
- Kişisel skor tabanı 10; eşleşen lane bonusu +2; high/medium/low engage bonusu +3/+2/+1; eksik etiket bonusu 0.
- Takım skoru kişisel skorların toplamı + analiz puanının onda biri.
- Savaş animasyonu 7000 ms. `prefers-reduced-motion` etkinse sonuç doğrudan açılır.

Lane kapsamı kahraman-koridor maksimum eşleşmesiyle hesaplanır. Belirli bir lane'e eşleşemeyen seçilmiş kahraman sonuç düellosunda esnek (`herhangi`) eşleşme olarak kullanılabilir ve lane bonusu almaz. Etiket kaydı bulunmayan kahraman da nötr, esnek eşleşmedir. MVP kazanan takımdaki en yüksek bireysel skorlu seçimdir; eşitlikte erken seçim kazanır.

Draft sonucu mevcut `banphase.draft.v2` localStorage kaydındaki `simulation` alanına yazılır. Eski kayıtlarda alan bulunmaması desteklenir. Sıfırlama ve geri alma simülasyon sonucunu temizler.

## Doğrulama

Saf hesaplama fonksiyonları `node --test` ile doğrulanır (`tests/simulation.test.js`). Draftın baştan sona akışı, timer, geri alma, sıfırlama, özet ve yenileme sonrası geri yükleme ayrıca elle kontrol edilmelidir.
