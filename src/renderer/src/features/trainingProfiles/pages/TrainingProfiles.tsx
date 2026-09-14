import { motion } from 'framer-motion'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatDate } from '@/shared/lib/utils'
import type { TrainingProfile } from '../types/trainingProfiles.types'
import { TrainingProfileFormModal } from '../components/TrainingProfileFormModal'
import { TrainingProfileExportMenu } from '../components/TrainingProfileExportMenu'
import { TrainingProfilesExportMenu } from '../components/TrainingProfilesExportMenu'
import { useTrainingProfiles } from '../hooks/useTrainingProfiles'
import { useTrainingProfilesStore } from '../store/trainingProfiles.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function TrainingProfiles() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    profiles,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useTrainingProfiles()
  const hydrate = useTrainingProfilesStore((s) => s.hydrate)

  // Same order as the Council's own "Profile and Training Information Form" spreadsheet
  // (Name, School, District, Level, Contact Number, Email, Home Address, Position/Role,
  // Completed Training, Age-Level Specialization, Certificate Completed, Birthday, First
  // Registration Date, Total Years in Scouting) — the list table mirrors that column order.
  const columns: Column<TrainingProfile>[] = [
    { key: 'name', header: t('trainingProfiles.table.name') },
    { key: 'school', header: t('trainingProfiles.table.school') },
    { key: 'district', header: t('trainingProfiles.table.district') },
    {
      key: 'level',
      header: t('trainingProfiles.table.level'),
      render: (r) =>
        t(`trainingProfiles.level.${r.level === 'high_school' ? 'highSchool' : 'elementary'}`)
    },
    { key: 'contactNumber', header: t('trainingProfiles.table.contactNumber') },
    { key: 'email', header: t('trainingProfiles.table.email'), render: (r) => r.email || '—' },
    {
      key: 'homeAddress',
      header: t('trainingProfiles.table.homeAddress'),
      render: (r) => r.homeAddress || '—'
    },
    {
      key: 'roles',
      header: t('trainingProfiles.table.roles'),
      render: (r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {r.roles.map((role) => (
            <Badge key={role} variant="outline">
              {t(`trainingProfiles.role.${role}`)}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'completedTrainings',
      header: t('trainingProfiles.table.completedTrainings'),
      render: (r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {r.completedTrainings.map((training) => (
            <Badge key={training} variant="outline">
              {t(`trainingProfiles.training.${training}`)}
            </Badge>
          ))}
          {r.otherCompletedTraining && <Badge variant="outline">{r.otherCompletedTraining}</Badge>}
        </div>
      )
    },
    {
      key: 'ageLevelSpecialization',
      header: t('trainingProfiles.table.ageLevelSpecialization'),
      render: (r) =>
        r.ageLevelSpecialization ? t(`trainingProfiles.ageLevel.${r.ageLevelSpecialization}`) : '—'
    },
    {
      key: 'completedCertificates',
      header: t('trainingProfiles.table.completedCertificates'),
      render: (r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {r.completedCertificates.map((certificate) => (
            <Badge key={certificate} variant="outline">
              {t(`trainingProfiles.certificate.${certificate}`)}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'birthday',
      header: t('trainingProfiles.table.birthday'),
      render: (r) => formatDate(r.birthday)
    },
    {
      key: 'firstRegistrationDate',
      header: t('trainingProfiles.table.firstRegistrationDate'),
      render: (r) => r.firstRegistrationDate || '—'
    },
    {
      key: 'totalYearsInScouting',
      header: t('trainingProfiles.table.totalYearsInScouting'),
      render: (r) => r.totalYearsInScouting || '—'
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <TrainingProfileExportMenu profile={r} />
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="training-profiles"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('trainingProfiles.title')}
        subtitle={t('trainingProfiles.subtitle')}
        icon={<GraduationCap size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <TrainingProfilesExportMenu profiles={profiles} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('trainingProfiles.newButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('trainingProfiles.searchPlaceholder')}
        count={profiles.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={profiles}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('trainingProfiles.table.empty')}
        />
      </Card>

      <TrainingProfileFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('trainingProfiles.confirmDelete.title')}
        message={t('trainingProfiles.confirmDelete.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
