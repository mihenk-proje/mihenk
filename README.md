# MİHENK — NSosyal Katılım Katmanı Prototipi

**Nitelikli paylaşımı ödüllendiren, kopya ve düşük çabalı içeriği ayıklayan bir
katılım katmanı.** Ödül, paylaşım miktarına değil içeriğin otomatik bir denetimden
geçip geçmediğine bağlanır; denetimi geçemeyen gönderi yayında kalır, yalnızca jeton
kazanmaz.

### ▶ Canlı demo: **https://mihenk-proje.vercel.app**

Kurulum gerekmez. "Demo olarak gir" düğmesi sizi hazır akışa götürür; akışı yukarıdan
aşağı kaydırdığınızda doğrulama kademelerinin tamamını sırayla görürsünüz.

> Akış önce boyanır, doğrulama rozetleri saniyeler içinde **sonradan belirir**. Bu
> kasıtlıdır: gönderi paylaşıldığı anda görünür, doğrulama sonucunu beklemez.

## Doğrulama kademeleri

Zincir kademelidir. Bir kademe hata verirse zincir durmaz; o kademenin katkısı düşer
ve ağırlıklar kalan kademelere dağıtılır. Üst sınır 8 saniyedir.

| Kademe | Ne bakar | Eşik | Rolü |
|---|---|---|---|
| **Metin özgünlüğü** | 5 karakterlik n-gram + Jaccard benzerliği | **≥ 0,35 kopya** | Kapı |
| **Benzerlik uyarı bandı** | Aynı ölçü, kopya eşiğinin altı | 0,20 – 0,35 | Kazancı azaltır |
| **Düşük çaba (metin)** | Uzunluk, kelime sayısı, çeşitlilik, tekrar | **≥ 0,65 elenir** | Kapı |
| **Görsel özgünlüğü** | 9×8 dHash + Hamming mesafesi | **≤ 10 bit kopya** | Kapı |
| **Düşük çaba (görsel)** | Entropi, Laplas varyansı, baskın renk | **≥ 0,65 elenir** | Kapı |
| **Anket çeşitliliği** | Seçenekler arası 3-gram Jaccard | > 0,80 ayrışmamış | Skor |
| **Hesap davranışı** | Hesap yaşı | < 3 gün ise ×0,5 | Katsayı |

Kopya içerik **elenir, silinmez**: gönderi yayında kalır, jeton kazanmaz ve gerekçede
örtüşme oranı ile kaynak gönderinin bağlantısı gösterilir.

| Skor | Durum | Ödül |
|---|---|---|
| ≥ 60 | Doğrulandı | 10 jeton |
| 40 – 59 | Kısmen doğrulandı | 5 jeton |
| < 40 | Jeton kazanmadı | 0 |

Günlük kazanç üst sınırı 50 jetondur.

## Düşük çaba skoru nasıl hesaplanır

Rapor Tablo 9'daki **"Olasılık Skoru ≥ 0,65"** eşiğinin tanımı budur. Skor 0–1
aralığında bir **düşük çaba olasılığıdır** (yüksek = düşük çaba), nitelik puanının
tersidir. Tanım: [`src/lib/verification/dusukCaba.ts`](src/lib/verification/dusukCaba.ts)

| Kademe | Bileşen | Ağırlık |
|---|---|---|
| Metin | Karakter sayısı | 0,40 |
| Metin | Kelime sayısı | 0,30 |
| Metin | Tip/token çeşitliliği | 0,18 |
| Metin | Ardışık tekrar | 0,12 |
| Görsel | **Laplas varyansı** (bulanıklık) | **0,60** |
| Görsel | Entropi | 0,25 |
| Görsel | Baskın renk oranı | 0,15 |

Sert tabanlar: 15 karakterin altı ve yalnızca emoji/bağlantı içeren gönderiler
doğrudan 1,0 alır. "Min. 15 karakter" kısıtı metin kademesine aittir.

Görsel ağırlıkları 1.000 fotoğrafla kalibre edildi; Laplas varyansı sınıfları
neredeyse tek başına ayırıyor (normal %5 = 120, düşük çabalı %95 = 82). Yanlış pozitif
oranı **%0,40**. Ölçüm ayrıntısı:
[`results/dusuk-caba-kalibrasyonu.md`](results/dusuk-caba-kalibrasyonu.md)

## Bilinen sınırlar

Ölçülerek tespit edilmiş iki sınır gizlenmez:

- **dHash kırpmayı yakalamıyor.** Sıkıştırma, boyutlandırma ve filtrede 5/5; kırpmada
  0/5. Eşik ayarıyla çözülemez: kırpma mesafesi (25,4) alakasız görsel çiftlerinin
  en yakın mesafesinden (21) büyük.
- **Düz gürültü düşük çaba kademesinde yakalanmıyor.** Tek renk ve bulanık %100
  yakalanıyor; düz rastgele gürültü 0/20.

