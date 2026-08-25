import { Copy } from 'lucide-react'
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
  const { form, setForm, generatedCommand, handleGenerate, handleCopy, resetForm, close } =
    useAddUserModal(onOpenChange)
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
        generatedCommand ? (
          <Button variant="primary" size="sm" onClick={close}>
            {t('common.close')}
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerate}>
              {t('users.addModal.generateButton')}
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
      )}
    </Modal>
  )
}
