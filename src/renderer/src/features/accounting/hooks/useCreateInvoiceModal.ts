import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toInputDate } from '@/shared/lib/utils'
import { useAccountingStore } from '../store/accounting.store'
import { generateInvoiceNumber } from '../lib/invoiceNumber'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { Invoice, InvoiceLineItem } from '../types/accounting.types'

function newLine(): InvoiceLineItem {
  return { id: crypto.randomUUID(), description: '', qty: 1, rate: 0, amount: 0 }
}

export function useCreateInvoiceModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const customers = useAccountingStore((s) => s.customers)
  const invoiceList = useAccountingStore((s) => s.invoices)
  const addInvoice = useAccountingStore((s) => s.addInvoice)

  const [customerId, setCustomerId] = useState('')
  const [manualCustomerName, setManualCustomerName] = useState('')
  const [issueDate, setIssueDate] = useState(toInputDate(new Date().toISOString()))
  const [dueDate, setDueDate] = useState('')
  const [lines, setLines] = useState<InvoiceLineItem[]>([newLine()])

  function resetForm() {
    setCustomerId('')
    setManualCustomerName('')
    setIssueDate(toInputDate(new Date().toISOString()))
    setDueDate('')
    setLines([newLine()])
  }

  function addLine() {
    setLines((p) => [...p, newLine()])
  }

  function removeLine(id: string) {
    setLines((p) => (p.length > 1 ? p.filter((l) => l.id !== id) : p))
  }

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const next = { ...l, ...patch }
        next.amount = next.qty * next.rate
        return next
      })
    )
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + tax

  function handleSave(status: 'draft' | 'sent') {
    if (!hasPermission('manage:invoices')) return
    const customer = customers.find((c) => c.id === customerId)
    const customerName = customer ? (customer.company ?? customer.name) : manualCustomerName.trim()
    if (!customerName) {
      toast.error(t('invoices.toast.customerRequired'))
      return
    }
    if (!dueDate) {
      toast.error(t('invoices.toast.dueDateRequired'))
      return
    }
    const validLines = lines.filter((l) => l.description.trim() && l.amount > 0)
    if (validLines.length === 0) {
      toast.error(t('invoices.toast.lineItemRequired'))
      return
    }

    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      number: generateInvoiceNumber(invoiceList),
      customerId: customer?.id ?? '',
      customerName,
      issueDate,
      dueDate,
      status,
      lineItems: validLines,
      subtotal,
      tax,
      total,
      balanceDue: status === 'draft' ? 0 : total,
      memo: t('invoices.defaultMemo')
    }

    addInvoice(newInvoice)
    onOpenChange(false)
    resetForm()
    toast.success(
      status === 'sent'
        ? t('invoices.toast.sent', { number: newInvoice.number, customer: newInvoice.customerName })
        : t('invoices.toast.savedAsDraft', { number: newInvoice.number })
    )
  }

  return {
    customers,
    customerId,
    setCustomerId,
    manualCustomerName,
    setManualCustomerName,
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,
    lines,
    addLine,
    removeLine,
    updateLine,
    subtotal,
    tax,
    total,
    handleSave,
    resetForm
  }
}
