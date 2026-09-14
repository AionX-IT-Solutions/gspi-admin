// Council funds retained at the Regional HQ (RHQ) — not the Council's own budget, and not
// the PTDG grant-application workflow (see features/ptdg). This is a manually-maintained
// snapshot of what RHQ reports back to the Council for each fund. Because RHQ statements
// arrive periodically, each statement is kept as its own dated snapshot rather than a single
// record that gets overwritten — the page lets the user pick which snapshot (by As of Date)
// to view/export. The fund lines themselves (`items`) are a free-form list rather than fixed
// fields, since RHQ statements can add/drop fund lines from one period to the next.

export interface FundEventBreakdown {
  nationalEvent: number
  regionalEvent: number
  councilEvent: number
  internationalEvent: number
}

export interface CouncilDepositLineItem {
  id: string
  label: string
  // Some funds (e.g. MMAF, the Escoda Memento Fund) are reported by RHQ as a single lump
  // sum, with no National/Regional/Council/International breakdown (shown as "-" on the
  // RHQ statement) — hasBreakdown picks which of the two amount shapes below applies.
  hasBreakdown: boolean
  breakdown: FundEventBreakdown
  lumpSum: number
}

export interface CouncilDepositsRecord {
  id: string
  asOfDate: string | null
  items: CouncilDepositLineItem[]
  preparedByName: string
  preparedByTitle: string
  notedByName: string
  notedByTitle: string
  updatedAt: string
}

export function emptyFundEventBreakdown(): FundEventBreakdown {
  return { nationalEvent: 0, regionalEvent: 0, councilEvent: 0, internationalEvent: 0 }
}

export function emptyLineItem(): CouncilDepositLineItem {
  return {
    id: crypto.randomUUID(),
    label: '',
    hasBreakdown: true,
    breakdown: emptyFundEventBreakdown(),
    lumpSum: 0
  }
}

// The fund lines every RHQ statement has reported so far — seeded on a new snapshot as a
// starting point, but freely editable/removable, and more can be added.
export function defaultLineItems(): CouncilDepositLineItem[] {
  return [
    {
      id: crypto.randomUUID(),
      label: 'PTDG - Girl',
      hasBreakdown: true,
      breakdown: emptyFundEventBreakdown(),
      lumpSum: 0
    },
    {
      id: crypto.randomUUID(),
      label: 'PTDG - Adult',
      hasBreakdown: true,
      breakdown: emptyFundEventBreakdown(),
      lumpSum: 0
    },
    {
      id: crypto.randomUUID(),
      label: 'MMAF - Council Registration Processor',
      hasBreakdown: false,
      breakdown: emptyFundEventBreakdown(),
      lumpSum: 0
    },
    {
      id: crypto.randomUUID(),
      label: 'Josefa Llanes Escoda Memento Fund',
      hasBreakdown: false,
      breakdown: emptyFundEventBreakdown(),
      lumpSum: 0
    }
  ]
}

export function emptyCouncilDepositsRecord(): CouncilDepositsRecord {
  return {
    id: '',
    asOfDate: null,
    items: defaultLineItems(),
    preparedByName: '',
    preparedByTitle: '',
    notedByName: '',
    notedByTitle: '',
    updatedAt: new Date().toISOString()
  }
}

export function fundEventTotal(b: FundEventBreakdown): number {
  return b.nationalEvent + b.regionalEvent + b.councilEvent + b.internationalEvent
}

export function lineItemTotal(item: CouncilDepositLineItem): number {
  return item.hasBreakdown ? fundEventTotal(item.breakdown) : item.lumpSum
}

// Column totals only fold in lines that actually carry a breakdown — lump-sum lines show
// "-" in these columns, same as on the RHQ statement, and only add into the grand total.
export function councilDepositsColumnTotals(
  r: Pick<CouncilDepositsRecord, 'items'>
): FundEventBreakdown {
  return r.items.reduce((acc, item) => {
    if (!item.hasBreakdown) return acc
    return {
      nationalEvent: acc.nationalEvent + item.breakdown.nationalEvent,
      regionalEvent: acc.regionalEvent + item.breakdown.regionalEvent,
      councilEvent: acc.councilEvent + item.breakdown.councilEvent,
      internationalEvent: acc.internationalEvent + item.breakdown.internationalEvent
    }
  }, emptyFundEventBreakdown())
}

export function councilDepositsGrandTotal(r: Pick<CouncilDepositsRecord, 'items'>): number {
  return r.items.reduce((sum, item) => sum + lineItemTotal(item), 0)
}
