"use client"

import { useRef, useState } from "react"
import { Clock, Coins, ShoppingBag } from "lucide-react"
import { KOLEKSIYONLAR } from "@/lib/store/demoData"
import { useStore } from "@/lib/store/kanca"
import {
  AD_RENGI_SINIFLARI,
  CERCEVE_SINIFLARI,
  CIKARTMA_YOLLARI,
  KENARLIK_SINIFLARI,
  SOHBET_ZEMINI_SINIFLARI,
  ROZET_SIMGELERI,
  TEMA_SINIFLARI,
  kalanSure,
  koleksiyonDurumu,
  suresiDoldu,
} from "@/lib/store/efektler"
import type { AppState, Urun } from "@/lib/store/types"
import { KatmanEkran } from "./KatmanEkran"
import { KimlikOnizleme } from "./KimlikOnizleme"
import { ETKI_METNI, KozmetikGorseli } from "./KozmetikGorseli"
import { Modal } from "./Modal"
import { Yuzey } from "./Yuzey"

const KATEGORILER = [
  { id: 'sureli', label: 'Süreli' },
  { id: 'sezonluk', label: 'Sezonluk' },
  { id: 'kalici', label: 'Kalıcı' },
  { id: 'islevsel', label: 'İşlevsel' },
] as const

type Kategori = (typeof KATEGORILER)[number]['id']

/**
 * Jeton tutarı. Çıplak sayı yerine birim taşır: görsel olarak jeton
 * ikonu + sayı, ekran okuyucuda "15 jeton" diye okunur.
 */
