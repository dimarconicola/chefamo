import type { BookingTarget, Locale } from '@/lib/catalog/types';

const isHttpHref = (href: string | null | undefined): href is string => typeof href === 'string' && /^https?:\/\//i.test(href);

export const getExternalInfoLabel = (locale: Locale) => (locale === 'it' ? 'Più info' : 'More info');

export const resolveExternalInfoTarget = ({
  target,
  fallbackHref
}: {
  target?: BookingTarget | null;
  fallbackHref: string;
}) => {
  if (isHttpHref(target?.href)) {
    return {
      href: target.href,
      targetType: target.type
    } as const;
  }

  return {
    href: fallbackHref,
    targetType: 'website' as const
  };
};
