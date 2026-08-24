"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle2, Send } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import type { DogrulamaSonucu } from "@/lib/store/types"
import { Modal } from "./Modal"

export function Itiraz({ sonuc, onClose }: { sonuc: DogrulamaSonucu; onClose: () => void }) {
  const { itirazEt } = useStore()
  const [adim, setAdim] = useState<1 | 2 | 3>(1)
  const [aciklama, setAciklama] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aciklama.trim()) return
    itirazEt(sonuc.gonderiId)
    setAdim(3)
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy="itiraz-baslik"
      describedBy="itiraz-aciklama"
      className="max-w-md"
    >
      <div className="bg-brand/10 p-4 border-b border-brand/20 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-page rounded-full text-brand transition-colors"
          aria-label="İtirazı kapat"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h3 id="itiraz-baslik" className="font-display font-bold text-brand">
          İtiraz ve inceleme
        </h3>
        <span className="ml-auto text-xs font-mono text-secondary">Adım {adim}/3</span>
      </div>

      <div className="p-6">
        {adim === 1 && (
          <div>
            <p id="itiraz-aciklama" className="text-primary font-medium mb-4">
              Aşağıdaki gerekçelere itiraz etmek üzeresiniz:
            </p>

            <ul className="text-sm text-secondary space-y-2 list-disc pl-4 mb-6 bg-page p-4 rounded-xl border border-line">
              {sonuc.gerekce.map((g, i) => (
                <li key={`${i}-${g}`}>{g}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setAdim(2)}
              className="w-full py-3 bg-brand hover:bg-brand/90 text-brand-ink font-bold rounded-xl transition-colors"
            >
              Devam et
            </button>
          </div>
        )}

        {adim === 2 && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="itiraz-metni" id="itiraz-aciklama" className="block text-primary font-medium mb-3">
              İtirazınızın nedeni nedir?
            </label>
            <textarea
              id="itiraz-metni"
              required
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value.slice(0, 500))}
              placeholder="İçeriğinizin neden özgün olduğunu veya kurallara uyduğunu kısaca açıklayın…"
              className="w-full h-32 bg-page border border-line rounded-xl p-3 text-primary placeholder:text-secondary/60 outline-none focus:border-brand/60 resize-none mb-2"
            />
            <p className="text-xs font-mono text-secondary mb-6 text-right">
              {aciklama.length}/500
            </p>

            <button
              type="submit"
              disabled={!aciklama.trim()}
              className="w-full py-3 bg-interaction hover:bg-interaction/90 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} aria-hidden="true" /> İncelemeye gönder
            </button>
          </form>
        )}

        {adim === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-brand/10 border border-brand/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            <h4 className="font-bold text-xl text-primary mb-2">İtirazınız alındı</h4>
            <p id="itiraz-aciklama" className="text-secondary text-sm mb-3">
              İçeriğiniz insan moderatörler tarafından incelenecek.
            </p>
            <p className="text-secondary text-sm mb-6 border border-line rounded-lg p-3 bg-page">
              Prototipte itiraz inceleme süreci sonuç üretmemektedir; bu akış final sürümünde
              tamamlanacaktır.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-page hover:bg-card border border-line-strong text-primary font-bold rounded-xl transition-colors"
            >
              Akışa dön
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
