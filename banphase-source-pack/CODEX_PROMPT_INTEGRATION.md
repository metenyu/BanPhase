# Codex görevi: Ceplin ve Kaggle kaynaklarını BanPhase’e entegre et

BanPhase deposunda çalış. Girdi dosyaları `banphase-source-pack/` klasöründe olacak; klasör yoksa önce kullanıcıdan verdiği `banphase-source-pack.zip` arşivini proje köküne aç. Kullanıcı bu görevde Ceplin ikonlarının ve Ceplin/Kaggle verilerinin BanPhase’te kullanılmasını açıkça onayladı.

## Hedef

Mevcut BanPhase’i bu kaynaklarla anlamlı biçimde geliştir: kahraman seçiminde yerel kahraman ikonları, mevcut/eklenecek eşya ekranında eşya ikonları ve katalog, build alanında kahraman buildleri, draft analizinde counter/synergy ipuçları. Ceplin turnuva, takım, oyuncu ve istatistik dosyalarını da kaynak olarak projeye al; mevcut uygun ekran varsa orada kullan, yoksa veriyi kaynak dosyası olarak koruyup henüz arayüzü olmayan bölümleri raporla. Bu işte Liquipedia kullanılmayacak.

## Paket içeriği

Ceplin: `sources/ceplin/images-hero/` (133 kahraman ikonu), `data/hero.json`, `data/equipment.json`, `data/build-item.json`, `data/meta-draftpick-ml.json`, `data/tournament.json`, `data/teams.json`, `data/players.json`, `data/stat-player.json`, `data/staf.json`, `data/host-cast.json`; ayrıca `logo-equipment/` ve `logo-tur/` görselleri.

Kaggle: `sources/kaggle/hero_data.csv` (133 kahraman, portre URL’si, lane/class, skills, speciality, counters, synergies alanları) ve orijinal ZIP. CSV’de iç içe alanlar metin olarak saklanmış olabilir; kod çalıştırarak ayrıştırma.

Kaynak adresleri, çekim zamanı, dosya envanteri ve lisans notları `banphase-source-pack/README.md` içindedir.

## Uygulama kuralları

1. İlk olarak mevcut `git status`, veri şemaları, ilgili UI akışları, servis worker ve testleri incele. Yerel kullanıcı değişikliklerini koru; dosyaları körlemesine üzerine yazma.
2. `images-hero/` içindeki 133 kahraman ikonunu seçim kartları ve takım yuvalarında göster; mevcut baş harfli yer tutucu yükleme hatasında fallback olarak kalsın. 133/133 eşleşmeyi kahraman adıyla doğrula; sıra numarası veya Ceplin ID’sini BanPhase ID’si sanma. Görselleri yerel tut, lazy-load ve offline cache’i mevcut PWA yapısına uygun uygula.
3. Ceplin eşya kataloğu/build’leri ile Kaggle’ın lane, rol, counter ve synergy alanlarını ilgili ekranlarda kaynak etiketiyle göster. Mevcut BanPhase verisini sessizce değiştirme: ayrı kaynak dosyası/manifest oluştur, adları güvenli biçimde eşleştir, çakışmaları ve eşleşmeyenleri raporla. Eşleşmeyen kaydı atla; uydurma veri üretme. Kaggle’daki uzak `portrait` URL’lerini kullanma veya indirme.
4. Draft analizindeki counter/synergy girdilerini kesin maç sonucu ya da kanıtlanmış meta gibi sunma; “Ceplin/Kaggle kaynaklı topluluk verisi, doğrulanmamış” etiketi ve kaynak adı göster. Bilinmeyen tarih/güncellik alanlarını uydurma.
5. Bayrakları ve Ceplin’in genel `images/` klasöründeki kişi görsellerini ekleme. Yalnız paketteki kahraman, eşya ve turnuva logo klasörlerini kullan. Gereksiz büyük medya/harici servis ekleme.
6. Kaynak/atıf belgesi ekle. Ceplin README’si MIT diyor ancak snapshot’ta LICENSE yok; Kaggle API’si MIT işaretliyor, veri açıklaması p3hndrx/MLBB-API türevi ve resmî olmayan kaynak diyor. Kullanıcı bu verileri kullanmaya izin verdi; bu belirsizlikleri saklama ve görselleri resmî MLBB içeriği diye tanımlama.
7. Eski `data/heroes.json` kimliklerini/rollerini/etiketlerini, draft kurallarını ve mevcut eşya verisini koru; başka ekranları veya işlevleri bozma. Gerekli yeni dosyalar ve service-worker cache sürümü dışında kapsam dışı refactor yapma.
8. `node tools/validate.mjs`, `node tools/test-app.mjs`, `node --test`, `node --check assets/js/app.js`, `node --check sw.js` ve `git diff --check` çalıştır; mevcut test düzenine uygun yeni eşleme ve fallback testleri ekle.
9. Commit, push, merge veya deploy yapma. Sonunda eklenen/kullanılan dosyaları, 133 ikon eşleşmesini, entegre edilen veri kategorilerini, atlanan kayıtları ve test sonuçlarını kısa raporla.
