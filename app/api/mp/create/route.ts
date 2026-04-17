import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createMpPreference } from '@/lib/services/mercadopago'
import { calculateCredits } from '@/lib/db/credits'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { amount, config_id } = await req.json()
    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum < 1) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const convRate = parseInt(process.env.PIX_CONVERSION_RATE ?? '2')
    const credits = calculateCredits(amountNum, convRate, [])

    const result = await createMpPreference({
      username: session.user.username,
      credits,
      amount_brl: amountNum,
      config_id: config_id ?? parseInt(process.env.MP_CREDIT_CONFIG_ID ?? '1'),
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/mp/create]', err)
    return NextResponse.json({ error: 'Erro ao criar preferência' }, { status: 500 })
  }
}
