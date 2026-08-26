"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Copy, X, XCircle } from "lucide-react"
import type { DogrulamaSonucu as Sonuc } from "@/lib/store/types"
import { Itiraz } from "./Itiraz"

/**
 * "Mihenk çizgisi": skor yükseldikçe çizgi kalınlaşır ve netleşir.
 * Geçemeyen içerikte çizgi kesikli kalır.
 */
/** Kazanç bildiriminin kendiliğinden kapanma süresi */
const OTOMATIK_KAPANMA_MS = 7000

export function DogrulamaSonucu({ sonuc, onClose }: { sonuc: Sonuc; onClose: () => void }) {
  const [cizgiGorunur, setCizgiGorunur] = useState(false)
  const [itirazAcik, setItirazAcik] = useState(false)
  const [kalanYuzde, setKalanYuzde] = useState(100)
  const [duraklatildi, setDuraklatildi] = useState(false)
  const gecenRef = useRef(0)

  // Bileşen üst katmandan sonuc.gonderiId ile yeniden kurulduğu için
  // bu efektin yalnızca ilk bağlanmada çalışması yeterlidir.
  useEffect(() => {
    const zamanlayici = window.setTimeout(() => setCizgiGorunur(true), 100)
    return () => window.clearTimeout(zamanlayici)
  }, [])

  const basarili = sonuc.durumu === 'gecti' || sonuc.durumu === 'kismi'

  /*
    Kazanç bildirimi kendiliğinden kapanır; kullanıcıyı çarpıya basmaya
    zorlamanın bir anlamı yok, panel yalnızca onay taşıyor.

    Başarısız sonuçlarda kapanmaz: panel gerekçeyi ve "İtiraz et ve incelet"
    düğmesini taşır. Kendiliğinden kapanması itiraz akışına erişimi
    kaldırırdı ve kullanıcı gerekçeyi okumadan kaybedebilirdi.

    İşaretçi üzerine gelince veya odak panele girince sayaç durur
    (WCAG 1.4.13 — içerik erişilebilir kalmalı, 2.2.1 — süre ayarlanabilir).
  */
  useEffect(() => {
    if (!basarili || itirazAcik || duraklatildi) return
    const baslangic = Date.now() - gecenRef.current
    const sayac = window.setInterval(() => {
      const gecen = Date.now() - baslangic
      gecenRef.current = gecen
      const kalan = Math.max(0, 100 - (gecen / OTOMATIK_KAPANMA_MS) * 100)
      setKalanYuzde(kalan)
      if (kalan === 0) {
        window.clearInterval(sayac)
        onClose()
      }
    }, 50)
    return () => window.clearInterval(sayac)
  }, [basarili, itirazAcik, duraklatildi, onClose])

  if (itirazAcik) {
    return <Itiraz sonuc={sonuc} onClose={onClose} />
  }
  const cizgiKalinligi = Math.max(1, Math.min(8, sonuc.skor / 12))
  const cizgiSaydamligi = Math.max(0.3, sonuc.skor / 100)

  const baslik =
    sonuc.durumu === 'gecti'
      ? 'İçerik nitelikli bulundu'
      : sonuc.durumu === 'kismi'
        ? 'İçerik kısmen nitelikli bulundu'
        : sonuc.durumu === 'kopya'
          ? 'Bu içerik daha önce paylaşılmış'
          : 'Bu gönderi jeton kazanmadı'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div
        className="bg-card w-full max-w-lg rounded-2xl border border-line-strong shadow-2xl pointer-events-auto overflow-hidden mihenk-alttan"
        role="status"
        aria-live="polite"
        onMouseEnter={() => setDuraklatildi(true)}
        onMouseLeave={() => setDuraklatildi(false)}
        onFocusCapture={() => setDuraklatildi(true)}
        onBlurCapture={() => setDuraklatildi(false)}
      >
        {/* Kalan süre çubuğu: panelin kendiliğinden kapanacağı sürpriz olmasın */}
        {basarili && (
          <div className="h-0.5 bg-line" aria-hidden="true">
            <div
              className="h-full bg-brand"
              style={{ width: `${kalanYuzde}%`, transition: 'width 50ms linear' }}
            />
          </div>
        )}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="font-display font-bold text-lg text-primary">MİHENK doğrulaması</h3>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-secondary">skor {sonuc.skor}/100</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-page rounded-full text-secondary transition-colors"
              aria-label={
                basarili
                  ? 'Doğrulama sonucunu şimdi kapat'
                  : 'Doğrulama sonucunu kapat'
              }
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="bg-page w-full h-32 relative flex items-center justify-center p-6 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            {basarili ? (
              <path
                d="M -50 64 Q 100 80, 250 50 T 600 64"
                fill="none"
                stroke="var(--mihenk-brand)"
                strokeWidth={cizgiKalinligi}
                strokeLinecap="round"
                opacity={cizgiSaydamligi}
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: cizgiGorunur ? 0 : 800,
                  transition: 'stroke-dashoffset 600ms ease-out',
                }}
              />
            ) : (
              <path
                d="M -50 64 Q 100 80, 250 50 T 600 64"
                fill="none"
                stroke="var(--mihenk-error)"
                strokeWidth={2}
                strokeDasharray="4 8"
                opacity={0.5}
                style={{
                  strokeDashoffset: cizgiGorunur ? 0 : 50,
                  transition: 'stroke-dashoffset 600ms linear',
                }}
              />
            )}
          </svg>

          <div
            className={`z-10 font-mono text-5xl font-bold transition-all duration-500 delay-300 ${
              cizgiGorunur ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            } ${sonuc.kazanilanJeton > 0 ? 'text-brand' : 'text-secondary'}`}
          >
            +{sonuc.kazanilanJeton}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 shrink-0">
              {sonuc.durumu === 'gecti' ? (
                <CheckCircle2 className="text-success" aria-hidden="true" />
              ) : sonuc.durumu === 'kismi' ? (
                <AlertCircle className="text-brand" aria-hidden="true" />
              ) : sonuc.durumu === 'kopya' ? (
                <Copy className="text-error" aria-hidden="true" />
              ) : (
                <XCircle className="text-error" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-primary text-lg mb-1">{baslik}</p>
              <ul className="text-sm text-secondary space-y-1 list-disc pl-4 mt-2">
                {sonuc.gerekce.map((g, i) => (
                  <li key={`${i}-${g}`}>{g}</li>
                ))}
              </ul>

              {!basarili && (
                <p className="mt-3 text-sm font-medium text-primary">
                  Gönderin yayında kalmaya devam ediyor. Doğrulama yalnızca jeton kazanımını
                  belirler.
                </p>
              )}
            </div>
          </div>

          {!basarili && (
            <button
              type="button"
              onClick={() => setItirazAcik(true)}
              className="w-full mt-2 py-2.5 bg-page hover:bg-card border border-line-strong text-primary font-medium rounded-lg transition-colors"
            >
              İtiraz et ve incelet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
