import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { SimpleCharacterAction } from '@/components/usercp/SimpleCharacterAction'
import { unstickCharacter } from '@/lib/actions/character'
import { Anchor } from 'lucide-react'

export default async function UnstickPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const characters = await getAccountCharacters(session.user.username).catch(() => [])

  return (
    <SimpleCharacterAction
      title="Unstick"
      icon={<Anchor size={20} className="text-[var(--color-game-accent)]" />}
      description="Move o personagem para Lorencia (125, 125) caso esteja preso em algum mapa."
      characters={characters}
      action={unstickCharacter}
      submitLabel="Mover para Lorencia"
      confirmText="Mover personagem para Lorencia?"
    />
  )
}
