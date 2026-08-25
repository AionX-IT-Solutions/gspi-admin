import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { useHRStore } from '../store/hr.store'
import { useUsersStore } from '@/features/users/store/users.store'
import type { Employee } from '../types/hr.types'
import { useEmployeeFormModal } from '../hooks/useEmployeeFormModal'

interface EmployeeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Employee | null
}

export function EmployeeFormModal({ open, onOpenChange, editTarget }: EmployeeFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useEmployeeFormModal(open, onOpenChange, editTarget)
  const employees = useHRStore((s) => s.employees)
  const users = useUsersStore((s) => s.users)
  const subscribeUsers = useUsersStore((s) => s.subscribe)

  // Users.tsx is the only other place this store is subscribed — the picker
  // below needs it too, and won't have it if the admin never visited the
  // Users page this session. Permission-denied (roles below admin/super_admin
  // can't read the `users` collection — see firestore.rules) fails quietly,
  // same as every other hydrate in this app; the picker just shows no options.
  useEffect(() => {
    if (!open) return
    const unsubscribe = subscribeUsers()
    return () => unsubscribe()
  }, [open, subscribeUsers])

  const managerOptions = useMemo(
    () => [
      { value: '', label: t('employees.form.noManager') },
      ...employees
        .filter((e) => e.isActive && e.id !== editTarget?.id)
        .map((e) => ({ value: e.id, label: `${e.fullName} — ${e.position}` }))
    ],
    [employees, editTarget, t]
  )

  // Each user account should link to at most one employee — exclude users
  // already linked elsewhere, but keep this employee's own current link
  // selectable (it wouldn't otherwise appear once linked).
  const userOptions = useMemo(() => {
    const linkedElsewhere = new Set(
      employees.filter((e) => e.userId && e.id !== editTarget?.id).map((e) => e.userId)
    )
    return [
      { value: '', label: t('employees.form.noLinkedUser') },
      ...users
        .filter((u) => !linkedElsewhere.has(u.uid))
        .map((u) => ({ value: u.uid, label: `${u.fullName} (${u.email})` }))
    ]
  }, [users, employees, editTarget, t])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('employees.modal.editTitle') : t('employees.modal.addTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('employees.modal.saveChanges') : t('employees.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('employees.form.employeeNumber')} required>
          <FieldInput
            value={form.employeeNumber}
            onChange={(e) => setForm((f) => ({ ...f, employeeNumber: e.target.value }))}
            placeholder="EMP-009"
          />
        </FormField>
        <FormField label={t('employees.form.hireDate')} required>
          <FieldInput
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
          />
        </FormField>
        <FormField label={t('employees.form.fullName')} required className="col-span-2">
          <FieldInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Juan Dela Cruz"
          />
        </FormField>
        <FormField label={t('employees.form.position')} required>
          <FieldInput
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            placeholder="Cashier"
          />
        </FormField>
        <FormField label={t('employees.form.department')}>
          <FieldInput
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="Sales & POS"
          />
        </FormField>
        <FormField label={t('employees.form.branch')}>
          <FieldInput
            value={form.branch}
            onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
            placeholder="Main Office"
          />
        </FormField>
        <FormField label={t('employees.form.reportsTo')}>
          <FieldSelect
            options={managerOptions}
            value={form.managerId}
            onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))}
          />
        </FormField>
        <FormField label={t('employees.form.salary')}>
          <FieldInput
            type="number"
            min={0}
            value={form.salary}
            onChange={(e) => setForm((f) => ({ ...f, salary: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('employees.form.email')}>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField label={t('employees.form.phone')}>
          <FieldInput
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </FormField>
        <FormField label={t('employees.form.linkedUser')} className="col-span-2">
          <FieldSelect
            options={userOptions}
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          />
        </FormField>
      </div>

      <div
        style={{
          marginTop: 18,
          marginBottom: 4,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}
      >
        {t('employees.form.payrollDefaultsHeading')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <FormField label={t('employees.form.defaultCola')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultCola}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultCola: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('employees.form.defaultRepresentation')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultRepresentation}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultRepresentation: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('employees.form.defaultSss')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultSss}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultSss: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('employees.form.defaultPhilhealth')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultPhilhealth}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultPhilhealth: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('employees.form.defaultPagibig')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultPagibig}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultPagibig: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('employees.form.defaultWithholdingTax')}>
          <FieldInput
            type="number"
            min={0}
            value={form.defaultWithholdingTax}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultWithholdingTax: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
      </div>
    </Modal>
  )
}
