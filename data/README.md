# Veri Setleri

Bu dizin İP6 ölçüm çalışmasının veri katmanıdır.

## ⚠️ Mevcut durum (2026-08-25)

| Küme | Rapordaki hedef | Depodaki durum |
|---|---|---|
| Türkçe içerik niteliği | 2.000 (1.000 nitelikli / 1.000 düşük çabalı) | **boş** |
| Metin özgünlük | 500 özgün + 2.000 varyant | **boş** (varyant üreteci hazır) |
| Görsel özgünlük | 500 özgün + 2.000 dönüşüm | **boş** (dönüşüm üreteci hazır) |
| Düşük çaba görsel | 1.000 (500 / 500) | **boş** (üreteç hazır) |
| İP3 ön pilot kümesi (500 örnek) | Tablo 9 ve 13'ün dayanağı | **bulunamadı** |

**İP3 ön pilot kümesi hakkında:** Teknik rapor bu kümeyi Tablo 9 ve Tablo 13'teki
metriklerin dayanağı olarak gösteriyor ve veri setlerinin bu depoda yayımlandığını
belirtiyor. Küme depoda, git geçmişinde veya ekip makinesinde bulunamadı. Bu dizin
kümenin yerini sentetik veriyle doldurmaz: rapor metrikleri o küme üzerinde ölçülmüş
olarak sunulduğu için, sonradan üretilmiş veri o sayıların dayanağı yerine geçemez.
Küme bulunursa şemaya uygun biçimde buraya işlenmelidir.

## Şema

Tüm kümeler JSONL biçimindedir; her satır bir kayıttır.

### Ortak alanlar

| Alan | Tür | Açıklama |
|---|---|---|
| `id` | string | Küme içinde benzersiz |
| `text` \| `image_path` | string | İçeriğin kendisi ya da dosya yolu |
| `label` | enum | `nitelikli` \| `dusuk_cabali` \| `ozgun` \| `varyant` |
| `source` | enum | `ozgun_yazim` \| `kamuya_acik_kaynak` \| `sentetik` |
| `collected_at` | ISO tarih | Kaydın kümeye girdiği tarih |
| `labeler_1` | string \| null | Birinci etiketleyici (`uye1`/`uye2`/`uye3`) |
| `labeler_2` | string \| null | İkinci etiketleyici, birinciden bağımsız |
| `labeler_3` | string \| null | Yalnızca uyuşmazlıkta |
| `final_label` | enum \| null | Uzlaşılan etiket |
| `notes` | string | Serbest not |
| `split` | enum | `gelistirme` \| `dogrulama` \| `test` |

### Varyant kayıtlarında ek alanlar

| Alan | Açıklama |
|---|---|
| `parent_id` | Türetildiği özgün kaydın kimliği |
| `variant_type` | Dönüşüm türü |
| `seed` | Üretimde kullanılan tohum (yeniden üretilebilirlik) |

## `source` alanı neden kritik

Rapor kümelerin "ekip tarafından toplanmakta ve etiketlenmektedir" olduğunu
söylüyor. Betiklerle üretilen her kayıt `sentetik` olarak işaretlenir ve final
raporunda sentetik oranı açıkça beyan edilir. Sentetik veriyi `ozgun_yazim` veya
`kamuya_acik_kaynak` diye etiketlemek veri bütünlüğü ihlalidir.

## Kazıma yasağı

NSosyal veya başka bir platformdan içerik kazınmaz. Rapor "ham içerik açık rıza
olmadan kullanılmaz" taahhüdü veriyor. Depoda kazıma betiği bulunmaz.

## Bölünme ve sızıntı

Bölünme `splits/` altında sabitlenir. Eşik taraması yalnızca `gelistirme` ve
`dogrulama` bölünmelerinde çalışır; `test` bölünmesi yalnızca `scripts/evaluate.py`
tarafından, seçilmiş eşiklerle, tek seferlik ölçümde okunur. Ayrıntı için
[`splits/README.md`](../splits/README.md).
