"use client"

import { ArrowLeft } from "lucide-react"
import { useKatman } from "@/lib/a11y/katman"

/**
 * Tam ekran katmanların ortak kabuğu — Cüzdan, Mağaza, Profil, Bildirimler.
 *
 * NEDEN VAR: Cüzdan ve Mağaza birer tam ekran devralmaydı. Kendi genişlikleri
 * (max-w-2xl / max-w-4xl), kendi başlıkları, alt gezinti yok, üst çubuk yok ve
 * on bir renk jetonunun tamamı pirinç. Sonuç, aynı uygulamanın bir bölümü değil
 * ayrı bir uygulama gibi okunuyordu.
 *
 * Kabuk ev sahibi (NSosyal) kromasını taşır — `yuzey-mihenk` YOK. Kural şu:
 *
 *   Sayfa kroması ev sahibinin; MİHENK'in ÜRETTİĞİ DEĞER pirinç.
 *
 * Yani başlık, geri düğmesi, zeminler ve liste kartları nötr; jeton sayısı,
 * günlük üst sınır çubuğu, kazanç tutarları ve kozmetik önizlemeleri pirinç.
 * Pirinç bu yüzden ekranı değil, tek tek KARTLARI sarar (`<Yuzey tur="mihenk">`).
 *
 * Genişlik akışla aynı (`max-w-lg`), başlık üst çubukla aynı yükseklikte (h-14).
 * Alt dolgu alt gezintiyi ve güvenli alanı hesaba katar: gezinti artık
 * katmanların ÜSTÜNDE duruyor ve tıklanabilir kalıyor (bkz. AltGezinti z-[45]),
 * böylece Cüzdan'dan Mağaza'ya geçmek için akışa dönmek gerekmiyor.
 *
 * Geri düğmesi DOM'da ilk odaklanabilir öğe olmalı: `useKatman` açılışta ilk
 * eşleşeni odaklıyor (`katman.ts:31`).
 */
export function KatmanEkran({
  baslik,
  onBack,
  sagEylem,
  serit,
  children,
}: {
  baslik: string
  onBack: () => void
  /** Başlığın sağındaki eylem — bakiye hapı, sıfırlama düğmesi… */
  sagEylem?: React.ReactNode
  /**
   * Başlıkla kaydırılan gövde arasında, kenardan kenara duran şerit —
   * mağazanın kategori sekmeleri gibi. Gövdenin yan dolgusuna girmez ve
   * kaydırma alanının dışında kalır, yani yukarıda sabit durur.
   */
  serit?: React.ReactNode
  children: React.ReactNode
}) {
  const katmanRef = useKatman<HTMLDivElement>(onBack)

  return (
    <div
      ref={katmanRef}
      className="fixed inset-0 z-40 bg-page flex flex-col mihenk-sagdan"
    >
      <header className="shrink-0 bg-card border-b border-line">
        <div className="mx-auto w-full max-w-lg px-2 h-14 flex items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-page text-primary transition-colors"
            aria-label="Akışa geri dön"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <h2 className="font-bold text-lg text-primary tracking-tight truncate flex-1 min-w-0">
            {baslik}
          </h2>
          {sagEylem}
        </div>
      </header>

      {serit}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
