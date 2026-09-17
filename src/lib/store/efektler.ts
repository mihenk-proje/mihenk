import type { AppState, EfektTuru, SahipOlunanUrun, Urun } from './types'

/**
 * Bir envanter kaydının süresi dolmuş mu?
 * sureGun null ise ürün kalıcıdır ve hiç dolmaz.
 */
export function suresiDoldu(urun: Urun | undefined, sahip: SahipOlunanUrun): boolean {
  if (!urun || urun.sureGun === null) return false
  const bitis = new Date(sahip.satinAlmaZamani).getTime() + urun.sureGun * 86_400_000
  return Date.now() > bitis
}

export function kalanSure(urun: Urun | undefined, sahip: SahipOlunanUrun): string | null {
  if (!urun || urun.sureGun === null) return null
  const kalanMs = new Date(sahip.satinAlmaZamani).getTime() + urun.sureGun * 86_400_000 - Date.now()
  if (kalanMs <= 0) return 'Süresi doldu'
  const saat = Math.floor(kalanMs / 3_600_000)
  if (saat < 24) return `${Math.max(1, saat)} saat kaldı`
  return `${Math.floor(saat / 24)} gün kaldı`
}

/** Yürürlükteki kayıtlar — ürünüyle birlikte, satın alma zamanı korunarak */
export function yururluktekiKayitlar(
  state: AppState
): Array<{ urun: Urun; sahip: SahipOlunanUrun }> {
  return state.kullanici.envanter
    .map((sahip) => ({ sahip, urun: state.magaza.find((u) => u.id === sahip.urunId) }))
    .filter(({ sahip, urun }) => Boolean(urun) && sahip.aktif && !suresiDoldu(urun, sahip))
    .map(({ sahip, urun }) => ({ sahip, urun: urun as Urun }))
}

/** Kullanıcının o an yürürlükte olan ürünleri (satın alınmış + açık + süresi dolmamış) */
export function yururluktekiUrunler(state: AppState): Urun[] {
  return yururluktekiKayitlar(state).map((k) => k.urun)
}

/**
 * Aynı anda yalnızca bir ürün takılabilen efekt türleri.
 *
 * `islev` bilerek DIŞARIDA: Geniş Karakter ile Geniş Anket aynı anda açık
 * olabilmeli. Onlar süs değil, yetenek.
 */
export const TEK_SLOT: readonly EfektTuru[] = ['cerceve', 'adRengi', 'rozet', 'tema', 'kenarlik']

/**
 * Bir türün yürürlükteki ürünü.
 *
 * Eskiden diziden SONUNCUYU alıyordu — yani satın alma sırasını. Sonuç:
 * süresi dolmuş 15 jetonluk çerçeveyi yeniden almak, onu dizinin sonuna
 * taşıyıp 800 jetonluk çerçeveyi görünmez kılıyordu. Üstelik cüzdan ikisini
 * de yeşil "Açık" gösteriyordu.
 *
 * Artık FİYATA göre seçiyor: kullanıcı daha çok ödediği şeyi görmeyi bekler.
 * Eşitlikte en yeni satın alma, sonra id — sıralama her koşulda belirli.
 *
 * Bu ikinci savunma hattı: `tekSlotUygula` zaten yazma anında aynı türden
 * ikinci bir ürünün açık kalmasını engelliyor. Ama kayıtlı eski durumlarda
 * iki ürün birden açık olabilir ve orada da belirli bir sonuç gerekiyor.
 */
export function aktifEfekt(state: AppState, tur: EfektTuru): Urun | undefined {
  const eslesenler = yururluktekiKayitlar(state).filter((k) => k.urun.efekt.tur === tur)
  if (eslesenler.length === 0) return undefined

  return [...eslesenler].sort((a, b) => {
    if (b.urun.fiyat !== a.urun.fiyat) return b.urun.fiyat - a.urun.fiyat
    const fark =
      new Date(b.sahip.satinAlmaZamani).getTime() - new Date(a.sahip.satinAlmaZamani).getTime()
    if (fark !== 0) return fark
    return a.urun.id.localeCompare(b.urun.id)
  })[0].urun
}

/**
 * Bir ürün açılırken aynı türdeki diğerlerini kapatır.
 *
 * Saf fonksiyon: depoya erişmez, envanter dizisini alır ve yenisini döndürür.
 *
 * "Birden fazla açık kalsın, kazananı kural seçsin" yetmezdi: cüzdanda iki
 * çerçeveyi birden yeşil "Açık" gösteren arayüz kullanıcıya yalan söylüyor ve
 * hangi yalan olduğunu seçmek düzeltme değil. Tek slot, kullanıcının zihnindeki
 * modelle örtüşüyor — bir seferde bir çerçeve takarsın.
 */
