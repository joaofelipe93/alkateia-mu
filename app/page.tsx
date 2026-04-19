import Link from 'next/link'
import {
  Swords, Newspaper, Calendar, User, Trophy, RefreshCw, Shield, ChevronRight,
} from 'lucide-react'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { HomeLoginCard } from '@/components/home/HomeLoginCard'
import { ServerInfoCard } from '@/components/home/ServerInfoCard'
import { MiniRanking } from '@/components/home/MiniRanking'
import { getNewsList } from '@/lib/db/news'
import { excerpt } from '@/lib/text'
import { getServerStats } from '@/lib/db/server-stats'
import {
  getLevelRanking,
  getResetsRanking,
  getGuildRanking,
  type RankingEntry,
} from '@/lib/db/rankings'

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p } catch { return fallback }
}

export default async function HomePage() {
  const session = await auth()

  const [news, stats, topLevel, topReset, topGuild] = await Promise.all([
    safe(getNewsList(4), [] as Awaited<ReturnType<typeof getNewsList>>),
    safe(getServerStats(), {
      totalAccounts: 0, totalCharacters: 0, totalGuilds: 0, onlineNow: 0, serverOnline: false,
    }),
    safe(getLevelRanking(5), [] as RankingEntry[]),
    safe(getResetsRanking(5), [] as RankingEntry[]),
    safe(getGuildRanking(5), [] as RankingEntry[]),
  ])

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-game-bg)] border-b border-[var(--color-game-border)]">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, var(--color-game-primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 50%, var(--color-game-accent) 0%, transparent 60%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-center">
            {/* Left: title + tagline */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Swords size={28} className="text-[var(--color-game-accent)]" />
                <span className="px-2 py-0.5 text-[10px] font-mono rounded border border-[var(--color-game-border-bright)] text-[var(--color-game-muted)]">
                  Season 8
                </span>
              </div>
              <h1
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wider mb-4 glow-accent"
                style={{ color: 'var(--color-game-accent)' }}
              >
                AlkateiaMU
              </h1>
              <p className="text-lg text-[var(--color-game-muted)] max-w-xl mb-6">
                Servidor brasileiro Season 8 com taxas equilibradas, eventos especiais e comunidade ativa.
                EXP progressiva de 200x até 350x para uma experiência justa.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Multi Client', 'Anti-Hack', 'Suporte PT-BR', 'Webshop', 'PIX'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full border border-[var(--color-game-border-bright)] text-[var(--color-game-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: login card or welcome */}
            <div>
              {session ? (
                <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border-bright)] rounded-xl p-6 shadow-xl">
                  <p className="text-xs text-[var(--color-game-muted)] mb-1">Logado como</p>
                  <p className="font-display text-xl font-bold text-[var(--color-game-text)] mb-1">
                    {session.user.username}
                  </p>
                  {session.user.adminLevel > 0 && (
                    <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-game-gold)]/20 text-[var(--color-game-gold)] border border-[var(--color-game-gold)]/30 mb-4">
                      Admin
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button variant="primary" size="md" asChild>
                      <Link href="/usercp">Painel</Link>
                    </Button>
                    <Button variant="outline" size="md" asChild>
                      <Link href="/downloads">Download</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <HomeLoginCard />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* ─── Server info + Rankings ─────────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: server info */}
          <ServerInfoCard stats={stats} />

          {/* Right: rankings grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniRanking
              title="Top Level"
              icon={Trophy}
              href="/rankings/level"
              entries={topLevel}
              valueLabel="Level"
              getValue={e => e.level ?? 0}
            />
            <MiniRanking
              title="Top Reset"
              icon={RefreshCw}
              href="/rankings/resets"
              entries={topReset}
              valueLabel="Resets"
              getValue={e => e.resets ?? 0}
            />
            <MiniRanking
              title="Top Guild"
              icon={Shield}
              href="/rankings/guilds"
              entries={topGuild}
              valueLabel="Pontos"
              getValue={e => e.score ?? 0}
            />
          </div>
        </div>
      </section>

      {/* ─── Latest news ─────────────────────────────────────── */}
      <section className="py-12 bg-[var(--color-game-surface)] border-t border-[var(--color-game-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper size={20} className="text-[var(--color-game-accent)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
                Últimas Notícias
              </h2>
            </div>
            <Link
              href="/news"
              className="flex items-center gap-1 text-sm text-[var(--color-game-primary)] hover:text-[var(--color-game-accent)] transition-colors"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-xl">
              <Newspaper size={32} className="mx-auto mb-3 text-[var(--color-game-muted)] opacity-40" />
              <p className="text-sm text-[var(--color-game-muted)]">
                Nenhuma notícia publicada ainda.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {news.map(item => (
                <Link
                  key={item.news_id}
                  href={`/news/${item.news_id}`}
                  className="group bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg p-5 hover:border-[var(--color-game-primary)] transition-colors"
                >
                  <h3 className="font-display font-semibold text-[var(--color-game-text)] group-hover:text-[var(--color-game-accent)] transition-colors mb-2 line-clamp-2">
                    {item.news_title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-game-muted)] mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(item.news_date)}</span>
                    <span className="flex items-center gap-1"><User size={11} />{item.news_author}</span>
                  </div>
                  <p className="text-sm text-[var(--color-game-muted)] leading-relaxed line-clamp-3">
                    {excerpt(item.news_content, 120)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
