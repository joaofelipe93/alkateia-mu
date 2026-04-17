'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { deleteNews } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function NewsListClient({ news }: { news: Record<string, unknown>[] }) {
  const [state, action, pending] = useActionState(deleteNews, initial)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Notícias</h1>
        <Link href="/admincp/news/new">
          <Button variant="accent" size="sm"><Plus size={16} /> Publicar</Button>
        </Link>
      </div>

      {state.message && <ActionFeedback result={state} />}

      <div className="space-y-3">
        {news.length === 0 ? (
          <p className="text-center py-12 text-[var(--color-game-muted)]">Nenhuma notícia cadastrada.</p>
        ) : news.map(item => (
          <div key={String(item.news_id)} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--color-game-text)] truncate">{String(item.news_title ?? '—')}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-game-muted)]">
                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(item.news_date as number)}</span>
                <span className="flex items-center gap-1"><User size={11} />{String(item.news_author ?? '—')}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/admincp/news/${item.news_id}`}>
                <Button variant="outline" size="sm"><Pencil size={14} /></Button>
              </Link>
              <form action={action}>
                <input type="hidden" name="id" value={String(item.news_id)} />
                <Button type="submit" variant="danger" size="sm" disabled={pending}><Trash2 size={14} /></Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
