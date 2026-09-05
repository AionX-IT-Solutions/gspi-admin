import { motion } from 'framer-motion'
import { UserCog, Plus, Pencil, UserCircle2, UserX, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import {
  avatarColumn,
  currencyColumn,
  statusColumn,
  actionsColumn
} from '@/shared/lib/columnHelpers'
import { nowDateString } from '@/shared/lib/utils'
import type { Employee } from '../types/hr.types'
import { EmployeeFormModal } from '../components/EmployeeFormModal'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '../hooks/useEmployees'
import { useHRStore } from '../store/hr.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Employees() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
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
    // viewTarget and setViewTargetId no longer used (profile is a page)
  } = useEmployees()
  const hydrate = useHRStore((s) => s.hydrate)

  const columns: Column<Employee>[] = [
    { key: 'employeeNumber', header: t('employees.table.employeeNumber'), width: 'w-28' },
    avatarColumn<Employee>({
      key: 'fullName',
      header: t('employees.table.name'),
      colorKey: 'avatarColor'
    }),
    { key: 'position', header: t('employees.table.position') },
    { key: 'department', header: t('employees.table.department') },
    { key: 'branch', header: t('employees.table.branch') },
    currencyColumn<Employee>({ key: 'salary', header: t('employees.table.salary') }),
    statusColumn<Employee>({
      key: 'isActive',
      header: t('employees.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<Employee>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/employees/${r.id}`)}
            title={t('employees.profile.viewProfile')}
          >
            <UserCircle2 size={13} />
          </Button>
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setToggleTarget(r)}
              title={r.isActive ? t('employees.table.deactivate') : t('employees.table.reactivate')}
            >
              <UserX size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
      t('common.actions')
    )
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="employees"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('employees.title')}
        subtitle={nowDateString()}
        icon={<UserCog size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('employees.addButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('employees.searchPlaceholder')}
        count={filteredEmployees.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredEmployees}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('employees.empty')}
        />
      </Card>

      <EmployeeFormModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('employees.confirmDeactivate.title')
            : t('employees.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('employees.confirmDeactivate.message', { name: toggleTarget?.fullName ?? '' })
            : t('employees.confirmReactivate.message', { name: toggleTarget?.fullName ?? '' })
        }
        confirmLabel={
          toggleTarget?.isActive ? t('employees.table.deactivate') : t('employees.table.reactivate')
        }
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('employees.confirmDelete.title')}
        message={t('employees.confirmDelete.message', { name: deleteTarget?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
