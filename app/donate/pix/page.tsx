'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle, Loader2, XCircle, QrCode, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRESETS = [10, 25, 50, 100, 200]
const CONV = parseInt(process.env.NEXT_PUBLIC_PIX_CONV ?? '2')

function calcCredits(brl: number) { return Math.floor(brl * CONV) }

type Step = 'form' | 'qr' | 'paid' | 'canceled' | 'error'

export default function PixPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [amount, setAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [qrcode, setQrcode] = useState('')
  const [emv, setEmv] = useState('')
  const [orderId, setOrderId] = useState('')
  const [creditsAmount, setCreditsAmount] = useState(0)

  // Preencher email da sessão
  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email as string)
  }, [session])

  // Polling de status
  useEffect(() => {
    if (step !== 'qr' || !orderId) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/pix/status/${orderId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.status === 'PAID') {
        setCreditsAmount(data.credits)
        setStep('paid')
      } else if (data.status === 'CANCELED') {
        setStep('canceled')
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [step, orderId])

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'unauthenticated') { router.push('/login?callbackUrl=/donate/pix'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/pix/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: effectiveAmount, name, cpf, email, phone }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Erro desconhecido'); return }

    setQrcode(data.qrcode_url)
    setEmv(data.emv)
    setOrderId(data.order_id)
    setStep('qr')
  }, [effectiveAmount, name, cpf, email, phone, status, router])

  const copyEmv = () => {
    navigator.clipboard.writeText(emv)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cancelPix = async () => {
    await fetch('/api/pix/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
    setStep('canceled')
  }

  if (step === 'paid') return (
    <div className="text-center py-12">
      <CheckCircle size={56} className="text-[var(--color-game-success)] mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-[var(--color-game-text)] mb-2">Pagamento confirmado!</h2>
      <p className="text-[var(--color-game-muted)] mb-6">
        <span className="text-[var(--color-game-accent)] text-2xl font-bold">+{creditsAmount} WCoinC</span>
        {' '}adicionados à sua conta.
      </p>
      <Button variant="accent" onClick={() => setStep('form')}>Nova doação</Button>
    </div>
  )

  if (step === 'canceled') return (
    <div className="text-center py-12">
      <XCircle size={48} className="text-[var(--color-game-error)] mx-auto mb-4" />
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-2">PIX cancelado</h2>
      <Button variant="outline" className="mt-4" onClick={() => setStep('form')}>Tentar novamente</Button>
    </div>
  )

  if (step === 'qr') return (
    <div className="space-y-5">
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 size={16} className="animate-spin text-[var(--color-game-accent)]" />
          <span className="text-sm text-[var(--color-game-muted)]">Aguardando pagamento...</span>
        </div>

        {qrcode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrcode} alt="QR Code PIX" className="mx-auto rounded-lg border border-[var(--color-game-border)] mb-4" style={{ width: 200, height: 200 }} />
        )}

        <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg p-3 mb-4">
          <p className="text-xs text-[var(--color-game-muted)] mb-1">Código PIX (Copia e Cola)</p>
          <p className="font-mono text-xs text-[var(--color-game-text)] break-all">{emv}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="accent" onClick={copyEmv}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </Button>
          <Button variant="ghost" onClick={cancelPix}>Cancelar</Button>
        </div>
      </div>

      <div className="text-center text-xs text-[var(--color-game-muted)]">
        <QrCode size={14} className="inline mr-1" />
        O status é atualizado automaticamente a cada 5 segundos
      </div>
    </div>
  )

  return (
    <div>
      {/* Conversão info */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5 mb-6">
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
              {calcCredits(effectiveAmount)} WCoinC
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-game-text)] mb-2">Valor da doação</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => { setAmount(v); setCustomAmount('') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  amount === v && !customAmount
                    ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white'
                    : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'
                }`}
              >
                R$ {v}
              </button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Outro valor (ex: 75)"
            min={3}
            max={9999}
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setAmount(0) }}
          />
        </div>

        {/* Dados do pagador */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Nome completo</label>
            <Input name="name" value={name} onChange={e => setName(e.target.value)} placeholder="João Silva" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">CPF</label>
            <Input name="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">E-mail</label>
            <Input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Telefone</label>
            <Input name="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 90000-0000" required />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {status === 'unauthenticated' && (
          <p className="text-sm text-[var(--color-game-warning)]">Faça login para realizar uma doação.</p>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading || effectiveAmount < 3}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Gerando PIX...</> : `Gerar PIX — R$ ${effectiveAmount}`}
        </Button>
      </form>
    </div>
  )
}
