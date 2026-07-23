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

  const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
  })
  return transporter.sendMail({
    from: `${process.env.FACULTY_ASSISTANT_EMAIL_FROM_NAME || 'Faculty Assistant'} <${process.env.FACULTY_ASSISTANT_EMAIL_FROM || process.env.EMAIL_FROM || facultyAssistantContact.supportEmail}>`,
    replyTo: process.env.FACULTY_ASSISTANT_SUPPORT_EMAIL || facultyAssistantContact.supportEmail,
    to: request.email,
    subject: content.subject,
    html: content.html,
  })
}

function professionalInvoice(request: InvoiceRequest) {
  if (request.billingPeriod === 'semester') {
    throw new Error('Semester billing is not available for Professional licences')
  }
  const paymentPhone = process.env.FACULTY_ASSISTANT_MPESA_PHONE?.trim()
  const paymentRecipient = process.env.FACULTY_ASSISTANT_MPESA_RECIPIENT?.trim()
  if (!paymentPhone || !paymentRecipient) {
    throw new Error('Faculty Assistant M-Pesa invoice details are not configured')
  }
  const annual = request.billingPeriod === 'annual'
  const amount = annual
    ? facultyAssistantPricing.professional.annualKes
    : facultyAssistantPricing.professional.monthlyKes
  const period = annual ? '12 months' : '1 month'
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
      <div class="payment">
        <p><strong>M-Pesa payment number:</strong> ${paymentPhone}</p>
        <p><strong>Recipient:</strong> ${paymentRecipient}</p>
      </div>
      <p>Please retain the M-Pesa confirmation. Access is activated only after the Faculty Assistant Licence Desk verifies the payment; payment alone does not grant Moodle or application access.</p>
    `),
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
    .foot{padding:16px 30px;background:#f8f5ec;color:#6b746e;font-size:12px}.foot a{color:#315f50;font-weight:700}
  </style></head><body><div class="wrap"><div class="head"><b>FACULTY ASSISTANT</b><div>Licence Desk</div></div><div class="body">${content}</div><div class="foot">This message was generated for a verified Faculty Assistant upgrade request. Do not forward private payment instructions.<br>Support: <a href="mailto:${facultyAssistantContact.supportEmail}">${facultyAssistantContact.supportEmail}</a></div></div></body></html>`
}

function shortReference(value: string) {
  return `FA-${value.replace(/-/g, '').slice(0, 10).toUpperCase()}`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character)
}
