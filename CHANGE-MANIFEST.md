# Ground Experience Portal — change manifest

## Implemented in this delta
- Lounge/Tenant station multi-select: **OK** commits the selection; **Cancel**, Escape, and clicking outside revert to the selection before opening.
- Station multi-select labels and actions translated to English.
- Existing filter event is dispatched only on confirmation.

## Verification
- `node --check assets/lounge-planning-v29.js` — passed.
- `npm test` — 58 existing regression tests passed.

## Not yet verified / not delivered in this delta
- Full portal-wide button, typography, filter, and modal standardization.
- Lounge/Tenant Add/Edit end-to-end against Firebase.
- Monitoring & Assessment redesign, GHA pricing schema, dynamic Master Data references.
- Browser visual comparisons and multi-role live data tests.

This is a limited, non-final change. Do not interpret passing source tests as acceptance of the full portal.
