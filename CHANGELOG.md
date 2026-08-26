# Değişiklik Kaydı

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
