import { cache } from 'react';

import type {
  ActivityCategory,
  BookingTarget,
  City,
  EditorialCollection,
  Neighborhood,
  Occurrence,
  Organizer,
  Place,
  Program,
  Style
} from '@/lib/catalog/types';
import {
  chefamoBookingTargets,
  chefamoCategories,
  chefamoCollections,
  chefamoOccurrences,
  chefamoOrganizers,
  chefamoPlaces,
  chefamoPrograms,
  chefamoStyles
} from '@/lib/catalog/chefamo-seed';
import { normalizePriceNote } from '@/lib/catalog/price-notes';
import { mapSourceEventCandidateToSession, type SourceEventCandidatePayload } from '@/lib/freshness/social-events';
import { getDb } from '@/lib/data/db';
import {
  activityCategories,
  bookingTargets,
  cities,
  editorialCollections,
  instructors,
  neighborhoods,
  sessions,
  sourceRecords,
  styles,
  venues
} from '@/lib/data/schema';
import { and, eq, gt } from 'drizzle-orm';

export interface CatalogSnapshot {
  sourceMode: 'database' | 'seed';
  cities: City[];
  neighborhoods: Neighborhood[];
  categories: ActivityCategory[];
  styles: Style[];
  organizers: Organizer[];
  instructors: Organizer[];
  places: Place[];
  venues: Place[];
  bookingTargets: BookingTarget[];
  programs: Program[];
  occurrences: Occurrence[];
  sessions: Occurrence[];
  collections: EditorialCollection[];
}

const getSeedResources = cache(async () => {
  const seed = await import('@/lib/catalog/seed');
  const seedPlaceImages = new Map(seed.venues.filter((place) => place.coverImage).map((place) => [place.slug, place.coverImage]));
  const seedOrganizerMedia = new Map(
    seed.instructors
      .filter((organizer) => organizer.headshot || organizer.socialLinks?.length)
      .map((organizer) => [organizer.slug, { headshot: organizer.headshot, socialLinks: organizer.socialLinks }])
  );
  const legacyOccurrences = seed.sessions
    .map((occurrence) => normalizeChefamoOccurrence(toOccurrence(occurrence)))
    .filter(isChefamoOccurrence);
  const activeLegacyPlaceSlugs = new Set(legacyOccurrences.map((occurrence) => occurrence.placeSlug));
  const activeLegacyOrganizerSlugs = new Set(legacyOccurrences.map((occurrence) => occurrence.organizerSlug));
  const legacyPlaces = seed.venues
    .filter((place) => activeLegacyPlaceSlugs.has(place.slug) || place.categorySlugs.includes('kids-activities'))
    .map((place) =>
      normalizeChefamoPlace({
        ...place,
        coverImage: seedPlaceImages.get(place.slug) ?? place.coverImage,
        profile: place.profile ?? derivePlaceProfile(place.name, place.categorySlugs, place.styleSlugs),
        environment: place.environment ?? deriveEnvironment(place.name, place.categorySlugs)
      })
    );
  const legacyOrganizers = seed.instructors
    .filter((organizer) => activeLegacyOrganizerSlugs.has(organizer.slug))
    .map((organizer) => ({
      ...organizer,
      ...(seedOrganizerMedia.get(organizer.slug) ?? {})
    }));
  const legacyPrograms = buildPrograms(legacyOccurrences);
  const legacyStyleSlugs = new Set(legacyOccurrences.map((occurrence) => occurrence.styleSlug));
  const styles = mergeBySlug(
    seed.styles.filter((style) => legacyStyleSlugs.has(style.slug)).map(normalizeChefamoStyle),
    chefamoStyles
  );
  const bookingTargets = mergeBySlug(
    seed.bookingTargets.filter(
      (target) =>
        legacyOccurrences.some((occurrence) => occurrence.bookingTargetSlug === target.slug) ||
        legacyPlaces.some((place) => place.bookingTargetOrder.includes(target.slug))
    ),
    chefamoBookingTargets
  );
  const organizers = mergeBySlug(legacyOrganizers, chefamoOrganizers);
  const places = mergeBySlug(legacyPlaces, chefamoPlaces);
  const programs = mergeBySlug(legacyPrograms, chefamoPrograms);
  const occurrences = [...legacyOccurrences, ...chefamoOccurrences].sort((left, right) => left.startAt.localeCompare(right.startAt));
  const seedSnapshot: CatalogSnapshot = {
    sourceMode: 'seed',
    cities: seed.cities,
    neighborhoods: seed.neighborhoods,
    categories: chefamoCategories,
    styles,
    organizers,
    instructors: organizers,
    places,
    venues: places,
    bookingTargets,
    programs,
    occurrences,
    sessions: occurrences,
    collections: mergeBySlug(
      seed.collections
        .filter((collection) => collection.slug === 'today-nearby' || collection.slug === 'new-this-week')
        .map((collection) =>
          collection.slug === 'today-nearby'
            ? collection
            : collection.slug === 'new-this-week'
              ? collection
              : collection
        ),
      [
        {
          slug: 'english-friendly',
          citySlug: 'palermo',
          title: { en: 'English-friendly picks', it: 'Picks in inglese' },
          description: {
            en: 'Programs that clearly support English-speaking families.',
            it: 'Programmi che supportano chiaramente famiglie anglofone.'
          },
          cta: { en: 'Browse English-friendly plans', it: 'Esplora i piani in inglese' },
          kind: 'editorial'
        }
      ],
      chefamoCollections
    )
  };

  return {
    seedSnapshot,
    seedPlaceImages,
    seedOrganizerMedia
  };
});

