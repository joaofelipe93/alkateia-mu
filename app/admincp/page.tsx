import { Users, Wifi, AlertTriangle, BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { getDashboardStats } from '@/lib/db/admin'
import { getLatestBans } from '@/lib/db/admin'

export default async function AdminDashboard() {
  const [stats, bans] = await Promise.all([
    getDashboardStats().catch(() => ({ totalAccounts: 0, onlineNow: 0, newToday: 0, totalBans: 0 })),
    getLatestBans(5).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Contas" value={stats.totalAccounts.toLocaleString()} icon={Users} />
        <StatCard label="Online Agora"    value={stats.onlineNow}    icon={Wifi}  color="text-[var(--color-game-success)]" />
        <StatCard label="Novos Hoje"      value={stats.newToday}     icon={BarChart3} color="text-[var(--color-game-primary)]" />
        <StatCard label="Bans Ativos"     value={stats.totalBans}    icon={AlertTriangle} color="text-[var(--color-game-error)]" />
      </div>

      {/* Últimos bans */}
      {bans.length > 0 && (
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5">
          <h2 className="font-display text-lg font-semibold text-[var(--color-game-text)] mb-4">Últimos Bans</h2>
          <div className="space-y-2">
            {bans.map((ban: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-game-border)] last:border-0">
                <span className="text-sm font-medium text-[var(--color-game-text)]">{String(ban.username ?? '—')}</span>
                <span className="text-xs text-[var(--color-game-muted)]">{String(ban.reason ?? '—')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
