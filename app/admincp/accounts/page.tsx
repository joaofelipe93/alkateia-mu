import Link from 'next/link'
import { searchAccounts, getOnlineAccounts, getAccountsFromIp } from '@/lib/db/admin'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Search, Wifi } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string; mode?: string }>
}

export default async function AccountsPage({ searchParams }: Props) {
  const { q, mode } = await searchParams

  let accounts: Record<string, unknown>[] = []
  if (mode === 'online') {
    accounts = await getOnlineAccounts().catch(() => [])
  } else if (mode === 'ip' && q) {
    accounts = await getAccountsFromIp(q).catch(() => [])
  } else if (q && q.length >= 2) {
    accounts = await searchAccounts(q).catch(() => [])
  }

  const isOnlineMode = mode === 'online'
  const isIpMode = mode === 'ip'

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
        {isOnlineMode ? 'Contas Online' : isIpMode ? 'Buscar por IP' : 'Buscar Conta'}
      </h1>

      {!isOnlineMode && (
        <form method="GET" className="flex gap-2">
          {isIpMode && <input type="hidden" name="mode" value="ip" />}
          <input
            name="q"
            defaultValue={q}
            placeholder={isIpMode ? 'Endereço IP...' : 'Nome de usuário...'}
            className="flex h-10 flex-1 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none"
          />
          <Button type="submit" variant="primary" size="md">
            <Search size={16} /> Buscar
          </Button>
        </form>
      )}

      {isOnlineMode && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-game-success)]">
          <Wifi size={14} />
          {accounts.length} conta(s) online
        </div>
      )}

      <DataTable
        columns={[
          { key: 'memb_guid',  label: 'ID' },
          { key: 'memb___id',  label: 'Usuário' },
          { key: 'mail_addr',  label: 'E-mail' },
          {
            key: 'bloc_code',
            label: 'Status',
            render: row => (
              <span className={`text-xs px-2 py-0.5 rounded-full ${row.bloc_code ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {row.bloc_code ? 'Banido' : 'Ativo'}
              </span>
            ),
          },
        ]}
        data={accounts}
        keyField="memb_guid"
        actions={row => (
          <Link href={`/admincp/accounts/${row.memb_guid}`}>
            <Button variant="outline" size="sm">Ver</Button>
          </Link>
        )}
        emptyText={q || isOnlineMode ? 'Nenhuma conta encontrada.' : 'Digite um username para buscar.'}
      />
    </div>
  )
}
