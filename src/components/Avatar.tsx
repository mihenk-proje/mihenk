"use client"

import { avatarRengi } from "@/lib/store/efektler"

const BOYUTLAR = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-24 h-24 text-2xl',
} as const

/**
 * Baş harflerden avatar üretir. Uzak görsel servisine bağımlılık yoktur,
 * böylece çevrimdışı ve yavaş bağlantıda da tutarlı görünür.
 */
export function Avatar({
  id,
  harfler,
  ad,
  boyut = 'md',
  cerceveSinifi = '',
}: {
  id: string
  harfler: string
  ad: string
  boyut?: keyof typeof BOYUTLAR
  cerceveSinifi?: string
}) {
  return (
    <div
      className={`${BOYUTLAR[boyut]} ${avatarRengi(id)} ${cerceveSinifi} shrink-0 rounded-full flex items-center justify-center font-bold text-white/95 select-none`}
      role="img"
      aria-label={`${ad} profil görseli`}
      title={ad}
    >
      <span aria-hidden="true">{harfler}</span>
    </div>
  )
}
