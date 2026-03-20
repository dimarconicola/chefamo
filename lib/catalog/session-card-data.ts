import { getBookingTarget, getInstructor, getStyle, getVenue } from '@/lib/catalog/server-data';
import type { CatalogSnapshot } from '@/lib/catalog/repository';
import type { BookingTarget, Instructor, Session, Style, Venue } from '@/lib/catalog/types';

export interface ResolvedSessionCardData {
  venue: Venue;
  instructor: Instructor;
  style: Style;
  target: BookingTarget;
}

export const resolveSessionCardData = async (sessions: Session[]) => {
  const venueSlugs = [...new Set(sessions.map((session) => session.venueSlug))];
  const instructorSlugs = [...new Set(sessions.map((session) => session.instructorSlug))];
  const styleSlugs = [...new Set(sessions.map((session) => session.styleSlug))];
  const targetSlugs = [...new Set(sessions.map((session) => session.bookingTargetSlug))];

  const [venues, instructors, styles, targets] = await Promise.all([
    Promise.all(venueSlugs.map(async (slug) => [slug, await getVenue(slug)] as const)),
    Promise.all(instructorSlugs.map(async (slug) => [slug, await getInstructor(slug)] as const)),
    Promise.all(styleSlugs.map(async (slug) => [slug, await getStyle(slug)] as const)),
    Promise.all(targetSlugs.map(async (slug) => [slug, await getBookingTarget(slug)] as const))
  ]);

  const venueBySlug = new Map(venues);
  const instructorBySlug = new Map(instructors);
  const styleBySlug = new Map(styles);
  const targetBySlug = new Map(targets);

  return new Map(
    sessions.flatMap((session) => {
      const venue = venueBySlug.get(session.venueSlug);
      const instructor = instructorBySlug.get(session.instructorSlug);
      const style = styleBySlug.get(session.styleSlug);
      const target = targetBySlug.get(session.bookingTargetSlug);

      if (!venue || !instructor || !style || !target) return [];

      return [
        [
          session.id,
          {
            venue,
            instructor,
            style,
            target
          } satisfies ResolvedSessionCardData
        ] as const
      ];
    })
  );
};

export const resolveSessionCardDataFromSnapshot = (catalog: CatalogSnapshot, sessions: Session[]) => {
  const venueBySlug = new Map(catalog.venues.map((venue) => [venue.slug, venue] as const));
  const instructorBySlug = new Map(catalog.instructors.map((instructor) => [instructor.slug, instructor] as const));
  const styleBySlug = new Map(catalog.styles.map((style) => [style.slug, style] as const));
  const targetBySlug = new Map(catalog.bookingTargets.map((target) => [target.slug, target] as const));

  return new Map(
    sessions.flatMap((session) => {
      const venue = venueBySlug.get(session.venueSlug);
      const instructor = instructorBySlug.get(session.instructorSlug);
      const style = styleBySlug.get(session.styleSlug);
      const target = targetBySlug.get(session.bookingTargetSlug);

      if (!venue || !instructor || !style || !target) return [];

      return [
        [
          session.id,
          {
            venue,
            instructor,
            style,
            target
          } satisfies ResolvedSessionCardData
        ] as const
      ];
    })
  );
};
