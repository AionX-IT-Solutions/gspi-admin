import { useMemo } from 'react'
import { useAccountingStore } from '../store/accounting.store'

export function useCustomerDetailModal(customerId: string | null) {
  const customer = useAccountingStore((s) => s.customers.find((c) => c.id === customerId) ?? null)
  const invoiceList = useAccountingStore((s) => s.invoices)

  const customerInvoices = useMemo(
    () => (customer ? invoiceList.filter((i) => i.customerId === customer.id) : []),
    [customer, invoiceList]
  )

  // Live off the customer's actual invoices, not a stored field — nothing ever kept a stored
  // balance/totalBilled in sync as invoices were issued, paid, or voided.
  const balance = useMemo(
    () => customerInvoices.reduce((sum, i) => sum + i.balanceDue, 0),
    [customerInvoices]
  )
  const totalBilled = useMemo(
    () =>
      customerInvoices
        .filter((i) => i.status !== 'draft' && i.status !== 'void')
        .reduce((sum, i) => sum + i.total, 0),
    [customerInvoices]
  )

  return { customer, customerInvoices, balance, totalBilled }
}
