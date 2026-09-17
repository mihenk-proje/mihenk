"use client"

import { useState } from "react"
import { useStore } from "@/lib/store/kanca"
import {
  AD_RENGI_SINIFLARI,
  CERCEVE_SINIFLARI,
  ROZET_SIMGELERI,
  TEMA_SINIFLARI,
  aktifEfekt,
  kalanSure,
  suresiDoldu,
} from "@/lib/store/efektler"
import { GonderiKarti } from "./GonderiKarti"
import { KatmanEkran } from "./KatmanEkran"
import { KimlikOnizleme } from "./KimlikOnizleme"
import { ETKI_METNI, KozmetikGorseli } from "./KozmetikGorseli"

const SEKMELER = ['Gönderiler', 'Doğrulananlar'] as const

/**
 * Profil ekranı.
 *
 * NEDEN VAR: mağaza satın alma bildirimi birebir "… profilinde görünecek."
 * diyordu ve önizleme alt başlığı "profilinizde nasıl görüneceğini gösterir"
 * diyordu — ama profil diye bir ekran yoktu. Uygulama olmayan bir yeri
 * işaret ediyordu.
 *
 * Kozmetikler bugüne kadar TEK bir yüzeyde görünüyordu: akıştaki kendi
 * gönderi başlıkların. Burası, satın alınan her şeyin bir arada görüldüğü
 * yer — ve `tema` ürünlerinin tek render noktası (kapak bandı).
 *
 * Ev sahibi yüzeyi. Kozmetik renkleri ev sahibi zemininde ölçüldü:
 * 9 renk × 3 zemin × 2 tema = 54/54 AA, en düşük 4,57.
 */
