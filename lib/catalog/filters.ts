import { DateTime } from 'luxon';

import type { DiscoveryFilters, Occurrence, TimeBucket, WeekdayFilter } from '@/lib/catalog/types';

export const getTimeBucket = (iso: string): TimeBucket => {
  const hour = DateTime.fromISO(iso).hour;
  if (hour < 8) return 'early';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'midday';
  return 'evening';
};

const datePresetMatches = (occurrence: Occurrence, preset: DiscoveryFilters['date']) => {
  if (!preset) return true;

  const now = DateTime.now().setZone('Europe/Rome');
  const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');

  if (preset === 'today') return start.hasSame(now, 'day');
  if (preset === 'tomorrow') return start.hasSame(now.plus({ days: 1 }), 'day');
  if (preset === 'week') return start >= now.startOf('day') && start <= now.plus({ days: 7 }).endOf('day');

  const saturday = now.startOf('week').plus({ days: 5 });
  const sunday = saturday.plus({ days: 1 });
  return start.hasSame(saturday, 'day') || start.hasSame(sunday, 'day');
};

const weekdayMap: Record<WeekdayFilter, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
};

export const applyOccurrenceFilters = (occurrences: Occurrence[], filters: DiscoveryFilters) => {
  const now = DateTime.now().setZone('Europe/Rome');
  const selectedTimeBuckets = filters.time_buckets?.length
    ? filters.time_buckets
    : filters.time_bucket
      ? [filters.time_bucket]
      : [];

  return occurrences.filter((occurrence) => {
    const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
    const end = DateTime.fromISO(occurrence.endAt).setZone('Europe/Rome');

    if (!datePresetMatches(occurrence, filters.date)) return false;
    if (filters.weekday && start.weekday !== weekdayMap[filters.weekday]) return false;
    if (selectedTimeBuckets.length > 0 && !selectedTimeBuckets.includes(getTimeBucket(occurrence.startAt))) return false;
    if (filters.category && occurrence.categorySlug !== filters.category) return false;
    if (filters.style && occurrence.styleSlug !== filters.style) return false;
    if (filters.level && occurrence.level !== filters.level) return false;
    if (filters.language && occurrence.language.toLowerCase() !== filters.language.toLowerCase()) return false;
    if (filters.neighborhood) {
      // neighborhood filtering happens after occurrence-to-place join in catalog service
    }
    if (filters.format && occurrence.format !== filters.format) return false;
    if (filters.audience && occurrence.audience !== filters.audience) return false;
    if (filters.age_band && occurrence.ageBand !== filters.age_band) return false;
    if (filters.open_now === 'true' && !(start <= now && end >= now)) return false;
    if (filters.drop_in === 'true' && occurrence.attendanceModel !== 'drop_in') return false;

    return start >= now.minus({ hours: 2 });
  });
};

export const applySessionFilters = applyOccurrenceFilters;

export const parseFilters = (searchParams: Record<string, string | string[] | undefined>): DiscoveryFilters => {
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const parseTimeBuckets = (raw: string | undefined): TimeBucket[] => {
    if (!raw) return [];
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is TimeBucket => item === 'early' || item === 'morning' || item === 'midday' || item === 'evening');
  };
  const parsedTimeBuckets = parseTimeBuckets(one(searchParams.time_bucket));

  return {
    date: one(searchParams.date) as DiscoveryFilters['date'],
    weekday: one(searchParams.weekday) as DiscoveryFilters['weekday'],
    time_bucket: parsedTimeBuckets[0],
    time_buckets: parsedTimeBuckets,
    category: one(searchParams.category),
    style: one(searchParams.style),
    level: one(searchParams.level) as DiscoveryFilters['level'],
    language: one(searchParams.language),
    neighborhood: one(searchParams.neighborhood),
    format: one(searchParams.format) as DiscoveryFilters['format'],
    open_now: one(searchParams.open_now) as DiscoveryFilters['open_now'],
    drop_in: one(searchParams.drop_in) as DiscoveryFilters['drop_in'],
    age_band: one(searchParams.age_band) as DiscoveryFilters['age_band'],
    audience: one(searchParams.audience) as DiscoveryFilters['audience'],
    view: one(searchParams.view) as DiscoveryFilters['view']
  };
};
