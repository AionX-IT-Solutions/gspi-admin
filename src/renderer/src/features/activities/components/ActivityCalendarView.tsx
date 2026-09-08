import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { FieldSelect } from '@/shared/components/ui/FormField'
import { ACTIVITY_CATEGORY_COLOR, type ActivityStatus } from '../types/activities.types'
import { useActivitiesCalendar } from '../hooks/useActivitiesCalendar'

const STATUS_VARIANT: Record<ActivityStatus, 'warning' | 'primary' | 'success' | 'outline'> = {
  scheduled: 'warning',
  ongoing: 'primary',
  completed: 'success',
  cancelled: 'outline'
}

function formatTime(value: string): string {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
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

export function ActivityCalendarView() {
  const { t } = useTranslation()
  const {
    loading,
    weeks,
    weekdayLabels,
    monthLabel,
    monthTotal,
    year,
    yearOptions,
    setYear,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectedDay,
    selectDay,
    closeDay
  } = useActivitiesCalendar()

  const STATUS_LABEL_KEY: Record<ActivityStatus, string> = {
    scheduled: t('activities.status.scheduled'),
    ongoing: t('activities.status.ongoing'),
    completed: t('common.completed'),
    cancelled: t('common.cancelled')
  }

  return (
    <div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="primary">
            {t('activities.calendar.summary.activities')}: {monthTotal}
          </Badge>
          <Button variant="ghost" size="sm" onClick={goToPrevMonth} style={{ padding: '5px 8px' }}>
            <ChevronLeft size={14} />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            {t('activities.calendar.todayButton')}
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNextMonth} style={{ padding: '5px 8px' }}>
            <ChevronRight size={14} />
          </Button>
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
              const visible = day.activities.slice(0, 3)
              const extraCount = day.activities.length - visible.length
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
                  {visible.map((a) => (
                    <span
                      key={a.id}
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: ACTIVITY_CATEGORY_COLOR[a.category].bg,
                        color: ACTIVITY_CATEGORY_COLOR[a.category].text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {a.title}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {t('activities.calendar.moreCount', { count: extraCount })}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedDay.activities.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('activities.calendar.dayModal.noActivities')}
              </p>
            ) : (
              selectedDay.activities.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${ACTIVITY_CATEGORY_COLOR[a.category].text}`
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ color: ACTIVITY_CATEGORY_COLOR[a.category].text }}>
                        {t(`activities.category.${a.category}`)}
                      </span>
                      {a.location && ` · ${a.location}`}
                      {a.startTime && (
                        <>
                          {' · '}
                          {formatTime(a.startTime)}
                          {a.endTime ? ` – ${formatTime(a.endTime)}` : ''}
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL_KEY[a.status]}</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
