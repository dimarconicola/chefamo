import Image from 'next/image';
import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { ServerCardLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function OrganizersIndexPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();

  const organizers = catalog.instructors
    .filter((instructor) => instructor.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));

  const sessionsByOrganizer = new Map(
    organizers.map((instructor) => [
      instructor.slug,
      catalog.sessions
        .filter((session) => session.instructorSlug === instructor.slug && session.verificationStatus !== 'hidden')
        .sort((left, right) => left.startAt.localeCompare(right.startAt))
    ])
  );

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Organizzatori a Palermo',
          title: 'Chi rende leggibili le attivita della citta',
          lead: 'Persone, non solo slot. Elenco alfabetico degli organizzatori, con profili, prossime attivita e link esterni verificati.',
          sessions: 'attivita in calendario',
          next: 'Prossima attivita',
          open: 'Apri profilo',
          verifiedLink: 'Link verificato',
          noNext: 'Nessuna attivita pubblica verificata per questo profilo.'
        }
      : {
          eyebrow: 'Organizers in Palermo',
          title: 'Who makes the city activity layer readable',
          lead: 'People, not just slots. Alphabetical organizer directory with concise profiles, upcoming activities, and verified external links.',
          sessions: 'scheduled activities',
          next: 'Next activity',
          open: 'Open profile',
          verifiedLink: 'Verified link',
          noNext: 'No public upcoming activity is currently active for this profile.'
        };

  return (
    <div className="stack-list teachers-directory-page">
      <section className="panel teachers-directory-hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
      </section>

      <section className="teachers-directory-grid">
        {organizers.map((instructor) => {
          const sessions = sessionsByOrganizer.get(instructor.slug) ?? [];
          const nextSession = sessions[0];
          const nextLabel = nextSession
            ? DateTime.fromISO(nextSession.startAt).setZone('Europe/Rome').toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm')
            : null;
          const socialLink = instructor.socialLinks?.[0];

          return (
            <article key={instructor.slug} className="panel teacher-directory-card">
              <div className="teacher-directory-top">
                {instructor.headshot ? (
                  <div className="teacher-directory-media">
                    <Image
                      src={instructor.headshot.url}
                      alt={instructor.headshot.alt[locale]}
                      width={144}
                      height={144}
                      className="teacher-directory-image"
                    />
                  </div>
                ) : (
                  <div className="teacher-directory-placeholder" aria-hidden="true">
                    {instructor.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}

                <div className="teacher-directory-copy">
                  <p className="eyebrow">{instructor.name}</p>
                  <p className="lead">{instructor.shortBio[locale]}</p>
                  <div className="teacher-directory-tags">
                    {instructor.languages.map((language) => (
                      <ServerChip key={`${instructor.slug}-${language}`} tone="meta">
                        {language}
                      </ServerChip>
                    ))}
                    <ServerChip tone="meta">
                      {sessions.length} {copy.sessions}
                    </ServerChip>
                  </div>
                </div>
              </div>

              <div className="teacher-directory-meta">
                <div>
                  <p className="eyebrow">{copy.next}</p>
                  <p className="muted">{nextLabel ?? copy.noNext}</p>
                </div>
                {socialLink ? (
                  <div>
                    <p className="eyebrow">{copy.verifiedLink}</p>
                    <ServerLink href={socialLink.href} target="_blank" rel="noreferrer" className="inline-link">
                      {socialLink.label[locale]}
                    </ServerLink>
                  </div>
                ) : null}
              </div>

              <ServerCardLink href={`/${locale}/${citySlug}/organizers/${instructor.slug}`} className="teacher-directory-link-card">
                <strong>{copy.open}</strong>
                <span className="muted">{instructor.name}</span>
              </ServerCardLink>
            </article>
          );
        })}
      </section>
    </div>
  );
}
