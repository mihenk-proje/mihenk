# Bölünmeler ve Sızıntı Koruması

Teknik rapor dört yerde **"test kümesi sürecin hiçbir aşamasına girmez"** taahhüdü
veriyor. Bu dizin o taahhüdün makine tarafından denetlenebilir hâlidir.

## Kural

| Bölünme | Kim okur | Ne için |
|---|---|---|
| `gelistirme` | `threshold_sweep.py` | Eşik arama |
| `dogrulama` | `threshold_sweep.py` | Eşik seçimi (F1 maksimizasyonu) |
| `test` | **yalnızca** `evaluate.py` | Seçilmiş eşiklerle tek seferlik ölçüm |

Eşik taraması test bölünmesini hiçbir koşulda okumaz. Bölünme tohumlu ve
tekrarlanabilirdir; bölünme dosyaları depoya işlenir.

## `leak_guard` işareti

`gelistirme.jsonl` içindeki `leak_guard: true` kayıtları, **eşik seçimini fiilen
etkilemiş** örneklerdir. Bunlar test bölünmesine giremez.

2026-08-25 tarihinde Jaccard eşiği (0,70 → 0,35) ve dHash kırpma sınırı, altı metin
ve beş görselden oluşan bir ön sağlamayla doğrulandı. Sağlama B4'ün asıl
taramasından önce yapıldığı ve tam küme henüz oluşmadığı için bir ihlal değildir;
ancak bu örnekler artık "görülmüş" sayılır. `scripts/fix_dev_split.py` onları
kalıcı olarak geliştirme kümesine sabitler.

Kontrol:

```bash
python3 scripts/fix_dev_split.py --dogrula
```

## Eşik değerleri geri uydurulmaz

Şu an koddaki Jaccard eşiği 0,35 ve bu hem raporun taahhüdü hem ön sağlamanın
çıktısı. Bu örtüşme rahatlatıcı görünse de tuzaktır.

**B4 tam küme üzerinde çalıştığında F1 optimumu 0,35'ten farklı çıkarsa, çıkan
değer uygulanır.** Fark CHANGELOG'a gerekçesiyle yazılır. Eşiği rapordaki değere
geri uydurmak, "ölçtük, raporu doğruladı" değil "raporu doğrulayacak şekilde
ölçtük" demektir ve fark jüriye görünür.

Aynı kural düşük çaba eşiği (0,65) ve Hamming eşiği (10) için de geçerlidir.
