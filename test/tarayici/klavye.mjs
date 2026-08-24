/**
 * Klavyeyle uçtan uca gezinme denetimi.
 *
 * Fareye hiç dokunmadan tam akışı tamamlar:
 *   giriş → akış → gönderi paylaş → cüzdan → mağaza → sekme değiştir
 *   → Dene → kalıcı pencere → Al
 *
 * Her adımda odağın beklenen öğede olduğunu ve görünür bir odak halkası
 * bulunduğunu doğrular.
 *
 * Bu betik tarayıcı sürdüğü için puppeteer-core gerektirir ve bilerek
 * `npm test` dışında tutulmuştur; birim testleri bağımlılıksız kalsın diye.
 *   npm i --no-save puppeteer-core
 *   node test/tarayici/klavye.mjs
 */
import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ADRES = process.env.ADRES || 'http://localhost:3100'
const SINIR = 60 // sonsuz Tab döngüsüne karşı

let gecti = 0
let kaldi = 0
const kontrol = (ad, kosul, ek = '') => {
  if (kosul) {
    gecti++
    console.log(`  ✓ ${ad}`)
  } else {
    kaldi++
    console.log(`  ✗ ${ad} ${ek}`)
  }
}

const tarayici = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})
const sayfa = await tarayici.newPage()
await sayfa.setViewport({ width: 1280, height: 900 })

/** Odaktaki öğenin kimliğini döndürür */
const odak = () =>
  sayfa.evaluate(() => {
    const e = document.activeElement
    if (!e || e === document.body) return { etiket: '(gövde)', metin: '', halka: false }
    const s = getComputedStyle(e)
    // Erişilebilir adı, ekran okuyucunun kullandığı sırayla çözümle
    const bagliEtiket = e.id
      ? document.querySelector(`label[for="${e.id}"]`)?.textContent
      : null
    const ad =
      e.getAttribute('aria-label') ||
      bagliEtiket ||
      e.getAttribute('placeholder') ||
      e.textContent ||
      ''
    return {
      etiket: e.tagName.toLowerCase(),
      metin: ad.trim().slice(0, 45),
      rol: e.getAttribute('role') || '',
      // :focus-visible eşleşiyor ve görünür bir dış çizgi var mı?
      halka: e.matches(':focus-visible') && parseFloat(s.outlineWidth) > 0,
      modalIcinde: Boolean(e.closest('[role="dialog"]')),
    }
  })

