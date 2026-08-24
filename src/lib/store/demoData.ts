import { parcalaraAyir } from '@/lib/verification'
import type { AppState, Gonderi, HareketKaydi, Urun, Yazar } from './types'

export const demoMagaza: Urun[] = [
  // Süreli (15-30) — 24 saat
  { id: 'u1', ad: 'Pirinç Çerçeve', aciklama: 'Profil fotoğrafın için pirinç renginde zarif bir çerçeve.', kategori: 'sureli', fiyat: 15, sureGun: 1, efekt: { tur: 'cerceve', deger: 'pirinc' } },
  { id: 'u2', ad: 'Mika Ad', aciklama: 'Kullanıcı adını 24 saatliğine mika parlaklığıyla öne çıkar.', kategori: 'sureli', fiyat: 20, sureGun: 1, efekt: { tur: 'adRengi', deger: 'mika' } },
  { id: 'u2b', ad: 'Kuvars Rozet', aciklama: 'Adının yanında 24 saat kuvars rozeti taşı.', kategori: 'sureli', fiyat: 25, sureGun: 1, efekt: { tur: 'rozet', deger: 'kuvars' } },
  { id: 'u2c', ad: 'Tunç Kenar', aciklama: 'Profiline 24 saatliğine tunç renkli bir vurgu ekle.', kategori: 'sureli', fiyat: 30, sureGun: 1, efekt: { tur: 'cerceve', deger: 'tunc' } },

  // Sezonluk (150-300) — 30 gün
  { id: 'u3', ad: 'Somaki Tema', aciklama: 'Profiline 30 gün boyunca somaki taşı dokusu kat.', kategori: 'sezonluk', fiyat: 150, sureGun: 30, efekt: { tur: 'tema', deger: 'somaki' } },
  { id: 'u4', ad: 'Gümüş Nişan', aciklama: 'Adının yanında parlayan bir gümüş nişan.', kategori: 'sezonluk', fiyat: 200, sureGun: 30, efekt: { tur: 'rozet', deger: 'gumus' } },
  { id: 'u4b', ad: 'Bazalt Arkaplan', aciklama: 'Gönderilerin için 30 günlük özel bazalt dokusu.', kategori: 'sezonluk', fiyat: 250, sureGun: 30, efekt: { tur: 'tema', deger: 'bazalt' } },
  { id: 'u4c', ad: 'Ametist Çerçeve', aciklama: '30 günlük mor ışıltılı ametist çerçeve.', kategori: 'sezonluk', fiyat: 300, sureGun: 30, efekt: { tur: 'cerceve', deger: 'ametist' } },

  // Kalıcı (500-1500)
  { id: 'u5', ad: 'Altın Çerçeve', aciklama: 'Kalıcı ve prestijli altın çerçeve.', kategori: 'kalici', fiyat: 800, sureGun: null, efekt: { tur: 'cerceve', deger: 'altin' } },
  { id: 'u6', ad: 'Külçe Nişanı', aciklama: 'Kalıcı topluluk külçe rozeti.', kategori: 'kalici', fiyat: 1200, sureGun: null, efekt: { tur: 'rozet', deger: 'kulce' } },
  { id: 'u6b', ad: 'Mermer Zemin', aciklama: 'Kalıcı mermer desenli tema.', kategori: 'kalici', fiyat: 1000, sureGun: null, efekt: { tur: 'tema', deger: 'mermer' } },
  { id: 'u6c', ad: 'Ayar Rozeti', aciklama: 'Tam ayar saf içerik üreticisi rozeti.', kategori: 'kalici', fiyat: 1500, sureGun: null, efekt: { tur: 'rozet', deger: 'ayar' } },

  // İşlevsel (50-80) — 30 gün
  { id: 'u7', ad: 'Geniş Karakter', aciklama: '30 gün boyunca 1000 karakterlik gönderi paylaş.', kategori: 'islevsel', fiyat: 50, sureGun: 30, efekt: { tur: 'islev', deger: 'uzun_gonderi' } },
  { id: 'u8', ad: 'Geniş Anket', aciklama: '30 gün boyunca 6 seçenekli anketler aç.', kategori: 'islevsel', fiyat: 80, sureGun: 30, efekt: { tur: 'islev', deger: 'gelismis_anket' } },
]

export const BEN_ID = 'ahmet_yilmaz'

