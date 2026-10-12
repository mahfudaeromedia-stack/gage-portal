# Lounge/Tenant directory revision

Scope: Only the Lounge/Tenant Planning directory and its Add/Edit form reference options. No GHA or other Planning page changes.

Changed files:
- `assets/clean-page-registry.js`: removes nested legacy filter dropdown wrappers and redundant labels; positions and names directory actions.
- `assets/lounge-planning-v29.js`: aligns filter sources to Master Data plus historical agreements, preserves Grid/Details selection, wires Add, and provides provider suggestions.
- `assets/portal.css`: page-scoped control sizes, dropdown geometry, action positions and responsive layout.
- `HISTORICAL-BASELINE.md`: updates existing history.

Validation: `node --check` on modified JavaScript, `npm run build` (58 source regression checks), and ZIP integrity. Browser UI and authenticated Firebase CRUD not verified in this environment.

Deploy: Apply files to the matching test branch baseline (test-1 with prior cumulative source and previous focused patch), commit, and trigger Netlify rebuild. No changes to Firestore Rules, Storage Rules, indexes, migration, or environment variables. Rollback by reverting this commit and redeploying the previous Netlify build.
