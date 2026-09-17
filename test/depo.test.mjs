/** Depo katmanının bütünleşim testleri: bakiye tutarlılığı, tavan, süre dolumu. */
import * as depo from '@/lib/store/depo'
import { KOLEKSIYONLAR, varsayilanDurum } from '@/lib/store/demoData'
import {
  aktifEfekt,
  koleksiyonDurumu,
  suresiDoldu,
  yururluktekiUrunler,
} from '@/lib/store/efektler'

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
  await depo.hidratla()
  kontrol('hidrasyondan sonra hidre', depo.anlikGoruntu().hidre === true)
  kontrol('localStorage yazıldı', localStorage.getItem('mihenk_state_v3') !== null)

  console.log('\n— Seed sürümü —')
  const surum = depo.anlikGoruntu().veri.seedSurumu
  kontrol('durum bir seed sürümü taşıyor', typeof surum === 'string' && /^[0-9a-f]{8}$/.test(surum), `→ ${surum}`)
  kontrol('sürüm çağrılar arasında sabit', varsayilanDurum().seedSurumu === surum)

  console.log('\n— Bakiye hareket defterinden türetilir —')
  // Seed gönderileri hidrasyonda doğrulanıp jeton kazandığı için bakiye
  // sabit değildir; ölçüt bakiyenin daima defterden türetilmesidir.
  kontrol('demo başlangıç kaydı 120 jeton', d().hareketler.some((h) => h.tur === 'demo' && h.miktar === 120))
  kontrol('bakiye defter toplamına eşit', d().kullanici.jetonBakiyesi === defterToplami(), `→ ${d().kullanici.jetonBakiyesi}`)
  // Not: seed'deki reddedilen gönderi bulanık görsel taşır ve görsel kademesi
  // canvas gerektirir. Ortamdan bağımsız olsun diye burada düşük çabalı bir
  // metin paylaşılıp defter ölçülür.
  sustur()
  const dusukG = yeniGonderi('dusuk-defter', 'Süper.')
  depo.gonderiEkle(dusukG)
  await new Promise((cozumle) => depo.dogrulamaTetikle(dusukG.id, cozumle))
  ac()
  kontrol(
    'reddedilen kazanım deftere 0 jetonla ve gerekçesiyle geçti',
    d().hareketler.some((h) => h.miktar === 0 && h.aciklama.includes('Kazanç verilmedi')),
    `→ ${d().hareketler[0]?.aciklama}`
  )
  kontrol(
    'başka kullanıcının gönderisi cüzdana girmedi',
    d().hareketler.length === d().gonderiler.filter((g) => g.yazarId === d().kullanici.id).length + 1,
    `→ ${d().hareketler.length} kayıt`
  )

  console.log('\n— Satın alma —')
  // u1 demo açılışında envanterde geldiği için sahip olunmayan bir ürün seçilir
  const urun = d().magaza.find((u) => u.id === 'u2')
  const oncekiBakiye = d().kullanici.jetonBakiyesi
  kontrol('alım başarılı', depo.urunSatinAl(urun) === true)
  kontrol('bakiye ürün fiyatı kadar düştü',
    d().kullanici.jetonBakiyesi === oncekiBakiye - urun.fiyat,
    `→ ${oncekiBakiye} - ${urun.fiyat} = ${d().kullanici.jetonBakiyesi}`)
  kontrol('defter kaydı eklendi', d().hareketler[0].miktar === -urun.fiyat)
  kontrol('bakiye defterle tutarlı', d().kullanici.jetonBakiyesi === defterToplami())
  const alimSonrasi = d().kullanici.jetonBakiyesi
  kontrol('envantere eklendi', d().kullanici.envanter.some((s) => s.urunId === 'u2' && s.aktif))
  kontrol('sahip olunan ürün ikinci kez ücretlendirilmez', depo.urunSatinAl(urun) === false)

  const altin = d().magaza.find((u) => u.id === 'u5')
  kontrol('yetersiz bakiyede alım reddedilir', depo.urunSatinAl(altin) === false)
  kontrol('reddedilen alım bakiyeyi bozmaz', d().kullanici.jetonBakiyesi === alimSonrasi)

  console.log('\n— Aynı türden tek slot —')
  /*
    u1 (Pirinç Çerçeve, cerceve) demo açılışında takılı geliyor. u2c
    (Tunç Kenar) de bir cerceve. İkincisi alınınca birincisi kapanmalı.

    Önceden ikisi de açık kalıyor, cüzdan ikisini de yeşil "Açık" gösteriyor
    ama ekranda yalnızca dizideki SONUNCU görünüyordu — yani satın alma
    sırası kazanıyordu, fiyat değil.
  */
  const tuncKenar = d().magaza.find((u) => u.id === 'u2c')
  kontrol('ikinci çerçeve alındı', depo.urunSatinAl(tuncKenar) === true)
  kontrol('önceki çerçeve kendiliğinden kapandı',
    d().kullanici.envanter.find((s) => s.urunId === 'u1').aktif === false)
  kontrol('yeni çerçeve açık', d().kullanici.envanter.find((s) => s.urunId === 'u2c').aktif === true)
  kontrol('yürürlükte tek çerçeve var',
    yururluktekiUrunler(d()).filter((u) => u.efekt.tur === 'cerceve').length === 1)
  kontrol('farklı tür etkilenmedi — ad rengi hâlâ açık',
    d().kullanici.envanter.find((s) => s.urunId === 'u2').aktif === true)
  kontrol('aktifEfekt yeni çerçeveyi veriyor', aktifEfekt(d(), 'cerceve')?.id === 'u2c')

  // Eski çerçeveyi elle açmak yenisini kapatmalı — kural iki yönde de işler
  depo.urunAcKapa('u1')
  kontrol('elle açınca diğeri kapandı',
    d().kullanici.envanter.find((s) => s.urunId === 'u2c').aktif === false)
  depo.urunAcKapa('u2c')

  console.log('\n— Ürün aç/kapa —')
  depo.urunAcKapa('u2')
  kontrol('kapatıldı', d().kullanici.envanter.find((s) => s.urunId === 'u2').aktif === false)
  depo.urunAcKapa('u2')
  kontrol('yeniden açıldı', d().kullanici.envanter.find((s) => s.urunId === 'u2').aktif === true)

  console.log('\n— Süre dolumu —')
  kontrol('yeni alınan süreli ürün yürürlükte', yururluktekiUrunler(d()).some((u) => u.id === 'u2'))
  const eski = {
    urunId: 'u2',
    satinAlmaZamani: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    aktif: true,
  }
  kontrol('iki gün önceki 24 saatlik ürün dolmuş', suresiDoldu(urun, eski) === true)
  kontrol('kalıcı ürün hiç dolmaz', suresiDoldu(altin, eski) === false)

  /*
    Koleksiyon bölümü süre dolumundan SONRA duruyor: u12 (Tunç Ad) ile u2
    (Mika Ad) aynı türden, u12 alınınca tek slot kuralı u2'yi kapatır ve
    yukarıdaki "yürürlükte" ölçümü anlamını yitirirdi.
  */
  console.log('\n— Koleksiyon ödülü —')
  /*
    Tunç Seti = u2c + u11 + u12, ödülü u15 (Tunç Mührü).

    Ölçüt SAHİPLİK, kuşanmışlık değil: üç üye de 24 saatlik ürün, "üçü de o
    an açık" koşulu ilk üyenin süresi dolduğu için hiçbir zaman sağlanamazdı.
    u2c yukarıdaki tek slot bölümünde zaten alındı; burada kalan ikisi alınıp
    ödülün üçüncü alımda düştüğü doğrulanır.
  */
  const tuncSeti = KOLEKSIYONLAR.find((k) => k.id === 'tunc-seti')
  const odulUrunu = d().magaza.find((u) => u.id === tuncSeti.odulUrunId)

  kontrol('ödül ürünü katalogda ve kilitli', odulUrunu?.kilit === 'koleksiyon')
  kontrol('ödül doğrudan satın alınamaz', depo.urunSatinAl(odulUrunu) === false)
  kontrol(
    'reddedilen kilitli alım envantere de deftere de dokunmadı',
    d().kullanici.envanter.some((s) => s.urunId === 'u15') === false &&
      d().hareketler.some((h) => h.aciklama.includes('Tunç Mührü alındı')) === false
  )

  const tuncSerit = d().magaza.find((u) => u.id === 'u11')
  kontrol('ikinci set üyesi alındı', depo.urunSatinAl(tuncSerit) === true)
  kontrol(
    'set eksikken ödül verilmez',
    d().kullanici.envanter.some((s) => s.urunId === 'u15') === false
  )
  kontrol(
    'eksik sette ilerleme 3 üzerinden 2',
    koleksiyonDurumu(d(), tuncSeti).sahipSayisi === 2 &&
      koleksiyonDurumu(d(), tuncSeti).tamam === false,
    `→ ${koleksiyonDurumu(d(), tuncSeti).sahipSayisi}/3`
  )

  const tuncAd = d().magaza.find((u) => u.id === 'u12')
  const setOncesiBakiye = d().kullanici.jetonBakiyesi
  kontrol('üçüncü set üyesi alındı', depo.urunSatinAl(tuncAd) === true)
  kontrol('set tamamlanınca ödül envantere düştü', d().kullanici.envanter.some((s) => s.urunId === 'u15'))
  kontrol('koleksiyon tamam olarak okunuyor', koleksiyonDurumu(d(), tuncSeti).tamam === true)
  kontrol(
    'ödül 0 jetonluk defter kaydıyla duyuruldu',
    d().hareketler.some((h) => h.miktar === 0 && h.aciklama.includes('Tunç Seti tamamlandı')),
    `→ ${d().hareketler[0]?.aciklama}`
  )
  kontrol(
    'ödül bedelsiz — bakiyeden yalnızca üçüncü üyenin fiyatı düştü',
    d().kullanici.jetonBakiyesi === setOncesiBakiye - tuncAd.fiyat,
    `→ ${setOncesiBakiye} - ${tuncAd.fiyat} = ${d().kullanici.jetonBakiyesi}`
  )
  kontrol('bakiye ödülden sonra da defterle tutarlı', d().kullanici.jetonBakiyesi === defterToplami())

  // Ödül kazanıldıktan sonra da satın alınamaz: kilit sahipliğe bağlı değil
  kontrol('kazanılmış ödül yine satın alınamaz', depo.urunSatinAl(odulUrunu) === false)

  /*
    İkinci kez verilmez. Sonraki her alım koleksiyonları yeniden tarıyor;
    kontrol ödülün envanterde OLMASINA bakıyor, o alıma değil.
  */
  const odulSatirlari = () => d().kullanici.envanter.filter((s) => s.urunId === 'u15').length
  const odulKayitlari = () =>
    d().hareketler.filter((h) => h.aciklama.includes('Tunç Seti tamamlandı')).length
  const oncekiSatir = odulSatirlari()
  const oncekiKayit = odulKayitlari()
  kontrol('set tamamken başka bir ürün alındı', depo.urunSatinAl(d().magaza.find((u) => u.id === 'u10')) === true)
  kontrol('ödül ikinci kez envantere eklenmedi', odulSatirlari() === oncekiSatir, `→ ${odulSatirlari()}`)
  kontrol('ödül ikinci kez deftere yazılmadı', odulKayitlari() === oncekiKayit, `→ ${odulKayitlari()}`)

  console.log('\n— Doğrulama ve günlük tavan —')

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

  kontrol('altı gönderi de sonuçlandı', sonuclar.every((g) => g.dogrulamaDurumu !== 'bekliyor'))
  kontrol('günlük kazanç tavanı aşmadı', d().kullanici.bugunKazanilan <= 50, `→ ${d().kullanici.bugunKazanilan}`)
  kontrol(
    'tavan tam 50de doyuyor',
    d().kullanici.bugunKazanilan === 50,
    `→ ${d().kullanici.bugunKazanilan}`
  )
  kontrol(
    'tavan gerekçesi kullanıcıya bildirildi',
    sonuclar.some((g) => g.gerekce.some((x) => x.includes('üst sınır')))
  )
  kontrol('bakiye hâlâ defterle tutarlı', d().kullanici.jetonBakiyesi === defterToplami())

  console.log('\n— Akış içinde kopya tespiti —')
  sustur()
  // Seed'deki kaynak metnin aynısı; motorun kopya olarak işaretlemesi beklenir
  const kaynakSeed = d().gonderiler.find((g) => g.id === 'g08')
  const kopyaG = yeniGonderi('kopya1', kaynakSeed.metin)
  depo.gonderiEkle(kopyaG)
  const kopyaSonuc = await new Promise((cozumle) => depo.dogrulamaTetikle(kopyaG.id, cozumle))
  ac()
  kontrol(
    'demo gönderisinin kopyası yakalanır',
    kopyaSonuc.durumu === 'kopya' && kopyaSonuc.kazanilanJeton === 0,
    `→ ${kopyaSonuc.durumu}/${kopyaSonuc.kazanilanJeton}`
  )
  kontrol(
    'kopya gönderiye kaynak bağlantısı işlendi',
    Boolean(d().gonderiler.find((g) => g.id === 'kopya1')?.kaynakGonderiId),
    `→ ${d().gonderiler.find((g) => g.id === 'kopya1')?.kaynakGonderiId}`
  )

  console.log('\n— İtiraz —')
  depo.itirazEt('kopya1')
  kontrol('itiraz kaydedildi', d().gonderiler.find((g) => g.id === 'kopya1').itirazDurumu === 'incelemede')

  console.log('\n— Demo sıfırlama —')
  depo.resetToDemo()
  kontrol('gönderiler demo haline döndü', d().gonderiler.length === 12, `→ ${d().gonderiler.length}`)
  kontrol('bakiye 120', d().kullanici.jetonBakiyesi === 120)
  kontrol('envanter demo başlangıcına döndü', d().kullanici.envanter.length === 1)

  console.log(`\n  ${gecti} geçti, ${kaldi} kaldı`)
  return { gecti, kaldi }
}
