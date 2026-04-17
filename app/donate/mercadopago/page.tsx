'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PRESETS = [10, 25, 50, 100, 200]
const CONV = 2

function calcCredits(brl: number) { return Math.floor(brl * CONV) }

export default function MercadoPagoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDonate = async () => {
    if (status === 'unauthenticated') { router.push('/login?callbackUrl=/donate/mercadopago'); return }

    setError('')
    setLoading(true)

    const credits = calcCredits(amount)
    const configId = parseInt(process.env.NEXT_PUBLIC_MP_CREDIT_CONFIG_ID ?? '1')

    const res = await fetch('/api/mp/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, credits, config_id: configId }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.init_point) {
      setError(data.error ?? 'Erro ao criar preferência de pagamento')
      return
    }

    window.location.href = data.init_point
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-game-muted)]">Taxa de conversão</p>
            <p className="font-display text-lg font-bold text-[var(--color-game-text)]">
              R$ 1,00 = <span className="text-[var(--color-game-accent)]">{CONV} WCoinC</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-game-muted)]">Você receberá</p>
            <p className="font-display text-2xl font-bold text-[var(--color-game-accent)]">
              {calcCredits(amount)} WCoinC
            </p>
          </div>
        </div>
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-game-text)] mb-2">Selecione o valor</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className={`px-5 py-3 rounded-lg text-sm font-medium border transition-colors ${
                amount === v
                  ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white'
                  : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'
              }`}
            >
              R$ {v}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Button variant="primary" size="lg" className="w-full" onClick={handleDonate} disabled={loading}>
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Redirecionando...</>
          : <><ExternalLink size={16} /> Pagar R$ {amount} com MercadoPago</>
        }
      </Button>

      <p className="text-xs text-center text-[var(--color-game-muted)]">
        Você será redirecionado ao checkout seguro do MercadoPago. Após o pagamento, os créditos serão creditados automaticamente.
      </p>
    </div>
  )
}
