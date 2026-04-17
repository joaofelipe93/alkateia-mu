import { cn } from '@/lib/cn'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  actions?: (row: T) => React.ReactNode
  emptyText?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, actions, emptyText = 'Nenhum resultado.'
}: Props<T>) {
  return (
    <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl overflow-hidden">
      {data.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-game-muted)] text-sm">{emptyText}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-game-border)] bg-[var(--color-game-bg)]">
                {columns.map(col => (
                  <th key={String(col.key)} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-game-muted)] uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-xs font-semibold text-[var(--color-game-muted)] uppercase tracking-wider text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={String(row[keyField])} className="border-b border-[var(--color-game-border)] last:border-0 hover:bg-[var(--color-game-surface-2)] transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className={cn('px-4 py-3 text-[var(--color-game-text)]', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
