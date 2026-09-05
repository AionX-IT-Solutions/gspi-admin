import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import type { Account, Customer, Invoice, Vendor } from '../types/accounting.types'

interface AccountingState {
  customers: Customer[]
  vendors: Vendor[]
  invoices: Invoice[]
  accounts: Account[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  addCustomer: (customer: Customer) => void
  addVendor: (vendor: Vendor) => void
  updateVendor: (id: string, patch: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
}

export const useAccountingStore = create<AccountingState>()((set, get) => ({
  customers: [],
  vendors: [],
  invoices: [],
  accounts: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [customers, vendors, invoices, accounts] = await Promise.all([
        hydrateCollection<Customer>('customers'),
        hydrateCollection<Vendor>('vendors'),
        hydrateCollection<Invoice>('invoices'),
        hydrateCollection<Account>('accounts')
      ])
      set({ customers, vendors, invoices, accounts, hydrated: true })
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
  deleteInvoice: (id) => {
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }))
    deleteDocById('invoices', id)
  },
  addCustomer: (customer) => {
    set((s) => ({ customers: [customer, ...s.customers] }))
    persistDoc('customers', customer.id, customer)
  },
  addVendor: (vendor) => {
    set((s) => ({ vendors: [vendor, ...s.vendors] }))
    persistDoc('vendors', vendor.id, vendor)
  },
  updateVendor: (id, patch) => {
    set((s) => ({ vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) }))
    const vendor = get().vendors.find((v) => v.id === id)
    if (vendor) persistDoc('vendors', id, vendor)
  },
  deleteVendor: (id) => {
    set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }))
    deleteDocById('vendors', id)
  }
}))
