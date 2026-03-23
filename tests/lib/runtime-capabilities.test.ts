import { afterEach, describe, expect, it, vi } from 'vitest';

describe('runtime capabilities auth mode', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.doUnmock('@/lib/auth/supabase');
  });

  it('enables demo auth on preview deployments when Supabase is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.doMock('@/lib/auth/supabase', () => ({
      isSupabaseConfigured: false
    }));

    const { getAuthMode } = await import('@/lib/runtime/capabilities');
    expect(getAuthMode()).toBe('dev-local');
  });

  it('keeps auth unavailable on production when Supabase is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.doMock('@/lib/auth/supabase', () => ({
      isSupabaseConfigured: false
    }));

    const { getAuthMode } = await import('@/lib/runtime/capabilities');
    expect(getAuthMode()).toBe('unavailable');
  });
});
