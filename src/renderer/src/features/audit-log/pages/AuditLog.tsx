import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useAuditLogStore, type AuditLogEntry } from '@/app/store/auditLog.store'
import { formatDate } from '@/shared/lib/utils'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function AuditLog() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const entries = useAuditLogStore((s) => s.entries)
  const hydrate = useAuditLogStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: t('auditLog.table.when'),
      render: (r) =>
        `${formatDate(r.createdAt)} ${new Date(r.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`
    },
    { key: 'actorName', header: t('auditLog.table.actor') },
    {
      key: 'entityType',
      header: t('auditLog.table.entity'),
      render: (r) => (
        <span style={{ textTransform: 'capitalize' }}>{r.entityType.replace('_', ' ')}</span>
      )
    },
    {
      key: 'action',
      header: t('auditLog.table.action'),
      render: (r) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{r.action}</span>
      )
    },
    { key: 'summary', header: t('auditLog.table.summary') }
  ]

  return (
    <motion.div
      key="audit-log"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('auditLog.title')}
        subtitle={t('auditLog.subtitle', { count: entries.length })}
        icon={<ClipboardList size={18} />}
        actions={<RefreshButton onRefresh={() => hydrate(true)} />}
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={entries}
          loading={loading}
          emptyMessage={t('auditLog.emptyMessage')}
        />
      </Card>
    </motion.div>
  )
}
