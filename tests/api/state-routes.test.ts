import { beforeEach, describe, expect, it, vi } from 'vitest';

const getRuntimeCapabilities = vi.fn();
const getSessionUser = vi.fn();
const isUserFavorite = vi.fn();
const toggleUserFavorite = vi.fn();
const isUserScheduleSaved = vi.fn();
const toggleUserSchedule = vi.fn();

vi.mock('@/lib/runtime/capabilities', () => ({
  getRuntimeCapabilities
}));

vi.mock('@/lib/auth/session', () => ({
  getSessionUser
}));

vi.mock('@/lib/runtime/store', () => ({
  isUserFavorite,
  toggleUserFavorite,
  isUserScheduleSaved,
  toggleUserSchedule
}));

describe('favorites and schedule route contracts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('favorites GET returns STORE_UNAVAILABLE when auth/store is unavailable', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'unavailable',
      storeMode: 'unavailable'
    });

    const { GET } = await import('@/app/api/state/favorites/route');
    const response = await GET(
      new Request('http://localhost:3000/api/state/favorites?entityType=venue&entitySlug=yoga-city')
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'STORE_UNAVAILABLE' }
    });
  });

  it('favorites GET returns AUTH_REQUIRED when user session is missing', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue(null);

    const { GET } = await import('@/app/api/state/favorites/route');
    const response = await GET(
      new Request('http://localhost:3000/api/state/favorites?entityType=venue&entitySlug=yoga-city')
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'AUTH_REQUIRED' }
    });
  });

  it('favorites POST returns VALIDATION_ERROR for malformed payloads', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue({ id: 'user-1' });

    const { POST } = await import('@/app/api/state/favorites/route');
    const response = await POST(
      new Request('http://localhost:3000/api/state/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'wrong',
          entitySlug: ''
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' }
    });
  });

  it('favorites POST returns saved state on success', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue({ id: 'user-1' });
    toggleUserFavorite.mockResolvedValue(true);

    const { POST } = await import('@/app/api/state/favorites/route');
    const response = await POST(
      new Request('http://localhost:3000/api/state/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'venue',
          entitySlug: 'yoga-city'
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        saved: true,
        entityType: 'venue',
        entitySlug: 'yoga-city'
      }
    });
  });

  it('schedule GET returns AUTH_REQUIRED when user session is missing', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue(null);

    const { GET } = await import('@/app/api/state/schedule/route');
    const response = await GET(
      new Request('http://localhost:3000/api/state/schedule?sessionId=session-1')
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'AUTH_REQUIRED' }
    });
  });

  it('schedule POST returns VALIDATION_ERROR for malformed payloads', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue({ id: 'user-1' });

    const { POST } = await import('@/app/api/state/schedule/route');
    const response = await POST(
      new Request('http://localhost:3000/api/state/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: ''
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' }
    });
  });

  it('schedule POST returns saved state on success', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    getSessionUser.mockResolvedValue({ id: 'user-1' });
    toggleUserSchedule.mockResolvedValue(true);

    const { POST } = await import('@/app/api/state/schedule/route');
    const response = await POST(
      new Request('http://localhost:3000/api/state/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-1'
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        saved: true,
        sessionId: 'session-1'
      }
    });
  });
});
