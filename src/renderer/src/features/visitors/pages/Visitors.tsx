import { motion } from 'framer-motion'
import { LogOut, Plus, Trash2, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
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
import type { VisitorLog, VisitorStatus } from '../types/visitors.types'
import { NewVisitorModal } from '../components/NewVisitorModal'
import { useVisitors } from '../hooks/useVisitors'
import { useVisitorsStore } from '../store/visitors.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<VisitorStatus, 'warning' | 'outline'> = {
  checked_in: 'warning',
  checked_out: 'outline'
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso)
  )
}

export function Visitors() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    rows,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    form,
    setForm,
    openLogVisitor,
    handleSave,
    checkOutTarget,
    setCheckOutTarget,
    handleConfirmCheckOut,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useVisitors()
  const hydrate = useVisitorsStore((s) => s.hydrate)

  const STATUS_LABEL_KEY: Record<VisitorStatus, string> = {
    checked_in: t('visitors.status.checkedIn'),
    checked_out: t('visitors.status.checkedOut')
  }

  const columns: Column<VisitorLog>[] = [
    { key: 'fullName', header: t('visitors.table.name') },
    { key: 'purpose', header: t('visitors.table.purpose') },
    { key: 'personToVisit', header: t('visitors.table.host') },
    {
      key: 'timeIn',
      header: t('visitors.table.timeIn'),
      render: (r) => formatDateTime(r.timeIn)
    },
    {
      key: 'timeOut',
      header: t('visitors.table.timeOut'),
      render: (r) => (r.timeOut ? formatDateTime(r.timeOut) : '—')
    },
    {
      key: 'status',
      header: t('visitors.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL_KEY[r.status]}</Badge>
    },
    {
      key: 'id',
      header: t('visitors.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          {canManage && r.status === 'checked_in' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<LogOut size={12} />}
              onClick={() => setCheckOutTarget(r)}
            >
              {t('visitors.checkOutButton')}
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
              style={{ padding: 4 }}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="visitors"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('visitors.title')}
        icon={<UserCheck size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={openLogVisitor}
              >
                {t('visitors.logVisitorButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('visitors.searchPlaceholder')}
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
          emptyMessage={t('visitors.empty')}
        />
      </Card>

      <NewVisitorModal
        open={showDialog}
        onOpenChange={setShowDialog}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('visitors.confirmDelete.title')}
        message={t('visitors.confirmDelete.message', { name: deleteTarget?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!checkOutTarget}
        title={t('visitors.confirmCheckOut.title')}
        message={t('visitors.confirmCheckOut.message', { name: checkOutTarget?.fullName ?? '' })}
        confirmLabel={t('visitors.checkOutButton')}
        onConfirm={handleConfirmCheckOut}
        onCancel={() => setCheckOutTarget(null)}
      />
    </motion.div>
  )
}
