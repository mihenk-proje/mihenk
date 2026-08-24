"use client"

import { useStore } from "@/lib/store/StoreContext"
import { useTheme } from "next-themes"
import { Moon, Sun, Wallet } from "lucide-react"

export function TopBar({ onCuzdanClick }: { onCuzdanClick: () => void }) {
  const { state } = useStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-page/80 backdrop-blur-md border-b border-primary">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-xl tracking-tight">NSosyal</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onCuzdanClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-card transition-colors border border-primary/50"
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
