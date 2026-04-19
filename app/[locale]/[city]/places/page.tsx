import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { StudiosDirectoryClient, type StudioDirectoryCard } from '@/components/discovery/StudiosDirectoryClient';
import { buildMapPlaceSummaries } from '@/lib/map/venue-summaries';
import { getMapRenderMode } from '@/lib/map/runtime';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function PlacesIndexPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const rawSearchParams = await searchParams;
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();

  const cityPlaces = catalog.places
    .filter((place) => place.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
  const neighborhoodsBySlug = new Map(
    catalog.neighborhoods.filter((neighborhood) => neighborhood.citySlug === citySlug).map((item) => [item.slug, item.name[locale]] as const)
  );
  const styleNameBySlug = new Map(catalog.styles.map((style) => [style.slug, style.name[locale]] as const));
  const publicOccurrences = catalog.occurrences
    .filter((occurrence) => occurrence.citySlug === citySlug && occurrence.verificationStatus !== 'hidden')
    .sort((left, right) => left.startAt.localeCompare(right.startAt));

  const cards: StudioDirectoryCard[] = cityPlaces.map((place) => {
    const sessions = publicOccurrences.filter((occurrence) => occurrence.placeSlug === place.slug);
    const nextSession = sessions[0];

    return {
      slug: place.slug,
      name: place.name,
      neighborhoodName: neighborhoodsBySlug.get(place.neighborhoodSlug) ?? place.neighborhoodSlug,
      address: place.address,
      tagline: place.tagline[locale],
      sessionCount: sessions.length,
      nextSessionLabel: nextSession ? DateTime.fromISO(nextSession.startAt).setZone('Europe/Rome').toFormat('ccc d LLL · HH:mm') : undefined,
      styles: place.styleSlugs.map((styleSlug) => styleNameBySlug.get(styleSlug) ?? styleSlug),
      studioHref: `/${locale}/${citySlug}/places/${place.slug}`,
      primaryCtaHref: place.sourceUrl,
      primaryCtaLabel: locale === 'it' ? 'Più info' : 'More info'
    };
  });

  const mapVenueSummaries = buildMapPlaceSummaries({
    locale,
    citySlug,
    sessions: publicOccurrences,
    venues: cityPlaces,
    neighborhoods: catalog.neighborhoods.filter((neighborhood) => neighborhood.citySlug === citySlug),
    instructors: catalog.organizers.filter((organizer) => organizer.citySlug === citySlug),
    styles: catalog.styles,
    bookingTargets: catalog.bookingTargets
  });

  const requestedView = typeof rawSearchParams.view === 'string' ? rawSearchParams.view : undefined;
  const requestedVenue = typeof rawSearchParams.venue === 'string' ? rawSearchParams.venue : undefined;
  const initialView = requestedView === 'map' ? 'map' : 'list';
  const initialSelectedVenueSlug = mapVenueSummaries.some((venue) => venue.venueSlug === requestedVenue) ? requestedVenue : undefined;

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Luoghi a Palermo',
          title: 'Dove andare con bambini e preadolescenti a Palermo',
          lead: 'Spazi utili per la vita di famiglia: musei, biblioteche, parchi e studi da tenere nel radar quando serve un posto giusto, anche senza slot perfetto.'
        }
      : {
          eyebrow: 'Places in Palermo',
          title: 'Where to go with kids and pre-teens in Palermo',
          lead: 'Useful places for family time: museums, libraries, parks, and studios to keep on your radar when you need the right place, even without a perfect slot.'
        };

  return (
    <div className="stack-list">
      <section className="panel teachers-directory-hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
      </section>

      <StudiosDirectoryClient
        locale={locale}
        citySlug={citySlug}
        cityName={city.name[locale]}
        bounds={city.bounds}
        cards={cards}
        mapVenueSummaries={mapVenueSummaries}
        initialView={initialView}
        initialSelectedVenueSlug={initialSelectedVenueSlug}
        mapRenderMode={getMapRenderMode()}
      />
    </div>
  );
}
