import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'

export function useCustomers() {
  const loading = useSkeletonLoading()
  const customerList = useAccountingStore((s) => s.customers)

  const [viewingId, setViewingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customerList
    return customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        c.email.toLowerCase().includes(q)
    )
  }, [customerList, search])

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
