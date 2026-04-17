import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserByUsername } from '@/lib/db/account'
import { getAccountCharacters, getMembStat } from '@/lib/db/character'
import { User, Wifi, WifiOff, Calendar, Sword, Shield, Zap } from 'lucide-react'

function StatBadge({ label, value, color = 'text-[var(--color-game-accent)]' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg p-4 text-center">
      <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
      <div className="text-xs text-[var(--color-game-muted)] mt-1">{label}</div>
    </div>
  )
}

export default async function MyAccountPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [user, characters, membStat] = await Promise.all([
    getUserByUsername(session.user.username).catch(() => null),
    getAccountCharacters(session.user.username).catch(() => []),
    getMembStat(session.user.username).catch(() => null),
  ])

  const isOnline = membStat?.ConnectStat === 1
  const lastLogin = membStat?.ConnectTM
    ? new Date(membStat.ConnectTM).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="space-y-6">
      {/* Account Card */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-full">
            <User size={28} className="text-[var(--color-game-accent)]" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-[var(--color-game-text)]">
              {session.user.username}
            </h2>
            <p className="text-sm text-[var(--color-game-muted)] mt-0.5">
              {user?.mail_addr ?? '—'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {isOnline ? (
                <span className="flex items-center gap-1.5 text-xs text-[var(--color-game-success)]">
                  <Wifi size={12} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-[var(--color-game-muted)]">
                  <WifiOff size={12} /> Offline
                </span>
              )}
              <span className="text-[var(--color-game-border-bright)]">•</span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-game-muted)]">
                <Calendar size={12} /> Último login: {lastLogin}
              </span>
            </div>
          </div>
          {session.user.adminLevel > 0 && (
            <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-game-gold)]/20 text-[var(--color-game-gold)] border border-[var(--color-game-gold)]/30">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Characters */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <h3 className="font-display text-lg font-semibold text-[var(--color-game-text)] mb-4 flex items-center gap-2">
          <Sword size={18} className="text-[var(--color-game-accent)]" />
          Personagens ({characters.length})
        </h3>

        {characters.length === 0 ? (
          <p className="text-sm text-[var(--color-game-muted)]">Nenhum personagem nesta conta.</p>
        ) : (
          <div className="space-y-3">
            {characters.map(char => (
              <div
                key={char.Name}
                className="flex flex-wrap items-center gap-4 bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-4 py-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-game-text)]">{char.Name}</p>
                  <p className="text-xs text-[var(--color-game-muted)]">{char.className}</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <StatBadge label="Level" value={char.cLevel} />
                  <StatBadge label="Resets" value={char.ResetCount} color="text-[var(--color-game-primary)]" />
                  {char.MasterResetCount > 0 && (
                    <StatBadge label="Grand R" value={char.MasterResetCount} color="text-[var(--color-game-gold)]" />
                  )}
                  <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-3 py-2">
                    <div className="text-xs text-[var(--color-game-muted)]">Pontos</div>
                    <div className="text-sm font-bold text-[var(--color-game-text)]">{char.LevelUpPoint.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats totals */}
      {characters.length > 0 && (
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
          <h3 className="font-display text-lg font-semibold text-[var(--color-game-text)] mb-4 flex items-center gap-2">
            <Shield size={18} className="text-[var(--color-game-primary)]" />
            Personagem Principal
          </h3>
          {(() => {
            const main = characters[0]
            return (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <StatBadge label="Força" value={main.Strength} />
                <StatBadge label="Agilidade" value={main.Dexterity} />
                <StatBadge label="Vitalidade" value={main.Vitality} />
                <StatBadge label="Energia" value={main.Energy} />
                {main.Leadership > 0 && <StatBadge label="Comando" value={main.Leadership} />}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
