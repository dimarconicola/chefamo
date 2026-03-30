import { getCatalogSourceMode } from '@/lib/catalog/server-data';
import { getCatalogDb, getPersistentStoreDb, isCatalogDatabaseEnabled, isDatabaseConfigured, isPersistentStoreEnabled } from '@/lib/data/db';
import { env } from '@/lib/env';
import { getLatestFreshnessSnapshot } from '@/lib/freshness/service';
import { getMapRuntimeDetail } from '@/lib/map/runtime';
import { isPersistentStoreConfigured } from '@/lib/runtime/store';

export type HealthStatus = 'ok' | 'warn' | 'fail';

export interface HealthCheck {
  label: string;
  status: HealthStatus;
  detail: string;
}

export const getRuntimeHealth = async (citySlug = 'palermo') => {
  const latestFreshness = await getLatestFreshnessSnapshot(citySlug);
  const catalogSource = await getCatalogSourceMode();
  const catalogDb = getCatalogDb();
  const storeDb = getPersistentStoreDb();
  const mapRuntime = getMapRuntimeDetail();

  const checks: HealthCheck[] = [
    {
      label: 'Catalog source',
      status: catalogSource === 'database' ? 'ok' : env.catalogDatabaseEnabled ? 'warn' : 'ok',
      detail:
        catalogSource === 'database'
          ? 'Reading Chefamo catalog from the dedicated Postgres snapshot.'
          : env.catalogDatabaseEnabled
            ? 'Catalog database is enabled, but runtime fell back to the Chefamo seed snapshot.'
            : 'Catalog database is intentionally disabled; running on the Chefamo seed snapshot.'
    },
    {
      label: 'Database',
      status:
        isCatalogDatabaseEnabled || isPersistentStoreEnabled
          ? isDatabaseConfigured && Boolean(catalogDb || storeDb)
            ? 'ok'
            : 'fail'
          : 'ok',
      detail:
        isCatalogDatabaseEnabled || isPersistentStoreEnabled
          ? isDatabaseConfigured && Boolean(catalogDb || storeDb)
            ? 'DATABASE_URL configured and the Chefamo backend client booted.'
            : 'Dedicated Chefamo backend is enabled, but DATABASE_URL is missing or unavailable.'
          : 'Dedicated Chefamo backend is intentionally disabled in this environment.'
    },
    {
      label: 'Persistent store',
      status: isPersistentStoreConfigured() ? 'ok' : env.requirePersistentStore ? 'fail' : env.persistentStoreEnabled ? 'warn' : 'ok',
      detail: isPersistentStoreConfigured()
        ? 'Claims, submissions, favorites, and schedule use Postgres.'
        : env.requirePersistentStore
          ? 'Persistent store is required in this environment but Postgres is unavailable.'
          : env.persistentStoreEnabled
            ? 'Persistent store is enabled but not currently reachable.'
            : 'Persistent store is intentionally disabled until Chefamo has its own backend.'
    },
    {
      label: 'Public map engine',
      status: mapRuntime.renderMode === 'interactive' ? 'ok' : 'fail',
      detail:
        mapRuntime.renderMode === 'interactive'
          ? `Leaflet map active with ${mapRuntime.usingDefaultProvider ? 'default Carto tiles' : 'custom tile provider'}.`
          : 'Tile provider configuration is malformed, so the public map cannot initialize cleanly.'
    },
    {
      label: 'Supabase public auth',
      status: env.supabaseAuthEnabled ? (env.supabaseUrl && env.supabaseAnonKey ? 'ok' : 'warn') : 'ok',
      detail: env.supabaseAuthEnabled
        ? env.supabaseUrl && env.supabaseAnonKey
          ? 'Chefamo Supabase auth is configured.'
          : 'Chefamo Supabase auth is enabled, but auth envs are incomplete.'
        : 'Supabase auth is intentionally disabled until Chefamo has its own project.'
    },
    {
      label: 'Session secret',
      status: env.sessionSecret !== 'chefamo-dev-secret' ? 'ok' : env.nodeEnv === 'development' ? 'warn' : 'fail',
      detail:
        env.sessionSecret !== 'chefamo-dev-secret'
          ? 'APP_SESSION_SECRET configured.'
          : 'Using development session secret.'
    },
    {
      label: 'Freshness snapshot',
      status: latestFreshness ? 'ok' : 'warn',
      detail: latestFreshness
        ? `Latest ${latestFreshness.cadence} run recorded at ${latestFreshness.createdAt}.`
        : 'No freshness run recorded yet.'
    }
  ];

  return {
    checks,
    hasFailures: checks.some((check) => check.status === 'fail'),
    hasWarnings: checks.some((check) => check.status === 'warn')
  };
};
