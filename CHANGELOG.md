# Değişiklik Kaydı

## 2026-09-18 — Düşük çaba kademesi ölçüldü

`results/metrics.json` bu kademeyi `"durum": "ölçülmedi"` diye işaretliyordu:
pozitif taraf hazırdı (60 üretilmiş görsel), negatif taraf (500 gerçek
fotoğrafın skoru) üretilmemişti. Tek yanlı bir duyarlılık sayısı yanıltıcı
olacağı için boş bırakılmıştı. Şimdi üretildi.

### Ölçüm zinciri — ikinci kopya yok

`olcDusukCaba` canvas istiyor, Node'da çalışmıyor. İş ikiye bölündü ve iki yarı
da gerçek kaynaktan: piksel çıkarımı başsız Chrome'da (`olcDusukCaba` ve
`laplasVaryansi` tür soyulmuş haliyle birebir enjekte), puanlama Node'da
(`gorselDusukCabaSkoru` doğrudan içe aktarım).

Neden bölündü: puanlayıcı dokuz modül düzeyi sabite ve yardımcıya bağlı. Onları
sayfaya tek tek taşımak, biri değişince sessizce eskiyen ikinci bir kopya demek.

**İlk sürüm bunu yapmıyordu ve 560 görselin hepsi 1,000 skor aldı** — sayfada
tanımsız kalan puanlayıcı `ReferenceError` fırlatıyor, `catch` dalı
"işlenemedi" varsayılanını döndürüyordu. Ölçüm gibi görünen bir hata; ortalama
kontrol edilmeseydi rapora girerdi.

### Sonuç

| Eşik | Kesinlik | Duyarlılık | F1 | Yanlış pozitif |
|---|---|---|---|---|
| 0,65 (yürürlükteki) | %97,6 | %66,7 | 0,7921 | 1 / 500 (%0,2) |

Aile bazında: **tek renk 20/20 · bulanık 20/20 · gürültü 0/20.**

Gürültü, `bilinen-sinirlar.md`'de zaten "yapısal sınır" olarak yazılıydı;
ölçüm bunu sayıya döktü. Düz gürültü üç ölçüyü de canlı fotoğraf gibi okutur —
entropi yüksek, Laplas varyansı yüksek, tek renk oranı sıfır. Eşik ayarıyla
çözülmez.

F1 optimumu 0,58 çıktı ama 0,58 ile 0,65 arasına hiçbir örnek düşmüyor; eğri
bu aralıkta düz. Yürürlükteki değer düzlüğün içinde, oynatmak hiçbir şey
değiştirmezdi. **Üç kademenin üçünde de yayımlanan eşik ölçümden geçti.**

`npm run olcum` artık beş adım; skorlama zincire girdi.

### Gümüş Tavan (u19)

Bir gün için günlük üst sınırı 70'e çıkaran işlevsel ürün. **Net zararlı
fiyatlandı:** 60 jeton ödeyip en çok 20 fazla kazanılabiliyor. "Jeton öde,
daha çok jeton kazan" bir çiftlik döngüsü olurdu ve günlük tavan tam da
çiftliğe karşı argüman. Satılan şey tavan değil, yoğun bir günü tek seferlik
esnetme hakkı — fiyatı kazandırdığından yüksek ve açıklama bunu gizlemiyor.

`gunlukTavan()` ayrıcalığı şu an itibarıyla değerlendiriyor, tavan ise
gönderinin gününe uygulanıyor. Bir günlük ürün için tutarlı; otuz günlük bir
sürümde olmazdı. Kodda yazılı.

### Tam ekran yazma katmanı

Yüzen düğme önceden gömülü alana odaklanıyordu; telefonda sayfayı kaydırıp
küçük bir kutuya odaklanmak, referans uygulamanın tam ekran yazma deneyiminin
yanında eksik kalıyordu. Aynı bileşen artık `KatmanEkran` içinde tam ekran
açılıyor; paylaşınca kapanıyor. Gömülü kutu yerinde.

Aynı bileşenin iki kurulumu iki aynı `id` demekti — `label[for]` çözümlemesi
bozulur, klavye denetimi metin alanını bulamazdı. `idOneki` prop oldu:
`gonderi-metni` ve `yazma-metni`. Doğrulandı: sayfada tekrar eden id yok.

Denetimler: 106 birim · klavye 31/31 · hareket 8/8 · **axe 40 ekran, 0 ihlal**.

### Mesajlaşma — kozmetiklerin ikinci sahnesi

Kullanıcı NSosyal'ın mesajlaşma ekranını gösterdi: jetonların harcanacağı yeni
bir yüzey. **Keşfet sekmesi Mesajlar oldu** — Keşfet kapsam notundan ibaretti,
referans uygulamada da mesajlar alt gezintide.

Ekran görüntüsünde gerçek bir kişi vardı. Kör değerlendirme gereği yalnızca
düzen kopyalandı; tohum sohbetler akıştaki **kurgusal** yazarlarla.

**Karşı taraf yanıt yazmaz.** Sahte bir sohbet arkadaşı uydurmak, sohbeti canlı
göstermek adına kullanıcıya yalan söylemek olurdu; ekran bunu açıkça yazıyor.
Tohum sohbetler kozmetiklerin görünebileceği bir sahne sağlıyor, o kadar.

`AppState.mesajlar` isteğe bağlı alan: eksikse hidrasyon tohum sohbetlerle
dolduruyor, `DEPO_ANAHTARI` v3 kalıyor.

İki yeni efekt türü, **sıfır yeni renk:**

| Tür | Ne yapar | Renk |
|---|---|---|
| `sohbetZemini` | Sohbet ekranının zeminini boyar | Profil kapağıyla aynı ölçülmüş tema renkleri. Baloncuklar opak kart; metin zemine değil baloncuğa oturuyor, yeni kontrast çifti doğmuyor |
| `cikartma` | Altı mineral kristali çıkartması | Satır içi SVG yolları, paketin `--kozmetik-*` rengi. Varlık dosyası yok, lisans sorunu yok |

Çıkartma paketleri tek slotlu DEĞİL — birden fazla paket aynı anda
kullanılabilir. Baloncuk rengi bilerek yapılmadı: dokuz yeni metin/zemin
kontrast ölçümü isterdi.

Katalog 25 → 31: üç sohbet zemini (25 · 180 · 900), üç çıkartma paketi
(35 · 220 · 1000).

Denetimler: 106 birim · klavye 31/31 · hareket 8/8 · **axe 48 ekran, 0 ihlal**.

## 2026-09-17 (yedinci tur) — Jeton ekonomisi, profil, bildirimler ve telefona kurulum

Kullanıcı uygulamayı gerçekten kullanarak beş sorun buldu. Hepsi kapandı.

### Cüzdan ve Mağaza başka bir uygulama gibi duruyordu

İkisi de `fixed inset-0 z-40` tam ekran devralmaydı: NSosyal başlığı yok, alt
gezinti yok, gövde `max-w-2xl`/`max-w-4xl` (akış `max-w-lg`) ve on bir renk
jetonunun tamamı pirinç.

**Kural tek cümle:** *sayfa kroması ev sahibinin; MİHENK'in ÜRETTİĞİ DEĞER
pirinç.* `yuzey-mihenk` artık ekranı değil **kartları** sarıyor — bakiye kartı,
fiyat çipleri, kazanç tutarları, "Al" düğmesi.

`KatmanEkran.tsx` tam ekran katmanların ortak kabuğu oldu. Alt gezinti `inert`
sarmalayıcının dışına çıktı ve `z-30` → `z-[45]` oldu: **Cüzdan'dan Mağaza'ya
artık tek dokunuş**, önceden akışa dönmek gerekiyordu.

Eklenen denetim ilk çalıştırmada bir hata yakaladı: `DogrulamaSonucu`
`bottom-0`'daydı ve gezintiyi örtüyordu.

### Satın alınan şey görünmüyordu

