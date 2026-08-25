import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'
import type { InvoiceStatus } from '../types/accounting.types'
import { invoiceStatusLabel } from '../components/invoiceStatus'

const filterTabKeys: ('all' | InvoiceStatus)[] = [
  'all',
  'draft',
  'sent',
  'overdue',
  'partial',
  'paid'
]

export function useInvoices() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const invoiceList = useAccountingStore((s) => s.invoices)
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const filterTabs: { key: 'all' | InvoiceStatus; label: string }[] = filterTabKeys.map((key) => ({
    key,
    label: key === 'all' ? t('invoices.filter.all') : invoiceStatusLabel(t, key)
  }))

  const summary = useMemo(() => {
    const overdue = invoiceList
      .filter((i) => i.status === 'overdue')
      .reduce((s, i) => s + i.balanceDue, 0)
    const notDueYet = invoiceList
      .filter((i) => i.status === 'sent' || i.status === 'partial')
      .reduce((s, i) => s + i.balanceDue, 0)
    const paid = invoiceList.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    return { overdue, notDueYet, paid }
  }, [invoiceList])

  const filtered = useMemo(
    () => (filter === 'all' ? invoiceList : invoiceList.filter((i) => i.status === filter)),
    [invoiceList, filter]
  )

  return {
    loading,
    filter,
    setFilter,
    filterTabs,
    summary,
    filtered,
    viewingId,
    setViewingId,
    creating,
    setCreating
  }
}
