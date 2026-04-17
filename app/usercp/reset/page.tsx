import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { SimpleCharacterAction } from '@/components/usercp/SimpleCharacterAction'
import { resetCharacter } from '@/lib/actions/character'
import { RefreshCw } from 'lucide-react'

export default async function ResetPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const characters = await getAccountCharacters(session.user.username).catch(() => [])

  return (
    <SimpleCharacterAction
      title="Reset de Personagem"
      icon={<RefreshCw size={20} className="text-[var(--color-game-accent)]" />}
      description="Reseta o personagem para nível 1 e incrementa o contador de resets. Requer nível 400."
      characters={characters}
      action={resetCharacter}
      submitLabel="Realizar Reset"
      confirmText="Tem certeza? Esta ação não pode ser desfeita."
      danger
    />
  )
}
