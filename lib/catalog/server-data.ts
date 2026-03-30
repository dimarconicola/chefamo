import { DateTime } from 'luxon';

import { applyOccurrenceFilters } from '@/lib/catalog/filters';
export { defaultLocale, locales } from '@/lib/catalog/constants';
import { getCatalogSnapshot, type CatalogSnapshot } from '@/lib/catalog/repository';
import type { DiscoveryFilters, Locale, Occurrence, Place } from '@/lib/catalog/types';

export const getLocaleLabel = (locale: Locale, value: Record<Locale, string>) => value[locale];

const getCityFromSnapshot = (catalog: CatalogSnapshot, citySlug: string) => catalog.cities.find((city) => city.slug === citySlug);
const getPlaceFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.places.find((place) => place.slug === slug);
const getOrganizerFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.organizers.find((organizer) => organizer.slug === slug);
const getStyleFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.styles.find((style) => style.slug === slug);
const getCategoryFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.categories.find((category) => category.slug === slug);
const getBookingTargetFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.bookingTargets.find((target) => target.slug === slug);
const getProgramFromSnapshot = (catalog: CatalogSnapshot, slug: string) => catalog.programs.find((program) => program.slug === slug);

const getCategoriesFromSnapshot = (catalog: CatalogSnapshot, citySlug: string) => catalog.categories.filter((item) => item.citySlug === citySlug);
const getNeighborhoodsFromSnapshot = (catalog: CatalogSnapshot, citySlug: string) =>
  catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
const getCollectionsFromSnapshot = (catalog: CatalogSnapshot, citySlug: string) =>
  catalog.collections.filter((item) => item.citySlug === citySlug);

const getOccurrencesFromSnapshot = (catalog: CatalogSnapshot, citySlug: string, filters: DiscoveryFilters = {}) => {
  const visibleCategories = new Set(
    getCategoriesFromSnapshot(catalog, citySlug)
      .filter((category) => category.visibility !== 'hidden')
      .map((category) => category.slug)
  );

  const cityOccurrences = catalog.occurrences.filter(
    (occurrence) =>
      occurrence.citySlug === citySlug &&
      occurrence.verificationStatus !== 'hidden' &&
      visibleCategories.has(occurrence.categorySlug)
  );

  return applyOccurrenceFilters(cityOccurrences, filters).filter((occurrence) => {
    if (!filters.neighborhood) return true;
    const place = getPlaceFromSnapshot(catalog, occurrence.placeSlug);
    return place?.neighborhoodSlug === filters.neighborhood;
  });
};

const getProgramsFromSnapshot = (catalog: CatalogSnapshot, citySlug: string, filters: DiscoveryFilters = {}) => {
  const visibleCategories = new Set(
    getCategoriesFromSnapshot(catalog, citySlug)
      .filter((category) => category.visibility !== 'hidden')
      .map((category) => category.slug)
  );

  return catalog.programs.filter((program) => {
    if (program.citySlug !== citySlug) return false;
    if (!visibleCategories.has(program.categorySlug)) return false;
    if (filters.category && program.categorySlug !== filters.category) return false;
    if (filters.style && program.styleSlug !== filters.style) return false;
    if (filters.level && program.level !== filters.level) return false;
    if (filters.language && program.language.toLowerCase() !== filters.language.toLowerCase()) return false;
    if (filters.format && program.format !== filters.format) return false;
    if (filters.audience && program.audience !== filters.audience) return false;
    if (filters.age_band && program.ageBand !== filters.age_band) return false;
    if (filters.drop_in === 'true' && program.attendanceModel !== 'drop_in') return false;
    if (filters.neighborhood) {
      const place = getPlaceFromSnapshot(catalog, program.placeSlug);
      return place?.neighborhoodSlug === filters.neighborhood;
    }
    return true;
  });
};

export const getCatalogSourceMode = async () => (await getCatalogSnapshot()).sourceMode;

