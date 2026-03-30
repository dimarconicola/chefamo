import {
  chefamoBookingTargets,
  chefamoCategories,
  chefamoCities,
  chefamoCollections,
  chefamoNeighborhoods,
  chefamoOccurrences,
  chefamoOrganizers,
  chefamoPlaces,
  chefamoStyles
} from '@/lib/catalog/chefamo-seed';
import { getDb, isDatabaseConfigured } from '@/lib/data/db';
import {
  activityCategories,
  bookingTargets,
  cities,
  editorialCollections,
  instructors,
  neighborhoods,
  sessions,
  sourceRegistry,
  styles,
  venues
} from '@/lib/data/schema';
import { sql } from 'drizzle-orm';

const excluded = <T extends { name: string }>(column: T) => sql.raw(`excluded.${column.name}`);

const registryEntries = Array.from(
  new Map(
    [...chefamoPlaces, ...chefamoOccurrences].map((item) => [
      item.sourceUrl,
      {
        citySlug: item.citySlug,
        sourceUrl: item.sourceUrl,
        sourceType: 'official_site' as const,
        cadence: 'weekly' as const,
        trustTier: 'tier_b' as const,
        purpose: 'catalog' as const,
        parserAdapter: null,
        tags: ['chefamo', item.citySlug],
        active: true,
        notes: null,
        lastCheckedAt: null,
        nextCheckAt: null
      }
    ])
  ).values()
);

