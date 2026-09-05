import { useEffect, useState, type CSSProperties } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { FieldInput } from '@/shared/components/ui/FormField'
import { useProgramReportsStore } from '../store/programReports.store'
import {
  DEFAULT_AGE_LEVELS,
  DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES,
  PROGRAM_MONTHS,
  districtsFor,
  monthKey,
  type CategoryAgeLevelCounts,
  type CategoryDef
} from '../types/programReports.types'

interface CategoryMatrixModalProps {
  lineItemId: string | null
  year: string
  monthIndex: number
  onClose: () => void
}

const COUNCIL_TOTAL_LABEL = 'Total'

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
const readOnlyCellStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  padding: '5px 2px'
}

/** REPORTS.xls's own fixed template for Troop Camps 1.b.5 — one row per named
 *  category (Troop Camps, Other Outdoor Activities), one column per named metric (No.
 *  of Troops, Girls, Leaders), plus a computed Total row summing across categories.
 *  Static, same as every other Badgework-family matrix this session — no add/remove
 *  category or metric here. */
function MatrixTable({
  categories,
  metrics,
  matrix,
  onCellChange
}: {
  categories: CategoryDef[]
  metrics: CategoryDef[]
  matrix: CategoryAgeLevelCounts
  onCellChange: (categoryKey: string, metricKey: string, value: number) => void
}) {
  const totals = metrics.map((m) =>
    categories.reduce((sum, c) => sum + (matrix[c.key]?.[m.key] ?? 0), 0)
  )

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...headCellStyle, textAlign: 'left' }} />
          {metrics.map((m) => (
            <th key={m.key} style={headCellStyle}>
              {m.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {categories.map((c) => (
          <tr key={c.key}>
            <td style={{ ...labelCellStyle, fontWeight: 600 }}>{c.label}</td>
            {metrics.map((m) => (
              <td key={m.key} style={{ padding: 2 }}>
                <FieldInput
                  type="number"
                  min={0}
                  value={matrix[c.key]?.[m.key] ?? 0}
                  onChange={(e) => onCellChange(c.key, m.key, parseInt(e.target.value, 10) || 0)}
                  style={{ textAlign: 'center', padding: '5px 2px', fontSize: 12.5 }}
                />
              </td>
            ))}
          </tr>
        ))}
        <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <td style={{ ...labelCellStyle, fontWeight: 700 }}>{COUNCIL_TOTAL_LABEL}</td>
          {totals.map((t, i) => (
            <td key={metrics[i].key} style={readOnlyCellStyle}>
              {t}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export function CategoryMatrixModal({
  lineItemId,
  year,
  monthIndex,
  onClose
}: CategoryMatrixModalProps) {
  const { t } = useTranslation()
  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const setMonthlyCategoryBreakdown = useProgramReportsStore((s) => s.setMonthlyCategoryBreakdown)
  const setDistrictMonthlyCategoryBreakdown = useProgramReportsStore(
    (s) => s.setDistrictMonthlyCategoryBreakdown
  )
  const deleteDistrict = useProgramReportsStore((s) => s.deleteDistrict)
  const item = lineItems.find((i) => i.id === lineItemId)
  const isDistrict = item?.scope === 'district'
  const categories = item?.categories?.length
    ? item.categories
    : DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES
  const metrics = item?.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS

  const [matrix, setMatrix] = useState<CategoryAgeLevelCounts>({})
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [deletingDistrict, setDeletingDistrict] = useState<string | null>(null)

  const districts = item ? districtsFor(item) : []
  const key = monthKey(year, monthIndex)

  useEffect(() => {
    if (!item) return
    if (isDistrict) {
      const first = districtsFor(item)[0] ?? ''
      setSelectedDistrict(first)
      setMatrix(first ? (item.districtMonthlyCategoryBreakdowns?.[first]?.[key] ?? {}) : {})
    } else {
      setMatrix(item.monthlyCategoryBreakdowns?.[key] ?? {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, key])

  function commit(district: string, values: CategoryAgeLevelCounts) {
    if (!lineItemId || !district) return
    setDistrictMonthlyCategoryBreakdown(lineItemId, district, year, monthIndex, values)
  }

  function selectDistrict(district: string) {
    if (isDistrict && selectedDistrict) commit(selectedDistrict, matrix)
    setSelectedDistrict(district)
    setMatrix(item?.districtMonthlyCategoryBreakdowns?.[district]?.[key] ?? {})
  }

  function handleAddDistrict() {
    const name = newDistrict.trim()
    if (!name) return
    if (districts.includes(name)) {
      selectDistrict(name)
      setNewDistrict('')
      return
    }
    if (isDistrict && selectedDistrict) commit(selectedDistrict, matrix)
    commit(name, {})
    setSelectedDistrict(name)
    setMatrix({})
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
    }
    setDeletingDistrict(null)
  }

  function handleSave() {
    if (!lineItemId) return
    if (isDistrict) {
      commit(selectedDistrict, matrix)
    } else {
      setMonthlyCategoryBreakdown(lineItemId, year, monthIndex, matrix)
    }
    onClose()
  }

  return (
    <Modal
      open={!!lineItemId}
      onOpenChange={(open) => !open && onClose()}
      title={item?.label}
      description={t('programReports.breakdownModal.subtitle', {
        month: PROGRAM_MONTHS[monthIndex]
      })}
      size="lg"
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

        {(!isDistrict || selectedDistrict) && (
          <MatrixTable
            categories={categories}
            metrics={metrics}
            matrix={matrix}
            onCellChange={(categoryKey, metricKey, value) =>
              setMatrix((m) => ({ ...m, [categoryKey]: { ...m[categoryKey], [metricKey]: value } }))
            }
          />
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
    </Modal>
  )
}
