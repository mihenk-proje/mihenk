// MİHENK Doğrulama Kütüphanesi
// Tümü tarayıcıda, saf JS ile çalışır. Ağ isteği veya model çağrısı yoktur.

import type { DogrulamaSonucu, Gonderi } from '@/lib/store/types'
import {
  DUSUK_CABA_ESIGI,
  gorselDusukCabaSkoru,
  laplasVaryansi,
  metinDusukCabaSkoru,
} from './dusukCaba'

export * from './dusukCaba'

/**
 * Kopya sayılması için gereken en düşük Jaccard benzerliği.
 *
 * Ölçüm (5 özgün metin, 5 karakterlik n-gram): alakasız Türkçe metinler
 * ortalama 0,005 (en yüksek 0,043), ilişkili metinler 0,23–1,00. Arada
 * geniş bir boşluk var, bu yüzden 0,35 yanlış pozitif üretmiyor.
 *
 * Önceki 0,70 değeri yalnızca birebir kopyayı yakalıyordu; kısmi kopya,
 * yeniden yazım ve kısaltma varyantlarının tamamı kaçıyordu.
 *
 * Prototip değeridir; nihai değer etiketlenmiş küme üzerinde eşik
 * taramasıyla doğrulanacaktır (scripts/threshold_sweep.py).
 */
export const KOPYA_ESIGI = 0.35

/**
 * Kopya sayılmayan ama örtüşmesi dikkate değer içeriğin alt sınırı.
 * Bu bandda kalan gönderi yayında kalır ve jeton kazanır, ancak kazancı
 * azaltılır ve örtüşme oranı gerekçede kullanıcıya bildirilir.
 */
export const BENZERLIK_UYARI_ESIGI = 0.2

/** Benzerlik uyarı bandındaki gönderilerin skoruna uygulanan katsayı */
export const BENZERLIK_KATSAYISI = 0.55
/** İki dHash'in aynı görsel sayılması için izin verilen en yüksek Hamming mesafesi */
export const GORSEL_KOPYA_ESIGI = 10
/** Günlük jeton üst sınırı */
export const GUNLUK_UST_SINIR = 50
/** Tam geçen gönderi ödülü */
export const TAM_ODUL = 10
/** Kısmi geçen gönderi ödülü */
export const KISMI_ODUL = 5

