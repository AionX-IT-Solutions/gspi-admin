import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { Employee } from '../types/hr.types'

export function useEmployees() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:employees')
  const employees = useHRStore((s) => s.employees)
  const updateEmployee = useHRStore((s) => s.updateEmployee)
  const deleteEmployee = useHRStore((s) => s.deleteEmployee)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [search, setSearch] = useState('')

  // (Profile is now a separate page)

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (emp: Employee) => {
    setEditTarget(emp)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateEmployee(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('employees.toast.deactivated', { name: toggleTarget.fullName })
        : t('employees.toast.reactivated', { name: toggleTarget.fullName })
    )
    setToggleTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    deleteEmployee(deleteTarget.id)
    toast.success(t('employees.toast.deleted', { name: deleteTarget.fullName }))
    setDeleteTarget(null)
  }

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeNumber.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    )
  }, [employees, search])

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredEmployees,
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
