import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useViewMemberModal } from '../hooks/useViewMemberModal'

interface ViewMemberModalProps {
  memberId: string | null
  onClose: () => void
}

export function ViewMemberModal({ memberId, onClose }: ViewMemberModalProps) {
  const { t } = useTranslation()
  const { member, payments } = useViewMemberModal(memberId)

  return (
    <Modal
      open={!!member}
      onOpenChange={(open) => !open && onClose()}
      title={member?.fullName}
      description={member?.level || undefined}
      size="md"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      }
    >
      {member && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <DetailField
              label={t('troops.roster.form.birthdate')}
              value={formatDate(member.birthdate)}
            />
            <DetailField
              label={t('troops.roster.table.membership')}
              value={member.membershipYear}
            />
            <DetailField
              label={t('troops.roster.form.guardianName')}
              value={member.guardianName || '—'}
            />
            <DetailField
              label={t('troops.roster.form.guardianContact')}
              value={member.guardianContact || '—'}
            />
            <DetailField
              label={t('troops.roster.form.address')}
              value={member.address || '—'}
              className="col-span-2"
            />
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: 8
              }}
            >
              {t('troops.roster.payment.historyTitle')}
            </p>
            {payments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {t('troops.roster.payment.historyEmpty')}
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '6px 0',
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        textTransform: 'uppercase'
                      }}
                    >
                      {t('troops.roster.payment.dateLabel')}
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '6px 0',
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        textTransform: 'uppercase'
                      }}
                    >
                      {t('troops.roster.payment.categoryLabel')}
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '6px 0',
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        textTransform: 'uppercase'
                      }}
                    >
                      {t('troops.roster.payment.amountLabel')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>
                        {formatDate(p.date)}
                      </td>
                      <td style={{ padding: '8px 0' }}>
                        <Badge variant={p.category === 'training' ? 'warning' : 'primary'}>
                          {p.category === 'training'
                            ? t('troops.roster.payment.categoryTraining')
                            : t('troops.roster.payment.categoryMembership')}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: '8px 0',
                          textAlign: 'right',
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}
                      >
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function DetailField({
  label,
  value,
  className
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{value}</p>
    </div>
  )
}
