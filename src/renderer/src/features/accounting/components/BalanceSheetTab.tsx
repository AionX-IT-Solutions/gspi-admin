import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { ReportRow } from './ReportRow'
import { useBalanceSheetTab } from '../hooks/useBalanceSheetTab'

interface BalanceSheetTabProps {
  periodLabel: string
}

export function BalanceSheetTab({ periodLabel }: BalanceSheetTabProps) {
  const { t } = useTranslation()
  const { balanceSheet, handleExportExcel, handleExportPdf, handleExportWord } =
    useBalanceSheetTab(periodLabel)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <ExportMenu
          label={t('reports.balanceSheet.exportLabel')}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onExportWord={handleExportWord}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card
          header={
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('reports.balanceSheet.assets')}
            </h2>
          }
        >
          {balanceSheet.assets.map((a) => (
            <ReportRow key={a.id} label={a.name} value={a.balance} indent />
          ))}
          <ReportRow
            label={t('reports.balanceSheet.totalAssets')}
            value={balanceSheet.totalAssets}
            bold
          />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card
            header={
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('reports.balanceSheet.liabilities')}
              </h2>
            }
          >
            {balanceSheet.liabilities.map((a) => (
              <ReportRow key={a.id} label={a.name} value={a.balance} indent />
            ))}
            <ReportRow
              label={t('reports.balanceSheet.totalLiabilities')}
              value={balanceSheet.totalLiabilities}
              bold
            />
          </Card>

          <Card
            header={
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('reports.balanceSheet.equity')}
              </h2>
            }
          >
            {balanceSheet.equity.map((a) => (
              <ReportRow key={a.id} label={a.name} value={a.balance} indent />
            ))}
            <ReportRow
              label={t('reports.balanceSheet.totalLiabilitiesEquity')}
              value={balanceSheet.totalLiabilities + balanceSheet.totalEquity}
              bold
            />
          </Card>
        </div>
      </div>
    </>
  )
}
