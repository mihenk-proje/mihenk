"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Smile } from "lucide-react"
import { useStore } from "@/lib/store/kanca"
import {
  CIKARTMA_YOLLARI,
  SOHBET_ZEMINI_SINIFLARI,
  aktifEfekt,
  kullanilabilirCikartmalar,
} from "@/lib/store/efektler"
import { goreliZaman } from "@/lib/bicim"
import type { Mesaj, Yazar } from "@/lib/store/types"
import { Avatar } from "./Avatar"
import { KatmanEkran } from "./KatmanEkran"

/**
 * Mesajlar — sohbet listesi ve tek sohbet, aynı bileşende.
 *
 * Neden tek bileşen: iki ayrı KatmanEkran üst üste açılsaydı iki useKatman
 * ve iki belge düzeyi Escape dinleyicisi birden çalışırdı. Burada her an tek
 * kabuk var; geri düğmesi sohbetteyken listeye, listedeyken akışa döner.
 *
 * KARŞI TARAF YANIT YAZMAZ. Bu bir prototip. Sahte bir sohbet arkadaşı
 * uydurmak, sohbeti canlı göstermek adına kullanıcıya yalan söylemek olurdu;
 * ekran bunu açıkça yazıyor. Tohum sohbetler kozmetiklerin görünebileceği bir
 * sahne sağlıyor — sohbet zemini ve çıkartmalar burada satın alındığı gibi
 * görünüyor.
 *
 * Ev sahibi yüzeyi: sohbet NSosyal'ın işi, MİHENK'in değil. Pirinç yalnızca
 * satın alınan kozmetiklerde.
 */
