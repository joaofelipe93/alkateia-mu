import { notFound } from 'next/navigation'
import { getCharacterByName } from '@/lib/db/character'
import { EditCharacterForm } from './EditCharacterForm'

export default async function EditCharacterPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const char = await getCharacterByName(decodeURIComponent(name)).catch(() => null)
  if (!char) notFound()
  return <EditCharacterForm char={char as unknown as Record<string, unknown>} />
}
