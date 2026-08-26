import type { AppState, EfektTuru, SahipOlunanUrun, Urun } from './types'

/**
 * Bir envanter kaydının süresi dolmuş mu?
 * sureGun null ise ürün kalıcıdır ve hiç dolmaz.
 */
export function suresiDoldu(urun: Urun | undefined, sahip: SahipOlunanUrun): boolean {
  if (!urun || urun.sureGun === null) return false
  const bitis = new Date(sahip.satinAlmaZamani).getTime() + urun.sureGun * 86_400_000
  return Date.now() > bitis
}

export function kalanSure(urun: Urun | undefined, sahip: SahipOlunanUrun): string | null {
  if (!urun || urun.sureGun === null) return null
  const kalanMs = new Date(sahip.satinAlmaZamani).getTime() + urun.sureGun * 86_400_000 - Date.now()
  if (kalanMs <= 0) return 'Süresi doldu'
  const saat = Math.floor(kalanMs / 3_600_000)
  if (saat < 24) return `${Math.max(1, saat)} saat kaldı`
  return `${Math.floor(saat / 24)} gün kaldı`
}

/** Kullanıcının o an yürürlükte olan ürünleri (satın alınmış + açık + süresi dolmamış) */
export function yururluktekiUrunler(state: AppState): Urun[] {
  return state.kullanici.envanter
    .map((sahip) => ({ sahip, urun: state.magaza.find((u) => u.id === sahip.urunId) }))
    .filter(({ sahip, urun }) => Boolean(urun) && sahip.aktif && !suresiDoldu(urun, sahip))
    .map(({ urun }) => urun as Urun)
}

/** Her efekt türünden yürürlükteki son ürünü döndürür */
export function aktifEfekt(state: AppState, tur: EfektTuru): Urun | undefined {
  const eslesenler = yururluktekiUrunler(state).filter((u) => u.efekt.tur === tur)
  return eslesenler[eslesenler.length - 1]
}

/**
 * Akıştaki diğer yazarların kozmetiklerini çözer.
 *
 * Kullanıcının kendi kozmetikleri envanterden gelir ve süre takibine tabidir;
 * diğer yazarlarınki demo verisinde sabit ürün kimlikleri olarak durur. İkisi
 * de aynı mağaza kataloğuna bakar, böylece hakem akışta gördüğü her kozmetiği
 * mağazada bulabilir.
 */
export function yazarEfekti(
  magaza: Urun[],
  kozmetikler: string[] | undefined,
  tur: EfektTuru
): Urun | undefined {
  if (!kozmetikler?.length) return undefined
  return magaza.find((u) => kozmetikler.includes(u.id) && u.efekt.tur === tur)
}

export function islevAcikMi(state: AppState, deger: string): boolean {
  return yururluktekiUrunler(state).some((u) => u.efekt.tur === 'islev' && u.efekt.deger === deger)
}

/*
  Tailwind sınıf adları derleme sırasında taranır; bu yüzden dinamik
  birleştirme yerine sabit eşleme tabloları kullanılır.

  Renkler doğrudan yazılmaz, globals.css'teki kozmetik değişkenlerinden gelir:
  aynı ürün koyu ve açık temada farklı bir tona ihtiyaç duyar. Ürün renkleri
  koyu zemine göre seçilmişti ve açık temada kontrast eşiğini kaçırıyorlardı.
*/

export const CERCEVE_SINIFLARI: Record<string, string> = {
  pirinc: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-pirinc)]',
  tunc: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-tunc)]',
  ametist: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-ametist)]',
  altin: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-altin)]',
}

export const AD_RENGI_SINIFLARI: Record<string, string> = {
  mika: 'text-[var(--kozmetik-mika)]',
}

export const ROZET_SIMGELERI: Record<string, { simge: string; sinif: string; etiket: string }> = {
  kuvars: { simge: '◆', sinif: 'text-[var(--kozmetik-kuvars)]', etiket: 'Kuvars rozeti' },
  gumus: { simge: '❖', sinif: 'text-[var(--kozmetik-gumus)]', etiket: 'Gümüş nişan' },
  kulce: { simge: '▰', sinif: 'text-[var(--kozmetik-kulce)]', etiket: 'Külçe nişanı' },
  ayar: { simge: '✦', sinif: 'text-[var(--kozmetik-ayar)]', etiket: 'Ayar rozeti' },
}

export const TEMA_SINIFLARI: Record<string, string> = {
  somaki: 'bg-[#3a2430]/25',
  bazalt: 'bg-[#242c2e]/50',
  mermer: 'bg-[#d9d4c7]/10',
}

/*
  Avatar zemin renkleri.

  FOTOĞRAF AVATAR KULLANILMIYOR. Değerlendirildi ve reddedildi:
    1. Rıza — gerçek kişi fotoğrafları kurgusal hesaplara atfedilemez.
    2. Tez çelişkisi — yapay zekâyla üretilmiş yüzler kullanmak, tüm iddiası
       içeriğin özgünlüğünü denetlemek olan bir projede savunulamaz.
    3. Ürün görünürlüğü — kozmetik katalog çerçeve, rozet ve kenar
       vurgusundan oluşuyor; fotoğraf avatar çerçeveyi görsel olarak yutar.
  Ayrıntı: docs/avatar-karari.md

  Renkler ölçülerek seçildi. Üç kısıtı birden karşılamaları gerekiyordu:
  beyaz baş harflerle ≥ 4,5 (metin okunabilirliği), koyu sayfa zemininde
  ≥ 3 ve açık sayfa zemininde ≥ 3 (dairenin şekil olarak seçilebilmesi).
  Bu, parlaklığı dar bir banda hapsediyor; altı ton o bant içinde farklı
  hue'lara yerleştirildi.

  On ton, hepsi bu bant icinde: beyaz metin 5,05 · koyu zemin 3,55 ·
  acik zemin 4,40.
*/
export const AVATAR_TONLARI = {
  deniz: 'bg-[#327886]',
  mor: 'bg-[#9254b6]',
  zeytin: 'bg-[#517934]',
  kiremit: 'bg-[#bc4a24]',
  lacivert: 'bg-[#526dad]',
  toprak: 'bg-[#95642d]',
  erguvan: 'bg-[#c62f87]',
  camyesili: 'bg-[#1c7d5a]',
  tugla: 'bg-[#cf3046]',
  cinko: 'bg-[#2674ab]',
} as const

export type AvatarTonu = keyof typeof AVATAR_TONLARI

const TON_LISTESI = Object.values(AVATAR_TONLARI)

/**
 * Avatar zemin sınıfı.
 *
 * `ton` verilmişse o kullanılır; demo yazarlarına birbirinden ayrık tonlar
 * elle atanır çünkü karma, yedi kullanıcıda bile çakışabiliyor (on renkli
 * palette Kaan ile Elif aynı kovaya düşüyordu) ve hakem kullanıcıları
 * ayırt edemez.
 *
 * Ton verilmemişse kullanıcı adından FNV-1a ile türetilir: aynı kullanıcı
 * her yüklemede aynı rengi alır, rastgelelik yoktur.
 */
export function avatarRengi(anahtar: string, ton?: AvatarTonu): string {
  if (ton && ton in AVATAR_TONLARI) return AVATAR_TONLARI[ton]
  let h = 0x811c9dc5
  for (let i = 0; i < anahtar.length; i++) {
    h ^= anahtar.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return TON_LISTESI[h % TON_LISTESI.length]
}
