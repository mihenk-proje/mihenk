# Avatar Kararı — Fotoğraf Kullanılmıyor

**Karar tarihi:** 2026-08-25

Kullanıcı avatarlarına fotoğraf eklenmesi değerlendirildi ve **reddedildi.**
Yerine baş harflerden üretilen, ölçülerek seçilmiş renkli avatarlar kullanılıyor.

## Gerekçeler

### 1. Rıza

Gerçek kişi fotoğrafları kurgusal hesaplara atfedilemez. Demo akışındaki
kullanıcılar (Ahmet Yılmaz, Ayşe Kaya, Kaan Demir…) kurgusaldır; bir fotoğrafın
sahibinin, kendi görüntüsünün uydurma bir hesaba ve o hesaba atfedilen
gönderilere bağlanmasına rıza göstermediği varsayılmalıdır. Bu, projenin
"ham içerik açık rıza olmadan kullanılmaz" taahhüdüyle de çelişirdi.

### 2. Tez çelişkisi

Yapay zekâyla üretilmiş yüzler bu sorunu çözmez, başka bir sorun yaratır. Tüm
iddiası **içeriğin özgünlüğünü denetlemek** olan bir projenin, kendi arayüzünü
üretilmiş insan görüntüleriyle döşemesi savunulabilir değildir. Jüri bu
çelişkiyi sorabilir ve verilecek tutarlı bir cevap yoktur.

### 3. Ürün görünürlüğü

Kozmetik katalog çerçeve (Pirinç, Tunç, Ametist, Altın), rozet (Kuvars, Gümüş,
Külçe, Ayar) ve ad rengi vurgusundan oluşuyor. Bu öğeler sade bir zemin
üzerinde okunur. Fotoğraf avatar, ince bir çerçeve halkasını görsel olarak
yutar; jeton ekonomisinin görünür çıktısı olan kozmetikler fark edilmez hâle
gelir.

## Yerine ne yapıldı

Baş harf avatarları ölçülerek iyileştirildi. Renkler üç kısıtı birden
karşılıyor:

| Kısıt | Eşik | Gerekçe |
|---|---|---|
| Beyaz baş harfler | ≥ 4,5 | Metin okunabilirliği (WCAG 1.4.3) |
| Koyu sayfa zemini | ≥ 3 | Dairenin şekil olarak seçilebilmesi (1.4.11) |
| Açık sayfa zemini | ≥ 3 | Aynı, açık temada |

Bu üçü parlaklığı dar bir banda hapsediyor. Altı ton o bant içinde birbirinden
ayrık hue'lara yerleştirildi:

| Ton | Renk | Beyaz metin | Koyu zemin | Açık zemin |
|---|---|---|---|---|
| Deniz | `#327886` | 5,05 | 3,55 | 4,40 |
| Mor | `#8c59b1` | 5,05 | 3,55 | 4,40 |
| Zeytin | `#517934` | 5,06 | 3,55 | 4,40 |
| Kiremit | `#bc4a24` | 5,05 | 3,55 | 4,40 |
| Lacivert | `#346ad5` | 5,05 | 3,55 | 4,40 |
| Toprak | `#95642d` | 5,05 | 3,55 | 4,40 |

Renk seçimi kullanıcı adından FNV-1a karmasıyla türetilir: aynı kullanıcı her
yüklemede aynı rengi alır, rastgelelik yoktur.

Uygulama: [`src/lib/store/efektler.ts`](../src/lib/store/efektler.ts)
