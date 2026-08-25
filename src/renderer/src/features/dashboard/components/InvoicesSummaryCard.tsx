import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCurrency } from '@/shared/lib/utils'

interface InvoicesSummaryCardProps {
  overdue: number
  notDueYet: number
  draft: number
}

export function InvoicesSummaryCard({ overdue, notDueYet, draft }: InvoicesSummaryCardProps) {
  const { t } = useTranslation()

  return (
    <div style={{ marginTop: 16 }}>
      <Card
        header={
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('dashboard.invoicesTitle')}
          </h2>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <Badge variant="danger" dot>
              {t('dashboard.overdueBadge')}
            </Badge>
            <p
              style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}
            >
              {formatCurrency(overdue)}
            </p>
          </div>
          <div>
            <Badge variant="warning" dot>
              {t('dashboard.notDueYetBadge')}
            </Badge>
            <p
              style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}
            >
              {formatCurrency(notDueYet)}
            </p>
          </div>
          <div>
            <Badge variant="default" dot>
              {t('common.draft')}
            </Badge>
            <p
              style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}
            >
              {draft}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