const upsertCatalog = async () => {
  if (!isDatabaseConfigured) {
    throw new Error('DATABASE_URL is not configured. Catalog bootstrap requires a writable Postgres database.');
  }

  const db = getDb();
  if (!db) {
    throw new Error('Database client could not be created.');
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(cities)
      .values(
        chefamoCities.map((city) => ({
          slug: city.slug,
          countryCode: city.countryCode,
          timezone: city.timezone,
          status: city.status,
          bounds: city.bounds,
          name: city.name,
          hero: city.hero
        }))
      )
      .onConflictDoUpdate({
        target: cities.slug,
        set: {
          countryCode: excluded(cities.countryCode),
          timezone: excluded(cities.timezone),
          status: excluded(cities.status),
          bounds: excluded(cities.bounds),
          name: excluded(cities.name),
          hero: excluded(cities.hero),
          updatedAt: new Date()
        }
      });

    await tx
      .insert(neighborhoods)
      .values(
        chefamoNeighborhoods.map((neighborhood) => ({
          citySlug: neighborhood.citySlug,
          slug: neighborhood.slug,
          name: neighborhood.name,
          description: neighborhood.description,
          centerLat: neighborhood.center.lat.toString(),
          centerLng: neighborhood.center.lng.toString()
        }))
      )
      .onConflictDoUpdate({
        target: neighborhoods.slug,
        set: {
          citySlug: excluded(neighborhoods.citySlug),
          name: excluded(neighborhoods.name),
          description: excluded(neighborhoods.description),
          centerLat: excluded(neighborhoods.centerLat),
          centerLng: excluded(neighborhoods.centerLng)
        }
      });

    await tx
      .insert(activityCategories)
      .values(
        chefamoCategories.map((category) => ({
          citySlug: category.citySlug,
          slug: category.slug,
          visibility: category.visibility,
          name: category.name,
          description: category.description,
          heroMetric: category.heroMetric
        }))
      )
      .onConflictDoUpdate({
        target: activityCategories.slug,
        set: {
          citySlug: excluded(activityCategories.citySlug),
          visibility: excluded(activityCategories.visibility),
          name: excluded(activityCategories.name),
          description: excluded(activityCategories.description),
          heroMetric: excluded(activityCategories.heroMetric)
        }
      });

    await tx
      .insert(styles)
      .values(
        chefamoStyles.map((style) => ({
          categorySlug: style.categorySlug,
          slug: style.slug,
          name: style.name,
          description: style.description
        }))
      )
      .onConflictDoUpdate({
        target: styles.slug,
        set: {
          categorySlug: excluded(styles.categorySlug),
          name: excluded(styles.name),
          description: excluded(styles.description)
        }
      });

    await tx
      .insert(instructors)
      .values(
        chefamoOrganizers.map((organizer) => ({
          citySlug: organizer.citySlug,
          slug: organizer.slug,
          name: organizer.name,
          shortBio: organizer.shortBio,
          specialties: organizer.specialties,
          languages: organizer.languages
        }))
      )
      .onConflictDoUpdate({
        target: instructors.slug,
        set: {
          citySlug: excluded(instructors.citySlug),
          name: excluded(instructors.name),
          shortBio: excluded(instructors.shortBio),
          specialties: excluded(instructors.specialties),
          languages: excluded(instructors.languages)
        }
      });

    await tx
      .insert(bookingTargets)
      .values(
        chefamoBookingTargets.map((target) => ({
          slug: target.slug,
          type: target.type,
          label: target.label,
          href: target.href
        }))
      )
      .onConflictDoUpdate({
        target: bookingTargets.slug,
        set: {
          type: excluded(bookingTargets.type),
          label: excluded(bookingTargets.label),
          href: excluded(bookingTargets.href)
        }
      });

    await tx
      .insert(venues)
      .values(
        chefamoPlaces.map((place) => ({
          citySlug: place.citySlug,
          neighborhoodSlug: place.neighborhoodSlug,
          slug: place.slug,
          name: place.name,
          tagline: place.tagline,
          description: place.description,
          address: place.address,
          lat: place.geo.lat.toString(),
          lng: place.geo.lng.toString(),
          amenities: place.amenities,
          languages: place.languages,
          styleSlugs: place.styleSlugs,
          categorySlugs: place.categorySlugs,
          bookingTargetOrder: place.bookingTargetOrder,
          freshnessNote: place.freshnessNote,
          sourceUrl: place.sourceUrl,
          lastVerifiedAt: new Date(place.lastVerifiedAt)
        }))
      )
      .onConflictDoUpdate({
        target: venues.slug,
        set: {
          citySlug: excluded(venues.citySlug),
          neighborhoodSlug: excluded(venues.neighborhoodSlug),
          name: excluded(venues.name),
          tagline: excluded(venues.tagline),
          description: excluded(venues.description),
          address: excluded(venues.address),
          lat: excluded(venues.lat),
          lng: excluded(venues.lng),
          amenities: excluded(venues.amenities),
          languages: excluded(venues.languages),
          styleSlugs: excluded(venues.styleSlugs),
          categorySlugs: excluded(venues.categorySlugs),
          bookingTargetOrder: excluded(venues.bookingTargetOrder),
          freshnessNote: excluded(venues.freshnessNote),
          sourceUrl: excluded(venues.sourceUrl),
          lastVerifiedAt: excluded(venues.lastVerifiedAt)
        }
      });

    await tx
      .insert(sessions)
      .values(
        chefamoOccurrences.map((occurrence) => ({
          id: occurrence.id,
          citySlug: occurrence.citySlug,
          venueSlug: occurrence.placeSlug,
          instructorSlug: occurrence.organizerSlug,
          categorySlug: occurrence.categorySlug,
          styleSlug: occurrence.styleSlug,
          title: occurrence.title,
          startAt: new Date(occurrence.startAt),
          endAt: new Date(occurrence.endAt),
          level: occurrence.level,
          language: occurrence.language,
          format: occurrence.format,
          bookingTargetSlug: occurrence.bookingTargetSlug,
          sourceUrl: occurrence.sourceUrl,
          lastVerifiedAt: new Date(occurrence.lastVerifiedAt),
          verificationStatus: occurrence.verificationStatus,
          audience: occurrence.audience,
          attendanceModel: occurrence.attendanceModel,
          ageMin: occurrence.ageMin ?? null,
          ageMax: occurrence.ageMax ?? null,
          ageBand: occurrence.ageBand ?? null,
          guardianRequired: occurrence.guardianRequired ?? false,
          priceNote: occurrence.priceNote ?? null
        }))
      )
      .onConflictDoUpdate({
        target: sessions.id,
        set: {
          citySlug: excluded(sessions.citySlug),
          venueSlug: excluded(sessions.venueSlug),
          instructorSlug: excluded(sessions.instructorSlug),
          categorySlug: excluded(sessions.categorySlug),
          styleSlug: excluded(sessions.styleSlug),
          title: excluded(sessions.title),
          startAt: excluded(sessions.startAt),
          endAt: excluded(sessions.endAt),
          level: excluded(sessions.level),
          language: excluded(sessions.language),
          format: excluded(sessions.format),
          bookingTargetSlug: excluded(sessions.bookingTargetSlug),
          sourceUrl: excluded(sessions.sourceUrl),
          lastVerifiedAt: excluded(sessions.lastVerifiedAt),
          verificationStatus: excluded(sessions.verificationStatus),
          audience: excluded(sessions.audience),
          attendanceModel: excluded(sessions.attendanceModel),
          ageMin: excluded(sessions.ageMin),
          ageMax: excluded(sessions.ageMax),
          ageBand: excluded(sessions.ageBand),
          guardianRequired: excluded(sessions.guardianRequired),
          priceNote: excluded(sessions.priceNote)
        }
      });

    await tx
      .insert(editorialCollections)
      .values(
        chefamoCollections.map((collection) => ({
          citySlug: collection.citySlug,
          slug: collection.slug,
          title: collection.title,
          description: collection.description,
          cta: collection.cta,
          kind: collection.kind
        }))
      )
      .onConflictDoUpdate({
        target: editorialCollections.slug,
        set: {
          citySlug: excluded(editorialCollections.citySlug),
          title: excluded(editorialCollections.title),
          description: excluded(editorialCollections.description),
          cta: excluded(editorialCollections.cta),
          kind: excluded(editorialCollections.kind)
        }
      });

    await tx
      .insert(sourceRegistry)
      .values(
        registryEntries.map((entry) => ({
          citySlug: entry.citySlug,
          sourceUrl: entry.sourceUrl,
          sourceType: entry.sourceType,
          cadence: entry.cadence,
          trustTier: entry.trustTier,
          purpose: entry.purpose,
          parserAdapter: entry.parserAdapter,
          tags: entry.tags,
          active: entry.active,
          notes: entry.notes,
          lastCheckedAt: entry.lastCheckedAt,
          nextCheckAt: entry.nextCheckAt
        }))
      )
      .onConflictDoUpdate({
        target: [sourceRegistry.citySlug, sourceRegistry.sourceUrl],
        set: {
          sourceType: excluded(sourceRegistry.sourceType),
          cadence: excluded(sourceRegistry.cadence),
          trustTier: excluded(sourceRegistry.trustTier),
          purpose: excluded(sourceRegistry.purpose),
          parserAdapter: excluded(sourceRegistry.parserAdapter),
          tags: excluded(sourceRegistry.tags),
          active: excluded(sourceRegistry.active),
          notes: excluded(sourceRegistry.notes),
          lastCheckedAt: excluded(sourceRegistry.lastCheckedAt),
          nextCheckAt: excluded(sourceRegistry.nextCheckAt),
          updatedAt: new Date()
        }
      });
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        cities: chefamoCities.length,
        neighborhoods: chefamoNeighborhoods.length,
        categories: chefamoCategories.length,
        styles: chefamoStyles.length,
        instructors: chefamoOrganizers.length,
        venues: chefamoPlaces.length,
        bookingTargets: chefamoBookingTargets.length,
        sessions: chefamoOccurrences.length,
        collections: chefamoCollections.length,
        sourceRegistry: registryEntries.length
      },
      null,
      2
    )
  );
};

upsertCatalog().catch((error) => {
  console.error(error);
  process.exit(1);
});
