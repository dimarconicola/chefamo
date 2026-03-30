# Test Strategy

## Objective

Make `chefamo` releasable through a repeatable test stack that protects:

- public browsing UX
- auth and saved-state degradation
- activity, place, and organizer trust
- catalog quality and freshness

## Test layers

### Domain and data

Command:

- `npm test`

Covers:

- filters
- readiness
- freshness scheduling
- import policy and validator
- session decoding
- price note normalization

### Route and contract

Important routes:

- `/api/digest`
- `/api/state/favorites`
- `/api/state/schedule`
- `/api/calendar-submissions`
- `/api/claims`

### Browser E2E

Command:

- `npm run test:e2e`

Focus:

- anonymous browse
- activity filters and view switching
- sign-in surface quality
- degraded favorites and plan states
- public submission flows

### Release gate

Commands:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke:routes`

## Acceptance rule

A build is releasable only if:

- lint, typecheck, tests, and build pass
- no public route leaks technical copy
- Palermo catalog stays above readiness thresholds
- saved plan remains occurrence-only
