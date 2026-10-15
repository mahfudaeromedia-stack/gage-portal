# Ground Experience Portal — Work History

This is the single canonical work-history file for the portal. Entries are grouped by functional area/page so changes, root causes, deleted files, and validation can be traced without versioned history files.

## Global / Shared UI
- Canonical control geometry: buttons, fields, dropdowns, modal layering, active sidebar state, responsive/mobile behavior, and desktop density.
- Replacement cleanup: versioned runtime asset names were migrated to domain/canonical names; obsolete files are removed explicitly, not disabled by overwrite.

## Network & Map
- Preserve Station/Airport detail information hierarchy while adding optional image thumbnails and gallery behavior.
- Gallery upload/display is additive; it must not rearrange provider/service metadata.

## Monitoring & Assessment
- Professional flat workspace tabs; submission filters use in-field labels only.
- Share Checklist uses portal dialog and public short-link routes. Public share routes boot without protected-shell authentication.
- Submission includes KPI summary, pie chart, bar chart, and pageable/sortable history.

## Initiative & Improvement
- Grid/List share the same filter source. Journey, touch point, achievement, priority and search filters are synchronized.
- List table follows the Lounge table standard and exposes Update/Delete according to permissions.

## Improvement Opportunity
- Dashboard cards, Source Intake, Create Opportunity, Review/Disposition and Integrity sections use a responsive page layout.
- Page-level runtime errors are contained inside the page and must never replace the portal shell.

## Planning Workspace / Service & Provider
- Lounge/Tenant is the presentation reference for GHA, Airport Operator and other provider categories.
- Unassigned is hidden from the user-facing workspace; existing uncategorized records are not deleted.
- Provider category images are configurable through the central category-image mapping.

## Lounge / Tenant
- Add/Edit/Delete and station/provider filters use canonical bindings.
- Card/detail views retain Lounge/Tenant naming and parent navigation to Service & Provider.

## Master Data & Partners
- Master references and IDs are Add/Edit capable.
- Only Touch Points sourced from NPS/CSI remain locked; manually maintained Touch Points remain editable.
- Currency and exchange-rate collections are supported by the data API.

## Audit Log
- CRUD audit events from both the canonical and legacy audit stores are merged for Super Admin viewing.
- Login and logout are written as server-side audit events.

## Performance & Cache
- Static assets use Service Worker caching and data collections use scoped IndexedDB cache with background refresh.
- Protected-route authentication remains authoritative; public checklist share routes bypass the protected bootstrap only where explicitly allowed.

## Deployment
- Netlify regression gate must pass before handoff. Obsolete runtime files are deleted explicitly from the repository; no auto-delete build step is used.

## 2026-10-15 — Canonical UI & Runtime Regression Recovery

### Global / Shared
- Standardized desktop density so browser 100% uses the compact portal density previously seen around 90%, while mobile remains 100%.
- Kept dropdown, text field, radio, and checkbox content left-aligned.
- Restored visible active-sidebar state and constrained button content so zoom does not escape button borders.
- Changed Service Worker navigation caching to network-first and static assets to stale-while-revalidate to prevent stale `app.html` / authentication bootstrap mismatches while preserving fast repeat navigation.

### Network & Map
- Restored station-detail hierarchy after gallery support: provider metadata and service tabs retain their layout; service/lounge/facility images stay inside record content and no longer reshape the station header.
- Made station detail responsive without oversized/overflowing tab controls.

### Monitoring & Assessment
- Reworked Overview / Monitoring Works / Form Templates / Submissions into flat professional navigation tabs without elevated-button shadows.
- Standardized submission filters and Download Data to one control height and kept filters self-describing without separate field titles.
- Protected shared-checklist routes against stale cached HTML/auth bootstrap mismatch.

### Initiative & Improvement
- Normalized the initial “Semua Journey” state so search and Grid View render correctly on first open, not only after changing Journey filters.
- Aligned List View table presentation with the Lounge/Tenant table language and kept Update/Delete action rendering for editable roles.

### Improvement Opportunity
- Reworked the page to a full-width two-column workspace with separated KPI cards, source intake, create opportunity, register, and integrity panels.
- Added initialization guards to prevent duplicate event binding / page lockups after route re-entry.

### Planning Workspace / Service & Provider
- Removed Unassigned from category presentation.
- Standardized provider cards to the Lounge-style content hierarchy with station identity limited to about 15–20% of card width.
- Standardized filter row and Grid/Details/action heights; editable roles use Edit/Delete while viewer-only roles use View.
- Category imagery remains configurable through `GE_PLANNING_CATEGORY_IMAGES`.

### Lounge/Tenant
- Kept child title `Lounge/Tenant Planning` under the top-level `Service & Provider` navigation.
- Restored canonical initialization for Add/Edit controls after Firestore hydration rather than relying on suppressed DOMContentLoaded handlers.
- Standardized heading/back-action and Grid/Details heights.