export function normalizeTurkce(metin: string): string {
  let norm = metin.toLocaleLowerCase('tr-TR')
  // Noktalama ve semboller boşluğa dönüşür
  norm = norm.replace(/[.,/#!$%^&*;:{}=\-_`~()[\]"'?<>|\\+]/g, ' ')
  norm = norm.replace(/\s{2,}/g, ' ').trim()
  return norm
}

export function parcalaraAyir(metin: string, n = 5): Set<string> {
  const norm = normalizeTurkce(metin)
  const bitisik = norm.replace(/\s+/g, '')
  const parcalar = new Set<string>()

  if (bitisik.length === 0) return parcalar
  if (bitisik.length < n) {
    parcalar.add(bitisik)
    return parcalar
  }

  for (let i = 0; i <= bitisik.length - n; i++) {
    parcalar.add(bitisik.substring(i, i + n))
  }
  return parcalar
}

export function jaccardBenzerligi(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  if (a.size === 0 || b.size === 0) return 0

  let kesisim = 0
  for (const x of a) {
    if (b.has(x)) kesisim++
  }
  const birlesim = a.size + b.size - kesisim

  return birlesim === 0 ? 0 : kesisim / birlesim
}

/** Metin niteliği ve düşük çaba skorunun paylaştığı ham ölçüler. */
export function metinOlculeri(metin: string) {
  const norm = normalizeTurkce(metin)
  const kelimeler = norm.split(' ').filter((k) => k.length > 0)
  const kelimeSayisi = kelimeler.length
  const benzersiz = new Set(kelimeler)

  const ardisikKarakterTekrari = /(.)\1{4,}/.test(metin)
  let ardisikKelimeTekrari = false
  for (let i = 0; i < kelimeler.length - 2; i++) {
    if (kelimeler[i] === kelimeler[i + 1] && kelimeler[i] === kelimeler[i + 2]) {
      ardisikKelimeTekrari = true
      break
    }
  }

  const emojiSayisi = (metin.match(/\p{Extended_Pictographic}/gu) || []).length
  const linkSayisi = (metin.match(/https?:\/\/\S+/g) || []).length
  const metinBagsiz = normalizeTurkce(metin.replace(/https?:\/\/\S+/g, ' '))
    .replace(/\p{Extended_Pictographic}/gu, '')
    .trim()

  return {
    karakterSayisi: metin.trim().length,
    kelimeSayisi,
    tipTokenOrani: kelimeSayisi > 0 ? benzersiz.size / kelimeSayisi : 0,
    tekrarVar: ardisikKarakterTekrari || ardisikKelimeTekrari,
    yalnizcaIcerikDisi: metinBagsiz.length === 0 && (emojiSayisi > 0 || linkSayisi > 0),
  }
}

/** Metnin düşük çaba olasılığı (0–1). Yüksek değer düşük çaba demektir. */
export function olcMetinDusukCaba(metin: string) {
  return metinDusukCabaSkoru(metin, metinOlculeri(metin))
}

export function olcMetinNiteligi(metin: string): { skor: number; gerekce: string[] } {
  const norm = normalizeTurkce(metin)
  const kelimeler = norm.split(' ').filter((k) => k.length > 0)

  const karakterSayisi = metin.trim().length
  const kelimeSayisi = kelimeler.length

  const benzersizKelimeler = new Set(kelimeler)
  const tipTokenOrani = kelimeSayisi > 0 ? benzersizKelimeler.size / kelimeSayisi : 0

  const ardisikKarakterTekrari = /(.)\1{4,}/.test(metin)
  let ardisikKelimeTekrari = false
  for (let i = 0; i < kelimeler.length - 2; i++) {
    if (kelimeler[i] === kelimeler[i + 1] && kelimeler[i] === kelimeler[i + 2]) {
      ardisikKelimeTekrari = true
      break
    }
  }

  const emojiSayisi = (metin.match(/\p{Extended_Pictographic}/gu) || []).length
  const linkSayisi = (metin.match(/https?:\/\/\S+/g) || []).length
  // Bağlantı ve emoji dışında kelime kalmıyorsa içerik yok demektir
  const metinBagsiz = normalizeTurkce(metin.replace(/https?:\/\/\S+/g, ' '))
    .replace(/\p{Extended_Pictographic}/gu, '')
    .trim()
  const yalnizcaIcerikDisi = metinBagsiz.length === 0 && (emojiSayisi > 0 || linkSayisi > 0)

  const harfler = metin.replace(/[^\p{L}]/gu, '')
  const buyukHarfler = harfler.replace(/[^\p{Lu}]/gu, '')
  const buyukHarfOrani = harfler.length > 0 ? buyukHarfler.length / harfler.length : 0

  let skor = 100
  const gerekce: string[] = []

  if (karakterSayisi < 15) {
    skor -= 65
    gerekce.push('Uzunluk: Yetersiz (çok kısa)')
  } else if (karakterSayisi < 30) {
    skor -= 30
    gerekce.push('Uzunluk: Sınırda')
  } else if (karakterSayisi < 60) {
    skor -= 10
  }

  if (kelimeSayisi > 0 && kelimeSayisi < 8) {
    skor -= 12
    gerekce.push('Anlatım: Dar (az sayıda kelime)')
  } else if (kelimeSayisi < 12) {
    skor -= 5
  }

  if (kelimeSayisi > 5 && tipTokenOrani < 0.4) {
    skor -= 30
    gerekce.push('Kelime çeşitliliği: Düşük (tekrarlı anlatım)')
  }

  if (ardisikKarakterTekrari || ardisikKelimeTekrari) {
    skor -= 50
    gerekce.push('İçerik niteliği düşük: Anlamsız tekrar tespit edildi')
  }

  if (yalnizcaIcerikDisi) {
    skor -= 80
    gerekce.push('İçerik niteliği düşük: Yalnızca emoji veya bağlantı içeriyor')
  }

  if (harfler.length > 10 && buyukHarfOrani > 0.8) {
    skor -= 20
    gerekce.push('Yazım: Tamamı büyük harf')
  }

  skor = Math.max(0, Math.min(100, skor))

  if (skor >= 80 && gerekce.length === 0) {
    gerekce.push('Anlatım zenginliği: Yeterli')
  }

  return { skor, gerekce }
}

/** Anket seçeneklerinin ayırt ediciliğini ölçer */
export function olcAnketCesitliligi(secenekler: string[] | null): {
  skor: number
  gerekce: string[]
} {
  const gerekce: string[] = []
  const temiz = (secenekler || []).map((s) => normalizeTurkce(s)).filter((s) => s.length > 0)

  if (temiz.length < 2) {
    return { skor: 0, gerekce: ['Anket: En az iki dolu seçenek gerekiyor'] }
  }

  const benzersiz = new Set(temiz)
  if (benzersiz.size < temiz.length) {
    gerekce.push('Anket: Yinelenen seçenek var')
    return { skor: 30, gerekce }
  }

  // Seçenekler birbirine çok benziyorsa (ör. "evet", "evett") ayırt edici değildir
  let enYuksekBenzerlik = 0
  const parcalar = temiz.map((s) => parcalaraAyir(s, 3))
  for (let i = 0; i < parcalar.length; i++) {
    for (let j = i + 1; j < parcalar.length; j++) {
      enYuksekBenzerlik = Math.max(enYuksekBenzerlik, jaccardBenzerligi(parcalar[i], parcalar[j]))
    }
  }

  if (enYuksekBenzerlik > 0.8) {
    gerekce.push('Anket: Seçenekler birbirinden yeterince ayrışmıyor')
    return { skor: 50, gerekce }
  }

  gerekce.push('Anket: Seçenekler ayırt edici')
  return { skor: 100, gerekce }
}

function gorselYukle(imageUrl: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)
    const img = new window.Image()
    // Uzak görsellerde canvas'ın kirlenmemesi için
    img.crossOrigin = 'Anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}

/** 9x8 gri tonlamalı fark hash'i (dHash) — 64 bit, 16 haneli onaltılık */
export async function hesaplaDHash(imageUrl: string): Promise<string> {
  const img = await gorselYukle(imageUrl)
  if (!img) return ''

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 9
    canvas.height = 8
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return ''

    ctx.drawImage(img, 0, 0, 9, 8)
    const { data } = ctx.getImageData(0, 0, 9, 8)

    const gray = new Uint8Array(9 * 8)
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    }

    let bitler = ''
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        bitler += gray[y * 9 + x] > gray[y * 9 + x + 1] ? '1' : '0'
      }
    }

    let hex = ''
    for (let i = 0; i < bitler.length; i += 4) {
      hex += parseInt(bitler.substring(i, i + 4), 2).toString(16)
    }
    return hex
  } catch {
    // Canvas CORS nedeniyle kirlenmişse hash üretilemez
    return ''
  }
}

