"use client"

import { Gonderi } from "@/lib/store/types"
import { useStore } from "@/lib/store/StoreContext"
import { MessageCircle, Repeat2, Rocket, BarChart2, CheckCircle2, Bot } from "lucide-react"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}g`
  if (hours > 0) return `${hours}s`
  if (minutes > 0) return `${minutes}d`
  return 'Şimdi'
}

export function GonderiKarti({ gonderi }: { gonderi: Gonderi }) {
  const { state } = useStore()
  // Normalde yazar bilgisi state'deki kullanıcılardan gelir, demo için basitleştirdik
  const isMe = gonderi.yazarId === state.kullanici.id
  const yazarAdi = isMe ? state.kullanici.kullaniciAdi : `Kullanıcı ${gonderi.yazarId.replace('user', '')}`
  const yazarAvatar = isMe ? state.kullanici.avatarUrl : `https://i.pravatar.cc/150?u=${gonderi.yazarId}`

  // Uygulanmış efektleri bulalım
  const aktifCerceve = isMe ? state.kullanici.envanter.find(u => u.aktif && u.urunId.includes('cerceve')) : null
  const aktifAdRengi = isMe ? state.kullanici.envanter.find(u => u.aktif && u.urunId.includes('adRengi')) : null
  const aktifRozet = isMe ? state.kullanici.envanter.find(u => u.aktif && u.urunId.includes('rozet')) : null

  return (
    <article className="border-b border-primary p-4 hover:bg-card/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          <div className={`rounded-full overflow-hidden w-10 h-10 ${aktifCerceve?.urunId === 'u1' ? 'ring-2 ring-green-500 shadow-[0_0_10px_#22c55e]' : aktifCerceve?.urunId === 'u5' ? 'ring-2 ring-blue-400' : ''}`}>
            <img src={yazarAvatar} alt={yazarAdi} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-bold truncate ${aktifAdRengi?.urunId === 'u2' ? 'text-yellow-500' : 'text-primary'}`}>
                {yazarAdi}
              </span>
              {aktifRozet && (
                <span className="text-yellow-500" title="Rozet">★</span>
              )}
              <span className="text-secondary">@{gonderi.yazarId}</span>
              <span className="text-secondary">·</span>
              <span className="text-secondary">{timeAgo(gonderi.olusturmaZamani)}</span>
            </div>
          </div>

          {/* Etiketler (YZ beyanı, MİHENK Doğrulama) */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {gonderi.yzBeyani && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20" aria-label="Yapay Zekâ destekli içerik">
                <Bot size={12} /> YZ Destekli
              </span>
            )}
            {gonderi.dogrulamaDurumu !== 'bekliyor' && gonderi.dogrulamaDurumu !== 'gecemedi' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-success/30 text-success" title="Bu gönderi MİHENK tarafından doğrulandı ve jeton kazandı">
                <CheckCircle2 size={12} /> Doğrulandı
              </span>
            )}
            {gonderi.dogrulamaDurumu === 'bekliyor' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border border-brand/30 text-brand">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> Doğrulanıyor...
              </span>
            )}
          </div>

          {/* Metin */}
          <p className="text-primary text-[15px] whitespace-pre-wrap break-words mb-3">
            {gonderi.metin}
          </p>

          {/* Görsel (Varsa) */}
          {gonderi.gorselUrl && (
            <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-primary/50 max-h-80">
              <img src={gonderi.gorselUrl} alt="Gönderi görseli" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Anket (Varsa) */}
          {gonderi.anketSecenekleri && gonderi.anketSecenekleri.length > 0 && (
            <div className="mt-2 mb-3 flex flex-col gap-2">
              {gonderi.anketSecenekleri.map((secenek, idx) => (
                <button key={idx} className="w-full text-left px-4 py-2 rounded-lg border border-primary/50 hover:bg-card transition-colors text-sm font-medium">
                  {secenek}
                </button>
              ))}
            </div>
          )}

          {/* Etkileşim Satırı */}
          <div className="flex items-center justify-between text-secondary mt-1 max-w-md">
            <button className="flex items-center gap-1.5 hover:text-interaction transition-colors group" aria-label="Yorum yap">
              <div className="p-1.5 rounded-full group-hover:bg-interaction/10"><MessageCircle size={18} /></div>
              <span className="text-xs">{gonderi.yorumSayisi || ''}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors group" aria-label="Yeniden paylaş">
              <div className="p-1.5 rounded-full group-hover:bg-green-500/10"><Repeat2 size={18} /></div>
              <span className="text-xs">{gonderi.yenidenPaylasimSayisi || ''}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-interaction transition-colors group" aria-label="Roketle (Beğen)">
              <div className="p-1.5 rounded-full group-hover:bg-interaction/10"><Rocket size={18} /></div>
              <span className="text-xs">{gonderi.roketSayisi || ''}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group" aria-label="Görüntülenme sayısı">
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10"><BarChart2 size={18} /></div>
              <span className="text-xs">{gonderi.izlenimSayisi || ''}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
