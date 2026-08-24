"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AppState, Gonderi, Urun, HareketKaydi } from './types'
import { defaultState } from './demoData'
import { dogrula } from '@/lib/verification'

type StoreContextType = {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
  resetToDemo: () => void
  jetonEkle: (miktar: number, aciklama: string) => void
  gonderiEkle: (gonderi: Gonderi) => void
  urunSatinAl: (urun: Urun) => boolean
  dogrulamaTetikle: (gonderiId: string, onResult?: (sonuc: any) => void) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cüzdan tutarlılığını sağlamak için hesaplama fonksiyonu (İ5)
  const cuzdanSenkronizeEt = (currentState: AppState): AppState => {
    let bakiye = 0
    let gunlukKazanilan = 0
    const bugunBaslangici = new Date()
    bugunBaslangici.setHours(0, 0, 0, 0)

    for (const h of currentState.hareketler) {
      bakiye += h.miktar
      if (h.miktar > 0) {
        const hTarihi = new Date(h.zaman)
        if (hTarihi >= bugunBaslangici) {
          gunlukKazanilan += h.miktar
        }
      }
    }

    return {
      ...currentState,
      kullanici: {
        ...currentState.kullanici,
        jetonBakiyesi: bakiye,
        bugunKazanilan: gunlukKazanilan
      }
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('mihenk_state')
    let initialState = defaultState
    if (saved) {
      try {
        initialState = JSON.parse(saved)
      } catch (e) {
        console.error('State parse error', e)
      }
    }
    
    // Yükleme anında bakiyeyi senkronize et
    initialState = cuzdanSenkronizeEt(initialState)
    setState(initialState)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mihenk_state', JSON.stringify(state))
    }
  }, [state, isLoaded])

  // Sayfa açılışında bekleyenleri tetikle (K1 - madde 5)
  useEffect(() => {
    if (isLoaded) {
      const bekleyenler = state.gonderiler.filter(g => g.dogrulamaDurumu === 'bekliyor')
      bekleyenler.forEach(g => {
        // Sayfa yenilendiği için sonuç panelini göstermek zorunda değiliz, sadece arka planda çözelim
        dogrulamaTetikle(g.id)
      })
    }
    // Sadece ilk yüklendiğinde çalışmalı
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  const resetToDemo = () => {
    const synced = cuzdanSenkronizeEt(defaultState)
    setState(synced)
    localStorage.setItem('mihenk_state', JSON.stringify(synced))
  }

  const jetonEkle = (miktar: number, aciklama: string) => {
    setState(prev => {
      const hareket: HareketKaydi = {
        id: Math.random().toString(36).substring(7),
        zaman: new Date().toISOString(),
        aciklama,
        miktar
      }

      const newState = {
        ...prev,
        hareketler: [hareket, ...prev.hareketler]
      }
      
      return cuzdanSenkronizeEt(newState)
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
      const hareket: HareketKaydi = {
        id: Math.random().toString(36).substring(7),
        zaman: new Date().toISOString(),
        aciklama: `${urun.ad} alındı`,
        miktar: -urun.fiyat
      }

      const yeniUrun = {
        urunId: urun.id,
        satinAlmaZamani: new Date().toISOString(),
        aktif: true
      }

      const newState = {
        ...prev,
        kullanici: {
          ...prev.kullanici,
          envanter: [...prev.kullanici.envanter, yeniUrun]
        },
        hareketler: [hareket, ...prev.hareketler]
      }
      
      return cuzdanSenkronizeEt(newState)
    })
    return true
  }

  const dogrulamaTetikle = (gonderiId: string, onResult?: (sonuc: any) => void) => {
    // Biraz bekle (2-4 sn simülasyonu) ve güvenlik ağı için Promise.race kullan (K1)
    setTimeout(async () => {
      let sonuc
      
      try {
        setState(prev => {
          const gonderi = prev.gonderiler.find(g => g.id === gonderiId)
          if (!gonderi) return prev

          // Güvenlik ağı (K1 - madde 4): 8 saniye zaman aşımı
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve({
              skor: 0, 
              durumu: 'gecemedi', 
              gerekce: ['Doğrulama zaman aşımına uğradı ve tamamlanamadı.'],
              metinParcalari: null,
              gorselHash: null
            }), 8000)
          )

          const dogrulamaPromise = dogrula(gonderi, prev.gonderiler, 30)

          // setTimeout callback içinde setState synchronous yapamayız Promise beklerken, bu yüzden dışarıda çözüp sonra setState yapacağız.
          return prev // return prev, actual state update happens below
        })

        // Fetch state to get latest gonderi and past ones
        const currentGonderi = state.gonderiler.find(g => g.id === gonderiId)
        if (!currentGonderi) return

        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({
            skor: 0, 
            durumu: 'gecemedi', 
            gerekce: ['Doğrulama zaman aşımına uğradı ve tamamlanamadı.'],
            metinParcalari: null,
            gorselHash: null
          }), 8000)
        )

        sonuc = await Promise.race([
          dogrula(currentGonderi, state.gonderiler, 30),
          timeoutPromise
        ]) as any

      } catch (err) {
        console.error('Doğrulama tetiklenirken hata:', err)
        sonuc = {
          skor: 0, 
          durumu: 'gecemedi', 
          gerekce: ['Doğrulama sistem hatası nedeniyle tamamlanamadı.'],
          metinParcalari: null,
          gorselHash: null
        }
      }

      setState(prev => {
        // Tavan kontrolü
        let kazanilanJeton = 0
        if (sonuc.durumu === 'gecti') kazanilanJeton = 10
        else if (sonuc.durumu === 'kismi') kazanilanJeton = 5
        
        const guncelBakiyeData = cuzdanSenkronizeEt(prev)
        if (guncelBakiyeData.kullanici.bugunKazanilan + kazanilanJeton > 50) {
          const eklenebilecek = Math.max(0, 50 - guncelBakiyeData.kullanici.bugunKazanilan)
          kazanilanJeton = eklenebilecek
          if (eklenebilecek < (sonuc.durumu === 'gecti' ? 10 : 5)) {
            sonuc.gerekce.push('Günlük üst sınıra (50) ulaşıldı, eksik jeton verildi.')
          }
        }

        const yeniGonderiler = prev.gonderiler.map(g => {
          if (g.id === gonderiId) {
            return {
              ...g,
              dogrulamaDurumu: sonuc.durumu,
              dogrulamaSkoru: sonuc.skor,
              kazanilanJeton,
              gerekce: sonuc.gerekce,
              metinParcalari: sonuc.metinParcalari,
              gorselHash: sonuc.gorselHash
            }
          }
          return g
        })

        // Eğer jeton eklenecekse, bu aşamada da hareketi eklememiz lazım (asenkron işlem olduğundan)
        // Bunun yerine setState içinde yapalım:
        let hareketler = [...prev.hareketler]
        if (kazanilanJeton > 0) {
          const hareket: HareketKaydi = {
            id: Math.random().toString(36).substring(7),
            zaman: new Date().toISOString(),
            aciklama: `İçerik doğrulandı (${sonuc.durumu === 'gecti' ? 'Tam' : 'Kısmi'})`,
            miktar: kazanilanJeton
          }
          hareketler = [hareket, ...hareketler]
        }

        const newState = {
          ...prev,
          gonderiler: yeniGonderiler,
          hareketler
        }
        
        return cuzdanSenkronizeEt(newState)
      })

      if (onResult) {
        // Find updated kazanilanJeton and pass it to UI
        setTimeout(() => { // small delay to let state sync (or just pass what we know)
           // we need the calculated KazanilanJeton here. It's tricky.
           // Since onResult is just for the animation, let's pass a safe value
           // Wait, let's calculate the exact kazanilanJeton before calling setState to pass it to onResult.
        }, 0)
      }
    }, Math.random() * 2000 + 2000)
  }

  // Rewrite dogrulamaTetikle properly avoiding state closures
  const dogrulamaTetikleSafe = (gonderiId: string, onResult?: (sonuc: any) => void) => {
    setTimeout(async () => {
      let sonuc: any
      // Taze state'i almak için:
      let currentGonderi: any
      let currentGonderiler: any[] = []
      let gunlukKazanilan = 0
      
      setState(prev => {
        currentGonderiler = prev.gonderiler
        currentGonderi = prev.gonderiler.find(g => g.id === gonderiId)
        const guncel = cuzdanSenkronizeEt(prev)
        gunlukKazanilan = guncel.kullanici.bugunKazanilan
        return prev
      })

      if (!currentGonderi) return

      try {
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({
            skor: 0, 
            durumu: 'gecemedi', 
            gerekce: ['Doğrulama zaman aşımına uğradı ve tamamlanamadı.'],
            metinParcalari: null,
            gorselHash: null
          }), 8000)
        )

        sonuc = await Promise.race([
          dogrula(currentGonderi, currentGonderiler, 30),
          timeoutPromise
        ])
      } catch (e) {
        sonuc = { skor: 0, durumu: 'gecemedi', gerekce: ['Hata oluştu'], metinParcalari: null, gorselHash: null }
      }

      let kazanilanJeton = 0
      if (sonuc.durumu === 'gecti') kazanilanJeton = 10
      else if (sonuc.durumu === 'kismi') kazanilanJeton = 5
      
      if (gunlukKazanilan + kazanilanJeton > 50) {
        const eklenebilecek = Math.max(0, 50 - gunlukKazanilan)
        kazanilanJeton = eklenebilecek
        if (eklenebilecek < (sonuc.durumu === 'gecti' ? 10 : 5)) {
          sonuc.gerekce.push('Günlük üst sınıra (50) ulaşıldı, eksik jeton verildi.')
        }
      }
      
      sonuc.kazanilanJeton = kazanilanJeton

      setState(prev => {
        let hareketler = [...prev.hareketler]
        if (kazanilanJeton > 0) {
          const hareket: HareketKaydi = {
            id: Math.random().toString(36).substring(7),
            zaman: new Date().toISOString(),
            aciklama: `İçerik doğrulandı (${sonuc.durumu === 'gecti' ? 'Tam' : 'Kısmi'})`,
            miktar: kazanilanJeton
          }
          hareketler = [hareket, ...hareketler]
        }

        const yeniGonderiler = prev.gonderiler.map(g => {
          if (g.id === gonderiId) {
            return {
              ...g,
              dogrulamaDurumu: sonuc.durumu,
              dogrulamaSkoru: sonuc.skor,
              kazanilanJeton,
              gerekce: [...sonuc.gerekce],
              metinParcalari: sonuc.metinParcalari,
              gorselHash: sonuc.gorselHash
            }
          }
          return g
        })

        return cuzdanSenkronizeEt({
          ...prev,
          gonderiler: yeniGonderiler,
          hareketler
        })
      })

      if (onResult) {
        onResult(sonuc)
      }
    }, Math.random() * 2000 + 1000)
  }

  if (!isLoaded) return null

  return (
    <StoreContext.Provider value={{ state, setState, resetToDemo, jetonEkle, gonderiEkle, urunSatinAl, dogrulamaTetikle: dogrulamaTetikleSafe }}>
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
