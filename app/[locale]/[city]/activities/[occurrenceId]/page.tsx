import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DateTime } from 'luxon';

import { BookingLink } from '@/components/discovery/BookingLink';
import { ShareButton } from '@/components/share/ShareButton';
import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ScheduleButton } from '@/components/state/ScheduleButton';
import { ServerButtonLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getOccurrencePath } from '@/lib/catalog/occurrence-links';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { env } from '@/lib/env';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatSessionTime, formatVerifiedAt } from '@/lib/ui/format';

const getAgeLabel = (locale: 'it' | 'en', ageMin?: number, ageMax?: number, ageBand?: string) => {
  if (typeof ageMin === 'number' && typeof ageMax === 'number') {
    return locale === 'it' ? `${ageMin}-${ageMax} anni` : `${ageMin}-${ageMax}`;
  }

  if (!ageBand) return locale === 'it' ? 'Per famiglie' : 'Family-friendly';

  const labels = {
    it: {
      '0-2': '0-2 anni',
      '3-5': '3-5 anni',
      '6-10': '6-10 anni',
      '11-14': '11-14 anni',
      'mixed-kids': '3-14 anni'
    },
    en: {
      '0-2': '0-2',
      '3-5': '3-5',
      '6-10': '6-10',
      '11-14': '11-14',
      'mixed-kids': '3-14'
    }
  } as const;

  return labels[locale][ageBand as keyof (typeof labels)[typeof locale]] ?? (locale === 'it' ? 'Per famiglie' : 'Family-friendly');
};

const buildShareDescription = ({
  title,
  placeName,
  timeLabel,
  ageLabel
}: {
  title: string;
  placeName: string;
  timeLabel: string;
  ageLabel: string;
}) => `${title} · ${timeLabel} · ${placeName} · ${ageLabel}`;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; city: string; occurrenceId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, city: citySlug, occurrenceId } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const occurrence = catalog.occurrences.find((item) => item.id === occurrenceId && item.citySlug === citySlug);
  if (!occurrence) return {};

  const resolved = resolveOccurrenceCardDataFromSnapshot(catalog, [occurrence]).get(occurrence.id);
  if (!resolved) return {};

  const path = getOccurrencePath(locale, citySlug, occurrence.id);
  const url = new URL(path, env.siteUrl).toString();
  const title = `${occurrence.title[locale]} · ${resolved.place.name}`;
  const description = buildShareDescription({
    title: occurrence.title[locale],
    placeName: resolved.place.name,
    timeLabel: formatSessionTime(occurrence.startAt, locale),
    ageLabel: getAgeLabel(locale, occurrence.ageMin, occurrence.ageMax, occurrence.ageBand)
  });

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article'
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  };
}

