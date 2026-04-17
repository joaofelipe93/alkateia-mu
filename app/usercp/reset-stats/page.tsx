import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { SimpleCharacterAction } from '@/components/usercp/SimpleCharacterAction'
import { resetStats } from '@/lib/actions/character'
import { RotateCcw } from 'lucide-react'

export default async function ResetStatsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const characters = await getAccountCharacters(session.user.username).catch(() => [])

  return (
    <SimpleCharacterAction
      title="Resetar Stats"
      icon={<RotateCcw size={20} className="text-[var(--color-game-accent)]" />}
      description="Retorna todos os pontos de stats para o pool de LevelUpPoint. Os atributos voltam ao valor base da classe."
      characters={characters}
      action={resetStats}
      submitLabel="Resetar Stats"
      confirmText="Confirmar reset de stats?"
    />
  )
}
