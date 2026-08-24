import { AppState, Gonderi, Urun, HareketKaydi } from './types'

export const demoMagaza: Urun[] = [
  // Süreli (15-30)
  { id: 'u1', ad: 'Pirinç Çerçeve', aciklama: 'Profil fotoğrafın için pirinç renginde zarif bir çerçeve.', kategori: 'sureli', fiyat: 15, sureGun: 1, efekt: { tur: 'cerceve', deger: 'pirinc' } },
  { id: 'u2', ad: 'Mika Ad', aciklama: 'Kullanıcı adını 24 saatliğine mika parlaklığıyla öne çıkar.', kategori: 'sureli', fiyat: 20, sureGun: 1, efekt: { tur: 'adRengi', deger: 'mika' } },
  { id: 'u2b', ad: 'Kuvars Rozet', aciklama: 'Adının yanında 24 saat kuvars rozeti taşı.', kategori: 'sureli', fiyat: 25, sureGun: 1, efekt: { tur: 'rozet', deger: 'kuvars' } },
  { id: 'u2c', ad: 'Tunç Kenar', aciklama: 'Profiline 24 saatliğine tunç renkli bir vurgu ekle.', kategori: 'sureli', fiyat: 30, sureGun: 1, efekt: { tur: 'cerceve', deger: 'tunc' } },
  
  // Sezonluk (150-300)
  { id: 'u3', ad: 'Somaki Tema', aciklama: 'Profiline 30 gün boyunca somaki taşı dokusu kat.', kategori: 'sezonluk', fiyat: 150, sureGun: 30, efekt: { tur: 'tema', deger: 'somaki' } },
  { id: 'u4', ad: 'Gümüş Nişan', aciklama: 'Adının yanında parlayan bir gümüş nişan.', kategori: 'sezonluk', fiyat: 200, sureGun: 30, efekt: { tur: 'rozet', deger: 'gumus' } },
  { id: 'u4b', ad: 'Bazalt Arkaplan', aciklama: 'Gönderilerin için 30 günlük özel bazalt dokusu.', kategori: 'sezonluk', fiyat: 250, sureGun: 30, efekt: { tur: 'tema', deger: 'bazalt_bg' } },
  { id: 'u4c', ad: 'Ametist Çerçeve', aciklama: '30 günlük mor ışıltılı ametist çerçeve.', kategori: 'sezonluk', fiyat: 300, sureGun: 30, efekt: { tur: 'cerceve', deger: 'ametist' } },

  // Kalıcı (500-1500)
  { id: 'u5', ad: 'Altın Çerçeve', aciklama: 'Kalıcı ve prestijli altın çerçeve.', kategori: 'kalici', fiyat: 800, sureGun: null, efekt: { tur: 'cerceve', deger: 'altin' } },
  { id: 'u6', ad: 'Külçe Nişanı', aciklama: 'Kalıcı topluluk külçe rozeti.', kategori: 'kalici', fiyat: 1200, sureGun: null, efekt: { tur: 'rozet', deger: 'kulce' } },
  { id: 'u6b', ad: 'Mermer Zemin', aciklama: 'Kalıcı mermer desenli tema.', kategori: 'kalici', fiyat: 1000, sureGun: null, efekt: { tur: 'tema', deger: 'mermer' } },
  { id: 'u6c', ad: 'Ayar Rozeti', aciklama: 'Tam ayar saf içerik üreticisi rozeti.', kategori: 'kalici', fiyat: 1500, sureGun: null, efekt: { tur: 'rozet', deger: 'ayar' } },

  // İşlevsel (20-100)
  { id: 'u7', ad: 'Geniş Karakter', aciklama: '30 gün boyunca 1000 karakterlik gönderi paylaş.', kategori: 'islevsel', fiyat: 50, sureGun: 30, efekt: { tur: 'islev', deger: 'uzun_gonderi' } },
  { id: 'u8', ad: 'Geniş Anket', aciklama: '30 gün boyunca 8 seçenekli anketler aç.', kategori: 'islevsel', fiyat: 80, sureGun: 30, efekt: { tur: 'islev', deger: 'gelismis_anket' } },
  { id: 'u8b', ad: 'İleri Zaman', aciklama: '30 gün boyunca gönderilerini zamanla.', kategori: 'islevsel', fiyat: 40, sureGun: 30, efekt: { tur: 'islev', deger: 'zamanlanmis' } },
  { id: 'u8c', ad: 'Düzeltme Süresi', aciklama: '30 gün boyunca gönderi düzenleme süresini uzat.', kategori: 'islevsel', fiyat: 100, sureGun: 30, efekt: { tur: 'islev', deger: 'duzeltme_uzat' } },
]

export const demoHareketler: HareketKaydi[] = [
  { id: 'h1', zaman: new Date(Date.now() - 86400000 * 5).toISOString(), aciklama: 'Hoş geldin hediyesi', miktar: 120 }, // İ5: 120 initial
]

