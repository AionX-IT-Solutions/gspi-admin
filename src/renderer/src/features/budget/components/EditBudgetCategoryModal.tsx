import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { BUDGET_MONTH_LABELS, type BudgetCategory } from '../types/budget.types'

interface EditBudgetCategoryModalProps {
  category: BudgetCategory | null
  /** This category's live-computed actuals (Jul-Jun), if it has a recognized POS/
   *  Rentals/Vouchers/Payroll source — offered per month as a one-click fill, never
   *  applied automatically so the council-approved figure always stays a deliberate edit. */
  autoMonthlyActuals?: number[]
  onClose: () => void
  onSave: (id: string, edit: { budgetedAmount: number; monthlyActuals: number[] }) => void
}

export function EditBudgetCategoryModal({
  category,
  autoMonthlyActuals,
  onClose,
  onSave
}: EditBudgetCategoryModalProps) {
  const { t } = useTranslation()
  const [budgetedAmount, setBudgetedAmount] = useState('0')
  const [monthlyActuals, setMonthlyActuals] = useState<number[]>(Array(12).fill(0))

  useEffect(() => {
    if (!category) return
    setBudgetedAmount(String(category.budgetedAmount))
    setMonthlyActuals(category.monthlyActuals)
  }, [category])

  const totalActual = monthlyActuals.reduce((s, v) => s + v, 0)

  function handleSave() {
    if (!category) return
    const amount = parseFloat(budgetedAmount)
    onSave(category.id, {
      budgetedAmount: Number.isNaN(amount) ? 0 : amount,
      monthlyActuals
    })
  }

  return (
    <Modal
      open={!!category}
      onOpenChange={(open) => !open && onClose()}
      title={category?.name}
      description={t('budget.editModal.subtitle')}
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
          <FormField label={t('budget.editModal.budgetedAmount')}>
            <FieldInput
              type="number"
              min={0}
              step="0.01"
              value={budgetedAmount}
              onChange={(e) => setBudgetedAmount(e.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}
          >
            <p className="label" style={{ marginBottom: 0 }}>
              {t('budget.editModal.monthlyActuals')}
            </p>
            {autoMonthlyActuals?.some((v) => v > 0) && (
              <button
                type="button"
                onClick={() => setMonthlyActuals(autoMonthlyActuals)}
                style={{
                  fontSize: 11,
                  color: 'var(--accent-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {t('budget.editModal.useAllLiveData')}
              </button>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 8
            }}
          >
            {BUDGET_MONTH_LABELS.map((label, i) => {
              const autoValue = autoMonthlyActuals?.[i] ?? 0
              const showHint = autoValue > 0 && autoValue !== monthlyActuals[i]
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                    {label}
                  </span>
                  <FieldInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={monthlyActuals[i]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      setMonthlyActuals((arr) =>
                        arr.map((x, idx) => (idx === i ? (Number.isNaN(v) ? 0 : v) : x))
                      )
                    }}
                    style={{ textAlign: 'center', padding: '5px 4px', fontSize: 12.5 }}
                  />
                  {showHint && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonthlyActuals((arr) => arr.map((x, idx) => (idx === i ? autoValue : x)))
                      }
                      title={t('budget.editModal.liveDataHint')}
                      style={{
                        fontSize: 9.5,
                        color: 'var(--accent-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'center'
                      }}
                    >
                      {formatCurrency(autoValue)}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 10
          }}
        >
          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            {t('budget.editModal.totalActual')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(totalActual)}
          </span>
        </div>
      </div>
    </Modal>
  )
}
