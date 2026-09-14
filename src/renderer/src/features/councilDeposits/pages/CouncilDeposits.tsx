import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { FieldSelect } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import {
  lineItemTotal,
  councilDepositsColumnTotals,
  councilDepositsGrandTotal
} from '../types/councilDeposits.types'
import { useCouncilDeposits } from '../hooks/useCouncilDeposits'
import { useCouncilDepositsStore } from '../store/councilDeposits.store'
import { EditCouncilDepositsModal } from '../components/EditCouncilDepositsModal'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const th: CSSProperties = {
  textAlign: 'right',
  padding: '10px 12px',
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border-default)'
}

const td: CSSProperties = {
  textAlign: 'right',
  padding: '10px 12px',
  fontSize: 13,
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-subtle)'
}

export function CouncilDeposits() {
  const { t } = useTranslation()
  const {
    record,
    hasRecords,
    dateOptions,
    selectedId,
    setSelectedId,
    canManage,
    showEditModal,
    setShowEditModal,
    isNew,
    openAdd,
    openEdit,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preview
  } = useCouncilDeposits()
  const hydrate = useCouncilDepositsStore((s) => s.hydrate)

  const columnTotals = councilDepositsColumnTotals(record)
  const grandTotal = councilDepositsGrandTotal(record)

  return (
    <motion.div
      key="council-deposits"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('councilDeposits.title')}
        subtitle={t('councilDeposits.subtitle')}
        icon={<Landmark size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <ExportMenu
              title={t('councilDeposits.exportTooltip')}
              onView={handleView}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
            />
            {canManage && (
              <>
                {hasRecords && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Pencil size={13} />}
                      onClick={openEdit}
                    >
                      {t('councilDeposits.editButton')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectedId && setDeleteTarget(selectedId)}
                      aria-label={t('common.delete')}
                      style={{ padding: '5px 8px' }}
                    >
                      <Trash2 size={14} color="#f87171" />
                    </Button>
                  </>
                )}
                <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                  {t('councilDeposits.newButton')}
                </Button>
              </>
            )}
          </>
        }
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14
        }}
      >
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          {t('councilDeposits.selectDate')}:
        </span>
        <FieldSelect
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          options={
            hasRecords ? dateOptions : [{ value: '', label: t('councilDeposits.noSnapshots') }]
          }
          disabled={!hasRecords}
          style={{ width: 200 }}
        />
        {!hasRecords && (
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            {t('councilDeposits.notRecordedYet')}
          </span>
        )}
      </div>

      <Card padding="0px">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left' }}>{t('councilDeposits.table.fund')}</th>
                <th style={th}>{t('councilDeposits.table.nationalEvent')}</th>
                <th style={th}>{t('councilDeposits.table.regionalEvent')}</th>
                <th style={th}>{t('councilDeposits.table.councilEvent')}</th>
                <th style={th}>{t('councilDeposits.table.internationalEvent')}</th>
                <th style={th}>{t('councilDeposits.table.total')}</th>
              </tr>
            </thead>
            <tbody>
              {record.items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: 'left', color: 'var(--text-muted)' }}>
                    {t('councilDeposits.table.noFunds')}
                  </td>
                </tr>
              )}
              {record.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...td, textAlign: 'left' }}>{item.label}</td>
                  {item.hasBreakdown ? (
                    [
                      item.breakdown.nationalEvent,
                      item.breakdown.regionalEvent,
                      item.breakdown.councilEvent,
                      item.breakdown.internationalEvent
                    ].map((v, i) => (
                      <td key={i} style={td}>
                        {formatCurrency(v)}
                      </td>
                    ))
                  ) : (
                    <>
                      <td style={td}>{t('councilDeposits.table.noBreakdown')}</td>
                      <td style={td}>{t('councilDeposits.table.noBreakdown')}</td>
                      <td style={td}>{t('councilDeposits.table.noBreakdown')}</td>
                      <td style={td}>{t('councilDeposits.table.noBreakdown')}</td>
                    </>
                  )}
                  <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(lineItemTotal(item))}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...td, textAlign: 'left', fontWeight: 700, borderBottom: 'none' }}>
                  {t('councilDeposits.table.grandTotal')}
                </td>
                {[
                  columnTotals.nationalEvent,
                  columnTotals.regionalEvent,
                  columnTotals.councilEvent,
                  columnTotals.internationalEvent
                ].map((v, i) => (
                  <td key={i} style={{ ...td, fontWeight: 700, borderBottom: 'none' }}>
                    {formatCurrency(v)}
                  </td>
                ))}
                <td style={{ ...td, fontWeight: 700, borderBottom: 'none' }}>
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 32,
          maxWidth: 560
        }}
      >
        <div>
          <div
            style={{
              borderBottom: '1px solid var(--text-primary)',
              minHeight: 20,
              marginBottom: 4,
              fontWeight: 600,
              fontSize: 13
            }}
          >
            {record.preparedByName}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {record.preparedByTitle || t('councilDeposits.editModal.preparedBy')}
          </span>
        </div>
        <div>
          <div
            style={{
              borderBottom: '1px solid var(--text-primary)',
              minHeight: 20,
              marginBottom: 4,
              fontWeight: 600,
              fontSize: 13
            }}
          >
            {record.notedByName}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {record.notedByTitle || t('councilDeposits.editModal.notedBy')}
          </span>
        </div>
      </div>

      <EditCouncilDepositsModal
        open={showEditModal}
        record={record}
        isNew={isNew}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('councilDeposits.confirmDelete.title')}
        message={t('councilDeposits.confirmDelete.message')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('councilDeposits.title')}
        onDownloadExcel={handleExportExcel}
        onDownloadPdf={handleExportPdf}
        onDownloadWord={handleExportWord}
      />
    </motion.div>
  )
}
