/*
  MİHENK servis çalışanı.

  İki işi var:
    1. Kurulabilirlik — Chrome, fetch olayını dinleyen bir servis çalışanı
       görmeden "Ana ekrana ekle" teklifi çıkarmıyor.
    2. Çevrimdışı çalışma — uygulamanın tüm durumu localStorage'da; kabuk
       önbellekteyse ağ olmadan da tam çalışır. Sunum salonunda internet
       koparsa demo devam eder.

  STRATEJİ İKİ BAŞLI, bilerek:

    • Belgeler (HTML) → önce ağ, olmazsa önbellek.
      Tersi olsaydı yeni dağıtımdan sonra eski sayfa servis edilir ve
      "güncelledim ama değişmemiş" durumu doğardı.

    • /_next/static/ → önce önbellek.
      Next bu dosyaları içeriğe göre karma ile adlandırıyor; adı aynıysa
      içeriği de aynıdır, bayatlama riski yok.

  Diğer her şey ağdan geçer ve önbelleğe girmez.
*/
const SURUM = 'mihenk-v1'
const KABUK = ['/', '/simge-192.png', '/simge-512.png']

self.addEventListener('install', (olay) => {
  olay.waitUntil(
    caches
      .open(SURUM)
      .then((onbellek) => onbellek.addAll(KABUK))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (olay) => {
  olay.waitUntil(
    caches
      .keys()
      .then((adlar) => Promise.all(adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (olay) => {
  const istek = olay.request
  if (istek.method !== 'GET') return

  const adres = new URL(istek.url)
  if (adres.origin !== self.location.origin) return

  // Karma adlı statik varlıklar: önce önbellek
  if (adres.pathname.startsWith('/_next/static/')) {
    olay.respondWith(
      caches.match(istek).then(
        (bulunan) =>
          bulunan ??
          fetch(istek).then((yanit) => {
            const kopya = yanit.clone()
            caches.open(SURUM).then((o) => o.put(istek, kopya))
            return yanit
          })
      )
    )
    return
  }

  // Belgeler: önce ağ, çevrimdışıysa önbellekten
  if (istek.mode === 'navigate') {
    olay.respondWith(
      fetch(istek)
        .then((yanit) => {
          const kopya = yanit.clone()
          caches.open(SURUM).then((o) => o.put('/', kopya))
          return yanit
        })
        .catch(() => caches.match('/').then((bulunan) => bulunan ?? Response.error()))
    )
  }
})
