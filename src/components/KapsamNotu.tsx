"use client"

import { useEffect } from "react"
import { Info } from "lucide-react"

/**
 * Kapsam dışı bölüm bildirimi.
 *
 * Ev sahibi kromasında prototipin kapsamına girmeyen bölümler var (Keşfet,
 * Topluluklar, Kaydedilenler…). Bunları çizip tıklanınca sessiz
 * bırakmak, kullanıcıya arızalı bir arayüz izlenimi verir; tamamen çıkarmak
 * ise NSosyal'ın kalıbını tanınmaz hale getirir. Üçüncü yol: düğme gerçek,
 * yanıtı da gerçek — "bu bölüm bu prototipin kapsamında değil".
 *
 * role="status" + aria-live="polite": odak çalınmaz, ekran okuyucu sırası
 * gelince okur. Odak tuzağı yok, çünkü bu bir diyalog değil.
 */
export function KapsamNotu({ ad, onKapat }: { ad: string; onKapat: () => void }) {
  useEffect(() => {
    const zamanlayici = setTimeout(onKapat, 4000)
    return () => clearTimeout(zamanlayici)
  }, [ad, onKapat])

  return (
    <div
      className="fixed left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
    >
      <p
        role="status"
        aria-live="polite"
        className="mihenk-alttan bg-card border border-line-strong text-primary text-[13px] rounded-full px-4 py-2 shadow-lg flex items-center gap-2 max-w-sm"
      >
        <Info size={15} className="text-secondary shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">{ad}</strong> bu prototipin
          kapsamında değil — MİHENK doğrulama ve ödül katmanını gösteriyor.
        </span>
      </p>
    </div>
  )
}
