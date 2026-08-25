import { useTranslation } from 'react-i18next'
import { TrendChart } from '@/shared/components/ui/TrendChart'
import { formatCurrency } from '@/shared/lib/utils'
import type { Invoice } from '@/features/accounting/types/accounting.types'
import { useCashFlowChart } from '../hooks/useCashFlowChart'

export function CashFlowChart({ invoices }: { invoices: Invoice[] }) {
  const { t } = useTranslation()
  const buckets = useCashFlowChart(invoices)

  return (
    <TrendChart
      data={buckets}
      xKey="period"
      series={[
        { key: 'amount', name: t('dashboard.invoicedSeriesName'), color: 'var(--accent-primary)' }
      ]}
      valueFormatter={formatCurrency}
    />
  )
}
