import { create } from 'zustand'
import { persistDoc, hydrateCollection, reportHydrateFailure } from '@/shared/lib/firestoreSync'
import type { Account, Customer, Expense, Invoice, Item, Vendor } from '../types/accounting.types'

interface AccountingState {
  customers: Customer[]
  vendors: Vendor[]
  invoices: Invoice[]
  expenses: Expense[]
  items: Item[]
  accounts: Account[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  addExpense: (expense: Expense) => void
  addCustomer: (customer: Customer) => void
  addVendor: (vendor: Vendor) => void
  addItem: (item: Item) => void
}

export const useAccountingStore = create<AccountingState>()((set, get) => ({
  customers: [],
  vendors: [],
  invoices: [],
  expenses: [],
  items: [],
  accounts: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [customers, vendors, invoices, expenses, items, accounts] = await Promise.all([
        hydrateCollection<Customer>('customers'),
        hydrateCollection<Vendor>('vendors'),
        hydrateCollection<Invoice>('invoices'),
        hydrateCollection<Expense>('expenses'),
        hydrateCollection<Item>('items'),
        hydrateCollection<Account>('accounts')
      ])
      set({ customers, vendors, invoices, expenses, items, accounts, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[accounting.store] Failed to hydrate', err)
    }
  },

  addInvoice: (invoice) => {
    set((s) => ({ invoices: [invoice, ...s.invoices] }))
    persistDoc('invoices', invoice.id, invoice)
  },
  updateInvoice: (id, patch) => {
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
    const invoice = get().invoices.find((i) => i.id === id)
    if (invoice) persistDoc('invoices', id, invoice)
  },
  addExpense: (expense) => {
    set((s) => ({ expenses: [expense, ...s.expenses] }))
    persistDoc('expenses', expense.id, expense)
  },
  addCustomer: (customer) => {
    set((s) => ({ customers: [customer, ...s.customers] }))
    persistDoc('customers', customer.id, customer)
  },
  addVendor: (vendor) => {
    set((s) => ({ vendors: [vendor, ...s.vendors] }))
    persistDoc('vendors', vendor.id, vendor)
  },
  addItem: (item) => {
    set((s) => ({ items: [item, ...s.items] }))
    persistDoc('items', item.id, item)
  }
}))