export function tekSlotUygula(
  envanter: SahipOlunanUrun[],
  magaza: Urun[],
  acilanUrunId: string
): SahipOlunanUrun[] {
  const acilan = magaza.find((u) => u.id === acilanUrunId)
  if (!acilan || !TEK_SLOT.includes(acilan.efekt.tur)) return envanter

  return envanter.map((sahip) => {
    if (sahip.urunId === acilanUrunId) return { ...sahip, aktif: true }
    const urun = magaza.find((u) => u.id === sahip.urunId)
    if (urun?.efekt.tur === acilan.efekt.tur) return { ...sahip, aktif: false }
    return sahip
  })
}

/**
 * Akıştaki diğer yazarların kozmetiklerini çözer.
 *
 * Kullanıcının kendi kozmetikleri envanterden gelir ve süre takibine tabidir;
 * diğer yazarlarınki demo verisinde sabit ürün kimlikleri olarak durur. İkisi
 * de aynı mağaza kataloğuna bakar, böylece hakem akışta gördüğü her kozmetiği
 * mağazada bulabilir.
 */
export function yazarEfekti(
  magaza: Urun[],
  kozmetikler: string[] | undefined,
  tur: EfektTuru
): Urun | undefined {
  if (!kozmetikler?.length) return undefined
  return magaza.find((u) => kozmetikler.includes(u.id) && u.efekt.tur === tur)
}

export function islevAcikMi(state: AppState, deger: string): boolean {
  return yururluktekiUrunler(state).some((u) => u.efekt.tur === 'islev' && u.efekt.deger === deger)
}

/*
  Tailwind sınıf adları derleme sırasında taranır; bu yüzden dinamik
  birleştirme yerine sabit eşleme tabloları kullanılır.

  Renkler doğrudan yazılmaz, globals.css'teki kozmetik değişkenlerinden gelir:
  aynı ürün koyu ve açık temada farklı bir tona ihtiyaç duyar. Ürün renkleri
  koyu zemine göre seçilmişti ve açık temada kontrast eşiğini kaçırıyorlardı.
*/

export const CERCEVE_SINIFLARI: Record<string, string> = {
  pirinc: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-pirinc)]',
  tunc: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-tunc)]',
  ametist: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-ametist)]',
  altin: 'ring-2 ring-offset-2 ring-offset-page ring-[var(--kozmetik-altin)]',
}

export const AD_RENGI_SINIFLARI: Record<string, string> = {
  mika: 'text-[var(--kozmetik-mika)]',
  /*
    Tunç bugüne kadar yalnızca halka rengiydi; METİN yeni bir bağlam ve
    ölçüldü: ev sahibi kartı 5,31 · MİHENK kartı 4,98 · ev sahibi sayfası
    5,98 (koyu) — açıkta 6,81 / 6,81 / 6,12. Altısı da AA.
  */
  tunc: 'text-[var(--kozmetik-tunc)]',
}

/*
  Gönderi kartının sol kenarındaki renkli şerit.

  Tamamen dekoratif: tek başına hiçbir durum taşımıyor, bu yüzden WCAG 1.4.11'in
  3:1 eşiği bağlamıyor (bağlasaydı ölçülmesi gerekirdi). Rengi taşıdığı bilgi
  yok — doğrulama durumu rozetlerle, gerekçesi metinle anlatılıyor.

  Odaklanabilir öğe eklemiyor: akışın sekme bütçesi zaten dar.
*/
export const KENARLIK_SINIFLARI: Record<string, string> = {
  pirinc: 'border-l-2 border-[var(--kozmetik-pirinc)]',
  tunc: 'border-l-2 border-[var(--kozmetik-tunc)]',
  kuvars: 'border-l-2 border-[var(--kozmetik-kuvars)]',
  altin: 'border-l-2 border-[var(--kozmetik-altin)]',
}

