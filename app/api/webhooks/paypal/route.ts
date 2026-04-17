import { NextRequest, NextResponse } from 'next/server'
import { getPaypalByTxnId, insertPaypalTransaction } from '@/lib/db/donations'
import {
  getCreditConfig,
  calculateCredits,
  addCredits,
  PAYPAL_BONUS_TIERS,
} from '@/lib/db/credits'
import { getUserByUsername } from '@/lib/db/account'

const PAYPAL_VERIFY_URL = {
  live:    'https://ipnpb.paypal.com/cgi-bin/webscr',
  sandbox: 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
}

async function verifyIPN(body: string): Promise<boolean> {
  const url = process.env.PAYPAL_SANDBOX === 'true'
    ? PAYPAL_VERIFY_URL.sandbox
    : PAYPAL_VERIFY_URL.live

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `cmd=_notify-validate&${body}`,
  })

  const text = await res.text()
  return text === 'VERIFIED'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const params = new URLSearchParams(rawBody)

    // Verificar IPN com PayPal
    const verified = await verifyIPN(rawBody)
    if (!verified) {
      console.warn('[webhook/paypal] IPN not verified')
      return new NextResponse(null, { status: 200 })
    }

    const paymentStatus = params.get('payment_status')
    const receiverEmail = params.get('receiver_email')
    const txnId = params.get('txn_id') ?? ''
    const txnType = params.get('txn_type') ?? ''
    const mcGross = parseFloat(params.get('mc_gross') ?? '0')
    const payerEmail = params.get('payer_email') ?? ''
    const custom = params.get('custom') ?? '' // user_id

    // Validações de segurança
    if (receiverEmail !== process.env.PAYPAL_EMAIL) {
      return new NextResponse(null, { status: 200 })
    }

    if (paymentStatus !== 'Completed') {
      return new NextResponse(null, { status: 200 })
    }

    if (txnType === 'subscr_payment') {
      return new NextResponse(null, { status: 200 }) // ignorar subscriptions
    }

    // Idempotência
    const existing = await getPaypalByTxnId(txnId)
    if (existing) return new NextResponse(null, { status: 200 })

    const userId = parseInt(custom)
    if (isNaN(userId) || userId <= 0) {
      return new NextResponse(null, { status: 200 })
    }

    // Buscar username pelo ID
    // Na tabela MEMB_INFO, buscamos pelo memb_guid (userId)
    const { getDb } = await import('@/lib/db/pool')
    const { T, C } = await import('@/lib/db/tables')
    const sql = await import('mssql')
    const db = await getDb()

    const userResult = await db.request()
      .input('id', sql.default.Int, userId)
      .query(`SELECT TOP 1 ${C.USERNAME} FROM ${T.MEMB_INFO} WHERE ${C.MEMBER_ID} = @id`)

    const username = userResult.recordset[0]?.[C.USERNAME]
    if (!username) return new NextResponse(null, { status: 200 })

    // Calcular créditos com bônus PayPal
    const convRate = parseInt(process.env.PAYPAL_CONVERSION_RATE ?? '2')
    const configId = parseInt(process.env.PAYPAL_CREDIT_CONFIG_ID ?? '1')
    const credits = calculateCredits(mcGross, convRate, PAYPAL_BONUS_TIERS)

    const config = await getCreditConfig(configId)
    if (config) {
      await addCredits(config, username, credits, 'api/paypal')
    }

    await insertPaypalTransaction({
      transaction_id: txnId,
      user_id: userId,
      payment_amount: mcGross,
      paypal_email: payerEmail,
      order_id: txnId,
    })

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error('[webhook/paypal]', err)
    return new NextResponse(null, { status: 200 })
  }
}
