export interface Bank {
  id: string
  name: string
  accountNumber?: string
  /** Historical anchor balance — everything recorded in cashReceipts/vouchers
   *  since this was set is summed against it to get the live balance. Only
   *  meant to be edited to correct a mistake or onboard a new account, not
   *  rolled forward periodically. */
  openingBalance: number
  /** Live balance (openingBalance + all receipts − all disbursements),
   *  recomputed and persisted here by useScrdComputations whenever the
   *  underlying ledger changes — so Dashboard (and gspi-app's mobile
   *  dashboard, which has no SCRD ledger of its own) can read a single
   *  number instead of re-deriving the whole journal. */
  currentBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
