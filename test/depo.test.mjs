/** Depo katmanının bütünleşim testleri: bakiye tutarlılığı, tavan, süre dolumu. */
import * as depo from '@/lib/store/depo'
import { suresiDoldu, yururluktekiUrunler } from '@/lib/store/efektler'

export async function calistir() {
  let gecti = 0
  let kaldi = 0
  const kontrol = (ad, kosul, ek = '') => {
    if (kosul) {
      gecti++
      console.log(`  ✓ ${ad}`)
    } else {
      kaldi++
      console.log(`  ✗ ${ad} ${ek}`)
    }
  }

  const d = () => depo.anlikGoruntu().veri
  const defterToplami = () => d().hareketler.reduce((t, h) => t + h.miktar, 0)

  const konsol = console.log
  const sustur = () => {
    console.log = () => {}
  }
  const ac = () => {
    console.log = konsol
  }

  console.log('\n▸ DEPO KATMANI')

  console.log('\n— Hidrasyon —')
  kontrol('başlangıçta hidre değil', depo.anlikGoruntu().hidre === false)
  kontrol('sunucu görüntüsü sabit referans', depo.sunucuGoruntusu() === depo.sunucuGoruntusu())
  depo.hidratla()
  kontrol('hidrasyondan sonra hidre', depo.anlikGoruntu().hidre === true)
  kontrol('localStorage yazıldı', localStorage.getItem('mihenk_state_v3') !== null)

  console.log('\n— Bakiye hareket defterinden türetilir —')
  kontrol('başlangıç bakiyesi 120', d().kullanici.jetonBakiyesi === 120, `→ ${d().kullanici.jetonBakiyesi}`)
  kontrol('bakiye defter toplamına eşit', d().kullanici.jetonBakiyesi === defterToplami())

  console.log('\n— Satın alma —')
  const pirinc = d().magaza.find((u) => u.id === 'u1')
  kontrol('alım başarılı', depo.urunSatinAl(pirinc) === true)
  kontrol('bakiye düştü', d().kullanici.jetonBakiyesi === 105, `→ ${d().kullanici.jetonBakiyesi}`)
  kontrol('defter kaydı eklendi', d().hareketler[0].miktar === -15)
  kontrol('bakiye defterle tutarlı', d().kullanici.jetonBakiyesi === defterToplami())
  kontrol('envantere eklendi', d().kullanici.envanter.some((s) => s.urunId === 'u1' && s.aktif))

  const altin = d().magaza.find((u) => u.id === 'u5')
  kontrol('yetersiz bakiyede alım reddedilir', depo.urunSatinAl(altin) === false)
  kontrol('reddedilen alım bakiyeyi bozmaz', d().kullanici.jetonBakiyesi === 105)

  console.log('\n— Ürün aç/kapa —')
  depo.urunAcKapa('u1')
  kontrol('kapatıldı', d().kullanici.envanter.find((s) => s.urunId === 'u1').aktif === false)
  depo.urunAcKapa('u1')
  kontrol('yeniden açıldı', d().kullanici.envanter.find((s) => s.urunId === 'u1').aktif === true)

  console.log('\n— Süre dolumu —')
  kontrol('yeni alınan süreli ürün yürürlükte', yururluktekiUrunler(d()).some((u) => u.id === 'u1'))
  const eski = {
    urunId: 'u1',
    satinAlmaZamani: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    aktif: true,
  }
  kontrol('iki gün önceki 24 saatlik ürün dolmuş', suresiDoldu(pirinc, eski) === true)
  kontrol('kalıcı ürün hiç dolmaz', suresiDoldu(altin, eski) === false)

  console.log('\n— Doğrulama ve günlük tavan —')
  const yeniGonderi = (id, metin) => ({
    id,
    yazarId: d().kullanici.id,
    tur: 'metin',
    metin,
    gorselUrl: null,
    anketSecenekleri: null,
    olusturmaZamani: new Date().toISOString(),
    yzBeyani: false,
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
  })

  const metinler = [
    'Bahçeye yeni fidanlar diktim, önümüzdeki bahar meyve vermelerini bekliyorum sabırla.',
    'Kitap okuma alışkanlığımı geri kazanmak için her akşam yarım saat ayırmaya başladım.',
    'Yürüyüş rotamı değiştirdim, sahil yolu sabahları çok daha sakin ve ferah oluyor.',
    'Eski fotoğrafları tararken çocukluk yazlarına dair unuttuğum ayrıntılar canlandı.',
    'Mutfakta ekşi maya denemelerim nihayet tutarlı sonuçlar vermeye başladı bu hafta.',
    'Bisikletin vitesini ayarlattım, yokuşlarda gözle görülür bir fark yarattı gerçekten.',
  ]

  sustur()
  const sonuclar = []
  for (let i = 0; i < metinler.length; i++) {
    const g = yeniGonderi(`t${i}`, metinler[i])
    depo.gonderiEkle(g)
    await new Promise((cozumle) => depo.dogrulamaTetikle(g.id, cozumle))
    sonuclar.push(depo.anlikGoruntu().veri.gonderiler.find((x) => x.id === g.id))
  }
  ac()

  const toplamKazanc = sonuclar.reduce((t, g) => t + g.kazanilanJeton, 0)
  kontrol('altı gönderi de sonuçlandı', sonuclar.every((g) => g.dogrulamaDurumu !== 'bekliyor'))
  kontrol('günlük kazanç tavanı aşmadı', d().kullanici.bugunKazanilan <= 50, `→ ${d().kullanici.bugunKazanilan}`)
  kontrol('tavan tam 50de kırpıldı', toplamKazanc === 50, `→ ${toplamKazanc}`)
  kontrol(
    'tavan gerekçesi kullanıcıya bildirildi',
    sonuclar.some((g) => g.gerekce.some((x) => x.includes('üst sınır')))
  )
  kontrol('bakiye hâlâ defterle tutarlı', d().kullanici.jetonBakiyesi === defterToplami())

  console.log('\n— Akış içinde kopya tespiti —')
  sustur()
  const kopyaG = yeniGonderi(
    'kopya1',
    'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.'
  )
  depo.gonderiEkle(kopyaG)
  const kopyaSonuc = await new Promise((cozumle) => depo.dogrulamaTetikle(kopyaG.id, cozumle))
  ac()
  kontrol(
    'demo gönderisinin kopyası yakalanır',
    kopyaSonuc.durumu === 'gecemedi' && kopyaSonuc.kazanilanJeton === 0,
    `→ ${kopyaSonuc.durumu}/${kopyaSonuc.kazanilanJeton}`
  )

  console.log('\n— İtiraz —')
  depo.itirazEt('kopya1')
  kontrol('itiraz kaydedildi', d().gonderiler.find((g) => g.id === 'kopya1').itirazDurumu === 'incelemede')

  console.log('\n— Demo sıfırlama —')
  depo.resetToDemo()
  kontrol('gönderiler demo haline döndü', d().gonderiler.length === 8, `→ ${d().gonderiler.length}`)
  kontrol('bakiye 120', d().kullanici.jetonBakiyesi === 120)
  kontrol('envanter boşaldı', d().kullanici.envanter.length === 0)

  console.log(`\n  ${gecti} geçti, ${kaldi} kaldı`)
  return { gecti, kaldi }
}
