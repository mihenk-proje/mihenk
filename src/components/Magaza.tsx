"use client"

import { useState } from "react"
import { ArrowLeft, Clock, ShoppingBag } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import {
  AD_RENGI_SINIFLARI,
  CERCEVE_SINIFLARI,
  ROZET_SIMGELERI,
  TEMA_SINIFLARI,
  kalanSure,
  suresiDoldu,
} from "@/lib/store/efektler"
import type { Urun } from "@/lib/store/types"
import { Avatar } from "./Avatar"
import { Modal } from "./Modal"

const KATEGORILER = [
  { id: 'sureli', label: 'Süreli' },
  { id: 'sezonluk', label: 'Sezonluk' },
  { id: 'kalici', label: 'Kalıcı' },
  { id: 'islevsel', label: 'İşlevsel' },
] as const

type Kategori = (typeof KATEGORILER)[number]['id']

/**
 * Ürünün ne kadar süreyle geçerli olduğunu gösterir.
 * Hem mağaza kartında hem önizleme penceresinde kullanılır ki kullanıcı
 * süreyi satın alma kararından önce aynı yerde ve aynı biçimde görsün.
 */
function SureCipi({ urun }: { urun: Urun }) {
  const etiket =
    urun.sureGun === null ? 'Süresiz' : urun.sureGun === 1 ? '24 saat' : `${urun.sureGun} gün`

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-secondary bg-page px-2 py-1 rounded border border-line font-mono">
      <Clock size={12} aria-hidden="true" />
      {etiket}
    </span>
  )
}

