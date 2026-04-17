'use client'

import { useActionState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { banByUsername, unbanByUsername, deleteBlockedIp } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

interface Props {
  bans: Record<string, unknown>[]
  blockedIps: Record<string, unknown>[]
  tab: string
  q?: string
}

export function BansClient({ bans, blockedIps, tab, q }: Props) {
  const [banState,  banAction,  banPending]  = useActionState(banByUsername, initial)
  const [ubanState, ubanAction, ubanPending] = useActionState(unbanByUsername, initial)
  const [ipState,   ipAction,   ipPending]   = useActionState(deleteBlockedIp, initial)

  const tabs = [
    { key: 'list',   label: 'Últimos bans' },
    { key: 'search', label: 'Pesquisar' },
    { key: 'ban',    label: 'Banir conta' },
    { key: 'ips',    label: 'IPs bloqueados' },
  ]

  function formatDate(unix: number) {
    return new Date(unix * 1000).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Banimentos</h1>

      <div className="flex gap-1 border-b border-[var(--color-game-border)]">
        {tabs.map(t => (
          <a key={t.key} href={`?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-[var(--color-game-primary)] text-[var(--color-game-accent)]' : 'border-transparent text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]'}`}>
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'list' && (
        <DataTable columns={[
          { key: 'username', label: 'Usuário' },
          { key: 'reason',   label: 'Motivo' },
          { key: 'ban_date', label: 'Data', render: r => formatDate(r.ban_date as number) },
        ]} data={bans} keyField="id" emptyText="Nenhum ban." />
      )}

      {tab === 'search' && (
        <>
          <form method="GET" className="flex gap-2">
            <input type="hidden" name="tab" value="search" />
            <input name="q" defaultValue={q}
              placeholder="Nome de usuário..."
              className="flex h-10 flex-1 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none" />
            <Button type="submit" variant="primary" size="md">Buscar</Button>
          </form>
          {q && (
            <>
              <DataTable columns={[
                { key: 'username', label: 'Usuário' },
                { key: 'reason',   label: 'Motivo' },
              ]} data={bans} keyField="id" emptyText="Nenhum ban encontrado." />
              {ubanState.message && <ActionFeedback result={ubanState} />}
              {bans.length > 0 && (
                <form action={ubanAction}>
                  <input type="hidden" name="username" value={q} />
                  <Button type="submit" variant="primary" size="sm" disabled={ubanPending}>Desbanir {q}</Button>
                </form>
              )}
            </>
          )}
        </>
      )}

      {tab === 'ban' && (
        <div className="max-w-sm bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5 space-y-4">
          <ActionFeedback result={banState.message ? banState : null} />
          <form action={banAction} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1">Usuário</label>
              <Input name="username" placeholder="username" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1">Motivo</label>
              <Input name="reason" placeholder="Motivo do ban..." />
            </div>
            <Button type="submit" variant="danger" size="md" className="w-full" disabled={banPending}>Banir conta</Button>
          </form>
        </div>
      )}

      {tab === 'ips' && (
        <>
          <ActionFeedback result={ipState.message ? ipState : null} />
          <DataTable columns={[
            { key: 'ip_address', label: 'IP' },
            { key: 'reason',     label: 'Motivo' },
          ]} data={blockedIps} keyField="id"
          actions={row => (
            <form action={ipAction}>
              <input type="hidden" name="id" value={String(row.id)} />
              <Button type="submit" variant="danger" size="sm" disabled={ipPending}>Remover</Button>
            </form>
          )}
          emptyText="Nenhum IP bloqueado." />
        </>
      )}
    </div>
  )
}