const toNumber = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const toIso = (value: Date | string) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString());

const isKidsAgeBand = (value: string | null | undefined): value is Occurrence['ageBand'] =>
  value === '0-2' || value === '3-5' || value === '6-10' || value === '11-14' || value === 'mixed-kids';

const buildSessionIdentity = (session: Pick<Occurrence, 'placeSlug' | 'startAt' | 'title'>) =>
  [session.placeSlug, new Date(session.startAt).toISOString(), session.title.it.trim().toLowerCase()].join('|');

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inferProgramSlug = (occurrence: {
  id: string;
  citySlug: string;
  venueSlug: string;
  instructorSlug: string;
  categorySlug: string;
  styleSlug: string;
  title: { it: string };
}) => {
  const trimmedId = occurrence.id.replace(/-\d{8}$/, '');
  if (trimmedId !== occurrence.id) return trimmedId;
  return slugify(`${occurrence.citySlug}-${occurrence.venueSlug}-${occurrence.instructorSlug}-${occurrence.categorySlug}-${occurrence.styleSlug}-${occurrence.title.it}`);
};

const derivePlaceProfile = (name: string, categorySlugs: string[], styleSlugs: string[]): Place['profile'] => {
  const key = `${name} ${categorySlugs.join(' ')} ${styleSlugs.join(' ')}`.toLowerCase();
  if (key.includes('planetario')) return 'museum';
  if (key.includes('biblioteca') || key.includes('book')) return 'library';
  if (key.includes('parco') || key.includes('villa')) return 'park';
  if (key.includes('museum') || key.includes('museo') || key.includes('palazzo')) return 'museum';
  if (key.includes('school') || key.includes('scuola')) return 'school';
  if (key.includes('club')) return 'club';
  if (key.includes('sport') || key.includes('capoeira') || key.includes('surf')) return 'sports_center';
  if (key.includes('community') || key.includes('quartiere')) return 'community_hub';
  if (key.includes('series') || key.includes('festival')) return 'event_series';
  if (key.includes('association') || key.includes('associazione')) return 'association';
  if (key.includes('studio')) return 'studio';
  return 'arts_center';
};

const deriveEnvironment = (name: string, categorySlugs: string[]): Place['environment'] => {
  const key = `${name} ${categorySlugs.join(' ')}`.toLowerCase();
  if (key.includes('park') || key.includes('parco') || key.includes('outdoor')) return 'outdoor';
  return 'indoor';
};

const toOccurrence = (
  occurrence: Omit<Occurrence, 'programSlug' | 'placeSlug' | 'organizerSlug' | 'venueSlug' | 'instructorSlug'> & {
    venueSlug: string;
    instructorSlug: string;
  }
): Occurrence => ({
  ...occurrence,
  programSlug: inferProgramSlug(occurrence),
  placeSlug: occurrence.venueSlug,
  organizerSlug: occurrence.instructorSlug,
  venueSlug: occurrence.venueSlug,
  instructorSlug: occurrence.instructorSlug
});

const remapChefamoCategory = (categorySlug: string) => {
  if (categorySlug === 'kids-activities') return 'movement';
  if (categorySlug === 'yoga' || categorySlug === 'pilates' || categorySlug === 'movement') return 'movement';
  if (categorySlug === 'breathwork' || categorySlug === 'meditation') return 'reading';
  return categorySlug;
};

