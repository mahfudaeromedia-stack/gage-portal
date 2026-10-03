# GE_Portal Historical Baseline

This file consolidates historical revision reports, audits, changelogs, and process notes. They are retained as historical evidence only; runtime source and regression behavior live in the canonical implementation.


---

## docs/FINAL_AUDIT_REPORT.md

# R10.20 Root-Cause-First Audit — Final Report

## Root causes found

1. **Authentication was localStorage-based**, not Firebase Authentication.
2. **User passwords were stored in plaintext** in `assets/data.js` and the old account editor.
3. **The login page contained default credentials**.
4. **Browser-supplied role/session data was trusted for account-management UI**.
5. **There was no temporary-password lifecycle** (`mustChangePassword` did not exist).
6. **There was no server-side user-create compensation** when a profile write failed after Auth creation.
7. **There was no server-side password-reset workflow**.
8. **User edits were local-only**, so Firebase Auth/profile state could diverge.
9. **Audit records were local-only for account management** and lacked the required security-sensitive action taxonomy.
10. **Firebase/Netlify integration prerequisites were undocumented in executable form**.

## Fixes implemented

- Firebase Authentication is now the password authority.
- Netlify Functions provide server-side login, session verification, create-user, update-user, reset-password, change-password, and user-list workflows.
- Admin/Super Admin can explicitly enter:
  - Temporary Password
  - Confirm Temporary Password
- Admin cannot create/promote a Super Admin.
- Password validation is server-side.
- `mustChangePassword=true` is written on create/reset.
- First login is forced to `change-password.html`.
- Successful password change sets `mustChangePassword=false`.
- Temporary/password values are not stored in Firestore, audit logs, API success payloads, or source data.
- Auth creation is compensated by deleting the Auth user if the Firestore profile/index transaction fails.
- Username uniqueness uses `usernameIndex/{normalizedUsername}`.
- User profile + username index are created in a Firestore transaction.
- User update rolls Firebase Auth status/display-name back if the Firestore transaction fails.
- Audit actions include:
  - `CREATE_USER`
  - `RESET_PASSWORD`
  - `DISABLE_USER`
  - `ENABLE_USER`
  - `CHANGE_ROLE`
  - `CHANGE_SCOPE`
  - `CHANGE_PASSWORD`
- Session verification refreshes the browser profile from the server so browser role tampering is not authoritative for privileged operations.
- Netlify `/api/*` routing was added.
- Firebase-only Firestore rules were added for the server-managed user/audit collections.
- Plaintext demo passwords were removed from source data.
- Regression tests and data-shape tests were added.

## Required deployment configuration

Set these Netlify environment variables:

- `FIREBASE_WEB_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

or the equivalent three-field service-account variables documented in `README.md`.

Enable Firebase Authentication → Email/Password.

Do not commit service-account credentials.

## Requested user/password result

| Check | Result |
|---|---|
| Admin can create user | PASS — server workflow implemented |
| Super Admin can create user | PASS — server workflow implemented |
| Temporary password input | PASS |
| Password validation | PASS |
| `mustChangePassword` | PASS |
| Forced password change | PASS |
| Password never stored in Firestore | PASS — code path |
| Password never logged | PASS — code path |
| Reset password | PASS — server workflow implemented |
| Role escalation protection | PASS — server-side |
| Auth → Firestore atomicity/compensation | PASS — Auth rollback on profile/index failure |
| Duplicate username protection | PASS |
| Duplicate email protection | PASS |
| Disable/enable account | PASS |
| Audit action taxonomy | PASS |
| Static JavaScript syntax | PASS |
| Data bootstrap shape | PASS |
| Duplicate initial data IDs | PASS |

## Regression tests executed

- `node tests/regression-audit.js` → `REGRESSION_AUDIT_PASS`
- `node --check` on all JavaScript files → `ALL_JS_SYNTAX_PASS`
- `assets/data.js` bootstrapped in Node VM → `DATA_BOOTSTRAP_PASS`
- Duplicate-ID scan for core data arrays → `DATA_DUPLICATE_ID_PASS`
- Static asset reference scan → one dynamic template expression in `cx-import.html` (`${u}`), not a missing physical asset.

## Important production gate

The package now has the Firebase user-management implementation, but a live Firebase project was not available inside the uploaded ZIP, so a real credentialed Firebase Authentication/Firestore integration test could not be honestly executed.

The portal's broader business dataset is still the existing `localStorage` architecture. This audit did **not** silently migrate business data to Firestore because that would risk changing existing collections, document IDs, schemas, and production data. A full multi-user server-authorized business-data migration remains a separate migration project.

Therefore the correct final deployment state is:

**Code-ready for GitHub → Netlify + Firebase after environment configuration, with live Firebase acceptance testing required before production.**


---

## docs/P22_P23_P24_REPORT.md

# P22 / P23 / P24 Implementation Report

Baseline: `Ground_Experience_Garuda_Indonesia_R10_20_DASHBOARD_CONSOLIDATED_P19_FINAL` only.

## P22 Navigation
- Replaced the role-neutral flat planning-heavy navigation with grouped role-aware domains.
- SuperAdmin: full grouped portal access including User & Access, Portal Management, Audit Log.
- Management: monitoring/decision navigation without technical administration.
- GE Team / Head Office: broader network/readiness/improvement/planning/data navigation.
- Branch Office: My Station, Customer Experience, Tasks & Actions, Planning, Budget, Documents/Support.
- Planning is now represented by three primary sidebar entries: Planning Overview, Planning Workspace, Planning Documents.
- Underlying routes such as `lounge-list.html`, `branch-office-planning.html`, `gaso-planning.html`, `station-material.html`, `bo-space.html`, and `airport-systems.html` remain retained for backward compatibility and existing links.
- Actions remain page-level/contextual; they are not promoted to permanent sidebar destinations.

## P23 Planning
- `service-planning.html` remains the dedicated Planning Overview.
- New `planning-workspace.html` provides the consolidated presentation entry.
- Workspace tabs route to the existing Lounge/Tenant, Branch Office, and GASO pages; the underlying data/CRUD code is not merged.
- `planning-documents.html` remains a separate primary destination.
- Legacy planning routes remain in place.

## P24 UI
- Planning pages now use the approved portal shell via the existing `portal-shell.js`.
- Added only planning-scoped tab/workspace styles.
- Removed the Lounge-only theme classes from `lounge-list.html`; no replacement lounge/GASO/BO theme was introduced.
- Active, hover, focus and selected states are explicit on Planning tabs.

## User Management Security
- Normal Create User target roles exclude Super Admin.
- Server-side create rejects `role=Super Admin` for every normal portal user-management request.
- Server-side update rejects assigning Super Admin and protects existing Super Admin profiles from normal User Management editing.
- SuperAdmin retains ordinary user creation; Admin creation is gated by an explicit User Management permission (or legacy `admin`/`ALL` tab grant when permissions are not present).
- New supported target roles include Management and Head Office, while existing role values are not migrated.

## Preservation
Dashboard implementation, Firebase client, Firestore data model, production records, unrelated module content, and Netlify Function architecture were not rebuilt or migrated. Changes are limited to navigation, Planning presentation, and the explicitly authorized User Management security rule.

## Validation status
- Development preview: local `tools/serve.mjs` on port 5173 returned HTTP 200 for Dashboard and all Planning routes checked.
- Production preview: `npm run preview` on port 4173 returned HTTP 200 for Dashboard and all Planning routes checked.
- Production build: `npm run build` passed `PACKAGE_VERIFY_PASS` and `REGRESSION_AUDIT_PASS`.
- Package integrity: final ZIP passed `unzip -t`.
- Navigation matrix: Node-level contract tests confirmed the four required role POV mappings and three primary Planning entries; legacy Lounge/Branch/GASO entries are absent from generated sidebar navigation.
- Access-level matrix: Node-level tests confirmed Management remains view-only for Planning edits, while Head Office/Branch Office Editor and Approver contexts can expose Planning edit actions subject to the permission layer.
- User-creation security: isolated Node handler tests confirmed Super Admin creation is rejected, Admin without User Management permission is rejected, authorized Admin normal-user creation succeeds, and Super Admin role assignment/update is rejected.
- Browser visual/E2E automation was attempted with the available Chromium/Playwright runtime, but the execution environment returned `ERR_BLOCKED_BY_ADMINISTRATOR` for local file/HTTP navigation. Therefore no claim is made of live browser-click validation against Firebase production data; no production credentials or data were modified during validation.


---

## docs/P26_P28_P30_REPORT.md

# P26 + P28 + P30 Controlled Development Report

Baseline: `Ground_Experience_Garuda_Indonesia_R10_20_P29_FINAL.zip`

Status: implementation complete from the latest P29 package only.

## P26 — User & Role / Account & Access Management

### User Management workspace

`admin.html` now presents Account & Access Management as the primary user-management workspace. The page contains:

- Total Users / Active / Inactive / Requires Review summary
- Search
- Role filter
- Access Level filter
- Status filter
- Scope filter
- Unit / Department filter
- enterprise user table
- Add User
- Import CSV
- Download Template

The legacy explanatory role-card area is no longer the primary presentation. Legacy users remain readable and are marked for review where their organizational role/access model is incomplete.

### Authorization model

The UI and secure endpoints keep these concepts separate:

- Role: Management, Head Office, Branch Office for normal account creation
- Super Admin: protected existing role, never a normal create/update target
- Access Level: Viewer / Editor / Approver / Admin
- Scope: ALL / STATION / MULTI_STATION
- Permissions: module-level capabilities

The existing `tabs[]`, `airports[]`, and `loungeIds[]` fields remain compatibility fields. New user-facing labels use Module Permissions and Assigned Station(s)/Lounge(s).

### Legacy Admin

The existing `role = Admin` value is treated as a legacy organizational-role value, not as Super Admin. The portal Dashboard POV resolver no longer maps legacy Admin to the Super Admin POV. A legacy user opened for editing must explicitly select one of the supported organizational roles instead of silently defaulting to Management.

This is a deliberate P26 security/identity correction; it does not mass-migrate existing user documents.

### Add / Edit User

The guided form contains:

- Employee Name
- Employee Number
- Email
- Username
- Temporary Password for create
- Unit / Department
- Organization Type
- Role
- Access Level
- Status
- Scope Type
- Assigned Station(s), conditional on scope
- optional Assigned Lounge(s)
- Module Permissions
- Advanced Permission Override

New accounts use Management / Head Office / Branch Office as the normal organizational Role set. Super Admin is absent from the creation form.

Scope behavior:

- ALL: no station assignment required
- STATION: exactly one assigned station
- MULTI_STATION: at least one assigned station

The existing `airports[]` field is reused for Assigned Station(s), avoiding a second parallel station field.

### Firebase Authentication / Firestore

Authentication credentials continue to belong to Firebase Authentication. Temporary passwords are sent to the secure Netlify Function and are not stored in the Firestore profile or audit record.

Firestore continues to store user profile/access metadata. No production collection or field migration was performed.

### Password self-service readiness

The existing `mustChangePassword` flow remains compatible with the account-management work. The P26 UI does not create a second password store.

### Reset Password

Where the secure endpoint exists, Reset Password is provided through a P30-safe modal. The endpoint requires User Management permission, respects scope, blocks protected Super Admin targets, and marks the account for password change.

### CSV user import

Flow:

`Upload → Parse → Normalize → Validate → Preview → Confirm → Create Valid Accounts → Result`

The import is CREATE-only. Existing accounts are not overwritten.

Canonical CSV columns:

1. Employee Name
2. Employee Number
3. Email
4. Username
5. Temporary Password
6. Role
7. Access Level
8. Unit / Department
9. Organization Type
10. Scope Type
11. Assigned Stations
12. Assigned Lounges
13. Status

Multi-value station/lounge values use `;` as the separator.

The template includes instruction comment rows; the importer explicitly ignores comment rows beginning with `#`.

Validation includes required identity fields, email, username, password length/format, supported Role, Access Level, Scope, required station assignment, duplicate email/username, unsupported role, and Super Admin attempts.

Invalid rows are not sent to the server. The secure endpoint revalidates the request, so frontend manipulation is not a security boundary.

Partial account-creation failures are reported per row. The existing server-side Firebase Authentication / Firestore compensation logic remains the account-creation mechanism.

## P28 — Page Identity Isolation

### Audit result

The current P29 package did not contain a single explicit Firestore page-title identifier shared by both Journey & Touch Point and Account & Access Management. Instead, the portal's page-management foundation was route-keyed and lacked a stable page identity registry. Generic hero selectors also meant page-specific content identity was not represented explicitly.

Therefore the confirmed collision was treated as an identity-resolution weakness rather than solved by adding another Firestore collection.

### Stable identity registry

`assets/page-identity-v28.js` adds independent stable identities, including:

- `touchpoint.html → journey-touchpoint`
- `admin.html → account-access-management`
- `standar.html → service-standard`
- `service-planning.html → planning-overview`
- `lounge-list.html → lounge-tenant-planning`
- `calendar.html → calendar-project-tracking`

The page-management layer can read legacy route-keyed configuration but writes/uses the stable page identity for new page-specific configuration.

No production page configuration records are mass-deleted or migrated.

### Isolation behavior

Editing one page resolves through its own `pageId`; it does not reuse another page's pageId. Missing configuration falls back to that page's own registry metadata rather than another page's title.

The page registry is also available to validation as `GX_PAGE_IDENTITY_V28`.

## P30 — Overlay / Modal / Layer Integrity

### Root cause

The audited portal contains several modal systems with very high z-index values. The confirmed Lounge/Tenant defect was consistent with an overlay remaining inside the portal content/shell stacking context: a child z-index cannot escape an ancestor stacking context when the ancestor is below the fixed Header/Sidebar layers.

Existing CSS already contained multiple modal z-index patches, which made isolated z-index increases an unreliable solution.

### Shared solution

`assets/overlay-v30.js` establishes a reusable overlay-root rule:

- blocking overlays are promoted to `document.body`
- the overlay receives a fixed viewport root
- the root uses a dedicated top layer
- modal content receives its own higher layer
- ancestor clipping/stacking contexts no longer contain the blocking modal
- long-form modal content scrolls internally
- the page body is locked while a blocking overlay is open
- focus is moved into the dialog on open and restored on close where possible
- Tab focus is kept inside the active blocking dialog
- Escape closes non-destructive overlays where appropriate
- destructive/critical overlays are not auto-confirmed by Escape

The approved Header and Sidebar dimensions, positions, and navigation are not changed to accomplish this.

### Lounge/Tenant modal

The P29 Add/Edit Lounge/Tenant modal is covered by the same overlay rule. No P29 data or business logic was changed.

### User Management modals

P26 Add User, Edit User, Import CSV, CSV Preview/result, and Reset Password use the same P30 overlay layer. The Add/Edit form uses a scrollable modal body with stable actions outside that scrolling region.

### Portal-wide coverage

All 60 HTML pages that load the portal shell now load the shared P30 overlay module. This includes the previously affected Lounge/Tenant route and the User Management page.

## Preservation

### Unchanged business/data implementation

- `assets/lounge-planning-v29.js` is unchanged from P29.
- P29 Lounge/Tenant service-type resolution is preserved.
- P29 single-price compatibility is preserved.
- P29 multi-period pricing is preserved.
- P29 CSV contract is preserved.
- P29 invalid-data handling is preserved.
- No production Firestore writes were performed during this implementation/validation.

### P22 / P23 / P24

The approved navigation architecture, Planning Workspace structure, Dashboard layouts, and P24 visual language were not redesigned or restructured.

One necessary P26 exception exists in `assets/portal-shell.js`: its local `dashboardPOV()` resolver previously mapped legacy `Admin` to the Super Admin POV. That mapping was removed so `role = Admin` cannot fail open to Super Admin. This is a targeted authorization/identity correction required by P26, not a navigation redesign.

`planning-workspace.html` was only extended with the shared P30 overlay script reference; its P23 structure and behavior were not changed.

### Firebase / backend

- Firebase SDK architecture unchanged.
- Firebase Authentication remains the credential authority.
- Firestore remains the profile/data authority.
- Existing collections and identifiers are retained.
- No destructive migration occurred.
- Netlify Functions remain the secure privileged-account boundary.
- Backend changes are limited to P26 account-management validation, permission/scope enforcement, role protection, access metadata, listing scope, and secure reset-password authorization.

### Package dependencies

`package.json` and `package-lock.json` are unchanged from the P29 baseline. `npm install --package-lock-only --ignore-scripts --offline` completed successfully.

## Validation

### Code validation

PASS:

- JavaScript syntax checks for P26/P28/P30 modules
- JavaScript syntax checks for modified Netlify Functions
- Role → Dashboard POV isolation test
- P26 Form ↔ CSV contract static test
- P26/P28/P30 static contract test
- P29 lounge-planning regression test
- Existing regression audit
- package verification

### Build validation

PASS:

