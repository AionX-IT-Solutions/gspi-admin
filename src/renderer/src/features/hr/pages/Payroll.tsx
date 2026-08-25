import { motion } from 'framer-motion'
import { Check, Plus, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { FieldSelect } from '@/shared/components/ui/FormField'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { PayrollStatus } from '../types/hr.types'
import { PayrollExportMenu } from '../components/PayrollExportMenu'
import { NewPayrollEntryModal } from '../components/NewPayrollEntryModal'
import { usePayroll, type PayrollRow } from '../hooks/usePayroll'
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

const STATUS_VARIANT: Record<PayrollStatus, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  approved: 'primary',
  paid: 'success'
}

export function Payroll() {
  const { t } = useTranslation()
  const {
    loading,
    rows,
    totals,
    yearFilter,
    setYearFilter,
    periodFilter,
    setPeriodFilter,
    availableYears,
    availablePeriods,
    showDialog,
    setShowDialog,
    advanceTarget,
    setAdvanceTarget,
    handleConfirmAdvanceStatus
  } = usePayroll()
  const hydrate = useHRStore((s) => s.hydrate)

  const columns: Column<PayrollRow>[] = [
    { key: 'payrollNumber', header: t('payroll.table.payrollNumber') },
    {
      key: 'employeeName',
      header: t('payroll.table.employee'),
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.employeeName}</div>
          <div style={{ fontSize: 11, color: 'var(--c-text-3)' }}>{r.position}</div>
        </div>
      )
    },
    {
      key: 'periodStart',
      header: t('payroll.table.period'),
      render: (r) => `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`
    },
    {
      key: 'basicSalary',
      header: t('payroll.table.basic'),
      align: 'right',
      render: (r) => formatCurrency(r.basicSalary)
    },
    {
      key: 'representation',
      header: t('payroll.table.representation'),
      align: 'right',
      render: (r) => (r.representation ? formatCurrency(r.representation) : '—')
    },
    {
      key: 'unpaidLeaveDeduction',
      header: t('payroll.table.unpaidLeave'),
      align: 'right',
      render: (r) => (r.unpaidLeaveDeduction ? formatCurrency(r.unpaidLeaveDeduction) : '—')
    },
    {
      key: 'deductions',
      header: t('payroll.table.deductions'),
      align: 'right',
      render: (r) => formatCurrency(r.deductions)
    },
    {
      key: 'netSalary',
      header: t('payroll.table.netPay'),
      align: 'right',
      render: (r) => <b>{formatCurrency(r.netSalary)}</b>
    },
    {
      key: 'status',
      header: t('payroll.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{t(`common.${r.status}`)}</Badge>
    },
    {
      key: 'id',
      header: t('payroll.table.action'),
      sortable: false,
      align: 'right',
      render: (r) =>
        r.status !== 'paid' ? (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Check size={12} />}
            onClick={() => setAdvanceTarget(r)}
          >
            {r.status === 'pending' ? t('payroll.approveButton') : t('payroll.markPaidButton')}
          </Button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--c-text-3)' }}>—</span>
        )
    }
  ]

  return (
    <motion.div
      key="payroll"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('payroll.title')}
        icon={<Wallet size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <PayrollExportMenu rows={rows} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setShowDialog(true)}
            >
              {t('payroll.newEntryButton')}
            </Button>
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16
        }}
      >
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('payroll.summary.totalNet')}
          </p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(totals.total)}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('payroll.summary.pending')}</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{totals.pending}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('payroll.summary.paid')}</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>{totals.paid}</p>
        </Card>
      </div>

      <TableToolbar count={rows.length}>
        <FieldSelect
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          options={[
            { value: 'all', label: t('payroll.filters.allYears') },
            ...availableYears.map((y) => ({ value: y, label: y }))
          ]}
          style={{ width: 140 }}
        />
        <FieldSelect
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          options={[
            { value: 'all', label: t('payroll.filters.allPeriods') },
            ...availablePeriods.map((p) => ({ value: p.value, label: p.label }))
          ]}
          style={{ width: 220 }}
        />
      </TableToolbar>

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage={t('payroll.empty')}
        />
      </Card>

      <NewPayrollEntryModal open={showDialog} onOpenChange={setShowDialog} />

      <ConfirmDialog
        open={!!advanceTarget}
        title={
          advanceTarget?.status === 'pending'
            ? t('payroll.confirmApprove.title')
            : t('payroll.confirmMarkPaid.title')
        }
        message={
          advanceTarget?.status === 'pending'
            ? t('payroll.confirmApprove.message', {
                number: advanceTarget?.payrollNumber ?? '',
                amount: formatCurrency(advanceTarget?.netSalary ?? 0)
              })
            : t('payroll.confirmMarkPaid.message', {
                number: advanceTarget?.payrollNumber ?? '',
                amount: formatCurrency(advanceTarget?.netSalary ?? 0)
              })
        }
        confirmLabel={
          advanceTarget?.status === 'pending'
            ? t('payroll.approveButton')
            : t('payroll.markPaidButton')
        }
        onConfirm={handleConfirmAdvanceStatus}
        onCancel={() => setAdvanceTarget(null)}
      />
    </motion.div>
  )
}
