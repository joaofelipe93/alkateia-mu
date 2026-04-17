'use client'

import { useActionState } from 'react'
import { Play, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { toggleCron, runCronNow } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

export function CronClient({ jobs }: { jobs: Record<string, unknown>[] }) {
  const [toggleState, toggleAction, togglePending] = useActionState(toggleCron, initial)
  const [runState,    runAction,    runPending]     = useActionState(runCronNow, initial)

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Cron Jobs</h1>

      {toggleState.message && <ActionFeedback result={toggleState} />}
      {runState.message    && <ActionFeedback result={runState} />}

      {jobs.length === 0 ? (
        <p className="text-center py-12 text-[var(--color-game-muted)]">Nenhum cron job cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={String(job.id)} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--color-game-text)]">{String(job.cron_name ?? job.id)}</p>
                  <p className="text-xs text-[var(--color-game-muted)] mt-0.5">{String(job.cron_description ?? '')}</p>
                  <p className="text-xs text-[var(--color-game-muted)] mt-1">
                    Intervalo: {String(job.cron_run_time ?? '—')}s
                    {job.cron_last_run ? ` • Último: ${new Date((job.cron_last_run as number) * 1000).toLocaleString('pt-BR')}` : ' • Nunca'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={runAction}>
                    <input type="hidden" name="id" value={String(job.id)} />
                    <Button type="submit" variant="outline" size="sm" disabled={runPending}>
                      <Play size={12} /> Run
                    </Button>
                  </form>
                  <form action={toggleAction}>
                    <input type="hidden" name="id"     value={String(job.id)} />
                    <input type="hidden" name="active" value={String(job.cron_active)} />
                    <Button type="submit" variant={job.cron_active ? 'primary' : 'ghost'} size="sm" disabled={togglePending}>
                      {job.cron_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {job.cron_active ? 'Ativo' : 'Inativo'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
