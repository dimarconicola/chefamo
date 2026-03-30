import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DateTime } from 'luxon';

import { SessionCard } from '@/components/discovery/SessionCard';
import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ServerChip, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardData } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function OrganizerPage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  if (!city) notFound();
  const organizer = catalog.organizers.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!organizer) notFound();

  const [user, runtimeCapabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);
  const occurrences = catalog.occurrences
    .filter((occurrence) => occurrence.organizerSlug === slug)
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 20);
  const resolvedOccurrences = await resolveOccurrenceCardData(occurrences);
  const placeNameBySlug = new Map(
    catalog.places
      .filter((place) => place.citySlug === citySlug)
      .map((place) => [place.slug, place.name] as const)
  );
  const occurrencesByDay = Object.values(
    occurrences.reduce<Record<string, typeof occurrences>>((groups, occurrence) => {
      const key = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome').toISODate();
      if (!key) return groups;
      if (!groups[key]) groups[key] = [];
      groups[key].push(occurrence);
      return groups;
    }, {})
  );
  const placeCount = new Set(occurrences.map((occurrence) => occurrence.placeSlug)).size;
  const organizerCopy =
    locale === 'it'
      ? {
          eyebrow: 'Organizzatore',
          trust: 'Impronta locale',
          upcoming: 'Attività in arrivo',
          why: 'Perché conta',
          sessions: 'attività',
          venues: 'luoghi',
          languages: 'lingue',
          saveTeacher: 'Segui organizzatore',
          savedTeacher: 'Organizzatore seguito',
          social: 'Link esterni',
          openExternal: 'Apri link verificato'
        }
      : {
          eyebrow: 'Organizer',
          trust: 'Local footprint',
          upcoming: 'Upcoming activities',
          why: 'Why they matter',
          sessions: 'activities',
          venues: 'places',
          languages: 'languages',
          saveTeacher: 'Follow organizer',
          savedTeacher: 'Organizer followed',
          social: 'External links',
          openExternal: 'Open verified link'
        };

  return (
    <div className="stack-list">
      <section className="detail-hero profile-hero">
        <div className="panel profile-main">
          <p className="eyebrow">{organizerCopy.eyebrow}</p>
          <div className="teacher-profile-layout">
            {organizer.headshot ? (
              <div className="teacher-profile-media">
                <Image
                  src={organizer.headshot.url}
                  alt={organizer.headshot.alt[locale]}
                  width={176}
                  height={176}
                  className="teacher-profile-image"
                />
              </div>
            ) : null}
            <div className="teacher-profile-copy">
              <h1>{organizer.name}</h1>
              <p className="lead">{organizer.shortBio[locale]}</p>
              <div className="badge-row">
                {organizer.languages.map((language) => (
                  <ServerChip key={language} className="meta-pill" tone="meta">
                    {language}
                  </ServerChip>
                ))}
                {organizer.specialties.map((specialty) => (
                  <ServerChip key={specialty} className="meta-pill" tone="meta">
                    {specialty}
                  </ServerChip>
                ))}
              </div>
              <div className="site-actions profile-links">
                <FavoriteButton
                  entitySlug={organizer.slug}
                  entityType="organizer"
                  locale={locale}
                  signedInEmail={user?.email}
                  label={organizerCopy.saveTeacher}
                  savedLabel={organizerCopy.savedTeacher}
                  runtimeCapabilities={runtimeCapabilities}
                />
                {organizer.socialLinks?.map((link) => (
                  <ServerLink key={link.href} href={link.href} target="_blank" rel="noreferrer" className="button button-ghost">
                    {link.label[locale]}
                  </ServerLink>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="panel profile-side">
          <p className="eyebrow">{organizerCopy.trust}</p>
          <h2>{organizerCopy.why}</h2>
          <p className="lead">
            {locale === 'it'
              ? 'Qui la fiducia locale non è solo persona: è chiarezza editoriale, costanza di programmazione e qualità del segnale pubblico.'
              : 'Local trust here is not just about a person: it is about editorial clarity, programming consistency, and public signal quality.'}
          </p>
          <div className="classes-stat-grid profile-metrics">
            <div className="classes-stat-card">
              <strong>{occurrences.length}</strong>
              <span>{organizerCopy.sessions}</span>
            </div>
            <div className="classes-stat-card">
              <strong>{placeCount}</strong>
              <span>{organizerCopy.venues}</span>
            </div>
            <div className="classes-stat-card">
              <strong>{organizer.languages.length}</strong>
              <span>{organizerCopy.languages}</span>
            </div>
          </div>
          {organizer.socialLinks?.length ? (
            <div className="teacher-social-block">
              <p className="eyebrow">{organizerCopy.social}</p>
              <div className="teacher-social-links">
                {organizer.socialLinks.map((link) => (
                  <ServerLink key={`${organizer.slug}-${link.href}`} href={link.href} target="_blank" rel="noreferrer" className="inline-link">
                    {organizerCopy.openExternal}: {link.label[locale]}
                  </ServerLink>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <section className="panel">
        <p className="eyebrow">{organizerCopy.upcoming}</p>
        <div className="stack-list">
          {occurrencesByDay.map((dayOccurrences) => {
            const day = DateTime.fromISO(dayOccurrences[0].startAt).setZone('Europe/Rome');
            const places = new Set(dayOccurrences.map((occurrence) => placeNameBySlug.get(occurrence.placeSlug)).filter(Boolean));
            return (
              <section key={day.toISODate() ?? dayOccurrences[0].id} className="session-day-group panel">
                <div className="day-group-header">
                  <div>
                    <p className="eyebrow">{day.toFormat(locale === 'it' ? 'cccc' : 'cccc')}</p>
                    <h2>{day.toFormat(locale === 'it' ? 'd LLLL' : 'd LLLL')}</h2>
                  </div>
                  <div className="day-group-meta">
                    <ServerChip tone="meta">
                      {dayOccurrences.length} {organizerCopy.sessions}
                    </ServerChip>
                    <ServerChip tone="meta">
                      {places.size} {organizerCopy.venues}
                    </ServerChip>
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
      </section>
    </div>
  );
}
