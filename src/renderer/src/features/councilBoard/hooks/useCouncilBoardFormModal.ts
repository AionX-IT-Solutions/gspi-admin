import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import type { CouncilBoardMember } from '../types/councilBoard.types'

const avatarPalette = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6'
]

function emptyForm() {
  return {
    fullName: '',
    position: '',
    contactNumber: '',
    email: '',
    birthDate: '',
    reportsToId: ''
  }
}

function formFromMember(member: CouncilBoardMember) {
  return {
    fullName: member.fullName,
    position: member.position,
    contactNumber: member.contactNumber ?? '',
    email: member.email ?? '',
    birthDate: member.birthDate ?? '',
    reportsToId: member.reportsToId ?? ''
  }
}

export function useCouncilBoardFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: CouncilBoardMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const members = useCouncilBoardStore((s) => s.members)
  const addMember = useCouncilBoardStore((s) => s.addMember)
  const updateMember = useCouncilBoardStore((s) => s.updateMember)
  const [form, setForm] = useState(emptyForm())

  // Re-seeds every time the modal opens (not merely mounts) — `editTarget` can point to a
  // different member across separate opens of this same modal instance.
  useEffect(() => {
    if (open) setForm(editTarget ? formFromMember(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!hasPermission('manage:councilBoard')) return
    if (!form.fullName.trim() || !form.position.trim()) {
      toast.error(t('councilBoard.toast.missingFields'))
      return
    }
    const payload = {
      fullName: form.fullName.trim(),
      position: form.position.trim(),
      contactNumber: form.contactNumber.trim() || undefined,
      email: form.email.trim() || undefined,
      birthDate: form.birthDate || undefined,
      reportsToId: form.reportsToId || undefined
    }

    if (editTarget) {
      updateMember(editTarget.id, { ...payload, avatarColor: editTarget.avatarColor })
      toast.success(t('councilBoard.toast.updated'))
    } else {
      addMember({
        ...payload,
        avatarColor: avatarPalette[members.length % avatarPalette.length]
      })
      toast.success(t('councilBoard.toast.created', { name: form.fullName.trim() }))
    }
    onOpenChange(false)
  }

  return { form, setForm, handleSubmit }
}
