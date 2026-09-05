import { useEffect, useMemo, useRef } from 'react'
import { useCashReceiptsStore } from '../store/cashReceipts.store'
import { useBanksStore, bankDisplayName } from '../store/banks.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import type { BankAccountBalance } from '../lib/scrdExcelExport'

/**
 * The core "how much money does GSPI actually have" computation — opening
 * balance plus every receipt minus every disbursement, per bank account.
 * Shared between the SCRD Summary tab (which layers session-local manual
 * income adjustments on top for its own richer breakdown — see
 * useScrdComputations) and the Dashboard (which just wants a live total),
 * so neither duplicates this logic and both stay consistent.
 *
 * Also the bridge that keeps banks/{id}.currentBalance fresh in Firestore
 * for gspi-app's mobile dashboard, which has no cashReceipts/vouchers/POS
 * ledger of its own to compute this from — refreshed automatically whenever
 * either page using this hook (Dashboard or SCRD, both commonly visited) is
 * open, rather than depending on one specific page.
 */
/** Guards every raw-record amount against non-numeric/missing data (e.g. a sale
 *  document written by a stale schema, missing `totalAmount`) — without this, `NaN`
 *  propagates through every sum it touches and never recovers (NaN + x is always NaN),
 *  permanently breaking the Dashboard's and SCRD's totals until the bad doc is found. */
export function safeAmount(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function useBankBalances() {
  const allBanks = useBanksStore((s) => s.banks)
  const setCurrentBalance = useBanksStore((s) => s.setCurrentBalance)
  // Filtering here rather than in the selector: an inline `.filter()` inside
  // a zustand selector returns a new array every render, which makes
  // useSyncExternalStore think the store changed on every render and can
  // spiral into "Maximum update depth exceeded".
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])
  const cashReceipts = useCashReceiptsStore((s) => s.receipts)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const sales = usePOSStore((s) => s.sales)
  const purchases = usePOSStore((s) => s.purchases)
  const bookings = useRentalsStore((s) => s.bookings)

  const receiptsByAccount = useMemo(() => {
    const map = new Map<string, number>()
    const add = (account: string, amount: number) =>
      map.set(account, (map.get(account) ?? 0) + safeAmount(amount))
    cashReceipts.forEach((r) => add(r.bankAccount, r.amount))
    sales.filter((s) => !s.voided).forEach((s) => add('Cash on Hand', s.totalAmount))
    bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      // amountPaid (down payment or full settlement) is what actually came in as
      // cash — totalAmount is just the contract price. Bookings predating the
      // down-payment feature have no amountPaid recorded, so fall back to
      // totalAmount there (matches the old assume-paid-in-full behavior).
      .forEach((b) => add('Cash on Hand', b.amountPaid ?? b.totalAmount))
    return map
  }, [cashReceipts, sales, bookings])

  const disbursementsByAccount = useMemo(() => {
    const map = new Map<string, number>()
    const add = (account: string, amount: number) =>
      map.set(account, (map.get(account) ?? 0) + safeAmount(amount))
    vouchers
      .filter(
        (v) =>
          v.voucherType === 'check_voucher' && (v.status === 'posted' || v.status === 'approved')
      )
      .forEach((v) => add(v.bankAccountRef ?? 'Cash on Hand', v.amount))
    purchases.forEach((p) => add('Cash on Hand', p.amount))
    return map
  }, [vouchers, purchases])

  const bankAccountBalances: BankAccountBalance[] = useMemo(
    () =>
      banks.map((bank) => {
        const displayName = bankDisplayName(bank)
        const opening = safeAmount(bank.openingBalance)
        const receipts = receiptsByAccount.get(displayName) ?? 0
        const disbursements = disbursementsByAccount.get(displayName) ?? 0
        return {
          id: bank.id,
          account: displayName,
          opening,
          receipts,
          disbursements,
          closing: opening + receipts - disbursements
        }
      }),
    [banks, receiptsByAccount, disbursementsByAccount]
  )

  const totalBalance = useMemo(
    () => bankAccountBalances.reduce((sum, b) => sum + b.closing, 0),
    [bankAccountBalances]
  )

  // Guarded by a content fingerprint, not just the effect's dependency
  // array: persisting can trigger this collection's own hydrate/refresh
  // path, which hands back a freshly-built `banks` array — a new reference
  // even when nothing actually changed. Keying off `bankAccountBalances`
  // directly risks re-running this effect on every one of those echoes,
  // which would re-trigger the write, which re-triggers the refresh — an
  // infinite loop. Comparing serialized id:closing pairs means the effect
  // only actually writes when a value has truly changed.
  const balancesFingerprint = bankAccountBalances.map((b) => `${b.id}:${b.closing}`).join('|')
  const lastFingerprintRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastFingerprintRef.current === balancesFingerprint) return
    lastFingerprintRef.current = balancesFingerprint
    bankAccountBalances.forEach((b) => setCurrentBalance(b.id, b.closing))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed off the fingerprint, not the array reference (see comment above)
  }, [balancesFingerprint, setCurrentBalance])

  return { banks, bankAccountBalances, totalBalance }
}
