/** Doğrulama kütüphanesinin birim testleri. */
import {
  BENZERLIK_UYARI_ESIGI,
  DUSUK_CABA_ESIGI,
  KOPYA_ESIGI,
  METIN_ASGARI_KARAKTER,
  dogrula,
  hammingMesafesi,
  jaccardBenzerligi,
  normalizeTurkce,
  olcAnketCesitliligi,
  olcMetinDusukCaba,
  olcMetinNiteligi,
  parcalaraAyir,
} from '@/lib/verification'

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

  const gonderi = (id, metin, tur = 'metin', ekstra = {}) => ({
    id,
    yazarId: 'x',
    tur,
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
    ...ekstra,
  })

  const konsol = console.log
  const sustur = () => {
    console.log = () => {}
  }
  const ac = () => {
    console.log = konsol
  }

  console.log('\n▸ DOĞRULAMA KÜTÜPHANESİ')

  console.log('\n— Türkçe normalleştirme —')
  kontrol('büyük İ küçülür', normalizeTurkce('İSTANBUL').includes('istanbul'))
  kontrol('noktalama temizlenir', normalizeTurkce('Merhaba, dünya!') === 'merhaba dünya')

  console.log('\n— Jaccard benzerliği —')
  kontrol(
    'aynı metin 1 verir',
    jaccardBenzerligi(parcalaraAyir('deneme metni burada'), parcalaraAyir('deneme metni burada')) === 1
  )
  const farkli = jaccardBenzerligi(
    parcalaraAyir('bugün hava çok güzel'),
    parcalaraAyir('yarın toplantı var')
  )
  kontrol('alakasız metin düşük çıkar', farkli < 0.1, `→ ${farkli.toFixed(3)}`)

  console.log('\n— Metin niteliği —')
  kontrol('anlamsız tekrar yakalanır', olcMetinNiteligi('a a a a a b b b b b c c c c c').skor < 40)
  kontrol('yalnızca bağlantı yakalanır', olcMetinNiteligi('https://ornek.com').skor < 40)
  kontrol('yalnızca emoji yakalanır', olcMetinNiteligi('🔥🔥🔥').skor < 40)
  kontrol(
    'tamamı büyük harf yakalanır',
    olcMetinNiteligi('BUGÜN HAVA ÇOK GÜZELDİ VE DIŞARI ÇIKTIM').gerekce.some((x) =>
      x.includes('büyük harf')
    )
  )
  const iyi = olcMetinNiteligi(
    'Sürekli öğrenmek gelişimin temel anahtarıdır, her gün biraz daha ilerlemek gerekir.'
  )
  kontrol('nitelikli metin yüksek puan alır', iyi.skor >= 80, `→ ${iyi.skor}`)

  console.log('\n— Düşük çaba skoru —')
  kontrol('eşik rapordaki değerle aynı', DUSUK_CABA_ESIGI === 0.65, `→ ${DUSUK_CABA_ESIGI}`)
  kontrol('asgari karakter rapordaki değerle aynı', METIN_ASGARI_KARAKTER === 15)
  kontrol(
    '15 karakter altı sert tabana takılır',
    olcMetinDusukCaba('Tamam.').skor === 1,
    `→ ${olcMetinDusukCaba('Tamam.').skor}`
  )
  kontrol('yalnızca emoji sert tabana takılır', olcMetinDusukCaba('🔥🔥🔥').skor === 1)
  const kisaGonderi = olcMetinDusukCaba('Kahve molası verdim şimdi.')
  kontrol(
    'kısa ve az sözcüklü gönderi düşük çabalı sayılır',
    kisaGonderi.dusukCabaMi,
    `→ ${kisaGonderi.skor}`
  )
  const nitelikliGonderi = olcMetinDusukCaba(
    'Roket motorunun ikinci ateşleme denemesinde basınç eğrisi beklenenden yumuşak çıktı.'
  )
  kontrol(
    'teknik içerik düşük çabalı sayılmaz',
    !nitelikliGonderi.dusukCabaMi,
    `→ ${nitelikliGonderi.skor}`
  )
  kontrol(
    'düşük çaba ile nitelikli arasında geniş açıklık var',
    kisaGonderi.skor - nitelikliGonderi.skor > 0.4,
    `→ ${(kisaGonderi.skor - nitelikliGonderi.skor).toFixed(3)}`
  )
  kontrol(
    'ağırlıklı bileşenler skorla tutarlı',
    Object.keys(kisaGonderi.bilesenler).length > 0
  )

  console.log('\n— Anket çeşitliliği —')
  kontrol('tek seçenek reddedilir', olcAnketCesitliligi(['Evet']).skor === 0)
  kontrol('yinelenen seçenek düşürülür', olcAnketCesitliligi(['Evet', 'Evet']).skor === 30)
  kontrol(
    'ayırt edici seçenekler tam puan',
    olcAnketCesitliligi(['Kuantum bilişim', 'Biyoteknoloji', 'Uzay sanayi']).skor === 100
  )

  console.log('\n— Hamming mesafesi —')
  kontrol('aynı hash 0 verir', hammingMesafesi('f0e1c3878f1e3c78', 'f0e1c3878f1e3c78') === 0)
  kontrol('tek bit farkı 1 verir', hammingMesafesi('0000000000000000', '0000000000000001') === 1)
  kontrol('farklı uzunluk 64 verir', hammingMesafesi('abcd', 'f0e1c3878f1e3c78') === 64)

  console.log('\n— Doğrulama zinciri —')
  const kopyaMetin = 'Bu hafta sonu dinlenmeye ayıracağım. Çok yorucu bir hafta oldu gerçekten.'
  const gecmis = [
    {
      ...gonderi('eski', kopyaMetin),
      metinParcalari: Array.from(parcalaraAyir(kopyaMetin)),
    },
  ]

  sustur()
  const kopya = await dogrula(gonderi('y1', kopyaMetin), gecmis)
  const ozgun = await dogrula(
    gonderi('y2', 'Bahçeye yeni fidanlar diktim, önümüzdeki bahar meyve vermelerini bekliyorum.'),
    gecmis
  )
  const zayif = await dogrula(gonderi('y3', 'a a a a a b b b b b c c c c c'), gecmis)
  const kisa = await dogrula(gonderi('y4', 'Merhaba dünya'), gecmis)
  const anket = await dogrula(
    gonderi('y5', 'Sizce hangi teknoloji öne çıkacak bu sene?', 'anket', {
      anketSecenekleri: ['Kuantum', 'Biyoteknoloji'],
    }),
    gecmis
  )
  ac()

  kontrol('kopya metin elenir', kopya.durumu === 'kopya' && kopya.skor === 0, `→ ${kopya.durumu}/${kopya.skor}`)
  kontrol('kopya gerekçesi yazılır', kopya.gerekce.some((x) => x.includes('örtüşüyor')))
  kontrol('kopya kaynak gönderiyi bildirir', kopya.kaynakGonderiId === 'eski', `→ ${kopya.kaynakGonderiId}`)
  kontrol('kopya türü metin olarak işaretlenir', kopya.kopyaTuru === 'metin')
  kontrol(
    'örtüşme oranı sayı olarak dönüyor',
    typeof kopya.benzerlikOlcusu === 'number' && kopya.benzerlikOlcusu >= 0.7,
    `→ ${kopya.benzerlikOlcusu}`
  )
  kontrol(
    'kopya olmayan sonuçta örtüşme alanları boş',
    ozgun.kaynakGonderiId === null && ozgun.benzerlikOlcusu === null && ozgun.kopyaTuru === null
  )
  kontrol('özgün metin geçer', ozgun.durumu === 'gecti', `→ ${ozgun.durumu}/${ozgun.skor}`)
  kontrol('niteliksiz içerik geçemez', zayif.durumu === 'gecemedi', `→ ${zayif.durumu}/${zayif.skor}`)
  kontrol('çok kısa metin düşük çaba kademesine düşer', kisa.durumu === 'gecemedi', `→ ${kisa.durumu}/${kisa.skor}`)
  kontrol(
    'anket değerlendirilir',
    anket.durumu === 'gecti' && anket.gerekce.some((x) => x.startsWith('Anket')),
    `→ ${anket.durumu}/${anket.skor}`
  )

  console.log('\n— Kopya eşiği ve benzerlik uyarı bandı —')
  kontrol('kopya eşiği rapordaki değerle aynı', KOPYA_ESIGI === 0.35, `→ ${KOPYA_ESIGI}`)
  kontrol('uyarı bandı kopya eşiğinin altında', BENZERLIK_UYARI_ESIGI < KOPYA_ESIGI)

  const kaynakMetin =
    'İHA gövdesinin karbon fiber katmanlarını yeniden hesapladık ve ağırlık üç yüz gram düştü, sonuçlar beklentimizin üzerinde.'
  const kaynakGecmis = [
    { ...gonderi('kaynak', kaynakMetin), metinParcalari: Array.from(parcalaraAyir(kaynakMetin)) },
  ]
  const dolgu = 'Ölçümleri yeniden almayı planlıyoruz ve rüzgar tünelinde ikinci turu deneyeceğiz.'
  const kismiUret = (oran) => {
    const k = kaynakMetin.split(' ')
    return k.slice(0, Math.round(k.length * oran)).join(' ') + ' ' + dolgu
  }

  sustur()
  const azOrtusen = await dogrula(gonderi('a1', kismiUret(0.25)), kaynakGecmis)
  const bandda = await dogrula(gonderi('a2', kismiUret(0.45)), kaynakGecmis)
  ac()

  kontrol('düşük örtüşme temiz geçer', azOrtusen.durumu === 'gecti', `→ ${azOrtusen.durumu}`)
  kontrol('düşük örtüşmede uyarı yazılmaz', azOrtusen.benzerlikOlcusu === null)
  kontrol('uyarı bandı kısmi doğrulama verir', bandda.durumu === 'kismi', `→ ${bandda.durumu}/${bandda.skor}`)
  kontrol('uyarı bandında kazanç azaltılır', bandda.skor < 100 && bandda.skor >= 40, `→ ${bandda.skor}`)
  kontrol('uyarı bandı kaynak gönderiyi bildirir', bandda.kaynakGonderiId === 'kaynak')
  kontrol(
    'uyarı bandı örtüşme oranını gerekçede söyler',
    bandda.gerekce.some((x) => x.includes('örtüşüyor') && x.includes('kopya sayılmadı'))
  )

  console.log('\n— Yeni hesap koruması —')
  sustur()
  const yeniHesap = await dogrula(
    gonderi('y6', 'Bahçeye yeni fidanlar diktim, önümüzdeki bahar meyve vermelerini bekliyorum.'),
    [],
    1
  )
  ac()
  kontrol(
    'üç günden yeni hesapta skor yarılanır',
    yeniHesap.skor === Math.round(ozgun.skor * 0.5),
    `→ ${yeniHesap.skor} (beklenen ${Math.round(ozgun.skor * 0.5)})`
  )

  console.log(`\n  ${gecti} geçti, ${kaldi} kaldı`)
  return { gecti, kaldi }
}