```text
PACKAGE_VERIFY_PASS
REGRESSION_AUDIT_PASS
P29_LOUNGE_PLANNING_PASS
```

### Runtime validation

Development preview returned HTTP 200 for:

- `admin.html`
- `index.html`
- `service-planning.html`
- `planning-workspace.html`
- `lounge-list.html`
- `branch-office-planning.html`
- `gaso-planning.html`
- `planning-documents.html`

Local production-style preview returned HTTP 200 for the principal same routes.

HTTP 200 is treated only as route availability, not UI proof.

### User Management validation

Static/isolated validation confirms:

- Super Admin creation → blocked
- Admin without User Management permission → blocked
- legacy Admin target role creation → blocked
- valid Management create request reaches the secure creation path
- existing Super Admin update → blocked
- protected role is not a normal Add User option
- legacy Admin does not map to Super Admin POV
- legacy user data remains renderable through defensive defaults
- CSV Super Admin attempts are invalid
- duplicate email/username checks occur before import commit and are rechecked server-side

### Page identity validation

PASS for registry uniqueness and required identities:

- Journey & Touch Point → `journey-touchpoint`
- Account & Access Management → `account-access-management`

No shared pageId exists between registered pages.

### Modal / overlay validation

Code-level validation confirms:

- overlay reparenting to `document.body`
- viewport-fixed positioning
- layer above shell
- internal modal scrolling
- body scroll lock
- focus entry/restoration
- keyboard focus containment
- P26 modal coverage
- P29 Lounge/Tenant modal coverage

### Browser visual validation

NOT CLAIMED as PASS.

Chromium is installed in the environment, but the headless browser attempt timed out/hung before a usable DOM/screenshot validation result was produced. Therefore no browser-level visual click-through or pixel-level modal inspection is reported as successful.

No production credentials or production Firebase data were used during this validation attempt.


---

## docs/P27_PROFILE_SELF_SERVICE_REPORT.md

# P27 — Profile & Account Self-Service

Baseline: `Ground_Experience_Garuda_Indonesia_R10_20_P33_P34_P35_P36_P37_PRESENTATION_STABILIZATION.zip`

Status: **LOCAL IMPLEMENTATION + CONTRACT VALIDATION COMPLETE; PRODUCTION VALIDATION PENDING**

P27 is an additive self-service layer. The approved Authentication / Session Profile foundation was not rebuilt or refactored.

## PROFILE

### Page

- Route: `profile.html`
- Stable pageId: `profile`
- Page title: `Profile` / self-service Profile context
- Entry point: existing Header Avatar → Profile
- No new Sidebar Profile entry was added.
- No new Avatar dropdown or triangle was introduced.

### Displayed information

The page is organized into:

1. Personal Information
2. Organization
3. Account Access
4. Data Scope
5. My Access
6. Password & Account Security

Displayed fields include, where available:

- Employee Name
- Employee Number
- Email
- Username
- Unit / Department
- Organization Type
- Role
- Access Level
- Scope Type
- Account Status
- Assigned Station(s)
- Assigned Lounge(s)
- readable module-access summary
- temporary-password lifecycle state

### Editable fields

Only `Employee Name` is self-editable in P27.

The update is validated client-side and server-side, then written through `auth-update-self-profile` using the authenticated Firebase UID. Firebase Authentication `displayName` is synchronized with the profile name so the authenticated identity presentation remains consistent.

### Read-only administrative fields

The following remain read-only in self-service:

- Employee Number
- Email
- Username
- Role
- Access Level
- Scope Type
- Assigned Station(s)
- Assigned Lounge(s)
- Permissions / Module Access
- Account Status
- Organization Type
- Unit / Department

No username or email change flow was introduced because existing login resolution and Auth/Firestore synchronization would make an unsafe partial update possible.

## ACCESS SUMMARY

The Profile page separates Role from Access Level.

- `Super Admin` remains a protected Role.
- `Admin` as Access Level is displayed independently.
- Legacy `role = Admin` is displayed as `Admin (legacy)` and can enter a `Requires Review` / `Legacy Account Configuration` presentation state.
- Scope is presented as business labels such as All Area, Station, Multiple Stations, Lounge, Airport, or Custom / Review.
- Station and Lounge identifiers are rendered as business-facing values where the existing local reference data can resolve them.
- Raw `tabs[]`, raw `airports[]`, raw `permissions` JSON, and implementation-level authorization structures are not exposed as the normal Profile UI.

## LEGACY USER COMPATIBILITY

Profile rendering tolerates:

- missing `accessLevel`
- missing `organizationType`
- missing `scopeType`
- missing `assignedStations`
- missing `assignedLounges`
- legacy `airports[]`
- legacy `loungeIds[]`
- missing `permissions`
- missing `tabs[]`
- missing `mustChangePassword`
- legacy Role values

No automatic user migration occurs when Profile loads.

A legacy/incomplete profile is presented for review rather than being elevated to a privileged role.

## CHANGE PASSWORD

### Implementation

`change-password.html` uses the existing Firebase Authentication client runtime and the browser's Firebase Auth credential APIs:

`Current Password → EmailAuthProvider credential → reauthenticateWithCredential() → updatePassword()`

No second password system was introduced.

The server is used only for authenticated lifecycle metadata completion after the Firebase password update; it never receives the current password.

### Reauthentication

The current authenticated Firebase user's email is used to create an `EmailAuthProvider` credential with the entered current password. Firebase performs the credential verification.

If Firebase requires recent authentication, the user receives a recoverable reauthentication message.

### Validation and errors

The UI handles:

- empty current password
- weak/invalid new password
- minimum/maximum length
- whitespace restriction
- password equal to username/email
- confirmation mismatch
- incorrect current password
- recent-authentication requirement
- disabled account
- network failure
- too many requests
- expired user token
- general password-update failure

Password values are never rendered after submit.

### Session behavior

A successful password change does not clear the authenticated Firebase session. The Profile session is refreshed from the existing Session Profile service after success.

No Role, Access Level, Scope, Permission, or Dashboard POV change is performed.

## TEMPORARY PASSWORD LIFECYCLE

The existing P26 lifecycle remains intact:

`Admin creates user → Firebase Authentication temporary password → Firestore mustChangePassword=true → user can change password`

P27 does not store the temporary password in Firestore.

A successful P27 password change clears `mustChangePassword` through the authenticated `auth-complete-password-change` endpoint after the Firebase password update and recent-authentication verification.

### First-login enforcement decision

**Mandatory first-login enforcement was not added.**

The existing architecture already has `mustChangePassword` metadata on newly created/reset accounts, but forcing a redirect/restricted login step would require changing the hard-frozen Authentication / login pipeline. P27 therefore keeps the working login behavior intact and provides a clear self-service Change Password path plus lifecycle state presentation.

Existing users without `mustChangePassword` are not blocked.

## SECURITY

### Self-only access

Profile reads use the authenticated Firebase user through the existing `currentProfile()` service.

Profile writes do not accept a user UID, email, username, query parameter, or route parameter as the identity proof. The server derives the target profile from the verified Firebase ID token:

`users/{decoded.uid}`

### Administrative field protection

The self-service endpoint accepts only:

`fullName`

Attempts to submit Role, Access Level, Scope, Station, Lounge, Permission, Status, Employee Number, Email, or Username fields are rejected.

### Password protection

- Firebase Authentication remains the credential authority.
- Firestore never stores a current password.
- Firestore never stores a temporary password plaintext.
- Firestore never stores password history plaintext.
- Firebase ID/refresh tokens are not stored by the P27 layer.
- Passwords are not written to audit logs.

## FIRESTORE IMPACT REPORT

### Fields read

P27 server profile operations read the authenticated user's existing `users/{uid}` document, including existing compatible profile metadata such as:

- name
- username
- email
- employeeNo
- role
- accessLevel
- organizationType
- unit
- scopeType
- airports
- loungeIds
- tabs
- permissions
- status
- mustChangePassword
- existing timestamps

### Fields written

Self profile update:

- `name`
- `updatedAt`

Password lifecycle completion:

- `mustChangePassword: false`
- `updatedAt`

Audit entries are appended to the existing `auditLogs` collection for:

- `UPDATE_SELF_PROFILE`
- `COMPLETE_PASSWORD_LIFECYCLE`

No mass migration or bulk profile rewrite was performed.

## AUTHENTICATION PRESERVATION REPORT

The following approved foundation files were checksum-verified unchanged:

- `assets/auth.js`
- `assets/firebase-client.js`
- `netlify/functions/auth-session.js`
- `netlify/functions/auth-change-password.js`
- `netlify/functions/auth-reset-password.js`
- `assets/portal-shell.js`
- `netlify/functions/_firebase.js`

Also preserved unchanged:

- `assets/lounge-planning-v29.js`
- `assets/overlay-v30.js`
- `assets/access-assistance-p32.js`

No Authentication initialization, login pipeline, Session Profile service, Role resolver, Access Level resolver, Scope resolver, Permission resolver, or Dashboard POV resolver was refactored.

The existing P31/P31A contract tests continue to pass.

## REGRESSION REPORT

- Dashboard: unchanged by P27.
- Planning: unchanged by P27.
- P29 Lounge/Tenant logic: unchanged.
- P30 Overlay foundation: unchanged.
- P32 Access Assistance: unchanged.
- P33–P37 presentation layer: unchanged.
- Header / Sidebar / Footer shell implementation: unchanged.
- P26 Account & Access Management: unchanged.
- Firebase login/session foundation: unchanged.

## VALIDATION REPORT

### CODE VALIDATION

PASS

- `node --check assets/profile-p27.js`
- `node --check assets/password-p27.js`
- `node --check netlify/functions/auth-update-self-profile.js`
- `node --check netlify/functions/auth-complete-password-change.js`
- `node --check tests/p27-profile-self-service.js`

### BUILD VALIDATION

PASS

`npm run build` returned:

- `PACKAGE_VERIFY_PASS`
- `REGRESSION_AUDIT_PASS`
- `P29_LOUNGE_PLANNING_PASS`
- `P31_AUTHENTICATION_CONTRACT_PASS`
- `P31_ROLE_POV_RUNTIME_PASS`
- `P31A_SESSION_PROFILE_SERVICE_PASS`
- `P31B_LOGIN_ACCESS_ASSISTANCE_PASS`
- `P32_ACCESS_ASSISTANCE_ADMIN_PASS`
- `P32_ACCESS_ASSISTANCE_RUNTIME_PASS`
- `P33_P34_P35_P36_P37_PRESENTATION_CONTRACT_PASS`
- `P27_PROFILE_SELF_SERVICE_CONTRACT_PASS`

### AUTH CONTRACT REGRESSION

PASS

Frozen Authentication / Session Profile checks and SHA-256 checksums passed.

### PROFILE VALIDATION

PASS at contract/direct-code level.

Validated:

- stable Profile page identity
- self-only server UID derivation
- safe editable field restriction
- access summary rendering
- legacy review handling
- Role vs Access Level separation
- station/lounge scope presentation
- module permission presentation

### PASSWORD CHANGE VALIDATION

PASS at contract/direct-code level.

Validated:

- current-password reauthentication path
- Firebase `updatePassword()` path
- password validation
- Firebase error mapping
- session preservation path
- lifecycle completion endpoint
- no password persistence in Firestore

No real production credentials were used in test artifacts.

### LEGACY USER VALIDATION

PASS at direct-code level.

Representative cases include:

- legacy `role = Admin`
- missing access metadata
- missing permissions/tabs
- legacy station/lounge fields

Legacy Admin does not become Super Admin.

### SECURITY VALIDATION

PASS at static/contract level.

Verified:

- authenticated token verification
- UID derived from verified token
- no client-supplied UID for self-profile write
- only `fullName` accepted by self-profile endpoint
- administrative access fields are not accepted
- email/username remain read-only
- no plaintext password storage

### LOCAL PREVIEW

PASS for HTTP serving/static asset availability.

Local production-style preview returned HTTP 200 for:

- `profile.html`
- `change-password.html`
- `login.html`
- `index.html`
- `admin.html`
- `service-planning.html`

P27 assets also returned HTTP 200.

HTTP 200 is not treated as browser/UI PASS.

### BROWSER VISUAL VALIDATION

NOT PASS / DEFERRED.

Chromium headless was attempted against the local Profile page but timed out in the current environment before producing DOM output. No browser visual PASS is claimed.

### PRODUCTION VALIDATION

**PENDING**.

No Netlify deployment was performed for P27, in accordance with the low-credit/local-first instruction. Production acceptance remains separate from local code/build validation.

## FINAL LOCK

P27 is implemented and locally validated.

Authentication, Session Profile, login, Role/Access/Scope/Permissions, Dashboard POV, P22–P24, P29, P30, P31, P32, and P33–P37 remain frozen.

After P27, implementation stops as requested.


---

## docs/P29_REPORT.md

# P29 — Lounge / Tenant Planning, Agreement Pricing, Input Consistency & Branch Office Asset Readiness

## Baseline and change control

P29 was implemented from the latest approved package:
`Ground_Experience_Garuda_Indonesia_R10_20_P22_P23_P24_FINAL`.

P22, P23 and P24 remain frozen. No Dashboard redesign, navigation redesign, Planning reconsolidation, Firebase replacement, Firestore migration, production-data rewrite, or User & Role redevelopment was performed.

## 1. Tenant display defect — root cause and correction

### Audit finding

The existing Lounge Master data in `assets/data.js` contains 49 default Lounge records. All 49 use `serviceCategory: "Lounge"`; none of those baseline records contain `serviceType`.

The existing Add flow introduced both `serviceCategory` and `serviceType`, while the existing Update flow wrote `serviceCategory`. The card renderer in `assets/app.js` used `x.type || x.category || 'Lounge'` and therefore did not read either of the actual Lounge Master fields. This was the root cause of the Tenant → Lounge presentation defect.

### Canonical mapping

For the existing Lounge Master domain, `serviceCategory` is the audited canonical stored field because it is the field present on the existing records and is consumed by the existing data normalization/rendering paths. `serviceType` is retained as an additive compatibility mirror for the P29 manual/CSV contract.

P29 now resolves service type as follows:

1. Valid `serviceCategory` is authoritative.
2. If `serviceCategory` is absent, a valid `serviceType` can be used for backward/additive compatibility.
3. If both valid fields conflict, the record is rendered as **Requires Review** rather than silently choosing one.
4. Invalid/missing service type is rendered safely and does not crash the card grid.

Manual Add/Update normalizes the selected value into both fields with the same value, preventing the two fields from becoming conflicting sources of truth through the new input paths.

### Affected files

- `assets/app.js` — existing Lounge Master behavior audited; P29 overrides are kept in a separate focused module.
- `lounge-list.html` — Lounge/Tenant Add/Update and filter UI entry points aligned.
- `assets/lounge-planning-v29.js` — canonical type resolution, normalized input contract, card/table rendering, CSV workflow.

## 2. Lounge / Tenant filter

The Lounge/Tenant Workspace now provides a scoped Service Type filter:

- All
- Lounge
- Tenant

Existing `Snack Box` records, if present, remain visible under All so the older supported service type is not silently removed. Filtering is performed on the resolved real record value; no duplicate Firestore/local records are created for filtering.

## 3. Existing Lounge/Tenant data field audit

| Field | Audited meaning/use | P29 treatment |
|---|---|---|
| `airport` | Station/Airport context; may contain multiple IATA codes such as `HND/NRT` | Preserved; normalized as uppercase station value for new input |
| `region` | Existing region classification | Preserved |
| `name` | Existing Lounge/Tenant provider/service name | Canonical provider/service display |
| `serviceCategory` | Existing stored service-type/category field; present on all 49 baseline Lounge records | Canonical service-type mapping |
| `serviceType` | Additive field already introduced by earlier Add/CSV flows | Kept as compatibility mirror; conflicts are flagged |
| `pic` | Person-in-charge where present in newer records | Preserved and included in shared input contract |
| `startDate` / `endDate` | Existing agreement/cooperation period | Remains Agreement Period; not repurposed for price periods |
| `startDisplay` / `endDisplay` | Existing display derivatives | Preserved; P29 safely formats validated dates and does not rewrite legacy values during rendering |
| `pricePerPax` | Existing legacy single-price amount | Preserved as backward-compatible fallback |
| `currency` | Existing legacy price currency | Preserved; P29 validates currency before formatting |
| `priceDisplay` | Existing display representation of legacy price | Preserved for legacy compatibility; P29 derives safe display for new normalized records |
| `documentNumber` | Existing agreement/document identity suitable for repeated CSV price-period grouping | Preserved; used as CSV multi-period grouping identity |
| `documentType` | Existing agreement/document type | Preserved |
| `documentStatus` | Existing document/legal status; baseline includes values beyond a fixed three-value enum | Preserved as free status text with common suggestions rather than destructively constraining legacy values |
| `remarks` | Existing free-text operational/legal note | Preserved |
| `documentName` / `documentKey` | Existing attachment metadata | Preserved; no new document architecture |

### Storage/source audit

