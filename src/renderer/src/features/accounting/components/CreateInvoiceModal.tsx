import { Plus, Trash2, Send } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
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
    customerId,
    setCustomerId,
    manualCustomerName,
    setManualCustomerName,
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,
    lines,
    addLine,
    removeLine,
    updateLine,
    subtotal,
    tax,
    total,
    handleSave,
    resetForm
  } = useCreateInvoiceModal(onOpenChange)

  const [customerSearch, setCustomerSearch] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers
    const search = customerSearch.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.company && c.company.toLowerCase().includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search))
    )
  }, [customers, customerSearch])

  const selectedCustomer = customers.find((c) => c.id === customerId)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          resetForm()
          setCustomerSearch('')
        }
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
          <Button variant="secondary" size="sm" onClick={() => handleSave('draft')}>
            {t('invoices.form.saveButton') || 'Save'}
          </Button>
        </>
      }
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 16 }}
      >
        <FormField label={t('invoices.table.customer')} required>
          <div style={{ position: 'relative' }}>
            {(selectedCustomer || manualCustomerName) && !customerSearch ? (
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
                    {selectedCustomer
                      ? (selectedCustomer.company ?? selectedCustomer.name)
                      : manualCustomerName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {selectedCustomer
                      ? selectedCustomer.name
                      : t('invoices.form.manualCustomerBadge')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerId('')
                    setManualCustomerName('')
                    setCustomerSearch('')
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
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={t('invoices.form.selectCustomer')}
                  autoComplete="off"
                />
                {customerSearch && (
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
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCustomerId(c.id)
                          setManualCustomerName('')
                          setCustomerSearch('')
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                          backgroundColor:
                            customerId === c.id ? 'var(--accent-primary-subtle)' : '#ffffff',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            customerId === c.id ? 'var(--accent-primary-subtle)' : '#f5f5f5'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            customerId === c.id ? 'var(--accent-primary-subtle)' : '#ffffff'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{c.company ?? c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {c.name}
                          {c.email && <span> • {c.email}</span>}
                        </div>
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: 13
                        }}
                      >
                        No customers found
                      </div>
                    )}
                    <div
                      onClick={() => {
                        setManualCustomerName(customerSearch.trim())
                        setCustomerId('')
                        setCustomerSearch('')
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                      }}
                    >
                      {t('invoices.form.useAsManualCustomer', { name: customerSearch.trim() })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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

      {lines.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: 8,
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            {t('invoices.form.descriptionPlaceholder') || 'Description'}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Qty
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Rate
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Amount
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            {' '}
          </span>
        </div>
      )}

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
            <FieldInput
              value={line.description}
              onChange={(e) => updateLine(line.id, { description: e.target.value })}
              placeholder={t('invoices.form.descriptionPlaceholder')}
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
