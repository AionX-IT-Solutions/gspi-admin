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

// The Council's real budget document labels each section's grand-total row differently
// from a generic "{group} Total" — the Operations/Capital groups read "Total Operating/
// Capital Income|Expense", while the residual "Other" group just reads "Other Income|
// Expense" with no "Total" prefix. Note expense's own group order/naming differs from
// income's (II. OTHER EXPENSES / III. CAPITAL OUTLAY, swapped vs. income's II/III) — this
// maps by meaning, not by roman-numeral position.
const GROUP_TOTAL_LABELS: Record<string, string> = {
  'income:I. OPERATIONS': 'Total Operating Income',
  'income:II. CAPITAL': 'Total Capital Income',
  'income:III. OTHER INCOME': 'Other Income',
  'expense:I. OPERATIONS': 'Total Operating Expense',
  'expense:II. OTHER EXPENSES': 'Other Expense',
  'expense:III. CAPITAL OUTLAY': 'Total Capital Expense'
}

/** Custom grand-total label for a group, or `null` for any group outside the fixed set
 *  above (e.g. one added later via Add Budget Line) — callers fall back to a generic
 *  "{group} Total" in that case. */
export function groupTotalLabel(section: BudgetSection, group: string): string | null {
  return GROUP_TOTAL_LABELS[`${section}:${group}`] ?? null
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
