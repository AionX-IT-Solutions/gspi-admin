import { useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'

export function useVendors() {
  const loading = useSkeletonLoading()
  const vendorList = useAccountingStore((s) => s.vendors)
  const [creating, setCreating] = useState(false)

  return { loading, vendorList, creating, setCreating }
}
