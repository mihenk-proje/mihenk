"use client"

import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import {
  abone,
  anlikGoruntu,
  dogrulamaTetikle,
  gonderiEkle,
  hidratla,
  itirazEt,
  mesajGonder,
  resetToDemo,
  sunucuGoruntusu,
  urunAcKapa,
  urunSatinAl,
} from './depo'

/**
 * Depo React dışında yaşadığı için bir Context'e gerek yok; bu bileşen
 * yalnızca hidrasyonu tetikler.
 *
 * Hiçbir kapı yok — çocuklar sunucuda da render edilir. Sebep ölçülmüş:
 * sağlayıcı hidrasyonu beklerken ilk HTML yalnızca yükleme iskeletini
 * taşıyordu, giriş ekranı ancak JS indikten sonra boyanıyordu ve kısıtlı
 * ağda LCP 4,1 sn'ye çıkıyordu (Lighthouse mobil performansı 84). Giriş
 * ekranı depodan hiçbir şey okumuyor; sunucuda basılmaması için sebep yok.
 *
 * Depoya ihtiyaç duyan ekranlar DepoYukleniyor'u kendileri gösterir; hangi
 * ekranın beklemesi gerektiğini sayfa bilir, sağlayıcı değil.
 *
 * Tarayıcıya özgü başlangıç durumu (sessionStorage) page.tsx'te ilk
 * render'da okunmaz; okunsaydı sunucu giriş ekranını, istemci akışı basar
 * ve hidrasyon uyuşmazlığı doğardı.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  // localStorage harici bir kaynak; depoyu doldurmak setState değil, dış sistemle eşitlemedir.
  useEffect(() => {
    hidratla()
  }, [])

  return <>{children}</>
}

export function DepoYukleniyor() {
  return (
    <div
      className="min-h-dvh bg-page flex flex-col items-center justify-center gap-4"
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

export function useStore() {
  const { veri, hidre } = useSyncExternalStore(abone, anlikGoruntu, sunucuGoruntusu)

  return {
    state: veri,
    hidre,
    resetToDemo,
    gonderiEkle,
    urunSatinAl,
    urunAcKapa,
    itirazEt,
    mesajGonder,
    dogrulamaTetikle,
  }
}