const normalizeChefamoStyle = (style: Style): Style => ({
  ...style,
  categorySlug: remapChefamoCategory(style.categorySlug)
});

const normalizeChefamoPlace = (place: Place): Place => ({
  ...place,
  categorySlugs: Array.from(new Set(place.categorySlugs.map(remapChefamoCategory))),
  profile: place.profile ?? derivePlaceProfile(place.name, place.categorySlugs, place.styleSlugs),
  environment: place.environment ?? deriveEnvironment(place.name, place.categorySlugs)
});

const normalizeChefamoOccurrence = (occurrence: Occurrence): Occurrence => ({
  ...occurrence,
  categorySlug: remapChefamoCategory(occurrence.categorySlug)
});

const isChefamoOccurrence = (occurrence: Occurrence) =>
  occurrence.audience === 'kids' ||
  occurrence.audience === 'families' ||
  occurrence.categorySlug === 'kids-activities' ||
  (typeof occurrence.ageMax === 'number' && occurrence.ageMax <= 14);

const mergeBySlug = <T extends { slug: string }>(...groups: T[][]) => {
  const merged = new Map<string, T>();

  for (const group of groups) {
    for (const item of group) {
      merged.set(item.slug, item);
    }
  }

  return [...merged.values()];
};

const buildPrograms = (occurrences: Occurrence[]): Program[] => {
  const grouped = new Map<string, Occurrence[]>();

  for (const occurrence of occurrences) {
    const bucket = grouped.get(occurrence.programSlug) ?? [];
    bucket.push(occurrence);
    grouped.set(occurrence.programSlug, bucket);
  }

  const programs: Program[] = [];

  for (const [slug, bucket] of grouped.entries()) {
    const ordered = [...bucket].sort((left, right) => left.startAt.localeCompare(right.startAt));
    const first = ordered[0];
    if (!first) continue;

    programs.push({
      slug,
      citySlug: first.citySlug,
      placeSlug: first.placeSlug,
      organizerSlug: first.organizerSlug,
      categorySlug: first.categorySlug,
      styleSlug: first.styleSlug,
      title: first.title,
      summary: first.priceNote
        ? {
            en: first.priceNote.en ?? first.title.en,
            it: first.priceNote.it ?? first.title.it
          }
        : first.title,
      level: first.level,
      language: first.language,
      format: first.format,
      bookingTargetSlug: first.bookingTargetSlug,
      sourceUrl: first.sourceUrl,
      lastVerifiedAt: first.lastVerifiedAt,
      verificationStatus: first.verificationStatus,
      audience: first.audience,
      attendanceModel: first.attendanceModel,
      ageMin: first.ageMin,
      ageMax: first.ageMax,
      ageBand: first.ageBand,
      guardianRequired: first.guardianRequired,
      priceNote: first.priceNote,
      scheduleKind: 'recurring',
      occurrenceCount: ordered.length,
      venueSlug: first.venueSlug,
      instructorSlug: first.instructorSlug
    });
  }

  return programs.sort((left, right) => left.title.it.localeCompare(right.title.it, 'it', { sensitivity: 'base' }));
};

