/**
 * Taramayı koddaki yürürlükteki eşiklerle karşılaştırır ve results/metrics.json üretir.
 *
 * İki soruyu ayrı ayrı yanıtlar:
 *   1. Yürürlükteki eşik (KOPYA_ESIGI, GORSEL_KOPYA_ESIGI) bu kümede ne veriyor?
 *   2. F1'i en büyükleyen eşik hangisi ve farkın bedeli ne?
 *
 * Yanlış pozitif oranı DENGELİ kümeden değil, bütün özgün–özgün çiftlerinden
 * (500 kayıt → 124.750 çift) hesaplanır: akışta karşılaşılan dağılım budur ve
 * dengeli küme yanlış pozitifi olduğundan iyimser gösterir.
 *
 * Dönüşüm türü bazında duyarlılık her iki eşikte de verilir; birleşik tek bir
 * sayı kırpmanın bilinen sınırını gizler.
 *
 *   node scripts/threshold_sweep.mjs --out results/sweep.json
 *   node scripts/evaluate.mjs --sweep results/sweep.json --out results/metrics.json
 */
import { register } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

register('../test/cozumleyici.mjs', import.meta.url)
const { KOPYA_ESIGI, GORSEL_KOPYA_ESIGI, DUSUK_CABA_ESIGI } =
  await import('../src/lib/verification/index.ts')

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i === -1 ? varsayilan : process.argv[i + 1]
}

const sweep = JSON.parse(readFileSync(arg('--sweep', 'results/sweep.json'), 'utf8'))
const cikti = arg('--out', 'results/metrics.json')

/** Belirli bir eşikte kademeyi puanlar. */
function puanla(kademe, esik) {
  // Metin (Jaccard) ve düşük çaba skoru eşiğin ÜSTÜ pozitif; Hamming ALTI.
  const ustuPozitif = kademe.kademe === 'metin' || kademe.kademe === 'dusukCaba'
  const isaretli = (s) => (ustuPozitif ? s >= esik : s <= esik)
  const nokta = kademe.egri.find((n) => Math.abs(n.esik - esik) < 1e-9)

  const turler = Object.fromEntries(
    Object.entries(kademe.turBazinda).map(([t, v]) => {
      const yakalanan = v.skorlar.filter(isaretli).length
      return [t, { adet: v.adet, yakalanan, duyarlilik: yakalanan / v.adet, ortalamaSkor: v.ortalama }]
    })
  )

  const tamFp = kademe.tamNegatif.filter(isaretli).length
  return {
    esik,
    kesinlik: nokta?.kesinlik ?? null,
    duyarlilik: nokta?.duyarlilik ?? null,
    f1: nokta?.f1 ?? null,
    dengeliKume: nokta ? { tp: nokta.tp, fp: nokta.fp, fn: nokta.fn, tn: nokta.tn } : null,
    tamNegatif: {
      cift: kademe.tamNegatif.length,
      yanlisPozitif: tamFp,
      oran: tamFp / kademe.tamNegatif.length,
    },
    turBazinda: turler,
  }
}

/**
 * Kısıtlı en iyileme: yanlış pozitif oranı BUGÜNKÜNDEN KÖTÜ OLMAMAK kaydıyla
 * duyarlılığı en büyükleyen eşik.
 *
 * F1, yanlış pozitif ile yanlış negatifi eşit maliyetli sayar; MİHENK'te
 * bunlar eşit değil. Yanlış pozitif, özgün içerik üreten kullanıcıyı
 * kopyacılıkla işaretler. Bu yüzden F1 optimumu doğrudan uygulanmaz —
 * ama kesinlikten hiç ödün vermeden duyarlılık kazanılabiliyorsa, o kazanç
 * bırakılmaz. Aranan şey budur.
 */
function kisitliEnIyi(kademe, yururlukteki) {
  const tavan = yururlukteki.tamNegatif.oran
  const ustuPozitif = kademe.kademe === 'metin' || kademe.kademe === 'dusukCaba'
  const isaretli = (esik) => (s) => (ustuPozitif ? s >= esik : s <= esik)

  let aday = null
  for (const n of kademe.egri) {
    const fp = kademe.tamNegatif.filter(isaretli(n.esik)).length
    const oran = fp / kademe.tamNegatif.length
    if (oran > tavan) continue
    if (!aday || n.duyarlilik > aday.duyarlilik) aday = { ...n, tamNegatifOran: oran, tamNegatifSayi: fp }
  }
  return aday
}

const metrikler = {
  uretim: new Date().toISOString().slice(0, 10),
  not:
    'Raporun Tablo 9 ve 13 değerleri ön pilot ölçüm olarak sunulmuştu; o ölçümün veri ' +
    'seti tekrar üretilebilir biçimde mevcut değildir. Aşağıdaki değerler İP6 kümesi ' +
    'üzerinde sıfırdan ölçülmüştür.',
  kademeler: {},
}

