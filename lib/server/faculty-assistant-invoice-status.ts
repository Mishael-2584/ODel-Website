import { getSupabaseAdmin } from './supabase-admin'

export type InvoiceDeliveryStatus = 'sent' | 'failed'

export async function persistInvoiceDeliveryStatus(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  requestId: string,
  status: InvoiceDeliveryStatus,
  failure = '',
) {
  const update = status === 'sent'
    ? {
        invoice_status: 'sent',
        invoice_sent_at: new Date().toISOString(),
        invoice_error: '',
      }
    : {
        invoice_status: 'failed',
        invoice_error: failure.slice(0, 500),
      }

  let lastError = ''
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await supabase
        .from('faculty_assistant_upgrade_requests')
        .update(update)
        .eq('id', requestId)
        .select('id')
        .maybeSingle()
      if (!error && data) return { persisted: true as const, error: '' }
      lastError = error?.message || 'Upgrade request no longer exists'
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown persistence error'
    }
  }

  return { persisted: false as const, error: lastError || 'Unknown persistence error' }
}
