'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldOff, ShieldCheck, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { banAccount, unbanAccount, changeAccountPassword } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

interface Props {
  account: Record<string, unknown>
  characters: Record<string, unknown>[]
  online: boolean
  userId: number
}

export function AccountDetailClient({ account, characters, online, userId }: Props) {
  const [banState,  banAction,  banPending]  = useActionState(banAccount, initial)
  const [ubanState, ubanAction, ubanPending] = useActionState(unbanAccount, initial)
  const [passState, passAction, passPending] = useActionState(changeAccountPassword, initial)

  const isBlocked = Boolean(account.bloc_code)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admincp/accounts" className="text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
          {String(account['memb___id'] ?? '')}
        </h1>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {isBlocked ? 'Banido' : 'Ativo'}
        </span>
        {online && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Online</span>}
      </div>

      {/* Info */}
      <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5 grid grid-cols-2 gap-4">
        {[
          { label: 'ID',      val: account['memb_guid'] },
          { label: 'Usuário', val: account['memb___id'] },
          { label: 'E-mail',  val: account['mail_addr'] },
          { label: 'Serial',  val: account['sno__numb'] },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-xs text-[var(--color-game-muted)]">{label}</p>
            <p className="text-sm font-medium text-[var(--color-game-text)]">{String(val ?? '—')}</p>
          </div>
        ))}
      </div>

      {/* Characters */}
      {characters.length > 0 && (
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-game-text)] mb-3">Personagens</h2>
          <div className="space-y-2">
            {characters.map(c => (
              <div key={String(c.Name)} className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-game-text)]">{String(c.Name)}</span>
                <span className="text-[var(--color-game-muted)]">{String(c.className)} • Lv {String(c.cLevel)} • {String(c.ResetCount)}R</span>
                <Link href={`/admincp/characters/${String(c.Name)}`}>
                  <Button variant="ghost" size="sm">Editar</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-game-text)]">Status</h3>
          {banState.message  && <ActionFeedback result={banState} />}
          {ubanState.message && <ActionFeedback result={ubanState} />}
          {isBlocked ? (
            <form action={ubanAction}>
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="primary" size="sm" className="w-full" disabled={ubanPending}>
                <ShieldCheck size={14} /> Desbanir
              </Button>
            </form>
          ) : (
            <form action={banAction}>
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="danger" size="sm" className="w-full" disabled={banPending}>
                <ShieldOff size={14} /> Banir
              </Button>
            </form>
          )}
        </div>

        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 space-y-3 sm:col-span-2">
          <h3 className="text-sm font-semibold text-[var(--color-game-text)]">Alterar senha</h3>
          {passState.message && <ActionFeedback result={passState} />}
          <form action={passAction} className="flex gap-2">
            <input type="hidden" name="userId" value={userId} />
            <Input name="password" type="text" placeholder="Nova senha (mín 4 chars)" className="flex-1" />
            <Button type="submit" variant="outline" size="sm" disabled={passPending}>
              <Key size={14} /> Salvar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
