import crypto from 'node:crypto'

const defaultBaseUrl = 'https://api.eversend.co'
let tokenCache: { value: string; expiresAt: number } | null = null

export type EversendCollection = {
  reference: string
  status: string
  raw: Record<string, unknown>
}

export function eversendConfigured() {
  return Boolean(
    process.env.EVERSEND_CLIENT_ID?.trim() &&
    process.env.EVERSEND_CLIENT_SECRET?.trim(),
  )
}

export async function initiateEversendCollection(options: {
  amount: number
  phone: string
  email: string
  transactionRef: string
}) {
  const payload = await eversendRequest('/v1/collections/momo', {
    method: 'POST',
    body: JSON.stringify({
      phone: options.phone.startsWith('+') ? options.phone : `+${options.phone}`,
      amount: options.amount,
      country: 'KE',
      currency: 'KES',
      customer: { email: options.email },
      transactionRef: options.transactionRef.replace(/[^A-Za-z0-9]/g, '').slice(0, 40),
    }),
  })
  const body = objectPayload(payload)
  const nested = objectPayload(body.data)
  const data = Object.keys(nested).length ? nested : body
  return {
    reference: firstValue(data, ['transactionRef', 'transaction_ref', 'reference', 'transactionId', 'id']),
    status: firstValue(data, ['status', 'state']) || 'pending',
    raw: body,
  } satisfies EversendCollection
}

export function verifyEversendWebhook(rawBody: string, signature: string) {
  const secret = process.env.EVERSEND_WEBHOOK_SECRET?.trim()
  if (!secret || !/^[a-f0-9]{128}$/i.test(signature)) return false
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const received = Buffer.from(signature.toLowerCase(), 'utf8')
  const calculated = Buffer.from(expected, 'utf8')
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated)
}

function eversendBaseUrl() {
  const configured = process.env.EVERSEND_BASE_URL?.trim() || defaultBaseUrl
  const parsed = new URL(configured)
  if (parsed.protocol !== 'https:') throw new Error('eversend_https_required')
  return parsed.origin
}

async function eversendToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.value
  const clientId = process.env.EVERSEND_CLIENT_ID?.trim()
  const clientSecret = process.env.EVERSEND_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) throw new Error('eversend_not_configured')
  const response = await fetch(`${eversendBaseUrl()}/v1/auth/token`, {
    method: 'GET',
    headers: { clientId, clientSecret, Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null
  const tokenData = objectPayload(payload?.data)
  const token = String(
    payload?.token || payload?.access_token || tokenData.token || tokenData.access_token || '',
  )
  if (!response.ok || !token) {
    throw new Error(`eversend_auth_failed:${providerMessage(payload, response.status)}`)
  }
  const expiresIn = Number(
    payload?.expiresIn || payload?.expires_in || tokenData.expiresIn || tokenData.expires_in || 300,
  )
  tokenCache = {
    value: token,
    expiresAt: Date.now() + Math.max(60, Math.min(expiresIn, 3600)) * 1000,
  }
  return token
}

async function eversendRequest(path: string, init: RequestInit) {
  const token = await eversendToken()
  const response = await fetch(`${eversendBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null
  if (!response.ok || !payload) {
    throw new Error(`eversend_request_failed:${providerMessage(payload, response.status)}`)
  }
  return payload
}

function providerMessage(payload: Record<string, unknown> | null, status: number) {
  return String(payload?.message || payload?.error || payload?.code || `http_${status}`).slice(0, 180)
}

function objectPayload(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function firstValue(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const candidate = String(value[key] || '').trim()
    if (candidate) return candidate.slice(0, 120)
  }
  return ''
}
