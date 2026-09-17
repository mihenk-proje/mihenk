/**
 * Uygulama durumu React dışında, tek bir modül düzeyi depoda tutulur.
 * Bileşenler bunu useSyncExternalStore ile okur.
 *
 * Bunun iki nedeni var:
 *  1. Doğrulama zamanlayıcılar içinde çalışıyor ve her zaman en güncel
 *     durumu görmeli; kapanışa (closure) takılan bir kopya yeterli değil.
 *  2. localStorage harici bir kaynak. Efekt içinde setState çağırıp
 *     basamaklı render tetiklemek yerine depo hidrate edilip abonelere
 *     tek seferde haber veriliyor.
 */
import {
  GUNLUK_UST_SINIR,
  KISMI_ODUL,
  TAM_ODUL,
  dogrula,
  hesapYasiGun,
} from '@/lib/verification'
import { KOLEKSIYONLAR, SEED_SURUMU, varsayilanDurum } from './demoData'
import { islevAcikMi, suresiDoldu, tekSlotUygula } from './efektler'
import type { AppState, DogrulamaSonucu, Gonderi, HareketKaydi, Mesaj, SahipOlunanUrun, Urun } from './types'

/*
  Veri modeli veya ürün kataloğu değiştiğinde eski kayıtlar okunmasın diye
  sürümlü anahtar. v3: katalogdan iki ürün çıkarıldı; sürüm yükseltilmezse
  kayıtlı durumu olan tarayıcılar kaldırılan ürünleri görmeye devam eder.
*/
const DEPO_ANAHTARI = 'mihenk_state_v3'
const DOGRULAMA_ZAMAN_ASIMI_MS = 8000

export type DepoDurumu = {
  veri: AppState
  /** localStorage okunana kadar false. Sunucu ve ilk istemci render'ı bu değeri paylaşır. */
  hidre: boolean
}

/**
 * Bakiye ve günlük kazanç daima hareket defterinden yeniden hesaplanır,
 * böylece iki kaynak arasında tutarsızlık oluşamaz.
 * Süresi dolmuş envanter kayıtları da burada kapatılır.
 */
export function senkronizeEt(durum: AppState): AppState {
  let bakiye = 0
  let bugunKazanilan = 0
  const bugunBaslangici = new Date()
  bugunBaslangici.setHours(0, 0, 0, 0)

  for (const h of durum.hareketler) {
    bakiye += h.miktar
    if (h.miktar > 0 && new Date(h.zaman) >= bugunBaslangici) {
      bugunKazanilan += h.miktar
    }
  }

  const envanter = durum.kullanici.envanter.map((sahip) => {
    const urun = durum.magaza.find((u) => u.id === sahip.urunId)
    return suresiDoldu(urun, sahip) ? { ...sahip, aktif: false } : sahip
  })

  return {
    ...durum,
    kullanici: { ...durum.kullanici, jetonBakiyesi: bakiye, bugunKazanilan, envanter },
  }
}

function defterAciklamasi(durum: DogrulamaSonucu['durumu']): string {
  switch (durum) {
    case 'gecti':
      return 'İçerik doğrulandı (tam)'
    case 'kismi':
      return 'İçerik doğrulandı (kısmi)'
    case 'kopya':
      return 'Kazanç verilmedi — içerik daha önce paylaşılmış'
    default:
      return 'Kazanç verilmedi — düşük çabalı içerik'
  }
}

