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

## Stability Recovery — rollback two unintended UI revisions

### Scope
- Restored the visual and functional baseline from immediately before the two revisions that unintentionally redesigned Planning Workspace, Service & Provider, and Initiative state behavior.
- Recovery intentionally avoids redesigning unrelated pages.

### Planning Workspace / Service & Provider
- Restored the pre-regression renderer, typography, card hierarchy, page structure, and page-specific lifecycle.
- Removed the two-revision replacement path that changed the Planning Workspace hub and Service & Provider presentation beyond the requested scope.
- This recovery is a baseline reset only; future shared-component consolidation must preserve this visual baseline first.

### Initiative & Improvement
- Restored the pre-regression `activeJourney` lifecycle and rendering path so the initial page does not inherit the newer shared state that could suppress all Initiative data.
- No visual redesign was introduced.

### Navigation / Performance
- Preserved the existing route lifecycle to avoid introducing cross-page regression.
- Repeated `app.html` navigation now uses a cached static shell with background refresh through the service worker.
- Route assets are pre-warmed on pointer/focus/touch intent and the shared business-data cache is warmed earlier after login.
- API and Firebase traffic remain live; business data is not permanently pinned to the static cache.

### Regression rule
- A correction to one page must not redesign another page or replace its renderer unless that renderer is explicitly inside the agreed scope.


## Stability Recovery — Planning data, modal visibility, Initiative state, navigation latency
- Root cause: canonical UI applied `position:fixed` to every `[role=dialog]` / `[aria-modal=true]`, which could detach a dialog card from its overlay layout and leave only the dark overlay visible. Fixed the global rule and gave the Planning modal card a dedicated canonical class.
- Root cause: cached empty planning/initiative collections could remain on the critical render path until the background manifest refresh. Added an explicit `GEStore.refresh()` path and a one-time fresh recovery when critical collections are unexpectedly empty.
- Root cause: the consolidated Initiative interaction layer referenced the lexical `activeJourney` variable from a different IIFE, producing `activeJourney is not defined`. The canonical interaction layer now owns `window.GE_ACTIVE_JOURNEY` and derives state from the active Journey tab.
- Service & Provider category panels now reuse the existing Planning Workspace hub card/panel pattern instead of introducing another category-card design.
- Navigation latency: Firebase profile validation is reused for up to five minutes for the same authenticated UID; business collection cache already uses a five-minute manifest interval. This removes repeated profile reads without making business data permanently stale.
