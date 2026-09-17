"use client"

import { BarChart2, MessageCircle, Repeat2, Rocket, Share2 } from "lucide-react"
import { sayiBicimle } from "@/lib/bicim"
import type { Gonderi } from "@/lib/store/types"

/**
 * NSosyal etkileşim satırı.
 *
 *   ( 💬 6 )–( 🔁 19 )–( 🚀 170 )–( 📊 3,4B )              ( ↗ )
 *
 * Ev sahibi platformun en belirgin imzası bu: dış çizgili haplar, aralarında
 * kısa birer tire, paylaşım hapı sağa itilmiş. Önceki halinde satır çıplak
 * simgelerden oluşuyordu ve hiçbir platformun kalıbına benzemiyordu.
 *
 * İki ayrım bilinçli:
 *
 *   • Görüntülenme bir <span>, <button> değil. İstatistiktir, eylem değil.
 *     Düğme yapmak hem yanlış vaat olur hem de 12 gönderide 12 boş sekme
 *     durağı eklerdi; yeni kromanın (gezinti, sekmeler, hikâye, FAB) harcadığı
 *     odak bütçesi tam da buradan geri kazanılıyor.
 *   • Paylaşım hapı dekoratiftir ve aria-hidden'dır. Bu sürümde bir paylaşım
 *     akışı yok; çalışmayan bir düğmeyi ekran okuyucuya duyurmak yanıltıcı olur.
 *
 * Haplar 36px yüksekliğinde görünür ama düğme 44px'tir (dokunma hedefi).
 */
function etkilesimEtiketi(fiil: string, sayi: number) {
  const gorunen = sayi > 0 ? sayiBicimle(sayi) : ''
  return { gorunen, etiket: gorunen ? `${fiil}: ${gorunen}` : fiil }
}

const HAP =
  'inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-line-strong tabular-nums text-[13px]'

export function EtkilesimSeridi({ gonderi }: { gonderi: Gonderi }) {
  const ogeler = [
    { anahtar: 'yorum', fiil: 'Yorum yap', sayi: gonderi.yorumSayisi, Simge: MessageCircle, renk: 'group-hover:text-interaction group-hover:border-interaction' },
    { anahtar: 'paylas', fiil: 'Yeniden paylaş', sayi: gonderi.yenidenPaylasimSayisi, Simge: Repeat2, renk: 'group-hover:text-success group-hover:border-success' },
    { anahtar: 'roket', fiil: 'Roketle', sayi: gonderi.roketSayisi, Simge: Rocket, renk: 'group-hover:text-brand group-hover:border-brand' },
  ] as const

  const izlenim = etkilesimEtiketi('Görüntülenme', gonderi.izlenimSayisi)

  return (
    <div className="flex items-center text-secondary mt-1">
      {ogeler.map(({ anahtar, fiil, sayi, Simge, renk }, i) => {
        const { gorunen, etiket } = etkilesimEtiketi(fiil, sayi)
        return (
          <span key={anahtar} className="flex items-center">
            {i > 0 && <span className="w-2 h-px bg-line-strong shrink-0" aria-hidden="true" />}
            <button
              type="button"
              className="group flex items-center h-11 transition-colors"
              aria-label={etiket}
            >
              <span className={`${HAP} ${renk} transition-colors`}>
                <Simge size={16} aria-hidden="true" />
                <span aria-hidden="true">{gorunen}</span>
              </span>
            </button>
          </span>
        )
      })}

      <span className="w-2 h-px bg-line-strong shrink-0" aria-hidden="true" />
      <span className={HAP} role="img" aria-label={izlenim.etiket}>
        <BarChart2 size={16} aria-hidden="true" />
        <span aria-hidden="true">{izlenim.gorunen}</span>
      </span>

      <span className="flex-1" aria-hidden="true" />

      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line-strong"
        aria-hidden="true"
      >
        <Share2 size={16} />
      </span>
    </div>
  )
}
