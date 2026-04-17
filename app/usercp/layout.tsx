import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  User, Sword, Key, Mail, Zap, RotateCcw, RefreshCw,
  Anchor, Shield, ShoppingBag, Star, Gift, LogOut,
} from 'lucide-react'
import { signOut } from '@/auth'

const menuItems = [
  { href: '/usercp/my-account',  label: 'Minha Conta',        icon: User },
  { href: '/usercp/characters',  label: 'Personagens',         icon: Sword },
  { href: '/usercp/my-password', label: 'Alterar Senha',       icon: Key },
  { href: '/usercp/add-stats',   label: 'Adicionar Stats',     icon: Zap },
  { href: '/usercp/reset-stats', label: 'Resetar Stats',       icon: RotateCcw },
  { href: '/usercp/reset',       label: 'Reset Personagem',    icon: RefreshCw },
  { href: '/usercp/unstick',     label: 'Unstick',             icon: Anchor },
  { href: '/usercp/clear-pk',    label: 'Limpar PK',           icon: Shield },
  { href: '/usercp/webshop',     label: 'Loja',                icon: ShoppingBag },
  { href: '/usercp/vote',        label: 'Votar',               icon: Star },
  { href: '/usercp/gift-code',   label: 'Gift Code',           icon: Gift },
]

export default async function UsercpLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
          Painel do Jogador —{' '}
          <span style={{ color: 'var(--color-game-accent)' }}>{session.user.username}</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0">
          <nav className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
            {menuItems.map(({ href, label, icon: Icon }, i) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface-2)] transition-colors ${
                  i < menuItems.length - 1 ? 'border-b border-[var(--color-game-border)]' : ''
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}

            {/* Logout */}
            <div className="border-t border-[var(--color-game-border)]">
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-game-error)] hover:bg-[var(--color-game-surface-2)] transition-colors"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
