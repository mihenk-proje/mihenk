# Düşük Çaba Skoru — Kalibrasyon

**Ölçüm tarihi:** 2026-08-25

Teknik rapor Tablo 9'da **"Olasılık Skoru ≥ 0,65 (Min. 15 krk.)"** eşiği geçiyor ancak
skorun nasıl hesaplandığı raporda tanımlı değil. Bu belge o tanımı ve arkasındaki
ölçümü verir.

Skor **0–1 aralığında bir düşük çaba olasılığıdır**: yüksek değer içeriğin düşük
çabalı olduğuna işaret eder. Nitelik puanının tersidir. "Min. 15 karakter" kısıtı
**metin kademesine** aittir ve sert bir tabandır; görsel kademesinin karakter tabanı
yoktur.

Tanım: `src/lib/verification/dusukCaba.ts`

## Görsel kademesi — bileşen dağılımları

500 Unsplash fotoğrafı (normal sınıf) ve 60 üretilmiş düşük çabalı görsel üzerinde
ölçüldü.

| Bileşen | Normal %5 | Normal ortanca | Düşük çabalı %95 | Düşük çabalı ortanca |
|---|---|---|---|---|
| **Laplas varyansı** (bulanıklık) | **120** | 1.009 | **82** | 3,4 |
| Entropi (bit) | 4,67 | 6,96 | 4,97 | 3,39 |
| Baskın renk oranı | — | 0,03 | 1,00 | 0,24 |

Laplas varyansı sınıfları neredeyse tek başına ayırıyor: normal fotoğrafların %5'lik
dilimi 120, düşük çabalı görsellerin %95'lik dilimi 82. Entropi ve baskın renk oranı
örtüşen dağılımlara sahip, ayırt edicilikleri daha zayıf.

## Seçilen ağırlıklar

| Bileşen | Ağırlık | Doyum noktası | Gerekçe |
|---|---|---|---|
| Laplas varyansı | **0,60** | 200 tavan, 180 aralık | En güçlü ayırıcı |
| Entropi | 0,25 | 6,0 | Orta güçte, normal ortancası 6,96 |
| Baskın renk oranı | 0,15 | 0,15 taban | En zayıf ayırıcı, dağılımlar örtüşüyor |

Metin kademesi: karakter sayısı 0,40 · kelime sayısı 0,30 · tip/token çeşitliliği
0,18 · ardışık tekrar 0,12.

## Kalibrasyon öncesi / sonrası

İlk sürümdeki ağırlıklar (entropi 0,40 · bulanıklık 0,35 · baskın renk 0,25) ve
doyum noktaları veriyle değil gözlemle konmuştu.

| Görsel ailesi | Önce | Sonra |
|---|---|---|
| Tek renk | 13/20 | **20/20** |
| Bulanık | 3/20 | **20/20** |
| Düz gürültü | 0/20 | 0/20 *(bilinen sınır)* |

**Yanlış pozitif:** 1.000 gerçek fotoğrafın **4'ü** eşiği aşıyor (**%0,40**).

| | Ortalama | %95 |
|---|---|---|
| 1.000 gerçek fotoğraf | 0,040 | 0,352 |
| Düşük çabalı (tek renk + bulanık) | 0,829 | — |
| Eşik | 0,650 | |

Eşik iki dağılımın arasında geniş bir boşlukta duruyor.

## Yeniden üretme

```bash
python3 scripts/gen_lowquality_images.py --count 60 --seed 42
```

Betik ürettiği her görselin bileşen ölçümlerini ve skorunu manifest'e yazar, aile
bazında eşiği geçme oranını raporlar.
