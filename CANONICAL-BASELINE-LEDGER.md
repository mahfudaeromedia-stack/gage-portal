# GE Portal — Canonical Consolidation Baseline Ledger

Status: CLEAN PACKAGE — FREEZE PENDING EXTERNAL INTERACTIVE BROWSER VALIDATION
Rule: CBNR (Canonical Baseline No-Regression Rule)

## Source baseline
- MAIN: `GE_Portal-main(1).zip`
- TEST-1: `GE_Portal-test-1 (2).zip`
- Initial runtime baseline: TEST-1, subject to source reconciliation against MAIN and historical precedence.
- MAIN-only source currently retained for reconciliation: `assets/reference-id-catalog.js`.

## Precedence
1. Later valid Rxx implementation supersedes an earlier Pxx/Rxx implementation when they conflict.
2. Valid non-conflicting historical behavior remains preserved.
3. Tests are evidence/contracts, not permission to alter runtime behavior merely to make tests pass.
4. Canonical runtime/source behavior is authoritative when a test is stale or structurally incompatible; the test must then be reconciled only when its contract is genuinely obsolete.

## CBNR protection
- This directory is the single working baseline after this checkpoint.
- Subsequent corrections must modify this baseline in place.
- Do not create a new consolidation from MAIN + TEST-1 for ordinary corrections.
- Every correction must rerun the full regression gate plus targeted regression for the changed domain.
- A previously passing function is a protected regression unless a documented later requirement intentionally changes it.

## First reconciliation findings
- R38.1 initially failed because `master-reference.js` hydrated operational collections (`groundHandlers`, `serviceAlignments`, `airportCosts`, `lounges`, etc.).
- Canonical correction: Master Data hydration is limited to master/reference collections; operational collections are not hydrated as Master Data source state.
- `reference-id-catalog.js` from MAIN is retained temporarily for integration review; it must not remain as a duplicate runtime implementation after its valid content is incorporated.

## Open reconciliation areas
- Master Data source/catalog integration and R38/R56 contract chronology.
- Pxx/Rxx implementation precedence across changed source files.
- Planning universal renderer vs dedicated Lounge/Tenant renderer.
- Global UI/theme/CSS consolidation and obsolete `!important` layers.
- GEStore cache-first coverage across Planning routes.
- R43/airport-experience standalone runtime consolidation.
- Historical revision/test artifact consolidation.

## Prohibited shortcuts
- No duplicate implementation to hide a conflict.
- No compatibility shim solely to satisfy an obsolete contract.
- No CSS `!important` masking as a substitute for canonical cascade correction.
- No deletion of a source until its valid behavior is accounted for in the canonical source.
- No final packaging/upload before baseline regression and runtime/UI validation are complete.

## Source decisions recorded in this checkpoint
| Area | Canonical working source | Decision | Reason / scope |
|---|---|---|---|
| Master Data hydration | `assets/master-reference.js` | TEST-1 logic retained, operational hydration removed | R38.1 proves operational collections must not be hydrated as Master Data |
| Initiative delete/filter | `assets/edition1-business-runtime.js` | TEST-1 change retained for semantic merge | Later runtime behavior uses GEStore persistence and explicit confirmation |
| Planning cache/data | `assets/planning-domains.js` + `assets/edition1-store.js` | TEST-1 retained pending full route audit | Planning uses GEStore; store already implements IndexedDB cache-first + background manifest refresh |
| Customer Experience | `assets/customer-experience-v257.js` | TEST-1 change retained | Adds derived performance API without removing existing canonical exports |
| Management Outcome | `assets/management-outcome-v257.js` | TEST-1 change retained | Adds outcome metrics while preserving existing API |
| Improvement / Monitoring bridge | `assets/improvement-v257.js` | TEST-1 change retained | Adds Monitoring Assessment → Opportunity traceability |
| Permission scope | `assets/permission-v257.js` | TEST-1 change retained | Extends station/menu/effective scope while preserving existing station scope |
| Global UI | `assets/portal.css` + branch UI modules | NOT YET FINAL | Requires semantic consolidation; current CSS still contains overlapping historical layers |
| Master catalog | MAIN `assets/reference-id-catalog.js` + TEST-1 `master-reference.js` | MERGE REQUIRED | MAIN-only catalog functionality must be incorporated into canonical Master Data, then standalone catalog removed |

## Current regression state
- `npm test` reaches R38.1 after the canonical hydration correction.
- R38.1, R38.2, R39 through R56 preceding R23 ordering checks passed in the current run.
- Current stop: `R23_CUMULATIVE_FIX_CONTRACT` because its contract still asserts the older exact hydration expression.
- Subsequent R56 also exposed a contract/source mismatch for `Currency / Exchange Rate` in `master-reference.js`.
- These are recorded as contract-reconciliation work; no compatibility shim has been added.

## CBNR checkpoint — Master Data Station source
- Historical source decision verified: `airports` is the canonical Station source; no new Airport/Station list may be invented.
- Branch Office remains a separate master/reference identity with a Station relationship; it must not become a second independent Station source.
- Canonical runtime correction applied in `assets/master-reference.js`: `stations()` now derives only from `state.airports` and no longer derives Station options from Lounge or Ground Handling operational records.
- This prevents operational data changes from silently changing the Master Data Station list.
- `node --check assets/master-reference.js`: PASS.
- Full `npm test`: stops at the pre-existing R23 contract mismatch; R56 also reports the existing Master Data label contract mismatch. No test was modified to force a pass.


## CBNR checkpoint — Master Data canonical consolidation (2026-10-02)

