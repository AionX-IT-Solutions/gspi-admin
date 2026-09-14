import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FieldInput } from '@/shared/components/ui/FormField'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { formatCurrency } from '@/shared/lib/utils'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import { expenseSummaryTotal, type ExpenseSummaryItem } from '../types/expenseSummary.types'

interface ExpenseSummaryModalProps {
  voucher: Voucher | null
  items: ExpenseSummaryItem[]
  canManage: boolean
  onClose: () => void
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<ExpenseSummaryItem>) => void
  onSave: () => void
  onView: () => void
  onExportExcel: () => void
  onExportPdf: () => void
  onExportWord: () => void
}

export function ExpenseSummaryModal({
  voucher,
  items,
  canManage,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onView,
  onExportExcel,
  onExportPdf,
  onExportWord
}: ExpenseSummaryModalProps) {
  const { t } = useTranslation()
  const total = expenseSummaryTotal(items)

  return (
    <Modal
      open={!!voucher}
      onOpenChange={(o) => !o && onClose()}
      title={t('expenseSummary.title')}
      description={voucher ? t('expenseSummary.subtitle', { number: voucher.voucherNumber }) : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <ExportMenu
            label={t('expenseSummary.exportButton')}
            title={t('expenseSummary.exportTooltip')}
            onView={onView}
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            onExportWord={onExportWord}
          />
          {canManage && (
            <Button variant="primary" size="sm" onClick={onSave}>
              {t('common.save')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '0 40px 0 0',
            fontSize: 10.5,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: 130, flexShrink: 0 }}>{t('expenseSummary.field.date')}</span>
          <span style={{ flex: 1 }}>{t('expenseSummary.field.particulars')}</span>
          <span style={{ width: 120, flexShrink: 0 }}>{t('expenseSummary.field.orNumber')}</span>
          <span style={{ width: 150, flexShrink: 0 }}>{t('expenseSummary.field.category')}</span>
          <span style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>
            {t('expenseSummary.field.amount')}
          </span>
        </div>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FieldInput
              type="date"
              value={item.date}
              onChange={(e) => onUpdate(item.id, { date: e.target.value })}
              style={{ width: 130, flexShrink: 0 }}
            />
            <FieldInput
              value={item.particulars}
              onChange={(e) => onUpdate(item.id, { particulars: e.target.value })}
              placeholder={t('expenseSummary.field.particularsPlaceholder')}
              style={{ flex: 1 }}
            />
            <FieldInput
              value={item.orNumber}
              onChange={(e) => onUpdate(item.id, { orNumber: e.target.value })}
              style={{ width: 120, flexShrink: 0 }}
            />
            <FieldInput
              value={item.category}
              onChange={(e) => onUpdate(item.id, { category: e.target.value })}
              placeholder={t('expenseSummary.field.categoryPlaceholder')}
              style={{ width: 150, flexShrink: 0 }}
            />
            <FieldInput
              type="number"
              min={0}
              value={item.amount || ''}
              onChange={(e) => onUpdate(item.id, { amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              style={{ width: 110, flexShrink: 0, textAlign: 'right' }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              disabled={items.length <= 1}
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
          onClick={onAdd}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('expenseSummary.addItem')}
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            paddingTop: 8,
            marginTop: 2,
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
        >
          <span>{t('expenseSummary.total')}:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  )
}
