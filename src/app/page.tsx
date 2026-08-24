"use client"

import { useState } from "react"
import { useStore } from "@/lib/store/StoreContext"
import { TopBar } from "@/components/TopBar"
import { GonderiOlustur } from "@/components/GonderiOlustur"
import { GonderiKarti } from "@/components/GonderiKarti"
import { DogrulamaSonucu } from "@/components/DogrulamaSonucu"

export default function Home() {
  const { state } = useStore()
  const [dogrulamaSonucu, setDogrulamaSonucu] = useState<{ sonuc: any, id: string } | null>(null)
  
  // Şimdilik sadece Yüzey A (Akış)
  
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <TopBar onCuzdanClick={() => alert("Cüzdan yakında eklenecek")} />
      
      <main className="flex-1 w-full max-w-2xl mx-auto border-x border-primary/30 min-h-screen">
        <div className="p-4 border-b border-primary/30">
          <h2 className="font-bold text-xl text-primary">Ana Sayfa</h2>
        </div>
        
        <GonderiOlustur onDogrulamaSonucu={(sonuc, id) => setDogrulamaSonucu({ sonuc, id })} />
        
        <div className="flex flex-col">
          {state.gonderiler.map(gonderi => (
            <GonderiKarti key={gonderi.id} gonderi={gonderi} />
          ))}
          {state.gonderiler.length === 0 && (
            <div className="p-8 text-center text-secondary">
              İlk gönderini paylaş, ilk jetonunu kazan.
            </div>
          )}
        </div>
      </main>

      {dogrulamaSonucu && (
        <DogrulamaSonucu 
          sonuc={dogrulamaSonucu.sonuc} 
          onClose={() => setDogrulamaSonucu(null)} 
        />
      )}
    </div>
  )
}
