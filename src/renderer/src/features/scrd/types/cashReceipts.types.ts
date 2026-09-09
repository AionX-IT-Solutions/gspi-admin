// Recognized/suggested receipt categories — the Account Title suggestions offered on a
// credit-direction Journal Voucher (see NewVoucherModal), and the keys
// CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE (budgetAutoActuals.ts) matches against. A receipt can
// still be entered under any free-text category (same as an expense voucher's GL account) —
// one outside this list just falls into SCRD's general "Other Operations" bucket instead of a
// named section, and won't feed a specific Budget income line's auto-actuals.
export type CashReceiptCategory =
  | 'Council Support Fund'
  | 'Troop Fees'
  | 'Barangay Committee'
  | 'Associate'
  | 'Career Woman'
  | 'Honorary Member'
  | 'Thinking Day Fund'
  | 'Training Fees'
  | 'Camping Fees'
  | 'Interest Income'
  | 'Other Operations'

// A receipt row, sourced from a posted Journal Voucher's credit line (see
// receiptVouchers.ts) — GSPI records incoming cash the same way it records outgoing cash
// (Vouchers), rather than through a separate, disconnected entry screen.
export interface CashReceipt {
  id: string
  date: string
  payor: string
  particulars: string
  referenceNumber?: string
  category: string
  bankAccount: string
  amount: number
}
