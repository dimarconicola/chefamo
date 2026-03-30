import { DateTime } from 'luxon';

import type { CatalogSnapshot } from '@/lib/catalog/repository';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { chefamoOccurrences, chefamoPlaces, chefamoStyles } from '@/lib/catalog/chefamo-seed';
import type { CityReadiness } from '@/lib/catalog/types';

export const getCityReadiness = (citySlug: string): CityReadiness => {
  const now = DateTime.now().setZone('Europe/Rome');
  const limit = now.plus({ days: 7 }).endOf('day');
  const cityOccurrences = chefamoOccurrences.filter((occurrence) => {
    const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
    return occurrence.citySlug === citySlug && occurrence.verificationStatus !== 'hidden' && start >= now.startOf('day') && start <= limit;
  });
  const cityPlaces = chefamoPlaces.filter((place) => place.citySlug === citySlug);
  const styleCount = new Set(cityOccurrences.map((occurrence) => occurrence.styleSlug)).size || chefamoStyles.length;
  const neighborhoods = new Set(cityPlaces.map((place) => place.neighborhoodSlug)).size;
  const ctaCoverage = cityOccurrences.length === 0 ? 0 : cityOccurrences.filter((occurrence) => Boolean(occurrence.bookingTargetSlug)).length / cityOccurrences.length;

  return {
    citySlug,
    places: cityPlaces.length,
    venues: cityPlaces.length,
    programs: new Set(cityOccurrences.map((occurrence) => occurrence.programSlug)).size,
    upcomingOccurrences: cityOccurrences.length,
    upcomingSessions: cityOccurrences.length,
    neighborhoods,
    styles: styleCount,
    ctaCoverage,
    passesGate: cityPlaces.length >= 6 && cityOccurrences.length >= 8 && neighborhoods >= 3 && styleCount >= 4 && ctaCoverage >= 0.8
  };
};

export const getCityReadinessServer = async (citySlug: string): Promise<CityReadiness> => {
  return getCityReadinessFromSnapshot(await getCatalogSnapshot(), citySlug);
};

export const getCityReadinessFromSnapshot = (catalog: CatalogSnapshot, citySlug: string): CityReadiness => {
  const now = DateTime.now().setZone('Europe/Rome');
  const limit = now.plus({ days: 7 }).endOf('day');
  const visibleCategories = new Set(
    catalog.categories
      .filter((category) => category.citySlug === citySlug && category.visibility !== 'hidden')
      .map((category) => category.slug)
  );

  const cityOccurrences = catalog.occurrences.filter((occurrence) => {
    const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
    return (
      occurrence.citySlug === citySlug &&
      occurrence.verificationStatus !== 'hidden' &&
      visibleCategories.has(occurrence.categorySlug) &&
      start >= now.startOf('day') &&
      start <= limit
    );
  });
  const cityPlaces = catalog.places.filter((place) => place.citySlug === citySlug);
  const styleCount = new Set(cityOccurrences.map((occurrence) => occurrence.styleSlug)).size || catalog.styles.length;
  const neighborhoods = new Set(cityPlaces.map((place) => place.neighborhoodSlug)).size;
  const ctaCoverage = cityOccurrences.length === 0 ? 0 : cityOccurrences.filter((occurrence) => Boolean(occurrence.bookingTargetSlug)).length / cityOccurrences.length;

  return {
    citySlug,
    places: cityPlaces.length,
    venues: cityPlaces.length,
    programs: new Set(catalog.programs.filter((program) => program.citySlug === citySlug).map((program) => program.slug)).size,
    upcomingOccurrences: cityOccurrences.length,
    upcomingSessions: cityOccurrences.length,
    neighborhoods,
    styles: styleCount,
    ctaCoverage,
    passesGate: cityPlaces.length >= 6 && cityOccurrences.length >= 8 && neighborhoods >= 3 && styleCount >= 4 && ctaCoverage >= 0.8
  };
};
