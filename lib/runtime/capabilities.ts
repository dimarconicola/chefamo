import { cache } from 'react';

import { isSupabaseConfigured } from '@/lib/auth/supabase';
import { getPersistentStoreDb } from '@/lib/data/db';
import { env } from '@/lib/env';

export type AuthMode = 'supabase' | 'dev-local' | 'unavailable';
export type StoreMode = 'database' | 'unavailable';

export interface RuntimeCapabilities {
  authMode: AuthMode;
  storeMode: StoreMode;
}

const isLocalDevelopment = () => env.nodeEnv === 'development' && !env.vercelEnv;
const isPreviewDeployment = () => env.vercelEnv === 'preview';

export const getAuthMode = (): AuthMode => {
  if (isSupabaseConfigured) return 'supabase';
  if (isLocalDevelopment()) return 'dev-local';
  if (isPreviewDeployment()) return 'dev-local';
  return 'unavailable';
};

export const getStoreMode = (): StoreMode => (getPersistentStoreDb() ? 'database' : 'unavailable');

export const getRuntimeCapabilities = cache(async (): Promise<RuntimeCapabilities> => ({
  authMode: getAuthMode(),
  storeMode: getStoreMode()
}));
