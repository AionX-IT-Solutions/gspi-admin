import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import {
  emptyCouncilDepositsRecord,
  emptyLineItem,
  type CouncilDepositLineItem,
  type CouncilDepositsRecord,
  type FundEventBreakdown
} from '../types/councilDeposits.types'
import type { CouncilDepositsEdit } from '../store/councilDeposits.store'

interface EditCouncilDepositsModalProps {
  open: boolean
  record: CouncilDepositsRecord
  isNew: boolean
  onClose: () => void
  onSave: (edit: CouncilDepositsEdit) => void
}

const EVENT_FIELDS: { key: keyof FundEventBreakdown; labelKey: string }[] = [
  { key: 'nationalEvent', labelKey: 'councilDeposits.table.nationalEvent' },
  { key: 'regionalEvent', labelKey: 'councilDeposits.table.regionalEvent' },
  { key: 'councilEvent', labelKey: 'councilDeposits.table.councilEvent' },
  { key: 'internationalEvent', labelKey: 'councilDeposits.table.internationalEvent' }
]

function cloneItems(items: CouncilDepositLineItem[]): CouncilDepositLineItem[] {
  return items.map((item) => ({ ...item, breakdown: { ...item.breakdown } }))
}

function BreakdownGrid({
  value,
  onChange
}: {
  value: FundEventBreakdown
  onChange: (next: FundEventBreakdown) => void
}) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {EVENT_FIELDS.map(({ key, labelKey }) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{t(labelKey)}</span>
          <FieldInput
            type="number"
            min={0}
            step="0.01"
            value={value[key]}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              onChange({ ...value, [key]: Number.isNaN(v) ? 0 : v })
            }}
            style={{ textAlign: 'right', padding: '5px 8px', fontSize: 12.5 }}
          />
        </div>
      ))}
    </div>
  )
}

function LineItemRow({
  item,
  onChange,
  onRemove
}: {
  item: CouncilDepositLineItem
  onChange: (patch: Partial<CouncilDepositLineItem>) => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 10,
        borderRadius: 10,
        border: '1px solid var(--border-subtle)'
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <FieldInput
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={t('councilDeposits.editModal.fundNamePlaceholder')}
          style={{ flex: 1 }}
        />
        <FieldSelect
          value={item.hasBreakdown ? 'breakdown' : 'lumpSum'}
          onChange={(e) => onChange({ hasBreakdown: e.target.value === 'breakdown' })}
          options={[
            { value: 'breakdown', label: t('councilDeposits.editModal.byEventType') },
            { value: 'lumpSum', label: t('councilDeposits.editModal.lumpSum') }
          ]}
          style={{ width: 160 }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={t('common.delete')}
          style={{ width: 30, height: 30, padding: 0, flexShrink: 0 }}
        >
          <Trash2 size={13} color="#f87171" />
        </Button>
      </div>
      {item.hasBreakdown ? (
        <BreakdownGrid value={item.breakdown} onChange={(breakdown) => onChange({ breakdown })} />
      ) : (
        <FieldInput
          type="number"
          min={0}
          step="0.01"
          value={item.lumpSum}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            onChange({ lumpSum: Number.isNaN(v) ? 0 : v })
          }}
          placeholder="0.00"
          style={{ width: 180, textAlign: 'right' }}
        />
      )}
    </div>
  )
}

export function EditCouncilDepositsModal({
  open,
  record,
  isNew,
  onClose,
  onSave
}: EditCouncilDepositsModalProps) {
  const { t } = useTranslation()
  const [asOfDate, setAsOfDate] = useState('')
  const [items, setItems] = useState<CouncilDepositLineItem[]>([])
  const [preparedByName, setPreparedByName] = useState('')
  const [preparedByTitle, setPreparedByTitle] = useState('')
  const [notedByName, setNotedByName] = useState('')
  const [notedByTitle, setNotedByTitle] = useState('')

  useEffect(() => {
    if (!open) return
    const source = isNew ? emptyCouncilDepositsRecord() : record
    setAsOfDate(source.asOfDate ?? '')
    setItems(cloneItems(source.items))
    setPreparedByName(source.preparedByName)
    setPreparedByTitle(source.preparedByTitle)
    setNotedByName(source.notedByName)
    setNotedByTitle(source.notedByTitle)
  }, [open, isNew, record])

  function addItem() {
    setItems((prev) => [...prev, emptyLineItem()])
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }
  function updateItem(id: string, patch: Partial<CouncilDepositLineItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function handleSave() {
    onSave({
      asOfDate: asOfDate || null,
      items: items.filter((i) => i.label.trim()).map((i) => ({ ...i, label: i.label.trim() })),
      preparedByName: preparedByName.trim(),
      preparedByTitle: preparedByTitle.trim(),
      notedByName: notedByName.trim(),
      notedByTitle: notedByTitle.trim()
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={isNew ? t('councilDeposits.editModal.newTitle') : t('councilDeposits.editModal.title')}
      description={t('councilDeposits.editModal.subtitle')}
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
        <div style={{ maxWidth: 220 }}>
          <FormField label={t('councilDeposits.editModal.asOfDate')}>
            <FieldInput
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="label" style={{ marginBottom: 0 }}>
            {t('councilDeposits.table.fund')}
          </p>
          {items.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              onChange={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={addItem}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('councilDeposits.editModal.addFund')}
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 12
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="label" style={{ marginBottom: 0 }}>
              {t('councilDeposits.editModal.preparedBy')}
            </p>
            <FieldInput
              placeholder={t('councilDeposits.editModal.namePlaceholder')}
              value={preparedByName}
              onChange={(e) => setPreparedByName(e.target.value)}
            />
            <FieldInput
              placeholder={t('councilDeposits.editModal.titlePlaceholder')}
              value={preparedByTitle}
              onChange={(e) => setPreparedByTitle(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="label" style={{ marginBottom: 0 }}>
              {t('councilDeposits.editModal.notedBy')}
            </p>
            <FieldInput
              placeholder={t('councilDeposits.editModal.namePlaceholder')}
              value={notedByName}
              onChange={(e) => setNotedByName(e.target.value)}
            />
            <FieldInput
              placeholder={t('councilDeposits.editModal.titlePlaceholder')}
              value={notedByTitle}
              onChange={(e) => setNotedByTitle(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
