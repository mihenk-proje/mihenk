/**
 * Eşik taraması — metin özgünlüğü (Jaccard) ve görsel özgünlüğü (Hamming).
 *
 * Neden Node, neden Python değil: metin tarafının çalışma zamanı karşılığı
 * (`normalizeTurkce`, `parcalaraAyir`, `jaccardBenzerligi`, `hammingMesafesi`)
 * TypeScript'te yazılı. Python'a portlamak ikinci bir uygulama yaratır ve
 * ölçüm ile üretim sessizce sapabilir. Bu betik `test/cozumleyici.mjs`
 * çözümleyicisiyle kaynağı doğrudan içe aktarır: tek gerçek uygulama kalır.
 *
 * Tasarım — iki ayrı negatif küme:
 *
 *   1. DENGELİ KÜME. Her varyant için bir negatif çift üretilir: aynı varyant,
 *      ebeveyni OLMAYAN rastgele bir özgünle eşlenir. Pozitif ve negatif sayısı
 *      eşit olur, F1 sınıf dengesizliğinden şişmez.
 *   2. TAM NEGATİF TARAMA. Bütün özgün–özgün çiftleri (500 kayıt → 124.750
 *      çift) ayrıca taranır ve yanlış pozitif oranı bunun üzerinden verilir.
 *      Gerçek akışta karşılaşılan dağılım budur.
 *
 * Dönüşüm türü bazında kırılım verilir; birleşik tek bir duyarlılık sayısı
 * kırpmanın bilinen sınırını gizler (bkz. results/bilinen-sinirlar.md).
 *
 *   node scripts/threshold_sweep.mjs --kademe metin
 *   node scripts/threshold_sweep.mjs --kademe gorsel
 *   node scripts/threshold_sweep.mjs --out results/sweep.json
 */
import { register } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

register('../test/cozumleyici.mjs', import.meta.url)
const { normalizeTurkce, parcalaraAyir, jaccardBenzerligi, hammingMesafesi } =
  await import('../src/lib/verification/index.ts')

