import { adminGetAllNews } from '@/lib/db/admin'
import { NewsListClient } from './NewsListClient'

export default async function ManageNewsPage() {
  const news = await adminGetAllNews().catch(() => [])
  return <NewsListClient news={news as Record<string, unknown>[]} />
}
