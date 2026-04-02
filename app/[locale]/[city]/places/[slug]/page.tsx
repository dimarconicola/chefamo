import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { VenueCover } from '@/components/catalog/VenueCover';
import { ClaimFormDialog } from '@/components/forms/ClaimFormDialog';
import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ServerButtonLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveSessionCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatVerifiedAt } from '@/lib/ui/format';

export default async function PlacePage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();
  const place = catalog.places.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!place) notFound();

  const neighborhood = catalog.neighborhoods.find((item) => item.slug === place.neighborhoodSlug);
  const occurrences = catalog.occurrences
    .filter((occurrence) => occurrence.placeSlug === slug)
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 20);

  const [user, resolvedOccurrences, runtimeCapabilities] = await Promise.all([
    getSessionUser(),
    Promise.resolve(resolveSessionCardDataFromSnapshot(catalog, occurrences)),
    getRuntimeCapabilities()
  ]);

  const groupedOccurrences = Object.values(
    occurrences.reduce<Record<string, typeof occurrences>>((groups, occurrence) => {
      const key = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome').toISODate();
      if (!key) return groups;
      if (!groups[key]) groups[key] = [];
      groups[key].push(occurrence);
      return groups;
    }, {})
  );
  const occurrencesByDay = groupedOccurrences.map((dayOccurrences) =>
    dayOccurrences.sort((left, right) => left.startAt.localeCompare(right.startAt))
  );

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Luogo',
          trust: 'Fiducia',
          schedule: 'Programmazione verificata',
          weekdayOccurrences: 'attività a calendario',
          languages: 'lingue',
          styles: 'stili',
          source: 'Fonte primaria',
          upcoming: 'Prossime attività',
          website: 'Apri luogo',
          savePlace: 'Segui luogo',
          savedPlace: 'Luogo salvato',
          showMore: 'Vedi attività'
        }
      : {
          eyebrow: 'Place',
          trust: 'Trust',
          schedule: 'Verified program',
          weekdayOccurrences: 'scheduled activities',
          languages: 'languages',
          styles: 'styles',
          source: 'Primary source',
          upcoming: 'Upcoming activities',
          website: 'Open place',
          savePlace: 'Follow place',
          savedPlace: 'Place saved',
          showMore: 'See activity'
        };

  return (
    <div className="stack-list">
      <section className="detail-hero profile-hero">
        <div className="panel profile-main">
          <div className="profile-main-layout">
            <div className="profile-main-copy">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{place.name}</h1>
              <p className="lead">{place.description[locale]}</p>
              <div className="profile-chip-row">
                {place.amenities.map((amenity) => (
                  <ServerChip key={amenity} tone="meta">
                    {amenity}
                  </ServerChip>
                ))}
              </div>
              <div className="profile-meta">
                <p className="muted">
                  {place.address} · {neighborhood?.name[locale]}
                </p>
                <p className="muted">
                  {place.freshnessNote[locale]} · {formatVerifiedAt(place.lastVerifiedAt, locale)}
                </p>
              </div>
              <div className="site-actions profile-links">
                <FavoriteButton
                  entitySlug={place.slug}
                  entityType="place"
                  locale={locale}
                  signedInEmail={user?.email}
                  label={copy.savePlace}
                  savedLabel={copy.savedPlace}
                  runtimeCapabilities={runtimeCapabilities}
                />
                <ServerButtonLink href={place.sourceUrl} className="button-secondary" target="_blank" rel="noreferrer">
                  {copy.website}
                </ServerButtonLink>
              </div>
            </div>
            <VenueCover venue={place} locale={locale} className="profile-venue-cover" />
          </div>
        </div>
        <div className="profile-side-stack">
          <div className="panel profile-side">
            <p className="eyebrow">{copy.trust}</p>
            <h2>{copy.schedule}</h2>
            <p className="muted">
              {copy.source}:{' '}
              <ServerLink href={place.sourceUrl} target="_blank" rel="noreferrer" className="inline-link">
                {place.sourceUrl}
              </ServerLink>
            </p>
            <div className="classes-stat-grid profile-metrics">
              <div className="classes-stat-card">
                <strong>{occurrences.length}</strong>
                <span>{copy.weekdayOccurrences}</span>
              </div>
              <div className="classes-stat-card">
                <strong>{place.languages.length}</strong>
                <span>{copy.languages}</span>
              </div>
              <div className="classes-stat-card">
                <strong>{place.styleSlugs.length}</strong>
                <span>{copy.styles}</span>
              </div>
            </div>
            <div className="profile-side-actions">
              <ClaimFormDialog placeSlug={place.slug} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{copy.upcoming}</p>
            <h2>{locale === 'it' ? 'Opzioni affidabili in arrivo' : 'Trustworthy upcoming options'}</h2>
          </div>
        </div>
        <div className="stack-list">
          {occurrencesByDay.map((dayOccurrences) => {
            const day = DateTime.fromISO(dayOccurrences[0].startAt).setZone('Europe/Rome');
            return (
              <section key={day.toISODate() ?? dayOccurrences[0].id} className="session-day-group panel">
                <div className="day-group-header">
                  <div>
                    <p className="eyebrow">{day.toFormat(locale === 'it' ? 'cccc' : 'cccc')}</p>
                    <h2>{day.toFormat(locale === 'it' ? 'd LLLL' : 'd LLLL')}</h2>
                  </div>
                  <div className="day-group-meta">
                    <ServerChip tone="meta">{dayOccurrences.length}</ServerChip>
                  </div>
                </div>
                <div className="session-day-stack">
                  {dayOccurrences.map((occurrence) => {
                    const resolved = resolvedOccurrences.get(occurrence.id)!;
                    const occurrenceStart = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
                    const occurrenceEnd = DateTime.fromISO(occurrence.endAt).setZone('Europe/Rome');
                    const durationMinutes = Math.max(30, Math.round(occurrenceEnd.diff(occurrenceStart, 'minutes').minutes));

                    return (
                      <article key={occurrence.id} className="panel chefamo-session-card">
                        <div className="session-card-shell">
                          <div className="session-time-block">
                            <span className="session-time-main">{occurrenceStart.toFormat('HH:mm')}</span>
                            <span className="session-time-sub">{durationMinutes} min</span>
                          </div>
                          <div className="session-card-body">
                            <div className="session-card-top">
                              <div>
                                <p className="eyebrow">{resolved.style.name[locale]}</p>
                                <p className="lead">
                                  <ServerLink href={`/${locale}/${citySlug}/activities/${occurrence.id}`} className="inline-link">
                                    {occurrence.title[locale]}
                                  </ServerLink>
                                </p>
                              </div>
                              <span className={`status-pill ${occurrence.verificationStatus}`}>
                                {occurrence.verificationStatus === 'verified' ? (locale === 'it' ? 'Verificato' : 'Verified') : locale === 'it' ? 'Da aggiornare' : 'Needs refresh'}
                              </span>
                            </div>
                            <p className="session-meta">{occurrenceStart.toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm')}</p>
                            <p className="muted">
                              {resolved.place.name} · {resolved.organizer.name}
                            </p>
                            <div className="session-card-footer">
                              <div className="stack-list">
                                <div className="session-card-links">
                                  <ServerLink href={`/${locale}/${citySlug}/activities/${occurrence.id}`} className="inline-link">
                                    {copy.showMore}
                                  </ServerLink>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
