import { useTranslations } from 'next-intl'
import { Swords } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')

  const socialLinks = [
    { label: t('discord'), href: 'https://discord.com/invite/wVp4WeW5', icon: '🎮' },
    { label: t('instagram'), href: 'https://www.instagram.com/alkateiamu', icon: '📷' },
    { label: t('whatsapp'), href: 'https://chat.whatsapp.com/CiAB3dti5s82vpJVK3ZMYb', icon: '💬' },
  ]

  return (
    <footer className="bg-[var(--color-game-surface)] border-t border-[var(--color-game-border)] mt-auto">
      <div className="gradient-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Swords size={20} className="text-[var(--color-game-accent)]" />
              <span className="font-display text-lg font-bold text-[var(--color-game-accent)]">
                AlkateiaMU
              </span>
            </div>
            <p className="text-xs text-[var(--color-game-muted)] leading-relaxed">
              Season 8 • Servidor Brasileiro
            </p>
            <p className="text-xs text-[var(--color-game-muted)] mt-1">
              EXP: 200x ~ 350x • Drop: 10% ~ 25%
            </p>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-game-text)] mb-3">
              {t('community')}
            </h3>
            <ul className="space-y-2">
              {socialLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] transition-colors flex items-center gap-2"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Server info */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-game-text)] mb-3">
              Servidor
            </h3>
            <div className="space-y-1 text-xs text-[var(--color-game-muted)]">
              <p>IP: <span className="text-[var(--color-game-accent)] font-mono">66.70.148.55</span></p>
              <p>Porta: <span className="text-[var(--color-game-accent)] font-mono">44405</span></p>
              <p>Season 8 • XTeam Files</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-game-border)] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-[var(--color-game-muted)]">
            © {new Date().getFullYear()} AlkateiaMU. {t('rights')}
          </p>
          <p className="text-xs text-[var(--color-game-muted)]">
            {t('not_affiliated')}
          </p>
        </div>
      </div>
    </footer>
  )
}
