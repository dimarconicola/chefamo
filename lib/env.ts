const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  vercelEnv: process.env.VERCEL_ENV,
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  catalogDatabaseEnabled: process.env.CHEFAMO_ENABLE_DATABASE_CATALOG === 'true',
  persistentStoreEnabled: process.env.CHEFAMO_ENABLE_PERSISTENT_STORE === 'true',
  supabaseAuthEnabled: process.env.CHEFAMO_ENABLE_SUPABASE_AUTH === 'true',
  mapTileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL,
  mapTileAttribution: process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION,
  mapTileSubdomains: process.env.NEXT_PUBLIC_MAP_TILE_SUBDOMAINS,
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.CHEFAMO_ENABLE_SUPABASE_AUTH === 'true' ? rawSupabaseUrl : undefined,
  supabaseAnonKey: process.env.CHEFAMO_ENABLE_SUPABASE_AUTH === 'true' ? rawSupabaseAnonKey : undefined,
  cronSecret: process.env.CRON_SECRET,
  sessionSecret: process.env.APP_SESSION_SECRET ?? 'chefamo-dev-secret',
  requirePersistentStore: process.env.CHEFAMO_REQUIRE_PERSISTENT_STORE === 'true'
};
