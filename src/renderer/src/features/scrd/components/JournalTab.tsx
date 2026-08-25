import { Card } from '@/shared/components/ui/Card'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { useTranslation } from 'react-i18next'
import type { JournalDisplayRow } from '../hooks/useScrdComputations'

interface JournalTabProps {
  rows: JournalDisplayRow[]
  loading: boolean
  emptyMessage: string
  onExportExcel: (rows: JournalDisplayRow[], monthLabel: string) => void
  onExportPdf: (rows: JournalDisplayRow[], monthLabel: string) => void
  onExportWord: (rows: JournalDisplayRow[], monthLabel: string) => void
  monthLabel: string
  toastKeys: { excel: string; pdf: string; word: string }
}

export function JournalTab({
  rows,
  loading,
  emptyMessage,
  onExportExcel,
  onExportPdf,
  onExportWord,
  monthLabel,
  toastKeys
}: JournalTabProps) {
  const { t } = useTranslation()
  const toast = useToast()

  const journalColumns: Column<JournalDisplayRow>[] = [
    { key: 'date', header: t('scrd.columns.date'), render: (r) => formatDate(r.date) },
    { key: 'name', header: t('scrd.columns.payorPayee') },
    { key: 'particulars', header: t('scrd.columns.particulars') },
    { key: 'reference', header: t('scrd.columns.reference'), render: (r) => r.reference ?? '—' },
    { key: 'category', header: t('scrd.columns.category') },
    { key: 'bankAccount', header: t('scrd.columns.bankAccount') },
    {
      key: 'amount',
      header: t('scrd.columns.amount'),
      align: 'right',
      render: (r) => formatCurrency(r.amount)
    }
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <ExportMenu
          label={t('scrd.exportJournalLabel')}
          onExportExcel={() => {
            onExportExcel(rows, monthLabel)
            toast.success(t(toastKeys.excel))
          }}
          onExportPdf={() => {
            onExportPdf(rows, monthLabel)
            toast.success(t(toastKeys.pdf))
          }}
          onExportWord={() => {
            onExportWord(rows, monthLabel)
            toast.success(t(toastKeys.word))
          }}
        />
      </div>
      <Card padding="0px">
        <DataTable
          columns={journalColumns}
          data={rows}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      </Card>
    </>
  )
}
