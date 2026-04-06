import { getBookingTarget, getOrganizer, getPlace, getStyle } from '@/lib/catalog/server-data';
import type { CatalogSnapshot } from '@/lib/catalog/repository';
import type { BookingTarget, Occurrence, Organizer, Place, Style } from '@/lib/catalog/types';

export interface ResolvedOccurrenceCardData {
  place: Place;
  venue: Place;
  organizer: Organizer;
  instructor: Organizer;
  style: Style;
  target: BookingTarget;
}

export type ResolvedSessionCardData = ResolvedOccurrenceCardData;

export const resolveOccurrenceCardData = async (occurrences: Occurrence[]) => {
  const placeSlugs = [...new Set(occurrences.map((occurrence) => occurrence.placeSlug))];
  const organizerSlugs = [...new Set(occurrences.map((occurrence) => occurrence.organizerSlug))];
  const styleSlugs = [...new Set(occurrences.map((occurrence) => occurrence.styleSlug))];
  const targetSlugs = [...new Set(occurrences.map((occurrence) => occurrence.bookingTargetSlug))];

  const [places, organizers, styles, targets] = await Promise.all([
    Promise.all(placeSlugs.map(async (slug) => [slug, await getPlace(slug)] as const)),
    Promise.all(organizerSlugs.map(async (slug) => [slug, await getOrganizer(slug)] as const)),
    Promise.all(styleSlugs.map(async (slug) => [slug, await getStyle(slug)] as const)),
    Promise.all(targetSlugs.map(async (slug) => [slug, await getBookingTarget(slug)] as const))
  ]);

  const placeBySlug = new Map(places);
  const organizerBySlug = new Map(organizers);
  const styleBySlug = new Map(styles);
  const targetBySlug = new Map(targets);

  return new Map(
    occurrences.flatMap((occurrence) => {
      const place = placeBySlug.get(occurrence.placeSlug);
      const organizer = organizerBySlug.get(occurrence.organizerSlug);
      const style = styleBySlug.get(occurrence.styleSlug);
      const target = targetBySlug.get(occurrence.bookingTargetSlug);

      if (!place || !organizer || !style || !target) return [];

      return [
        [
          occurrence.id,
          {
            place,
            venue: place,
            organizer,
            instructor: organizer,
            style,
            target
          } satisfies ResolvedOccurrenceCardData
        ] as const
      ];
    })
  );
};

export const resolveSessionCardData = resolveOccurrenceCardData;

export const resolveOccurrenceCardDataFromSnapshot = (
  catalog: Pick<CatalogSnapshot, 'places' | 'organizers' | 'styles' | 'bookingTargets'>,
  occurrences: Occurrence[]
) => {
  const placeBySlug = new Map(catalog.places.map((place) => [place.slug, place] as const));
  const organizerBySlug = new Map(catalog.organizers.map((organizer) => [organizer.slug, organizer] as const));
  const styleBySlug = new Map(catalog.styles.map((style) => [style.slug, style] as const));
  const targetBySlug = new Map(catalog.bookingTargets.map((target) => [target.slug, target] as const));

  return new Map(
    occurrences.flatMap((occurrence) => {
      const place = placeBySlug.get(occurrence.placeSlug);
      const organizer = organizerBySlug.get(occurrence.organizerSlug);
      const style = styleBySlug.get(occurrence.styleSlug);
      const target = targetBySlug.get(occurrence.bookingTargetSlug);

      if (!place || !organizer || !style || !target) return [];

      return [
        [
          occurrence.id,
          {
            place,
            venue: place,
            organizer,
            instructor: organizer,
            style,
            target
          } satisfies ResolvedOccurrenceCardData
        ] as const
      ];
    })
  );
};

export const resolveSessionCardDataFromSnapshot = resolveOccurrenceCardDataFromSnapshot;