export function Mesajlar({ onBack }: { onBack: () => void }) {
  const { state } = useStore()
  const [acikSohbet, setAcikSohbet] = useState<string | null>(null)

  const mesajlar = state.mesajlar ?? []
  const karsiTaraf = acikSohbet ? state.yazarlar.find((y) => y.id === acikSohbet) : null

  if (acikSohbet && karsiTaraf) {
    return (
      <Sohbet
        yazar={karsiTaraf}
        mesajlar={mesajlar.filter((m) => m.sohbetId === acikSohbet)}
        onBack={() => setAcikSohbet(null)}
      />
    )
  }

  /* Her sohbetin son mesajı; en yeni sohbet üstte */
  const sohbetler = state.yazarlar
    .map((yazar) => {
      const son = mesajlar.filter((m) => m.sohbetId === yazar.id).at(-1)
      return son ? { yazar, son } : null
    })
    .filter((s): s is { yazar: Yazar; son: Mesaj } => s !== null)
    .sort((a, b) => Date.parse(b.son.zaman) - Date.parse(a.son.zaman))

  return (
    <KatmanEkran baslik="Mesajlar" onBack={onBack}>
      <p className="text-secondary text-sm mb-4">
        Bu bir prototip: mesajlar yalnızca bu cihazda saklanır, karşı taraf yanıt yazmaz.
      </p>

      {sohbetler.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-6 text-center">
          <p className="text-primary font-medium">Henüz sohbet yok</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sohbetler.map(({ yazar, son }) => (
            <li key={yazar.id}>
              <button
                type="button"
                onClick={() => setAcikSohbet(yazar.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-line bg-card hover:border-line-strong transition-colors text-left"
              >
                <Avatar
                  id={yazar.id}
                  harfler={yazar.avatarHarfleri}
                  ad={yazar.adSoyad}
                  ton={yazar.avatarTonu}
                  boyut="md"
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-primary truncate">{yazar.adSoyad}</span>
                  <span className="block text-secondary text-sm truncate">
                    {son.gonderen === 'ben' ? 'Sen: ' : ''}
                    {son.metin ?? 'Çıkartma'}
                  </span>
                </span>
                <time className="text-secondary text-xs shrink-0 tabular-nums" dateTime={son.zaman}>
                  {goreliZaman(son.zaman)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </KatmanEkran>
  )
}

function Sohbet({
  yazar,
  mesajlar,
  onBack,
}: {
  yazar: Yazar
  mesajlar: Mesaj[]
  onBack: () => void
}) {
  const { state, mesajGonder } = useStore()
  const [metin, setMetin] = useState('')
  const [tepsiAcik, setTepsiAcik] = useState(false)
  const sonRef = useRef<HTMLDivElement>(null)

  /*
    SOHBET ZEMİNİ — satın alınan kozmetiğin tek render noktası.
    Baloncuklar opak kart olduğu için zemin rengi metnin arkasına düşmüyor;
    yeni bir kontrast çifti doğmuyor.
  */
  const zemin = aktifEfekt(state, 'sohbetZemini')
  const zeminSinifi = zemin ? (SOHBET_ZEMINI_SINIFLARI[zemin.efekt.deger] ?? '') : 'bg-page'

  const cikartmalar = kullanilabilirCikartmalar(state)

  useEffect(() => {
    sonRef.current?.scrollIntoView({ block: 'end' })
  }, [mesajlar.length])

  const gonder = () => {
    if (!metin.trim()) return
    mesajGonder(yazar.id, { metin })
    setMetin('')
  }

  return (
    <KatmanEkran baslik={yazar.adSoyad} onBack={onBack}>
      {/*
        Zemin kabuğun dolgusunu aşar ve ekranın altına kadar iner; alt dolgu,
        sabitlenmiş yazma çubuğu + alt gezinti kadar. İlk sürümde çubuk
        kaydırma alanının dibindeydi ve ilk açılışta hiç görünmüyordu.
      */}
      <div
        className={`-mx-4 -mt-5 -mb-[calc(5.5rem+env(safe-area-inset-bottom))] min-h-[calc(100dvh-3.5rem)] flex flex-col pb-[calc(8rem+env(safe-area-inset-bottom))] ${zeminSinifi}`}
      >
        <p className="text-secondary text-xs text-center px-6 pt-4 pb-2">
          @{yazar.kullaniciAdi} · prototip, karşı taraf yanıt yazmaz
        </p>

        <ol className="flex-1 flex flex-col gap-2 px-4 py-3">
          {mesajlar.map((m) => {
            const benim = m.gonderen === 'ben'
            return (
              <li
                key={m.id}
                className={`flex flex-col max-w-[78%] ${benim ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {m.cikartma ? (
                  <Cikartma anahtar={m.cikartma} />
                ) : (
                  <p
                    className={`rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
                      benim
                        ? 'bg-brand text-brand-ink rounded-br-md'
                        : 'bg-card text-primary border border-line rounded-bl-md'
                    }`}
                  >
                    {m.metin}
                  </p>
                )}
                <time className="text-[11px] text-secondary mt-1 tabular-nums" dateTime={m.zaman}>
                  {goreliZaman(m.zaman)}
                </time>
              </li>
            )
          })}
          <div ref={sonRef} aria-hidden="true" />
        </ol>

        {tepsiAcik && (
          <div
            className="fixed left-0 right-0 z-[41] px-4 pb-2"
            style={{ bottom: 'calc(7.25rem + env(safe-area-inset-bottom))' }}
            role="group"
            aria-label="Çıkartmalar"
          >
            {cikartmalar.length === 0 ? (
              <p className="text-secondary text-xs rounded-xl border border-line bg-card p-3">
                Çıkartma paketin yok. Mağaza → Süreli sekmesinde Kuvars Çıkartmaları var.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-card p-2">
                {cikartmalar.map((anahtar) => (
                  <button
                    key={anahtar}
                    type="button"
                    onClick={() => {
                      mesajGonder(yazar.id, { cikartma: anahtar })
                      setTepsiAcik(false)
                    }}
                    className="w-12 h-12 rounded-lg hover:bg-page flex items-center justify-center"
                    aria-label={`${anahtar.split('-')[0]} çıkartması ${Number(anahtar.split('-')[1]) + 1}`}
                  >
                    <Cikartma anahtar={anahtar} kucuk />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="fixed left-0 right-0 z-[41] bg-card border-t border-line"
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto w-full max-w-lg px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTepsiAcik((a) => !a)}
            aria-pressed={tepsiAcik}
            aria-label="Çıkartma tepsisi"
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-secondary hover:bg-page"
          >
            <Smile size={22} aria-hidden="true" />
          </button>
          <label htmlFor="sohbet-metni" className="sr-only">
            Mesaj metni
          </label>
          <input
            id="sohbet-metni"
            type="text"
            value={metin}
            onChange={(e) => setMetin(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') gonder()
            }}
            placeholder="Bir mesaj yazın…"
            className="flex-1 min-w-0 h-11 rounded-full bg-page border border-line px-4 text-base text-primary placeholder:text-secondary outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={gonder}
            disabled={!metin.trim()}
            aria-label="Gönder"
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-brand text-brand-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={20} aria-hidden="true" />
          </button>
          </div>
        </div>
      </div>
    </KatmanEkran>
  )
}

/**
 * Çıkartma — mineral kristali, paketin renginde satır içi SVG.
 * Bir görsel içerik; ekran okuyucuya paket adı ve sırasıyla duyurulur.
 */
function Cikartma({ anahtar, kucuk = false }: { anahtar: string; kucuk?: boolean }) {
  const [paket, sira] = anahtar.split('-')
  const yol = CIKARTMA_YOLLARI[Number(sira)] ?? CIKARTMA_YOLLARI[0]
  const boyut = kucuk ? 32 : 72
  return (
    <svg
      viewBox="0 0 24 24"
      width={boyut}
      height={boyut}
      fill="currentColor"
      style={{ color: `var(--kozmetik-${paket})` }}
      role="img"
      aria-label={`${paket} çıkartması ${Number(sira) + 1}`}
    >
      <path d={yol} />
    </svg>
  )
}
