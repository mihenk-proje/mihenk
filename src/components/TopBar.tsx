"use client"

import { Bell, Menu } from "lucide-react"
import { NSimgesi } from "./NSimgesi"

/**
 * NSosyal üst çubuğu.
 *
 * Ev sahibi platformun başlığı: solda menü, ortada kimlik işareti, sağda
 * bildirimler. Cüzdan ve Mağaza düğmeleri buradan alt gezintiye taşındı;
 * tanıtım turunun çapaları (data-tanitim) onlarla birlikte gitti.
 *
 * Zemin opak. Önceki halinde bg-page/85 + backdrop-blur vardı ve harmanlanmış
 * zemin üzerinde ikincil metin 4,31'e düşüyordu (globals.css'te kayıtlı);
 * aynı hatanın yeni kromada tekrarlanmaması için saydamlık kullanılmıyor.
 *
 * Bildirim düğmesi sayaç rozeti taşımıyor: gerçek bir bildirim kuyruğu yok ve
 * uydurma bir sayı, ölçülebilirlik iddiası taşıyan bir prototipte ekranda
 * duran tek doğrulanamaz veri olurdu.
 */
export function TopBar({
  onMenu,
  onKapsamDisi,
}: {
  onMenu: () => void
  onKapsamDisi: (ad: string) => void
}) {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-line">
      <div className="mx-auto w-full max-w-lg px-2 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onMenu}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-page transition-colors text-primary"
          aria-label="Menüyü aç"
        >
          <Menu size={24} aria-hidden="true" />
        </button>

        <NSimgesi boyut={30} />

        <button
          type="button"
          onClick={() => onKapsamDisi('Bildirimler')}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-page transition-colors text-primary"
          aria-label="Bildirimler"
        >
          <Bell size={22} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