Üç kusur üst üste binmişti.

**`aktifEfekt(state,'tema')` hiçbir yerden çağrılmıyordu.** Somaki Tema (150),
Bazalt Arkaplan (250), Mermer Zemin (1000) — **1400 jetonluk üç ürün hiçbir şey
satın almıyordu**, üstelik açıklamaları açıkça bir şey vaat ediyordu. Artık
profil kapak bandını boyuyorlar.

Akış kartına uygulanmadı: rozet bloğu kartın içinde ve arkasına yıkama koymak
onu harmanlanmış zemin yapardı — bu hata bu depoda iki kez yaşandı ve kayıtlı
(`globals.css` ikincil metin 4,31'e düştü · `TopBar` saydamlığı bu yüzden
kaldırıldı).

`TEMA_SINIFLARI` ham hex ve alfa yıkamasıydı, tema ayrımı yoktu; koyu sayfada
mermer görünmüyordu. On tema-duyarlı değişkene taşındı ve ölçüldü:
bant/sayfa ΔE76 **koyu 14,7–75,9 · açık 10,9–19,1**.

**Profil ekranı yoktu**, ama satın alma bildirimi birebir "… profilinde
görünecek." diyordu. `Profil.tsx`: kapak, kuşanılmış kozmetiklerle kimlik,
istatistikler, envanter, kendi gönderileri.

**Kozmetikler tek yüzeyde görünüyordu.** Yazma alanı ve çekmece avatarları da
taşıyor artık.

### Aynı türden iki kozmetik birbirini sessizce eziyordu

`aktifEfekt` diziden **sonuncuyu** alıyordu — satın alma sırasını, fiyatı değil.
Cüzdan ikisini de yeşil "Açık" gösteriyor ama ekranda yalnızca biri görünüyordu.
Süresi dolmuş 15 jetonluk çerçeveyi yeniden almak 800 jetonluğu görünmez
kılıyordu.

Tür başına **tek slot**, yazma anında zorlanıyor (`tekSlotUygula`). `islev`
bilerek dışarıda: Geniş Karakter ile Geniş Anket aynı anda açık olmalı.
`aktifEfekt` artık fiyata göre seçiyor — kayıtlı eski durumlarda iki ürün
birden açıksa da sonuç belirli.

### Kozmetiğin ne olduğu görünmüyordu

Kullanıcı ekran görüntüsüyle bildirdi: kenarlık ürünleri `fn` gösteriyordu
(dal yazılmamıştı) ve *"renkleri birebir aynı"* — çünkü 2px'lik halka 32px'lik
dairede pirinç ile tuncu ayırt ettirmiyordu.

`KozmetikGorseli`: her tür kendi biçimini alıyor (4px halkalı daire · sol kenarı
renkli kart · o renkte "Aa" · büyük simge · dolu kare) ve yanında ne
değiştirdiği yazıyor. Mağaza kartlarında da satır içi önizleme var — etkiyi
görmek için artık "Dene" penceresini açmak gerekmiyor.

### Katalog 14 → 24, iki işlevsel ayrıcalık gerçekten çalışıyor

Yeni `kenarlik` efekt türü (gönderi kartının sol şeridi). Yeni ürünler
Süreli 8 · Sezonluk 7 · Kalıcı 5 · İşlevsel 4. **Hiçbir yeni renk yok** — hepsi
ölçülmüş `--kozmetik-*` değerleri. Tek yeni bağlam tuncun METİN olarak
kullanılması; ölçüldü, altı zeminde de AA (en düşük 4,98).

| Ürün | Ne yapar |
|---|---|
| **Mika Merceği** (40) | Kendi gönderilerinde doğrulama gerekçesinin **tamamı** + skor bandı. Normalde yalnızca ilk satır, o da yalnızca kopya/kazanmayan gönderilerde görünüyor |
| **Ayar Taşı** (60) | Paylaşmadan önce metnin nitelik tahmini. `olcMetinNiteligi` (saf skorlayıcı) çağrılıyor, `dogrula` **değil** — yayınlama/doğrulama ayrıklığı korunuyor. Etiket "tahmin": görselli gönderide gerçek skor 0,55/0,45 ağırlıklı |

### Tunç Seti — koleksiyon

Üç tunç ürününe sahip olunca **Tunç Mührü** açılıyor: satın alınamayan, parıltılı
bir rozet. Yeni durum alanı gerektirmiyor — tamamlanma envanterden türetiliyor,
çünkü envanter satırı "şu an takılı" değil "bir kez sahip olundu" kaydı.

Ödül hareket defterine 0 jetonla geçiyor; defter bedavaya koleksiyon günlüğü
oluyor. `urunSatinAl`ın ilk satırı kilitli ürünü reddediyor — `fiyat: 0` olduğu
için aksi halde herkes "satın alabilirdi".

Ödül, aynı türden takılı bir şey varsa **kapalı** geliyor: 1500 jetonluk Ayar
Rozeti takılıyken bedelsiz gelen bir mühür onu sessizce kapatamaz.

### Bildirimler

Kazanç, doğrulama sonucu, kopya tespiti, itiraz ve süre bitimi. **Yeni veri
gerektirmiyor** — hareket defterinden ve kendi gönderilerinden türetiliyor.
Okunmamış sayacı, tanıtım turunun yaptığı gibi ayrı bir `localStorage`
anahtarında; durum şeması değişmedi.

Uyarı penceresi ürünün **ömrüne orantılı** (son çeyrek). Sabit 24 saat, 24
saatlik ürünler için anlamsızdı: üç süreli kozmetik alınır alınmaz üç "süresi
doluyor" bildirimi düşüyor ve gerçek doğrulama sonuçlarını aşağı itiyordu.

### Yazma ekranı

Referans arayüze göre: "Aklında ne var?", halka biçiminde karakter sayacı,
**Gönder**. Halka `aria-hidden` ve dekoratif — bilgiyi içindeki sayı ve
mevcut `aria-live` duyurusu taşıyor, yani WCAG 1.4.11 yükümlülüğü doğmuyor.

`klavye.mjs`'e birebir eşleşmeli arama eklendi: "Gönder" araması parça
eşleşmesiyle metin alanının etiketi olan "Gönderi metni"ne takılıyor ve denetim
düğmeye hiç ulaşmadan geçmiş görünüyordu.

### Telefona kurulum (PWA)

Chrome'un beş kurulum ölçütü de sağlandı: bildirim, 192/512 + maskelenebilir
simge, `standalone`, `start_url`, ve **fetch dinleyen servis çalışanı**
(beşincisi olmadan teklif hiç çıkmıyor). Yan çekmeceye "Uygulamayı yükle"
eklendi.

Servis çalışanı iki başlı: **belgeler önce ağdan** (tersi olsaydı yeni
dağıtımdan sonra eski sayfa servis edilirdi), **`/_next/static/` önce
önbellekten** (içeriğe göre karma adlandırma, bayatlama riski yok).

**Çevrimdışı çalışma bedava geldi** — durum zaten `localStorage`'da. Ağ
kesildikten sonra yeniden yükleme doğrulandı: sunum salonunda internet koparsa
demo devam eder.

### Denetimler

| | Önce | Sonra |
|---|---|---|
| Birim testleri | 76 | **99** |
| Klavye | 30 | **31** |
| Hareket | 8 | 8 |
| axe-core | 28 ekran | **36 ekran**, 0 ihlal |

## 2026-09-16 (altıncı tur) — NSosyal ev sahibi kroması ve iki ayrı yüzey

Teknik rapor 96/100 ile geçti. Kaybedilen dört puanın üçü **3.3 Kullanıcı
Deneyimi** başlığından (7 üzerinden 4), biri **3.1 Yöntem, Altyapı ve Sürüm
Kontrolü** başlığından (7 üzerinden 6) geldi.

### Teşhis

