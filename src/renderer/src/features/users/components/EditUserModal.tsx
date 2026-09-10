import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { RoleId } from '@/app/lib/permissions'
import type { StaffUser } from '../store/users.store'
import { useEditUserModal } from '../hooks/useEditUserModal'
import { useUserRoleOptions } from '../hooks/useUserRoleOptions'

interface EditUserModalProps {
  target: StaffUser | null
  onClose: () => void
}

export function EditUserModal({ target, onClose }: EditUserModalProps) {
  const { t } = useTranslation()
  const { form, setForm, saving, handleSave } = useEditUserModal(target, onClose)
  const roleOptions = useUserRoleOptions(target?.uid)

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={
        target
          ? t('users.editModal.titleWithName', { fullName: target.fullName })
          : t('users.editModal.titleDefault')
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            {t('common.save')}
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
