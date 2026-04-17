import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { Sword, MapPin } from 'lucide-react'

const MAP_NAMES: Record<number, string> = {
  0: 'Lorencia', 1: 'Dungeon', 2: 'Devias', 3: 'Noria', 4: 'Lost Tower',
  7: 'Atlans', 8: 'Tarkan', 9: 'Devil Square', 10: 'Icarus', 33: 'Aida',
  34: 'Crywolf Fortress', 36: 'Kanturu Relics', 37: 'Kanturu Ruins',
  38: 'Kanturu Event', 39: 'Valle of Loren', 45: 'Vulcanus', 46: 'Duel Arena',
  49: 'Elbeland', 51: 'Swamp of Quiet', 52: 'Raklion', 56: 'Karutan 1',
  57: 'Karutan 2', 62: 'Nars',
}

function getMapName(mapId: number): string {
  return MAP_NAMES[mapId] ?? `Mapa ${mapId}`
}

function getPKStatus(pkLevel: number): { label: string; color: string } {
  if (pkLevel <= 3) return { label: 'Normal', color: 'text-[var(--color-game-success)]' }
  if (pkLevel === 4) return { label: 'PK (Laranja)', color: 'text-orange-400' }
  if (pkLevel === 5) return { label: 'PK (Vermelho)', color: 'text-red-500' }
  return { label: 'PK (Escuro)', color: 'text-red-700' }
}

export default async function CharactersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const characters = await getAccountCharacters(session.user.username).catch(() => [])

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-6 flex items-center gap-2">
        <Sword size={20} className="text-[var(--color-game-accent)]" />
        Meus Personagens
      </h2>

      {characters.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-game-muted)] bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl">
          Nenhum personagem encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {characters.map(char => {
            const pk = getPKStatus(char.PkLevel)
            return (
              <div
                key={char.Name}
                className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 hover:border-[var(--color-game-primary)] transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--color-game-text)]">{char.Name}</h3>
                    <p className="text-sm text-[var(--color-game-muted)]">{char.className}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-game-primary)]/20 text-[var(--color-game-accent)] border border-[var(--color-game-primary)]/30">
                      Lv {char.cLevel}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-game-surface-2)] text-[var(--color-game-muted)] border border-[var(--color-game-border)]">
                      {char.ResetCount}R
                    </span>
                    {char.MasterResetCount > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-game-gold)]/20 text-[var(--color-game-gold)] border border-[var(--color-game-gold)]/30">
                        {char.MasterResetCount} GR
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${pk.color}`}>
                      {pk.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Força', v: char.Strength },
                    { label: 'Agilidade', v: char.Dexterity },
                    { label: 'Vitalidade', v: char.Vitality },
                    { label: 'Energia', v: char.Energy },
                    ...(char.Leadership > 0 ? [{ label: 'Comando', v: char.Leadership }] : []),
                    { label: 'Pontos Livres', v: char.LevelUpPoint },
                    { label: 'Zen', v: char.Money.toLocaleString() },
                  ].map(({ label, v }) => (
                    <div key={label} className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded px-3 py-2">
                      <div className="text-xs text-[var(--color-game-muted)]">{label}</div>
                      <div className="text-sm font-bold text-[var(--color-game-text)]">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--color-game-muted)]">
                  <MapPin size={12} />
                  {getMapName(char.MapNumber)} ({char.MapPosX}, {char.MapPosY})
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
