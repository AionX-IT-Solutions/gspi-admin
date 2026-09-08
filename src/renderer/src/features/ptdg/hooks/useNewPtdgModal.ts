import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePtdgStore } from '../store/ptdg.store'
import { generatePtdgNumber } from '../lib/ptdgNumber'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { PtdgApplication, PtdgLineItem } from '../types/ptdg.types'

function emptyLine(): PtdgLineItem {
  return { id: crypto.randomUUID(), particulars: '', amount: 0 }
}

function emptyForm() {
  return {
    purpose: '',
    eventDate: '',
    projectedSources: [] as PtdgLineItem[],
    projectedExpenses: [] as PtdgLineItem[]
  }
}

function formFromApplication(application: PtdgApplication) {
  return {
    purpose: application.purpose,
    eventDate: application.eventDate,
    projectedSources: application.projectedSources,
    projectedExpenses: application.projectedExpenses
  }
}

export function useNewPtdgModal(
  onOpenChange: (open: boolean) => void,
  editTarget?: PtdgApplication | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const applications = usePtdgStore((s) => s.applications)
  const addApplication = usePtdgStore((s) => s.addApplication)
  const updateApplication = usePtdgStore((s) => s.updateApplication)
  const [form, setForm] = useState(editTarget ? formFromApplication(editTarget) : emptyForm())

  function addSourceLine() {
    setForm((f) => ({ ...f, projectedSources: [...f.projectedSources, emptyLine()] }))
  }
  function removeSourceLine(id: string) {
    setForm((f) => ({ ...f, projectedSources: f.projectedSources.filter((l) => l.id !== id) }))
  }
  function updateSourceLine(id: string, patch: Partial<PtdgLineItem>) {
    setForm((f) => ({
      ...f,
      projectedSources: f.projectedSources.map((l) => (l.id === id ? { ...l, ...patch } : l))
    }))
  }

  function addExpenseLine() {
    setForm((f) => ({ ...f, projectedExpenses: [...f.projectedExpenses, emptyLine()] }))
  }
  function removeExpenseLine(id: string) {
    setForm((f) => ({ ...f, projectedExpenses: f.projectedExpenses.filter((l) => l.id !== id) }))
  }
  function updateExpenseLine(id: string, patch: Partial<PtdgLineItem>) {
    setForm((f) => ({
      ...f,
      projectedExpenses: f.projectedExpenses.map((l) => (l.id === id ? { ...l, ...patch } : l))
    }))
  }

  const sourcesSubtotal = form.projectedSources.reduce((sum, l) => sum + (l.amount || 0), 0)
  const expensesTotal = form.projectedExpenses.reduce((sum, l) => sum + (l.amount || 0), 0)
  const amountRequested = Math.max(0, expensesTotal - sourcesSubtotal)

  function handleSave(status: 'draft' | 'submitted') {
    if (!hasPermission('manage:ptdg')) return
    if (!form.purpose.trim() || !form.eventDate.trim()) {
      toast.error(t('ptdg.toast.missingFields'))
      return
    }
    const validExpenses = form.projectedExpenses.filter((l) => l.particulars.trim() && l.amount > 0)
    const validSources = form.projectedSources.filter((l) => l.particulars.trim() && l.amount > 0)

    const payload = {
      purpose: form.purpose.trim(),
      eventDate: form.eventDate.trim(),
      projectedSources: validSources,
      projectedExpenses: validExpenses,
      status
    }

    if (editTarget) {
      updateApplication(editTarget.id, payload)
      toast.success(t('ptdg.toast.updated'))
    } else {
      addApplication({ ...payload, applicationNumber: generatePtdgNumber(applications) })
      toast.success(t('ptdg.toast.created'))
    }
    onOpenChange(false)
    setForm(emptyForm())
  }

  function resetForm() {
    setForm(editTarget ? formFromApplication(editTarget) : emptyForm())
  }

  return {
    form,
    setForm,
    addSourceLine,
    removeSourceLine,
    updateSourceLine,
    addExpenseLine,
    removeExpenseLine,
    updateExpenseLine,
    sourcesSubtotal,
    expensesTotal,
    amountRequested,
    handleSave,
    resetForm
  }
}
