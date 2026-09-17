"use client"

import { Home, MessageCircle, ShoppingBag, User, Wallet } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import { MihenkSimgesi } from "./MihenkSimgesi"
import type { Gorunum } from "@/lib/store/types"

/**
 * NSosyal alt gezinti çubuğu.
 *
 * Ev sahibi platformun ana gezinti kalıbı budur; MİHENK'in kendi ekranları
 * (Cüzdan, Mağaza) buraya birer sekme olarak oturur. İki yüzey iddiası ilk
 * kez burada görünür hale gelir: nötr gri bir çubuk, ortasında pirinç renkli
 * ve MİHENK monogramı taşıyan iki sekme.
 *
 * Erişilebilir adlar `Cüzdanı aç` ve `Mağazayı aç` dizgilerini korur; tarayıcı
 * denetimleri (test/tarayici/) bu adlara bağlıdır. Görünür metin erişilebilir
 * adın içinde birebir geçer (WCAG 2.5.3): "Cüzdan" → "…cüzdanı aç".
 *
 * tabIndex={-1}: sayfanın başındaki atlama bağlantısının hedefi burası ve
 * <nav> kendiliğinden odak alamaz. Sekme sırasına girmez, yalnızca
 * programatik odak kabul eder.
 *
 * Beş sekmenin beşi de gerçek bir ekrana gidiyor.
 */
export function AltGezinti({
  gorunum,
  onAkis,
  onCuzdan,
  onMagaza,
  onProfil,
  onMesajlar,
}: {
  gorunum: Gorunum
  onAkis: () => void
  onCuzdan: () => void
  onMagaza: () => void
  onProfil: () => void
  onMesajlar: () => void
}) {
  const { state } = useStore()
  const bakiye = state.kullanici.jetonBakiyesi

  const temel =
    'flex-1 flex flex-col items-center justify-center gap-0.5 h-full min-w-0 transition-colors'

  return (
    <nav
      id="alt-gezinti"
      tabIndex={-1}
      aria-label="Ana gezinti"
      className="fixed bottom-0 left-0 right-0 z-[45] bg-card border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto w-full max-w-lg h-14 flex items-stretch">
        <button
          type="button"
          onClick={onAkis}
          aria-current={gorunum === 'akis' ? 'page' : undefined}
          className={`${temel} ${gorunum === 'akis' ? 'text-brand' : 'text-secondary'}`}
        >
          <Home size={22} aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Akış</span>
        </button>

        {/*
          Keşfet'in yerini aldı. Keşfet kapsam notundan ibaretti; referans
          uygulamada da mesajlar alt gezintide duruyor.
        */}
        <button
          type="button"
          onClick={onMesajlar}
          aria-current={gorunum === 'mesajlar' ? 'page' : undefined}
          className={`${temel} ${gorunum === 'mesajlar' ? 'text-brand' : 'text-secondary'}`}
        >
          <MessageCircle size={22} aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Mesajlar</span>
        </button>

        {/*
          MİHENK sekmeleri. yuzey-mihenk sarmalayıcısı --mihenk-* değişkenlerini
          ezdiği için text-brand burada pirinç, komşu sekmelerde ev sahibi
          mavisidir. Ölçülen kontrast: koyu 6,14 · açık 5,51.
        */}
        <div className="yuzey-mihenk flex-[2] flex items-stretch min-w-0" data-yuzey="mihenk">
          <button
            type="button"
            data-tanitim="cuzdan"
            onClick={onCuzdan}
            aria-current={gorunum === 'cuzdan' ? 'page' : undefined}
            aria-label={`Cüzdan ${bakiye} jeton, cüzdanı aç`}
            className={`${temel} ${gorunum === 'cuzdan' ? 'text-brand' : 'text-secondary'}`}
          >
            <span className="relative">
              <Wallet size={22} aria-hidden="true" />
              <MihenkSimgesi
                boyut={10}
                className="absolute -top-1 -right-1.5 text-brand"
              />
            </span>
            <span className="text-[10px] font-medium leading-none flex items-center gap-1">
              <span>Cüzdan</span>
              <span className="font-mono text-brand">{bakiye}</span>
            </span>
          </button>

          <button
            type="button"
            data-tanitim="magaza"
            onClick={onMagaza}
            aria-current={gorunum === 'magaza' ? 'page' : undefined}
            aria-label="Mağazayı aç"
            className={`${temel} ${gorunum === 'magaza' ? 'text-brand' : 'text-secondary'}`}
          >
            <span className="relative">
              <ShoppingBag size={22} aria-hidden="true" />
              <MihenkSimgesi
                boyut={10}
                className="absolute -top-1 -right-1.5 text-brand"
              />
            </span>
            <span className="text-[10px] font-medium leading-none">Mağaza</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onProfil}
          aria-current={gorunum === 'profil' ? 'page' : undefined}
          className={`${temel} ${gorunum === 'profil' ? 'text-brand' : 'text-secondary'}`}
        >
          <User size={22} aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Profil</span>
        </button>
      </div>
    </nav>
  )
}
