# GE Portal — CBNR Clean UI Consolidation Audit

Date: 2026-10-02
Status: **FULL CLEAN PACKAGE — UI CANONICAL REVISED**

## 1. Scope

This revision continues from the existing CBNR baseline. It does **not** reconsolidate MAIN + TEST-1 and does not create a delta package.

The work addresses the UI regressions identified during visual review:

- inconsistent Lounge/Tenant and GHA visual standards;
- legacy/custom dropdown treatment;
- Grid/Details implemented as a select instead of the approved segmented control;
- thin/over-weight button proportions;
- dark/high-contrast guidance text inside form fields;
- inconsistent Price Schedule typography and control height;
- table sorting controls rendered as nested button-like areas instead of making the table header cell the sort target;
- rounded legacy Gantt bars/cells;
- inconsistent modal typography and layering;
- Lounge/Tenant Service & Provider navigation placement;
- duplicate Lounge runtime implementation.

## 2. Canonical UI changes

### Shared controls

- Native `<select>` is now the default dropdown implementation.
- Dropdown indicator is a filled navy triangle inside the field; there is no detached arrow button.
- Dormant `global-select-standard.js` was removed because no production field used its opt-in marker.
- Shared fields use one control height and one typography scale.
- Placeholder/guidance text is muted; entered values remain normal text.
- Buttons use one geometry: balanced height, padding and medium weight; danger actions are filled red with white text.

### Grid / Details

- Planning and Lounge/Tenant no longer use the legacy Grid View / Details View `<select>`.
- Both use the same segmented Grid / Details control.
- The control remains in the toolbar/header area rather than appearing below cards.

### Sortable tables

- Sorting remains a whole-header-cell interaction.
- No nested sort button/pill/circle is introduced.
- Sort state is represented by a small directional indicator in the header cell.

### Modals

- Canonical overlay manager continues to promote dialog backdrops to `document.body`.
- Modal strata remain above the portal shell.
- Title, subtitle/guidance, labels, fields and actions now use the same shared typography and control geometry.

### Lounge/Tenant

- Standalone `assets/lounge-planning-v29.js` was removed because its implementation was already consolidated into `assets/edition1-business-runtime.js`.
- Registry no longer loads that duplicate runtime.
- Add action is `Add`.
- Grid/Details uses the shared segmented control.
- `← Service & Provider` remains in the upper-right heading action area.
- Form guidance is muted and explicitly differentiated from entered values.
- Price Schedule typography and field/button heights are normalized.

### GHA / Service Provider

- Shared card geometry is normalized instead of maintaining a separate visual scale.
- Card typography no longer uses oversized KPI values that distort page balance.

### Gantt

- Legacy rounded cell/bar treatment is removed from the canonical shared presentation.
- Gantt bars use a restrained rectangular geometry.
- Year/scale typography is normalized with the rest of the workspace.

## 3. Cleanup measurements

| Metric | Previous clean package | Current revision |
|---|---:|---:|
| Files | 147 | **145** |
| `.patch` / `.diff` artifacts | 0 | **0** |
| CSS `!important` | 0 after previous cleanup | **0** |
| `portal.css` lines | 5,763 previous | **5,755** |
| CSS/JS/HTML source lines | 31,393 previous | **31,223** |
| Dormant global searchable-select runtime | present | **removed** |
| Standalone Lounge planning runtime | present | **removed / consolidated** |

The remaining `!important` text found by a raw repository search is only a literal reference inside the consolidated regression-gate source describing the historical anti-pattern; it is **not CSS and is not emitted at runtime**. CSS itself contains zero `!important` declarations.

## 4. Regression

Canonical regression gate:

`CBNR_REGRESSION_GATE_PASS TESTS=55`

All 55 contracts pass, including Master Data, Planning, Lounge/Tenant, routing, Firebase/cache, modal layering, UI standardization, and checklist sharing contracts.

Syntax checks passed for the changed canonical JavaScript modules.

## 5. Browser validation limitation

Interactive Chromium capture is not available in the current execution environment; therefore this report does **not** claim a full human-browser visual acceptance test. The UI changes are validated through canonical source inspection and the full regression gate.

The package is intended for the user's next deployment/visual acceptance check. If a visual discrepancy remains, it must be corrected directly in this same CBNR baseline under the no-regression rule.

## 6. CBNR status

This package remains the **same full CBNR baseline**, revised in place. It is not a delta and does not require another MAIN + TEST-1 consolidation.
