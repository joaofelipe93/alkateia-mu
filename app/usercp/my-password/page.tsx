'use client'

import { useActionState } from 'react'
import { Key, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { changePassword } from '@/lib/actions/character'

const initial = { success: false, message: '' }

export default function MyPasswordPage() {
  const [state, action, pending] = useActionState(changePassword, initial)
  const [show, setShow] = useState({ curr: false, new: false, conf: false })

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-6 flex items-center gap-2">
        <Key size={20} className="text-[var(--color-game-accent)]" />
        Alterar Senha
      </h2>

      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <ActionFeedback result={state.message ? state : null} />

        <div className="mb-4 p-3 bg-[var(--color-game-primary)]/10 border border-[var(--color-game-primary)]/30 rounded-lg text-xs text-[var(--color-game-muted)]">
          Sua conta precisa estar <strong className="text-[var(--color-game-text)]">offline</strong> para alterar a senha.
        </div>

        <form action={action} className="space-y-4">
          {[
            { name: 'currentPassword', label: 'Senha Atual',    key: 'curr' as const },
            { name: 'newPassword',     label: 'Nova Senha',      key: 'new'  as const },
            { name: 'confirmPassword', label: 'Confirmar Senha', key: 'conf' as const },
          ].map(({ name, label, key }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">{label}</label>
              <div className="relative">
                <Input name={name} type={show[key] ? 'text' : 'password'} placeholder="••••••••" className="pr-10" />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]"
                >
                  {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={pending}>
            {pending ? 'Salvando...' : 'Alterar Senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}
