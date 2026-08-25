import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
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
    quarterEndedLabel,
    setQuarterEndedLabel,
    exportSalesReport,
    exportInventoryReport,
    exportIncomeStatement
  } = useProductReportsMenu({ products, sales, purchases, toast })

  return (
    <>
      <ExportMenu
        label={t('products.export.salesReport')}
        onExportExcel={() => exportSalesReport('excel')}
        onExportPdf={() => exportSalesReport('pdf')}
        onExportWord={() => exportSalesReport('word')}
      />
      <ExportMenu
        label={t('products.export.inventoryReport')}
        onExportExcel={() => exportInventoryReport('excel')}
        onExportPdf={() => exportInventoryReport('pdf')}
        onExportWord={() => exportInventoryReport('word')}
      />
      <FieldSelect
        value={periodType}
        onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'quarterly')}
        options={[
          { value: 'monthly', label: t('products.period.monthly') },
          { value: 'quarterly', label: t('products.period.quarterly') }
        ]}
        style={{ width: 130 }}
      />
      {periodType === 'quarterly' && (
        <FieldInput
          value={quarterEndedLabel}
          onChange={(e) => setQuarterEndedLabel(e.target.value)}
          placeholder={t('products.period.quarterEndedPlaceholder')}
          style={{ width: 190 }}
        />
      )}
      <ExportMenu
        label={t('products.export.incomeStatement')}
        onExportExcel={() => exportIncomeStatement('excel')}
        onExportPdf={() => exportIncomeStatement('pdf')}
        onExportWord={() => exportIncomeStatement('word')}
      />
    </>
  )
}
