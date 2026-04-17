import { getPixLogs, getMpLogs, getPaypalLogs } from '@/lib/db/admin'
import { DataTable } from '@/components/admin/DataTable'

interface Props { searchParams: Promise<{ tab?: string }> }

export default async function DonationsPage({ searchParams }: Props) {
  const { tab = 'pix' } = await searchParams

  const tabs = [
    { key: 'pix', label: 'PIX' },
    { key: 'mp',  label: 'MercadoPago' },
    { key: 'pp',  label: 'PayPal' },
  ]

  const pix    = tab === 'pix' ? await getPixLogs().catch(() => [])    : []
  const mp     = tab === 'mp'  ? await getMpLogs().catch(() => [])     : []
  const paypal = tab === 'pp'  ? await getPaypalLogs().catch(() => []) : []

  function formatDate(unix: number | string) {
    const ts = typeof unix === 'string' ? new Date(unix).getTime() : unix * 1000
    return new Date(ts).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Logs de Doações</h1>

      <div className="flex gap-1 border-b border-[var(--color-game-border)]">
        {tabs.map(t => (
          <a key={t.key} href={`?tab=${t.key}`}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-[var(--color-game-primary)] text-[var(--color-game-accent)]' : 'border-transparent text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]'}`}>
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'pix' && (
        <DataTable
          columns={[
            { key: 'username',           label: 'Usuário' },
            { key: 'payment_amount',     label: 'Valor (R$)' },
            { key: 'transaction_status', label: 'Status', render: r => (
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.transaction_status === 'PAID' ? 'bg-green-500/20 text-green-400' : r.transaction_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {String(r.transaction_status)}
              </span>
            )},
            { key: 'transaction_date', label: 'Data', render: r => formatDate(r.transaction_date as number) },
          ]}
          data={pix as Record<string, unknown>[]}
          keyField="id"
          emptyText="Nenhuma transação PIX."
        />
      )}

      {tab === 'mp' && (
        <DataTable
          columns={[
            { key: 'username',    label: 'Usuário' },
            { key: 'credits',     label: 'Créditos' },
            { key: 'amount',      label: 'Valor' },
            { key: 'buy_status',  label: 'Status' },
            { key: 'date_create', label: 'Data', render: r => formatDate(r.date_create as string) },
          ]}
          data={mp as Record<string, unknown>[]}
          keyField="id"
          emptyText="Nenhuma transação MercadoPago."
        />
      )}

      {tab === 'pp' && (
        <DataTable
          columns={[
            { key: 'user_id',        label: 'User ID' },
            { key: 'payment_amount', label: 'Valor (R$)' },
            { key: 'paypal_email',   label: 'E-mail PayPal' },
            { key: 'transaction_id', label: 'TXN ID' },
          ]}
          data={paypal as Record<string, unknown>[]}
          keyField="id"
          emptyText="Nenhuma transação PayPal."
        />
      )}
    </div>
  )
}
