# Bilinen Sınırlar

**Ölçüm tarihi:** 2026-08-25

Bu belge, ölçülerek tespit edilmiş iki algoritmik sınırı kaydeder. İkisi de gizlenmez;
final sunumunda ölçülmüş bulgu olarak sunulur.

---

## 1. dHash kırpma dönüşümünü yakalamıyor

### Raporda karşılığı

Rapor Tablo 6, görsel özgünlük test kümesinin dört dönüşüm içerdiğini belirtir:
**yeniden boyutlandırma, sıkıştırma, kırpma, filtre.** Kırpma bu dönüşümlerden biridir.

### Ölçüm

Beş görsel × beş dönüşüm, eşik ≤ 10 bit Hamming mesafesi:

| Dönüşüm | Ortalama Hamming | Yakalanan |
|---|---|---|
| Sıkıştırma | 0,4 | **5/5** |
| Yeniden boyutlandırma | 0,4 | **5/5** |
| Filtre | 1,8 | **5/5** |
| **Kırpma** | **25,4** | **0/5** |
| **Kırpma + filtre** | **29,0** | **0/5** |

### Teknik gerekçe

dHash satır bazlı komşu piksel farkı kullanır. Kırpma, içeriği 9×8 ızgara içinde
kaydırır; komşuluk ilişkileri baştan kurulur ve imza korunmaz.

**Eşik ayarıyla çözülemez.** Ölçülen kırpma mesafesi (25,4), alakasız görsel
çiftlerinin en yakın mesafesinden (21) büyüktür. Kırpmayı yakalayacak kadar geniş bir
eşik, birbiriyle ilgisiz görselleri de kopya sayardı.

Çok ölçekli merkez sondalama denendi (aday beş kırpma oranında hash'lenip en yakını
alındı): kırpma mesafesi 25,4'ten yalnızca 23,2'ye indi, yakalama 0/5'te kaldı.
Üreteç asimetrik kırptığı için merkez sondası hizalanamıyor.

### Karar

**Kırpma test kümesinde kalır ve sonuç dürüstçe raporlanır.** Görsel kademesi için tek
bir birleşik duyarlılık verilmez; dönüşüm türü bazında kırılım sunulur ki başarısızlık
tek bir dönüşümde lokalize görünsün, tüm kademeye yayılmasın. Birleşik F1 de hesaplanır
ama kırılımla birlikte sunulur. Eşik–F1 eğrisi kırpma dahil ve hariç iki seri olarak
çizilir.

---

## 2. Düz gürültü düşük çaba kademesinde yakalanmıyor

### Raporda karşılığı

Rapor Tablo 6, düşük çaba görsel kümesinin tanımında üç bileşen sayar:
**tek renk, bulanık, gürültü.** Gürültü bu üç bileşenden biridir.

### Ölçüm

Aile başına 20 üretilmiş görsel, eşik ≥ 0,65:

| Aile | Ortalama skor | Eşiği geçen |
|---|---|---|
| Tek renk | 0,894 | **20/20** |
| Bulanık | 0,764 | **20/20** |
| **Düz gürültü** | **0,511** | **0/20** |

Tipik bir gürültü örneğinin bileşenleri: entropi 3,42 · Laplas varyansı 83,6 ·
baskın renk oranı 0,156.

### Teknik gerekçe

Ölçüm 50×50 küçültme üzerinde yapılır. Düz rastgele gürültü küçültüldüğünde komşu
pikseller ortalanır: entropi orta seviyeye iner, Laplas varyansı orta seviyede kalır,
baskın renk oranı düşer. Üç bileşenin hiçbiri kuvvetli tetiklenmez.

Gürültüyü ayırt etmek uzamsal özilinti gibi farklı bir sinyal gerektirir; mevcut üç
bileşen bu yapıyı görmez.

### Bağlam

Gerçek dünyada düşük çabalı görsel çoğunlukla **düz renk, bulanık fotoğraf veya ekran
görüntüsü** biçimindedir; bu iki aile %100 yakalanıyor. Düz rastgele gürültü bir
kullanıcının paylaşacağı türden içerik değil, sentetik bir uç durumdur.

### Karar

Sınır belgelenir ve gürültü ailesi kümede tutulur. Düşük çaba kademesinin metrikleri
aile bazında kırılımla sunulur.
