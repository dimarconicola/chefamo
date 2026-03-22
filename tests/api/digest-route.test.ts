import { beforeEach, describe, expect, it, vi } from 'vitest';

const appendDigestSubscription = vi.fn();
const getRuntimeCapabilities = vi.fn();

vi.mock('@/lib/runtime/store', () => ({
  appendDigestSubscription
}));

vi.mock('@/lib/runtime/capabilities', () => ({
  getRuntimeCapabilities
}));

describe('digest route contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns STORE_UNAVAILABLE when persistence is not available', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'unavailable',
      storeMode: 'unavailable'
    });

    const { POST } = await import('@/app/api/digest/route');
    const response = await POST(
      new Request('http://localhost:3000/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          locale: 'it',
          citySlug: 'palermo',
          preferences: []
        })
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'STORE_UNAVAILABLE'
      }
    });
  });

  it('returns created and duplicate responses with stable codes', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });
    appendDigestSubscription
      .mockResolvedValueOnce({ created: true })
      .mockResolvedValueOnce({ created: false });

    const { POST } = await import('@/app/api/digest/route');
    const request = () =>
      new Request('http://localhost:3000/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          locale: 'it',
          citySlug: 'palermo',
          preferences: ['english-speaking']
        })
      });

    const created = await POST(request());
    expect(created.status).toBe(201);
    await expect(created.json()).resolves.toMatchObject({
      success: true,
      data: {
        code: 'DIGEST_SUBSCRIBED',
        email: 'test@example.com'
      }
    });

    const duplicate = await POST(request());
    expect(duplicate.status).toBe(200);
    await expect(duplicate.json()).resolves.toMatchObject({
      success: true,
      data: {
        code: 'DIGEST_ALREADY_SUBSCRIBED',
        email: 'test@example.com'
      }
    });
  });

  it('returns VALIDATION_ERROR for malformed payloads', async () => {
    getRuntimeCapabilities.mockResolvedValue({
      authMode: 'supabase',
      storeMode: 'database'
    });

    const { POST } = await import('@/app/api/digest/route');
    const response = await POST(
      new Request('http://localhost:3000/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          locale: 'it',
          citySlug: '',
          preferences: []
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR'
      }
    });
  });
});
