import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '../store/troops.store'
import type { Troop } from '../types/troop.types'

function emptyForm() {
  return {
    troopNumber: '',
    troopName: '',
    level: '',
    leaderName: '',
    assistantLeaderName: '',
    school: '',
    barangay: '',
    meetingPlace: ''
  }
}

function formFromTroop(troop: Troop) {
  return {
    troopNumber: troop.troopNumber,
    troopName: troop.troopName ?? '',
    level: troop.level,
    leaderName: troop.leaderName,
    assistantLeaderName: troop.assistantLeaderName ?? '',
    school: troop.school ?? '',
    barangay: troop.barangay ?? '',
    meetingPlace: troop.meetingPlace ?? ''
  }
}

export function useTroopFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget: Troop | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const addTroop = useTroopsStore((s) => s.addTroop)
  const updateTroop = useTroopsStore((s) => s.updateTroop)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(editTarget ? formFromTroop(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!hasPermission('manage:troops')) return
    if (!form.troopNumber.trim() || !form.leaderName.trim() || !form.level.trim()) {
      toast.error(t('troops.toast.validationRequired'))
      return
    }
    const payload = {
      troopNumber: form.troopNumber.trim(),
      troopName: form.troopName.trim() || undefined,
      level: form.level.trim(),
      leaderName: form.leaderName.trim(),
      assistantLeaderName: form.assistantLeaderName.trim() || undefined,
      school: form.school.trim() || undefined,
      barangay: form.barangay.trim() || undefined,
      meetingPlace: form.meetingPlace.trim() || undefined
    }
    if (editTarget) {
      updateTroop(editTarget.id, payload)
      toast.success(t('troops.toast.updated'))
    } else {
      addTroop({ id: crypto.randomUUID(), ...payload, isActive: true })
      toast.success(t('troops.toast.created', { troopNumber: payload.troopNumber }))
    }
    onOpenChange(false)
  }

  return { form, setForm, handleSubmit }
}
