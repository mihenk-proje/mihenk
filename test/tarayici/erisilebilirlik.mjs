/**
 * axe-core ile WCAG denetimi — bütün ekranlar, iki tema, iki genişlik.
 *
 * Lighthouse yalnızca girilen adresi ölçer; MİHENK'in ekranlarının çoğu giriş
 * kapısının arkasında ve tam ekran katman olarak açılıyor. Bu betik Chrome'u
 * sürerek her ekrana gider ve axe-core'u o anki DOM üzerinde çalıştırır.
 *
 * Kapsam: wcag2a, wcag2aa, wcag21a, wcag21aa.
 *
 * Tarayıcı sürdüğü için bilerek `npm test` dışındadır; birim testleri
 * bağımlılıksız kalsın diye.
 *   npm run build && npm start -- -p 3100
 *   npm i --no-save puppeteer-core axe-core
 *   node test/tarayici/erisilebilirlik.mjs
 *
 * Tema başına ayrı tarayıcı açılır: uzun koşuda tek bir Chrome örneği
 * düşerse bütün denetim sessizce asılı kalıyordu.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ADRES = process.env.ADRES || 'http://localhost:3100'
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8')

const bekle = (ms) => new Promise((r) => setTimeout(r, ms))

/*
  Her ekran, giriş kapısından oraya varmak için gereken adımlarla tanımlanır.
  'gir'  → demo girişine bas
  'esc'  → ilk girişte açılan tanıtım turunu kapat
  diğeri → erişilebilir adı bu parçayı içeren düğmeye bas
*/
const EKRANLAR = [
  ['Giriş', []],
  ['Ana akış', ['gir', 'esc']],
  ['Tanıtım turu', ['gir']],
  ['Yan çekmece', ['gir', 'esc', 'menüyü aç']],
  ['Cüzdan', ['gir', 'esc', 'cüzdanı aç']],
  ['Mağaza', ['gir', 'esc', 'mağazayı aç']],
  ['Ürün önizleme', ['gir', 'esc', 'mağazayı aç', 'dene']],
  ['Profil', ['gir', 'esc', 'profil']],
  ['Bildirimler', ['gir', 'esc', 'bildirimler']],
  ['Yazma katmanı', ['gir', 'esc', 'gönderi oluştur']],
]

const DURUMLAR = [
  ['light', 390],
  ['dark', 390],
  ['light', 1280],
  ['dark', 1280],
]

console.log('\n▸ AXE-CORE WCAG DENETİMİ\n')

let toplamIhlal = 0
let sayi = 0

for (const [tema, genislik] of DURUMLAR) {
  const tarayici = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
    protocolTimeout: 60000,
  })

  for (const [ad, adimlar] of EKRANLAR) {
    try {
      const sayfa = await tarayici.newPage()
      await sayfa.setViewport({ width: genislik, height: genislik === 390 ? 844 : 900 })
      await sayfa.evaluateOnNewDocument((t) => {
        try {
          localStorage.setItem('theme', t)
        } catch {
          // özel sekmede yazılamayabilir; varsayılan tema kullanılır
        }
      }, tema)
      await sayfa.goto(ADRES, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await bekle(900)

      for (const adim of adimlar) {
        if (adim === 'esc') {
          await sayfa.keyboard.press('Escape')
        } else {
          await sayfa.evaluate(
            (t) =>
              [...document.querySelectorAll('button')]
                .find((b) =>
                  ((b.getAttribute('aria-label') || b.textContent) ?? '')
                    .toLowerCase()
                    .includes(t)
                )
                ?.click(),
            adim === 'gir' ? 'demo olarak gir' : adim
          )
        }
        await bekle(700)
      }

      await sayfa.evaluate(AXE)
      const ihlaller = await sayfa.evaluate(async () => {
        const sonuc = await window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        })
        return sonuc.violations.map((v) => ({
          id: v.id,
          etki: v.impact,
          adet: v.nodes.length,
          hedef: v.nodes[0]?.target?.[0],
        }))
      })

      toplamIhlal += ihlaller.length
      sayi++
      const etiket = `${(tema === 'light' ? 'açık' : 'koyu').padEnd(5)} ${String(genislik).padStart(4)}px  ${ad.padEnd(15)}`
      console.log(
        ihlaller.length === 0
          ? `  ✓ ${etiket} temiz`
          : `  ✗ ${etiket} ${JSON.stringify(ihlaller)}`
      )
      await sayfa.close()
    } catch (e) {
      toplamIhlal++
      console.log(`  ✗ ${tema} ${genislik} ${ad} — denetim çalıştırılamadı: ${e.message}`)
    }
  }

  await tarayici.close()
}

console.log(`\n${'='.repeat(46)}`)
console.log(`ERİŞİLEBİLİRLİK: ${sayi} ekran denetlendi, ${toplamIhlal} ihlal`)
console.log('='.repeat(46))

process.exit(toplamIhlal > 0 ? 1 : 0)
