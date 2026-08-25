import type { useTranslation } from 'react-i18next'
import type { InvoiceStatus } from '../types/accounting.types'

type TFn = ReturnType<typeof useTranslation>['t']

export const statusBadgeVariant: Record<
  InvoiceStatus,
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  draft: 'default',
  sent: 'primary',
  paid: 'success',
  overdue: 'danger',
  partial: 'warning'
}

export function invoiceStatusLabel(t: TFn, status: InvoiceStatus): string {
  if (status === 'draft') return t('common.draft')
  if (status === 'paid') return t('common.paid')
  if (status === 'overdue') return t('common.overdue')
  return t(`invoices.status.${status}`)
}
