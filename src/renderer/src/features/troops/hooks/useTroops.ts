import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useTroopsStore } from '../store/troops.store'
import { getMembershipYearLabel, isMembershipCurrent } from '../lib/membershipYear'
import type { Troop } from '../types/troop.types'

export function useTroops() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:troops')
  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const updateTroop = useTroopsStore((s) => s.updateTroop)
  const deleteTroop = useTroopsStore((s) => s.deleteTroop)
  const addTroop = useTroopsStore((s) => s.addTroop)
  const addScoutMember = useTroopsStore((s) => s.addScoutMember)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Troop | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Troop | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Troop | null>(null)
  const [search, setSearch] = useState('')

  const currentMembershipYear = useMemo(() => getMembershipYearLabel(startMonth), [startMonth])

  const rosterStats = useMemo(() => {
    const stats = new Map<string, { total: number; needsRenewal: number }>()
    for (const member of scoutMembers) {
      if (!member.isActive) continue
      const entry = stats.get(member.troopId) ?? { total: 0, needsRenewal: 0 }
      entry.total += 1
      if (!isMembershipCurrent(member.membershipYear, startMonth)) entry.needsRenewal += 1
      stats.set(member.troopId, entry)
    }
    return stats
  }, [scoutMembers, startMonth])

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (troop: Troop) => {
    setEditTarget(troop)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateTroop(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('troops.toast.deactivated', { troopNumber: toggleTarget.troopNumber })
        : t('troops.toast.reactivated', { troopNumber: toggleTarget.troopNumber })
    )
    setToggleTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const deleted = deleteTarget
    const orphanedMembers = scoutMembers.filter((m) => m.troopId === deleted.id)
    deleteTroop(deleted.id)
    toast.success(t('troops.toast.deleted', { troopNumber: deleted.troopNumber }), {
      duration: 6000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          addTroop(deleted)
          orphanedMembers.forEach(addScoutMember)
        }
      }
    })
    setDeleteTarget(null)
  }

  const filteredTroops = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return troops
    return troops.filter(
      (tr) =>
        tr.troopNumber.toLowerCase().includes(q) ||
        tr.leaderName.toLowerCase().includes(q) ||
        (tr.troopName ?? '').toLowerCase().includes(q)
    )
  }, [troops, search])

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredTroops,
    rosterStats,
    currentMembershipYear,
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
    handleConfirmDelete
  }
}