export const demoYazarlar: Yazar[] = [
  { id: 'kaan_demir', adSoyad: 'Kaan Demir', kullaniciAdi: 'kaandemir', avatarHarfleri: 'KD' },
  { id: 'ayse_kaya', adSoyad: 'Ayşe Kaya', kullaniciAdi: 'aysekaya', avatarHarfleri: 'AK' },
  { id: 'burak_yilmaz', adSoyad: 'Burak Yılmaz', kullaniciAdi: 'burakyilmaz', avatarHarfleri: 'BY' },
  { id: 'zeynep_sahin', adSoyad: 'Zeynep Şahin', kullaniciAdi: 'zeynepsahin', avatarHarfleri: 'ZŞ' },
  { id: 'elif_celik', adSoyad: 'Elif Çelik', kullaniciAdi: 'elifcelik', avatarHarfleri: 'EÇ' },
  { id: 'mert_yildiz', adSoyad: 'Mert Yıldız', kullaniciAdi: 'mertyildiz', avatarHarfleri: 'MY' },
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

/**
 * Demo gönderilerin n-gram parçaları gerçek metinden üretilir.
 * Elle yazılmış sahte parçalar kullanılırsa özgünlük karşılaştırması
 * hiçbir zaman eşleşmez ve kopya tespiti demoda çalışmaz.
 */
type HamGonderi = Omit<Gonderi, 'metinParcalari'>

const hamGonderiler: HamGonderi[] = [
  {
    id: 'g1',
    yazarId: 'kaan_demir',
    tur: 'metin',
    metin: 'Yapay zeka araçlarını günlük iş akışına entegre etmek inanılmaz bir zaman tasarrufu sağlıyor.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 24).toISOString(),
    yzBeyani: true,
    yorumSayisi: 5,
    yenidenPaylasimSayisi: 2,
    roketSayisi: 28,
    izlenimSayisi: 530,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 100,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    gorselHash: null,
  },
  {
    id: 'g2',
    yazarId: 'ayse_kaya',
    tur: 'metin',
    metin: 'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 48).toISOString(),
    yzBeyani: false,
    yorumSayisi: 8,
    yenidenPaylasimSayisi: 1,
    roketSayisi: 45,
    izlenimSayisi: 890,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 95,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    gorselHash: null,
  },
  {
    // Kopya tespiti demosu: g2 ile aynı metin
    id: 'g3',
    yazarId: 'burak_yilmaz',
    tur: 'metin',
    metin: 'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 8).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 120,
    dogrulamaDurumu: 'gecemedi',
    dogrulamaSkoru: 0,
    kazanilanJeton: 0,
    gerekce: ['Bu metin daha önce paylaşılmış bir gönderiyle %100 örtüşüyor.'],
    gorselHash: null,
  },
  {
    id: 'g4',
    yazarId: 'zeynep_sahin',
    tur: 'metin',
    metin: 'Bugün harika bir kahve keşfettim. Bazen küçük detaylar tüm günü güzelleştirebiliyor.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 5).toISOString(),
    yzBeyani: false,
    yorumSayisi: 3,
    yenidenPaylasimSayisi: 1,
    roketSayisi: 12,
    izlenimSayisi: 245,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 95,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    gorselHash: null,
  },
  {
    // Düşük nitelik demosu
    id: 'g5',
    yazarId: 'kaan_demir',
    tur: 'metin',
    metin: 'a a a a a b b b b b c c c c c',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 3).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 12,
    dogrulamaDurumu: 'gecemedi',
    dogrulamaSkoru: 0,
    kazanilanJeton: 0,
    gerekce: [
      'Uzunluk: Sınırda',
      'Kelime çeşitliliği: Düşük (tekrarlı anlatım)',
      'İçerik niteliği düşük: Anlamsız tekrar tespit edildi',
    ],
    gorselHash: null,
  },
  {
    // Kısmi geçme demosu
    id: 'g6',
    yazarId: 'elif_celik',
    tur: 'metin',
    metin: 'Kahve molası verdim şimdi.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 1_800_000).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 0,
    dogrulamaDurumu: 'kismi',
    dogrulamaSkoru: 58,
    kazanilanJeton: 5,
    gerekce: [
      'Özgünlük: Bu içeriğe daha önce rastlanmadı',
      'Uzunluk: Sınırda',
      'Anlatım: Dar (az sayıda kelime)',
    ],
    gorselHash: null,
  },
  {
    id: 'g7',
    yazarId: BEN_ID,
    tur: 'metinGorsel',
    metin: 'Yeni çalışma masamın düzeni. Nihayet kablolardan kurtuldum!',
    gorselUrl: 'https://picsum.photos/seed/mihenk-desk/800/500',
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 1).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 0,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 88,
    kazanilanJeton: 10,
    gerekce: [
      'Özgünlük: Bu içeriğe daha önce rastlanmadı',
      'Anlatım: Dar (az sayıda kelime)',
      'Görsel kalite: İyi',
    ],
    // dHash 64 bit = 16 haneli onaltılık. Kısa yazılırsa karşılaştırma hiç eşleşmez.
    gorselHash: 'f0e1c3878f1e3c78',
  },
  {
    id: 'g8',
    yazarId: 'mert_yildiz',
    tur: 'anket',
    metin: 'Sizce bir sonraki büyük teknolojik devrim hangi alanda olacak?',
    gorselUrl: null,
    anketSecenekleri: ['Kuantum bilişim', 'Biyoteknoloji', 'Uzay sanayi'],
    olusturmaZamani: new Date(Date.now() - 3_600_000 * 2).toISOString(),
    yzBeyani: false,
    yorumSayisi: 24,
    yenidenPaylasimSayisi: 5,
    roketSayisi: 65,
    izlenimSayisi: 2100,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 97,
    kazanilanJeton: 10,
    gerekce: [
      'Özgünlük: Bu içeriğe daha önce rastlanmadı',
      'Anlatım zenginliği: Yeterli',
      'Anket: Seçenekler ayırt edici',
    ],
    gorselHash: null,
  },
]

export const demoGonderiler: Gonderi[] = hamGonderiler.map((g) => ({
  ...g,
  metinParcalari: Array.from(parcalaraAyir(g.metin)),
}))

export function varsayilanDurum(): AppState {
  return structuredClone({
    kullanici: {
      id: BEN_ID,
      kullaniciAdi: 'ahmetyilmaz',
      adSoyad: 'Ahmet Yılmaz',
      avatarHarfleri: 'AY',
      // Hareket defterinden yeniden hesaplanır, buradaki değer yalnızca başlangıçtır
      jetonBakiyesi: 120,
      bugunKazanilan: 0,
      envanter: [],
      hesapOlusturmaTarihi: new Date(Date.now() - 86_400_000 * 30).toISOString(),
    },
    yazarlar: demoYazarlar,
    gonderiler: demoGonderiler,
    hareketler: demoHareketler,
    magaza: demoMagaza,
  })
}
