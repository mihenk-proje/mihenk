# Değişiklik Kaydı

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
