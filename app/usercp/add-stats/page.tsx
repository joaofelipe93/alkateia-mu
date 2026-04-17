import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAccountCharacters } from '@/lib/db/character'
import { AddStatsForm } from './AddStatsForm'

export default async function AddStatsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const characters = await getAccountCharacters(session.user.username).catch(() => [])
  return <AddStatsForm characters={characters} />
}
