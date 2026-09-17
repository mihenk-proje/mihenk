"use client"

import { useState, useSyncExternalStore } from "react"
import { Sparkles } from "lucide-react"
import { DepoYukleniyor, useStore } from "@/lib/store/kanca"
import type { Gorunum, DogrulamaSonucu as Sonuc } from "@/lib/store/types"
import { AkisSekmeleri } from "@/components/AkisSekmeleri"
import { AltGezinti } from "@/components/AltGezinti"
import {
  Bildirimler,
  okunmamisSayisi,
  sonZiyaretZamani,
  ziyaretiIsaretle,
} from "@/components/Bildirimler"
import { Cuzdan } from "@/components/Cuzdan"
import { DogrulamaSonucu } from "@/components/DogrulamaSonucu"
import { Giris } from "@/components/Giris"
import { GonderiKarti } from "@/components/GonderiKarti"
import { GonderiOlustur } from "@/components/GonderiOlustur"
import { HikayeSeridi } from "@/components/HikayeSeridi"
import { KapsamNotu } from "@/components/KapsamNotu"
import { Magaza } from "@/components/Magaza"
import { Profil } from "@/components/Profil"
import { OlusturDugmesi } from "@/components/OlusturDugmesi"
import { Tanitim, tanitimGoruldu } from "@/components/Tanitim"
import { TopBar } from "@/components/TopBar"
import { YanCekmece } from "@/components/YanCekmece"

const GIRIS_ANAHTARI = 'mihenk_entered'

function girisYapilmisMi() {
  try {
    return sessionStorage.getItem(GIRIS_ANAHTARI) !== null
  } catch {
    return false
  }
}

/*
  "İstemcide miyim?" — sunucuda ve istemcinin İLK render'ında false, hidrasyon
  bittikten hemen sonra true. Efekt içinde setState çağırmadan aynı işi görür
  (react-hooks/set-state-in-effect).

  Tarayıcıya özgü her okuma bunun arkasında durur: aksi halde sunucu giriş
  ekranını, istemci akışı basar ve React uyuşmazlık uyarısı verir.
*/
const ABONE_YOK = () => () => {}
const ISTEMCIDE = () => true
const SUNUCUDA = () => false

