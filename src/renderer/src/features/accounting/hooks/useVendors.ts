import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'

export function useVendors() {
  const loading = useSkeletonLoading()
  const vendorList = useAccountingStore((s) => s.vendors)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vendorList
    return vendorList.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.company?.toLowerCase().includes(q) ?? false) ||
        v.email.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    )
  }, [vendorList, search])

  return { loading, vendorList, filteredVendors, creating, setCreating, search, setSearch }
}
