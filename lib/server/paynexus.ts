import crypto from 'node:crypto'

const defaultBaseUrl = 'https://paynexus.co.ke'

type PayNexusEnvelope<T> = {
  success?: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

export type PayNexusStkPayment = {
  reference: string
  checkout_request_id: string
  amount: number
  phone: string
  status: string
}

export type PayNexusCheckoutSession = {
  session_id: string
  checkout_url: string
  expires_at: string
}

export function payNexusConfigured() {
  return Boolean(process.env.PAYNEXUS_SECRET_KEY?.trim())
}

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (/^254(1|7)\d{8}$/.test(digits)) return digits
  if (/^0(1|7)\d{8}$/.test(digits)) return `254${digits.slice(1)}`
  if (/^(1|7)\d{8}$/.test(digits)) return `254${digits}`
  return null
}

export function facultyAssistantPaymentReference(requestId: string) {
  const compact = requestId.replace(/[^a-f0-9]/gi, '').toUpperCase()
  if (compact.length < 10) throw new Error('invalid_upgrade_request_id')
  return `FA-${compact.slice(0, 20)}`
}

export async function initiatePayNexusStk(options: {
  amount: number
  phone: string
  description: string
}) {
  return payNexusRequest<PayNexusStkPayment>('/api/mpesa/payment/initiate', {
    method: 'POST',
    body: JSON.stringify({
      amount: options.amount,
      phone: options.phone,
      description: options.description.slice(0, 180),
    }),
  })
}

export async function createPayNexusCheckoutSession(options: {
  amount: number
  description: string
  reference: string
  returnUrl: string
  cancelUrl: string
}) {
  return payNexusRequest<PayNexusCheckoutSession>('/api/checkout/sessions', {
    method: 'POST',
    body: JSON.stringify({
      amount: options.amount,
      description: options.description.slice(0, 180),
      reference: options.reference,
      return_url: options.returnUrl,
      cancel_url: options.cancelUrl,
    }),
  })
}

export function verifyPayNexusWebhook(rawBody: string, signature: string) {
  const secret = process.env.PAYNEXUS_WEBHOOK_SECRET?.trim()
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  const receivedBuffer = Buffer.from(signature.toLowerCase(), 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
}

function payNexusBaseUrl() {
  const configured = process.env.PAYNEXUS_BASE_URL?.trim() || defaultBaseUrl
  const parsed = new URL(configured)
  if (parsed.protocol !== 'https:') throw new Error('paynexus_https_required')
  return parsed.origin
}

async function payNexusRequest<T>(path: string, init: RequestInit) {
  const secretKey = process.env.PAYNEXUS_SECRET_KEY?.trim()
  if (!secretKey) throw new Error('paynexus_not_configured')
  const response = await fetch(`${payNexusBaseUrl()}${path}`, {
    ...init,
    signal: AbortSignal.timeout(15_000),
    headers: {
      'X-API-Key': secretKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => null) as PayNexusEnvelope<T> | null
  if (!response.ok || !payload?.success || !payload.data) {
    const providerMessage = String(
      payload?.message || payload?.error || payload?.code || `http_${response.status}`,
    )
    throw new Error(`paynexus_request_failed:${providerMessage.slice(0, 180)}`)
  }
  return payload.data
}