export default function Home() {
  const { state, hidre } = useStore()

  /*
    StoreProvider yüklenene kadar çocuklarını render etmediği için bu bileşen
    yalnızca istemcide kurulur; sessionStorage'ı doğrudan başlangıç değerinde
    okumak güvenlidir ve sunucu/istemci uyuşmazlığı doğurmaz.
  */
  const monte = useSyncExternalStore(ABONE_YOK, ISTEMCIDE, SUNUCUDA)
  const [elleGirildi, setElleGirildi] = useState(false)
  const girisYapildi = elleGirildi || (monte && girisYapilmisMi())

  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [gorunum, setGorunum] = useState<Gorunum>('akis')
  const [cekmeceAcik, setCekmeceAcik] = useState(false)
  const [sekme, setSekme] = useState('Ana akış')
  const [kapsamNotu, setKapsamNotu] = useState<string | null>(null)

  /*
    Bildirimlerin son ziyaret damgası uygulama durumunun DIŞINDA, kendi
    localStorage anahtarında duruyor (bkz. Bildirimler.tsx). Burada yalnızca
    bir kopyası tutulur ki ekran açıldığında zil rozeti yeniden hesaplansın;
    localStorage yazması bileşenlere kendiliğinden haber vermez.

    Değer tembel başlatıcıyla bir kez okunur. Sunucuda depolama yok ve
    yedeğe düşülür, ama zil hidrasyon tamamlanmadan hiç basılmıyor
    (önce Giriş, sonra DepoYükleniyor) — uyuşmazlık doğmaz.
  */
  const [sonZiyaret, setSonZiyaret] = useState(sonZiyaretZamani)

  /*
    Tur yalnızca ilk girişte açılır. Durumu uygulama durumundan ayrı bir
    anahtarda tutulur; seed sürümü değişip durum sıfırlansa bile tur
    yeniden gösterilmez.

    Durum türetilir, efektle atanmaz: null "henüz elle karar verilmedi"
    demektir ve akışa girilmişse tur kendiliğinden açılır.
  */
  const [turIstegi, setTurIstegi] = useState<boolean | null>(null)
  const tanitimAcik = turIstegi ?? (monte && girisYapildi && !tanitimGoruldu())

  const handleEnter = () => {
    try {
      sessionStorage.setItem(GIRIS_ANAHTARI, 'true')
    } catch {
      // Özel sekmede yazılamayabilir; oturum içinde çalışmaya devam eder
    }
    setElleGirildi(true)
  }

  /*
    Giriş ekranı depodan hiçbir şey okumaz; hidrasyonu beklemesi için bir
    sebep yok. Akış ise tohum gönderilerine bağlı, orada bekleniyor.
  */
  if (!girisYapildi) {
    return <Giris onEnter={handleEnter} />
  }

  if (!hidre) {
    return <DepoYukleniyor />
  }

  const katmanAcik = gorunum !== 'akis' || cekmeceAcik

  /* Ekranı açmak her şeyi okunmuş sayar; rozet aynı karede sıfırlanır. */
  const bildirimleriAc = () => {
    setSonZiyaret(ziyaretiIsaretle())
    setGorunum('bildirimler')
  }

  const okunmamis = okunmamisSayisi(state, sonZiyaret)

  /*
    "Takip ettiklerin" gerçek bir süzgeç: kendi gönderilerin çıkar, çünkü
    kendini takip etmiyorsun. Sekme değiştirince hiçbir şeyin değişmemesi,
    çalışmayan bir düğmeden farksız olurdu.
  */
  const gorunenGonderiler =
    sekme === 'Ana akış'
      ? state.gonderiler
      : state.gonderiler.filter((g) => g.yazarId !== state.kullanici.id)

  return (
    <div className="min-h-dvh bg-page flex flex-col">
      {/*
        Tam ekran bir katman açıkken arkadaki akış sekme sırasından ve
        erişilebilirlik ağacından çıkarılır; aksi halde klavye odağı
        görünmeyen içeriğe kayar.
      */}
      <div inert={katmanAcik} className="contents">
        {/*
          Gezinti çubuğu görsel sırayla aynı yerde — yani belgenin sonunda —
          durduğu için klavyeyle Cüzdan'a ulaşmak akışın tamamını gezmeyi
          gerektiriyordu. Atlama bağlantısı bunu tek Tab'a indirir (WCAG 2.4.1).
        */}
        <a
          href="#alt-gezinti"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-card focus:border focus:border-line-strong focus:text-primary"
        >
          Gezinti çubuğuna atla
        </a>

        <TopBar
          onMenu={() => setCekmeceAcik(true)}
          onBildirimler={bildirimleriAc}
          okunmamis={okunmamis}
        />

        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          <HikayeSeridi />

          <div className="sticky top-14 z-20">
            <AkisSekmeleri aktif={sekme} onDegis={setSekme} />
          </div>

          <main className="flex-1">
            <GonderiOlustur onDogrulamaSonucu={setSonuc} />

            <div className="flex flex-col gap-2 pt-2 pb-36">
              {gorunenGonderiler.map((gonderi) => (
                <GonderiKarti key={gonderi.id} gonderi={gonderi} />
              ))}

              {gorunenGonderiler.length === 0 && (
                <div className="p-12 flex flex-col items-center text-center bg-card">
                  <div
                    className="w-16 h-16 rounded-full bg-page flex items-center justify-center mb-4 border border-line"
                    aria-hidden="true"
                  >
                    <Sparkles size={24} className="text-secondary" />
                  </div>
                  <p className="text-primary font-medium text-lg">Henüz gönderi yok</p>
                  <p className="text-secondary mt-1">İlk gönderini paylaş, ilk jetonunu kazan.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        <OlusturDugmesi />
      </div>

      {/*
        Alt gezinti BİLEREK inert sarmalayıcının dışında ve katmanların üstünde
        (z-[45] > katman z-40). Önceden sarmalayıcının içindeydi: Cüzdan
        açıkken gezinti hem görünmüyor hem devre dışı kalıyordu ve Mağaza'ya
        geçmek için önce akışa dönmek gerekiyordu. Artık gorunum gerçek bir
        sekme durumu; yanal geçiş tek dokunuş.

        Kalıcı pencereler (z-50) ve tanıtım turu (z-60) gezintinin üstünde
        kalmaya devam eder — modal bir diyalog gezintiyi örtmeli.
      */}
      <AltGezinti
        gorunum={gorunum}
        onAkis={() => setGorunum('akis')}
        onCuzdan={() => setGorunum('cuzdan')}
        onMagaza={() => setGorunum('magaza')}
        onProfil={() => setGorunum('profil')}
        onKapsamDisi={setKapsamNotu}
      />

      {cekmeceAcik && (
        <YanCekmece
          onKapat={() => setCekmeceAcik(false)}
          onTanitim={() => setTurIstegi(true)}
          onBildirimler={bildirimleriAc}
          onKapsamDisi={setKapsamNotu}
        />
      )}

      {gorunum === 'cuzdan' && <Cuzdan onBack={() => setGorunum('akis')} />}
      {gorunum === 'magaza' && <Magaza onBack={() => setGorunum('akis')} />}
      {gorunum === 'profil' && <Profil onBack={() => setGorunum('akis')} />}
      {gorunum === 'bildirimler' && <Bildirimler onBack={() => setGorunum('akis')} />}

      {tanitimAcik && <Tanitim onKapat={() => setTurIstegi(false)} />}

      {kapsamNotu && (
        <KapsamNotu
          key={kapsamNotu}
          ad={kapsamNotu}
          onKapat={() => setKapsamNotu(null)}
        />
      )}

      {sonuc && (
        <DogrulamaSonucu
          key={sonuc.gonderiId}
          sonuc={sonuc}
          onClose={() => setSonuc(null)}
        />
      )}
    </div>
  )
}
