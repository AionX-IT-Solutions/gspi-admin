import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app.store'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useToast } from '@/app/hooks/useToast'

export function usePayrollSettingsSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const defaultCashGift = useOrgSettingsStore((s) => s.defaultCashGift)
  const setDefaultCashGift = useOrgSettingsStore((s) => s.setDefaultCashGift)
  const canEdit = useAppStore(
    (s) => s.currentUser?.role === 'super_admin' || s.currentUser?.role === 'admin'
  )

  function handleChange(amount: number) {
    setDefaultCashGift(amount)
    toast.success(t('settings.payroll.toast.saved'))
  }

  return { defaultCashGift, canEdit, handleChange }
}
