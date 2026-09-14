import type { Voucher, VoucherType } from '../types/vouchers.types'

// CV/DV and JV run on independent numbering sequences in the Council's real books — a
// Journal Voucher's own number never shares the Disbursement Voucher's series, and each
// runs far fewer digits than the other. Suggests the next number in "YYYY - MM - NNNNNN"
// (Check/Disbursement Voucher) or "YYYY - MM - NNN" (Journal Voucher) form for the current
// month — the accountant can still overwrite it in the New Voucher form to match whatever
// is already written on a pre-numbered paper voucher.
export function suggestVoucherNumber(existing: Voucher[], voucherType: VoucherType): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const digits = voucherType === 'check_voucher' ? 6 : 3
  const max = existing
    .filter((v) => v.voucherType === voucherType)
    .reduce((m, v) => {
      const n = parseInt(v.voucherNumber.split('-').pop()?.trim() ?? '', 10)
      return Number.isFinite(n) ? Math.max(m, n) : m
    }, 0)
  return `${year} - ${month} - ${String(max + 1).padStart(digits, '0')}`
}
