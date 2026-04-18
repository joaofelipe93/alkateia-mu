import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight, Trophy } from 'lucide-react'
import type { RankingEntry } from '@/lib/db/rankings'

interface Props {
  title: string
  icon: LucideIcon
  href: string
  entries: RankingEntry[]
  valueLabel: string
  getValue: (e: RankingEntry) => string | number
}

function medalColor(pos: number) {
  if (pos === 1) return 'text-[var(--color-game-gold)] border-[var(--color-game-gold)]/50 bg-[var(--color-game-gold)]/10'
  if (pos === 2) return 'text-[var(--color-game-text)] border-[var(--color-game-border-bright)] bg-[var(--color-game-surface-2)]'
  if (pos === 3) return 'text-[#cd7f32] border-[#cd7f32]/40 bg-[#cd7f32]/10'
  return 'text-[var(--color-game-muted)] border-[var(--color-game-border)] bg-[var(--color-game-bg)]'
}

export function MiniRanking({ title, icon: Icon, href, entries, valueLabel, getValue }: Props) {
  return (
    <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-game-border)]">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[var(--color-game-accent)]" />
          <h3 className="font-display font-semibold text-sm text-[var(--color-game-text)]">{title}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-game-muted)]">
          {valueLabel}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-[var(--color-game-muted)]">
          <Trophy size={28} className="opacity-30 mb-2" />
          <p className="text-xs">Sem dados</p>
        </div>
      ) : (
        <ul className="flex-1">
          {entries.slice(0, 5).map(entry => (
            <li
              key={`${entry.position}-${entry.name}`}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-game-border)] last:border-b-0 hover:bg-[var(--color-game-surface-2)] transition-colors"
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-[11px] font-bold ${medalColor(entry.position)}`}>
                {entry.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--color-game-text)] truncate">
                  {entry.name}
                </div>
                {entry.class && (
                  <div className="text-[10px] text-[var(--color-game-muted)] truncate">{entry.class}</div>
                )}
              </div>
              <div className="text-sm font-bold font-display text-[var(--color-game-accent)] tabular-nums">
                {getValue(entry).toLocaleString?.('pt-BR') ?? getValue(entry)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={href}
        className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-[var(--color-game-primary)] hover:text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface-2)] border-t border-[var(--color-game-border)] transition-colors"
      >
        Ver ranking completo
        <ChevronRight size={12} />
      </Link>
    </div>
  )
}
