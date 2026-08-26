/**
 * MİHENK monogramı — favicon ve bağlantı önizlemesiyle aynı işaret.
 *
 * Giriş ekranında ayrı bir simge kullanılıyordu; sekmedeki M monogramıyla
 * iki farklı kimlik oluşuyordu. Aynı işaret satır içi SVG olarak çizilir:
 * tema rengini devralır ve her ölçekte keskin kalır.
 *
 * Alttaki çizgi mihenk taşındaki ayar çizgisidir; M harfinin tabanını
 * kapatır ve "ölçüldü" çağrışımını taşır.
 */
export function MihenkSimgesi({
  className = '',
  boyut = 32,
}: {
  className?: string
  boyut?: number
}) {
  return (
    <svg
      width={boyut}
      height={boyut}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* M harfi */}
      <path d="M22 72 V22 L50 58 L78 22 V72" />
      {/* Ayar çizgisi */}
      <path d="M24 87 H76" strokeWidth={8} opacity={0.9} />
    </svg>
  )
}
