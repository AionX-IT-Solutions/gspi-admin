import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { SuggestInput } from '@/shared/components/ui/SuggestInput'
import type { BudgetSection } from '../types/budget.types'

export interface AddBudgetLineContext {
  section: BudgetSection
  group: string
  subGroup: string
}

interface AddBudgetCategoryModalProps {
  open: boolean
  /** Set when opened from a subgroup's own "+ Add Line" — section/group/subGroup are
   *  locked to that bucket. `null` when opened from the page-level button, where every
   *  field (including a brand-new group/subGroup) is editable. */
  context: AddBudgetLineContext | null
  groupsBySection: Record<BudgetSection, string[]>
  subGroupsByGroup: Map<string, string[]>
  onClose: () => void
  onSave: (input: AddBudgetLineContext & { name: string; budgetedAmount: number }) => void
}

export function AddBudgetCategoryModal({
  open,
  context,
  groupsBySection,
  subGroupsByGroup,
  onClose,
  onSave
}: AddBudgetCategoryModalProps) {
  const { t } = useTranslation()
  const locked = !!context
  const [section, setSection] = useState<BudgetSection>('income')
  const [group, setGroup] = useState('')
  const [subGroup, setSubGroup] = useState('')
  const [name, setName] = useState('')
  const [budgetedAmount, setBudgetedAmount] = useState('0')

  // Radix's controlled Dialog never fires onOpenChange for an externally-triggered open,
  // so this has to watch `open`/`context` directly to (re)seed the form each time.
  useEffect(() => {
    if (!open) return
    setSection(context?.section ?? 'income')
    setGroup(context?.group ?? '')
    setSubGroup(context?.subGroup ?? '')
    setName('')
    setBudgetedAmount('0')
  }, [open, context])

  function handleSave() {
    const amount = parseFloat(budgetedAmount)
    onSave({
      section,
      group: group.trim(),
      subGroup: subGroup.trim(),
      name: name.trim(),
      budgetedAmount: Number.isNaN(amount) ? 0 : amount
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={t('budget.addLineModal.title')}
      description={
        locked
          ? t('budget.addLineModal.lockedSubtitle', {
              group: context?.group,
              subGroup: context?.subGroup || t('budget.addLineModal.noSubGroup')
            })
          : t('budget.addLineModal.unlockedSubtitle')
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('budget.addLineModal.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {locked ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: 10,
              borderRadius: 8,
              background: 'var(--glass-bg)',
              fontSize: 12.5,
              color: 'var(--text-secondary)'
            }}
          >
            <span>
              <strong>{t('budget.addLineModal.section')}:</strong>{' '}
              {section === 'income' ? t('budget.incomeTitle') : t('budget.expensesTitle')}
            </span>
            <span>
              <strong>{t('budget.addLineModal.group')}:</strong> {group}
            </span>
            <span>
              <strong>{t('budget.addLineModal.subGroup')}:</strong>{' '}
              {subGroup || t('budget.addLineModal.noSubGroup')}
            </span>
          </div>
        ) : (
          <>
            <FormField label={t('budget.addLineModal.section')} required>
              <FieldSelect
                value={section}
                onChange={(e) => {
                  setSection(e.target.value as BudgetSection)
                  setGroup('')
                  setSubGroup('')
                }}
                options={[
                  { value: 'income', label: t('budget.incomeTitle') },
                  { value: 'expense', label: t('budget.expensesTitle') }
                ]}
              />
            </FormField>
            <FormField label={t('budget.addLineModal.group')} required>
              <SuggestInput
                value={group}
                onChange={setGroup}
                suggestions={groupsBySection[section]}
                placeholder={t('budget.addLineModal.groupPlaceholder')}
              />
            </FormField>
            <FormField label={t('budget.addLineModal.subGroup')}>
              <SuggestInput
                value={subGroup}
                onChange={setSubGroup}
                suggestions={subGroupsByGroup.get(group) ?? []}
                placeholder={t('budget.addLineModal.subGroupPlaceholder')}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {t('budget.addLineModal.subGroupHint')}
              </p>
            </FormField>
          </>
        )}
        <FormField label={t('budget.addLineModal.name')} required>
          <FieldInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('budget.addLineModal.namePlaceholder')}
          />
        </FormField>
        <FormField label={t('budget.addLineModal.budgetedAmount')} required>
          <FieldInput
            type="number"
            min={0}
            step="0.01"
            value={budgetedAmount}
            onChange={(e) => setBudgetedAmount(e.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
