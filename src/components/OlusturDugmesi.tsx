"use client"

import { PenLine } from "lucide-react"

/**
 * NSosyal oluştur düğmesi (FAB).
 *
 * Kimlik gradyanını taşıyan tek yüzen öğe. Alt gezintinin üstünde durur ve
 * güvenli alan dolgusunu hesaba katar.
 *
 * Tam ekran yazma katmanını açar (YazmaKatmani). İlk sürümde gömülü alana
 * odaklanıyordu; telefonda sayfayı yukarı kaydırıp küçük bir kutuya
 * odaklanmak, referans uygulamanın tam ekran yazma deneyiminin yanında
 * eksik kalıyordu.
 */
export function OlusturDugmesi({ onAc }: { onAc: () => void }) {
  return (
    <button
      type="button"
      onClick={onAc}
      className="nsosyal-aksiyon fixed right-4 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Gönderi oluştur"
    >
      <PenLine size={24} aria-hidden="true" />
    </button>
  )
}
