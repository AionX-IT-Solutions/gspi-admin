export type VoucherType = 'check_voucher' | 'journal_voucher'
export type VoucherStatus = 'pending' | 'approved' | 'posted' | 'cancelled'
export type ModeOfPayment = 'cash' | 'check'

export interface VoucherAccountLine {
  account: string
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
  relatedVoucherNumber?: string
  cashAdvanceAmount?: number
  amountRefunded?: number
}
