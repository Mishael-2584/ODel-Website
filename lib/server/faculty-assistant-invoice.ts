import nodemailer from 'nodemailer'
import {
  facultyAssistantPriceKes,
  facultyAssistantPricing,
  facultyAssistantTermMonths,
  type FacultyAssistantBillingPeriod,
} from '@/lib/faculty-assistant/plans'
import { facultyAssistantContact } from '@/lib/faculty-assistant/contact'

type InvoiceRequest = {
  requestId: string
  email: string
  displayName: string
  requestedPlan: 'professional' | 'institution'
  billingPeriod: FacultyAssistantBillingPeriod
  paymentUrl?: string
  stkInitiated?: boolean
  paymentProvider?: 'eversend' | 'paynexus'
}

export async function sendFacultyAssistantInvoice(request: InvoiceRequest) {
  const content = request.requestedPlan === 'professional'
    ? professionalInvoice(request)
    : institutionAcknowledgement(request)
  if (process.env.EMAIL_TRANSPORT === 'console') {
    console.log('[Faculty Assistant invoice email]', {
      to: request.email,
      subject: content.subject,
      requestId: request.requestId,
    })
    return { messageId: `console-${request.requestId}` }
  }

  const transporter = facultyAssistantTransporter()
  return transporter.sendMail({
    from: facultyAssistantSender(),
    replyTo: process.env.FACULTY_ASSISTANT_SUPPORT_EMAIL || facultyAssistantContact.supportEmail,
    to: request.email,
    subject: content.subject,
    html: content.html,
  })
}

export async function sendFacultyAssistantActivationEmail(request: {
  requestId: string
  email: string
  displayName: string
  billingPeriod: string
  expiresAt: string
  paymentReference: string
  paymentProvider?: 'eversend' | 'paynexus'
}) {
  const expiry = new Date(request.expiresAt)
  const expiryText = Number.isFinite(expiry.getTime())
    ? new Intl.DateTimeFormat('en-KE', { dateStyle: 'long' }).format(expiry)
    : request.expiresAt
  const subject = `Faculty Assistant Professional activated ${shortReference(request.requestId)}`
  const html = emailShell(`
    <p>Dear ${escapeHtml(request.displayName || 'Lecturer')},</p>
    <h2 style="color:#12352d">Your Professional licence is active.</h2>
    <p>${escapeHtml(providerLabel(request.paymentProvider))} confirmed your M-Pesa payment and Faculty Assistant activated the licence automatically.</p>
    <div class="invoice">
      <p><strong>Licence:</strong> Professional, ${escapeHtml(request.billingPeriod)}</p>
      <p><strong>Active until:</strong> ${escapeHtml(expiryText)}</p>
      <p><strong>Payment reference:</strong> ${escapeHtml(request.paymentReference)}</p>
    </div>
    <p>Open Faculty Assistant and use <strong>Refresh licence</strong>. If Moodle Connection was waiting for access, sign in again after refreshing.</p>
    <p>If the licence does not appear within a few minutes, contact Faculty Assistant support and include the payment reference above.</p>
  `)
  if (process.env.EMAIL_TRANSPORT === 'console') {
    console.log('[Faculty Assistant activation email]', {
      to: request.email,
      subject,
      requestId: request.requestId,
    })
    return { messageId: `console-activation-${request.requestId}` }
  }
  return facultyAssistantTransporter().sendMail({
    from: facultyAssistantSender(),
    replyTo: process.env.FACULTY_ASSISTANT_SUPPORT_EMAIL || facultyAssistantContact.supportEmail,
    to: request.email,
    subject,
    html,
  })
}

function professionalInvoice(request: InvoiceRequest) {
  if (request.billingPeriod === 'semester') {
    throw new Error('Semester billing is not available for Professional licences')
  }
  const paymentPhone = process.env.FACULTY_ASSISTANT_MPESA_PHONE?.trim()
  const paymentRecipient = process.env.FACULTY_ASSISTANT_MPESA_RECIPIENT?.trim()
  const annual = request.billingPeriod === 'annual'
  const amount = annual
    ? facultyAssistantPricing.professional.annualKes
    : facultyAssistantPricing.professional.monthlyKes
  const period = annual ? '12 months' : '1 month'
  const paymentUrl = safePaymentUrl(request.paymentUrl)
  const paymentBlock = paymentUrl
    ? `
      <div class="payment">
        <p><strong>${request.stkInitiated ? 'An M-Pesa prompt has been sent to your phone.' : 'Pay securely with M-Pesa.'}</strong></p>
        <p>If the prompt expires or does not appear, use the private checkout button below.</p>
        <p style="margin-top:16px"><a class="pay" href="${escapeHtml(paymentUrl)}">Open secure M-Pesa checkout</a></p>
      </div>
    `
    : request.stkInitiated
      ? `
        <div class="payment">
          <p><strong>An M-Pesa prompt has been sent to your phone.</strong></p>
          <p>Complete the prompt once. Your licence activates automatically after ${escapeHtml(providerLabel(request.paymentProvider))} sends a verified payment confirmation.</p>
        </div>
      `
    : paymentPhone && paymentRecipient
      ? manualPaymentBlock()
      : unavailablePaymentBlock()
  return {
    subject: `Faculty Assistant Professional invoice ${shortReference(request.requestId)}`,
    html: emailShell(`
      <p>Dear ${escapeHtml(request.displayName || 'Lecturer')},</p>
      <p>Your Faculty Assistant Professional upgrade request has been received. The payment details below are provided privately for this request.</p>
      <div class="invoice">
        <p><strong>Invoice reference:</strong> ${shortReference(request.requestId)}</p>
        <p><strong>Plan:</strong> Professional, ${escapeHtml(request.billingPeriod)}</p>
        <p><strong>Licence period:</strong> ${period}</p>
        <p><strong>Amount due:</strong> KES ${amount.toLocaleString('en-KE')}</p>
      </div>
      ${paymentBlock}
      <p>Please retain the M-Pesa confirmation. Activation follows a verified ${escapeHtml(providerLabel(request.paymentProvider))} server notification and is recorded in the Licence Desk.</p>
    `),
  }

  function manualPaymentBlock() {
    return `
      <div class="payment">
        <p><strong>Automated checkout is temporarily unavailable.</strong></p>
        <p><strong>M-Pesa payment number:</strong> ${escapeHtml(paymentPhone || '')}</p>
        <p><strong>Recipient:</strong> ${escapeHtml(paymentRecipient || '')}</p>
        <p>Manual payments require Licence Desk confirmation before activation.</p>
      </div>
    `
  }

  function unavailablePaymentBlock() {
    return `
      <div class="payment">
        <p><strong>The secure payment prompt is temporarily unavailable.</strong></p>
        <p>Your request is safely recorded. The Licence Desk will retry the secure payment prompt when the gateway is available; no payment is due through a personal number.</p>
      </div>
    `
  }
}

