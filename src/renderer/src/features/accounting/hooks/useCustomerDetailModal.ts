import { useMemo } from 'react'
import { useAccountingStore } from '../store/accounting.store'

export function useCustomerDetailModal(customerId: string | null) {
  const customer = useAccountingStore((s) => s.customers.find((c) => c.id === customerId) ?? null)
  const invoiceList = useAccountingStore((s) => s.invoices)

  const customerInvoices = useMemo(
    () => (customer ? invoiceList.filter((i) => i.customerId === customer.id) : []),
    [customer, invoiceList]
  )

  return { customer, customerInvoices }
}
