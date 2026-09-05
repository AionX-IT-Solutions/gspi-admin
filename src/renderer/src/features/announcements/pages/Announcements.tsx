import { motion } from 'framer-motion'
import { Megaphone, Pin, Pencil, Trash2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import type { AnnouncementPriority } from '../types/announcements.types'
import { AnnouncementModal } from '../components/AnnouncementModal'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAnnouncementsStore } from '../store/announcements.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const PRIORITY_VARIANT: Record<AnnouncementPriority, 'outline' | 'warning' | 'danger'> = {
  normal: 'outline',
  important: 'warning',
  urgent: 'danger'
}

const PRIORITY_ACCENT: Record<AnnouncementPriority, string> = {
  normal: 'var(--accent-primary)',
  important: '#f59e0b',
  urgent: '#ef4444'
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso)
  )
}

export function Announcements() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    rows,
    showDialog,
    setShowDialog,
    form,
    setForm,
    editingId,
    openCreate,
    openEdit,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    togglePin
  } = useAnnouncements()
  const hydrate = useAnnouncementsStore((s) => s.hydrate)

  const PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
    normal: t('announcements.priority.normal'),
    important: t('announcements.priority.important'),
    urgent: t('announcements.priority.urgent')
  }

  return (
    <motion.div
      key="announcements"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('announcements.title')}
        icon={<Megaphone size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={openCreate}
              >
                {t('announcements.newButton')}
              </Button>
            )}
          </>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <Megaphone size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
            <p style={{ fontSize: 13 }}>{t('announcements.empty')}</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
            >
              <Card
                style={{ borderLeft: `3px solid ${PRIORITY_ACCENT[a.priority]}` }}
                glow={a.priority === 'urgent' ? 'rose' : a.pinned ? 'amber' : undefined}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                        flexWrap: 'wrap'
                      }}
                    >
                      {a.pinned && <Pin size={13} color="#f59e0b" fill="#f59e0b" />}
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {a.title}
                      </h3>
                      <Badge variant={PRIORITY_VARIANT[a.priority]}>
                        {PRIORITY_LABEL[a.priority]}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {a.message}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                      {t('announcements.postedBy', {
                        name: a.postedByName,
                        date: formatDateTime(a.createdAt)
                      })}
                    </p>
                  </div>
                  {canManage && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePin(a.id)}
                        title={
                          a.pinned ? t('announcements.unpinButton') : t('announcements.pinButton')
                        }
                        style={{ padding: 4 }}
                      >
                        <Pin size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(a)}
                        title={t('common.edit')}
                        style={{ padding: 4 }}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(a)}
                        title={t('common.delete')}
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnnouncementModal
        open={showDialog}
        onOpenChange={setShowDialog}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        editing={!!editingId}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('announcements.confirmDelete.title')}
        message={t('announcements.confirmDelete.message', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
