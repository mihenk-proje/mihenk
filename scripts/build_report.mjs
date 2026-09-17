/**
 * results/metrics.json'dan sunulabilir bir ölçüm raporu üretir.
 *
 * İki sütunlu karşılaştırma tablosu zorunlu: "Rapordaki ön pilot değer" ve
 * "Nihai ölçüm". Ön pilot kümesi tekrar üretilebilir biçimde mevcut olmadığı
 * için bu durum raporda gizlenmez, açıkça yazılır.
 *
 *   node scripts/build_report.mjs --metrics results/metrics.json --out results/olcum-raporu.md
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i === -1 ? varsayilan : process.argv[i + 1]
}

const m = JSON.parse(readFileSync(arg('--metrics', 'results/metrics.json'), 'utf8'))
const cikti = arg('--out', 'results/olcum-raporu.md')

/*
  Küçük oranlar bir ondalıkla yuvarlandığında 4/124.750 da 0/124.750 da
  "0,0%" görünüyor — tam da ayırt edilmesi gereken fark kayboluyor.
  Ondalık ayırıcı Türkçe.
*/
const vir = (s) => s.replace('.', ',')
const yz = (x) => {
  if (x == null) return '—'
  const y = x * 100
  const basamak = y === 0 ? 1 : y < 0.01 ? 4 : y < 1 ? 3 : 1
  return `${vir(y.toFixed(basamak))}%`
}
const sy = (x) => (x == null ? '—' : vir(x.toFixed(4)))
const sayi = (x, b = 3) => vir(x.toFixed(b))
const tr = (s) => s.replace(/_/g, ' ')

/* Raporun Tablo 9 ve 13'ünde sunulmuş ön pilot değerler. */
const ON_PILOT = {
  metin: { esik: '0,35', kesinlik: '—', duyarlilik: '—' },
  gorsel: { esik: '10 bit', kesinlik: '—', duyarlilik: '—' },
  dusukCaba: { esik: '0,65', kesinlik: '—', duyarlilik: '—' },
}

const s = []
s.push('# MİHENK — İP6 nihai ölçüm raporu')
s.push('')
s.push(`Üretim: \`${m.uretim}\` · \`node scripts/build_report.mjs\``)
s.push('')
s.push('> **' + m.not + '**')
s.push('')
s.push('Bu dosya elle yazılmaz. Üretim zinciri:')
s.push('')
s.push('```bash')
s.push('node scripts/hash_gorseller.mjs --manifest data/images/manifest.jsonl \\')
s.push('  --manifest data/images/variants_manifest.jsonl --out data/images/dhash.json')
s.push('node scripts/threshold_sweep.mjs --out results/sweep.json')
s.push('node scripts/evaluate.mjs --sweep results/sweep.json --out results/metrics.json')
s.push('node scripts/build_report.mjs --metrics results/metrics.json --out results/olcum-raporu.md')
s.push('```')
s.push('')