Rapor MİHENK'i "mevcut mikroblog platformu NSosyal üzerine oturan özellik
katmanı" diye tanıtıyor ve iki ayrı yüzey iddia ediyor: nötr ev sahibi yüzeyi
ve kendi kimliğini taşıyan MİHENK ödül yüzeyi. Prototip ise masaüstü tek
sütundu ve her iki yüzey de pirinç rengindeydi. NSosyal'ı bilen bir hakem
siteye girdiğinde ne NSosyal'ı görüyor ne de iki yüzey ayrımını.

### İki yüzey — mekanizma

Derlenmiş CSS doğrulandı: `@theme inline` ham değişkeni üretilen yardımcı
sınıfa gömüyor (`.text-brand { color: var(--mihenk-brand) }`). Bir
sarmalayıcıda `--mihenk-*` ezmek tüm alt ağacı yeniden renklendiriyor.

| Kapsam | Yüzey |
|---|---|
| `:root` / `.light` | **Ev sahibi (NSosyal)** — nötr gri zemin, mavi vurgu |
| `.yuzey-mihenk` | **MİHENK ödül yüzeyi** — bugüne kadar ölçülmüş pirinç değerlerin birebir aynısı |

Pirinç değerler değişmedi, yalnızca kapsamı daraldı. Bu yüzden yayımlanmış
kontrast ölçümleri (ikincil metin harmanlanmış zeminlerde 4,88 / 5,98 / 6,87)
ve kozmetik ΔE ayrımları (koyu 22,5 · açık 20,0) bu yüzeylerde yeniden ölçüm
gerektirmeden geçerli kaldı. Yüzey sınırları depoda aranabilir:
`grep -r 'data-yuzey' src/`.

İddianın ekrandaki kanıtı gönderi kartı: nötr gri/mavi bir NSosyal kartı,
içinde yalnızca doğrulama rozetleri ve gerekçe pirinç renginde. Cüzdan ve
Mağaza ise tamamen pirinç.

### Ölçülen kontrast

| Küme | Çift | Sonuç |
|---|---|---|
| Ev sahibi paleti (iki tema) | 34 | Tümü AA; `line-strong` hap kenarlıklarını taşıdığı için 1.4.11'e göre 3:1 hedeflendi — 3,25 / 3,65 / 3,63 / 3,26 |
| MİHENK rozetleri ev sahibi zeminde | 14 | 4,91 – 17,93 |
| Çekmece gradyanının iki ucu | 8 | Ana metin 10,39 – 16,33 · ikincil 4,74 – 6,27 |

Oluştur düğmesi için ayrı bir gradyan tanımlandı. Kimlik gradyanının koyu
temadaki parlak cyan ucunda beyaz simge **1,81** kalıyordu; eylem gradyanı
iki ucunda da 5,36 ve 6,70 veriyor.

### Eklenen bileşenler

