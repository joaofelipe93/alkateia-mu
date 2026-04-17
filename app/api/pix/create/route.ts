import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createPixInvoice } from '@/lib/services/pix'
import { insertPixTransaction } from '@/lib/db/donations'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { amount, name, cpf, email, phone } = body

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 3 || amountNum > 9999) {
      return NextResponse.json({ error: 'Valor inválido (mín R$3, máx R$9999)' }, { status: 400 })
    }

    if (!name || !cpf || !email || !phone) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    const order_id = createHash('md5').update(String(Date.now()) + session.user.username).digest('hex')
    const notification_url = `${process.env.PIX_SITE_URL}api/webhooks/pix`

    const invoice = await createPixInvoice({
      order_id,
      payer_email: email,
      payer_name: name,
      payer_cpf_cnpj: cpf.replace(/\D/g, ''),
      payer_phone: phone.replace(/\D/g, ''),
      amount_brl: amountNum,
      username: session.user.username,
      notification_url,
    })

    await insertPixTransaction({
      transaction_id: invoice.transaction_id,
      username: session.user.username,
      payment_amount: amountNum,
      email,
      order_id,
      qrcode: invoice.qrcode_url,
      emv: invoice.emv,
      name,
      document: cpf.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, ''),
    })

    return NextResponse.json({
      transaction_id: invoice.transaction_id,
      qrcode_url: invoice.qrcode_url,
      emv: invoice.emv,
      order_id,
    })
  } catch (err) {
    console.error('[api/pix/create]', err)
    return NextResponse.json({ error: 'Erro ao criar cobrança PIX. Tente novamente.' }, { status: 500 })
  }
}
