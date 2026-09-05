import { useEffect, useState, type CSSProperties } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useProgramReportsStore } from '../store/programReports.store'
import {
  DEFAULT_AGE_LEVELS,
  DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES,
  PROGRAM_MONTHS,
  ageLevelTotal,
  categoryAgeLevelGrandTotal,
  categoryGroupLabel,
  councilCategoryAgeLevelBreakdown,
  councilMonthlyTotal,
  districtsFor,
  monthKey,
  percentAgainstGoal,
  uniqueDefKey,
  type AgeLevelCounts,
  type CategoryAgeLevelCounts,
  type CategoryDef
} from '../types/programReports.types'

interface CategoryAgeLevelBreakdownModalProps {
  lineItemId: string | null
  year: string
  monthIndex: number
  onClose: () => void
}

const labelCellStyle: CSSProperties = {
  padding: '5px 8px 5px 0',
  fontSize: 12.5,
  whiteSpace: 'nowrap'
}
const headCellStyle: CSSProperties = {
  textAlign: 'center',
  padding: '0 2px 6px',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--text-muted)'
}
const readOnlyCellStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  padding: '5px 2px'
}

/** Same table REPORTS.xls's own "1.1 NUMBER OF GIRLS EARNED BADGES" detail table
 *  uses (and programReportsExport.ts's badgeworkStyleBlocks matches for export) —
 *  Age Level rows, Total No. of Girls + one column per category as inputs, then the
 *  3 total columns computed and shown read-only, filled in only on the Total row. */
