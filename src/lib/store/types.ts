export type Urun = {
  id: string
  ad: string
  aciklama: string
  kategori: 'sureli' | 'sezonluk' | 'kalici' | 'islevsel'
  fiyat: number
  sureGun: number | null
  efekt: { tur: 'cerceve' | 'adRengi' | 'rozet' | 'tema' | 'islev', deger: string }
}

export type SahipOlunanUrun = {
  urunId: string
  satinAlmaZamani: string
  aktif: boolean
}

export type Kullanici = {
  id: string
  kullaniciAdi: string
  avatarUrl: string
  jetonBakiyesi: number
  bugunKazanilan: number
  envanter: SahipOlunanUrun[]
  hesapOlusturmaTarihi: string
}

export type GerekceSatiri = string

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
  dogrulamaDurumu: 'bekliyor' | 'gecti' | 'kismi' | 'gecemedi'
  dogrulamaSkoru: number | null
  kazanilanJeton: number
  gerekce: GerekceSatiri[]
  metinParcalari: string[] | null
  gorselHash: string | null
}

export type HareketKaydi = {
  id: string
  zaman: string
  aciklama: string
  miktar: number
}

export type AppState = {
  kullanici: Kullanici
  gonderiler: Gonderi[]
  hareketler: HareketKaydi[]
  magaza: Urun[]
}
