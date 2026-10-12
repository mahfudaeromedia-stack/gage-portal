# Ground Experience Portal — Lounge/Tenant Revision Delta

## Scope
Focused Lounge/Tenant directory and Add/Update UI/validation patch, relative to the provided working source baseline (`lounge_work/repo`). This is not a full-portal rewrite.

## Changed files
- `assets/lounge-planning-v29.js` — English-facing form guidance, status, filter and validation text; preserve string record IDs in handlers; station compatibility; attachment error handling; duplicate filter call removal.
- `assets/portal.css` — scoped Lounge/Tenant directory controls: consistent 42px geometry, 14px typography, navy states, keyboard focus and responsive wrapping.
- `tests/lounge-tenant-focused-contract.cjs` — focused static contract checks.
- `HISTORICAL-BASELINE.md` — appended history to existing ledger.
- `PATCH_NOTES.md` — this release note.

## Verification
- `node --check assets/lounge-planning-v29.js`: PASS
- `node tests/lounge-tenant-focused-contract.cjs`: PASS (8 checks)
- `npm run build`: PASS (58 repository regression checks)
- Browser interaction, authenticated Firebase CRUD, permissions, and visual comparison against screenshots: NOT VERIFIED. The source checks are not a substitute for these checks.

## Deployment and rollback
1. Apply this ZIP at repository root **only if the current branch already contains the working source baseline and prior changes**. Do not apply directly to an older branch without diff review.
2. Review the diff, commit to a test branch, and let Netlify rebuild. Hosting redeploy is required for static asset changes.
3. Test Add/Edit/Delete, attachments, price schedules, permissions and mobile/desktop layouts with test accounts before production promotion.
4. Roll back by reverting the test-branch commit and redeploying the last known-good Netlify deployment.

## Firebase/configuration
Firestore Rules: no change. Storage Rules: no change. Firestore indexes: no change. Migration/backfill: none introduced. Environment variables: no change. This patch does not establish live Firebase compatibility.
