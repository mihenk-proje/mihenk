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
import { varsayilanDurum } from './demoData'
import { suresiDoldu } from './efektler'
import type { AppState, DogrulamaSonucu, Gonderi, HareketKaydi, Urun } from './types'

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

function yeniHareket(aciklama: string, miktar: number): HareketKaydi {
  return {
    id: `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    zaman: new Date().toISOString(),
    aciklama,
    miktar,
  }
}

function gecerliDurumMu(veri: unknown): veri is AppState {
  if (typeof veri !== 'object' || veri === null) return false
  const d = veri as Partial<AppState>
  return (
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

/** localStorage'dan bir kez okur. Tekrar çağrılması etkisizdir. */
export function hidratla() {
  if (mevcut.hidre) return

  let veri = varsayilanDurum()
  try {
    const kayitli = localStorage.getItem(DEPO_ANAHTARI)
    if (kayitli) {
      const cozulen: unknown = JSON.parse(kayitli)
      if (gecerliDurumMu(cozulen)) {
        veri = cozulen
      } else {
        console.warn('[MİHENK] Kayıtlı durum beklenen şekilde değil, demo verisine dönülüyor.')
      }
    }
  } catch (err) {
    console.error('[MİHENK] Kayıtlı durum okunamadı:', err)
  }

  mevcut = { veri: senkronizeEt(veri), hidre: true }
  kaydet(mevcut.veri)
  yayinla()

  // Sayfa yenilendiğinde yarım kalmış doğrulamalar sürüncemede kalmasın
  for (const g of mevcut.veri.gonderiler) {
    if (g.dogrulamaDurumu === 'bekliyor') dogrulamaTetikle(g.id)
  }
}

export function resetToDemo() {
  isleniyor.clear()
  guncelle(() => varsayilanDurum())
}

export function gonderiEkle(gonderi: Gonderi) {
  guncelle((onceki) => ({ ...onceki, gonderiler: [gonderi, ...onceki.gonderiler] }))
}

export function urunSatinAl(urun: Urun): boolean {
  if (mevcut.veri.kullanici.jetonBakiyesi < urun.fiyat) return false

  guncelle((onceki) => ({
    ...onceki,
    kullanici: {
      ...onceki.kullanici,
      envanter: [
        ...onceki.kullanici.envanter.filter((s) => s.urunId !== urun.id),
        { urunId: urun.id, satinAlmaZamani: new Date().toISOString(), aktif: true },
      ],
    },
    hareketler: [yeniHareket(`${urun.ad} alındı`, -urun.fiyat), ...onceki.hareketler],
  }))

  return true
}

export function urunAcKapa(urunId: string) {
  guncelle((onceki) => ({
    ...onceki,
    kullanici: {
      ...onceki.kullanici,
      envanter: onceki.kullanici.envanter.map((s) =>
        s.urunId === urunId ? { ...s, aktif: !s.aktif } : s
      ),
    },
  }))
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

  window.setTimeout(async () => {
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
      }
    } finally {
      if (zamanAsimiId !== undefined) window.clearTimeout(zamanAsimiId)
    }

    const gerekce = [...cikti.gerekce]
    let kazanilanJeton =
      cikti.durumu === 'gecti' ? TAM_ODUL : cikti.durumu === 'kismi' ? KISMI_ODUL : 0

    // Üst sınır, ödül verilmeden hemen önceki taze bakiyeye göre uygulanır
    const bugunKazanilan = mevcut.veri.kullanici.bugunKazanilan
    if (kazanilanJeton > 0 && bugunKazanilan + kazanilanJeton > GUNLUK_UST_SINIR) {
      const eklenebilir = Math.max(0, GUNLUK_UST_SINIR - bugunKazanilan)
      gerekce.push(
        eklenebilir === 0
          ? `Günlük üst sınıra (${GUNLUK_UST_SINIR}) ulaşıldı, bu gönderi jeton kazanmadı.`
          : `Günlük üst sınıra (${GUNLUK_UST_SINIR}) ulaşıldı, jetonun bir kısmı verildi.`
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
            }
          : g
      ),
      hareketler:
        kazanilanJeton > 0
          ? [
              yeniHareket(
                `İçerik doğrulandı (${cikti.durumu === 'gecti' ? 'tam' : 'kısmi'})`,
                kazanilanJeton
              ),
              ...onceki.hareketler,
            ]
          : onceki.hareketler,
    }))

    isleniyor.delete(gonderiId)
    onResult?.({ ...cikti, gerekce, kazanilanJeton, gonderiId })
  }, gecikme)
}
