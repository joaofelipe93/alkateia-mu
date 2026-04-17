'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from './ActionFeedback'
import { CharacterSelect } from './CharacterSelect'
import type { CharacterData } from '@/lib/db/character'
import type { ActionResult } from '@/lib/actions/character'
import type { ReactNode } from 'react'

interface Props {
  title: string
  icon: ReactNode
  description: string
  characters: CharacterData[]
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>
  submitLabel: string
  confirmText?: string
  danger?: boolean
}

const initial: ActionResult = { success: false, message: '' }

export function SimpleCharacterAction({
  title, icon, description, characters, action,
  submitLabel, confirmText, danger = false,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial)

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h2>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <ActionFeedback result={state.message ? state : null} />

        <p className="text-sm text-[var(--color-game-muted)] mb-4 leading-relaxed">{description}</p>

        <div className="mb-4 p-3 bg-[var(--color-game-primary)]/10 border border-[var(--color-game-primary)]/30 rounded-lg text-xs text-[var(--color-game-muted)]">
          Sua conta precisa estar <strong className="text-[var(--color-game-text)]">offline</strong> para realizar esta ação.
        </div>

        {characters.length === 0 ? (
          <p className="text-sm text-[var(--color-game-muted)]">Nenhum personagem encontrado.</p>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Personagem</label>
              <CharacterSelect characters={characters} />
            </div>

            <Button
              type="submit"
              variant={danger ? 'danger' : 'primary'}
              size="lg"
              className="w-full"
              disabled={pending}
              onClick={confirmText ? (e) => {
                if (!confirm(confirmText)) e.preventDefault()
              } : undefined}
            >
              {pending ? 'Processando...' : submitLabel}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
