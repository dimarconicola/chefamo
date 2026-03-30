# Database Workflow

`chefamo` supports a DB-first catalog backed by Supabase Postgres.

## Minimal setup

Create `.env.local` with:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For Supabase, prefer the transaction pooler URL for runtime access.

## Commands

Generate schema diffs:

```bash
npm run db:generate
```

Push reviewed schema changes:

```bash
set -a && source .env.local && set +a && npm run db:push
```

Bootstrap the Palermo catalog:

```bash
set -a && source .env.local && set +a && npm run db:bootstrap
```

Schema plus bootstrap:

```bash
set -a && source .env.local && set +a && npm run db:setup
```

## Operational rule

- commit generated SQL in `drizzle/` when schema changes
- keep catalog bootstrap idempotent
- treat seed data as fallback and bootstrap source, not as the long-term production truth
