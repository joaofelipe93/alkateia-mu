import { notFound } from 'next/navigation'
import { adminGetNewsById } from '@/lib/db/admin'
import { EditNewsClient } from './EditNewsClient'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await adminGetNewsById(parseInt(id)).catch(() => null)
  if (!news) notFound()
  return <EditNewsClient news={news as Record<string, unknown>} />
}
