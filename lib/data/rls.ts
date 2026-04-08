import postgres from 'postgres';

import { env } from '@/lib/env';

const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const enablePublicTableRls = async () => {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Row-level security hardening requires a writable Postgres database.');
  }

  const client = postgres(env.databaseUrl, { prepare: false });

  try {
    const publicTables = await client<{ tablename: string }[]>`
      select tablename
      from pg_tables
      where schemaname = 'public'
      order by tablename
    `;

    for (const row of publicTables) {
      await client.unsafe(`alter table public.${quoteIdentifier(row.tablename)} enable row level security`);
    }

    return publicTables.map((row) => row.tablename);
  } finally {
    await client.end({ timeout: 5 });
  }
};
