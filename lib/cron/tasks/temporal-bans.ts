import sql from 'mssql'
import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'

export async function temporalBansTask(): Promise<string> {
  const db = await getDb()
  const now = Math.floor(Date.now() / 1000)

  // Buscar todos os bans temporários
  const bans = await db.request().query(`SELECT * FROM ${T.BANS}`)

  let unbanned = 0
  for (const ban of bans.recordset) {
    const banDate  = ban.ban_date  as number ?? 0
    const banDays  = ban.ban_days  as number ?? 0
    const username = ban.account_id ?? ban.username

    if (!username) continue

    const expiry = banDate + banDays * 86400

    // Se ban_days = 0, nunca expira automaticamente
    if (banDays <= 0) continue

    if (now > expiry) {
      // Desbanir
      await db.request()
        .input('username', sql.VarChar, username)
        .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 0 WHERE ${C.USERNAME} = @username`)

      // Remover da tabela de bans
      await db.request()
        .input('username', sql.VarChar, username)
        .query(`DELETE FROM ${T.BANS} WHERE account_id = @username OR username = @username`)

      unbanned++
    }
  }

  return `Temporal bans: ${unbanned} account(s) unbanned`
}
