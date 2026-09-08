// Matches gspi-app's features/invoices/types/invoice.ts InvoiceStatus exactly —
// "overdue" is deliberately not a member here (see isInvoiceOverdue in
// components/invoiceStatus.ts): both apps compute it live from dueDate instead of
// storing it, so a status never goes stale just because a day passed.
export type InvoiceStatus = 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'void'

export interface InvoiceLineItem {
  id: string
  description: string
  qty: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  balanceDue: number
  memo?: string
}

export interface Customer {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  address: string
  balance: number
  totalBilled: number
  status: 'active' | 'inactive'
  avatarColor: string
}

export interface Vendor {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  category: string
  balance: number
  status: 'active' | 'inactive'
  avatarColor: string
}

export interface Account {
  id: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  balance: number
}
