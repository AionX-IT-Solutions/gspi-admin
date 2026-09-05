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
  PROGRAM_MONTHS,
  ageLevelTotal,
  councilAgeLevelTotal,
  councilMonthlyTotal,
  districtsFor,
  monthKey,
  percentAgainstGoal,
  uniqueDefKey,
  type AgeLevelCounts,
  type CategoryDef
} from '../types/programReports.types'

interface AgeLevelBreakdownModalProps {
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
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--text-muted)'
}

function CountsTable({
  ageLevels,
  onRemoveAgeLevel,
  populationLabel,
  population,
  onPopulationChange,
  earnedLabel,
  counts,
  onChange
}: {
  ageLevels: CategoryDef[]
  onRemoveAgeLevel?: (levelKey: string) => void
  populationLabel?: string
  population?: AgeLevelCounts
  onPopulationChange?: (level: string, value: number) => void
  earnedLabel?: string
  counts: AgeLevelCounts
  onChange: (level: string, value: number) => void
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...headCellStyle, textAlign: 'left' }} />
          {ageLevels.map((level) => (
            <th key={level.key} style={headCellStyle}>
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
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {population && onPopulationChange && (
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={{ ...labelCellStyle, fontWeight: 600 }}>{populationLabel}</td>
            {ageLevels.map((level) => (
              <td key={level.key} style={{ padding: 2 }}>
                <FieldInput
                  type="number"
                  min={0}
                  value={population[level.key] ?? 0}
                  onChange={(e) => onPopulationChange(level.key, parseInt(e.target.value, 10) || 0)}
                  style={{ textAlign: 'center', padding: '5px 2px', fontSize: 12.5 }}
                />
              </td>
            ))}
          </tr>
        )}
        <tr>
          {earnedLabel && <td style={{ ...labelCellStyle, fontWeight: 600 }}>{earnedLabel}</td>}
          {ageLevels.map((level) => (
            <td key={level.key} style={{ padding: 2 }}>
              <FieldInput
                type="number"
                min={0}
                value={counts[level.key] ?? 0}
                onChange={(e) => onChange(level.key, parseInt(e.target.value, 10) || 0)}
                style={{ textAlign: 'center', padding: '5px 2px', fontSize: 12.5 }}
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export function AgeLevelBreakdownModal({
  lineItemId,
  year,
  monthIndex,
  onClose
}: AgeLevelBreakdownModalProps) {
  const { t } = useTranslation()
  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const setMonthlyBreakdown = useProgramReportsStore((s) => s.setMonthlyBreakdown)
  const setDistrictMonthlyBreakdown = useProgramReportsStore((s) => s.setDistrictMonthlyBreakdown)
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
  const ageLevels = item?.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS

  const [counts, setCounts] = useState<AgeLevelCounts>({})
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
      setCounts(first ? (item.districtMonthlyBreakdowns?.[first]?.[key] ?? {}) : {})
      setPopulation(first ? (item.districtMonthlyPopulation?.[first]?.[key] ?? {}) : {})
      setAwardedAgainstGoal(
        first ? (item.districtMonthlyAwardedAgainstGoal?.[first]?.[key] ?? 0) : 0
      )
    } else {
      setCounts(item.monthlyBreakdowns?.[key] ?? {})
      setPopulation(item.monthlyPopulation?.[key] ?? {})
      setAwardedAgainstGoal(item.monthlyAwardedAgainstGoal?.[key] ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, key])

  function commit(district: string, values: AgeLevelCounts, pop: AgeLevelCounts, awarded: number) {
    if (!lineItemId || !district) return
    setDistrictMonthlyBreakdown(lineItemId, district, year, monthIndex, values)
    if (tracksGoal) {
      setDistrictMonthlyPopulation(lineItemId, district, year, monthIndex, pop)
      setDistrictMonthlyAwardedAgainstGoal(lineItemId, district, year, monthIndex, awarded)
    }
  }

  function selectDistrict(district: string) {
    if (isDistrict && selectedDistrict)
      commit(selectedDistrict, counts, population, awardedAgainstGoal)
    setSelectedDistrict(district)
    setCounts(item?.districtMonthlyBreakdowns?.[district]?.[key] ?? {})
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
      commit(selectedDistrict, counts, population, awardedAgainstGoal)
    commit(name, {}, {}, 0)
    setSelectedDistrict(name)
    setCounts({})
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
      setCounts(next ? (item?.districtMonthlyBreakdowns?.[next]?.[key] ?? {}) : {})
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
      commit(selectedDistrict, counts, population, awardedAgainstGoal)
    } else {
      setMonthlyBreakdown(lineItemId, year, monthIndex, counts)
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
      ? councilAgeLevelTotal(item.districtMonthlyBreakdowns, year, monthIndex)
      : null
  const earnedThisMonth = isDistrict
    ? ageLevelTotal(councilAgeLevelTotal(item?.districtMonthlyBreakdowns, year, monthIndex))
    : ageLevelTotal(item?.monthlyBreakdowns?.[key])
  const councilAwardedAgainstGoal = isDistrict
    ? councilMonthlyTotal(item?.districtMonthlyAwardedAgainstGoal, year, monthIndex)
    : (item?.monthlyAwardedAgainstGoal?.[key] ?? 0)
  const percent = percentAgainstGoal(councilAwardedAgainstGoal, item?.goalTarget)

  return (
    <Modal
      open={!!lineItemId}
      onOpenChange={(open) => !open && onClose()}
      title={item?.label}
      description={t('programReports.breakdownModal.subtitle', {
        month: PROGRAM_MONTHS[monthIndex]
      })}
      size={isDistrict ? 'lg' : 'md'}
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

        {item?.section !== 'badgework' && (
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
        )}

        {(!isDistrict || selectedDistrict) && (
          <CountsTable
            ageLevels={ageLevels}
            onRemoveAgeLevel={
              item?.section !== 'badgework'
                ? (levelKey) => setDeletingAgeLevel(levelKey)
                : undefined
            }
            populationLabel={tracksGoal ? t('programReports.goalMetrics.population') : undefined}
            population={tracksGoal ? population : undefined}
            onPopulationChange={
              tracksGoal
                ? (level, value) => setPopulation((p) => ({ ...p, [level]: value }))
                : undefined
            }
            earnedLabel={tracksGoal ? t('programReports.goalMetrics.earned') : undefined}
            counts={counts}
            onChange={(level, value) => setCounts((c) => ({ ...c, [level]: value }))}
          />
        )}

        {councilTotal && (
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              {t('programReports.breakdownModal.councilTotal')}
            </p>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              {ageLevels.map((level) => (
                <span key={level.key}>
                  {level.label}: <strong>{councilTotal[level.key] ?? 0}</strong>
                </span>
              ))}
            </div>
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
            {(!isDistrict || selectedDistrict) && (
              <div style={{ maxWidth: 220 }}>
                <FormField label={t('programReports.goalMetrics.awardedAgainstGoalLabel')}>
                  <FieldInput
                    type="number"
                    min={0}
                    value={awardedAgainstGoal}
                    onChange={(e) => setAwardedAgainstGoal(parseInt(e.target.value, 10) || 0)}
                  />
                </FormField>
              </div>
            )}
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {t('programReports.goalMetrics.earnedThisMonth', { count: earnedThisMonth })}
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
