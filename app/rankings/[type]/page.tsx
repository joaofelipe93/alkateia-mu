import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getLevelRanking,
  getResetsRanking,
  getGrandResetsRanking,
  getGuildRanking,
  getMasterRanking,
  getGensRanking,
  RANKING_TYPES,
  type RankingEntry,
  type RankingType,
} from '@/lib/db/rankings'
import { Trophy, Crown, Sword } from 'lucide-react'

const positionColors = ['text-[var(--color-game-gold)]', 'text-slate-400', 'text-amber-700']
const positionIcons = [Crown, Trophy, Sword]

async function getRankingData(type: RankingType): Promise<RankingEntry[] | null> {
  try {
    switch (type) {
      case 'level':        return await getLevelRanking()
      case 'resets':       return await getResetsRanking()
      case 'grand-resets': return await getGrandResetsRanking()
      case 'guilds':       return await getGuildRanking()
      case 'master':       return await getMasterRanking()
      case 'gens':         return await getGensRanking()
    }
  } catch {
    return null
  }
}

interface Props {
  params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params
  const rankingType = RANKING_TYPES.find(r => r.key === type)
  if (!rankingType) return { title: 'Ranking' }
  return {
    title: `${rankingType.label} — Rankings`,
    description: `Ranking ${rankingType.label} do servidor AlkateiaMU.`,
  }
}

export default async function RankingPage({ params }: Props) {
  const { type: typeParam } = await params
  const rankingType = RANKING_TYPES.find(r => r.key === typeParam)
  if (!rankingType) notFound()

  const entries = await getRankingData(rankingType.key as RankingType)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-[var(--color-game-text)]">
          {rankingType.label}
        </h2>
        {entries && (
          <span className="text-xs text-[var(--color-game-muted)] bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded px-2 py-1">
            {entries.length} jogadores
          </span>
        )}
      </div>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
        {entries === null ? (
          <div className="text-center py-16 text-[var(--color-game-muted)]">
            <p className="font-medium mb-1">Não foi possível carregar o ranking.</p>
            <p className="text-xs">Verifique a conexão com o banco de dados.</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-game-muted)]">
            Nenhum dado disponível.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-game-border)] bg-[var(--color-game-bg)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-game-muted)] uppercase tracking-wider w-12">
                    #
                  </th>
                  {rankingType.columns.map(col => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-game-muted)] uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isTop3 = entry.position <= 3
                  const PosIcon = isTop3 ? positionIcons[entry.position - 1] : null
                  return (
                    <tr
                      key={entry.position}
                      className={`border-b border-[var(--color-game-border)] last:border-0 transition-colors hover:bg-[var(--color-game-surface-2)] ${
                        isTop3 ? 'bg-[var(--color-game-surface-2)]/50' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {PosIcon ? (
                            <PosIcon
                              size={14}
                              className={positionColors[entry.position - 1]}
                            />
                          ) : null}
                          <span className={`font-bold ${isTop3 ? positionColors[entry.position - 1] : 'text-[var(--color-game-muted)]'}`}>
                            {entry.position}
                          </span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-medium text-[var(--color-game-text)]">
                        {entry.name}
                      </td>

                      {/* Type-specific columns */}
                      {rankingType.key === 'guilds' ? (
                        <>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.guild}</td>
                          <td className="px-4 py-3 text-[var(--color-game-accent)] font-mono">{entry.score?.toLocaleString()}</td>
                        </>
                      ) : rankingType.key === 'gens' ? (
                        <>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.class}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              entry.family === 'Duprian'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {entry.family}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-game-accent)] font-mono">{entry.contribution?.toLocaleString()}</td>
                        </>
                      ) : rankingType.key === 'master' ? (
                        <>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.class}</td>
                          <td className="px-4 py-3 text-[var(--color-game-accent)] font-mono font-bold">{entry.masterLevel}</td>
                          <td className="px-4 py-3 text-[var(--color-game-muted)] font-mono">{entry.resets}</td>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.guild || '—'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.class}</td>
                          <td className="px-4 py-3 text-[var(--color-game-accent)] font-mono font-bold">{entry.level}</td>
                          <td className="px-4 py-3 text-[var(--color-game-muted)] font-mono">{entry.resets}</td>
                          <td className="px-4 py-3 text-[var(--color-game-muted)] font-mono">{entry.grandResets}</td>
                          <td className="px-4 py-3 text-[var(--color-game-muted)]">{entry.guild || '—'}</td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
