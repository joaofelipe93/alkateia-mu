import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { SimpleCharacterAction } from '@/components/usercp/SimpleCharacterAction'
import { clearPK } from '@/lib/actions/character'
import { Shield } from 'lucide-react'

export default async function ClearPKPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const characters = await getAccountCharacters(session.user.username).catch(() => [])

  return (
    <SimpleCharacterAction
      title="Limpar PK"
      icon={<Shield size={20} className="text-[var(--color-game-accent)]" />}
      description="Remove o status PK do personagem, devolvendo-o ao estado normal."
      characters={characters}
      action={clearPK}
      submitLabel="Limpar Status PK"
      confirmText="Limpar PK do personagem?"
    />
  )
}
