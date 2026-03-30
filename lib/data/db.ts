import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/lib/env';
import * as schema from '@/lib/data/schema';

type AppDb = ReturnType<typeof drizzle<typeof schema>>;

let queryClient: ReturnType<typeof postgres> | null = null;
let db: AppDb | null = null;

export const isDatabaseConfigured = Boolean(env.databaseUrl);
export const isCatalogDatabaseEnabled = env.catalogDatabaseEnabled && isDatabaseConfigured;
export const isPersistentStoreEnabled = env.persistentStoreEnabled && isDatabaseConfigured;

export const getDb = (): AppDb | null => {
  if (!env.databaseUrl) return null;

  if (!queryClient) {
    queryClient = postgres(env.databaseUrl, { prepare: false });
  }

  if (!db) {
    db = drizzle(queryClient, { schema });
  }

  return db;
};

export const getCatalogDb = () => (isCatalogDatabaseEnabled ? getDb() : null);

export const getPersistentStoreDb = () => (isPersistentStoreEnabled ? getDb() : null);
