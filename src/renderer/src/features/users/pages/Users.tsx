import { motion } from 'framer-motion'
import { Pencil, Plus, UserCog2, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { resolveRoleLabel } from '@/app/lib/permissions'
import { AddUserModal } from '../components/AddUserModal'
import { EditUserModal } from '../components/EditUserModal'
import { RolePermissionsSection } from '../components/RolePermissionsSection'
import { useUsers, type UserRow } from '../hooks/useUsers'
import { useUsersStore } from '../store/users.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Users() {
  const { t } = useTranslation()
  const {
    loading,
    users,
    showDialog,
    setShowDialog,
    editTarget,
    setEditTarget,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive
  } = useUsers()
  const refetch = useUsersStore((s) => s.refetch)
  const customRoles = usePermissionsStore((s) => s.customRoles)

  const columns: Column<UserRow>[] = [
    { key: 'fullName', header: t('users.table.fullName') },
    {
      key: 'role',
      header: t('users.table.role'),
      render: (r) => <Badge variant="primary">{resolveRoleLabel(r.role, t, customRoles)}</Badge>
    },
    {
      key: 'isActive',
      header: t('users.table.status'),
      render: (r) => (
        <Badge variant={r.isActive ? 'success' : 'default'}>
          {r.isActive ? t('common.active') : t('users.statusDisabled')}
        </Badge>
      )
    },
    {
      key: 'id',
      header: t('users.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditTarget(r)}
            title={t('common.edit')}
          >
            <Pencil size={13} />
          </Button>
          {r.role !== 'super_admin' && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<UserX size={12} />}
              onClick={() => setToggleTarget(r)}
            >
              {r.isActive ? t('users.disable') : t('users.enable')}
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <motion.div
      key="users"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('users.title')}
        icon={<UserCog2 size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={refetch} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setShowDialog(true)}
            >
              {t('users.addButton')}
            </Button>
          </>
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage={t('users.emptyState')}
        />
      </Card>

      <RolePermissionsSection />

      <AddUserModal open={showDialog} onOpenChange={setShowDialog} />
      <EditUserModal target={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive ? t('users.confirmDisable.title') : t('users.confirmEnable.title')
        }
        message={
          toggleTarget?.isActive
            ? t('users.confirmDisable.message', { fullName: toggleTarget?.fullName ?? '' })
            : t('users.confirmEnable.message', { fullName: toggleTarget?.fullName ?? '' })
        }
        confirmLabel={toggleTarget?.isActive ? t('users.disable') : t('users.enable')}
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />
    </motion.div>
  )
}
