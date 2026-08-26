"use client"

import { useTheme } from "next-themes"
import { HelpCircle, Moon, ShoppingBag, Sun, Wallet } from "lucide-react"
import { useStore } from "@/lib/store/kanca"

export function TopBar({
  onCuzdanClick,
  onMagazaClick,
  onTanitimClick,
}: {
  onCuzdanClick: () => void
  onMagazaClick: () => void
  onTanitimClick: () => void
}) {
  const { state } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const koyu = resolvedTheme !== 'light'

  return (
    <header className="sticky top-0 z-30 bg-page/85 backdrop-blur-md border-b border-line">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <span className="font-sans font-bold text-xl tracking-tight text-primary">NSosyal</span>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simgelerin altinda kalici metin etiketi: tur atlansa da anlasilsin */}
          <button
            type="button"
            data-tanitim="magaza"
            onClick={onMagazaClick}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-card transition-colors text-secondary hover:text-primary"
            aria-label="Mağazayı aç"
          >
            <ShoppingBag size={20} aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">Mağaza</span>
          </button>

          <button
            type="button"
            data-tanitim="cuzdan"
            onClick={onCuzdanClick}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg hover:bg-card transition-colors border border-line-strong"
            /*
              Gorunur metin erisilebilir adin icinde birebir gecmeli
              (WCAG 2.5.3). Onceki ad "Cuzdani ac. Bakiye: 195 jeton" idi
              ve gorunur "195 Cuzdan" dizisini icermiyordu.
            */
            aria-label={`Cüzdan ${state.kullanici.jetonBakiyesi} jeton, cüzdanı aç`}
          >
            <span className="flex items-center gap-1.5">
              <Wallet size={18} className="text-brand" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none text-secondary">Cüzdan</span>
            </span>
            <span className="font-mono font-medium text-brand leading-none">
              {state.kullanici.jetonBakiyesi}
            </span>
          </button>

          <button
            type="button"
            onClick={onTanitimClick}
            className="p-2 rounded-full hover:bg-card transition-colors text-secondary hover:text-primary"
            aria-label="Tanıtım turunu yeniden başlat"
            title="Tanıtım turu"
          >
            <HelpCircle size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(koyu ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-card transition-colors text-secondary hover:text-primary"
            aria-label={koyu ? 'Açık temaya geç' : 'Koyu temaya geç'}
            title={koyu ? 'Açık tema' : 'Koyu tema'}
          >
            {koyu ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
