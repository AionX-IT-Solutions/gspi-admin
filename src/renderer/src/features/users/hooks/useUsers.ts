import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsersStore, type StaffUser } from '../store/users.store'
import { setStaffUserActive } from '../lib/staffUserFunctions'
import { useToast } from '@/app/hooks/useToast'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'

export type UserRow = StaffUser

export function useUsers() {
  const { t } = useTranslation()
  const toast = useToast()
  const users = useUsersStore((s) => s.users)
  const loading = useUsersStore((s) => s.loading)
  const subscribe = useUsersStore((s) => s.subscribe)

  useEffect(() => {
    const unsubscribe = subscribe()
    return () => unsubscribe()
  }, [subscribe])

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [toggleTarget, setToggleTarget] = useState<UserRow | null>(null)
  const [toggling, setToggling] = useState(false)

  async function handleConfirmToggleActive() {
    if (!toggleTarget) return
    setToggling(true)
    try {
      await setStaffUserActive(toggleTarget.uid, !toggleTarget.isActive)
      appendAuditLog({
        action: 'user_updated',
        actorName: useAppStore.getState().currentUser?.fullName ?? 'System',
        entityType: 'user',
        summary: `User account "${toggleTarget.fullName}" ${toggleTarget.isActive ? 'disabled' : 'reactivated'}.`
      })
      toast.success(
        toggleTarget.isActive
          ? t('users.toast.userDisabled', { fullName: toggleTarget.fullName })
          : t('users.toast.userEnabled', { fullName: toggleTarget.fullName })
      )
    } catch {
      toast.error(t('users.toast.toggleActiveFailed'))
    } finally {
      setToggling(false)
      setToggleTarget(null)
    }
  }

  return {
    loading,
    users,
    showDialog,
    setShowDialog,
    editTarget,
    setEditTarget,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive,
    toggling
  }
}
