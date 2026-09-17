# MİHENK — İP6 nihai ölçüm raporu

Üretim: `2026-09-17` · `node scripts/build_report.mjs`

> **Raporun Tablo 9 ve 13 değerleri ön pilot ölçüm olarak sunulmuştu; o ölçümün veri seti tekrar üretilebilir biçimde mevcut değildir. Aşağıdaki değerler İP6 kümesi üzerinde sıfırdan ölçülmüştür.**

Bu dosya elle yazılmaz. Üretim zinciri:

```bash
node scripts/hash_gorseller.mjs --manifest data/images/manifest.jsonl \
  --manifest data/images/variants_manifest.jsonl --out data/images/dhash.json
node scripts/threshold_sweep.mjs --out results/sweep.json
node scripts/evaluate.mjs --sweep results/sweep.json --out results/metrics.json
node scripts/build_report.mjs --metrics results/metrics.json --out results/olcum-raporu.md
```

## Kademe 1 — Metin özgünlüğü

Ölçü: Jaccard benzerliği (5 karakterlik n-gram)

Küme: 500 özgün · 2000 pozitif çift · 2000 dengeli negatif · 124.750 tam negatif çift

| | Rapordaki ön pilot değer | Nihai ölçüm — yürürlükteki eşik | Kısıtlı optimum | F1 optimumu |
|---|---|---|---|---|
| Eşik | 0,35 | **0,35** | 0,34 | 0,08 |
| Kesinlik | — | **100,0%** | 100,0% | 99,6% |
| Duyarlılık | — | **83,6%** | 84,9% | 99,2% |
| F1 | — | **0,9107** | 0,9180 | 0,9937 |
| Yanlış pozitif (tam negatif küme) | — | **4 / 124.750 · 0,0032%** | 4 / 124.750 · 0,0032% | 637 / 124.750 · 0,511% |

**Kısıtlı optimum**: yanlış pozitif oranı yürürlüktekinden kötü olmamak kaydıyla
duyarlılığı en büyükleyen eşik. Gerekçesi aşağıda.

### Dönüşüm bazında duyarlılık

Tek bir birleşik duyarlılık sayısı, tek bir dönüşümnin tamamen kaçtığını gizler.

| Dönüşüm | n | Ortalama skor | Eşik 0,35 | Eşik 0,08 |
|---|---|---|---|---|
| birebir kopya | 500 | 1,000 | 500/500 · 100,0% | 500/500 · 100,0% |
| kismi kopya | 500 | 0,409 | 365/500 · 73,0% | 483/500 · 96,6% |
| yeniden yazim | 500 | 0,712 | 488/500 · 97,6% | 500/500 · 100,0% |
| kisaltma | 500 | 0,411 | 319/500 · 63,8% | 500/500 · 100,0% |

### Eşik–F1 eğrisi

| Eşik | F1 | Kesinlik | Duyarlılık |
|---|---|---|---|
| 0 | 0,6667 | 50,0% | 100,0% |
| 0,05 | 0,9890 | 98,5% | 99,3% |
| 0,1 | 0,9930 | 99,7% | 98,9% |
| 0,15 | 0,9912 | 99,8% | 98,4% |
| 0,2 | 0,9850 | 99,9% | 97,2% |
| 0,25 | 0,9704 | 100,0% | 94,3% |
| 0,3 | 0,9446 | 100,0% | 89,5% |
| 0,35 | 0,9107 | 100,0% | 83,6% |
| 0,4 | 0,8691 | 100,0% | 76,8% |
| 0,45 | 0,8099 | 100,0% | 68,0% |
| 0,5 | 0,7449 | 100,0% | 59,4% |
| 0,55 | 0,6729 | 100,0% | 50,7% |
| 0,6 | 0,6311 | 100,0% | 46,1% |
| 0,65 | 0,5980 | 100,0% | 42,6% |
| 0,7 | 0,5637 | 100,0% | 39,3% |
| 0,75 | 0,5353 | 100,0% | 36,5% |
| 0,8 | 0,5080 | 100,0% | 34,1% |
| 0,85 | 0,4831 | 100,0% | 31,9% |
| 0,9 | 0,4514 | 100,0% | 29,1% |
| 0,95 | 0,4308 | 100,0% | 27,5% |
| 1 | 0,4283 | 100,0% | 27,3% |

## Kademe 2 — Görsel özgünlüğü

Ölçü: 9×8 dHash, Hamming mesafesi

