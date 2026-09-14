export type VoucherType = 'check_voucher' | 'journal_voucher'
// No separate "posted" step — the Council's real DV/JV forms have no such concept.
// Once the President signs (Approved By), the voucher is in effect; there's nothing
// further to advance it to.
export type VoucherStatus = 'pending' | 'approved' | 'cancelled'
export type ModeOfPayment = 'cash' | 'check'

export interface VoucherAccountLine {
  account: string
  // Shown on export as "Account - Description", e.g. "Salary - March 16-31, 2026"
  description?: string
  debit: number
  credit: number
}

export interface Voucher {
  id: string
  voucherNumber: string
  voucherType: VoucherType
  date: string
  modeOfPayment: ModeOfPayment
  checkNumber?: string
  payee: string
  payeeAddress?: string
  bankAccountRef?: string
  particulars: string
  amount: number
  accountLines: VoucherAccountLine[]
  status: VoucherStatus
  createdBy: string
  approvedBy?: string
  createdAt: string
  // Journal Voucher only — cash advance liquidation fields
  // The Check Voucher (id) that disbursed the cash advance this JV liquidates — the
  // Council's real forms cross-reference it (JV's "DV No." field, and "(CV #___)" on the
  // Summary of Expenses), which needs a real link back to that voucher, not free text.
  relatedVoucherId?: string
  cashAdvanceAmount?: number
  cashAdvanceDate?: string
  amountRefunded?: number
  refundOrNumber?: string
  refundDate?: string
  // Sum of the actual liquidated expense lines — distinct from `amount` (the JV's own
  // balanced debit/credit total, which equals cashAdvanceAmount whenever the advance is
  // fully accounted for in one JV) and from amountRefunded (unspent cash returned).
  totalAmountSpent?: number
}
