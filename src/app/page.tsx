"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store/StoreContext"
import { TopBar } from "@/components/TopBar"
import { GonderiOlustur } from "@/components/GonderiOlustur"
import { GonderiKarti } from "@/components/GonderiKarti"
import { DogrulamaSonucu } from "@/components/DogrulamaSonucu"
import { Cuzdan } from "@/components/Cuzdan"
import { Magaza } from "@/components/Magaza"
import { Giris } from "@/components/Giris"
import { Sparkles } from "lucide-react"

export default function Home() {
  const { state } = useStore()
  const [dogrulamaSonucu, setDogrulamaSonucu] = useState<{ sonuc: any, id: string } | null>(null)
  
  // Görünüm state'leri
  const [isEntered, setIsEntered] = useState(false)
  const [aktifGorunum, setAktifGorunum] = useState<'akis' | 'cuzdan' | 'magaza'>('akis')

  useEffect(() => {
    // Sadece demo olduğu için basitçe session'da tutuyoruz
    const entered = sessionStorage.getItem('mihenk_entered')
    if (entered) setIsEntered(true)
  }, [])

  const handleEnter = () => {
    setIsEntered(true)
    sessionStorage.setItem('mihenk_entered', 'true')
  }
  
  if (!isEntered) {
    return <Giris onEnter={handleEnter} />
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <TopBar 
        onCuzdanClick={() => setAktifGorunum('cuzdan')} 
        onMagazaClick={() => setAktifGorunum('magaza')}
      />
      
      <main className="flex-1 w-full max-w-2xl mx-auto border-x border-primary/30 min-h-screen relative">
        <div className="p-4 border-b border-primary/30 flex items-center justify-between sticky top-16 bg-page/95 backdrop-blur z-20">
          <h2 className="font-bold text-xl text-primary">Ana Akış</h2>
          <span className="text-xs font-medium text-secondary flex items-center gap-1" title="Ev sahibi platform">
            <Sparkles size={12} /> Yüzey A (Nötr Katman)
          </span>
        </div>
        
        <GonderiOlustur onDogrulamaSonucu={(sonuc, id) => setDogrulamaSonucu({ sonuc, id })} />
        
        <div className="flex flex-col pb-20">
          {state.gonderiler.map(gonderi => (
            <GonderiKarti key={gonderi.id} gonderi={gonderi} />
          ))}
          {state.gonderiler.length === 0 && (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 border border-primary/20">
                <Sparkles size={24} className="text-secondary" />
              </div>
              <p className="text-primary font-medium text-lg">Henüz gönderi yok</p>
              <p className="text-secondary mt-1">İlk gönderini paylaş, ilk jetonunu kazan.</p>
            </div>
          )}
        </div>
      </main>

      {/* Yüzey B Bileşenleri */}
      {aktifGorunum === 'cuzdan' && (
        <Cuzdan onBack={() => setAktifGorunum('akis')} />
      )}
      
      {aktifGorunum === 'magaza' && (
        <Magaza onBack={() => setAktifGorunum('akis')} />
      )}

      {dogrulamaSonucu && (
        <DogrulamaSonucu 
          sonuc={dogrulamaSonucu.sonuc} 
          onClose={() => setDogrulamaSonucu(null)} 
        />
      )}
    </div>
  )
}
