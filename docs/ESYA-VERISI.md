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

- **34 eşya**: Türkçe ad + stat + pasif metni (`data/source/items_tr_ocr.json`)
- 32'sinde 100+ karakter pasif metni var
- Örnek (doğruluğu İngilizce aslıyla teyit edildi):

```
Bozulma Tırpanı (Corrosion Scythe)
+30 Fiziksel Saldırı · +5% Hareket Hızı · +30% Saldırı Hızı
Eşsiz Pasif - Yozlaşım: Temel Saldırılar ekstra 80 Fiziksel Hasar kazanır ve hedefi
1.5 saniyeliğine 8% yavaşlatır (menzilli Temel Saldırılar için yarıya iner).
Bu etki 5 yükle sınırlıdır. Eşsiz Pasif - Dürtü: Temel Saldırılar 3 saniyeliğine
ekstra 6% Saldırı Hızı kazandırır. Bu etki 5 yüke kadar birikebilir.
```

## Bilinen kusurlar

1. **Kapsam 34/92.** 134 görüntünün çoğu ızgara (mağaza listesi); detay paneli
   açık olanlar sınırlı sayıda.
2. **Sıra karışması.** Bazı eşyalarda devam parçaları yanlış sırada birleşiyor
   (örn. Avcı Darbesi). İngilizce aslıyla karşılaştırıp düzeltilmeli.
3. **OCR artıkları.** `(8 şema` gibi parçalar, `+4400 can` gibi hatalı sayılar.
4. **Pasifler oyun metni** — Moonton'a ait; yalnızca atıflı, ticari olmayan kullanım.

## Sıradaki adım

1. 34 eşyanın pasifini **İngilizce aslıyla karşılaştırıp** düzelt (metin oyun metni
   kalır, hatalar giderilir).
2. Kalan ~58 eşya için: ızgara görüntülerinden ad çıkarımı + İngilizce pasifin
   Türkçeye çevrilmesi.
3. Sonra eşya sayfası: kategoriye göre liste, arama, "hangi kahraman alır" bağlantısı.
4. Build şeması bu katalog üzerine kurulur (`heroId, role, items[], note`).
