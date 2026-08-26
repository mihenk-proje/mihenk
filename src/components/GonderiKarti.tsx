"use client"

import { BarChart2, Bot, CheckCircle2, CircleSlash, Copy, MessageCircle, Repeat2, Rocket, Scale } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import {
  AD_RENGI_SINIFLARI,
  CERCEVE_SINIFLARI,
  ROZET_SIMGELERI,
  aktifEfekt,
  yazarEfekti,
} from "@/lib/store/efektler"
import type { Gonderi } from "@/lib/store/types"
import { Avatar } from "./Avatar"

function goreliZaman(dateStr: string) {
  const tarih = new Date(dateStr)
  const saniye = Math.floor((Date.now() - tarih.getTime()) / 1000)
  const dakika = Math.floor(saniye / 60)
  const saat = Math.floor(dakika / 60)
  const gun = Math.floor(saat / 24)

  if (gun >= 7) return tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  if (gun > 0) return `${gun} g`
  if (saat > 0) return `${saat} sa`
  if (dakika > 0) return `${dakika} dk`
  return `${Math.max(1, saniye)} sn`
}

function sayiBicimle(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')} B`
  return String(n)
}

/**
 * WCAG 2.5.3 (Label in Name): erisilebilir ad, butonun gorunur metnini
 * birebir icermeli. Sayaclar kisaltilarak gosterildigi icin (2100 -> "2,1 B")
 * etiket ham sayiyi degil gorunen metni tasir.
 */
function etkilesimEtiketi(fiil: string, sayi: number) {
  const gorunen = sayi > 0 ? sayiBicimle(sayi) : ''
  return { gorunen, etiket: gorunen ? `${fiil}: ${gorunen}` : fiil }
}