function DetailTable({
  ageLevels,
  onRemoveAgeLevel,
  groupLabel,
  categories,
  population,
  populationLabel,
  onPopulationChange,
  matrix,
  onCellChange,
  awardedAgainstGoal,
  onAwardedAgainstGoalChange
}: {
  ageLevels: CategoryDef[]
  onRemoveAgeLevel?: (levelKey: string) => void
  groupLabel: string
  categories: CategoryDef[]
  population: AgeLevelCounts | null
  populationLabel: string
  onPopulationChange: ((level: string, value: number) => void) | null
  matrix: CategoryAgeLevelCounts
  onCellChange: (categoryKey: string, level: string, value: number) => void
  awardedAgainstGoal: number | null
  onAwardedAgainstGoalChange: ((value: number) => void) | null
}) {
  const badgesEarned = categoryAgeLevelGrandTotal(matrix)
  const leadingCols = 1 + (population ? 1 : 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th colSpan={leadingCols} />
            <th
              colSpan={categories.length}
              style={{
                ...headCellStyle,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 4
              }}
            >
              {groupLabel}
            </th>
            <th colSpan={3} />
          </tr>
          <tr>
            <th style={{ ...headCellStyle, textAlign: 'left' }}>Age Level</th>
            {population && <th style={headCellStyle}>{populationLabel}</th>}
            {categories.map((c) => (
              <th key={c.key} style={headCellStyle}>
                {c.label}
              </th>
            ))}
            <th style={headCellStyle}>Total No. of Girls Earned Badges</th>
            <th style={headCellStyle}>Total No. of Badges Earned</th>
            <th style={headCellStyle}>Total No. of Badges Awarded Against Goal</th>
          </tr>
        </thead>
        <tbody>
          {ageLevels.map((level) => (
            <tr key={level.key}>
              <td style={{ ...labelCellStyle, fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {level.label}
                  {onRemoveAgeLevel && ageLevels.length > 1 && (
                    <button
                      onClick={() => onRemoveAgeLevel(level.key)}
                      aria-label={`Remove ${level.label}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: 2,
                        display: 'inline-flex'
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </span>
              </td>
              {population && onPopulationChange && (
                <td style={{ padding: 2 }}>
                  <FieldInput
                    type="number"
                    min={0}
                    value={population[level.key] ?? 0}
                    onChange={(e) =>
                      onPopulationChange(level.key, parseInt(e.target.value, 10) || 0)
                    }
                    style={{ textAlign: 'center', padding: '5px 2px', fontSize: 12.5 }}
                  />
                </td>
              )}
              {categories.map((c) => (
                <td key={c.key} style={{ padding: 2 }}>
                  <FieldInput
                    type="number"
                    min={0}
                    value={matrix[c.key]?.[level.key] ?? 0}
                    onChange={(e) =>
                      onCellChange(c.key, level.key, parseInt(e.target.value, 10) || 0)
                    }
                    style={{ textAlign: 'center', padding: '5px 2px', fontSize: 12.5 }}
                  />
                </td>
              ))}
              <td style={readOnlyCellStyle} />
              <td style={readOnlyCellStyle} />
              <td style={readOnlyCellStyle} />
            </tr>
          ))}
          <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <td style={{ ...labelCellStyle, fontWeight: 700 }}>Total</td>
            {population && <td style={readOnlyCellStyle}>{ageLevelTotal(population)}</td>}
            {categories.map((c) => (
              <td key={c.key} style={readOnlyCellStyle}>
                {ageLevelTotal(matrix[c.key])}
              </td>
            ))}
            <td style={readOnlyCellStyle}>{badgesEarned}</td>
            <td style={readOnlyCellStyle}>{badgesEarned}</td>
            <td style={{ padding: 2 }}>
              {onAwardedAgainstGoalChange ? (
                <FieldInput
                  type="number"
                  min={0}
                  value={awardedAgainstGoal ?? 0}
                  onChange={(e) => onAwardedAgainstGoalChange(parseInt(e.target.value, 10) || 0)}
                  style={{
                    textAlign: 'center',
                    padding: '5px 2px',
                    fontSize: 12.5,
                    fontWeight: 600
                  }}
                />
              ) : (
                (awardedAgainstGoal ?? 0)
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function CategoryAgeLevelBreakdownModal({
  lineItemId,
  year,
  monthIndex,
  onClose
}: CategoryAgeLevelBreakdownModalProps) {
  const { t } = useTranslation()
  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const setMonthlyCategoryBreakdown = useProgramReportsStore((s) => s.setMonthlyCategoryBreakdown)
  const setDistrictMonthlyCategoryBreakdown = useProgramReportsStore(
    (s) => s.setDistrictMonthlyCategoryBreakdown
  )
  const setMonthlyPopulation = useProgramReportsStore((s) => s.setMonthlyPopulation)
  const setDistrictMonthlyPopulation = useProgramReportsStore((s) => s.setDistrictMonthlyPopulation)
  const setMonthlyAwardedAgainstGoal = useProgramReportsStore((s) => s.setMonthlyAwardedAgainstGoal)
  const setDistrictMonthlyAwardedAgainstGoal = useProgramReportsStore(
    (s) => s.setDistrictMonthlyAwardedAgainstGoal
  )
  const setGoalTarget = useProgramReportsStore((s) => s.setGoalTarget)
  const deleteDistrict = useProgramReportsStore((s) => s.deleteDistrict)
  const updateLineItem = useProgramReportsStore((s) => s.updateLineItem)
  const item = lineItems.find((i) => i.id === lineItemId)
  const isDistrict = item?.scope === 'district'
  const tracksGoal = !!item?.tracksGoalMetrics
  const categories = item?.categories?.length
    ? item.categories
    : DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES
  const ageLevels = item?.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS

  const [matrix, setMatrix] = useState<CategoryAgeLevelCounts>({})
  const [population, setPopulation] = useState<AgeLevelCounts>({})
  const [awardedAgainstGoal, setAwardedAgainstGoal] = useState(0)
  const [goalTarget, setGoalTargetInput] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [deletingDistrict, setDeletingDistrict] = useState<string | null>(null)
  const [newAgeLevel, setNewAgeLevel] = useState('')
  const [deletingAgeLevel, setDeletingAgeLevel] = useState<string | null>(null)

  function handleAddAgeLevel() {
    const label = newAgeLevel.trim()
    if (!label || !item) return
    const nextAgeLevels = [...ageLevels, { key: uniqueDefKey(label, ageLevels), label }]
    updateLineItem(item.id, { ageLevels: nextAgeLevels })
    setNewAgeLevel('')
  }

  function handleConfirmDeleteAgeLevel() {
    if (!item || !deletingAgeLevel) return
    updateLineItem(item.id, { ageLevels: ageLevels.filter((l) => l.key !== deletingAgeLevel) })
    setDeletingAgeLevel(null)
  }

  const districts = item ? districtsFor(item) : []
  const key = monthKey(year, monthIndex)

  useEffect(() => {
    if (!item) return
    setGoalTargetInput(item.goalTarget != null ? String(item.goalTarget) : '')
    if (isDistrict) {
      const first = districtsFor(item)[0] ?? ''
      setSelectedDistrict(first)
      setMatrix(first ? (item.districtMonthlyCategoryBreakdowns?.[first]?.[key] ?? {}) : {})
      setPopulation(first ? (item.districtMonthlyPopulation?.[first]?.[key] ?? {}) : {})
      setAwardedAgainstGoal(
        first ? (item.districtMonthlyAwardedAgainstGoal?.[first]?.[key] ?? 0) : 0
      )
    } else {
      setMatrix(item.monthlyCategoryBreakdowns?.[key] ?? {})
      setPopulation(item.monthlyPopulation?.[key] ?? {})
      setAwardedAgainstGoal(item.monthlyAwardedAgainstGoal?.[key] ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, key])

  function commit(
    district: string,
    values: CategoryAgeLevelCounts,
    pop: AgeLevelCounts,
    awarded: number
  ) {
    if (!lineItemId || !district) return
    setDistrictMonthlyCategoryBreakdown(lineItemId, district, year, monthIndex, values)
    if (tracksGoal) {
      setDistrictMonthlyPopulation(lineItemId, district, year, monthIndex, pop)
      setDistrictMonthlyAwardedAgainstGoal(lineItemId, district, year, monthIndex, awarded)
    }
  }

  function selectDistrict(district: string) {
    if (isDistrict && selectedDistrict)
      commit(selectedDistrict, matrix, population, awardedAgainstGoal)
    setSelectedDistrict(district)
    setMatrix(item?.districtMonthlyCategoryBreakdowns?.[district]?.[key] ?? {})
    setPopulation(item?.districtMonthlyPopulation?.[district]?.[key] ?? {})
    setAwardedAgainstGoal(item?.districtMonthlyAwardedAgainstGoal?.[district]?.[key] ?? 0)
  }

  function handleAddDistrict() {
    const name = newDistrict.trim()
    if (!name) return
    if (districts.includes(name)) {
      selectDistrict(name)
      setNewDistrict('')
      return
    }
    // Commits immediately (empty starter data) rather than just switching local
    // selection — otherwise the new District doesn't actually exist in the store
    // yet, so it wouldn't show up as a chip until some later, unrelated commit.
    if (isDistrict && selectedDistrict)
      commit(selectedDistrict, matrix, population, awardedAgainstGoal)
    commit(name, {}, {}, 0)
    setSelectedDistrict(name)
    setMatrix({})
    setPopulation({})
    setAwardedAgainstGoal(0)
    setNewDistrict('')
  }

  function handleConfirmDeleteDistrict() {
    if (!lineItemId || !deletingDistrict) return
    const wasSelected = deletingDistrict === selectedDistrict
    deleteDistrict(lineItemId, deletingDistrict)
    if (wasSelected) {
      const remaining = districts.filter((d) => d !== deletingDistrict)
      const next = remaining[0] ?? ''
      setSelectedDistrict(next)
      setMatrix(next ? (item?.districtMonthlyCategoryBreakdowns?.[next]?.[key] ?? {}) : {})
      setPopulation(next ? (item?.districtMonthlyPopulation?.[next]?.[key] ?? {}) : {})
      setAwardedAgainstGoal(
        next ? (item?.districtMonthlyAwardedAgainstGoal?.[next]?.[key] ?? 0) : 0
      )
    }
    setDeletingDistrict(null)
  }

  function handleSave() {
    if (!lineItemId) return
    if (isDistrict) {
      commit(selectedDistrict, matrix, population, awardedAgainstGoal)
    } else {
      setMonthlyCategoryBreakdown(lineItemId, year, monthIndex, matrix)
      if (tracksGoal) {
        setMonthlyPopulation(lineItemId, year, monthIndex, population)
        setMonthlyAwardedAgainstGoal(lineItemId, year, monthIndex, awardedAgainstGoal)
      }
    }
    if (tracksGoal) {
      const parsed = parseInt(goalTarget, 10)
      setGoalTarget(lineItemId, Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed)
    }
    onClose()
  }

  const councilTotal =
    isDistrict && item
      ? councilCategoryAgeLevelBreakdown(item.districtMonthlyCategoryBreakdowns, year, monthIndex)
      : null
  const councilAwardedAgainstGoal = isDistrict
    ? councilMonthlyTotal(item?.districtMonthlyAwardedAgainstGoal, year, monthIndex)
    : (item?.monthlyAwardedAgainstGoal?.[key] ?? 0)
  const percent = percentAgainstGoal(councilAwardedAgainstGoal, item?.goalTarget)

  return (
    <Modal
      open={!!lineItemId}
      onOpenChange={(open) => !open && onClose()}
      title={item?.label}
      description={t('programReports.categoryBreakdownModal.subtitle', {
        month: PROGRAM_MONTHS[monthIndex]
      })}
      size="full"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isDistrict && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {districts.map((d) => (
                <div key={d} style={{ display: 'flex', alignItems: 'stretch' }}>
                  <Button
                    variant={d === selectedDistrict ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => selectDistrict(d)}
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    {d}
                  </Button>
                  <Button
                    variant={d === selectedDistrict ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDeletingDistrict(d)}
                    aria-label={t('common.delete')}
                    style={{
                      width: 26,
                      padding: 0,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderLeft: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <X size={11} />
                  </Button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <FieldInput
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDistrict()}
                placeholder={t('programReports.breakdownModal.districtPlaceholder')}
                style={{ flex: 1 }}
              />
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={12} />}
                onClick={handleAddDistrict}
              >
                {t('programReports.breakdownModal.addDistrict')}
              </Button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <FieldInput
            value={newAgeLevel}
            onChange={(e) => setNewAgeLevel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAgeLevel()}
            placeholder={t('programReports.breakdownModal.ageLevelPlaceholder')}
            style={{ flex: 1, maxWidth: 240 }}
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={handleAddAgeLevel}
          >
            {t('programReports.breakdownModal.addAgeLevel')}
          </Button>
        </div>

        {(!isDistrict || selectedDistrict) && (
          <DetailTable
            ageLevels={ageLevels}
            onRemoveAgeLevel={(levelKey) => setDeletingAgeLevel(levelKey)}
            groupLabel={item ? categoryGroupLabel(item) : ''}
            categories={categories}
            population={tracksGoal ? population : null}
            populationLabel={t('programReports.goalMetrics.population')}
            onPopulationChange={
              tracksGoal ? (level, value) => setPopulation((p) => ({ ...p, [level]: value })) : null
            }
            matrix={matrix}
            onCellChange={(categoryKey, level, value) =>
              setMatrix((m) => ({ ...m, [categoryKey]: { ...m[categoryKey], [level]: value } }))
            }
            awardedAgainstGoal={tracksGoal ? awardedAgainstGoal : null}
            onAwardedAgainstGoalChange={tracksGoal ? (value) => setAwardedAgainstGoal(value) : null}
          />
        )}

        {councilTotal && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 6
              }}
            >
              {t('programReports.breakdownModal.councilTotal')}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.key}>
                    <td style={{ padding: '2px 8px 2px 0' }}>{c.label}</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>
                      {ageLevelTotal(councilTotal[c.key])}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '4px 8px 0 0', fontWeight: 700 }}>
                    {t('programReports.categoryBreakdownModal.grandTotal')}
                  </td>
                  <td style={{ padding: '4px 0 0', textAlign: 'right', fontWeight: 700 }}>
                    {categoryAgeLevelGrandTotal(councilTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tracksGoal && (
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 12,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 16
            }}
          >
            <div style={{ maxWidth: 160 }}>
              <FormField label={t('programReports.goalMetrics.targetLabel')}>
                <FieldInput
                  type="number"
                  min={0}
                  value={goalTarget}
                  onChange={(e) => setGoalTargetInput(e.target.value)}
                  placeholder={t('programReports.goalMetrics.targetPlaceholder')}
                />
              </FormField>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {t('programReports.goalMetrics.earnedThisMonth', {
                count: categoryAgeLevelGrandTotal(matrix)
              })}
              {percent != null && (
                <>
                  {' — '}
                  {t('programReports.goalMetrics.againstGoal', { percent })}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deletingDistrict}
        title={t('programReports.breakdownModal.confirmDeleteDistrict.title')}
        message={t('programReports.breakdownModal.confirmDeleteDistrict.message', {
          district: deletingDistrict ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteDistrict}
        onCancel={() => setDeletingDistrict(null)}
      />
      <ConfirmDialog
        open={!!deletingAgeLevel}
        title={t('programReports.breakdownModal.confirmDeleteAgeLevel.title')}
        message={t('programReports.breakdownModal.confirmDeleteAgeLevel.message', {
          ageLevel: ageLevels.find((l) => l.key === deletingAgeLevel)?.label ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteAgeLevel}
        onCancel={() => setDeletingAgeLevel(null)}
      />
    </Modal>
  )
}
