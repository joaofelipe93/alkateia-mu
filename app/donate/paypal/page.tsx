import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const PRESETS = [10, 25, 50, 100, 200]
const CONV = 2
const PAYPAL_EMAIL = process.env.PAYPAL_EMAIL ?? ''
const BONUS_TIERS = [5, 10, 15, 20, 25, 30, 35]
const BREAKPOINTS = [10, 20, 50, 100, 150, 200, 300]

function calcCredits(brl: number) {
  const base = Math.floor(brl * CONV)
  const idx = BREAKPOINTS.findLastIndex(b => brl >= b)
  const pct = idx >= 0 ? BONUS_TIERS[idx] : 0
  return base + Math.floor(base * pct / 100)
}

function getBonus(brl: number) {
  const idx = BREAKPOINTS.findLastIndex(b => brl >= b)
  return idx >= 0 ? BONUS_TIERS[idx] : 0
}

export default async function PaypalPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/donate/paypal')

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5">
        <p className="text-sm font-medium text-[var(--color-game-text)] mb-3">Tabela de bônus PayPal</p>
        <div className="space-y-2">
          {PRESETS.map(v => {
            const bonus = getBonus(v)
            const credits = calcCredits(v)
            return (
              <div key={v} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-game-muted)]">R$ {v}</span>
                <span className="text-[var(--color-game-text)] font-mono">
                  {credits} WCoinC
                  {bonus > 0 && <span className="text-[var(--color-game-success)] ml-1">(+{bonus}%)</span>}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* PayPal buttons */}
      <div>
        <p className="text-sm font-medium text-[var(--color-game-text)] mb-3">Selecione o valor</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESETS.map(v => (
            <form key={v} action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value={PAYPAL_EMAIL} />
              <input type="hidden" name="currency_code" value="BRL" />
              <input type="hidden" name="item_name" value={`Doação AlkateiaMU - ${session.user.username}`} />
              <input type="hidden" name="item_number" value={`donation_${session.user.username}`} />
              <input type="hidden" name="amount" value={v} />
              <input type="hidden" name="custom" value={session.user.id} />
              <input type="hidden" name="notify_url" value={`${process.env.NEXTAUTH_URL}/api/webhooks/paypal`} />
              <input type="hidden" name="return" value={`${process.env.NEXTAUTH_URL}/usercp/my-account`} />
              <input type="hidden" name="cancel_return" value={`${process.env.NEXTAUTH_URL}/donate/paypal`} />
              <button
                type="submit"
                className="w-full bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 text-center hover:border-[var(--color-game-primary)] transition-colors group"
              >
                <div className="font-display text-lg font-bold text-[var(--color-game-text)]">R$ {v}</div>
                <div className="text-xs text-[var(--color-game-accent)]">{calcCredits(v)} WCoinC</div>
                {getBonus(v) > 0 && (
                  <div className="text-xs text-[var(--color-game-success)] mt-0.5">+{getBonus(v)}% bônus</div>
                )}
              </button>
            </form>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-[var(--color-game-muted)]">
        Você será redirecionado ao PayPal. Os créditos são adicionados automaticamente após confirmação.
      </p>
    </div>
  )
}
