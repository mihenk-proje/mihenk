"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import type { DogrulamaSonucu as Sonuc } from "@/lib/store/types"
import { Cuzdan } from "@/components/Cuzdan"
import { DogrulamaSonucu } from "@/components/DogrulamaSonucu"
import { Giris } from "@/components/Giris"
import { GonderiKarti } from "@/components/GonderiKarti"
import { GonderiOlustur } from "@/components/GonderiOlustur"
import { Magaza } from "@/components/Magaza"
import { TopBar } from "@/components/TopBar"

const GIRIS_ANAHTARI = 'mihenk_entered'

function girisYapilmisMi() {
  try {
    return sessionStorage.getItem(GIRIS_ANAHTARI) !== null
  } catch {
    return false
  }
}

export default function Home() {
  const { state } = useStore()

  /*
    StoreProvider yüklenene kadar çocuklarını render etmediği için bu bileşen
    yalnızca istemcide kurulur; sessionStorage'ı doğrudan başlangıç değerinde
    okumak güvenlidir ve sunucu/istemci uyuşmazlığı doğurmaz.
  */
  const [girisYapildi, setGirisYapildi] = useState(girisYapilmisMi)
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [gorunum, setGorunum] = useState<'akis' | 'cuzdan' | 'magaza'>('akis')

  const handleEnter = () => {
    try {
      sessionStorage.setItem(GIRIS_ANAHTARI, 'true')
    } catch {
      // Özel sekmede yazılamayabilir; oturum içinde çalışmaya devam eder
    }
    setGirisYapildi(true)
  }

  if (!girisYapildi) {
    return <Giris onEnter={handleEnter} />
  }

  const katmanAcik = gorunum !== 'akis'

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/*
        Tam ekran bir katman açıkken arkadaki akış sekme sırasından ve
        erişilebilirlik ağacından çıkarılır; aksi halde klavye odağı
        görünmeyen içeriğe kayar.
      */}
      <div inert={katmanAcik} className="contents">
      <TopBar
        onCuzdanClick={() => setGorunum('cuzdan')}
        onMagazaClick={() => setGorunum('magaza')}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto border-x border-line">
        <div className="p-4 border-b border-line sticky top-16 bg-page/95 backdrop-blur z-20">
          <h1 className="font-bold text-xl text-primary">Ana akış</h1>
        </div>

        <GonderiOlustur onDogrulamaSonucu={setSonuc} />

        <div className="flex flex-col pb-32">
          {state.gonderiler.map((gonderi) => (
            <GonderiKarti key={gonderi.id} gonderi={gonderi} />
          ))}

          {state.gonderiler.length === 0 && (
            <div className="p-12 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 border border-line"
                aria-hidden="true"
              >
                <Sparkles size={24} className="text-secondary" />
              </div>
              <p className="text-primary font-medium text-lg">Henüz gönderi yok</p>
              <p className="text-secondary mt-1">İlk gönderini paylaş, ilk jetonunu kazan.</p>
            </div>
          )}
        </div>
      </main>
      </div>

      {gorunum === 'cuzdan' && <Cuzdan onBack={() => setGorunum('akis')} />}
      {gorunum === 'magaza' && <Magaza onBack={() => setGorunum('akis')} />}

      {sonuc && (
        <DogrulamaSonucu
          key={sonuc.gonderiId}
          sonuc={sonuc}
          onClose={() => setSonuc(null)}
        />
      )}
    </div>
  )
}
