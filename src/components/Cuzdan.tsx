"use client"

import { useState } from "react"
import { ArrowDownRight, ArrowUpRight, RefreshCcw } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import { gunlukTavan } from "@/lib/store/depo"
import { kalanSure, suresiDoldu } from "@/lib/store/efektler"
import { KatmanEkran } from "./KatmanEkran"
import { ETKI_METNI, KozmetikGorseli } from "./KozmetikGorseli"
import { Modal } from "./Modal"
import { Yuzey } from "./Yuzey"

export function Cuzdan({ onBack }: { onBack: () => void }) {
  const { state, resetToDemo, urunAcKapa } = useStore()
  const { jetonBakiyesi, bugunKazanilan } = state.kullanici
  const [sifirlamaSoruluyor, setSifirlamaSoruluyor] = useState(false)

  const tavan = gunlukTavan(state)
  const gunlukYuzde = Math.min(100, (bugunKazanilan / tavan) * 100)

  const envanter = state.kullanici.envanter
    .map((sahip) => ({ sahip, urun: state.magaza.find((u) => u.id === sahip.urunId) }))
    .filter((e) => e.urun !== undefined)

  return (
    <>
      <KatmanEkran
        baslik="Cüzdan"
        onBack={onBack}
        sagEylem={
          <button
            type="button"
            onClick={() => setSifirlamaSoruluyor(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full border border-line-strong hover:bg-page text-xs text-secondary hover:text-primary transition-colors"
          >
            <RefreshCcw size={14} aria-hidden="true" /> Demoyu sıfırla
          </button>
        }
      >
        {/*
          MİHENK YÜZEYİ — bakiye kartı.

          Pirinç kartın ZEMİNİ ev sahibi sayfasından neredeyse ayrışmıyor
          (ölçüldü: koyu 1,20 · açık 1,11 — normal kart/sayfa ayrımıyla aynı
          seviyede). Bu yüzden kart kendini zeminiyle değil KENARLIĞIYLA ve
          içeriğinin rengiyle ayırır. Zemine bel bağlayan bir tasarım
          görünmez olurdu.
        */}
        <Yuzey
          tur="mihenk"
          className="border border-brand/40 bg-card rounded-2xl p-7 mb-7 relative overflow-hidden flex flex-col items-center justify-center"
        >
          <div
            className="absolute -right-20 -top-20 w-64 h-64 bg-brand/5 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <p className="text-secondary text-sm font-medium mb-2 z-10">Toplam bakiye</p>
          <p className="font-mono text-6xl font-bold text-brand z-10 tracking-tighter">
            {jetonBakiyesi}
          </p>

          <div className="w-full max-w-xs mt-7 z-10">
            <div className="flex justify-between text-xs text-secondary mb-2">
              <span>Günlük üst sınır</span>
              <span className="font-mono">
                {bugunKazanilan} / {tavan}
              </span>
            </div>
            <div
              className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={bugunKazanilan}
              aria-valuemin={0}
              aria-valuemax={tavan}
              aria-label="Bugün kazanılan jeton"
            >
              <div
                className="h-full bg-brand transition-all duration-1000 ease-out"
                style={{ width: `${gunlukYuzde}%` }}
              />
            </div>
          </div>
        </Yuzey>

        <section className="mb-7">
          <h3 className="font-bold text-lg text-primary mb-1">Envanter</h3>
          <p className="text-secondary text-xs mb-3">
            Aynı türden yalnızca bir ürün takılı olabilir.
          </p>

          {envanter.length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-6 text-center">
              <p className="text-primary font-medium">Envanterin henüz boş</p>
              <p className="text-secondary text-sm mt-1">
                Mağazadan aldığın çerçeve, rozet ve temalar burada listelenir; buradan
                açıp kapatabilirsin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {envanter.map(({ sahip, urun }) => {
                const doldu = suresiDoldu(urun, sahip)
                return (
                  <div
                    key={sahip.urunId}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <KozmetikGorseli tur={urun!.efekt.tur} deger={urun!.efekt.deger} />
                      <div className="min-w-0">
                        <p className="text-primary font-medium text-sm truncate">{urun!.ad}</p>
                        <p className="text-secondary text-xs mt-0.5 truncate">
                          {ETKI_METNI[urun!.efekt.tur]}
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono">
                            {doldu ? 'Süresi doldu' : (kalanSure(urun, sahip) ?? 'Kalıcı')}
                          </span>
                        </p>
                      </div>
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
          )}
        </section>

        <h3 className="font-bold text-lg text-primary mb-3">Hareket defteri</h3>

        <div className="space-y-3">
          {state.hareketler.map((hareket) => (
            <div
              key={hareket.id}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line bg-card hover:border-line-strong transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/*
                  Tutar ve yön simgesi MİHENK'in ürettiği değer — pirinç yüzeyde.
                */}
                <Yuzey
                  tur="mihenk"
                  className={`p-2 rounded-full shrink-0 ${
                    hareket.miktar > 0 ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand'
                  }`}
                  aria-hidden="true"
                >
                  {hareket.miktar > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </Yuzey>
                <div className="min-w-0">
                  <p className="text-primary font-medium text-sm flex items-center gap-2 flex-wrap">
                    <span className="truncate">{hareket.aciklama}</span>
                    {hareket.tur === 'demo' && (
                      <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded border border-line-strong text-secondary">
                        demo
                      </span>
                    )}
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
              <Yuzey
                tur="mihenk"
                className={`font-mono text-lg font-bold shrink-0 ${
                  hareket.miktar > 0 ? 'text-success' : 'text-brand'
                }`}
              >
                {hareket.miktar > 0 ? '+' : ''}
                {hareket.miktar}
              </Yuzey>
            </div>
          ))}

          {state.hareketler.length === 0 && (
            <div className="rounded-xl border border-line bg-card p-6 text-center">
              <p className="text-primary font-medium">Hareket defterin henüz boş</p>
              <p className="text-secondary text-sm mt-1">
                Doğrulamayı geçen her gönderin ve yaptığın her satın alma buraya kaydedilir.
              </p>
            </div>
          )}
        </div>
      </KatmanEkran>

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
    </>
  )
}
