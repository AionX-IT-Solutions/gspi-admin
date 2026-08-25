import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { formatDate } from '@/shared/lib/utils'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import {
  exportPayrollRegister,
  exportPayrollRegisterPdf,
  exportPayrollRegisterDocx
} from '../lib/payrollExcelExport'
import type { PayrollEntry } from '../types/hr.types'

interface PayrollRow extends PayrollEntry {
  employeeName: string
  position: string
}

interface PayrollExportMenuProps {
  rows: PayrollRow[]
}

export function PayrollExportMenu({ rows }: PayrollExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)

  function withEmployee() {
    return rows.map((r) => ({ ...r, employee: employees.find((e) => e.id === r.employeeId) }))
  }

  return (
    <ExportMenu
      label={t('payroll.exportButton')}
      onExportExcel={() => {
        if (rows.length === 0) {
          toast.error(t('payroll.toast.noEntriesToExport'))
          return
        }
        exportPayrollRegister(
          withEmployee(),
          `${formatDate(rows[0].periodStart)} to ${formatDate(rows[0].periodEnd)}`
        )
        toast.success(t('payroll.toast.exportedExcel'))
      }}
      onExportPdf={() => {
        if (rows.length === 0) {
          toast.error(t('payroll.toast.noEntriesToExport'))
          return
        }
        exportPayrollRegisterPdf(
          withEmployee(),
          `${formatDate(rows[0].periodStart)} to ${formatDate(rows[0].periodEnd)}`
        )
        toast.success(t('payroll.toast.exportedPdf'))
      }}
      onExportWord={() => {
        if (rows.length === 0) {
          toast.error(t('payroll.toast.noEntriesToExport'))
          return
        }
        exportPayrollRegisterDocx(
          withEmployee(),
          `${formatDate(rows[0].periodStart)} to ${formatDate(rows[0].periodEnd)}`
        )
        toast.success(t('payroll.toast.exportedWord'))
      }}
    />
  )
}
