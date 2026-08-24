"use client"

import { useStore } from "@/lib/store/StoreContext"
import { useTheme } from "next-themes"
import { Moon, Sun, Wallet, ShoppingBag } from "lucide-react"

export function TopBar({ onCuzdanClick, onMagazaClick }: { onCuzdanClick: () => void, onMagazaClick: () => void }) {
  const { state } = useStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-page/80 backdrop-blur-md border-b border-primary">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl tracking-tight text-primary">NSosyal</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onMagazaClick}
            className="p-2 rounded-full hover:bg-card transition-colors text-secondary hover:text-primary"
            aria-label="Mağaza"
            title="Mağaza"
          >
            <ShoppingBag size={20} />
          </button>

          <button 
            onClick={onCuzdanClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-card transition-colors border border-primary/50"
            title="Cüzdan"
          >
            <Wallet size={18} className="text-brand" />
            <span className="font-mono font-medium text-brand">
              {state.kullanici.jetonBakiyesi}
            </span>
          </button>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-card transition-colors text-secondary"
            aria-label="Temayı değiştir"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
