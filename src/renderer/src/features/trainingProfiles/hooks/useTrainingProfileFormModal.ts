import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTrainingProfilesStore } from '../store/trainingProfiles.store'
import type {
  AgeLevelSpecialization,
  CompletedCertificate,
  CompletedTraining,
  CouncilRole,
  EducationLevel,
  TrainingProfile
} from '../types/trainingProfiles.types'

export type TrainingProfileFormState = ReturnType<typeof emptyForm>

function emptyForm() {
  return {
    name: '',
    birthday: '',
    school: '',
    district: '',
    level: 'elementary' as EducationLevel,
    contactNumber: '',
    email: '',
    homeAddress: '',
    roles: [] as CouncilRole[],
    completedTrainings: [] as CompletedTraining[],
    otherCompletedTraining: '',
    ageLevelSpecialization: '' as AgeLevelSpecialization | '',
    completedCertificates: [] as CompletedCertificate[],
    firstRegistrationDate: '',
    totalYearsInScouting: ''
  }
}

function formFromProfile(profile: TrainingProfile) {
  return {
    name: profile.name,
    birthday: profile.birthday,
    school: profile.school,
    district: profile.district,
    level: profile.level,
    contactNumber: profile.contactNumber,
    email: profile.email,
    homeAddress: profile.homeAddress,
    roles: profile.roles,
    completedTrainings: profile.completedTrainings,
    otherCompletedTraining: profile.otherCompletedTraining ?? '',
    ageLevelSpecialization: profile.ageLevelSpecialization ?? ('' as const),
    completedCertificates: profile.completedCertificates,
    firstRegistrationDate: profile.firstRegistrationDate ?? '',
    totalYearsInScouting: profile.totalYearsInScouting ?? ''
  }
}

export function useTrainingProfileFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: TrainingProfile | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trainingProfiles')
  const addProfile = useTrainingProfilesStore((s) => s.addProfile)
  const updateProfile = useTrainingProfilesStore((s) => s.updateProfile)
  const [form, setForm] = useState(emptyForm())

  // Re-seeds every time the modal opens (not merely mounts) — `editTarget` can point
  // at a different record from one "Edit" click to the next without this component
  // ever unmounting, so a one-time `useState` initializer alone would go stale.
  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromProfile(editTarget) : emptyForm())
  }, [open, editTarget])

  function toggleRole(role: CouncilRole) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role]
    }))
  }

  function toggleTraining(training: CompletedTraining) {
    setForm((f) => ({
      ...f,
      completedTrainings: f.completedTrainings.includes(training)
        ? f.completedTrainings.filter((tr) => tr !== training)
        : [...f.completedTrainings, training]
    }))
  }

  function toggleCertificate(certificate: CompletedCertificate) {
    setForm((f) => ({
      ...f,
      completedCertificates: f.completedCertificates.includes(certificate)
        ? f.completedCertificates.filter((c) => c !== certificate)
        : [...f.completedCertificates, certificate]
    }))
  }

  function handleSubmit() {
    if (!hasPermission('manage:trainingProfiles')) return
    if (!form.name.trim() || !form.school.trim() || !form.district.trim()) {
      toast.error(t('trainingProfiles.toast.missingFields'))
      return
    }
    const payload = {
      name: form.name.trim(),
      birthday: form.birthday,
      school: form.school.trim(),
      district: form.district.trim(),
      level: form.level,
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim(),
      homeAddress: form.homeAddress.trim(),
      roles: form.roles,
      completedTrainings: form.completedTrainings,
      otherCompletedTraining: form.otherCompletedTraining.trim() || undefined,
      ageLevelSpecialization: form.ageLevelSpecialization || undefined,
      completedCertificates: form.completedCertificates,
      firstRegistrationDate: form.firstRegistrationDate.trim() || undefined,
      totalYearsInScouting: form.totalYearsInScouting.trim() || undefined
    }

    if (editTarget) {
      updateProfile(editTarget.id, payload)
      toast.success(t('trainingProfiles.toast.updated'))
    } else {
      addProfile(payload)
      toast.success(t('trainingProfiles.toast.created'))
    }
    onOpenChange(false)
  }

  return {
    form,
    setForm,
    canManage,
    toggleRole,
    toggleTraining,
    toggleCertificate,
    handleSubmit
  }
}
