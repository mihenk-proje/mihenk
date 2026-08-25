# Görsel Varlık Kayıtları

Prototipte kullanılan her görselin kaynağı, lisansı ve izin durumu burada kayıtlıdır.
Yeni görsel eklendiğinde bu dosyaya satır eklenmesi zorunludur.

## Kullanım ilkeleri

1. **Ödüllendirilen gönderilerde dış kaynaklı görsel kullanılmaz.** MİHENK'in iddiası
   "başkasının içeriğini kendininmiş gibi paylaşanı yakalıyorum" olduğu için, sistemin
   "Doğrulandı · jeton kazandı" dediği bir gönderide dış kaynaklı fotoğraf bulunması bu
   iddiayla çelişir. Bu gönderiler yalnızca kod ile üretilmiş prosedürel görseller,
   CC0 görseller veya ekibin kendi ürettiği içerik kullanır.
2. **Arayüz kabuğunda kurumsal marka varlığı kullanılmaz.** Logo, amblem ve kurumsal renk
   paleti üst çubuk, cüzdan, mağaza gibi arayüz bileşenlerine girmez. Dış kaynaklı
   görseller yalnızca gönderi içeriği olarak görünür.
3. **Her görselin `alt` metni yazılır.** Erişilebilirlik denetimi 100/100 korunmalıdır.

## Etkinlik fotoğrafları

Aşağıdaki beş fotoğraf TEKNOFEST etkinliklerinden alınmıştır. Kullanım için T3 Vakfı ile
görüşülmüş ve onay alınmıştır (onay ekip tarafından alınmış olup, bu depoya bilgi olarak
işlenmiştir).

| Dosya | İçerik | Kaynak | Lisans / izin | İzin tarihi |
|---|---|---|---|---|
| `public/seed/etkinlik-yuzme-yarisi.webp` | Rıhtımda yüzme yarışı, arkada gemi | TEKNOFEST resmî site | T3 Vakfı sözlü onayı | 2026-08 |
| `public/seed/etkinlik-rihtim-gemiler.webp` | Rıhtımda gemiler ve ziyaretçi kalabalığı | TEKNOFEST resmî site | T3 Vakfı sözlü onayı | 2026-08 |
| `public/seed/etkinlik-sahne-acilis.webp` | Açılış sahnesi ve ekran görselleri | TEKNOFEST resmî site | T3 Vakfı sözlü onayı | 2026-08 |
| `public/seed/etkinlik-odul-toreni.webp` | Ödül töreni sahnesi | TEKNOFEST resmî site | T3 Vakfı sözlü onayı | 2026-08 |
| `public/seed/etkinlik-kursu-konusma.webp` | Kürsüde konuşma | TEKNOFEST resmî site | T3 Vakfı sözlü onayı | 2026-08 |

> **Ekip tarafından tamamlanacak:** Yukarıdaki `Kaynak` sütunu her görselin doğrudan
> yayın URL'siyle, `İzin tarihi` sütunu ise onayın alındığı kesin tarihle güncellenmelidir.
> Yazışma varsa referansı da eklenmelidir. Bu satırlar ekipten gelen bilgiye dayanılarak
> yazılmış olup depo içinden doğrulanmamıştır.

**İşleme:** Özgün dosyalar 1600 piksel genişliğinde JPEG idi. Akışta en fazla iki sütun
genişliğinde gösterildikleri için 1200 piksele indirildi ve WebP'ye çevrildi
(toplam 2,3 MB → 0,7 MB). Görsel içerik değiştirilmedi; kırpma veya rötuş uygulanmadı.

## Kod ile üretilen görseller

Aşağıdaki görseller depodaki betiklerle üretilir, dış kaynak içermez ve telif taşımaz.
Üretimleri deterministiktir (`--seed` parametresi).

| Üretici | Kullanım | Lisans |
|---|---|---|
| `scripts/gen_procedural_images.py` | Ödüllendirilen gönderilerin görselleri (devre deseni, topografya, ızgara) | Bu deponun MIT lisansı |
| `scripts/gen_image_variants.py` | Algısal hash eşleşmesi örneği (kırpma, filtre, sıkıştırma) | Türetildiği görselin lisansına tabidir |
| `scripts/gen_lowquality_images.py` | Düşük çaba görsel örnekleri (bulanık, tek renk, gürültülü) | Bu deponun MIT lisansı |

## Arayüz simgeleri

| Varlık | Kaynak | Lisans |
|---|---|---|
| Arayüz simgeleri | [lucide-react](https://lucide.dev) | ISC |
| Bricolage Grotesque, Manrope, IBM Plex Mono | Google Fonts | SIL Open Font License 1.1 |
