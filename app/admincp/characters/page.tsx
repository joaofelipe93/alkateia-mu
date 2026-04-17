import Link from 'next/link'
import { searchCharacters } from '@/lib/db/admin'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { CHARACTER_CLASSES } from '@/lib/db/tables'

interface Props { searchParams: Promise<{ q?: string }> }

export default async function CharactersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const characters = q && q.length >= 2
    ? await searchCharacters(q).catch(() => [])
    : []

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Buscar Personagem</h1>

      <form method="GET" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Nome do personagem..."
          className="flex h-10 flex-1 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none" />
        <Button type="submit" variant="primary" size="md"><Search size={16} /> Buscar</Button>
      </form>

      <DataTable
        columns={[
          { key: 'Name',       label: 'Personagem' },
          { key: 'AccountID',  label: 'Conta' },
          { key: 'Class',      label: 'Classe', render: row => String(CHARACTER_CLASSES[row.Class as number] ?? row.Class) },
          { key: 'cLevel',     label: 'Level' },
          { key: 'ResetCount', label: 'Resets' },
        ]}
        data={characters as Record<string, unknown>[]}
        keyField="Name"
        actions={row => (
          <Link href={`/admincp/characters/${row.Name}`}>
            <Button variant="outline" size="sm">Editar</Button>
          </Link>
        )}
        emptyText={q ? 'Nenhum personagem encontrado.' : 'Digite um nome para buscar.'}
      />
    </div>
  )
}
