"use client"

import { useState } from "react"
import { useStore } from "@/lib/store/StoreContext"
import { Gonderi } from "@/lib/store/types"
import { Image as ImageIcon, BarChart2, Bot } from "lucide-react"

export function GonderiOlustur({ onDogrulamaSonucu }: { onDogrulamaSonucu: (sonuc: any, gonderiId: string) => void }) {
  const { state, gonderiEkle, dogrulamaTetikle } = useStore()
  const [metin, setMetin] = useState("")
  const [yzBeyani, setYzBeyani] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const uzunGonderiHakkı = state.kullanici.envanter.some(u => u.aktif && u.urunId === 'u7')
  const maxKarakter = uzunGonderiHakkı ? 1000 : 500

  const handlePaylas = async () => {
    if (!metin.trim()) return

    setIsSubmitting(true)

    const yeniGonderi: Gonderi = {
      id: `g_${Date.now()}`,
      yazarId: state.kullanici.id, // Kullanıcı adı 'Ahmet Yılmaz' oldu
      tur: 'metin',
      metin: metin.trim(),
      gorselUrl: null,
      anketSecenekleri: null,
      olusturmaZamani: new Date().toISOString(),
      yzBeyani,
      yorumSayisi: 0,
      yenidenPaylasimSayisi: 0,
      roketSayisi: 0,
      izlenimSayisi: 0,
      dogrulamaDurumu: 'bekliyor',
      dogrulamaSkoru: null,
      kazanilanJeton: 0,
      gerekce: [],
      metinParcalari: null,
      gorselHash: null
    }

    gonderiEkle(yeniGonderi)
    setMetin("")
    setYzBeyani(false)
    setIsSubmitting(false)

    // Merkezileştirilmiş doğrulama çağrısı
    dogrulamaTetikle(yeniGonderi.id, (sonuc) => {
      onDogrulamaSonucu(sonuc, yeniGonderi.id)
    })
  }

  return (
    <div className="border-b border-primary p-4 bg-page">
      <div className="flex gap-3">
        <div className="shrink-0 pt-1">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-interaction text-white font-bold text-sm">
            {state.kullanici.avatarUrl}
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={metin}
            onChange={(e) => setMetin(e.target.value.slice(0, maxKarakter))}
            placeholder="Neler oluyor?"
            className="w-full bg-transparent text-primary text-lg resize-none outline-none min-h-[80px] placeholder:text-secondary mt-1"
            disabled={isSubmitting}
          />
          
          <div className="border-t border-primary/30 pt-3 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-interaction">
              <button className="p-2 hover:bg-interaction/10 rounded-full transition-colors" title="Görsel ekle (Demoda kapalı)">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 hover:bg-interaction/10 rounded-full transition-colors" title="Anket ekle (Demoda kapalı)">
                <BarChart2 size={20} />
              </button>
              
              <label className="flex items-center gap-2 cursor-pointer ml-2 p-1.5 px-3 rounded-full hover:bg-card transition-colors border border-primary/20" title="Yapay zekâ destekli içerik ürettiyseniz beyan edin. Bu işlem jeton miktarınızı düşürmez.">
                <input 
                  type="checkbox" 
                  checked={yzBeyani} 
                  onChange={(e) => setYzBeyani(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded"
                />
                <span className="text-sm text-secondary flex items-center gap-1"><Bot size={16} /> YZ Desteği Aldım</span>
              </label>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`text-xs ${metin.length >= maxKarakter ? 'text-error font-bold' : 'text-secondary'}`}>
                {metin.length}/{maxKarakter}
              </span>
              <button 
                onClick={handlePaylas}
                disabled={metin.trim().length === 0 || isSubmitting}
                className="bg-brand hover:bg-brand/90 text-[#12181A] font-bold py-1.5 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Paylaş
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
