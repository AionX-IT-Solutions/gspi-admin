import { motion } from 'framer-motion'
import { CalendarRange, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { formatDate } from '@/shared/lib/utils'
import {
  ACTIVITY_CATEGORY_COLOR,
  type Activity,
  type ActivityStatus
} from '../types/activities.types'
import { ActivityFormModal } from '../components/ActivityFormModal'
import { ActivityCalendarView } from '../components/ActivityCalendarView'
import { useActivities } from '../hooks/useActivities'
import { useActivitiesStore } from '../store/activities.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<ActivityStatus, 'warning' | 'primary' | 'success' | 'outline'> = {
  scheduled: 'warning',
  ongoing: 'primary',
  completed: 'success',
  cancelled: 'outline'
}

function formatTime(value: string): string {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function Activities() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    rows,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    form,
    setForm,
    openAddActivity,
    openEditActivity,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useActivities()
  const hydrate = useActivitiesStore((s) => s.hydrate)

  const STATUS_LABEL_KEY: Record<ActivityStatus, string> = {
    scheduled: t('activities.status.scheduled'),
    ongoing: t('activities.status.ongoing'),
    completed: t('common.completed'),
    cancelled: t('common.cancelled')
  }

  const columns: Column<Activity>[] = [
    { key: 'title', header: t('activities.table.title') },
    {
      key: 'category',
      header: t('activities.table.category'),
      render: (r) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 999,
            background: ACTIVITY_CATEGORY_COLOR[r.category].bg,
            color: ACTIVITY_CATEGORY_COLOR[r.category].text
          }}
        >
          {t(`activities.category.${r.category}`)}
        </span>
      )
    },
    {
      key: 'startDate',
      header: t('activities.table.date'),
      render: (r) => (
        <>
          {formatDate(r.startDate)}
          {r.endDate && r.endDate !== r.startDate && ` – ${formatDate(r.endDate)}`}
          {r.startTime && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' · '}
              {formatTime(r.startTime)}
              {r.endTime ? ` – ${formatTime(r.endTime)}` : ''}
            </span>
          )}
        </>
      )
    },
    { key: 'location', header: t('activities.table.location'), render: (r) => r.location ?? '—' },
    {
      key: 'status',
      header: t('activities.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL_KEY[r.status]}</Badge>
    },
    {
      key: 'id',
      header: t('activities.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditActivity(r)}
              title={t('common.edit')}
              style={{ padding: 4 }}
            >
              <Pencil size={12} />
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
      key="activities"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('activities.title')}
        icon={<CalendarRange size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={openAddActivity}
              >
                {t('activities.newActivityButton')}
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">{t('activities.tabs.list')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('activities.tabs.calendar')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="pt-4">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('activities.searchPlaceholder')}
            count={rows.length}
            columnsSlot={
              <ColumnsButton
                columns={columns}
                hiddenColumns={hiddenColumns}
                onToggle={toggleColumn}
              />
            }
          />

          <Card padding="0px">
            <DataTable
              columns={columns}
              data={rows}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('activities.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="pt-4">
          <ActivityCalendarView />
        </TabsContent>
      </Tabs>

      <ActivityFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('activities.confirmDelete.title')}
        message={t('activities.confirmDelete.message', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
