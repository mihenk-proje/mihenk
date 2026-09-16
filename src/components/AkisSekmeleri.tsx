"use client"

/**
 * Akış sekmeleri.
 *
 * NSosyal'ın akış üstündeki sekme şeridi: seçili sekmenin altında kimlik
 * gradyanından bir çizgi.
 *
 * İlk sekmenin metni birebir "Ana akış" olmak zorunda: klavye denetimi
 * (test/tarayici/klavye.mjs) girişten sonra akışa ulaşıldığını bu dizgiyle
 * doğruluyor. Daha önce aynı işi sticky bir <h1> görüyordu.
 */
const SEKMELER = ['Ana akış', 'Takip ettiklerin'] as const

export function AkisSekmeleri({
  aktif,
  onDegis,
}: {
  aktif: string
  onDegis: (sekme: string) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Akış türü"
      className="flex items-stretch border-b border-line bg-card"
    >
      {SEKMELER.map((sekme) => {
        const secili = sekme === aktif
        return (
          <button
            key={sekme}
            type="button"
            role="tab"
            aria-selected={secili}
            onClick={() => onDegis(sekme)}
            className={`flex-1 h-12 relative font-semibold text-[15px] transition-colors ${
              secili ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            {sekme}
            {secili && (
              <span
                className="nsosyal-gradyan absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
