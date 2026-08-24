# MİHENK — NSosyal Katılım Katmanı Prototipi

NSosyal İnovasyon Yarışması kapsamında geliştirilen MİHENK katılım sisteminin arayüz prototipi.

## Canlı demo

**https://mihenk-proje.vercel.app**

Uygulama tamamen tarayıcıda çalışır; arka uç, veritabanı veya hesap gerekmez. Açılıştaki
"Demo olarak gir" düğmesi sizi hazır demo verisiyle dolu akışa götürür. Denemeye değer üç senaryo:

1. **Kopya tespiti** — Akıştaki bir gönderinin metnini kopyalayıp aynen paylaşın; doğrulama
   gerekçesinde örtüşme oranını göstererek gönderiyi eler.
2. **Nitelik ölçümü** — Çok kısa ya da tekrar eden bir metin paylaşın; gönderi yayında kalır ama
   jeton kazanmaz ve nedeni gerekçe listesinde yazar.
3. **Ödül döngüsü** — Kazandığınız jetonlarla mağazadan bir çerçeve veya rozet alın; etkisi akıştaki
   kendi gönderilerinize anında uygulanır.

Veriler tarayıcınızın `localStorage` alanında tutulur. Başa dönmek için Cüzdan ekranındaki
"Demoyu sıfırla" düğmesini kullanabilirsiniz.

## Proje hakkında

MİHENK bağımsız bir sosyal ağ değil, mevcut mikroblog platformu NSosyal üzerine oturan bir
**özellik katmanıdır**. Amacı, nitelikli paylaşımları ödüllendirerek pasif tüketim sarmalını
kırmaktır.

Prototip iki ekran ailesinden oluşur:

- **Ev sahibi platform ekranları** — Nötr, metin öncelikli akış ve gönderi oluşturma. Platformun
  kendi görünümünü bozmaz; MİHENK burada yalnızca küçük bir doğrulama rozeti olarak belirir.
- **MİHENK ödül ekranları** — Kendi görsel kimliğini taşıyan cüzdan, mağaza ve doğrulama sonucu
  ekranları. Bazalt zemin, pirinç vurgu çizgisi ve tüm sayılarda tek aralıklı yazı tipi.

Doğrulamayı geçemeyen gönderi **yayında kalır** — doğrulama yalnızca jeton kazanımını belirler.
Kullanıcı sonuca itiraz edip insan incelemesine gönderebilir.

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
| `npm test` | Doğrulama ve depo testleri (50 test) |

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
│   ├── page.tsx             Tek sayfa: giriş kapısı, akış ve ekran geçişleri
│   ├── providers.tsx        Tema ve depo sağlayıcıları
│   └── globals.css          Tasarım jetonları, tema değişkenleri, animasyonlar
├── components/              Arayüz bileşenleri
│   ├── Giris.tsx            Demo giriş kapısı
│   ├── TopBar.tsx           Üst çubuk: bakiye, mağaza, tema değiştirici
│   ├── GonderiOlustur.tsx   Gönderi oluşturma (metin, görsel, anket)
│   ├── GonderiKarti.tsx     Akıştaki tek gönderi
│   ├── DogrulamaSonucu.tsx  Doğrulama sonucu paneli ve mihenk çizgisi
│   ├── Itiraz.tsx           Üç adımlı itiraz akışı
│   ├── Cuzdan.tsx           Bakiye, günlük sınır, envanter, hareket defteri
│   ├── Magaza.tsx           Ürün listesi ve satın alma öncesi önizleme
│   ├── Modal.tsx            Erişilebilir kalıcı pencere (Escape, odak tuzağı)
│   └── Avatar.tsx           Baş harflerden avatar üretimi
└── lib/
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
| 1 — Metin özgünlüğü | 5 karakterlik n-gram + Jaccard benzerliği | ≥ 0,70 kopya sayılır | **Kapı** |
| 1b — Metin niteliği | Uzunluk, kelime sayısı, tip/token oranı, tekrar, emoji-bağlantı, büyük harf oranı | aşağıdaki tablo | Skor |
| 2 — Görsel özgünlüğü | 9×8 dHash + Hamming mesafesi | ≤ 10 bit aynı görsel sayılır | **Kapı** |
| 2b — Görsel çabası | Gri ton histogram entropisi, baskın renk oranı | entropi < 4,0 · baskın renk > %85 | Skor |
| 2c — Anket çeşitliliği | Seçenekler arası 3-gram Jaccard | > 0,80 ayrışmamış sayılır | Skor |
| 3 — Hesap davranışı | Hesap yaşı | < 3 gün ise kazanç ×0,5 | Katsayı |

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
> eşiği (0,70) ve dHash mesafesi (10 bit) alıntı içeren özgün içerikle gerçek kopya arasındaki
> ayrımı doğrudan etkilediğinden ölçüme dayalı olarak yeniden ayarlanmalıdır.

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
| `test/dogrulama.test.mjs` | Türkçe normalleştirme, n-gram + Jaccard, metin niteliği, anket çeşitliliği, Hamming mesafesi, doğrulama zinciri, yeni hesap koruması | 22 |
| `test/depo.test.mjs` | Hidrasyon, bakiye–hareket defteri tutarlılığı, satın alma, süre dolumu, günlük tavan, akış içinde kopya tespiti, itiraz, demo sıfırlama | 28 |

Tarayıcı sürerek çalışan iki erişilebilirlik denetimi ayrıca bulunur. Bunlar `puppeteer-core`
gerektirdiği için `npm test` dışında tutulmuştur; birim testleri bağımlılıksız kalsın diye.

```bash
npm i --no-save puppeteer-core
node test/tarayici/klavye.mjs    # klavyeyle uçtan uca gezinme (26 kontrol)
node test/tarayici/hareket.mjs   # hareketi azaltma tercihi (8 kontrol)
```

Günlük tavan testi altı gönderiyi (6 × 10 = 60 jeton) tam 50'ye kırpar ve her adımda bakiyenin
hareket defteri toplamına eşit kaldığını doğrular.

## Erişilebilirlik

Denetim, yayındaki adres üzerinde **Lighthouse 13.4.1** ile yapılmıştır. Uygulamanın ana ekranları
giriş kapısının arkasında olduğundan tek sayfa denetimi yeterli olmaz; ekranlar Chrome sürülerek
tek tek ölçülmüştür.

| Ekran | Erişilebilirlik skoru |
|---|---|
| Giriş ekranı | 100 / 100 |
| Ana akış | 100 / 100 |
| Cüzdan | 100 / 100 |
| Mağaza | 100 / 100 |
| Ürün önizleme penceresi | 100 / 100 |

Başarısız denetim bulunmamaktadır. Giriş sayfasının tam Lighthouse sonucu (masaüstü ön ayarı):
**Performans 100 · Erişilebilirlik 100 · En İyi Uygulamalar 100 · SEO 100**, ilk içerikli boyama
0,2 saniye ve düzen kayması sıfır.

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

## Değişiklik kaydı

Arayüz düzeltme turunun madde madde durumu, ölçülen kontrast oranları ve denetim sonuçları
için [`CHANGELOG.md`](CHANGELOG.md) dosyasına bakınız.

## Lisans

Bu proje **MIT lisansı** ile yayımlanmıştır. Tam metin için depo kökündeki
[`LICENSE`](LICENSE) dosyasına bakınız.
