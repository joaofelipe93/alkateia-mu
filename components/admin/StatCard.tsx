import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  sub?: string
}

export function StatCard({ label, value, icon: Icon, color = 'text-[var(--color-game-accent)]', sub }: Props) {
  return (
    <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[var(--color-game-muted)]">{label}</p>
        <Icon size={18} className={color} />
      </div>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--color-game-muted)] mt-1">{sub}</p>}
    </div>
  )
}
