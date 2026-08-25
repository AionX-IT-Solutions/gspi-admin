import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { usePOSStore } from '../store/pos.store'
import { useToast } from '@/app/hooks/useToast'
import { openLoyaltyCardPrintWindow } from '../lib/barcode'
import type { Member } from '../types/pos.types'

function emptyForm() {
  return { code: '', name: '', email: '', discountRate: 5 }
}

export function useMembers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const members = usePOSStore((s) => s.members)
  const addMember = usePOSStore((s) => s.addMember)
  const updateMember = usePOSStore((s) => s.updateMember)
  const deleteMember = usePOSStore((s) => s.deleteMember)

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [printTarget, setPrintTarget] = useState<Member | null>(null)
  const [printQty, setPrintQty] = useState(1)

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(member: Member) {
    setEditTarget(member)
    setForm({
      code: member.code,
      name: member.name,
      email: member.email ?? '',
      discountRate: member.discountRate * 100
    })
    setShowForm(true)
  }

  function handlePrintCard() {
    if (!printTarget) return
    const cards = Array.from({ length: printQty }, () => ({
      code: printTarget.code,
      name: printTarget.name,
      discountLabel: t('members.card.discountLabel', {
        rate: (printTarget.discountRate * 100).toFixed(0)
      })
    }))
    openLoyaltyCardPrintWindow(cards)
    setPrintTarget(null)
  }

  function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error(t('members.toast.codeNameRequired'))
      return
    }
    const patch = {
      code: form.code.trim(),
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      discountRate: form.discountRate / 100
    }
    if (editTarget) {
      updateMember(editTarget.id, patch)
      toast.success(t('members.toast.memberUpdated', { name: form.name }))
    } else {
      addMember({ id: crypto.randomUUID(), ...patch })
      toast.success(t('members.toast.memberAdded', { name: form.name }))
    }
    setShowForm(false)
    setEditTarget(null)
    setForm(emptyForm())
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteMember(deleteTarget.id)
    toast.success(t('members.toast.memberDeleted', { name: deleteTarget.name }))
    setDeleteTarget(null)
  }

  return {
    loading,
    members,
    showForm,
    setShowForm,
    editTarget,
    openAdd,
    openEdit,
    form,
    setForm,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    printTarget,
    setPrintTarget,
    printQty,
    setPrintQty,
    handlePrintCard
  }
}
