# Kahraman veri durumu — 25.10.2026

- `data/heroes.json` içinde 133 benzersiz kimlik ve ad kaydı vardır. Kayıtlarda roller ve bazı takım analizi etiketleri bulunur.
- Kahraman yetenek açıklaması veya portre alanı yoktur. Arayüz bu nedenle lisansı doğrulanmamış görsel yerine ad baş harflerini gösterir; yetenek bilgisi varmış gibi davranmaz.
- Stil etiketi boş olan beş kayıt: Angela, Baxia, Kimmy, Valir ve Xavier. Eksiklik kaynağın/etiketlemenin mevcut kapsamından kaynaklanır; değerler tahmin edilmedi.
- Diğer etiketler de oyun içi istatistik veya kazanma oranı değildir. `confidence` alanı, eldeki sınıflandırmanın güven seviyesini belirtir ve kompozisyon analizinde kısmi veri uyarısı gösterilir.
- Doğrulama: `node tools/validate.mjs` kimlik benzersizliğini, rol ve etiket şemalarını, izin verilen etiket değerlerini ve beklenen beş eksik stil etiketini kontrol eder.

## Genişletme notu

Gelecekte yetenek veya portre eklenirse kaynak, erişim/lisans koşulu ve kaynak tarihi kahraman bazında tutulmalıdır. Kaynağı doğrulanmayan görseller ve oyun verileri yayımlanmamalıdır.
