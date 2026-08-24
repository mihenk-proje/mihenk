# MİHENK: NSosyal Katılım Katmanı Prototipi

Bu proje, NSosyal İnovasyon Yarışması kapsamında geliştirilmiş MİHENK katılım sisteminin arayüz prototipidir.

## Proje Hakkında
MİHENK, bağımsız bir sosyal ağ değil, mevcut mikroblog platformu NSosyal üzerine oturan bir "özellik katmanıdır". Temel amacı, kullanıcıların nitelikli paylaşımlarını ödüllendirerek pasif tüketim sarmalını kırmaktır.

- **Yüzey A (Ev Sahibi Platform):** Nötr, metin öncelikli akış ve gönderi ekranları.
- **Yüzey B (MİHENK):** Kendi görsel kimliğini (bazalt taş, pirinç çizgi, mono sayılar) taşıyan ödül sistemi ekranları (Cüzdan, Mağaza, İtiraz).

## Teknik Yapı
- **Framework:** Next.js 14+ (App Router), React, TypeScript
- **Stil:** Tailwind CSS v4, CSS Variables
- **Doğrulama:** `lib/verification/` altında saf JS ile metin n-gram, Jaccard benzerliği ve görsel dHash algoritmaları çalışmaktadır.
- **Veri:** Herhangi bir veritabanı yoktur. State ve kalıcılık `localStorage` üzerinden sağlanır.

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## Vercel Deployment
Bu proje Vercel üzerine sıfır konfigürasyon ile dağıtılabilir:
1. GitHub reponuzu Vercel'e bağlayın.
2. `npm run build` komutunu yapılandırmadan deploy edin.

## Erişilebilirlik (A11y)
Prototip WCAG 2.1 AA standartlarına uygun geliştirilmiştir:
- Doğrulama sonuçları ve bildirimler `aria-live` ile duyurulur.
- Klavye odaklanabilirliği için uygun `tabindex` ve `outline` stilleri korunmuştur.
- Hareketi azaltma tercihlerine (prefers-reduced-motion) uygundur.
