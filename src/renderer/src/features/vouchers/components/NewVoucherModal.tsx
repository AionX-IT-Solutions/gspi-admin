import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useBudgetStore } from '@/features/budget/store/budget.store'
import type { ModeOfPayment, Voucher, VoucherType } from '../types/vouchers.types'
import { useNewVoucherModal, type VoucherDirection } from '../hooks/useNewVoucherModal'

// Suggested Account Title options for a receipt (credit-direction Journal Voucher) — mirrors
// CashReceiptCategory (scrd/types/cashReceipts.types.ts), the categories
// CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE (budgetAutoActuals.ts) recognizes for a Council Budget
// income line. Free text is still allowed for anything outside this list.
const INCOME_ACCOUNT_SUGGESTIONS = [
  'Council Support Fund',
  'Troop Fees',
  'Barangay Committee',
  'Associate',
  'Career Woman',
  'Honorary Member',
  'Thinking Day Fund',
  'Training Fees',
  'Camping Fees',
  'Interest Income',
  'Other Operations'
]

interface NewVoucherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: Voucher | null
}

export function NewVoucherModal({ open, onOpenChange, editTarget }: NewVoucherModalProps) {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    totalAmount,
    addAccountLine,
    removeAccountLine,
    updateAccountLine,
    handleSubmit,
    resetForm
  } = useNewVoucherModal(onOpenChange, editTarget)
  const allBanks = useBanksStore((s) => s.banks)
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])

  const budgetCategories = useBudgetStore((s) => s.categories)
  // Council Budget's own expense line items are suggested as account titles — vouchers
  // also allow free text (e.g. "SSS Premium Payable"), since real disbursement
  // vouchers debit balance-sheet accounts the Budget doesn't track alongside expense
  // lines it does. Latest fiscal year only, same as the Budget page's own default.
  const latestFiscalYear = useMemo(
    () => [...new Set(budgetCategories.map((c) => c.fiscalYear))].sort().at(-1),
    [budgetCategories]
  )
  const expenseAccountSuggestions = useMemo(
    () =>
      budgetCategories
        .filter((c) => c.fiscalYear === latestFiscalYear && c.section === 'expense')
        .sort((a, b) => a.order - b.order)
        .map((c) => c.name),
    [budgetCategories, latestFiscalYear]
  )
  const isReceipt = form.voucherType === 'journal_voucher' && form.direction === 'credit'
  const accountSuggestions = isReceipt ? INCOME_ACCOUNT_SUGGESTIONS : expenseAccountSuggestions

  const allVendors = useAccountingStore((s) => s.vendors)
  const vendors = useMemo(() => allVendors.filter((v) => v.status === 'active'), [allVendors])
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) ?? null
  const filteredVendors = useMemo(() => {
    const search = form.payee.trim().toLowerCase()
    if (!search) return []
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.company && v.company.toLowerCase().includes(search)) ||
        v.email.toLowerCase().includes(search)
    )
  }, [vendors, form.payee])

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) {
          resetForm()
          setSelectedVendorId(null)
        }
      }}
      title={editTarget ? t('vouchers.editVoucherTitle') : t('vouchers.newVoucherButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('common.save') : t('vouchers.form.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('vouchers.form.voucherType')} required>
          <FieldSelect
            value={form.voucherType}
            onChange={(e) => {
              const voucherType = e.target.value as VoucherType
              setForm((f) => ({
                ...f,
                voucherType,
                // A Check Voucher is always a disbursement — drop back to 'debit' the moment
                // it's selected, so a stray 'credit' from a Journal Voucher doesn't linger.
                direction: voucherType === 'check_voucher' ? 'debit' : f.direction
              }))
            }}
            options={[
              { value: 'check_voucher', label: t('vouchers.type.checkVoucher') },
              { value: 'journal_voucher', label: t('vouchers.type.journalVoucher') }
            ]}
          />
        </FormField>
        {form.voucherType === 'journal_voucher' && (
          <FormField label={t('vouchers.form.direction')} required>
            <FieldSelect
              value={form.direction}
              onChange={(e) =>
                setForm((f) => ({ ...f, direction: e.target.value as VoucherDirection }))
              }
              options={[
                { value: 'debit', label: t('vouchers.form.directionDebit') },
                { value: 'credit', label: t('vouchers.form.directionCredit') }
              ]}
            />
          </FormField>
        )}
        <FormField label={t('vouchers.form.modeOfPayment')} required>
          <FieldSelect
            value={form.modeOfPayment}
            onChange={(e) =>
              setForm((f) => ({ ...f, modeOfPayment: e.target.value as ModeOfPayment }))
            }
            options={[
              { value: 'cash', label: t('vouchers.form.modeCash') },
              { value: 'check', label: t('vouchers.form.modeCheck') }
            ]}
          />
        </FormField>
        {form.modeOfPayment === 'check' && (
          <FormField label={t('vouchers.form.checkNumber')} className="col-span-2">
            <FieldInput
              value={form.checkNumber}
              onChange={(e) => setForm((f) => ({ ...f, checkNumber: e.target.value }))}
            />
          </FormField>
        )}
        <FormField label={isReceipt ? t('vouchers.form.payor') : t('vouchers.form.payee')} required>
          <div style={{ position: 'relative' }}>
            {selectedVendor ? (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--accent-primary-subtle)',
                  border: '1px solid var(--accent-primary)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 40
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedVendor.company ?? selectedVendor.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {selectedVendor.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendorId(null)
                    setForm((f) => ({ ...f, payee: '' }))
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: 16,
                    padding: 4
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <FieldInput
                  value={form.payee}
                  onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
                  placeholder={t('vouchers.form.payeePlaceholder')}
                  autoComplete="off"
                />
                {filteredVendors.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      maxHeight: 240,
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {filteredVendors.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVendorId(v.id)
                          setForm((f) => ({ ...f, payee: v.company ?? v.name }))
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                          backgroundColor: '#ffffff',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{v.company ?? v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {v.name}
                          {v.email && <span> • {v.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </FormField>
        <FormField label={t('vouchers.form.payeeAddress')}>
          <FieldInput
            value={form.payeeAddress}
            onChange={(e) => setForm((f) => ({ ...f, payeeAddress: e.target.value }))}
          />
        </FormField>
        <FormField label={t('vouchers.form.bankAccount')} className="col-span-2">
          <FieldSelect
            value={form.bankAccountRef}
            onChange={(e) => setForm((f) => ({ ...f, bankAccountRef: e.target.value }))}
            placeholder={t('vouchers.form.bankAccountPlaceholder')}
            options={banks.map((b) => ({ value: bankDisplayName(b), label: bankDisplayName(b) }))}
          />
        </FormField>
        <FormField
          label={
            isReceipt
              ? t('vouchers.form.accountLinesLabelCredit')
              : t('vouchers.form.accountLinesLabel')
          }
          required
          className="col-span-2"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.accountLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <AccountTitleField
                  value={line.account}
                  onChange={(value) => updateAccountLine(i, { account: value })}
                  suggestions={accountSuggestions}
                  placeholder={t('vouchers.form.accountPlaceholder')}
                />
                <FieldInput
                  type="number"
                  min={0}
                  value={line.amount || ''}
                  onChange={(e) =>
                    updateAccountLine(i, { amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  style={{ width: 130, textAlign: 'right' }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAccountLine(i)}
                  disabled={form.accountLines.length <= 1}
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
              onClick={addAccountLine}
              style={{ alignSelf: 'flex-start' }}
            >
              {t('vouchers.form.addAccountLine')}
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
              <span>{t('vouchers.form.totalAmount')}:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </FormField>
        <FormField label={t('vouchers.form.particulars')} className="col-span-2">
          <FieldTextArea
            value={form.particulars}
            onChange={(e) => setForm((f) => ({ ...f, particulars: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

interface AccountTitleFieldProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

// Free-text account title with a searchable, scrollable suggestion list — same visual
// language as the Payee vendor search above, since a native <datalist> renders as an
// unstyled, unbounded browser popup that clashes with the rest of the form.
function AccountTitleField({ value, onChange, suggestions, placeholder }: AccountTitleFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    const list = q ? suggestions.filter((s) => s.toLowerCase().includes(q)) : suggestions
    return list.slice(0, 50)
  }, [suggestions, value])

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <FieldInput
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            maxHeight: 220,
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
        >
          {filtered.map((name) => (
            <div
              key={name}
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                backgroundColor: '#ffffff',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
