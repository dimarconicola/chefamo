# Architecture

## System shape

`chefamo` is a Next.js App Router application with a DB-first catalog, a typed domain model, and a lightweight operations layer for freshness and review workflows.

High-level flow:

```text
Public routes
  -> catalog snapshot
  -> typed view models
  -> server-first pages

Catalog snapshot
  -> Postgres when available
  -> seed fallback otherwise

Operational inputs
  -> source registry
  -> freshness runs
  -> public submissions
  -> import validation
  -> discovery leads
```

## Main layers

### Route layer

Important public routes:

- `app/[locale]/page.tsx`
- `app/[locale]/[city]/page.tsx`
- `app/[locale]/[city]/activities/page.tsx`
- `app/[locale]/[city]/places/page.tsx`
- `app/[locale]/[city]/organizers/page.tsx`
- `app/[locale]/[city]/places/[slug]/page.tsx`
- `app/[locale]/[city]/organizers/[slug]/page.tsx`

The route layer should stay thin:

- load snapshot data
- derive a page-specific view model
- render server-first UI
- hand interaction off to small client controllers only where needed

### Catalog layer

The catalog domain lives in `lib/catalog/`.

Core entities:

- `Place`
- `Organizer`
- `Program`
- `Occurrence`
- categories, styles, neighborhoods, collections

The public app should consume typed catalog data, not raw schema rows.

### Persistence layer

Database schema lives in `lib/data/schema.ts`.

Current storage responsibilities include:

- catalog tables
- favorites
- saved plan
- claims
- digest subscriptions
- source registry
- source records
- freshness runs
- discovery leads

### Runtime store

`lib/runtime/store.ts` bridges product features and persistence.

Rules:

- use Postgres when configured
- allow explicit local fallback in lower environments
- never expose storage internals in public UI

### Freshness and source ops

Main files:

- `lib/freshness/service.ts`
- `lib/freshness/source-registry.ts`
- `lib/freshness/adapters.ts`
- `lib/freshness/social-events.ts`

Responsibilities:

- decide which sources are due
- fetch and compare lightweight signals
- run structured adapters where possible
- extract low-confidence one-off candidates from weaker sources
- write reviewable freshness state

## Read path

Main entry:

- `lib/catalog/repository.ts`

Flow:

1. load Postgres snapshot when available
2. normalize it into the public domain model
3. enrich with seed-backed media and fallbacks where needed
4. fall back to the Palermo seed snapshot when DB access is unavailable

## Product-state model

- favorites are for `place`, `program`, and `organizer`
- saved plan stores `occurrenceId` only
- calendar and claim submissions enter moderation first

## Map architecture

The public map stack is Leaflet-based.

Key idea:

- server aggregates occurrence data into map-friendly place summaries
- client renders clusters and detail selection without owning raw catalog logic
