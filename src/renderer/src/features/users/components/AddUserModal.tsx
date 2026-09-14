import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { RoleId } from '@/app/lib/permissions'
import { useAddUserModal } from '../hooks/useAddUserModal'
import { useUserRoleOptions } from '../hooks/useUserRoleOptions'

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const { t } = useTranslation()
  const { form, setForm, creating, handleSubmit, resetForm, close } = useAddUserModal(onOpenChange)
  const roleOptions = useUserRoleOptions()

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) resetForm()
      }}
      title={t('users.addModal.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" loading={creating} onClick={handleSubmit}>
            {t('users.addModal.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('users.addModal.fullNameLabel')} required>
          <FieldInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('users.addModal.emailLabel')} required>
          <FieldInput
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField label={t('users.addModal.passwordLabel')} required>
          <FieldInput
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <FormField label={t('users.addModal.roleLabel')} required>
          <FieldSelect
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleId }))}
            options={roleOptions}
          />
        </FormField>
      </div>
    </Modal>
  )
}
