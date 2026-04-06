import { createHash } from 'node:crypto';

import { DateTime } from 'luxon';

import { applyOccurrenceFilters, getTimeBucket } from '@/lib/catalog/filters';
import type { CatalogSnapshot } from '@/lib/catalog/repository';
import type {
  ActivityCategory,
  BookingTarget,
  City,
  DiscoveryFilters,
  EditorialCollection,
  Neighborhood,
  Occurrence,
  Organizer,
  Place,
  Program,
  Style,
  TimeBucket,
  WeekdayFilter
} from '@/lib/catalog/types';
import { buildMapPlaceSummaries } from '@/lib/map/venue-summaries';
import type { MapVenueSummary } from '@/components/discovery/classes-results.types';

export interface PublicPlaceSummary {
  placeSlug: string;
  occurrenceCount: number;
  programCount: number;
  nextOccurrenceStartAt?: string;
}

export interface PublicOrganizerSummary {
  organizerSlug: string;
  occurrenceCount: number;
  programCount: number;
  nextOccurrenceStartAt?: string;
}

export interface PublicCityMetrics {
  places: number;
  programs: number;
  occurrences: number;
  neighborhoods: number;
  styles: number;
  organizers: number;
  categories: number;
}

export interface PublicCitySnapshot {
  sourceMode: 'database' | 'seed';
  version: number;
  builtAt: string;
  hash: string;
  city: City;
  neighborhoods: Neighborhood[];
  categories: ActivityCategory[];
  styles: Style[];
  organizers: Organizer[];
  places: Place[];
  bookingTargets: BookingTarget[];
  programs: Program[];
  occurrences: Occurrence[];
  collections: EditorialCollection[];
  metrics: PublicCityMetrics;
  mapPlaceSummaries: MapVenueSummary[];
  placeSummaries: PublicPlaceSummary[];
  organizerSummaries: PublicOrganizerSummary[];
}

export interface PublicCitySearchOccurrenceRecord {
  id: string;
  citySlug: string;
  placeSlug: string;
  organizerSlug: string;
  categorySlug: string;
  styleSlug: string;
  title: Occurrence['title'];
  startAt: string;
  endAt: string;
  level: Occurrence['level'];
  language: string;
  format: Occurrence['format'];
  bookingTargetSlug: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  verificationStatus: Occurrence['verificationStatus'];
  audience: Occurrence['audience'];
  attendanceModel: Occurrence['attendanceModel'];
  ageMin?: number;
  ageMax?: number;
  ageBand?: Occurrence['ageBand'];
  guardianRequired?: boolean;
  priceNote?: Occurrence['priceNote'];
  neighborhoodSlug: string;
  timeBucket: TimeBucket;
  weekday: WeekdayFilter;
  searchText: string;
}

export interface PublicCitySearchIndex {
  citySlug: string;
  version: number;
  builtAt: string;
  hash: string;
  occurrences: PublicCitySearchOccurrenceRecord[];
}

const weekdayMap: Record<number, WeekdayFilter> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  7: 'sun'
};

const buildHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const getVisibleCategorySlugs = (categories: ActivityCategory[]) => new Set(categories.filter((category) => category.visibility !== 'hidden').map((category) => category.slug));

