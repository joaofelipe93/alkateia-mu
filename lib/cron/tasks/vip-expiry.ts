import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'

export async function vipExpiryTask(): Promise<string> {
  const db = await getDb()

  // Expira VIPs cujo AccountExpireDate já passou
  const result = await db.request().query(
    `UPDATE ${T.MEMB_INFO}
     SET ${C.ACCOUNT_LEVEL} = 0
     WHERE ${C.ACCOUNT_LEVEL} > 0
       AND ${C.ACCOUNT_EXPIRE} IS NOT NULL
       AND ${C.ACCOUNT_EXPIRE} < GETDATE()`
  )

  const affected = result.rowsAffected[0] ?? 0
  return `VIP expiry: ${affected} account(s) expired`
}