### Master Data & Partners
- Preserved editable reference/ID behavior while keeping NPS/CSI-derived locked Touch Points read-only.
- Ensured deployment includes server allow-list support for `currencies` and `exchangeRates`.
- Standardized master tabs and content-height panels to avoid blank oversized areas.

### Audit Log
- Authentication audit path remains enabled for Login and Logout; canonical mutation flows continue to write their page/module audit records.

### Deployment / Regression
- Added pending-auth shell hiding expected by the navigation readiness regression gate.
- No new R/P/V runtime identity was introduced by this work.


## 2026-10-15 — Planning Workspace Canonical Interaction Alignment

### Planning Workspace / Service & Provider
- Standardized Grid/Details to one segmented-control behavior shared with Lounge/Tenant.
- Standardized provider-category cards to the Lounge/Tenant card hierarchy; station identity is a compact square element and card actions use the same control geometry.
- Back navigation to Service & Provider uses one page-head placement across child pages.
- Service/provider pages show agreement attention for Expired and Expiring Soon records.
- Category totals use source-record counts; station-expanded entries are reported separately to avoid inflated GHA totals.
- Bulk Upload now opens a dedicated review flow before import, including total/ready/failed validation counts and preview.
- Delete uses the shared confirmation dialog and emits a success confirmation after persistence.

### Lounge / Tenant
- Restored the child page title as `Lounge/Tenant Planning` and retained Service & Provider only as the parent breadcrumb/navigation.
- Fixed Grid/Details switching recursion that could make Details unresponsive.
- Rebound Add and view controls during canonical page initialization.
- Region filtering now derives region from the station/airport master when the lounge record itself has no region value.
- Added Expired / Expiring Soon status filtering and standardized delete confirmation/result feedback.

### Ground Handling Agent / Airport Operator / Other Provider Categories
- Source-record totals no longer use station-expanded row counts, preventing totals such as 66/15 when the selected GHA source contains 12 records.
- Per-station rows/cards are still preserved for operational display where one source record covers multiple stations.


## Planning Workspace — Canonical behavior recovery
- Restored Lounge/Tenant child title; first-level sidebar title normalization no longer overwrites Planning Workspace subpages.
- Unified Grid/Details segmented control and Planning Workspace card proportions.
- Replaced Planning Workspace native dialog usage with one fixed shared overlay layer so Close/Cancel/Save remain interactive above header/sidebar even with desktop density mode.
- Shared delete confirmation now uses the same fixed overlay behavior instead of browser/native dialog.
- Generic bulk upload uses the same professional import/review pattern and accepts XLSX/CSV when the shared reader is available.
- Lounge/Tenant page hydrates Airport/Region master data and rebinds Add/Grid/Details on SPA route entry.
- Service & Provider child pages use `data` wording, support Show agreement history, and retain Expired / Expiring Soon lifecycle filters and warnings.


## 2026-10-15 — Planning Workspace canonicalization and Monitoring recovery
### Planning Workspace
- Lounge/Tenant, GHA, Airport Operator and other Planning Workspace children now use the same `planning-domains.js` renderer and behavior for cards, details table, filters, pagination, Add/Edit, bulk import, warnings, delete confirmation and feedback.
- Planning counts are user-facing data rows/station entries rather than source-object counts.
- Space & Building category visuals use domain-appropriate images and consistent card geometry.
### Monitoring & Assessment
- Public shortlinks can bootstrap directly from `/s/<code>` without protected authentication.
- Shared checklist removes internal Checklist ID/version and mapping metadata; rating/numeric scale render as selectable circles.
- Form builder supports respondent information required/optional.
- Submission filters use placeholder/options without separate field-title labels.
### Master Data & Partners
- Canonical hydration includes every collection consumed by editable master references.
### Initiative
- Initial Journey state is synchronized through a canonical state object to prevent `activeJourney` initialization errors.
- Initiative list container and document-action overflow are normalized.

## 2026-10-15 — Shared Component Recovery / Root-Cause Audit
### Planning Workspace / Lounge / GHA / Space & Building
- Replaced the independent Lounge route implementation with the same `planning-domains.js` renderer used by the other Planning Workspace children; UI similarity is no longer achieved by page-specific patches.
- One shared behavior now owns Grid/Details, filters, card/table rendering, pagination, lifecycle warnings, Add/Edit, Bulk Upload, Delete confirmation, and user feedback.
- GHA displayed data count follows station-entry rows shown to the user, not hidden source-object totals.
- Space & Building image cards use domain-appropriate imagery and consistent image cropping/geometry.

