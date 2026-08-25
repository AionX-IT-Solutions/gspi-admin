import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app.store'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useToast } from '@/app/hooks/useToast'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'

export function useMembershipYearSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const setMembershipYearStartMonth = useOrgSettingsStore((s) => s.setMembershipYearStartMonth)
  const canEdit = useAppStore(
    (s) => s.currentUser?.role === 'super_admin' || s.currentUser?.role === 'admin'
  )

  const currentLabel = getMembershipYearLabel(startMonth)

  function handleChange(month: number) {
    setMembershipYearStartMonth(month)
    toast.success(t('settings.membershipYear.toast.saved'))
  }

  return { startMonth, currentLabel, canEdit, handleChange }
}
