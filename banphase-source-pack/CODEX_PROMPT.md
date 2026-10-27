# Codex promptu — BanPhase’e kahraman ikonları ekleme

BanPhase deposunda (`https://github.com/metenyu/BanPhase`) çalış. Kullanıcı, bu görev kapsamında **Ceplin deposundaki kahraman ikonlarının** BanPhase’e eklenmesini açıkça onayladı. Girdi paketi açılmış olarak `banphase-source-pack/` klasöründe bulunacak.

## Amaç

Mevcut BanPhase kahraman seçimi kartlarında baş harfli yer tutucuların yerine yerel Ceplin kahraman ikonlarını göster. Varsa aynı kahramanın seçilmiş/banlanmış durumlarında da mevcut görsel durum davranışını koru. Tasarımın boyut, oran ve erişilebilirliğini bozma; görsel yüklenmezse bugünkü baş harfli yer tutucuya geri dön.

## Kaynaklar

- İkonlar: `banphase-source-pack/sources/ceplin/images-hero/` (133 PNG).
- İkon-ad eşlemesi: `banphase-source-pack/sources/ceplin/data/hero.json` (`name_hero`, `images-hero` alanları).
- BanPhase’in kimlik/rol için otoritatif listesi: `data/heroes.json` (133 kayıt). BanPhase, Ceplin ve Kaggle rosterları arasında adlar normalleştirildiğinde 133/133 eşleşme doğrulanmıştır; yine de uygulamaya eklerken bire bir eşleşmeyi ve dosya varlığını otomatik doğrula. Sıra numarasına göre eşleştirme yapma; kimlikleri Ceplin ID’lerinden kopyalama.
- Tam kaynak bilgisi, erişim zamanı ve lisans notları `banphase-source-pack/README.md` içindedir.

## Sınırlar

- Yalnızca `images-hero/` içindeki 133 Ceplin kahraman ikonunu kullan. `images-flag/`, Kaggle `portrait` URL’leri veya başka oyun görselleri ekleme.
- `data/heroes.json` içindeki kahraman adlarını, rollerini, etiketlerini veya kimliklerini yeniden yazma; draft sırası/kuralları, filtreler, kompozisyon analizi, kayıtlar ve eşya/build özelliklerinde değişiklik yapma.
- Kaggle `hero_data.csv` pakette araştırma girdisi olarak bulunur. Bu görevde skill metinleri, counter/synergy, build/meta veya başka oyun tavsiyelerini kullanıcıya gösterme ya da uygulama verisine katma. Bu alanlar sonradan ayrı ürün kararı, kaynak/atıf ve doğruluk denetimi gerektirir. CSV içindeki iç içe alanları JSON kabul etme ve hiçbir şekilde `eval()` ile ayrıştırma.
- Görselleri resmî MLBB varlığı veya lisansı ayrıca doğrulanmış içerik olarak tanımlama. Ceplin README’si MIT diyor fakat alınan commit’te `LICENSE` dosyası bulunmuyor; kaynak/erişim ve bu belirsizliği küçük bir dokümantasyon notuyla kaydet. Kullanıcı onayı yalnızca bu özel ikon seti içindir.
- Kullanıcının mevcut yerel değişikliklerini koru. Önce `git status` kontrol et; README veya başka dosyaları bütünüyle üzerine yazma.
- İş bitince commit, push, merge veya deploy yapma.

## Uygulama

1. Önce mevcut render yapısını, `tools/build-heroes.mjs`, doğrulama/test araçlarını ve `sw.js` önbellek yaklaşımını incele.
2. Portreleri uygun bir yerel dizine (ör. `assets/images/heroes/`) kopyala. İkonları `data/heroes.json` üretim akışının kaynağına yanlışlıkla dahil etme. Sağlam bir yöntemle BanPhase kahraman ID’sini normalize edilmiş ad üzerinden Ceplin `hero.json` kaydıyla bire bir eşleştir; gerekirse ayrı bir kaynak/eşleme manifesti kullan.
3. Kahraman kartındaki mevcut rozet/daire ölçüsünü koru; görseli kırpmadan taşırmadan uygun `object-fit` ile yerleştir. Görsel yükleme hatasında baş harf fallback’i göster. Var olan erişilebilir buton adını bozma; resim ayrıca okunmuyorsa dekoratif `alt=""` kullan. `loading="lazy"` ve `decoding="async"` tercih et.
4. Uygulamanın çevrimdışı çalışmasını koru: kullanılan service-worker stratejisine göre bu 133 yerel dosyanın önbelleğe girmesini sağla ve gerektiğinde cache sürümünü artır. Haricî görsel/servis bağımlılığı ekleme.
5. Kaynak ve erişim tarihini, Ceplin commit kimliğini ve lisans notunu `docs/` altında kısa bir kaynak notuna veya mevcut uygun belgeye ekle. Mevcut dokümantasyonun geri kalanını bozma.
6. Test et: eşleme 133/133 olmalı, yinelenen/eksik kimlik veya eksik görsel olmamalı; `node tools/validate.mjs`, `node tools/test-app.mjs`, `node --check assets/js/app.js`, `node --check sw.js` ve `git diff --check` çalıştır. İlgisiz değişiklik varsa geri al; kullanıcı değişikliklerine dokunma.

Sonuçta hangi dosyaları değiştirdiğini, test sonuçlarını ve bilinen lisans/veri sınırlamalarını kısa raporla. Commit/push/deploy yapma.