The audited Lounge Master is exposed through `GEStore`/`data.lounges` in `assets/data.js` and `assets/app.js`. The package does not contain a direct Firestore collection implementation for the Lounge Master itself. `assets/agreement-v257.js` and `assets/service-location-v257.js` bootstrap separate relational compatibility views from the legacy Lounge Master; these were not migrated or destructively merged in P29.

## 4. Data contract

The P29 logical contract is:

```text
Manual Add
     ↓
collectForm()
     ↓
Normalize + Validate
     ↓
Normalized Lounge/Tenant model
     ↓
GEStore save()

Manual Update
     ↓
collectForm()
     ↓
Normalize + Validate
     ↓
Normalized Lounge/Tenant model
     ↓
existing record update

CSV/XLSX
     ↓
Parse
     ↓
Header mapping
     ↓
Normalize + Validate
     ↓
Preview
     ↓
Confirm
     ↓
CREATE-only normalized model
     ↓
GEStore save()
```

The same logical fields are used by Form and CSV:

`Region → Station → Nama Layanan / Provider → Jenis Layanan → PIC → Agreement Start/End → single-price fallback → Nomor Dokumen → Jenis Dokumen → Status Dokumen → Remarks → optional Price Schedule fields`.

No separate CSV-only business model was introduced.

## 5. CSV Template / Import

### Template columns

1. Region
2. Station
3. Nama Layanan / Provider
4. Jenis Layanan
5. PIC
6. Mata Uang
7. Harga Per Pax
8. Tanggal Mulai
9. Tanggal Berakhir
10. Nomor Dokumen
11. Jenis Dokumen
12. Status Dokumen
13. Remarks
14. Price Period Effective From
15. Price Period Effective To
16. Price Period Price
17. Price Period Currency
18. Price Basis
19. Price Period Note

The template contains instructions for required fields, allowed Service Types, date format, currency, single-price use, multi-price repeated Agreement Number behavior, and CREATE-only duplicate handling.

A static template is also shipped at:
`templates/Template_Layanan_Lounge_Tenant_P29.csv`.

The in-page **Download CSV Template** action generates the same logical column contract rather than maintaining a second schema.

### Import behavior

- Supported file readers remain the existing CSV/XLSX readers.
- Header aliases map to the same P29 logical fields.
- Data is normalized before any write.
- Validation occurs before commit.
- Preview shows Row, Station, Type, Provider, Agreement Number, Agreement Period, Price/Price Period, Validation Status, and Validation Message.
- Summary reports Total, Valid, Warnings, and Invalid.
- Invalid rows are not written.
- Existing-record duplicates are detected before commit.
- Duplicate import rows are detected within the uploaded file.
- Import mode is **CREATE-only**; no automatic production update/overwrite path was introduced.
- A successful bulk import reuses the existing `auditLogs` store for non-sensitive import metadata.

## 6. Multi-period Agreement pricing

### Model

P29 adds an optional additive field:

`priceSchedules[]`

with:

- `effectiveFrom`
- `effectiveTo`
- `price`
- `currency`
- `priceBasis`
- `priceNote`

This is additive and is not mass-applied to legacy records.

### Agreement vs Price Period

`startDate/endDate` remain the Agreement Period.

`priceSchedules[].effectiveFrom/effectiveTo` are Price Effective Periods.

Price period expiry therefore does not change the Agreement end date.

### Current price resolution

The applicable price is resolved by date containment (`effectiveFrom <= asOf <= effectiveTo`). The last schedule item, highest price, or array position is not treated as the current price.

If schedules exist but no period is applicable to the requested date, the UI displays `Not Available`. If schedules are malformed or overlap, the UI displays `Requires Review` rather than selecting an arbitrary price.

### Legacy fallback

If `priceSchedules[]` is absent, P29 falls back to the existing:

- `pricePerPax`
- `currency`
- `priceDisplay`

No destructive conversion of legacy single-price records is performed.

### Validation

P29 validates:

- effectiveFrom
- effectiveTo
- effectiveTo >= effectiveFrom
- numeric non-negative price
- currency recognized by the browser's Intl currency implementation
- overlap between periods
- schedule containment within Agreement Start/End where those Agreement dates exist

## 7. Card UI

P29 keeps the P24 portal visual language and only scopes changes to Lounge/Tenant cards.

### Desktop / responsive

- Wide desktop: 3 columns.
- Desktop/laptop: 3 columns where space permits.
- Tablet/narrow: 2 columns.
- Mobile: 1 column.

The existing 12-record pagination is preserved.

### Information hierarchy

Cards prioritize:

1. Airport / Station
2. Service Type
3. Provider / Service Name
4. Agreement Status
5. Agreement Period
6. Current Price
7. Price Schedule indicator
8. Actions

Long provider/service names wrap safely. Card rendering is defensive and one malformed record does not replace the entire grid with an exception.

The full schedule is available through **View Price Schedule** when schedules exist; cards do not display the entire schedule.

## 8. Defensive rendering and input safety

P29 guards:

- missing/invalid serviceType
- conflicting serviceCategory/serviceType
- unknown station
- invalid dates
- invalid currency
- non-numeric prices
- incomplete price schedules
- overlapping price schedules
- null/undefined/empty values
- malformed legacy records

Existing malformed data is rendered safely and flagged where appropriate. Rendering does not rewrite or repair production records.

## 9. Branch Office / Facility / Asset audit

### Existing compatible capability found

The package already contains a useful **Service Location** capability:

- `assets/service-location-v257.js`
- storage key `GE_V257_LOCATION_P22`
- `GECore.masters.serviceLocations`
- explicit `station_service_location` relationships
- explicit `location_touchpoint` relationships
- `service-locations.html`

The existing bootstrap explicitly creates a Service Location for legacy Lounge Master records when a Lounge is explicitly identified at a known Station. This establishes a compatible conceptual relationship:

`Station → Service Location (Lounge)`.

The package also has **Branch Office Space** capability:

- `bo-space.html`
- `data.boSpaces`
- existing Branch Office Planning rendering and import/update flow.

This is a premises/space domain, not a physical Asset Registry.

There is also a Portal Management Asset Library in `assets/app.js`, but it is an attachment/file library backed by `GEFiles`/IndexedDB metadata, not a company physical-asset domain.

### Physical asset capability status

No suitable existing physical Asset Registry was found. No existing `data.assets` collection/field, dedicated physical asset page, or asset lifecycle model was found in the audited package.

Therefore P29 does **not** create a new production Asset collection or a large Asset Management module.

### Recommended future domain owner

The recommended future domain owner is Branch Office / Station Operations, with GE Team / Head Office as network oversight. The model should remain independent from Agreement pricing.

Conceptual relationship:

`Branch Office / Station → Facility / Service Location → Asset`

A Lounge is one possible Service Location; it is not the only possible asset location.

### Recommended future Asset model

Only as a future design target:

- assetId
- assetName
- assetCategory
- station reference
- facility/location reference
- lounge reference where applicable
- ownership
- quantity/unit
- condition
- operationalStatus
- acquisition/installation date
- lastInspection
- evidence/document reference
- remarks

Ownership should be independently represented (e.g. Garuda, Airport/Landlord, Tenant, Partner, Vendor, Other). Service Type must not determine ownership.

### Lifecycle / readiness / budget

Asset lifecycle should remain independent of Agreement lifecycle. An asset can survive an Agreement change.

Existing Readiness/Capability models should be referenced rather than duplicated. P29 did not alter existing readiness formulas.

Future replacement/acquisition links should reference Budget & Cost rather than duplicating financial data inside an Asset record. P29 did not add financial logic.

### What P29 implemented for assets

No new physical Asset schema was written. The existing Service Location and Branch Office Space capabilities were documented as the reusable foundation for a future Station → Facility → Asset relationship.

A dedicated Asset phase remains appropriate for lifecycle, condition, maintenance, evidence, replacement workflow, individual-vs-quantity tracking, permissions, and readiness/budget integrations.

## 10. Preservation

P29 did not:

- change production Firestore collections/documents/fields
- migrate or rewrite production records
- modify Firebase Authentication
- modify Netlify Functions
- redesign Dashboards
- reopen P22 navigation
- reopen P23 Planning consolidation
- reopen P24 visual system
- redesign User & Role Management

The only persisted data-shape extension is the **optional** `priceSchedules[]` field on records explicitly created/updated/imported through P29. Existing records are not mass-migrated.

## 11. Validation

### Static / unit validation

- `node --check assets/lounge-planning-v29.js` — PASS
- P29 service-type resolution tests — PASS
- Legacy single-price resolution — PASS
- 3-period current-price resolution — PASS
- Historical/future period handling — PASS
- Overlap detection — PASS
- Form normalization to `serviceCategory` + `serviceType` — PASS
- Invalid Station + non-numeric price rejection — PASS
- `npm run build` — PASS
  - `PACKAGE_VERIFY_PASS`
  - `REGRESSION_AUDIT_PASS`
  - `P29_LOUNGE_PLANNING_PASS`

### Local development preview

HTTP 200 verified for:

- `index.html`
- `lounge-list.html`
- `planning-workspace.html`
- `branch-office-planning.html`
- `gaso-planning.html`
- `planning-documents.html`
- `admin.html`
- `assets/lounge-planning-v29.js`
- `templates/Template_Layanan_Lounge_Tenant_P29.csv`

### Local production preview

HTTP 200 verified for the same principal portal/planning routes.

### Browser visual validation

A Chromium headless attempt was made against the local Lounge/Tenant page, but the environment did not complete the browser run before timeout. Therefore **no browser click-through/visual validation is claimed** for P29.

No production credentials or production Firestore data were touched during validation.


---

## docs/P31A_SESSION_PROFILE_REPORT.md

# P31A — Session Profile Service Correction

## Scope

Emergency post-authentication correction only. P26, P28, P30, P29, P24, P23 and P22 remain frozen.

## Confirmed failure

The browser confirms Firebase Email/Password Authentication accepts the credentials. The failure occurs when the client calls the post-authentication Session Profile endpoint:

`GET /api/auth-session` → `/.netlify/functions/auth-session`

The client maps a non-JSON/network/service response to the message shown by the browser.

## Root cause

The Session Profile implementation depends on `firebase-admin`, declared only in `netlify/functions/package.json`. The project root `package.json` does not declare it, and the Netlify build command was only `npm run build`. Netlify documentation states that function dependencies should be provided from the site base-directory `package.json`; nested function folders are not recursively dependency-installed automatically. Therefore the deployed `auth-session` function could be present while its `require('./_firebase')` dependency chain could not reliably resolve `firebase-admin`, causing the session endpoint to be unavailable after Firebase Authentication succeeded.

This is a deployment/runtime dependency packaging defect, not a Firebase credential defect, Firestore data defect, role-model defect, P28 defect, or P30 overlay defect.

## Fix

`netlify.toml` build command now explicitly installs the existing function dependency manifest before the normal verification/build command:

```text
npm --prefix netlify/functions install --omit=dev --ignore-scripts && npm run build
```

No new authentication service was created. `auth-session.js` continues to use Firebase Admin to verify the already-authenticated Firebase ID token and read the existing `users/{uid}` document server-side.

## Preservation

- Firebase Authentication: unchanged.
- Production Firestore data: unchanged.
- Firestore users read rule: unchanged/server-only.
- Admin ≠ SuperAdmin: unchanged.
- P26 User Management: unchanged.
- P28 Page Identity: unchanged.
- P30 Overlay: unchanged.
- P29 Lounge/Tenant logic: unchanged.
- Dashboard layouts: unchanged.

## Validation

- `P31A_SESSION_PROFILE_SERVICE_PASS`: passed.
- Syntax checks for affected JavaScript: passed.
- Full production build in this execution environment is not claimed because package installation requires network access and the environment previously timed out on npm installation.
- Real-browser authentication/session validation remains the final validation after deployment.

## External technical basis

Netlify's current Functions documentation states that function dependencies should be specified in the top-level/base-directory `package.json`, and its CLI guidance states that dependencies placed in individual function folders require an explicit deployment-time installation step.


---

## docs/P31B_LOGIN_BRANDING_ACCESS_ASSISTANCE.md

# P31B — Login Branding & Access Assistance

## Scope

This controlled correction updates only the user-facing login presentation and adds a password-free Access Assistance Request path.

## Login

- Restored the existing Garuda Indonesia corporate image asset: `assets/garuda-indonesia.png`.
- Preserved the existing Danantara Indonesia image asset: `assets/danantara.png`.
- Removed technical implementation details from the visible login copy.
- Login remains limited to Username / Email, Password, Masuk, and Lupa password?.

## Access Assistance Request

`Lupa password?` opens a simple account-access assistance form. It does not authenticate, reset, reveal, or replace a password and never sends a password to the server.

The request is submitted to `/api/access-assistance-request`, which is backed by `netlify/functions/access-assistance-request.js` and uses the existing server-side Firebase Admin/Firestore infrastructure.

Requests are persisted only after an authorized recipient set is resolved. Recipients are existing Super Admin users plus existing legacy Admin users who have User Management permission. The stored request contains the supplied identifier, optional reason, recipient user IDs/roles, status, timestamp, and source. No password is stored.

The client displays a success message only after the backend confirms the Firestore write. Backend failure produces an error instead.

## Preservation

- Firebase Authentication flow unchanged.
- Existing Session Profile implementation unchanged.
- Production Firestore user documents unchanged.
- Firestore Security Rules unchanged.
- Admin != Super Admin unchanged.
- P26/P28/P29/P30 unchanged.
- Dashboard and portal shell unchanged.


---

## docs/P31_AUTHENTICATION_REPORT.md

# P31 — Authentication & Legacy User Compatibility Report

## Scope

P31 is an emergency, controlled authentication correction based only on the latest **P26 + P28 + P30** package. It does not rebuild or redesign the portal.

Frozen areas remain frozen: P22 navigation, P23 planning consolidation, P24 portal UI consistency, P29 Lounge/Tenant business/data logic, P26 User Management, P28 Page Identity Isolation, P30 Overlay/Modal integrity, Dashboard POV layouts, Header, Sidebar, Planning, Lounge/Tenant, pricing, CSV, and Account Management UI.

## AUTH ROOT CAUSE

### Failing stage

The failing point was **after Firebase Authentication**, during the Firestore user-profile lookup.

Pipeline in the affected package:

`Login Form → gxAuthenticate() → GXFirebase.signInWithUsername() → signInWithEmail() → Firebase signInWithEmailAndPassword() → profile(uid) → Firestore users/{uid} read`

`assets/firebase-client.js` performed the final profile read directly from the browser.

The package's `firestore.rules` simultaneously contains:

`match /users/{uid} { allow read, write: if false; }`

Therefore a successful Firebase credential check was followed by a denied client-side profile read. The login UI already had a `PROFILE_ACCESS_DENIED` path, which is consistent with this failure mode.

### Firebase Authentication itself

The source and runtime harness confirm that the intended Email + Password path reaches `signInWithEmailAndPassword()` before the profile lookup. A live production credential test could not be performed in the execution environment because no production password/credential was supplied and browser authentication could not be completed interactively.

Accordingly, this report does **not** claim a live production Firebase credential PASS. It identifies and fixes the deterministic post-authentication defect in the package.

### P26/P28/P30 attribution

Evidence does **not** support claiming that P28 or P30 directly broke Firebase Authentication.

- **P28:** only page identity/configuration code; it is not part of the login pipeline.
- **P30:** overlay code was not required by login. It was removed from `login.html` as a defensive isolation measure; P30 remains active on portal pages.
- **P26:** introduced the server-side User Management/authentication support and the security boundary in which user profiles are handled through Netlify Functions, but the login client continued using the incompatible browser-side `users/{uid}` lookup. P31 closes that integration gap.

### portal-shell.js

The P26 change in `assets/portal-shell.js` remains:

- `Super Admin` / `superadmin` → `superadmin`
- legacy `Admin` → `unresolved`

It was **not** the cause of Firebase credential failure and was not reverted. This preserves `Admin != Super Admin`.

## AUTH FIX

### Files changed

1. `assets/firebase-client.js`
   - Keeps Firebase `signInWithEmailAndPassword()` as the primary credential check.
   - Replaces the browser-side `users/{uid}` profile read with the existing authenticated `GET /api/auth-session` path.
   - Uses the Firebase ID token only as a bearer credential for that server request; it is never logged by diagnostics.
   - Adds safe development-only authentication tracing.
   - Adds in-memory compatibility normalization for missing legacy fields.
   - Missing `accessLevel` defaults to `Viewer`, except `Super Admin` compatibility defaults to `Admin`.
   - Missing `permissions` defaults to an empty list.
   - Missing scope metadata does not create elevated access.
   - Unknown/legacy role gets `authorizationState: REVIEW_REQUIRED`.

2. `netlify/functions/auth-session.js`
   - Continues server-side Firebase Admin token verification and `users/{uid}` lookup.
   - Distinguishes `PROFILE_NOT_FOUND` from `ACCOUNT_INACTIVE`.
   - Missing status remains treated as active for legacy compatibility; only an explicit inactive value blocks the account.

