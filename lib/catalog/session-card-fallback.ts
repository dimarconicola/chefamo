import type { BookingTarget, LocalizedText, Occurrence, Organizer, Place, Style } from '@/lib/catalog/types';

const localizedText = (it: string, en: string): LocalizedText => ({ it, en });

const titleCaseFromSlug = (slug: string) =>
  slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || slug;

const buildFallbackPlace = (occurrence: Occurrence): Place => ({
  slug: occurrence.placeSlug,
  citySlug: occurrence.citySlug,
  neighborhoodSlug: '',
  name: titleCaseFromSlug(occurrence.placeSlug),
  tagline: localizedText('Scheda in aggiornamento', 'Listing under review'),
  description: localizedText('La scheda del luogo è in aggiornamento.', 'The place listing is under review.'),
  address: '',
  geo: { lat: 0, lng: 0 },
  amenities: [],
  languages: occurrence.language ? [occurrence.language] : [],
  styleSlugs: occurrence.styleSlug ? [occurrence.styleSlug] : [],
  categorySlugs: occurrence.categorySlug ? [occurrence.categorySlug] : [],
  bookingTargetOrder: occurrence.bookingTargetSlug ? [occurrence.bookingTargetSlug] : [],
  freshnessNote: localizedText('Dati da verificare', 'Needs review'),
  sourceUrl: occurrence.sourceUrl,
  lastVerifiedAt: occurrence.lastVerifiedAt
});

const buildFallbackOrganizer = (occurrence: Occurrence): Organizer => ({
  slug: occurrence.organizerSlug,
  citySlug: occurrence.citySlug,
  name: titleCaseFromSlug(occurrence.organizerSlug),
  shortBio: localizedText('Profilo in aggiornamento', 'Profile under review'),
  specialties: occurrence.styleSlug ? [occurrence.styleSlug] : [],
  languages: occurrence.language ? [occurrence.language] : []
});

const buildFallbackStyle = (occurrence: Occurrence): Style => ({
  slug: occurrence.styleSlug,
  categorySlug: occurrence.categorySlug,
  name: localizedText(titleCaseFromSlug(occurrence.styleSlug), titleCaseFromSlug(occurrence.styleSlug)),
  description: localizedText('Stile in aggiornamento', 'Style under review')
});

const buildFallbackTarget = (occurrence: Occurrence): BookingTarget => ({
  slug: occurrence.bookingTargetSlug,
  type: 'website',
  label: 'More info',
  href: occurrence.sourceUrl
});

export interface FallbackOccurrenceCardData {
  place: Place;
  venue: Place;
  organizer: Organizer;
  instructor: Organizer;
  style: Style;
  target: BookingTarget;
}

export const buildFallbackOccurrenceCardData = (occurrence: Occurrence): FallbackOccurrenceCardData => {
  const place = buildFallbackPlace(occurrence);
  const organizer = buildFallbackOrganizer(occurrence);
  const style = buildFallbackStyle(occurrence);
  const target = buildFallbackTarget(occurrence);

  return {
    place,
    venue: place,
    organizer,
    instructor: organizer,
    style,
    target
  };
};