export const getCity = async (citySlug: string) => getCityFromSnapshot(await getCatalogSnapshot(), citySlug);
export const getPublicCities = async () => (await getCatalogSnapshot()).cities.filter((city) => city.status === 'public');
export const getSeedCities = async () => (await getCatalogSnapshot()).cities.filter((city) => city.status !== 'public');
export const getNeighborhoods = async (citySlug: string) => getNeighborhoodsFromSnapshot(await getCatalogSnapshot(), citySlug);
export const getCategories = async (citySlug: string) => getCategoriesFromSnapshot(await getCatalogSnapshot(), citySlug);
export const getPublicCategories = async (citySlug: string) => (await getCategories(citySlug)).filter((item) => item.visibility !== 'hidden');
export const getCollections = async (citySlug: string) => getCollectionsFromSnapshot(await getCatalogSnapshot(), citySlug);
export const getPlace = async (slug: string) => getPlaceFromSnapshot(await getCatalogSnapshot(), slug);
export const getVenue = async (slug: string) => getPlace(slug);
export const getOrganizer = async (slug: string) => getOrganizerFromSnapshot(await getCatalogSnapshot(), slug);
export const getInstructor = async (slug: string) => getOrganizer(slug);
export const getCityOrganizers = async (citySlug: string) =>
  (await getCatalogSnapshot()).organizers
    .filter((organizer) => organizer.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
export const getCityInstructors = async (citySlug: string) => getCityOrganizers(citySlug);
export const getStyle = async (slug: string) => getStyleFromSnapshot(await getCatalogSnapshot(), slug);
export const getStyles = async () => (await getCatalogSnapshot()).styles;
export const getCategory = async (slug: string) => getCategoryFromSnapshot(await getCatalogSnapshot(), slug);
export const getBookingTarget = async (slug: string) => getBookingTargetFromSnapshot(await getCatalogSnapshot(), slug);
export const getProgram = async (slug: string) => getProgramFromSnapshot(await getCatalogSnapshot(), slug);

export const getOccurrences = async (citySlug: string, filters: DiscoveryFilters = {}) =>
  getOccurrencesFromSnapshot(await getCatalogSnapshot(), citySlug, filters);

export const getSessions = async (citySlug: string, filters: DiscoveryFilters = {}) => getOccurrences(citySlug, filters);
export const getPrograms = async (citySlug: string, filters: DiscoveryFilters = {}) =>
  getProgramsFromSnapshot(await getCatalogSnapshot(), citySlug, filters);

export const getPlaceOccurrences = async (placeSlug: string) =>
  (await getCatalogSnapshot()).occurrences.filter((occurrence) => occurrence.placeSlug === placeSlug);

export const getVenueSessions = async (venueSlug: string) => getPlaceOccurrences(venueSlug);

export const getOrganizerOccurrences = async (organizerSlug: string) =>
  (await getCatalogSnapshot()).occurrences.filter((occurrence) => occurrence.organizerSlug === organizerSlug);

export const getInstructorSessions = async (instructorSlug: string) => getOrganizerOccurrences(instructorSlug);

export const getProgramOccurrences = async (programSlug: string) =>
  (await getCatalogSnapshot()).occurrences.filter((occurrence) => occurrence.programSlug === programSlug);

export const getCategoryOccurrences = async (citySlug: string, categorySlug: string) => getOccurrences(citySlug, { category: categorySlug });
export const getCategorySessions = async (citySlug: string, categorySlug: string) => getCategoryOccurrences(citySlug, categorySlug);
export const getNeighborhoodOccurrences = async (citySlug: string, neighborhoodSlug: string) => getOccurrences(citySlug, { neighborhood: neighborhoodSlug });
export const getNeighborhoodSessions = async (citySlug: string, neighborhoodSlug: string) => getNeighborhoodOccurrences(citySlug, neighborhoodSlug);

export const getCollectionOccurrences = async (citySlug: string, slug: string): Promise<Occurrence[]> => {
  const catalog = await getCatalogSnapshot();

  if (slug === 'today-nearby') return getOccurrencesFromSnapshot(catalog, citySlug, { date: 'today' }).slice(0, 12);

  if (slug === 'new-this-week') {
    return getOccurrencesFromSnapshot(catalog, citySlug, { date: 'week' })
      .filter((occurrence) => {
        const verifiedAt = DateTime.fromISO(occurrence.lastVerifiedAt).setZone('Europe/Rome');
        return verifiedAt >= DateTime.now().setZone('Europe/Rome').minus({ days: 7 });
      })
      .slice(0, 12);
  }

  if (slug === 'english-friendly') {
    return getOccurrencesFromSnapshot(catalog, citySlug, { language: 'English' }).slice(0, 12);
  }

  if (slug === 'weekend-families') {
    return getOccurrencesFromSnapshot(catalog, citySlug, { date: 'weekend', audience: 'families' }).slice(0, 12);
  }

  return [];
};

export const getCollectionSessions = async (citySlug: string, slug: string) => getCollectionOccurrences(citySlug, slug);
export const getFeaturedOccurrences = async (citySlug: string) => (await getOccurrences(citySlug, { date: 'week' })).slice(0, 8);
export const getFeaturedSessions = async (citySlug: string) => getFeaturedOccurrences(citySlug);

export const getPlacePrograms = (catalog: CatalogSnapshot, placeSlug: string) => catalog.programs.filter((program) => program.placeSlug === placeSlug);
export const getOrganizerPrograms = (catalog: CatalogSnapshot, organizerSlug: string) =>
  catalog.programs.filter((program) => program.organizerSlug === organizerSlug);

export const getCityMetrics = async (citySlug: string) => {
  const catalog = await getCatalogSnapshot();
  const cityPlaces = catalog.places.filter((place) => place.citySlug === citySlug);
  const cityPrograms = getProgramsFromSnapshot(catalog, citySlug);
  const cityOccurrences = getOccurrencesFromSnapshot(catalog, citySlug, { date: 'week' });
  const liveNeighborhoods = new Set(cityPlaces.map((place) => place.neighborhoodSlug));
  const liveStyles = new Set(cityPrograms.map((program) => program.styleSlug));

  return {
    places: cityPlaces.length,
    venues: cityPlaces.length,
    programs: cityPrograms.length,
    occurrences: cityOccurrences.length,
    sessions: cityOccurrences.length,
    upcomingOccurrences: cityOccurrences.length,
    neighborhoods: liveNeighborhoods.size,
    styles: liveStyles.size
  };
};

export const getCategoryPlaces = async (citySlug: string, categorySlug: string) =>
  (await getCatalogSnapshot()).places.filter((place) => place.citySlug === citySlug && place.categorySlugs.includes(categorySlug));

export const getNeighborhoodPlaces = async (citySlug: string, neighborhoodSlug: string): Promise<Place[]> =>
  (await getCatalogSnapshot()).places.filter((place) => place.citySlug === citySlug && place.neighborhoodSlug === neighborhoodSlug);
