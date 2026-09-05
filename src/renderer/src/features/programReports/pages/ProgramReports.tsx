import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import {
  PROGRAM_MONTHS,
  PROGRAM_REPORT_SECTIONS,
  ageLevelTotal,
  categoryAgeLevelGrandTotal,
  councilAgeLevelTotal,
  councilCategoryAgeLevelBreakdown,
  isSubCode,
  monthKey,
  programYearOptions,
  type ProgramReportLineItem
} from '../types/programReports.types'
import { AgeLevelBreakdownModal } from '../components/AgeLevelBreakdownModal'
import { CategoryAgeLevelBreakdownModal } from '../components/CategoryAgeLevelBreakdownModal'
import { CategoryMatrixModal } from '../components/CategoryMatrixModal'
import { DistrictCountModal } from '../components/DistrictCountModal'
import { LogEntriesModal } from '../components/LogEntriesModal'
import { EditLineItemModal } from '../components/EditLineItemModal'
import { EditSectionHeaderModal } from '../components/EditSectionHeaderModal'
import { ProgramReportsExportMenu } from '../components/ProgramReportsExportMenu'
import { useProgramReports } from '../hooks/useProgramReports'
import { useProgramReportsStore } from '../store/programReports.store'

/** "1.1" is 1.b.1's own "1.1 NUMBER OF GIRLS EARNED BADGES" detail item — a real,
 *  independent line item now (its own category matrix, entered separately from
 *  1.b.1's simple age-level summary), but its code doesn't match isSubCode's usual
 *  "N.x.N.N" pattern, so it needs its own indent check in the label column. */
