import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPixByOrderId } from '@/lib/db/donations'
import { calculateCredits, PIX_BONUS_TIERS } from '@/lib/db/credits'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { orderId } = await params
    const tx = await getPixByOrderId(orderId)

    if (!tx || tx.username !== session.user.username) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    const convRate = parseInt(process.env.PIX_CONVERSION_RATE ?? '2')
    const credits = calculateCredits(tx.payment_amount, convRate, PIX_BONUS_TIERS)

    return NextResponse.json({
      status: tx.transaction_status,
      amount: tx.payment_amount,
      credits,
    })
  } catch (err) {
    console.error('[api/pix/status]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
