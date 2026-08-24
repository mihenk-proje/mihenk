/**
 * Test kosucusu. Cozumleyici kancasini kaydeder, tarayici API'lerini
 * taklit eder ve tum test dosyalarini sirayla calistirir.
 */
import { register } from 'node:module'
import { readdirSync } from 'node:fs'

register('./cozumleyici.mjs', import.meta.url)

// Tarayici ortami taklidi: depo katmani localStorage ve window bekler
const kutu = new Map()
globalThis.localStorage = {
  getItem: (k) => (kutu.has(k) ? kutu.get(k) : null),
  setItem: (k, v) => kutu.set(k, String(v)),
  removeItem: (k) => kutu.delete(k),
  clear: () => kutu.clear(),
}
globalThis.window = {
  setTimeout: setTimeout.bind(globalThis),
  clearTimeout: clearTimeout.bind(globalThis),
}

let toplamGecti = 0
let toplamKaldi = 0

const dosyalar = readdirSync(new URL('.', import.meta.url))
  .filter((d) => d.endsWith('.test.mjs'))
  .sort()

for (const dosya of dosyalar) {
  const modul = await import(new URL(dosya, import.meta.url).href)
  const { gecti, kaldi } = await modul.calistir()
  toplamGecti += gecti
  toplamKaldi += kaldi
}

console.log(`\n${'='.repeat(46)}`)
console.log(`TOPLAM: ${toplamGecti} geçti, ${toplamKaldi} kaldı`)
console.log('='.repeat(46))

process.exit(toplamKaldi > 0 ? 1 : 0)
