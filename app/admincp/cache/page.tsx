'use client'

import { useActionState } from 'react'
import { RefreshCw, Newspaper, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { clearCache } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

const cacheGroups = [
  { tags: 'news',             label: 'Notícias',  icon: Newspaper, color: 'text-[var(--color-game-primary)]' },
  { tags: 'rankings',         label: 'Rankings',  icon: Trophy,    color: 'text-[var(--color-game-gold)]' },
  { tags: 'news,rankings',    label: 'Limpar Tudo', icon: Zap,    color: 'text-[var(--color-game-accent)]' },
]

export default function CachePage() {
  const [state, action, pending] = useActionState(clearCache, initial)

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Gerenciar Cache</h1>

      <ActionFeedback result={state.message ? state : null} />

      <div className="grid gap-3">
        {cacheGroups.map(({ tags, label, icon: Icon, color }) => (
          <div key={tags} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon size={18} className={color} />
              <span className="text-sm font-medium text-[var(--color-game-text)]">{label}</span>
            </div>
            <form action={action}>
              <input type="hidden" name="tags" value={tags} />
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                <RefreshCw size={14} /> Limpar
              </Button>
            </form>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-game-muted)]">
        Limpar o cache força a atualização dos dados na próxima visita.
        Use após publicar ou editar conteúdo.
      </p>
    </div>
  )
}
