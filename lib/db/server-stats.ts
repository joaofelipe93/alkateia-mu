import { unstable_cache } from 'next/cache'
import { getDb } from './pool'
import { T, C } from './tables'

export interface ServerStats {
  totalAccounts: number
  totalCharacters: number
  totalGuilds: number
  onlineNow: number
  serverOnline: boolean
}

async function _getServerStats(): Promise<ServerStats> {
  try {
    const db = await getDb()
    const [accounts, chars, guilds, online] = await Promise.all([
      db.request().query(`SELECT COUNT(*) AS total FROM ${T.MEMB_INFO}`),
      db.request().query(`SELECT COUNT(*) AS total FROM ${T.CHARACTER}`),
      db.request().query(`SELECT COUNT(*) AS total FROM ${T.GUILD}`),
      db.request().query(`SELECT COUNT(*) AS total FROM ${T.MEMB_STAT} WHERE ${C.CONN_STAT} = 1`),
    ])
    return {
      totalAccounts:   accounts.recordset[0]?.total ?? 0,
      totalCharacters: chars.recordset[0]?.total ?? 0,
      totalGuilds:     guilds.recordset[0]?.total ?? 0,
      onlineNow:       online.recordset[0]?.total ?? 0,
      serverOnline:    true,
    }
  } catch {
    return {
      totalAccounts: 0,
      totalCharacters: 0,
      totalGuilds: 0,
      onlineNow: 0,
      serverOnline: false,
    }
  }
}

export const getServerStats = unstable_cache(
  _getServerStats,
  ['server-stats'],
  { revalidate: 60, tags: ['server-stats'] }
)
