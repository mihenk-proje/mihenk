"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react"
import { Itiraz } from "./Itiraz"

type DogrulamaSonucuProps = {
  sonuc: any | null
  onClose: () => void
}

export function DogrulamaSonucu({ sonuc, onClose }: DogrulamaSonucuProps) {
  const [showLine, setShowLine] = useState(false)
  const [showItiraz, setShowItiraz] = useState(false)

  useEffect(() => {
    if (sonuc) {
      setShowLine(false)
      setShowItiraz(false)
      const timer = setTimeout(() => setShowLine(true), 100)
      return () => clearTimeout(timer)
    }
  }, [sonuc])

  if (!sonuc) return null

  if (showItiraz) {
    return <Itiraz sonuc={sonuc} onClose={onClose} />
  }

  const isSuccess = sonuc.durumu === 'gecti' || sonuc.durumu === 'kismi'
  
  const lineStrokeWidth = Math.max(1, Math.min(8, sonuc.skor / 12)) 
  const lineOpacity = Math.max(0.3, sonuc.skor / 100) 
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div 
        className="bg-card w-full max-w-lg rounded-2xl  border border-primary pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center justify-between p-4 border-b border-primary/50">
          <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
            MİHENK Doğrulaması
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-page rounded-full text-secondary transition-colors" aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <div className="bg-page w-full h-32 relative flex items-center justify-center p-6 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {isSuccess ? (
              <path 
                d="M -50 64 Q 100 80, 250 50 T 600 64" 
                fill="none" 
                stroke="var(--color-brand)" 
                strokeWidth={lineStrokeWidth}
                strokeLinecap="round"
                opacity={lineOpacity}
                className="motion-reduce:transition-none" style={{
                  strokeDasharray: 800,
                  strokeDashoffset: showLine ? 0 : 800,
                  transition: 'stroke-dashoffset 600ms ease-out'
                }}
              />
            ) : (
              <path 
                d="M -50 64 Q 100 80, 250 50 T 600 64" 
                fill="none" 
                stroke="var(--color-error)" 
                strokeWidth={2}
                strokeDasharray="4 8"
                opacity={0.5}
                className="motion-reduce:transition-none" style={{
                  strokeDashoffset: showLine ? 0 : 50,
                  transition: 'stroke-dashoffset 600ms linear'
                }}
              />
            )}
          </svg>

          <div 
            className={`z-10 font-mono text-5xl font-bold transition-all duration-500 delay-300 ${
              showLine ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            } ${isSuccess ? 'text-brand' : 'text-secondary'}`}
          >
            +{sonuc.kazanilanJeton}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5">
              {sonuc.durumu === 'gecti' ? <CheckCircle2 className="text-success" /> : 
               sonuc.durumu === 'kismi' ? <AlertCircle className="text-brand" /> : 
               <XCircle className="text-error" />}
            </div>
            <div>
              <p className="font-bold text-primary text-lg mb-1">
                {sonuc.durumu === 'gecti' ? 'İçerik nitelikli bulundu' : 
                 sonuc.durumu === 'kismi' ? 'İçerik kısmen nitelikli bulundu' : 
                 'Bu gönderi jeton kazanmadı'}
              </p>
              <ul className="text-sm text-secondary space-y-1 list-disc pl-4 mt-2">
                {sonuc.gerekce.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
              
              {!isSuccess && (
                <p className="mt-3 text-sm font-medium text-primary">
                  Gönderin yayında kalmaya devam ediyor.
                </p>
              )}
            </div>
          </div>

          {!isSuccess && (
            <button 
              onClick={() => setShowItiraz(true)}
              className="w-full mt-2 py-2.5 bg-page hover:bg-page/80 border border-primary text-primary font-medium rounded-lg transition-colors"
            >
              İtiraz et ve İncelet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
