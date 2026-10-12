# Lounge/Tenant Planning — Revision Delta

## Scope
Focused correction of Lounge/Tenant Planning only: restore dedicated Add/Edit controller, compact card presentation, action placement, Region/Station master filters, compact Grid/Details switch, and Update/Delete actions.

## Changed files
- `assets/clean-page-registry.js`: load canonical Lounge/Tenant controller after shared runtime; separate navigation and actions; segmented view toggle.
- `assets/lounge-planning-v29.js`: initialize controller on dynamically loaded pages; Region options include airport master and reference catalog; compact card actions; preserve view state.
- `assets/portal.css`: scoped compact layout, toolbar, filters, cards, responsive behavior.
- `HISTORICAL-BASELINE.md`: update existing historical record.

## Validation
- `node --check assets/lounge-planning-v29.js`: PASS
- `node --check assets/clean-page-registry.js`: PASS
- `npm test` / `npm run build`: PASS (58 regression checks)
- Browser-authenticated Firebase CRUD / visual screenshots: NOT RUN. Do not interpret static tests as end-to-end confirmation.

## Deployment
Apply only to a branch whose source matches the latest Ground Experience Portal baseline, then commit and trigger Netlify rebuild. No Firestore Rules, Storage Rules, indexes, migrations, or environment changes included. Revert the patch commit and redeploy the previous Netlify deploy to roll back.