/* Tohumlu üreteç: aynı tohum aynı negatif çiftleri verir. */
function uretec(tohum) {
  let s = tohum >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const jsonl = (yol) =>
  readFileSync(yol, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i === -1 ? varsayilan : process.argv[i + 1]
}

/**
 * Bir skor listesini eşik boyunca tarar.
 * @param yon 'ustu' → skor >= esik pozitif (Jaccard) · 'alti' → skor <= esik pozitif (Hamming)
 */
function tara(pozitifler, negatifler, esikler, yon) {
  const egri = []
  let enIyi = null
  for (const esik of esikler) {
    const isaretli = (s) => (yon === 'ustu' ? s >= esik : s <= esik)
    const tp = pozitifler.filter(isaretli).length
    const fn = pozitifler.length - tp
    const fp = negatifler.filter(isaretli).length
    const tn = negatifler.length - fp
    const kesinlik = tp + fp === 0 ? 0 : tp / (tp + fp)
    const duyarlilik = tp + fn === 0 ? 0 : tp / (tp + fn)
    const f1 = kesinlik + duyarlilik === 0 ? 0 : (2 * kesinlik * duyarlilik) / (kesinlik + duyarlilik)
    const nokta = { esik, tp, fp, fn, tn, kesinlik, duyarlilik, f1 }
    egri.push(nokta)
    if (!enIyi || f1 > enIyi.f1) enIyi = nokta
  }
  return { egri, enIyi }
}

const yuzde = (x) => `${(x * 100).toFixed(1)}%`

// ---------------------------------------------------------------- METİN

function metinKademesi() {
  const ozgunler = jsonl('data/metin/ozgun_500.jsonl')
  const varyantlar = jsonl('data/metin/varyant_havuzu.jsonl')

  const parcalar = new Map()
  const coz = (id, metin) => {
    if (!parcalar.has(id)) parcalar.set(id, parcalaraAyir(normalizeTurkce(metin), 5))
    return parcalar.get(id)
  }
  for (const o of ozgunler) coz(o.id, o.text)

  const rnd = uretec(42)
  const pozitif = []
  const negatif = []
  const turBazinda = {}

  for (const v of varyantlar) {
    const ebeveyn = parcalar.get(v.parent_id)
    if (!ebeveyn) continue
    const vp = coz(v.id, v.text)
    const skor = jaccardBenzerligi(vp, ebeveyn)
    pozitif.push(skor)
    ;(turBazinda[v.variant_type] ??= []).push(skor)

    // Dengeli negatif: aynı varyant, ebeveyni olmayan rastgele bir özgün
    let baska
    do {
      baska = ozgunler[Math.floor(rnd() * ozgunler.length)]
    } while (baska.id === v.parent_id)
    negatif.push(jaccardBenzerligi(vp, parcalar.get(baska.id)))
  }

  // Tam negatif tarama: bütün özgün–özgün çiftleri
  const tamNegatif = []
  for (let i = 0; i < ozgunler.length; i++) {
    for (let j = i + 1; j < ozgunler.length; j++) {
      tamNegatif.push(jaccardBenzerligi(parcalar.get(ozgunler[i].id), parcalar.get(ozgunler[j].id)))
    }
  }

  const esikler = Array.from({ length: 101 }, (_, i) => i / 100)
  const { egri, enIyi } = tara(pozitif, negatif, esikler, 'ustu')

  return {
    kademe: 'metin',
    olcu: 'Jaccard benzerliği (5 karakterlik n-gram)',
    ozgun: ozgunler.length,
    pozitif: pozitif.length,
    dengeliNegatif: negatif.length,
    tamNegatifCift: tamNegatif.length,
    enIyi,
    egri,
    turBazinda: Object.fromEntries(
      Object.entries(turBazinda).map(([t, s]) => [
        t,
        { adet: s.length, ortalama: s.reduce((a, b) => a + b, 0) / s.length, skorlar: s },
      ])
    ),
    tamNegatif,
  }
}

// --------------------------------------------------------------- GÖRSEL

function gorselKademesi() {
  const yol = 'data/images/dhash.json'
  if (!existsSync(yol)) {
    console.error(
      `${yol} yok. Önce: node scripts/hash_gorseller.mjs --manifest data/images/manifest.jsonl ` +
        `--manifest data/images/variants_manifest.jsonl --out ${yol}`
    )
    process.exit(2)
  }
  const hash = JSON.parse(readFileSync(yol, 'utf8'))
  const ozgunler = jsonl('data/images/manifest.jsonl').filter((r) => r.kume === 'originals')
  const varyantlar = jsonl('data/images/variants_manifest.jsonl')

  /*
    İki manifest farklı kimlik biçimi kullanıyor: özgünler `g-<photo_id>`,
    varyantların `parent_id`'si çıplak `photo_id`. Köprü photo_id üzerinden
    kurulur; doğrudan eşleme sessizce sıfır pozitif üretiyordu.
  */
  const ozgunHash = new Map(ozgunler.map((o) => [o.photo_id, hash[o.id]]))

  const rnd = uretec(42)
  const pozitif = []
  const negatif = []
  const turBazinda = {}

  for (const v of varyantlar) {
    const a = hash[v.id]
    const e = ozgunHash.get(v.parent_id)
    if (!a || !e) continue
    const d = hammingMesafesi(a, e)
    pozitif.push(d)
    ;(turBazinda[v.variant_type] ??= []).push(d)

    let baska
    do {
      baska = ozgunler[Math.floor(rnd() * ozgunler.length)]
    } while (baska.photo_id === v.parent_id)
    negatif.push(hammingMesafesi(a, hash[baska.id]))
  }

  const tamNegatif = []
  for (let i = 0; i < ozgunler.length; i++) {
    for (let j = i + 1; j < ozgunler.length; j++) {
      tamNegatif.push(hammingMesafesi(hash[ozgunler[i].id], hash[ozgunler[j].id]))
    }
  }

  const esikler = Array.from({ length: 65 }, (_, i) => i)
  const { egri, enIyi } = tara(pozitif, negatif, esikler, 'alti')

  // Kırpma dahil / hariç iki seri: kırpma sınırı birleşik sayının içinde kaybolmasın
  const kirpmasiz = varyantlar
    .filter((v) => !v.variant_type.startsWith('kirpma'))
    .map((v) => hammingMesafesi(hash[v.id], ozgunHash.get(v.parent_id)))
  const { egri: egriKirpmasiz, enIyi: enIyiKirpmasiz } = tara(
    kirpmasiz,
    negatif.slice(0, kirpmasiz.length),
    esikler,
    'alti'
  )

  return {
    kademe: 'gorsel',
    olcu: '9×8 dHash, Hamming mesafesi',
    ozgun: ozgunler.length,
    pozitif: pozitif.length,
    dengeliNegatif: negatif.length,
    tamNegatifCift: tamNegatif.length,
    enIyi,
    egri,
    kirpmaHaric: { enIyi: enIyiKirpmasiz, egri: egriKirpmasiz },
    turBazinda: Object.fromEntries(
      Object.entries(turBazinda).map(([t, s]) => [
        t,
        { adet: s.length, ortalama: s.reduce((a, b) => a + b, 0) / s.length, skorlar: s },
      ])
    ),
    tamNegatif,
  }
}

// ------------------------------------------------------------ DÜŞÜK ÇABA

function dusukCabaKademesi() {
  const yol = 'data/images/dusuk_caba_skorlari.json'
  if (!existsSync(yol)) {
    console.error(`${yol} yok. Önce: node scripts/skorla_dusuk_caba.mjs --out ${yol}`)
    process.exit(2)
  }
  const skorlar = Object.values(JSON.parse(readFileSync(yol, 'utf8'))).filter((k) => k.skor !== null)

  /*
    Burada dengeli/tam negatif ayrımı yok: kümenin kendisi zaten ikili
    etiketli (60 üretilmiş düşük çabalı · 500 gerçek fotoğraf). Yanlış pozitif
    oranı bütün gerçek fotoğraflar üzerinden — akışta karşılaşılan dağılım bu.
  */
  const pozitif = skorlar.filter((k) => k.etiket === 'dusuk_cabali').map((k) => k.skor)
  const negatif = skorlar.filter((k) => k.etiket === 'normal').map((k) => k.skor)

  const turBazinda = {}
  for (const k of skorlar) {
    if (k.etiket !== 'dusuk_cabali') continue
    ;(turBazinda[k.aile] ??= []).push(k.skor)
  }

  const esikler = Array.from({ length: 101 }, (_, i) => i / 100)
  const { egri, enIyi } = tara(pozitif, negatif, esikler, 'ustu')

  return {
    kademe: 'dusukCaba',
    olcu: 'Düşük çaba skoru (entropi + Laplas varyansı + tek renk oranı)',
    ozgun: negatif.length,
    pozitif: pozitif.length,
    dengeliNegatif: negatif.length,
    tamNegatifCift: negatif.length,
    enIyi,
    egri,
    turBazinda: Object.fromEntries(
      Object.entries(turBazinda).map(([t, s]) => [
        t,
        { adet: s.length, ortalama: s.reduce((a, b) => a + b, 0) / s.length, skorlar: s },
      ])
    ),
    tamNegatif: negatif,
  }
}

// ----------------------------------------------------------------- ÇIKTI

const istenen = arg('--kademe', 'hepsi')
const cikti = arg('--out', 'results/sweep.json')

const sonuc = {}
if (istenen === 'hepsi' || istenen === 'metin') sonuc.metin = metinKademesi()
if (istenen === 'hepsi' || istenen === 'gorsel') sonuc.gorsel = gorselKademesi()
if (istenen === 'hepsi' || istenen === 'dusukCaba') sonuc.dusukCaba = dusukCabaKademesi()

for (const k of Object.values(sonuc)) {
  console.log(`\n=== ${k.kademe.toUpperCase()} — ${k.olcu} ===`)
  console.log(`  ${k.ozgun} özgün · ${k.pozitif} pozitif · ${k.dengeliNegatif} dengeli negatif · ${k.tamNegatifCift} tam negatif çift`)
  const b = k.enIyi
  console.log(`  En iyi F1: eşik ${b.esik}  →  F1 ${b.f1.toFixed(4)} · kesinlik ${yuzde(b.kesinlik)} · duyarlılık ${yuzde(b.duyarlilik)}`)
  if (k.kirpmaHaric) {
    const c = k.kirpmaHaric.enIyi
    console.log(`  Kırpma hariç:  eşik ${c.esik}  →  F1 ${c.f1.toFixed(4)} · duyarlılık ${yuzde(c.duyarlilik)}`)
  }
  console.log('  Dönüşüm türü bazında ortalama skor:')
  for (const [t, v] of Object.entries(k.turBazinda)) {
    console.log(`    ${t.padEnd(24)} n=${String(v.adet).padStart(4)}  ortalama ${v.ortalama.toFixed(3)}`)
  }
}

mkdirSync(dirname(cikti), { recursive: true })
writeFileSync(cikti, JSON.stringify(sonuc, null, 1))
console.log(`\nTarama -> ${cikti}`)
