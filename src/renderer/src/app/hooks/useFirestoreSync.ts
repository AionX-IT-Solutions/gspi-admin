import { useEffect } from 'react'
import { useHRStore } from '@/features/hr/store/hr.store'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useDailyCollectionsStore } from '@/features/accounting/store/dailyCollections.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useCategoriesStore } from '@/features/pos/store/categories.store'
import { useGoalsStore } from '@/features/goals/store/goals.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useVisitorsStore } from '@/features/visitors/store/visitors.store'
import { useCashReceiptsStore } from '@/features/scrd/store/cashReceipts.store'
import { useBanksStore } from '@/features/scrd/store/banks.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { useProgramReportsStore } from '@/features/programReports/store/programReports.store'
import { useProgramReportSectionMetaStore } from '@/features/programReports/store/programReportSectionMeta.store'
import { useTrainingReportsStore } from '@/features/trainingReports/store/trainingReports.store'
import { useAnnouncementsStore } from '@/features/announcements/store/announcements.store'
import { useBudgetStore } from '@/features/budget/store/budget.store'

/**
 * Loads every module's data from Firestore once per session (each store seeds its own
 * collections from the app's built-in starting data on first run if they're still empty).
 * Mounted once, in the authenticated shell — the Audit Log page hydrates separately since
 * only admin/super_admin can read it.
 */
export function useFirestoreSync() {
  const hydrateHR = useHRStore((s) => s.hydrate)
  const hydrateAccounting = useAccountingStore((s) => s.hydrate)
  const hydrateDailyCollections = useDailyCollectionsStore((s) => s.hydrate)
  const hydratePOS = usePOSStore((s) => s.hydrate)
  const hydrateCategories = useCategoriesStore((s) => s.hydrate)
  const hydrateGoals = useGoalsStore((s) => s.hydrate)
  const hydrateRentals = useRentalsStore((s) => s.hydrate)
  const hydrateVisitors = useVisitorsStore((s) => s.hydrate)
  const hydrateCashReceipts = useCashReceiptsStore((s) => s.hydrate)
  const hydrateBanks = useBanksStore((s) => s.hydrate)
  const hydrateVouchers = useVouchersStore((s) => s.hydrate)
  const hydrateTroops = useTroopsStore((s) => s.hydrate)
  const hydrateOrgSettings = useOrgSettingsStore((s) => s.hydrate)
  const hydratePermissions = usePermissionsStore((s) => s.hydrate)
  const hydrateProgramReports = useProgramReportsStore((s) => s.hydrate)
  const hydrateProgramReportSectionMeta = useProgramReportSectionMetaStore((s) => s.hydrate)
  const hydrateTrainingReports = useTrainingReportsStore((s) => s.hydrate)
  const hydrateAnnouncements = useAnnouncementsStore((s) => s.hydrate)
  const hydrateBudget = useBudgetStore((s) => s.hydrate)

  useEffect(() => {
    hydrateHR()
    hydrateAccounting()
    hydrateDailyCollections()
    hydratePOS()
    hydrateCategories()
    hydrateGoals()
    hydrateRentals()
    hydrateVisitors()
    hydrateCashReceipts()
    hydrateBanks()
    hydrateVouchers()
    hydrateTroops()
    hydrateOrgSettings()
    hydratePermissions()
    hydrateProgramReports()
    hydrateProgramReportSectionMeta()
    hydrateTrainingReports()
    hydrateAnnouncements()
    hydrateBudget()
  }, [
    hydrateHR,
    hydrateAccounting,
    hydrateDailyCollections,
    hydratePOS,
    hydrateCategories,
    hydrateGoals,
    hydrateRentals,
    hydrateVisitors,
    hydrateCashReceipts,
    hydrateBanks,
    hydrateVouchers,
    hydrateTroops,
    hydrateOrgSettings,
    hydratePermissions,
    hydrateProgramReports,
    hydrateProgramReportSectionMeta,
    hydrateTrainingReports,
    hydrateAnnouncements,
    hydrateBudget
  ])
}
