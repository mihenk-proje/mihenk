"use client"

import { useEffect, useRef } from 'react'

const ODAKLANABILIR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Tam ekran katmanlar (Cüzdan, Mağaza) için odak yönetimi.
 *
 * Bu katmanlar `fixed inset-0` ile akışın üstüne biniyor ama DOM'da onun
 * kardeşi olarak duruyor. Odak taşınmazsa klavye kullanıcısı katmana
 * ulaşmak için arkadaki bütün akışı Tab'lamak zorunda kalır ve ekran
 * okuyucu görünmeyen içeriği okur.
 *
 * Arka planın sekme sırasından çıkarılması page.tsx'teki `inert` ile
 * sağlanır; buradaki iş odağı içeri almak, Escape'i dinlemek ve kapanışta
 * odağı çağıran düğmeye geri vermektir.
 */
export function useKatman<T extends HTMLElement>(onKapat: () => void) {
  const ref = useRef<T>(null)
  // Kapatma geri çağrısı her render'da yeniden üretiliyor; ana etkinin
  // yeniden kurulmaması için ref üzerinden taze tutulur.
  const kapatRef = useRef(onKapat)
  useEffect(() => {
    kapatRef.current = onKapat
  })

  useEffect(() => {
    const oncekiOdak = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>(ODAKLANABILIR)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Katmanın içinde açık bir kalıcı pencere varsa Escape önce ona ait
      if (document.querySelector('[role="dialog"]')) return
      kapatRef.current()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      oncekiOdak?.focus?.()
    }
  }, [])

  return ref
}
