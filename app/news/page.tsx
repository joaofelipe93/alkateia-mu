import Link from 'next/link'
import type { Metadata } from 'next'
import { getNewsList, getNewsCount } from '@/lib/db/news'
import { excerpt } from '@/lib/text'
import { Newspaper, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias, atualizações e eventos do servidor AlkateiaMU.',
}

const PAGE_SIZE = 10

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const offset = (page - 1) * PAGE_SIZE

  const [news, total] = await Promise.all([
    getNewsList(PAGE_SIZE, offset),
    getNewsCount(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Newspaper size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">
          Notícias
        </h1>
      </div>

      {/* List */}
      {news.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-game-muted)]">
          Nenhuma notícia encontrada.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map(item => (
            <Link
              key={item.news_id}
              href={`/news/${item.news_id}`}
              className="block bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 hover:border-[var(--color-game-primary)] transition-colors group"
            >
              <h2 className="font-display text-xl font-semibold text-[var(--color-game-text)] group-hover:text-[var(--color-game-accent)] transition-colors mb-2">
                {item.news_title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[var(--color-game-muted)] mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(item.news_date)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {item.news_author}
                </span>
              </div>
              <p className="text-sm text-[var(--color-game-muted)] leading-relaxed">
                {excerpt(item.news_content)}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <Button variant="outline" size="sm" asChild disabled={page <= 1}>
            <Link href={`/news?page=${page - 1}`}>
              <ChevronLeft size={16} /> Anterior
            </Link>
          </Button>
          <span className="text-sm text-[var(--color-game-muted)]">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
            <Link href={`/news?page=${page + 1}`}>
              Próxima <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
