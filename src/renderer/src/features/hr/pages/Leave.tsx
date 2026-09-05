import { motion } from 'framer-motion'
import { Check, CalendarClock, Pencil, Plus, Trash2, Undo2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatDate } from '@/shared/lib/utils'
import type { LeaveRequestStatus } from '../types/hr.types'
import { FileLeaveModal } from '../components/FileLeaveModal'
import { LeaveDecisionModal } from '../components/LeaveDecisionModal'
import { LeaveBalancesEditModal } from '../components/LeaveBalancesEditModal'
import { RevertLeaveModal } from '../components/RevertLeaveModal'
import { useLeave, type RequestRow, type BalanceRow } from '../hooks/useLeave'
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

const STATUS_VARIANT: Record<LeaveRequestStatus, 'warning' | 'success' | 'danger' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'outline'
}

export function Leave() {
  const { t } = useTranslation()
  const {
    loading,
    leaveTypes,
    rows,
    balanceRows,
    search,
    setSearch,
    balanceSearch,
    setBalanceSearch,
    showFileDialog,
    setShowFileDialog,
    decision,
    setDecision,
    canManage,
    showBalancesModal,
    setShowBalancesModal,
    revertTarget,
    setRevertTarget,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useLeave()
  const hydrate = useHRStore((s) => s.hydrate)

  const balanceColumns: Column<BalanceRow>[] = [
    { key: 'employeeNumber', header: t('employees.table.employeeNumber'), width: 'w-28' },
    { key: 'employeeName', header: t('leave.table.employee') },
    ...leaveTypes.map((lt) => ({
      key: lt.id,
      header: lt.name,
      align: 'right' as const,
      render: (row: BalanceRow) => `${row[lt.id]} / ${lt.defaultAnnualCredits}`
    }))
  ]

  const columns: Column<RequestRow>[] = [
    { key: 'employeeName', header: t('leave.table.employee') },
    { key: 'leaveTypeName', header: t('leave.table.leaveType') },
    { key: 'startDate', header: t('leave.table.from'), render: (r) => formatDate(r.startDate) },
    { key: 'endDate', header: t('leave.table.to'), render: (r) => formatDate(r.endDate) },
    { key: 'daysCount', header: t('leave.table.days'), align: 'right' },
    { key: 'reason', header: t('leave.table.reason'), render: (r) => r.reason ?? '—' },
    {
      key: 'status',
      header: t('leave.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{t(`common.${r.status}`)}</Badge>
    },
    {
      key: 'id',
      header: t('leave.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          {r.status === 'pending' && canManage ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Check size={12} />}
                onClick={() => setDecision({ ...r, status: 'approved' })}
              >
                {t('leave.approveButton')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<X size={12} />}
                onClick={() => setDecision({ ...r, status: 'rejected' })}
              >
                {t('leave.rejectButton')}
              </Button>
            </>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--c-text-3)' }}>{r.decisionNotes ?? '—'}</span>
          )}
          {canManage && r.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRevertTarget(r)}
              title={t('leave.revertButton')}
            >
              <Undo2 size={13} />
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
      )
    }
  ]

  const { hiddenColumns: hiddenBalanceColumns, toggleColumn: toggleBalanceColumn } =
    useColumnVisibility(balanceColumns)
  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="leave"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('leave.title')}
        icon={<CalendarClock size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setShowFileDialog(true)}
            >
              {t('leave.fileLeaveButton')}
            </Button>
          </>
        }
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13 }}>{t('leave.balances.title')}</span>
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Pencil size={12} />}
            onClick={() => setShowBalancesModal(true)}
          >
            {t('leave.balancesModal.editButton')}
          </Button>
        )}
      </div>
      <TableToolbar
        search={balanceSearch}
        onSearchChange={setBalanceSearch}
        searchPlaceholder={t('leave.balances.searchPlaceholder')}
        count={balanceRows.length}
        columnsSlot={
          <ColumnsButton
            columns={balanceColumns}
            hiddenColumns={hiddenBalanceColumns}
            onToggle={toggleBalanceColumn}
          />
        }
      />
      <Card style={{ marginBottom: 16 }} padding="0px">
        <DataTable
          columns={balanceColumns}
          data={balanceRows}
          hiddenColumns={hiddenBalanceColumns}
          loading={loading}
          emptyMessage={t('employees.empty')}
        />
      </Card>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('leave.searchPlaceholder')}
        count={rows.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />
      <Card padding="0px">
        <DataTable
          columns={columns}
          data={rows}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('leave.empty')}
        />
      </Card>

      <FileLeaveModal open={showFileDialog} onOpenChange={setShowFileDialog} />
      <LeaveDecisionModal decision={decision} onClose={() => setDecision(null)} />
      <LeaveBalancesEditModal open={showBalancesModal} onOpenChange={setShowBalancesModal} />

      <RevertLeaveModal target={revertTarget} onClose={() => setRevertTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('leave.confirmDeleteRequest.title')}
        message={t('leave.confirmDeleteRequest.message', {
          name: deleteTarget?.employeeName ?? '',
          leaveType: deleteTarget?.leaveTypeName ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
