import { notFound } from 'next/navigation';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { ClassesResultsClient } from '@/components/discovery/ClassesResultsClient';
import type { CalendarEntry as ClassesCalendarEntry } from '@/components/discovery/classes-results.types';
import { FilterBar } from '@/components/discovery/FilterBar';
import { ServerButtonLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { applyOccurrenceFilters, parseFilters } from '@/lib/catalog/filters';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardData } from '@/lib/catalog/session-card-data';
import type { ActivityView } from '@/lib/catalog/types';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { buildMapPlaceSummaries } from '@/lib/map/venue-summaries';
import { getMapRenderMode } from '@/lib/map/runtime';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

const isActivityView = (value: string | null): value is ActivityView => value === 'list' || value === 'map' || value === 'calendar';

const flattenParams = (raw: Record<string, string | string[] | undefined>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      params.set(key, value[0]);
    }
  }

  return params;
};

export default async function ActivitiesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const rawSearch = await searchParams;
  const urlParams = flattenParams(rawSearch);
  const filters = parseFilters(rawSearch);

  const requestedView = urlParams.get('view');
  const view: ActivityView = isActivityView(requestedView) ? requestedView : 'list';
  const requestedPage = Number.parseInt(urlParams.get('page') ?? '1', 10);
  const requestedWeekOffset = Number.parseInt(urlParams.get('week_offset') ?? '0', 10);
  const requestedVenueSlug = urlParams.get('venue') ?? undefined;
  const weekOffset = Number.isFinite(requestedWeekOffset) ? Math.max(0, requestedWeekOffset) : 0;

  const [catalog, user, runtimeCapabilities] = await Promise.all([getCatalogSnapshot(), getSessionUser(), getRuntimeCapabilities()]);
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  if (!city) notFound();

  const categories = catalog.categories.filter((item) => item.citySlug === citySlug && item.visibility !== 'hidden');
  const neighborhoods = catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
  const allStyles = catalog.styles;
  const cityPlaces = catalog.places.filter((place) => place.citySlug === citySlug);
  const placeBySlug = new Map(cityPlaces.map((place) => [place.slug, place]));
  const visibleCategorySlugs = new Set(categories.map((category) => category.slug));
  const baseOccurrences = catalog.occurrences.filter(
    (occurrence) =>
      occurrence.citySlug === citySlug &&
      occurrence.verificationStatus !== 'hidden' &&
      visibleCategorySlugs.has(occurrence.categorySlug)
  );
  const filterByNeighborhood = <T extends { placeSlug: string }>(occurrences: T[]) =>
    occurrences.filter((occurrence) => {
      if (!filters.neighborhood) return true;
      return placeBySlug.get(occurrence.placeSlug)?.neighborhoodSlug === filters.neighborhood;
    });

  const weekOccurrences = filterByNeighborhood(applyOccurrenceFilters(baseOccurrences, { date: 'week' }));
  const filteredOccurrences = filterByNeighborhood(applyOccurrenceFilters(baseOccurrences, filters));
  const cityStyleSlugs = new Set(weekOccurrences.map((occurrence) => occurrence.styleSlug));
  const metrics = {
    places: cityPlaces.length,
    occurrences: weekOccurrences.length,
    neighborhoods: new Set(cityPlaces.map((place) => place.neighborhoodSlug)).size,
    programs: new Set(weekOccurrences.map((occurrence) => occurrence.programSlug)).size
  };
  const occurrenceResults = filteredOccurrences.sort((left, right) => left.startAt.localeCompare(right.startAt));
  const visiblePlaces = [...new Set(occurrenceResults.map((occurrence) => occurrence.placeSlug))]
    .map((slug) => placeBySlug.get(slug))
    .filter((place): place is NonNullable<typeof place> => Boolean(place));
  const styleLabelBySlug = new Map(allStyles.map((style) => [style.slug, style.name[locale]]));

  const selectedTimeBuckets = filters.time_buckets?.length
    ? filters.time_buckets
    : filters.time_bucket
      ? [filters.time_bucket]
      : [];

  const filterValueToLabel = {
    date: {
      today: locale === 'it' ? 'Oggi' : 'Today',
      tomorrow: locale === 'it' ? 'Domani' : 'Tomorrow',
      weekend: locale === 'it' ? 'Weekend' : 'Weekend',
      week: locale === 'it' ? 'Prossimi 7 giorni' : 'Next 7 days'
    },
    time_bucket: {
      early: locale === 'it' ? 'Presto' : 'Early',
      morning: locale === 'it' ? 'Mattina' : 'Morning',
      midday: locale === 'it' ? 'Metà giornata' : 'Midday',
      evening: locale === 'it' ? 'Sera' : 'Evening'
    },
    level: {
      beginner: locale === 'it' ? 'Principianti' : 'Beginner',
      open: locale === 'it' ? 'Aperti a tutti' : 'Open',
      intermediate: locale === 'it' ? 'Intermedio' : 'Intermediate',
      advanced: locale === 'it' ? 'Avanzato' : 'Advanced'
    },
    format: {
      in_person: locale === 'it' ? 'In presenza' : 'In person',
      hybrid: 'Hybrid',
      online: 'Online'
    },
    drop_in: locale === 'it' ? 'Ingresso singolo' : 'Drop-in'
  } as const;
  const weekdayLabels = {
    mon: locale === 'it' ? 'Lunedì' : 'Monday',
    tue: locale === 'it' ? 'Martedì' : 'Tuesday',
    wed: locale === 'it' ? 'Mercoledì' : 'Wednesday',
    thu: locale === 'it' ? 'Giovedì' : 'Thursday',
    fri: locale === 'it' ? 'Venerdì' : 'Friday',
    sat: locale === 'it' ? 'Sabato' : 'Saturday',
    sun: locale === 'it' ? 'Domenica' : 'Sunday'
  } as const;

  const activeFilters = [
    filters.date ? filterValueToLabel.date[filters.date] : null,
    filters.weekday ? weekdayLabels[filters.weekday] : null,
    ...selectedTimeBuckets.map((bucket) => filterValueToLabel.time_bucket[bucket]),
    filters.category ? categories.find((category) => category.slug === filters.category)?.name[locale] ?? filters.category : null,
    filters.style ? styleLabelBySlug.get(filters.style) ?? filters.style : null,
    filters.level ? filterValueToLabel.level[filters.level] : null,
    filters.language ? filters.language : null,
    filters.neighborhood ? neighborhoods.find((item) => item.slug === filters.neighborhood)?.name[locale] ?? filters.neighborhood : null,
    filters.format ? filterValueToLabel.format[filters.format] : null,
    filters.open_now === 'true' ? (locale === 'it' ? 'In corso' : 'Happening now') : null,
    filters.drop_in === 'true' ? filterValueToLabel.drop_in : null
  ].filter((item): item is string => Boolean(item));

  const basePath = `/${locale}/${citySlug}/activities`;
  const hrefWith = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(urlParams);

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    const query = next.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pageSize = 16;
  const totalPages = Math.max(1, Math.ceil(occurrenceResults.length / pageSize));
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const pageSliceStart = (currentPage - 1) * pageSize;
  const pagedOccurrences = occurrenceResults.slice(pageSliceStart, pageSliceStart + pageSize);
  const resolvedOccurrenceCards = Object.fromEntries(await resolveOccurrenceCardData(pagedOccurrences));
  const visiblePlaceNameBySlug = new Map(visiblePlaces.map((place) => [place.slug, place.name]));
  const mapVenueSummaries = buildMapPlaceSummaries({
    locale,
    citySlug,
    sessions: occurrenceResults,
    venues: cityPlaces,
    neighborhoods,
    instructors: catalog.organizers.filter((organizer) => organizer.citySlug === citySlug),
    styles: allStyles,
    bookingTargets: catalog.bookingTargets
  });
  const selectedVenueSlug = mapVenueSummaries.some((venue) => venue.venueSlug === requestedVenueSlug) ? requestedVenueSlug : undefined;
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Rome'
  });
  const calendarEntries: ClassesCalendarEntry[] = occurrenceResults.map((occurrence) => ({
    sessionId: occurrence.id,
    venueSlug: occurrence.placeSlug,
    placeSlug: occurrence.placeSlug,
    title: occurrence.title[locale],
    venueName: visiblePlaceNameBySlug.get(occurrence.placeSlug) ?? occurrence.placeSlug,
    placeName: visiblePlaceNameBySlug.get(occurrence.placeSlug) ?? occurrence.placeSlug,
    startLabel: timeFormatter.format(new Date(occurrence.startAt)),
    endLabel: timeFormatter.format(new Date(occurrence.endAt)),
    startAt: occurrence.startAt
  }));

  const intro =
    locale === 'it'
      ? 'Attività con orario chiaro, età leggibili e passaggi diretti verso il luogo o la prenotazione.'
      : 'Time-based activities with clear age guidance and direct paths to the place or booking details.';
  const copy =
    locale === 'it'
      ? {
          heroBadge: `${city.name[locale]} · attività`,
          title: 'Scopri attività che entrano davvero nella settimana.',
          intro,
          back: 'Torna alla città',
          todayNearby: dict.todayNearby,
          chipOne: `${occurrenceResults.length} attività visibili`,
          chipTwo: `${visiblePlaces.length} luoghi attivi`,
          chipThree: `${metrics.programs} programmi con orario`,
          statActivities: 'Attività filtrate',
          statPlaces: 'Luoghi in vista',
          statPrograms: 'Programmi',
          statAreas: 'Quartieri'
        }
      : {
          heroBadge: `${city.name[locale]} · activities`,
          title: 'Find activities that can genuinely fit the week.',
          intro,
          back: 'Back to city',
          todayNearby: dict.todayNearby,
          chipOne: `${occurrenceResults.length} visible activities`,
          chipTwo: `${visiblePlaces.length} active places`,
          chipThree: `${metrics.programs} timed programs`,
          statActivities: 'Filtered activities',
          statPlaces: 'Places in view',
          statPrograms: 'Programs',
          statAreas: 'Neighborhoods'
        };

  return (
    <div className="chefamo-page classes-page classes-page-refresh">
      <section className="chefamo-band chefamo-discovery-hero-band full-bleed">
        <div className="chefamo-shell chefamo-discovery-hero-grid">
          <div className="chefamo-hero-copy">
            <div className="chefamo-eyebrow-pill chefamo-tone-blue">
              <PlayfulIcon name="calendar" className="chefamo-inline-icon" />
              <span>{copy.heroBadge}</span>
            </div>
            <h1 className="chefamo-display-md">{copy.title}</h1>
            <p className="chefamo-lead">{copy.intro}</p>
            <div className="chefamo-chip-row">
              <span className="chefamo-chip chefamo-chip-red">{copy.chipOne}</span>
              <span className="chefamo-chip chefamo-chip-yellow">{copy.chipTwo}</span>
              <span className="chefamo-chip chefamo-chip-green">{copy.chipThree}</span>
            </div>
            <div className="chefamo-action-row">
              <ServerButtonLink href={`/${locale}/${citySlug}`} className="chefamo-cta chefamo-cta-secondary">
                {copy.back}
              </ServerButtonLink>
              <ServerButtonLink href={`/${locale}/${citySlug}/collections/today-nearby`} className="chefamo-cta chefamo-cta-primary">
                {copy.todayNearby}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerButtonLink>
            </div>
          </div>

          <article className="chefamo-play-card chefamo-city-overview-card">
            <p className="chefamo-card-kicker">{dict.classes}</p>
            <h2>{locale === 'it' ? 'Filtri forti, orari chiari, pochi passaggi.' : 'Strong filters, clear times, fewer steps.'}</h2>
            <div className="chefamo-stat-grid">
              <div className="chefamo-stat-tile chefamo-tone-red">
                <strong>{occurrenceResults.length}</strong>
                <span>{copy.statActivities}</span>
              </div>
              <div className="chefamo-stat-tile chefamo-tone-blue">
                <strong>{visiblePlaces.length}</strong>
                <span>{copy.statPlaces}</span>
              </div>
              <div className="chefamo-stat-tile chefamo-tone-yellow">
                <strong>{metrics.programs}</strong>
                <span>{copy.statPrograms}</span>
              </div>
              <div className="chefamo-stat-tile chefamo-tone-green">
                <strong>{metrics.neighborhoods}</strong>
                <span>{copy.statAreas}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div id="class-filters">
        <FilterBar
          locale={locale}
          citySlug={citySlug}
          filters={filters}
          categories={categories.map((item) => ({ slug: item.slug, name: item.name[locale] }))}
          neighborhoods={neighborhoods.map((item) => ({ slug: item.slug, name: item.name[locale] }))}
          styles={allStyles
            .filter((style) => cityStyleSlugs.has(style.slug))
            .map((style) => ({ slug: style.slug, name: style.name[locale] }))}
          activeFilters={activeFilters}
        />
      </div>

      <ClassesResultsClient
        locale={locale}
        citySlug={citySlug}
        cityName={city.name[locale]}
        bounds={city.bounds}
        initialView={view}
        visibleCount={occurrenceResults.length}
        pagedSessions={pagedOccurrences}
        resolvedSessionCards={resolvedOccurrenceCards}
        calendarEntries={calendarEntries}
        mapVenueSummaries={mapVenueSummaries}
        initialSelectedVenueSlug={selectedVenueSlug}
        mapRenderMode={getMapRenderMode()}
        signedInEmail={user?.email}
        scheduleLabel={locale === 'it' ? 'Salva nel piano' : 'Save to plan'}
        runtimeCapabilities={runtimeCapabilities}
        noResultsLabel={dict.noResults}
        initialWeekOffset={weekOffset}
        totalPages={totalPages}
        currentPage={currentPage}
        prevHref={currentPage > 1 ? hrefWith({ page: String(currentPage - 1) }) : undefined}
        nextHref={currentPage < totalPages ? hrefWith({ page: String(currentPage + 1) }) : undefined}
      />
    </div>
  );
}
