import type { Sale } from '@/features/pos/types/pos.types'
import type { RentalBooking, RentalSpace } from '@/features/rentals/types/rentals.types'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import type { PayrollEntry } from '@/features/hr/types/hr.types'
import type { CashReceipt } from '@/features/scrd/types/cashReceipts.types'
import type { MemberPaymentCategory, ScoutMember } from '@/features/troops/types/troop.types'
import { getExpenseVouchers, voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import { fiscalMonthIndex } from '@/shared/lib/fiscalYear'
import type { BudgetCategory } from '../types/budget.types'

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
  'cost of living allowance': 'cola',
  'representation of executive': 'representation'
}

// Membership-dues income budget lines matched against the manually-recorded Cash
// Receipts categories that fund them (see SCRD > Receipts) — "Troop, BC/DC Fees"
// rolls up every individual/troop membership category the Council collects under
// it (Troop Fees, Barangay Committee, Associate, Career Woman, Honorary Member),
// not just the two its name literally spells out.
const CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE: Record<string, CashReceipt['category'][]> = {
  'council support fund': ['Council Support Fund'],
  'troop, bc/dc fees': [
    'Troop Fees',
    'Barangay Committee',
    'Associate',
    'Career Woman',
    'Honorary Member'
  ],
  'training fees': ['Training Fees'],
  'camping fees': ['Camping Fees']
}

// The same three income lines are also funded directly by individual Troop member payments
// (Roster > Record Payment), not just a lump Journal Voucher — both sources add together.
const MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE: Record<string, MemberPaymentCategory[]> = {
  'troop, bc/dc fees': ['membership'],
  'training fees': ['training'],
  'camping fees': ['camping']
}

interface AutoActualSources {
  sales: Sale[]
  bookings: RentalBooking[]
  spaces: RentalSpace[]
  vouchers: Voucher[]
  payroll: PayrollEntry[]
  cashReceipts: CashReceipt[]
  scoutMembers: ScoutMember[]
}

/** One of `budget.autoSource.*` in the locale files — identifies which rule matched a category,
 *  so the UI can say specifically where a line's live figure comes from instead of a single
 *  generic "this has a live figure" tooltip everywhere. */
export type AutoActualSourceKey =
  | 'equipmentService'
  | 'rentalHall'
  | 'rentalRoom'
  | 'rentalSpace'
  | 'councilSupportFund'
  | 'troopBcDcFees'
  | 'trainingFees'
  | 'campingFees'
  | 'payroll'
  | 'voucherMatch'

export interface AutoActualEntry {
  months: number[]
  sourceKey: AutoActualSourceKey
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
): Map<string, AutoActualEntry> {
  const result = new Map<string, AutoActualEntry>()
  if (!fiscalYear) return result

  const expenseVouchers = getExpenseVouchers(sources.vouchers)

  for (const category of categories) {
    if (category.fiscalYear !== fiscalYear) continue
    const normalized = normalizeCategoryName(category.name)
    const months = emptyMonths()
    let sourceKey: AutoActualSourceKey | null = null

    if (category.section === 'income') {
      if (normalized.includes('equipment service')) {
        sourceKey = 'equipmentService'
        for (const s of sources.sales) {
          if (s.voided) continue
          const idx = fiscalMonthIndex(s.createdAt, fiscalYear)
          if (idx !== null) months[idx] += s.totalAmount
        }
      } else if (normalized.includes('rental')) {
        const wantsHall = normalized.includes('hall')
        const wantsRoom = normalized.includes('room')
        sourceKey = wantsHall ? 'rentalHall' : wantsRoom ? 'rentalRoom' : 'rentalSpace'
        for (const b of sources.bookings) {
          if (b.status !== 'confirmed' && b.status !== 'completed') continue
          const space = sources.spaces.find((sp) => sp.id === b.rentalSpaceId)
          // Prefers the space's own `category` field (set on Add/Edit Room) — falls back to
          // guessing from its free-text name for a space nobody's re-categorized yet.
          const spaceName = (space?.name ?? '').toLowerCase()
          const isHall = space?.category ? space.category === 'hall' : spaceName.includes('hall')
          const isRoom = space?.category ? space.category === 'room' : spaceName.includes('room')
          const isThisCategory = wantsHall ? isHall : wantsRoom ? isRoom : !isHall && !isRoom
          if (!isThisCategory) continue
          const idx = fiscalMonthIndex(b.bookingDate, fiscalYear)
          if (idx !== null) months[idx] += b.amountPaid ?? b.totalAmount
        }
      } else if (
        CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE[normalized] ||
        MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE[normalized]
      ) {
        sourceKey =
          normalized === 'council support fund'
            ? 'councilSupportFund'
            : normalized === 'training fees'
              ? 'trainingFees'
              : normalized === 'camping fees'
                ? 'campingFees'
                : 'troopBcDcFees'
        const wantedCashReceiptCategories = CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE[normalized] ?? []
        for (const r of sources.cashReceipts) {
          if (!wantedCashReceiptCategories.includes(r.category)) continue
          const idx = fiscalMonthIndex(r.date, fiscalYear)
          if (idx !== null) months[idx] += r.amount
        }
        const wantedPaymentCategories = MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE[normalized] ?? []
        for (const member of sources.scoutMembers) {
          for (const payment of member.payments ?? []) {
            if (!wantedPaymentCategories.includes(payment.category)) continue
            const idx = fiscalMonthIndex(payment.date, fiscalYear)
            if (idx !== null) months[idx] += payment.amount
          }
        }
      }
    } else {
      const payrollField = PAYROLL_FIELD_BY_CATEGORY[normalized]
      if (payrollField) {
        sourceKey = 'payroll'
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
          sourceKey = 'voucherMatch'
          const idx = fiscalMonthIndex(v.date, fiscalYear)
          if (idx !== null) months[idx] += v.amount
        }
      }
    }

    if (sourceKey) result.set(category.id, { months, sourceKey })
  }

  return result
}
