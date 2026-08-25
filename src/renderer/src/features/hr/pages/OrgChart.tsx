import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Pencil, Check, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/app/hooks/usePermissions'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { Button } from '@/shared/components/ui/Button'
import { OrgChartNode } from '../components/OrgChartNode'
import { useOrgChart } from '../hooks/useOrgChart'
import { useHRStore } from '../store/hr.store'
import { collectDescendantIds } from '../lib/orgChart'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function OrgChart() {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('manage:employees')
  const { loading, tree, totalCount } = useOrgChart()
  const hydrate = useHRStore((s) => s.hydrate)
  const updateEmployee = useHRStore((s) => s.updateEmployee)

  const [editMode, setEditMode] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [unassignHover, setUnassignHover] = useState(false)

  const invalidDropIds = draggedId ? collectDescendantIds(tree, draggedId) : undefined

  function handleReparent(employeeId: string, newManagerId: string | undefined) {
    updateEmployee(employeeId, { managerId: newManagerId })
    setDraggedId(null)
  }

  return (
    <motion.div
      key="org-chart"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('orgChart.title')}
        icon={<Network size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canEdit && (
              <Button
                variant={editMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setEditMode((v) => !v)
                  setDraggedId(null)
                }}
                leftIcon={editMode ? <Check size={13} /> : <Pencil size={13} />}
              >
                {editMode ? t('orgChart.doneEditing') : t('orgChart.editLayout')}
              </Button>
            )}
          </>
        }
      />

      <Card padding="24px" loading={loading} style={{ minHeight: 320 }}>
        {tree.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('orgChart.empty')}</p>
        ) : (
          <>
            {!editMode && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
                {t('orgChart.subtitle', { count: totalCount })}
              </p>
            )}

            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      marginBottom: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--accent-primary-subtle)',
                      border: '1px dashed var(--accent-primary)',
                      fontSize: 12,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {t('orgChart.editHint')}
                  </div>
                  <div
                    onDragOver={(e) => {
                      if (!draggedId) return
                      e.preventDefault()
                      setUnassignHover(true)
                    }}
                    onDragLeave={() => setUnassignHover(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setUnassignHover(false)
                      const id = e.dataTransfer.getData('text/plain')
                      if (id) handleReparent(id, undefined)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: unassignHover
                        ? 'var(--accent-primary-subtle)'
                        : 'var(--glass-bg)',
                      border: `1px dashed ${unassignHover ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      transition: 'background 0.15s ease, border-color 0.15s ease'
                    }}
                  >
                    <UserX size={13} />
                    {t('orgChart.unassignDropZone')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: 48, width: 'max-content', margin: '0 auto' }}>
                {tree.map((root) => (
                  <OrgChartNode
                    key={root.employee.id}
                    node={root}
                    editMode={editMode}
                    draggedId={draggedId}
                    invalidDropIds={invalidDropIds}
                    onDragStartNode={setDraggedId}
                    onDragEndNode={() => setDraggedId(null)}
                    onReparent={handleReparent}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  )
}
