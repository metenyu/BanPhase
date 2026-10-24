# Eşya verisi — toplama notu (24.10.2026)

## Ne yapıldı

Kullanıcının oyun içi eşya ekran görüntüleri (134 JPEG, `Mlbb item ss`) yerel olarak
işlendi. Hiçbir görüntü buluta gönderilmedi, hiçbir görüntü depoya eklenmedi.

1. **Windows OCR** (Türkçe dil paketi) ile 134 görüntü metne çevrildi.
2. İkinci geçişte **kelime koordinatları** alındı; sağdaki detay paneli geometriden
   bulundu (x > görüntü genişliğinin %45'i).
3. Her eşya için ana görüntü + **devam görüntüleri** zaman damgasına göre birleştirildi
   (kullanıcı, satır sığmadığı için ekran görüntüsü almış).
4. OCR'ın yüzde hatası düzeltildi: `%30` → `3096` okunuyordu; `3096 → 30%`.
5. Tekrar eden satır parçaları (OCR örtüşmesi) kırpıldı.

## Sonuç

- **62 eşya**: Türkçe ad + stat + pasif (`data/items.json`)
- 7'si **Pençe Kutsaması** (Alev/Buz/Kanlı Pençe, Gizle, Cesaretlendir, Dehşet Darbesi, İyilik)
- Pasifi olmayan eşyalar `null` — botlar gibi, yalnızca stat verirler

## Düzeltme (kullanıcı, 24.10.2026)

- **`Raptor Machete` / eski jungle hattı 2020'de oyundan kaldırıldı.** "Jungle kategorisi
  eksik" tespiti yanlıştı; bugün orman için **Pençe Kutsaması** kullanılıyor. Kaldırılmış
  eşyalar kataloğa alınmaz.
- Her eşyanın pasifi olmak zorunda değil (botlar yalnızca stat verir).
- **Kaotik Silah** pasifi kullanıcı tarafından yazıldı, `data/source/items-fixes.json`
  üzerinden uygulanıyor (OCR kesik bırakmıştı).

```
Bozulma Tırpanı (Corrosion Scythe)
+30 Fiziksel Saldırı · +5% Hareket Hızı · +30% Saldırı Hızı
Eşsiz Pasif - Yozlaşım: Temel Saldırılar ekstra 80 Fiziksel Hasar kazanır ve hedefi
1.5 saniyeliğine 8% yavaşlatır (menzilli Temel Saldırılar için yarıya iner).
Bu etki 5 yükle sınırlıdır. Eşsiz Pasif - Dürtü: Temel Saldırılar 3 saniyeliğine
ekstra 6% Saldırı Hızı kazandırır. Bu etki 5 yüke kadar birikebilir.
```

## Bilinen kusurlar

1. **Kapsam 62.** Izgarada görünüp detay paneli hiç açılmamış eşya kalmış olabilir.
2. **Birkaç kayıtta OCR artığı** (örn. Avcı Darbesi'nde cümle sırası).
3. **Kategori tahmini** stat imzasından yapılıyor; birkaç eşya "Diğer"e düşüyor.
4. **Pasifler oyun metni** — Moonton'a ait; yalnızca atıflı, ticari olmayan kullanım.

## Sıradaki adım

1. Kalan eşya detayları varsa aynı boru hattından geçir (görüntü → OCR → birleştirme).
2. **Build şeması**: `heroId, role, items[], note` — eşya id'leri hazır.
3. Eşya sayfasına kahraman bağlantısı ("bu eşyayı kim alır").
