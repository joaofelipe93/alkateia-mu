import { getLatestBans, searchBan, getBlockedIps } from '@/lib/db/admin'
import { BansClient } from './BansClient'

interface Props { searchParams: Promise<{ q?: string; tab?: string }> }

export default async function BansPage({ searchParams }: Props) {
  const { q, tab = 'list' } = await searchParams
  const bans      = tab === 'list'   ? await getLatestBans().catch(() => [])
                  : q                ? await searchBan(q).catch(() => [])
                  : []
  const blockedIps = tab === 'ips'   ? await getBlockedIps().catch(() => []) : []
  return (
    <BansClient
      bans={bans as Record<string, unknown>[]}
      blockedIps={blockedIps as Record<string, unknown>[]}
      tab={tab}
      q={q}
    />
  )
}
