import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { Button } from '@/shared/components/ui/Button'
import { FieldInput } from '@/shared/components/ui/FormField'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatCurrency } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { AddBankModal } from './AddBankModal'
import {
  exportSCRDSummary,
  exportSCRDSummaryPdf,
  exportSCRDSummaryDocx,
  buildSCRDSummaryPdfDoc,
  type BankAccountBalance
} from '../lib/scrdExcelExport'
import { bankDisplayName } from '../store/banks.store'
import type { Bank } from '../types/bank.types'
import type { useScrdComputations } from '../hooks/useScrdComputations'

type ScrdComputations = ReturnType<typeof useScrdComputations>

export function SummaryTab(data: ScrdComputations) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:scrd')
  const [addBankOpen, setAddBankOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Bank | null>(null)
  const preview = useDocumentPreview()

  function handleConfirmDeleteBank() {
    if (!deleteTarget) return
    const deleted = deleteTarget
    data.deleteBank(deleted.id)
    toast.success(t('scrd.banks.toast.deleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => data.restoreBank(deleted) }
    })
    setDeleteTarget(null)
  }

  const columns: Column<BankAccountBalance>[] = [
    { key: 'account', header: t('scrd.summary.account') },
    {
      key: 'opening',
      header: t('scrd.summary.opening'),
      align: 'right',
      render: (r) => formatCurrency(r.opening)
    },
    {
      key: 'receipts',
      header: t('scrd.summary.totalReceipts'),
      align: 'right',
      render: (r) => formatCurrency(r.receipts)
    },
    {
      key: 'disbursements',
      header: t('scrd.summary.totalDisbursements'),
      align: 'right',
      render: (r) => formatCurrency(r.disbursements)
    },
    {
      key: 'closing',
      header: t('scrd.summary.closing'),
      align: 'right',
      render: (r) => <b>{formatCurrency(r.closing)}</b>
    }
  ]

  function summaryParams() {
    return {
      monthLabel: data.monthLabel,
      beginningBalance: data.beginningBalance,
      generalReceiptCategories: data.generalReceiptCategories,
      nesSalesTotal: data.nesSalesTotal,
      rentalIncomeTotal: data.rentalIncomeTotal,
      interestIncome: data.interestIncome,
      otherIncomeCategories: data.otherIncomeCategories,
      generalDisbursementCategories: data.generalDisbursementCategories,
      nesPurchasesTotal: data.nesPurchasesTotal,
      capitalOutlayCategories: data.capitalOutlayCategories,
      otherExpenseCategories: data.otherExpenseCategories,
      bankAccountBalances: data.bankAccountBalances
    }
  }

  return (
    <>
      <Card
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>{t('scrd.openingBalancesTitle')}</span>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setAddBankOpen(true)}
              >
                {t('scrd.banks.addButton')}
              </Button>
            )}
          </div>
        }
        style={{ marginBottom: 14 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}
        >
          {data.banks.map((bank) => (
            <div key={bank.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {bankDisplayName(bank)}
                </span>
                {canManage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(bank)}
                    title={t('common.delete')}
                    style={{ padding: 4 }}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
              <FieldInput
                type="number"
                value={bank.openingBalance}
                onChange={(e) => data.setOpeningBalance(bank.id, parseFloat(e.target.value) || 0)}
                disabled={!canManage}
              />
            </div>
          ))}
        </div>
      </Card>

      <AddBankModal open={addBankOpen} onOpenChange={setAddBankOpen} onAdd={data.addBank} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('scrd.banks.confirmDelete.title')}
        message={t('scrd.banks.confirmDelete.message', {
          name: deleteTarget ? bankDisplayName(deleteTarget) : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteBank}
        onCancel={() => setDeleteTarget(null)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {t('scrd.interestIncomeLabel')}
        </span>
        <FieldInput
          type="number"
          value={data.manualInterestIncome}
          onChange={(e) => data.setManualInterestIncome(parseFloat(e.target.value) || 0)}
          style={{ width: 160 }}
          disabled={!canManage}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {t('scrd.otherIncomeLabel')}
        </span>
        <FieldInput
          type="number"
          value={data.manualOtherIncome}
          onChange={(e) => data.setManualOtherIncome(parseFloat(e.target.value) || 0)}
          style={{ width: 160 }}
          disabled={!canManage}
        />
        <div style={{ marginLeft: 'auto' }}>
          <ExportMenu
            label={t('scrd.exportSummaryLabel')}
            onView={async () => preview.openPreview(await buildSCRDSummaryPdfDoc(summaryParams()))}
            onExportExcel={() => {
              exportSCRDSummary(summaryParams())
              toast.success(t('scrd.toast.summaryExcel'))
            }}
            onExportPdf={() => {
              exportSCRDSummaryPdf(summaryParams())
              toast.success(t('scrd.toast.summaryPdf'))
            }}
            onExportWord={() => {
              exportSCRDSummaryDocx(summaryParams())
              toast.success(t('scrd.toast.summaryWord'))
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16
        }}
      >
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('scrd.summary.beginningBalance')}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(data.beginningBalance)}</p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('scrd.summary.totalReceipts')}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#34d399' }}>
            {formatCurrency(data.receiptTotal)}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('scrd.summary.totalDisbursements')}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f87171' }}>
            {formatCurrency(data.disbursementTotal)}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {t('scrd.summary.endingBalance')}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(data.endingBalance)}</p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card
          header={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {t('scrd.summary.receiptsByCategory')}
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}
              >
                {t('scrd.summary.generalOperations')}
              </p>
              {data.generalReceiptCategories.map((c) => (
                <div
                  key={c.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingLeft: 8
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  <span>{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('scrd.summary.nesSales')}</span>
              <span>{formatCurrency(data.nesSalesTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('scrd.summary.rentalIncome')}
              </span>
              <span>{formatCurrency(data.rentalIncomeTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('scrd.summary.interestIncome')}
              </span>
              <span>{formatCurrency(data.interestIncome)}</span>
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}
              >
                {t('scrd.summary.otherIncome')}
              </p>
              {data.otherIncomeCategories.length === 0 && (
                <div style={{ fontSize: 13, paddingLeft: 8, color: 'var(--text-muted)' }}>
                  {formatCurrency(0)}
                </div>
              )}
              {data.otherIncomeCategories.map((c) => (
                <div
                  key={c.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingLeft: 8
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  <span>{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card
          header={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {t('scrd.summary.disbursementsByCategory')}
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}
              >
                {t('scrd.summary.operatingExpenses')}
              </p>
              {data.generalDisbursementCategories.map((c) => (
                <div
                  key={c.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingLeft: 8
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  <span>{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('scrd.summary.nesPurchases')}
              </span>
              <span>{formatCurrency(data.nesPurchasesTotal)}</span>
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}
              >
                {t('scrd.summary.capitalOutlay')}
              </p>
              {data.capitalOutlayCategories.length === 0 && (
                <div style={{ fontSize: 13, paddingLeft: 8, color: 'var(--text-muted)' }}>
                  {formatCurrency(0)}
                </div>
              )}
              {data.capitalOutlayCategories.map((c) => (
                <div
                  key={c.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingLeft: 8
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  <span>{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}
              >
                {t('scrd.summary.otherExpenses')}
              </p>
              {data.otherExpenseCategories.length === 0 && (
                <div style={{ fontSize: 13, paddingLeft: 8, color: 'var(--text-muted)' }}>
                  {formatCurrency(0)}
                </div>
              )}
              {data.otherExpenseCategories.map((c) => (
                <div
                  key={c.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingLeft: 8
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  <span>{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          {t('scrd.summary.accountedForAsFollows')}
        </span>
      </div>
      <Card padding="0px">
        <DataTable columns={columns} data={data.bankAccountBalances} />
      </Card>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('scrd.exportSummaryLabel')}
        onDownloadExcel={() => {
          exportSCRDSummary(summaryParams())
          toast.success(t('scrd.toast.summaryExcel'))
        }}
        onDownloadPdf={() => {
          exportSCRDSummaryPdf(summaryParams())
          toast.success(t('scrd.toast.summaryPdf'))
        }}
        onDownloadWord={() => {
          exportSCRDSummaryDocx(summaryParams())
          toast.success(t('scrd.toast.summaryWord'))
        }}
      />
    </>
  )
}
