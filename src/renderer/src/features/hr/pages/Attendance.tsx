import { motion } from 'framer-motion'
import { CalendarClock, Fingerprint, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useHRStore } from '../store/hr.store'
import { formatDate } from '@/shared/lib/utils'
import type { AttendanceStatus } from '../types/hr.types'
import { ManualAttendanceModal } from '../components/ManualAttendanceModal'
import { useAttendance, type AttendanceRow } from '../hooks/useAttendance'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<
  AttendanceStatus,
  'success' | 'outline' | 'warning' | 'danger' | 'cyan' | 'primary'
> = {
  present: 'success',
  'half-day': 'warning',
  leave: 'outline',
  absent: 'danger',
  overtime: 'cyan',
  late: 'primary'
}

export function Attendance() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const hydrate = useHRStore((s) => s.hydrate)
  const {
    loading,
    activeEmployees,
    rows,
    summary,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    employeeFilter,
    setEmployeeFilter,
    showDialog,
    setShowDialog,
    canManage,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useAttendance()

  const [editingRecord, setEditingRecord] = useState<AttendanceRow | null>(null)

  const columns: Column<AttendanceRow>[] = [
    { key: 'date', header: t('attendance.table.date'), render: (r) => formatDate(r.date) },
    {
      key: 'employeeName',
      header: t('attendance.table.employee'),
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.employeeName}</div>
          <div style={{ fontSize: 11, color: 'var(--c-text-3)' }}>{r.position}</div>
        </div>
      )
    },
    {
      key: 'clockIn',
      header: t('attendance.table.clockIn'),
      render: (r) =>
        r.clockIn
          ? new Date(r.clockIn).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
          : '—'
    },
    {
      key: 'clockOut',
      header: t('attendance.table.clockOut'),
      render: (r) =>
        r.clockOut
          ? new Date(r.clockOut).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
          : '—'
    },
    {
      key: 'hoursWorked',
      header: t('attendance.table.hours'),
      align: 'right',
      render: (r) => r.hoursWorked ?? '—'
    },
    {
      key: 'status',
      header: t('attendance.table.status'),
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]}>{t(`attendance.status.${r.status}`)}</Badge>
      )
    },
    { key: 'notes', header: t('attendance.table.notes'), render: (r) => r.notes ?? '—' },
    ...(canManage
      ? [
          {
            key: 'id',
            header: t('attendance.table.action'),
            sortable: false,
            align: 'right' as const,
            render: (r: AttendanceRow) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingRecord(r)
                    setShowDialog(true)
                  }}
                  title={t('common.edit')}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(r)}
                  title={t('common.delete')}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            )
          }
        ]
      : [])
  ]

  return (
    <motion.div
      key="attendance"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('attendance.title')}
        icon={<CalendarClock size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Fingerprint size={13} />}
              onClick={() => navigate('/attendance/enrollment')}
            >
              {t('attendance.enrollmentButton')}
            </Button>
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => {
                  setEditingRecord(null)
                  setShowDialog(true)
                }}
              >
                {t('attendance.manualEntryButton')}
              </Button>
            )}
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12,
          marginBottom: 14
        }}
      >
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.records')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700 }}>{summary.total}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.present')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>{summary.present}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('attendance.summary.late')}</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#818cf8' }}>{summary.late}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.overtime')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#22d3ee' }}>
            {t('attendance.summary.overtimeHours', { hours: summary.overtimeHours })}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.overtimeRecords', { count: summary.overtime })}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.onLeave')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>{summary.leave}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('attendance.summary.absent')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#f87171' }}>{summary.absent}</p>
        </Card>
      </div>

      <TableToolbar count={rows.length}>
        <FieldInput
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ width: 160 }}
        />
        <span style={{ fontSize: 12, color: 'var(--c-text-3)' }}>{t('attendance.filters.to')}</span>
        <FieldInput
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ width: 160 }}
        />
        <FieldSelect
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          options={[
            { value: 'all', label: t('attendance.filters.allEmployees') },
            ...activeEmployees.map((e) => ({ value: e.id, label: e.fullName }))
          ]}
          style={{ width: 200 }}
        />
      </TableToolbar>

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage={t('attendance.empty')}
        />
      </Card>

      <ManualAttendanceModal
        open={showDialog}
        onOpenChange={(o) => {
          setShowDialog(o)
          if (!o) setEditingRecord(null)
        }}
        editingRecord={editingRecord}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('attendance.confirmDelete.title')}
        message={t('attendance.confirmDelete.message', {
          name: deleteTarget?.employeeName ?? '',
          date: deleteTarget ? formatDate(deleteTarget.date) : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
