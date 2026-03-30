# Release Checklist

## Automated Gate
Run in order:
1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npm run smoke:routes`
6. `npm run test:e2e`
7. `npm run catalog:coverage`
8. `npm run freshness:report`

If the target environment is DB-backed and schema changed:
9. `npm run db:push`

## Public UX Spot Check
Check these routes manually on desktop and mobile:
1. `/it`
2. `/it/palermo`
3. `/it/palermo/activities`
4. one place page
5. one organizer page
6. `/it/sign-in`
7. `/it/favorites`
8. `/it/schedule`
9. `/it/suggest-calendar`
10. one claim page

## Things That Must Be True
- no public developer copy
- no global error boundary in normal flows
- Italian surfaces do not show English pricing strings
- digest feedback is readable
- header account email stays inside its container
- map/list/calendar switch works without losing filters
- every visible activity card has a valid action path

## Data Quality Spot Check
- Palermo weekly activities count looks plausible
- places count looks plausible
- pricing strings are localized where available
- kids activities remain visible only where intended
- CTA coverage issues do not leak to public UI

## Env-Gated Checks
When auth credentials are enabled in the target environment:
- magic link request works
- OAuth start works
- callback returns to the correct locale
- explicit logout works
- signed-in favorites persist
- signed-in saved schedule persists
