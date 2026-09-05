import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FieldInput } from '@/shared/components/ui/FormField'
import { formatDate } from '@/shared/lib/utils'
import { useProgramReportsStore } from '../store/programReports.store'
import {
  DEFAULT_LOG_FIELDS,
  districtsFor,
  type StructuredFieldDef
} from '../types/programReports.types'

interface LogEntriesModalProps {
  lineItemId: string | null
  onClose: () => void
}

/** One input/table column — built-in Date (and District, when the item is
 *  district-scoped) plus the item's own `fields`, merged into a single ordered list per
 *  `dateColumnIndex` so the entries table below uses exactly the same column order
 *  REPORTS.xls itself uses (Date isn't always first there). The add-entry form below
 *  doesn't need to follow that same order — it groups fields for clarity instead. */
interface LogColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'date'
}

const sectionLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
  letterSpacing: 0.3
}

export function LogEntriesModal({ lineItemId, onClose }: LogEntriesModalProps) {
  const { t } = useTranslation()
  const lineItems = useProgramReportsStore((s) => s.lineItems)
  const addLogEntry = useProgramReportsStore((s) => s.addLogEntry)
  const deleteLogEntry = useProgramReportsStore((s) => s.deleteLogEntry)
  const item = lineItems.find((i) => i.id === lineItemId)
  const fields = item?.fields ?? DEFAULT_LOG_FIELDS

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [district, setDistrict] = useState('')
  const [values, setValues] = useState<Record<string, string | number>>({})

  const districtOptions = item ? districtsFor(item) : []
  const entries = item?.entries ?? []

  const otherColumns: LogColumn[] = [
    ...(item?.scope === 'district'
      ? [
          {
            key: '__district',
            label: item.districtLabel ?? t('programReports.form.district'),
            type: 'text' as const
          }
        ]
      : []),
    ...fields.map((f) => ({ key: f.key, label: f.label, type: f.type }))
  ]
  const dateColumn: LogColumn = { key: '__date', label: item?.dateLabel ?? 'Date', type: 'date' }
  const columns = [...otherColumns]
  if (!item?.hideDateColumn) {
    columns.splice(Math.min(item?.dateColumnIndex ?? 0, otherColumns.length), 0, dateColumn)
  }

  // Add-entry form groups fields sharing a `groupLabel` (e.g. "Participant" for
  // Girl/Adult counts) under one visible sub-heading, matching the table's own
  // grouped header — everything else sits in the main, ungrouped row.
  const ungroupedFields = fields.filter((f) => !f.groupLabel)
  const fieldGroups: { label: string; fields: StructuredFieldDef[] }[] = []
  for (const f of fields) {
    if (!f.groupLabel) continue
    const existing = fieldGroups.find((g) => g.label === f.groupLabel)
    if (existing) existing.fields.push(f)
    else fieldGroups.push({ label: f.groupLabel, fields: [f] })
  }

  const hasAnyValue = fields.some((f) => {
    const v = values[f.key]
    return v !== undefined && v !== ''
  })

  function handleAdd() {
    if (!lineItemId || !hasAnyValue) return
    addLogEntry(lineItemId, {
      date,
      district: item?.scope === 'district' ? district.trim() || undefined : undefined,
      values
    })
    setValues({})
  }

  function setFieldValue(field: StructuredFieldDef, raw: string) {
    setValues((v) => ({ ...v, [field.key]: field.type === 'number' ? Number(raw) || 0 : raw }))
  }

  function renderFieldInput(f: StructuredFieldDef) {
    return (
      <div
        key={f.key}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: `0 1 ${f.type === 'number' ? 100 : 150}px`
        }}
      >
        <label className="label" style={{ fontSize: 11 }} title={f.label}>
          {f.label}
        </label>
        <FieldInput
          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
          min={f.type === 'number' ? 0 : undefined}
          value={values[f.key] ?? ''}
          onChange={(e) => setFieldValue(f, e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
      </div>
    )
  }

  return (
    <Modal
      open={!!lineItemId}
      onOpenChange={(open) => !open && onClose()}
      title={item?.label}
      size="lg"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={sectionLabelStyle}>{t('programReports.logModal.addEntry')}</p>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 }}>
              {!item?.hideDateColumn && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 1 150px' }}
                >
                  <label className="label" style={{ fontSize: 11 }}>
                    {dateColumn.label}
                  </label>
                  <FieldInput
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
              )}
              {item?.scope === 'district' && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 1 150px' }}
                >
                  <label className="label" style={{ fontSize: 11 }}>
                    {item?.districtLabel ?? t('programReports.form.district')}
                  </label>
                  <FieldInput
                    list="program-report-districts"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <datalist id="program-report-districts">
                    {districtOptions.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              )}
              {ungroupedFields.map(renderFieldInput)}
            </div>

            {fieldGroups.map((group) => (
              <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ ...sectionLabelStyle, fontSize: 10 }}>{group.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 }}>
                  {group.fields.map(renderFieldInput)}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={12} />}
                onClick={handleAdd}
                disabled={!hasAnyValue}
              >
                {t('common.add')}
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={sectionLabelStyle}>{t('programReports.logModal.entries')}</p>
            {entries.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  padding: '1px 8px'
                }}
              >
                {entries.length}
              </span>
            )}
          </div>

          {entries.length === 0 ? (
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '16px 0'
              }}
            >
              {t('programReports.logModal.empty')}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        style={{
                          textAlign: c.type === 'number' ? 'right' : 'left',
                          padding: '6px 8px',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.label}
                      </th>
                    ))}
                    <th style={{ width: 32, borderBottom: '1px solid var(--border-subtle)' }} />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          style={{
                            padding: '6px 8px',
                            textAlign: c.type === 'number' ? 'right' : 'left'
                          }}
                        >
                          {c.key === '__date'
                            ? formatDate(entry.date)
                            : c.key === '__district'
                              ? entry.district || '—'
                              : (entry.values[c.key] ?? '')}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => lineItemId && deleteLogEntry(lineItemId, entry.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: 4
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
