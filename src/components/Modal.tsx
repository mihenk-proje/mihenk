"use client"

import { useEffect, useRef } from "react"

const ODAKLANABILIR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Erişilebilir kalıcı pencere: Escape ile kapanır, odak içeride döner ve
 * kapanınca odak çağıran öğeye geri verilir (WCAG 2.1.2 / 2.4.3).
 */
export function Modal({
  onClose,
  labelledBy,
  describedBy,
  children,
  className = '',
}: {
  onClose: () => void
  /** Pencere başlığını taşıyan öğenin id'si */
  labelledBy: string
  /** Pencerenin ne işe yaradığını anlatan metnin id'si */
  describedBy?: string
  children: React.ReactNode
  className?: string
}) {
  const kutuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const oncekiOdak = document.activeElement as HTMLElement | null
    const kutu = kutuRef.current
    kutu?.querySelector<HTMLElement>(ODAKLANABILIR)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !kutu) return

      const odaklanabilirler = Array.from(kutu.querySelectorAll<HTMLElement>(ODAKLANABILIR))
      if (odaklanabilirler.length === 0) return

      const ilk = odaklanabilirler[0]
      const son = odaklanabilirler[odaklanabilirler.length - 1]

      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault()
        son.focus()
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault()
        ilk.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      oncekiOdak?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-page/85 backdrop-blur-sm mihenk-solgunlas"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={kutuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={`bg-card w-full rounded-2xl border border-brand/30 overflow-hidden shadow-2xl ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