const loadDatabaseSnapshot = async (): Promise<CatalogSnapshot | null> => {
  const db = getDb();
  if (!db) return null;

  try {
    const [
      cityRows,
      neighborhoodRows,
      categoryRows,
      styleRows,
      organizerRows,
      placeRows,
      bookingTargetRows,
      occurrenceRows,
      sourceEventRows,
      collectionRows,
      { seedPlaceImages, seedOrganizerMedia }
    ] = await Promise.all([
      db.select().from(cities),
      db.select().from(neighborhoods),
      db.select().from(activityCategories),
      db.select().from(styles),
      db.select().from(instructors),
      db.select().from(venues),
      db.select().from(bookingTargets),
      db.select().from(sessions),
      db
        .select()
        .from(sourceRecords)
        .where(
          and(
            eq(sourceRecords.entityType, 'source_event_candidate'),
            gt(sourceRecords.lastVerifiedAt, new Date(Date.now() - 1000 * 60 * 60 * 24 * 21))
          )
        ),
      db.select().from(editorialCollections),
      getSeedResources()
    ]);

    const baseOccurrences = occurrenceRows.map((row) =>
      toOccurrence({
        id: row.id,
        citySlug: row.citySlug,
        venueSlug: row.venueSlug,
        instructorSlug: row.instructorSlug,
        categorySlug: row.categorySlug,
        styleSlug: row.styleSlug,
        title: row.title,
        startAt: toIso(row.startAt),
        endAt: toIso(row.endAt),
        level: row.level,
        language: row.language,
        format: row.format,
        bookingTargetSlug: row.bookingTargetSlug,
        sourceUrl: row.sourceUrl,
        lastVerifiedAt: toIso(row.lastVerifiedAt),
        verificationStatus: row.verificationStatus,
        audience: row.audience,
        attendanceModel: row.attendanceModel,
        ageMin: row.ageMin ?? undefined,
        ageMax: row.ageMax ?? undefined,
        ageBand: isKidsAgeBand(row.ageBand) ? row.ageBand : undefined,
        guardianRequired: row.guardianRequired,
        priceNote: normalizePriceNote(row.priceNote ?? undefined)
      })
    );

    const existingOccurrenceIdentities = new Set(baseOccurrences.map(buildSessionIdentity));

    const oneOffOccurrences = sourceEventRows
      .map((row) => row.sourcePayload as SourceEventCandidatePayload | null)
      .filter((payload): payload is SourceEventCandidatePayload => Boolean(payload?.id && payload.citySlug))
      .map(mapSourceEventCandidateToSession)
      .map((occurrence) => toOccurrence(occurrence))
      .filter((occurrence) => Date.parse(occurrence.endAt) >= Date.now() - 1000 * 60 * 60 * 12)
      .filter((occurrence) => !existingOccurrenceIdentities.has(buildSessionIdentity(occurrence)));

    const organizers: Organizer[] = organizerRows.map((row) => ({
      ...(seedOrganizerMedia.get(row.slug) ?? {}),
      slug: row.slug,
      citySlug: row.citySlug,
      name: row.name,
      shortBio: row.shortBio,
      specialties: row.specialties,
      languages: row.languages
    }));

    const places: Place[] = placeRows.map((row) => ({
      slug: row.slug,
      citySlug: row.citySlug,
      neighborhoodSlug: row.neighborhoodSlug,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      address: row.address,
      geo: {
        lat: toNumber(row.lat),
        lng: toNumber(row.lng)
      },
      amenities: row.amenities,
      languages: row.languages,
      styleSlugs: row.styleSlugs,
      categorySlugs: row.categorySlugs,
      bookingTargetOrder: row.bookingTargetOrder,
      freshnessNote: row.freshnessNote,
      sourceUrl: row.sourceUrl,
      lastVerifiedAt: toIso(row.lastVerifiedAt),
      coverImage: seedPlaceImages.get(row.slug),
      profile: derivePlaceProfile(row.name, row.categorySlugs, row.styleSlugs),
      environment: deriveEnvironment(row.name, row.categorySlugs)
    }));

    const occurrences = [...baseOccurrences, ...oneOffOccurrences];

    return {
      sourceMode: 'database',
      cities: cityRows.map((row) => ({
        slug: row.slug,
        countryCode: row.countryCode,
        timezone: row.timezone,
        status: row.status,
        bounds: row.bounds,
        name: row.name,
        hero: row.hero
      })),
      neighborhoods: neighborhoodRows.map((row) => ({
        slug: row.slug,
        citySlug: row.citySlug,
        name: row.name,
        description: row.description,
        center: {
          lat: toNumber(row.centerLat),
          lng: toNumber(row.centerLng)
        }
      })),
      categories: categoryRows.map((row) => ({
        slug: row.slug,
        citySlug: row.citySlug,
        name: row.name,
        description: row.description,
        visibility: row.visibility,
        heroMetric: row.heroMetric
      })),
      styles: styleRows.map((row) => ({
        slug: row.slug,
        categorySlug: row.categorySlug,
        name: row.name,
        description: row.description
      })),
      organizers,
      instructors: organizers,
      places,
      venues: places,
      bookingTargets: bookingTargetRows.map((row) => ({
        slug: row.slug,
        type: row.type,
        label: row.label,
        href: row.href
      })),
      programs: buildPrograms(occurrences),
      occurrences,
      sessions: occurrences,
      collections: collectionRows.map((row) => ({
        slug: row.slug,
        citySlug: row.citySlug,
        title: row.title,
        description: row.description,
        cta: row.cta,
        kind: row.kind as 'rule' | 'editorial'
      }))
    };
  } catch {
    return null;
  }
};

export const getCatalogSnapshot = cache(async (): Promise<CatalogSnapshot> => {
  const databaseSnapshot = await loadDatabaseSnapshot();
  if (databaseSnapshot) return databaseSnapshot;

  return (await getSeedResources()).seedSnapshot;
});
