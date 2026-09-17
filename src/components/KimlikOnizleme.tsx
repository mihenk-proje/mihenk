"use client"

import { useStore } from "@/lib/store/kanca"
import { Avatar } from "./Avatar"

type RozetGorunum = { simge: string; sinif: string; etiket: string }

/**
 * Kullanıcının kimlik bileşimi: avatar + çerçeve, ad + ad rengi, rozet.
 *
 * İki yerde birden gerekiyor — mağazanın ürün önizleme penceresi ve profil
 * başlığı. Önizleme, satın alınacak ürünün etkisini geçici olarak uygular;
 * profil ise kuşanılmış olanları gösterir. İkisi de aynı bileşimi çiziyor,
 * bu yüzden tek kaynaktan.
 *
 * Kozmetik sınıflarını hesaplamaz, hazır alır: önizleme "bu ürün takılsaydı"
 * senaryosunu çizer, profil ise `aktifEfekt` sonucunu. Hesaplamayı içeri
 * almak, önizlemeyi imkânsız kılardı.
 */
export function KimlikOnizleme({
  cerceveSinifi = '',
  adSinifi = '',
  rozetGorunum,
  boyut = 'lg',
  hizalama = 'merkez',
}: {
  cerceveSinifi?: string
  adSinifi?: string
  rozetGorunum?: RozetGorunum
  boyut?: 'xl' | 'lg'
  hizalama?: 'merkez' | 'sol'
}) {
  const { state } = useStore()
  const k = state.kullanici
  const merkez = hizalama === 'merkez'

  return (
    <div className={`flex flex-col ${merkez ? 'items-center' : 'items-start'}`}>
      <Avatar
        id={k.id}
        harfler={k.avatarHarfleri}
        ad={k.adSoyad}
        ton={k.avatarTonu}
        boyut={boyut}
        cerceveSinifi={cerceveSinifi}
      />

      <div
        className={`flex items-center gap-1.5 flex-wrap mt-3 text-lg ${
          merkez ? 'justify-center' : ''
        }`}
      >
        <span className={`font-bold ${adSinifi || 'text-primary'}`}>{k.adSoyad}</span>
        {rozetGorunum && (
          <span className={rozetGorunum.sinif} aria-label={rozetGorunum.etiket}>
            {rozetGorunum.simge}
          </span>
        )}
      </div>
      <span className="text-secondary text-sm">@{k.kullaniciAdi}</span>
    </div>
  )
}
