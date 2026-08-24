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
}

export type GerekceSatiri = string

export type DogrulamaDurumu = 'bekliyor' | 'gecti' | 'kismi' | 'gecemedi'

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
  kazanilanJeton: number
  gonderiId: string
}

export type AppState = {
  kullanici: Kullanici
  yazarlar: Yazar[]
  gonderiler: Gonderi[]
  hareketler: HareketKaydi[]
  magaza: Urun[]
}