Küme: 500 özgün · 2500 pozitif çift · 2500 dengeli negatif · 124.750 tam negatif çift

| | Rapordaki ön pilot değer | Nihai ölçüm — yürürlükteki eşik | Kısıtlı optimum | F1 optimumu |
|---|---|---|---|---|
| Eşik | 10 bit | **10** | 10 | 22 |
| Kesinlik | — | **99,7%** | 99,7% | 90,2% |
| Duyarlılık | — | **62,6%** | 62,6% | 81,9% |
| F1 | — | **0,7689** | 0,7689 | 0,8587 |
| Yanlış pozitif (tam negatif küme) | — | **267 / 124.750 · 0,214%** | 267 / 124.750 · 0,214% | 12838 / 124.750 · 10,3% |

**Kısıtlı optimum**: yanlış pozitif oranı yürürlüktekinden kötü olmamak kaydıyla
duyarlılığı en büyükleyen eşik. Gerekçesi aşağıda.

### Dönüşüm bazında duyarlılık

Tek bir birleşik duyarlılık sayısı, tek bir dönüşümnin tamamen kaçtığını gizler.

| Dönüşüm | n | Ortalama skor | Eşik 10 | Eşik 22 |
|---|---|---|---|---|
| yeniden boyutlandirma | 500 | 0,868 | 500/500 · 100,0% | 500/500 · 100,0% |
| sikistirma | 500 | 1,636 | 496/500 · 99,2% | 500/500 · 100,0% |
| kirpma | 500 | 21,554 | 39/500 · 7,8% | 268/500 · 53,6% |
| filtre | 500 | 2,084 | 493/500 · 98,6% | 500/500 · 100,0% |
| kirpma filtre | 500 | 21,330 | 36/500 · 7,2% | 280/500 · 56,0% |

### Kırpma dahil ve hariç — iki seri

Kırpma, algısal hash'in yapısal sınırıdır: görüntünün kenarları kesildiğinde 9×8
ızgara kayar ve hash ilişkisiz bir görselinkine yaklaşır. Eşik ayarıyla çözülmez.

- **Kırpma dahil** — en iyi F1 eşiği 22, F1 0,8587, duyarlılık 81,9%
- **Kırpma hariç** — en iyi F1 eşiği 13, F1 0,9963, duyarlılık 99,9%

Ayrıntı: [bilinen-sinirlar.md](bilinen-sinirlar.md)

### Eşik–F1 eğrisi

| Eşik | F1 | Kesinlik | Duyarlılık |
|---|---|---|---|
| 0 | 0,3536 | 100,0% | 21,5% |
| 2 | 0,6490 | 100,0% | 48,0% |
| 4 | 0,7242 | 100,0% | 56,8% |
| 6 | 0,7431 | 100,0% | 59,1% |
| 8 | 0,7537 | 99,9% | 60,5% |
| 10 | 0,7689 | 99,7% | 62,6% |
| 12 | 0,7826 | 99,4% | 64,5% |
| 14 | 0,8002 | 98,9% | 67,2% |
| 16 | 0,8196 | 97,8% | 70,5% |
| 18 | 0,8350 | 96,2% | 73,8% |
| 20 | 0,8503 | 93,7% | 77,8% |
| 22 | 0,8587 | 90,2% | 81,9% |
| 24 | 0,8510 | 84,3% | 85,9% |
| 26 | 0,8373 | 78,5% | 89,6% |
| 28 | 0,8100 | 71,8% | 92,9% |
| 30 | 0,7789 | 65,7% | 95,5% |
| 32 | 0,7417 | 59,9% | 97,3% |
| 34 | 0,7124 | 55,8% | 98,5% |
| 36 | 0,6935 | 53,3% | 99,4% |
| 38 | 0,6811 | 51,7% | 99,8% |
| 40 | 0,6727 | 50,7% | 100,0% |
| 42 | 0,6696 | 50,3% | 100,0% |
| 44 | 0,6683 | 50,2% | 100,0% |
| 46 | 0,6676 | 50,1% | 100,0% |
| 48 | 0,6668 | 50,0% | 100,0% |
| 50 | 0,6667 | 50,0% | 100,0% |
| 52 | 0,6667 | 50,0% | 100,0% |
| 54 | 0,6667 | 50,0% | 100,0% |
| 56 | 0,6667 | 50,0% | 100,0% |
| 58 | 0,6667 | 50,0% | 100,0% |
| 60 | 0,6667 | 50,0% | 100,0% |
| 62 | 0,6667 | 50,0% | 100,0% |
| 64 | 0,6667 | 50,0% | 100,0% |

