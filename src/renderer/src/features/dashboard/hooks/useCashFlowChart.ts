import { useMemo } from 'react'
import type { Invoice } from '@/features/accounting/types/accounting.types'

export function useCashFlowChart(invoices: Invoice[]) {
  const buckets = useMemo(() => {
    const bucketCount = 8
    const bucketSize = 15
    const now = new Date()
    const sums = Array.from({ length: bucketCount }, () => 0)
    invoices.forEach((inv) => {
      const diffDays = Math.round(
        (now.getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      const idx = bucketCount - 1 - Math.floor(diffDays / bucketSize)
      if (idx >= 0 && idx < bucketCount) sums[idx] += inv.total
    })
    return sums.map((amount, i) => {
      const daysAgo = (bucketCount - 1 - i) * bucketSize
      const bucketDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      return {
        period: bucketDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }
    })
  }, [invoices])

  return buckets
}
