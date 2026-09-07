import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'

export function useViewInvoiceModal(invoiceId: string | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const invoice = useAccountingStore((s) => s.invoices.find((i) => i.id === invoiceId) ?? null)
  const updateInvoice = useAccountingStore((s) => s.updateInvoice)

  function handleMarkPaid() {
    if (!invoice) return
    updateInvoice(invoice.id, { status: 'paid', balanceDue: 0 })
    toast.success(t('invoices.toast.markedPaid', { number: invoice.number }))
  }

  // No confirmation step — voiding (unlike deleting) doesn't destroy the record,
  // so it doubles as the quick undo for a Mark as Paid done by mistake.
  function handleVoid() {
    if (!invoice) return
    updateInvoice(invoice.id, { status: 'void', balanceDue: 0 })
    toast.success(t('invoices.toast.voided', { number: invoice.number }))
  }

  return {
    invoice,
    handleMarkPaid,
    handleVoid
  }
}
