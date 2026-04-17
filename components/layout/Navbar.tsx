'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, Swords, ChevronDown, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/cn'

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'news', href: '/news' },
  { key: 'rankings', href: '/rankings' },
  { key: 'downloads', href: '/downloads' },
  { key: 'donate', href: '/donate' },
]

export function Navbar() {
  const t = useTranslations('nav')
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-game-surface)]/95 backdrop-blur border-b border-[var(--color-game-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Swords
              size={24}
              className="text-[var(--color-game-accent)] group-hover:rotate-12 transition-transform duration-200"
            />
            <span
              className="font-display text-xl font-bold tracking-wider glow-accent"
              style={{ color: 'var(--color-game-accent)' }}
            >
              AlkateiaMU
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded',
                  isActive(link.href)
                    ? 'text-[var(--color-game-accent)] bg-[var(--color-game-surface-2)]'
                    : 'text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)]'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--color-game-border-bright)] text-[var(--color-game-text)] hover:border-[var(--color-game-primary)] transition-colors text-sm"
                >
                  <User size={16} className="text-[var(--color-game-accent)]" />
                  <span>{session.user.username}</span>
                  <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface-2)] shadow-xl">
                    <Link
                      href="/usercp"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-game-text)] hover:bg-[var(--color-game-surface)] hover:text-[var(--color-game-accent)] transition-colors"
                    >
                      <User size={14} />
                      {t('usercp')}
                    </Link>
                    {session.user.adminLevel > 0 && (
                      <Link
                        href="/admincp"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-game-text)] hover:bg-[var(--color-game-surface)] hover:text-[var(--color-game-accent)] transition-colors"
                      >
                        {t('admincp')}
                      </Link>
                    )}
                    <div className="border-t border-[var(--color-game-border)] my-1" />
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-game-error)] hover:bg-[var(--color-game-surface)] transition-colors"
                    >
                      <LogOut size={14} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('login')}</Link>
                </Button>
                <Button variant="accent" size="sm" asChild>
                  <Link href="/register">{t('register')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Gradient line */}
      <div className="gradient-line" />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-game-surface-2)] border-b border-[var(--color-game-border)]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] transition-colors"
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="border-t border-[var(--color-game-border)] pt-3 mt-3 flex flex-col gap-2">
              {session ? (
                <>
                  <Link href="/usercp" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t('usercp')}</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[var(--color-game-error)]"
                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t('login')}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="accent" size="sm" className="w-full">{t('register')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
