import Link from 'next/link'
import { Swords, Zap, Star, TrendingUp, Server, Newspaper, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/CopyButton'
import { getNewsList } from '@/lib/db/news'

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function excerpt(content: string, max = 120) {
  const stripped = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return stripped.length > max ? stripped.slice(0, max) + '…' : stripped
}

async function LatestNews() {
  let news: Awaited<ReturnType<typeof getNewsList>> = []
  try {
    news = await getNewsList(3)
  } catch {
    // DB pode não estar disponível em dev sem conexão
  }

  if (news.length === 0) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg p-5"
          >
            <div className="h-3 bg-[var(--color-game-border-bright)] rounded mb-3" />
            <div className="h-2 bg-[var(--color-game-border)] rounded mb-2 w-3/4" />
            <div className="h-2 bg-[var(--color-game-border)] rounded w-1/2" />
            <div className="mt-4 space-y-1.5">
              <div className="h-2 bg-[var(--color-game-border)] rounded" />
              <div className="h-2 bg-[var(--color-game-border)] rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
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
          <p className="text-sm text-[var(--color-game-muted)] leading-relaxed">
            {excerpt(item.news_content)}
          </p>
        </Link>
      ))}
    </div>
  )
}

export default function HomePage() {
  const stats = [
    { label: 'Experiência', value: '200x ~ 350x', icon: Zap },
    { label: 'Master EXP', value: '10x ~ 15x', icon: Star },
    { label: 'Drop Rate', value: '10% ~ 25%', icon: TrendingUp },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-game-bg)]">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(ellipse at 50% 0%, var(--color-game-primary) 0%, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(ellipse at 80% 50%, var(--color-game-accent) 0%, transparent 60%)` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Swords size={40} className="text-[var(--color-game-accent)]" />
          </div>
          <h1
            className="font-display text-5xl sm:text-7xl font-bold tracking-wider mb-4 glow-accent"
            style={{ color: 'var(--color-game-accent)' }}
          >
            AlkateiaMU
          </h1>
          <p className="text-xl text-[var(--color-game-muted)] mb-3">Season 8 • Servidor Brasileiro</p>
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="h-2 w-2 rounded-full bg-[var(--color-game-success)] animate-pulse" />
            <span className="text-sm text-[var(--color-game-success)] font-medium">Servidor Online</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="accent" size="lg" asChild>
              <Link href="/downloads"><Swords size={18} />Jogar Agora</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-lg p-4 text-center"
              >
                <Icon size={20} className="text-[var(--color-game-accent)] mx-auto mb-2" />
                <div className="text-lg font-bold font-display text-[var(--color-game-text)]">{value}</div>
                <div className="text-xs text-[var(--color-game-muted)] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-line" />

      {/* Server info */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-game-text)] mb-4">
              Entre no mundo de{' '}
              <span style={{ color: 'var(--color-game-accent)' }}>MU Online</span>
            </h2>
            <p className="text-[var(--color-game-muted)] leading-relaxed mb-6">
              AlkateiaMU é um servidor privado Season 8 com taxas equilibradas, eventos especiais e
              uma comunidade ativa. EXP progressiva de 200x até 350x para uma experiência justa.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Season 8', 'Multi Client', 'Anti-Hack', 'Suporte PT-BR'].map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full border border-[var(--color-game-border-bright)] text-[var(--color-game-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Server connect */}
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server size={18} className="text-[var(--color-game-accent)]" />
              <h3 className="font-semibold text-[var(--color-game-text)]">Conectar ao Servidor</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'IP do Servidor', value: '66.70.148.55' },
                { label: 'Porta', value: '44405' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-[var(--color-game-bg)] rounded px-4 py-2.5 border border-[var(--color-game-border)]"
                >
                  <div>
                    <div className="text-xs text-[var(--color-game-muted)]">{label}</div>
                    <div className="font-mono text-sm text-[var(--color-game-accent)]">{value}</div>
                  </div>
                  <CopyButton value={value} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="py-16 bg-[var(--color-game-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Newspaper size={20} className="text-[var(--color-game-accent)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
                Últimas Notícias
              </h2>
            </div>
            <Link
              href="/news"
              className="text-sm text-[var(--color-game-primary)] hover:text-[var(--color-game-accent)] transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          <LatestNews />
        </div>
      </section>
    </div>
  )
}
