"use client"

import { useEffect } from "react"

/**
 * Servis çalışanını kaydeder — uygulamanın telefona kurulabilmesi için.
 *
 * YALNIZCA ÜRETİMDE. Geliştirmede kayıt edilseydi önbellek, sıcak yeniden
 * yüklemeyle çakışır ve "kodu değiştirdim ama ekran değişmiyor" durumuna
 * yol açardı.
 *
 * Hata sessizce yutulur: kayıt başarısız olursa (eski tarayıcı, güvensiz
 * bağlam, kullanıcı ayarı) uygulama normal bir web sayfası olarak çalışmaya
 * devam eder. Kurulabilirlik bir ek, bir bağımlılık değil.
 */
export function ServisCalisani() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const kaydet = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Kurulabilirlik kaybolur, uygulama çalışmaya devam eder
      })
    }

    // Kayıt ilk boyamayı geciktirmemeli: LCP bu uygulamada ölçülen bir değer
    if (document.readyState === 'complete') kaydet()
    else {
      window.addEventListener('load', kaydet)
      return () => window.removeEventListener('load', kaydet)
    }
  }, [])

  return null
}
