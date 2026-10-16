# Working Delta — NOT READY FOR PRODUCTION

## Verified changes
- Planning modal host lifetime fixed; detail Edit now binds to body-level modal.
- Planning record Edit persists the modified record rather than silently leaving the old object unchanged.
- Planning Delete confirmation executes deletion only on Save/Delete and blocks cross-record references.
- Master Data Type options now include Service & Provider and Standards / Reference.
- Planning category renderer now reads referenceCatalog in addition to legacy planningDomains, without migrating or deleting historical IDs.
- Master Type edit prevents renaming an existing code, to preserve references.

## Automated checks
- node --check assets/planning-domains.js: PASS
- node --check assets/master-reference.js: PASS
- npm test: PASS (58 legacy regression checks).

## Not verified / outstanding
- Full browser interaction testing, Firebase persistence, role/scope tests.
- All-page UI uniformity, images for Planning Workspace cards.
- Lounge/Tenant Add/Edit fixes and comprehensive Monitoring & Assessment rebuild.
- All-button-English and dynamic schema field builder across all domains.

Do not deploy or commit as the requested final integrated patch.

## Subsequent source changes — 2026-10-11
- Master ID duplicate validation now checks `id:${masterIdKind}` rather than unrelated `masterTypeKind`.
- Master/GHA multi-select supports confirmed selection with OK and draft cancellation with Cancel, Escape, or outside click.
- New multi-station GHA records now reach station-specific insertion logic (`!x.id`), instead of the unreachable `!x` condition.
- Master selector controls aligned to 16px checkbox / 14px labels; several English action labels corrected.
- These changes require browser and Firebase validation before deployment.


## 2026-10-11 — Master reference regression repair
- Fixed malformed CSS font shorthand in Master Data/GHA control selectors; typography now uses explicit font-family, font-size, font-weight and line-height.
- Updated historical r38 save contract to accept English Saving/Save failed feedback while retaining busy-state, duplicate-save protection, error handling, and live status assertions. This is a compatibility correction to the test, not a removal of the save assertions.
- `npm test` returned `CBNR_REGRESSION_GATE_PASS TESTS=58`. This does not validate browser/Firebase functionality.

### 2026-10-11 — Assessment workspace control normalization
- Replaced legacy Indonesian text in the Assessment workspace with English labels and feedback.
- Added canonical ge-btn class to previously unstyled table actions and Retry control.
- Aligned canonical button font and control height to 14px / 42px; fixed invalid Planning station button font declaration.
- Browser and Firebase verification are still outstanding; this is not a production release.

### 2026-10-11 — R54 contract alignment and verified build
- Corrected `r54-ground-integration-contract.js` in the consolidated regression gate to assert the active English Assessment action label `Create Ground Touch Point Checklist`, preserving all other integration assertions.
- `npm run build`: PASS (58 regression checks).
- This is not proof of browser visual parity, Firebase persistence, or end-to-end CRUD. No release ZIP issued.
