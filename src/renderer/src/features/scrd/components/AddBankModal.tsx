import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useToast } from '@/app/hooks/useToast'

interface AddBankModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (input: { name: string; accountNumber?: string; openingBalance: number }) => void
}

export function AddBankModal({ open, onOpenChange, onAdd }: AddBankModalProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [openingBalance, setOpeningBalance] = useState(0)

  function reset() {
    setName('')
    setAccountNumber('')
    setOpeningBalance(0)
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error(t('scrd.banks.toast.nameRequired'))
      return
    }
    onAdd({ name: name.trim(), accountNumber: accountNumber.trim() || undefined, openingBalance })
    toast.success(t('scrd.banks.toast.added'))
    reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) reset()
      }}
      title={t('scrd.banks.addTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('common.add')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('scrd.banks.name')} required>
          <FieldInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('scrd.banks.namePlaceholder')}
          />
        </FormField>
        <FormField label={t('scrd.banks.accountNumber')}>
          <FieldInput
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={t('scrd.banks.accountNumberPlaceholder')}
          />
        </FormField>
        <FormField label={t('scrd.banks.openingBalance')}>
          <FieldInput
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
