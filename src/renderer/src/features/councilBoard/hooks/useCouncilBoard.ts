import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import type { CouncilBoardMember } from '../types/councilBoard.types'

export function useCouncilBoard() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:councilBoard')
  const members = useCouncilBoardStore((s) => s.members)
  const deleteMember = useCouncilBoardStore((s) => s.deleteMember)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<CouncilBoardMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CouncilBoardMember | null>(null)
  const [search, setSearch] = useState('')

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) => m.fullName.toLowerCase().includes(q) || m.position.toLowerCase().includes(q)
    )
  }, [members, search])

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(member: CouncilBoardMember) {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteMember(deleteTarget.id)
    toast.success(t('councilBoard.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    members: filteredMembers,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}