function isBadgeworkDetailCode(code: string): boolean {
  return code === '1.1'
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function ProgramReports() {
  const { t } = useTranslation()
  const {
    canManage,
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
  } = useProgramReports()
  const hydrate = useProgramReportsStore((s) => s.hydrate)
  const [editHeaderOpen, setEditHeaderOpen] = useState(false)

  const columns: Column<ProgramReportLineItem>[] = [
    { key: 'code', header: t('programReports.table.code'), width: '90px', sortable: false },
    {
      key: 'label',
      header: t('programReports.table.label'),
      sortable: false,
      render: (item) =>
        isSubCode(item.code) || isBadgeworkDetailCode(item.code) ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingLeft: 20 }}>
            <span style={{ color: 'var(--text-muted)' }}>↳</span>
            {item.label}
          </span>
        ) : (
          item.label
        )
    },
    {
      key: 'value',
      header: t('programReports.table.thisMonth', { month: PROGRAM_MONTHS[monthIndex] }),
      align: 'right',
      sortable: false,
      render: (item) => {
        if (item.shape === 'count' && item.scope === 'district') {
          const key = monthKey(year, monthIndex)
          const total = Object.values(item.districtMonthlyCounts ?? {}).reduce(
            (sum, monthly) => sum + (monthly[key] ?? 0),
            0
          )
          return (
            <Button variant="ghost" size="sm" onClick={() => setDistrictCountLineItemId(item.id)}>
              {t('programReports.table.breakdownTotal', { count: total })}
            </Button>
          )
        }
        if (item.shape === 'count') {
          const key = monthKey(year, monthIndex)
          return (
            <FieldInput
              type="number"
              min={0}
              value={item.monthlyCounts?.[key] ?? 0}
              onChange={(e) =>
                setMonthlyCount(item.id, year, monthIndex, parseInt(e.target.value, 10) || 0)
              }
              style={{ width: 100, textAlign: 'right' }}
            />
          )
        }
        if (item.shape === 'ageLevelBreakdown') {
          const key = monthKey(year, monthIndex)
          const total =
            item.scope === 'district'
              ? ageLevelTotal(
                  councilAgeLevelTotal(item.districtMonthlyBreakdowns, year, monthIndex)
                )
              : ageLevelTotal(item.monthlyBreakdowns?.[key])
          return (
            <Button variant="ghost" size="sm" onClick={() => setBreakdownLineItemId(item.id)}>
              {t('programReports.table.breakdownTotal', { count: total })}
            </Button>
          )
        }
        if (item.shape === 'categoryAgeLevelBreakdown') {
          const key = monthKey(year, monthIndex)
          const total =
            item.scope === 'district'
              ? categoryAgeLevelGrandTotal(
                  councilCategoryAgeLevelBreakdown(
                    item.districtMonthlyCategoryBreakdowns,
                    year,
                    monthIndex
                  )
                )
              : categoryAgeLevelGrandTotal(item.monthlyCategoryBreakdowns?.[key])
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategoryBreakdownLineItemId(item.id)}
            >
              {t('programReports.table.breakdownTotal', { count: total })}
            </Button>
          )
        }
        if (item.shape === 'categoryMatrix') {
          const key = monthKey(year, monthIndex)
          const total =
            item.scope === 'district'
              ? categoryAgeLevelGrandTotal(
                  councilCategoryAgeLevelBreakdown(
                    item.districtMonthlyCategoryBreakdowns,
                    year,
                    monthIndex
                  )
                )
              : categoryAgeLevelGrandTotal(item.monthlyCategoryBreakdowns?.[key])
          return (
            <Button variant="ghost" size="sm" onClick={() => setMatrixLineItemId(item.id)}>
              {t('programReports.table.breakdownTotal', { count: total })}
            </Button>
          )
        }
        return (
          <Button variant="ghost" size="sm" onClick={() => setLogLineItemId(item.id)}>
            {t('programReports.table.logEntries', { count: item.entries?.length ?? 0 })}
          </Button>
        )
      }
    }
  ]

  if (canManage) {
    columns.push({
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      sortable: false,
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(item)}
          style={{ width: 26, height: 26, padding: 0 }}
          aria-label={t('common.edit')}
        >
          <Pencil size={12} />
        </Button>
      )
    })
  }

  return (
    <motion.div
      key="programReports"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('programReports.title')}
        subtitle={t('programReports.subtitle', { month: PROGRAM_MONTHS[monthIndex], year })}
        icon={<ClipboardList size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil size={13} />}
                onClick={() => setEditHeaderOpen(true)}
              >
                {t('programReports.editHeader.button')}
              </Button>
            )}
            <FieldSelect
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={programYearOptions().map((y) => ({ value: y, label: y }))}
              style={{ width: 140 }}
            />
            <FieldSelect
              value={String(monthIndex)}
              onChange={(e) => setMonthIndex(Number(e.target.value))}
              options={PROGRAM_MONTHS.map((m, i) => ({ value: String(i), label: m }))}
              style={{ width: 100 }}
            />
            <ProgramReportsExportMenu
              items={itemsForSection(activeSection)}
              sectionLabel={t(`programReports.sections.${activeSection}`)}
              section={activeSection}
              year={year}
              monthIndex={monthIndex}
            />
          </>
        }
      />

      <Tabs
        value={activeSection}
        onValueChange={(v) => setActiveSection(v as typeof activeSection)}
      >
        <TabsList>
          {PROGRAM_REPORT_SECTIONS.map((section) => (
            <TabsTrigger key={section} value={section}>
              {t(`programReports.sections.${section}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {PROGRAM_REPORT_SECTIONS.map((section) => (
          <TabsContent key={section} value={section}>
            <Card padding="0px">
              <DataTable
                columns={columns}
                data={itemsForSection(section)}
                emptyMessage={t('programReports.empty')}
              />
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AgeLevelBreakdownModal
        lineItemId={breakdownLineItemId}
        year={year}
        monthIndex={monthIndex}
        onClose={() => setBreakdownLineItemId(null)}
      />
      <CategoryAgeLevelBreakdownModal
        lineItemId={categoryBreakdownLineItemId}
        year={year}
        monthIndex={monthIndex}
        onClose={() => setCategoryBreakdownLineItemId(null)}
      />
      <CategoryMatrixModal
        lineItemId={matrixLineItemId}
        year={year}
        monthIndex={monthIndex}
        onClose={() => setMatrixLineItemId(null)}
      />
      <DistrictCountModal
        lineItemId={districtCountLineItemId}
        year={year}
        monthIndex={monthIndex}
        onClose={() => setDistrictCountLineItemId(null)}
      />
      <LogEntriesModal lineItemId={logLineItemId} onClose={() => setLogLineItemId(null)} />
      <EditLineItemModal item={editing} onClose={() => setEditing(null)} />
      <EditSectionHeaderModal
        open={editHeaderOpen}
        section={activeSection}
        year={year}
        monthIndex={monthIndex}
        onClose={() => setEditHeaderOpen(false)}
      />
    </motion.div>
  )
}
