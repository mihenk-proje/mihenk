/*
  DEMO SEED İÇERİĞİ — ÖLÇÜM KÜMESİ DEĞİLDİR.

  Buradaki gönderiler yalnızca arayüz demosu içindir. `data/` altındaki
  etiketlenmiş ölçüm kümesine ASLA karışmaz ve hiçbir metriğe girmez.
  İki kümenin karışması, raporda taahhüt edilen "test kümesi sürecin hiçbir
  aşamasına girmez" ilkesini ihlal eder.

  DOĞRULAMA ALANLARI ELLE YAZILMAZ. Her gönderi `dogrulamaDurumu: 'bekliyor'`
  ile başlar; durum, skor, kazanılan jeton ve gerekçe uygulama açılışında
  doğrulama motorunun gerçek çıktısından gelir. Bu iki şeyi sağlar:
    1. Depoya bakan biri seed verisinde sabitlenmiş bir "kopya" alanı görmez;
       kopya, Jaccard hesabının sonucudur.
    2. Akış önce boyanır, doğrulama sonuçları sonradan belirir — raporun
       Şekil 3'teki Akış A tasarımının birebir karşılığı: "kullanıcı
       gönderisini paylaştığı anda içerik akışta görünür, doğrulama
       sonucunu beklemez".
*/
import type { AppState, Gonderi, HareketKaydi, Urun, Yazar } from './types'

export const demoMagaza: Urun[] = [
  { id: 'u1', ad: 'Pirinç Çerçeve', aciklama: 'Profil fotoğrafın için pirinç renginde zarif bir çerçeve.', kategori: 'sureli', fiyat: 15, sureGun: 1, efekt: { tur: 'cerceve', deger: 'pirinc' } },
  { id: 'u2', ad: 'Mika Ad', aciklama: 'Kullanıcı adını 24 saatliğine mika parlaklığıyla öne çıkar.', kategori: 'sureli', fiyat: 20, sureGun: 1, efekt: { tur: 'adRengi', deger: 'mika' } },
  { id: 'u2b', ad: 'Kuvars Rozet', aciklama: 'Adının yanında 24 saat kuvars rozeti taşı.', kategori: 'sureli', fiyat: 25, sureGun: 1, efekt: { tur: 'rozet', deger: 'kuvars' } },
  { id: 'u2c', ad: 'Tunç Kenar', aciklama: 'Profiline 24 saatliğine tunç renkli bir vurgu ekle.', kategori: 'sureli', fiyat: 30, sureGun: 1, efekt: { tur: 'cerceve', deger: 'tunc' } },

  { id: 'u3', ad: 'Somaki Tema', aciklama: 'Profiline 30 gün boyunca somaki taşı dokusu kat.', kategori: 'sezonluk', fiyat: 150, sureGun: 30, efekt: { tur: 'tema', deger: 'somaki' } },
  { id: 'u4', ad: 'Gümüş Nişan', aciklama: 'Adının yanında parlayan bir gümüş nişan.', kategori: 'sezonluk', fiyat: 200, sureGun: 30, efekt: { tur: 'rozet', deger: 'gumus' } },
  { id: 'u4b', ad: 'Bazalt Arkaplan', aciklama: 'Gönderilerin için 30 günlük özel bazalt dokusu.', kategori: 'sezonluk', fiyat: 250, sureGun: 30, efekt: { tur: 'tema', deger: 'bazalt' } },
  { id: 'u4c', ad: 'Ametist Çerçeve', aciklama: '30 günlük mor ışıltılı ametist çerçeve.', kategori: 'sezonluk', fiyat: 300, sureGun: 30, efekt: { tur: 'cerceve', deger: 'ametist' } },

  { id: 'u5', ad: 'Altın Çerçeve', aciklama: 'Kalıcı ve prestijli altın çerçeve.', kategori: 'kalici', fiyat: 800, sureGun: null, efekt: { tur: 'cerceve', deger: 'altin' } },
  { id: 'u6', ad: 'Külçe Nişanı', aciklama: 'Kalıcı topluluk külçe rozeti.', kategori: 'kalici', fiyat: 1200, sureGun: null, efekt: { tur: 'rozet', deger: 'kulce' } },
  { id: 'u6b', ad: 'Mermer Zemin', aciklama: 'Kalıcı mermer desenli tema.', kategori: 'kalici', fiyat: 1000, sureGun: null, efekt: { tur: 'tema', deger: 'mermer' } },
  { id: 'u6c', ad: 'Ayar Rozeti', aciklama: 'Tam ayar saf içerik üreticisi rozeti.', kategori: 'kalici', fiyat: 1500, sureGun: null, efekt: { tur: 'rozet', deger: 'ayar' } },

  { id: 'u7', ad: 'Geniş Karakter', aciklama: '30 gün boyunca 1000 karakterlik gönderi paylaş.', kategori: 'islevsel', fiyat: 50, sureGun: 30, efekt: { tur: 'islev', deger: 'uzun_gonderi' } },
  { id: 'u8', ad: 'Geniş Anket', aciklama: '30 gün boyunca 6 seçenekli anketler aç.', kategori: 'islevsel', fiyat: 80, sureGun: 30, efekt: { tur: 'islev', deger: 'gelismis_anket' } },
]