export function GonderiKarti({ gonderi }: { gonderi: Gonderi }) {
  const { state } = useStore()

  const benimMi = gonderi.yazarId === state.kullanici.id
  const yazar = state.yazarlar.find((y) => y.id === gonderi.yazarId)

  const adSoyad = benimMi ? state.kullanici.adSoyad : (yazar?.adSoyad ?? 'Silinmiş hesap')
  const kullaniciAdi = benimMi ? state.kullanici.kullaniciAdi : (yazar?.kullaniciAdi ?? 'bilinmiyor')
  const harfler = benimMi ? state.kullanici.avatarHarfleri : (yazar?.avatarHarfleri ?? '?')
  const ton = benimMi ? state.kullanici.avatarTonu : yazar?.avatarTonu

  /*
    Kozmetikler her yazar için çözülür. Kullanıcının kendi kozmetikleri
    envanterinden gelir ve süre takibine tabidir; akıştaki diğer yazarlarınki
    demo verisindeki ürün kimliklerinden. İkisi de aynı mağaza kataloğuna
    bakar, böylece akışta görülen her kozmetik mağazada bulunabilir.
  */
  const cerceve = benimMi
    ? aktifEfekt(state, 'cerceve')
    : yazarEfekti(state.magaza, yazar?.kozmetikler, 'cerceve')
  const adRengi = benimMi
    ? aktifEfekt(state, 'adRengi')
    : yazarEfekti(state.magaza, yazar?.kozmetikler, 'adRengi')
  const rozet = benimMi
    ? aktifEfekt(state, 'rozet')
    : yazarEfekti(state.magaza, yazar?.kozmetikler, 'rozet')
  const rozetGorunum = rozet ? ROZET_SIMGELERI[rozet.efekt.deger] : undefined

  const dogrulandi = gonderi.dogrulamaDurumu === 'gecti' || gonderi.dogrulamaDurumu === 'kismi'
  const kopya = gonderi.dogrulamaDurumu === 'kopya'
  const gecemedi = gonderi.dogrulamaDurumu === 'gecemedi'

  // Kopya tespitinde örtüşülen gönderinin yazarı, kaynak bağlantısında gösterilir
  const kaynakGonderi = gonderi.kaynakGonderiId
    ? state.gonderiler.find((g) => g.id === gonderi.kaynakGonderiId)
    : undefined
  const kaynakYazar = kaynakGonderi
    ? kaynakGonderi.yazarId === state.kullanici.id
      ? state.kullanici.kullaniciAdi
      : state.yazarlar.find((y) => y.id === kaynakGonderi.yazarId)?.kullaniciAdi
    : undefined

  // Akışta gerekçenin ilk satırı gösterilir; tamamı doğrulama panelinde
  const anaGerekce = gonderi.gerekce[0]

  return (
    <article
      id={`gonderi-${gonderi.id}`}
      className="border-b border-line p-4 hover:bg-card/40 transition-colors scroll-mt-32"
    >
      <div className="flex gap-3">
        <Avatar
          id={gonderi.yazarId}
          harfler={harfler}
          ad={adSoyad}
          ton={ton}
          cerceveSinifi={cerceve ? (CERCEVE_SINIFLARI[cerceve.efekt.deger] ?? '') : ''}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`font-bold truncate ${
                adRengi ? (AD_RENGI_SINIFLARI[adRengi.efekt.deger] ?? 'text-primary') : 'text-primary'
              }`}
            >
              {adSoyad}
            </span>
            {rozetGorunum && (
              <span className={rozetGorunum.sinif} title={rozetGorunum.etiket} aria-label={rozetGorunum.etiket}>
                {rozetGorunum.simge}
              </span>
            )}
            <span className="text-secondary text-sm">@{kullaniciAdi}</span>
            <span className="text-secondary text-sm" aria-hidden="true">·</span>
            <time className="text-secondary text-sm" dateTime={gonderi.olusturmaZamani}>
              {goreliZaman(gonderi.olusturmaZamani)}
            </time>
          </div>

          {/*
            Etiketler: YZ beyanı ve MİHENK doğrulama durumu.
            Hiçbiri yalnızca renge dayanmaz; her rozet kendi ikonunu ve
            metnini taşır, ekran okuyucu için de açık bir ad verilir.
          */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {gonderi.yzBeyani && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-secondary border border-line"
                role="img"
                aria-label="Yapay zekâ destekli içerik"
                title="Yapay zekâ destekli içerik"
              >
                <Bot size={12} aria-hidden="true" />
                <span aria-hidden="true">YZ destekli</span>
              </span>
            )}

            {dogrulandi && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-success/40 text-success"
                role="img"
                aria-label={`${
                  gonderi.dogrulamaDurumu === 'gecti'
                    ? 'Doğrulama geçti'
                    : 'Doğrulama kısmen geçti'
                }, MİHENK skoru ${gonderi.dogrulamaSkoru ?? 'bilinmiyor'}`}
                title={`MİHENK skoru: ${gonderi.dogrulamaSkoru ?? '-'}`}
              >
                <CheckCircle2 size={12} aria-hidden="true" />
                <span aria-hidden="true">
                  {gonderi.dogrulamaDurumu === 'gecti' ? 'Doğrulandı' : 'Kısmen doğrulandı'}
                </span>
              </span>
            )}

            {kopya && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-error/50 text-error"
                role="img"
                aria-label={`Kopya tespit edildi${
                  gonderi.kopyaTuru === 'gorsel' ? ', görsel eşleşmesi' : ', metin örtüşmesi'
                }`}
              >
                <Copy size={12} aria-hidden="true" />
                <span aria-hidden="true">Kopya tespit edildi</span>
              </span>
            )}

            {gecemedi && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-line-strong text-secondary"
                role="img"
                aria-label="Bu gönderi jeton kazanmadı"
              >
                <CircleSlash size={12} aria-hidden="true" />
                <span aria-hidden="true">Jeton kazanmadı</span>
              </span>
            )}

            {gonderi.dogrulamaDurumu === 'bekliyor' && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-brand/40 text-brand"
                aria-live="polite"
              >
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" aria-hidden="true" />
                <span>Doğrulanıyor…</span>
              </span>
            )}

            {benimMi && gonderi.itirazDurumu === 'incelemede' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-interaction/40 text-interaction">
                <Scale size={12} aria-hidden="true" /> İtiraz incelemede
              </span>
            )}

            {benimMi && gonderi.kazanilanJeton > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded border border-brand/40 text-brand">
                +{gonderi.kazanilanJeton} jeton
              </span>
            )}
          </div>

          <p className="text-primary text-[15px] whitespace-pre-wrap break-words mb-3">
            {gonderi.metin}
          </p>

          {/*
            Kopya ve jeton kazanmayan gönderilerde gerekçe akışta görünür.
            Rozetin yokluğu tespit anlamına gelmediği için, durumun nedeni
            kullanıcıyı suçlamayan bir dille burada yazılır.
          */}
          {(kopya || gecemedi) && anaGerekce && (
            <p className="text-secondary text-[13px] mb-3 pl-3 border-l-2 border-line-strong">
              {anaGerekce}
              {kopya && kaynakGonderi && (
                <>
                  {' '}
                  <a
                    href={`#gonderi-${kaynakGonderi.id}`}
                    className="text-interaction underline underline-offset-2 hover:text-primary"
                  >
                    Kaynak gönderiyi gör
                    {kaynakYazar ? ` (@${kaynakYazar})` : ''}
                  </a>
                </>
              )}
            </p>
          )}

          {gonderi.gorselUrl && (
            <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-line max-h-80">
              {/*
                next/image kullanılmıyor: bu görseller kullanıcının seçtiği yerel
                dosyadan üretilen data: URL'leri olabiliyor ve boyutları önceden
                bilinmiyor. Optimizasyon katmanı bu kaynakları işleyemez.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gonderi.gorselUrl}
                alt="Gönderiye eklenen görsel"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {gonderi.anketSecenekleri && gonderi.anketSecenekleri.length > 0 && (
            <div className="mt-2 mb-3 flex flex-col gap-2">
              {gonderi.anketSecenekleri.map((secenek, idx) => (
                <button
                  key={`${gonderi.id}-secenek-${idx}`}
                  type="button"
                  className="w-full text-left px-4 py-2 rounded-lg border border-line hover:border-brand/50 hover:bg-card transition-colors text-sm font-medium text-primary"
                >
                  {secenek}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-secondary mt-1 max-w-md">
            {(
              [
                { anahtar: 'yorum', fiil: 'Yorum yap', sayi: gonderi.yorumSayisi, Simge: MessageCircle, renk: 'hover:text-interaction', zemin: 'group-hover:bg-interaction/10' },
                { anahtar: 'paylas', fiil: 'Yeniden paylaş', sayi: gonderi.yenidenPaylasimSayisi, Simge: Repeat2, renk: 'hover:text-success', zemin: 'group-hover:bg-success/10' },
                { anahtar: 'roket', fiil: 'Roketle', sayi: gonderi.roketSayisi, Simge: Rocket, renk: 'hover:text-brand', zemin: 'group-hover:bg-brand/10' },
                { anahtar: 'izlenim', fiil: 'Görüntülenme', sayi: gonderi.izlenimSayisi, Simge: BarChart2, renk: 'hover:text-interaction', zemin: 'group-hover:bg-interaction/10' },
              ] as const
            ).map(({ anahtar, fiil, sayi, Simge, renk, zemin }) => {
              const { gorunen, etiket } = etkilesimEtiketi(fiil, sayi)
              return (
                <button
                  key={anahtar}
                  type="button"
                  className={`flex items-center gap-1.5 ${renk} transition-colors group`}
                  aria-label={etiket}
                >
                  <span className={`p-1.5 rounded-full ${zemin}`}>
                    <Simge size={18} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-mono">{gorunen}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </article>
  )
}
