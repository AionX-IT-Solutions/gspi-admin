import type { Voucher, VoucherAccountLine } from '../types/vouchers.types'

/** Approved check/disbursement vouchers are the org's real expenses — journal vouchers are
 *  non-cash entries, and pending/cancelled ones haven't actually gone out yet.
 *  Reports (Income Statement, Dashboard) should all agree on this same definition. */
export function getExpenseVouchers(vouchers: Voucher[]): Voucher[] {
  return vouchers.filter((v) => v.voucherType === 'check_voucher' && v.status === 'approved')
}

/** The voucher's GL account line doubles as its expense category (see the New Voucher
 *  form's single "GL Account" field) — falls back to a generic bucket if somehow blank. */
export function voucherCategory(voucher: Voucher): string {
  return voucher.accountLines[0]?.account?.trim() || 'Other'
}

/** A voucher account label can be a plain Council Budget category name ("6. Trainings") or
 *  a compound "{budget category} - {specific item}" label (e.g. "6. Trainings - Meals and
 *  Snacks") kept for itemized traceability on a cash-advance liquidation's Summary of
 *  Expenses — only the part before " - " is ever meant to be compared against a Council
 *  Budget category name. A plain label with no " - " passes through unchanged. */
export function linkedBudgetCategoryName(account: string): string {
  return account.split(' - ')[0].trim()
}

/** A Check Voucher whose debit side is granting a Cash Advance (never a Journal Voucher
 *  clearing one back out on the credit side — see the `debit > 0` guard) — confirmed
 *  against the Council's real DV templates, where the officer receiving the advance is
 *  also its usual "Certified Correct" signatory, so that tier swaps labels instead. */
export function isCashAdvanceDisbursement(voucher: Voucher): boolean {
  return (
    voucher.voucherType === 'check_voucher' &&
    voucher.accountLines.some(
      (l) => l.debit > 0 && l.account.trim().toLowerCase() === 'cash advance'
    )
  )
}

/** A Journal Voucher that liquidates a cash advance always carries `cashAdvanceAmount` —
 *  used to gate the cash-advance recap block on both the JV itself and its Summary of
 *  Expenses backup. */
export function hasCashAdvance(voucher: Voucher): boolean {
  return voucher.cashAdvanceAmount !== undefined
}

/** Owed back TO the payee once the actual liquidated expenses (`spent` — the JV's own
 *  `totalAmountSpent`, or an itemized Summary of Expenses total when one exists) exceed
 *  the net cash advance (the advance minus whatever's already been refunded). */
export function cashAdvanceReimbursement(voucher: Voucher, spent: number): number {
  const netAdvance = (voucher.cashAdvanceAmount ?? 0) - (voucher.amountRefunded ?? 0)
  return Math.max(0, spent - netAdvance)
}

/** All of a cash-advance-liquidation JV's real expense-category debit lines — excludes the
 *  closing "Cash Advance" credit line and the balancing "Cash" refund/overspend plug (see
 *  deriveCashAdvanceLiquidation below), neither of which is a real Council Budget expense
 *  category. Used by budgetAutoActuals to count liquidated cash-advance spending against
 *  whichever budget line(s) it was actually itemized under. */
export function cashAdvanceLiquidationExpenseLines(voucher: Voucher): VoucherAccountLine[] {
  return voucher.accountLines.filter(
    (l) => l.debit > 0 && !['cash', 'cash advance'].includes(l.account.trim().toLowerCase())
  )
}

/** Strips a Council Budget category's leading workbook ordinal ("1. ", "23) ") for display
 *  on a voucher's account line — e.g. "1. Salaries" -> "Salaries" — without touching case,
 *  unlike budgetAutoActuals.ts's normalizeCategoryName (which also lowercases, purely for
 *  matching). Matching still works fine either way since normalizeCategoryName strips
 *  numbering again on both sides before comparing. Used both when deriving a cash-advance
 *  liquidation below and by NewVoucherModal/ExpenseSummaryModal's own Budget-category
 *  suggestion lists, so a number never ends up on a voucher's account text in the first
 *  place. */
export function stripCategoryNumbering(name: string): string {
  return name.replace(/^\d+[.)]?\s*/, '').trim()
}

export interface CashAdvanceExpenseItem {
  category: string
  amount: number
}

export interface DerivedCashAdvanceLiquidation {
  accountLines: VoucherAccountLine[]
  amount: number
  totalAmountSpent: number
  amountRefunded: number
}

/** The Council's real liquidating Journal Voucher is never hand-typed — its debit/credit
 *  lines are a mechanical consequence of the itemized Summary of Expenses: one debit line
 *  per expense category (summed from the items), one credit line clearing the full
 *  original Cash Advance, and a balancing "Cash" plug so the entry always nets to zero —
 *  a debit (refund) when underspent, or a credit (additional withdrawal) when overspent.
 *  `budgetCategory` (the Summary of Expenses' single "charge to" pick — a cash advance is
 *  normally issued for one purpose even though its receipts are itemized individually)
 *  prefixes each debit line's account as "{budgetCategory} - {item category}" so
 *  budgetAutoActuals' linkedBudgetCategoryName can link it back to that Council Budget
 *  line — falls back to the plain item category when none is set (older summaries). */
export function deriveCashAdvanceLiquidation(
  cashAdvanceAmount: number,
  items: CashAdvanceExpenseItem[],
  refundOrNumber?: string,
  budgetCategory?: string
): DerivedCashAdvanceLiquidation {
  const categoryTotals = new Map<string, number>()
  for (const item of items) {
    const category = item.category.trim() || 'Other'
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + (item.amount || 0))
  }
  const totalAmountSpent = [...categoryTotals.values()].reduce((sum, v) => sum + v, 0)

  const linkedCategory = budgetCategory?.trim() ? stripCategoryNumbering(budgetCategory.trim()) : ''
  const debitLines: VoucherAccountLine[] = [...categoryTotals.entries()].map(
    ([category, amount]) => ({
      account: linkedCategory ? `${linkedCategory} - ${category}` : category,
      debit: amount,
      credit: 0
    })
  )
  const creditLine: VoucherAccountLine = {
    account: 'Cash Advance',
    debit: 0,
    credit: cashAdvanceAmount
  }

  const underspent = Math.max(cashAdvanceAmount - totalAmountSpent, 0)
  const overspent = Math.max(totalAmountSpent - cashAdvanceAmount, 0)
  const plugLines: VoucherAccountLine[] = []
  if (underspent > 0) {
    plugLines.push({
      account: 'Cash',
      description: refundOrNumber ? `Refund per OR No. ${refundOrNumber}` : undefined,
      debit: underspent,
      credit: 0
    })
  }
  if (overspent > 0) {
    plugLines.push({ account: 'Cash', debit: 0, credit: overspent })
  }

  return {
    accountLines: [...debitLines, creditLine, ...plugLines],
    amount: Math.max(totalAmountSpent, cashAdvanceAmount),
    totalAmountSpent,
    amountRefunded: underspent
  }
}
