/**
 * Yüzey sınırı.
 *
 * Rapor iki ayrı yüzey tanımlıyor: nötr ev sahibi (NSosyal) ve kendi
 * kimliğini taşıyan MİHENK ödül yüzeyi. Sınırın nerede olduğu depoda
 * aranabilir olsun diye sarmalayıcı ayrı bir bileşen: `grep -r "Yuzey"`
 * iddianın ekrandaki karşılığını verir.
 *
 * Renk geçişi CSS değişkeni kapsamıyla olur (globals.css → .yuzey-mihenk);
 * alt ağaçtaki hiçbir bileşenin sınıfına dokunulmaz.
 */
export function Yuzey({
  tur,
  className = '',
  children,
  ...kalan
}: {
  tur: 'mihenk' | 'ev'
  className?: string
  children: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'>) {
  return (
    <div
      data-yuzey={tur}
      className={`${tur === 'mihenk' ? 'yuzey-mihenk' : ''} ${className}`.trim()}
      {...kalan}
    >
      {children}
    </div>
  )
}
