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

/** Avatar zemin rengi kimlikten türetilir; ağ isteği gerekmez. */
const AVATAR_RENKLERI = [
  'bg-[#5b6f7d]',
  'bg-[#6d5c73]',
  'bg-[#5c7364]',
  'bg-[#7d6a52]',
  'bg-[#4f6470]',
  'bg-[#73605c]',
]

export function avatarRengi(id: string): string {
  let toplam = 0
  for (let i = 0; i < id.length; i++) toplam = (toplam + id.charCodeAt(i)) % 997
  return AVATAR_RENKLERI[toplam % AVATAR_RENKLERI.length]
}
