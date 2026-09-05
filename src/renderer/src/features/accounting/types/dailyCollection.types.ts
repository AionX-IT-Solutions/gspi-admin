/** One receipt line the staff entered by hand — for collections that don't come from an
 *  automated source (POS sale, rental, troop registration), e.g. Badge/Certificate Fee,
 *  Council Service Fund, or ICCG dues collected in person. Mirrors the Council's real
 *  "Daily Cash Collection Report" columns exactly. */
export interface ManualReceiptLine {
  id: string
  siNo: string
  receivedFrom: string
  nes: number
  bcFee: number
  csf: number
  iccg: number
  memReg: number
  rentals: number
}

export interface CashDepositLine {
  id: string
  bankId: string
  /** Denormalized so the deposit line still reads correctly if the bank is later renamed. */
  bankName: string
  saNo: string
  purpose: string
  amount: number
}

export interface DailyCollectionAttachment {
  id: string
  name: string
  url: string
  /** Storage path, kept so the file can be deleted alongside its metadata entry. */
  storagePath: string
  uploadedAt: string
  uploadedBy: string
}

/** One per calendar date — matches the paper form's "one report per day" convention.
 *  The receipts table shown to the user is this doc's `manualReceipts` merged with
 *  auto-generated rows computed live from that date's POS sales, rental bookings, and
 *  troop membership registrations (see useDailyCollectionsTab) — only the manual rows,
 *  beginning balance, deposits, and attachments are actually persisted here. */
export interface DailyCollectionReport {
  id: string
  date: string
  beginningBalance: number
  manualReceipts: ManualReceiptLine[]
  deposits: CashDepositLine[]
  preparedBy: string
  attachments: DailyCollectionAttachment[]
  createdAt: string
  updatedAt: string
}
