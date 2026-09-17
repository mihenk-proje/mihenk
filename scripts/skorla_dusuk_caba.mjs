/**
 * Düşük çaba skorlarını üretir — hash_gorseller.mjs ile aynı desen.
 *
 * `olcDusukCaba` canvas ve `Image` istiyor, yani Node'da doğrudan çalışmaz.
 * Algoritmayı portlamak ikinci bir uygulama yaratır. Bunun yerine iş ikiye
 * bölünür ve iki yarı da GERÇEK kaynaktan gelir:
 *
 *   tarayıcı  piksel çıkarımı — `olcDusukCaba` ve `laplasVaryansi`, tür
 *             soyulmuş haliyle birebir enjekte edilir
 *   Node      puanlama — `gorselDusukCabaSkoru` doğrudan içe aktarılır
 *
 * Neden bölünüyor: `gorselDusukCabaSkoru` dokuz modül düzeyi sabite ve
 * yardımcıya bağlı (eşik, ağırlıklar, kelepçe…). Onları tek tek sayfaya
 * taşımak, biri değişince sessizce eskiyen ikinci bir kopya demek. Sayfada
 * puanlayıcının yerine ham ölçümleri yakalayan bir geçit durur; ham ölçümler
 * Node'a döner ve orada gerçek puanlayıcıdan geçer.
 *
 * İlk sürüm bunu yapmıyordu ve 560 görselin hepsi 1,000 skor aldı: sayfada
 * tanımsız kalan puanlayıcı ReferenceError fırlatıyor, `catch` dalı
 * "işlenemedi" varsayılanını döndürüyordu. Ölçüm gibi görünen bir hata.
 *
 * NEDEN GEREKİYOR: düşük çaba kademesinin POZİTİF tarafı hazırdı (60 üretilmiş
 * görsel, lowquality_manifest.jsonl), negatif tarafı değil. Tek yanlı bir
 * duyarlılık sayısı yanıltıcı olurdu, o yüzden results/metrics.json bu kademeyi
 * "ölçülmedi" diye işaretliyordu. Bu betik negatif tarafı üretir.
 *
 *   node scripts/skorla_dusuk_caba.mjs --out data/images/dusuk_caba_skorlari.json
 */
import { register } from 'node:module'
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import puppeteer from 'puppeteer-core'

register('../test/cozumleyici.mjs', import.meta.url)
const { olcDusukCaba, gorselDusukCabaSkoru, laplasVaryansi } =
  await import('../src/lib/verification/index.ts')

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(ad)
  return i === -1 ? varsayilan : process.argv[i + 1]
}
const cikti = arg('--out', 'data/images/dusuk_caba_skorlari.json')

const TURLER = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.html': 'text/html; charset=utf-8',
}

function sunucuBaslat(kok) {
  return new Promise((coz) => {
    const s = createServer((istek, yanit) => {
      const yol = normalize(decodeURIComponent(istek.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
      const tam = join(kok, yol)
      if (!tam.startsWith(kok) || !existsSync(tam) || statSync(tam).isDirectory()) {
        yanit.writeHead(404).end()
        return
      }
      yanit.writeHead(200, {
        'Content-Type': TURLER[extname(tam).toLowerCase()] ?? 'application/octet-stream',
      })
      createReadStream(tam).pipe(yanit)
    })
    s.listen(0, '127.0.0.1', () => coz({ sunucu: s, port: s.address().port }))
  })
}

const jsonl = (yol) =>
  readFileSync(yol, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))

/*
  POZİTİF: üretilmiş düşük çabalı görseller (tek renk, bulanık, gürültü).
  NEGATİF: gerçek fotoğraflar. manifest.jsonl'deki "normal" kümesi kullanılıyor;
  "originals" kümesi görsel ÖZGÜNLÜK taramasının ebeveynleri ve oraya karışması
  iki ölçümü birbirine bağlardı.
*/
const kayitlar = [
  ...jsonl('data/images/lowquality_manifest.jsonl').map((r) => ({
    id: r.id,
    yol: r.image_path,
    etiket: 'dusuk_cabali',
    aile: r.aile,
  })),
  ...jsonl('data/images/manifest.jsonl')
    .filter((r) => r.kume === 'normal')
    .map((r) => ({ id: r.id, yol: r.image_path, etiket: 'normal', aile: null })),
]

console.log(
  `${kayitlar.length} görsel — ${kayitlar.filter((k) => k.etiket === 'dusuk_cabali').length} düşük çabalı · ` +
    `${kayitlar.filter((k) => k.etiket === 'normal').length} normal`
)

const { sunucu, port } = await sunucuBaslat(process.cwd())
const tarayici = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
  protocolTimeout: 120000,
})
const sayfa = await tarayici.newPage()
await sayfa.goto(`http://127.0.0.1:${port}/scripts/hash-sayfa.html`, {
  waitUntil: 'domcontentloaded',
})

// Tesisat — ölçülen algoritma değil, yalnızca yükleme sarmalayıcısı
await sayfa.evaluate(`
  window.gorselYukle = function (imageUrl) {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = imageUrl
    })
  }
`)
// Piksel çıkarımı — çalışma zamanı kaynağından birebir
await sayfa.evaluate(`window.laplasVaryansi = ${laplasVaryansi.toString()}`)
await sayfa.evaluate(`window.olcDusukCaba = ${olcDusukCaba.toString()}`)
/*
  Puanlayıcının yerine geçit: ham ölçümleri yakalar, biçimsel bir sonuç
  döndürür ki `olcDusukCaba` hatasız tamamlansın. Gerçek puanlama Node'da.
*/
await sayfa.evaluate(`
  window.gorselDusukCabaSkoru = function (olculer) {
    window.__olculer = olculer
    return { skor: 0, bilesenler: {}, dusukCabaMi: false, gerekce: [] }
  }
`)

const sonuc = {}
let hata = 0
for (let i = 0; i < kayitlar.length; i++) {
  const { id, yol, etiket, aile } = kayitlar[i]
  const ham = await sayfa.evaluate(async (u) => {
    window.__olculer = null
    const sonuc = await window.olcDusukCaba(u)
    return { olculer: window.__olculer, gerekce: sonuc.gerekce }
  }, `http://127.0.0.1:${port}/${yol}`)

  if (!ham.olculer) {
    hata++
    sonuc[id] = { etiket, aile, skor: null, dusukCabaMi: null, hata: ham.gerekce?.[0] ?? 'ölçüm yok' }
    continue
  }
  // Gerçek puanlayıcı, gerçek içe aktarımdan
  const puan = gorselDusukCabaSkoru(ham.olculer)
  sonuc[id] = { etiket, aile, olculer: ham.olculer, skor: puan.skor, dusukCabaMi: puan.dusukCabaMi }
  if ((i + 1) % 100 === 0) console.log(`  ${i + 1} / ${kayitlar.length}`)
}

await tarayici.close()
sunucu.close()

writeFileSync(cikti, JSON.stringify(sonuc))
console.log(`\n${Object.keys(sonuc).length} skor -> ${cikti}${hata ? `  (${hata} yüklenemedi)` : ''}`)
