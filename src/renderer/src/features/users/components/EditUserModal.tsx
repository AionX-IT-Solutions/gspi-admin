import { Copy } from 'lucide-react'
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
  const { form, setForm, generatedCommand, roleChanged, saving, handleSave, handleCopy } =
    useEditUserModal(target, onClose)
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
        generatedCommand ? (
          <Button variant="primary" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {roleChanged ? t('users.editModal.generateButton') : t('common.save')}
            </Button>
          </>
        )
      }
    >
      {generatedCommand ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('users.addModal.commandHelp')}
          </p>
          <pre
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11.5,
              color: 'var(--text-primary)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {generatedCommand}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy size={13} />}
            onClick={handleCopy}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('users.addModal.copyButton')}
          </Button>
        </div>
      ) : (
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
          {roleChanged && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {t('users.editModal.roleChangeHint')}
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
