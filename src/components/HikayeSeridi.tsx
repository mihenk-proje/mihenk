"use client"

import { Plus } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import { avatarRengi, type AvatarTonu } from "@/lib/store/efektler"

/**
 * NSosyal hikâye şeridi.
 *
 * Akıştaki yazarlardan türetilir; yeni tohum verisi eklenmez. Gönderi sayısı
 * 12'de sabit (test/depo.test.mjs) ve hikâye için ayrı kayıt açmak bu sayıyı
 * bozardı.
 *
 * Yalnızca ilk daire gerçek bir düğmedir ve gönderi alanına odaklanır.
 * Kalanlar aria-hidden dekoratif öğedir: açılmayan bir hikâyeyi düğme yapmak
 * hem yanlış vaat olur hem de klavye kullanıcısına altı boş durak eklerdi.
 */
export function HikayeSeridi() {
  const { state } = useStore()

  const odaklan = () => {
    const alan = document.getElementById('gonderi-metni')
    alan?.scrollIntoView({ block: 'center' })
    alan?.focus()
  }

  return (
    <div className="flex gap-4 px-4 py-3 overflow-x-auto hide-scrollbar bg-card border-b border-line">
      <button
        type="button"
        onClick={odaklan}
        className="flex flex-col items-center gap-1.5 shrink-0 w-16 text-secondary hover:text-primary transition-colors"
      >
        <span className="w-14 h-14 rounded-full border-2 border-dashed border-line-strong flex items-center justify-center">
          <Plus size={22} aria-hidden="true" />
        </span>
        <span className="text-[11px] font-medium leading-none">Yeni</span>
      </button>

      {state.yazarlar.map((yazar) => (
        <div
          key={yazar.id}
          className="flex flex-col items-center gap-1.5 shrink-0 w-16"
          aria-hidden="true"
        >
          <span className="nsosyal-gradyan w-14 h-14 rounded-full p-[2px]">
            <span
              className={`${avatarRengi(yazar.id, yazar.avatarTonu as AvatarTonu)} w-full h-full rounded-full flex items-center justify-center font-bold text-sm text-white ring-2 ring-card`}
            >
              {yazar.avatarHarfleri}
            </span>
          </span>
          <span className="text-[11px] text-secondary leading-none truncate w-full text-center">
            {yazar.adSoyad.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  )
}
