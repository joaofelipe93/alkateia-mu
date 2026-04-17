import { notFound } from 'next/navigation'
import { getAccountById } from '@/lib/db/admin'
import { getAccountCharacters, isAccountOnline } from '@/lib/db/character'
import { AccountDetailClient } from './AccountDetailClient'

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) notFound()

  const account = await getAccountById(userId).catch(() => null)
  if (!account) notFound()

  const username = account['memb___id'] as string
  const [characters, online] = await Promise.all([
    getAccountCharacters(username).catch(() => []),
    isAccountOnline(username).catch(() => false),
  ])

  return (
    <AccountDetailClient
      account={account as Record<string, unknown>}
      characters={characters as Record<string, unknown>[]}
      online={online}
      userId={userId}
    />
  )
}