export function Magaza({ onBack }: { onBack: () => void }) {
  const { state, urunSatinAl, urunAcKapa } = useStore()
  const [aktifKategori, setAktifKategori] = useState<Kategori>('sureli')
  const [onizleme, setOnizleme] = useState<Urun | null>(null)
  const [bildirim, setBildirim] = useState<string | null>(null)

  const { jetonBakiyesi } = state.kullanici

  /** Ürün hâlâ yürürlükte mi (satın alınmış ve süresi dolmamış)? */
  const sahiplikDurumu = (urun: Urun) => {
    const sahip = state.kullanici.envanter.find((s) => s.urunId === urun.id)
    if (!sahip) return { sahipMi: false, aktif: false, kalan: null as string | null }
    if (suresiDoldu(urun, sahip)) return { sahipMi: false, aktif: false, kalan: 'Süresi doldu' }
    return { sahipMi: true, aktif: sahip.aktif, kalan: kalanSure(urun, sahip) }
  }

  const handleSatinAl = (urun: Urun) => {
    if (urunSatinAl(urun)) {
      setBildirim(`${urun.ad} alındı ve profiline uygulandı.`)
      window.setTimeout(() => setBildirim(null), 3000)
      if (onizleme?.id === urun.id) setOnizleme(null)
    } else {
      setBildirim('Bakiye yetersiz.')
      window.setTimeout(() => setBildirim(null), 3000)
    }
  }

  const filtrelenmis = state.magaza.filter((u) => u.kategori === aktifKategori)

  return (
    <div className="fixed inset-0 z-40 bg-page flex flex-col mihenk-sagdan">
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col h-full bg-card border-x border-line overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line bg-page/60">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-card rounded-full text-primary transition-colors"
              aria-label="Akışa geri dön"
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <h2 className="font-display font-bold text-2xl text-primary tracking-tight">Mağaza</h2>
          </div>
          <div
            className="font-mono text-xl font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-lg border border-brand/25"
            aria-label={`Bakiyeniz ${jetonBakiyesi} jeton`}
          >
            {jetonBakiyesi}
          </div>
        </div>

        <div
          className="flex overflow-x-auto border-b border-line bg-page/30 hide-scrollbar"
          role="tablist"
          aria-label="Ürün kategorileri"
        >
          {KATEGORILER.map((kat) => (
            <button
              key={kat.id}
              type="button"
              role="tab"
              aria-selected={aktifKategori === kat.id}
              onClick={() => setAktifKategori(kat.id)}
              className={`flex-1 py-4 px-6 font-bold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
                aktifKategori === kat.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>

        <p aria-live="polite" className="sr-only">
          {bildirim}
        </p>
        {bildirim && (
          <div className="mx-4 mt-4 px-4 py-2 rounded-lg border border-brand/30 bg-brand/10 text-sm text-primary">
            {bildirim}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-page">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtrelenmis.map((urun) => {
              const { sahipMi, aktif, kalan } = sahiplikDurumu(urun)
              const bakiyeYetersiz = jetonBakiyesi < urun.fiyat

              return (
                <div
                  key={urun.id}
                  className="border border-line bg-card rounded-2xl p-5 flex flex-col hover:border-brand/40 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-bold text-lg text-primary">{urun.ad}</h3>
                    <div className="font-mono font-bold text-brand text-lg shrink-0">
                      {urun.fiyat}
                    </div>
                  </div>

                  <p className="text-secondary text-sm mb-4 flex-1">{urun.aciklama}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <SureCipi urun={urun} />
                    {sahipMi && kalan && (
                      <span className="text-xs font-mono text-brand bg-brand/10 px-2 py-1 rounded border border-brand/25">
                        {kalan}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-line">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOnizleme(urun)}
                        className="flex-1 py-2 bg-page hover:bg-card border border-line-strong text-primary text-sm font-bold rounded-lg transition-colors"
                      >
                        Dene
                      </button>

                      {sahipMi ? (
                        <button
                          type="button"
                          onClick={() => urunAcKapa(urun.id)}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${
                            aktif
                              ? 'border-success text-success bg-success/10'
                              : 'border-line-strong text-secondary bg-page'
                          }`}
                        >
                          {aktif ? 'Açık' : 'Kapalı'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSatinAl(urun)}
                          disabled={bakiyeYetersiz}
                          aria-disabled={bakiyeYetersiz || undefined}
                          aria-describedby={bakiyeYetersiz ? `eksik-${urun.id}` : undefined}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                            bakiyeYetersiz
                              ? 'bg-page border border-line text-secondary cursor-not-allowed'
                              : 'bg-brand hover:bg-brand/90 text-brand-ink'
                          }`}
                        >
                          Al
                        </button>
                      )}
                    </div>

                    {!sahipMi && bakiyeYetersiz && (
                      <p id={`eksik-${urun.id}`} className="mt-2 text-xs text-secondary">
                        {urun.fiyat - jetonBakiyesi} jeton daha gerekiyor.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filtrelenmis.length === 0 && (
            <p className="text-center text-secondary py-12">
              Bu kategoride henüz ürün bulunmuyor.
            </p>
          )}
        </div>
      </div>

      {onizleme && (
        <UrunOnizleme
          urun={onizleme}
          onKapat={() => setOnizleme(null)}
          onSatinAl={() => handleSatinAl(onizleme)}
        />
      )}
    </div>
  )
}

function UrunOnizleme({
  urun,
  onKapat,
  onSatinAl,
}: {
  urun: Urun
  onKapat: () => void
  onSatinAl: () => void
}) {
  const { state } = useStore()
  const { efekt } = urun
  const bakiyeYetersiz = state.kullanici.jetonBakiyesi < urun.fiyat

  const cerceveSinifi = efekt.tur === 'cerceve' ? (CERCEVE_SINIFLARI[efekt.deger] ?? '') : ''
  const adSinifi = efekt.tur === 'adRengi' ? (AD_RENGI_SINIFLARI[efekt.deger] ?? '') : ''
  const rozetGorunum = efekt.tur === 'rozet' ? ROZET_SIMGELERI[efekt.deger] : undefined
  const temaSinifi = efekt.tur === 'tema' ? (TEMA_SINIFLARI[efekt.deger] ?? '') : ''

  return (
    <Modal onClose={onKapat} labelledBy="onizleme-baslik" className="max-w-md">
      <div className="bg-brand/10 p-4 border-b border-brand/20">
        <h3
          id="onizleme-baslik"
          className="font-display font-bold text-brand flex items-center gap-2"
        >
          <ShoppingBag size={20} aria-hidden="true" /> Önizleme: {urun.ad}
        </h3>
        <div className="mt-2">
          <SureCipi urun={urun} />
        </div>
        <p className="text-secondary text-sm mt-2">
          {/*
            İşlevsel ürünler profilde görünmez; onlar için "nasıl görüneceğini
            gösterir" demek yanlış bilgi olur.
          */}
          {efekt.tur === 'islev'
            ? 'Bu bir önizlemedir; satın alındığında hangi işlevi kazanacağını gösterir.'
            : 'Bu bir önizlemedir; satın alma yapılmadan profilinizde nasıl görüneceğini gösterir.'}
        </p>
      </div>

      <div className={`p-8 flex flex-col items-center justify-center bg-page ${temaSinifi}`}>
        <div className="mb-4">
          <Avatar
            id={state.kullanici.id}
            harfler={state.kullanici.avatarHarfleri}
            ad={state.kullanici.adSoyad}
            boyut="lg"
            cerceveSinifi={cerceveSinifi}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center text-lg">
          <span className={`font-bold ${adSinifi || 'text-primary'}`}>
            {state.kullanici.adSoyad}
          </span>
          {rozetGorunum && (
            <span className={rozetGorunum.sinif} aria-label={rozetGorunum.etiket}>
              {rozetGorunum.simge}
            </span>
          )}
        </div>
        <span className="text-secondary text-sm">@{state.kullanici.kullaniciAdi}</span>

        {efekt.tur === 'islev' && (
          <p className="mt-6 p-4 border border-brand/25 bg-brand/5 rounded-xl text-center text-primary text-sm font-medium">
            Sistem işlevi: {urun.aciklama}
          </p>
        )}

        {efekt.tur === 'tema' && (
          <p className="mt-6 text-secondary text-sm text-center">
            Profil zeminine {urun.ad.toLowerCase()} dokusu uygulanır.
          </p>
        )}
      </div>

      <div className="p-4 bg-card border-t border-line">
        {bakiyeYetersiz && (
          <p id="onizleme-eksik" className="mb-3 text-sm text-secondary text-center">
            {urun.fiyat - state.kullanici.jetonBakiyesi} jeton daha gerekiyor.
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onKapat}
            className="flex-1 py-3 bg-page hover:bg-card border border-line-strong text-primary font-bold rounded-xl transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onSatinAl}
            disabled={bakiyeYetersiz}
            aria-disabled={bakiyeYetersiz || undefined}
            aria-describedby={bakiyeYetersiz ? 'onizleme-eksik' : undefined}
            className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
              bakiyeYetersiz
                ? 'bg-page border border-line text-secondary cursor-not-allowed'
                : 'bg-brand hover:bg-brand/90 text-brand-ink'
            }`}
          >
            {bakiyeYetersiz ? 'Yetersiz bakiye' : `Al (${urun.fiyat})`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
