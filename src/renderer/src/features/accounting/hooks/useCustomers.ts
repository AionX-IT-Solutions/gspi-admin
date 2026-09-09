import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'
import type { Customer } from '../types/accounting.types'

export interface CustomerRow extends Customer {
  /** Live sum of this customer's outstanding invoice balances — not a stored field, see
   *  useCustomerDetailModal.ts for why. */
  balance: number
}

export function useCustomers() {
  const loading = useSkeletonLoading()
  const customerList = useAccountingStore((s) => s.customers)
  const invoiceList = useAccountingStore((s) => s.invoices)

  const [viewingId, setViewingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  const customerRows: CustomerRow[] = useMemo(
    () =>
      customerList.map((c) => ({
        ...c,
        balance: invoiceList
          .filter((i) => i.customerId === c.id)
          .reduce((sum, i) => sum + i.balanceDue, 0)
      })),
    [customerList, invoiceList]
  )

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customerRows
    return customerRows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        c.email.toLowerCase().includes(q)
    )
  }, [customerRows, search])

  return {
    loading,
    search,
    setSearch,
    filteredCustomers,
    viewingId,
    setViewingId,
    creating,
    setCreating
  }
}
