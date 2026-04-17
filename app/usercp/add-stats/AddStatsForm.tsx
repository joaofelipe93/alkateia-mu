'use client'

import { useActionState, useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { CharacterSelect } from '@/components/usercp/CharacterSelect'
import { addStats } from '@/lib/actions/character'
import type { CharacterData } from '@/lib/db/character'

const initial = { success: false, message: '' }

const STATS = [
  { name: 'str', label: 'Força' },
  { name: 'agi', label: 'Agilidade' },
  { name: 'vit', label: 'Vitalidade' },
  { name: 'ene', label: 'Energia' },
  { name: 'cmd', label: 'Comando' },
] as const

export function AddStatsForm({ characters }: { characters: CharacterData[] }) {
  const [state, action, pending] = useActionState(addStats, initial)
  const [selected, setSelected] = useState<CharacterData | null>(null)
  const [values, setValues] = useState<Record<string, number>>({ str: 0, agi: 0, vit: 0, ene: 0, cmd: 0 })

  const total = Object.values(values).reduce((a, b) => a + b, 0)
  const available = selected?.LevelUpPoint ?? 0

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-6 flex items-center gap-2">
        <Zap size={20} className="text-[var(--color-game-accent)]" />
        Adicionar Stats
      </h2>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <ActionFeedback result={state.message ? state : null} />

        <div className="mb-4 p-3 bg-[var(--color-game-primary)]/10 border border-[var(--color-game-primary)]/30 rounded-lg text-xs text-[var(--color-game-muted)]">
          Sua conta precisa estar <strong className="text-[var(--color-game-text)]">offline</strong>.
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Personagem</label>
            <CharacterSelect
              characters={characters}
              name="character"
            />
          </div>

          {/* Points info */}
          {selected && (
            <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-4 py-3 flex justify-between text-sm">
              <span className="text-[var(--color-game-muted)]">Pontos disponíveis:</span>
              <span className={`font-bold ${total > available ? 'text-[var(--color-game-error)]' : 'text-[var(--color-game-accent)]'}`}>
                {available - total} / {available}
              </span>
            </div>
          )}

          {/* Stat inputs */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1">{label}</label>
                <Input
                  name={name}
                  type="number"
                  min={0}
                  max={32767}
                  value={values[name]}
                  onChange={e => setValues(v => ({ ...v, [name]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="text-center"
                />
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-4 py-2 flex justify-between text-sm">
            <span className="text-[var(--color-game-muted)]">Total a distribuir:</span>
            <span className="font-bold text-[var(--color-game-text)]">{total}</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={pending || total === 0 || total > available}
          >
            {pending ? 'Distribuindo...' : `Distribuir ${total} pontos`}
          </Button>
        </form>
      </div>
    </div>
  )
}
