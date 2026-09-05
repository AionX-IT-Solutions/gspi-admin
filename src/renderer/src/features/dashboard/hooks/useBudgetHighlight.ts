import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBudgetStore } from '@/features/budget/store/budget.store'
import { sectionTotals } from '@/features/budget/lib/budgetCalculations'

export function useBudgetHighlight() {
  const navigate = useNavigate()
  const categories = useBudgetStore((s) => s.categories)

  const fiscalYear = categories[0]?.fiscalYear ?? ''
  const income = useMemo(() => sectionTotals(categories, 'income'), [categories])
  const expense = useMemo(() => sectionTotals(categories, 'expense'), [categories])

  return { navigate, fiscalYear, income, expense, hasData: categories.length > 0 }
}
