import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { Employee } from '../types/hr.types'

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
    employeeNumber: '',
    fullName: '',
    position: '',
    department: '',
    branch: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().slice(0, 10),
    salary: 0,
    managerId: '',
    userId: '',
    defaultCola: 0,
    defaultRepresentation: 0,
    defaultSss: 0,
    defaultPhilhealth: 0,
    defaultPagibig: 0,
    defaultWithholdingTax: 0
  }
}

function formFromEmployee(emp: Employee) {
  return {
    employeeNumber: emp.employeeNumber,
    fullName: emp.fullName,
    position: emp.position,
    department: emp.department,
    branch: emp.branch,
    email: emp.email,
    phone: emp.phone,
    hireDate: emp.hireDate,
    salary: emp.salary,
    managerId: emp.managerId ?? '',
    userId: emp.userId ?? '',
    defaultCola: emp.defaultCola ?? 0,
    defaultRepresentation: emp.defaultRepresentation ?? 0,
    defaultSss: emp.defaultSss ?? 0,
    defaultPhilhealth: emp.defaultPhilhealth ?? 0,
    defaultPagibig: emp.defaultPagibig ?? 0,
    defaultWithholdingTax: emp.defaultWithholdingTax ?? 0
  }
}

export function useEmployeeFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget: Employee | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const employees = useHRStore((s) => s.employees)
  const addEmployee = useHRStore((s) => s.addEmployee)
  const updateEmployee = useHRStore((s) => s.updateEmployee)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(editTarget ? formFromEmployee(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!hasPermission('manage:employees')) return
    if (!form.employeeNumber.trim() || !form.fullName.trim() || !form.position.trim()) {
      toast.error(t('employees.toast.validationRequired'))
      return
    }
    const { managerId, userId, ...rest } = form
    const payload = { ...rest, managerId: managerId || undefined, userId: userId || undefined }
    if (editTarget) {
      updateEmployee(editTarget.id, payload)
      toast.success(t('employees.toast.updated'))
    } else {
      addEmployee({
        id: crypto.randomUUID(),
        ...payload,
        isActive: true,
        avatarColor: avatarPalette[employees.length % avatarPalette.length]
      })
      toast.success(t('employees.toast.created', { name: form.fullName }))
    }
    onOpenChange(false)
  }

  return { form, setForm, handleSubmit }
}
