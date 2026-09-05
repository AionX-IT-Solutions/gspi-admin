import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { useTrainingReportsStore } from '../store/trainingReports.store'
import type { TrainingReport } from '../types/trainingReports.types'
import type { TrainingReportDialogState } from '../components/TrainingReportFormModal'

/** Empty string = "All" (no filter) for both — Training Reports are dated events, not
 *  GSP's Jul-Jun program-year cycle, so this filters by plain calendar year/month of
 *  `dateFrom` rather than reusing PROGRAM_MONTHS. */
export function useTrainingReports() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trainingReports')

  const trainingReports = useTrainingReportsStore((s) => s.trainingReports)
  const deleteTrainingReport = useTrainingReportsStore((s) => s.deleteTrainingReport)

  const [dialog, setDialog] = useState<TrainingReportDialogState | null>(null)
  const [deleting, setDeleting] = useState<TrainingReport | null>(null)
  const [yearFilter, setYearFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [search, setSearch] = useState('')

  const yearOptions = useMemo(() => {
    const years = new Set(trainingReports.map((r) => new Date(r.dateFrom).getFullYear()))
    return [...years].sort((a, b) => b - a).map(String)
  }, [trainingReports])

  const filteredTrainingReports = useMemo(() => {
    const q = search.trim().toLowerCase()
    return trainingReports.filter((r) => {
      const d = new Date(r.dateFrom)
      if (yearFilter && String(d.getFullYear()) !== yearFilter) return false
      if (monthFilter && String(d.getMonth()) !== monthFilter) return false
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !r.reportNo.toLowerCase().includes(q) &&
        !r.place.toLowerCase().includes(q)
      )
        return false
      return true
    })
  }, [trainingReports, yearFilter, monthFilter, search])

  function handleConfirmDelete() {
    if (!deleting) return
    deleteTrainingReport(deleting.id)
    toast.success(t('trainingReports.toast.deleted'))
    setDeleting(null)
  }

  return {
    canManage,
    trainingReports: filteredTrainingReports,
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
  }
}
