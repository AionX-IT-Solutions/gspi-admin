// One-time patch of the `programReportLineItems` Firestore collection so Int'l Affairs'
// two items match REPORTS.xls exactly (National HQ's actual "INT'L. AFFAIRS" sheet) —
// fields, the Date column's label, AND its position (both items have Date 3rd, after 2
// other columns, not leading like most log items). Purely additive/cosmetic in every
// case — no entry data (event/place/girls/adults/etc.) is ever touched or renamed.
//
// Both items already existed in Firestore before these additions landed in
// SEED_LINE_ITEMS, and the app's own hydrate() only backfills entirely-missing codes —
// it never patches fields on a doc that already exists. Hence this one-time script. Safe
// to re-run any time (e.g. after another field/label/position tweak lands) — it only
// writes whatever's still out of date, one attribute at a time.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node scripts/migrateProgramReportIntlAffairs.mjs           (dry run)
//   node scripts/migrateProgramReportIntlAffairs.mjs --apply   (writes for real)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')
const apply = process.argv.includes('--apply')

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// The full, current target shape for each item — the single source of truth this
// script diffs live docs against. Keep in sync with SEED_LINE_ITEMS in
// src/renderer/src/features/programReports/store/programReports.store.ts.
const TARGETS = {
  '1.b.14': {
    fields: [
      { key: 'council', label: 'Council', type: 'text' },
      { key: 'event', label: 'International Event Attended', type: 'text' },
      { key: 'place', label: 'Place', type: 'text' },
      { key: 'girls', label: 'Girl', type: 'number', groupLabel: 'Participant' },
      { key: 'adults', label: 'Adult', type: 'number', groupLabel: 'Participant' }
    ],
    dateColumnIndex: 2
  },
  '1.b.15': {
    fields: [
      { key: 'internationalEvent', label: 'International Event', type: 'text' },
      { key: 'supplementaryInitiative', label: 'Supplementary Initiative Done', type: 'text' },
      { key: 'platform', label: 'Online Platform/Council Event Used', type: 'text' }
    ],
    dateLabel: 'Date Posted',
    dateColumnIndex: 2
  }
}

function fieldKeys(fields) {
  return (fields ?? []).map((f) => f.key).join(',')
}

async function patchItem(code, docsByCode, target) {
  const item = docsByCode.get(code)
  if (!item) {
    console.log(`  (no ${code} doc found — nothing to patch)`)
    return 0
  }

  const update = {}
  const changes = []

  if (target.fields && fieldKeys(item.data.fields) !== fieldKeys(target.fields)) {
    update.fields = target.fields
    changes.push(`fields -> [${target.fields.map((f) => f.label).join(', ')}]`)
  }
  if (target.dateLabel && item.data.dateLabel !== target.dateLabel) {
    update.dateLabel = target.dateLabel
    changes.push(`dateLabel -> "${target.dateLabel}"`)
  }
  if (target.dateColumnIndex !== undefined && item.data.dateColumnIndex !== target.dateColumnIndex) {
    update.dateColumnIndex = target.dateColumnIndex
    changes.push(`dateColumnIndex -> ${target.dateColumnIndex}`)
  }

  if (changes.length === 0) {
    console.log(`  (${code} already up to date — skipping)`)
    return 0
  }

  console.log(`  ~ update programReportLineItems/${item.id} (${code}): ${changes.join(', ')}`)
  if (apply) {
    update.updatedAt = FieldValue.serverTimestamp()
    await item.ref.update(update)
  }
  return 1
}

async function main() {
  const snap = await db.collection('programReportLineItems').get()
  const docsByCode = new Map()
  for (const doc of snap.docs) {
    docsByCode.set(doc.data().code, { id: doc.id, ref: doc.ref, data: doc.data() })
  }
  console.log(`${snap.size} document(s) in programReportLineItems. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  let changed = 0
  for (const [code, target] of Object.entries(TARGETS)) {
    changed += await patchItem(code, docsByCode, target)
  }

  console.log(`\n${changed} document(s) ${apply ? 'updated' : 'would be updated'}.`)
  if (!apply && changed > 0) console.log('Re-run with --apply to write these changes.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
