# Topluluk kaynakları entegrasyonu

Bu entegrasyon, mevcut BanPhase kahraman/eşya/build verilerini değiştirmez. Uygulama için güvenli ad eşleştirmeleri `data/source/community-integration.json` dosyasına `node tools/build-community-sources.mjs` ile yeniden üretilebilir.

## Ceplin

- Kaynak deposu: https://github.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang
- Paket README erişim zamanı: 27 Ekim 2026, 04:43 TRT (UTC+3); snapshot commit: `29f98d037a70a0ce03908562c5be9cab333eedff`.
- Ceplin README’si MIT lisansı iddia ediyor, ancak bu snapshot içinde LICENSE dosyası yok. Kahraman/eşya ikonları resmî MLBB görseli olarak tanımlanmaz; hakların ayrıca doğrulandığı varsayılmamalıdır.
- 133 kahraman ikonu ad normalizasyonuyla BanPhase kimliğine eşleşti. Kaynak ID’leri uygulama kimliği olarak kullanılmadı.
- 109 eşya satırı, varsa yerel ikon ve kaynakta verilen fiyatla ayrı “Ceplin topluluk kataloğu” bölümünde gösterilir. Bunlar mevcut 63 Türkçe eşya kataloğunun yerine geçmez.
- Güvenli, birebir İngilizce ad karşılaştırması mevcut katalogla yalnızca 2 eşyayı eşleştirdi. Kalan 107 Ceplin satırı ve eşleşmeyen 61 runtime satırı tahminî birleştirilmedi. Ceplin’de 4 yinelenen ad grubu bulunduğu için otomatik eşleştirmeye alınmadı.
- Kaynak build-item.json içeriği mevcut kullanıcı build’lerinden ayrı, “doğrulanmamış topluluk build’i” etiketiyle gösterilir.
- Turnuva, takım, oyuncu, oyuncu istatistiği, staff ve host/cast dosyaları orijinal kaynak paketi altında korunmuştur; mevcut üründe uygun ekran olmadığı için runtime arayüzüne eklenmemiştir. Bayrak ve genel kişi görselleri kullanılmaz.

## Kaggle

- Veri kümesi: https://www.kaggle.com/datasets/bipinvthapa/mobile-legends-bang-bang-hero-dataset-enhanced
- Paket README erişim/indirme zamanı: 27 Ekim 2026, 04:43 TRT (UTC+3); API snapshot sürümü 2; sayfada belirtilen son güncelleme 29 Temmuz 2026.
- Kaggle API lisansı MIT olarak işaretlenmiştir; açıklama veriyi p3hndrx/MLBB-API’den türetilmiş, resmî olmayan kaynak olarak niteler.
- 133 satır BanPhase kahramanlarıyla ad üzerinden eşleşir. Koridor, sınıf, counter ve synergy alanları takım seçimlerinde topluluk ipucu olarak sunulur. CSV’deki harici portre URL’leri kullanılmaz/indirilmez.
- İç içe counter/synergy alanları CSV metninden güvenli metinsel ayrıştırmayla okunur; kaynak içerik istatistiksel doğruluk veya güncellik garantisi sayılmaz.

## Güven notu

Ceplin ve Kaggle içerikleri tekil, üçüncü taraf topluluk kaynaklarıdır; bağımsız veya oyun içi doğrulama yapılmadı. Uygulama bunları “Ceplin/Kaggle kaynaklı topluluk verisi, doğrulanmamış” olarak işaretler. Boş veya eşleşmeyen değerler uydurulmaz. Paket içindeki README, SHA256SUMS, ham JSON, Kaggle CSV ve orijinal arşiv kaynak kaydı olarak korunur. Kullanıcının ayrıca verdiği `hero-icons.zip` içindeki 133 görsel, paket ikonlarıyla SHA-256 düzeyinde aynı çıktı; yinelenen kopya depoya eklenmedi.
