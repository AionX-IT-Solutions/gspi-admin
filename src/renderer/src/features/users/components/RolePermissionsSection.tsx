import { useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import {
  ALL_PERMISSIONS,
  MODULE_LABELS,
  PERMISSION_MODULES,
  permissionsForModule,
  type Permission
} from '@/app/lib/permissions'
import { useRolePermissionsSection, type RoleRow } from '../hooks/useRolePermissionsSection'

type TFn = ReturnType<typeof useTranslation>['t']

function permissionLabel(t: TFn, permission: Permission) {
  const [action, moduleKey] = permission.split(':')
  return `${action === 'view' ? t('common.view') : t('users.permissionsModal.manage')} ${MODULE_LABELS[moduleKey] ?? moduleKey}`
}

export function RolePermissionsSection() {
  const { t } = useTranslation()
  const {
    rolePermissions,
    togglePermission,
    permTarget,
    setPermTarget,
    canManageRoles,
    roleRows,
    addRoleOpen,
    setAddRoleOpen,
    handleAddRole,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteRole
  } = useRolePermissionsSection()
  const [newRoleName, setNewRoleName] = useState('')

  const permTargetRow = roleRows.find((r) => r.value === permTarget) ?? null

  function openAddRole() {
    setNewRoleName('')
    setAddRoleOpen(true)
  }

  function submitAddRole() {
    handleAddRole(newRoleName)
  }

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('users.rolePermissions.title')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('users.rolePermissions.subtitle')}
              </p>
            </div>
          </div>
          {canManageRoles && (
            <Button size="sm" variant="primary" leftIcon={<Plus size={13} />} onClick={openAddRole}>
              {t('users.rolePermissions.addRole.button')}
            </Button>
          )}
        </div>
        <Card padding="0px">
          <div>
            {roleRows.map((row, i) => {
              const granted = rolePermissions[row.value]?.length ?? 0
              return (
                <div
                  key={row.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom:
                      i < roleRows.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {row.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t('users.rolePermissions.permissionsGranted', {
                        granted,
                        total: ALL_PERMISSIONS.length
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Button size="sm" variant="secondary" onClick={() => setPermTarget(row.value)}>
                      {t('users.rolePermissions.editButton')}
                    </Button>
                    {canManageRoles && row.isCustom && (
                      <RoleDeleteButton row={row} onDelete={() => setDeleteTarget(row)} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Modal
        open={!!permTarget}
        onOpenChange={(open) => !open && setPermTarget(null)}
        title={
          permTargetRow
            ? t('users.permissionsModal.titleWithRole', { role: permTargetRow.label })
            : t('users.permissionsModal.titleDefault')
        }
        size="lg"
        footer={
          <Button variant="primary" size="sm" onClick={() => setPermTarget(null)}>
            {t('users.permissionsModal.doneButton')}
          </Button>
        }
      >
        {permTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PERMISSION_MODULES.map((moduleKey) => {
              const perms = permissionsForModule(moduleKey)
              const granted = rolePermissions[permTarget] ?? []
              return (
                <div key={moduleKey}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      marginBottom: 8
                    }}
                  >
                    {MODULE_LABELS[moduleKey]}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {perms.map((perm) => (
                      <label
                        key={perm}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={granted.includes(perm)}
                          onChange={() => togglePermission(permTarget, perm)}
                          style={{ accentColor: 'var(--accent-primary)', width: 14, height: 14 }}
                        />
                        {permissionLabel(t, perm)}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={addRoleOpen}
        onOpenChange={setAddRoleOpen}
        title={t('users.rolePermissions.addRole.title')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddRoleOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={submitAddRole}>
              {t('users.rolePermissions.addRole.submitButton')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormField label={t('users.rolePermissions.addRole.nameLabel')} required>
            <FieldInput
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder={t('users.rolePermissions.addRole.namePlaceholder')}
              autoFocus
            />
          </FormField>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {t('users.rolePermissions.addRole.note')}
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('users.rolePermissions.deleteRole.confirmTitle')}
        message={t('users.rolePermissions.deleteRole.confirmMessage', {
          role: deleteTarget?.label ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteRole}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

function RoleDeleteButton({ row, onDelete }: { row: RoleRow; onDelete: () => void }) {
  const { t } = useTranslation()

  if (row.assignedCount > 0) {
    return (
      <Tooltip content={t('users.rolePermissions.deleteRole.inUse', { count: row.assignedCount })}>
        <span>
          <Button size="sm" variant="ghost" disabled>
            <Trash2 size={13} />
          </Button>
        </span>
      </Tooltip>
    )
  }

  return (
    <Button size="sm" variant="ghost" onClick={onDelete} title={t('common.delete')}>
      <Trash2 size={13} />
    </Button>
  )
}
