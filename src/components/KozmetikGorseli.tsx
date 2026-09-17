"use client"

import { ROZET_SIMGELERI } from "@/lib/store/efektler"
import type { EfektTuru } from "@/lib/store/types"

/**
 * Bir kozmetiğin ne olduğunu GÖSTEREN görsel.
 *
 * NEDEN VAR: envanter satırları yalnızca ürün ADINI yazıyordu. "Tunç Şerit"
 * ile "Tunç Kenar" arasındaki farkı ad okuyarak anlamak mümkün değil — biri
 * gönderi kartının kenarı, diğeri avatar çerçevesi. Ayrıca kenarlık ürünleri
 * hiç ele alınmamıştı ve işlev dalına düşüp "fn" gösteriyorlardı.
 *
 * RENK SATIR İÇİ STİLLE VERİLİR, sınıfla değil. Sebep: Tailwind sınıfları
 * derleme anında sabit olmalı, `bg-[var(--kozmetik-${deger})]` gibi bir şey
 * üretilemez. Renk burada veridir, tasarım jetonu değil.
 *
 * Biçim okunabilirliğin merkezinde. İlk sürümde çerçeve 2px'lik bir halkaydı
 * ve 32px'lik dairede pirinç ile tunç ayırt edilemiyordu — kullanıcı
 * "renkleri birebir aynı" dedi. Artık her tür kendi biçimini alıyor ve renk
 * geniş bir alanda görünüyor.
 */
const KOZMETIK_DEGISKENI = (deger: string) => `var(--kozmetik-${deger})`
const TEMA_DEGISKENI = (deger: string) => `var(--kozmetik-tema-${deger})`

export function KozmetikGorseli({
  tur,
  deger,
  buyuk = false,
}: {
  tur: EfektTuru
  deger: string
  buyuk?: boolean
}) {
  const olcu = buyuk ? 'w-12 h-12' : 'w-9 h-9'
  const ortak = `${olcu} shrink-0`

  if (tur === 'cerceve') {
    // Kalın halka: avatarın çevresindeki çerçeveyi temsil eder, rengi net okunur
    return (
      <span
        className={`${ortak} rounded-full bg-page`}
        style={{ border: `4px solid ${KOZMETIK_DEGISKENI(deger)}` }}
        aria-hidden="true"
      />
    )
  }

  if (tur === 'kenarlik') {
    // Sol kenarı renkli kart: gönderi kartındaki şeridin birebir minyatürü
    return (
      <span
        className={`${ortak} rounded-md bg-page border border-line`}
        style={{ borderLeft: `5px solid ${KOZMETIK_DEGISKENI(deger)}` }}
        aria-hidden="true"
      />
    )
  }

  if (tur === 'adRengi') {
    return (
      <span
        className={`${ortak} ${buyuk ? 'text-lg' : 'text-sm'} rounded-md bg-page border border-line flex items-center justify-center font-bold`}
        style={{ color: KOZMETIK_DEGISKENI(deger) }}
        aria-hidden="true"
      >
        Aa
      </span>
    )
  }

  if (tur === 'rozet') {
    const g = ROZET_SIMGELERI[deger]
    return (
      <span
        className={`${ortak} ${buyuk ? 'text-2xl' : 'text-lg'} rounded-full bg-page border border-line flex items-center justify-center ${
          g?.hareket ?? ''
        }`}
        style={{ color: KOZMETIK_DEGISKENI(deger) }}
        aria-hidden="true"
      >
        {g?.simge ?? '◆'}
      </span>
    )
  }

  if (tur === 'tema') {
    // Dolu kare: profil kapağının küçük hâli
    return (
      <span
        className={`${ortak} rounded-md border border-line`}
        style={{ backgroundColor: TEMA_DEGISKENI(deger) }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      className={`${ortak} ${buyuk ? 'text-sm' : 'text-xs'} rounded-md bg-page border border-line flex items-center justify-center font-mono text-secondary`}
      aria-hidden="true"
    >
      fn
    </span>
  )
}

/**
 * Kozmetiğin NEYİ değiştirdiğini tek satırda söyler.
 *
 * Ürün adları mineral ailesinden ve şiirsel: "Tunç Şerit" neyi değiştirdiğini
 * söylemiyor. Kullanıcı ne aldığını satın almadan önce bilmeli.
 */
export const ETKI_METNI: Record<EfektTuru, string> = {
  cerceve: 'Avatar çerçevesi',
  kenarlik: 'Gönderi kartı kenarı',
  adRengi: 'Kullanıcı adı rengi',
  rozet: 'Ad yanındaki rozet',
  tema: 'Profil kapağı',
  islev: 'Sistem işlevi',
}
