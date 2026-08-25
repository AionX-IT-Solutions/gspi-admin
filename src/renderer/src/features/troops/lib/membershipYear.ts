/**
 * The membership year cycle isn't a fixed calendar year — the council configures which month
 * it starts (Settings → Membership Year), since Girl Scout membership traditionally renews on
 * a program-year cycle (commonly aligned to the school year) rather than Jan-Dec. A cycle
 * starting mid-year spans two calendar years, so it's labeled "2026-2027"; a cycle starting in
 * January collapses to a single-year label like "2026".
 */
export function getMembershipYearLabel(
  startMonth: number,
  referenceDate: Date = new Date()
): string {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth() + 1
  const cycleStartYear = month >= startMonth ? year : year - 1
  return startMonth === 1 ? `${cycleStartYear}` : `${cycleStartYear}-${cycleStartYear + 1}`
}

export function isMembershipCurrent(
  membershipYear: string,
  startMonth: number,
  referenceDate: Date = new Date()
): boolean {
  return membershipYear === getMembershipYearLabel(startMonth, referenceDate)
}