## Kademe 2b — Düşük çaba (görsel)

Ölçü: Düşük çaba skoru (entropi + Laplas varyansı + tek renk oranı)

Küme: 60 üretilmiş düşük çabalı görsel (üç aile) · 500 gerçek fotoğraf

Skorlar gerçek çalışma zamanı motoruyla üretildi: piksel çıkarımı başsız Chrome'da
(`olcDusukCaba` ve `laplasVaryansi` kaynaktan birebir enjekte), puanlama Node'da
(`gorselDusukCabaSkoru` doğrudan içe aktarım). Algoritmanın ikinci bir kopyası yok.

| | Rapordaki ön pilot değer | Nihai ölçüm — yürürlükteki eşik | Kısıtlı optimum | F1 optimumu |
|---|---|---|---|---|
| Eşik | 0,65 | **0,65** | 0,58 | 0,58 |
| Kesinlik | — | **97,6%** | 97,6% | 97,6% |
| Duyarlılık | — | **66,7%** | 66,7% | 66,7% |
| F1 | — | **0,7921** | 0,7921 | 0,7921 |
| Yanlış pozitif (tam negatif küme) | — | **1 / 500 · 0,200%** | 1 / 500 · 0,200% | 1 / 500 · 0,200% |

**Kısıtlı optimum**: yanlış pozitif oranı yürürlüktekinden kötü olmamak kaydıyla
duyarlılığı en büyükleyen eşik. Gerekçesi aşağıda.

### Aile bazında duyarlılık

Tek bir birleşik duyarlılık sayısı, tek bir ailenin tamamen kaçtığını gizler.

| Aile | n | Ortalama skor | Eşik 0,65 | Eşik 0,58 |
|---|---|---|---|---|
| tek renk | 20 | 0,894 | 20/20 · 100,0% | 20/20 · 100,0% |
| bulanik | 20 | 0,760 | 20/20 · 100,0% | 20/20 · 100,0% |
| gurultu | 20 | 0,083 | 0/20 · 0,0% | 0/20 · 0,0% |

### Gürültü — yapısal sınır

Düz gürültü görselleri üç ölçünün üçünü de "canlı fotoğraf" gibi okutur: entropi
yüksek (her ton var), Laplas varyansı yüksek (her piksel kenar), tek renk oranı
sıfır. Skorlayıcı bunu ayırt edemez ve edemeyeceği baştan biliniyordu; ölçüm
bunu 0/20 ile sayıya döktü. Eşik ayarıyla çözülmez — ölçüler gürültüyü
görmüyor. Ayrıntı: [bilinen-sinirlar.md](bilinen-sinirlar.md)

### Eşik–F1 eğrisi