export const BEN_ID = 'ahmet_yilmaz'

/*
  Avatar tonları elle atanır. Karma yedi kullanıcıda bile çakışabiliyor
  (on renkli palette Kaan ile Elif aynı kovaya düşüyordu) ve hakem
  kullanıcıları ayırt edemez.

  Kozmetikler jeton kazanmış yazarlara dağıtılır: ürünü almış olmaları mantıklı
  görünsün. Kopya paylaşan (Burak) ve düşük çabalı içerik paylaşan (Elif)
  kullanıcılar kozmetiksiz kalır — kontrast bilinçlidir.

  Kimlikler mağaza kataloğundaki gerçek ürünlerdir; hakem akışta gördüğü her
  kozmetiği mağazada bulabilir.
*/
export const demoYazarlar: Yazar[] = [
  // g06 (+5) ve g11 (+10) kazandı
  { id: 'kaan_demir', adSoyad: 'Kaan Demir', kullaniciAdi: 'kaandemir', avatarHarfleri: 'KD', avatarTonu: 'cinko',
    kozmetikler: ['u2b'] }, // Kuvars Rozet (25)
  // g08 (+10), akışın en çok etkileşim alan gönderisi
  { id: 'ayse_kaya', adSoyad: 'Ayşe Kaya', kullaniciAdi: 'aysekaya', avatarHarfleri: 'AK', avatarTonu: 'mor',
    kozmetikler: ['u4c'] }, // Ametist Çerçeve (300)
  // kopya paylaştı, kozmetiksiz
  { id: 'burak_yilmaz', adSoyad: 'Burak Yılmaz', kullaniciAdi: 'burakyilmaz', avatarHarfleri: 'BY', avatarTonu: 'tugla' },
  // g12 (+10)
  { id: 'zeynep_sahin', adSoyad: 'Zeynep Şahin', kullaniciAdi: 'zeynepsahin', avatarHarfleri: 'ZŞ', avatarTonu: 'camyesili',
    kozmetikler: ['u2'] }, // Mika Ad (20)
  // düşük çabalı içerik paylaştı, kozmetiksiz
  { id: 'elif_celik', adSoyad: 'Elif Çelik', kullaniciAdi: 'elifcelik', avatarHarfleri: 'EÇ', avatarTonu: 'toprak' },
  // g05 (+10)
  { id: 'mert_yildiz', adSoyad: 'Mert Yıldız', kullaniciAdi: 'mertyildiz', avatarHarfleri: 'MY', avatarTonu: 'zeytin',
    kozmetikler: ['u2c'] }, // Tunç Kenar (30)
]

export const demoHareketler: HareketKaydi[] = [
  {
    id: 'h1',
    zaman: new Date(Date.now() - 86_400_000 * 5).toISOString(),
    aciklama: 'Demo başlangıç bakiyesi',
    miktar: 120,
    tur: 'demo',
  },
]

/** Kopya ve benzerlik senaryolarının kaynak metni (g08). */
const KAYNAK_METIN =
  'Roket motorunun ikinci ateşleme denemesinde basınç eğrisi beklenenden yumuşak çıktı, yakıt akışını yeniden ayarladık ve üçüncü denemede tepe basıncı hedefe oturdu.'

/** Doğrulama alanları hariç her şey; kalanı motor dolduracak. */
type SeedGonderi = Omit<
  Gonderi,
  'dogrulamaDurumu' | 'dogrulamaSkoru' | 'kazanilanJeton' | 'gerekce' | 'metinParcalari' | 'gorselHash'
>

/*
  Gönderi zamanları birkaç güne yayılır. Hepsi aynı güne toplanırsa günlük
  üst sınır (50 jeton) tek seferde dolar ve akıştaki gönderilerin çoğu
  "0 jeton" görünür; kazanım kademesi demoda görünmez olur.
*/
const sa = (n: number) => new Date(Date.now() - 3_600_000 * n).toISOString()

const temel = {
  yorumSayisi: 0,
  yenidenPaylasimSayisi: 0,
  roketSayisi: 0,
  izlenimSayisi: 0,
  yzBeyani: false,
  gorselUrl: null,
  anketSecenekleri: null,
  itirazDurumu: 'yok' as const,
}

