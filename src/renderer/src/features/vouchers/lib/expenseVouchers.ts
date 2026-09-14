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
 *  a debit (refund) when underspent, or a credit (additional withdrawal) when overspent. */
export function deriveCashAdvanceLiquidation(
  cashAdvanceAmount: number,
  items: CashAdvanceExpenseItem[],
  refundOrNumber?: string
): DerivedCashAdvanceLiquidation {
  const categoryTotals = new Map<string, number>()
  for (const item of items) {
    const category = item.category.trim() || 'Other'
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + (item.amount || 0))
  }
  const totalAmountSpent = [...categoryTotals.values()].reduce((sum, v) => sum + v, 0)

  const debitLines: VoucherAccountLine[] = [...categoryTotals.entries()].map(
    ([account, amount]) => ({ account, debit: amount, credit: 0 })
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