if (sweep.metin) {
  metrikler.kademeler.metin = {
    olcu: sweep.metin.olcu,
    kume: {
      ozgun: sweep.metin.ozgun,
      pozitif: sweep.metin.pozitif,
      dengeliNegatif: sweep.metin.dengeliNegatif,
      tamNegatifCift: sweep.metin.tamNegatifCift,
    },
    yururlukteki: puanla(sweep.metin, KOPYA_ESIGI),
    f1Optimum: puanla(sweep.metin, sweep.metin.enIyi.esik),
    kisitliOptimum: (() => {
      const a = kisitliEnIyi(sweep.metin, puanla(sweep.metin, KOPYA_ESIGI))
      return a ? puanla(sweep.metin, a.esik) : null
    })(),
    egri: sweep.metin.egri.map(({ esik, f1, kesinlik, duyarlilik }) => ({ esik, f1, kesinlik, duyarlilik })),
  }
}

if (sweep.gorsel) {
  metrikler.kademeler.gorsel = {
    olcu: sweep.gorsel.olcu,
    kume: {
      ozgun: sweep.gorsel.ozgun,
      pozitif: sweep.gorsel.pozitif,
      dengeliNegatif: sweep.gorsel.dengeliNegatif,
      tamNegatifCift: sweep.gorsel.tamNegatifCift,
    },
    yururlukteki: puanla(sweep.gorsel, GORSEL_KOPYA_ESIGI),
    f1Optimum: puanla(sweep.gorsel, sweep.gorsel.enIyi.esik),
    kisitliOptimum: (() => {
      const a = kisitliEnIyi(sweep.gorsel, puanla(sweep.gorsel, GORSEL_KOPYA_ESIGI))
      return a ? puanla(sweep.gorsel, a.esik) : null
    })(),
    kirpmaHaricOptimum: sweep.gorsel.kirpmaHaric.enIyi,
    egri: sweep.gorsel.egri.map(({ esik, f1, kesinlik, duyarlilik }) => ({ esik, f1, kesinlik, duyarlilik })),
    egriKirpmaHaric: sweep.gorsel.kirpmaHaric.egri.map(({ esik, f1, duyarlilik }) => ({ esik, f1, duyarlilik })),
  }
}

if (sweep.dusukCaba) {
  /*
    `puanla` metin için >= , diğerleri için <= karşılaştırır; düşük çaba
    skoru da metin gibi "eşiğin üstü pozitif". Kademeyi metin adıyla geçici
    olarak yeniden etiketlemek yerine `puanla`'nın yön kuralı genişletildi.
  */
  metrikler.kademeler.dusukCaba = {
    olcu: sweep.dusukCaba.olcu,
    kume: {
      ozgun: sweep.dusukCaba.ozgun,
      pozitif: sweep.dusukCaba.pozitif,
      dengeliNegatif: sweep.dusukCaba.dengeliNegatif,
      tamNegatifCift: sweep.dusukCaba.tamNegatifCift,
    },
    yururlukteki: puanla(sweep.dusukCaba, DUSUK_CABA_ESIGI),
    f1Optimum: puanla(sweep.dusukCaba, sweep.dusukCaba.enIyi.esik),
    kisitliOptimum: (() => {
      const a = kisitliEnIyi(sweep.dusukCaba, puanla(sweep.dusukCaba, DUSUK_CABA_ESIGI))
      return a ? puanla(sweep.dusukCaba, a.esik) : null
    })(),
    egri: sweep.dusukCaba.egri.map(({ esik, f1, kesinlik, duyarlilik }) => ({ esik, f1, kesinlik, duyarlilik })),
  }
} else {
  metrikler.kademeler.dusukCaba = {
    durum: 'ölçülmedi',
    yururluktekiEsik: DUSUK_CABA_ESIGI,
    neden: 'data/images/dusuk_caba_skorlari.json üretilmemiş; node scripts/skorla_dusuk_caba.mjs',
  }
}

mkdirSync(dirname(cikti), { recursive: true })
writeFileSync(cikti, JSON.stringify(metrikler, null, 1))

const yuzde = (x) => `${(x * 100).toFixed(1)}%`
for (const [ad, k] of Object.entries(metrikler.kademeler)) {
  if (k.durum) {
    console.log(`\n=== ${ad.toUpperCase()} === ${k.durum}: ${k.neden}`)
    continue
  }
  console.log(`\n=== ${ad.toUpperCase()} — ${k.olcu} ===`)
  const kumeler = [['YÜRÜRLÜKTEKİ', k.yururlukteki], ['F1 OPTİMUM', k.f1Optimum]]
  if (k.kisitliOptimum) kumeler.push(['KISITLI OPTİMUM (yanlış pozitif bugünkünden kötü değil)', k.kisitliOptimum])
  for (const [etiket, s] of kumeler) {
    console.log(`  ${etiket} eşik ${s.esik}`)
    console.log(`    F1 ${s.f1.toFixed(4)} · kesinlik ${yuzde(s.kesinlik)} · duyarlılık ${yuzde(s.duyarlilik)}`)
    console.log(`    tam negatif kümede yanlış pozitif: ${s.tamNegatif.yanlisPozitif} / ${s.tamNegatif.cift} (${yuzde(s.tamNegatif.oran)})`)
    for (const [t, v] of Object.entries(s.turBazinda)) {
      console.log(`      ${t.padEnd(24)} ${String(v.yakalanan).padStart(4)}/${v.adet}  ${yuzde(v.duyarlilik)}`)
    }
  }
}
console.log(`\nMetrikler -> ${cikti}`)
