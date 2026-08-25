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

### 7. Eşik taraması ve ölçüm

```bash
python3 scripts/threshold_sweep.py    # yalnızca geliştirme + doğrulama
python3 scripts/evaluate.py           # test kümesinde tek seferlik
python3 scripts/build_report.py       # sunuma hazır tablolar
```

Eşik taraması test bölünmesini hiçbir koşulda okumaz. Ayrıntı için
[`splits/README.md`](splits/README.md).

## Değişiklik kaydı

Arayüz düzeltme turunun madde madde durumu, ölçülen kontrast oranları ve denetim sonuçları
için [`CHANGELOG.md`](CHANGELOG.md) dosyasına bakınız.

## Lisans

Bu proje **MIT lisansı** ile yayımlanmıştır. Tam metin için depo kökündeki
[`LICENSE`](LICENSE) dosyasına bakınız.
