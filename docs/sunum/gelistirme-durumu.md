# Prototip / Uygulama Geliştirme Durumu

> Sunum için tek sayfalık metin. Görseller `ekranlar/` altında; `akis-5.png` kullanıcı
> akışını, `ekonomi-5.png` jeton ekonomisini gösterir. Koyu zeminli slayt için
> `-koyu-slayt` sonekli sürümler. Hepsi tek bir oturumda alındı; bakiye tutarlı.

## Prototip var mı?

Evet — çalışan, yayında ve telefona kurulabilen bir prototip: **mihenk-proje.vercel.app**.
Mevcut mikroblog platformu NSosyal üzerine oturan bir özellik katmanı olarak tasarlandı.
Beş doğrulama kademesi, jeton ekonomisi (41 ürün, dört kategori), kilometre taşları,
koleksiyon defteri, sponsorlu set, mağaza, profil, bildirimler ve sohbet çalışıyor.
Doğrulama mantığının tamamı istemci tarafında çalışır; hiçbir içerik dış servise gitmez.
Uygulama aşamalı web uygulaması (PWA) olarak Android'e kurulur ve **çevrimdışı çalışır**.

## Geliştirme süreci

| Aşama | Durum | Açıklama |
|---|---|---|
| **Tasarım** | Tamamlandı | İki yüzey ilkesi: ev sahibi (NSosyal) kroması nötr, MİHENK'in ürettiği değer pirinç. Ayrım CSS değişkeni kapsamıyla, bileşen sınıflarına dokunmadan. Ürün adları mineral ailesinden. |
| **Geliştirme** | Tamamlandı | Next.js 16 + TypeScript. Doğrulama motoru saf fonksiyon; yayınlama ve doğrulama ayrık, doğrulama arayüzü bloklamaz. Durum tarayıcıda, sunucusuz. |
| **Entegrasyon** | Tamamlandı | Ölçüm boru hattı çalışma zamanı kodunu doğrudan içe aktarır — algoritmanın ikinci bir kopyası yok. CI her push'ta tip, lint, test ve derleme kapılarını çalıştırır. |
| **Test** | Tamamlandı | 117 birim testi · 31 klavyeyle uçtan uca kontrol · 8 hareket kontrolü · axe-core 48 ekranda sıfır ihlal · Lighthouse canlı masaüstü 100/100/100/100, mobil 95/100/100/100. |

**Üzerinde çalışılan:** metin niteliği kademesinin insan etiketli ölçümü (iki bağımsız
etiketleyici, Cohen's κ ≥ 0,70 kapısı). Araçlar hazır, pilot etiketleme İP7'de.

## Kullanıcı akışı

Giriş → akış (nötr NSosyal kartı, yalnızca doğrulama rozeti pirinç) → gönderi paylaşımı →
doğrulama sonucu (skor, gerekçe, kazanılan jeton) → mağaza (41 ürün, satır içi önizleme) →
profil (kuşanılmış kozmetikler) → sohbet (zemin ve çıkartmalar). Beş sekmenin beşi de
gerçek bir ekrana gider.

## Arayüz kararları

- **Kullanıcı ne aldığını görür.** Her mağaza kartında etkinin görseli ve tek satırlık
  karşılığı ("Avatar çerçevesi", "Gönderi kartı kenarı").
- **Yanlış vaat yok.** Çalışmayan hiçbir düğme yok; kapsam dışı bölümler bunu söyler,
  sohbette karşı tarafın yanıt yazmadığı ekranda yazılıdır.
- **Tür başına tek slot.** Aynı türden iki kozmetik birbirini sessizce ezemez.
- **Jeton parayla satın alınamaz, paraya da dönüşmez.** Yalnızca doğrulamayı geçen
  içerikle kazanılır; günlük üst sınır çiftlik döngüsünü keser. Marka iş birliği
  sponsorlu set olarak mağazada: ürün jetonla alınır, gelir markadan gelir.
- **Birikim, seri değil.** Kilometre taşları ömürlük; kaçırılan gün hiçbir şeyi
  sıfırlamaz. Rapor günlük hedef vermemeyi ilke edindi, arayüz buna uyar.

## Erişilebilirlik yaklaşımı

Ölçülerek kuruldu, varsayılmadı. Her renk çifti WCAG AA (metin ≥ 4,5:1, arayüz
bileşeni ≥ 3:1) ile ölçüldü; kozmetik renkleri birbirinden ΔE ≥ 20 ayrık. Tam ekran
katmanlar odağı içeri alır, Escape ile kapanır ve odağı geri verir; arkadaki akış
`inert`. Karakter sayacı yalnızca eşikte duyurulur. Hareketi azaltma tercihi tüm
animasyonları keser. Her ekran, iki tema ve iki genişlikte axe-core ile denetlendi.

## Kullanıcı araştırması

Biçimsel kullanılabilirlik testi yapılmadı. Ekip içi kullanım üç tasarım kararını
değiştirdi: cüzdan ve mağazanın "başka uygulama" gibi durması melez yüzeye yol açtı;
satın alınan kozmetiğin görünmemesi profil ekranını ve satır içi önizlemeyi doğurdu;
2 piksellik halkada renklerin ayırt edilememesi kozmetik görsellerini yeniden
biçimlendirdi. Üçü de kullanıcı geri bildiriminden geldi ve ölçülerek kapatıldı.
