"use client"

import { useTheme } from "next-themes"
import {
  Bell,
  Bookmark,
  Compass,
  HelpCircle,
  LogOut,
  MessageSquarePlus,
  Moon,
  Rocket,
  Settings,
  Star,
  Sun,
} from "lucide-react"
import { useKatman } from "@/lib/a11y/katman"
import { useStore } from "@/lib/store/kanca"
import { Avatar } from "./Avatar"

/**
 * NSosyal yan çekmecesi.
 *
 * Ev sahibi platformun menüsü: lavanta→nane gradyanlı panel, üstte profil
 * özeti, altta ay/güneş tema anahtarı. Tanıtım turu da buraya taşındı —
 * üst çubukta dört düğme vardı, şimdi iki.
 *
 * role="dialog" DEĞİL, <nav>. Sebep ölçülmüş bir davranış: katman.ts:36
 * Escape'i açık bir [role="dialog"] varken devrediyor, yani çekmece kendini
 * dialog ilan ederse Escape ile kapanmaz.
 *
 * Odak yönetimi (içeri alma, Escape, kapanışta çağıran düğmeye geri verme)
 * Cüzdan ve Mağaza'nın kullandığı useKatman kancasıyla aynıdır.
 */
export function YanCekmece({
  onKapat,
  onTanitim,
  onKapsamDisi,
}: {
  onKapat: () => void
  onTanitim: () => void
  onKapsamDisi: (ad: string) => void
}) {
  const katmanRef = useKatman<HTMLElement>(onKapat)
  const { state } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const koyu = resolvedTheme !== 'light'

  const k = state.kullanici

  const satir =
    'w-full flex items-center gap-4 h-12 px-5 text-[15px] font-medium text-primary hover:bg-primary/5 transition-colors'

  const BOLUMLER = [
    { ad: 'Bildirimler', Simge: Bell },
    { ad: 'Keşfet', Simge: Compass },
    { ad: 'Topluluklar', Simge: Star },
    { ad: 'Kaydedilenler', Simge: Bookmark },
    { ad: 'Beğeniler', Simge: Rocket },
  ] as const

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Zemin: tıklanınca çekmece kapanır. Sekme sırasına girmez. */}
      <button
        type="button"
        className="absolute inset-0 bg-page/70 cursor-default"
        onClick={onKapat}
        aria-label="Menüyü kapat"
        tabIndex={-1}
      />

      <nav
        ref={katmanRef}
        aria-label="Menü"
        className="nsosyal-cekmece relative w-[85%] max-w-sm h-full flex flex-col overflow-y-auto mihenk-soldan shadow-2xl"
      >
        <div className="px-5 pt-6 pb-5">
          <Avatar
            id={k.id}
            harfler={k.avatarHarfleri}
            ad={k.adSoyad}
            ton={k.avatarTonu}
            boyut="md"
          />
          <p className="font-bold text-lg text-primary mt-3">{k.adSoyad}</p>
          <p className="text-secondary text-sm">@{k.kullaniciAdi}</p>
          <p className="text-secondary text-sm mt-2">
            <span className="font-bold text-primary tabular-nums">{state.gonderiler.length}</span> Gönderi
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="font-bold text-primary tabular-nums">{state.kullanici.jetonBakiyesi}</span> Jeton
          </p>
        </div>

        <div className="flex flex-col py-2">
          {BOLUMLER.map(({ ad, Simge }) => (
            <button key={ad} type="button" className={satir} onClick={() => { onKapat(); onKapsamDisi(ad) }}>
              <Simge size={20} className="text-secondary shrink-0" aria-hidden="true" />
              {ad}
            </button>
          ))}
        </div>

        <div className="h-px bg-primary/10 mx-5" aria-hidden="true" />

        <div className="flex flex-col py-2">
          <button type="button" className={satir} onClick={() => { onKapat(); onTanitim() }}>
            <HelpCircle size={20} className="text-secondary shrink-0" aria-hidden="true" />
            Tanıtım turu
          </button>
          {([
            { ad: 'Geri Bildirim', Simge: MessageSquarePlus },
            { ad: 'Ayarlar', Simge: Settings },
            { ad: 'Çıkış Yap', Simge: LogOut },
          ] as const).map(({ ad, Simge }) => (
            <button key={ad} type="button" className={satir} onClick={() => { onKapat(); onKapsamDisi(ad) }}>
              <Simge size={20} className="text-secondary shrink-0" aria-hidden="true" />
              {ad}
            </button>
          ))}
        </div>

        {/*
          Tema anahtarı. İki ayrı düğme değil, tek düğmeyle geçiş: görsel olarak
          iki hücreli bir anahtar, erişilebilirlik ağacında tek bir eylem.
        */}
        <div className="mt-auto px-5 py-6">
          <button
            type="button"
            onClick={() => setTheme(koyu ? 'light' : 'dark')}
            /*
              Kenarlık çekmece gradyanının üstünde duruyor; line-strong orada
              2,50–2,93'e düşüyordu (WCAG 1.4.11 için 3:1 gerek). Metin
              renginin %50'si gradyanın dört ucunda da 3,32–4,06 veriyor.
            */
            className="inline-flex items-center gap-1 p-1 rounded-full bg-primary/10 border border-primary/50"
            aria-label={koyu ? 'Açık temaya geç' : 'Koyu temaya geç'}
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                koyu ? 'bg-card text-primary shadow' : 'text-secondary'
              }`}
              aria-hidden="true"
            >
              <Moon size={17} />
            </span>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                koyu ? 'text-secondary' : 'bg-card text-primary shadow'
              }`}
              aria-hidden="true"
            >
              <Sun size={17} />
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}
