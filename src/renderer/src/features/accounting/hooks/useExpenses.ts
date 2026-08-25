import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAccountingStore } from '../store/accounting.store'

export function useExpenses() {
  const loading = useSkeletonLoading()
  const expenseList = useAccountingStore((s) => s.expenses)

  const [creating, setCreating] = useState(false)

  const summary = useMemo(() => {
    const total = expenseList.reduce((s, e) => s + e.amount, 0)
    const unpaid = expenseList
      .filter((e) => e.status === 'unpaid')
      .reduce((s, e) => s + e.amount, 0)
    const paid = total - unpaid
    return { total, unpaid, paid }
  }, [expenseList])

  return { loading, expenseList, summary, creating, setCreating }
}
