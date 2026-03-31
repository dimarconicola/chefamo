import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { StudiosDirectoryClient, type StudioDirectoryCard } from '@/components/discovery/StudiosDirectoryClient';
import { VenueCover } from '@/components/catalog/VenueCover';
import { ServerButtonLink, ServerCardLink } from '@/components/ui/server';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { applyOccurrenceFilters } from '@/lib/catalog/filters';
import { buildMapPlaceSummaries } from '@/lib/map/venue-summaries';
import { getMapRenderMode } from '@/lib/map/runtime';
import { resolveLocale } from '@/lib/i18n/routing';

const isPlacesView = (value: string | null): value is 'list' | 'map' => value === 'list' || value === 'map';

export default async function PlacesIndexPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const rawSearch = await searchParams;
  const requestedView = typeof rawSearch.view === 'string' ? rawSearch.view : null;
  const requestedVenue = typeof rawSearch.venue === 'string' ? rawSearch.venue : undefined;
  const initialView = isPlacesView(requestedView) ? requestedView : 'list';

  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  if (!city) notFound();

  const places = catalog.places
    .filter((place) => place.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, locale === 'it' ? 'it' : 'en', { sensitivity: 'base' }));
  const neighborhoods = catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
  const styles = catalog.styles;
  const bookingTargets = catalog.bookingTargets;
  const visibleCategorySlugs = new Set(
    catalog.categories.filter((category) => category.citySlug === citySlug && category.visibility !== 'hidden').map((category) => category.slug)
  );
  const visibleOccurrences = catalog.occurrences.filter(
    (occurrence) => occurrence.citySlug === citySlug && occurrence.verificationStatus !== 'hidden' && visibleCategorySlugs.has(occurrence.categorySlug)
  );
  const weekOccurrences = applyOccurrenceFilters(visibleOccurrences, { date: 'week' });
  const mapVenueSummaries = buildMapPlaceSummaries({
    locale,
    citySlug,
    sessions: weekOccurrences,
    venues: places,
    neighborhoods,
    instructors: catalog.organizers.filter((organizer) => organizer.citySlug === citySlug),
    styles,
    bookingTargets
  });
  const summaryBySlug = new Map(mapVenueSummaries.map((summary) => [summary.venueSlug, summary]));
  const styleBySlug = new Map(styles.map((style) => [style.slug, style.name[locale]]));

  const cards: StudioDirectoryCard[] = places.map((place) => {
    const summary = summaryBySlug.get(place.slug);
    const nextSessionLabel = summary?.nextSession
      ? DateTime.fromISO(summary.nextSession.startAt).setZone('Europe/Rome').toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm')
      : undefined;

    return {
      slug: place.slug,
      name: place.name,
      neighborhoodName: neighborhoods.find((item) => item.slug === place.neighborhoodSlug)?.name[locale] ?? place.address,
      address: place.address,
      tagline: place.tagline[locale],
      sessionCount: summary?.matchingSessionCount ?? 0,
      nextSessionLabel,
      styles: place.styleSlugs.map((slug) => styleBySlug.get(slug)).filter((value): value is string => Boolean(value)).slice(0, 3),
      studioHref: `/${locale}/${citySlug}/places/${place.slug}`,
      primaryCtaHref: summary?.primaryCtaHref,
      primaryCtaLabel: summary?.primaryCtaLabel
    };
  });

  const selectedVenueSlug = mapVenueSummaries.some((venue) => venue.venueSlug === requestedVenue) ? requestedVenue : undefined;
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Luoghi',
          title: 'Dove andare con bambini e preadolescenti a Palermo',
          lead:
            'Una directory chiara di luoghi family-friendly: musei, biblioteche, parchi, laboratori e sedi con attività verificabili.',
          openActivities: 'Apri attività',
          openOrganizers: 'Apri organizzatori',
          weekly: 'Attività in 7 giorni',
          verifiedPlaces: 'Luoghi verificati',
          activeAreas: 'Quartieri attivi'
        }
      : {
          eyebrow: 'Places',
          title: 'Where to go with children and preteens in Palermo',
          lead:
            'A clear directory of family-friendly places: museums, libraries, parks, labs, and venues with verifiable activity signals.',
          openActivities: 'Open activities',
          openOrganizers: 'Open organizers',
          weekly: 'Activities in 7 days',
          verifiedPlaces: 'Verified places',
          activeAreas: 'Active neighborhoods'
        };

  return (
    <div className="chefamo-page studios-directory-page">
      <section className="chefamo-band chefamo-discovery-hero-band full-bleed">
        <div className="chefamo-shell chefamo-discovery-hero-grid">
          <div className="chefamo-hero-copy">
            <div className="chefamo-eyebrow-pill chefamo-tone-yellow">
              <PlayfulIcon name="map" className="chefamo-inline-icon" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1 className="chefamo-display-md">{copy.title}</h1>
            <p className="chefamo-lead">{copy.lead}</p>
            <div className="chefamo-chip-row">
              <span className="chefamo-chip chefamo-chip-red">
                {weekOccurrences.length} {copy.weekly}
              </span>
              <span className="chefamo-chip chefamo-chip-blue">
                {places.length} {copy.verifiedPlaces}
              </span>
              <span className="chefamo-chip chefamo-chip-green">
                {new Set(places.map((place) => place.neighborhoodSlug)).size} {copy.activeAreas}
              </span>
            </div>
            <div className="chefamo-action-row">
              <ServerButtonLink href={`/${locale}/${citySlug}/activities`} className="chefamo-cta chefamo-cta-primary">
                {copy.openActivities}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerButtonLink>
              <ServerButtonLink href={`/${locale}/${citySlug}/organizers`} className="chefamo-cta chefamo-cta-secondary">
                {copy.openOrganizers}
              </ServerButtonLink>
            </div>
          </div>

          <article className="chefamo-play-card chefamo-city-overview-card">
            <p className="chefamo-card-kicker">{city.name[locale]}</p>
            <h2>{locale === 'it' ? 'Prima scegli il contesto, poi il singolo slot.' : 'Choose the context before the slot.'}</h2>
            <p className="chefamo-muted">
              {locale === 'it'
                ? 'La directory resta ampia, ma il tono è più chiaro: luoghi affidabili, mappe utilizzabili e un percorso rapido verso il posto giusto.'
                : 'The directory stays broad, but the tone is clearer: trustworthy places, usable maps, and a quick path to the right venue.'}
            </p>
          </article>
        </div>
      </section>

      <section className="studios-directory-feature-strip">
        {places.slice(0, 3).map((place) => (
          <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="studios-directory-feature-card">
            <VenueCover venue={place} locale={locale} className="studios-directory-feature-cover" />
            <div className="studios-directory-feature-copy">
              <p className="eyebrow">{neighborhoods.find((item) => item.slug === place.neighborhoodSlug)?.name[locale] ?? place.address}</p>
              <h2>{place.name}</h2>
              <p className="muted">{place.tagline[locale]}</p>
            </div>
          </ServerCardLink>
        ))}
      </section>

      <StudiosDirectoryClient
        locale={locale}
        citySlug={citySlug}
        cityName={city.name[locale]}
        bounds={city.bounds}
        cards={cards}
        mapVenueSummaries={mapVenueSummaries}
        initialView={initialView}
        initialSelectedVenueSlug={selectedVenueSlug}
        mapRenderMode={getMapRenderMode()}
      />
    </div>
  );
}
