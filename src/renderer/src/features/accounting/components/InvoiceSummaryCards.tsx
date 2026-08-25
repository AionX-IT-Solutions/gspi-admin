import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCurrency } from '@/shared/lib/utils'

interface InvoiceSummaryCardsProps {
  overdue: number
  notDueYet: number
  paid: number
}

export function InvoiceSummaryCards({ overdue, notDueYet, paid }: InvoiceSummaryCardsProps) {
  const { t } = useTranslation()

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}
    >
      <Card>
        <Badge variant="danger" dot>
          {t('invoices.summary.overdue')}
        </Badge>
        <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
          {formatCurrency(overdue)}
        </p>
      </Card>
      <Card>
        <Badge variant="warning" dot>
          {t('invoices.summary.notDueYet')}
        </Badge>
        <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
          {formatCurrency(notDueYet)}
        </p>
      </Card>
      <Card>
        <Badge variant="success" dot>
          {t('invoices.summary.paid')}
        </Badge>
        <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
          {formatCurrency(paid)}
        </p>
      </Card>
    </div>
  )
}
