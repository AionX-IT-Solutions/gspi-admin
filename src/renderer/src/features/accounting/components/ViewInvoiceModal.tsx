import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { statusBadgeVariant, invoiceStatusLabel } from './invoiceStatus'
import { useViewInvoiceModal } from '../hooks/useViewInvoiceModal'

interface ViewInvoiceModalProps {
  invoiceId: string | null
  onClose: () => void
}

export function ViewInvoiceModal({ invoiceId, onClose }: ViewInvoiceModalProps) {
  const { t } = useTranslation()
  const { invoice, confirmingMarkPaid, setConfirmingMarkPaid, handleConfirmMarkPaid } =
    useViewInvoiceModal(invoiceId)

  return (
    <>
      <Modal
        open={!!invoice}
        onOpenChange={(open) => !open && onClose()}
        title={invoice?.number}
        description={invoice?.customerName}
        size="lg"
        footer={
          invoice && invoice.status !== 'paid' ? (
            <>
              <Button variant="secondary" size="sm" onClick={onClose}>
                {t('common.close')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 size={13} />}
                onClick={() => setConfirmingMarkPaid(true)}
              >
                {t('invoices.markAsPaidButton')}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t('common.close')}
            </Button>
          )
        }
      >
        {invoice && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  {t('invoices.detail.issued')}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  {t('invoices.detail.due')}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  {t('invoices.table.status')}
                </p>
                <Badge variant={statusBadgeVariant[invoice.status]}>
                  {invoiceStatusLabel(t, invoice.status)}
                </Badge>
              </div>
            </div>

            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '6px 0',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      textTransform: 'uppercase'
                    }}
                  >
                    {t('invoices.detail.description')}
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '6px 0',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      textTransform: 'uppercase'
                    }}
                  >
                    {t('invoices.detail.qty')}
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '6px 0',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      textTransform: 'uppercase'
                    }}
                  >
                    {t('invoices.detail.rate')}
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '6px 0',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      textTransform: 'uppercase'
                    }}
                  >
                    {t('invoices.table.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((li) => (
                  <tr key={li.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>
                      {li.description}
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {li.qty}
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {formatCurrency(li.rate)}
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                      }}
                    >
                      {formatCurrency(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}
            >
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('invoices.detail.subtotal')}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    minWidth: 90,
                    textAlign: 'right'
                  }}
                >
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('invoices.detail.tax')}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    minWidth: 90,
                    textAlign: 'right'
                  }}
                >
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('invoices.detail.total')}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    minWidth: 90,
                    textAlign: 'right'
                  }}
                >
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--accent-primary)' }}>
                  {t('invoices.table.balanceDue')}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    minWidth: 90,
                    textAlign: 'right'
                  }}
                >
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmingMarkPaid}
        title={t('invoices.confirmMarkPaid.title')}
        message={t('invoices.confirmMarkPaid.message', {
          number: invoice?.number ?? '',
          amount: formatCurrency(invoice?.balanceDue ?? 0)
        })}
        confirmLabel={t('invoices.markAsPaidButton')}
        onConfirm={handleConfirmMarkPaid}
        onCancel={() => setConfirmingMarkPaid(false)}
      />
    </>
  )
}
