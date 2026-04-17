import { getCronJobs } from '@/lib/db/admin'
import { CronClient } from './CronClient'

export default async function CronPage() {
  const jobs = await getCronJobs().catch(() => [])
  return <CronClient jobs={jobs as Record<string, unknown>[]} />
}
