"use client"

import { LogIn } from "lucide-react"
import { MihenkSimgesi } from "./MihenkSimgesi"

export function Giris({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-line p-8 text-center mihenk-belir">
        <div
          className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6 border border-brand/25"
          aria-hidden="true"
        >
          <MihenkSimgesi className="text-brand" boyut={38} />
        </div>

        <h1 className="font-display font-bold text-4xl text-primary tracking-tight mb-2">MİHENK</h1>

        <p className="text-lg font-medium text-primary mb-2">İçerik nitelik ve katılım katmanı</p>

        <p className="text-secondary mb-8">
          Ödül, paylaşım miktarına değil içeriğin otomatik bir denetimden geçip geçmediğine
          bağlanır. Nitelikli paylaşımlarınızla jeton kazanır, profilinizi kişiselleştirirsiniz.
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand/90 text-brand-ink font-bold rounded-xl transition-colors mb-6 text-lg"
        >
          <LogIn size={20} aria-hidden="true" />
          Demo olarak gir
        </button>

        <div className="text-xs text-secondary text-left p-4 bg-page rounded-lg border border-line">
          <p className="font-bold mb-1 text-primary">Prototip notu:</p>
          <p>
            Bu uygulama, mevcut bir mikroblog platformu olan <strong>NSosyal</strong> üzerine
            kurgulanmış bir &laquo;özellik katmanı&raquo; prototipidir. Doğrulama kademelerinin
            tamamı istemci tarafında çalışır; içerik hiçbir dış hizmete gönderilmez.
          </p>
        </div>
      </div>
    </main>
  )
}
