import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useTroopsStore } from '../store/troops.store'
import { getMembershipYearLabel, isMembershipCurrent } from '../lib/membershipYear'
import type { ScoutMember, Troop } from '../types/troop.types'

export function useTroopProfile(troop: Troop | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const deleteScoutMember = useTroopsStore((s) => s.deleteScoutMember)
  const updateScoutMember = useTroopsStore((s) => s.updateScoutMember)
  const renewScoutMember = useTroopsStore((s) => s.renewScoutMember)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<ScoutMember | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ScoutMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScoutMember | null>(null)

  const currentMembershipYear = useMemo(() => getMembershipYearLabel(startMonth), [startMonth])

  const roster = useMemo(
    () =>
      troop
        ? scoutMembers
            .filter((m) => m.troopId === troop.id)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
        : [],
    [scoutMembers, troop]
  )

  function isCurrent(member: ScoutMember) {
    return isMembershipCurrent(member.membershipYear, startMonth)
  }

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (member: ScoutMember) => {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleRenew(member: ScoutMember) {
    renewScoutMember(member.id, currentMembershipYear)
    toast.success(
      t('troops.roster.toast.renewed', { name: member.fullName, year: currentMembershipYear })
    )
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget) return
    updateScoutMember(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('troops.roster.toast.deactivated', { name: toggleTarget.fullName })
        : t('troops.roster.toast.reactivated', { name: toggleTarget.fullName })
    )
    setToggleTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteScoutMember(deleteTarget.id)
    toast.success(t('troops.roster.toast.deleted', { name: deleteTarget.fullName }))
    setDeleteTarget(null)
  }

  return {
    roster,
    currentMembershipYear,
    isCurrent,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleRenew
  }
}
