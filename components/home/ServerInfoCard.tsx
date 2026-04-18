import { Server, Users, Swords, Shield, Zap, Star, TrendingUp, Activity, Wifi } from 'lucide-react'
import type { ServerStats } from '@/lib/db/server-stats'

interface Props {
  stats: ServerStats
}

export function ServerInfoCard({ stats }: Props) {
  const { totalAccounts, totalCharacters, totalGuilds, onlineNow, serverOnline } = stats

  const rates = [
    { label: 'Experiência', value: '200x ~ 350x', icon: Zap },
    { label: 'Master EXP',  value: '10x ~ 15x',   icon: Star },
    { label: 'Drop Rate',   value: '10% ~ 25%',   icon: TrendingUp },
  ]

  const counters = [
    { label: 'Jogadores Online',       value: onlineNow,       icon: Wifi,   highlight: true },
    { label: 'Contas Cadastradas',     value: totalAccounts,   icon: Users },
    { label: 'Personagens',            value: totalCharacters, icon: Swords },
    { label: 'Guilds',                  value: totalGuilds,     icon: Shield },
  ]

  return (
    <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--color-game-border)]">
        <div className="flex items-center gap-2">
          <Server size={18} className="text-[var(--color-game-accent)]" />
          <h3 className="font-display font-semibold text-[var(--color-game-text)]">Servidor</h3>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded border border-[var(--color-game-border-bright)] text-[var(--color-game-muted)]">
            Season 8
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${serverOnline ? 'text-[var(--color-game-success)]' : 'text-[var(--color-game-error)]'}`}>
          <span className={`h-2 w-2 rounded-full ${serverOnline ? 'bg-[var(--color-game-success)] animate-pulse' : 'bg-[var(--color-game-error)]'}`} />
          {serverOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Rates */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-game-muted)] mb-2">
          Taxas
        </p>
        <div className="grid grid-cols-3 gap-2">
          {rates.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg p-3 text-center"
            >
              <Icon size={14} className="text-[var(--color-game-accent)] mx-auto mb-1" />
              <div className="text-sm font-bold font-display text-[var(--color-game-text)]">{value}</div>
              <div className="text-[10px] text-[var(--color-game-muted)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-game-muted)] mb-2">
          Estatísticas
        </p>
        <div className="grid grid-cols-2 gap-2">
          {counters.map(({ label, value, icon: Icon, highlight }) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
                highlight
                  ? 'bg-[var(--color-game-primary)]/10 border-[var(--color-game-primary)]/40'
                  : 'bg-[var(--color-game-bg)] border-[var(--color-game-border)]'
              }`}
            >
              <Icon size={16} className={highlight ? 'text-[var(--color-game-accent)]' : 'text-[var(--color-game-muted)]'} />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--color-game-text)] font-display">
                  {value.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-[var(--color-game-muted)] truncate">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-game-border)] flex items-center gap-1.5 text-[10px] text-[var(--color-game-muted)]">
        <Activity size={11} />
        Atualizado a cada 60 segundos
      </div>
    </div>
  )
}
