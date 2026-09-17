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
 * Bildirim düğmesi artık sayaç rozeti taşıyor. Eskiden taşımıyordu çünkü
 * gerçek bir bildirim kuyruğu yoktu ve uydurma bir sayı, ölçülebilirlik
 * iddiası taşıyan bir prototipte ekrandaki tek doğrulanamaz veri olurdu.
 * Sayı artık uydurma değil: durumdan türetiliyor (Bildirimler.tsx) ve
 * ekranı açınca sıfırlanıyor.
 *
 * Rozet EV SAHİBİ kromasında (host mavisi). Sayaç MİHENK'in ürettiği bir
 * değer değil, NSosyal'ın gezinti göstergesi; pirinç yalnızca jeton
 * tutarlarında kullanılır.
 *
 * Görünen sayı aria-hidden: erişilebilir ad zaten "Bildirimler, N okunmamış"
 * diyor ve görünen metin adın içinde birebir geçiyor (WCAG 2.5.3).
 */
export function TopBar({
  onMenu,
  onBildirimler,
  okunmamis,
}: {
  onMenu: () => void
  onBildirimler: () => void
  /** Son ziyaretten beri gerçekleşen bildirim sayısı; 0 ise rozet çizilmez. */
  okunmamis: number
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
          onClick={onBildirimler}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-page transition-colors text-primary relative"
          aria-label={
            okunmamis > 0 ? `Bildirimler, ${okunmamis} okunmamış` : 'Bildirimler'
          }
        >
          <Bell size={22} aria-hidden="true" />
          {okunmamis > 0 && (
            <span
              className="absolute top-1.5 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-brand-ink text-[11px] font-mono font-bold leading-[18px] text-center"
              aria-hidden="true"
            >
              {okunmamis}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
