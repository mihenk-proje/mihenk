# Etiketleme Kılavuzu

Bu kılavuz, nitelik korpusundaki 2.000 metnin etiketlenmesinde kullanılır.
Etiketlemeye başlamadan önce **tamamı okunmalıdır**. Kılavuz okunmadan yapılan
etiketleme, etiketleyiciler arası uzlaşmayı (Cohen's kappa) düşürür ve işin
tekrarlanması gerekir.

## Soru

Her metin için tek bir soru sorulur:

> **Bu metin, okuyan birine bir şey aktarıyor mu?**

Sorulmayan sorular: metin doğru mu, hoşuma gitti mi, katılıyor muyum, yazarı
sempatik mi, konu ilginç mi. Nitelik ölçüsü **içerik taşıyıp taşımadığıdır**,
içeriğin değeri değil.

## Etiketler

### 1 — Nitelikli

Metin bir **fikir, gözlem, deneyim veya bilgi** aktarıyor. Okuyan biri içerikten
bir şey öğreniyor: bir durum, bir sonuç, bir değerlendirme, bir öneri.

Belirtiler:
- Bir şeyin nasıl olduğunu, ne olduğunu veya neden olduğunu söylüyor
- Kişisel bir deneyimi aktarıyor ve deneyimin içeriği var
- Bir karşılaştırma, gerekçe veya ayrıntı içeriyor

### 2 — Düşük çabalı

Metin **içerik taşımıyor**. Okuyan biri metinden bir şey öğrenmiyor.

Belirtiler:
- Tek kelimelik tepkiler: "Güzel.", "Harika!", "Katılıyorum."
- Yalnızca emoji veya yalnızca bağlantı
- Anlamsız karakter dizileri: "asdasd", "aaaa"
- Bilgi taşımayan durum bildirimleri: "Buradayım.", "Şimdi çıkıyorum."
- Kopyala-yapıştır zincir metinler, hazır kalıplar
- Aynı sözcüğün ya da cümlenin tekrarından ibaret metinler

### 3 — Emin değilim

Kararsız kaldığınız her durumda bu seçenek kullanılır. Bu kayıtlar doğrudan
uyuşmazlık dosyasına gider ve üçüncü değerlendiriciye yönlendirilir.

> **Önemli:** Emin olamadığınızda **varsayılan olarak "düşük çabalı" seçmeyin.**
> Kararsızlığı düşük çabalıya yığmak, kümeyi sistematik olarak çarpıtır ve
> ölçülen duyarlılığı yapay biçimde yükseltir. Kararsızsanız 3'e basın.

## Sınır durum karar kuralı

| Durum | Karar |
|---|---|
| **Kısa ama bilgi taşıyor** | **Nitelikli** |
| **Uzun ama tekrardan ibaret** | **Düşük çabalı** |
| Yazım hatası var ama içerik var | Nitelikli — yazım hatası nitelik ölçüsü değil |
| Argo veya samimi dil, içerik var | Nitelikli — üslup nitelik ölçüsü değil |
| Katılmadığınız bir görüş, gerekçeli | Nitelikli — katılmak ölçüt değil |
| Doğru ama hiçbir şey söylemeyen klişe | Düşük çabalı |
| Emin olamıyorsunuz | **Emin değilim (3)** |

**Uzunluk tek başına karar vermez.** 25 karakterlik bir metin bilgi taşıyorsa
niteliklidir; 200 karakterlik bir metin aynı cümleyi üç kez tekrarlıyorsa düşük
çabalıdır. Sistemdeki düşük çaba skoru uzunluğu bir sinyal olarak kullanır ama
**etiketleyicinin kararı skordan bağımsızdır** — skorun doğruluğu tam olarak bu
kararlara bakılarak ölçülecektir.

## Örnekler

### Nitelikli

**N1.** *"Roket motorunun ikinci ateşleme denemesinde basınç eğrisi beklenenden yumuşak çıktı, yakıt akışını yeniden ayarladık."*
Bir deneyin sonucunu ve alınan aksiyonu aktarıyor.

**N2.** *"Kargo üç gün gecikti ama kutu sağlam geldi, içindeki köpük koruma iyiydi."*
Günlük dilde, kısa; yine de bir deneyimi ayrıntısıyla aktarıyor.

**N3.** *"Pili sabah tam doluyken akşam %20'ye düşüyor, ekran parlaklığını kısınca biraz uzuyor."*
Ölçülebilir bir gözlem ve bir koşul aktarıyor.

**N4 — sınır durum.** *"Ucuz ama kulaklık kablosu ince, dikkatli kullanmak gerek."*
Yalnızca 48 karakter. Kısa olmasına rağmen bir değerlendirme **ve** gerekçesi
var. → **Nitelikli.**

**N5 — sınır durum.** *"Bende çalışmadı, iade ettim."*
Çok kısa ve ayrıntı yok. Ama bir sonuç (çalışmadı) ve bir eylem (iade) aktarıyor;
okuyan biri bundan bir şey öğreniyor. → **Nitelikli.**

### Düşük çabalı

**D1.** *"Çok güzel 👍"*
Tepki var, içerik yok. Neyin güzel olduğu, neden güzel olduğu yok.

**D2.** *"aaaaaaa bu ne ya aaaaaa"*
Anlamsız karakter tekrarı.

**D3.** *"Herkese iyi günler dilerim, hayırlı işler, kolay gelsin, bol kazançlar."*
Uzun; ama tamamı hazır kalıp. Hiçbir bilgi aktarmıyor. → Uzunluk kurtarmaz.

**D4 — sınır durum.** *"Ürün elime ulaştı."*
Bir olay bildiriyor ama okuyan biri hiçbir şey öğrenmiyor: ürün nasıl, ne zaman,
sorun var mı — hiçbiri yok. Yalnızca bir durum bildirimi. → **Düşük çabalı.**

**D5 — sınır durum.** *"İyi ürün iyi fiyat iyi kargo iyi satıcı."*
Dört ayrı boyuta değiniyor gibi görünüyor ama hepsi aynı içeriksiz sıfatın
tekrarı. Hiçbirine gerekçe yok. → **Düşük çabalı.**

> N5 ile D4'ü karşılaştırın: ikisi de çok kısa ve olay bildiriyor. Fark, N5'in
> bir **sonuç** (çalışmadı) taşıması, D4'ün yalnızca bir **durum** bildirmesidir.
> Bu ayrım kılavuzun en kritik noktasıdır.

## Çalışma düzeni

1. **Kılavuzu okuyun.** Özellikle sınır durum örneklerini.
2. **Pilot: 100 kayıt.** İki etiketleyici aynı 100 kaydı bağımsız etiketler.
3. **Kappa kontrolü.** `scripts/agreement.py` çalıştırılır. **Kappa ≥ 0,70** ise
   toplu işe geçilir. Altındaysa uyuşmazlıklar birlikte incelenir, kılavuza örnek
   eklenir ve pilot yeni 100 kayıtla tekrarlanır.
4. **Toplu iş.** 200'lük gruplar hâlinde. `--limit 200` ile oturum sınırlanabilir.
5. **Uzlaşma.** Etiketleme bitince kappa yeniden hesaplanır, uyuşmazlıklar üçüncü
   değerlendiriciye gider.

## Uyulması gerekenler

- **Diğer etiketleyiciyle metin üzerinde konuşmayın.** Bağımsızlık ölçümün
  geçerliliğidir; konuşulursa kappa anlamını yitirir. Pilot sonrası kılavuz
  tartışması serbesttir, tek tek kayıtlar değil.
- **Kaynak kümedeki etiketleri aramayın.** Metinler ham alınır; kaynağın
  "olumlu/olumsuz" etiketi bu görevle ilgisizdir ve yanıltır.
- **Hız için doğruluktan ödün vermeyin.** Kayıt başına 5–10 saniye normaldir.
  Sürekli 3 saniyenin altına inildiğinde kalite düşer.
- **Ara verin.** Kesintisiz 45 dakikadan sonra tutarlılık belirgin biçimde düşer.

## Etiket dağılımı sapma yaparsa

Hedef 1.000 nitelikli / 1.000 düşük çabalı. Etiketleme sonunda dağılım sapmışsa
**veri kırpılmaz.** Gerçek dağılım raporlanır ve metrikler sınıf dengesizliği
dikkate alınarak sunulur. Dengeyi tutturmak için kayıt silmek veya etiket
değiştirmek veri bütünlüğü ihlalidir.
