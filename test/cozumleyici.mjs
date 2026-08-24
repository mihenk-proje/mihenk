/**
 * Node icin modul cozumleyici kancasi.
 *
 * Testler kaynak dosyalari dogrudan calistirir (Node 22+ TypeScript'i
 * kendisi soyar), ancak Node iki seyi bilmez:
 *   - tsconfig'deki "@/*" takma adi
 *   - uzantisiz ve klasor iceri aktarimlari (./depo, @/lib/verification)
 * Bu kanca ikisini de Next'in davranisina esitler.
 */
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KOK = fileURLToPath(new URL('../src/', import.meta.url))

function duzelt(yol) {
  if (existsSync(yol) && statSync(yol).isDirectory()) {
    const dizinIndeksi = yol.replace(/\/$/, '') + '/index.ts'
    if (existsSync(dizinIndeksi)) return dizinIndeksi
  }
  if (existsSync(yol)) return yol
  for (const uzanti of ['.ts', '.tsx', '/index.ts']) {
    if (existsSync(yol + uzanti)) return yol + uzanti
  }
  return yol
}

export function resolve(spec, ctx, next) {
  if (spec.startsWith('@/')) {
    return next(pathToFileURL(duzelt(KOK + spec.slice(2))).href, ctx)
  }
  if (spec.startsWith('.') && ctx.parentURL?.startsWith('file:')) {
    const mutlak = fileURLToPath(new URL(spec, ctx.parentURL))
    return next(pathToFileURL(duzelt(mutlak)).href, ctx)
  }
  return next(spec, ctx)
}
