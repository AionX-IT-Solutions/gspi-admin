import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { FieldSelect } from '@/shared/components/ui/FormField'
import type { BookingStatus } from '../../rentals/types/rentals.types'
import type { VisitorStatus } from '../../visitors/types/visitors.types'
import { useFacilityCalendar } from '../hooks/useFacilityCalendar'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const BOOKING_STATUS_VARIANT: Record<BookingStatus, 'warning' | 'success' | 'primary' | 'outline'> =
  {
    reserved: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'outline'
  }

const VISITOR_STATUS_VARIANT: Record<VisitorStatus, 'warning' | 'outline'> = {
  checked_in: 'warning',
  checked_out: 'outline'
}

function formatBookingTime(value: string): string {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function formatVisitorTime(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  )
}

function formatDayTitle(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function FacilityCalendar() {
  const { t } = useTranslation()
  const {
    loading,
    weeks,
    weekdayLabels,
    monthLabel,
    monthTotals,
    year,
    yearOptions,
    setYear,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectedDay,
    selectDay,
    closeDay,
    refresh
  } = useFacilityCalendar()

  const BOOKING_STATUS_LABEL_KEY: Record<BookingStatus, string> = {
    reserved: t('rentals.status.reserved'),
    confirmed: t('rentals.status.confirmed'),
    completed: t('common.completed'),
    cancelled: t('common.cancelled')
  }
  const VISITOR_STATUS_LABEL_KEY: Record<VisitorStatus, string> = {
    checked_in: t('visitors.status.checkedIn'),
    checked_out: t('visitors.status.checkedOut')
  }

  return (
    <motion.div
      key="facility-calendar"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('facilityCalendar.title')}
        icon={<CalendarDays size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={refresh} />
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevMonth}
              style={{ padding: '5px 8px' }}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday}>
              {t('facilityCalendar.todayButton')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              style={{ padding: '5px 8px' }}
            >
              <ChevronRight size={14} />
            </Button>
          </>
        }
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{monthLabel}</span>
          <FieldSelect
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant="primary">
            {t('facilityCalendar.summary.bookings')}: {monthTotals.bookings}
          </Badge>
          <Badge variant="cyan">
            {t('facilityCalendar.summary.visitors')}: {monthTotals.visitors}
          </Badge>
        </div>
      </div>

      <Card padding="0px" loading={loading} skeletonRows={6}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {weekdayLabels.map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 8px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}
            >
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {week.map((day) => {
              const visibleBookings = day.bookings.slice(0, 2)
              const extraCount = day.bookings.length - visibleBookings.length
              return (
                <button
                  key={day.dateKey}
                  onClick={() => selectDay(day.dateKey)}
                  style={{
                    width: '100%',
                    minHeight: 96,
                    padding: 6,
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: day.isToday ? 'var(--accent-primary-subtle)' : 'transparent',
                    border: '1px solid var(--border-subtle)',
                    opacity: day.isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: 'inherit'
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: day.isToday ? 700 : 500,
                      color: day.isToday ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    {day.dayNumber}
                  </span>
                  {visibleBookings.map((b) => (
                    <span
                      key={b.id}
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'rgba(99,102,241,0.12)',
                        color: '#818cf8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {b.spaceName}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {t('facilityCalendar.moreCount', { count: extraCount })}
                    </span>
                  )}
                  {day.visitors.length > 0 && (
                    <span
                      style={{
                        marginTop: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        color: '#22d3ee'
                      }}
                    >
                      <Users size={10} /> {day.visitors.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </Card>

      <Modal
        open={!!selectedDay}
        onOpenChange={(open) => !open && closeDay()}
        title={selectedDay ? formatDayTitle(selectedDay.dateKey) : ''}
        size="md"
      >
        {selectedDay && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {t('facilityCalendar.dayModal.bookingsTitle')}
              </p>
              {selectedDay.bookings.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('facilityCalendar.dayModal.noBookings')}
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    paddingRight: 4
                  }}
                >
                  {selectedDay.bookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{b.spaceName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {b.renterName}
                          {b.startTime && (
                            <>
                              {' · '}
                              {formatBookingTime(b.startTime)}
                              {b.endTime ? ` – ${formatBookingTime(b.endTime)}` : ''}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge variant={BOOKING_STATUS_VARIANT[b.status]}>
                        {BOOKING_STATUS_LABEL_KEY[b.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {t('facilityCalendar.dayModal.visitorsTitle')}
              </p>
              {selectedDay.visitors.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('facilityCalendar.dayModal.noVisitors')}
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    paddingRight: 4
                  }}
                >
                  {selectedDay.visitors.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{v.fullName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {v.purpose} · {v.personToVisit} · {formatVisitorTime(v.timeIn)}
                          {v.timeOut ? ` – ${formatVisitorTime(v.timeOut)}` : ''}
                        </p>
                      </div>
                      <Badge variant={VISITOR_STATUS_VARIANT[v.status]}>
                        {VISITOR_STATUS_LABEL_KEY[v.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
