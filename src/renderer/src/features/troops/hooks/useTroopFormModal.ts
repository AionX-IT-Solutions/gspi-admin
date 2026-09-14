import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTrainingProfilesStore } from '@/features/trainingProfiles/store/trainingProfiles.store'
import type { TrainingProfile } from '@/features/trainingProfiles/types/trainingProfiles.types'
import { useTroopsStore } from '../store/troops.store'
import type { Troop } from '../types/troop.types'

function emptyForm() {
  return {
    troopNumber: '',
    troopName: '',
    level: '',
    leaderName: '',
    leaderProfileId: '',
    assistantLeaderName: '',
    assistantLeaderProfileId: '',
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
    leaderProfileId: troop.leaderProfileId ?? '',
    assistantLeaderName: troop.assistantLeaderName ?? '',
    assistantLeaderProfileId: troop.assistantLeaderProfileId ?? '',
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
  const profiles = useTrainingProfilesStore((s) => s.profiles)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(editTarget ? formFromTroop(editTarget) : emptyForm())
  }, [open, editTarget])

  // Only people the registry actually lists as a Troop Leader — the same role checkbox
  // on their Training Profile.
  const leaderCandidates = profiles.filter((p) => p.roles.includes('troop_leader'))

  function selectLeader(profile: TrainingProfile) {
    setForm((f) => ({ ...f, leaderName: profile.name, leaderProfileId: profile.id }))
  }
  function clearLeaderProfile() {
    setForm((f) => ({ ...f, leaderProfileId: '' }))
  }
  function setLeaderName(name: string) {
    setForm((f) => ({ ...f, leaderName: name, leaderProfileId: '' }))
  }

  function selectAssistantLeader(profile: TrainingProfile) {
    setForm((f) => ({
      ...f,
      assistantLeaderName: profile.name,
      assistantLeaderProfileId: profile.id
    }))
  }
  function clearAssistantLeaderProfile() {
    setForm((f) => ({ ...f, assistantLeaderProfileId: '' }))
  }
  function setAssistantLeaderName(name: string) {
    setForm((f) => ({ ...f, assistantLeaderName: name, assistantLeaderProfileId: '' }))
  }

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
      leaderProfileId: form.leaderProfileId || undefined,
      assistantLeaderName: form.assistantLeaderName.trim() || undefined,
      assistantLeaderProfileId: form.assistantLeaderProfileId || undefined,
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

  return {
    form,
    setForm,
    leaderCandidates,
    selectLeader,
    clearLeaderProfile,
    setLeaderName,
    selectAssistantLeader,
    clearAssistantLeaderProfile,
    setAssistantLeaderName,
    handleSubmit
  }
}
