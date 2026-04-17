import { NextRequest, NextResponse } from 'next/server'
import { getMpPayment } from '@/lib/services/mercadopago'
import { getMpByBuyId, insertMpTransaction } from '@/lib/db/donations'
import { getCreditConfig, addCredits } from '@/lib/db/credits'
import { getUserByUsername } from '@/lib/db/account'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    if (!['payment.created', 'payment.updated'].includes(action)) {
      return new NextResponse(null, { status: 200 })
    }

    const paymentId = String(data?.id ?? '')
    if (!paymentId) return new NextResponse(null, { status: 200 })

    // Buscar detalhes do pagamento na API MP
    const payment = await getMpPayment(paymentId)

    if (payment.status !== 'approved') {
      return new NextResponse(null, { status: 200 })
    }

    // Idempotência: evitar double-credit
    const existing = await getMpByBuyId(paymentId)
    if (existing) return new NextResponse(null, { status: 200 })

    // Parsear description: "{username}|{credits}|COINS|{config_id}"
    const parts = (payment.description ?? '').split('|')
    if (parts.length < 4) return new NextResponse(null, { status: 200 })

    const [username, creditsStr, type, configIdStr] = parts
    const credits = parseInt(creditsStr)
    const configId = parseInt(configIdStr)

    if (!username || isNaN(credits) || isNaN(configId)) {
      return new NextResponse(null, { status: 200 })
    }

    if (type === 'COINS') {
      const config = await getCreditConfig(configId)
      if (config) {
        await addCredits(config, username, credits, 'api/mercadopago', payment.payer?.ip_address ?? '0.0.0.0')
      }
    }
    // type === 'VIP': implementar quando o sistema VIP for adicionado

    // Buscar userID para log
    const user = await getUserByUsername(username)

    await insertMpTransaction({
      ip_payed: payment.payer?.ip_address ?? '0.0.0.0',
      userID: user?.memb_guid ?? 0,
      buy_id: paymentId,
      username,
      credits,
      description: type,
      method: payment.payment_method_id ?? '',
      method_payed: payment.payment_type_id ?? '',
      date_create: payment.date_created ?? new Date().toISOString(),
      amount: payment.transaction_amount,
      type_money: payment.currency_id ?? 'BRL',
      buy_status: payment.status,
      buy_detail: payment.status_detail ?? '',
      approved_date: payment.date_approved ?? new Date().toISOString(),
    })

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error('[webhook/mercadopago]', err)
    return new NextResponse(null, { status: 200 })
  }
}
