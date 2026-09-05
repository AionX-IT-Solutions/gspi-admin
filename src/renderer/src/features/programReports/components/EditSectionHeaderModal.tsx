import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldTextArea } from '@/shared/components/ui/FormField'
import { useToast } from '@/app/hooks/useToast'
import {
  DEFAULT_SECTION_META,
  metaKey,
  useProgramReportSectionMetaStore
} from '../store/programReportSectionMeta.store'
import { PROGRAM_MONTHS, type ProgramReportSection } from '../types/programReports.types'

interface EditSectionHeaderModalProps {
  open: boolean
  section: ProgramReportSection
  year: string
  monthIndex: number
  onClose: () => void
}

export function EditSectionHeaderModal({
  open,
  section,
  year,
  monthIndex,
  onClose
}: EditSectionHeaderModalProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const metaOverride = useProgramReportSectionMetaStore(
    (s) => s.meta[metaKey(section, year, monthIndex)]
  )
  const meta = useMemo(
    () => ({ ...DEFAULT_SECTION_META[section], ...metaOverride }),
    [section, metaOverride]
  )
  const updateSectionMeta = useProgramReportSectionMetaStore((s) => s.updateSectionMeta)
  const [reportTitle, setReportTitle] = useState(meta.reportTitle)
  const [goalHeading, setGoalHeading] = useState(meta.goalHeading)

  useEffect(() => {
    if (!open) return
    setReportTitle(meta.reportTitle)
    setGoalHeading(meta.goalHeading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section, year, monthIndex])

  function handleSave() {
    if (!reportTitle.trim() || !goalHeading.trim()) return
    updateSectionMeta(section, year, monthIndex, {
      reportTitle: reportTitle.trim(),
      goalHeading: goalHeading.trim()
    })
    toast.success(t('programReports.toast.headerSaved'))
    onClose()
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={t('programReports.editHeader.title')}
      description={t('programReports.editHeader.subtitle', {
        month: PROGRAM_MONTHS[monthIndex],
        year
      })}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('programReports.editHeader.reportTitle')} required>
          <FieldInput value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
        </FormField>
        <FormField label={t('programReports.editHeader.goalHeading')} required>
          <FieldTextArea
            value={goalHeading}
            onChange={(e) => setGoalHeading(e.target.value)}
            rows={2}
          />
        </FormField>
      </div>
    </Modal>
  )
}