export default async function OccurrencePage({
  params
}: {
  params: Promise<{ locale: string; city: string; occurrenceId: string }>;
}) {
  const { locale: rawLocale, city: citySlug, occurrenceId } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  if (!city) notFound();

  const occurrence = catalog.occurrences.find((item) => item.id === occurrenceId && item.citySlug === citySlug);
  if (!occurrence) notFound();

  const resolved = resolveOccurrenceCardDataFromSnapshot(catalog, [occurrence]).get(occurrence.id);
  if (!resolved) notFound();

  const [user, runtimeCapabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);
  const neighborhood = catalog.neighborhoods.find((item) => item.citySlug === citySlug && item.slug === resolved.place.neighborhoodSlug);
  const program = catalog.programs.find((item) => item.slug === occurrence.programSlug);
  const activityPath = getOccurrencePath(locale, citySlug, occurrence.id);
  const shareUrl = new URL(activityPath, env.siteUrl).toString();
  const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
  const end = DateTime.fromISO(occurrence.endAt).setZone('Europe/Rome');
  const ageLabel = getAgeLabel(locale, occurrence.ageMin, occurrence.ageMax, occurrence.ageBand);
  const shareText = buildShareDescription({
    title: occurrence.title[locale],
    placeName: resolved.place.name,
    timeLabel: formatSessionTime(occurrence.startAt, locale),
    ageLabel
  });
  const durationMinutes = Math.max(30, Math.round(end.diff(start, 'minutes').minutes));
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Attività',
          summaryFallback: 'Scheda condivisibile con orario, età, luogo e fonte esterna verificata.',
          organizer: 'Organizzatore',
          place: 'Luogo',
          source: 'Fonte primaria',
          moreInfo: 'Più info',
          share: 'Condividi',
          saveProgram: 'Segui programma',
          savedProgram: 'Programma seguito',
          addToPlan: dict.saveSchedule,
          inPlan: 'In piano',
          openPlace: 'Apri luogo',
          openOrganizer: 'Apri organizzatore',
          trust: 'Affidabilità',
          verified: 'Verificato',
          age: 'Età',
          time: 'Orario',
          duration: 'Durata',
          withAdult: 'Con adulto',
          dateHeading: 'Quando succede',
          sourceHeading: 'Perché questo link si può condividere'
        }
      : {
          eyebrow: 'Activity',
          summaryFallback: 'Shareable activity page with time, age fit, place, and verified external source.',
          organizer: 'Organizer',
          place: 'Place',
          source: 'Primary source',
          moreInfo: 'More info',
          share: 'Share',
          saveProgram: 'Follow program',
          savedProgram: 'Program followed',
          addToPlan: dict.saveSchedule,
          inPlan: 'In plan',
          openPlace: 'Open place',
          openOrganizer: 'Open organizer',
          trust: 'Trust',
          verified: 'Verified',
          age: 'Age',
          time: 'Time',
          duration: 'Duration',
          withAdult: 'With adult',
          dateHeading: 'When it happens',
          sourceHeading: 'Why this page is worth sharing'
        };
  const audienceLabels = {
    it: {
      kids: 'Bambini',
      families: 'Famiglie',
      mixed: 'Misto',
      adults: 'Adulti'
    },
    en: {
      kids: 'Kids',
      families: 'Families',
      mixed: 'Mixed',
      adults: 'Adults'
    }
  } as const;
  const attendanceLabels = {
    it: {
      drop_in: 'Drop-in',
      trial: 'Prova',
      cycle: 'Ciclo',
      term: 'Trimestre'
    },
    en: {
      drop_in: 'Drop-in',
      trial: 'Trial',
      cycle: 'Cycle',
      term: 'Term'
    }
  } as const;

  return (
    <div className="stack-list">
      <section className="detail-hero profile-hero">
        <div className="panel profile-main">
          <div className="profile-main-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{occurrence.title[locale]}</h1>
            <p className="lead">{program?.summary[locale] ?? copy.summaryFallback}</p>
            <div className="profile-chip-row">
              <ServerChip tone="meta">{resolved.style.name[locale]}</ServerChip>
              <ServerChip tone="meta">{ageLabel}</ServerChip>
              <ServerChip tone="meta">{audienceLabels[locale][occurrence.audience]}</ServerChip>
              <ServerChip tone="meta">{attendanceLabels[locale][occurrence.attendanceModel]}</ServerChip>
              {occurrence.guardianRequired ? <ServerChip tone="meta">{copy.withAdult}</ServerChip> : null}
            </div>
            <div className="profile-meta">
              <p className="muted">
                <strong>{copy.time}:</strong> {formatSessionTime(occurrence.startAt, locale)}
              </p>
              <p className="muted">
                <strong>{copy.place}:</strong> {resolved.place.name}
                {neighborhood ? ` · ${neighborhood.name[locale]}` : ''}
              </p>
              <p className="muted">{resolved.place.address}</p>
            </div>
            <div className="site-actions profile-links">
              <ShareButton
                url={shareUrl}
                title={`${occurrence.title[locale]} · chefamo`}
                text={shareText}
                locale={locale}
                label={copy.share}
                tracking={{
                  occurrenceId: occurrence.id,
                  citySlug: occurrence.citySlug,
                  categorySlug: occurrence.categorySlug,
                  venueSlug: occurrence.placeSlug
                }}
              />
              <BookingLink
                citySlug={occurrence.citySlug}
                categorySlug={occurrence.categorySlug}
                venueSlug={occurrence.placeSlug}
                sessionId={occurrence.id}
                sourceUrl={occurrence.sourceUrl}
                target={resolved.target}
                label={copy.moreInfo}
              />
              <ScheduleButton
                occurrenceId={occurrence.id}
                locale={locale}
                signedInEmail={user?.email}
                label={copy.addToPlan}
                savedLabel={copy.inPlan}
                runtimeCapabilities={runtimeCapabilities}
              />
              <FavoriteButton
                entitySlug={occurrence.programSlug}
                entityType="program"
                locale={locale}
                signedInEmail={user?.email}
                label={copy.saveProgram}
                savedLabel={copy.savedProgram}
                runtimeCapabilities={runtimeCapabilities}
              />
            </div>
          </div>
        </div>
        <div className="profile-side-stack">
          <div className="panel profile-side">
            <p className="eyebrow">{copy.trust}</p>
            <h2>{copy.sourceHeading}</h2>
            <p className="muted">
              {copy.source}:{' '}
              <ServerLink href={occurrence.sourceUrl} target="_blank" rel="noreferrer" className="inline-link">
                {occurrence.sourceUrl}
              </ServerLink>
            </p>
            <p className="muted">
              {copy.verified} · {formatVerifiedAt(occurrence.lastVerifiedAt, locale)}
            </p>
            <div className="classes-stat-grid profile-metrics">
              <div className="classes-stat-card">
                <strong>{start.toFormat(locale === 'it' ? 'd LLL' : 'LLL d')}</strong>
                <span>{copy.dateHeading}</span>
              </div>
              <div className="classes-stat-card">
                <strong>
                  {start.toFormat('HH:mm')} - {end.toFormat('HH:mm')}
                </strong>
                <span>{copy.time}</span>
              </div>
              <div className="classes-stat-card">
                <strong>{durationMinutes} min</strong>
                <span>{copy.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{locale === 'it' ? 'Contesto utile' : 'Useful context'}</h2>
          </div>
        </div>
        <div className="stack-list">
          <p className="muted">
            <strong>{copy.organizer}:</strong>{' '}
            <ServerLink href={`/${locale}/${citySlug}/organizers/${resolved.organizer.slug}`} className="inline-link">
              {resolved.organizer.name}
            </ServerLink>
          </p>
          <p className="muted">
            <strong>{copy.place}:</strong>{' '}
            <ServerLink href={`/${locale}/${citySlug}/places/${resolved.place.slug}`} className="inline-link">
              {resolved.place.name}
            </ServerLink>
          </p>
          <p className="muted">
            <strong>{copy.age}:</strong> {ageLabel}
          </p>
          <div className="profile-links">
            <ServerButtonLink href={`/${locale}/${citySlug}/places/${resolved.place.slug}`} className="button-secondary">
              {copy.openPlace}
            </ServerButtonLink>
            <ServerButtonLink href={`/${locale}/${citySlug}/organizers/${resolved.organizer.slug}`} className="button-secondary">
              {copy.openOrganizer}
            </ServerButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