| Eşik | F1 | Kesinlik | Duyarlılık |
|---|---|---|---|
| 0 | 0,1935 | 10,7% | 100,0% |
| 0,02 | 0,6186 | 44,8% | 100,0% |
| 0,04 | 0,6936 | 53,1% | 100,0% |
| 0,06 | 0,7186 | 56,1% | 100,0% |
| 0,08 | 0,7500 | 60,0% | 100,0% |
| 0,1 | 0,5926 | 53,3% | 66,7% |
| 0,12 | 0,6015 | 54,8% | 66,7% |
| 0,14 | 0,6154 | 57,1% | 66,7% |
| 0,16 | 0,6299 | 59,7% | 66,7% |
| 0,18 | 0,6299 | 59,7% | 66,7% |
| 0,2 | 0,6349 | 60,6% | 66,7% |
| 0,22 | 0,6452 | 62,5% | 66,7% |
| 0,24 | 0,6612 | 65,6% | 66,7% |
| 0,26 | 0,6667 | 66,7% | 66,7% |
| 0,28 | 0,6838 | 70,2% | 66,7% |
| 0,3 | 0,6897 | 71,4% | 66,7% |
| 0,32 | 0,7018 | 74,1% | 66,7% |
| 0,34 | 0,7207 | 78,4% | 66,7% |
| 0,36 | 0,7207 | 78,4% | 66,7% |
| 0,38 | 0,7477 | 85,1% | 66,7% |
| 0,4 | 0,7547 | 87,0% | 66,7% |
| 0,42 | 0,7547 | 87,0% | 66,7% |
| 0,44 | 0,7619 | 88,9% | 66,7% |
| 0,46 | 0,7692 | 90,9% | 66,7% |
| 0,48 | 0,7692 | 90,9% | 66,7% |
| 0,5 | 0,7692 | 90,9% | 66,7% |
| 0,52 | 0,7767 | 93,0% | 66,7% |
| 0,54 | 0,7767 | 93,0% | 66,7% |
| 0,56 | 0,7767 | 93,0% | 66,7% |
| 0,58 | 0,7921 | 97,6% | 66,7% |
| 0,6 | 0,7921 | 97,6% | 66,7% |
| 0,62 | 0,7921 | 97,6% | 66,7% |
| 0,64 | 0,7921 | 97,6% | 66,7% |
| 0,66 | 0,7755 | 100,0% | 63,3% |
| 0,68 | 0,7234 | 100,0% | 56,7% |
| 0,7 | 0,6667 | 100,0% | 50,0% |
| 0,72 | 0,5714 | 100,0% | 40,0% |
| 0,74 | 0,5714 | 100,0% | 40,0% |
| 0,76 | 0,5542 | 100,0% | 38,3% |
| 0,78 | 0,5185 | 100,0% | 35,0% |
| 0,8 | 0,4615 | 100,0% | 30,0% |
| 0,82 | 0,4615 | 100,0% | 30,0% |
| 0,84 | 0,4211 | 100,0% | 26,7% |
| 0,86 | 0,4211 | 100,0% | 26,7% |
| 0,88 | 0,4211 | 100,0% | 26,7% |
| 0,9 | 0,4000 | 100,0% | 25,0% |
| 0,92 | 0,4000 | 100,0% | 25,0% |
| 0,94 | 0,3784 | 100,0% | 23,3% |
| 0,96 | 0,3562 | 100,0% | 21,7% |
| 0,98 | 0,3562 | 100,0% | 21,7% |
| 1 | 0,3562 | 100,0% | 21,7% |

## Eşik kararı — F1 optimumu neden uygulanmadı

F1, yanlış pozitif ile yanlış negatifi eşit maliyetli sayar. MİHENK'te bunlar eşit
değildir: yanlış negatif, bir kopyanın jeton kazanmasıdır; yanlış pozitif, özgün içerik
üreten bir kullanıcının kopyacılıkla işaretlenip ödülünün kesilmesidir. İkincisi hem
kullanıcı hem de sistemin meşruiyeti açısından daha pahalıdır. Bu yüzden ölçüt F1 değil,
**yanlış pozitif oranı bugünkünden kötü olmamak kaydıyla en yüksek duyarlılık**.

Sonuç: her iki kademede de kısıtlı optimum, kodda yürürlükte olan değere denk çıktı.

**Metin.** Yürürlükteki eşik 0,35, kısıtlı optimum 0,34, F1 optimumu 0,08.
Kısıtlı optimum duyarlılığı 83,6% → 84,9% taşıyor, yanlış pozitif oranı değişmiyor.
Fark 0,01 birim, yani taramanın adım çözünürlüğü kadar; kod değiştirilmedi.
Raporda belgelenen değeri bu büyüklükte bir kazanç için oynatmak, izlenebilirliği kazançtan pahalıya mal olurdu.
F1 optimumu ise yanlış pozitifi 4'ten 637'e — 159 katına —
çıkarıyor (0,0032% → 0,511%); F1'deki kazanç 0,9107 → 0,9937.

**Görsel.** Yürürlükteki eşik 10, kısıtlı optimum 10, F1 optimumu 22.
Kısıtlı optimum yürürlüktekinin aynısı: kesinlikten ödün vermeden kazanılacak duyarlılık yok.
F1 optimumu ise yanlış pozitifi 267'ten 12838'e — 48 katına —
çıkarıyor (0,214% → 10,3%); F1'deki kazanç 0,7689 → 0,8587.

**Düşük çaba.** Yürürlükteki eşik 0,65, kısıtlı optimum 0,58, F1 optimumu 0,58.
İki eşik de aynı sonucu veriyor: 0,58 ile 0,65 arasında hiçbir örnek düşmüyor, eğri bu aralıkta düz.
Yürürlükteki değer bu düzlüğün içinde; oynatmak hiçbir şey değiştirmezdi.

Bu, eşiklerin ölçümden muaf olduğu anlamına gelmez: yukarıdaki tablolar yürürlükteki
değerlerin bu küme üzerinde ne verdiğini sayıyla gösteriyor ve karar ölçüme dayanıyor.
