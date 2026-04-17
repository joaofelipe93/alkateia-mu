import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cancelPixInvoice } from '@/lib/services/pix'
import { getPixByOrderId, updatePixStatus } from '@/lib/db/donations'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { order_id } = await req.json()
    if (!order_id) return NextResponse.json({ error: 'order_id obrigatório' }, { status: 400 })

    const tx = await getPixByOrderId(order_id)
    if (!tx) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })

    // Garantir que pertence ao usuário logado
    if (tx.username !== session.user.username) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    if (tx.transaction_status !== 'PENDING') {
      return NextResponse.json({ error: 'Só é possível cancelar transações pendentes' }, { status: 400 })
    }

    await cancelPixInvoice(tx.transaction_id)
    await updatePixStatus(order_id, 'CANCELED')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/pix/cancel]', err)
    return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
  }
}
