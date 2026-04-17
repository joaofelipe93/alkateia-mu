import sql from 'mssql'

const config: sql.config = {
  server: process.env.SQL_HOST!,
  port: parseInt(process.env.SQL_PORT ?? '1433'),
  database: process.env.SQL_DB!,
  user: process.env.SQL_USER!,
  password: process.env.SQL_PASS!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect()
  }
  return pool
}