export function hammingMesafesi(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64

  let mesafe = 0
  for (let i = 0; i < hash1.length; i++) {
    let fark = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16)
    if (Number.isNaN(fark)) return 64
    while (fark) {
      mesafe += fark & 1
      fark >>= 1
    }
  }
  return mesafe
}

/** Histogram entropisiyle "düşük çaba" görselleri (düz renk, boş tuval) ayıklar */
export type GorselCabaSonucu = {
  skor: number
  gerekce: string[]
  dusukCabaSkoru: number
  dusukCabaMi: boolean
}

export async function olcDusukCaba(imageUrl: string): Promise<GorselCabaSonucu> {
  const img = await gorselYukle(imageUrl)
  if (!img) {
    return { skor: 0, gerekce: ['Görsel yüklenemedi'], dusukCabaSkoru: 1, dusukCabaMi: true }
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 50
    canvas.height = 50
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return { skor: 100, gerekce: [], dusukCabaSkoru: 0, dusukCabaMi: false }

    ctx.drawImage(img, 0, 0, 50, 50)
    const { data } = ctx.getImageData(0, 0, 50, 50)

    const histogram = new Array(256).fill(0)
    const gri = new Uint8Array(50 * 50)
    for (let i = 0; i < data.length; i += 4) {
      const deger = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
      gri[i / 4] = deger
      histogram[deger]++
    }

    const toplamPiksel = 50 * 50
    let entropi = 0
    let enCokTekrar = 0
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) {
        const p = histogram[i] / toplamPiksel
        entropi -= p * Math.log2(p)
      }
      if (histogram[i] > enCokTekrar) enCokTekrar = histogram[i]
    }

    const olcum = gorselDusukCabaSkoru({
      entropi,
      laplasVaryansi: laplasVaryansi(gri, 50, 50),
      tekRenkOrani: enCokTekrar / toplamPiksel,
    })

    // Nitelik puanı, düşük çaba olasılığının tümleyenidir
    const skor = Math.round((1 - olcum.skor) * 100)
    const gerekce = [...olcum.gerekce]
    if (!olcum.dusukCabaMi && skor >= 80) {
      gerekce.push('Görsel kalite: İyi')
    }

    return { skor, gerekce, dusukCabaSkoru: olcum.skor, dusukCabaMi: olcum.dusukCabaMi }
  } catch {
    return { skor: 0, gerekce: ['Görsel işlenemedi (CORS)'], dusukCabaSkoru: 1, dusukCabaMi: true }
  }
}

