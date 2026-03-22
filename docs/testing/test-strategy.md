# Test Strategy

## Objective
Make `kinelo.fit` releasable through a repeatable test stack that protects:
- public browsing UX
- auth and saved-state degradation
- class/studio/teacher trust
- catalog quality and freshness

## Test Layers

### 1. Domain and Data
Command:
- `npm test`

Covers:
- filters
- readiness
- freshness scheduling
- import policy and validator
- session decoding
- price note normalization

Purpose:
- stop regressions in core behavior before a browser is involved

### 2. Route and Contract
Recommended coverage:
- `/api/digest`
- `/api/state/favorites`
- `/api/state/schedule`
- `/api/calendar-submissions`
- `/api/claims`
- auth route degradation and locale redirects

Contract rules:
- stable app error codes
- predictable status codes
- no 500 for known missing auth/store cases

### 3. Critical Browser E2E
Command:
- `npm run test:e2e`

Current intent:
- anonymous exploration
- class view switching and filter persistence
- sign-in surface quality
- favorites/schedule degraded states
- suggest-calendar submission
- claim submission
- localized pricing and public-copy checks

### 4. Release Gates
Commands:
- `npm run smoke:routes`
- `npm run catalog:coverage`
- `npm run freshness:report`
- `npm run test:release`

Purpose:
- verify the built app and the public catalog as shipped

## Frequency

### Every PR to `main`
Run:
1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npm run smoke:routes`
6. `npm run test:e2e`

### Before Every Major Release
Run:
1. `npm run test:release`
2. `npm run db:push` in every DB-backed target environment with pending schema changes
3. `npm run catalog:bootstrap` against the target DB
4. `npm run catalog:coverage`
5. `npm run freshness:report`
6. manual release checklist from `docs/testing/release-checklist.md`

## Acceptance Rules
A build is releasable only if:
- lint, typecheck, unit, build, smoke, and critical E2E all pass
- no public technical copy appears on core routes
- no English pricing leaks onto Italian public pages
- no normal user flow lands in the global error boundary
- Palermo catalog metrics remain above the intended usefulness threshold

## Gaps Explicitly Tracked
Not fully automated by default CI yet:
- real third-party auth callbacks
- signed-in persistence flows with a real session
- real outbound platform success after external navigation

Those remain environment-gated, not ignored.
