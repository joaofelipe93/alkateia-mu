import Link from 'next/link'
import type { Metadata } from 'next'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Doações',
  description: 'Apoie o servidor AlkateiaMU e receba WCoinC para usar na loja.',
}

const methods = [
  { href: '/donate/pix',         label: 'PIX',         emoji: '⚡' },
  { href: '/donate/mercadopago', label: 'MercadoPago', emoji: '💳' },
  { href: '/donate/paypal',      label: 'PayPal',      emoji: '🌐' },
]

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">Doações</h1>
      </div>
      <p className="text-sm text-[var(--color-game-muted)] mb-8">
        Apoie o servidor e receba <strong className="text-[var(--color-game-accent)]">WCoinC</strong> para usar na loja.
      </p>

      {/* Method tabs */}
      <div className="flex gap-2 mb-8 border-b border-[var(--color-game-border)] pb-0">
        {methods.map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--color-game-muted)] hover:text-[var(--color-game-text)] border-b-2 border-transparent hover:border-[var(--color-game-primary)] transition-colors -mb-px"
          >
            <span>{emoji}</span>
            {label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
