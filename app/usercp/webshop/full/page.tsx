import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getShopItems, SHOP_CATEGORIES } from '@/lib/db/webshop'
import { getAccountCharacters } from '@/lib/db/character'
import { SemiShopClient } from '../semi/SemiShopClient'

export default async function FullShopPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { grupo: grupoParam } = await searchParams
  const grupo = grupoParam !== undefined ? parseInt(grupoParam) : undefined

  const [items, characters] = await Promise.all([
    getShopItems(grupo).catch(() => []),
    getAccountCharacters(session.user.username).catch(() => []),
  ])

  return (
    <SemiShopClient
      items={items}
      characters={characters}
      selectedGrupo={grupo}
      categories={SHOP_CATEGORIES}
      variant="full"
    />
  )
}
