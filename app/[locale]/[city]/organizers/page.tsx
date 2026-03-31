import Image from 'next/image';
import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { ServerCardLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function OrganizersIndexPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') notFound();

  const organizers = catalog.organizers
    .filter((organizer) => organizer.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));

  const occurrencesByOrganizer = new Map(
    organizers.map((organizer) => [
      organizer.slug,
      catalog.occurrences
        .filter((occurrence) => occurrence.organizerSlug === organizer.slug && occurrence.verificationStatus !== 'hidden')
        .sort((left, right) => left.startAt.localeCompare(right.startAt))
    ])
  );

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Organizzatori',
          title: 'Chi cura l esperienza family a Palermo',
          lead:
            'Una directory alfabetica di istituzioni, spazi e piccoli operatori che pubblicano attività 0-14 con segnali abbastanza chiari da essere utili.',
          chipOne: 'Profili utili',
          chipTwo: 'Lingue attive',
          sessions: 'attività visibili',
          next: 'Prossima attività',
          open: 'Apri profilo',
          verifiedLink: 'Link verificato',
          noNext: 'Nessuna prossima attività pubblica visibile per questo profilo.'
        }
      : {
          eyebrow: 'Organizers',
          title: 'Who shapes the family activity layer in Palermo',
          lead:
            'An alphabetical directory of institutions, spaces, and small operators that publish 0-14 activities clearly enough to be useful.',
          chipOne: 'Useful profiles',
          chipTwo: 'Active languages',
          sessions: 'visible activities',
          next: 'Next activity',
          open: 'Open profile',
          verifiedLink: 'Verified link',
          noNext: 'No public upcoming activity is currently visible for this profile.'
        };

  return (
    <div className="chefamo-page teachers-directory-page">
      <section className="chefamo-band chefamo-discovery-hero-band full-bleed">
        <div className="chefamo-shell chefamo-discovery-hero-grid">
          <div className="chefamo-hero-copy">
            <div className="chefamo-eyebrow-pill chefamo-tone-green">
              <PlayfulIcon name="spark" className="chefamo-inline-icon" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1 className="chefamo-display-md">{copy.title}</h1>
            <p className="chefamo-lead">{copy.lead}</p>
            <div className="chefamo-chip-row">
              <span className="chefamo-chip chefamo-chip-red">
                {organizers.length} {copy.chipOne}
              </span>
              <span className="chefamo-chip chefamo-chip-blue">
                {new Set(organizers.flatMap((organizer) => organizer.languages)).size} {copy.chipTwo}
              </span>
            </div>
          </div>

          <article className="chefamo-play-card chefamo-city-overview-card">
            <p className="chefamo-card-kicker">{locale === 'it' ? 'Segnale affidabile' : 'Reliable signal'}</p>
            <h2>{locale === 'it' ? 'Profili chiari, non pagine parcheggiate.' : 'Clear profiles, not abandoned pages.'}</h2>
            <p className="chefamo-muted">
              {locale === 'it'
                ? 'Qui emergono operatori che pubblicano abbastanza bene da aiutare davvero una famiglia a scegliere.'
                : 'This surface highlights operators that publish clearly enough to genuinely help a family choose.'}
            </p>
          </article>
        </div>
      </section>

      <section className="teachers-directory-grid chefamo-organizer-grid">
        {organizers.map((organizer) => {
          const occurrences = occurrencesByOrganizer.get(organizer.slug) ?? [];
          const nextOccurrence = occurrences[0];
          const nextLabel = nextOccurrence
            ? DateTime.fromISO(nextOccurrence.startAt).setZone('Europe/Rome').toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm')
            : null;
          const socialLink = organizer.socialLinks?.[0];

          return (
            <article key={organizer.slug} className="panel teacher-directory-card chefamo-organizer-card">
              <div className="teacher-directory-top">
                {organizer.headshot ? (
                  <div className="teacher-directory-media">
                    <Image
                      src={organizer.headshot.url}
                      alt={organizer.headshot.alt[locale]}
                      width={144}
                      height={144}
                      className="teacher-directory-image"
                    />
                  </div>
                ) : (
                  <div className="teacher-directory-placeholder" aria-hidden="true">
                    {organizer.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}

                <div className="teacher-directory-copy">
                  <p className="eyebrow">{organizer.name}</p>
                  <p className="lead">{organizer.shortBio[locale]}</p>
                  <div className="teacher-directory-tags">
                    {organizer.languages.map((language) => (
                      <ServerChip key={`${organizer.slug}-${language}`} tone="meta">
                        {language}
                      </ServerChip>
                    ))}
                    <ServerChip tone="meta">
                      {occurrences.length} {copy.sessions}
                    </ServerChip>
                  </div>
                </div>
              </div>

              <div className="teacher-directory-meta">
                <div className="chefamo-organizer-meta-card">
                  <p className="eyebrow">{copy.next}</p>
                  <p className="muted">{nextLabel ?? copy.noNext}</p>
                </div>
                {socialLink ? (
                  <div className="chefamo-organizer-meta-card">
                    <p className="eyebrow">{copy.verifiedLink}</p>
                    <ServerLink href={socialLink.href} target="_blank" rel="noreferrer" className="inline-link">
                      {socialLink.label[locale]}
                    </ServerLink>
                  </div>
                ) : null}
              </div>

              <ServerCardLink
                href={`/${locale}/${citySlug}/organizers/${organizer.slug}`}
                className="teacher-directory-link-card chefamo-organizer-link"
              >
                <strong>{copy.open}</strong>
                <span className="muted">{organizer.name}</span>
              </ServerCardLink>
            </article>
          );
        })}
      </section>
    </div>
  );
}