Gerekçeleri ve ölçümleri: [`results/bilinen-sinirlar.md`](results/bilinen-sinirlar.md)

## Proje hakkında

MİHENK bağımsız bir sosyal ağ değil, mevcut mikroblog platformu NSosyal üzerine oturan
bir **özellik katmanıdır**. Amacı, nitelikli paylaşımları ödüllendirerek pasif tüketim
sarmalını kırmaktır.

- **Ev sahibi platform ekranları** — Nötr, metin öncelikli akış ve gönderi oluşturma.
  MİHENK burada yalnızca küçük bir doğrulama rozeti olarak belirir.
- **MİHENK ödül ekranları** — Kendi görsel kimliğini taşıyan cüzdan, mağaza ve
  doğrulama sonucu ekranları. Bazalt zemin, pirinç vurgu çizgisi, mono sayılar.

Kullanıcı sonuca itiraz edip insan incelemesine gönderebilir. Prototipte itiraz süreci
sonuç üretmez ve bu arayüzde açıkça belirtilir.


## Kurulum

```bash
npm install
npm run dev     # http://localhost:3000
```

| Komut | İşlevi |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm start` | Üretim sunucusu |
| `npm run lint` | ESLint denetimi |
| `npm test` | Doğrulama ve depo testleri (99 test) |

Ortam değişkeni gerekmez; uygulama tamamen istemci tarafında çalışır ve arka uç bağlantısı yoktur.

## Teknik yapı

| | |
|---|---|
| Çatı | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Stil | Tailwind CSS v4, CSS değişkenleri, koyu/açık tema |
| Doğrulama | Saf JavaScript. Model çağrısı, ağ isteği veya üçüncü taraf servis yok |
| Durum | Veritabanı yok. Modül düzeyi bir depo, `localStorage` ile kalıcı |

## Proje yapısı

```
src/
├── app/                     Next.js App Router girişi
│   ├── layout.tsx           Kök düzen, yazı tipleri, üst veri
│   ├── manifest.ts          Web uygulama bildirimi (telefona kurulum)
│   ├── page.tsx             Tek sayfa: giriş kapısı, akış ve ekran geçişleri
│   ├── providers.tsx        Tema ve depo sağlayıcıları
│   └── globals.css          Yüzey jetonları (ev sahibi / MİHENK), tema, animasyonlar
├── components/              Arayüz bileşenleri
│   ├── Yuzey.tsx            Yüzey sınırı: ev sahibi (NSosyal) ↔ MİHENK
│   ├── KatmanEkran.tsx      Tam ekran katmanların ortak kabuğu
│   ├── Giris.tsx            Demo giriş kapısı
│   │
│   │                        — Ev sahibi kroması (NSosyal) —
│   ├── TopBar.tsx           Üst çubuk: menü, kimlik işareti, bildirimler
│   ├── AltGezinti.tsx       Alt gezinti; Cüzdan ve Mağaza pirinç MİHENK sekmesi
│   ├── YanCekmece.tsx       Yan menü, tema anahtarı ve tanıtım turu
│   ├── HikayeSeridi.tsx     Hikâye şeridi (yazarlardan türetilir)
│   ├── AkisSekmeleri.tsx    Ana akış / Takip ettiklerin
│   ├── OlusturDugmesi.tsx   Yüzen oluştur düğmesi
│   ├── NSimgesi.tsx         NSosyal kimlik işareti (satır içi SVG)
│   ├── KapsamNotu.tsx       Kapsam dışı bölüm bildirimi
│   │
│   ├── GonderiOlustur.tsx   Gönderi oluşturma (metin, görsel, anket)
│   ├── GonderiKarti.tsx     Akıştaki tek gönderi
│   ├── EtkilesimSeridi.tsx  Etkileşim hapları (yorum, paylaşım, roket, görüntülenme)
│   │
│   │                        — MİHENK ödül yüzeyi —
│   ├── DogrulamaSonucu.tsx  Doğrulama sonucu paneli ve mihenk çizgisi
│   ├── Itiraz.tsx           Üç adımlı itiraz akışı
│   ├── Cuzdan.tsx           Bakiye, günlük sınır, envanter, hareket defteri
│   ├── Profil.tsx           Kapak, kuşanılmış kozmetikler, envanter, kendi gönderileri
│   ├── Bildirimler.tsx      Kazanç, doğrulama ve süre bitimi bildirimleri
│   ├── KimlikOnizleme.tsx   Avatar + ad + rozet bileşimi (profil ve mağaza önizlemesi)
│   ├── KozmetikGorseli.tsx  Kozmetiğin ne olduğunu gösteren görsel
│   ├── Magaza.tsx           Ürün listesi ve satın alma öncesi önizleme
│   ├── Tanitim.tsx          İlk giriş tanıtım turu
│   │
│   ├── Modal.tsx            Erişilebilir kalıcı pencere (Escape, odak tuzağı)
│   ├── MihenkSimgesi.tsx    MİHENK monogramı
│   ├── ServisCalisani.tsx   Servis çalışanı kaydı (kurulabilirlik)
│   └── Avatar.tsx           Baş harflerden avatar üretimi
└── lib/
    ├── bicim.ts             Akıştaki sayı ve zaman biçimleri
    ├── kurulum.ts           beforeinstallprompt yakalama kancası
    ├── store/               Durum katmanı
    │   ├── types.ts         Veri modeli tanımları
    │   ├── demoData.ts      Demo gönderiler, yazarlar ve mağaza kataloğu
    │   ├── depo.ts          React dışı depo: kalıcılık, satın alma, doğrulama tetikleme
    │   ├── kanca.tsx        Bileşenlerin depoya bağlandığı kanca ve hidrasyon kapısı
    │   └── efektler.ts      Satın alınan ürün etkilerinin çözümlenmesi ve süre takibi
    └── verification/
        └── index.ts         Doğrulama zinciri ve tüm ölçüm fonksiyonları
