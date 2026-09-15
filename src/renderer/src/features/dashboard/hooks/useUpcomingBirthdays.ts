import { useEffect, useMemo } from 'react'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useTrainingProfilesStore } from '@/features/trainingProfiles/store/trainingProfiles.store'
import { useHRStore } from '@/features/hr/store/hr.store'
import { useUsersStore } from '@/features/users/store/users.store'
import { useCouncilBoardStore } from '@/features/councilBoard/store/councilBoard.store'

export type BirthdayCategory =
  | 'troopMember'
  | 'trainingProfile'
  | 'userAccount'
  | 'employee'
  | 'councilBoard'

export interface UpcomingBirthday {
  id: string
  name: string
  category: BirthdayCategory
  birthDate: string
  daysUntil: number
  isToday: boolean
  turningAge: number | null
}

// Short lead time by design — the widget is a reminder to prep for a birthday this week,
// not a long-range calendar.
const WINDOW_DAYS = 3

/** Days from `today` (inclusive, so a birthday today is 0) to this year's or next year's
 *  occurrence of `birthDate`'s month/day, whichever hasn't passed yet. */
function daysUntilNextBirthday(birthDate: string, today: Date): number | null {
  const parsed = new Date(birthDate)
  if (Number.isNaN(parsed.getTime())) return null

  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isLeapBirthday = parsed.getMonth() === 1 && parsed.getDate() === 29

  function occurrenceIn(year: number): Date {
    // Feb 29 in a non-leap year is observed on Feb 28 rather than spilling into March.
    if (isLeapBirthday && !isLeapYear(year)) return new Date(year, 1, 28)
    return new Date(year, parsed.getMonth(), parsed.getDate())
  }

  let next = occurrenceIn(today.getFullYear())
  if (next.getTime() < todayMidnight.getTime()) next = occurrenceIn(today.getFullYear() + 1)

  return Math.round((next.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function turningAge(birthDate: string, daysUntil: number, today: Date): number | null {
  const parsed = new Date(birthDate)
  if (Number.isNaN(parsed.getTime())) return null
  const nextBirthdayYear = new Date(today.getTime() + daysUntil * 86400000).getFullYear()
  return nextBirthdayYear - parsed.getFullYear()
}

/**
 * Pulls upcoming birthdays (today through the next 3 days) from every person-registry this
 * app tracks a birthdate for — Troop Members, Training Profiles, Employees, Council Board
 * members, and User Accounts — for the Dashboard's Upcoming Birthdays widget. Sorted soonest
 * first.
 */
export function useUpcomingBirthdays(): UpcomingBirthday[] {
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const trainingProfiles = useTrainingProfilesStore((s) => s.profiles)
  const employees = useHRStore((s) => s.employees)
  const boardMembers = useCouncilBoardStore((s) => s.members)
  const users = useUsersStore((s) => s.users)
  const subscribeUsers = useUsersStore((s) => s.subscribe)

  // Most roles can't read the `users` collection (see firestore.rules) and it isn't part of
  // the app-wide hydrate — subscribing here fails quietly for them, same as every other
  // on-demand read in this app, and this widget just shows no User Account birthdays for
  // that viewer.
  useEffect(() => {
    const unsubscribe = subscribeUsers()
    return () => unsubscribe()
  }, [subscribeUsers])

  return useMemo(() => {
    const today = new Date()
    const entries: UpcomingBirthday[] = []

    function addEntry(
      id: string,
      name: string,
      category: BirthdayCategory,
      birthDate: string | undefined
    ) {
      if (!birthDate || !name.trim()) return
      const daysUntil = daysUntilNextBirthday(birthDate, today)
      if (daysUntil === null || daysUntil > WINDOW_DAYS) return
      entries.push({
        id,
        name,
        category,
        birthDate,
        daysUntil,
        isToday: daysUntil === 0,
        turningAge: turningAge(birthDate, daysUntil, today)
      })
    }

    scoutMembers
      .filter((m) => m.isActive)
      .forEach((m) => addEntry(m.id, m.fullName, 'troopMember', m.birthdate))
    trainingProfiles.forEach((p) => addEntry(p.id, p.name, 'trainingProfile', p.birthday))
    employees
      .filter((e) => e.isActive)
      .forEach((e) => addEntry(e.id, e.fullName, 'employee', e.birthDate))
    boardMembers.forEach((m) => addEntry(m.id, m.fullName, 'councilBoard', m.birthDate))
    users.forEach((u) => addEntry(u.id, u.fullName, 'userAccount', u.birthDate))

    return entries.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [scoutMembers, trainingProfiles, employees, boardMembers, users])
}