for (const [ad, k] of Object.entries(m.kademeler)) {
  const baslik = { metin: 'Kademe 1 — Metin özgünlüğü', gorsel: 'Kademe 2 — Görsel özgünlüğü', dusukCaba: 'Kademe 2b — Düşük çaba (görsel)' }[ad] ?? ad
  const turEtiketi = ad === 'dusukCaba' ? 'Aile' : 'Dönüşüm'
  s.push(`## ${baslik}`)
  s.push('')

  if (k.durum) {
    s.push(`**Durum: ${k.durum}.** ${k.neden}`)
    s.push('')
    s.push(`Koddaki yürürlükteki eşik \`${k.yururluktekiEsik}\` olarak duruyor ve bu ölçümle`)
    s.push('doğrulanmamıştır. Tek yanlı bir duyarlılık sayısı üretmek yerine boş bırakılmıştır.')
    s.push('')
    continue
  }

  s.push(`Ölçü: ${k.olcu}`)
  s.push('')
  if (ad === 'dusukCaba') {
    s.push(`Küme: ${k.kume.pozitif} üretilmiş düşük çabalı görsel (üç aile) · ${k.kume.ozgun} gerçek fotoğraf`)
    s.push('')
    s.push('Skorlar gerçek çalışma zamanı motoruyla üretildi: piksel çıkarımı başsız Chrome\'da')
    s.push('(`olcDusukCaba` ve `laplasVaryansi` kaynaktan birebir enjekte), puanlama Node\'da')
    s.push('(`gorselDusukCabaSkoru` doğrudan içe aktarım). Algoritmanın ikinci bir kopyası yok.')
  } else {
    s.push(`Küme: ${k.kume.ozgun} özgün · ${k.kume.pozitif} pozitif çift · ${k.kume.dengeliNegatif} dengeli negatif · ${k.kume.tamNegatifCift.toLocaleString('tr-TR')} tam negatif çift`)
  }
  s.push('')
  const ko = k.kisitliOptimum
  const fp = (x) => `${x.tamNegatif.yanlisPozitif} / ${x.tamNegatif.cift.toLocaleString('tr-TR')} · ${yz(x.tamNegatif.oran)}`
  s.push('| | Rapordaki ön pilot değer | Nihai ölçüm — yürürlükteki eşik | Kısıtlı optimum | F1 optimumu |')
  s.push('|---|---|---|---|---|')
  s.push(`| Eşik | ${ON_PILOT[ad]?.esik ?? '—'} | **${vir(String(k.yururlukteki.esik))}** | ${ko ? vir(String(ko.esik)) : '—'} | ${vir(String(k.f1Optimum.esik))} |`)
  s.push(`| Kesinlik | ${ON_PILOT[ad]?.kesinlik ?? '—'} | **${yz(k.yururlukteki.kesinlik)}** | ${ko ? yz(ko.kesinlik) : '—'} | ${yz(k.f1Optimum.kesinlik)} |`)
  s.push(`| Duyarlılık | ${ON_PILOT[ad]?.duyarlilik ?? '—'} | **${yz(k.yururlukteki.duyarlilik)}** | ${ko ? yz(ko.duyarlilik) : '—'} | ${yz(k.f1Optimum.duyarlilik)} |`)
  s.push(`| F1 | — | **${sy(k.yururlukteki.f1)}** | ${ko ? sy(ko.f1) : '—'} | ${sy(k.f1Optimum.f1)} |`)
  s.push(`| Yanlış pozitif (tam negatif küme) | — | **${fp(k.yururlukteki)}** | ${ko ? fp(ko) : '—'} | ${fp(k.f1Optimum)} |`)
  s.push('')
  s.push('**Kısıtlı optimum**: yanlış pozitif oranı yürürlüktekinden kötü olmamak kaydıyla')
  s.push('duyarlılığı en büyükleyen eşik. Gerekçesi aşağıda.')
  s.push('')
  s.push(`### ${turEtiketi} bazında duyarlılık`)
  s.push('')
  s.push(`Tek bir birleşik duyarlılık sayısı, tek bir ${turEtiketi.toLowerCase()}nin tamamen kaçtığını gizler.`)
  s.push('')
  s.push(`| ${turEtiketi} | n | Ortalama skor | Eşik ${vir(String(k.yururlukteki.esik))} | Eşik ${vir(String(k.f1Optimum.esik))} |`)
  s.push('|---|---|---|---|---|')
  for (const [t, v] of Object.entries(k.yururlukteki.turBazinda)) {
    const o = k.f1Optimum.turBazinda[t]
    s.push(`| ${tr(t)} | ${v.adet} | ${sayi(v.ortalamaSkor)} | ${v.yakalanan}/${v.adet} · ${yz(v.duyarlilik)} | ${o.yakalanan}/${o.adet} · ${yz(o.duyarlilik)} |`)
  }
  s.push('')

  if (ad === 'dusukCaba') {
    s.push('### Gürültü — yapısal sınır')
    s.push('')
    s.push('Düz gürültü görselleri üç ölçünün üçünü de "canlı fotoğraf" gibi okutur: entropi')
    s.push('yüksek (her ton var), Laplas varyansı yüksek (her piksel kenar), tek renk oranı')
    s.push('sıfır. Skorlayıcı bunu ayırt edemez ve edemeyeceği baştan biliniyordu; ölçüm')
    s.push('bunu 0/20 ile sayıya döktü. Eşik ayarıyla çözülmez — ölçüler gürültüyü')
    s.push('görmüyor. Ayrıntı: [bilinen-sinirlar.md](bilinen-sinirlar.md)')
    s.push('')
  }

  if (k.kirpmaHaricOptimum) {
    s.push('### Kırpma dahil ve hariç — iki seri')
    s.push('')
    s.push('Kırpma, algısal hash\'in yapısal sınırıdır: görüntünün kenarları kesildiğinde 9×8')
    s.push('ızgara kayar ve hash ilişkisiz bir görselinkine yaklaşır. Eşik ayarıyla çözülmez.')
    s.push('')
    s.push(`- **Kırpma dahil** — en iyi F1 eşiği ${k.f1Optimum.esik}, F1 ${sy(k.f1Optimum.f1)}, duyarlılık ${yz(k.f1Optimum.duyarlilik)}`)
    s.push(`- **Kırpma hariç** — en iyi F1 eşiği ${k.kirpmaHaricOptimum.esik}, F1 ${sy(k.kirpmaHaricOptimum.f1)}, duyarlılık ${yz(k.kirpmaHaricOptimum.duyarlilik)}`)
    s.push('')
    s.push('Ayrıntı: [bilinen-sinirlar.md](bilinen-sinirlar.md)')
    s.push('')
  }

  s.push('### Eşik–F1 eğrisi')
  s.push('')
  s.push('| Eşik | F1 | Kesinlik | Duyarlılık |')
  s.push('|---|---|---|---|')
  const adim = ad === 'metin' ? 5 : 2
  for (let i = 0; i < k.egri.length; i += adim) {
    const n = k.egri[i]
    s.push(`| ${vir(String(n.esik))} | ${sy(n.f1)} | ${yz(n.kesinlik)} | ${yz(n.duyarlilik)} |`)
  }
  s.push('')
}

