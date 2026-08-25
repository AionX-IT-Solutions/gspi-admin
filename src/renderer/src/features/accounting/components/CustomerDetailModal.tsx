import { Mail, MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useCustomerDetailModal } from '../hooks/useCustomerDetailModal'

interface CustomerDetailModalProps {
  customerId: string | null
  onClose: () => void
}

export function CustomerDetailModal({ customerId, onClose }: CustomerDetailModalProps) {
  const { t } = useTranslation()
  const { customer, customerInvoices } = useCustomerDetailModal(customerId)

  return (
    <Modal
      open={!!customer}
      onOpenChange={(open) => !open && onClose()}
      title={customer?.name}
      description={customer?.company}
      size="lg"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      }
    >
      {customer && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}
            >
              <Mail size={13} /> {customer.email}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}
            >
              <Phone size={13} /> {customer.phone}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}
            >
              <MapPin size={13} /> {customer.address}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              marginBottom: 20
            }}
          >
            <Card padding="14px">
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}
              >
                {t('customers.fields.openBalance')}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(customer.balance)}
              </p>
            </Card>
            <Card padding="14px">
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}
              >
                {t('customers.detail.totalBilled')}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(customer.totalBilled)}
              </p>
            </Card>
          </div>

          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginBottom: 8
            }}
          >
            {t('customers.detail.invoices')}
          </p>
          {customerInvoices.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('customers.detail.noInvoices')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {customerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {inv.number}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                      {formatDate(inv.issueDate)}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(inv.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
