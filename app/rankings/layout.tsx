import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { RANKING_TYPES } from '@/lib/db/rankings'

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Trophy size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">Rankings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-48 shrink-0">
          <nav className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
            {RANKING_TYPES.map((type, i) => (
              <Link
                key={type.key}
                href={`/rankings/${type.key}`}
                className={`block px-4 py-3 text-sm font-medium text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface-2)] transition-colors ${
                  i < RANKING_TYPES.length - 1 ? 'border-b border-[var(--color-game-border)]' : ''
                }`}
              >
                {type.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