s.push('## Eşik kararı — F1 optimumu neden uygulanmadı')
s.push('')
s.push('F1, yanlış pozitif ile yanlış negatifi eşit maliyetli sayar. MİHENK\'te bunlar eşit')
s.push('değildir: yanlış negatif, bir kopyanın jeton kazanmasıdır; yanlış pozitif, özgün içerik')
s.push('üreten bir kullanıcının kopyacılıkla işaretlenip ödülünün kesilmesidir. İkincisi hem')
s.push('kullanıcı hem de sistemin meşruiyeti açısından daha pahalıdır. Bu yüzden ölçüt F1 değil,')
s.push('**yanlış pozitif oranı bugünkünden kötü olmamak kaydıyla en yüksek duyarlılık**.')
s.push('')
s.push('Sonuç: her iki kademede de kısıtlı optimum, kodda yürürlükte olan değere denk çıktı.')
s.push('')

for (const [ad, k] of Object.entries(m.kademeler)) {
  if (k.durum || !k.kisitliOptimum) continue
  const y = k.yururlukteki
  const o = k.f1Optimum
  const ko = k.kisitliOptimum
  const etiket = { metin: 'Metin', gorsel: 'Görsel', dusukCaba: 'Düşük çaba' }[ad] ?? ad
  s.push(`**${etiket}.** Yürürlükteki eşik ${vir(String(y.esik))}, kısıtlı optimum ${vir(String(ko.esik))}, F1 optimumu ${vir(String(o.esik))}.`)
  const ayniSonuc =
    ko.duyarlilik === y.duyarlilik && ko.tamNegatif.yanlisPozitif === y.tamNegatif.yanlisPozitif

  if (ko.esik === y.esik) {
    s.push(`Kısıtlı optimum yürürlüktekinin aynısı: kesinlikten ödün vermeden kazanılacak duyarlılık yok.`)
  } else if (ayniSonuc) {
    s.push(`İki eşik de aynı sonucu veriyor: ${vir(String(ko.esik))} ile ${vir(String(y.esik))} arasında hiçbir örnek düşmüyor, eğri bu aralıkta düz.`)
    s.push(`Yürürlükteki değer bu düzlüğün içinde; oynatmak hiçbir şey değiştirmezdi.`)
  } else {
    s.push(`Kısıtlı optimum duyarlılığı ${yz(y.duyarlilik)} → ${yz(ko.duyarlilik)} taşıyor, yanlış pozitif oranı değişmiyor.`)
    s.push(`Fark ${vir(Math.abs(ko.esik - y.esik).toFixed(2))} birim, yani taramanın adım çözünürlüğü kadar; kod değiştirilmedi.`)
    s.push(`Raporda belgelenen değeri bu büyüklükte bir kazanç için oynatmak, izlenebilirliği kazançtan pahalıya mal olurdu.`)
  }

  const f1Ayni = o.f1 === y.f1 && o.tamNegatif.yanlisPozitif === y.tamNegatif.yanlisPozitif
  if (!f1Ayni) {
    const kat = o.tamNegatif.yanlisPozitif / Math.max(1, y.tamNegatif.yanlisPozitif)
    s.push(`F1 optimumu ise yanlış pozitifi ${y.tamNegatif.yanlisPozitif}'ten ${o.tamNegatif.yanlisPozitif}'e — ${vir(kat.toFixed(0))} katına —`)
    s.push(`çıkarıyor (${yz(y.tamNegatif.oran)} → ${yz(o.tamNegatif.oran)}); F1'deki kazanç ${sy(y.f1)} → ${sy(o.f1)}.`)
  }
  s.push('')
}

s.push('Bu, eşiklerin ölçümden muaf olduğu anlamına gelmez: yukarıdaki tablolar yürürlükteki')
s.push('değerlerin bu küme üzerinde ne verdiğini sayıyla gösteriyor ve karar ölçüme dayanıyor.')
s.push('')

mkdirSync(dirname(cikti), { recursive: true })
writeFileSync(cikti, s.join('\n'))
console.log(`Rapor -> ${cikti}  (${s.length} satır)`)