export const demoGonderiler: Gonderi[] = [
  {
    id: 'g1',
    yazarId: 'Kaan Demir',
    tur: 'metin',
    metin: 'Yapay zeka araçlarını günlük iş akışına entegre etmek inanılmaz bir zaman tasarrufu sağlıyor.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 24).toISOString(),
    yzBeyani: true,
    yorumSayisi: 5,
    yenidenPaylasimSayisi: 2,
    roketSayisi: 28,
    izlenimSayisi: 530,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 92,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    metinParcalari: ['yapay', 'zekaa', 'araçl', 'günlü', 'enteg', 'inani', 'tasar'],
    gorselHash: null
  },
  {
    id: 'g2',
    yazarId: 'Ayşe Kaya',
    tur: 'metin',
    metin: 'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 48).toISOString(), 
    yzBeyani: false,
    yorumSayisi: 8,
    yenidenPaylasimSayisi: 1,
    roketSayisi: 45,
    izlenimSayisi: 890,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 75,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    metinParcalari: ['buhaft', 'sonud', 'inlen', 'ayira', 'yoruc', 'hafta'],
    gorselHash: null
  },
  {
    // Kopya tespit demosu
    id: 'g3',
    yazarId: 'Burak Yılmaz',
    tur: 'metin',
    metin: 'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 8).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 120,
    dogrulamaDurumu: 'gecemedi',
    dogrulamaSkoru: 0,
    kazanilanJeton: 0,
    gerekce: ['Bu metin daha önce paylaşılmış bir gönderiyle büyük ölçüde örtüşüyor.'],
    metinParcalari: ['buhaft', 'sonud', 'inlen', 'ayira', 'yoruc', 'hafta'],
    gorselHash: null
  },
  {
    id: 'g4',
    yazarId: 'Zeynep Şahin',
    tur: 'metin',
    metin: 'Bugün harika bir kahve keşfettim. Bazen küçük detaylar tüm günü güzelleştirebiliyor.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 5).toISOString(),
    yzBeyani: false,
    yorumSayisi: 3,
    yenidenPaylasimSayisi: 1,
    roketSayisi: 12,
    izlenimSayisi: 245,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 85,
    kazanilanJeton: 10,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    metinParcalari: ['bugün', 'harik', 'kahve', 'keşfe', 'bazen', 'küçük', 'detay'],
    gorselHash: null
  },
  {
    id: 'g5',
    yazarId: 'Kaan Demir',
    tur: 'metin',
    metin: 'a a a a a b b b b b c c c c c',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 3).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 12,
    dogrulamaDurumu: 'gecemedi',
    dogrulamaSkoru: 15,
    kazanilanJeton: 0,
    gerekce: ['İçerik niteliği düşük: Anlamsız tekrar tespit edildi.'],
    metinParcalari: ['aaaaa', 'bbbbb', 'ccccc'],
    gorselHash: null
  },
  {
    id: 'g6',
    yazarId: 'Elif Çelik',
    tur: 'metin',
    metin: 'Sürekli öğrenmek, gelişimin en temel anahtarıdır.',
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 1800000).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 0,
    dogrulamaDurumu: 'kismi',
    dogrulamaSkoru: 55,
    kazanilanJeton: 5,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Uzunluk: Sınırda'],
    metinParcalari: ['sürek', 'öğren', 'geliş', 'temel', 'anaht'],
    gorselHash: null
  },
  {
    id: 'g7',
    yazarId: 'Ahmet Yılmaz', // The current user
    tur: 'metinGorsel',
    metin: 'Yeni çalışma masamın düzeni. Nihayet kablolardan kurtuldum!',
    gorselUrl: 'https://picsum.photos/seed/desk/600/400',
    anketSecenekleri: null,
    olusturmaZamani: new Date(Date.now() - 3600000 * 1).toISOString(),
    yzBeyani: false,
    yorumSayisi: 0,
    yenidenPaylasimSayisi: 0,
    roketSayisi: 0,
    izlenimSayisi: 0,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 88,
    kazanilanJeton: 12,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Görsel kalite: İyi'],
    metinParcalari: ['yenic', 'çaliş', 'masam', 'düzen', 'nihay', 'kablo', 'kurtu'],
    gorselHash: 'a1b2c3d4'
  },
  {
    id: 'g8',
    yazarId: 'Mert Yıldız',
    tur: 'anket',
    metin: 'Sizce bir sonraki büyük teknolojik devrim hangi alanda olacak?',
    gorselUrl: null,
    anketSecenekleri: ['Kuantum', 'Biyoteknoloji', 'Uzay'],
    olusturmaZamani: new Date(Date.now() - 3600000 * 2).toISOString(),
    yzBeyani: false,
    yorumSayisi: 24,
    yenidenPaylasimSayisi: 5,
    roketSayisi: 65,
    izlenimSayisi: 2100,
    dogrulamaDurumu: 'gecti',
    dogrulamaSkoru: 82,
    kazanilanJeton: 6,
    gerekce: ['Özgünlük: Bu içeriğe daha önce rastlanmadı', 'Anlatım zenginliği: Yeterli'],
    metinParcalari: ['sizce', 'sonra', 'büyük', 'tekno', 'devri', 'hangi', 'aland'],
    gorselHash: null
  }
]

export const defaultState: AppState = {
  kullanici: {
    id: 'Ahmet Yılmaz', // So the yazarAdi matches
    kullaniciAdi: 'Ahmet Yılmaz',
    avatarUrl: 'AY', // Use initials
    jetonBakiyesi: 120, // Calculated dynamically but set initial
    bugunKazanilan: 0,
    envanter: [],
    hesapOlusturmaTarihi: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  gonderiler: demoGonderiler,
  hareketler: demoHareketler,
  magaza: demoMagaza
}
