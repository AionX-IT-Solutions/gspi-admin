import type { useTranslation } from 'react-i18next'
import type { Invoice, InvoiceStatus } from '../types/accounting.types'

type TFn = ReturnType<typeof useTranslation>['t']

/** The status actually shown to a user — every stored `InvoiceStatus` plus the
 *  computed-only "overdue" (see isInvoiceOverdue below). */
export type InvoiceDisplayStatus = InvoiceStatus | 'overdue'

export const statusBadgeVariant: Record<
  InvoiceDisplayStatus,
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  draft: 'default',
  unpaid: 'primary',
  partially_paid: 'warning',
  paid: 'success',
  void: 'default',
  overdue: 'danger'
}

export function invoiceStatusLabel(t: TFn, status: InvoiceDisplayStatus): string {
  if (status === 'draft') return t('common.draft')
  if (status === 'paid') return t('common.paid')
  if (status === 'unpaid') return t('common.unpaid')
  if (status === 'overdue') return t('common.overdue')
  return t(`invoices.status.${status}`)
}

/** Overdue is a point-in-time read of dueDate vs now, never persisted — mirrors
 *  gspi-app's isOverdue (features/invoices/utils/invoiceStatus.ts), so both apps
 *  agree on what counts as overdue without either side writing a stored status
 *  that would go stale the moment a day passes. */
export function isInvoiceOverdue(
  invoice: Pick<Invoice, 'status' | 'dueDate'>,
  now: Date = new Date()
): boolean {
  if (invoice.status === 'draft' || invoice.status === 'paid' || invoice.status === 'void') {
    return false
  }
  return new Date(invoice.dueDate).getTime() < now.getTime()
}

/** What badge/label to actually show for an invoice — its stored status, unless
 *  it's now overdue, in which case that takes visual precedence. */
export function invoiceDisplayStatus(
  invoice: Pick<Invoice, 'status' | 'dueDate'>
): InvoiceDisplayStatus {
  return isInvoiceOverdue(invoice) ? 'overdue' : invoice.status
}
