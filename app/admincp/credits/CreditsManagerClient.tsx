'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { manageCredits } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

export function CreditsManagerClient({ configs }: { configs: Record<string, unknown>[] }) {
  const [state, action, pending] = useActionState(manageCredits, initial)

  return (
    <div className="space-y-5 max-w-md">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Gerenciar Créditos</h1>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 space-y-4">
        <ActionFeedback result={state.message ? state : null} />

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Sistema de créditos</label>
            <select name="configId" required
              className="flex h-10 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none">
              {configs.map(c => (
                <option key={String(c.config_id)} value={String(c.config_id)}>
                  {String(c.config_title ?? c.config_id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Identificador</label>
            <Input name="identifier" placeholder="username" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Quantidade</label>
            <Input name="amount" type="number" min={1} placeholder="100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Operação</label>
            <div className="flex gap-3">
              {[{ val: 'add', label: '+ Adicionar' }, { val: 'subtract', label: '− Subtrair' }].map(({ val, label }) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="transaction" value={val} defaultChecked={val === 'add'}
                    className="accent-[var(--color-game-primary)]" />
                  <span className="text-sm text-[var(--color-game-text)]">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Processando...' : 'Executar operação'}
          </Button>
        </form>
      </div>
    </div>
  )
}
