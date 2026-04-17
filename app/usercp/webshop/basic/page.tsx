import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getShopItems, SHOP_CATEGORIES } from '@/lib/db/webshop'
import { getAccountCharacters } from '@/lib/db/character'
import { BasicShopClient } from './BasicShopClient'

export default async function BasicShopPage({
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
    <BasicShopClient
      items={items}
      characters={characters}
      selectedGrupo={grupo}
      categories={SHOP_CATEGORIES}
    />
  )
}
