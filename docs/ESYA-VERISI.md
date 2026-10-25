# Eşya verisi denetimi — 25.10.2026

## Kapsam ve kaynak

- `data/items.json`: 63 benzersiz eşya, 6 kategori.
- Ana kaynak: kullanıcı tarafından sağlanan oyun içi ekran görüntülerinden yerel OCR ve elle düzeltmeler.
- Yeniden üretim: `node tools/build-items.mjs`; elle düzeltmeler `data/source/items-fixes.json` içinde tutulur.
- Türkçe ekran metnini bozan OCR hatalarında tahmin yürütülmedi. 9 kaydın pasif alanı `null` ve `dataQuality.status: "partial"` olarak işaretlidir.
- 7 Pençe Kutsaması kaydında ekran görüntüsü pasif metnini yeterince yakalamamıştır. Ayaz ve Dilek Feneri'nde de OCR metni güvenilir biçimde onarılamamıştır.

## Bu turda düzeltilenler

- `BS Düşürme` OCR etiketi fiziksel zırh delme olarak yanlış eşlenmişti; `Bekleme Süresi Azaltma` olarak normalleştirildi. Kaynak İngilizce kayıtlarla doğrulanan `10%` değerleri düzeltildi.
- Buz Kraliçesinin Değneği'nde `txxerilerle` → `becerilerle`.
- Ulu Ejder Mızrağı'ndaki `309%` ve Yedi Deniz'in Kılıcı'ndaki `409%` OCR değerleri sırasıyla `30%` ve `40%` olarak düzeltildi.
- Yıldırım Copu'ndaki `verır` yazımı düzeltildi.
- Eşya doğrulayıcısı artık tam 63 kayıt, benzersiz kimlik, beklenmeyen alanlar, eksik istatistikler, bozuk OCR metni, kategori toplamları ve kısmi veri işaretlerini denetler.

## Bilinen sınırlamalar

- Oyun verisi yama ile değişebilir; katalog güncel oyun istemcisinin tüm eşyalarını kapsadığı iddiasında değildir.
- OCR çıktısının ham metni her zaman teyit için yeterli değildir. Pasifi `null` olan ve `dataQuality` işareti bulunmayan kayıtlar için kaynakta pasif olmadığı kabul edilmiştir; bu alan yine de yama bazında yeniden kontrol edilmelidir.
- Kahraman portreleri Moonton oyun içeriğidir. Projede yeniden dağıtım izni ve açık lisanslı, eşleşmiş portre paketi bulunmadığı için 133 kahraman için harfli yedek kart korunmuştur; rastgele URL veya görsel kullanılmamıştır.
- Eşya metinleri [Equipment veri modülü](https://mobile-legends.fandom.com/wiki/Module:Equipment/data), [eşya kataloğu](https://mobile-legends.fandom.com/wiki/Equipment) ve [bekleme süresi azaltma listesi](https://mobile-legends.fandom.com/wiki/Cooldown_reduction) ile karşılaştırıldı. Wiki verisi yama gerisinde kalabileceği için oyun içi ekran görüntüsü birincil kaynaktır.
- Oyun içeriği mülkiyeti için [MLBB Esports kullanım koşulları](https://mlbbesports.com/legal/terms) incelendi. Görsel eklemeden önce yeniden dağıtım izni ayrıca doğrulanmalıdır.