function yeniHareket(aciklama: string, miktar: number, zaman?: string): HareketKaydi {
  return {
    id: `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    zaman: zaman ?? new Date().toISOString(),
    aciklama,
    miktar,
  }
}

function gecerliDurumMu(veri: unknown): veri is AppState {
  if (typeof veri !== 'object' || veri === null) return false
  const d = veri as Partial<AppState>
  return (
    typeof d.seedSurumu === 'string' &&
    Array.isArray(d.gonderiler) &&
    Array.isArray(d.hareketler) &&
    Array.isArray(d.magaza) &&
    Array.isArray(d.yazarlar) &&
    typeof d.kullanici === 'object' &&
    d.kullanici !== null
  )
}

/*
  Sunucu anlık görüntüsü sabit bir referans olmalı; useSyncExternalStore
  her çağrıda yeni nesne dönerse sonsuz render döngüsü oluşur.
*/
const SUNUCU_DURUMU: DepoDurumu = { veri: senkronizeEt(varsayilanDurum()), hidre: false }

let mevcut: DepoDurumu = SUNUCU_DURUMU
const dinleyiciler = new Set<() => void>()

function yayinla() {
  for (const dinleyici of dinleyiciler) dinleyici()
}

function kaydet(veri: AppState) {
  try {
    localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(veri))
  } catch (err) {
    // Kota dolmuş olabilir (büyük data: URL'li görseller); uygulama çalışmayı sürdürür
    console.error('[MİHENK] Durum kaydedilemedi:', err)
  }
}

function guncelle(donusum: (onceki: AppState) => AppState) {
  const yeni = senkronizeEt(donusum(mevcut.veri))
  mevcut = { veri: yeni, hidre: mevcut.hidre }
  if (mevcut.hidre) kaydet(yeni)
  yayinla()
}

export function abone(dinleyici: () => void) {
  dinleyiciler.add(dinleyici)
  return () => {
    dinleyiciler.delete(dinleyici)
  }
}

export function anlikGoruntu(): DepoDurumu {
  return mevcut
}

export function sunucuGoruntusu(): DepoDurumu {
  return SUNUCU_DURUMU
}

/**
 * localStorage'dan bir kez okur. Tekrar çağrılması etkisizdir.
 *
 * Bekleyen doğrulamaların tamamlanmasını bekleyen bir söz döndürür.
 * Arayüz bunu beklemez (akış önce boyanır); testler determinizm için bekler.
 */
export function hidratla(): Promise<void> {
  if (mevcut.hidre) return Promise.resolve()

  let veri = varsayilanDurum()
  try {
    const kayitli = localStorage.getItem(DEPO_ANAHTARI)
    if (kayitli) {
      const cozulen: unknown = JSON.parse(kayitli)
      if (!gecerliDurumMu(cozulen)) {
        console.warn('[MİHENK] Kayıtlı durum beklenen şekilde değil, demo verisine dönülüyor.')
      } else if (cozulen.seedSurumu !== SEED_SURUMU) {
        /*
          Seed içeriği güncellenmiş. Eski kayıt tutulursa kullanıcı yeni
          dağıtıma rağmen eski akışı görür ve bunu düzeltmek için "Demoyu
          sıfırla" düğmesini bulması gerektiğini bilmez.

          Demo bağlamında kazanılan jetonlar ve envanter de dahil olmak
          üzere durum tamamen sıfırlanır: yarısı eski yarısı yeni bir
          durum, tutarsız bir akıştan daha kötüdür.
        */
        console.info(
          `[MİHENK] Seed sürümü değişti (${cozulen.seedSurumu} → ${SEED_SURUMU}), ` +
            'demo verisi yeniden yüklendi.'
        )
      } else {
        /*
          `mesajlar` sonradan eklendi ve isteğe bağlı; aynı seed sürümüyle
          kaydedilmiş bir durumda olmayabilir. Eksikse tohum sohbetlerle
          dolar — şema sürümü (v3) değişmeden geriye uyumluluk.
        */
        veri = { ...cozulen, mesajlar: cozulen.mesajlar ?? varsayilanDurum().mesajlar }
      }
    }
  } catch (err) {
    console.error('[MİHENK] Kayıtlı durum okunamadı:', err)
  }

  mevcut = { veri: senkronizeEt(veri), hidre: true }
  kaydet(mevcut.veri)
  yayinla()

  /*
    Bekleyen doğrulamalar eskiden yeniye, sırayla çalıştırılır.

    Sıra zorunludur: kopya tespiti kaynağın `metinParcalari` alanının dolu
    olmasına bağlıdır. Paralel çalıştırılırsa kopya gönderi kaynağından önce
    işlenebilir ve karşılaştıracak parça bulamaz.

    Akış bu sırada zaten boyanmıştır; doğrulama sonuçları sonradan belirir.
    Bu, raporun Şekil 3'teki Akış A davranışıdır: içerik anında görünür,
    doğrulama sonucunu beklemez.
  */
  const bekleyenler = mevcut.veri.gonderiler
    .filter((g) => g.dogrulamaDurumu === 'bekliyor')
    .sort((a, b) => a.olusturmaZamani.localeCompare(b.olusturmaZamani))

  return (async () => {
    for (const g of bekleyenler) {
      if (isleniyor.has(g.id)) continue
      isleniyor.add(g.id)
      await dogrulamaCalistir(g.id)
      // Rozetlerin tek tek belirmesi asenkron mimarinin görünür kanıtıdır
      await new Promise((c) => window.setTimeout(c, 140))
    }
  })()
}

export function resetToDemo() {
  isleniyor.clear()
  guncelle(() => varsayilanDurum())
}

export function gonderiEkle(gonderi: Gonderi) {
  guncelle((onceki) => ({ ...onceki, gonderiler: [gonderi, ...onceki.gonderiler] }))
}

/**
 * Tamamlanan koleksiyonların ödüllerini envantere ekler.
 *
 * Saf fonksiyon: depoya erişmez, envanteri alır ve yenisini döndürür.
 *
 * ÖLÇÜT SAHİPLİKTİR, KUŞANMIŞLIK DEĞİL. Envanterde bir satırın bulunması
 * "bir kez sahip olundu" demektir: `urunSatinAl` satırı silmiyor (önce
 * süzüp sonra ekliyor), `senkronizeEt` de süresi dolan satırın yalnızca
 * `aktif` alanını kapatıyor. Tunç Seti'nin üç üyesi de 24 saatlik ürün;
 * "üçü de o an açık" koşulu ilk üyenin süresi dolduğu için hiçbir zaman
 * sağlanamazdı.
 *
 * Ödül `tekSlotUygula`dan geçirilir: rozet tek slotlu bir tür, ödül açık
 * gelip aynı türden ikincisini açık bırakırsa cüzdan iki rozeti birden
 * yeşil "Açık" gösterir ama ekranda yalnızca biri görünür.
 */
function koleksiyonOdulleri(
  envanter: SahipOlunanUrun[],
  magaza: Urun[],
  zaman: string
): { envanter: SahipOlunanUrun[]; kayitlar: HareketKaydi[] } {
  let sonuc = envanter
  const kayitlar: HareketKaydi[] = []

  for (const koleksiyon of KOLEKSIYONLAR) {
    // Zaten verilmiş: ikinci kez ne envantere ne deftere girer.
    if (sonuc.some((s) => s.urunId === koleksiyon.odulUrunId)) continue
    if (!koleksiyon.urunler.every((id) => sonuc.some((s) => s.urunId === id))) continue

    const odul = magaza.find((u) => u.id === koleksiyon.odulUrunId)
    if (!odul) continue

    /*
      Ödül YALNIZCA aynı türden takılı bir şey yoksa açık gelir.

      Koşulsuz açmak sessiz bir düşürme olurdu: kullanıcı 1500 jetonluk Ayar
      Rozeti takılıyken seti tamamlarsa, bedelsiz gelen Tunç Mührü tek slot
      kuralı gereği onu kapatırdı. Bir ödül, kullanıcının kendi tercihini
      haberi olmadan geri alamaz.

      Takılı bir şey yoksa açık gelir — set tamamlandığında hiçbir şey
      olmamış gibi görünmesin.
    */
    const ayniTurTakili = sonuc.some((s) => {
      if (!s.aktif) return false
      const u = magaza.find((m) => m.id === s.urunId)
      return u?.efekt.tur === odul.efekt.tur && !suresiDoldu(u, s)
    })

    sonuc = ayniTurTakili
      ? [...sonuc, { urunId: odul.id, satinAlmaZamani: zaman, aktif: false }]
      : tekSlotUygula(
          [...sonuc, { urunId: odul.id, satinAlmaZamani: zaman, aktif: true }],
          magaza,
          odul.id
        )
    /*
      Ödül de deftere geçer — 0 jetonla. Defter yalnızca jeton akışının
      değil, kazanımların kaydı: reddedilen doğrulamalar da 0 jetonla
      buraya yazılıyor. Ödül bedelsiz diye görünmez kalırsa kullanıcı
      envanterinde nereden geldiğini bilmediği bir rozet bulur.
    */
    kayitlar.push(yeniHareket(`${koleksiyon.ad} tamamlandı — ${odul.ad} açıldı`, 0, zaman))
  }

  return { envanter: sonuc, kayitlar }
}

/**
 * Bugünkü günlük üst sınır.
 *
 * Gümüş Tavan (u19) takılıysa +20. Ürün bilerek NET ZARARLI fiyatlandı:
 * 60 jeton ödeyip bir gün için en çok 20 jeton fazla kazanılabiliyor.
 * "Jeton öde, daha çok jeton kazan" bir çiftlik döngüsü olurdu ve günlük
 * tavan tam da çiftliğe karşı argüman. Satılan şey tavan değil, yoğun bir
 * günü tek seferlik esnetme hakkı — ve fiyatı kazandırdığından yüksek.
 *
 * Dürüstlük notu: bu fonksiyon ayrıcalığı ŞU AN itibarıyla değerlendirir,
 * oysa tavan gönderinin GÜNÜNE uygulanır. Bir günlük ürün için bu tutarlı;
 * otuz günlük bir sürümde olmazdı. sureGun'un 1 olmasının nedenlerinden biri.
 */
export function gunlukTavan(durum: AppState): number {
  return GUNLUK_UST_SINIR + (islevAcikMi(durum, 'tavan_artisi') ? 20 : 0)
}

export function urunSatinAl(urun: Urun): boolean {
  /*
    Kilitli ürün satılmaz. İLK SATIR olması zorunlu: koleksiyon ödülünün
    fiyatı 0, yani aşağıdaki bakiye kontrolü onu herkese geçirirdi ve
    "kazanılan" ürün tek tıkla satın alınabilirdi.
  */
  if (urun.kilit) return false

  if (mevcut.veri.kullanici.jetonBakiyesi < urun.fiyat) return false

  // Yürürlükteki bir ürün ikinci kez ücretlendirilmez. Arayüz bunu zaten
  // engelliyor; buradaki kontrol bir arayüz hatasının bakiyeye yansımasını
  // önleyen ikinci savunma hattıdır.
  const sahip = mevcut.veri.kullanici.envanter.find((e) => e.urunId === urun.id)
  if (sahip && !suresiDoldu(urun, sahip)) return false

  guncelle((onceki) => {
    const zaman = new Date().toISOString()

    /*
      Yeni satın alınan ürün açık gelir ve aynı türdeki kardeşlerini
      kapatır. Önceden iki çerçeve birden açık kalabiliyordu; cüzdan
      ikisini de yeşil "Açık" gösteriyor ama ekranda yalnızca biri
      görünüyordu.
    */
    const envanter = tekSlotUygula(
      [
        ...onceki.kullanici.envanter.filter((s) => s.urunId !== urun.id),
        { urunId: urun.id, satinAlmaZamani: zaman, aktif: true },
      ],
      onceki.magaza,
      urun.id
    )

    // Bu alım bir koleksiyonu tamamlamış olabilir; ödül burada, envanter
    // son hâlini aldıktan SONRA hesaplanır.
    const odul = koleksiyonOdulleri(envanter, onceki.magaza, zaman)

    return {
      ...onceki,
      kullanici: { ...onceki.kullanici, envanter: odul.envanter },
      // Defter en yeniden eskiye. Ödül alımdan sonra geldiği için başta.
      hareketler: [
        ...odul.kayitlar,
        yeniHareket(`${urun.ad} alındı`, -urun.fiyat, zaman),
        ...onceki.hareketler,
      ],
    }
  })

  return true
}

/**
 * Ürünü kuşan / çıkar.
 *
 * Kapatmak düz bir çevirme. AÇMAK ise aynı türdeki diğerlerini kapatır:
 * bir seferde bir çerçeve, bir rozet, bir tema takılabilir. `islev` ürünleri
 * bu kuralın dışında (bkz. TEK_SLOT).
 */
export function urunAcKapa(urunId: string) {
  guncelle((onceki) => {
    const suAn = onceki.kullanici.envanter.find((s) => s.urunId === urunId)
    const acilacak = suAn ? !suAn.aktif : false

    const cevrilmis = onceki.kullanici.envanter.map((s) =>
      s.urunId === urunId ? { ...s, aktif: !s.aktif } : s
    )

    return {
      ...onceki,
      kullanici: {
        ...onceki.kullanici,
        envanter: acilacak
          ? tekSlotUygula(cevrilmis, onceki.magaza, urunId)
          : cevrilmis,
      },
    }
  })
}

/**
 * Sohbete mesaj ekler. Metin ya da çıkartma — ikisi birden değil.
 *
 * Karşı taraf yanıt YAZMAZ. Bu bir prototip; sahte bir sohbet arkadaşı
 * uydurmak, sohbeti canlı göstermek adına kullanıcıya yalan söylemek olurdu.
 * Ekran bunu açıkça yazıyor.
 */
export function mesajGonder(sohbetId: string, icerik: { metin: string } | { cikartma: string }) {
  const mesaj: Mesaj = {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    sohbetId,
    gonderen: 'ben',
    metin: 'metin' in icerik ? icerik.metin.trim() : null,
    cikartma: 'cikartma' in icerik ? icerik.cikartma : null,
    zaman: new Date().toISOString(),
  }
  if (!mesaj.metin && !mesaj.cikartma) return
  guncelle((onceki) => ({ ...onceki, mesajlar: [...(onceki.mesajlar ?? []), mesaj] }))
}

export function itirazEt(gonderiId: string) {
  guncelle((onceki) => ({
    ...onceki,
    gonderiler: onceki.gonderiler.map((g) =>
      g.id === gonderiId ? { ...g, itirazDurumu: 'incelemede' as const } : g
    ),
  }))
}

/* Aynı gönderi için ikinci bir doğrulama başlamasın (StrictMode çift çağrısı dahil). */
const isleniyor = new Set<string>()

export function dogrulamaTetikle(
  gonderiId: string,
  onResult?: (sonuc: DogrulamaSonucu) => void
) {
  if (isleniyor.has(gonderiId)) return
  isleniyor.add(gonderiId)
  const gecikme = Math.random() * 2000 + 1000
  window.setTimeout(() => {
    void dogrulamaCalistir(gonderiId, onResult)
  }, gecikme)
}

/**
 * Doğrulamayı çalıştırır ve biten işi bildirir.
 *
 * Ayrı bir fonksiyon olmasının nedeni sıralama: kopya tespiti, kaynağın
 * `metinParcalari` alanının dolu olmasına bağlıdır. Gönderiler paralel
 * doğrulanırsa kopya, kaynağından önce işlenebilir ve karşılaştıracak
 * parça bulamaz. `hidratla` bu yüzden bekleyenleri eskiden yeniye sıralı
 * çalıştırır ve her birini bekler.
 */
async function dogrulamaCalistir(
  gonderiId: string,
  onResult?: (sonuc: DogrulamaSonucu) => void
): Promise<void> {
  {
    const gonderi = mevcut.veri.gonderiler.find((g) => g.id === gonderiId)
    if (!gonderi) {
      isleniyor.delete(gonderiId)
      return
    }

    let zamanAsimiId: number | undefined
    let cikti: Awaited<ReturnType<typeof dogrula>>

    try {
      const zamanAsimi = new Promise<Awaited<ReturnType<typeof dogrula>>>((resolve) => {
        zamanAsimiId = window.setTimeout(
          () =>
            resolve({
              skor: 0,
              durumu: 'gecemedi',
              gerekce: ['Doğrulama zaman aşımına uğradı ve tamamlanamadı.'],
              metinParcalari: null,
              gorselHash: null,
              kaynakGonderiId: null,
              benzerlikOlcusu: null,
              kopyaTuru: null,
            }),
          DOGRULAMA_ZAMAN_ASIMI_MS
        )
      })

      cikti = await Promise.race([
        dogrula(
          gonderi,
          mevcut.veri.gonderiler,
          hesapYasiGun(mevcut.veri.kullanici.hesapOlusturmaTarihi)
        ),
        zamanAsimi,
      ])
    } catch (err) {
      console.error('[MİHENK] Doğrulama tetiklenirken hata:', err)
      cikti = {
        skor: 0,
        durumu: 'gecemedi',
        gerekce: ['Doğrulama sistem hatası nedeniyle tamamlanamadı.'],
        metinParcalari: null,
        gorselHash: null,
        kaynakGonderiId: null,
        benzerlikOlcusu: null,
        kopyaTuru: null,
      }
    } finally {
      if (zamanAsimiId !== undefined) window.clearTimeout(zamanAsimiId)
    }

    const gerekce = [...cikti.gerekce]
    let kazanilanJeton =
      cikti.durumu === 'gecti' ? TAM_ODUL : cikti.durumu === 'kismi' ? KISMI_ODUL : 0

    /*
      Ödül yalnızca kullanıcının KENDİ gönderisi için cüzdana işlenir.
      Akıştaki diğer yazarların gönderileri de doğrulanır ve rozetlerini
      alır, ama kazançları bu kullanıcının bakiyesine girmez; aksi hâlde
      hakem cüzdanda yazmadığı gönderilerin kayıtlarını görür ve
      "ödül içeriği üretene verilir" iddiası çöker.
    */
    const benimGonderim = gonderi.yazarId === mevcut.veri.kullanici.id

    /*
      Üst sınır, gönderinin paylaşıldığı GÜNÜN kazancına uygulanır;
      geçmiş tarihli gönderiler bugünün bütçesini tüketmez.
    */
    const gunBasi = (t: string) => {
      const d = new Date(t)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    }
    const oGun = gunBasi(gonderi.olusturmaZamani)
    const bugunKazanilan = mevcut.veri.hareketler
      .filter((h) => h.miktar > 0 && h.tur !== 'demo' && gunBasi(h.zaman) === oGun)
      .reduce((t, h) => t + h.miktar, 0)
    const tavan = gunlukTavan(mevcut.veri)
    if (benimGonderim && kazanilanJeton > 0 && bugunKazanilan + kazanilanJeton > tavan) {
      const eklenebilir = Math.max(0, tavan - bugunKazanilan)
      gerekce.push(
        eklenebilir === 0
          ? `Günlük üst sınıra (${tavan}) ulaşıldı, bu gönderi jeton kazanmadı.`
          : `Günlük üst sınıra (${tavan}) ulaşıldı, jetonun bir kısmı verildi.`
      )
      kazanilanJeton = eklenebilir
    }

    guncelle((onceki) => ({
      ...onceki,
      gonderiler: onceki.gonderiler.map((g) =>
        g.id === gonderiId
          ? {
              ...g,
              dogrulamaDurumu: cikti.durumu,
              dogrulamaSkoru: cikti.skor,
              kazanilanJeton,
              gerekce,
              metinParcalari: cikti.metinParcalari,
              gorselHash: cikti.gorselHash,
              kaynakGonderiId: cikti.kaynakGonderiId,
              benzerlikOlcusu: cikti.benzerlikOlcusu,
              kopyaTuru: cikti.kopyaTuru,
            }
          : g
      ),
      /*
        Reddedilen kazanımlar da deftere geçer: sistem yalnızca neyi
        ödüllendirdiğini değil, neden ödüllendirmediğini de kayda geçirir.

        Kaydın zamanı gönderinin paylaşılma zamanıdır, doğrulamanın bittiği
        an değil. Aksi hâlde geçmişe ait bütün gönderiler bugünün kazancı
        sayılır ve günlük üst sınırı tek seferde doldurur.
      */
      hareketler: benimGonderim
        ? [
            yeniHareket(defterAciklamasi(cikti.durumu), kazanilanJeton, gonderi.olusturmaZamani),
            ...onceki.hareketler,
          ]
        : onceki.hareketler,
    }))

    isleniyor.delete(gonderiId)
    onResult?.({ ...cikti, gerekce, kazanilanJeton, gonderiId })
  }
}
