"use client"

import type { DogrulamaSonucu } from "@/lib/store/types"
import { GonderiOlustur } from "./GonderiOlustur"
import { KatmanEkran } from "./KatmanEkran"

/**
 * Tam ekran yazma katmanı — referans uygulamanın "Yeni Gönderi Paylaş" ekranı.
 *
 * Yüzen düğme önceden akıştaki gömülü alana odaklanıyordu; masaüstünde
 * mantıklı, telefonda değil. Artık aynı bileşen burada tam ekran açılıyor.
 * Gömülü kutu yerinde duruyor: demoda "paylaş" kutusu akışta görünmeye
 * devam ediyor.
 *
 * Aynı bileşenin ikinci kurulumu olduğu için id öneki FARKLI verilir —
 * bkz. GonderiOlustur'daki idOneki açıklaması.
 */
export function YazmaKatmani({
  onKapat,
  onDogrulamaSonucu,
}: {
  onKapat: () => void
  onDogrulamaSonucu: (sonuc: DogrulamaSonucu) => void
}) {
  return (
    <KatmanEkran baslik="Yeni Gönderi Paylaş" onBack={onKapat}>
      <div className="-mx-4 -mt-5">
        <GonderiOlustur
          idOneki="yazma"
          onDogrulamaSonucu={onDogrulamaSonucu}
          onPaylasildi={onKapat}
        />
      </div>
    </KatmanEkran>
  )
}