function institutionAcknowledgement(request: InvoiceRequest) {
  if (request.billingPeriod === 'monthly') {
    throw new Error('Monthly billing is not available for Institution licences')
  }
  const amount = facultyAssistantPriceKes('institution', request.billingPeriod)
  const months = facultyAssistantTermMonths(request.billingPeriod)
  const annualSaving = request.billingPeriod === 'annual'
    ? `<p><strong>Annual saving:</strong> KES ${facultyAssistantPricing.institution.annualSavingsKes.toLocaleString('en-KE')}</p>`
    : ''
  return {
    subject: `Faculty Assistant Institution request ${shortReference(request.requestId)}`,
    html: emailShell(`
      <p>Dear ${escapeHtml(request.displayName || 'Institution representative')},</p>
      <p>Your Institution licence request has been received under reference <strong>${shortReference(request.requestId)}</strong>.</p>
      <div class="invoice">
        <p><strong>Requested term:</strong> ${escapeHtml(request.billingPeriod)}</p>
        <p><strong>Coverage period:</strong> ${months} months</p>
        <p><strong>Licence amount:</strong> KES ${amount.toLocaleString('en-KE')}</p>
        ${annualSaving}
      </div>
      <p>Institution agreements require confirmation of the institution name, approved email domain or domains, deployment scope, and billing arrangements. The Faculty Assistant team will contact you before any licence is activated.</p>
      <p>No personal M-Pesa payment is required from this acknowledgement.</p>
    `),
  }
}

function emailShell(content: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;background:#f3f0e7;color:#23342d;font:15px/1.6 'Segoe UI',sans-serif}
    .wrap{max-width:620px;margin:24px auto;background:#fff;border:1px solid #ddd5c3;border-radius:18px;overflow:hidden}
    .head{padding:24px 30px;background:#12352d;color:#fff}.head b{color:#f1ca76;letter-spacing:.08em}
    .body{padding:30px}.invoice,.payment{margin:20px 0;padding:18px;border-radius:12px;background:#f8f5ec}
    .payment{border:1px solid #dfb552;background:#fff8df}.invoice p,.payment p{margin:5px 0}
    .pay{display:inline-block;padding:12px 18px;border-radius:9px;color:#09264a!important;background:#f1ca76;text-decoration:none;font-weight:800}
    .foot{padding:16px 30px;background:#f8f5ec;color:#6b746e;font-size:12px}.foot a{color:#315f50;font-weight:700}
  </style></head><body><div class="wrap"><div class="head"><b>FACULTY ASSISTANT</b><div>Licence Desk</div></div><div class="body">${content}</div><div class="foot">This message was generated for a verified Faculty Assistant upgrade request. Do not forward private payment instructions.<br>Support: <a href="mailto:${facultyAssistantContact.supportEmail}">${facultyAssistantContact.supportEmail}</a></div></div></body></html>`
}

function shortReference(value: string) {
  return `FA-${value.replace(/-/g, '').slice(0, 10).toUpperCase()}`
}

function facultyAssistantTransporter() {
  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
  })
}

function facultyAssistantSender() {
  return `${process.env.FACULTY_ASSISTANT_EMAIL_FROM_NAME || 'Faculty Assistant'} <${process.env.FACULTY_ASSISTANT_EMAIL_FROM || process.env.EMAIL_FROM || facultyAssistantContact.supportEmail}>`
}

function safePaymentUrl(value?: string) {
  if (!value) return ''
  try {
    const parsed = new URL(value)
    const isPayNexusHost =
      parsed.hostname === 'paynexus.co.ke' ||
      parsed.hostname.endsWith('.paynexus.co.ke')
    return parsed.protocol === 'https:' && isPayNexusHost
      ? parsed.toString()
      : ''
  } catch {
    return ''
  }
}

function providerLabel(provider?: 'eversend' | 'paynexus') {
  if (provider === 'paynexus') return 'PayNexus'
  if (provider === 'eversend') return 'Eversend'
  return 'payment gateway'
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character)
}
