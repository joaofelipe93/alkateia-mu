import { getCreditConfigs } from '@/lib/db/admin'
import { CreditsManagerClient } from './CreditsManagerClient'

export default async function CreditsManagerPage() {
  const configs = await getCreditConfigs().catch(() => [])
  return <CreditsManagerClient configs={configs as Record<string, unknown>[]} />
}
