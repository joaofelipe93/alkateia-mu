import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

const sidebar = [
  {
    label: 'Contas',
    items: [
      { href: '/admincp/accounts',           label: 'Buscar conta' },
      { href: '/admincp/accounts?mode=ip',   label: 'Buscar por IP' },
      { href: '/admincp/accounts?mode=online', label: 'Online agora' },
    ],
  },
  {
    label: 'Personagens',
    items: [
      { href: '/admincp/characters', label: 'Buscar' },
    ],
  },
  {
    label: 'Banimentos',
    items: [
      { href: '/admincp/bans',          label: 'Gerenciar bans' },
    ],
  },
  {
    label: 'Créditos',
    items: [
      { href: '/admincp/credits',      label: 'Manager' },
      { href: '/admincp/credits/logs', label: 'Logs' },
    ],
  },
  {
    label: 'Notícias',
    items: [
      { href: '/admincp/news/new', label: 'Publicar' },
      { href: '/admincp/news',     label: 'Gerenciar' },
    ],
  },
  {
    label: 'Doações',
    items: [
      { href: '/admincp/donations', label: 'Histórico' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admincp/cache',    label: 'Cache' },
      { href: '/admincp/cron',     label: 'Cron Jobs' },
      { href: '/admincp/settings', label: 'Configurações' },
    ],
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.adminLevel < 1) redirect('/')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-game-border)]">
        <Shield size={20} className="text-[var(--color-game-gold)]" />
        <span className="font-display text-lg font-bold text-[var(--color-game-text)]">Admin Panel</span>
        <span className="text-xs text-[var(--color-game-muted)]">— {session.user.username}</span>
        <Link href="/" className="ml-auto text-xs text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] transition-colors">
          ← Voltar ao site
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <Link href="/admincp" className="block mb-4 px-3 py-2 text-sm font-medium text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface)] rounded transition-colors">
            Dashboard
          </Link>
          {sidebar.map(({ label, items }) => (
            <div key={label} className="mb-4">
              <p className="px-3 py-1 text-xs font-semibold text-[var(--color-game-muted)] uppercase tracking-wider">
                {label}
              </p>
              <nav className="mt-1 bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
                {items.map(({ href, label: itemLabel }, i) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-4 py-2.5 text-xs font-medium text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface-2)] transition-colors ${i < items.length - 1 ? 'border-b border-[var(--color-game-border)]' : ''}`}
                  >
                    {itemLabel}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