### Master Data & Partners
- Root cause of dead Add/Edit modal was conflicting legacy `#geGlobalRefModal` ownership in `portal.css` (`pointer-events:none`) versus the new modal runtime.
- Removed the obsolete duplicated modal ownership from `portal.css`; `global-ui-canonical.css` is now the single overlay owner.
- Save retains duplicate-submit prevention, busy state, live status, and error feedback.

### Monitoring & Assessment / Shared Checklist
- Direct `/s/<code>` routes are recognized by both authentication bypass and checklist runtime token resolution; share behavior no longer depends only on query-string rewriting.
- Public checklist focuses on operational questions: Checklist ID/version and unmapped-touch-point diagnostics are not displayed.
- Rating/numeric-scale fields render selectable circular choices; respondent identity can be required or optional by template.
- Submission filter controls have no redundant visible field-title row.

### Initiative & Improvement
- Shared initiative state bridges route/runtime scope to avoid `activeJourney is not defined` during first entry.
- Legacy internal recovery text is removed from the visible registry content.
- List-view framing and document/milestone action overflow are normalized.

### Regression / Ownership
- Master modal legacy CSS ownership was deleted rather than overridden.
- Regression tests were updated to assert semantic canonical ownership (`planning-domains.js`, `global-ui-canonical.css`, direct shortlink routing) instead of preserving obsolete implementation names.

## 2026-10-16 — Root-Cause Recovery: Planning, Network, Checklist, Initiative & Master Data

### Planning Workspace / Service & Provider
- Audited the shared Planning Workspace renderer instead of adding another page-specific patch.
- Root cause of Add/Edit/Upload showing only a dim backdrop was conflicting overlay ownership under portal density mode. Planning forms, detail view and bulk import now use the single body-level `planning-dialog-layer` with a visible dialog card and live Close/Cancel/Save handlers.
- Restored the Planning Workspace root category grid; the hub markup already existed but its canonical `.planning-hub-grid/.planning-hub-card` presentation rules were missing.
- Planning record metadata now follows a vertical field hierarchy as requested instead of splitting values into competing columns.
- Details/Grid visibility is explicitly controlled by the shared Planning Workspace owner.
- Service & Provider category copy no longer inherits old padding that pushed labels/counts into the image area.
- Space & Building uses category-specific imagery and contain-fit geometry instead of reusing an unrelated/cropped airport image.

### Network & Map
- Removed the obsolete four-tab station-detail renderer that competed with the six-tab implementation.
- Canonical station detail retains: Service, Lounge, People, Facility, System and Contract.
- Photo/gallery support remains an addition inside applicable record content and does not replace the six information categories.
- Region filtering now normalizes case, spaces, underscores and hyphens before matching so valid station markers do not disappear due to label-format differences.
- Photo persistence no longer attempts a second direct client write to `auditLogs`; the server mutation path remains the audit owner.

### Monitoring & Assessment / Shared Checklist
- Fixed short-link bootstrap at `/s/:code`: the route redirects to the canonical app URL and `app.html` resolves assets from the site root through `<base href="/">`.
- Guarded page-registry access so a missing/late registry produces the normal page-resolution path instead of `Cannot read properties of undefined`.
- Checklist required marks are rendered beside the question label rather than as a stray line below the question.
- Rating/numeric-scale questions retain circular selectable choices.

### Master Data & Partners
- Removed direct client-side audit-log mutation from the Master Data save path; server-side mutation auditing remains authoritative.
- Save errors expose the actual persistence error after the `Penyimpanan gagal:` prefix instead of hiding the root cause.
- ID/Master tables display business-facing codes (IATA/ICAO, station code, currency code, reference code, etc.) while preserving the internal storage key separately for edit lookup.
- Manually managed ID/reference codes remain editable; NPS/CSI-derived Touch Points remain locked.

### Initiative & Improvement
- Root cause of an initially empty All Journey state was stale shared Journey state surviving SPA route entry. Canonical initialization now defaults to All Journey unless the URL explicitly requests a valid Journey.
- Initiative document/milestone action buttons use English action labels and are protected against clipping.
- Removed the obsolete four-tab map regression contract rather than restoring obsolete runtime behavior.

### Improvement Opportunity
- Reinforced the page as a full-width responsive workspace so Opportunity Review, Source Intake, Create Opportunity and Integrity/Traceability panels do not collapse into narrow clipped columns.

### Regression / Build Gates
- Updated the Network & Map regression contract to require the six-tab canonical station detail and reject return of the obsolete four-tab owner.
- Added guards for Planning root panels, Planning modal/card ownership, vertical Planning card fields, short-link bootstrap, checklist rating/required-mark presentation, and Master Data save feedback.
- `npm test`: 59/59 regression contracts passed; UI integrity passed for 68 pages / 594 asset references.
- `npm run build`: passed.