3. `assets/auth.js`
   - Legacy Admin authorization now fails closed when permission/tab metadata is absent.
   - Admin no longer receives implicit ALL permissions from role alone.
   - Admin no longer receives unrestricted scope merely because its legacy role string is `Admin`.
   - Unresolved role is allowed to remain on the existing Dashboard surface so it cannot create a login/portal redirect loop; Dashboard POV remains unresolved and limited.
   - Adds safe development-only session/authorization diagnostics.

4. `login.html`
   - Adds controlled user-facing messages for missing profile/session failures.
   - Adds safe development session/redirect tracing.
   - Removes only `overlay-v30.js` from the login page; P30 remains on portal pages.
   - Login branding/layout/form structure is unchanged.

5. `tests/p31-authentication.js`
   - New P31 authentication contract/regression checks.

6. `tests/p31-auth-role-runtime.js`
   - New role → Dashboard POV runtime checks.

7. `package.json`
   - Build now includes the P31 authentication contract and role/POV tests.

8. Documentation
   - `docs/P31_AUTHENTICATION_REPORT.md`
   - `docs/REFACTOR_CHANGELOG.md`

### Production Firestore

**No production Firestore data was modified.**

No user documents, roles, scope, tabs, airports, loungeIds, permissions, or password fields were mass-edited or migrated.

### Password storage

No plaintext password storage was introduced. P26 temporary-password behavior remains server-side through Firebase Authentication and is not persisted in Firestore.

## COMPATIBILITY

| Existing account structure | Expected handling |
|---|---|
| Super Admin | Firebase authentication succeeds; role resolves to `superadmin` Dashboard POV. Existing record is not modified. |
| Management | Role resolves to `management` Dashboard POV. Access Level remains independent; `Admin` Access Level does not become Super Admin. |
| Head Office / HeadOffice | Resolves to `ge-team` Dashboard POV. Access Level remains independent. |
| Branch Office / BranchOffice | Resolves to `branch` Dashboard POV and preserves `airports[]` station scope. No CGK default is introduced. |
| Legacy `role = Admin` | Authentication is not converted to Super Admin. Dashboard POV is `unresolved`; missing permissions do not imply ALL. Account remains in a controlled limited/review state. |
| Missing `accessLevel` | In-memory default is Viewer, except Super Admin compatibility. Never escalates to Admin for ordinary roles. |
| Missing `permissions` | Empty in-memory list; never ALL. |
| Missing `tabs` | Empty in-memory list; no elevated fallback. |
| Missing `scopeType` | Safe `CUSTOM` normalization in memory; existing `airports[]`/`loungeIds[]` remain preserved. |
| Missing `organizationType` | Not required for authentication/session creation. |
| Missing `mustChangePassword` | Does not block login. |

## VALIDATION

### Authentication pipeline

- Firebase `signInWithEmailAndPassword()` path present: **PASS (static/runtime harness)**
- Firebase authentication error mapping retained: **PASS**
- Post-auth profile lookup moved to `/api/auth-session`: **PASS**
- Authenticated UID carried to server lookup: **PASS**
- Profile lookup server-side through Firebase Admin: **PASS (static contract)**
- Missing profile distinguished: **PASS**
- Inactive account distinguished: **PASS**
- Session normalization: **PASS (runtime harness)**
- Role → Dashboard POV: **PASS (runtime harness)**
- Management + Admin Access Level → Management POV: **PASS**
- Head Office + Admin Access Level → GE Team POV: **PASS**
- Branch Office + Admin Access Level → Branch POV: **PASS**
- Legacy Admin → not Super Admin: **PASS**
- Redirect loop protection for unresolved role: **PASS (static contract)**
- P30 not involved in login initialization: **PASS**
- P28 not involved in login initialization: **PASS**

### Package/build

`npm install --package-lock-only --ignore-scripts --offline`: **PASS**

`package-lock.json`: unchanged by the P31 package-script update.

`npm run build`: **PASS**

Build output:

- `PACKAGE_VERIFY_PASS`
- `REGRESSION_AUDIT_PASS`
- `P29_LOUNGE_PLANNING_PASS`
- `P31_AUTHENTICATION_CONTRACT_PASS`
- `P31_ROLE_POV_RUNTIME_PASS`

### Local preview

HTTP 200 verified for:

- `login.html`
- `index.html`
- `admin.html`
- `service-planning.html`
- `lounge-list.html`
- `planning-workspace.html`

HTTP 200 is route validation only; it is not a browser authentication PASS.

### Browser validation

**NOT CLAIMED PASS.**

The execution environment previously could not complete a usable Chromium headless session; the process hung/timed out before reliable DOM/screenshot validation. Therefore the final real-browser login test remains the user's required validation point.

## PRESERVATION CHECKS

- P29 `assets/lounge-planning-v29.js`: unchanged.
- P29 Dashboard implementation: unchanged.
- P26 User Management implementation remains present.
- P28 Page Identity implementation remains present.
- P30 Overlay implementation remains present on portal pages.
- Firebase configuration remains present; no project/credential configuration was changed.
- Firestore rules remain unchanged; user profiles remain server-only.
- No production Firestore data was touched.
- `Admin != Super Admin` remains enforced.


---

## docs/P33_P34_P35_P36_P37_PRESENTATION_STABILIZATION_REPORT.md

# P33–P37 Presentation Stabilization Report

## Scope
Presentation-only stabilization from the approved P32 package. Authentication, Session Profile, backend functions, Firestore business/data logic, dashboards, P22–P32 workflows remain frozen.

## P33 — Portal Table & Data Presentation Standard
- Added scoped `.gx-table-standard` presentation primitives; no broad `table`, `td`, or `th` replacement was introduced.
- Representative table routes are opt-in through `assets/p33-p37-presentation.js`.
- Existing table sorting/pagination implementation is reused; sortable headers retain keyboard interaction and active direction indicators.
- Datatype presentation is classified from actual column labels: text, number, currency, date, status, document, action.
- Long document/text cells retain the complete DOM value and receive a native title for inspection rather than silent truncation.
- Action columns retain minimum usable width and do not hide existing actions.
- Existing empty-state renderers are preserved; no fake rows are created.
- Existing horizontal scrolling remains available where a table genuinely requires it.

Representative routes audited: Planning Overview, Lounge/Tenant, Branch Office Planning, GASO Planning, Planning Documents, Account & Access Management, Customer Experience, Readiness, Budget/Cost, Station Material, Airport Systems, Branch Office Space, Agreement/Document, Network, Initiative/Improvement tables.

## P34 — Semantic Status System
Actual status vocabulary was inspected from the portal source rather than inferred from English labels alone. Examples include `Valid`, `Covered`, `Follow-up`, `Active`, `Inactive`, `Completed`, `Pending`, `Pending Verification`, `Review`, `REVIEW`, `OK`, `On Progress`, `Draft`, `Proposed`, `Approved`, `Closed`, `Expired`, `Critical`, `Overdue`, `Not Available`, `Failed`, `Rejected`, `Cancelled`, `Not Compliant`, `Not Assessed`, `Unavailable`, `Archived`, `Superseded`, `Future`, `Legacy Imported`, `Effective`, `Paid`, `Verified`, `Published`, and Access Assistance states `OPEN`, `IN_PROGRESS`, `RESOLVED`.

Semantic families:
- Positive/healthy → green
- Attention/warning → amber
- Critical/negative → red
- Process/information → blue
- Neutral/unknown → gray

Contract-specific presentation:
- `Covered` → positive/green.
- `Follow-up` → attention/amber.
- Stored `documentStatus` values are unchanged, including `Valid` and existing non-valid/blank document-status values.
- Derived contract presentation continues to use the existing `geContractNeedsFollowup()` predicate.

Status text remains visible; color is not the sole carrier of meaning.

## P35 — Navigation / Tab / Page Identity Consistency
A stable route → pageId registry was extended in `assets/page-identity-v28.js` and exposed through `assets/p33-p37-presentation.js`.

Key mappings:
- `service-planning.html` → `planning-overview`
- `planning-workspace.html` → `planning-workspace`
- `planning-documents.html` → `planning-documents`
- `lounge-list.html` → `lounge-tenant-planning`
- `touchpoint.html` → `journey-touchpoint`
- `admin.html` → `account-access-management`

Portal Management saves page title/description by stable pageId. A legacy route-key configuration remains readable only as a same-route fallback; it is not used as a cross-page fallback.

Corrected visible context includes Planning Overview and Account & Access Management. Planning Workspace keeps its parent identity while its three existing tabs remain explicit.

## P36 — Information Card & Drill-down Integrity
Planning Overview snapshot provenance was traced in the existing `renderPlanningOverview()` implementation:

| Card | Source of displayed number | Business meaning | Destination | Context |
|---|---|---|---|---|
| Lounge Provider | `data.lounges.length` | Existing Lounge/Tenant master records | `lounge-list.html` | Existing Lounge/Tenant workspace |
| Contract Follow-up | `data.lounges.filter(geContractNeedsFollowup).length` | Lounge/contract records requiring existing follow-up predicate | `lounge-list.html?planningCard=contract-followup` | Reuses `geContractNeedsFollowup()` as a view filter |
| Airport / BO | `data.airports.length` | Airport master records used by network context | `network-stations.html?planningCard=airport-bo` | Airport Experience Network |
| Planning Master | `stationMaterials + boSpaces + airportSystems` | Aggregate planning master records | `service-planning.html#planning-master` | Existing planning module cards |

Cards receive pointer, hover, focus, keyboard activation, and pressed feedback only where a real destination exists. No dummy links or fake modals are used.

## P37 — Footer Layout Integrity
Root cause: the approved R10.3 shell uses a fixed sidebar while the footer is a sibling of `.shell`; without a footer-specific horizontal offset, footer text begins at viewport x=0 and can sit underneath the sidebar.

Correction:
- Footer remains in normal document flow.
- Footer content receives the same sidebar-aware horizontal geometry as main content.
- Collapsed sidebar uses the collapsed sidebar width.
- Mobile removes the desktop offset because the sidebar becomes an off-canvas navigation surface.
- Footer padding and typography are compact; no artificial fixed height is used.
- Shell minimum height is adjusted only to let a short page naturally reach the compact footer.
- Header and sidebar design are not modified.

## Preservation
No changes to:
- Firebase Authentication
- Session Profile / `auth-session`
- Firestore production data or collections
- Dashboard POV logic/layout
- P22, P23, P24
- P29 business/data logic
- P30 overlay implementation
- P31 authentication correction
- P32 Access Assistance workflow
- Netlify Functions/backend API
- `assets/app.js`, `assets/data.js`, and core business modules

## Deployment-only verification
Real Netlify browser verification remains required for the final visual/interaction acceptance. No production PASS is claimed from local HTTP checks.


---

## docs/P38_PRODUCTION_PARITY_REPOSITORY_OPTIMIZATION_REPORT.md

# P38 — Production-Parity Local Development + Repository / Deployment Optimization

## Scope

P38 is tooling and repository hygiene only. The approved portal UI, business logic, Firebase/Firestore data model, Authentication foundation, Netlify Function business logic, and P22–P37 implementations remain frozen.

## P38A — Local development

The project now uses **Netlify Dev** as the local development runtime rather than the dependency-free static server as the primary `npm run dev` command. Netlify Dev is configured as a static site server with the existing `netlify/functions` directory and the existing `/api/*` redirect model.

- `npm run dev` → `netlify dev`
- Default local URL → `http://localhost:8888/`
- `npm run dev:static` remains available for static-only checks.
- No fake authentication, hardcoded role, test user, mock session, or Firebase bypass was added.
- Existing `/api/...` frontend paths remain unchanged.

Netlify's documented local development model provides local handling for redirects, headers, environment variables, and Netlify Functions.

## Environment audit

Server-side variables actually referenced by the current Functions source:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WEB_API_KEY`

The existing `.env.example` was retained and remains values-only-free. Browser Firebase Web SDK configuration remains in `assets/firebase-config.js`; it is not a service-account secret.

No real secret was added.

## P38B — Repository audit

Baseline from the supplied P27 package:

- 194 files
- approximately 18 MB unpacked
- approximately 17 MB in `assets/`
- 14 documentation files
- 10 test files
- 19 template files
- 14 Netlify files including the Functions dependency manifest

No uncertain runtime source files were deleted. This is deliberate: P38 optimizes **deployment and generated artifact boundaries**, not source-file count for its own sake.

### Classification

| Category | Treatment |
|---|---|
| Required runtime source | Kept |
| Required Netlify Functions | Kept |
| Required configuration | Kept |
| Build metadata | Kept |
| Tests | Kept in canonical repository and deployment build source because `npm run build` executes them |
| Documentation | Kept in canonical repository; excluded from deployment artifact |
| Generated output | Excluded via `.gitignore` |
| Temporary/local state | Excluded via `.gitignore` |
| Historical reports | Kept as repository history; not runtime output |
| Duplicate/obsolete source | No safe deletions identified |
| Local-only state | Excluded via `.gitignore` |
| Delivery artifacts | Generated under `artifacts/`; excluded from Git |

## Git hygiene

`.gitignore` now also excludes common coverage/log/temp/OS/editor artifacts and generated `artifacts/` output while preserving `.env.example`.

No prior ZIP packages were present inside the supplied source package, and none are added.

## Deployment artifact

`npm run package:deploy` generates:

`artifacts/netlify-deploy/`

from the canonical source. It is not a separately maintained application source. It excludes repository-only documentation and handoff startup files while retaining the files needed for Netlify's existing build/deploy model.

No `node_modules` is packaged.

## Why the repository file count was not aggressively reduced

The baseline contains many physical HTML pages, modular JavaScript files, required browser libraries/assets, templates, tests, and historical documentation. Reference/duplicate auditing did not establish a safe set of runtime files that could be deleted or merged without risking behavior. P38 therefore avoids arbitrary file deletion and instead separates canonical development source from deployment output.

## Preservation

Critical frozen P27 files were compared byte-for-byte with the supplied P27 baseline. The following were unchanged:

- `assets/auth.js`
- `assets/firebase-client.js`
- `assets/portal-shell.js`
- `assets/dashboard-pov.js`
- `assets/lounge-planning-v29.js`
- `assets/overlay-v30.js`
- `assets/access-assistance-p32.js`
- `assets/profile-p27.js`
- `assets/password-p27.js`
- existing Authentication Functions
- `netlify/functions/_firebase.js`
- `firestore.rules`

No production Firestore data was accessed or modified by the P38 tooling.

## Validation limitation

This environment does not have Netlify CLI installed, and an attempt to obtain it with `npx` timed out. Therefore the actual Netlify Dev process and live local Function invocation could not be executed in this environment. P38 config/contract validation was performed locally; Netlify Dev browser/function runtime validation remains a manual step on a machine with a compatible Netlify CLI and approved Firebase environment variables.

Production deployment was not performed.


---

## docs/P39_ASSET_FACILITY_REPORT.md

# P39 — Branch Office Asset & Facility Management

## 1. Audit decision

P39 audited the latest P38 source before introducing a new asset data source.

### Existing compatible capability found

The source already contains:

- `GECore` Station / Airport master context.
- `GEServiceLocation` Service Location hierarchy.
- Legacy Lounge Master records.
- `Station 360` aggregation of Station, Service Location, Readiness, Agreement and Customer Experience context.
- Existing `Station Material`, `Airport Systems`, `Branch Office Space`, Lounge/Tenant and Readiness modules.
- Existing Firebase Authentication + authenticated Netlify Functions.
- Existing server-side `users/{uid}` profile, role, access level and station-scope mechanism.
- Existing `auditLogs` collection.

The audit did **not** find an existing production Firestore Asset or Facility collection used by the current runtime. The existing Service Location / Core modules are primarily browser compatibility/local-storage architecture and are therefore not suitable as a shared multi-user production Asset source of truth.

### P39 decision

P39 extends the existing Station / Service Location concepts but introduces one production operational source of truth for the new domain through authenticated Netlify Functions:

- `geFacilities` — non-Lounge Ground Experience Service Facilities.
- `geAssets` — physical Ground Experience Assets.

Existing `lounges` records are referenced where available; P39 does not create a duplicate Lounge master.

No seed, mock, migration, reset, or production-data rewrite is performed by page load or deployment.

## 2. Domain separation

```text
Existing Lounge / Tenant Agreement
  = commercial / agreement / pricing domain

P39 Asset & Facility
  = physical operational domain

Station
  ↓
Existing Lounge OR P39 Service Facility
  ↓
