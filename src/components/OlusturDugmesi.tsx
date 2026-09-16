"use client"

import { PenLine } from "lucide-react"

/**
 * NSosyal oluştur düğmesi (FAB).
 *
 * Kimlik gradyanını taşıyan tek yüzen öğe. Alt gezintinin üstünde durur ve
 * güvenli alan dolgusunu hesaba katar.
 *
 * Yeni bir yazma ekranı açmaz; sayfadaki gönderi alanına odaklanır. Demo tek
 * ekran üzerinde kurulu olduğu için ikinci bir oluşturma yüzeyi açmak aynı
 * alanı iki kez kurmak olurdu.
 */
export function OlusturDugmesi() {
  return (
    <button
      type="button"
      onClick={() => {
        const alan = document.getElementById('gonderi-metni')
        alan?.scrollIntoView({ block: 'center' })
        alan?.focus()
      }}
      className="nsosyal-aksiyon fixed right-4 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Gönderi oluştur"
    >
      <PenLine size={24} aria-hidden="true" />
    </button>
  )
}
