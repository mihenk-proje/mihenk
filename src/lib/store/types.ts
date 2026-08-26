export type EfektTuru = 'cerceve' | 'adRengi' | 'rozet' | 'tema' | 'islev'

export type Urun = {
  id: string
  ad: string
  aciklama: string
  kategori: 'sureli' | 'sezonluk' | 'kalici' | 'islevsel'
  fiyat: number
  /** null = kalıcı ürün */
  sureGun: number | null
  efekt: { tur: EfektTuru; deger: string }
}

export type SahipOlunanUrun = {
  urunId: string
  satinAlmaZamani: string
  /** Kullanıcının açık/kapalı tercihi. Süre bitimi ayrıca hesaplanır. */
  aktif: boolean
}

export type Kullanici = {
  id: string
  kullaniciAdi: string
  /** Görünen ad */
  adSoyad: string
  /** Avatar, ağ isteği gerektirmesin diye baş harflerden üretilir. */
  avatarHarfleri: string
  /** Avatar zemin tonu. Verilmezse kullanıcı adından türetilir. */
  avatarTonu?: string
  jetonBakiyesi: number
  bugunKazanilan: number
  envanter: SahipOlunanUrun[]
  hesapOlusturmaTarihi: string
}

/** Akıştaki diğer hesaplar (demo amaçlı salt-okunur) */
export type Yazar = {
  id: string
  adSoyad: string
  kullaniciAdi: string
  avatarHarfleri: string
  /** Avatar zemin tonu. Verilmezse kullanıcı adından türetilir. */
  avatarTonu?: string
  /**
   * Bu yazarın taşıdığı kozmetiklerin ürün kimlikleri. Mağaza kataloğundaki
   * gerçek ürünler olmalıdır; katalogda bulunmayan bir kozmetik gösterilirse
   * kullanıcı onu mağazada arayıp bulamaz.
   */
  kozmetikler?: string[]
}

export type GerekceSatiri = string

/**
 * 'kopya' ayrı bir durumdur, 'gecemedi'nin alt kümesi değildir:
 * geçemeyen gönderi niteliksiz bulunmuştur, kopya gönderi ise başkasının
 * içeriğiyle örtüşmüştür. Kullanıcıya gösterilen gerekçe ve arayüz
 * rozeti ikisinde farklıdır.
 */
export type DogrulamaDurumu = 'bekliyor' | 'gecti' | 'kismi' | 'gecemedi' | 'kopya'

export type Gonderi = {
  id: string
  yazarId: string
  tur: 'metin' | 'metinGorsel' | 'anket'
  metin: string
  gorselUrl: string | null
  anketSecenekleri: string[] | null
  olusturmaZamani: string
  yzBeyani: boolean
  yorumSayisi: number
  yenidenPaylasimSayisi: number
  roketSayisi: number
  izlenimSayisi: number
  dogrulamaDurumu: DogrulamaDurumu
  dogrulamaSkoru: number | null
  kazanilanJeton: number
  gerekce: GerekceSatiri[]
  /** Özgünlük karşılaştırması için saklanan n-gram parçaları */
  metinParcalari: string[] | null
  gorselHash: string | null
  /** Kullanıcı bu gönderi için itiraz ettiyse */
  itirazDurumu?: 'yok' | 'incelemede'
  /** Kopya tespitinde örtüşülen gönderinin kimliği */
  kaynakGonderiId?: string | null
  /**
   * Örtüşme ölçüsü. Metinde Jaccard benzerliği (0–1), görselde dHash
   * Hamming mesafesi (0–64). Gerekçe cümlesinin içine gömmek yerine
   * sayı olarak saklanır; eşik taraması bu değeri okur.
   */
  benzerlikOlcusu?: number | null
  /** Örtüşmenin hangi kademede bulunduğu */
  kopyaTuru?: 'metin' | 'gorsel' | null
}

export type HareketKaydi = {
  id: string
  zaman: string
  aciklama: string
  miktar: number
  /**
   * 'demo' kayıtları uygulamanın hazır verisiyle gelir, kullanıcının
   * kazanımı değildir. Hareket defterinde ayrı işaretlenir ki günlük üst
   * sınırla ilgisi olmadığı anlaşılsın.
   */
  tur?: 'demo'
}

export type DogrulamaSonucu = {
  skor: number
  durumu: Exclude<DogrulamaDurumu, 'bekliyor'>
  gerekce: GerekceSatiri[]
  metinParcalari: string[] | null
  gorselHash: string | null
  kaynakGonderiId: string | null
  benzerlikOlcusu: number | null
  kopyaTuru: 'metin' | 'gorsel' | null
  kazanilanJeton: number
  gonderiId: string
}

export type AppState = {
  /**
   * Seed içeriğinden türetilen parmak izi. Kayıtlı durumun hangi demo
   * sürümüne ait olduğunu söyler; kod güncellendiğinde eski kayıt
   * otomatik atılır. Elle yönetilmez, `demoData.ts` hesaplar.
   */
  seedSurumu: string
  kullanici: Kullanici
  yazarlar: Yazar[]
  gonderiler: Gonderi[]
  hareketler: HareketKaydi[]
  magaza: Urun[]
}
