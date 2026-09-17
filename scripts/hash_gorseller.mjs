/**
 * Görsel manifestleri için dHash hesaplar ve önbelleğe yazar.
 *
 * NEDEN AYRI BİR ADIM: `hesaplaDHash` canvas ve `Image` istiyor, yani Node'da
 * doğrudan çalışmaz. Algoritmayı Python'a ya da Node'a portlamak ikinci bir
 * uygulama yaratır ve ölçüm ile çalışma zamanı sessizce sapabilir. Bunun
 * yerine fonksiyonun KENDİSİ — çalışma zamanında kullanılan kaynaktan, tür
 * soyulmuş haliyle — başsız Chrome'a enjekte edilir.
 *
 * Sayfaya yalnızca görsel yükleme tesisatı (`gorselYukle`) ayrıca verilir;
 * o modül içi bir yardımcıdır ve ölçülen şey değildir. Ölçülen algoritmanın
 * tek bir kaynağı vardır: src/lib/verification/index.ts.
 *
 * Görseller yerel bir HTTP sunucusundan servis edilir. file:// ile açılan
 * görseller canvas'ı kirletir ve getImageData güvenlik hatası verir.
 *
 *   node scripts/hash_gorseller.mjs \
 *     --manifest data/images/manifest.jsonl \
 *     --manifest data/images/variants_manifest.jsonl \
 *     --out data/images/dhash.json
 */
import { register } from 'node:module'
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import puppeteer from 'puppeteer-core'

register('../test/cozumleyici.mjs', import.meta.url)
const { hesaplaDHash } = await import('../src/lib/verification/index.ts')

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function argumanlar() {
  const a = process.argv.slice(2)
  const manifestler = []
  let cikti = 'data/images/dhash.json'
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--manifest') manifestler.push(a[++i])
    else if (a[i] === '--out') cikti = a[++i]
  }
  if (!manifestler.length) {
    console.error('En az bir --manifest gerekir.')
    process.exit(2)
  }
  return { manifestler, cikti }
}

const TURLER = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  // Çalışma sayfası: tür verilmezse Chrome belgeyi indirir, açmaz.
  '.html': 'text/html; charset=utf-8',
}

/** Depo kökünü servis eden asgari sunucu; yol kaçışına izin vermez. */
function sunucuBaslat(kok) {
  return new Promise((coz) => {
    const s = createServer((istek, yanit) => {
      const yol = normalize(decodeURIComponent(istek.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
      const tam = join(kok, yol)
      if (!tam.startsWith(kok) || !existsSync(tam) || statSync(tam).isDirectory()) {
        yanit.writeHead(404).end()
        return
      }
      yanit.writeHead(200, { 'Content-Type': TURLER[extname(tam).toLowerCase()] ?? 'application/octet-stream' })
      createReadStream(tam).pipe(yanit)
    })
    s.listen(0, '127.0.0.1', () => coz({ sunucu: s, port: s.address().port }))
  })
}

const { manifestler, cikti } = argumanlar()

const kayitlar = []
for (const m of manifestler) {
  for (const satir of readFileSync(m, 'utf8').split('\n')) {
    if (!satir.trim()) continue
    const r = JSON.parse(satir)
    if (r.image_path) kayitlar.push({ id: r.id, yol: r.image_path })
  }
}
console.log(`${kayitlar.length} görsel, ${manifestler.length} manifest`)

const { sunucu, port } = await sunucuBaslat(process.cwd())
const tarayici = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
  protocolTimeout: 120000,
})
const sayfa = await tarayici.newPage()
/*
  Sayfa, görsellerle AYNI kökenden servis edilmeli. about:blank ya da
  setContent ile kurulan bir belge farklı köken sayılır, canvas kirlenir ve
  getImageData güvenlik hatası verir — her hash boş döner.
*/
await sayfa.goto(`http://127.0.0.1:${port}/scripts/hash-sayfa.html`, { waitUntil: 'domcontentloaded' })

/*
  Tesisat: modül içi yardımcının sayfadaki karşılığı. Ölçülen algoritma değil,
  yalnızca görselin yüklenmesini bekleyen sarmalayıcı.
*/
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
// Ölçülen algoritma, çalışma zamanı kaynağından birebir
await sayfa.evaluate(`window.hesaplaDHash = ${hesaplaDHash.toString()}`)

const sonuc = {}
let bos = 0
for (let i = 0; i < kayitlar.length; i++) {
  const { id, yol } = kayitlar[i]
  const hash = await sayfa.evaluate(
    (u) => window.hesaplaDHash(u),
    `http://127.0.0.1:${port}/${yol}`
  )
  if (!hash) bos++
  sonuc[id] = hash
  if ((i + 1) % 250 === 0) console.log(`  ${i + 1} / ${kayitlar.length}`)
}

await tarayici.close()
sunucu.close()

writeFileSync(cikti, JSON.stringify(sonuc, null, 0))
console.log(`\n${Object.keys(sonuc).length} hash -> ${cikti}${bos ? `  (${bos} boş)` : ''}`)
