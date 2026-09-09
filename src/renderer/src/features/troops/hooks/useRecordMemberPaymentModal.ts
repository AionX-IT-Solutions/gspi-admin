import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '../store/troops.store'
import { todayLocalIso } from '@/shared/lib/utils'
import type { MemberPaymentCategory, ScoutMember } from '../types/troop.types'

function emptyForm() {
  return {
    amount: 0,
    category: 'membership' as MemberPaymentCategory,
    date: todayLocalIso()
  }
}

export function useRecordMemberPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  member: ScoutMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const addMemberPayment = useTroopsStore((s) => s.addMemberPayment)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  function handleSubmit() {
    if (!member || !hasPermission('manage:troops')) return
    if (!form.amount || form.amount <= 0) {
      toast.error(t('troops.roster.payment.toast.validationRequired'))
      return
    }
    addMemberPayment(member.id, {
      id: crypto.randomUUID(),
      date: form.date,
      amount: form.amount,
      category: form.category
    })
    toast.success(t('troops.roster.payment.toast.recorded', { name: member.fullName }))
    onOpenChange(false)
  }

  return { form, setForm, handleSubmit }
}
