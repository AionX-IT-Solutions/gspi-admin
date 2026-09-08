export type PtdgStatus = 'draft' | 'submitted' | 'approved' | 'disapproved'

export interface PtdgLineItem {
  id: string
  particulars: string
  amount: number
}

// Matches the National HQ "Application for Program & Training Development Grant" form —
// a grant requested FROM the Regional Office, funded from the Region's own PTDG
// allocation rather than the Council's own budget. Deliberately not linked into
// budgetAutoActuals or any other module's totals for that reason.
export interface PtdgApplication {
  id: string
  applicationNumber: string
  purpose: string
  eventDate: string
  projectedSources: PtdgLineItem[]
  projectedExpenses: PtdgLineItem[]
  status: PtdgStatus
  // Filled in once the Region mails back its Notice of Approval/Disapproval.
  regionalApprovedAmount?: number
  regionalRemarks?: string
  regionalDecisionDate?: string
  createdAt: string
  createdBy: string
}

export function ptdgSourcesSubtotal(app: Pick<PtdgApplication, 'projectedSources'>): number {
  return app.projectedSources.reduce((sum, l) => sum + l.amount, 0)
}

export function ptdgExpensesTotal(app: Pick<PtdgApplication, 'projectedExpenses'>): number {
  return app.projectedExpenses.reduce((sum, l) => sum + l.amount, 0)
}

// The form's own "Amount Requested" is the gap the grant needs to cover — expenses
// not already offset by other projected sources of funding for the same event.
export function ptdgAmountRequested(
  app: Pick<PtdgApplication, 'projectedSources' | 'projectedExpenses'>
): number {
  return Math.max(0, ptdgExpensesTotal(app) - ptdgSourcesSubtotal(app))
}
