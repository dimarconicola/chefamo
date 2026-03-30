import { notFound } from 'next/navigation';
import { DateTime } from 'luxon';

import { VenueCover } from '@/components/catalog/VenueCover';
import { ClaimFormDialog } from '@/components/forms/ClaimFormDialog';
import { SessionCard } from '@/components/discovery/SessionCard';
import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ServerButtonLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatVerifiedAt } from '@/lib/ui/format';

export default async function PlacePage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();
  const place = catalog.places.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!place) notFound();

  const neighborhoods = catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
  const placeOccurrences = catalog.occurrences.filter((occurrence) => occurrence.placeSlug === slug);
  const placePrograms = catalog.programs.filter((program) => program.placeSlug === slug);
  const neighborhood = neighborhoods.find((item) => item.slug === place.neighborhoodSlug);
  const occurrences = placeOccurrences.sort((left, right) => left.startAt.localeCompare(right.startAt)).slice(0, 20);
  const [user, resolvedOccurrences, runtimeCapabilities] = await Promise.all([
    getSessionUser(),
    Promise.resolve(resolveOccurrenceCardDataFromSnapshot(catalog, occurrences)),
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
  const profileCopy =
    locale === 'it'
      ? {
          eyebrow: 'Luogo',
          schedule: 'Segnali verificati',
          trust: 'Affidabilità',
          weekdaySessions: 'attività con orario',
          languages: 'lingue',
          styles: 'formati',
          source: 'Fonte primaria',
          upcoming: 'Prossime attività',
          website: 'Sito ufficiale',
          savePlace: 'Segui luogo',
          savedPlace: 'Luogo seguito',
          programs: 'programmi'
        }
      : {
          eyebrow: 'Place',
          schedule: 'Verified signals',
          trust: 'Trust layer',
          weekdaySessions: 'scheduled activities',
          languages: 'languages',
          styles: 'formats',
          source: 'Primary source',
          upcoming: 'Upcoming activities',
          website: 'Official website',
          savePlace: 'Follow place',
          savedPlace: 'Place followed',
          programs: 'programs'
        };

  return (
    <div className="stack-list">
      <section className="detail-hero profile-hero">
        <div className="panel profile-main">
          <div className="profile-main-layout">
            <div className="profile-main-copy">
              <p className="eyebrow">{profileCopy.eyebrow}</p>
              <h1>{place.name}</h1>
              <p className="lead">{place.description[locale]}</p>
              <div className="profile-chip-row">
                <ServerChip tone="meta">{place.profile}</ServerChip>
                <ServerChip tone="meta">{place.environment}</ServerChip>
                {place.goodAnytime ? <ServerChip tone="meta">{locale === 'it' ? 'good anytime' : 'good anytime'}</ServerChip> : null}
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
                  label={profileCopy.savePlace}
                  savedLabel={profileCopy.savedPlace}
                  runtimeCapabilities={runtimeCapabilities}
                />
                <ServerButtonLink href={place.sourceUrl} className="button-secondary" target="_blank" rel="noreferrer">
                  {profileCopy.website}
                </ServerButtonLink>
              </div>
            </div>
            <VenueCover venue={place} locale={locale} className="profile-venue-cover" />
          </div>
        </div>
        <div className="profile-side-stack">
          <div className="panel profile-side">
            <p className="eyebrow">{profileCopy.trust}</p>
            <h2>{profileCopy.schedule}</h2>
            <p className="muted">
              {profileCopy.source}:{' '}
              <ServerLink href={place.sourceUrl} target="_blank" rel="noreferrer" className="inline-link">
                {place.sourceUrl}
              </ServerLink>
            </p>
            <div className="classes-stat-grid profile-metrics">
              <div className="classes-stat-card">
                <strong>{occurrences.length}</strong>
                <span>{profileCopy.weekdaySessions}</span>
              </div>
              <div className="classes-stat-card">
                <strong>{placePrograms.length}</strong>
                <span>{profileCopy.programs}</span>
              </div>
              <div className="classes-stat-card">
                <strong>{place.languages.length}</strong>
                <span>{profileCopy.languages}</span>
              </div>
            </div>
            <div className="profile-side-actions">
              <ClaimFormDialog studioSlug={place.slug} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{profileCopy.upcoming}</p>
            <h2>{locale === 'it' ? 'Cosa puoi prenotare o programmare da qui' : 'What you can plan from this place'}</h2>
          </div>
        </div>
        {occurrencesByDay.length > 0 ? (
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
                    {dayOccurrences.map((occurrence) => (
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
                </section>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            {locale === 'it'
              ? 'Questo luogo è comunque utile anche senza orari futuri già pubblicati: puoi usarlo come riferimento affidabile per la famiglia.'
              : 'This place is still useful even without published future slots: keep it as a reliable family reference point.'}
          </p>
        )}
      </section>
    </div>
  );
}
