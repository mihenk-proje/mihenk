"use client"

import { useMemo, useRef, useState } from "react"
import { BarChart2, Bot, FileText, Image as ImageIcon, Plus, X } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import { CERCEVE_SINIFLARI, aktifEfekt, islevAcikMi } from "@/lib/store/efektler"
import { olcMetinNiteligi } from "@/lib/verification"
import { taslakSiniri } from "@/lib/store/depo"
import type { DogrulamaSonucu, Gonderi } from "@/lib/store/types"
import { Avatar } from "./Avatar"

const VARSAYILAN_KARAKTER = 500
const GENIS_KARAKTER = 1000
const VARSAYILAN_SECENEK = 4
const GENIS_SECENEK = 6
/** Görsel data: URL olarak localStorage'a yazıldığı için boyut sınırlı tutulur */
const EN_BUYUK_GORSEL_BYTE = 2 * 1024 * 1024

export function GonderiOlustur({
  onDogrulamaSonucu,
  onPaylasildi,
  idOneki = 'gonderi',
}: {
  onDogrulamaSonucu: (sonuc: DogrulamaSonucu) => void
  /** Paylaşım başarıyla yapıldığında — tam ekran katman kendini kapatmak için kullanır */
  onPaylasildi?: () => void
  /**
   * Aynı bileşen iki yerde birden kuruluyor: akışın içinde gömülü ve yüzen
   * düğmeyle açılan tam ekran katmanda. İkisi aynı id'yi taşısaydı
   * `label[for]` çözümlemesi bozulur ve klavye denetimi metin alanını
   * bulamazdı — inert öğeler DOM'da kalıyor, çakışma gerçek.
   */
  idOneki?: string
}) {
  const { state, gonderiEkle, dogrulamaTetikle, taslakKaydet, taslakSil } = useStore()
  const [metin, setMetin] = useState("")
  const [yzBeyani, setYzBeyani] = useState(false)
  const [gorsel, setGorsel] = useState<string | null>(null)
  const [anket, setAnket] = useState<string[] | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  const dosyaRef = useRef<HTMLInputElement>(null)

  const maxKarakter = islevAcikMi(state, 'uzun_gonderi') ? GENIS_KARAKTER : VARSAYILAN_KARAKTER
  const maxSecenek = islevAcikMi(state, 'gelismis_anket') ? GENIS_SECENEK : VARSAYILAN_SECENEK
  const cerceve = aktifEfekt(state, 'cerceve')

  /*
    Ayar Taşı (u18) — işlevsel ayrıcalık: paylaşmadan önce metnin nitelik
    tahminini gösterir.

    `olcMetinNiteligi` SAF bir skorlayıcı — `dogrula` DEĞİL. Yani özgünlük ya
    da kopya hakkında hiçbir iddiada bulunmuyor ve paylaşım sonrası çalışan
    asenkron doğrulamayı öne almıyor. Yayınlama ile doğrulamanın ayrıklığı
    (rapor Şekil 3) korunuyor.

    "TAHMİN" demesi şart: görselli gönderide gerçek skor metin ve görsel
    kademelerinin 0,55/0,45 ağırlıklı ortalaması. Sonuçla çelişen kesin bir
    sayı, hiç sayı olmamasından kötü olurdu.
  */
  /*
    Taslaklar: yazılanı saklayıp sonra geri yükleme. Sınır varsayılan 1,
    Geniş Taslak (u35) ile 5. Taslak listesi yalnızca taslak varken görünür —
    boş bir "Taslaklar (0)" satırı gürültü olurdu.
  */
  const taslaklar = state.taslaklar ?? []
  const sinir = taslakSiniri(state)
  const [taslakBildirimi, setTaslakBildirimi] = useState<string | null>(null)

  const onOlcumAcik = islevAcikMi(state, 'on_olcum')
  const tahmin = useMemo(
    () => (onOlcumAcik && metin.trim().length > 0 ? olcMetinNiteligi(metin) : null),
    [onOlcumAcik, metin]
  )
  const tahminBandi =
    tahmin === null
      ? null
      : tahmin.skor >= 60
        ? 'jeton kazanır'
        : tahmin.skor >= 40
          ? 'kısmi kazanır'
          : 'jeton kazanmaz'

  /*
    Karakter sayaci her tus vurusunda duyurulursa ekran okuyucu bogulur.
    Duyuru metni esik bandina baglanir: bant degismedikce metin ayni kalir
    ve tekrar okunmaz. Yalnizca %80'e ve sinira ulasildiginda degisir.
  */
  const doluluk = maxKarakter > 0 ? metin.length / maxKarakter : 0
  const sayacDuyurusu =
    metin.length >= maxKarakter
      ? `Karakter sınırına ulaşıldı. En fazla ${maxKarakter} karakter yazabilirsiniz.`
      : doluluk >= 0.8
        ? `Karakter sınırının yüzde 80'ine ulaşıldı.`
        : ''

  const doluSecenekler = (anket ?? []).filter((s) => s.trim().length > 0)
  const anketGecerli = anket === null || doluSecenekler.length >= 2
  const paylasilabilir = metin.trim().length > 0 && anketGecerli

  const gorselSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0]
    e.target.value = '' // aynı dosya tekrar seçilebilsin
    if (!dosya) return

    if (!dosya.type.startsWith('image/')) {
      setHata('Yalnızca görsel dosyaları eklenebilir.')
      return
    }
    if (dosya.size > EN_BUYUK_GORSEL_BYTE) {
      setHata('Görsel 2 MB sınırını aşıyor.')
      return
    }

    const okuyucu = new FileReader()
    okuyucu.onload = () => {
      setGorsel(typeof okuyucu.result === 'string' ? okuyucu.result : null)
      setAnket(null) // Bir gönderi ya görsel ya anket taşır
      setHata(null)
    }
    okuyucu.onerror = () => setHata('Görsel okunamadı.')
    okuyucu.readAsDataURL(dosya)
  }

  const anketBaslat = () => {
    setAnket(['', ''])
    setGorsel(null)
    setHata(null)
  }

  const handlePaylas = () => {
    if (!paylasilabilir) return

    const tur: Gonderi['tur'] = gorsel ? 'metinGorsel' : anket ? 'anket' : 'metin'

    const yeniGonderi: Gonderi = {
      id: `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      yazarId: state.kullanici.id,
      tur,
      metin: metin.trim(),
      gorselUrl: gorsel,
      anketSecenekleri: anket ? doluSecenekler.map((s) => s.trim()) : null,
      olusturmaZamani: new Date().toISOString(),
      yzBeyani,
      yorumSayisi: 0,
      yenidenPaylasimSayisi: 0,
      roketSayisi: 0,
      izlenimSayisi: 0,
      dogrulamaDurumu: 'bekliyor',
      dogrulamaSkoru: null,
      kazanilanJeton: 0,
      gerekce: [],
      metinParcalari: null,
      gorselHash: null,
      itirazDurumu: 'yok',
    }

    gonderiEkle(yeniGonderi)
    setMetin("")
    setYzBeyani(false)
    setGorsel(null)
    setAnket(null)
    setHata(null)

    dogrulamaTetikle(yeniGonderi.id, onDogrulamaSonucu)
    onPaylasildi?.()
  }

  return (
    <div className="border-b border-line px-4 py-3 bg-card">
      <div className="flex gap-3">
        {/*
          Kuşanılmış çerçeve burada da görünür. Kozmetikler bugüne kadar TEK
          bir yüzeyde görünüyordu: akıştaki kendi gönderi başlıkların. 800
          jetonluk bir çerçeve alan kullanıcı, onu görmek için akışı kendi
          gönderisine kadar kaydırmak zorundaydı.
        */}
        <Avatar
          id={state.kullanici.id}
          harfler={state.kullanici.avatarHarfleri}
          ad={state.kullanici.adSoyad}
          ton={state.kullanici.avatarTonu}
          cerceveSinifi={cerceve ? (CERCEVE_SINIFLARI[cerceve.efekt.deger] ?? '') : ''}
        />

        <div className="flex-1 min-w-0">
          {taslaklar.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-secondary">Taslaklar {taslaklar.length}/{sinir}:</span>
              {taslaklar.map((t) => (
                <span key={t.id} className="inline-flex items-center rounded-full border border-line bg-page">
                  <button
                    type="button"
                    onClick={() => {
                      setMetin(t.metin.slice(0, maxKarakter))
                      taslakSil(t.id)
                    }}
                    className="pl-2.5 pr-1 py-1 text-[11px] text-primary max-w-[9rem] truncate hover:underline"
                    title={t.metin}
                  >
                    {t.metin}
                  </button>
                  <button
                    type="button"
                    onClick={() => taslakSil(t.id)}
                    aria-label="Taslağı sil"
                    className="p-1 mr-0.5 rounded-full text-secondary hover:text-error"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <span aria-live="polite" className="sr-only">
            {taslakBildirimi}
          </span>
          <label htmlFor={`${idOneki}-metni`} className="sr-only">
            Gönderi metni
          </label>
          <textarea
            id={`${idOneki}-metni`}
            value={metin}
            onChange={(e) => setMetin(e.target.value.slice(0, maxKarakter))}
            placeholder="Aklında ne var?"
            className="w-full bg-transparent text-primary text-lg resize-none outline-none min-h-[52px] placeholder:text-secondary mt-1"
          />

          {gorsel && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-line max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gorsel} alt="Eklenen görselin önizlemesi" className="w-full object-cover" />
              <button
                type="button"
                onClick={() => setGorsel(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-page/85 text-primary hover:bg-page transition-colors"
                aria-label="Görseli kaldır"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {anket && (
            <div className="mb-3 flex flex-col gap-2 p-3 rounded-xl border border-line">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Anket seçenekleri</span>
                <button
                  type="button"
                  onClick={() => setAnket(null)}
                  className="text-xs text-secondary hover:text-error transition-colors"
                >
                  Anketi kaldır
                </button>
              </div>

              {anket.map((secenek, idx) => (
                <div key={`secenek-${idx}`} className="flex items-center gap-2">
                  <label htmlFor={`${idOneki}-anket-secenek-${idx}`} className="sr-only">
                    {idx + 1}. seçenek
                  </label>
                  <input
                    id={`${idOneki}-anket-secenek-${idx}`}
                    value={secenek}
                    onChange={(e) =>
                      setAnket(anket.map((s, i) => (i === idx ? e.target.value.slice(0, 60) : s)))
                    }
                    placeholder={`${idx + 1}. seçenek`}
                    className="flex-1 bg-page border border-line rounded-lg px-3 py-2 text-base text-primary placeholder:text-secondary/60 outline-none focus:border-brand/60"
                  />
                  {anket.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setAnket(anket.filter((_, i) => i !== idx))}
                      className="p-1.5 text-secondary hover:text-error transition-colors"
                      aria-label={`${idx + 1}. seçeneği sil`}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}

              {anket.length < maxSecenek && (
                <button
                  type="button"
                  onClick={() => setAnket([...anket, ''])}
                  className="self-start flex items-center gap-1 text-sm text-brand hover:underline"
                >
                  <Plus size={14} aria-hidden="true" /> Seçenek ekle
                </button>
              )}

              <p className="text-xs text-secondary">
                En az 2 seçenek gerekli · en fazla {maxSecenek}
                {maxSecenek === VARSAYILAN_SECENEK && ' (Geniş Anket ürünüyle 6 olur)'}
              </p>
            </div>
          )}

          {hata && (
            <p className="text-sm text-error mb-3" role="alert">
              {hata}
            </p>
          )}

          {/*
          Ayar Taşı tahmini kendi satırında: araç çubuğunun içine sıkıştırınca
          dar ekranda sarıyordu. Odaklanabilir değil ve aria-live taşımıyor —
          her tuş vuruşunda değişen bir canlı bölge ekran okuyucuyu boğar.
        */}
        {tahmin && (
          <p className="border-t border-line pt-2 mt-2 text-xs text-secondary">
            metin kademesi tahmini:{' '}
            <span
              className={`font-mono font-bold ${
                tahmin.skor >= 60
                  ? 'text-success'
                  : tahmin.skor >= 40
                    ? 'text-brand'
                    : 'text-error'
              }`}
            >
              ~{Math.round(tahmin.skor)}
            </span>
            <span aria-hidden="true"> · </span>
            {tahminBandi}
          </p>
        )}

        <div
          className={`${tahmin ? 'pt-3' : 'border-t border-line pt-3 mt-2'} flex items-center justify-between gap-3 flex-wrap`}
        >
            <div className="flex items-center gap-1 text-interaction">
            <button
              type="button"
              onClick={() => {
                if (taslakKaydet(metin)) {
                  setMetin('')
                  setTaslakBildirimi(`Taslak kaydedildi (${Math.min(taslaklar.length + 1, sinir)}/${sinir})`)
                  window.setTimeout(() => setTaslakBildirimi(null), 3000)
                }
              }}
              disabled={metin.trim().length === 0}
              title="Taslağa kaydet"
              aria-label="Taslağa kaydet"
              className="p-2 hover:bg-interaction/10 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileText size={20} aria-hidden="true" />
            </button>
              <input
                ref={dosyaRef}
                type="file"
                accept="image/*"
                onChange={gorselSec}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => dosyaRef.current?.click()}
                disabled={anket !== null}
                className="p-2 hover:bg-interaction/10 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Görsel ekle"
                aria-label="Görsel ekle"
              >
                <ImageIcon size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={anketBaslat}
                disabled={gorsel !== null || anket !== null}
                className="p-2 hover:bg-interaction/10 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Anket ekle"
                aria-label="Anket ekle"
              >
                <BarChart2 size={20} aria-hidden="true" />
              </button>

              <label
                className="flex items-center gap-2 cursor-pointer ml-2 p-1.5 px-3 rounded-full hover:bg-card transition-colors border border-line"
                title="Yapay zekâ desteği aldıysanız beyan edin. Bu beyan kazandığınız jetonu düşürmez."
              >
                <input
                  type="checkbox"
                  checked={yzBeyani}
                  onChange={(e) => setYzBeyani(e.target.checked)}
                  className="w-4 h-4 accent-[#c89544] rounded"
                />
                <span className="text-sm text-secondary flex items-center gap-1">
                  <Bot size={16} aria-hidden="true" /> YZ desteği aldım
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <KarakterHalkasi uzunluk={metin.length} sinir={maxKarakter} />
              <span aria-live="polite" className="sr-only">
                {sayacDuyurusu}
              </span>
              <button
                type="button"
                onClick={handlePaylas}
                disabled={!paylasilabilir}
                className="bg-brand hover:bg-brand/90 text-brand-ink font-bold py-1.5 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Karakter sayacı — halka biçiminde.
 *
 * NSosyal'ın yazma ekranı sayıyı halka olarak gösteriyor. Halkanın kendisi
 * aria-hidden ve dekoratif: bilgiyi taşıyan şey içindeki sayı ve bileşenin
 * dışındaki aria-live duyurusu. Böylece WCAG 1.4.11'in grafik nesneler için
 * istediği 3:1 yükümlülüğü doğmuyor — halka tek başına hiçbir şey anlatmıyor.
 *
 * Sayı yalnızca metin yazılmışken görünür; boşken referanstaki gibi boş bir
 * daire kalır.
 */
function KarakterHalkasi({ uzunluk, sinir }: { uzunluk: number; sinir: number }) {
  const doluluk = Math.min(1, uzunluk / sinir)
  const R = 13
  const CEVRE = 2 * Math.PI * R
  const doldu = uzunluk >= sinir
  const yaklasti = doluluk >= 0.8

  return (
    <span className="relative inline-flex items-center justify-center w-9 h-9 shrink-0">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="-rotate-90">
        <circle cx="16" cy="16" r={R} fill="none" strokeWidth="2.5" className="stroke-line" />
        <circle
          cx="16"
          cy="16"
          r={R}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CEVRE}
          strokeDashoffset={CEVRE * (1 - doluluk)}
          className={doldu ? 'stroke-error' : yaklasti ? 'stroke-brand' : 'stroke-interaction'}
        />
      </svg>
      {uzunluk > 0 && (
        <span
          className={`absolute font-mono leading-none ${
            doldu ? 'text-error font-bold text-[9px]' : 'text-secondary text-[9px]'
          }`}
        >
          {sinir - uzunluk}
        </span>
      )}
    </span>
  )
}
