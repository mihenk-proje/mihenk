"use client"

import { LogIn, Layers } from "lucide-react"

export function Giris({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-primary/20 p-8 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6 border border-brand/20">
          <Layers className="text-brand" size={32} />
        </div>
        
        <h1 className="font-display font-bold text-4xl text-primary tracking-tight mb-2">
          MİHENK
        </h1>
        
        <p className="text-lg font-medium text-primary mb-2">
          İçerik Nitelik ve Katılım Katmanı
        </p>
        
        <p className="text-secondary mb-8">
          Pasif tüketim sarmalını kırın. Nitelikli paylaşımlarınızla jeton kazanın ve profilinizi kişiselleştirin.
        </p>
        
        <button 
          onClick={onEnter}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand/90 text-[#12181A] font-bold rounded-xl transition-colors mb-6 text-lg"
        >
          <LogIn size={20} />
          Demo Olarak Gir
        </button>
        
        <div className="text-xs text-secondary text-left p-4 bg-page/50 rounded-lg border border-primary/10">
          <p className="font-bold mb-1 text-primary">Prototip Notu:</p>
          <p>
            Bu uygulama, mevcut bir mikroblog platformu olan <strong>NSosyal</strong> üzerine kurgulanmış bir "özellik katmanı" (Yüzey B) prototipidir. Herhangi bir veritabanı bağlantısı yoktur; tüm veriler ve doğrulama işlemleri tarayıcınızda (localStorage) gerçekleşir.
          </p>
        </div>
      </div>
    </div>
  )
}