/* Akış sırası: en yeni üstte. Kopya gönderiler kaynaklarının üstünde durur
   ki hakem önce tespiti görsün, bağlantıyla kaynağa insin. */
const seed: SeedGonderi[] = [
  // 1 — BİREBİR KOPYA (metin). g08'in aynısı.
  { ...temel, id: 'g01', yazarId: 'burak_yilmaz', tur: 'metin', metin: KAYNAK_METIN, olusturmaZamani: sa(1),
    yorumSayisi: 1, izlenimSayisi: 96 },

  // 2 — ETKİNLİK GÖNDERİSİ. İlk ekranda kopya tespitiyle birlikte gerçek bir
  //     etkinlik görseli görünsün diye akışın başına alındı.
  { ...temel, id: 'g10', yazarId: BEN_ID, tur: 'metinGorsel',
    metin: 'Deniz araçları yarışmasının eleme turunu izledik. Parkuru en hızlı tamamlayan takım, gövde direncini düşürmek için burun profilini baştan çizmiş.',
    gorselUrl: '/seed/etkinlik-yuzme-yarisi.webp', olusturmaZamani: sa(2), yorumSayisi: 5, roketSayisi: 22, izlenimSayisi: 604 },

  // 3 — GÖRSEL DÖNÜŞÜMÜ. g03'ün görselinin filtreli hâli.
  //     Kopya, kaynağından YENİ olmalı: doğrulama eskiden yeniye çalışır,
  //     kaynak önce işlenip parmak izini bırakmazsa eşleşme bulunamaz.
  { ...temel, id: 'g02', yazarId: 'zeynep_sahin', tur: 'metinGorsel',
    metin: 'Kart yerleşimi için bir örnek. Güç ve sinyal katmanlarının ayrılması bu çizimde net görünüyor.',
    gorselUrl: '/seed/uretim-devre--filtre.webp', olusturmaZamani: sa(3), izlenimSayisi: 74 },

  // 4 — DOĞRULANDI + görsel. Prosedürel görsel: A3.1 gereği ödüllendirilen
  //     gönderide dış kaynaklı fotoğraf kullanılmaz. g02'nin kaynağı.
  { ...temel, id: 'g03', yazarId: BEN_ID, tur: 'metinGorsel',
    metin: 'Uçuş kontrol kartının ikinci revizyonunu çizdim. Güç hattını sinyal katmanından ayırdım, telemetri hattındaki gürültü belirgin biçimde azaldı.',
    gorselUrl: '/seed/uretim-devre.webp', olusturmaZamani: sa(4), yorumSayisi: 4, roketSayisi: 19, izlenimSayisi: 412 },

  // 5 — DÜŞÜK ÇABALI METİN. 15 karakter altı sert taban.
  { ...temel, id: 'g04', yazarId: 'elif_celik', tur: 'metin', metin: 'Süper.',
    olusturmaZamani: sa(5), izlenimSayisi: 31 },

  // 6 — YZ DESTEKLİ + DOĞRULANDI. Beyan eden tam jeton alır, kesinti yoktur.
  { ...temel, id: 'g05', yazarId: 'mert_yildiz', tur: 'metin', yzBeyani: true,
    metin: 'Sürü İHA senaryosunda çarpışma önleme mantığını yeniden yazarken bir dil modelinden taslak aldım, sonra kendi telemetri verimizle baştan doğruladım. Ham taslak dört köşe durumda hatalıydı.',
    olusturmaZamani: sa(6), yorumSayisi: 7, roketSayisi: 24, izlenimSayisi: 538 },

  // 7 — BENZERLİK UYARI BANDI. g08 ile kısmi örtüşme; kopya değil, kazanç azaltılır.
  { ...temel, id: 'g06', yazarId: 'kaan_demir', tur: 'metin',
    metin: 'Roket motorunun ikinci ateşleme denemesinde basınç eğrisi beklenenden yumuşak seyretti; bu kez yakıt hattındaki basınç düşüşünü ayrı bir sensörle ölçtük.',
    olusturmaZamani: sa(7), yorumSayisi: 2, roketSayisi: 8, izlenimSayisi: 154 },

  // 8 — DÜŞÜK ÇABA GÖRSEL. Üretilmiş bulanık görsel.
  { ...temel, id: 'g07', yazarId: 'ayse_kaya', tur: 'metinGorsel',
    metin: 'Atölyeden bir kare paylaşıyorum, ayrıntı pek seçilmiyor ama ortam buydu.',
    gorselUrl: '/seed/dusuk-caba-bulanik.webp', olusturmaZamani: sa(8), izlenimSayisi: 58 },

  // 9 — DOĞRULANDI, uzun teknik metin. g01 ve g06'nın kaynağı.
  { ...temel, id: 'g08', yazarId: 'ayse_kaya', tur: 'metin', metin: KAYNAK_METIN,
    olusturmaZamani: sa(26), yorumSayisi: 11, roketSayisi: 47, izlenimSayisi: 912 },

  // 10 — ANKET.
  { ...temel, id: 'g09', yazarId: BEN_ID, tur: 'anket',
    metin: 'Takımda hangi alt sistemin doğrulaması en çok vakit alıyor? Kendi deneyiminizi merak ediyorum.',
    anketSecenekleri: ['Uçuş kontrol yazılımı', 'Güç dağıtımı', 'Haberleşme bağlantısı', 'Mekanik montaj'],
    olusturmaZamani: sa(30), yorumSayisi: 19, roketSayisi: 31, izlenimSayisi: 1240 },

  // 11-12 — Etkinlik gönderileri.

  { ...temel, id: 'g11', yazarId: 'kaan_demir', tur: 'metinGorsel',
    metin: 'Rıhtımda sergilenen araçları yakından görme fırsatı oldu. Sensör yerleşimleri ve kablo kanalları beklediğimden çok daha derli topluydu.',
    gorselUrl: '/seed/etkinlik-rihtim-gemiler.webp', olusturmaZamani: sa(50), yorumSayisi: 3, roketSayisi: 14, izlenimSayisi: 388 },

  { ...temel, id: 'g12', yazarId: 'zeynep_sahin', tur: 'metinGorsel',
    metin: 'Ödül töreninde kazanan takımların sunumlarını dinledik. Çoğu, ölçüm altyapısını yarışmadan aylar önce kurmuş olmayı belirleyici saymış.',
    gorselUrl: '/seed/etkinlik-odul-toreni.webp', olusturmaZamani: sa(54), yorumSayisi: 6, roketSayisi: 18, izlenimSayisi: 452 },
]