- `assets/reference-id-catalog.js` was audited against the canonical `assets/master-reference.js`; it was a second Master Data runtime, not a required standalone architecture.
- Its valid type definitions, ID/master definitions, built-in categories, CSV/template capability, and ID-reference presentation were merged into `assets/master-reference.js`.
- Master Data remains exactly two UI groups: `JENIS & REFERENSI` and `ID & MASTER REFERENSI`.
- Canonical Station source remains `airports` (Airport Master). Branch Office remains a separate reference identity linked to Station; no second Station list was created.
- Master Data initialization hydrates canonical reference sources only; operational `groundHandlers`, `personnel`, `users`, and similar collections are not hydrated as Master Data sources.
- Existing operational reference views retained in the canonical renderer continue to use the established collections where already part of the canonical Master Data runtime; no new Firebase collection/schema was invented.
- OCR/NPS/CSI Touch Point lock behavior remains represented by the canonical `isLockedTouchpoint` path.
- The legacy standalone `assets/reference-id-catalog.js` was removed only after its valid behavior was merged and the registry was confirmed not to load it.
- Validation: `node --check assets/master-reference.js` PASS; `npm test` PASS through R106.
- CBNR status: baseline remains the same working baseline; this is an in-place canonical correction, not a new consolidation.


## CBNR checkpoint — Planning canonical correction (2026-10-02)

- `assets/planning-domains.js` remains the canonical universal Planning renderer; no second Planning HTML architecture was introduced.
- Added guarded collection handling (`currentRows`), Airport-Master-derived active Station options, schema/table metadata, Field Configuration, and agreement revision metadata.
- Planning agreement actions now preserve history through `supersedesId` / `recordStatus='Superseded'` instead of destructive replacement.
- GHA multi-station creation now splits one selected multi-station input into one canonical row per Station with the same payload.
- Planning delete flow uses the existing canonical delete-confirmation function when available, with the existing modal fallback; danger action is filled red/white through the canonical shared danger rule.
- Planning/master modal backdrop was raised at its canonical shared selector so it renders above the current shell z-index; no new `!important` workaround was added.
- Lounge/Tenant canonical runtime now uses active Airport Master records for the Station dropdown; row action text is standardized to `Edit`. Existing P87 header action/cache-bust precedence remains unchanged.
- Targeted R75 and R77 contracts pass. R78 functional checks for currentRows, modal body level, delete confirmation, danger class, GHA split, Master GHA split, and Airport-Master Station source pass. Remaining R78 failures are legacy textual checks for superseded cache-bust identifiers / `!important` strings and are not used as implementation targets.
- Full `npm test` remains PASS through R106 after these changes.

## CBNR cleanup checkpoint — canonical consolidation (2026-10-02)

- Historical revision/process documentation was consolidated into `HISTORICAL-BASELINE.md`; 33 separate reports/changelogs/process notes were removed after their evidence was retained in that file.
- Patch/diff/apply/rollback artifacts were removed after their valid changes were already present in canonical runtime/source. No `.patch` or `.diff` file remains in the working baseline.
- The scattered regression chain was consolidated into `tests/regression-gate.js`, containing the 55 contracts previously executed by the build chain. `npm test`, `npm run build`, and `npm run verify:repo` now use that single gate.
- Unreferenced CSS/runtime artifacts proven unused by repository-wide reference search were removed.
- Exact duplicate CSS rule blocks were removed without introducing new overrides. `portal.css` decreased from 5,769 to 5,763 lines and from 4,384 to 4,363 `!important` declarations.
- Overall repository inventory decreased from 302 to 146 files at this checkpoint; frontend/runtime source lines decreased from 34,811 to 32,387.
- `npm test`: PASS through R106 after consolidation. Canonical JS syntax checks: PASS.
- This is an in-place CBNR cleanup of the existing baseline, not a new consolidation from MAIN + TEST-1 and not a delta package.


## Clean package report

- Final cleanup findings and before/after measurements are recorded in `FINAL-CLEAN-AUDIT-REPORT.md`.
- Current contract/static status: `CBNR_REGRESSION_GATE_PASS TESTS=55`; canonical JS syntax checks PASS; static route smoke PASS.
- Interactive Chromium capture did not complete in this environment and is explicitly not counted as PASS.

## CBNR CLEAN FINAL — CSS/CASCADE CLEANUP (2026-10-02)
- Cleanup executed directly against the existing CBNR baseline; no MAIN+TEST-1 reconsolidation and no delta/overlay architecture.
- External CSS `!important`: 0 across all `assets/*.css`.
- `assets/portal.css`: 5,763 lines; `!important` count 0.
- Inline pending-route CSS in `app.html`: `!important` removed while preserving the pending-shell behavior contract.
- Regression contracts that depended on literal `!important` were converted to semantic/property checks; no functionality was bypassed.
- `npm test`: `CBNR_REGRESSION_GATE_PASS TESTS=55`.
- Final artifact count: 147 files; `.patch/.diff` count 0; root HTML remains `app.html` + `login.html`.
- Browser interactive smoke could not complete within the environment timeout; this is recorded as a validation limitation, not claimed as PASS.

## 2026-10-02 — UI Canonical Consolidation Follow-up

- Continued from the existing CBNR baseline; no MAIN + TEST-1 reconsolidation.
- Removed duplicate `assets/lounge-planning-v29.js`; its valid implementation was already consolidated into `assets/edition1-business-runtime.js`.
- Removed dormant `assets/global-select-standard.js`; no production element used its opt-in marker.
- Lounge/Tenant Grid/Details is now the shared segmented control, not a legacy select.
- Default dropdown is native select with filled navy triangle treatment.
- Shared button geometry, field geometry, muted placeholder/guidance typography, modal typography/layering, sortable whole-header-cell behavior and Gantt geometry are canonicalized in `assets/global-ui-canonical.css`.
- `portal.css` contains zero `!important` declarations.
- Full CBNR regression gate: `55/55 PASS`.
