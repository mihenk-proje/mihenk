# Veri Kaynakları

Ölçüm kümelerinde kullanılan her kaynağın lisansı, erişim tarihi ve alınan kayıt
sayısı burada kayıtlıdır.

> **Lisans uyarısı:** Depo kodu MIT lisanslıdır. `data/` altındaki içerik **kendi
> kaynak lisansına tabidir** ve MIT kapsamında değildir. Kümeyi yeniden
> dağıtırken aşağıdaki koşullara uyulmalıdır.

## Metin — UCI Turkish User Review Dataset

| | |
|---|---|
| Kaynak adı | UCI Turkish User Review Dataset |
| URL | https://archive.ics.uci.edu/dataset/769/turkish+user+review+dataset |
| Lisans | **CC BY 4.0** |
| Erişim tarihi | 2026-08-25 |
| Kaynaktaki toplam | 37.048 yorum (+ 8 kategori başlığı) |
| Alınan | 2.500 (ana havuz) + 100 (pilot havuzu) |
| Künye | Ekinci, E. ve İlhan Omurca, S. (2022) |

**Yükümlülük:** CC BY 4.0 atıf gerektirir. Türetilmiş küme yeniden dağıtılırken
yukarıdaki künye ve kaynak URL'si korunur. Share-alike yükümlülüğü **yoktur**;
küme MIT lisanslı kodla aynı depoda bulunabilir. Her kayıt kendi içinde
`source_name`, `source_url` ve `source_license` alanlarını taşır.

**Alınmayanlar:** Kaynağın kendi sınıflandırması alınmamıştır; yalnızca ham metin
kullanılır. Kaynak etiketi bu görevle ilgisizdir ve etiketleyiciyi yanıltır.

### Kaynak uyumu — beyan edilecek sınır

UCI kümesi **ürün yorumlarından** oluşur; MİHENK'in hedef alanı ise **mikroblog
gönderileridir.** Türkçe mikroblog içeriği için açık lisanslı ve rıza sorunu
taşımayan bir derlem bulunamadığından, çaba çeşitliliği bakımından en yakın açık
kaynak seçilmiştir.

Ürün yorumları bu iş için şu nedenle uygundur: doğal çaba çeşitliliği aynı havuzda
bulunur — tek kelimelik içeriksiz yorumlarla ayrıntılı kullanım deneyimleri bir
arada. Küratörlü derlemler (Tatoeba, Common Voice) sistematik olarak iyi biçimlenmiş
metne kayar ve düşük çabalı sınıfı temsil edemez.

**Bu alan farkı sunumda açıkça beyan edilecektir.** Ölçülen başarım, ürün yorumu
alanında elde edilmiştir; mikroblog alanına aktarımı doğrudan değildir.

### Duygu dengesi uygulanamadı — gerekçe

Kaynak bir duygu analizi çalışmasından gelmektedir ve duygu ile uzunluk
korelasyonlu olabilir: olumsuz yorumlar kısa olma eğilimindedir. Bu durumda
uzunluğa göre katmanlı örnekleme yapılırsa kısa katman olumsuz yorumlarla dolar ve
etiketleyiciler düşük çaba yerine **olumsuzluğu** etiketlemeye başlayabilir.

**İndirilen dosya düz metindir ve duygu etiketi sütunu içermez** (37.048 satır,
ayraç yok, etiket alanı yok), bu yüzden duyguya göre dengeleme yapılamamıştır.

Yerine **ürün kategorisine göre dengeleme** uygulanmıştır: her katman sekiz
kategoriden (bilgisayar, çay makinesi, kulaklık, modem, parfüm, cep telefonu,
televizyon, USB) eşit çeker. Bu, kısa katmanın tek bir ürün tipiyle dolmasını
engeller ancak duygu dağılımını doğrudan kontrol etmez.

Kalan risk şöyle izlenecektir: **pilot sonrası uyuşmazlıkların olumsuz yorumlarda
kümelenip kümelenmediği kontrol edilecek.** Kümeleniyorsa kılavuza "olumsuzluk
nitelik ölçüsü değildir" vurgusu güçlendirilecek ve pilot tekrarlanacaktır.

### Örnekleme yöntemi

Havuz, uzunluk ve benzersiz kelime oranının birleşik sırasına göre iki katmana
ayrılır (kısa/tekrarlı ve uzun/zengin), ikisinden eşit sayıda çekilir. Bu
**ön-etiketleme değildir**: havuzun tek uçta yığılmasını engeller, nihai kararı
etiketleyici verir. Seçim tohumludur ve tekrar üretilebilir (`--seed`).

Pilot havuzu ayrıca sınır durumları yoğunlaştırır: 25–150 karakter bandında ve orta
tekrar oranındaki kayıtlardan seçilir. Kolay örneklerle yapılan pilot yanıltıcı
yüksek kappa verir ve kılavuzdaki boşlukları göstermez. Ayrım modelin düşük çaba
skoruna göre değil ham dil özelliklerine göre yapılır; pilotu modelin kendi
çıktısına dayandırmak ölçümü modele bağlar.

## Görsel — Unsplash Lite Dataset

| | |
|---|---|
| Kaynak adı | Unsplash Lite Dataset |
| URL | https://unsplash.com/data |
| Depo | https://github.com/unsplash/datasets |
| Lisans | Unsplash Lisansı (ticari kullanıma açık, izin gerektirmez) |
| Erişim tarihi | *(indirme yapıldığında güncellenecek)* |
| Alınan | 1.000 (500 özgün + 500 normal) |

**Yeniden dağıtım yasağı:** Unsplash görselleri yeniden dağıtılamaz. Depo herkese
açık olduğu için görsel dosyaları `.gitignore` ile dışlanır ve **commit edilmez.**

Bunun yerine `data/images/manifest.jsonl` yayımlanır. Manifest her kayıt için
kaynak URL, Unsplash foto kimliği, indirme tarihi, hesaplanan dHash ve uygulanan
dönüşümü taşır. Üçüncü taraf manifest'ten aynı görselleri çekip ölçümü
tekrarlayabilir; telifli dosya dağıtılmamış olur. Yeniden indirme adımları için
README'deki "Ölçümü tekrarlama" bölümüne bakınız.

**Atıf:** "Unsplash Lite Dataset", unsplash.com/data

## Kazıma yasağı

Hiçbir kaynaktan kazıma (scraping) yapılmamıştır ve depoda kazıma betiği
bulunmamaktadır. Rapor "ham içerik açık rıza olmadan kullanılmaz" taahhüdü
vermektedir. Twitter/X kaynaklı kümeler, platform kullanım koşulları ve rıza
meselesi nedeniyle değerlendirmeye alınmamıştır.

## Sentetik veri

Betiklerle üretilen varyantlar `source: sentetik` olarak işaretlenir. Final
raporunda sentetik oran açıkça beyan edilir.
