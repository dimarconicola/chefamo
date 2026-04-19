import { vi } from 'vitest';

/**
 * Mocks of Next.js navigation hooks for testing
 */

export const routerPushMock = vi.fn();
export const routerReplaceMock = vi.fn();
export const routerRefreshMock = vi.fn();
export const routerBackMock = vi.fn();
export const routerForwardMock = vi.fn();
export const routerPrefetchMock = vi.fn();

export function useRouter() {
  return {
    push: routerPushMock,
    replace: routerReplaceMock,
    refresh: routerRefreshMock,
    back: routerBackMock,
    forward: routerForwardMock,
    prefetch: routerPrefetchMock
  };
}

export function usePathname() {
  return globalThis.window?.location?.pathname ?? '/';
}

export function useSearchParams() {
  return new URLSearchParams(globalThis.window?.location?.search ?? '');
}

export function useParams() {
  return {};
}
