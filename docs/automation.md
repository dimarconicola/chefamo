# Automation and Operations

## Why automation exists in this product

The whole point of `chefamo` is not just to publish a static local guide.
It is to keep a local family-activity catalog useful with as little manual maintenance as possible, while still protecting trust.

That means the automation strategy must do two things at once:
- reduce manual work
- avoid publishing low-confidence garbage

The project now automates a meaningful part of the operating loop, but it does so with explicit guardrails.

## Operating model

Automation in this product is split into four layers:

1. `source discovery`
2. `source checking`
3. `structured parsing / candidate extraction`
4. `review, suppression, and public projection`

This is important.
The system is not “scrape everything and publish it”.
It is “check often, trust selectively, publish carefully”.

## Source registry

The source registry defines what the system watches.

Main file:
- `lib/freshness/source-registry.ts`

Each source entry carries:
- `sourceUrl`
- `sourceType`
- `purpose`
- `cadence`
- `trust tier`
- optional parser adapter

This gives the project a structured inventory of monitoring targets by city.

## Cadence strategy

The product uses cadence tiers instead of one giant refresh loop.

### Daily
Used for:
- top recurring structured sources
- high-value official sources

Goal:
- fast detection of meaningful changes

### Weekly
Used for:
- broader official coverage
- social or weaker-but-important sources
- event-series style sources

Goal:
- keep the city reasonably fresh without over-spending on noisy sources

### Quarterly
Used for:
- discovery sweeps
- lead generation
- broader source expansion

Goal:
- find new supply and new candidate sources

## Freshness run engine

Main file:
- `lib/freshness/service.ts`

The freshness engine does the following:

1. load registry entries for a city and cadence
2. decide which sources are due
3. fetch lightweight source signals
4. compare new signals against previous ones
5. identify impacted sources
6. run parsers or candidate extraction where available
7. persist source checks and run metrics
8. update stale / hidden session state according to policy

The engine is designed to be:
- low-resource
- deterministic
- idempotent enough for operational use

## Lightweight signal strategy

The product does not fully scrape and parse every source on every run.

Default signal strategy:
- `HEAD` first when possible
- fallback to `GET` only when necessary
- compare:
  - final URL
  - status
  - `etag`
  - `last-modified`
  - `content-length`
  - optional body digest

This makes weekly and daily checking affordable.

## Parser adapters

Some sources are structured enough to support reliable parsing.

Examples already supported:
- Rishi
- Taiji
- selected custom source adapters

Adapter responsibilities:
- read source HTML
- detect recurring timetable structure
- derive stable session signatures
- identify changes with enough confidence
- auto-reverify matching sessions when safe

This is where automation becomes high leverage.

## Social and one-off event automation

Social-only venues are the hard problem.

The system now has a separate layer for this:
- `lib/freshness/social-events.ts`

It does not assume social content is canonical by default.
Instead it tries to extract:
- candidate one-off events
- event-like signals with date and time
- structured hints from noisy pages

Those candidates can then be:
- stored
- reviewed
- projected into the public catalog if valid enough

This is the right architecture for sources like Facebook pages:
- useful signal source
- not always reliable canonical schedule source

## Public projection of candidates

The catalog repository can project valid source-event candidates into public sessions.

That means:
- the public app can benefit from automation
- without rewriting the canonical recurring schedule every time

This is especially useful for:
- workshops
- one-off kids sessions
- special events

## Stale and hidden policy

Freshness automation is not just about finding new content.
It is also about retiring weak or outdated content.

Current policy direction:
- changed or broken sources can mark sessions stale
- stale sessions can age into hidden status
- broken links are counted explicitly
- low-confidence changes should not silently become public truth

This makes the catalog cleaner over time.

## Import validation

Automation also includes controlled ingestion, not just source checking.

Main files:
- `lib/catalog/import-validator.ts`
- `scripts/validate-import.ts`

Validation checks:
- scope
- category fit
- valid URLs
- attendance model coverage
- pricing presence
- data policy compliance

This prevents bad data from entering the system just because it was easy to collect.

## Runtime storage automation

The product also automates user and inbound operational flows through a common runtime store.

Main file:
- `lib/runtime/store.ts`

This store supports:
- claims
- calendar submissions
- digest subscriptions
- favorites
- saved schedule
- user profile

When Postgres is present:
- these flows persist properly

When fallback is allowed:
- local runtime files keep development usable

The user-facing app should never expose these operational details.

## Health and visibility

Automation without visibility is not enough.

Main file:
- `lib/ops/health.ts`

Health surfaces report:
- catalog source mode
- DB availability
- store persistence mode
- map engine state
- auth env presence
- session secret setup
- freshness snapshot availability

This is the operator-facing layer that keeps the product from silently drifting into a bad state.

## Release automation and test gates

The project now has a structured repeatable release discipline.

Important docs:
- `docs/testing/ux-flows.md`
- `docs/testing/test-strategy.md`
- `docs/testing/release-checklist.md`

Important commands:
- `pnpm lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke:routes`
- `npm run test:e2e`
- `npm run catalog:coverage`
- `npm run freshness:report`

This is part of the automation story.
Keeping the catalog fresh is useless if releases regularly break the public experience.

## What was automated over time

The project moved through these steps:

### 1. Seed-first public app
- public browsing built on a typed seed catalog
- good for shipping product surfaces quickly
- limited for real operations

### 2. DB-first read path
- introduced a catalog repository
- public routes started reading snapshots from Postgres first
- seed remained fallback instead of primary source

### 3. Runtime persistence
- favorites, schedule, claims, digest, and submissions moved toward DB-backed storage
- fallback remained only for allowed lower environments

### 4. Freshness engine
- source registry
- cadence scheduling
- signal comparison
- run persistence
- stale handling

### 5. Parser and candidate automation
- structured source adapters for recurring schedules
- social event candidate extraction for weaker sources

### 6. Release-quality automation
- smoke checks
- route contract tests
- E2E critical flow coverage
- CI gating

This is the actual automation arc of the product.

## What is automated today vs what still needs judgment

### Automated well today
- recurring structured source checks
- run scheduling by cadence
- source signal comparison
- parser-backed revalidation on supported sources
- catalog coverage reporting
- release-quality checks

### Automated partially
- one-off social event detection
- partner-source discovery
- import review workflows

### Still requires human judgment
- low-confidence social-only sources
- ambiguous pricing or attendance-model interpretation
- identity matching for teachers and social accounts
- deciding whether a new venue belongs in scope

This split is healthy.
Trying to automate those final judgment calls too early would make the catalog less trustworthy.

## Practical operator workflow

In a healthy operating cycle:

1. freshness runs happen by cadence
2. source changes are recorded
3. structured sources update recurring confidence
4. social/event candidates are stored when detected
5. operators review ambiguous cases
6. public catalog stays current without needing constant manual rebuilding

That is the target system.

## Current constraints

The biggest automation constraint remains source quality.

Good automation depends on:
- stable markup
- accessible pages
- official recurring schedules
- explicit booking or contact targets

Bad automation candidates:
- private or login-walled content
- noisy social pages with weak event structure
- pages that only show image posts without machine-readable detail

This is why the architecture uses trust tiers and candidate flows.

## Guiding principle

The product should automate everything it can defend.

That means:
- automate repetitive checking
- automate structured parsing
- automate suppression and health reporting
- automate release validation

But:
- do not automate false confidence
- do not publish dubious data just because a source changed

That discipline is the difference between a useful local operating system and a noisy scraper project.
