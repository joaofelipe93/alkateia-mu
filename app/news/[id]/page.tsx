import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getNewsById } from '@/lib/db/news'
import { stripHtml } from '@/lib/text'
import { Calendar, User, ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const newsId = parseInt(id)
  if (isNaN(newsId)) return { title: 'Notícia não encontrada' }
  const news = await getNewsById(newsId).catch(() => null)
  if (!news) return { title: 'Notícia não encontrada' }

  const stripped = stripHtml(news.news_content).slice(0, 160)
  return {
    title: news.news_title,
    description: stripped,
    openGraph: { title: news.news_title, description: stripped, type: 'article' },
  }
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params
  const newsId = parseInt(id)
  if (isNaN(newsId)) notFound()

  const news = await getNewsById(newsId)
  if (!news) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Voltar para notícias
      </Link>

      {/* Article */}
      <article className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--color-game-border)]">
          <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)] leading-tight mb-4">
            {news.news_title}
          </h1>
          <div className="flex items-center gap-5 text-sm text-[var(--color-game-muted)]">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(news.news_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {news.news_author}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className="px-8 py-8 prose prose-invert max-w-none
            [&_p]:text-[var(--color-game-muted)] [&_p]:leading-relaxed [&_p]:mb-4
            [&_h2]:font-display [&_h2]:text-[var(--color-game-text)] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:font-display [&_h3]:text-[var(--color-game-text)] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-[var(--color-game-muted)] [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-[var(--color-game-muted)] [&_ol]:space-y-1
            [&_strong]:text-[var(--color-game-text)] [&_strong]:font-semibold
            [&_a]:text-[var(--color-game-accent)] [&_a]:underline
            [&_img]:rounded-lg [&_img]:border [&_img]:border-[var(--color-game-border)]"
          dangerouslySetInnerHTML={{ __html: news.news_content }}
        />
      </article>
    </div>
  )
}
