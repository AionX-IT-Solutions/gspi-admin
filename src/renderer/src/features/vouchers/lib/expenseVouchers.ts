import type { Voucher } from '../types/vouchers.types'

/** Posted check/disbursement vouchers are the org's real expenses — journal vouchers are
 *  non-cash entries, and pending/approved/cancelled ones haven't actually gone out yet.
 *  Reports (Income Statement, Dashboard) should all agree on this same definition. */
export function getExpenseVouchers(vouchers: Voucher[]): Voucher[] {
  return vouchers.filter((v) => v.voucherType === 'check_voucher' && v.status === 'posted')
}

/** The voucher's GL account line doubles as its expense category (see the New Voucher
 *  form's single "GL Account" field) — falls back to a generic bucket if somehow blank. */
export function voucherCategory(voucher: Voucher): string {
  return voucher.accountLines[0]?.account?.trim() || 'Other'
}
