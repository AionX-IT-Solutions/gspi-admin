import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { formatDate } from '@/shared/lib/utils'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import {
  exportPayrollRegister,
  exportPayrollRegisterPdf,
  exportPayrollRegisterDocx,
  buildPayrollRegisterPdfDoc
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
  const preview = useDocumentPreview()

  function withEmployee() {
    return rows.map((r) => ({ ...r, employee: employees.find((e) => e.id === r.employeeId) }))
  }

  function periodLabel() {
    return `${formatDate(rows[0].periodStart)} to ${formatDate(rows[0].periodEnd)}`
  }

  function requireRows(): boolean {
    if (rows.length === 0) {
      toast.error(t('payroll.toast.noEntriesToExport'))
      return false
    }
    return true
  }

  return (
    <>
      <ExportMenu
        label={t('payroll.exportButton')}
        onView={async () => {
          if (!requireRows()) return
          preview.openPreview(await buildPayrollRegisterPdfDoc(withEmployee(), periodLabel()))
        }}
        onExportExcel={() => {
          if (!requireRows()) return
          exportPayrollRegister(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          if (!requireRows()) return
          exportPayrollRegisterPdf(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedPdf'))
        }}
        onExportWord={() => {
          if (!requireRows()) return
          exportPayrollRegisterDocx(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('payroll.exportButton')}
        onDownloadExcel={() => {
          exportPayrollRegister(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportPayrollRegisterPdf(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportPayrollRegisterDocx(withEmployee(), periodLabel())
          toast.success(t('payroll.toast.exportedWord'))
        }}
      />
    </>
  )
}
