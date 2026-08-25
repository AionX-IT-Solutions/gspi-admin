import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'

export function useViewInvoiceModal(invoiceId: string | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const invoice = useAccountingStore((s) => s.invoices.find((i) => i.id === invoiceId) ?? null)
  const updateInvoice = useAccountingStore((s) => s.updateInvoice)
  const [confirmingMarkPaid, setConfirmingMarkPaid] = useState(false)

  function handleConfirmMarkPaid() {
    if (!invoice) return
    updateInvoice(invoice.id, { status: 'paid', balanceDue: 0 })
    toast.success(t('invoices.toast.markedPaid', { number: invoice.number }))
    setConfirmingMarkPaid(false)
  }

  return { invoice, confirmingMarkPaid, setConfirmingMarkPaid, handleConfirmMarkPaid }
}
