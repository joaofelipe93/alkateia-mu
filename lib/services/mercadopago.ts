// Wrapper da API MercadoPago (sem SDK externo — REST direto)

const MP_BASE = 'https://api.mercadopago.com'

function accessToken() { return process.env.MP_ACCESS_TOKEN! }

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken()}`,
  }
}

export interface MpPreferenceResult {
  preference_id: string
  init_point: string
}

export interface MpPaymentData {
  id: string
  status: string          // 'approved' | 'pending' | 'rejected' | ...
  status_detail: string
  transaction_amount: number
  currency_id: string
  description: string
  payment_method_id: string
  payment_type_id: string
  date_created: string
  date_approved: string | null
  payer?: { ip_address?: string }
}

export async function createMpPreference(params: {
  username: string
  credits: number
  amount_brl: number
  config_id: number
}): Promise<MpPreferenceResult> {
  // description format exacto do PHP: "{username}|{credits}|COINS|{config_id}"
  const description = `${params.username}|${params.credits}|COINS|${params.config_id}`

  const body = {
    items: [
      {
        id: '1',
        title: 'Doação AlkateiaMU',
        description,
        category_id: 'home',
        quantity: 1,
        unit_price: params.amount_brl,
      },
    ],
    back_urls: {
      success: process.env.MP_RETURN_URL,
      failure: process.env.MP_RETURN_URL,
      pending: process.env.MP_RETURN_URL,
    },
    auto_return: 'approved',
    notification_url: process.env.MP_WEBHOOK_URL,
  }

  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MercadoPago preference failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    preference_id: data.id,
    init_point: data.init_point,
  }
}

export async function getMpPayment(paymentId: string): Promise<MpPaymentData> {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`MercadoPago payment fetch failed (${res.status})`)
  }

  return res.json()
}
