'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { publishNews } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

export default function NewNewsPage() {
  const [state, action, pending] = useActionState(publishNews, initial)

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admincp/news" className="text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Publicar Notícia</h1>
      </div>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 space-y-4">
        <ActionFeedback result={state.message ? state : null} />

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Título</label>
            <Input name="title" placeholder="Título da notícia" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Autor</label>
            <Input name="author" placeholder="Administrator" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Conteúdo</label>
            <textarea name="content" required rows={10}
              placeholder="Escreva o conteúdo da notícia aqui... HTML é suportado."
              className="flex w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 py-2 text-sm text-[var(--color-game-text)] placeholder:text-[var(--color-game-muted)] focus:border-[var(--color-game-primary)] focus:outline-none resize-y min-h-[200px]"
            />
          </div>
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
            <Send size={16} /> {pending ? 'Publicando...' : 'Publicar notícia'}
          </Button>
        </form>
      </div>
    </div>
  )
}
