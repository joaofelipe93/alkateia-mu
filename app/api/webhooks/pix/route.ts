import { NextRequest, NextResponse } from 'next/server'
import { verifyPixPayment } from '@/lib/services/pix'
import {
  getPixByOrderId,
  updatePixStatus,
} from '@/lib/db/donations'
import {
  getCreditConfig,
  calculateCredits,
  addCredits,
  PIX_BONUS_TIERS,
} from '@/lib/db/credits'
import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'
import sql from 'mssql'

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const params = new URLSearchParams(text)

    const apiKey = params.get('apiKey') ?? params.get('apikey')
    const transaction_id = params.get('transaction_id')
    const notification_id = params.get('notification_id')

    // Validar API Key
    if (apiKey !== process.env.PIX_API_KEY) {
      return new NextResponse(null, { status: 403 })
    }

    if (!transaction_id || !notification_id) {
      return new NextResponse(null, { status: 400 })
    }

    // Verificar pagamento na API PagHiper
    const verified = await verifyPixPayment(transaction_id, notification_id)

    if (verified.result !== 'success') {
      return new NextResponse(null, { status: 200 })
    }

    const { status, order_id } = verified
    const tx = await getPixByOrderId(order_id)

    if (!tx) {
      return new NextResponse(null, { status: 200 })
    }

    if (status === 'paid' && tx.transaction_status !== 'PAID') {
      const convRate = parseInt(process.env.PIX_CONVERSION_RATE ?? '2')
      const configId = parseInt(process.env.PIX_CREDIT_CONFIG_ID ?? '1')
      const amountBRL = tx.payment_amount

      const credits = calculateCredits(amountBRL, convRate, PIX_BONUS_TIERS)

      const config = await getCreditConfig(configId)
      if (config) {
        const clientIp = req.headers.get('x-forwarded-for') ?? '0.0.0.0'
        await addCredits(config, tx.username, credits, 'api/pix', clientIp)
      }

      await updatePixStatus(order_id, 'PAID')

    } else if (status === 'refunded' && tx.transaction_status === 'PAID') {
      // Bloquear conta no refund
      const db = await getDb()
      await db.request()
        .input('username', sql.VarChar, tx.username)
        .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 1 WHERE ${C.USERNAME} = @username`)

      await updatePixStatus(order_id, 'REFUNDED')

    } else if (status === 'canceled') {
      await updatePixStatus(order_id, 'CANCELED')
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error('[webhook/pix]', err)
    return new NextResponse(null, { status: 200 }) // sempre 200 para o PagHiper
  }
}
