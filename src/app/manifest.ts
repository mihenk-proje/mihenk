import type { MetadataRoute } from 'next'

/*
  Web uygulama bildirimi — MİHENK'in telefona kurulabilmesi için.

  Android/Chrome kurulum ölçütleri: ad, en az 192 ve 512 piksellik simgeler,
  start_url, display standalone/fullscreen ve fetch olayını dinleyen bir
  servis çalışanı (public/sw.js). Beşi birden sağlanmadan "Ana ekrana ekle"
  teklifi çıkmaz.

  background_color, :root'un (koyu tema varsayılan) sayfa rengi. Açılış
  ekranı bu renkle boyanır; simgenin koyu zeminiyle de uyumlu.

  Not: bildirim tek bir renk alıyor, oysa uygulama iki temalı. Sistem açık
  temadaysa açılış ekranı koyu başlayıp aydınlanır — kısa ve kaçınılmaz.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MİHENK — NSosyal Katılım Katmanı',
    short_name: 'MİHENK',
    description:
      'Nitelikli paylaşımı ödüllendiren, kopya ve düşük çabalı içeriği ayıklayan katılım katmanı.',
    lang: 'tr',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f1419',
    theme_color: '#0f1419',
    categories: ['social', 'productivity'],
    icons: [
      { src: '/simge-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/simge-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/simge-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
