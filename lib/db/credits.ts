import sql from 'mssql'
import { getDb } from './pool'
import { T } from './tables'

export interface CreditConfig {
  config_id: number
  config_title: string
  config_database: string
  config_table: string
  config_credits_col: string
  config_user_col: string
  config_user_col_id: 'userid' | 'username' | 'email' | 'character'
  config_checkonline: number
  config_display: number
}

export async function getCreditConfig(configId: number): Promise<CreditConfig | null> {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, configId)
    .query(`SELECT TOP 1 * FROM ${T.CREDITS_CONFIG} WHERE config_id = @id`)
  return result.recordset[0] ?? null
}

export async function getCredits(config: CreditConfig, identifier: string): Promise<number> {
  const db = await getDb()
  const result = await db.request()
    .input('identifier', sql.VarChar, identifier)
    .query(
      `SELECT TOP 1 ${config.config_credits_col} AS credits
       FROM ${config.config_table}
       WHERE ${config.config_user_col} = @identifier`
    )
  return (result.recordset[0]?.credits as number) ?? 0
}

export async function addCredits(
  config: CreditConfig,
  identifier: string,
  amount: number,
  module: string,
  ip: string = '0.0.0.0'
): Promise<void> {
  const db = await getDb()

  // Atualiza créditos na tabela configurada
  await db.request()
    .input('amount', sql.Int, amount)
    .input('identifier', sql.VarChar, identifier)
    .query(
      `UPDATE ${config.config_table}
       SET ${config.config_credits_col} = ${config.config_credits_col} + @amount
       WHERE ${config.config_user_col} = @identifier`
    )

  // Log da transação
  await db.request()
    .input('configTitle', sql.VarChar, config.config_title)
    .input('identifier', sql.VarChar, identifier)
    .input('credits', sql.Int, amount)
    .input('module', sql.VarChar, module)
    .input('ip', sql.VarChar, ip)
    .input('date', sql.Int, Math.floor(Date.now() / 1000))
    .query(
      `INSERT INTO ${T.CREDITS_LOGS}
       (log_config, log_identifier, log_credits, log_transaction, log_date, log_inadmincp, log_module, log_ip)
       VALUES (@configTitle, @identifier, @credits, 'add', @date, 0, @module, @ip)`
    )
}

// ─── Utilitário de bônus (puro, sem side effects) ────────────────────────────

const BREAKPOINTS = [10, 20, 50, 100, 150, 200, 300]

export function calculateCredits(
  amountBRL: number,
  conversionRate: number,
  bonusTiers: number[]  // [bonus_1, bonus_2, ..., bonus_7] em percentual
): number {
  const base = Math.floor(amountBRL * conversionRate)
  const idx = BREAKPOINTS.findLastIndex(b => amountBRL >= b)
  const pct = idx >= 0 ? (bonusTiers[idx] ?? 0) : 0
  if (pct <= 0) return base
  return base + Math.floor(base * pct / 100)
}

// Tiers PIX (todos 0% no config atual)
export const PIX_BONUS_TIERS = [0, 0, 0, 0, 0, 0, 0]

// Tiers PayPal (5-35%)
export const PAYPAL_BONUS_TIERS = [5, 10, 15, 20, 25, 30, 35]
