"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AppState, Gonderi, Urun, HareketKaydi } from './types'
import { defaultState } from './demoData'

type StoreContextType = {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
  resetToDemo: () => void
  jetonEkle: (miktar: number, aciklama: string) => void
  gonderiEkle: (gonderi: Gonderi) => void
  urunSatinAl: (urun: Urun) => boolean
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mihenk_state')
    if (saved) {
      try {
        setState(JSON.parse(saved))
      } catch (e) {
        console.error('State parse error', e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mihenk_state', JSON.stringify(state))
    }
  }, [state, isLoaded])

  const resetToDemo = () => {
    setState(defaultState)
    localStorage.setItem('mihenk_state', JSON.stringify(defaultState))
  }

  const jetonEkle = (miktar: number, aciklama: string) => {
    setState(prev => {
      const yeniBakiye = prev.kullanici.jetonBakiyesi + miktar
      const yeniBugun = miktar > 0 ? prev.kullanici.bugunKazanilan + miktar : prev.kullanici.bugunKazanilan
      
      const hareket: HareketKaydi = {
        id: Math.random().toString(36).substring(7),
        zaman: new Date().toISOString(),
        aciklama,
        miktar
      }

      return {
        ...prev,
        kullanici: {
          ...prev.kullanici,
          jetonBakiyesi: yeniBakiye,
          bugunKazanilan: yeniBugun
        },
        hareketler: [hareket, ...prev.hareketler]
      }
    })
  }

  const gonderiEkle = (gonderi: Gonderi) => {
    setState(prev => ({
      ...prev,
      gonderiler: [gonderi, ...prev.gonderiler]
    }))
  }

  const urunSatinAl = (urun: Urun) => {
    if (state.kullanici.jetonBakiyesi < urun.fiyat) return false

    setState(prev => {
      const yeniBakiye = prev.kullanici.jetonBakiyesi - urun.fiyat
      
      const hareket: HareketKaydi = {
        id: Math.random().toString(36).substring(7),
        zaman: new Date().toISOString(),
        aciklama: `${urun.ad} satın alındı`,
        miktar: -urun.fiyat
      }

      const yeniUrun = {
        urunId: urun.id,
        satinAlmaZamani: new Date().toISOString(),
        aktif: true
      }

      return {
        ...prev,
        kullanici: {
          ...prev.kullanici,
          jetonBakiyesi: yeniBakiye,
          envanter: [...prev.kullanici.envanter, yeniUrun]
        },
        hareketler: [hareket, ...prev.hareketler]
      }
    })
    return true
  }

  if (!isLoaded) return null // Prevent hydration mismatch

  return (
    <StoreContext.Provider value={{ state, setState, resetToDemo, jetonEkle, gonderiEkle, urunSatinAl }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
