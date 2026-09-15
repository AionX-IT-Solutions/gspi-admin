import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Landmark, Pencil, Check, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/app/hooks/usePermissions'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { Button } from '@/shared/components/ui/Button'
import { useCouncilBoardOrgChart } from '@/features/councilBoard/hooks/useCouncilBoardOrgChart'
import { useCouncilBoardStore } from '@/features/councilBoard/store/councilBoard.store'
import { collectCouncilBoardDescendantIds } from '@/features/councilBoard/lib/councilBoardOrgChart'
import { CouncilBoardOrgChartNode } from '@/features/councilBoard/components/CouncilBoardOrgChartNode'
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

/** A drop zone that clears whoever is being dragged's reporting link — same "drag here to
 *  unassign" affordance used by both the Council Board and Employee trees below. */
function UnassignDropZone({ active, onDrop }: { active: boolean; onDrop: (id: string) => void }) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(false)
  if (!active) return null
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setHover(true)
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault()
        setHover(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDrop(id)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
        padding: '10px 14px',
        borderRadius: 10,
        background: hover ? 'var(--accent-primary-subtle)' : 'var(--glass-bg)',
        border: `1px dashed ${hover ? 'var(--accent-primary)' : 'var(--border-default)'}`,
        fontSize: 12,
        color: 'var(--text-muted)',
        transition: 'background 0.15s ease, border-color 0.15s ease'
      }}
    >
      <UserX size={13} />
      {t('orgChart.unassignDropZone')}
    </div>
  )
}

export function OrgChart() {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const canEditEmployees = hasPermission('manage:employees')
  const canEditBoard = hasPermission('manage:councilBoard')

  const { loading, tree, totalCount } = useOrgChart()
  const hydrate = useHRStore((s) => s.hydrate)
  const updateEmployee = useHRStore((s) => s.updateEmployee)

  const { tree: boardTree, totalCount: boardTotalCount } = useCouncilBoardOrgChart()
  const hydrateBoard = useCouncilBoardStore((s) => s.hydrate)
  const updateBoardMember = useCouncilBoardStore((s) => s.updateMember)

  const [editMode, setEditMode] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [boardDraggedId, setBoardDraggedId] = useState<string | null>(null)

  const invalidDropIds = draggedId ? collectDescendantIds(tree, draggedId) : undefined
  const invalidBoardDropIds = boardDraggedId
    ? collectCouncilBoardDescendantIds(boardTree, boardDraggedId)
    : undefined

  function handleReparent(employeeId: string, newManagerId: string | undefined) {
    updateEmployee(employeeId, { managerId: newManagerId })
    setDraggedId(null)
  }

  function handleBoardReparent(memberId: string, newReportsToId: string | undefined) {
    const member = useCouncilBoardStore.getState().members.find((m) => m.id === memberId)
    if (member) updateBoardMember(memberId, { ...member, reportsToId: newReportsToId })
    setBoardDraggedId(null)
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
            <RefreshButton
              onRefresh={async () => {
                await Promise.all([hydrate(true), hydrateBoard(true)])
              }}
            />
            {(canEditEmployees || canEditBoard) && (
              <Button
                variant={editMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setEditMode((v) => !v)
                  setDraggedId(null)
                  setBoardDraggedId(null)
                }}
                leftIcon={editMode ? <Check size={13} /> : <Pencil size={13} />}
              >
                {editMode ? t('orgChart.doneEditing') : t('orgChart.editLayout')}
              </Button>
            )}
          </>
        }
      />

      {editMode && (
        <div
          style={{
            marginBottom: 14,
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
      )}

      {/* Council Board sits above Employees — the council's governing body, then its staff. */}
      {boardTotalCount > 0 && (
        <Card
          padding="24px"
          loading={loading}
          style={{ marginBottom: 20 }}
          header={
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <Landmark size={15} /> {t('councilBoard.title')}
            </span>
          }
        >
          {!editMode && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
              {t('orgChart.boardSubtitle', { count: boardTotalCount })}
            </p>
          )}
          <AnimatePresence>
            {editMode && canEditBoard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <UnassignDropZone
                  active={!!boardDraggedId}
                  onDrop={(id) => handleBoardReparent(id, undefined)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', gap: 48, width: 'max-content', margin: '0 auto' }}>
              {boardTree.map((root) => (
                <CouncilBoardOrgChartNode
                  key={root.member.id}
                  node={root}
                  editMode={editMode && canEditBoard}
                  draggedId={boardDraggedId}
                  invalidDropIds={invalidBoardDropIds}
                  onDragStartNode={setBoardDraggedId}
                  onDragEndNode={() => setBoardDraggedId(null)}
                  onReparent={handleBoardReparent}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card
        padding="24px"
        loading={loading}
        style={{ minHeight: 320 }}
        header={
          boardTotalCount > 0 ? (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <Network size={15} /> {t('employees.title')}
            </span>
          ) : undefined
        }
      >
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
              {editMode && canEditEmployees && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <UnassignDropZone
                    active={!!draggedId}
                    onDrop={(id) => handleReparent(id, undefined)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: 48, width: 'max-content', margin: '0 auto' }}>
                {tree.map((root) => (
                  <OrgChartNode
                    key={root.employee.id}
                    node={root}
                    editMode={editMode && canEditEmployees}
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
