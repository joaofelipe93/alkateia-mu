'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { updateNews, deleteNews } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

export function EditNewsClient({ news }: { news: Record<string, unknown> }) {
  const [editState, editAction, editPending] = useActionState(updateNews, initial)
  const [delState,  delAction,  delPending]  = useActionState(deleteNews, initial)

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admincp/news" className="text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Editar Notícia</h1>
      </div>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 space-y-4">
        {editState.message && <ActionFeedback result={editState} />}
        {delState.message  && <ActionFeedback result={delState} />}

        <form action={editAction} className="space-y-4">
          <input type="hidden" name="id" value={String(news.news_id)} />
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Título</label>
            <Input name="title" defaultValue={String(news.news_title ?? '')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Autor</label>
            <Input name="author" defaultValue={String(news.news_author ?? '')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Conteúdo</label>
            <textarea name="content" required rows={10} defaultValue={String(news.news_content ?? '')}
              className="flex w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 py-2 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none resize-y min-h-[200px]"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={editPending}>
              <Save size={16} /> {editPending ? 'Salvando...' : 'Salvar'}
            </Button>
            <form action={delAction}>
              <input type="hidden" name="id" value={String(news.news_id)} />
              <Button type="submit" variant="danger" size="lg" disabled={delPending}><Trash2 size={16} /></Button>
            </form>
          </div>
        </form>
      </div>
    </div>
  )
}