P39 Asset
```

Asset lifecycle is independent of Agreement lifecycle.

No furniture/equipment is added to Agreement Price Schedule.

## 3. P39 data model

### `geFacilities/{facilityId}`

Minimum fields used by P39:

```js
{
  stationCode,
  name,
  facilityType,
  terminal,
  area,
  zone,
  operationalStatus,
  lifecycleStatus,
  remarks,
  createdAt,
  createdBy,
  updatedAt,
  updatedBy
}
```

`Lounge` is intentionally not created as a new `geFacilities` record. Existing Lounge Master records are used as the location reference.

### `geAssets/{assetId}`

```js
{
  stationCode,
  facilityType,
  facilityId,        // for P39 non-Lounge facilities
  loungeId,          // for an existing Lounge reference
  area,
  assetName,
  category,
  ownership,
  responsibleUnit,
  pic,
  trackingMode,      // INDIVIDUAL or QUANTITY
  assetTag,
  serialNumber,
  quantity,
  unit,
  condition,
  operationalStatus,
  acquisitionDate,
  installationDate,
  lastInspection,
  evidenceRef,
  remarks,
  lifecycleStatus,
  createdAt,
  createdBy,
  updatedAt,
  updatedBy
}
```

Individual tracking requires `assetTag`; quantity tracking does not force an individual serial identity.

## 4. Controlled taxonomy

P39 uses one JSON taxonomy source:

`assets/p39-asset-config.json`

It controls:

- Facility Types
- Ownership
- Asset Categories
- Conditions
- Operational Statuses
- Tracking Modes
- Units

The same configuration is consumed by the browser UI and server validation. Categories are not duplicated across multiple JavaScript files.

The taxonomy is intentionally additive and can later be connected to a configurable Master Data workflow if the existing portal introduces one for Asset classifications.

## 5. Authorization and scope

P39 does not change Authentication, Session Profile, Role, Access Level, Scope or Permissions architecture.

The new API:

1. verifies the existing Firebase ID token;
2. reads the existing Firestore user profile;
3. applies the existing account role/status context;
4. restricts station data to the actor's assigned `airports` when scope is not `ALL`;
5. permits mutation only for `Editor` / `Admin` Access Level, with `Super Admin` retained as the full-authority case.

`Viewer` cannot edit.

`Approver` is not automatically granted edit rights.

Branch Office users with station scope do not need to select arbitrary stations; the UI locks the permitted station when the session scope is `STATION`.

## 6. CRUD / lifecycle

Implemented:

- Add Asset
- Edit Asset
- Condition update through Asset Edit
- Operational Status update through Asset Edit
- Add Service Facility
- Edit Service Facility
- Retire Asset
- Asset detail view
- Update history from the existing `auditLogs` collection

Operational Assets are not hard-deleted by P39. Retire changes lifecycle/status while preserving the record.

## 7. Evidence / documents

P39 records an `evidenceRef` reference only.

No Firebase Storage dependency is introduced because P38 audit did not establish an active production Storage workflow for this domain. Existing document/file architecture is not replaced.

## 8. Readiness / Capability / Budget / Maintenance

P39 does not change existing Readiness formulas.

P39 does not duplicate Capability requirement definitions.

P39 does not create accounting depreciation or financial fixed-asset logic.

P39 does not create a full Maintenance Management System. Condition, Operational Status and remarks are sufficient for the initial operational scope.

Future integration points are documented rather than silently altering existing formulas or datasets.

## 9. CSV assessment

Asset CSV import is intentionally **not introduced in P39**.

The Asset model is now stable enough for a future controlled import, but a bulk import would add a second write path before the authenticated production workflow has received live acceptance testing. The recommended future pattern is the existing portal contract:

`Template → Upload → Normalize → Validate → Preview → Confirm → Result`

with the same canonical `geAssets` contract used by Manual Add/Edit.

## 10. Production-data safety

P39 tooling does not seed CGK, DPS, sample furniture, sample equipment, mock users or test assets.

No production Firestore records are migrated or rewritten by deployment.

The new collections are created lazily only when an authorized user explicitly creates a Facility or Asset.

## 11. Validation limits

Static validation can verify:

- JavaScript syntax.
- Frozen P38 file integrity.
- P39 API contract.
- P39 taxonomy consistency.
- No P39 seed/mock asset records in source.
- Page and Service Location routing presence.

Live validation against production Firebase/Firestore remains pending because the current managed device cannot install Node.js / Netlify CLI and P38 explicitly remains locked against local-runtime bypasses.

No fake local authentication or local SuperAdmin bypass was introduced.

## 12. Final repository validation

The finalized P39 source was checked without changing the locked P38 package metadata, Firebase/Auth implementation, or production-data structures.

Validated in the available execution environment:

- JavaScript syntax: PASS for the P39 browser module and Netlify Function.
- Existing P27/P29/P31/P32/P33-P37 regression contracts: PASS.
- P38 repository hygiene: PASS.
- P39 Asset/Facility contract: PASS.
- Frozen P38 baseline integrity: PASS.
- Static local HTTP preview of `asset-facility.html`: PASS.
- Static delivery of `assets/p39-asset-config.json`: PASS.

The final P39 UI also guards mutation controls in the browser for non-editor users while the Netlify Function remains the authoritative authorization boundary.

Quantity is validated server-side as a positive integer; individual tracking forces quantity to 1 and requires a unique Asset Tag within the Station.

Not validated and intentionally still pending:

- authenticated browser interaction against production Firebase;
- live production Firestore read/write;
- manual production-parity Netlify Functions execution;
- real production deployment validation;
- visual browser inspection.

These remain pending because the current corporate-managed laptop cannot install Node.js / Netlify CLI, and P39 does not bypass that restriction or introduce local authentication/data substitutes.


---

## docs/P40_FIREBASE_EDITION1_REBUILD_REPORT.md

# P40 — Edition 1 Firebase / Firestore Functional Rebuild

## Decision
The 12 broken Edition 1 routes are not patched in place. New replacement pages (`e1-*.html`) are provided and the production routes are redirected to them through `netlify.toml`.

## Business-data source
Edition 1 replacement pages do not load `assets/data.js` and do not load `assets/app.js` directly. They use `assets/edition1-store.js`, whose business-data source is authenticated `/api/edition1-data` backed by Firebase Admin / Firestore.

The browser keeps only an in-memory working set for rendering and form interaction. It is not persisted to localStorage and is not seeded with sample records.

## Authentication / authorization
Existing Firebase Authentication and session architecture remain the authentication boundary. The new data API verifies the Firebase ID token and reads the authenticated `users/{uid}` profile before allowing data access.

Station scope, module permissions, access level and administrative restrictions are enforced server-side. External users do not receive the full initiative collection.

## Firestore-backed domains
The replacement runtime maps Edition 1 business domains to Firestore collections including:

- initiatives
- projectEvents (Calendar / Project Tracking)
- airports
- personnel
- lounges
- loungeVisitors
- stationMaterials
- boSpaces
- serviceProcurement
- airportSystems
- gasoMaster
- gasoServiceSupport
- gasoPlanningService
- documents
- touchpointStandards
- skyPriority
- articles / announcements / faqs
- inbox
- users / auditLogs / portalManager

No collection is populated with fake seed data by page load.

## Files
Business document attachments are routed through `edition1-file` to Firebase Storage rather than browser IndexedDB.

## Runtime
The existing business function definitions are consolidated into `assets/edition1-business-runtime.js`. Its automatic DOMContentLoaded boot is suppressed; `edition1-page-boot.js` performs authentication, Firestore hydration and page-specific rendering after the real data has been retrieved.

## Routing
The following legacy routes redirect to the Firebase-backed replacements:

- standar.html
- inisiatif.html
- service-planning.html
- calendar.html
- planning-documents.html
- data.html
- admin.html
- berita.html
- kontak.html
- lounge-list.html
- branch-office-planning.html
- gaso-planning.html
- station-material.html
- bo-space.html
- airport-systems.html

## Validation
Validated before packaging:

- Node syntax check for all new runtime/API files.
- Asset-reference audit for all 12 replacement pages.
- Inline-handler contract audit against the consolidated runtime.
- Existing P22–P38 regression suite.
- P40 Firebase Edition 1 functional contract test.
- Clean local build chain: PASS.
- Netlify-like build chain with `.netlify` present before P38 hygiene test: PASS.

## Validation limitation
A credentialed browser session against the real Firebase project was not executed in this environment. No fake authentication, fake Firestore data, local SuperAdmin, or local production-data bypass was introduced to manufacture that result.


---

## docs/R10_CONSOLIDATED_AUDIT.md

# R10 Consolidated Runtime Audit

Baseline: project package with R1–R9 history reconciled. This revision removes the overlapping R4–R9 post-runtime patch chain from the active business runtime and replaces it with one canonical consolidation block.

## Root causes corrected
- Airport page boot could wait for `GEStore` without being able to recover if the store script did not establish the global. `waitStore()` now self-heals the canonical store dependency and fails explicitly if initialization still fails.
- Initiative markup still contained the old single Airport input and free-text PIC even though later patches attempted to replace them after render. The canonical markup now directly contains multi Station/Area and User & Access PIC fields plus the requested schedule/cost/status/output fields.
- Milestone PIC is now a direct User & Access selector. Milestone open/save handlers are explicitly bridged and assignment identity is persisted.
- Calendar / Project / Gantt controls are now structural page markup. They are not dependent on a late MutationObserver or synthetic DOMContentLoaded.
- R4–R9 overlapping business-runtime patch blocks were removed from the active runtime to stop later patches from overriding earlier behavior.
- Lounge Grid/Details has one canonical view handler; Details means the existing table/explorer, not a reduced card.

## Preserved
Firebase project/configuration, Firestore schema paths, permissions, roles/scopes, Netlify Functions, existing CRUD, historical Pxx implementation files, templates, OCR assets, map domain modules, existing business records.

## Verification
- JavaScript syntax checks: PASS.
- `npm test`: PASS.
- `npm run build`: PASS.
- Browser/Netlify Preview: must still be verified on the deployed branch; local automated PASS is not represented as browser PASS.


---

## docs/REFACTOR_AUDIT.md

# Refactor Audit — R10.20

## Source-of-truth assessment

The ZIP is a static multi-page portal with 50+ HTML pages/assets, a shared JavaScript compatibility/data layer, browser-side Firebase Web SDK loading for authentication/profile and selected Firestore workflows, and Netlify Functions using Firebase Admin for managed-account operations.

The existing architecture is not a conventional bundled SPA. Moving the HTML pages into a framework or bundler would create unnecessary visual/behavioral risk, so this refactor preserves the architecture.

## Important findings

1. **Firebase is present and must be preserved.** `login.html` loads `firebase-config.js` and `firebase-client.js`; protected pages load the Firebase runtime through `assets/auth.js`. Netlify Functions use `firebase-admin`.
2. **Business data is still compatibility/localStorage-driven in many existing modules.** The existing `GE_V2_1_DATA` store must not be silently replaced with a Firestore migration. Firebase-backed initiative/access functionality already present remains intact.
3. **Root `firebase-admin` was misplaced.** It is imported only from `netlify/functions/_firebase.js`, so it was moved out of the root dependency manifest by removing the redundant root declaration. The Functions manifest remains unchanged.
4. **No `jwks-rsa` or `jose` usage was found.** They were not added and were not declared as dependencies.
5. **HTML script load order is heterogeneous and intentional.** Several versioned scripts are shared across many pages. They were not consolidated because doing so without browser-level regression testing could change initialization order or UI behavior.
6. **The site uses physical HTML routes, not SPA catch-all routing.** Existing Netlify routing only maps `/api/*` to Functions. Page URLs such as `/calendar.html` therefore remain direct static files.
7. **Firebase Web config is present in source.** It contains Web App identification fields, not the Admin service-account private key. Admin credentials remain environment-variable based in Netlify Functions.
8. **Local preview was missing as a standard npm workflow.** A dependency-free Node static server was added rather than introducing a new server dependency.

## Packaging decision

The safest packaging model is:

- repository root = static portal + zero npm runtime dependencies
- `netlify/functions` = isolated Node Functions dependency tree
- Firebase Web SDK = existing browser-side runtime loading
- Firestore/Auth = existing integrations and schemas
- Netlify = existing static publish model + Functions

This keeps deployment behavior close to the existing source while making local validation explicit.

## Verification limits

The following were statically verified in the provided source:

- JavaScript syntax for the application files.
- Existing regression test suite.
- Root `package.json` ↔ `package-lock.json` consistency.
- Local HTML asset references.
- Presence of Netlify/Firebase configuration.
- Presence of the Functions `firebase-admin` declaration.

The following could not be fully live-tested from this environment:

- credentialed Firebase Authentication/Firestore operations against the production project
- Netlify-hosted deployment
- installation of the Functions dependency tree, because the npm registry was unreachable (`EAI_AGAIN`)
- pixel-level browser screenshot comparison

Those remain deployment acceptance checks rather than reasons to alter the existing architecture.


---

## docs/REFACTOR_CHANGELOG.md

# Refactor & Packaging Changelog

## Scope

This pass is intentionally conservative. The existing multi-page HTML/JavaScript application remains the source of truth. No page was migrated to a framework, no Firestore schema was rewritten, and no business-data migration was introduced.

## Changes

| Source | Destination | Change | Reason | Impact | Risk |
|---|---|---|---|---|---|
| `package.json` | same | Removed the root `firebase-admin` runtime dependency; added `dev`, `preview`, and `build` scripts and Node >=20 engine metadata. | `firebase-admin` is only imported by Netlify Functions, so keeping it at the static-site root duplicated dependency ownership. | Root install is lighter; function dependency remains isolated in `netlify/functions/package.json`. | Low |
| N/A | `package-lock.json` | Added npm lockfile v3 for the dependency-free root package. | Makes root package state reproducible and explicitly consistent with `package.json`. | `npm install` at repository root has a deterministic zero-dependency tree. | Low |
| N/A | `tools/serve.mjs` | Added a dependency-free local static server for development and production preview. | Provides the requested localhost validation path without introducing a web-server package. | `npm run dev` serves port 5173; `npm run preview` serves port 4173. | Low |
| N/A | `tools/verify-package.mjs` | Added package/asset/configuration verification. | Detects broken local HTML references and packaging drift before deployment. | Used by `npm run build`. | Low |
| `README.md` | same | Updated local development, production preview, packaging, Firebase, and Netlify guidance to match the actual ZIP. | Existing README contained statements that no Firebase integration was present, while the package does contain Firebase client/auth integration. | Documentation now matches the inspected source. | Low |
| N/A | `docs/REFACTOR_CHANGELOG.md` | Added this change log. | Records changes, reasons, impacts, and risk. | Documentation only. | None |

## Deliberately not changed

- HTML page locations and filenames.
- Existing CSS/layout and visual assets.
- Existing JavaScript modules and their load order.
- `assets/data.js` and its existing local compatibility store.
- Firebase Web configuration/client adapter and existing Authentication/Firestore calls.
- Firestore collection/document/field names described by the existing schema.
- Netlify Functions source and their `firebase-admin` dependency declaration.
- Existing `netlify.toml`, `_headers`, `firestore.rules`, and `firebase.json` behavior.
- OCR assets and third-party browser libraries.
- Existing legacy/versioned scripts such as `v2544-modal-fix.js` and `v2554-stability.js`; their usage is widespread enough that removal would require behavioral regression testing.

## Deletions

No application source, page, asset, Firebase collection, or Netlify Function was deleted in this pass.

The only dependency ownership change is removal of the root `firebase-admin` declaration. It remains declared where it is actually imported: `netlify/functions/package.json`.

## Dependency notes

- Root package: intentionally zero runtime/npm dependencies.
- Netlify Functions: `firebase-admin@^13.5.0` remains isolated in `netlify/functions/package.json`.
- `jwks-rsa`: not referenced by the inspected source.
- `jose`: not referenced by the inspected source.
- Node: `>=20` is retained for the Functions runtime and local tooling.

A live dependency installation of the Functions package could not be completed in this audit environment because access to `registry.npmjs.org` failed with `EAI_AGAIN`. Therefore no claim is made that the transitive `firebase-admin` tree was installed locally during this pass.

## Visual regression repair — 2026-09-18

### Root cause

The reported `Bad - Bug Tampilan` screenshots are consistent with a **missing/incomplete global visual stylesheet**, not with a broken page/component implementation:

- `assets/portal.css` contained only the generic/base rules (~3.5 KB).
- The existing HTML and `assets/portal-shell.js` still emitted the established `final-v257`, `ge-*`, `r8-*`, `r9-*`, modal, calendar, map, initiative, and form classes.
- Because those classes had no corresponding global rules, the browser fell back to native HTML rendering: oversized logos, unstyled navigation, native inputs/buttons, misplaced modal fields, and collapsed dashboard layout.
- The application source itself was therefore not recreated or rewritten; the visual contract between the existing markup and stylesheet was incomplete.

### Repair

| Source | Destination | Change | Reason | Risk |
|---|---|---|---|---|
| `assets/portal.css` | `assets/portal.css` | Restored the global visual system for the existing shell/components and responsive states; retained the existing base rules and added scoped `final-v257` shell styling plus shared component/modal/form/module styling. | Restore the existing visual behavior represented by the supplied Good screenshots without changing HTML/JS/data/business logic. | Low–Medium: CSS-only; possible visual edge cases on less frequently used legacy modules, so the source markup and behavior were intentionally left untouched. |
| `tools/verify-package.mjs` | `tools/verify-package.mjs` | Added checks for required visual-contract selectors in `portal.css`. | Prevent another packaging step from silently shipping a stylesheet that lacks the shell/component rules. | Low |

### Intentionally not changed

- Firebase project/configuration.
- Firestore collections, document IDs, fields, types, queries, or mappings.
- Authentication/data flow.
- Existing HTML page structure.
- Existing application JavaScript/business logic.
- Existing assets/images.
- Existing Netlify Function implementation.
- Framework/architecture.

### Validation

- CSS parsed with `tinycss2`: **0 parse errors / 278 top-level rules**.
- `npm run build`: **PASS**.
- `PACKAGE_VERIFY_PASS`.
- `REGRESSION_AUDIT_PASS`.

## R10.20.1 — Restore full portal stylesheet + missing Planning navigation

- **assets/portal.css** — replaced the incomplete 30 KB regression stylesheet with the supplied full portal stylesheet (~376 KB / 6,000+ lines) from the previous working baseline. This restores the existing visual contracts for legacy pages, final shell pages, modals, forms, maps, lounge modules, and responsive states. **Risk: low**, because this is restoration of the supplied existing stylesheet rather than a redesign.
- **assets/portal-shell.js** — restored the existing Service Planning navigation entries in the dynamically generated management/Branch Office sidebar, including **Lounge/Tenant Planning (`lounge-list.html`)**. No page logic, permissions, Firestore mapping, or data structures were changed. **Risk: low**; this only restores navigation to pages already present and permission-mapped in the source.
- **tools/verify-package.mjs** — added regression guards so an accidentally truncated `portal.css` or missing `Lounge/Tenant Planning` navigation cannot pass package verification.

### Intentionally unchanged

No changes were made to Firebase configuration, Firestore collections/documents/fields, authentication flow, application data, CRUD logic, or existing page markup.


## R10.20.2 — Consolidated Dashboard POV stabilization / P19A shell lock

- `assets/portal-shell.js`: centralized Role → Dashboard POV resolution; restored shared navy shell, role-specific navigation hierarchy, account menu, notification popover, period control, and no-triangle avatar interaction.
- `assets/dashboard-pov.js`: consolidated SuperAdmin, Management, GE Team/Head Office, and Branch Office Dashboard renderers using existing portal data services; unresolved roles do not fall back to Management; Branch Office context uses assigned station scope without a CGK default.
- `index.html`: dashboard content is now rendered by the dedicated shared Dashboard POV module; Firebase/Auth/data dependencies remain unchanged.
- `profile.html`: added as the valid account Profile destination used by the shared account menu.
- `assets/portal.css`: appended P19A shell integrity lock as the final cascade authority to guarantee visible dark-navy Header + Sidebar + light content geometry, plus consolidated Dashboard presentation styles.
- `tools/verify-package.mjs`: added P19 shell/POV/scope regression guards.

Preserved: Firebase SDK, Firebase Authentication, Firestore-facing client/backend integration, production data structures, role/access/scope/permission mechanisms, existing business modules, Planning functionality, and non-Dashboard page markup/logic. No production data was seeded or rewritten by this iteration.

## R10.20.2 — P22/P23/P24 Navigation, Planning Workspace, User Creation Protection
- P22: grouped role-aware navigation; Planning reduced to Overview / Workspace / Documents primary entries.
- P23: added Planning Workspace presentation entry with Lounge/Tenant, Branch Office, and GASO tabs while retaining existing source routes/data.
- P24: Planning pages use the approved portal shell and planning-scoped consistency styles; removed the Lounge-only visual theme.
- User Management: normal portal UI excludes Super Admin as a target role; server-side create/update blocks Super Admin creation/assignment and Admin access is permission-gated.
- Dashboard, Firebase/Firestore, production data, business logic, and unrelated modules intentionally preserved.

## R10.20.3 — P29 Lounge/Tenant planning and asset readiness audit
- `assets/lounge-planning-v29.js`: added focused P29 service-type resolution, defensive rendering, shared manual/CSV normalization and validation, multi-period pricing, CSV preview/CREATE-only import, duplicate blocking, price schedule detail, and responsive card behavior. **Risk: low–medium**, scoped to Lounge/Tenant Planning.
- `lounge-list.html`: aligned Add/Update entry points, added Service Type filter presentation, switched template action to CSV, and retained existing Lounge/Tenant Planning shell.
- `assets/portal.css`: added P29-scoped card/form/import styles only; P22/P23/P24 shell and Dashboard styles were not reopened.
- `templates/Template_Layanan_Lounge_Tenant_P29.csv`: added a static CSV template using the same logical contract as the P29 importer.
- `tests/p29-lounge-planning.js`: added unit/contract regression checks for service type, legacy price fallback, multi-period price resolution, overlap validation, and invalid input handling.
- `package.json`: build now includes the P29 regression test.
- `docs/P29_REPORT.md`: records the Tenant root cause, data contract, CSV/multi-price behavior, card changes, asset/facility audit, preservation and validation status.

### P29 asset decision
The package already has Service Location and Branch Office Space capabilities, but no suitable physical Asset Registry. P29 therefore did not create a new production Asset collection or large Asset Management module. Future Asset work should reuse Station → Service Location and remain independent of Agreement/Price Schedule lifecycle.

## R10.20.3 — P26 + P28 + P30 Controlled Follow-up

- **P26 Account & Access Management** — replaced the primary legacy user-management presentation with an enterprise account workspace, guided Role/Access Level/Scope/Permissions form, CSV template/import preview, legacy-user review handling, and secure Firebase-backed account operations. Existing legacy Firestore fields remain compatible.
- **P26 security** — normal account creation targets Management / Head Office / Branch Office only; Super Admin remains protected; server-side role, permission, scope, and input validation were strengthened; plaintext temporary passwords are not persisted.
- **P28 Page Identity Isolation** — added stable page identities with legacy route-keyed configuration compatibility. Journey & Touch Point and Account & Access Management now have independent identities.
- **P30 Overlay Integrity** — added a shared portal-wide overlay root that reparents blocking overlays to `document.body`, removes shell stacking-context trapping, locks background scrolling, and adds modal focus/keyboard handling. P29 Lounge/Tenant business/data logic is unchanged.
- **Necessary P22 exception** — `assets/portal-shell.js` no longer maps legacy `role = Admin` to the Super Admin Dashboard POV. This targeted correction prevents a legacy role from failing open to Super Admin and does not redesign navigation.
- **Preservation** — no production Firestore migration or production-data rewrite; package dependencies unchanged.

## R10.20.4 — P31 Authentication & Legacy User Compatibility

- Controlled authentication correction from the latest P26 + P28 + P30 package only.
- Root cause identified at the post-Firebase-auth user-profile lookup stage: `assets/firebase-client.js` was reading `users/{uid}` directly from the browser while `firestore.rules` defines user profiles as server-only (`allow read, write: if false`).
- Firebase Email/Password Authentication remains the credential authority.
- Profile/session lookup now uses the existing Netlify `auth-session` endpoint with the Firebase ID token; no new authentication system was introduced.
- `auth-session` now distinguishes missing profile from inactive account.
- Legacy/unknown authorization defaults fail closed in memory; missing permissions never imply ALL, missing access level defaults to Viewer except legitimate Super Admin compatibility, and unknown/legacy role resolves to an unresolved/limited Dashboard POV.
- `Admin` remains distinct from `Super Admin`.
- P30 is removed only from `login.html` so the reusable overlay runtime cannot participate in authentication initialization; P30 remains loaded across portal pages.
- P22/P23/P24/P29/P26/P28 implementations are preserved.
- No production Firestore documents were changed.
### R10.20.4 — P31B Login Branding & Access Assistance
- Restored the Garuda Indonesia corporate image on the login page and preserved the existing Danantara Indonesia visual.
- Removed technical Firebase/Firestore/session implementation details from visible login copy.
- Added password-free `Lupa password?` Access Assistance Request flow backed by `access-assistance-request` Netlify Function.
- Requests are persisted only after authorized Super Admin / User-Management Admin recipients are resolved; no password is accepted or stored.
- Firebase Authentication and existing session pipeline remain frozen.


## R10.20.5 — P32 Access Assistance Admin Workflow

- Reused the existing `accessAssistanceRequests` collection as the single canonical Access Assistance business object.
- Extended the existing Access Assistance submission flow to create notification references in the existing `inbox` collection, one reference per authorized recipient, without duplicating the request itself.
- Added server-authorized administrator workflow for listing, reading, processing, and resolving Access Assistance requests.
- Authorized recipients remain limited to `Super Admin` and legacy `Admin` users with the existing User Management permission; authorization is checked again server-side for every administrative action.
- Added `OPEN → IN_PROGRESS → RESOLVED` workflow with authenticated `handledBy` / `handledAt` and `resolvedBy` / `resolvedAt` metadata.
- Integrated request notifications into the existing header notification popover and the existing Admin / Pengelola → Pesan Masuk surface without adding a new top-level navigation item.
- Preserved the separation between notification `UNREAD/READ` state and request resolution state.
- No password, token, Firebase UID, service-account information, endpoint information, or Firestore implementation detail is displayed in the operational request detail.
- No password reset mechanism was added. Access Assistance remains a support workflow only.
- No Firebase Authentication, Session Profile, `auth-session`, P26, P28, P29, P30, P31, dashboard POV, lounge planning, portal shell layout, or production user document logic was changed for the workflow itself.

## R10.20.5 — P33–P37 Presentation Stabilization
- P33: added scoped shared table presentation standard with datatype-aware alignment, long-text handling, action-column protection, and responsive compatibility.
- P34: added semantic status presentation without changing stored status values; Contract `Covered` is positive and `Follow-up` is attention/warning.
- P35: extended stable route → pageId registry and isolated Portal Management page configuration by stable page identity; corrected Planning Overview and Account & Access Management visible context.
- P36: traced Planning Overview snapshot provenance and added real drill-down destinations; Contract Follow-up reuses the existing follow-up predicate as a view filter.
- P37: corrected footer/sidebar geometry while preserving the fixed shell and sidebar; footer remains in normal flow and compact.
- Authentication, Session Profile, backend/API, Firestore data, Dashboard POVs, P22, P23, P24, P29, P30, P31, and P32 remain frozen.

## R10.20.6 — P27 Profile & Account Self-Service

- Added additive current-user Profile self-service experience.
- Added safe self-edit for Employee Name only through authenticated server-side UID derivation.
- Added read-only organization, access, data-scope, module-access and account-security presentation.
- Preserved legacy account compatibility with explicit review presentation; no mass migration.
- Added Firebase Authentication reauthentication + `updatePassword()` self-service flow.
- Added authenticated password-lifecycle completion endpoint for `mustChangePassword` metadata.
- Kept existing forced-change endpoint, login pipeline, Session Profile and Authentication foundation unchanged.
- Kept email and username read-only to avoid Auth/Firestore mismatch.
- Added P27 contract/direct-code tests and included them in the build.
- Production validation remains pending; browser visual validation is deferred because local Chromium timed out.


---

## docs/REVISION_NOTES_R10_20.md

# Catatan Revisi R10.20

Baseline tunggal: `Ground_Experience_Garuda_Indonesia_R10_19_OCR_CORRECTION_WORKFLOW`.

## Dikerjakan pada revisi ini

- Mempertahankan menu sebagai anchor HTML native agar klik kanan dan **Open link in new tab** tersedia dari browser.
- Membagikan sesi login antar-tab pada origin portal yang sama.
- Mempertahankan kompatibilitas pembacaan sesi `sessionStorage` versi sebelumnya.
- Menyimpan URL halaman tujuan sebelum diarahkan ke login.
- Mengembalikan pengguna ke halaman tujuan setelah login berhasil.
- Mempertahankan halaman aktif ketika browser di-refresh.
- Menambahkan konfigurasi production, Deploy Preview, branch deploy, dan Functions pada Netlify.
- Menambahkan dokumentasi GitHub, Netlify, environment variables, audit data, acceptance test, dan rollback.

## Dikunci dan tidak diubah

- Tampilan Dashboard.
- Tampilan Initiative.
- Tampilan Calendar, Project Tracking, dan Gantt, termasuk font, tinggi huruf, warna, spacing, dan komponennya.
- OCR Correction Workflow.
- Data bisnis, struktur koleksi, document IDs, dan legacy fields.
- Tidak ada seed, reset, migrasi, atau penulisan dummy otomatis.

## Catatan integrasi

Paket baseline tidak berisi runtime Firebase SDK/Firestore. Integrasi ke existing Firebase project harus dilakukan setelah konfigurasi dan implementasi website online yang benar tersedia untuk diaudit. Jangan menganggap data `localStorage` sebagai data Firestore produksi.


---

## AUDIT-P40-CLEAN-FLOW-V4.md

# P40 CLEAN FLOW AUDIT — V4
Repository: `mahfudmf-aka/GE_Portal`
Branch audited: `test-1`
GitHub writes: NONE

## Scope
This audit traces the Clean Draft from Login → app bootstrap → canonical shell → route resolution → registry → page runtime → data layer → result/error handling, then audits all 56 registry routes and the runtime families behind them.

## 1. Canonical runtime contract

### Intended single flow
1. `login.html`
2. Firebase client/authentication
3. successful authentication stores session and redirects to `app.html?page=<route>`
4. `app.html` creates only the Clean shell mounts:
   - `.e1-top`
   - `.shell > .side`
   - `.shell > .main#cleanPageOutlet`
5. `clean-shell-runtime.js` owns header, sidebar, user popup, notification popup, period control and logout UI.
6. `clean-route-adapter.js` converts legacy `.html` links to `app.html?page=<route>` and preserves query/hash.
7. `clean-page-registry.js` supplies the page HTML and page runtime list.
8. page-specific runtime loads after the HTML exists.
9. Edition 1 pages use `edition1-page-boot.js` → Firebase/Firestore → `GEStore.hydrate()` → page renderer.
10. legacy/v257 pages continue using their existing business runtime until separately migrated.
11. runtime errors are rendered into `#cleanPageOutlet` instead of leaving an unexplained blank page.

### Current blocking defect
The existing `app.html` had `.top` instead of `.e1-top` and did not load `clean-shell-runtime.js`. `edition1-canonical-shell.js` also was not loaded. Therefore the existing canonical shell had no valid mount and the old `.top/.side` CSS remained visible. The registry's `index` HTML was also empty, while `dashboard-firestore.js` requires `#dashboardRoot`.

### V4 correction
`app.html` now:
- uses `.e1-top`
- enables `e1-modern`
- loads `clean-shell-runtime.js`
- keeps `portal.css` because domain/legacy functional CSS is still used
- keeps only the existing two HTML files

No old HTML page is recreated.

## 2. Shell ownership

### One shell owner in Clean Draft
`assets/clean-shell-runtime.js`

### No shell ownership for:
- `assets/portal-shell.js`
- `assets/edition1-portal-shell-entry.js`
- `assets/edition1-portal-route-adapter.js`

Those legacy shell runtimes should be removed from the Clean registry. Their source files remain in the repository as historical/legacy assets and are not deleted.

### Why portal.css is NOT deleted in V4
`portal.css` is a mixed stylesheet. It contains:
- old shell/theme declarations
- final-v257 shell declarations
- login styles
- map styles
- Initiative/Calendar/Admin/Lounge/OCR/domain styles

Deleting the file or deleting all `.top/.side/.shell/.main/.card` declarations would break runtime pages. V4 therefore removes the dependency on the old shell visually by changing the Clean shell mount, but does NOT perform a blind CSS purge.

The next CSS-cleanup phase must remove only proven-obsolete declarations after legacy page migration is complete.

## 3. Route contract

Canonical route:
`app.html?page=<route>[&other=query]#hash`

Legacy links such as:
`inisiatif.html`
become:
`app.html?page=inisiatif`

Aliases already defined in the registry remain authoritative:
- `station-material` → `service-planning?panel=material`
- `bo-space` → `branch-office-planning?panel=space`
- `airport-systems` → `branch-office-planning?panel=systems`
- `airport-experience-map` → `airport-experience`
- `map` → `airport-experience`
- `network-stations` → `airport-experience`

The route adapter must preserve hash fragments.

Netlify 3xx redirects also preserve query parameters by default; therefore existing legacy redirects can remain without inventing duplicate route rules. citeturn3search0

## 4. Programmatic navigation

Two direct navigation cases were found inside the registry:
- Station 360 inline `location.href=...`
- `service` redirect to `index.html#service-experience`

These bypass ordinary anchor click interception.

V4 changes them to canonical Clean destinations:
- Station 360 → `window.p40CleanRoute(...)`
- service → `app.html?page=index#service-experience`

## 5. Edition 1 page flow

For these routes:
- `admin`
- `berita`
- `branch-office-planning`
- `calendar`
- `data`
- `gaso-planning`
- `inisiatif`
- `kontak`
- `lounge-list`
- `planning-documents`
- `service-planning`
- `standar`

the intended flow is:

`app.html?page=X`
→ registry HTML
→ Firebase client + Auth
→ `GEStore`
→ `edition1-business-runtime.js`
→ `edition1-page-boot.js`
→ map query route X to its historical `e1-*.html` identity
→ hydrate required collections
→ render page

The existing boot file only looked at `location.pathname`, which is `app.html`, so it could not select the E1 config. V4 fixes this with an explicit Clean-route → E1-runtime map.

## 6. Legacy/v257 page flow

These pages currently use the older runtime family:
- `data.js`
- `core-v257.js`
- `app.js`
- domain `*-v257.js`
- `overlay-v30.js`
- related compatibility/runtime files

They can render their existing HTML from the Clean registry, but the audit found remaining `location.pathname` checks in shared legacy runtime code. Examples include Touchpoint rendering and several active-navigation/planning helpers.

Therefore:
**the legacy page family is NOT certified as fully migrated to Clean query-route semantics by V4.**

V4 does not pretend that shell cleanup equals full legacy-runtime migration.

The required next migration is to introduce one shared Clean route resolver for legacy runtime checks instead of patching each page independently.

## 7. Per-page registry audit

### A. E1 canonical runtime pages
| Route | Current HTML | Runtime family | Flow |
|---|---:|---|---|
| `admin` | yes | Edition 1 | registry → E1 boot → Firestore |
| `berita` | yes | Edition 1 | registry → E1 boot → Firestore |
| `branch-office-planning` | yes | Edition 1 | registry → E1 boot → Firestore |
| `calendar` | yes | Edition 1 | registry → E1 boot → Firestore |
| `data` | yes | Edition 1 | registry → E1 boot → Firestore |
| `gaso-planning` | yes | Edition 1 | registry → E1 boot → Firestore |
| `inisiatif` | yes | Edition 1 | registry → E1 boot → Firestore |
| `kontak` | yes | Edition 1 | registry → E1 boot → Firestore |
| `lounge-list` | yes | Edition 1 | registry → E1 boot → Firestore |
| `planning-documents` | yes | Edition 1 | registry → E1 boot → Firestore |
| `service-planning` | yes | Edition 1 | registry → E1 boot → Firestore |
| `standar` | yes | Edition 1 | registry → E1 boot → Firestore |

### B. Legacy/v257 runtime pages
These retain their existing business engines; V4 only fixes the Clean shell/route envelope.

`action-scenario`, `agreement-service`, `asset-facility`, `audit-log`, `budget-cost`, `core-master`, `core-relationships`, `cost-intelligence`, `customer-experience`, `cx-import`, `improvement-intake`, `initiative-conversion`, `initiative-traceability`, `layanan`, `lounge-access`, `lounge-flights`, `lounge-procurement`, `lounge-purchase`, `lounge-visitor`, `master-data`, `planning-workspace`, `portal-management`, `post-flight`, `post-journey`, `pre-flight`, `profile`, `program-kerja`, `readiness`, `station-360`, `touchpoint`, `airport-experience`.

### C. Registry entries currently empty
Original branch contains empty HTML for:
- `core-foundation`
- `core-history`
- `core-migration`
- `core-permission`
- `core-publication`
- `core-shared`
- `index`
- `management-outcome`
- `service-capability`
- `service-locations`
- `service`

`index` is a real user-facing route and is fixed in V4 with `#dashboardRoot`.

The other empty entries are NOT deleted because their scripts/source metadata may still represent historical acceptance or future page ownership. They must not be exposed as navigation destinations until HTML/runtime ownership is defined.

`service-capability`, in particular, was removed from the V4 canonical sidebar because its registry HTML is empty.

## 8. Critical feature flow audit

### Dashboard
`app.html?page=index`
→ `#dashboardRoot`
→ `dashboard-firestore.js`
→ Firestore-backed dashboard data
→ render

This was previously impossible because the registry injected an empty string.

### Initiative
`app.html?page=inisiatif`
→ E1 HTML
→ `GEStore.hydrate(initiatives,touchpoints,documents)`
→ Initiative renderers
→ CRUD/timeline/milestone functions

### Calendar
`app.html?page=calendar`
→ E1 HTML
→ `projectEvents` + initiatives/touchpoints
→ Calendar renderer/filter/KPI/reminder functions

The existing one-way Initiative → Calendar data contract remains unchanged.

### Airport Experience
`app.html?page=airport-experience`
→ legacy network/map runtime
→ station/network/service relationships
→ map rendering

Legacy programmatic Station 360 navigation is explicitly normalized by V4.

### Station 360
`app.html?page=station-360`
→ station/network/service relationship runtime
→ detail view

### Customer Experience / OCR
`app.html?page=customer-experience`
→ CX runtime

`app.html?page=cx-import`
→ Tesseract assets
→ OCR extraction/validation/correction

The audit confirms OCR assets and engine exist, but persistence is still split from the canonical Firestore business store. This is a separate data-layer task, not a shell task.

### Lounge/Tenant
The existing P29 runtime supports multi-period pricing. V4 does not alter its data model.

## 9. CSS safety decision

DO NOT delete these structural/functional selectors globally:
- `.top`
- `.shell`
- `.side`
- `.main`
- `.hero`
- `.card`
- `.btn`
- `.panel`
- `.map`
- `.footer`
- `.back-to-top`
- form/table primitives
- login styles
- domain-specific selectors

The old-theme declarations can be removed later only when their runtime consumers are gone.

## 10. Build/test flow

Current `netlify.toml` already invokes:
`npm --prefix netlify/functions install --omit=dev --ignore-scripts && npm run test`

The repository has a root `package.json` with:
`"test": "node tests/run-build.mjs"`

Netlify's build configuration runs the configured build command and deploys the configured publish directory; the current root publish model remains compatible with this static architecture. citeturn1search5turn1search0

V4 adds a Clean-flow regression test to the test sequence.

The test must prove:
1. exactly 2 HTML files
2. canonical shell mount exists
3. Clean shell runtime is loaded
4. legacy shell runtimes are absent from registry
5. dashboard root exists
6. query-route boot mapping exists
7. hash preservation exists
8. programmatic routes are normalized
9. final-v257/domain CSS remains present

## 11. Manual deployment sequence

No GitHub writes are performed by this package.

Recommended order:
1. Upload `app.html`.
2. Upload `assets/clean-shell-runtime.js`.
3. Upload `assets/clean-route-adapter.js`.
4. Upload `assets/edition1-page-boot.js`.
5. Apply the registry edits exactly from `REGISTRY-MANUAL-EDIT.txt` OR run `apply-p40-clean-registry-v4.py` from the repository root.
6. Add `tests/clean-flow-regression.js`.
7. Apply `tests/run-build.mjs.patch`.
8. Apply `tests/clean-draft-regression.js.patch`.
9. Run `npm run test`.
10. Only after tests pass, push to the test branch and inspect the Netlify branch/deploy result.

Netlify branch deploys must be enabled in the site configuration; they are distinct from Deploy Previews. citeturn2search0turn2search1

## 12. Explicit non-changes in V4

V4 does NOT:
- delete `portal.css`
- rewrite Firebase rules
- replace Firebase authentication
- delete historical HTML/JS source files
- recreate one HTML file per page
- rewrite business CRUD logic
- change Lounge pricing schema
- change Calendar one-way semantics
- rewrite OCR persistence
- redesign the page visuals
- write anything to GitHub
- add speculative redirects
- add duplicate shell implementations

## 13. Remaining audit backlog after V4

P1 — legacy runtime query-route compatibility:
replace remaining direct `location.pathname` assumptions in legacy shared runtimes with one Clean route resolver.

P1 — CSS source cleanup:
after legacy shell migration, delete only proven-obsolete old-theme declarations from `portal.css`.

P1 — empty registry pages:
decide explicit ownership for P1/P2/P5 acceptance routes before exposing them.

P2 — CX persistence:
unify OCR/localStorage state with canonical Firestore/GEStore.

P2 — Airport Experience:
verify explicit WEST region semantics in the map filter and station data.

P2 — Calendar:
distinguish Initiative-linked activities from standalone activities without reverse-syncing Calendar activities into Initiative.

P2 — Lounge:
standardize `pricingPeriods` as canonical schema and retain `pricePerPax` only for legacy read compatibility.

P2 — template/source cleanup:
audit XLSX/CSV field parity before deleting source templates.

## Final rule
Do not call the Clean Draft fully safe merely because the shell renders.

The acceptance path is:
Login → app → canonical shell → route → page HTML → page runtime → permissions → data → interaction → result/error → navigation back to canonical route.

A page is complete only when that full path is verified.


---

## AUDIT-P40-CLEAN-FLOW-V5.md

# P40 Clean Flow Audit V5

## 1. What was wrong in the two screenshots

The mounted Clean shell was visible, but `app.html?page=index` was blank. The current registry `index` entry was empty and loaded `dashboard-firestore.js`, which is a Super Admin/governance dashboard implementation, not the Management Dashboard shown in the supplied reference.

The supplied reference dashboard already exists in the historical `index.html` implementation: it renders Management Dashboard, Airport Experience Network, Initiative & Improvement, Cost Intelligence, Budget & Financial, and the related cards/panels. V5 reuses that implementation rather than rebuilding the business dashboard from scratch.

## 2. V5 runtime ownership

`app.html` is the only Clean shell owner.

Flow for `page=index`:

`/app.html?page=index`
→ Clean route resolver
→ Clean reference shell
→ `#dashboardRoot`
→ Firebase config/client
→ Auth
→ GEStore
→ existing business engines needed by the reference dashboard
→ `clean-dashboard-management.js`
→ Firestore hydration
→ Management Dashboard render

The index route deliberately does not execute the registry's `dashboard-firestore.js`, so it cannot overwrite the Management Dashboard with the unrelated Super Admin dashboard.

Other routes continue through `clean-page-registry.js`, with legacy shell runtimes removed by the registry transformer.

## 3. Visual alignment

The shell now uses the existing final-v257/R9 visual system already present in `portal.css`:
- navy fixed header
- Garuda + Danantara horizontal lockup
- centered portal title
- period selector
- notification
- help
- SA user control
- navy sidebar
- white dashboard surface
- reference dashboard cards/panels

`e1-canonical.css` is not loaded by `app.html` because its shell geometry conflicts with the supplied final reference shell.

`portal.css` is NOT deleted because it contains the final dashboard/page visual layer and functional page CSS.

## 4. Collapse behavior

Sidebar bottom control:
- label: `Collapse`
- expanded state: full labels
- collapsed state: icon rail
- second click: expand again
- state persists using `GE_CLEAN_SIDEBAR_COLLAPSED`

The existing final-v257/R9 collapsed-state CSS is reused.

## 5. SA user control

The triangle is no longer a separate header control.

The user control is one button containing:
- SA avatar
- chevron

Clicking the same control opens/closes Profile / Sign Out.

## 6. Navigation

The visible navigation is aligned to the supplied reference:
- Dashboard Manajemen
- Pengalaman & Insight
  - Journey & Experience
  - Import CSI & NPS
  - Journey & Touch Point
  - Jaringan Pengalaman Bandara
  - Profil Station / 360
- Perbaikan & Implementasi
  - Initiative & Improvement
  - Improvement Opportunity
  - Planning & Scenario
  - Calendar & Project Tracking
- Perencanaan & Strategi
  - Planning Workspace
  - Lounge / Tenant Planning
  - Cost Intelligence
  - Budget & Financial

Additional Data/Admin/Support routes remain available lower in the navigation; they are not deleted.

## 7. Route safety

The existing Clean route adapter remains responsible for converting legacy `.html` links to `app.html?page=...` and preserving hash fragments.

The registry transformer also fixes programmatic Station 360 navigation, because click interception cannot catch `location.href` assignments.

## 8. Files

### Upload / replace
- `app.html`
- `assets/clean-shell-runtime.js`
- `assets/clean-shell.css`
- `assets/clean-dashboard-management.js`
- `assets/clean-route-adapter.js`
- `assets/edition1-page-boot.js`

### Transform existing
- `assets/clean-page-registry.js`

### Tests
- `tests/clean-flow-regression.js`
- `tests/run-build.mjs`
- `tests/clean-draft-regression.js`

## 9. Verification performed on a local Clean Draft copy

The V5 registry transformer was executed.

Result:
- 56 routes
- 0 legacy shell references
- 2 HTML files
- V5 clean-flow regression: PASS

The JavaScript files were also checked with Node syntax validation.

This is a local source/package verification only; it is not a Netlify deployment claim.


---

## CLEAN_MAPPING.md

# P40 CLEAN DRAFT 01 — Canonical Page Mapping

- Physical HTML source audited: 74
- Canonical portal HTML in draft: 2 (`login.html`, `app.html`)
- Logical page definitions in registry: 56
- E1 files are treated as corrected implementations of the same logical page, not new pages.
- Airport Experience merges network-stations + map; airport-experience-map was redirect-only.
- station-material / bo-space / airport-systems are child panels of their canonical planning parents.

## Canonical routes

- `action-scenario` ← action-scenario.html
- `admin` ← e1-admin.html
- `agreement-service` ← agreement-service.html
- `airport-experience` ← network-stations.html, map.html
- `asset-facility` ← asset-facility.html
- `audit-log` ← audit-log.html
- `berita` ← e1-berita.html
- `branch-office-planning` ← e1-branch-office-planning.html
- `budget-cost` ← budget-cost.html
- `calendar` ← e1-calendar.html
- `change-password` ← change-password.html
- `core-foundation` ← core-foundation.html
- `core-history` ← core-history.html
- `core-master` ← core-master.html
- `core-migration` ← core-migration.html
- `core-permission` ← core-permission.html
- `core-publication` ← core-publication.html
- `core-relationships` ← core-relationships.html
- `core-shared` ← core-shared.html
- `cost-intelligence` ← cost-intelligence.html
- `customer-experience` ← customer-experience.html
- `cx-import` ← cx-import.html
- `data` ← e1-data.html
- `gaso-planning` ← e1-gaso-planning.html
- `improvement-intake` ← improvement-intake.html
- `index` ← index.html
- `inisiatif` ← e1-inisiatif.html
- `initiative-conversion` ← initiative-conversion.html
- `initiative-traceability` ← initiative-traceability.html
- `kontak` ← e1-kontak.html
- `layanan` ← layanan.html
- `lounge-access` ← lounge-access.html
- `lounge-flights` ← lounge-flights.html
- `lounge-list` ← e1-lounge-list.html
- `lounge-procurement` ← lounge-procurement.html
- `lounge-purchase` ← lounge-purchase.html
- `lounge-visitor` ← lounge-visitor.html
- `management-outcome` ← management-outcome.html
- `master-data` ← master-data.html
- `planning-documents` ← e1-planning-documents.html
- `planning-workspace` ← planning-workspace.html
- `portal-management` ← portal-management.html
- `post-flight` ← post-flight.html
- `post-journey` ← post-journey.html
- `pre-flight` ← pre-flight.html
- `pre-journey` ← pre-journey.html
- `profile` ← profile.html
- `program-kerja` ← program-kerja.html
- `readiness` ← readiness.html
- `service` ← service.html
- `service-capability` ← service-capability.html
- `service-locations` ← service-locations.html
- `service-planning` ← e1-service-planning.html
- `standar` ← e1-standar.html
- `station-360` ← station-360.html
- `touchpoint` ← touchpoint.html

## Locked decisions
- `core-*`: Super Admin-only children under Portal Management.
- Initiative Timeline updates feed Calendar & Project Tracking one-way; standalone calendar/project activities do not write back to Initiative.
- CSV is canonical downloadable template when CSV/XLSX duplicates exist. Source files are audited separately and retained unless proven obsolete.
- Lounge/Tenant pricing supports multiple effective price periods per agreement. The P29 CSV already contains Price Period fields and is retained.

## Verification status
This is the first executable structural clean draft. It consolidates HTML/shell routing without intentionally deleting business runtimes. Real Firebase credentialed login, OCR, map interaction, CRUD, modal behavior, and every page action still require regression execution before any “AMAN” claim.

---

## P40-CLEAN-BOOTSTRAP-RECONSTRUCTED.md

# P40 CLEAN DRAFT — RECONSTRUCTED BOOTSTRAP INSTRUCTIONS

## Objective

Make `/app.html?page=<route>` a real runtime entry point.

The browser must have exactly this lifecycle:

AUTHENTICATED SESSION
→ app.html
→ canonical shell bootstrap
→ Clean route resolution
→ route HTML mount
→ route dependencies
→ page boot/hydration
→ Firebase/Firestore data
→ render

The old shell must NOT be instantiated inside Clean Draft.

## Non-negotiable architecture

- `app.html` is the single Clean Draft runtime entry.
- `assets/edition1-canonical-shell.js` owns the visible header/sidebar shell.
- `assets/clean-page-registry.js` owns route content/dependencies.
- `assets/clean-route-adapter.js` owns link normalization.
- `assets/edition1-page-boot.js` owns Edition 1 page hydration.
- Existing business engines remain the source of page functionality.
- Firebase rules and data paths remain unchanged.
- Do not rebuild the UI.
- Do not create HTML per page.
- Do not delete historical files merely because they are legacy.

## Old theme rule

The old theme is considered active when Clean Draft loads:
- `portal-shell.js`
- `edition1-portal-shell-entry.js`
- `edition1-portal-route-adapter.js`

Clean Draft must not load those shell runtimes.

Do not solve this with another CSS override. Stop the old runtime at the source.

`portal.css` may remain as the shared Edition 1 functional stylesheet because current canonical `final-v257` shell rules live there. Removing the entire stylesheet would remove required functional styling and is NOT the correct fix.

## Route contract

Canonical URL:
`/app.html?page=<clean-route>`

Examples:
- index → `/app.html?page=index`
- initiative → `/app.html?page=inisiatif`
- calendar → `/app.html?page=calendar`
- airport experience → `/app.html?page=airport-experience`
- admin → `/app.html?page=admin`

Legacy `.html` links may remain in source for compatibility, but Clean Route Adapter must convert them at navigation time.

Hashes must survive conversion:
`index.html#service-experience`
→ `app.html?page=index#service-experience`

Programmatic `location.href` / `location.replace` cannot be intercepted by click listeners. Known registry programmatic routes must therefore be corrected directly.

## Page boot contract

`edition1-page-boot.js` must resolve both:
- legacy pathname: `e1-inisiatif.html`
- Clean query route: `app.html?page=inisiatif`

It must map the Clean route to the existing E1 config, not create a second config system.

## Dashboard contract

The index registry MUST contain:
`<div id="dashboardRoot"></div>`

because `dashboard-firestore.js` renders exclusively into `#dashboardRoot`.

No empty index HTML is allowed.

## Change discipline

Only targeted replacements:
1. app.html bootstrap reference.
2. index registry mount.
3. remove old shell runtime entries from Clean registry.
4. query-aware E1 page boot.
5. hash-preserving route adapter.
6. known programmatic route normalization.

Do not replace entire files.

## Verification gates

Before calling the page ready:

1. Open `/app.html?page=index`.
2. Confirm canonical header and sidebar are populated.
3. Confirm no old shell script is requested by Clean Draft.
4. Confirm dashboardRoot exists.
5. Confirm dashboard content appears after data/auth bootstrap.
6. Open `/app.html?page=inisiatif`.
7. Confirm Initiative HTML renders and E1 boot runs.
8. Open `/app.html?page=calendar`.
9. Confirm Calendar HTML renders and E1 boot runs.
10. Test one programmatic Station 360 navigation.
11. Test hash navigation.
12. Run `npm run test`.
13. Only then deploy the branch.

If any gate fails, stop and inspect the runtime error; do not add another CSS patch blindly.


---

## PATCH_MANIFEST.md

# PATCH — Netlify root 404

Baseline: P40_CLEAN_FINAL_2HTML_FIREBASE_ALIGNED

Changed file:
- `_redirects` — added root rewrite `/` -> `/login.html` with HTTP 200.

Reason:
- Netlify production root was still returning its 404 page.
- The prior package's `netlify.toml` did not actually contain the root redirect.
- This patch does not add any HTML page and does not change the 2-HTML architecture.

Deploy:
- Copy `_redirects` to the same publish root as `app.html` and `login.html`.
- Do not nest it under another folder.

Expected:
- `/` serves `login.html` without redirecting the browser URL.


---

## R15_EXECUTION_REPORT.md

# Ground Experience Portal — R15 Execution Report

Baseline: consolidated P40 + R14 changed files. Existing working functions were retained; changes were made in the canonical runtime/store/CSS rather than adding replacement pages.

## Corrected in R15
- Firestore browser fallback now reads authoritative account data from root `/users`, not `portalData/users/records`.
- Initiative PIC account labels now show the user's name only.
- Gantt workspace restores six reference filters: Journey Scope, Touch Point, Station, PIC, Event Type, Initiative.
- Touch Point query context remains active when entering Gantt from Initiative.
- Gantt project/deadline sorting and project-column resize remain retained from the canonical R13 implementation.
- Gantt bars remain clickable and now expose PIC in hover/title context.
- Module Permission checkboxes are forced to compact native checkbox dimensions (17px) instead of inheriting large form-control sizing.
- Successful Firestore hydration status auto-clears after confirmation rather than remaining as page content.
- Existing Airport Experience mouse-wheel zoom/pointer pan canonical implementation retained.
- Existing Lounge searchable select implementation and Grid/Details canonical switch retained.

## Verification
- `node --check assets/edition1-business-runtime.js`: PASS
- `node --check assets/edition1-store.js`: PASS
- `npm test`: PASS
- `npm test -- --netlify`: PASS
- Added `tests/r15-functional-contract.js` to prevent regression of root `/users`, PIC labels, Gantt filters/click/hover, and compact permission checkboxes.

## Important
Automated build/static contract tests pass. Firebase content and pointer interactions still require deploy-preview browser verification against the real authenticated Firebase project because the build environment does not contain the user's live authenticated browser session.


---

## APPLY-ORDER.txt

APPLY IN THIS ORDER

1. Restore test-1 first if any P40 v1/v2 patch is still applied.
2. Apply PATCH-app.html.diff.
3. Apply PATCH-clean-page-registry.js.diff.
4. Apply PATCH-edition1-canonical-shell.js.diff.
5. Do NOT apply the previous P40 Clean Runtime v1/v2 patches.
6. Deploy test-1 preview.
7. Open /app.html?page=index with a hard refresh.

Expected first gate:
- no blank/empty legacy shell
- canonical Edition 1 header + sidebar
- Dashboard content mounts into #dashboardRoot
- dashboard-firestore.js renders after GEStore authentication/hydration

Only after this gate passes should we continue to Initiative/Calendar/etc.


---

## CHANGED-FILES.txt

P40 V5 CHANGED FILES
====================
UPLOAD / REPLACE
- app.html
- assets/clean-shell-runtime.js
- assets/clean-shell.css
- assets/clean-dashboard-management.js
- assets/clean-route-adapter.js
- assets/edition1-page-boot.js

TRANSFORM EXISTING FILE
- assets/clean-page-registry.js
  using patches/assets/apply-p40-clean-registry-v5.py

TEST PATCHES
- patches/tests/clean-flow-regression.js
- patches/tests/run-build.mjs.patch
- patches/tests/clean-draft-regression.js.patch

NOT CHANGED
- assets/portal.css
- Firebase rules
- auth architecture
- business CRUD engines
- historical source files
- GitHub branch


---

## DELETE.txt

# Physical deletions required by the canonical contract
assets/edition1-pages.css
assets/e1-canonical.css
assets/edition1-canonical-shell.js
assets/edition1-portal-shell-entry.js
assets/edition1-portal-route-adapter.js
tests/p40-firebase-edition1.js


---

## INSTALL.txt

P40 Edition 1 Canonical Shell + Firestore Source Fix

Replace the files in this ZIP at repository root using the same relative paths.

This patch intentionally does NOT replace the P38-locked assets/portal-shell.js.
Edition 1 uses assets/edition1-portal-shell-entry.js, a compatibility entrypoint
based on the locked portal-shell geometry/markup, with Edition 1 route admission
and transient UI-only in-memory state. It does not create a second visual shell.

Edition 1 pages no longer load:
- assets/e1-canonical.css
- assets/edition1-canonical-shell.js

Edition 1 pages now use:
- assets/edition1-portal-shell-entry.js
- assets/edition1-portal-route-adapter.js
- assets/edition1-overlay-manager.js

Firestore:
- Business data is read/written through /api/edition1-data.
- Browser business runtime/store does not use localStorage/sessionStorage.
- The store persists only collections actually hydrated by the current page.
- Firebase project ID: ground-experience-portal

Modal behavior:
- Page dialogs are promoted to document.body and own the full viewport,
  so they render above the fixed header and sidebar.

Validation:
- P40_FIREBASE_EDITION1_FUNCTIONAL_CONTRACT_PASS
- P40_V2_CANONICAL_SHELL_PASS
- P40_CANONICAL_DASHBOARD_FIRESTORE_PASS
- PACKAGE_VERIFY_PASS
- REGRESSION_AUDIT_PASS
- P29_LOUNGE_PLANNING_PASS
- P31_AUTHENTICATION_CONTRACT_PASS
- P31_ROLE_POV_RUNTIME_PASS
- P31A_SESSION_PROFILE_SERVICE_PASS
- P31B_LOGIN_ACCESS_ASSISTANCE_PASS
- P32_ACCESS_ASSISTANCE_ADMIN_PASS
- P32_ACCESS_ASSISTANCE_RUNTIME_PASS
- P33_P34_P35_P36_P37_PRESENTATION_CONTRACT_PASS
- P27_PROFILE_SELF_SERVICE_CONTRACT_PASS
- P38_REPOSITORY_HYGIENE_PASS
- NETLIFY_BUILD_CHAIN_PASS


---

## R38_1_CHANGELOG.txt

R38.1 — Master Data & Partners table action restoration

Root cause fixed:
- master-reference.js used a local exact role comparison for "Super Admin" / "Admin".
- When the authenticated session role/access representation differed (e.g. normalized Superadmin/accessLevel Admin), the page rendered table headers but suppressed row checkboxes and Edit/Delete actions.

Changes:
- Reuse canonical gxCanManage() permission when available.
- Safe normalized fallback for Super Admin/Admin/accessLevel Admin.
- Preserve per-row checkbox, Edit, Delete, select-all and Hapus Terpilih.
- Select-all header now follows the same permission as row selection/actions.
- Keeps R38 save/loading/batched persistence improvements unchanged.


---

## R38_CHANGELOG.txt

R38 - Master Data & Partners Save Responsiveness / Bulk Persistence

Changed:
1. assets/master-reference.js
   - Save immediately enters busy state: Menyimpan… + spinner.
   - Save/Cancel/X disabled while persistence is running.
   - aria-live status added.
   - duplicate clicks blocked.
   - failure restores controls and shows explicit error.
2. assets/edition1-store.js
   - multi-row diffs use bounded BATCH requests (75 changes/request) instead of one browser HTTP request per row.
   - single-row save keeps existing single-write path.
3. netlify/functions/edition1-data.js
   - authenticated BATCH action, max 75 changes.
   - each item still passes existing writeOne permission/scope/audit contract.
4. assets/portal.css
   - saving-state/spinner styling.
5. tests/r38-master-save-contract.js + tests/run-build.mjs
   - regression contract for busy-state and batch persistence.

Verification:
- npm test: PASS, including R15-R32 contracts and R38_MASTER_SAVE_CONTRACT_PASS.
- Browser/Netlify runtime has NOT been claimed PASS; deploy verification is still required.


---

## R39_CHANGELOG.txt

R39 — P1–P8 / Dashboard / Cost alignment
- Keeps R38.2 Master Data fixes intact in the working baseline.
- Management Attention drills into Improvement Opportunity (P2/P3), with severity from available source fields/score rather than forcing High.
- Decision Required drills into Management Outcome (P5).
- P5 is independently grantable; authorized Admin gets the menu, Super Admin remains unrestricted.
- Airport Experience Network drilldown opens explicit Network projection; Map and Station 360 remain separate destinations/functions inside the canonical Airport Experience domain.
- Management dashboard retains Cost Intelligence and Budget & Financial; unit cost remains unavailable if denominator/source is unavailable.
- BO/HO operational dashboard has network/station View selector based on available scope/data; no invented passenger/flight usage figures.
- CSI and NPS metric cards are individually clickable.
- Dashboard visual hierarchy adjusted toward approved reference: navy primary, semantic colors only for status/priority, proportional charts/cards.
- Added R39 regression contract. Full npm test PASS locally.
NOTE: Browser/Netlify runtime has not been claimed PASS; validate after deploy.


---

## R40_CHANGELOG.txt

R40 — Airport Map + Master Table Presentation

1. Master Data & Partners table
- Compact and consistent row/header height.
- Header and body cells vertically centered.
- Row checkbox and Select All centered horizontally/vertically.
- Action buttons aligned in the same row geometry.
- Existing Edit/Delete/Select functionality preserved.

2. Airport Experience Map
- Right-side airport detail redesigned to approved reference structure.
- City + airport/context header.
- Vendor/provider chips.
- Service / Facility / System / Contract tabs with live counts from GEStore.
- Tab content cards use existing Firestore-backed datasets only.
- Direct Station 360 action from selected airport.
- Existing marker renderer/filter/hover/click preserved.
- Network rows remain clickable to Station 360.

3. Cache identity
- business runtime / portal stylesheet references bumped to r40.

Validation
- Full npm test suite PASS through R40_MAP_TABLE_PRESENTATION_CONTRACT_PASS.
- Browser/Netlify deploy still requires live validation.


---

## R41_CHANGELOG.txt

R41 root correction
- Fix canonical edition1-business-runtime syntax error introduced by literal escaped newline before R39. This error stopped the whole business runtime, including Initiative and Airport Map renderers.
- Add node --check regression guard so a syntactically invalid browser runtime cannot pass build contracts again.
- Airport Experience now hydrates serviceProcurement, facilities and assets required by R40 detail tabs.
- Master Data table vertical alignment now overrides the higher-specificity final shell td vertical-align:top rule.
- Cache identities bumped to r41 for business runtime, page boot and portal CSS.


---

## ROLLBACK-SCOPE.txt

Restore ONLY these files to the exact test-1 baseline:
app.html
assets/clean-page-registry.js
assets/edition1-canonical-shell.js

If using the test-1 git checkout:
git restore -- app.html assets/clean-page-registry.js assets/edition1-canonical-shell.js

Do not revert unrelated files.


---

## START_HERE.txt

Open login.html


---

## CBNR CURRENT REVISION — Monitoring Checklist Header + UI Source Consolidation

Scope executed against the existing canonical test-1/current working tree; no clean-slate rebuild.

1. Monitoring & Assessment — Checklist Header
- Added one canonical `checklistHeader()` renderer in `assets/form-management.js`.
- Preview now visibly renders a Checklist Header before checklist sections.
- Header fields are sourced from the existing checklist/work model: Monitoring Work, Station, Due Date, Frequency, Assessment Indicator, Journey Scope, Touch Point, plus title/purpose/category.
- Completion and submission detail use the same header renderer; no second header implementation was introduced.

2. Monitoring & Assessment — Legacy button source cleanup
- Template Edit/View action now uses the canonical `ge-btn compact` source class.
- Section Delete and field Delete now use canonical danger button source classes.
- No CSS-only masking was used to disguise the previous button source.

3. Monitoring & Assessment — Geometry/source consolidation
- Removed the duplicated Monitoring/form-builder geometry block from `assets/portal.css`.
- Canonical Monitoring checklist/header/form geometry is now defined in `assets/global-ui-canonical.css`.
- Checklist metadata and form controls use one canonical height family in the Monitoring implementation.

4. Regression gate
- Added `R112_MONITORING_CHECKLIST_HEADER_CANONICAL_CONTRACT_PASS`.
- `npm test` PASS: `CBNR_REGRESSION_GATE_PASS TESTS=57`.
- Existing R108 Monitoring/Network contract remains PASS.

Validation limitation
- This revision has source/build validation only. Live browser preview/UAT has not been claimed as PASS.

## CBNR — Lounge/Provider reference correction + Monitoring checklist header
- Corrected Lounge/Tenant Add/Edit action labels to canonical `Save` / `Cancel` and standardized price-period deletion to filled danger `Delete`.
- Corrected Lounge/Tenant empty-entry examples to use placeholders rather than field values.
- Reordered Planning GHA/Provider fields to follow the established Lounge/Tenant form structure: Station/BO → Provider → Scope → PIC → Agreement → Effective Period → Currency → Price → SLA → AHAN.
- Reused the Lounge/Tenant card structure for Service & Provider / GHA cards instead of introducing a separate card visual system.
- Corrected Master Reference GHA Add/Edit ordering to the same provider structure and standardized AHAN deletion.
- Kept Monitoring checklist header as the canonical source used by Preview and Completion; regression contract retained.
- Added R113 provider/reference regression contract.
- Removed legacy `assets/global-ui-standard.js` and `assets/app.js` from the canonical package.
### 2026-10-03 — Monitoring tab visual recovery
- Monitoring tab menu was visually altered while the requested work was button standardization and Submission page work.
- Recovered the tab geometry from the previously proven `assets/portal.css` implementation into the canonical `assets/global-ui-canonical.css`; no duplicate tab runtime/CSS was restored to `portal.css`.
- Preserved the existing Monitoring tab structure and labels; no navigation/functionality was changed.

