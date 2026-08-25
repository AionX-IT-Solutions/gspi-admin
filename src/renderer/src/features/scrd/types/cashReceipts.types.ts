export type CashReceiptCategory =
  | 'Council Support Fund'
  | 'Troop Fees'
  | 'Barangay Committee'
  | 'Associate'
  | 'Career Woman'
  | 'Honorary Member'
  | 'Thinking Day Fund'
  | 'Interest Income'
  | 'Other Operations'

export interface CashReceipt {
  id: string
  date: string
  payor: string
  particulars: string
  referenceNumber?: string
  category: CashReceiptCategory
  bankAccount: string
  amount: number
}
