import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { FieldInput } from '@/shared/components/ui/FormField'
import { useProgramReportsStore } from '../store/programReports.store'
import { PROGRAM_MONTHS, districtsFor, monthKey } from '../types/programReports.types'

interface DistrictCountModalProps {
  lineItemId: string | null
  year: string
  monthIndex: number
  onClose: () => void
}

export function DistrictCountModal({
  lineItemId,
  year,
  monthIndex,
  onClose
}: DistrictCountModalProps) {
  const { t } = useTranslation()
  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const setDistrictMonthlyCount = useProgramReportsStore((s) => s.setDistrictMonthlyCount)
  const deleteDistrict = useProgramReportsStore((s) => s.deleteDistrict)
  const item = lineItems.find((i) => i.id === lineItemId)

  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [value, setValue] = useState(0)
  const [newDistrict, setNewDistrict] = useState('')
  const [deletingDistrict, setDeletingDistrict] = useState<string | null>(null)

  const districts = item ? districtsFor(item) : []
  const key = monthKey(year, monthIndex)
  const councilTotal = Object.values(item?.districtMonthlyCounts ?? {}).reduce(
    (sum, monthly) => sum + (monthly[key] ?? 0),
    0
  )

  useEffect(() => {
    if (!item) return
    const first = districtsFor(item)[0] ?? ''
    setSelectedDistrict(first)
    setValue(first ? (item.districtMonthlyCounts?.[first]?.[key] ?? 0) : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, key])

  function commit(district: string, v: number) {
    if (!lineItemId || !district) return
    setDistrictMonthlyCount(lineItemId, district, year, monthIndex, v)
  }

  function selectDistrict(district: string) {
    if (selectedDistrict) commit(selectedDistrict, value)
    setSelectedDistrict(district)
    setValue(item?.districtMonthlyCounts?.[district]?.[key] ?? 0)
  }

  function handleAddDistrict() {
    const name = newDistrict.trim()
    if (!name) return
    if (districts.includes(name)) {
      selectDistrict(name)
      setNewDistrict('')
      return
    }
    // Commits immediately (starter value 0) rather than just switching local
    // selection — otherwise the new District doesn't actually exist in the store
    // yet, so it wouldn't show up as a chip until some later, unrelated commit.
    if (selectedDistrict) commit(selectedDistrict, value)
    commit(name, 0)
    setSelectedDistrict(name)
    setValue(0)
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
      setValue(next ? (item?.districtMonthlyCounts?.[next]?.[key] ?? 0) : 0)
    }
    setDeletingDistrict(null)
  }

  function handleSave() {
    commit(selectedDistrict, value)
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

        {selectedDistrict && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {item?.valueLabel && (
              <label className="label" style={{ fontSize: 11 }}>
                {item.valueLabel}
              </label>
            )}
            <FieldInput
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        )}

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 12,
            fontSize: 13
          }}
        >
          {t('programReports.breakdownModal.councilTotal')}: <strong>{councilTotal}</strong>
        </div>
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
