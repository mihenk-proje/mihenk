"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, Check, X } from "lucide-react"

/*
  İlk giriş tanıtım turu.

  İP7 pilot test bulgusuna yanıt: Görev 2 (mağazadan süreli ürün satın alma)
  %85,7 tamamlama oranıyla üç görev içinde en düşüğüydü; diğer ikisi %100.
  Mağaza akışı ölçülmüş bir zayıf noktaydı.

  Tur durumu uygulama durumundan AYRI bir anahtarda tutulur. Seed sürümü
  değiştiğinde uygulama durumu sıfırlanır ama tur yeniden gösterilmez;
  turu tekrar görmek kullanıcının kararıdır, dağıtımın değil.
*/
const ANAHTAR = 'mihenk_tanitim_goruldu'

type Adim = { capa: string | null; baslik: string; metin: string }

const ADIMLAR: Adim[] = [
  {
    capa: 'cuzdan',
    baslik: 'Cüzdan',
    metin: 'Kazandığın jetonlar burada toplanır; günlük üst sınırı ve her kazanımın gerekçesini buradan görürsün.',
  },
  {
    capa: 'magaza',
    baslik: 'Mağaza',
    metin: 'Jetonlarını çerçeve, rozet ve tema gibi kozmetiklere çevirirsin. Satın almadan önce "Dene" ile önizleyebilirsin.',
  },
  {
    capa: 'rozet',
    baslik: 'Doğrulama rozeti',
    metin: 'Her gönderi otomatik denetimden geçer. Rozet sonucu, altındaki gerekçe de nedenini söyler.',
  },
  {
    capa: null,
    baslik: 'Hazırsın',
    metin: 'Akışı aşağı kaydırdığında kopya tespiti, düşük çabalı içerik ve kısmi doğrulama örneklerini sırayla görürsün.',
  },
]

export function tanitimGoruldu(): boolean {
  try {
    return localStorage.getItem(ANAHTAR) === '1'
  } catch {
    return true // Depolama kapalıysa turu zorla göstermeyiz
  }
}

function goruldureIsaretle() {
  try {
    localStorage.setItem(ANAHTAR, '1')
  } catch {
    /* özel sekmede yazılamayabilir; tur yine de kapanır */
  }
}

const ODAKLANABILIR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Tanitim({ onKapat }: { onKapat: () => void }) {
  const [adim, setAdim] = useState(0)
  const [kutu, setKutu] = useState<DOMRect | null>(null)
  const kartRef = useRef<HTMLDivElement>(null)

  const mevcut = ADIMLAR[adim]
  const sonAdim = adim === ADIMLAR.length - 1

  const bitir = useCallback(() => {
    goruldureIsaretle()
    onKapat()
  }, [onKapat])

  /* Vurgulanacak öğenin konumu; kaydırma ve yeniden boyutlandırmada güncellenir. */
  useEffect(() => {
    const olc = () => {
      if (!mevcut.capa) return setKutu(null)
      const hedef = document.querySelector(`[data-tanitim="${mevcut.capa}"]`)
      setKutu(hedef ? hedef.getBoundingClientRect() : null)
    }
    olc()
    window.addEventListener('resize', olc)
    window.addEventListener('scroll', olc, true)
    return () => {
      window.removeEventListener('resize', olc)
      window.removeEventListener('scroll', olc, true)
    }
  }, [mevcut.capa])

  /* Odak tuzağı, Escape ile atlama, kapanışta odağın geri verilmesi. */
  useEffect(() => {
    const oncekiOdak = document.activeElement as HTMLElement | null
    kartRef.current?.querySelector<HTMLElement>(ODAKLANABILIR)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        bitir()
        return
      }
      if (e.key !== 'Tab' || !kartRef.current) return
      const oge = Array.from(kartRef.current.querySelectorAll<HTMLElement>(ODAKLANABILIR))
      if (!oge.length) return
      const ilk = oge[0]
      const son = oge[oge.length - 1]
      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault()
        son.focus()
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault()
        ilk.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      oncekiOdak?.focus?.()
    }
  }, [bitir])

  /* Adım değişince odak karta döner, ekran okuyucu yeni adımı duyurur. */
  useEffect(() => {
    kartRef.current?.querySelector<HTMLElement>(ODAKLANABILIR)?.focus()
  }, [adim])

  const kartKonumu = kutu
    ? {
        top: Math.min(kutu.bottom + 12, window.innerHeight - 210),
        left: Math.max(12, Math.min(kutu.left + kutu.width / 2 - 160, window.innerWidth - 332)),
      }
    : undefined

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Zemin: tıklanınca tur atlanır */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-page/70 backdrop-blur-[2px] cursor-default"
        onClick={bitir}
        aria-label="Tanıtım turunu atla"
        tabIndex={-1}
      />

      {/* Vurgu halkası: hedef öğeye dokunmadan üstüne çizilir */}
      {kutu && (
        <div
          aria-hidden="true"
          className="absolute rounded-xl ring-2 ring-brand pointer-events-none mihenk-vurgu"
          style={{
            top: kutu.top - 6,
            left: kutu.left - 6,
            width: kutu.width + 12,
            height: kutu.height + 12,
          }}
        />
      )}

      <div
        ref={kartRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tanitim-baslik"
        aria-describedby="tanitim-metin"
        className="absolute w-80 bg-card border border-line-strong rounded-2xl shadow-2xl p-5"
        style={
          kartKonumu ?? {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }
        }
      >
        <p className="text-xs font-mono text-secondary mb-2">
          Adım {adim + 1} / {ADIMLAR.length}
        </p>
        <h2 id="tanitim-baslik" className="font-display font-bold text-lg text-primary mb-1">
          {mevcut.baslik}
        </h2>
        <p id="tanitim-metin" className="text-sm text-secondary mb-5">
          {mevcut.metin}
        </p>

        {/* Ekran okuyucu için adım duyurusu */}
        <p aria-live="polite" className="sr-only">
          {`Adım ${adim + 1} / ${ADIMLAR.length}: ${mevcut.baslik}. ${mevcut.metin}`}
        </p>

        <div className="flex items-center justify-between gap-3">
          {/* Atla her adımda görünür, ilk adımda da */}
          <button
            type="button"
            onClick={bitir}
            className="text-sm text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <X size={14} aria-hidden="true" /> Atla
          </button>

          <button
            type="button"
            onClick={() => (sonAdim ? bitir() : setAdim((a) => a + 1))}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-brand-ink font-bold text-sm py-2 px-4 rounded-lg transition-colors"
          >
            {sonAdim ? (
              <>
                <Check size={16} aria-hidden="true" /> Başla
              </>
            ) : (
              <>
                Devam <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