/** Belirli bir metin/etiket odağa gelene kadar Tab'a basar */
async function tabla(arananParca) {
  for (let i = 0; i < SINIR; i++) {
    const o = await odak()
    if ((o.metin || '').toLowerCase().includes(arananParca.toLowerCase())) return o
    await sayfa.keyboard.press('Tab')
    await new Promise((r) => setTimeout(r, 60))
  }
  return null
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('\n▸ KLAVYEYLE UÇTAN UCA GEZİNME\n')
await sayfa.goto(ADRES, { waitUntil: 'networkidle2' })
await bekle(800)

// 1 — Giriş kapısı
console.log('— Giriş —')
const giris = await tabla('Demo olarak gir')
kontrol('giriş düğmesine Tab ile ulaşılıyor', giris !== null)
kontrol('giriş düğmesinde görünür odak halkası var', giris?.halka === true)
await sayfa.keyboard.press('Enter')
await bekle(600)
kontrol(
  'Enter ile akışa girildi',
  await sayfa.evaluate(() => document.body.innerText.includes('Ana akış'))
)

// 2 — Gönderi paylaşma
console.log('\n— Gönderi paylaşma —')
const alan = await tabla('Gönderi metni')
kontrol('metin alanına Tab ile ulaşılıyor', alan !== null)
await sayfa.keyboard.type(
  'Klavyeyle gezinme denetimi için yazılmış özgün bir deneme gönderisi metni.'
)
await bekle(200)
const paylas = await tabla('Paylaş')
kontrol('Paylaş düğmesine Tab ile ulaşılıyor', paylas !== null)
kontrol('Paylaş düğmesinde görünür odak halkası var', paylas?.halka === true)
await sayfa.keyboard.press('Enter')
await bekle(900)
kontrol(
  'gönderi akışta anında göründü (doğrulama beklenmedi)',
  await sayfa.evaluate(() => document.body.innerText.includes('Klavyeyle gezinme denetimi'))
)

// 3 — Cüzdan
console.log('\n— Cüzdan —')
const cuzdan = await tabla('Cüzdanı aç')
kontrol('cüzdan düğmesine Tab ile ulaşılıyor', cuzdan !== null)
await sayfa.keyboard.press('Enter')
await bekle(600)
kontrol(
  'cüzdan açıldı',
  await sayfa.evaluate(() => document.body.innerText.includes('Hareket defteri'))
)
const geri = await tabla('Akışa geri dön')
kontrol('geri düğmesine Tab ile ulaşılıyor', geri !== null)
await sayfa.keyboard.press('Enter')
await bekle(600)

// 4 — Mağaza ve sekmeler
console.log('\n— Mağaza ve sekmeler —')
const magaza = await tabla('Mağazayı aç')
kontrol('mağaza düğmesine Tab ile ulaşılıyor', magaza !== null)
await sayfa.keyboard.press('Enter')
await bekle(600)

const sekme = await tabla('Süreli')
kontrol('seçili sekmeye Tab ile ulaşılıyor', sekme !== null)
kontrol('sekmede görünür odak halkası var', sekme?.halka === true)

await sayfa.keyboard.press('ArrowRight')
await bekle(300)
const sonrakiSekme = await odak()
kontrol('sağ ok bir sonraki sekmeye geçiyor', sonrakiSekme.metin.includes('Sezonluk'), `→ ${sonrakiSekme.metin}`)
kontrol(
  'ok tuşu seçimi de taşıyor (otomatik etkinleştirme)',
  await sayfa.evaluate(() =>
    document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.includes('Sezonluk')
  )
)

await sayfa.keyboard.press('End')
await bekle(300)
kontrol('End son sekmeye gidiyor', (await odak()).metin.includes('İşlevsel'))
await sayfa.keyboard.press('Home')
await bekle(300)
kontrol('Home ilk sekmeye dönüyor', (await odak()).metin.includes('Süreli'))

// 5 — Kalıcı pencere
console.log('\n— Ürün önizleme penceresi —')
const dene = await tabla('Dene')
kontrol('Dene düğmesine Tab ile ulaşılıyor', dene !== null)
await sayfa.keyboard.press('Enter')
await bekle(600)

const ilkOdak = await odak()
kontrol('pencere açılınca odak içeri taşındı', ilkOdak.modalIcinde === true, `→ ${ilkOdak.metin}`)
kontrol(
  'pencere role=dialog + aria-modal taşıyor',
  await sayfa.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return Boolean(d && d.getAttribute('aria-modal') === 'true' && d.getAttribute('aria-labelledby'))
  })
)

// Odak tuzağı: pencere içinde çok kez Tab'lansa da dışarı çıkmamalı
let disariKacti = false
for (let i = 0; i < 12; i++) {
  await sayfa.keyboard.press('Tab')
  await bekle(50)
  if (!(await odak()).modalIcinde) {
    disariKacti = true
    break
  }
}
kontrol('odak tuzağı çalışıyor (odak pencereden çıkmıyor)', !disariKacti)

// Escape ile kapanma ve odağın geri dönmesi
await sayfa.keyboard.press('Escape')
await bekle(500)
kontrol(
  'Escape ile pencere kapandı',
  await sayfa.evaluate(() => !document.querySelector('[role="dialog"]'))
)
kontrol('kapanınca odak Dene düğmesine geri döndü', (await odak()).metin.includes('Dene'))

// 6 — Satın alma
console.log('\n— Satın alma —')
await sayfa.keyboard.press('Enter')
await bekle(600)
const alDugmesi = await tabla('Al')
kontrol('Al düğmesine Tab ile ulaşılıyor', alDugmesi !== null)
kontrol('Al düğmesinde görünür odak halkası var', alDugmesi?.halka === true)
await sayfa.keyboard.press('Enter')
await bekle(800)
kontrol(
  'satın alma tamamlandı ve duyuruldu',
  await sayfa.evaluate(() => document.body.innerText.includes('alındı'))
)

console.log(`\n${'='.repeat(46)}`)
console.log(`KLAVYE DENETİMİ: ${gecti} geçti, ${kaldi} kaldı`)
console.log('='.repeat(46))

await tarayici.close()
process.exit(kaldi > 0 ? 1 : 0)
