import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useProgramReportsStore } from '../store/programReports.store'
import type { ProgramReportLineItem } from '../types/programReports.types'

interface EditLineItemModalProps {
  item: ProgramReportLineItem | null
  onClose: () => void
}

/** Only the code is editable here — the label is the item's official name (matching
 *  REPORTS.xls's own wording) and stays fixed, shown read-only just for context on
 *  which item this is. */
export function EditLineItemModal({ item, onClose }: EditLineItemModalProps) {
  const { t } = useTranslation()
  const updateLineItem = useProgramReportsStore((s) => s.updateLineItem)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!item) return
    setCode(item.code)
  }, [item])

  function handleSave() {
    if (!item) return
    updateLineItem(item.id, { code: code.trim() })
    onClose()
  }

  return (
    <Modal
      open={!!item}
      onOpenChange={(open) => !open && onClose()}
      title={t('programReports.editLineItem.title')}
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
        <FormField label={t('programReports.form.label')}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{item?.label}</p>
        </FormField>
        <FormField label={t('programReports.form.code')}>
          <FieldInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="1.b.16" />
        </FormField>
      </div>
    </Modal>
  )
}
