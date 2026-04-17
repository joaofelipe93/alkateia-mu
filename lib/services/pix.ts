// Wrapper da API PagHiper (PIX)

const PIX_BASE = 'https://pix.paghiper.com'

function apiKey() { return process.env.PIX_API_KEY! }
function token()  { return process.env.PIX_TOKEN! }

export interface PixInvoiceResult {
  transaction_id: string
  qrcode_url: string
  emv: string
}

export interface PixVerifyResult {
  result: string
  status: string       // 'pending' | 'paid' | 'canceled' | 'refunded'
  order_id: string
  value_cents: number
}

export async function createPixInvoice(params: {
  order_id: string
  payer_email: string
  payer_name: string
  payer_cpf_cnpj: string
  payer_phone: string
  amount_brl: number   // em reais (ex: 50.00)
  username: string     // vai como description do item
  notification_url: string
}): Promise<PixInvoiceResult> {
  const body = {
    apiKey: apiKey(),
    order_id: params.order_id,
    payer_email: params.payer_email,
    payer_name: params.payer_name,
    payer_cpf_cnpj: params.payer_cpf_cnpj,
    payer_phone: params.payer_phone,
    notification_url: params.notification_url,
    days_due_date: '1',
    items: [
      {
        item_id: '1',
        description: params.username,
        quantity: '1',
        price_cents: String(Math.round(params.amount_brl * 100)),
      },
    ],
  }

  const res = await fetch(`${PIX_BASE}/invoice/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (res.status !== 201) {
    const text = await res.text()
    throw new Error(`PagHiper create failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const req = data.pix_create_request

  if (req.result !== 'success') {
    throw new Error(`PagHiper error: ${req.response_message ?? 'unknown'}`)
  }

  return {
    transaction_id: req.transaction_id,
    qrcode_url: req.pix_code.qrcode_image_url,
    emv: req.pix_code.emv,
  }
}

export async function verifyPixPayment(
  transaction_id: string,
  notification_id: string
): Promise<PixVerifyResult> {
  const body = {
    apiKey: apiKey(),
    token: token(),
    transaction_id,
    notification_id,
  }

  const res = await fetch(`${PIX_BASE}/invoice/notification/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const req = data.status_request

  return {
    result: req.result,
    status: req.status,
    order_id: req.order_id,
    value_cents: Number(req.value_cents ?? 0),
  }
}

export async function cancelPixInvoice(transaction_id: string): Promise<boolean> {
  const body = {
    apiKey: apiKey(),
    token: token(),
    status: 'canceled',
    transaction_id,
  }

  const res = await fetch(`${PIX_BASE}/invoice/cancel/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  return res.status === 201
}
