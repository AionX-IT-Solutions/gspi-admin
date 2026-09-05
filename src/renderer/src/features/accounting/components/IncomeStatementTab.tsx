import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { TrendChart } from '@/shared/components/ui/TrendChart'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { formatCurrency } from '@/shared/lib/utils'
import { ReportRow } from './ReportRow'
import { useIncomeStatementTab } from '../hooks/useIncomeStatementTab'

interface IncomeStatementTabProps {
  periodLabel: string
}

export function IncomeStatementTab({ periodLabel }: IncomeStatementTabProps) {
  const { t } = useTranslation()
  const {
    pnl,
    trendData,
    handleView,
    preview,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  } = useIncomeStatementTab(periodLabel)

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Card
          header={
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 2
                }}
              >
                {t('reports.pnl.chartTitle')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('reports.pnl.chartSubtitle')}
              </p>
            </div>
          }
        >
          <TrendChart
            data={trendData}
            xKey="month"
            series={[
              { key: 'income', name: t('reports.pnl.income'), color: '#10b981' },
              { key: 'expense', name: t('reports.pnl.expenses'), color: '#ef4444' }
            ]}
            valueFormatter={formatCurrency}
          />
        </Card>
      </div>

      <Card
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 2
                }}
              >
                {t('reports.pnl.cardTitle')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('reports.pnl.cardSubtitle')}
              </p>
            </div>
            <ExportMenu
              label={t('reports.pnl.exportLabel')}
              onView={handleView}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
            />
          </div>
        }
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: 4
          }}
        >
          {t('reports.pnl.income')}
        </p>
        {pnl.incomeRows.map(([account, amount]) => (
          <ReportRow key={account} label={account} value={amount} indent />
        ))}
        <ReportRow label={t('reports.pnl.totalIncome')} value={pnl.totalIncome} bold />

        <div style={{ height: 16 }} />

        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: 4
          }}
        >
          {t('reports.pnl.expenses')}
        </p>
        {pnl.expenseRows.map(([category, amount]) => (
          <ReportRow key={category} label={category} value={amount} indent />
        ))}
        <ReportRow label={t('reports.pnl.totalExpenses')} value={pnl.totalExpense} bold />

        <div style={{ height: 16 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 10,
            background: pnl.netIncome >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${pnl.netIncome >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('reports.pnl.netIncome')}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: pnl.netIncome >= 0 ? '#10b981' : '#ef4444'
            }}
          >
            {formatCurrency(pnl.netIncome)}
          </span>
        </div>
      </Card>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('reports.pnl.cardTitle')}
        onDownloadExcel={handleExportExcel}
        onDownloadPdf={handleExportPdf}
        onDownloadWord={handleExportWord}
      />
    </>
  )
}