export function Profil({ onBack }: { onBack: () => void }) {
  const { state, urunAcKapa } = useStore()
  const [sekme, setSekme] = useState<string>(SEKMELER[0])
  const k = state.kullanici

  const cerceve = aktifEfekt(state, 'cerceve')
  const adRengi = aktifEfekt(state, 'adRengi')
  const rozet = aktifEfekt(state, 'rozet')
  const tema = aktifEfekt(state, 'tema')

  const rozetGorunum = rozet ? ROZET_SIMGELERI[rozet.efekt.deger] : undefined
  const temaSinifi = tema ? (TEMA_SINIFLARI[tema.efekt.deger] ?? '') : ''

  const kendiGonderileri = state.gonderiler.filter((g) => g.yazarId === k.id)
  const dogrulanan = kendiGonderileri.filter(
    (g) => g.dogrulamaDurumu === 'gecti' || g.dogrulamaDurumu === 'kismi'
  )
  const sonuclanan = kendiGonderileri.filter((g) => g.dogrulamaDurumu !== 'bekliyor')
  const oran = sonuclanan.length === 0 ? null : Math.round((dogrulanan.length / sonuclanan.length) * 100)

  const gorunen = sekme === 'Gönderiler' ? kendiGonderileri : dogrulanan

  const envanter = k.envanter
    .map((sahip) => ({ sahip, urun: state.magaza.find((u) => u.id === sahip.urunId) }))
    .filter((e) => e.urun !== undefined)

  const kusanilmis = envanter.filter(
    ({ sahip, urun }) => sahip.aktif && !suresiDoldu(urun, sahip)
  )

  return (
    <KatmanEkran baslik="Profil" onBack={onBack}>
      {/*
        KAPAK BANDI — `tema` ürünlerinin tek render noktası.

        Üzerinde metin YOK, bilerek: metin olsaydı her tema ürünü × her arayüz
        teması için kontrast ölçümü gerekirdi. Bant yalnızca sayfadan ayırt
        edilebilmeli; ölçüldü (ΔE76 koyu 14,7–75,9 · açık 10,9–19,1).

        Tema satın alınmamışsa ev sahibi kimlik gradyanı düşer.
      */}
      <div
        className={`-mx-4 -mt-5 h-28 ${temaSinifi || 'nsosyal-gradyan'}`}
        aria-hidden="true"
      />

      <div className="-mt-10 relative">
        <KimlikOnizleme
          hizalama="sol"
          boyut="lg"
          cerceveSinifi={cerceve ? (CERCEVE_SINIFLARI[cerceve.efekt.deger] ?? '') : ''}
          adSinifi={adRengi ? (AD_RENGI_SINIFLARI[adRengi.efekt.deger] ?? '') : ''}
          rozetGorunum={rozetGorunum}
        />
      </div>

      <dl className="grid grid-cols-4 gap-2 mt-5 mb-6">
        {[
          { etiket: 'Gönderi', deger: String(kendiGonderileri.length), mihenk: false },
          { etiket: 'Doğrulanan', deger: String(dogrulanan.length), mihenk: true },
          { etiket: 'Oran', deger: oran === null ? '—' : `%${oran}`, mihenk: true },
          { etiket: 'Jeton', deger: String(k.jetonBakiyesi), mihenk: true },
        ].map(({ etiket, deger, mihenk }) => (
          /*
            Pirinç sınıfı hücrenin KENDİSİNDE. <Yuzey> ile sarmak <dl> ile
            <dd> arasına fazladan bir <div> sokuyordu ve HTML yalnızca
            doğrudan çocuk olan <div>'e izin veriyor — axe bunu
            definition-list + dlitem ihlali olarak yakaladı.
          */
          <div
            key={etiket}
            data-yuzey={mihenk ? 'mihenk' : undefined}
            className={`rounded-xl border border-line bg-card px-2 py-3 text-center ${
              mihenk ? 'yuzey-mihenk' : ''
            }`}
          >
            <dd
              className={`font-mono font-bold text-lg tabular-nums ${
                mihenk ? 'text-brand' : 'text-primary'
              }`}
            >
              {deger}
            </dd>
            <dt className="text-[11px] text-secondary mt-0.5">{etiket}</dt>
          </div>
        ))}
      </dl>

      <section className="mb-6">
        <h3 className="font-bold text-lg text-primary mb-1">Kuşanılmış</h3>
        <p className="text-secondary text-xs mb-3">
          Aynı türden yalnızca bir ürün takılı olabilir.
        </p>

        {kusanilmis.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-primary font-medium">Takılı kozmetiğin yok</p>
            <p className="text-secondary text-sm mt-1">
              Mağazadan aldığın çerçeve, rozet ve temalar burada görünür.
            </p>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {kusanilmis.map(({ sahip, urun }) => (
              <li
                key={sahip.urunId}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-card pl-2 pr-3 py-1.5"
              >
                <KozmetikGorseli tur={urun!.efekt.tur} deger={urun!.efekt.deger} />
                <span className="flex flex-col min-w-0">
                  <span className="text-sm text-primary font-medium truncate">{urun!.ad}</span>
                  <span className="text-[11px] text-secondary truncate">
                    {ETKI_METNI[urun!.efekt.tur]} · {kalanSure(urun, sahip) ?? 'Kalıcı'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h3 className="font-bold text-lg text-primary mb-3">Envanter</h3>
        {envanter.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-primary font-medium">Envanterin henüz boş</p>
            <p className="text-secondary text-sm mt-1">
              Doğrulamayı geçen gönderilerinle jeton kazan, mağazadan harca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {envanter.map(({ sahip, urun }) => {
              const doldu = suresiDoldu(urun, sahip)
              return (
                <div
                  key={sahip.urunId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <KozmetikGorseli tur={urun!.efekt.tur} deger={urun!.efekt.deger} />
                    <div className="min-w-0">
                      <p className="text-primary font-medium text-sm truncate">{urun!.ad}</p>
                      <p className="text-secondary text-xs mt-0.5 truncate">
                        {ETKI_METNI[urun!.efekt.tur]}
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono">
                          {doldu ? 'Süresi doldu' : (kalanSure(urun, sahip) ?? 'Kalıcı')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => urunAcKapa(sahip.urunId)}
                    disabled={doldu}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      sahip.aktif && !doldu
                        ? 'border-success text-success bg-success/10'
                        : 'border-line-strong text-secondary bg-page'
                    }`}
                  >
                    {sahip.aktif && !doldu ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div role="tablist" aria-label="Profil akışı" className="flex border-b border-line mb-3">
        {SEKMELER.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={sekme === s}
            onClick={() => setSekme(s)}
            className={`flex-1 h-11 font-semibold text-sm transition-colors border-b-2 ${
              sekme === s
                ? 'border-brand text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 -mx-4">
        {gorunen.map((gonderi) => (
          <GonderiKarti key={gonderi.id} gonderi={gonderi} />
        ))}
        {gorunen.length === 0 && (
          <p className="text-center text-secondary py-10 text-sm">
            {sekme === 'Gönderiler'
              ? 'Henüz gönderi paylaşmadın.'
              : 'Doğrulamayı geçen bir gönderin yok.'}
          </p>
        )}
      </div>
    </KatmanEkran>
  )
}
