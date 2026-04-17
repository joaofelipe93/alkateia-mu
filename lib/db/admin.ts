import sql from 'mssql'
import { getDb } from './pool'
import { T, C } from './tables'

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb()
  const [accounts, online, newToday, bans] = await Promise.all([
    db.request().query(`SELECT COUNT(*) AS total FROM ${T.MEMB_INFO}`),
    db.request().query(`SELECT COUNT(*) AS total FROM ${T.MEMB_STAT} WHERE ${C.CONN_STAT} = 1`),
    db.request().query(
      `SELECT COUNT(*) AS total FROM ${T.MEMB_INFO}
       WHERE ${C.MEMBER_ID} >= (
         SELECT MIN(${C.MEMBER_ID}) FROM ${T.MEMB_INFO}
         WHERE CAST(CONVERT(VARCHAR(10), GETDATE(), 120) AS DATE) = CAST(GETDATE() AS DATE)
       )`
    ),
    db.request().query(`SELECT COUNT(*) AS total FROM ${T.BANS}`),
  ])
  return {
    totalAccounts: accounts.recordset[0]?.total ?? 0,
    onlineNow:     online.recordset[0]?.total ?? 0,
    newToday:      newToday.recordset[0]?.total ?? 0,
    totalBans:     bans.recordset[0]?.total ?? 0,
  }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function searchAccounts(query: string) {
  const db = await getDb()
  const result = await db.request()
    .input('q', sql.VarChar, `%${query}%`)
    .query(
      `SELECT TOP 20 ${C.MEMBER_ID}, ${C.USERNAME}, ${C.EMAIL}, ${C.BLOCKED}
       FROM ${T.MEMB_INFO}
       WHERE ${C.USERNAME} LIKE @q
       ORDER BY ${C.USERNAME}`
    )
  return result.recordset
}

export async function getAccountById(id: number) {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, id)
    .query(`SELECT * FROM ${T.MEMB_INFO} WHERE ${C.MEMBER_ID} = @id`)
  return result.recordset[0] ?? null
}

export async function getAccountByUsername(username: string) {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(`SELECT * FROM ${T.MEMB_INFO} WHERE ${C.USERNAME} = @username`)
  return result.recordset[0] ?? null
}

export async function getAccountsFromIp(ip: string) {
  const db = await getDb()
  const result = await db.request()
    .input('ip', sql.VarChar, ip)
    .query(
      `SELECT TOP 20 m.${C.MEMBER_ID}, m.${C.USERNAME}, m.${C.BLOCKED}
       FROM ${T.MEMB_INFO} m
       INNER JOIN ${T.MEMB_STAT} ms ON ms.${C.MS_USERNAME} = m.${C.USERNAME}
       WHERE ms.IP = @ip`
    )
  return result.recordset
}

export async function getOnlineAccounts() {
  const db = await getDb()
  const result = await db.request().query(
    `SELECT TOP 50 ms.${C.MS_USERNAME} AS username, ms.ServerName, ms.ConnectTM
     FROM ${T.MEMB_STAT} ms
     WHERE ms.${C.CONN_STAT} = 1
     ORDER BY ms.ConnectTM DESC`
  )
  return result.recordset
}

// ─── Characters ───────────────────────────────────────────────────────────────

export async function searchCharacters(query: string) {
  const db = await getDb()
  const result = await db.request()
    .input('q', sql.VarChar, `%${query}%`)
    .query(
      `SELECT TOP 20 ${C.CHAR_NAME}, ${C.CHAR_ACCOUNT}, ${C.CHAR_CLASS},
              ${C.CHAR_LEVEL}, ${C.CHAR_RESETS}, ${C.CHAR_GR}
       FROM ${T.CHARACTER}
       WHERE ${C.CHAR_NAME} LIKE @q
       ORDER BY ${C.CHAR_NAME}`
    )
  return result.recordset
}

// ─── Bans ─────────────────────────────────────────────────────────────────────

export async function getLatestBans(limit = 50) {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(`SELECT TOP (@limit) * FROM ${T.BANS} ORDER BY id DESC`)
  return result.recordset
}

export async function searchBan(username: string) {
  const db = await getDb()
  const result = await db.request()
    .input('q', sql.VarChar, `%${username}%`)
    .query(`SELECT TOP 10 * FROM ${T.BANS} WHERE username LIKE @q ORDER BY id DESC`)
  return result.recordset
}

export async function getBlockedIps() {
  const db = await getDb()
  const result = await db.request().query(`SELECT * FROM ${T.BLOCKED_IP} ORDER BY id DESC`)
  return result.recordset
}

// ─── Credits Logs ─────────────────────────────────────────────────────────────

export async function getCreditsLogs(filter?: string, limit = 50) {
  const db = await getDb()
  const req = db.request().input('limit', sql.Int, limit)
  let query = `SELECT TOP (@limit) * FROM ${T.CREDITS_LOGS}`
  if (filter) {
    req.input('filter', sql.VarChar, `%${filter}%`)
    query += ` WHERE log_identifier LIKE @filter`
  }
  query += ` ORDER BY log_id DESC`
  const result = await req.query(query)
  return result.recordset
}

export async function getCreditConfigs() {
  const db = await getDb()
  const result = await db.request().query(`SELECT * FROM ${T.CREDITS_CONFIG} ORDER BY config_id`)
  return result.recordset
}

// ─── Donations Logs ───────────────────────────────────────────────────────────

export async function getPixLogs(limit = 50) {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(`SELECT TOP (@limit) * FROM WEBENGINE_PIX_TRANSACTIONS ORDER BY transaction_date DESC`)
  return result.recordset
}

export async function getMpLogs(limit = 50) {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(`SELECT TOP (@limit) * FROM WEBENGINE_MERCADOPAGO_TRANSACTIONS ORDER BY date_create DESC`)
  return result.recordset
}

export async function getPaypalLogs(limit = 50) {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(`SELECT TOP (@limit) * FROM WEBENGINE_PAYPAL_TRANSACTIONS ORDER BY id DESC`)
  return result.recordset
}

// ─── News (admin) ─────────────────────────────────────────────────────────────

export async function adminGetAllNews(limit = 50) {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit) news_id, news_title, news_author, news_date
       FROM ${T.NEWS}
       ORDER BY news_date DESC`
    )
  return result.recordset.map(row => ({
    ...row,
    news_title: Buffer.from(row.news_title ?? '', 'base64').toString('utf-8'),
  }))
}

export async function adminGetNewsById(id: number) {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, id)
    .query(`SELECT * FROM ${T.NEWS} WHERE news_id = @id`)
  if (!result.recordset[0]) return null
  const row = result.recordset[0]
  return {
    ...row,
    news_title:   Buffer.from(row.news_title ?? '', 'base64').toString('utf-8'),
    news_content: Buffer.from(row.news_content ?? '', 'base64').toString('utf-8'),
  }
}

// ─── Cron Jobs ────────────────────────────────────────────────────────────────

export async function getCronJobs() {
  const db = await getDb()
  const result = await db.request().query(`SELECT * FROM ${T.CRON} ORDER BY id`)
  return result.recordset
}
