import type { CashReceipt } from '@/features/scrd/types/cashReceipts.types'
import type { Voucher } from '../types/vouchers.types'

/**
 * GSPI records incoming cash the same way it records outgoing cash: a Journal Voucher, credit
 * side. This is the credit-side counterpart of expenseVouchers.ts's getExpenseVouchers/
 * voucherCategory — posted Journal Vouchers only (pending/approved/cancelled ones haven't
 * actually come in yet, and a Check Voucher is only ever a disbursement, never a receipt),
 * flattened one row per credit line so a voucher that (rarely) records more than one income
 * category still contributes each to its own line.
 */
export function getReceiptRowsFromVouchers(vouchers: Voucher[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const voucher of vouchers) {
    if (voucher.voucherType !== 'journal_voucher' || voucher.status !== 'posted') continue
    voucher.accountLines.forEach((line, index) => {
      if (!line.credit) return
      rows.push({
        id: `${voucher.id}-${index}`,
        date: voucher.date,
        payor: voucher.payee,
        particulars: voucher.particulars,
        referenceNumber: voucher.voucherNumber,
        category: line.account.trim() || 'Other Operations',
        bankAccount: voucher.bankAccountRef ?? 'Cash on Hand',
        amount: line.credit
      })
    })
  }
  return rows
}