const buildSearchText = (
  occurrence: Occurrence,
  placeBySlug: Map<string, Place>,
  organizerBySlug: Map<string, Organizer>,
  styleBySlug: Map<string, Style>,
  categoryBySlug: Map<string, ActivityCategory>,
  neighborhoodBySlug: Map<string, Neighborhood>
) => {
  const place = placeBySlug.get(occurrence.placeSlug);
  const organizer = organizerBySlug.get(occurrence.organizerSlug);
  const style = styleBySlug.get(occurrence.styleSlug);
  const category = categoryBySlug.get(occurrence.categorySlug);
  const neighborhood = place ? neighborhoodBySlug.get(place.neighborhoodSlug) : undefined;

  return [
    occurrence.title.it,
    occurrence.title.en,
    place?.name,
    place?.address,
    organizer?.name,
    style?.name.it,
    style?.name.en,
    category?.name.it,
    category?.name.en,
    neighborhood?.name.it,
    neighborhood?.name.en,
    occurrence.language
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();
};

export const getPublicCitySubset = (catalog: CatalogSnapshot, citySlug: string) => {
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  if (!city) return null;

  const neighborhoods = catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
  const categories = catalog.categories.filter((item) => item.citySlug === citySlug && item.visibility !== 'hidden');
  const visibleCategorySlugs = getVisibleCategorySlugs(categories);
  const styles = catalog.styles.filter((style) => visibleCategorySlugs.has(style.categorySlug));
  const organizers = catalog.organizers
    .filter((item) => item.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
  const places = catalog.places
    .filter((item) => item.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
  const bookingTargets = catalog.bookingTargets;
  const collections = catalog.collections.filter((item) => item.citySlug === citySlug);
  const programs = catalog.programs.filter(
    (program) => program.citySlug === citySlug && program.verificationStatus !== 'hidden' && visibleCategorySlugs.has(program.categorySlug)
  );
  const occurrences = catalog.occurrences.filter(
    (occurrence) =>
      occurrence.citySlug === citySlug &&
      occurrence.verificationStatus !== 'hidden' &&
      visibleCategorySlugs.has(occurrence.categorySlug)
  );

  return {
    city,
    neighborhoods,
    categories,
    styles,
    organizers,
    places,
    bookingTargets,
    programs,
    occurrences,
    collections
  };
};

export const buildPublicCitySnapshot = (catalog: CatalogSnapshot, citySlug: string): PublicCitySnapshot | null => {
  const subset = getPublicCitySubset(catalog, citySlug);
  if (!subset) return null;

  const weekOccurrences = applyOccurrenceFilters(subset.occurrences, { date: 'week' });
  const programsByPlace = new Map<string, Program[]>();
  const programsByOrganizer = new Map<string, Program[]>();
  for (const program of subset.programs) {
    const placePrograms = programsByPlace.get(program.placeSlug) ?? [];
    placePrograms.push(program);
    programsByPlace.set(program.placeSlug, placePrograms);

    const organizerPrograms = programsByOrganizer.get(program.organizerSlug) ?? [];
    organizerPrograms.push(program);
    programsByOrganizer.set(program.organizerSlug, organizerPrograms);
  }

  const occurrencesByPlace = new Map<string, Occurrence[]>();
  const occurrencesByOrganizer = new Map<string, Occurrence[]>();
  for (const occurrence of subset.occurrences) {
    const placeBucket = occurrencesByPlace.get(occurrence.placeSlug) ?? [];
    placeBucket.push(occurrence);
    occurrencesByPlace.set(occurrence.placeSlug, placeBucket);

    const organizerBucket = occurrencesByOrganizer.get(occurrence.organizerSlug) ?? [];
    organizerBucket.push(occurrence);
    occurrencesByOrganizer.set(occurrence.organizerSlug, organizerBucket);
  }

  const placeSummaries: PublicPlaceSummary[] = subset.places.map((place) => {
    const orderedOccurrences = [...(occurrencesByPlace.get(place.slug) ?? [])].sort((left, right) => left.startAt.localeCompare(right.startAt));
    return {
      placeSlug: place.slug,
      occurrenceCount: orderedOccurrences.length,
      programCount: (programsByPlace.get(place.slug) ?? []).length,
      nextOccurrenceStartAt: orderedOccurrences[0]?.startAt
    };
  });

  const organizerSummaries: PublicOrganizerSummary[] = subset.organizers.map((organizer) => {
    const orderedOccurrences = [...(occurrencesByOrganizer.get(organizer.slug) ?? [])].sort((left, right) => left.startAt.localeCompare(right.startAt));
    return {
      organizerSlug: organizer.slug,
      occurrenceCount: orderedOccurrences.length,
      programCount: (programsByOrganizer.get(organizer.slug) ?? []).length,
      nextOccurrenceStartAt: orderedOccurrences[0]?.startAt
    };
  });

  const mapPlaceSummaries = buildMapPlaceSummaries({
    locale: 'it',
    citySlug,
    sessions: weekOccurrences,
    venues: subset.places,
    neighborhoods: subset.neighborhoods,
    instructors: subset.organizers,
    styles: subset.styles,
    bookingTargets: subset.bookingTargets
  });

  const metrics: PublicCityMetrics = {
    places: subset.places.length,
    programs: subset.programs.length,
    occurrences: weekOccurrences.length,
    neighborhoods: new Set(subset.places.map((place) => place.neighborhoodSlug)).size,
    styles: new Set(subset.programs.map((program) => program.styleSlug)).size,
    organizers: subset.organizers.length,
    categories: subset.categories.length
  };

  const basePayload = {
    sourceMode: catalog.sourceMode,
    city: subset.city,
    neighborhoods: subset.neighborhoods,
    categories: subset.categories,
    styles: subset.styles,
    organizers: subset.organizers,
    places: subset.places,
    bookingTargets: subset.bookingTargets,
    programs: subset.programs,
    occurrences: subset.occurrences,
    collections: subset.collections,
    metrics
  };

  return {
    ...basePayload,
    version: 1,
    builtAt: new Date().toISOString(),
    hash: buildHash(basePayload),
    mapPlaceSummaries,
    placeSummaries,
    organizerSummaries
  };
};

export const buildPublicCitySearchIndex = (snapshot: PublicCitySnapshot): PublicCitySearchIndex => {
  const placeBySlug = new Map(snapshot.places.map((place) => [place.slug, place] as const));
  const organizerBySlug = new Map(snapshot.organizers.map((organizer) => [organizer.slug, organizer] as const));
  const styleBySlug = new Map(snapshot.styles.map((style) => [style.slug, style] as const));
  const categoryBySlug = new Map(snapshot.categories.map((category) => [category.slug, category] as const));
  const neighborhoodBySlug = new Map(snapshot.neighborhoods.map((item) => [item.slug, item] as const));

  const occurrences = snapshot.occurrences.map<PublicCitySearchOccurrenceRecord>((occurrence) => {
    const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
    const neighborhoodSlug = placeBySlug.get(occurrence.placeSlug)?.neighborhoodSlug ?? '';
    return {
      id: occurrence.id,
      citySlug: occurrence.citySlug,
      placeSlug: occurrence.placeSlug,
      organizerSlug: occurrence.organizerSlug,
      categorySlug: occurrence.categorySlug,
      styleSlug: occurrence.styleSlug,
      title: occurrence.title,
      startAt: occurrence.startAt,
      endAt: occurrence.endAt,
      level: occurrence.level,
      language: occurrence.language,
      format: occurrence.format,
      bookingTargetSlug: occurrence.bookingTargetSlug,
      sourceUrl: occurrence.sourceUrl,
      lastVerifiedAt: occurrence.lastVerifiedAt,
      verificationStatus: occurrence.verificationStatus,
      audience: occurrence.audience,
      attendanceModel: occurrence.attendanceModel,
      ageMin: occurrence.ageMin,
      ageMax: occurrence.ageMax,
      ageBand: occurrence.ageBand,
      guardianRequired: occurrence.guardianRequired,
      priceNote: occurrence.priceNote,
      neighborhoodSlug,
      timeBucket: getTimeBucket(occurrence.startAt),
      weekday: weekdayMap[start.weekday],
      searchText: buildSearchText(occurrence, placeBySlug, organizerBySlug, styleBySlug, categoryBySlug, neighborhoodBySlug)
    };
  });

  return {
    citySlug: snapshot.city.slug,
    version: snapshot.version,
    builtAt: snapshot.builtAt,
    hash: buildHash(occurrences.map((item) => item.id)),
    occurrences
  };
};

export const applyPublicCityFilters = (snapshot: PublicCitySnapshot, filters: DiscoveryFilters) => {
  const visibleCategorySlugs = new Set(snapshot.categories.filter((category) => category.visibility !== 'hidden').map((category) => category.slug));
  const cityOccurrences = snapshot.occurrences.filter(
    (occurrence) =>
      occurrence.citySlug === snapshot.city.slug &&
      occurrence.verificationStatus !== 'hidden' &&
      visibleCategorySlugs.has(occurrence.categorySlug)
  );

  return applyOccurrenceFilters(cityOccurrences, filters).filter((occurrence) => {
    if (!filters.neighborhood) return true;
    const place = snapshot.places.find((item) => item.slug === occurrence.placeSlug);
    return place?.neighborhoodSlug === filters.neighborhood;
  });
};
