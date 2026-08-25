/**
 * Düşük çaba skoru — tanım ve hesaplama.
 *
 * Teknik rapor Tablo 9'da "Olasılık Skoru ≥ 0,65 (Min. 15 krk.)" eşiği
 * geçiyor. Bu dosya o skorun ne olduğunu açıkça tanımlar.
 *
 * Skor 0–1 aralığındadır ve **düşük çaba olasılığıdır**: yüksek değer
 * içeriğin düşük çabalı olduğuna işaret eder. Nitelik puanının tersidir;
 * karıştırılmamalıdır.
 *
 * "Min. 15 karakter" kısıtı METİN kademesine aittir ve sert bir tabandır:
 * 15 karakterin altındaki metin, diğer bileşenlere bakılmaksızın düşük
 * çabalı sayılır. Görsel kademesinin karakter tabanı yoktur.
 */

/** Bu eşiğe ulaşan içerik düşük çabalı sayılır ve jeton kazanmaz. */
export const DUSUK_CABA_ESIGI = 0.65

/** Metin kademesinin sert alt sınırı (rapor Tablo 9) */
export const METIN_ASGARI_KARAKTER = 15

/**
 * Bileşen ağırlıkları. Toplamları 1,0'dır.
 * Değerler prototip değerleridir; nihai ağırlıklar etiketlenmiş küme
 * üzerinde eşik taramasıyla belirlenecektir.
 */
export const METIN_AGIRLIKLARI = {
  uzunluk: 0.4,
  kelimeSayisi: 0.3,
  cesitlilik: 0.18,
  tekrar: 0.12,
} as const

export const GORSEL_AGIRLIKLARI = {
  entropi: 0.4,
  bulaniklik: 0.35,
  tekRenk: 0.25,
} as const

/* Bileşenlerin doyum noktaları */
const UZUNLUK_UST = 80 // bu karakter sayısının üstünde uzunluk cezası sıfırlanır
const UZUNLUK_ARALIK = 50
const KELIME_UST = 14 // bu kelime sayısının üstünde kelime cezası sıfırlanır
const KELIME_ARALIK = 10
const ENTROPI_UST = 4.5 // bit; bunun üstündeki gri ton entropisi zengin sayılır
const BULANIKLIK_UST = 120 // Laplas varyansı; altı bulanık kabul edilir
const TEK_RENK_TABAN = 0.35 // baskın renk oranı bu değerin altındaysa ceza yok
const TEK_RENK_ARALIK = 0.5

const kelepce = (x: number) => Math.max(0, Math.min(1, x))

/*
  Skor dört ondalığa yuvarlanır. Ağırlıkların toplamı kayan noktada tam
  gelmediği için (0.4 + 0.3 = 0.7000000000000001 gibi) eşik karşılaştırması
  aksi hâlde kıl payı kaçabiliyor. Yuvarlama ayrıca ölçüm katmanındaki
  Python karşılığıyla aynı sonucu vermeyi garantiler.
*/
const yuvarla = (x: number) => Math.round(x * 10_000) / 10_000

export type DusukCabaBilesenleri = {
  skor: number
  bilesenler: Record<string, number>
  dusukCabaMi: boolean
  gerekce: string[]
}

/**
 * Metin için düşük çaba olasılığı.
 * Bileşenler: karakter sayısı, kelime sayısı, tip/token çeşitliliği ve
 * ardışık tekrar. 15 karakterin altı sert tabandır.
 */
