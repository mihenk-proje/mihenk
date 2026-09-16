/**
 * Akışta kullanılan sayı ve zaman biçimleri.
 *
 * NSosyal kısaltılmış biçimi boşluksuz yazıyor ("3,4B", "1sa"); haplar dar
 * olduğu için boşluk fazladan satır kaydırmasına yol açıyordu.
 */
export function sayiBicimle(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}B`
  return String(n)
}

export function goreliZaman(dateStr: string) {
  const tarih = new Date(dateStr)
  const saniye = Math.floor((Date.now() - tarih.getTime()) / 1000)
  const dakika = Math.floor(saniye / 60)
  const saat = Math.floor(dakika / 60)
  const gun = Math.floor(saat / 24)

  if (gun >= 7) return tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  if (gun > 0) return `${gun}g`
  if (saat > 0) return `${saat}sa`
  if (dakika > 0) return `${dakika}dk`
  return `${Math.max(1, saniye)}sn`
}
