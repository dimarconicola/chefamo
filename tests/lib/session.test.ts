import { describe, expect, it } from 'vitest';

import { decodeSession, encodeSession } from '@/lib/auth/session';

describe('session decoding', () => {
  it('round-trips a valid session token', () => {
    const token = encodeSession('test@example.com');
    expect(decodeSession(token)?.email).toBe('test@example.com');
  });

  it('returns null for malformed signatures instead of throwing', () => {
    expect(() => decodeSession('abc.invalid')).not.toThrow();
    expect(decodeSession('abc.invalid')).toBeNull();
  });
});
