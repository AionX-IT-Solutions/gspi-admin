import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { formatCurrency } from '@/shared/lib/utils'
import { BudgetSectionTable } from '../components/BudgetSectionTable'
import { EditBudgetCategoryModal } from '../components/EditBudgetCategoryModal'
import { useBudget } from '../hooks/useBudget'
import { useBudgetStore } from '../store/budget.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Budget() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    fiscalYear,
    setSelectedFiscalYear,
    availableFiscalYears,
    suggestedNextFiscalYear,
    handleCreateFiscalYear,
    incomeGroups,
    expenseGroups,
    incomeTotals,
    expenseTotals,
    netBudgeted,
    netActual,
    autoActualsByCategory,
    editingCategory,
    setEditingCategory,
    handleSaveCategory,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  } = useBudget()
  const hydrate = useBudgetStore((s) => s.hydrate)
  const autoActualCategoryIds = useMemo(
    () => new Set(autoActualsByCategory.keys()),
    [autoActualsByCategory]
  )
  const [newYearOpen, setNewYearOpen] = useState(false)
  const [newYearLabel, setNewYearLabel] = useState('')

  return (
    <motion.div
      key="budget"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('budget.title')}
        icon={<Wallet size={18} />}
        actions={
          <>
            {availableFiscalYears.length > 0 && (
              <FieldSelect
                value={fiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                options={availableFiscalYears.map((y) => ({ value: y, label: y }))}
                style={{ width: 140 }}
              />
            )}
            {canManage && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => {
                  setNewYearLabel(suggestedNextFiscalYear)
                  setNewYearOpen(true)
                }}
              >
                {t('budget.newFiscalYearButton')}
              </Button>
            )}
            <RefreshButton onRefresh={() => hydrate(true)} />
            <ExportMenu
              label={t('common.export')}
              onView={handleView}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
              disabled={loading}
            />
          </>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 20
            }}
          >
            <Card glow="emerald">
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {t('budget.summary.income')}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(incomeTotals.totalActual)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('budget.summary.ofBudgeted', {
                  amount: formatCurrency(incomeTotals.totalBudgeted)
                })}
              </p>
            </Card>
            <Card glow="rose">
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {t('budget.summary.expenses')}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(expenseTotals.totalActual)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('budget.summary.ofBudgeted', {
                  amount: formatCurrency(expenseTotals.totalBudgeted)
                })}
              </p>
            </Card>
            <Card glow="primary">
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {t('budget.summary.net')}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: netActual >= 0 ? '#34d399' : '#f87171'
                }}
              >
                {formatCurrency(netActual)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('budget.summary.ofBudgeted', { amount: formatCurrency(netBudgeted) })}
              </p>
            </Card>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Card
              header={
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('budget.incomeTitle')}
                </h2>
              }
            >
              <BudgetSectionTable
                section="income"
                groups={incomeGroups}
                canManage={canManage}
                onEdit={setEditingCategory}
                autoActualCategoryIds={autoActualCategoryIds}
              />
            </Card>
          </div>

          <Card
            header={
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('budget.expensesTitle')}
              </h2>
            }
          >
            <BudgetSectionTable
              section="expense"
              groups={expenseGroups}
              canManage={canManage}
              onEdit={setEditingCategory}
              autoActualCategoryIds={autoActualCategoryIds}
            />
          </Card>
        </>
      )}

      <EditBudgetCategoryModal
        category={editingCategory}
        autoMonthlyActuals={
          editingCategory ? autoActualsByCategory.get(editingCategory.id) : undefined
        }
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveCategory}
      />

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('budget.title')}
        onDownloadExcel={handleExportExcel}
        onDownloadPdf={handleExportPdf}
        onDownloadWord={handleExportWord}
      />

      <Modal
        open={newYearOpen}
        onOpenChange={setNewYearOpen}
        title={t('budget.newFiscalYearModal.title')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNewYearOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleCreateFiscalYear(newYearLabel)
                setNewYearOpen(false)
              }}
            >
              {t('budget.newFiscalYearModal.createButton')}
            </Button>
          </>
        }
      >
        <FormField label={t('budget.newFiscalYearModal.yearLabel')} required>
          <FieldInput
            value={newYearLabel}
            onChange={(e) => setNewYearLabel(e.target.value)}
            placeholder="2027-2028"
          />
        </FormField>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          {t('budget.newFiscalYearModal.hint', { year: fiscalYear })}
        </p>
      </Modal>
    </motion.div>
  )
}