export function metinDusukCabaSkoru(
  metin: string,
  olculer: {
    karakterSayisi: number
    kelimeSayisi: number
    tipTokenOrani: number
    tekrarVar: boolean
    yalnizcaIcerikDisi: boolean
  }
): DusukCabaBilesenleri {
  const { karakterSayisi, kelimeSayisi, tipTokenOrani, tekrarVar, yalnizcaIcerikDisi } = olculer
  const gerekce: string[] = []

  // Sert taban: 15 karakterin altı ve içeriksiz gönderiler doğrudan 1,0
  if (karakterSayisi < METIN_ASGARI_KARAKTER) {
    gerekce.push(`Bu gönderi ${METIN_ASGARI_KARAKTER} karakterlik alt sınırın altında kaldı.`)
    return { skor: 1, bilesenler: { sertTaban: 1 }, dusukCabaMi: true, gerekce }
  }
  if (yalnizcaIcerikDisi) {
    gerekce.push('Bu gönderi yalnızca emoji veya bağlantı içeriyor.')
    return { skor: 1, bilesenler: { sertTaban: 1 }, dusukCabaMi: true, gerekce }
  }

  const bilesenler = {
    uzunluk: kelepce((UZUNLUK_UST - karakterSayisi) / UZUNLUK_ARALIK),
    kelimeSayisi: kelepce((KELIME_UST - kelimeSayisi) / KELIME_ARALIK),
    cesitlilik: kelimeSayisi > 5 ? kelepce(1 - tipTokenOrani) : 0,
    tekrar: tekrarVar ? 1 : 0,
  }

  const skor = yuvarla(
    kelepce(
      bilesenler.uzunluk * METIN_AGIRLIKLARI.uzunluk +
        bilesenler.kelimeSayisi * METIN_AGIRLIKLARI.kelimeSayisi +
        bilesenler.cesitlilik * METIN_AGIRLIKLARI.cesitlilik +
        bilesenler.tekrar * METIN_AGIRLIKLARI.tekrar
    )
  )

  const dusukCabaMi = skor >= DUSUK_CABA_ESIGI
  if (dusukCabaMi) {
    gerekce.push(
      'Bu gönderi kısa ve az sözcük içerdiği için düşük çabalı içerik kademesine düştü.'
    )
  }

  return { skor, bilesenler, dusukCabaMi, gerekce }
}

/**
 * Görsel için düşük çaba olasılığı.
 * Bileşenler: gri ton histogram entropisi, Laplas varyansı (bulanıklık)
 * ve baskın renk oranı.
 */
export function gorselDusukCabaSkoru(olculer: {
  entropi: number
  laplasVaryansi: number
  tekRenkOrani: number
}): DusukCabaBilesenleri {
  const { entropi, laplasVaryansi, tekRenkOrani } = olculer
  const gerekce: string[] = []

  const bilesenler = {
    entropi: kelepce((ENTROPI_UST - entropi) / ENTROPI_UST),
    bulaniklik: kelepce((BULANIKLIK_UST - laplasVaryansi) / BULANIKLIK_UST),
    tekRenk: kelepce((tekRenkOrani - TEK_RENK_TABAN) / TEK_RENK_ARALIK),
  }

  const skor = yuvarla(
    kelepce(
      bilesenler.entropi * GORSEL_AGIRLIKLARI.entropi +
        bilesenler.bulaniklik * GORSEL_AGIRLIKLARI.bulaniklik +
        bilesenler.tekRenk * GORSEL_AGIRLIKLARI.tekRenk
    )
  )

  const dusukCabaMi = skor >= DUSUK_CABA_ESIGI
  if (dusukCabaMi) {
    if (bilesenler.bulaniklik > 0.6) gerekce.push('Görselin ayrıntı düzeyi düşük (bulanık).')
    else if (bilesenler.tekRenk > 0.6) gerekce.push('Görsel tek renk ağırlıklı.')
    else gerekce.push('Görselin görsel içeriği sınırlı.')
  }

  return { skor, bilesenler, dusukCabaMi, gerekce }
}

/**
 * 3x3 Laplas çekirdeğiyle kenar yanıtının varyansı.
 * Bulanık görsellerde kenar yanıtı zayıftır, varyans düşer.
 * Ölçüm katmanındaki Python karşılığıyla aynı çekirdeği kullanır.
 */
export function laplasVaryansi(gri: ArrayLike<number>, genislik: number, yukseklik: number): number {
  const yanit: number[] = []
  for (let y = 1; y < yukseklik - 1; y++) {
    for (let x = 1; x < genislik - 1; x++) {
      const i = y * genislik + x
      const v =
        -4 * gri[i] +
        gri[i - 1] +
        gri[i + 1] +
        gri[i - genislik] +
        gri[i + genislik]
      yanit.push(v)
    }
  }
  if (yanit.length === 0) return 0
  const ort = yanit.reduce((t, v) => t + v, 0) / yanit.length
  return yanit.reduce((t, v) => t + (v - ort) ** 2, 0) / yanit.length
}
