import { notFound } from 'next/navigation';

import { SessionCard } from '@/components/discovery/SessionCard';
import { ServerButtonLink, ServerCardLink, ServerChip } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardData } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function NeighborhoodPage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  const neighborhood = catalog.neighborhoods.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!city || !neighborhood) notFound();

  const places = catalog.places
    .filter((place) => place.citySlug === citySlug && place.neighborhoodSlug === slug)
    .sort((left, right) => left.name.localeCompare(right.name, locale));
  const placeSlugs = new Set(places.map((place) => place.slug));
  const occurrences = catalog.occurrences
    .filter((occurrence) => placeSlugs.has(occurrence.placeSlug))
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 12);
  const programs = catalog.programs
    .filter((program) => placeSlugs.has(program.placeSlug))
    .sort((left, right) => left.title[locale].localeCompare(right.title[locale], locale))
    .slice(0, 8);
  const [user, runtimeCapabilities, resolvedOccurrences] = await Promise.all([
    getSessionUser(),
    getRuntimeCapabilities(),
    resolveOccurrenceCardData(occurrences)
  ]);
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Quartiere',
          browse: 'Apri attivita nel quartiere',
          activities: 'Attivita con orario',
          activitiesTitle: 'Cosa puoi gia mettere in piano qui',
          activitiesEmpty: 'Per ora non ci sono slot pubblici imminenti in questo quartiere.',
          programs: 'Programmi locali',
          programsTitle: 'Cose da tenere sotto mano anche oltre il singolo giorno',
          programsEmpty: 'Per ora non abbiamo programmi ricorrenti visibili qui.',
          places: 'Luoghi del quartiere',
          placesTitle: 'Posti utili da conoscere per giorni lenti, pioggia o weekend',
          placesEmpty: 'Per ora non ci sono altri luoghi da segnalare.',
          chips: {
            activities: 'slot',
            programs: 'programmi',
            places: 'luoghi'
          }
        }
      : {
          eyebrow: 'Neighborhood',
          browse: 'Open neighborhood activities',
          activities: 'Timed activities',
          activitiesTitle: 'What you can already put on the plan here',
          activitiesEmpty: 'There are no imminent public slots in this neighborhood yet.',
          programs: 'Local programs',
          programsTitle: 'What is worth keeping in view beyond one day',
          programsEmpty: 'There are no visible recurring programs here yet.',
          places: 'Neighborhood places',
          placesTitle: 'Places worth knowing for slow days, rain plans, and weekends',
          placesEmpty: 'There are no extra places to highlight yet.',
          chips: {
            activities: 'slots',
            programs: 'programs',
            places: 'places'
          }
        };

  return (
    <div className="stack-list">
      <section className="panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{neighborhood.name[locale]}</h1>
        <p className="lead">{neighborhood.description[locale]}</p>
        <div className="profile-chip-row">
          <ServerChip tone="meta">
            {occurrences.length} {copy.chips.activities}
          </ServerChip>
          <ServerChip tone="meta">
            {programs.length} {copy.chips.programs}
          </ServerChip>
          <ServerChip tone="meta">
            {places.length} {copy.chips.places}
          </ServerChip>
        </div>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/${citySlug}/activities?neighborhood=${neighborhood.slug}`} className="button-primary">
            {copy.browse}
          </ServerButtonLink>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{copy.activities}</p>
            <h2>{copy.activitiesTitle}</h2>
          </div>
        </div>
        {occurrences.length > 0 ? (
          <div className="stack-list">
            {occurrences.map((occurrence) => (
              <SessionCard
                key={occurrence.id}
                session={occurrence}
                locale={locale}
                resolved={resolvedOccurrences.get(occurrence.id)!}
                signedInEmail={user?.email}
                scheduleLabel={dict.saveSchedule}
                runtimeCapabilities={runtimeCapabilities}
              />
            ))}
          </div>
        ) : (
          <p className="muted">{copy.activitiesEmpty}</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">{copy.programs}</p>
        <h2>{copy.programsTitle}</h2>
        {programs.length > 0 ? (
          <div className="card-grid">
            {programs.map((program) => (
              <ServerCardLink key={program.slug} href={`/${locale}/${citySlug}/places/${program.placeSlug}`} className="collection-card">
                <strong>{program.title[locale]}</strong>
                <span className="muted">{program.summary[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        ) : (
          <p className="muted">{copy.programsEmpty}</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">{copy.places}</p>
        <h2>{copy.placesTitle}</h2>
        {places.length > 0 ? (
          <div className="card-grid">
            {places.map((place) => (
              <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="collection-card">
                <strong>{place.name}</strong>
                <span className="muted">{place.tagline[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        ) : (
          <p className="muted">{copy.placesEmpty}</p>
        )}
      </section>
    </div>
  );
}
