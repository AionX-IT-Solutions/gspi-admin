import { Plus, Send, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { useCreateInvoiceModal } from '../hooks/useCreateInvoiceModal'

interface CreateInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInvoiceModal({ open, onOpenChange }: CreateInvoiceModalProps) {
  const { t } = useTranslation()
  const {
    customers,
    items,
    customerId,
    setCustomerId,
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,
    lines,
    addLine,
    removeLine,
    updateLine,
    applyItem,
    subtotal,
    tax,
    total,
    handleSave,
    resetForm
  } = useCreateInvoiceModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetForm()
      }}
      title={t('invoices.newInvoiceButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => handleSave('draft')}>
            {t('invoices.form.saveAsDraft')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send size={13} />}
            onClick={() => handleSave('sent')}
          >
            {t('invoices.form.saveAndSend')}
          </Button>
        </>
      }
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 16 }}
      >
        <FormField label={t('invoices.table.customer')} required>
          <FieldSelect
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder={t('invoices.form.selectCustomer')}
            options={customers.map((c) => ({ value: c.id, label: c.company ?? c.name }))}
          />
        </FormField>
        <FormField label={t('invoices.table.issueDate')} required>
          <FieldInput
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </FormField>
        <FormField label={t('invoices.table.dueDate')} required>
          <FieldInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>
      </div>

      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span className="label" style={{ marginBottom: 0 }}>
          {t('invoices.form.lineItems')}
        </span>
        <Button variant="ghost" size="sm" leftIcon={<Plus size={12} />} onClick={addLine}>
          {t('invoices.form.addLine')}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: 8,
              alignItems: 'center'
            }}
          >
            <FieldSelect
              value={items.find((it) => it.name === line.description)?.id ?? ''}
              onChange={(e) => applyItem(line.id, e.target.value)}
              placeholder={t('invoices.form.selectItem')}
              options={items.map((it) => ({ value: it.id, label: it.name }))}
            />
            <FieldInput
              type="number"
              min={1}
              value={line.qty}
              onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) || 0 })}
            />
            <FieldInput
              type="number"
              min={0}
              value={line.rate}
              onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) || 0 })}
            />
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
              {formatCurrency(line.amount)}
            </div>
            <button
              onClick={() => removeLine(line.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-end',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 12
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('invoices.detail.subtotal')}
          </span>
          <span
            style={{ fontSize: 12, color: 'var(--text-primary)', minWidth: 90, textAlign: 'right' }}
          >
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('invoices.detail.tax')}
          </span>
          <span
            style={{ fontSize: 12, color: 'var(--text-primary)', minWidth: 90, textAlign: 'right' }}
          >
            {formatCurrency(tax)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('invoices.detail.total')}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-primary)',
              minWidth: 90,
              textAlign: 'right'
            }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </Modal>
  )
}