export function hesapYasiGun(hesapOlusturmaTarihi: string): number {
  const ms = Date.now() - new Date(hesapOlusturmaTarihi).getTime()
  if (!Number.isFinite(ms)) return 0
  return Math.max(0, Math.floor(ms / 86_400_000))
}

type DogrulamaCiktisi = Omit<DogrulamaSonucu, 'kazanilanJeton' | 'gonderiId'>

/** Kopya bulunmayan sonuçlarda örtüşme alanları boş kalır. */
const KOPYA_YOK = {
  kaynakGonderiId: null,
  benzerlikOlcusu: null,
  kopyaTuru: null,
} as const

function skordanDurum(skor: number): DogrulamaCiktisi['durumu'] {
  if (skor >= 60) return 'gecti'
  if (skor >= 40) return 'kismi'
  return 'gecemedi'
}

/**
 * Kademeli doğrulama zinciri.
 * Bir kademe hata verirse zincir durmaz; o kademenin katkısı sıfırlanır ve
 * ağırlıklar kalan kademelere dağıtılır.
 */
export async function dogrula(
  gonderi: Gonderi,
  gecmisGonderiler: Gonderi[],
  hesapYasGun = 30
): Promise<DogrulamaCiktisi> {
  const gerekce: string[] = []
  let metinParcalari: string[] | null = null
  let gorselHash: string | null = null

  const baslangic = performance.now()

  let metinNitelikSkoru = 0
  let gorselCabaSkoru = 0
  let anketSkoru = 0

  let metinGecerli = false
  let gorselGecerli = false
  let anketGecerli = false

  // Kopya eşiğini aşmayan en yüksek örtüşme (benzerlik uyarı bandı için)
  let enYuksekBenzerlik = 0
  let enYakinGonderiId: string | null = null

  try {
    // KADEME 1 — Metin özgünlüğü
    try {
      const t = performance.now()
      if (gonderi.metin && gonderi.metin.trim().length > 0) {
        metinGecerli = true
        const parcalar = parcalaraAyir(gonderi.metin)
        metinParcalari = Array.from(parcalar)

        for (const eski of gecmisGonderiler) {
          if (!eski.metinParcalari?.length || eski.id === gonderi.id) continue
          const benzerlik = jaccardBenzerligi(parcalar, new Set(eski.metinParcalari))

          // Kopya eşiğinin altındaki en yüksek örtüşme, uyarı bandı için saklanır
          if (benzerlik > enYuksekBenzerlik) {
            enYuksekBenzerlik = benzerlik
            enYakinGonderiId = eski.id
          }

          if (benzerlik >= KOPYA_ESIGI) {
            gerekce.unshift(
              `Bu metin daha önce paylaşılmış bir gönderiyle %${Math.round(
                benzerlik * 100
              )} oranında örtüşüyor.`
            )
            console.log(`[MİHENK] Kademe 1 (metin özgünlük): ${(performance.now() - t).toFixed(2)}ms — KOPYA`)
            // Kopya kesin sonuçtur, zincir burada biter
            return {
              skor: 0,
              durumu: 'kopya',
              gerekce,
              metinParcalari,
              gorselHash,
              kaynakGonderiId: eski.id,
              benzerlikOlcusu: benzerlik,
              kopyaTuru: 'metin',
            }
          }
        }
      }
      console.log(`[MİHENK] Kademe 1 (metin özgünlük): ${(performance.now() - t).toFixed(2)}ms`)
    } catch (err) {
      console.error('[MİHENK] Kademe 1 (metin özgünlük) hata:', err)
      metinGecerli = false
    }

    // KADEME 1b — Düşük çaba kapısı
    // Skor eşiği aşarsa gönderi nitelik puanına bakılmaksızın elenir.
    // Bu kademe olmadan kısa ve içeriksiz gönderiler biriken cezalarla
    // 'kısmi' bandında kalıyor ve jeton kazanıyordu.
    if (metinGecerli) {
      const dusuk = olcMetinDusukCaba(gonderi.metin)
      if (dusuk.dusukCabaMi) {
        gerekce.push(...dusuk.gerekce)
        console.log(
          `[MİHENK] Kademe 1b (düşük çaba): skor ${dusuk.skor.toFixed(3)} ≥ ${DUSUK_CABA_ESIGI} — ELENDI`
        )
        return {
          skor: Math.round((1 - dusuk.skor) * 100),
          durumu: 'gecemedi',
          gerekce,
          metinParcalari,
          gorselHash,
          ...KOPYA_YOK,
        }
      }
    }

    // KADEME 1c — Metin niteliği
    try {
      const t = performance.now()
      if (metinGecerli) {
        const { skor, gerekce: mg } = olcMetinNiteligi(gonderi.metin)
        metinNitelikSkoru = skor
        gerekce.push(...mg)
      }
      console.log(`[MİHENK] Kademe 1c (metin nitelik): ${(performance.now() - t).toFixed(2)}ms`)
    } catch (err) {
      console.error('[MİHENK] Kademe 1c (metin nitelik) hata:', err)
      metinNitelikSkoru = 0
    }

    // KADEME 2 — Görsel özgünlük ve çaba
    if (gonderi.gorselUrl) {
      try {
        const t = performance.now()
        gorselHash = await hesaplaDHash(gonderi.gorselUrl)

        if (gorselHash) {
          gorselGecerli = true
          for (const eski of gecmisGonderiler) {
            if (!eski.gorselHash || eski.id === gonderi.id) continue
            const mesafe = hammingMesafesi(gorselHash, eski.gorselHash)
            if (mesafe <= GORSEL_KOPYA_ESIGI) {
              // Kopya gerekçesi listenin başına alınır: akış kartı ilk satırı
              // gösterir ve orada metin niteliği yorumu değil tespitin
              // kendisi yazmalıdır.
              gerekce.unshift(
                `Bu görsel daha önce paylaşılmış bir gönderinin görseliyle eşleşiyor (algısal hash farkı ${mesafe}/64).`
              )
              console.log(`[MİHENK] Kademe 2 (görsel): ${(performance.now() - t).toFixed(2)}ms — KOPYA`)
              return {
                skor: 0,
                durumu: 'kopya',
                gerekce,
                metinParcalari,
                gorselHash,
                kaynakGonderiId: eski.id,
                benzerlikOlcusu: mesafe,
                kopyaTuru: 'gorsel',
              }
            }
          }

          const caba = await olcDusukCaba(gonderi.gorselUrl)
          gorselCabaSkoru = caba.skor
          gerekce.push(...caba.gerekce)

          // Görsel kademesinin düşük çaba kapısı
          if (caba.dusukCabaMi) {
            console.log(
              `[MİHENK] Kademe 2 (düşük çaba görsel): skor ${caba.dusukCabaSkoru.toFixed(3)} — ELENDI`
            )
            return {
              skor: caba.skor,
              durumu: 'gecemedi',
              gerekce,
              metinParcalari,
              gorselHash,
              ...KOPYA_YOK,
            }
          }
        } else {
          gerekce.push('Görsel çözümlenemedi, yalnızca metin üzerinden değerlendirildi.')
        }

        console.log(`[MİHENK] Kademe 2 (görsel): ${(performance.now() - t).toFixed(2)}ms`)
      } catch (err) {
        console.error('[MİHENK] Kademe 2 (görsel) hata:', err)
        gorselGecerli = false
      }
    }

    // KADEME 2b — Anket çeşitliliği
    if (gonderi.tur === 'anket') {
      try {
        const { skor, gerekce: ag } = olcAnketCesitliligi(gonderi.anketSecenekleri)
        anketSkoru = skor
        anketGecerli = true
        gerekce.push(...ag)
      } catch (err) {
        console.error('[MİHENK] Kademe 2b (anket) hata:', err)
        anketGecerli = false
      }
    }

    // KADEME 2c — Benzerlik uyarı bandı
    // Kopya eşiğinin altında ama dikkate değer örtüşme: gönderi yayında
    // kalır ve jeton kazanır, ancak kazancı azaltılır ve oran bildirilir.
    let benzerlikKatsayisi = 1.0
    if (enYuksekBenzerlik >= BENZERLIK_UYARI_ESIGI) {
      benzerlikKatsayisi = BENZERLIK_KATSAYISI
      gerekce.push(
        `Bu metin daha önce paylaşılmış bir gönderiyle %${Math.round(
          enYuksekBenzerlik * 100
        )} oranında örtüşüyor; kopya sayılmadı ancak kazanç azaltıldı.`
      )
    }

    // KADEME 3 — Hesap davranışı
    let katsayi = 1.0
    if (hesapYasGun < 3) {
      katsayi = 0.5
      gerekce.push('Hesap yaşı: Yeni hesap koruması devrede (kazanç yarıya iner)')
    }

    // SKOR BİRLEŞTİRME — yalnızca geçerli kademelerin ağırlıkları normalize edilir
    /*
      Özgünlük bir SKOR BİLEŞENİ değil, geçilmesi gereken bir kapıdır:
      kopya içerik yukarıda zaten elenir. Kapıyı geçen her gönderi için
      özgünlük sabit 100 olacağından, skora katılması yalnızca herkese
      aynı puanı hediye eder ve niteliksiz içeriğin de eşiği aşmasına yol
      açardı. Bu yüzden nihai skor yalnızca nitelik ölçümlerinden gelir.
    */
    const bilesenler: Array<{ agirlik: number; skor: number }> = []
    if (gonderi.tur === 'anket') {
      if (metinGecerli) bilesenler.push({ agirlik: 0.7, skor: metinNitelikSkoru })
      if (anketGecerli) bilesenler.push({ agirlik: 0.3, skor: anketSkoru })
    } else if (gonderi.tur === 'metinGorsel') {
      if (metinGecerli) bilesenler.push({ agirlik: 0.55, skor: metinNitelikSkoru })
      if (gorselGecerli) bilesenler.push({ agirlik: 0.45, skor: gorselCabaSkoru })
    } else {
      if (metinGecerli) bilesenler.push({ agirlik: 1, skor: metinNitelikSkoru })
    }

    const toplamAgirlik = bilesenler.reduce((t, b) => t + b.agirlik, 0)
    if (toplamAgirlik === 0) {
      gerekce.push('Değerlendirilebilecek içerik bulunamadı.')
      return { skor: 0, durumu: 'gecemedi', gerekce, metinParcalari, gorselHash, ...KOPYA_YOK }
    }

    const hamSkor = bilesenler.reduce((t, b) => t + b.agirlik * b.skor, 0) / toplamAgirlik
    const nihaiSkor = Math.round(hamSkor * katsayi * benzerlikKatsayisi)
    const durumu = skordanDurum(nihaiSkor)

    if (durumu !== 'gecemedi') {
      gerekce.unshift('Özgünlük: Bu içeriğe daha önce rastlanmadı')
    }

    console.log(`[MİHENK] Toplam: ${(performance.now() - baslangic).toFixed(2)}ms — skor ${nihaiSkor}`)

    return {
      skor: nihaiSkor,
      durumu,
      gerekce,
      metinParcalari,
      gorselHash,
      kaynakGonderiId: benzerlikKatsayisi < 1 ? enYakinGonderiId : null,
      benzerlikOlcusu: benzerlikKatsayisi < 1 ? enYuksekBenzerlik : null,
      kopyaTuru: null,
    }
  } catch (err) {
    console.error('[MİHENK] Doğrulama zincirinde beklenmeyen hata:', err)
    gerekce.push('Doğrulama işlemi sırasında beklenmeyen bir hata oluştu.')
    return { skor: 0, durumu: 'gecemedi', gerekce, metinParcalari, gorselHash, ...KOPYA_YOK }
  }
}