`AltGezinti` (Cüzdan/Mağaza pirinç MİHENK sekmesi olarak, monogramlı) ·
`YanCekmece` (lavanta→nane gradyan; tema anahtarı ve tanıtım turu üst
çubuktan buraya taşındı) · `HikayeSeridi` (yazarlardan türetilir, yeni tohum
verisi yok — gönderi sayısı 12'de sabit kaldı) · `AkisSekmeleri` ·
`EtkilesimSeridi` (dış çizgili hap satırı) · `OlusturDugmesi` · `NSimgesi` ·
`KapsamNotu` · `Yuzey`

Kapsam dışı bölümler (Keşfet, Profil, Bildirimler, Topluluklar…) çizildi ama
sessiz bırakılmadı: düğme gerçek, yanıtı da gerçek — "bu bölüm bu prototipin
kapsamında değil". Tıklanınca hiçbir şey yapmayan bir sekme arızalı bir
arayüz izlenimi verirdi.

### Odak bütçesi

Görüntülenme hapı `<button>` değil `<span>` oldu: istatistiktir, eylem değil.
12 gönderide 12 sekme durağı geri kazanıldı ve yeni kromanın (gezinti,
sekmeler, hikâye şeridi, oluştur düğmesi) maliyeti bununla karşılandı.
Belgenin sonundaki gezintiye ulaşmak için atlama bağlantısı eklendi
(WCAG 2.4.1).

### Tarayıcı denetimleri iki sessiz kırıkla duruyordu

Denetimler, tanıtım turu ve çift satın alma koruması eklendikten sonra
çalıştırılmamıştı. İkisi de denetimi kırıyordu:

| Kırık | Neden | Düzeltme |
|---|---|---|
| `klavye.mjs` turun içinde sonsuza kadar Tab'lıyordu | Tur ilk girişte açılıp odağı tuzaklıyor; denetim bu akışı modellemiyordu | Tur artık modelleniyor ve **klavyeyle kapanışı doğrulanıyor** |
| Sekme seçimi sorgusu yanlış listeyi buluyordu | Akışa ikinci bir `role="tablist"` eklendi; kapsamsız seçici belgedeki ilk seçili sekmeyi alıyor | Sorgu mağazanın listesine kapsamlandı |
| `"Al"` araması odak tuzağında dönüyordu | Önizleme penceresi sahip olunan ürün için açılıyor ve "Al" yerine devre dışı "Sahipsin" gösteriyor | Çift alım koruması artık **açıkça doğrulanıyor**, satın alma sahip olunmayan üründen yapılıyor |
| `hareket.mjs` cüzdanı hiç açamıyordu | Eşleme büyük/küçük harfe duyarlıydı; erişilebilir ad "…cüzdanı aç" diyor | `klavye.mjs`'deki eşlemeyle hizalandı |

Klavye **30/30** (26'dan), hareket **8/8**, birim **76/76**.

### Sayfanın hiç LCP'si yoktu

Giriş kartı `mihenk-belir` ile açılıyordu (`from { opacity: 0 }`). Chrome ilk
boyandığı anda saydam olan bir öğeyi LCP adayı saymıyor ve sonradan görünür
hale gelse bile bir daha değerlendirmeye almıyor. Sonuç: hızlı bağlantıda
sayfanın hiç LCP'si olmuyor, Lighthouse `NO_LCP` veriyor ve 25 puan ağırlıklı
metrik `null` döndüğü için **performans kategorisi 0'a düşüyordu.**

Yavaş bağlantıda sorun görünmüyordu: yükleme iskeleti boyanacak kadar uzun
ekranda kalıyor ve LCP'yi o karşılıyordu. Yayımlanmış ölçümlerin 99–100
göstermesinin sebebi buydu — gerçek bir hız değil, ölçüm kazası.

Saydamlık oynatmayan `mihenk-acilis` ile değiştirildi. Ayrıca `StoreProvider`
artık hidrasyonu beklemiyor: giriş ekranı depodan hiçbir şey okumadığı halde
12 tohum gönderisinin doğrulamadan geçmesini bekliyordu. Ekran artık ilk
HTML'de geliyor. Rapor Şekil 3 Akış A'nın "doğrulama arayüzü bloklamaz"
iddiası da ancak böyle sağlanıyor.

| Ölçüm (yerel, aynı kurulum) | Önce | Sonra |
|---|---|---|
| Performans — masaüstü | **0** (NO_LCP) | **99** |
| Performans — mobil | **0** (NO_LCP) | **88** (uygulanan kısıtlamayla 95) |
| Erişilebilirlik · En İyi Uygulamalar · SEO | 100 | 100 |

Mobil değeri Lantern simülasyonundan geliyor; kısıtlama uygulanarak ölçüldüğünde
LCP = FCP.

### Mobil doğruluk

`viewport` dışa aktarımı eklendi: `viewportFit: 'cover'` + `themeColor`.
`maximumScale` / `userScalable` **konmadı** — yakınlaştırmayı kısıtlamak WCAG
1.4.4 ihlali. `min-h-screen` → `min-h-dvh`, güvenli alan dolguları, 44px
dokunma hedefleri, anket girdileri 16px (iOS odak yakınlaştırmasını tetikliyordu).

### Üçüncü tarayıcı denetimi: axe-core

Lighthouse yalnızca girilen adresi ölçüyor; MİHENK'in ekranlarının çoğu giriş
kapısının arkasında ve tam ekran katman olarak açılıyor. `test/tarayici/`
altına üçüncü bir denetim eklendi: Chrome sürülerek her ekrana gidiliyor ve
axe-core o anki DOM üzerinde çalıştırılıyor.

**Yedi ekran × iki tema × iki genişlik = 28 ekran, sıfır ihlal**
(`wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa`).

Tema başına ayrı tarayıcı açılıyor: ilk sürümde tek Chrome örneği uzun koşuda
düşüyor ve denetim hiçbir çıktı vermeden asılı kalıyordu.

### Ölçüm boru hattı çalıştırıldı — README'nin andığı üç betik artık var

README `threshold_sweep.py`, `evaluate.py` ve `build_report.py` betiklerini
tarif ediyordu; **üçü de depoda yoktu.** README'yi takip eden hakem üç kez
dosya bulamıyordu.

Betikler Node ile yazıldı, Python'a portlanmadı. Metin ve hash tarafının
çalışma zamanı karşılığı TypeScript'te; portlamak ikinci bir uygulama yaratır
ve ölçüm ile üretim sessizce sapabilir. Betikler `test/cozumleyici.mjs`
çözümleyicisiyle kaynağı doğrudan içe aktarıyor.

`hesaplaDHash` canvas istediği için Node'da çalışmıyor. Algoritma **kendi
kaynağından, tür soyulmuş haliyle** başsız Chrome'a enjekte ediliyor
(`scripts/hash_gorseller.mjs`); sayfaya ayrıca verilen tek şey görsel yükleme
tesisatı. Ölçülen algoritmanın tek bir kaynağı kalıyor.

**Üretilen küme:** 500 özgün metin → 2.000 varyant (dört tür) · 500 özgün
görsel → 2.500 dönüşüm (beş tür) · 3.500 dHash.

İki ayrı negatif küme kullanıldı. Dengeli küme (her varyant için ebeveyni
olmayan rastgele bir özgün) F1'in sınıf dengesizliğinden şişmesini engelliyor;
yanlış pozitif oranı ise bütün özgün–özgün çiftlerinden (124.750 çift)
hesaplanıyor — akışta karşılaşılan dağılım bu.

#### Ölçülen değerler

| Kademe | Eşik | Kesinlik | Duyarlılık | F1 | Yanlış pozitif |
|---|---|---|---|---|---|
| Metin (Jaccard) | 0,35 | %100,0 | %83,6 | 0,9107 | 4 / 124.750 (%0,0032) |
| Görsel (Hamming) | 10 bit | %99,7 | %62,6 | 0,7689 | 267 / 124.750 (%0,214) |

Dönüşüm türü bazında görsel duyarlılığı: yeniden boyutlandırma %100 ·
sıkıştırma %99,2 · filtre %98,6 · **kırpma %7,8** · kırpma+filtre %7,2.
Kırpılmış görsellerin ortalama Hamming mesafesi 21,6; ilişkisiz görsellerinkiyle
örtüşüyor. Daha önce nitel olarak belgelenen kırpma sınırı artık sayıyla duruyor.

#### Eşik kararı

F1 optimumu metinde 0,08, görselde 22 çıktı — ikisi de uygulanmadı ve gerekçe
ölçümün kendisinden geliyor.

F1, yanlış pozitif ile yanlış negatifi eşit maliyetli sayar. MİHENK'te
değiller: yanlış negatif bir kopyanın jeton kazanmasıdır, yanlış pozitif özgün
içerik üreten bir kullanıcının ödülünün kesilmesidir. Ölçüt olarak **yanlış
pozitif oranı bugünkünden kötü olmamak kaydıyla en yüksek duyarlılık**
alındı.

| Kademe | Yürürlükteki | Kısıtlı optimum | F1 optimumu |
|---|---|---|---|
| Metin | 0,35 | 0,34 | 0,08 → yanlış pozitif **159 katı** (%0,0032 → %0,511) |
| Görsel | 10 | **10** | 22 → ilişkisiz çiftlerin **%10,3'ü** kopya sayılıyor |

Her iki kademede de kısıtlı optimum yürürlükteki değere denk çıktı. Metindeki
0,01'lik fark taramanın adım çözünürlüğü kadar; raporda belgelenen değeri bu
büyüklükte bir kazanç için oynatmak izlenebilirliği kazançtan pahalıya mal
ederdi. **Yayımlanan iki eşik de ölçümden geçti.**

#### Ölçülmeyen kademe gizlenmedi

Düşük çaba kademesinin negatif tarafı (500 normal görselin düşük çaba skoru)
üretilmedi. `results/metrics.json` bu kademeyi `"durum": "ölçülmedi"` olarak
işaretliyor ve nedenini yazıyor; tek yanlı bir duyarlılık sayısı üretilmedi.

### Depo tutarlılığı

README'de kod ile çelişen yedi değer düzeltildi: kopya eşiği 0,70 → **0,35**
(kod bu), test sayısı 50 → **76** (22/28 → 34/42), klavye denetimi 26 → **30**
kontrol. `scripts/fix_dev_split.py` docstring'i "beş metin" diyordu;
`splits/gelistirme.jsonl` altı metin ve beş görsel taşıyor.

## 2026-08-25 (dördüncü tur) — Geri bildirim düzeltmeleri

### Cüzdan başkalarının gönderilerinden jeton alıyordu

Doğrulama her gönderi için hareket defterine kayıt yazıyordu; akıştaki diğer
yazarların kazançları da kullanıcının bakiyesine giriyordu. Ölçülen: bakiye 195
jetonun **45'i başkalarının gönderilerinden** geliyordu. Hakem cüzdanı açsa
yazmadığı gönderilerin kayıtlarını görürdü ve "ödül içeriği üretene verilir"
iddiası çökerdi.

Ödül artık yalnızca kullanıcının kendi gönderisi için işleniyor. Diğer
yazarların gönderileri doğrulanmaya ve rozetlerini almaya devam ediyor.
Günlük üst sınır da yalnızca kendi gönderilerine uygulanıyor.

Düşük çabalı görsel gönderisi kullanıcının kendi gönderisi yapıldı: reddedilen
kazanımın cüzdanda gerekçesiyle görünmesi için bir örnek gerekiyordu. Kopya
değil düşük çaba seçildi; demo kullanıcısını kopyacı göstermek gereksiz.

### Kozmetikler ayırt edilemiyordu

Bir önceki turda hepsi AA eşiğine çekilirken aynı koyu kahve bölgesine
sıkışmışlardı. Ölçülen ayrım (ΔE, CIE76):

| Çift | Önce | Sonra |
|---|---|---|
| Kuvars – Gümüş (açık) | **2,4** | 24,6 |
| Pirinç – Altın (açık) | **7,2** | 22,5 |
| Pirinç – Tunç (açık) | **9,9** | 21,4 |
| Kuvars – Gümüş (koyu) | **6,6** | 25,0 |

ΔE < 12 pratikte ayırt edilemez demektir; açık temada beş çift bu durumdaydı.
Palet, kontrast kısıtı korunarak yeniden dağıtıldı: **en düşük ayrım açık temada
ΔE 20,0 · koyu temada ΔE 22,5**, tüm renkler kendi zemininde AA. Mineral kimliği
korundu; pirinç ile tunç akraba metaller olduğu için birbirine en yakın çift
onlar.

### Akış sıralaması

Rıhtımdaki araçlar ve kalabalık görseli 2. sıraya alındı — etkinliği tek karede
anlatan en güçlü kare. Kopya tespitli gönderi 1. sırada kaldı.

Ölçülen ilk ekran (900 px): kopya rozeti **353 px** · TEKNOFEST görseli
**668 px** — ikisi de kaydırmadan görünür.

Anket gönderisi bugüne alındı; günlük sınır çubuğu 10/50'den **20/50**'ye çıktı.

### Simge ve bağlantı önizlemesi

Sekmede ve paylaşım önizlemesinde Next.js varsayılan üçgeni görünüyordu. Ekibin
seçtiği M monogramından `favicon.ico` (16–256 px), `icon.png`, `apple-icon.png`
ve 1200×630 `opengraph-image.png` üretildi. Bağlantı önizlemesi meta verisi
yazıldı; `metadataBase` eklendi (verilmezse mutlak adres üretimde localhost'a
çözülebiliyordu).

### Ölçümler

Lighthouse her iki temada: **Performans 100 · Erişilebilirlik 100 · En İyi
Uygulamalar 100 · SEO 100**. 76 test geçiyor.

---

## 2026-08-25 (üçüncü tur) — UX iyileştirmeleri

### Tema sistem tercihine uyuyor

Uygulama sabit koyu temayla açılıyordu. Artık `prefers-color-scheme` okunuyor;
elle değiştirme kullanıcı seçimini kaydedip sistem tercihini eziyor. Rapor
Tablo 10 hareket duyarlılığı için `prefers-reduced-motion` tercihine uyulduğunu
taahhüt ediyor; tema tercihinde uymamak bu tutarlılığı bozuyordu.

**Kozmetikler açık temada kontrast eşiğini kaçırıyordu.** Ürün renkleri koyu
zemine göre seçilmişti; açık tema açılınca dokuzunun tamamı 4,5'in altındaydı:

| Ürün | Önce | Sonra |
|---|---|---|
| Gümüş Nişan | 1,47 | 4,83 |
| Kuvars Rozet | 1,75 | 4,83 |
| Altın / Ayar | 1,96 | 5,37 |
| Mika Ad | 2,27 | 5,22 |
| Pirinç / Külçe | 2,68 | 4,80 |
| Ametist | 3,37 | 5,74 |
| Tunç | 4,03 | 5,19 |

Rapor Tablo 10 kozmetik ürünlerin AA eşiğini düşüremeyeceğini taahhüt ediyor;
taahhüt artık her iki temada da geçerli.

Açık temada ikincil metin de üst çubuk gibi harmanlanmış zeminlerde 4,31'e
düşüyordu; ölçülerek `#5a6467` → `#525c5f` koyulaştırıldı (4,88).

### İlk giriş tanıtım turu — İP7 pilot test bulgusuna yanıt

**Görev 2 tamamlama oranı %85,7.** Rapor Tablo 12'de pilot testin en düşük
tamamlama oranı mağazadan süreli ürün satın alma görevine ait; diğer iki görev
%100. Mağaza akışı ölçülmüş bir zayıf noktaydı.

Dört adımlı tur eklendi: Cüzdan → Mağaza → Doğrulama rozeti → Hazırsın. Her
adımda ilgili öğe vurgulanır, tek cümle açıklama verilir. "Atla" her adımda
görünür. Simgelerin altına kalıcı metin etiketi eklendi (Mağaza / Cüzdan) —
tur atlansa da ne oldukları anlaşılır.

Erişilebilirlik: `role="dialog"` + `aria-modal` + `aria-labelledby` +
`aria-describedby`, odak tuzağı, Escape ile atlama, adım değişiminin
`aria-live` ile duyurulması, `prefers-reduced-motion` altında geçişsiz.

Tur durumu uygulama durumundan **ayrı** bir anahtarda tutulur; seed sürümü
değişip durum sıfırlansa bile tur yeniden gösterilmez.

### Avatarlar — fotoğraf reddedildi, palet ölçülerek ayrıştırıldı

Fotoğraf avatar değerlendirildi ve reddedildi (rıza, tez çelişkisi, ürün
görünürlüğü). Gerekçeler [`docs/avatar-karari.md`](docs/avatar-karari.md).

Avatar tonları birbirine çok yakındı. Yeni palet üç kısıtı birden karşılıyor:
beyaz baş harflerle ≥ 4,5, koyu sayfa zemininde ≥ 3, açık sayfa zemininde ≥ 3.
On ton, hepsi 5,05 / 3,55 / 4,40.

Tonlar demo yazarlarına elle atandı: karma yedi kullanıcıda bile çakışıyordu
(on renkli palette dört kullanıcı aynı tonu paylaşıyordu). Ölçüldü: 7 kullanıcı,
7 farklı renk.

### Kozmetikler akıştaki farklı kullanıcılara dağıtıldı

| Kullanıcı | Kozmetik | Dayanağı |
|---|---|---|
| Ahmet Yılmaz | Pirinç Çerçeve (15) | envanterden, süre takipli |
| Ayşe Kaya | Ametist Çerçeve (300) | g08, akışın en çok etkileşim alanı |
| Mert Yıldız | Tunç Kenar (30) | g05 |
| Kaan Demir | Kuvars Rozet (25) | g06 + g11 |
| Zeynep Şahin | Mika Ad (20) | g12 |
| Burak Yılmaz | — | kopya paylaştı |
| Elif Çelik | — | düşük çabalı içerik paylaştı |

Hepsi mağaza kataloğundaki gerçek ürünler. Rapor Bölüm 5.1'deki
"kişiselleştirme öğeleri ödeme gücüne değil katkıya bağlıdır" iddiasının görsel
karşılığı.

### Ödül töreni görselinde kazanan isimleri kırpıldı

Sahne ekranında gerçek kazananların adları yazılıydı. Üstten 575 px kırpılarak
o bant tamamen dışarıda bırakıldı; sahne tabanı ve kalabalık korundu. İşlem
`docs/asset-credits.md`'ye kaydedildi.

### Ölçümler

**Lighthouse — her iki temada, altı ekranda:**

| | Koyu | Açık |
|---|---|---|
| Performans | 100 | 100 |
| Erişilebilirlik | 100 | 100 |
| En İyi Uygulamalar | 100 | 100 |
| SEO | 100 | 100 |

FCP 0,2 sn · TBT 0 ms · CLS 0. Giriş, Ana akış, Cüzdan, Mağaza, Ürün önizleme
ve Tanıtım turu ekranlarının tamamı 100/100.

> Kalan tek `label-content-name-mismatch` bulgusu gerçek bir ihlal değildir:
> işaretlenen öğeler `role="img"` taşıyan etkileşimsiz rozet ve avatarlardır ve
> görünür metinleri zaten `aria-hidden` ile işaretlidir. WCAG 2.5.3 yalnızca
> etkileşimli denetimler için geçerlidir; denetimin ağırlığının 0 olma sebebi
> de budur.

**İlk ekran (900 px):** kopya rozeti 353 px · +10 jeton rozeti 580 px ·
TEKNOFEST görseli 668 px — üçü de kaydırmadan görünür.

---

## 2026-08-25 (ikinci tur) — Demo içerik katmanı

Öncelik değişti: İP6 metrikleri (B4/B6/B7) final sunumuna girer, demo içeriği ise
02.09 teknik rapor değerlendirmesinden önce görülür. Demo tam öncelik aldı.

### Akış 12 gönderiyle her doğrulama kademesini gösteriyor

Rapor "kopya içerik ödül dışı bırakılır" diyordu ama sitede görünen karşılığı yoktu:
motor Jaccard 1,000 ile yakalıyordu, arayüz göstermiyordu. Yakalanan ama gösterilmeyen
tespit, hakem açısından yakalanmamış tespitle aynıdır.

**Doğrulama alanları elle yazılmıyor.** Her seed gönderisi `bekliyor` durumunda başlar;
durum, skor, jeton ve gerekçe açılışta motorun gerçek çıktısından gelir. Depoya bakan
biri seed verisinde sabitlenmiş bir `durum: "kopya"` alanı görmez.

| Gönderi | Motorun çıktısı |
|---|---|
| g01 | **kopya** · kaynak g08 (metin) · örtüşme 1,000 |
| g02 | **kopya** · kaynak g03 (görsel) · Hamming 0 |
| g03 | geçti 92 · **+10** · kopya zincirinin kaynağı |
| g04 | geçemedi · düşük çabalı metin |
| g05 | geçti 100 · **+10** · YZ destekli, kesintisiz tam jeton |
| g06 | **kısmi** 55 · +5 · benzerlik uyarı bandı, örtüşme 0,344 |
| g07 | geçemedi 18 · düşük çabalı görsel |
| g08–g12 | geçti · +10 |

### Üç hata bulundu ve düzeltildi

**Sıralama.** Kopya tespiti kaynağın `metinParcalari` alanının dolu olmasına bağlı.
Gönderiler paralel doğrulanıyordu ve kopya kaynağından önce işlenip karşılaştıracak
parça bulamıyordu; g02 (özgün) kopya, g03 (kopya) kaynak sayılmıştı. Doğrulama artık
eskiden yeniye sıralı çalışıyor.

**Günlük tavan.** Defter kaydının zamanı doğrulamanın bittiği andı, gönderinin
paylaşılma zamanı değil. Geçmişe ait bütün gönderiler bugünün kazancı sayılıp tavanı
tek seferde dolduruyor ve akıştaki gönderilerin çoğu "0 jeton" gösteriyordu.

**Gerekçe sırası.** Görsel kopyasında metin kademesi önce çalıştığı için gerekçe
listesinin başında "Anlatım zenginliği: Yeterli" duruyordu; kart "Kopya tespit edildi"
rozetinin altında niteliği öven bir cümle gösteriyordu.

### Cüzdan ve mağaza

- Reddedilen kazanımlar da hareket defterine geçiyor (0 jetonlu, gerekçeli). Sistem
  yalnızca neyi ödüllendirdiğini değil, neden ödüllendirmediğini de kayda geçiriyor.
- Günlük üst sınır göstergesi kazanımlarla ilerliyor (25/50).
- Envanter demo açılışında boş değil; bir süreli ürün satın alınmış durumda başlıyor.

### Lighthouse — Tablo 11'deki taahhüt karşılandı

Rapor Tablo 11 erişilebilirlik skorunu **89** olarak veriyor ve gerekçesini "kısmi ARIA
etiket eksiklikleri (İP7 kapsamında tamamlanacaktır)" diye yazıyor. Ölçüm:

| Kategori | Skor |
|---|---|
| Performans | **100** |
| Erişilebilirlik | **100** |
| En İyi Uygulamalar | **100** |
| SEO | **100** |

FCP 0,2 sn · LCP 0,7 sn · TBT **0 ms** · CLS 0. Beş ekranın tamamı (Giriş, Ana akış,
Cüzdan, Mağaza, Ürün önizleme) 100/100, başarısız denetim yok.

TBT'nin 0 ms olması asenkron doğrulamanın ilk boyamayı bloke etmediğini gösteriyor.

**Kontrast gerilemesi düzeltildi:** envanter artık dolu başladığı için "Açık" düğmesi
ilk kez görünüyor ve `text-success` üzerine `bg-success/10` tinti zemini açıp kontrastı
4,82'den 4,16'ya düşürüyordu. Koyu tema başarı rengi ölçülerek `#5b9c89` → `#68ad99`
çekildi (tint zemininde 5,09).

### Ölçüm altyapısı (bu turda tamamlanan)

- **Metin havuzu:** UCI Turkish User Review Dataset (CC BY 4.0), 2.100 kayıt +
  100 kayıtlık sınır durum yoğunlaştırılmış pilot havuzu.
- **Görsel kümesi:** Unsplash Lite'tan 1.000 görsel. Yeniden dağıtım yasak olduğu için
  dosyalar `.gitignore`'da; `manifest.jsonl` yayımlanıyor.
- **Düşük çaba üreteci:** tek renk, bulanık, gürültü aileleri.
- **Kalibrasyon:** görsel düşük çaba ağırlıkları 1.000 fotoğrafla yeniden ayarlandı;
  yakalama %27'den tek renk ve bulanıkta %100'e çıktı, yanlış pozitif %0,40.

---

## 2026-08-25 — Demo içerik katmanı ve ölçüm altyapısı (sürüyor)

### Jaccard eşiği 0,70'ten 0,35'e indirildi — raporun tarif ettiği geçiş

**Bu bir rapor–kod çelişkisi değildir.** Teknik rapor s.16 bu geçişi zaten
belgeliyor: prototipin ilk geliştirme aşamasında 0,70 başlangıç eşiği
kullanılmış, İP3 kapsamındaki ön pilot küme ölçümleri sonucunda 0,35'e
güncellenmiştir. Koddaki değişiklik, raporda anlatılan sürecin kodda
tamamlanmasıdır.

Aşağıdaki ölçüm, geçişin bağımsız bir sağlamasıdır.

Beş özgün Türkçe metin ve varyantları üzerinde ölçülen dağılım
(5 karakterlik n-gram):

| Karşılaştırma | Ortalama Jaccard |
|---|---|
| Birebir kopya | 1,000 |
| Kısmi kopya (%80 örtüşme) | 0,546 |
| Kısmi kopya (%60 örtüşme) | 0,446 |
| Kısaltma | 0,405 |
| Kısmi kopya (%40 örtüşme) | 0,284 |
| **Alakasız metinler** | **0,005** (en yüksek 0,043) |

Eşik adaylarının yakalama oranı:

| Eşik | Birebir | %80 | %60 | Kısaltma | Yanlış pozitif |
|---|---|---|---|---|---|
| 0,35 | 5/5 | 5/5 | 5/5 | 4/5 | **0/10** |
| 0,50 | 5/5 | 5/5 | 0/5 | 0/5 | 0/10 |
| 0,70 (eski) | 5/5 | **0/5** | **0/5** | **0/5** | 0/10 |

Eski 0,70 değeri yalnızca birebir kopyayı yakalıyordu; raporun test kümesindeki
kısmi kopya, yeniden yazım ve kısaltma varyantlarının tamamı kaçıyordu. İlişkili
metinler (0,23–1,00) ile alakasız metinler (0–0,04) arasındaki boşluk geniş
olduğu için 0,35 yanlış pozitif üretmiyor.

Değer prototip değeridir; `scripts/threshold_sweep.py` etiketlenmiş küme
üzerinde çalıştığında doğrulanacaktır. **F1 optimumu 0,35'ten farklı çıkarsa
çıkan değer uygulanacak, eşik rapordaki değere geri uydurulmayacaktır.**
Sağlamada kullanılan altı metin ve beş görsel `splits/gelistirme.jsonl` içinde
`leak_guard` işaretiyle sabitlendi; eşik seçimini etkiledikleri için nihai test
bölünmesine giremezler.

### Benzerlik uyarı bandı eklendi (0,20 – 0,35) — 3.2.3'ün boş aralığı dolduruldu

**Bu yeni bir mekanizma değildir.** Raporun 3.2.3 maddesi nitelik kararının ikili
değil kademeli olduğunu tasarım kararı olarak koyuyor ve doğrulama skorunun
belirli bir aralıkta jetona dönüştüğünü söylüyor; aralık ölçüm sonrasına
bırakılmıştı. Aşağıdaki bant o boş aralığın doldurulmasıdır.

Eşik 0,35'e indirilince %60 örtüşen bir yeniden yazım *kopya* sayılıyor ve
"kısmen doğrulandı" durumu üretilemiyordu. Kopya eşiğinin altına bir ara bant
eklendi: bu bandda kalan gönderi yayında kalır, jeton kazanır ama kazancı 0,55
katsayısıyla azaltılır ve örtüşme oranı gerekçede kullanıcıya bildirilir.

Ölçülen davranış:

| Örtüşme | Jaccard | Sonuç |
|---|---|---|
| %25 | 0,150 | Doğrulandı (100) |
| %35 | 0,231 | Kısmen doğrulandı (55) + oran bildirimi |
| %45 | 0,290 | Kısmen doğrulandı (55) + oran bildirimi |
| %100 | 1,000 | Kopya tespit edildi (0) |

**0,55 katsayısı kalibrasyon beklemektedir.** Şu anki değeri gözlemle
belirlenmiştir ve savunulabilir bir dayanağı yoktur. İP7 kullanılabilirlik
testinde katılımcılara azaltılmış kazancın adil algılanıp algılanmadığı
sorulacak ve katsayı o veriye göre kalibre edilecektir. Ayrıntı README'de.

### dHash kırpmayı yakalamıyor — kümede kalıyor, dürüstçe raporlanacak

Beş görsel × beş dönüşüm ölçüldü (eşik ≤ 10 bit):

| Dönüşüm | Ortalama Hamming | Yakalanan |
|---|---|---|
| Sıkıştırma | 0,4 | 5/5 |
| Yeniden boyutlandırma | 0,4 | 5/5 |
| Filtre | 1,8 | 5/5 |
| **Kırpma** | **25,4** | **0/5** |
| **Kırpma + filtre** | **29,0** | **0/5** |

Teknik gerekçe: dHash satır bazlı komşu piksel farkı kullanır. Kırpma içeriği
9×8 ızgara içinde kaydırır, bu yüzden imza korunmaz. Ölçülen kırpma mesafesi
(25,4) alakasız görsel çiftlerinin en yakın mesafesinden (21) büyüktür — yani
eşik ayarıyla ayrıştırılamaz.

Çok ölçekli merkez sondalama denendi: kırpma mesafesi 25,4'ten 23,2'ye indi,
yakalama 0/5'te kaldı. Üreteç asimetrik kırptığı için merkez sondası
hizalanamıyor.

Kırpma test kümesinde kalacak ve sonuç dürüstçe raporlanacaktır. Görsel kademesi
için tek bir birleşik duyarlılık verilmeyecek; dönüşüm türü bazında kırılım
sunulacak ki başarısızlık tek bir dönüşümde lokalize görünsün.

### Düşük çaba skoru tanımlandı

Rapor Tablo 9'daki "Olasılık Skoru ≥ 0,65 (Min. 15 krk.)" eşiğinin tanımı
`src/lib/verification/dusukCaba.ts` içinde yazıldı. Ayrıntı ve ağırlık tablosu
için README'ye bakınız.

### Kopya ayrı bir doğrulama durumu oldu

`DogrulamaDurumu` içine `'kopya'` eklendi, kaynak gönderiye bağlantı ve örtüşme
ölçüsü sayı olarak saklanıyor. Akışta "Kopya tespit edildi" rozeti ve kaynak
bağlantısı görünüyor.

---

Arayüz düzeltme turu — 23 maddelik görev listesinin madde madde durumu.

Listenin bir bölümü, önceki hata düzeltme turunda zaten karşılanmıştı. Bu maddeler
"önceden karşılanmış" olarak işaretlendi ve kanıtı yazıldı; kod değişikliği yapılmadı.

## Görev listesinde düzeltilen üç önerme

| Listedeki ifade | Depodaki durum |
|---|---|
| "Next.js 14" | Depo **16.3.2** kullanıyor (App Router, Turbopack, React 19). |
| "Lighthouse Accessibility 89" | Ölçüm **100/100** (beş ekranın tamamı, başarısız denetim yok). |
| "alt navigasyon" | Uygulamada alt navigasyon yok; gezinme yalnızca üst çubukta. |

---

## P0 — Rapor tutarlılığı

| # | Madde | Durum |
|---|---|---|
| 1 | MIT LICENSE | **Yapıldı.** Dosya mevcuttu; telif satırı kişi/ekip adı taşımayacak şekilde `Copyright (c) 2026 MİHENK Projesi` olarak sadeleştirildi. `package.json` `license: MIT`. |
| 2 | Modalde süre bilgisi | **Yapıldı.** Süre çipi ortak bileşene çıkarıldı, mağaza kartı ve önizleme penceresi aynı biçimi paylaşıyor. Kalıcı ürünlerde "Süresiz" yazıyor (önceden hiçbir şey yazmıyordu). |
| 3 | İşlevsel üründe modal metni | **Yapıldı.** `efekt.tur === 'islev'` olan ürünlerde "satın alındığında hangi işlevi kazanacağını gösterir"; kozmetik ürünlerde eski metin korundu. |
| 4 | Yetersiz bakiye → gerçek disabled | **Yapıldı.** Marka altını yerine nötr zemin, `disabled` + `aria-disabled="true"`, `cursor-not-allowed`, "X jeton daha gerekiyor" yardım satırı `aria-describedby` ile butona bağlı. `opacity-60` kaldırıldı; bu kontrastı 4,2'den 7,07'ye çıkardı. |
| 5 | Modalde bakiye etkisi | **Yapıldı.** Al butonunun üstünde "Bakiye: 120 → 105". Bakiye yetersizse aynı satırda 4. maddedeki uyarı görünüyor. Ok işareti `aria-hidden`, ekran okuyucuya "şu değere düşecek" okunuyor. |
| 6 | Geniş Karakter composer'a bağlı | **Önceden karşılanmış.** `GonderiOlustur.tsx` → `islevAcikMi(state,'uzun_gonderi')` sayacı 0/500'den 0/1000'e çıkarıyor; süre dolunca `efektler.ts:suresiDoldu` üzerinden 500'e dönüyor. |
| 7 | Düzeltme Süresi | **Ürün katalogdan çıkarıldı.** Gönderi düzenleme akışı yok. Listede anılmayan ama aynı sorunu taşıyan **İleri Zaman** (zamanlanmış gönderi) ürünü de çıkarıldı. İşlevsel kategoride çalışan iki ürün kaldı: Geniş Karakter, Geniş Anket. Kategori dört başlık olarak korundu. |
| 8 | Yargılayıcı olmayan bildirim | **Önceden karşılanmış.** Başlık "Bu gönderi jeton kazanmadı", altında "Gönderin yayında kalmaya devam ediyor. Doğrulama yalnızca jeton kazanımını belirler." "Başarısız", "reddedildi", "düşük kaliteli" gibi sözcük kullanılmıyor. |
| 9 | İtirazda prototip sınırı | **Yapıldı.** "Prototipte itiraz inceleme süreci sonuç üretmemektedir; bu akış final sürümünde tamamlanacaktır." ifadesi ayrı çerçeveye alınarak öne çıkarıldı. |
| 10 | Açılış bakiyesi | **Yapıldı — (b) seçeneği.** Tutar 120 jetonda bırakıldı; 50'ye çekilseydi sezonluk ve kalıcı ürünler demo sırasında hiç denenemezdi. Kaydın etiketi "Demo başlangıç bakiyesi" oldu ve hareket defterinde **demo** çip etiketiyle işaretlendi. Günlük üst sınır hesabı zaten hareket defterinden türetiliyor ve geçmiş tarihli bu kaydı bugünün kazanımına saymıyor. |
| 11 | Dev göstergesi | **Yapıldı.** `next.config.ts` → `devIndicators: false`. Ölçümler üretim derlemesi üzerinden alındı. |

## P1 — Erişilebilirlik

| # | Madde | Durum |
|---|---|---|
| 12 | Modal erişilebilirliği | **Önceden karşılanmış + tamamlandı.** `role="dialog"`, `aria-modal`, `aria-labelledby`, odak tuzağı, açılışta ilk öğeye odak, ESC, kapanışta odağın geri verilmesi ve backdrop tıklaması zaten vardı. Eksik olan `aria-describedby` eklendi. |
| 13 | Gerçek tab kalıbı | **Yapıldı.** `aria-controls` + `role="tabpanel"` + `aria-labelledby`, roving `tabIndex`, sol/sağ ok (uçlarda başa dönerek), Home/End. Ok tuşları seçimi ve odağı birlikte taşıyor. Kaydırılabilir ürün listesine `tabIndex={0}`. |
| 14 | Günlük sınır progressbar | **Önceden karşılanmış.** `role="progressbar"`, `aria-valuenow/min/max`, `aria-label="Bugün kazanılan jeton"`. |
| 15 | İkon-yalnız butonlarda aria-label | **Önceden karşılanmış.** Geri, görsel ekle, anket ekle, cüzdan, mağaza, kapat düğmelerinin tamamı etiketli. Tema düğmesi duruma göre değişiyor ("Açık temaya geç" / "Koyu temaya geç"). *Alt navigasyon kısmı kapsam dışı — uygulamada alt navigasyon yok.* |
| 16 | Karakter sayacı duyurusu | **Yapıldı.** Sayacın kendisi canlı bölge olmaktan çıkarıldı; ayrı bir `sr-only` bölge eşik bandına bağlandı. Yalnızca sınırın %80'ine ve sınıra ulaşınca bir kez duyuruyor; bant içinde metin sabit kaldığı için tekrar okunmuyor. |
| 17 | Rozetler yalnız renge dayanmasın | **Yapıldı.** İkon + metin zaten vardı (renk körlüğünde ayırt edilebilir). Erişilebilir adlar açıldı: "Yapay zekâ destekli içerik", "Doğrulama geçti, MİHENK skoru 88" / "Doğrulama kısmen geçti…". |
| 18 | Kontrast denetimi | **Önceden karşılanmış — ölçüldü.** 18 renk çiftinin tamamı AA eşiğini geçiyor (aşağıdaki tablo). Ayrıca 4. maddede yetersiz bakiye butonundaki `opacity-60` kaldırılarak 4,2 → 7,07 iyileştirmesi yapıldı. |
| 19 | Klavye ile uçtan uca | **Yapıldı — bir kusur bulundu ve düzeltildi.** Denetim, Cüzdan ve Mağaza katmanlarında odak yönetimi olmadığını ortaya çıkardı (aşağıya bakınız). Düzeltme sonrası 26 kontrolün tamamı geçiyor. |
| 20 | prefers-reduced-motion | **Önceden karşılanmış — doğrulandı.** Ölçüm: katman girişi 0,3 sn → 1e-05 sn, cüzdan çubuğu geçişi 1 sn → 1e-05 sn, pencere girişi 0,2 sn → 1e-05 sn. Çubuk genişliği, sınır metni ve pencere içeriği değişmiyor; animasyonlar `both` dolgu kipiyle tanımlı olduğu için süre sıfırlanınca son durumlarına atlıyorlar. |

## P2 — Cila

| # | Madde | Durum |
|---|---|---|
| 21 | Fiyatlarda birim | **Yapıldı.** Ortak `Jeton` bileşeni: görsel olarak jeton ikonu + sayı, ekran okuyucuda "15 jeton". Kart fiyatları, Al butonu ve mağaza başlığındaki bakiye. |
| 22 | Boş durum ekranları | **Yapıldı.** Envanter bölümü boşken tamamen gizleniyordu; artık her zaman görünüyor ve ne işe yaradığını anlatıyor. Hareket defterinin boş durumu da genişletildi. *Arama sonucu boş durumu kapsam dışı — uygulamada arama özelliği yok.* |
| 23 | Satın alma geri bildirimi | **Yapıldı.** Mesaj üründen türetiliyor: "Pirinç Çerçeve alındı, 24 saat boyunca profilinde görünecek." / "kalıcı olarak…" / işlevsel ürünlerde "30 gün boyunca kullanabilirsin." Yetersiz bakiye mesajına eksik miktar eklendi. `aria-live` ile duyuruluyor, ürün envanterde görünür hâle geliyor. |

---

## Listede olmayan, denetim sırasında bulunan kusur

**Cüzdan ve Mağaza katmanlarında odak yönetimi yoktu.** Bu iki ekran `fixed inset-0` ile
akışın üstüne biniyor ama DOM'da onun kardeşi olarak duruyor. Sonuçları:

- Katman açıldığında odak akışta kalıyordu; katmandaki ilk düğmeye ulaşmak için arkadaki
  bütün gönderi kartlarını (8 gönderi × 4 düğme) Tab'lamak gerekiyordu.
- Ekran okuyucu, görünmeyen akış içeriğini okumaya devam ediyordu.
- Escape ile kapanmıyorlardı.

Eklenen `useKatman` kancası açılışta odağı katmana taşıyor, Escape'i dinliyor ve kapanışta
odağı çağıran düğmeye geri veriyor. Akış, katman açıkken `inert` ile sekme sırasından ve
erişilebilirlik ağacından çıkarılıyor. Klavye denetimi 15/26'dan 26/26'ya çıktı.

---

## Ölçümler

### Lighthouse (üretim derlemesi, sürüm 13.4.1)

Uygulamanın ana ekranları giriş kapısının arkasında olduğu için tek sayfa denetimi yeterli
değil; ekranlar Chrome sürülerek tek tek ölçüldü.

| Ekran | Erişilebilirlik |
|---|---|
| Giriş ekranı | 100 / 100 |
| Ana akış | 100 / 100 |
| Cüzdan | 100 / 100 |
| Mağaza | 100 / 100 |
| Ürün önizleme penceresi | 100 / 100 |

Başarısız denetim yok. Giriş sayfasının tam sonucu (masaüstü ön ayarı):
**Performans 100 · Erişilebilirlik 100 · En İyi Uygulamalar 100 · SEO 100**
(FCP 0,2 sn · LCP 0,7 sn · CLS 0).

> Not: Lighthouse'un mobil ekran emülasyonu bu makinede `NO_FCP` hatası veriyor ve ölçüm
> alınamıyor. Aynı sayfa Puppeteer ile mobil görünümde kusursuz render ediliyor, konsol
> hatası ve başarısız istek yok. Ölçüm aracının bu ortamdaki bir arızası.

### Kontrast oranları (WCAG 1.4.3 — normal metin için eşik 4,5)

| Çift | Koyu tema | Açık tema |
|---|---|---|
| Ana metin / sayfa | 14,12 | 15,60 |
| İkincil metin / sayfa | 7,07 | 5,29 |
| İkincil metin / kart | 6,09 | 6,08 |
| Marka / sayfa | 6,69 | 4,80 |
| Marka / kart | 5,76 | 5,51 |
| Buton metni / marka zemin | 6,69 | 5,51 |
| Başarı / kart | 4,82 | 6,83 |
| Hata / kart | 4,60 | 6,92 |
| Etkileşim / sayfa | 7,14 | 6,01 |

18 çiftin tamamı AA eşiğini geçiyor; en düşük değer 4,60.

### Testler

| Paket | Kapsam | Kontrol |
|---|---|---|
| `npm test` | Doğrulama kütüphanesi ve depo katmanı | 50 |
| `test/tarayici/klavye.mjs` | Klavyeyle uçtan uca gezinme | 26 |
| `test/tarayici/hareket.mjs` | Hareketi azaltma tercihi | 8 |

Birim testleri bağımlılıksız çalışır. Tarayıcı denetimleri `puppeteer-core` gerektirdiği için
bilerek `npm test` dışında tutuldu; çalıştırma yönergesi betiklerin başında yazılı.

---

## Ekip için not — commit kimliği

Yarışma kör değerlendirme yaptığı için commit yazarı kişi adı veya kişisel e-posta
taşımamalı. `git config` yalnızca **bundan sonraki** commit'leri etkiler, mevcut geçmişi
düzeltmez. Depoya katkı vermeden önce bir kez çalıştırın:

```bash
git config user.name "mihenk-proje"
git config user.email "mihenk-proje@users.noreply.github.com"
```

`--global` kullanmayın; ayar yalnızca bu depo için geçerli olsun.
