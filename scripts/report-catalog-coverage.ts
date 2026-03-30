import { getCatalogSnapshot } from '@/lib/catalog/repository';

const citySlug = (process.argv[2] ?? 'palermo').toLowerCase();

const pct = (value: number, total: number) => (total === 0 ? '0.0%' : `${((value / total) * 100).toFixed(1)}%`);

async function main() {
  const snapshot = await getCatalogSnapshot();
  const occurrences = snapshot.occurrences.filter((occurrence) => occurrence.citySlug === citySlug);
  const places = snapshot.places.filter((place) => place.citySlug === citySlug);
  const programs = snapshot.programs.filter((program) => program.citySlug === citySlug);
  const organizers = snapshot.organizers.filter((organizer) => organizer.citySlug === citySlug);
  const pricedOccurrences = occurrences.filter((occurrence) => Boolean(occurrence.priceNote?.it || occurrence.priceNote?.en));
  const ageTaggedOccurrences = occurrences.filter((occurrence) => typeof occurrence.ageMin === 'number' && typeof occurrence.ageMax === 'number');
  const guardianTaggedOccurrences = occurrences.filter((occurrence) => occurrence.guardianRequired);
  const placeLevelSources = new Set(places.map((place) => place.sourceUrl));

  const byCategory = Object.fromEntries(
    [...new Set(occurrences.map((occurrence) => occurrence.categorySlug))]
      .sort()
      .map((slug) => [slug, occurrences.filter((occurrence) => occurrence.categorySlug === slug).length])
  );

  console.log(JSON.stringify({
    citySlug,
    sourceMode: snapshot.sourceMode,
    totals: {
      places: places.length,
      organizers: organizers.length,
      programs: programs.length,
      occurrences: occurrences.length,
      goodAnytimePlaces: places.filter((place) => place.goodAnytime).length,
      placeSources: placeLevelSources.size
    },
    coverage: {
      pricingNotes: {
        occurrences: pricedOccurrences.length,
        percent: pct(pricedOccurrences.length, occurrences.length)
      },
      ageRanges: {
        occurrences: ageTaggedOccurrences.length,
        percent: pct(ageTaggedOccurrences.length, occurrences.length)
      },
      guardianRequired: {
        occurrences: guardianTaggedOccurrences.length,
        percent: pct(guardianTaggedOccurrences.length, occurrences.length)
      },
      byCategory
    }
  }, null, 2));
}

void main();
