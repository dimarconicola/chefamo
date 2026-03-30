# chefamo

A Palermo-first, bilingual discovery app for activities, places, and organizers focused on ages 0-14.

## What is implemented

- Next.js App Router app with `en` and `it` locale routing.
- Palermo public city hub with `activities`, `places`, `organizers`, category pages, neighborhood pages, and editorial collections.
- DB-first catalog architecture with typed `Place`, `Organizer`, `Program`, and `Occurrence` models.
- Seed fallback with Palermo family-activity data across culture, movement, STEM, reading, and outdoor picks.
- Supabase-first auth path with demo fallback when credentials are not configured.
- Postgres-backed persistence for claims, digest signups, outbound click tracking, favorites, and saved plan when `DATABASE_URL` is configured.
- Admin overview, imports, freshness, claims, collections, inbox, and taxonomy pages.

## Stack

- Next.js 15
- TypeScript
- Drizzle ORM for PostgreSQL
- Supabase auth/runtime integration
- Leaflet public map stack
- Luxon for time handling
- Vitest, Node tests, and Playwright

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/it`.

## Useful commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run readiness
npm run freshness:run
npm run validate:import
```

## Product model

- `activities`: dated upcoming occurrences with a real day and time
- `places`: museums, libraries, parks, labs, schools, clubs, and venues worth visiting
- `organizers`: institutions or operators behind the supply
- `programs`: recurring or evergreen offers that can exist with or without dated occurrences

## Current behavior

- Browsing is public.
- Favorites and saved plan require sign-in.
- Catalog data defaults to the built-in Chefamo family seed unless `CHEFAMO_ENABLE_DATABASE_CATALOG=true`.
- Persistent account state is only enabled when the Chefamo store/auth env flags are explicitly turned on.
- Supply/readiness is computed from the active Palermo catalog.
- Freshness checks and source-registry workflows are available through the admin and cron surfaces.

## Documentation

- [Product overview](./docs/product-overview.md)
- [Architecture](./docs/architecture.md)
- [Automation and operations](./docs/automation.md)
- [Database workflow](./docs/database.md)
- [Catalog policy](./docs/catalog-policy.md)
- [Testing strategy](./docs/testing/test-strategy.md)
- [UX flows](./docs/testing/ux-flows.md)
- [Release checklist](./docs/testing/release-checklist.md)
