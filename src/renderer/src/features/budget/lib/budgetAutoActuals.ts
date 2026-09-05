import type { Sale } from '@/features/pos/types/pos.types'
import type { RentalBooking, RentalSpace } from '@/features/rentals/types/rentals.types'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import type { PayrollEntry } from '@/features/hr/types/hr.types'
import { getExpenseVouchers, voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import type { BudgetCategory } from '../types/budget.types'

// Fiscal-year month order the budget uses: Jul, Aug, ..., Jun — see BUDGET_MONTH_LABELS.
// Values are JS `Date#getMonth()` indices (0 = January).
const FISCAL_MONTH_ORDER = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5]

/** Which of the 12 fiscal-year slots a date falls into, or null if it's outside this
 *  fiscal year entirely (fiscalYear "2026-2027" spans Jul 2026 through Jun 2027). */
function fiscalMonthIndex(dateIso: string, fiscalYear: string): number | null {
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return null
  const startYear = parseInt(fiscalYear.split('-')[0], 10)
  if (Number.isNaN(startYear)) return null
  const month = d.getMonth()
  const idx = FISCAL_MONTH_ORDER.indexOf(month)
  const expectedYear = month >= 6 ? startYear : startYear + 1
  return d.getFullYear() === expectedYear ? idx : null
}

function emptyMonths(): number[] {
  return Array(12).fill(0)
}

/** Strips the workbook's leading ordinal ("1. ", "23. ") and normalizes case/whitespace
 *  so a budget category name can be compared against a voucher's free-text GL account. */
function normalizeCategoryName(name: string): string {
  return name
    .replace(/^\d+[.)]?\s*/, '')
    .toLowerCase()
    .trim()
}

// Personnel-service budget lines that map 1:1 onto a PayrollEntry field — matched
// against the category name (post-normalization) rather than the raw voucher GL
// account text, since payroll deductions aren't recorded as vouchers.
const PAYROLL_FIELD_BY_CATEGORY: Record<string, keyof PayrollEntry> = {
  salaries: 'basicSalary',
  'sss contributions': 'sss',
  'philhealth contributions': 'philhealth',
  'pag-ibig contributions': 'pagibig',
  '13th month pay': 'thirteenthMonthPay',
  'cash gift': 'cashGift',
  'cost of living allowance': 'cola'
}

interface AutoActualSources {
  sales: Sale[]
  bookings: RentalBooking[]
  spaces: RentalSpace[]
  vouchers: Voucher[]
  payroll: PayrollEntry[]
}

/** For each budget category with a recognized real-data source, sums that source into
 *  the same 12-slot Jul-Jun shape as `BudgetCategory.monthlyActuals` — purely a
 *  reference figure the Edit modal can offer to fill in; never overwrites the
 *  council-approved manual actuals on its own. Categories with no confident match
 *  (most personnel/operating-expense lines, most income lines) are simply absent from
 *  the returned map and stay entirely manual, same as today. */
export function computeBudgetAutoActuals(
  categories: BudgetCategory[],
  fiscalYear: string,
  sources: AutoActualSources
): Map<string, number[]> {
  const result = new Map<string, number[]>()
  if (!fiscalYear) return result

  const expenseVouchers = getExpenseVouchers(sources.vouchers)

  for (const category of categories) {
    if (category.fiscalYear !== fiscalYear) continue
    const normalized = normalizeCategoryName(category.name)
    const months = emptyMonths()
    let matched = false

    if (category.section === 'income') {
      if (normalized.includes('equipment service')) {
        matched = true
        for (const s of sources.sales) {
          if (s.voided) continue
          const idx = fiscalMonthIndex(s.createdAt, fiscalYear)
          if (idx !== null) months[idx] += s.totalAmount
        }
      } else if (normalized.includes('rental')) {
        matched = true
        const wantsHall = normalized.includes('hall')
        const wantsRoom = normalized.includes('room')
        for (const b of sources.bookings) {
          if (b.status !== 'confirmed' && b.status !== 'completed') continue
          const spaceName = (
            sources.spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? ''
          ).toLowerCase()
          const isHall = spaceName.includes('hall')
          const isRoom = spaceName.includes('room')
          const isThisCategory = wantsHall ? isHall : wantsRoom ? isRoom : !isHall && !isRoom
          if (!isThisCategory) continue
          const idx = fiscalMonthIndex(b.bookingDate, fiscalYear)
          if (idx !== null) months[idx] += b.amountPaid ?? b.totalAmount
        }
      }
    } else {
      const payrollField = PAYROLL_FIELD_BY_CATEGORY[normalized]
      if (payrollField) {
        matched = true
        for (const p of sources.payroll) {
          if (p.status !== 'paid') continue
          const value = p[payrollField]
          if (typeof value !== 'number') continue
          const idx = fiscalMonthIndex(p.periodEnd, fiscalYear)
          if (idx !== null) months[idx] += value
        }
      } else {
        for (const v of expenseVouchers) {
          if (normalizeCategoryName(voucherCategory(v)) !== normalized) continue
          matched = true
          const idx = fiscalMonthIndex(v.date, fiscalYear)
          if (idx !== null) months[idx] += v.amount
        }
      }
    }

    if (matched) result.set(category.id, months)
  }

  return result
}
