import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Coins } from 'lucide-react'
import { getCashShopBalance } from '@/lib/db/webshop'
import { getCreditConfig, getCredits } from '@/lib/db/credits'

const tabs = [
  { href: '/usercp/webshop/basic', label: 'Básica',       badge: null },
  { href: '/usercp/webshop/semi',  label: 'Semi-Premium', badge: 'Popular' },
  { href: '/usercp/webshop/full',  label: 'Full-Premium', badge: null },
]

export default async function WebshopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  // Buscar saldos em paralelo
  const [wcoinP, creditConfig] = await Promise.all([
    getCashShopBalance(session.user.username).catch(() => 0),
    getCreditConfig(parseInt(process.env.PIX_CREDIT_CONFIG_ID ?? '1')).catch(() => null),
  ])
  const wcoinC = creditConfig
    ? await getCredits(creditConfig, session.user.username).catch(() => 0)
    : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag size={22} className="text-[var(--color-game-accent)]" />
        <h2 className="font-display text-xl font-bold text-[var(--color-game-text)]">Web Shop</h2>
      </div>

      {/* Saldo */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-lg px-4 py-2">
          <Coins size={15} className="text-[var(--color-game-gold)]" />
          <span className="text-sm text-[var(--color-game-muted)]">WCoinP:</span>
          <span className="font-bold text-[var(--color-game-text)]">{wcoinP.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-lg px-4 py-2">
          <Coins size={15} className="text-[var(--color-game-accent)]" />
          <span className="text-sm text-[var(--color-game-muted)]">WCoinC:</span>
          <span className="font-bold text-[var(--color-game-text)]">{wcoinC.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-game-border)] mb-6">
        {tabs.map(({ href, label, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] border-b-2 border-transparent hover:border-[var(--color-game-primary)] transition-colors -mb-px"
          >
            {label}
            {badge && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--color-game-primary)]/20 text-[var(--color-game-accent)] rounded-full">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
