"use client"

import { useState } from "react"
import { ArrowDownRight, ArrowLeft, ArrowUpRight, RefreshCcw } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import { kalanSure, suresiDoldu } from "@/lib/store/efektler"
import { GUNLUK_UST_SINIR } from "@/lib/verification"
import { Modal } from "./Modal"

export function Cuzdan({ onBack }: { onBack: () => void }) {
  const { state, resetToDemo, urunAcKapa } = useStore()
  const { jetonBakiyesi, bugunKazanilan } = state.kullanici
  const [sifirlamaSoruluyor, setSifirlamaSoruluyor] = useState(false)

  const gunlukYuzde = Math.min(100, (bugunKazanilan / GUNLUK_UST_SINIR) * 100)

  const envanter = state.kullanici.envanter
    .map((sahip) => ({ sahip, urun: state.magaza.find((u) => u.id === sahip.urunId) }))
    .filter((e) => e.urun !== undefined)

  return (
    <div className="fixed inset-0 z-40 bg-page flex flex-col mihenk-sagdan">
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col h-full bg-card border-x border-line overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-line bg-page/60">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-card rounded-full text-primary transition-colors"
            aria-label="Akışa geri dön"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <h2 className="font-display font-bold text-2xl text-primary tracking-tight">Cüzdan</h2>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setSifirlamaSoruluyor(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line-strong hover:bg-page text-xs text-secondary hover:text-primary transition-colors"
          >
            <RefreshCcw size={14} aria-hidden="true" /> Demoyu sıfırla
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 bg-page">
          <div className="border border-brand/25 bg-card rounded-2xl p-8 mb-8 relative overflow-hidden flex flex-col items-center justify-center">
            <div
              className="absolute -right-20 -top-20 w-64 h-64 bg-brand/5 rounded-full blur-3xl"
              aria-hidden="true"
            />

            <p className="text-secondary text-sm font-medium mb-2 z-10">Toplam bakiye</p>
            <p className="font-mono text-6xl md:text-7xl font-bold text-brand z-10 tracking-tighter">
              {jetonBakiyesi}
            </p>

            <div className="w-full max-w-xs mt-8 z-10">
              <div className="flex justify-between text-xs text-secondary mb-2">
                <span>Günlük üst sınır</span>
                <span className="font-mono">
                  {bugunKazanilan} / {GUNLUK_UST_SINIR}
                </span>
              </div>
              <div
                className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={bugunKazanilan}
                aria-valuemin={0}
                aria-valuemax={GUNLUK_UST_SINIR}
                aria-label="Bugün kazanılan jeton"
              >
                <div
                  className="h-full bg-brand transition-all duration-1000 ease-out"
                  style={{ width: `${gunlukYuzde}%` }}
                />
              </div>
            </div>
          </div>

          {envanter.length > 0 && (
            <section className="mb-8">
              <h3 className="font-display font-bold text-xl text-primary mb-4">Envanter</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {envanter.map(({ sahip, urun }) => {
                  const doldu = suresiDoldu(urun, sahip)
                  return (
                    <div
                      key={sahip.urunId}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line bg-card"
                    >
                      <div className="min-w-0">
                        <p className="text-primary font-medium text-sm truncate">{urun!.ad}</p>
                        <p className="text-secondary text-xs mt-1 font-mono">
                          {doldu ? 'Süresi doldu' : (kalanSure(urun, sahip) ?? 'Kalıcı')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => urunAcKapa(sahip.urunId)}
                        disabled={doldu}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          sahip.aktif && !doldu
                            ? 'border-success text-success bg-success/10'
                            : 'border-line-strong text-secondary bg-page'
                        }`}
                      >
                        {sahip.aktif && !doldu ? 'Açık' : 'Kapalı'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <h3 className="font-display font-bold text-xl text-primary mb-4">Hareket defteri</h3>

          <div className="space-y-3">
            {state.hareketler.map((hareket) => (
              <div
                key={hareket.id}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line bg-card hover:border-line-strong transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`p-2 rounded-full shrink-0 ${
                      hareket.miktar > 0 ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand'
                    }`}
                    aria-hidden="true"
                  >
                    {hareket.miktar > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-primary font-medium text-sm sm:text-base truncate">
                      {hareket.aciklama}
                    </p>
                    <time className="text-secondary text-xs mt-1 font-mono block" dateTime={hareket.zaman}>
                      {new Date(hareket.zaman).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
                <div
                  className={`font-mono text-lg font-bold shrink-0 ${
                    hareket.miktar > 0 ? 'text-success' : 'text-primary'
                  }`}
                >
                  {hareket.miktar > 0 ? '+' : ''}
                  {hareket.miktar}
                </div>
              </div>
            ))}

            {state.hareketler.length === 0 && (
              <p className="text-secondary text-center py-8">Henüz hareket yok.</p>
            )}
          </div>
        </div>
      </div>

      {sifirlamaSoruluyor && (
        <Modal
          onClose={() => setSifirlamaSoruluyor(false)}
          labelledBy="sifirla-baslik"
          className="max-w-sm"
        >
          <div className="p-6">
            <h3 id="sifirla-baslik" className="font-display font-bold text-lg text-primary mb-2">
              Demo sıfırlansın mı?
            </h3>
            <p className="text-secondary text-sm mb-6">
              Paylaştığınız gönderiler, kazandığınız jetonlar ve satın aldığınız ürünler silinir.
              Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSifirlamaSoruluyor(false)}
                className="flex-1 py-2.5 bg-page hover:bg-card border border-line-strong text-primary font-bold rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemo()
                  setSifirlamaSoruluyor(false)
                  onBack()
                }}
                className="flex-1 py-2.5 bg-error hover:bg-error/90 text-white font-bold rounded-xl transition-colors"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
