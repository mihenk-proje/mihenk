/**
 * prefers-reduced-motion doğrulaması.
 *
 * Hareketi azaltma tercihinde animasyon ve geçişlerin durduğunu, buna
 * rağmen hiçbir bilginin kaybolmadığını (öğeler son durumlarında görünür
 * kaldığını) kontrol eder.
 *
 *   npm i --no-save puppeteer-core
 *   node test/tarayici/hareket.mjs
 */
import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ADRES = process.env.ADRES || 'http://localhost:3100'

let gecti = 0
let kaldi = 0
const kontrol = (ad, kosul, ek = '') => {
  if (kosul) { gecti++; console.log(`  ✓ ${ad}`) }
  else { kaldi++; console.log(`  ✗ ${ad} ${ek}`) }
}
const bekle = (ms) => new Promise((r) => setTimeout(r, ms))

const tarayici = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})

async function olc(azalt) {
  const sayfa = await tarayici.newPage()
  await sayfa.setViewport({ width: 1280, height: 900 })
  if (azalt) {
    await sayfa.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ])
  }
  await sayfa.goto(ADRES, { waitUntil: 'networkidle2' })
  await bekle(600)

  const tikla = async (etiketParcasi) => {
    await sayfa.evaluate((t) => {
      const d = [...document.querySelectorAll('button')].find((b) =>
        ((b.getAttribute('aria-label') || b.textContent) ?? '').includes(t)
      )
      d?.click()
    }, etiketParcasi)
    await bekle(500)
  }

  await tikla('Demo olarak gir')
  await tikla('Cüzdanı aç')

  const cuzdan = await sayfa.evaluate(() => {
    const katman = document.querySelector('.mihenk-sagdan')
    const cubuk = document.querySelector('[role="progressbar"] > div')
    const k = katman ? getComputedStyle(katman) : null
    const c = cubuk ? getComputedStyle(cubuk) : null
    return {
      katmanSure: k?.animationDuration ?? null,
      katmanGorunur: k ? parseFloat(k.opacity) === 1 : false,
      cubukGenislik: c?.width ?? null,
      cubukGecis: c?.transitionDuration ?? null,
      sinirMetni: document.body.innerText.includes('Günlük üst sınır'),
    }
  })

  await tikla('Akışa geri dön')
  await tikla('Mağazayı aç')
  await tikla('Dene')

  const pencere = await sayfa.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    const dis = d?.parentElement
    const s = d ? getComputedStyle(d) : null
    const ds = dis ? getComputedStyle(dis) : null
    return {
      acik: Boolean(d),
      gorunur: s ? parseFloat(s.opacity) === 1 : false,
      disSure: ds?.animationDuration ?? null,
      metinVar: (d?.textContent ?? '').includes('Önizleme'),
    }
  })

  await sayfa.close()
  return { cuzdan, pencere }
}

console.log('\n▸ HAREKETİ AZALTMA TERCİHİ\n')

const normal = await olc(false)
console.log('— Tercih kapalıyken (karşılaştırma) —')
console.log(`  katman animasyon süresi : ${normal.cuzdan.katmanSure}`)
console.log(`  çubuk geçiş süresi      : ${normal.cuzdan.cubukGecis}`)
console.log(`  pencere dış animasyonu  : ${normal.pencere.disSure}`)

const azalt = await olc(true)
console.log('\n— Tercih açıkken —')
console.log(`  katman animasyon süresi : ${azalt.cuzdan.katmanSure}`)
console.log(`  çubuk geçiş süresi      : ${azalt.cuzdan.cubukGecis}`)
console.log(`  pencere dış animasyonu  : ${azalt.pencere.disSure}`)

console.log('\n— Hareket durdu mu? —')
const sifir = (v) => v !== null && parseFloat(v) <= 0.001
kontrol('katman giriş animasyonu durdu', sifir(azalt.cuzdan.katmanSure), `→ ${azalt.cuzdan.katmanSure}`)
kontrol('cüzdan çubuğu geçişi durdu', sifir(azalt.cuzdan.cubukGecis), `→ ${azalt.cuzdan.cubukGecis}`)
kontrol('pencere giriş animasyonu durdu', sifir(azalt.pencere.disSure), `→ ${azalt.pencere.disSure}`)

console.log('\n— Bilgi kaybı var mı? —')
kontrol('cüzdan katmanı tam görünür', azalt.cuzdan.katmanGorunur)
kontrol('günlük üst sınır metni duruyor', azalt.cuzdan.sinirMetni)
kontrol(
  'ilerleme çubuğu genişliği korundu',
  azalt.cuzdan.cubukGenislik === normal.cuzdan.cubukGenislik,
  `→ ${azalt.cuzdan.cubukGenislik} / ${normal.cuzdan.cubukGenislik}`
)
kontrol('kalıcı pencere açıldı ve görünür', azalt.pencere.acik && azalt.pencere.gorunur)
kontrol('pencere içeriği duruyor', azalt.pencere.metinVar)

console.log(`\n${'='.repeat(46)}`)
console.log(`HAREKET DENETİMİ: ${gecti} geçti, ${kaldi} kaldı`)
console.log('='.repeat(46))

await tarayici.close()
process.exit(kaldi > 0 ? 1 : 0)
