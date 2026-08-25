import { useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'

export function useItems() {
  const loading = useSkeletonLoading()
  const itemList = useAccountingStore((s) => s.items)
  const [creating, setCreating] = useState(false)

  return { loading, itemList, creating, setCreating }
}
