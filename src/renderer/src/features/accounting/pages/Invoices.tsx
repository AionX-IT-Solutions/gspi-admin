import { motion } from 'framer-motion'
import { FileText, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
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
import { usePermissions } from '@/app/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import type { Invoice } from '../types/accounting.types'
import { statusBadgeVariant, invoiceStatusLabel } from '../components/invoiceStatus'
import { InvoiceSummaryCards } from '../components/InvoiceSummaryCards'
import { ViewInvoiceModal } from '../components/ViewInvoiceModal'
import { CreateInvoiceModal } from '../components/CreateInvoiceModal'
import { useInvoices } from '../hooks/useInvoices'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Invoices() {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    loading,
    filter,
    setFilter,
    filterTabs,
    summary,
    filtered,
    viewingId,
    setViewingId,
    creating,
    setCreating,
    search,
    setSearch
  } = useInvoices()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:invoices')
  const hydrate = useAccountingStore((s) => s.hydrate)
  const deleteInvoice = useAccountingStore((s) => s.deleteInvoice)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    invoiceId: string
    invoiceNumber: string
  }>({
    open: false,
    invoiceId: '',
    invoiceNumber: ''
  })

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    setDeleteConfirm({ open: true, invoiceId, invoiceNumber })
  }

  const handleConfirmDelete = () => {
    deleteInvoice(deleteConfirm.invoiceId)
    toast.success(`Invoice ${deleteConfirm.invoiceNumber} deleted`)
    setDeleteConfirm({ open: false, invoiceId: '', invoiceNumber: '' })
  }

  const columns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.table.number'), width: 'w-28' },
    { key: 'customerName', header: t('invoices.table.customer') },
    {
      key: 'issueDate',
      header: t('invoices.table.issueDate'),
      render: (r) => formatDate(r.issueDate)
    },
    { key: 'dueDate', header: t('invoices.table.dueDate'), render: (r) => formatDate(r.dueDate) },
    {
      key: 'status',
      header: t('invoices.table.status'),
      render: (r) => (
        <Badge variant={statusBadgeVariant[r.status]}>{invoiceStatusLabel(t, r.status)}</Badge>
      )
    },
    {
      key: 'total',
      header: t('invoices.table.total'),
      align: 'right',
      render: (r) => formatCurrency(r.total)
    },
    {
      key: 'balanceDue',
      header: t('invoices.table.balanceDue'),
      align: 'right',
      render: (r) => formatCurrency(r.balanceDue)
    },
    actionsColumn<Invoice>((r) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewingId(r.id)}
          title={t('common.view')}
        >
          <Eye size={13} />
        </Button>
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewingId(r.id)}
            title={t('common.edit')}
          >
            <Pencil size={13} />
          </Button>
        )}
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(r.id, r.number)}
            title={t('common.delete')}
          >
            <Trash2 size={13} />
          </Button>
        )}
      </div>
    ))
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="invoices"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('invoices.title')}
        icon={<FileText size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setCreating(true)}
              >
                {t('invoices.newInvoiceButton')}
              </Button>
            )}
          </>
        }
      />

      <InvoiceSummaryCards
        overdue={summary.overdue}
        notDueYet={summary.notDueYet}
        paid={summary.paid}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border:
                filter === tab.key
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-default)',
              background: filter === tab.key ? 'var(--accent-primary-subtle)' : 'transparent',
              color: filter === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('invoices.searchPlaceholder')}
        count={filtered.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filtered}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('invoices.table.empty')}
        />
      </Card>

      <ViewInvoiceModal invoiceId={viewingId} onClose={() => setViewingId(null)} />
      <CreateInvoiceModal open={creating} onOpenChange={setCreating} />
      <ConfirmDialog
        open={deleteConfirm.open}
        title={t('invoices.deleteTitle') || 'Delete Invoice'}
        message={
          t('invoices.deleteMessage') ||
          `Are you sure you want to delete invoice ${deleteConfirm.invoiceNumber}? This action cannot be undone.`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, invoiceId: '', invoiceNumber: '' })}
        confirmLabel={t('common.delete')}
        danger
      />
    </motion.div>
  )
}
