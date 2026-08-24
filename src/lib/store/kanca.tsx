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
        className="min-h-screen bg-page flex flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        {/*
          Ilk boyamada gorunur metin bulunmali. Yalnizca ekran okuyucuya ozel
          metin ve 1 piksellik bir cizgi birakilirsa tarayici "contentful paint"
          saymaz; Lighthouse bunu NO_FCP olarak raporlar ve olcum yapilamaz.
        */}
        <span className="font-display font-bold text-3xl tracking-tight text-primary">
          MİHENK
        </span>
        <span className="text-secondary text-sm">Yükleniyor…</span>
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
