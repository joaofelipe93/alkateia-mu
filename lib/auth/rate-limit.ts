import sql from 'mssql'
import { getDb } from '@/lib/db/pool'
import { T } from '@/lib/db/tables'

const MAX_ATTEMPTS = 5
const BLOCK_MINUTES = 15

function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

interface FlaRecord {
  id: number
  username: string
  ip_address: string
  failed_attempts: number
  unlock_timestamp: number
  timestamp: number
}

async function getFlaRecord(ip: string): Promise<FlaRecord | null> {
  const db = await getDb()
  const result = await db.request()
    .input('ip', sql.VarChar, ip)
    .query(`SELECT TOP 1 * FROM ${T.FLA} WHERE ip_address = @ip ORDER BY id DESC`)
  return result.recordset[0] ?? null
}

export async function canLogin(ip: string): Promise<boolean> {
  const record = await getFlaRecord(ip)
  if (!record) return true
  if (record.failed_attempts < MAX_ATTEMPTS) return true
  if (nowUnix() >= record.unlock_timestamp) {
    await removeFailedLogins(ip)
    return true
  }
  return false
}

export async function checkFailedAttempts(ip: string): Promise<number> {
  const record = await getFlaRecord(ip)
  return record?.failed_attempts ?? 0
}

export async function addFailedLogin(username: string, ip: string): Promise<void> {
  const db = await getDb()
  const record = await getFlaRecord(ip)
  const unlockTimestamp = nowUnix() + BLOCK_MINUTES * 60

  if (record) {
    const newAttempts = record.failed_attempts + 1
    if (newAttempts >= MAX_ATTEMPTS) {
      await db.request()
        .input('username', sql.VarChar, username)
        .input('ip', sql.VarChar, ip)
        .input('unlock', sql.Int, unlockTimestamp)
        .input('now', sql.Int, nowUnix())
        .query(
          `UPDATE ${T.FLA}
           SET username = @username, failed_attempts = failed_attempts + 1,
               unlock_timestamp = @unlock, timestamp = @now
           WHERE ip_address = @ip`
        )
    } else {
      await db.request()
        .input('username', sql.VarChar, username)
        .input('ip', sql.VarChar, ip)
        .input('now', sql.Int, nowUnix())
        .query(
          `UPDATE ${T.FLA}
           SET username = @username, failed_attempts = failed_attempts + 1, timestamp = @now
           WHERE ip_address = @ip`
        )
    }
  } else {
    await db.request()
      .input('username', sql.VarChar, username)
      .input('ip', sql.VarChar, ip)
      .input('now', sql.Int, nowUnix())
      .query(
        `INSERT INTO ${T.FLA} (username, ip_address, unlock_timestamp, failed_attempts, timestamp)
         VALUES (@username, @ip, 0, 1, @now)`
      )
  }
}

export async function removeFailedLogins(ip: string): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('ip', sql.VarChar, ip)
    .query(`DELETE FROM ${T.FLA} WHERE ip_address = @ip`)
}