export const ROZET_SIMGELERI: Record<string, { simge: string; sinif: string; etiket: string }> = {
  kuvars: { simge: '◆', sinif: 'text-[var(--kozmetik-kuvars)]', etiket: 'Kuvars rozeti' },
  gumus: { simge: '❖', sinif: 'text-[var(--kozmetik-gumus)]', etiket: 'Gümüş nişan' },
  kulce: { simge: '▰', sinif: 'text-[var(--kozmetik-kulce)]', etiket: 'Külçe nişanı' },
  ayar: { simge: '✦', sinif: 'text-[var(--kozmetik-ayar)]', etiket: 'Ayar rozeti' },
}

/*
  Tema ürünleri profil kapak bandını boyar.

  Eskiden ham hex ve alfa yıkamasıydı (`bg-[#d9d4c7]/10`) ve tema ayrımı
  yoktu — yukarıdaki kuralın tam olarak yasakladığı şey. Koyu sayfada mermer
  görünmüyordu; 1000 jetonluk kalıcı bir ürün hiçbir şey yapmıyordu.

  Bandın üzerinde metin YOK. Bu bilinçli: metin olsaydı her tema × her tema
  için kontrast ölçümü gerekirdi. Bant yalnızca sayfadan ayırt edilebilmeli
  ve bu ölçüldü (ΔE76: koyu 14,7–75,9 · açık 10,9–19,1).
*/
export const TEMA_SINIFLARI: Record<string, string> = {
  somaki: 'bg-[var(--kozmetik-tema-somaki)]',
  bazalt: 'bg-[var(--kozmetik-tema-bazalt)]',
  mermer: 'bg-[var(--kozmetik-tema-mermer)]',
  pirinc: 'bg-[var(--kozmetik-tema-pirinc)]',
  ametist: 'bg-[var(--kozmetik-tema-ametist)]',
}

/*
  Avatar zemin renkleri.

  FOTOĞRAF AVATAR KULLANILMIYOR. Değerlendirildi ve reddedildi:
    1. Rıza — gerçek kişi fotoğrafları kurgusal hesaplara atfedilemez.
    2. Tez çelişkisi — yapay zekâyla üretilmiş yüzler kullanmak, tüm iddiası
       içeriğin özgünlüğünü denetlemek olan bir projede savunulamaz.
    3. Ürün görünürlüğü — kozmetik katalog çerçeve, rozet ve kenar
       vurgusundan oluşuyor; fotoğraf avatar çerçeveyi görsel olarak yutar.
  Ayrıntı: docs/avatar-karari.md

  Renkler ölçülerek seçildi. Üç kısıtı birden karşılamaları gerekiyordu:
  beyaz baş harflerle ≥ 4,5 (metin okunabilirliği), koyu sayfa zemininde
  ≥ 3 ve açık sayfa zemininde ≥ 3 (dairenin şekil olarak seçilebilmesi).
  Bu, parlaklığı dar bir banda hapsediyor; altı ton o bant içinde farklı
  hue'lara yerleştirildi.

  On ton, hepsi bu bant icinde: beyaz metin 5,05 · koyu zemin 3,55 ·
  acik zemin 4,40.
*/
export const AVATAR_TONLARI = {
  deniz: 'bg-[#327886]',
  mor: 'bg-[#9254b6]',
  zeytin: 'bg-[#517934]',
  kiremit: 'bg-[#bc4a24]',
  lacivert: 'bg-[#526dad]',
  toprak: 'bg-[#95642d]',
  erguvan: 'bg-[#c62f87]',
  camyesili: 'bg-[#1c7d5a]',
  tugla: 'bg-[#cf3046]',
  cinko: 'bg-[#2674ab]',
} as const

export type AvatarTonu = keyof typeof AVATAR_TONLARI

const TON_LISTESI = Object.values(AVATAR_TONLARI)

/**
 * Avatar zemin sınıfı.
 *
 * `ton` verilmişse o kullanılır; demo yazarlarına birbirinden ayrık tonlar
 * elle atanır çünkü karma, yedi kullanıcıda bile çakışabiliyor (on renkli
 * palette Kaan ile Elif aynı kovaya düşüyordu) ve hakem kullanıcıları
 * ayırt edemez.
 *
 * Ton verilmemişse kullanıcı adından FNV-1a ile türetilir: aynı kullanıcı
 * her yüklemede aynı rengi alır, rastgelelik yoktur.
 */
export function avatarRengi(anahtar: string, ton?: AvatarTonu): string {
  if (ton && ton in AVATAR_TONLARI) return AVATAR_TONLARI[ton]
  let h = 0x811c9dc5
  for (let i = 0; i < anahtar.length; i++) {
    h ^= anahtar.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return TON_LISTESI[h % TON_LISTESI.length]
}
