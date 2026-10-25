# Build verisi durumu — 25.10.2026

- `data/builds.json` içinde 1 kayıt var: Claude için kullanıcı kaynaklı, Nişancı build'i. Bu kayıt resmi veya güncel oyun içi build olarak doğrulanmış değildir.
- Uygulama `builds` dizisini dinamik işler; tek kahraman sınırı yoktur. Katalog tek kayıttan ibarettir çünkü doğrulanabilir başka bir build kaynağı mevcut değildir. Harici arşivdeki eski/izin durumu belirsiz veriler yayımlanmaz.
- Build araması kahraman adı/kimliği, rol, koridor, not ve eşya adında çalışır. Eşya düğmeleri katalogdaki eşya ayrıntısına götürür.
- Kayıt yoksa arayüz kaynaklı build bulunmadığını söyler; arama eşleşmezse ayrı boş durum gösterir. Yeni build eklerken kaynak ve doğrulama durumu belirtilmelidir; eksik build'ler tahmin edilmemelidir.
- Şema ve kahraman/eşya referansları `node tools/validate.mjs` ile denetlenir.
