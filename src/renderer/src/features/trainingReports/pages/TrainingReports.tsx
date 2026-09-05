import { motion } from 'framer-motion'
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react'
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
import { FieldSelect } from '@/shared/components/ui/FormField'
import { formatDate } from '@/shared/lib/utils'
import type { TrainingReport } from '../types/trainingReports.types'
import { TrainingReportFormModal } from '../components/TrainingReportFormModal'
import { TrainingReportExportMenu } from '../components/TrainingReportExportMenu'
import { useTrainingReports } from '../hooks/useTrainingReports'
import { useTrainingReportsStore } from '../store/trainingReports.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function TrainingReports() {
  const { t } = useTranslation()
  const {
    canManage,
    trainingReports,
    yearFilter,
    setYearFilter,
    monthFilter,
    setMonthFilter,
    yearOptions,
    dialog,
    setDialog,
    deleting,
    setDeleting,
    handleConfirmDelete,
    search,
    setSearch
  } = useTrainingReports()
  const monthOptions = t('settings.membershipYear.months', { returnObjects: true }) as string[]
  const hydrate = useTrainingReportsStore((s) => s.hydrate)

  const filterPeriod = [monthFilter ? monthOptions[Number(monthFilter)] : '', yearFilter]
    .filter(Boolean)
    .join(' ')

  const columns: Column<TrainingReport>[] = [
    { key: 'reportNo', header: t('trainingReports.table.reportNo'), width: '90px' },
    { key: 'title', header: t('trainingReports.table.title') },
    {
      key: 'trainingType',
      header: t('trainingReports.table.type'),
      render: (r) => t(`trainingReports.types.${r.trainingType}`)
    },
    {
      key: 'dateFrom',
      header: t('trainingReports.table.date'),
      render: (r) => formatDate(r.dateFrom)
    },
    { key: 'place', header: t('trainingReports.table.place') },
    {
      key: 'participantCount',
      header: t('trainingReports.table.participants'),
      align: 'right'
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <TrainingReportExportMenu report={r} />
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialog({ mode: 'edit', reportId: r.id })}
                style={{ width: 26, height: 26, padding: 0 }}
                aria-label={t('common.edit')}
              >
                <Pencil size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleting(r)}
                style={{ width: 26, height: 26, padding: 0 }}
                aria-label={t('common.delete')}
              >
                <Trash2 size={12} color="#f87171" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="trainingReports"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('trainingReports.title')}
        subtitle={
          filterPeriod
            ? t('trainingReports.subtitleFiltered', { period: filterPeriod })
            : t('trainingReports.subtitle')
        }
        icon={<GraduationCap size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <FieldSelect
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder={t('trainingReports.filters.allYears')}
              options={yearOptions.map((y) => ({ value: y, label: y }))}
              style={{ width: 110 }}
            />
            <FieldSelect
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              placeholder={t('trainingReports.filters.allMonths')}
              options={monthOptions.map((m, i) => ({ value: String(i), label: m }))}
              style={{ width: 130 }}
            />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setDialog({ mode: 'create' })}
              >
                {t('trainingReports.newReportButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('trainingReports.searchPlaceholder')}
        count={trainingReports.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={trainingReports}
          hiddenColumns={hiddenColumns}
          emptyMessage={t('trainingReports.empty')}
        />
      </Card>

      <TrainingReportFormModal dialog={dialog} onClose={() => setDialog(null)} />

      <ConfirmDialog
        open={!!deleting}
        title={t('trainingReports.confirmDelete.title')}
        message={t('trainingReports.confirmDelete.message', { title: deleting?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  )
}