function Jeton({ deger, className = '' }: { deger: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono ${className}`}>
      <Coins size={14} aria-hidden="true" />
      <span aria-hidden="true">{deger}</span>
      <span className="sr-only">{deger} jeton</span>
    </span>
  )
}

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

/*
  "3 üründen 2'si alındı" — iyelik eki rakamın OKUNUŞUNA bağlı (biri, ikisi,
  üçü, dördü…), yazılışına değil; tek bir ses uyumu kuralı yetmiyor. Katalogdaki
  koleksiyonlar tek haneli olduğu için okunuşlar elle eşlendi.
*/
const IYELIK_EKI = ["'ı", "'i", "'si", "'ü", "'ü", "'i", "'sı", "'si", "'i", "'u"]
const sayiIyelik = (n: number) => `${n}${IYELIK_EKI[n] ?? "'i"}`

/**
 * Kilitli bir ürünün bağlı olduğu koleksiyon ve ilerlemesi.
 *
 * Ürün → koleksiyon bağı ödül kimliği üzerinden kurulur; ürünün kendisi
 * hangi sete ait olduğunu bilmez, böylece `Urun` şeması büyümez.
 */
function odulIlerlemesi(state: AppState, urun: Urun) {
  if (urun.kilit !== 'koleksiyon') return null
  const koleksiyon = KOLEKSIYONLAR.find((k) => k.odulUrunId === urun.id)
  if (!koleksiyon) return null
  return { koleksiyon, ...koleksiyonDurumu(state, koleksiyon) }
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

  /** Satın alma onayı: ürünün ne kadar süreyle ne yaptığını söyler. */
  const satinAlmaMesaji = (urun: Urun) => {
    const sure =
      urun.sureGun === null
        ? 'kalıcı olarak'
        : urun.sureGun === 1
          ? '24 saat boyunca'
          : `${urun.sureGun} gün boyunca`

    /*
      Her dal "alındı" alt dizgisini taşımalı — klavye denetimi satın almanın
      duyurulduğunu bununla doğruluyor.

      Kenarlık gönderi kartlarında görünür, profilde değil; "profilinde
      görünecek" demek yanlış bilgi olurdu.
    */
    if (urun.efekt.tur === 'islev') return `${urun.ad} alındı, ${sure} kullanabilirsin.`
    if (urun.efekt.tur === 'kenarlik')
      return `${urun.ad} alındı, ${sure} gönderi kartlarında görünecek.`
    if (urun.efekt.tur === 'sohbetZemini' || urun.efekt.tur === 'cikartma')
      return `${urun.ad} alındı, ${sure} sohbetlerinde kullanabilirsin.`
    return `${urun.ad} alındı, ${sure} profilinde görünecek.`
  }

  const handleSatinAl = (urun: Urun) => {
    if (urunSatinAl(urun)) {
      setBildirim(satinAlmaMesaji(urun))
      window.setTimeout(() => setBildirim(null), 5000)
      if (onizleme?.id === urun.id) setOnizleme(null)
    } else {
      setBildirim(`Bakiye yetersiz: ${urun.fiyat - jetonBakiyesi} jeton daha gerekiyor.`)
      window.setTimeout(() => setBildirim(null), 5000)
    }
  }

  const filtrelenmis = state.magaza.filter((u) => u.kategori === aktifKategori)

  /*
    WAI-ARIA sekme kalibi: yalnizca secili sekme sira icinde (roving
    tabIndex), ok tuslari secimi ve odagi birlikte tasir, Home/End uclara
    gider. Boylece sekmeler arasinda Tab'a basarak dolasmak gerekmez.
  */
  const sekmeRefleri = useRef<Array<HTMLButtonElement | null>>([])

  const sekmeKlavye = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const son = KATEGORILER.length - 1
    const simdiki = KATEGORILER.findIndex((k) => k.id === aktifKategori)
    let hedef: number

    switch (e.key) {
      case 'ArrowRight':
        hedef = simdiki === son ? 0 : simdiki + 1
        break
      case 'ArrowLeft':
        hedef = simdiki === 0 ? son : simdiki - 1
        break
      case 'Home':
        hedef = 0
        break
      case 'End':
        hedef = son
        break
      default:
        return
    }

    e.preventDefault()
    setAktifKategori(KATEGORILER[hedef].id)
    sekmeRefleri.current[hedef]?.focus()
  }

  return (
    <>
      <KatmanEkran
        baslik="Mağaza"
        onBack={onBack}
        sagEylem={
          /* Bakiye MİHENK'in ürettiği değer — ev sahibi başlığının içinde pirinç ada. */
          <Yuzey
            tur="mihenk"
            className="shrink-0 flex items-center font-bold text-brand bg-brand/10 px-3 h-9 rounded-full border border-brand/40"
          >
            <span className="sr-only">Bakiyeniz: </span>
            <Jeton deger={jetonBakiyesi} />
          </Yuzey>
        }
        serit={
          <div
            className="shrink-0 flex overflow-x-auto border-b border-line bg-card hide-scrollbar"
            role="tablist"
            aria-label="Ürün kategorileri"
          >
            {KATEGORILER.map((kat, i) => (
              <button
                key={kat.id}
                ref={(el) => {
                  sekmeRefleri.current[i] = el
                }}
                type="button"
                role="tab"
                id={`sekme-${kat.id}`}
                aria-selected={aktifKategori === kat.id}
                aria-controls={`panel-${kat.id}`}
                tabIndex={aktifKategori === kat.id ? 0 : -1}
                onClick={() => setAktifKategori(kat.id)}
                onKeyDown={sekmeKlavye}
                className={`flex-1 h-12 px-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                  aktifKategori === kat.id
                    ? 'border-brand text-primary'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                {kat.label}
              </button>
            ))}
          </div>
        }
      >
        <p aria-live="polite" className="sr-only">
          {bildirim}
        </p>
        {bildirim && (
          <div className="mb-4 px-4 py-2 rounded-lg border border-brand/30 bg-brand/10 text-sm text-primary">
            {bildirim}
          </div>
        )}

        {/*
          Panel artık kaydırılabilir değil — kaydırmayı KatmanEkran yapıyor — ve
          içinde odaklanabilir öğeler var. Bu yüzden tabIndex={0} kaldırıldı:
          WAI-ARIA yalnızca odaklanabilir içerik BARINDIRMAYAN ya da kendisi
          kaydırılan panellerde odak ister. Kazanılan bir sekme durağı.
        */}
        <div role="tabpanel" id={`panel-${aktifKategori}`} aria-labelledby={`sekme-${aktifKategori}`}>
          <div className="grid grid-cols-1 gap-4">
            {filtrelenmis.map((urun) => {
              const { sahipMi, aktif, kalan } = sahiplikDurumu(urun)
              const bakiyeYetersiz = jetonBakiyesi < urun.fiyat
              const ilerleme = odulIlerlemesi(state, urun)
              /*
                Ödül "açıldı mı" sorusu envanter satırının VARLIĞINA bakar,
                süresine değil: kazanılmış bir set, ödülün 30 günü dolduğu
                için yeniden "Kilitli" görünmemeli.
              */
              const odulAcildi = Boolean(
                ilerleme && state.kullanici.envanter.some((s) => s.urunId === urun.id)
              )

              return (
                <div
                  key={urun.id}
                  className="border border-line bg-card rounded-2xl p-5 flex flex-col hover:border-brand/40 transition-colors"
                >
                  {/*
                    Ürünün ne olduğu kartın üstünde görünür. Önceden yalnızca
                    ad ve açıklama vardı: "Tunç Şerit" ile "Tunç Kenar"
                    arasındaki farkı ad okuyarak anlamak mümkün değil. Etkiyi
                    görmek için "Dene" penceresini açmak gerekiyordu.
                  */}
                  <div className="flex items-start gap-3 mb-3">
                    <KozmetikGorseli tur={urun.efekt.tur} deger={urun.efekt.deger} buyuk />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-lg text-primary min-w-0">{urun.ad}</h3>
                        <Yuzey tur="mihenk" className="shrink-0">
                          {ilerleme ? (
                            /*
                              Fiyat yerine "Set ödülü". Prestij ürününün
                              üstünde "0 jeton" yazması bir hata gibi okunur;
                              üstelik ürün satılık da değil.
                            */
                            <span className="inline-block text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded border border-brand/30 whitespace-nowrap">
                              Set ödülü
                            </span>
                          ) : (
                            <Jeton deger={urun.fiyat} className="font-bold text-brand text-lg" />
                          )}
                        </Yuzey>
                      </div>
                      <p className="text-xs text-secondary mt-0.5">{ETKI_METNI[urun.efekt.tur]}</p>
                    </div>
                  </div>

                  <p className="text-secondary text-sm mb-4 flex-1">{urun.aciklama}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <SureCipi urun={urun} />
                    {sahipMi && kalan && (
                      <Yuzey
                        tur="mihenk"
                        className="text-xs font-mono text-brand bg-brand/10 px-2 py-1 rounded border border-brand/30"
                      >
                        {kalan}
                      </Yuzey>
                    )}
                  </div>

                  {/*
                    İlerleme satırı. ODAKLANABİLİR DEĞİL — düz metin, sekme
                    durağı açmıyor: mağaza ızgarasının sekme bütçesi kart
                    başına iki düğmeyle zaten dolu. Ekran okuyucu satırı
                    kartın akışı içinde okur.
                  */}
                  {ilerleme && (
                    <p className="text-xs text-secondary mb-4 font-mono">
                      {ilerleme.koleksiyon.ad} · {ilerleme.toplam} üründen{' '}
                      {sayiIyelik(ilerleme.sahipSayisi)} alındı
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-line">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOnizleme(urun)}
                        className="flex-1 py-2 bg-page hover:bg-card border border-line-strong text-primary text-sm font-bold rounded-lg transition-colors"
                      >
                        Dene
                      </button>

                      {ilerleme ? (
                        /*
                          Kilitli ürünün düğmesi DEVRE DIŞI, aria-disabled
                          değil: devre dışı düğmeler Tab sırasından düşer.
                          Basılacak bir şey olmayan iki durakla (her kilitli
                          kartta bir tane) odak bütçesini harcamanın anlamı
                          yok. Ürünün nasıl açılacağını üstteki ilerleme
                          satırı zaten söylüyor.
                        */
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-2 text-sm font-bold rounded-lg border border-line bg-page text-secondary cursor-not-allowed"
                        >
                          {odulAcildi ? 'Açıldı' : 'Kilitli'}
                        </button>
                      ) : sahipMi ? (
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
                        /*
                          Satın alma MİHENK'in eylemi — pirinç. "Dene" nötr
                          kalır: o bir önizleme, jeton harcamıyor. Ev sahibi
                          mavisi bir "Al" düğmesi, hemen üstündeki pirinç
                          fiyatla çelişiyordu.
                        */
                        <Yuzey tur="mihenk" className="flex-1 flex">
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
                        </Yuzey>
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
      </KatmanEkran>

      {onizleme && (
        <UrunOnizleme
          urun={onizleme}
          onKapat={() => setOnizleme(null)}
          onSatinAl={() => handleSatinAl(onizleme)}
        />
      )}
    </>
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

  /*
    Sahip olunan ürün pencereden tekrar satın alınamaz. Mağaza kartı bunu
    zaten "Açık/Kapalı" düğmesiyle engelliyordu ama önizleme penceresinin
    Al düğmesi yalnızca bakiyeye bakıyordu; sahip olunan bir ürün ikinci
    kez ücretlendirilebiliyordu.
  */
  const sahip = state.kullanici.envanter.find((e) => e.urunId === urun.id)
  const sahipMi = Boolean(sahip) && !suresiDoldu(urun, sahip!)

  /*
    Kilitli ürün pencereden de satın alınamaz. Kart düğmesi zaten devre
    dışı ama "Dene" penceresi açık kalıyor; oradaki Al düğmesi yalnızca
    bakiyeye baktığı için 0 jetonluk ödülü hep "alınabilir" gösterirdi ve
    basınca `urunSatinAl` false dönüp "0 jeton daha gerekiyor" diyen yanlış
    bir uyarı çıkardı.
  */
  const ilerleme = odulIlerlemesi(state, urun)

  const cerceveSinifi = efekt.tur === 'cerceve' ? (CERCEVE_SINIFLARI[efekt.deger] ?? '') : ''
  const adSinifi = efekt.tur === 'adRengi' ? (AD_RENGI_SINIFLARI[efekt.deger] ?? '') : ''
  const rozetGorunum = efekt.tur === 'rozet' ? ROZET_SIMGELERI[efekt.deger] : undefined
  const temaSinifi = efekt.tur === 'tema' ? (TEMA_SINIFLARI[efekt.deger] ?? '') : ''

  return (
    <Modal
      onClose={onKapat}
      labelledBy="onizleme-baslik"
      describedBy="onizleme-aciklama"
      className="max-w-md"
    >
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
        <p id="onizleme-aciklama" className="text-secondary text-sm mt-2">
          {/*
            İşlevsel ürünler profilde görünmez; onlar için "nasıl görüneceğini
            gösterir" demek yanlış bilgi olur.
          */}
          {efekt.tur === 'islev'
            ? 'Bu bir önizlemedir; satın alındığında hangi işlevi kazanacağını gösterir.'
            : efekt.tur === 'kenarlik'
              ? 'Bu bir önizlemedir; kenarlık gönderi kartlarınızın sol kenarında görünür.'
              : efekt.tur === 'sohbetZemini' || efekt.tur === 'cikartma'
                ? 'Bu bir önizlemedir; sohbet ekranında nasıl görüneceğini gösterir.'
                : 'Bu bir önizlemedir; satın alma yapılmadan profilinizde nasıl görüneceğini gösterir.'}
        </p>
      </div>

      <div className={`p-8 flex flex-col items-center justify-center bg-page ${temaSinifi}`}>
        <KimlikOnizleme
          cerceveSinifi={cerceveSinifi}
          adSinifi={adSinifi}
          rozetGorunum={rozetGorunum}
        />

        {efekt.tur === 'islev' && (
          <p className="mt-6 p-4 border border-brand/25 bg-brand/5 rounded-xl text-center text-primary text-sm font-medium">
            Sistem işlevi: {urun.aciklama}
          </p>
        )}

        {efekt.tur === 'tema' && (
          <p className="mt-6 text-secondary text-sm text-center">
            Profil kapağına {urun.ad.toLowerCase()} dokusu uygulanır.
          </p>
        )}

        {efekt.tur === 'sohbetZemini' && (
          /* Sohbet ekranının minyatürü: zemin + iki baloncuk */
          <div
            className={`mt-6 w-full rounded-xl border border-line p-3 flex flex-col gap-2 ${
              SOHBET_ZEMINI_SINIFLARI[efekt.deger] ?? ''
            }`}
            aria-hidden="true"
          >
            <span className="self-start rounded-2xl rounded-bl-md bg-card border border-line px-3 py-1.5 text-sm text-primary">
              Selam!
            </span>
            <span className="self-end rounded-2xl rounded-br-md bg-brand text-brand-ink px-3 py-1.5 text-sm">
              Zemini beğendin mi?
            </span>
          </div>
        )}

        {efekt.tur === 'cikartma' && (
          /* Paketin altı kristali, paketin renginde */
          <div
            className="mt-6 grid grid-cols-6 gap-2 w-full"
            role="img"
            aria-label={`${urun.ad}: altı çıkartma`}
            style={{ color: `var(--kozmetik-${efekt.deger})` }}
          >
            {CIKARTMA_YOLLARI.map((yol, i) => (
              <svg key={i} viewBox="0 0 24 24" className="w-full aspect-square" fill="currentColor" aria-hidden="true">
                <path d={yol} />
              </svg>
            ))}
          </div>
        )}

        {efekt.tur === 'kenarlik' && (
          <div
            className={`mt-6 w-full rounded-xl bg-card border border-line p-4 ${
              KENARLIK_SINIFLARI[efekt.deger] ?? ''
            }`}
          >
            <p className="text-secondary text-sm">
              Gönderi kartlarının sol kenarında böyle görünür.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-line">
        {/*
          Bakiye yeterliyse satin almanin bakiyeye etkisi, degilse eksik
          miktar gosterilir. Ikisi ayni satiri paylasir.
        */}
        {sahipMi ? (
          <p id="onizleme-sahip" className="mb-3 text-sm text-success text-center">
            Bu ürün envanterinde. Açıp kapatmayı cüzdan ekranından yapabilirsin.
          </p>
        ) : ilerleme ? (
          <p id="onizleme-kilitli" className="mb-3 text-sm text-secondary text-center">
            Bu ürün satın alınamaz. {ilerleme.koleksiyon.ad} · {ilerleme.toplam} üründen{' '}
            {sayiIyelik(ilerleme.sahipSayisi)} alındı; seti tamamlayınca kendiliğinden
            envanterine eklenir.
          </p>
        ) : bakiyeYetersiz ? (
          <p id="onizleme-eksik" className="mb-3 text-sm text-secondary text-center">
            {urun.fiyat - state.kullanici.jetonBakiyesi} jeton daha gerekiyor.
          </p>
        ) : (
          <p className="mb-3 text-sm text-secondary text-center">
            Bakiye:{' '}
            <span className="font-mono text-primary">{state.kullanici.jetonBakiyesi}</span>
            <span aria-hidden="true"> → </span>
            <span className="sr-only"> şu değere düşecek: </span>
            <span className="font-mono text-brand font-bold">
              {state.kullanici.jetonBakiyesi - urun.fiyat}
            </span>
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
            disabled={bakiyeYetersiz || sahipMi || Boolean(ilerleme)}
            aria-disabled={bakiyeYetersiz || sahipMi || Boolean(ilerleme) || undefined}
            aria-describedby={
              sahipMi
                ? 'onizleme-sahip'
                : ilerleme
                  ? 'onizleme-kilitli'
                  : bakiyeYetersiz
                    ? 'onizleme-eksik'
                    : undefined
            }
            className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
              bakiyeYetersiz || sahipMi || ilerleme
                ? 'bg-page border border-line text-secondary cursor-not-allowed'
                : 'bg-brand hover:bg-brand/90 text-brand-ink'
            }`}
          >
            {sahipMi ? (
              'Sahipsin'
            ) : ilerleme ? (
              'Kilitli'
            ) : bakiyeYetersiz ? (
              'Yetersiz bakiye'
            ) : (
              <span className="inline-flex items-center gap-2">
                Al <Jeton deger={urun.fiyat} />
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
