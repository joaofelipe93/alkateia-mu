import { getCreditsLogs } from '@/lib/db/admin'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface Props { searchParams: Promise<{ q?: string }> }

export default async function CreditsLogsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const logs = await getCreditsLogs(q, 100).catch(() => [])

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Logs de Créditos</h1>

      <form method="GET" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Filtrar por usuário..."
          className="flex h-10 flex-1 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none" />
        <Button type="submit" variant="primary" size="md"><Search size={16} /></Button>
      </form>

      <DataTable
        columns={[
          { key: 'log_config',      label: 'Sistema' },
          { key: 'log_identifier',  label: 'Usuário' },
          { key: 'log_credits',     label: 'Créditos' },
          { key: 'log_transaction', label: 'Tipo', render: r => (
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.log_transaction === 'add' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {r.log_transaction === 'add' ? '+ Adicionar' : '− Subtrair'}
            </span>
          )},
          { key: 'log_module',      label: 'Módulo' },
          { key: 'log_date',        label: 'Data', render: r => new Date((r.log_date as number) * 1000).toLocaleDateString('pt-BR') },
        ]}
        data={logs as Record<string, unknown>[]}
        keyField="log_id"
        emptyText="Nenhum log encontrado."
      />
    </div>
  )
}
