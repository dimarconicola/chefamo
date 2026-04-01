import type { Locale } from '@/lib/catalog/types';

export const getOccurrencePath = (locale: Locale | string, citySlug: string, occurrenceId: string) =>
  `/${locale}/${citySlug}/activities/${occurrenceId}`;
