import { motion } from 'framer-motion'
import { Target, Plus, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency } from '@/shared/lib/utils'
import { PROGRAM_MONTHS, type GoalObjective } from '../types/goals.types'
import { GoalFormModal } from '../components/GoalFormModal'
import { ObjectiveFormModal } from '../components/ObjectiveFormModal'
import { GoalsExportMenu } from '../components/GoalsExportMenu'
import { useGoals } from '../hooks/useGoals'
import { useGoalsStore } from '../store/goals.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

type ObjectiveRow = GoalObjective & { id: string; goalId: string }

function progressColor(pct: number) {
  if (pct >= 100) return '#10b981'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}

export function Goals() {
  const { t } = useTranslation()
  const {
    canManage,
    programYear,
    goals,
    setMonthlyAchieved,
    monthIndex,
    setMonthIndex,
    activeGoalId,
    setActiveGoalId,
    activeGoal,
    goalDialog,
    setGoalDialog,
    deletingGoal,
    setDeletingGoal,
    objectiveDialog,
    setObjectiveDialog,
    deletingObjective,
    setDeletingObjective,
    achievedFor,
    handleConfirmDeleteGoal,
    handleConfirmDeleteObjective
  } = useGoals()
  const hydrate = useGoalsStore((s) => s.hydrate)

  const columns: Column<ObjectiveRow>[] = [
    { key: 'code', header: t('goals.table.code'), width: '80px' },
    { key: 'label', header: t('goals.table.objective') },
    {
      key: 'annualTarget',
      header: t('goals.table.annualTarget'),
      align: 'right',
      render: (o) =>
        o.unit === 'peso'
          ? formatCurrency(o.annualTarget)
          : o.unit === 'percent'
            ? `${o.annualTarget}%`
            : o.annualTarget.toLocaleString()
    },
    {
      key: 'monthlyAchieved',
      header: t('goals.table.thisMonth', { month: PROGRAM_MONTHS[monthIndex] }),
      align: 'right',
      sortable: false,
      render: (o) =>
        o.autoSource === 'nesSales' ? (
          <span style={{ color: 'var(--c-text-3)', fontSize: 12 }}>
            {t('goals.table.autoTracked')}
          </span>
        ) : (
          <FieldInput
            type="number"
            min={0}
            value={o.monthlyAchieved[monthIndex]}
            onChange={(e) => setMonthlyAchieved(o.id, monthIndex, parseFloat(e.target.value) || 0)}
            style={{ width: 110, textAlign: 'right' }}
          />
        )
    },
    {
      key: 'achievedToDate',
      header: t('goals.table.achievedToDate'),
      align: 'right',
      sortable: false,
      render: (o) => {
        const achieved = achievedFor(o)
        return o.unit === 'peso'
          ? formatCurrency(achieved)
          : o.unit === 'percent'
            ? `${achieved}%`
            : achieved.toLocaleString()
      }
    },
    {
      key: 'percentAchieved',
      header: t('goals.table.percentAchieved'),
      align: 'right',
      sortable: false,
      render: (o) => {
        const pct = o.annualTarget > 0 ? (achievedFor(o) / o.annualTarget) * 100 : 0
        return <span style={{ fontWeight: 700, color: progressColor(pct) }}>{pct.toFixed(1)}%</span>
      }
    }
  ]

  if (canManage) {
    columns.push({
      key: 'objectiveActions',
      header: t('common.actions'),
      align: 'right',
      sortable: false,
      render: (o) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setObjectiveDialog({ mode: 'edit', goalId: o.goalId, objectiveId: o.id })
            }
            style={{ width: 26, height: 26, padding: 0 }}
            aria-label={t('common.edit')}
          >
            <Pencil size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingObjective({ goalId: o.goalId, objective: o })}
            style={{ width: 26, height: 26, padding: 0 }}
            aria-label={t('common.delete')}
          >
            <Trash2 size={12} color="#f87171" />
          </Button>
        </div>
      )
    })
  }

  return (
    <motion.div
      key="goals"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('goals.title')}
        subtitle={t('goals.programYear', { year: programYear })}
        icon={<Target size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setGoalDialog({ mode: 'create' })}
              >
                {t('goals.newGoalButton')}
              </Button>
            )}
            <FieldSelect
              value={String(monthIndex)}
              onChange={(e) => setMonthIndex(Number(e.target.value))}
              options={PROGRAM_MONTHS.map((m, i) => ({ value: String(i), label: m }))}
              style={{ width: 100 }}
            />
            <GoalsExportMenu achievedFor={achievedFor} monthIndex={monthIndex} />
          </>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: 13 }}>
              {t('goals.noGoals')}
            </p>
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setGoalDialog({ mode: 'create' })}
              >
                {t('goals.newGoalButton')}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Tabs value={activeGoalId} onValueChange={setActiveGoalId}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 16
            }}
          >
            <TabsList>
              {goals.map((goal) => (
                <TabsTrigger key={goal.id} value={goal.id}>
                  {t('goals.goalLabel', { code: goal.code })}
                </TabsTrigger>
              ))}
            </TabsList>
            {canManage && activeGoal && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => setObjectiveDialog({ mode: 'create', goalId: activeGoal.id })}
                >
                  {t('goals.addObjectiveButton')}
                </Button>
                <div
                  style={{
                    width: 1,
                    height: 18,
                    background: 'var(--border-subtle)',
                    margin: '0 2px'
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Pencil size={13} />}
                  onClick={() => setGoalDialog({ mode: 'edit', goalId: activeGoal.id })}
                >
                  {t('goals.editGoalButton')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={13} />}
                  onClick={() => setDeletingGoal(activeGoal)}
                >
                  {t('goals.deleteGoalButton')}
                </Button>
              </div>
            )}
          </div>

          {goals.map((goal) => (
            <TabsContent key={goal.id} value={goal.id}>
              <Card padding="0px">
                <DataTable
                  columns={columns}
                  data={goal.objectives.map((o) => ({ ...o, id: o.id, goalId: goal.id }))}
                  emptyMessage={t('goals.empty')}
                />
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <GoalFormModal
        dialog={goalDialog}
        onClose={() => setGoalDialog(null)}
        onCreated={setActiveGoalId}
      />

      <ConfirmDialog
        open={!!deletingGoal}
        title={t('goals.confirmDeleteGoal.title')}
        message={t('goals.confirmDeleteGoal.message', { title: deletingGoal?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteGoal}
        onCancel={() => setDeletingGoal(null)}
      />

      <ObjectiveFormModal dialog={objectiveDialog} onClose={() => setObjectiveDialog(null)} />

      <ConfirmDialog
        open={!!deletingObjective}
        title={t('goals.confirmDeleteObjective.title')}
        message={t('goals.confirmDeleteObjective.message', {
          label: deletingObjective?.objective.label ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteObjective}
        onCancel={() => setDeletingObjective(null)}
      />
    </motion.div>
  )
}
