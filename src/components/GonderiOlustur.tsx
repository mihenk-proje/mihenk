"use client"

import { useState } from "react"
import { useStore } from "@/lib/store/StoreContext"
import { dogrula } from "@/lib/verification"
import { Gonderi } from "@/lib/store/types"
import { Image as ImageIcon, BarChart2, Bot } from "lucide-react"

export function GonderiOlustur({ onDogrulamaSonucu }: { onDogrulamaSonucu: (sonuc: any, gonderiId: string) => void }) {
  const { state, gonderiEkle, jetonEkle } = useStore()
  const [metin, setMetin] = useState("")
  const [yzBeyani, setYzBeyani] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Aktif uzun gönderi hakkı var mı?
  const uzunGonderiHakkı = state.kullanici.envanter.some(u => u.aktif && u.urunId === 'u7')
  const maxKarakter = uzunGonderiHakkı ? 1000 : 500

  const handlePaylas = async () => {
    if (!metin.trim()) return

    setIsSubmitting(true)

    const yeniGonderi: Gonderi = {
      id: `g_${Date.now()}`,
      yazarId: state.kullanici.id,
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

    // 1. Gönderiyi anında akışa ekle (bekletmeden)
    gonderiEkle(yeniGonderi)
    setMetin("")
    setYzBeyani(false)
    setIsSubmitting(false)

    // 2. Doğrulamayı arka planda asenkron çalıştır (2-4 sn gecikmeli)
    setTimeout(async () => {
      // Geçmiş gönderileri al (kendi yeni gönderimiz hariç)
      const gecmis = state.gonderiler.filter(g => g.id !== yeniGonderi.id)
      
      // Hesap yaşını simüle et (30 gün)
      const dogrulamaSonucu = await dogrula(yeniGonderi, gecmis, 30)
      
      // Jeton kazanımı hesapla (Eğer tavan aşılmadıysa)
      let kazanilanJeton = 0
      if (dogrulamaSonucu.durumu === 'gecti') kazanilanJeton = 10
      else if (dogrulamaSonucu.durumu === 'kismi') kazanilanJeton = 5
      
      // Tavan kontrolü
      if (state.kullanici.bugunKazanilan + kazanilanJeton > 50) {
        const eklenebilecek = Math.max(0, 50 - state.kullanici.bugunKazanilan)
        kazanilanJeton = eklenebilecek
        if (eklenebilecek < (dogrulamaSonucu.durumu === 'gecti' ? 10 : 5)) {
          dogrulamaSonucu.gerekce.push('Günlük üst sınıra (50) ulaşıldı, eksik jeton verildi.')
        }
      }

      // Jeton ekle ve sonucu bildir
      if (kazanilanJeton > 0) {
        jetonEkle(kazanilanJeton, `İçerik doğrulandı (${dogrulamaSonucu.durumu === 'gecti' ? 'Tam' : 'Kısmi'})`)
      }

      onDogrulamaSonucu({ ...dogrulamaSonucu, kazanilanJeton }, yeniGonderi.id)
      
    }, Math.random() * 2000 + 2000) // 2-4 sn arası rastgele gecikme
  }

  return (
    <div className="border-b border-primary p-4 bg-page">
      <div className="flex gap-3">
        <div className="shrink-0 pt-1">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={state.kullanici.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
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
                className="bg-interaction hover:bg-interaction/90 text-white font-bold py-1.5 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
