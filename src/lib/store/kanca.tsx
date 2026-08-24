"use client"

import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import {
  abone,
  anlikGoruntu,
  dogrulamaTetikle,
  gonderiEkle,
  hidratla,
  itirazEt,
  resetToDemo,
  sunucuGoruntusu,
  urunAcKapa,
  urunSatinAl,
} from './depo'

/**
 * Depo React dışında yaşadığı için bir Context'e gerek yok;
 * bu bileşen yalnızca hidrasyon tamamlanana kadar geçici bir ekran gösterir.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { hidre } = useSyncExternalStore(abone, anlikGoruntu, sunucuGoruntusu)

  // localStorage harici bir kaynak; depoyu doldurmak setState değil, dış sistemle eşitlemedir.
  useEffect(() => {
    hidratla()
  }, [])

  if (!hidre) {
    return (
      <div
        className="min-h-screen bg-page flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Yükleniyor</span>
        <div className="h-px w-32 bg-brand/40 animate-pulse" aria-hidden="true" />
      </div>
    )
  }

  return <>{children}</>
}

export function useStore() {
  const { veri } = useSyncExternalStore(abone, anlikGoruntu, sunucuGoruntusu)

  return {
    state: veri,
    resetToDemo,
    gonderiEkle,
    urunSatinAl,
    urunAcKapa,
    itirazEt,
    dogrulamaTetikle,
  }
}
