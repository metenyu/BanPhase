# BanPhase kaynak paketi

Bu paket, BanPhase’e yönelik kullanılabilir MLBB kaynaklarını içerir; **BanPhase deposunda hiçbir dosya değiştirilmedi**. Kaynak veriler ham hâliyle korunmuştur. Hazır uygulama talimatı `CODEX_PROMPT.md` dosyasındadır.

## Pakette neler var?

- **Ceplin `images-hero/`:** 133 PNG kahraman ikonu. Ceplin’in `hero.json` dosyasıyla birlikte verilmiştir; ikon dosyaları 85×85 px’dir. BanPhase, Ceplin ve Kaggle rosterlarında 133 kahraman bulunuyor; adlar normalleştirilerek karşılaştırıldığında hepsi eşleşti. Ceplin `hero.json` içindeki 133 görsel referansının tamamının dosyası pakette mevcut.
- **Ceplin verileri:** Depodaki 11 kök JSON dosyasının tümü — `hero.json`, `equipment.json`, `build-item.json`, `emblem.json`, `meta-draftpick-ml.json`, `tournament.json`, `teams.json`, `players.json`, `stat-player.json`, `staf.json` ve `host-cast.json` — `sources/ceplin/data/` altında.
- **Ceplin görsel ekleri:** 104 eşya simgesi (`logo-equipment/`) ve 243 turnuva logosu (`logo-tur/`).
- **Kaggle:** `hero_data.csv` (133 satır; 10 sütun) ve indirildiği orijinal ZIP. Sütunlar kahraman adı/ID’si, portre URL’si, koridor, sınıf, yetenekler, uzmanlık, counter ve synergy alanlarını içeriyor. Karmaşık sütunlar CSV’de metin olarak kodlanmış iç içe veri biçiminde; doğrudan güvenli JSON sanılmamalıdır.
- Kaynak deposunun `README.md` dosyası ve Kaggle CSV’nin orijinal arşivi de dahildir.

## Bilerek alınmayanlar

- `images-flag/` içindeki **46 bayrak** — talebiniz doğrultusunda hariç tutuldu.
- Ceplin `images/` içindeki **2.042 genel oyuncu/kişi görseli** (yaklaşık 206,6 MB) — BanPhase’in kahraman seçimi ve eşya arayüzü için gerekli olmadığından hariç tutuldu.
- Kaggle CSV’sinde yer alan dış portre URL’lerinden görsel indirilmedi.
- Kaynak depoların `.git` geçmişi alınmadı.

## Kaynak ve erişim kaydı

- Ceplin GitHub: https://github.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang — erişim: **27 Ekim 2026, 04:43 (TRT / UTC+3)**; alınan commit: `29f98d037a70a0ce03908562c5be9cab333eedff`.
- Kaggle veri kümesi: https://www.kaggle.com/datasets/bipinvthapa/mobile-legends-bang-bang-hero-dataset-enhanced — erişim/indirme: **27 Ekim 2026, 04:43 (TRT / UTC+3)**; Kaggle API sürüm **2**, sayfada belirtilen son güncelleme **29 Temmuz 2026**. Kaggle API lisansı `MIT` olarak işaretli.
- Kaggle açıklaması verinin `https://github.com/p3hndrx/MLBB-API` kaynağından türetildiğini ve resmî MLBB verisi olmadığını belirtiyor.
- BanPhase deposu yalnızca promptu projeye göre hazırlamak için incelendi: https://github.com/metenyu/BanPhase — erişim: **27 Ekim 2026, 04:43 (TRT / UTC+3)**. Depoda değişiklik yapılmadı.

## Lisans ve doğruluk notu

Ceplin README’si MIT lisansı iddia ediyor; ancak alınan Ceplin commit’inde bir `LICENSE` dosyası yok. Bu yüzden ikonların oyun görseli haklarının ayrıca doğrulandığı varsayılmamalı; görseller resmî MLBB görseli diye tanımlanmamalı. Kullanıcı, bu özel Ceplin kahraman ikonlarının BanPhase’e eklenmesine açıkça onay verdi. Bu onay başka görsellere veya veri kümelerine genişletilmemelidir.

Kaggle API lisansı MIT gösterse de veri açıklaması eğitim/araştırma amaçlı, resmî olmayan türev olduğunu söylüyor ve hem Kaggle yazarı hem özgün MLBB-API projesi için atıf öneriyor. Ceplin build/meta/turnuva/oyuncu verilerinin güncelliği ve iddiaları bağımsız doğrulanmış değildir. Bu nedenle paket, bunları otomatik olarak BanPhase’e yayımlama talimatı vermez.

## Yapı

```text
CODEX_PROMPT.md
sources/
  ceplin/
    README.md
    data/                 # 11 JSON
    images-hero/          # 133 PNG kahraman ikonu
    logo-equipment/       # 104 PNG eşya ikonu
    logo-tur/             # 243 PNG turnuva logosu
  kaggle/
    hero_data.csv
    mobile-legends-bang-bang-hero-dataset-enhanced.zip
```