```

Uygulama durumu React ağacının dışında tutulur ve bileşenler onu `useSyncExternalStore` ile okur.
Bunun nedeni, doğrulamanın zamanlayıcılar içinde çalışması ve her zaman en güncel durumu görmesi
gerekmesidir; bileşen kapanışına (closure) takılan bir kopya yetersiz kalır.

### `lib/verification/` içindeki ölçüm fonksiyonları

| Fonksiyon | Ne yapar |
|---|---|
| `normalizeTurkce` | Metni Türkçe yerel ayarıyla küçültür (İ/I ayrımını korur), noktalama ve sembolleri boşluğa çevirir |
| `parcalaraAyir` | Normalleştirilmiş metni boşluksuz birleştirip 5 karakterlik kayan n-gram kümesi üretir |
| `jaccardBenzerligi` | İki n-gram kümesinin kesişim/birleşim oranını verir |
| `olcMetinNiteligi` | Uzunluk, kelime sayısı, tip/token oranı, tekrar, emoji-bağlantı ve büyük harf oranını ölçüp 0–100 nitelik puanı üretir |
| `olcAnketCesitliligi` | Anket seçeneklerinin dolu, benzersiz ve birbirinden ayrışmış olup olmadığını ölçer |
| `hesaplaDHash` | Görseli 9×8 gri tona indirger, komşu piksel farklarından 64 bitlik algısal parmak izi çıkarır |
| `hammingMesafesi` | İki dHash arasındaki farklı bit sayısını verir |
| `olcDusukCaba` | Görselin gri ton histogram entropisi ve baskın renk oranından "düşük çaba" içeriği ayıklar |
| `hesapYasiGun` | Hesap oluşturma tarihinden bugüne geçen gün sayısını verir |
| `dogrula` | Yukarıdaki ölçümleri kademeli zincir hâlinde çalıştırıp nihai skoru ve gerekçeleri üretir |

## Doğrulama algoritmaları

Zincir kademeli çalışır. Bir kademe hata verirse zincir durmaz; o kademenin katkısı düşer ve
ağırlıklar kalan kademelere yeniden dağıtılır. Tüm zincirin üst sınırı 8 saniyedir; aşılırsa
gönderi "doğrulama tamamlanamadı" gerekçesiyle sonuçlandırılır.

| Kademe | Yöntem | Eşik | Rolü |
|---|---|---|---|
| 1 — Metin özgünlüğü | 5 karakterlik n-gram + Jaccard benzerliği | ≥ 0,35 kopya sayılır | **Kapı** |
| 1b — Düşük çaba | Ağırlıklı düşük çaba skoru (uzunluk, kelime sayısı, çeşitlilik, tekrar) | ≥ 0,65 elenir · 15 krk. sert taban | **Kapı** |
| 1c — Metin niteliği | Uzunluk, kelime sayısı, tip/token oranı, tekrar, emoji-bağlantı, büyük harf oranı | aşağıdaki tablo | Skor |
| 2 — Görsel özgünlüğü | 9×8 dHash + Hamming mesafesi | ≤ 10 bit aynı görsel sayılır | **Kapı** |
| 2b — Görsel çabası | Entropi, Laplas varyansı, baskın renk oranı | düşük çaba skoru ≥ 0,65 elenir | **Kapı** + skor |
| 2c — Anket çeşitliliği | Seçenekler arası 3-gram Jaccard | > 0,80 ayrışmamış sayılır | Skor |
| 3 — Hesap davranışı | Hesap yaşı | < 3 gün ise kazanç ×0,5 | Katsayı |

### Düşük çaba skoru

Teknik rapor Tablo 9'da geçen **"Olasılık Skoru ≥ 0,65 (Min. 15 krk.)"** eşiğinin tanımı
`src/lib/verification/dusukCaba.ts` içindedir.

Skor **0–1 aralığında bir düşük çaba olasılığıdır**: yüksek değer içeriğin düşük çabalı
olduğuna işaret eder. Nitelik puanının tersidir, karıştırılmamalıdır. Eşiğe ulaşan içerik
nitelik puanına bakılmaksızın elenir ve jeton kazanmaz.

**"Min. 15 karakter" kısıtı metin kademesine aittir** ve sert bir tabandır: 15 karakterin
altındaki metin diğer bileşenlere bakılmaksızın 1,0 alır. Görsel kademesinin karakter
tabanı yoktur.

| Kademe | Bileşen | Ağırlık | Doyum noktası |
|---|---|---|---|
| Metin | Karakter sayısı | 0,40 | 80 karakterin üstünde ceza sıfırlanır |
| Metin | Kelime sayısı | 0,30 | 14 kelimenin üstünde ceza sıfırlanır |
| Metin | Tip/token çeşitliliği | 0,18 | yalnızca 5 kelimeden uzun metinlerde |
| Metin | Ardışık tekrar | 0,12 | ikili (var/yok) |
| Görsel | Gri ton histogram entropisi | 0,40 | 4,5 bitin üstünde ceza sıfırlanır |
| Görsel | Laplas varyansı (bulanıklık) | 0,35 | 120'nin üstünde ceza sıfırlanır |
| Görsel | Baskın renk oranı | 0,25 | %35'in altında ceza yok |

Sert tabanlar: 15 karakterin altı ve yalnızca emoji/bağlantı içeren gönderiler doğrudan
1,0 alır. Skor dört ondalığa yuvarlanır; ağırlık toplamları kayan noktada tam gelmediği
için eşik karşılaştırması aksi hâlde kıl payı kaçabiliyor.

Ölçülen ayrım genişliği (aynı fonksiyonun çıktısı):

| Metin | Skor | Sonuç |
|---|---|---|
| `Tamam.` | 1,000 | düşük çaba (sert taban) |
| `🔥🔥🔥` | 1,000 | düşük çaba (sert taban) |
| `Kahve molası verdim şimdi.` | 0,700 | düşük çaba |
| `a a a a a b b b b b c c c c c` | 0,664 | düşük çaba |
| `Bu hafta sonu dinlenmeye ayıracağım…` | 0,162 | normal |
| `Roket motorunun ikinci ateşleme denemesinde…` | 0,120 | normal |
| `Yapay zeka araçlarını günlük iş akışına…` | 0,030 | normal |

Ağırlıklar ve doyum noktaları prototip değerleridir; nihai değerler etiketlenmiş küme
üzerinde eşik taramasıyla belirlenecektir.

### Metin niteliği ceza tablosu

Puan 100'den başlar ve şu cezalar düşülür:

| Durum | Ceza |
|---|---|
| 15 karakterden kısa | −65 |
| 15–29 karakter | −30 |
| 30–59 karakter | −10 |
| 8 kelimeden az | −12 |
| 8–11 kelime | −5 |
| 5 kelimeden uzun ve tip/token oranı < 0,40 | −30 |
| Aynı karakter 5+ kez veya aynı kelime 3 kez ardışık | −50 |
| Yalnızca emoji veya bağlantı | −80 |
| 10 harften uzun ve büyük harf oranı > %80 | −20 |

### Özgünlük neden skora katılmıyor

Özgünlük bir skor bileşeni değil, **geçilmesi gereken bir kapıdır**. Kopya içerik zincirin ilk
kademesinde elenir; kapıyı geçen her gönderi için özgünlük tanım gereği sabit değer alır. Skora
katılması durumunda herkese aynı puanı hediye eder ve niteliksiz içeriğin de geçme eşiğini
aşmasına yol açardı. Bu nedenle nihai skor yalnızca nitelik ölçümlerinden gelir:

| Gönderi türü | Ağırlıklar |
|---|---|
| Metin | Metin niteliği %100 |
| Metin + görsel | Metin niteliği %55 · görsel çabası %45 |
| Anket | Metin niteliği %70 · seçenek çeşitliliği %30 |

### Benzerlik uyarı bandı (0,20 – 0,35)

Kopya eşiğinin altında kalan ama örtüşmesi dikkate değer içerik için bir ara
kademe vardır. Bu bandda kalan gönderi **yayında kalır ve jeton kazanır**, ancak
kazancı `BENZERLIK_KATSAYISI` ile azaltılır ve örtüşme oranı gerekçede kullanıcıya
bildirilir.

Bu, teknik raporun 3.2.3 maddesindeki **kademeli puanlama** tasarım kararının
uygulanmasıdır; nitelik kararı ikili değil kademelidir ve doğrulama skorunun jetona
dönüştüğü aralık ölçüm sonrasına bırakılmıştı. Bant o aralığı doldurur.

| Örtüşme | Jaccard | Sonuç |
|---|---|---|
| %25 | 0,150 | Doğrulandı (100) |
| %35 | 0,231 | Kısmen doğrulandı (55) + oran bildirimi |
| %45 | 0,290 | Kısmen doğrulandı (55) + oran bildirimi |
| %100 | 1,000 | Kopya tespit edildi (0) |

> **`BENZERLIK_KATSAYISI = 0,55` kalibrasyon bekleyen bir tasarım parametresidir.**
> Değer gözlemle belirlenmiştir; şu anda ampirik bir dayanağı yoktur. İP7
> kullanılabilirlik testinde katılımcılara azaltılmış kazancın adil algılanıp
> algılanmadığı sorulacak ve katsayı o veriye göre kalibre edilecektir. Bandın
> sınırları (0,20 ve 0,35) ise eşik taramasıyla belirlenir.

### Skor bandı ve ödül

| Skor | Durum | Ödül |
|---|---|---|
| ≥ 60 | Geçti | 10 jeton |
| 40 – 59 | Kısmi | 5 jeton |
| < 40 | Geçemedi | 0 jeton |

Günlük kazanç üst sınırı 50 jetondur. Sınıra takılan gönderilerde bu durum gerekçe olarak
kullanıcıya bildirilir.

> **Eşik değerleri hakkında:** Yukarıdaki tüm eşikler prototip değerleridir ve gözlemle
> belirlenmiştir. Nihai değerler, etiketlenmiş bir test kümesi üzerinde eşik taraması yapılarak
> yanlış pozitif ve yanlış negatif oranları dengelenecek şekilde belirlenecektir. Özellikle kopya
> eşiği (kodda 0,35) ve dHash mesafesi (10 bit) alıntı içeren özgün içerikle gerçek kopya
> arasındaki ayrımı doğrudan etkilediğinden ölçüme dayalı olarak yeniden ayarlanmalıdır.

## Testler

```bash
npm test
```

Testler kaynak dosyaları doğrudan çalıştırır (Node 22+ TypeScript'i kendisi soyar); ayrı bir
derleme adımı veya test çatısı bağımlılığı yoktur. `test/cozumleyici.mjs`, Next'in `@/*` takma
adını ve uzantısız içe aktarımları Node tarafında eşitler; `test/calistir.mjs` depo katmanının
beklediği `localStorage` ve `window` API'lerini taklit eder.

| Dosya | Kapsam | Test |
|---|---|---|
| `test/dogrulama.test.mjs` | Türkçe normalleştirme, n-gram + Jaccard, metin niteliği, anket çeşitliliği, Hamming mesafesi, doğrulama zinciri, yeni hesap koruması | 42 |
| `test/depo.test.mjs` | Hidrasyon, bakiye–hareket defteri tutarlılığı, satın alma, tür başına tek slot, süre dolumu, günlük tavan, akış içinde kopya tespiti, itiraz, koleksiyon ödülü, demo sıfırlama, kopya eşiği ve benzerlik uyarı bandı | 57 |

Tarayıcı sürerek çalışan iki erişilebilirlik denetimi ayrıca bulunur. Bunlar `puppeteer-core`
gerektirdiği için `npm test` dışında tutulmuştur; birim testleri bağımlılıksız kalsın diye.

```bash
npm i --no-save puppeteer-core
node test/tarayici/klavye.mjs          # klavyeyle uçtan uca gezinme (31 kontrol)
node test/tarayici/hareket.mjs         # hareketi azaltma tercihi (8 kontrol)
node test/tarayici/erisilebilirlik.mjs # axe-core, 36 ekran (axe-core da gerekir)
```

Günlük tavan testi altı gönderiyi (6 × 10 = 60 jeton) tam 50'ye kırpar ve her adımda bakiyenin
hareket defteri toplamına eşit kaldığını doğrular.

## Erişilebilirlik

Denetim iki ayrı araçla ve yeniden üretilebilir biçimde yapılır. Uygulamanın ekranlarının çoğu
giriş kapısının arkasında ve tam ekran katman olarak açıldığı için tek sayfa denetimi yeterli
değildir; ekranlara Chrome sürülerek tek tek gidilir.

**axe-core — 36 ekran, sıfır ihlal.** Dokuz ekran × iki tema × iki genişlik (390px / 1280px),
kapsam `wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa`:

```bash
npm run build && npm start -- -p 3100
npm i --no-save puppeteer-core axe-core
node test/tarayici/erisilebilirlik.mjs
```

| Ekran | açık 390 | koyu 390 | açık 1280 | koyu 1280 |
|---|---|---|---|---|
| Giriş | temiz | temiz | temiz | temiz |
| Ana akış | temiz | temiz | temiz | temiz |
| Tanıtım turu | temiz | temiz | temiz | temiz |
| Yan çekmece | temiz | temiz | temiz | temiz |
| Cüzdan | temiz | temiz | temiz | temiz |
| Mağaza | temiz | temiz | temiz | temiz |
| Ürün önizleme | temiz | temiz | temiz | temiz |
| Profil | temiz | temiz | temiz | temiz |
| Bildirimler | temiz | temiz | temiz | temiz |

**Lighthouse 11.** Hem yayındaki adreste hem de yerel üretim derlemesinde
(`npm run build && npm start`):

| Kategori | Canlı — masaüstü | Canlı — mobil | Yerel — masaüstü | Yerel — mobil |
|---|---|---|---|---|
| Erişilebilirlik | **100** | **100** | **100** | **100** |
| En İyi Uygulamalar | **100** | **100** | **100** | **100** |
| SEO | **100** | **100** | **100** | **100** |
| Performans | **100** | **93** | 99 | 86 |

Düzen kayması her ölçümde sıfır, toplam engelleme süresi masaüstünde 0 ms.
Canlı ölçümde ilk içerikli boyama 0,4 s (masaüstü) / 1,7 s (mobil), en büyük
içerikli boyama 0,5 s / 2,9 s.

Canlı mobil performansı bir önceki turda 99'du; profil, bildirimler ve
kozmetik görselleri eklendikçe paket büyüdü ve 93'e indi. Erişilebilirlik,
en iyi uygulamalar ve SEO dört ölçümün hepsinde 100 kaldı.

Yereldeki mobil değerinin düşük görünmesinin sebebi uygulamada değil ölçüm
yöntemindedir: Lighthouse'un öntanımlı Lantern simülasyonu localhost'un sıfıra
yakın ağ gecikmesini modeline oturtamıyor ve en büyük içerikli boyamayı
olduğundan geç tahmin ediyor. Kısıtlama gerçekten uygulandığında
(`--throttling-method=devtools`) yerel mobil değeri **95** oluyor ve en büyük
içerikli boyama ilk içerikli boyamayla aynı ana düşüyor. Gerçek koşulu temsil
eden sütun canlı ölçümdür.

> **Bir ölçüm tuzağı, kayda geçirilmiştir.** Giriş kartı daha önce `opacity: 0`'dan başlayan bir
> animasyonla açılıyordu. Chrome, ilk boyandığı anda saydam olan bir öğeyi en büyük içerikli
> boyama adayı saymaz ve sonradan görünür hale gelse bile yeniden değerlendirmez. Bu yüzden
> sayfanın hızlı bağlantıda hiç LCP'si olmuyordu: Lighthouse `NO_LCP` veriyor ve 25 puan ağırlıklı
> metrik `null` döndüğü için performans kategorisi **0**'a düşüyordu. Yavaş bağlantıda yükleme
> iskeleti yeterince uzun ekranda kaldığı için sorun görünmüyor, ölçüm 99–100 veriyordu. Animasyon
> saydamlık oynatmayacak biçimde değiştirildi ve giriş ekranı artık ilk HTML'de geliyor.

Uygulanan başlıca önlemler:

- Doğrulama sonuçları, mağaza bildirimleri ve karakter sayacı `aria-live` ile duyurulur.
- Kalıcı pencereler Escape ile kapanır, odağı içeride tutar ve kapanınca odağı çağıran öğeye
  geri verir (WCAG 2.1.2, 2.4.3).
- Cüzdan ve mağaza tam ekran açıldığında odak katmana taşınır, arkadaki akış `inert` ile sekme
  sırasından ve erişilebilirlik ağacından çıkarılır.
- Mağaza kategorileri tam WAI-ARIA sekme kalıbını uygular: ok tuşları, Home/End ve roving
  `tabIndex`.
- Karakter sayacı yalnızca sınırın %80'inde ve sınıra ulaşıldığında duyurulur; her tuş
  vuruşunda değil.
- Etkileşim sayaçlarının erişilebilir adı görünür metni birebir içerir (WCAG 2.5.3).
- Klavye odağı için görünür `:focus-visible` halkası tanımlıdır (WCAG 2.4.7).
- `prefers-reduced-motion` tercihi tüm animasyon ve geçişleri devre dışı bırakır (WCAG 2.3.3).
- Avatarlar baş harflerden üretilir; uzak görsel servisine bağımlılık yoktur.

## Ölçüm boru hattını çalıştırma

İP6 ölçüm çalışmasının araçları `scripts/` altındadır. Hepsi `--help` ile ne
yaptığını anlatır ve bağımsız çalışır; `npm test` bunlara bağımlı değildir.

Gereksinimler: Python 3.11+, `pillow`, `numpy`, `scipy`.

### 1. Etiketleme havuzunu oluştur

Havuz **iki alandan** oluşur ve karıştırılır:

```bash
# 2.100 kayıt: UCI ürün yorumları (CC BY 4.0)
python3 scripts/collect_texts.py --girdi dataset.txt \
    --seed 42 --out data/metin/nitelik_havuzu.jsonl

# 300-400 kayıt: ekip yazımı mikroblog gönderileri
python3 scripts/ingest_texts.py --girdi mikroblog.txt \
    --source ozgun_yazim --domain mikroblog_gonderisi \
    --karistir --seed 42 --out data/metin/nitelik_havuzu.jsonl
```

`--karistir` **zorunludur**: sonradan eklenen kayıtlar dosya sonunda kalırsa
etiketleyici belirli bir noktadan sonra alanın değiştiğini fark eder ve kaynağı
gizleme önlemi boşa çıkar.

Her kayıt `domain` alanı taşır (`urun_yorumu` / `mikroblog_gonderisi`). Bu alan
**yalnızca metrik kırılımı için** kullanılır; etiketleyiciye hiçbir yerde
gösterilmez. Sistem mikroblog gönderisi doğruluyor, ölçümün ağırlığı ürün
yorumunda; kırılım olmadan bu alan kayması görünmez kalır.

### 2. Pilot — 100 kayıt, İKİ etiketleyici

Doğrudan toplu işe girilmez. Kappa tek etiketleyiciyle hesaplanamaz; pilotu
**iki kişi ayrı ayrı** yapar:

```bash
python3 scripts/label.py --uye uye1    # kişi A, kendi makinesinde
python3 scripts/label.py --uye uye2    # kişi B, kendi makinesinde
python3 scripts/agreement.py           # kappa
```

**Kappa ≥ 0,70** ise toplu işe geçilir. Altındaysa uyuşmazlıklar birlikte
incelenir, kılavuza örnek eklenir, pilot yeni 100 kayıtla tekrarlanır.

Pilot havuzu sınır durumları yoğunlaştırır (25–150 karakter, orta tekrar
oranı); kolay örneklerle yapılan pilot yanıltıcı yüksek kappa verir ve
kılavuzdaki boşlukları göstermez.

### 3. Toplu etiketleme

Hedef: **2.000 metin** (1.000 nitelikli / 1.000 düşük çabalı), her biri en az
iki üye tarafından bağımsız etiketlenir.

```bash
python3 scripts/label.py --uye uye1 --limit 200   # oturumluk parça
python3 scripts/label.py --uye uye1 --durum       # ilerleme
```

Körleme yapısaldır: her etiketleyici kendi dosyasına yazar
(`data/etiketler/uye1.jsonl`) ve araç diğerlerinin dosyalarını hiç açmaz.
Kaldığı yerden devam eder. Tek tuşla karar alınır (1/2/3), `g` son kararı geri
alır.

Etiketlemeye başlamadan önce
[`docs/etiketleme-kilavuzu.md`](docs/etiketleme-kilavuzu.md) okunmalıdır.

### 4. Uzlaşma ve uyuşmazlık

```bash
python3 scripts/agreement.py
```

Cohen's kappa, karışıklık matrisi, ham uyum oranı ve **alan bazlı kırılım**
üretir; uyuşmazlıkları `data/etiketler/uyusmazlik.jsonl` içine yazar. Üçüncü
değerlendirici bunları `--uye uye3` ile karara bağlar.


### 5. Varyant üretimi

```bash
python3 scripts/gen_text_variants.py --girdi data/metin/ozgun.jsonl     --out data/metin/varyant.jsonl --seed 42
python3 scripts/gen_image_variants.py --girdi-dir data/gorsel/ozgun     --out-dir data/gorsel/varyant --count 4 --seed 42
python3 scripts/gen_lowquality_images.py --count 500 --seed 42
```

### 6. Sızıntı koruması

Eşik sağlamasında kullanılan örnekler geliştirme kümesine sabitlenir ve nihai
test bölünmesine giremez.

```bash
python3 scripts/fix_dev_split.py --dogrula
```

### 7. Varyant üretimi

Eşik taramasının pozitif çiftleri buradan gelir: her özgün kayıttan dört metin
varyantı ve beş görsel dönüşümü türetilir. Üretim deterministiktir; aynı `--seed`
aynı kümeyi verir.

```bash
python3 scripts/gen_text_variants.py --girdi data/metin/ozgun_500.jsonl \
  --out data/metin/varyant_havuzu.jsonl --seed 42
python3 scripts/gen_image_variants.py --girdi-dir data/images/originals \
  --out-dir data/images/variants --count 5 --seed 42 --bicim jpg \
  --jsonl data/images/variants_manifest.jsonl
```

### 8. Eşik taraması ve ölçüm

Ölçüm betikleri **Node ile** çalışır, Python ile değil. Sebep: metin ve hash
tarafının çalışma zamanı karşılığı (`normalizeTurkce`, `parcalaraAyir`,
`jaccardBenzerligi`, `hesaplaDHash`, `hammingMesafesi`) TypeScript'te yazılı.
Python'a portlamak ikinci bir uygulama yaratır ve ölçüm ile üretim sessizce
sapabilir. Betikler `test/cozumleyici.mjs` çözümleyicisiyle kaynağı doğrudan
içe aktarır: **tek gerçek uygulama kalır.**

```bash
npm run olcum          # aşağıdaki dört adımın tamamı
```

Adım adım:

```bash
# dHash canvas ister; algoritma gerçek kaynaktan alınıp başsız Chrome'a enjekte edilir
node scripts/hash_gorseller.mjs --manifest data/images/manifest.jsonl \
  --manifest data/images/variants_manifest.jsonl --out data/images/dhash.json
node scripts/threshold_sweep.mjs --out results/sweep.json
node scripts/evaluate.mjs --sweep results/sweep.json --out results/metrics.json
node scripts/build_report.mjs --metrics results/metrics.json --out results/olcum-raporu.md
```

Çıktı: [`results/olcum-raporu.md`](results/olcum-raporu.md) ve makine okunur
`results/metrics.json`.

Eşik taraması test bölünmesini hiçbir koşulda okumaz. Ayrıntı için
[`splits/README.md`](splits/README.md).

#### Ölçülen değerler

| Kademe | Eşik | Kesinlik | Duyarlılık | Yanlış pozitif |
|---|---|---|---|---|
| Metin özgünlüğü (Jaccard) | 0,35 | %100,0 | %83,6 | 4 / 124.750 (%0,0032) |
| Görsel özgünlüğü (Hamming) | 10 bit | %99,7 | %62,6 | 267 / 124.750 (%0,214) |

Görsel duyarlılığındaki düşüklüğün tek bir sebebi var ve gizlenmiyor: **kırpma.**
Dönüşüm türü bazında duyarlılık — yeniden boyutlandırma %100 · sıkıştırma %99,2 ·
filtre %98,6 · **kırpma %7,8** · kırpma+filtre %7,2. Kırpılmış görsellerin ortalama
Hamming mesafesi 21,6; ilişkisiz görsellerinkiyle örtüşüyor. Bu eşik ayarıyla
çözülmez, farklı bir imza gerekir: [`results/bilinen-sinirlar.md`](results/bilinen-sinirlar.md).

Eşik kararı F1'i değil, **yanlış pozitif oranı bugünkünden kötü olmamak kaydıyla
en yüksek duyarlılığı** ölçüt alır; yanlış pozitif, özgün içerik üreten kullanıcının
ödülünü kesmek demektir. Bu ölçütle her iki kademede de optimum, kodda yürürlükte
olan değere denk çıktı.

## Telefona kurulum

MİHENK bir aşamalı web uygulaması (PWA); Android'de ana ekrana kurulabiliyor ve
kurulduktan sonra **internetsiz çalışıyor**.

| Kurulum ölçütü | Karşılık |
|---|---|
| Web uygulama bildirimi | [`src/app/manifest.ts`](src/app/manifest.ts) |
| 192 ve 512 piksellik simge + maskelenebilir | `public/simge-*.png` |
| `display: standalone`, `start_url`, `scope` | bildirimde |
| `fetch` olayını dinleyen servis çalışanı | [`public/sw.js`](public/sw.js) |

Beşincisi olmadan Chrome "Ana ekrana ekle" teklifi çıkarmıyor.

**Kurulum:** yayındaki adresi Chrome'da aç → menü → *Ana ekrana ekle*. Uygulama
içinden de yapılabilir: yan çekmece → **Uygulamayı yükle** (yalnızca tarayıcı
ölçütleri sağladığında görünür; Safari bu olayı hiç göndermiyor).

Kurulum HTTPS ister — `localhost` dışında `http://` üzerinden çalışmaz.

**Çevrimdışı çalışma** ek bir bedel ödemeden geldi: uygulamanın tüm durumu zaten
`localStorage`'da. Servis çalışanı kabuğu önbelleğe aldığı için ağ olmadan da
tam çalışıyor. Strateji iki başlı ve bilerek öyle:

- **Belgeler** önce ağdan, olmazsa önbellekten. Tersi olsaydı yeni dağıtımdan
  sonra eski sayfa servis edilirdi.
- **`/_next/static/`** önce önbellekten. Next bu dosyaları içeriğe göre karma ile
  adlandırıyor; adı aynıysa içeriği de aynıdır.

## Dağıtım

`main` dalına yapılan her push Vercel tarafından otomatik olarak üretime alınır;
ayrı bir dağıtım komutu yoktur.

| | |
|---|---|
| Üretim | https://mihenk-proje.vercel.app |
| Tetikleyici | `main`'e push (GitHub entegrasyonu) |
| Derleme | `npm run build` (Next.js, Turbopack) |
| Ortam değişkeni | yok — uygulama tamamen istemci tarafında çalışır |

Dağıtımdan önce CI'nın yeşil olması beklenir: tip kontrolü, lint, 76 test ve
üretim derlemesi. Geri alma, Vercel panelinden önceki dağıtımın yeniden
yayımlanmasıyla yapılır.

Katkı süreci, dal modeli ve kimlik kuralı için [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Değişiklik kaydı

Arayüz düzeltme turunun madde madde durumu, ölçülen kontrast oranları ve denetim sonuçları
için [`CHANGELOG.md`](CHANGELOG.md) dosyasına bakınız.

## Lisans

Bu proje **MIT lisansı** ile yayımlanmıştır. Tam metin için depo kökündeki
[`LICENSE`](LICENSE) dosyasına bakınız.
