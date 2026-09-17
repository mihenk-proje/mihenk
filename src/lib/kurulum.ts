"use client"

import { useEffect, useState } from 'react'

/**
 * Tarayıcının "ana ekrana ekle" teklifini yakalar ve bize devreder.
 *
 * Chrome, kurulum ölçütleri sağlandığında `beforeinstallprompt` olayını
 * gönderiyor. Varsayılanı engellemezsek kendi çubuğunu gösteriyor; engellersek
 * olayı saklayıp istediğimiz anda `prompt()` çağırabiliyoruz. Böylece kurulum,
 * tarayıcının kararına bırakılmış bir sürpriz olmaktan çıkıp menüde duran
 * bir seçenek oluyor.
 *
 * Safari/iOS bu olayı hiç göndermiyor — orada kurulum Paylaş menüsünden
 * elle yapılır. `kurulabilir` false kalır ve menü öğesi hiç görünmez;
 * çalışmayan bir düğme göstermekten iyidir.
 */
type KurulumOlayi = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useKurulum() {
  const [olay, setOlay] = useState<KurulumOlayi | null>(null)

  useEffect(() => {
    const yakala = (e: Event) => {
      e.preventDefault()
      setOlay(e as KurulumOlayi)
    }
    const kuruldu = () => setOlay(null)

    window.addEventListener('beforeinstallprompt', yakala)
    window.addEventListener('appinstalled', kuruldu)
    return () => {
      window.removeEventListener('beforeinstallprompt', yakala)
      window.removeEventListener('appinstalled', kuruldu)
    }
  }, [])

  return {
    kurulabilir: olay !== null,
    kur: async () => {
      if (!olay) return
      await olay.prompt()
      await olay.userChoice
      // Olay tek kullanımlık; teklif edildikten sonra yeniden kullanılamaz
      setOlay(null)
    },
  }
}
