export type BudgetSection = 'income' | 'expense'

// Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May, Jun — the council's fiscal
// year runs July-June, matching the source budget workbook's month columns.
export const BUDGET_MONTH_LABELS = [
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun'
] as const

export interface BudgetCategory {
  id: string
  fiscalYear: string
  section: BudgetSection
  // Top-level roman-numeral heading, e.g. "I. OPERATIONS", "II. CAPITAL".
  group: string
  // Lettered sub-heading, e.g. "A. Fees" — empty string when the group has no
  // further subdivision (e.g. "III. OTHER INCOME").
  subGroup: string
  name: string
  order: number
  // This fiscal year's board-approved target amount.
  budgetedAmount: number
  // This fiscal year's actuals, Jul-Jun — filled in month by month as each closes.
  monthlyActuals: number[]
  // Prior fiscal year's figures, carried along purely for the variance/comparison
  // columns — never edited going forward.
  priorYearBudget: number
  priorYearActual: number
  priorYearMonthlyActuals: number[]
  createdAt: string
  updatedAt: string
}
