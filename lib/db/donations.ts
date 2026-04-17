import sql from 'mssql'
import { getDb } from './pool'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PixStatus = 'PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED'

export interface PixTransaction {
  id: number
  transaction_id: string
  username: string
  payment_amount: number
  email: string
  transaction_date: number
  transaction_status: PixStatus
  order_id: string
  qrcode: string
  emv: string
  name: string
  document: string
  phone: string
}

export interface MpTransaction {
  id: number
  buy_id: string
  username: string
  credits: number
  amount: number
  buy_status: string
  date_create: string
}

// ─── PIX ──────────────────────────────────────────────────────────────────────

export async function insertPixTransaction(data: {
  transaction_id: string
  username: string
  payment_amount: number
  email: string
  order_id: string
  qrcode: string
  emv: string
  name: string
  document: string
  phone: string
}): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('transaction_id', sql.VarChar, data.transaction_id)
    .input('username', sql.VarChar, data.username)
    .input('payment_amount', sql.Float, data.payment_amount)
    .input('email', sql.VarChar, data.email)
    .input('transaction_date', sql.Int, Math.floor(Date.now() / 1000))
    .input('transaction_status', sql.VarChar, 'PENDING')
    .input('order_id', sql.VarChar, data.order_id)
    .input('qrcode', sql.VarChar, data.qrcode)
    .input('emv', sql.VarChar(500), data.emv)
    .input('name', sql.VarChar, data.name)
    .input('document', sql.VarChar, data.document)
    .input('phone', sql.VarChar, data.phone)
    .query(
      `INSERT INTO WEBENGINE_PIX_TRANSACTIONS
       (transaction_id, username, payment_amount, email, transaction_date,
        transaction_status, order_id, qrcode, emv, name, document, phone)
       VALUES (@transaction_id, @username, @payment_amount, @email, @transaction_date,
               @transaction_status, @order_id, @qrcode, @emv, @name, @document, @phone)`
    )
}

export async function getPixByOrderId(orderId: string): Promise<PixTransaction | null> {
  const db = await getDb()
  const result = await db.request()
    .input('order_id', sql.VarChar, orderId)
    .query(`SELECT TOP 1 * FROM WEBENGINE_PIX_TRANSACTIONS WHERE order_id = @order_id`)
  return result.recordset[0] ?? null
}

export async function getPixByUsername(username: string, limit = 10): Promise<PixTransaction[]> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit) * FROM WEBENGINE_PIX_TRANSACTIONS
       WHERE username = @username
       ORDER BY transaction_date DESC`
    )
  return result.recordset
}

export async function updatePixStatus(orderId: string, status: PixStatus): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('status', sql.VarChar, status)
    .input('order_id', sql.VarChar, orderId)
    .query(
      `UPDATE WEBENGINE_PIX_TRANSACTIONS
       SET transaction_status = @status
       WHERE order_id = @order_id`
    )
}

// ─── MercadoPago ──────────────────────────────────────────────────────────────

export async function getMpByBuyId(buyId: string): Promise<MpTransaction | null> {
  const db = await getDb()
  const result = await db.request()
    .input('buy_id', sql.VarChar, buyId)
    .query(`SELECT TOP 1 * FROM WEBENGINE_MERCADOPAGO_TRANSACTIONS WHERE buy_id = @buy_id`)
  return result.recordset[0] ?? null
}

export async function insertMpTransaction(data: {
  ip_payed: string
  userID: number
  buy_id: string
  username: string
  credits: number
  description: string
  method: string
  method_payed: string
  date_create: string
  amount: number
  type_money: string
  buy_status: string
  buy_detail: string
  approved_date: string
}): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('ip_payed', sql.VarChar, data.ip_payed)
    .input('userID', sql.Int, data.userID)
    .input('buy_id', sql.VarChar, data.buy_id)
    .input('username', sql.VarChar, data.username)
    .input('credits', sql.Int, data.credits)
    .input('description', sql.VarChar, data.description)
    .input('method', sql.VarChar, data.method)
    .input('method_payed', sql.VarChar, data.method_payed)
    .input('date_create', sql.VarChar, data.date_create)
    .input('amount', sql.Float, data.amount)
    .input('type_money', sql.VarChar, data.type_money)
    .input('buy_status', sql.VarChar, data.buy_status)
    .input('buy_detail', sql.VarChar, data.buy_detail)
    .input('approved_date', sql.VarChar, data.approved_date)
    .query(
      `INSERT INTO WEBENGINE_MERCADOPAGO_TRANSACTIONS
       (ip_payed, userID, buy_id, username, credits, description, method, method_payed,
        date_create, amount, type_money, buy_status, buy_detail, approved_date)
       VALUES (@ip_payed, @userID, @buy_id, @username, @credits, @description, @method,
               @method_payed, @date_create, @amount, @type_money, @buy_status, @buy_detail, @approved_date)`
    )
}

export async function getMpByUsername(username: string, limit = 10): Promise<MpTransaction[]> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit) * FROM WEBENGINE_MERCADOPAGO_TRANSACTIONS
       WHERE username = @username
       ORDER BY date_create DESC`
    )
  return result.recordset
}

// ─── PayPal ───────────────────────────────────────────────────────────────────

export async function getPaypalByTxnId(txnId: string): Promise<Record<string, unknown> | null> {
  const db = await getDb()
  const result = await db.request()
    .input('txn_id', sql.VarChar, txnId)
    .query(`SELECT TOP 1 * FROM WEBENGINE_PAYPAL_TRANSACTIONS WHERE transaction_id = @txn_id`)
  return result.recordset[0] ?? null
}

export async function insertPaypalTransaction(data: {
  transaction_id: string
  user_id: number
  payment_amount: number
  paypal_email: string
  order_id: string
}): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('transaction_id', sql.VarChar, data.transaction_id)
    .input('user_id', sql.Int, data.user_id)
    .input('payment_amount', sql.Float, data.payment_amount)
    .input('paypal_email', sql.VarChar, data.paypal_email)
    .input('order_id', sql.VarChar, data.order_id)
    .input('date', sql.Int, Math.floor(Date.now() / 1000))
    .query(
      `INSERT INTO WEBENGINE_PAYPAL_TRANSACTIONS
       (transaction_id, user_id, payment_amount, paypal_email, order_id, transaction_date)
       VALUES (@transaction_id, @user_id, @payment_amount, @paypal_email, @order_id, @date)`
    )
}
