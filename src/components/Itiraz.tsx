"use client"

import { useState } from "react"
import { ArrowLeft, Send } from "lucide-react"

export function Itiraz({ sonuc, onClose }: { sonuc: any, onClose: () => void }) {
  const [adim, setAdim] = useState(1)
  const [aciklama, setAciklama] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAdim(3) // Sonuç adımına geç
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-page/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-brand/30 overflow-hidden" role="dialog" aria-modal="true">
        
        <div className="bg-brand/10 p-4 border-b border-brand/20 flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-page rounded-full text-brand transition-colors" aria-label="Kapat">
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-display font-bold text-brand">İtiraz ve İnceleme</h3>
        </div>

        <div className="p-6">
          {adim === 1 && (
            <div className="animate-in slide-in-from-right-4">
              <p className="text-primary font-medium mb-4">Aşağıdaki gerekçelere itiraz etmek üzeresiniz:</p>
              
              <ul className="text-sm text-secondary space-y-2 list-disc pl-4 mb-6 bg-page p-4 rounded-xl border border-primary/20">
                {sonuc?.gerekce?.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>

              <button 
                onClick={() => setAdim(2)}
                className="w-full py-3 bg-brand hover:bg-brand/90 text-[#12181A] font-bold rounded-xl transition-colors"
              >
                Devam Et
              </button>
            </div>
          )}

          {adim === 2 && (
            <form onSubmit={handleSubmit} className="animate-in slide-in-from-right-4">
              <p className="text-primary font-medium mb-3">İtirazınızın nedeni nedir?</p>
              <textarea
                required
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="Lütfen içeriğinizin neden özgün olduğunu veya kurallara uyduğunu kısaca açıklayın..."
                className="w-full h-32 bg-page border border-primary/30 rounded-xl p-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-brand/50 resize-none mb-6"
              />
              
              <button 
                type="submit"
                disabled={!aciklama.trim()}
                className="w-full py-3 bg-interaction hover:bg-interaction/90 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} /> İncelemeye Gönder
              </button>
            </form>
          )}

          {adim === 3 && (
            <div className="animate-in zoom-in-95 text-center py-6">
              <div className="w-16 h-16 bg-brand/10 border border-brand/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
                <CheckCircleIcon size={32} />
              </div>
              <h4 className="font-bold text-xl text-primary mb-2">İtirazınız Alındı</h4>
              <p className="text-secondary text-sm mb-6">
                İçeriğiniz insan moderatörler tarafından incelenecek. Prototip sürümünde bu durum yalnızca simüle edilmektedir.
              </p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-page hover:bg-page/80 border border-primary text-primary font-bold rounded-xl transition-colors"
              >
                Akışa Dön
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
}
