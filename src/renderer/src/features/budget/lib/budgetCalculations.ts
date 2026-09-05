import type { BudgetCategory, BudgetSection } from '../types/budget.types'

export function actualToDate(category: BudgetCategory): number {
  return category.monthlyActuals.reduce((s, v) => s + v, 0)
}

export function priorYearActualTotal(category: BudgetCategory): number {
  return category.priorYearMonthlyActuals.reduce((s, v) => s + v, 0)
}

export interface BudgetSubGroupSummary {
  subGroup: string
  items: BudgetCategory[]
  totalBudgeted: number
  totalActual: number
}

export interface BudgetGroupSummary {
  group: string
  subGroups: BudgetSubGroupSummary[]
  totalBudgeted: number
  totalActual: number
}

/** Groups a section's categories into group -> subGroup -> items, each level carrying
 *  its own rolled-up totals, in the same order they appear in the source budget document. */
export function groupCategories(
  categories: BudgetCategory[],
  section: BudgetSection
): BudgetGroupSummary[] {
  const items = categories.filter((c) => c.section === section).sort((a, b) => a.order - b.order)

  const groups: BudgetGroupSummary[] = []
  for (const item of items) {
    let group = groups.find((g) => g.group === item.group)
    if (!group) {
      group = { group: item.group, subGroups: [], totalBudgeted: 0, totalActual: 0 }
      groups.push(group)
    }
    let subGroup = group.subGroups.find((sg) => sg.subGroup === item.subGroup)
    if (!subGroup) {
      subGroup = { subGroup: item.subGroup, items: [], totalBudgeted: 0, totalActual: 0 }
      group.subGroups.push(subGroup)
    }
    subGroup.items.push(item)
    subGroup.totalBudgeted += item.budgetedAmount
    subGroup.totalActual += actualToDate(item)
    group.totalBudgeted += item.budgetedAmount
    group.totalActual += actualToDate(item)
  }
  return groups
}

export interface BudgetSectionTotals {
  totalBudgeted: number
  totalActual: number
  variance: number
}

export function sectionTotals(
  categories: BudgetCategory[],
  section: BudgetSection
): BudgetSectionTotals {
  const items = categories.filter((c) => c.section === section)
  const totalBudgeted = items.reduce((s, c) => s + c.budgetedAmount, 0)
  const totalActual = items.reduce((s, c) => s + actualToDate(c), 0)
  return { totalBudgeted, totalActual, variance: totalActual - totalBudgeted }
}
