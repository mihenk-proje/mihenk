"use client"

import { useTheme } from "next-themes"
import { Moon, ShoppingBag, Sun, Wallet } from "lucide-react"
import { useStore } from "@/lib/store/kanca"

export function TopBar({
  onCuzdanClick,
  onMagazaClick,
}: {
  onCuzdanClick: () => void
  onMagazaClick: () => void
}) {
  const { state } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const koyu = resolvedTheme !== 'light'

  return (
    <header className="sticky top-0 z-30 bg-page/85 backdrop-blur-md border-b border-line">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <span className="font-sans font-bold text-xl tracking-tight text-primary">NSosyal</span>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMagazaClick}
            className="p-2 rounded-full hover:bg-card transition-colors text-secondary hover:text-primary"
            aria-label="Mağazayı aç"
            title="Mağaza"
          >
            <ShoppingBag size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onCuzdanClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-card transition-colors border border-line-strong"
            aria-label={`Cüzdanı aç. Bakiye: ${state.kullanici.jetonBakiyesi} jeton`}
            title="Cüzdan"
          >
            <Wallet size={18} className="text-brand" aria-hidden="true" />
            <span className="font-mono font-medium text-brand">
              {state.kullanici.jetonBakiyesi}
            </span>
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
