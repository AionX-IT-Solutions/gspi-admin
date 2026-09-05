import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { useToast } from '@/app/hooks/useToast'
import type { Product, Purchase, Sale } from '../types/pos.types'
import { useProductReportsMenu } from '../hooks/useProductReportsMenu'

interface ProductReportsMenuProps {
  products: Product[]
  sales: Sale[]
  purchases: Purchase[]
  toast: ReturnType<typeof useToast>
}

export function ProductReportsMenu({ products, sales, purchases, toast }: ProductReportsMenuProps) {
  const { t } = useTranslation()
  const {
    periodType,
    setPeriodType,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    exportSalesReport,
    exportInventoryReport,
    exportIncomeStatement,
    viewSalesReport,
    viewInventoryReport,
    viewIncomeStatement,
    preview,
    previewTitle,
    downloadPreviewed
  } = useProductReportsMenu({ products, sales, purchases, toast })

  return (
    <>
      <ExportMenu
        label={t('products.export.salesReport')}
        onView={viewSalesReport}
        onExportExcel={() => exportSalesReport('excel')}
        onExportPdf={() => exportSalesReport('pdf')}
        onExportWord={() => exportSalesReport('word')}
      />
      <ExportMenu
        label={t('products.export.inventoryReport')}
        onView={viewInventoryReport}
        onExportExcel={() => exportInventoryReport('excel')}
        onExportPdf={() => exportInventoryReport('pdf')}
        onExportWord={() => exportInventoryReport('word')}
      />
      <FieldSelect
        value={periodType}
        onChange={(e) =>
          setPeriodType(
            e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom'
          )
        }
        options={[
          { value: 'daily', label: t('products.period.daily') },
          { value: 'weekly', label: t('products.period.weekly') },
          { value: 'monthly', label: t('products.period.monthly') },
          { value: 'quarterly', label: t('products.period.quarterly') },
          { value: 'annually', label: t('products.period.annually') },
          { value: 'custom', label: t('products.period.custom') }
        ]}
        style={{ width: 130 }}
      />
      {periodType === 'custom' && (
        <>
          <FieldInput
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            style={{ width: 150 }}
          />
          <span style={{ fontSize: 12, color: 'var(--c-text-3)' }}>{t('products.period.to')}</span>
          <FieldInput
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={{ width: 150 }}
          />
        </>
      )}
      <ExportMenu
        label={t('products.export.incomeStatement')}
        onView={viewIncomeStatement}
        onExportExcel={() => exportIncomeStatement('excel')}
        onExportPdf={() => exportIncomeStatement('pdf')}
        onExportWord={() => exportIncomeStatement('word')}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={previewTitle}
        onDownloadExcel={() => downloadPreviewed('excel')}
        onDownloadPdf={() => downloadPreviewed('pdf')}
        onDownloadWord={() => downloadPreviewed('word')}
      />
    </>
  )
}
