"use client"

import { useId } from "react"

/**
 * NSosyal kimlik işareti.
 *
 * Ev sahibi platformun logosu satır içi SVG olarak çizilir; varlık dosyası
 * kopyalanmaz. Gradyan MİHENK yüzeyinde hiç kullanılmadığı için iki yüzey
 * gri tonlamada değerlendirilse bile doku farkıyla ayrışır.
 *
 * Gradyan kimliği her örnekte benzersiz olmalı: aynı sayfada iki logo varsa
 * (başlık + çekmece) tek bir id ikisini de aynı tanıma bağlar ve biri
 * kaldırıldığında diğeri renksiz kalır. useId sunucu ve istemcide aynı değeri
 * ürettiği için modül düzeyinde sayaç kullanmak yerine o tercih edildi;
 * sayaç sunucuda ve istemcide farklı sayıda artar ve hidrasyon uyuşmazlığı
 * doğurur.
 */
export function NSimgesi({
  boyut = 28,
  beta = true,
  className = '',
}: {
  boyut?: number
  beta?: boolean
  className?: string
}) {
  const id = `nsosyal-gradyan-${useId()}`

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <svg
        width={boyut}
        height={boyut}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--nsosyal-gradyan-bas)" />
            <stop offset="100%" stopColor="var(--nsosyal-gradyan-son)" />
          </linearGradient>
        </defs>
        {/* N harfi */}
        <path
          d="M20 80 V20 H34 L66 62 V20 H80 V80 H66 L34 38 V80 Z"
          fill={`url(#${id})`}
        />
      </svg>
      {beta && (
        <span
          className="text-[7px] font-semibold tracking-[0.2em] text-secondary mt-0.5"
          aria-hidden="true"
        >
          BETA
        </span>
      )}
    </span>
  )
}
