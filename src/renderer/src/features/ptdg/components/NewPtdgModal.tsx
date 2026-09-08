import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { useNewPtdgModal } from '../hooks/useNewPtdgModal'
import type { PtdgApplication } from '../types/ptdg.types'

interface NewPtdgModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: PtdgApplication | null
}

export function NewPtdgModal({ open, onOpenChange, editTarget }: NewPtdgModalProps) {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    addSourceLine,
    removeSourceLine,
    updateSourceLine,
    addExpenseLine,
    removeExpenseLine,
    updateExpenseLine,
    sourcesSubtotal,
    expensesTotal,
    amountRequested,
    handleSave,
    resetForm
  } = useNewPtdgModal(onOpenChange, editTarget)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) resetForm()
      }}
      title={editTarget ? t('ptdg.editButton') : t('ptdg.newButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSave('draft')}>
            {t('ptdg.form.saveAsDraft')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleSave('submitted')}>
            {t('ptdg.form.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('ptdg.form.purpose')} required>
          <FieldInput
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            placeholder={t('ptdg.form.purposePlaceholder')}
          />
        </FormField>
        <FormField label={t('ptdg.form.eventDate')} required>
          <FieldInput
            value={form.eventDate}
            onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
            placeholder={t('ptdg.form.eventDatePlaceholder')}
          />
        </FormField>

        <FormField label={t('ptdg.form.projectedSources')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.projectedSources.map((line) => (
              <div key={line.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <FieldInput
                  value={line.particulars}
                  onChange={(e) => updateSourceLine(line.id, { particulars: e.target.value })}
                  placeholder={t('ptdg.form.particularsPlaceholder')}
                  style={{ flex: 1 }}
                />
                <FieldInput
                  type="number"
                  min={0}
                  value={line.amount || ''}
                  onChange={(e) =>
                    updateSourceLine(line.id, { amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  style={{ width: 130, textAlign: 'right' }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSourceLine(line.id)}
                  aria-label={t('common.delete')}
                  style={{ width: 30, height: 30, padding: 0, flexShrink: 0 }}
                >
                  <Trash2 size={13} color="#f87171" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={addSourceLine}
              style={{ alignSelf: 'flex-start' }}
            >
              {t('ptdg.form.addLine')}
            </Button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <span>{t('ptdg.form.subTotal')}:</span>
              <span>{formatCurrency(sourcesSubtotal)}</span>
            </div>
          </div>
        </FormField>

        <FormField label={t('ptdg.form.projectedExpenses')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.projectedExpenses.map((line) => (
              <div key={line.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <FieldInput
                  value={line.particulars}
                  onChange={(e) => updateExpenseLine(line.id, { particulars: e.target.value })}
                  placeholder={t('ptdg.form.particularsPlaceholder')}
                  style={{ flex: 1 }}
                />
                <FieldInput
                  type="number"
                  min={0}
                  value={line.amount || ''}
                  onChange={(e) =>
                    updateExpenseLine(line.id, { amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  style={{ width: 130, textAlign: 'right' }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpenseLine(line.id)}
                  aria-label={t('common.delete')}
                  style={{ width: 30, height: 30, padding: 0, flexShrink: 0 }}
                >
                  <Trash2 size={13} color="#f87171" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={addExpenseLine}
              style={{ alignSelf: 'flex-start' }}
            >
              {t('ptdg.form.addLine')}
            </Button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <span>{t('ptdg.form.total')}:</span>
              <span>{formatCurrency(expensesTotal)}</span>
            </div>
          </div>
        </FormField>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            paddingTop: 4,
            color: 'var(--accent-primary)'
          }}
        >
          <span>{t('ptdg.form.amountRequested')}:</span>
          <span>{formatCurrency(amountRequested)}</span>
        </div>
      </div>
    </Modal>
  )
}
