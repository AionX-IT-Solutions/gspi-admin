import { useState } from 'react'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useProgramReportsStore } from '../store/programReports.store'
import {
  PROGRAM_REPORT_SECTIONS,
  programYearLabel,
  sortByCode,
  type ProgramReportLineItem,
  type ProgramReportSection
} from '../types/programReports.types'

export function useProgramReports() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:programReports')

  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const setMonthlyCount = useProgramReportsStore((s) => s.setMonthlyCount)

  const currentMonthIndex =
    new Date().getMonth() >= 6 ? new Date().getMonth() - 6 : new Date().getMonth() + 6
  const [monthIndex, setMonthIndex] = useState(currentMonthIndex)
  const [year, setYear] = useState(programYearLabel())
  const [activeSection, setActiveSection] = useState<ProgramReportSection>(
    PROGRAM_REPORT_SECTIONS[0]
  )

  const [breakdownLineItemId, setBreakdownLineItemId] = useState<string | null>(null)
  const [categoryBreakdownLineItemId, setCategoryBreakdownLineItemId] = useState<string | null>(
    null
  )
  const [matrixLineItemId, setMatrixLineItemId] = useState<string | null>(null)
  const [districtCountLineItemId, setDistrictCountLineItemId] = useState<string | null>(null)
  const [logLineItemId, setLogLineItemId] = useState<string | null>(null)
  const [editing, setEditing] = useState<ProgramReportLineItem | null>(null)

  function itemsForSection(section: ProgramReportSection) {
    return sortByCode(lineItems.filter((i) => i.section === section))
  }

  return {
    canManage,
    lineItems,
    itemsForSection,
    monthIndex,
    setMonthIndex,
    year,
    setYear,
    activeSection,
    setActiveSection,
    setMonthlyCount,
    breakdownLineItemId,
    setBreakdownLineItemId,
    categoryBreakdownLineItemId,
    setCategoryBreakdownLineItemId,
    matrixLineItemId,
    setMatrixLineItemId,
    districtCountLineItemId,
    setDistrictCountLineItemId,
    logLineItemId,
    setLogLineItemId,
    editing,
    setEditing
  }
}
