"use client"

import { Bot, CheckCircle2, CircleSlash, Copy, MoreHorizontal, Scale } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import {
  AD_RENGI_SINIFLARI,
  CERCEVE_SINIFLARI,
  KENARLIK_SINIFLARI,
  ROZET_SIMGELERI,
  aktifEfekt,
  islevAcikMi,
  yazarEfekti,
} from "@/lib/store/efektler"
import type { Gonderi } from "@/lib/store/types"
import { goreliZaman } from "@/lib/bicim"
import { Avatar } from "./Avatar"
import { EtkilesimSeridi } from "./EtkilesimSeridi"
import { Yuzey } from "./Yuzey"

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
  const kenarlik = benimMi
    ? aktifEfekt(state, 'kenarlik')
    : yazarEfekti(state.magaza, yazar?.kozmetikler, 'kenarlik')
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

  /*
    Mika Merceği (u17) — işlevsel ayrıcalık.

    Normalde akışta gerekçenin yalnızca İLK satırı, o da yalnızca kopya ve
    jeton kazanmayan gönderilerde görünüyor. Bu ürün, kendi gönderilerinde
    gerekçenin TAMAMINI ve skor bandını açıyor.

    Gösterdiği her alan `Gonderi` üzerinde zaten kayıtlı; src/lib/verification/
    hiç çağrılmıyor, doğrulama mantığı el değmeden duruyor.

    <details> KULLANILMIYOR: <summary> odaklanabilir, gönderi başına bir sekme
    durağı eklerdi ve akışın sekme bütçesi zaten dar.
  */
  const ayrintiliRapor =
    benimMi && islevAcikMi(state, 'ayrintili_rapor') && gonderi.dogrulamaDurumu !== 'bekliyor'

  const skorBandi =
    gonderi.dogrulamaSkoru === null || gonderi.dogrulamaSkoru === undefined
      ? null
      : gonderi.dogrulamaSkoru >= 60
        ? 'Doğrulandı bandı (≥ 60)'
        : gonderi.dogrulamaSkoru >= 40
          ? 'Kısmi band (40–59)'
          : 'Kazanmadı bandı (< 40)'

  const mihenkRozetiVar =
    dogrulandi || kopya || gecemedi || gonderi.dogrulamaDurumu === 'bekliyor' ||
    (benimMi && gonderi.itirazDurumu === 'incelemede') ||
    (benimMi && gonderi.kazanilanJeton > 0)

  return (
    <article
      id={`gonderi-${gonderi.id}`}
      /*
        scroll-mt yapışkan yığının yüksekliğine eşit olmalı: üst çubuk h-14
        (56px) + akış sekmeleri h-12 (48px) = 104px. Eksik bırakılırsa
        "Kaynak gönderiyi gör" çapası başlığın altına düşer ve kopya anlatısı
        demo ortasında kırılır.
      */
      className={`bg-card px-4 py-3 scroll-mt-28 ${
        kenarlik ? (KENARLIK_SINIFLARI[kenarlik.efekt.deger] ?? '') : ''
      }`}
    >
      <div className="flex gap-3">
        {/*
          Avatar sütunu. Altındaki dikey çizgi NSosyal'ın iplik çizgisi;
          tamamen dekoratif, ekran okuyucuya duyurulmaz.
        */}
        <div className="flex flex-col items-center shrink-0">
          <Avatar
            id={gonderi.yazarId}
            harfler={harfler}
            ad={adSoyad}
            ton={ton}
            boyut="xl"
            cerceveSinifi={cerceve ? (CERCEVE_SINIFLARI[cerceve.efekt.deger] ?? '') : ''}
          />
          <span className="flex-1 w-px bg-line mt-2" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
              <span
                className={`font-bold truncate ${
                  adRengi ? (AD_RENGI_SINIFLARI[adRengi.efekt.deger] ?? 'text-primary') : 'text-primary'
                }`}
              >
                {adSoyad}
              </span>
              {rozetGorunum && (
                <span
                  /*
                    Bazı rozetler hareket taşır (koleksiyon ödülleri). Hareketi
                    azaltma tercihi globals.css'teki genel blokta zaten
                    kesiliyor; burada ayrıca kontrol gerekmiyor.
                  */
                  className={`${rozetGorunum.sinif} ${rozetGorunum.hareket ?? ''}`}
                  title={rozetGorunum.etiket}
                  aria-label={rozetGorunum.etiket}
                >
                  {rozetGorunum.simge}
                </span>
              )}
              <span className="text-secondary text-sm truncate">@{kullaniciAdi}</span>
              <span className="text-secondary text-sm" aria-hidden="true">·</span>
              <time className="text-secondary text-sm tabular-nums" dateTime={gonderi.olusturmaZamani}>
                {goreliZaman(gonderi.olusturmaZamani)}
              </time>
            </div>
            {/* Gönderi menüsü bu sürümde dekoratif; bkz. EtkilesimSeridi. */}
            <MoreHorizontal size={18} className="text-secondary shrink-0 mt-0.5" aria-hidden="true" />
          </div>

          {/*
            MİHENK YÜZEYİ — iddianın ekrandaki kanıtı.

            Nötr gri/mavi bir NSosyal gönderi kartının içinde, yalnızca
            doğrulama rozetleri pirinç renginde. Renk geçişi CSS değişkeni
            kapsamıyla olur; bu blokta tek bir sınıf bile MİHENK'e özel değil.

            Hiçbir rozet yalnızca renge dayanmaz: her biri kendi ikonunu ve
            metnini taşır, ekran okuyucu için açık bir ad verilir.
          */}
          {mihenkRozetiVar && (
            <Yuzey tur="mihenk" className="flex items-center gap-2 mt-1.5 flex-wrap">
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
                  data-tanitim="rozet"
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
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-secondary/50 text-secondary"
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
            </Yuzey>
          )}

          <p className="text-primary text-[17px] leading-relaxed whitespace-pre-wrap break-words mt-2">
            {gonderi.metin}
          </p>

          {/*
            Kopya ve jeton kazanmayan gönderilerde gerekçe akışta görünür.
            Rozetin yokluğu tespit anlamına gelmediği için, durumun nedeni
            kullanıcıyı suçlamayan bir dille burada yazılır. Gerekçe MİHENK'in
            kararıdır, ev sahibinin değil — bu yüzden MİHENK yüzeyinde durur.
          */}
          {ayrintiliRapor ? (
            <Yuzey
              tur="mihenk"
              className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-3"
            >
              <p className="text-[11px] font-mono text-brand mb-2">
                Mika Merceği · ayrıntılı rapor
              </p>

              <p className="text-[13px] text-primary mb-2">
                MİHENK skoru{' '}
                <span className="font-mono font-bold">{gonderi.dogrulamaSkoru ?? '—'}</span>
                {skorBandi && <span className="text-secondary"> · {skorBandi}</span>}
              </p>

              {gonderi.gerekce.length > 0 ? (
                <ul className="text-[13px] text-secondary flex flex-col gap-1">
                  {gonderi.gerekce.map((satir, i) => (
                    <li key={`${gonderi.id}-gerekce-${i}`} className="pl-3 border-l-2 border-brand/50">
                      {satir}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-secondary pl-3 border-l-2 border-brand/50">
                  Bu gönderi için kayda değer bir uyarı üretilmedi.
                </p>
              )}

              {kopya && kaynakGonderi && (
                <a
                  href={`#gonderi-${kaynakGonderi.id}`}
                  className="inline-block mt-2 text-[13px] text-interaction underline underline-offset-2 hover:text-primary"
                >
                  Kaynak gönderiyi gör
                  {kaynakYazar ? ` (@${kaynakYazar})` : ''}
                </a>
              )}
            </Yuzey>
          ) : (
            (kopya || gecemedi) && anaGerekce && (
              <Yuzey tur="mihenk" className="mt-3">
                <p className="text-secondary text-[13px] pl-3 border-l-2 border-brand/60">
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
              </Yuzey>
            )
          )}

          {gonderi.gorselUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-line max-h-80">
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
            <div className="mt-3 flex flex-col gap-2">
              {gonderi.anketSecenekleri.map((secenek, idx) => (
                <button
                  key={`${gonderi.id}-secenek-${idx}`}
                  type="button"
                  className="w-full text-left px-4 py-2.5 rounded-full border border-line-strong hover:border-brand hover:bg-page transition-colors text-base font-medium text-primary"
                >
                  {secenek}
                </button>
              ))}
            </div>
          )}

          <EtkilesimSeridi gonderi={gonderi} />
        </div>
      </div>
    </article>
  )
}
