# CSS Consolidation — Experimental Delta

Scope: Safe consolidation of adjacent identical declaration blocks in `assets/portal.css` without changing selector specificity, media context, or source order. 17 merges, 470088 → 469697 bytes. Updated existing `HISTORICAL-BASELINE.md` only.

Files changed: `assets/portal.css`, `HISTORICAL-BASELINE.md`; this note is package metadata.

Validation: CSS parsed without errors. `npm run build` was executed both before and after the CSS change. Both failed at the pre-existing `r106-checklist-share-public-contract.js` test (shared checklist submit action). **Netlify gate NOT passed.** No browser/Firebase validation performed. Do not deploy to production; test branch only after fixing the baseline failure.

Deployment: Apply this delta on the same repository baseline used for the CSS audit, commit to an isolated test branch, and run Netlify build. No Firestore Rules, Storage Rules, indexes, migration, or environment changes. Rollback by reverting this commit and rebuilding Netlify.
