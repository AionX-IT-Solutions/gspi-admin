import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import type { ModeOfPayment, Voucher, VoucherType } from '../types/vouchers.types'
import { useNewVoucherModal } from '../hooks/useNewVoucherModal'

interface NewVoucherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: Voucher | null
}

export function NewVoucherModal({ open, onOpenChange, editTarget }: NewVoucherModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit, resetForm } = useNewVoucherModal(onOpenChange, editTarget)
  const allBanks = useBanksStore((s) => s.banks)
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])

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
            onChange={(e) => setForm((f) => ({ ...f, voucherType: e.target.value as VoucherType }))}
            options={[
              { value: 'check_voucher', label: t('vouchers.type.checkVoucher') },
              { value: 'journal_voucher', label: t('vouchers.type.journalVoucher') }
            ]}
          />
        </FormField>
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
        <FormField label={t('vouchers.form.payee')} required>
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
        <FormField label={t('vouchers.form.glAccount')} required>
          <FieldInput
            value={form.accountName}
            onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
            placeholder={t('vouchers.form.glAccountPlaceholder')}
          />
        </FormField>
        <FormField label={t('vouchers.form.amount')} required>
          <FieldInput
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          />
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
