'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { editCharacter } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

const FIELDS = [
  { name: 'level',   label: 'Level',        key: 'cLevel' },
  { name: 'resets',  label: 'Resets',        key: 'ResetCount' },
  { name: 'gresets', label: 'Grand Resets',  key: 'MasterResetCount' },
  { name: 'points',  label: 'Pontos Livres', key: 'LevelUpPoint' },
  { name: 'zen',     label: 'Zen',           key: 'Money' },
  { name: 'pklevel', label: 'PK Level',      key: 'PkLevel' },
  { name: 'str',     label: 'Força',         key: 'Strength' },
  { name: 'agi',     label: 'Agilidade',     key: 'Dexterity' },
  { name: 'vit',     label: 'Vitalidade',    key: 'Vitality' },
  { name: 'ene',     label: 'Energia',       key: 'Energy' },
  { name: 'cmd',     label: 'Comando',       key: 'Leadership' },
]

export function EditCharacterForm({ char }: { char: Record<string, unknown> }) {
  const [state, action, pending] = useActionState(editCharacter, initial)

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admincp/characters" className="text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
          Editar: {String(char.Name ?? '')}
        </h1>
      </div>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <ActionFeedback result={state.message ? state : null} />
        <p className="text-xs text-[var(--color-game-warning)] mb-4">⚠️ A conta precisa estar offline para salvar as alterações.</p>

        <form action={action} className="space-y-3">
          <input type="hidden" name="name"      value={String(char.Name ?? '')} />
          <input type="hidden" name="accountId" value={String(char.AccountID ?? '')} />

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ name, label, key }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1">{label}</label>
                <Input name={name} type="number" min={0} defaultValue={Number(char[key] ?? 0)} />
              </div>
            ))}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={pending}>
            <Save size={16} /> {pending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </div>
    </div>
  )
}
