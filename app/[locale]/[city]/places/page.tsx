import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { ServerCardLink, ServerChip } from '@/components/ui/server';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function PlacesIndexPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();

  const venues = catalog.venues
    .filter((venue) => venue.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));

  const sessionsByVenue = new Map(
    venues.map((venue) => [
      venue.slug,
      catalog.sessions
        .filter((session) => session.venueSlug === venue.slug && session.verificationStatus !== 'hidden')
        .sort((left, right) => left.startAt.localeCompare(right.startAt))
    ])
  );

  const neighborhoods = new Map(
    catalog.neighborhoods
      .filter((neighborhood) => neighborhood.citySlug === citySlug)
      .map((neighborhood) => [neighborhood.slug, neighborhood.name[locale]])
  );

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Luoghi a Palermo',
          title: 'Spazi utili per la vita di famiglia',
          lead: 'Musei, biblioteche, parchi e studi da tenere nel radar quando serve un posto giusto, anche senza slot perfetto.',
          sessions: 'attivita in calendario',
          next: 'Prossima attivita',
          open: 'Apri scheda',
          source: 'Fonte verificata',
          noNext: 'Nessuna attivita pubblica verificata per questo luogo.'
        }
      : {
          eyebrow: 'Places in Palermo',
          title: 'Useful spaces for family time',
          lead: 'Museums, libraries, parks, and studios to keep on your radar when you need the right place, even without a perfect slot.',
          sessions: 'scheduled activities',
          next: 'Next activity',
          open: 'Open profile',
          source: 'Verified source',
          noNext: 'No public upcoming activity is currently active for this place.'
        };

  return (
    <div className="stack-list">
      <section className="panel teachers-directory-hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
      </section>

      <section className="teachers-directory-grid">
        {venues.map((venue) => {
          const sessions = sessionsByVenue.get(venue.slug) ?? [];
          const nextSession = sessions[0];
          const nextLabel = nextSession
            ? DateTime.fromISO(nextSession.startAt).setZone('Europe/Rome').toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm')
            : null;

          return (
            <article key={venue.slug} className="panel teacher-directory-card">
              <div className="teacher-directory-copy">
                <p className="eyebrow">{venue.name}</p>
                <p className="lead">{venue.description[locale]}</p>
                <div className="teacher-directory-tags">
                  <ServerChip tone="meta">
                    {sessions.length} {copy.sessions}
                  </ServerChip>
                  <ServerChip tone="meta">{neighborhoods.get(venue.neighborhoodSlug) ?? venue.neighborhoodSlug}</ServerChip>
                </div>
              </div>

              <div className="teacher-directory-meta">
                <div>
                  <p className="eyebrow">{copy.next}</p>
                  <p className="muted">{nextLabel ?? copy.noNext}</p>
                </div>
                <div>
                  <p className="eyebrow">{copy.source}</p>
                  <p className="muted">{venue.freshnessNote[locale]}</p>
                </div>
              </div>

              <ServerCardLink href={`/${locale}/${citySlug}/places/${venue.slug}`} className="teacher-directory-link-card">
                <strong>{copy.open}</strong>
                <span className="muted">{venue.address}</span>
              </ServerCardLink>
            </article>
          );
        })}
      </section>
    </div>
  );
}