export const demoGonderiler: Gonderi[] = seed.map((g) => ({
  ...g,
  dogrulamaDurumu: 'bekliyor',
  dogrulamaSkoru: null,
  kazanilanJeton: 0,
  gerekce: [],
  metinParcalari: null,
  gorselHash: null,
}))

/**
 * Seed içeriğinin parmak izi (FNV-1a, 32 bit).
 *
 * Elle güncellenen bir sürüm numarası yerine içerikten türetilir: gönderi
 * metni, görseli, anket seçenekleri veya mağaza kataloğu değiştiğinde
 * kendiliğinden değişir, sürümü yükseltmeyi unutmak mümkün olmaz.
 *
 * Zaman damgaları hesaba katılmaz; onlar her yüklemede yeniden üretilir
 * ve dahil edilseler parmak izi her açılışta değişirdi.
 */
function parmakIzi(gonderiler: Gonderi[], magaza: Urun[], yazarlar: Yazar[]): string {
  const ozet =
    gonderiler
      .map((g) =>
        [g.id, g.yazarId, g.tur, g.metin, g.gorselUrl ?? '', (g.anketSecenekleri ?? []).join('|')].join(
          '\u0001'
        )
      )
      .join('\u0002') +
    '\u0003' +
    magaza.map((u) => [u.id, u.ad, u.fiyat, String(u.sureGun)].join('\u0001')).join('\u0002') +
    '\u0003' +
    yazarlar.map((y) => [y.id, y.adSoyad, (y.kozmetikler ?? []).join('|')].join('\u0001')).join('\u0002')

  let h = 0x811c9dc5
  for (let i = 0; i < ozet.length; i++) {
    h ^= ozet.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export const SEED_SURUMU = parmakIzi(demoGonderiler, demoMagaza, demoYazarlar)

export function varsayilanDurum(): AppState {
  return structuredClone({
    seedSurumu: SEED_SURUMU,
    kullanici: {
      id: BEN_ID,
      kullaniciAdi: 'ahmetyilmaz',
      adSoyad: 'Ahmet Yılmaz',
      avatarHarfleri: 'AY',
      avatarTonu: 'kiremit',
      jetonBakiyesi: 120,
      bugunKazanilan: 0,
      // Demo açılışında envanter boş görünmesin: mağaza akışının çalıştığı
      // görünsün diye bir süreli ürün satın alınmış durumda başlar.
      envanter: [
        { urunId: 'u1', satinAlmaZamani: new Date(Date.now() - 3_600_000 * 4).toISOString(), aktif: true },
      ],
      hesapOlusturmaTarihi: new Date(Date.now() - 86_400_000 * 30).toISOString(),
    },
    yazarlar: demoYazarlar,
    gonderiler: demoGonderiler,
    hareketler: demoHareketler,
    magaza: demoMagaza,
  })
}
