import { motion } from 'framer-motion'
import { Check, Plus, Send, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Voucher, VoucherStatus, VoucherType } from '../types/vouchers.types'
import { NewVoucherModal } from '../components/NewVoucherModal'
import { useVouchers } from '../hooks/useVouchers'
import { useVouchersStore } from '../store/vouchers.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<VoucherStatus, 'warning' | 'primary' | 'success' | 'outline'> = {
  pending: 'warning',
  approved: 'primary',
  posted: 'success',
  cancelled: 'outline'
}

const TYPE_KEY: Record<VoucherType, string> = {
  check_voucher: 'checkVoucher',
  journal_voucher: 'journalVoucher'
}

export function Vouchers() {
  const { t } = useTranslation()
  const {
    loading,
    vouchers,
    showDialog,
    setShowDialog,
    advanceTarget,
    setAdvanceTarget,
    statusLabel,
    handleConfirmAdvance,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  } = useVouchers()
  const hydrate = useVouchersStore((s) => s.hydrate)

  const columns: Column<Voucher>[] = [
    { key: 'voucherNumber', header: t('vouchers.table.number') },
    {
      key: 'voucherType',
      header: t('vouchers.table.type'),
      render: (r) => t(`vouchers.type.${TYPE_KEY[r.voucherType]}`)
    },
    { key: 'payee', header: t('vouchers.table.payee') },
    { key: 'particulars', header: t('vouchers.table.particulars') },
    {
      key: 'amount',
      header: t('vouchers.table.amount'),
      align: 'right',
      render: (r) => formatCurrency(r.amount)
    },
    { key: 'date', header: t('vouchers.table.date'), render: (r) => formatDate(r.date) },
    {
      key: 'status',
      header: t('vouchers.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{statusLabel(r.status)}</Badge>
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <ExportMenu
            iconOnly
            title={t('vouchers.table.exportTooltip')}
            onExportExcel={() => handleExportExcel(r)}
            onExportPdf={() => handleExportPdf(r)}
            onExportWord={() => handleExportWord(r)}
          />
          {(r.status === 'pending' || r.status === 'approved') && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={r.status === 'pending' ? <Check size={12} /> : <Send size={12} />}
              onClick={() => setAdvanceTarget(r)}
            >
              {r.status === 'pending' ? t('vouchers.actions.approve') : t('vouchers.actions.post')}
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <motion.div
      key="vouchers"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('vouchers.title')}
        subtitle={t('vouchers.subtitle')}
        icon={<Ticket size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setShowDialog(true)}
            >
              {t('vouchers.newVoucherButton')}
            </Button>
          </>
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={vouchers}
          loading={loading}
          emptyMessage={t('vouchers.table.empty')}
        />
      </Card>

      <NewVoucherModal open={showDialog} onOpenChange={setShowDialog} />

      <ConfirmDialog
        open={!!advanceTarget}
        title={
          advanceTarget?.status === 'pending'
            ? t('vouchers.confirmApprove.title')
            : t('vouchers.confirmPost.title')
        }
        message={
          advanceTarget?.status === 'pending'
            ? t('vouchers.confirmApprove.message', { number: advanceTarget?.voucherNumber ?? '' })
            : t('vouchers.confirmPost.message', { number: advanceTarget?.voucherNumber ?? '' })
        }
        confirmLabel={
          advanceTarget?.status === 'pending'
            ? t('vouchers.actions.approve')
            : t('vouchers.actions.post')
        }
        onConfirm={handleConfirmAdvance}
        onCancel={() => setAdvanceTarget(null)}
      />
    </motion.div>
  )
}
