import { motion } from 'framer-motion'
import { Award, CheckCheck, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency } from '@/shared/lib/utils'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import { ptdgAmountRequested, type PtdgApplication, type PtdgStatus } from '../types/ptdg.types'
import { NewPtdgModal } from '../components/NewPtdgModal'
import { PtdgDecisionModal } from '../components/PtdgDecisionModal'
import { usePtdg } from '../hooks/usePtdg'
import { usePtdgStore } from '../store/ptdg.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<PtdgStatus, 'default' | 'primary' | 'success' | 'danger'> = {
  draft: 'default',
  submitted: 'primary',
  approved: 'success',
  disapproved: 'danger'
}

export function Ptdg() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    applications,
    search,
    setSearch,
    filter,
    setFilter,
    filterTabs,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    decisionTarget,
    setDecisionTarget,
    handleDecide,
    statusLabel,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preview,
    previewApplication
  } = usePtdg()
  const hydrate = usePtdgStore((s) => s.hydrate)

  const columns: Column<PtdgApplication>[] = [
    { key: 'applicationNumber', header: t('ptdg.table.number'), width: 'w-28' },
    { key: 'purpose', header: t('ptdg.table.purpose') },
    { key: 'eventDate', header: t('ptdg.table.eventDate') },
    {
      key: 'amountRequested',
      header: t('ptdg.table.amountRequested'),
      align: 'right',
      sortable: false,
      render: (r) => formatCurrency(ptdgAmountRequested(r))
    },
    {
      key: 'status',
      header: t('ptdg.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{statusLabel(r.status)}</Badge>
    },
    actionsColumn<PtdgApplication>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <ExportMenu
            iconOnly
            title={t('ptdg.table.exportTooltip')}
            onView={() => handleView(r)}
            onExportExcel={() => handleExportExcel(r)}
            onExportPdf={() => handleExportPdf(r)}
            onExportWord={() => handleExportWord(r)}
          />
          {canManage && r.status === 'submitted' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<CheckCheck size={12} />}
              onClick={() => setDecisionTarget(r)}
            >
              {t('ptdg.actions.recordDecision')}
            </Button>
          )}
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
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
      key="ptdg"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('ptdg.title')}
        subtitle={t('ptdg.subtitle')}
        icon={<Award size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('ptdg.newButton')}
              </Button>
            )}
          </>
        }
      />

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
        searchPlaceholder={t('ptdg.searchPlaceholder')}
        count={applications.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={applications}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('ptdg.table.empty')}
        />
      </Card>

      <NewPtdgModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <PtdgDecisionModal
        application={decisionTarget}
        onClose={() => setDecisionTarget(null)}
        onDecide={handleDecide}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('ptdg.confirmDelete.title')}
        message={t('ptdg.confirmDelete.message', { number: deleteTarget?.applicationNumber ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={previewApplication?.applicationNumber}
        onDownloadExcel={() => previewApplication && handleExportExcel(previewApplication)}
        onDownloadPdf={() => previewApplication && handleExportPdf(previewApplication)}
        onDownloadWord={() => previewApplication && handleExportWord(previewApplication)}
      />
    </motion.div>
  )
}
