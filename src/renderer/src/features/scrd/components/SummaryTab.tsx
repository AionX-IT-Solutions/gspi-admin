import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { Button } from '@/shared/components/ui/Button'
import { FieldInput } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { AddBankModal } from './AddBankModal'
import {
  exportSCRDSummary,
  exportSCRDSummaryPdf,
  exportSCRDSummaryDocx,
  type BankAccountBalance
} from '../lib/scrdExcelExport'
import type { useScrdComputations } from '../hooks/useScrdComputations'

type ScrdComputations = ReturnType<typeof useScrdComputations>

export function SummaryTab(data: ScrdComputations) {
  const { t } = useTranslation()
  const toast = useToast()
  const [addBankOpen, setAddBankOpen] = useState(false)

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
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setAddBankOpen(true)}
            >
              {t('scrd.banks.addButton')}
            </Button>
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
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {bank.accountNumber ? `${bank.name} #${bank.accountNumber}` : bank.name}
              </span>
              <FieldInput
                type="number"
                value={bank.openingBalance}
                onChange={(e) => data.setOpeningBalance(bank.id, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </Card>

      <AddBankModal open={addBankOpen} onOpenChange={setAddBankOpen} onAdd={data.addBank} />

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
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {t('scrd.otherIncomeLabel')}
        </span>
        <FieldInput
          type="number"
          value={data.manualOtherIncome}
          onChange={(e) => data.setManualOtherIncome(parseFloat(e.target.value) || 0)}
          style={{ width: 160 }}
        />
        <div style={{ marginLeft: 'auto' }}>
          <ExportMenu
            label={t('scrd.exportSummaryLabel')}
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

      <Card
        header={
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {t('scrd.summary.accountedForAsFollows')}
          </span>
        }
        padding="0px"
      >
        <DataTable columns={columns} data={data.bankAccountBalances} />
      </Card>
    </>
  )
}
