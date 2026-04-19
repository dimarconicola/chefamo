import { DateTime } from 'luxon';

import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ShareButton } from '@/components/share/ShareButton';
import { ScheduleButton } from '@/components/state/ScheduleButton';
import { getOccurrencePath } from '@/lib/catalog/occurrence-links';
import { getPriceNoteForLocale } from '@/lib/catalog/price-notes';
import { ServerChip, ServerLink } from '@/components/ui/server';
import { buildFallbackOccurrenceCardData } from '@/lib/catalog/session-card-fallback';
import type { ResolvedOccurrenceCardData } from '@/lib/catalog/session-card-data';
import type { Locale, Occurrence } from '@/lib/catalog/types';
import type { RuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatSessionTime } from '@/lib/ui/format';
import { BookingLink } from './BookingLink';

interface SessionCardProps {
  session: Occurrence;
  locale: Locale;
  resolved?: ResolvedOccurrenceCardData;
  signedInEmail?: string;
  scheduleLabel: string;
  runtimeCapabilities?: RuntimeCapabilities;
}

export function SessionCard({ session, locale, resolved, signedInEmail, scheduleLabel, runtimeCapabilities }: SessionCardProps) {
  const resolvedCard = resolved ?? buildFallbackOccurrenceCardData(session);
  const { place, organizer, style, target } = resolvedCard;
  const labels =
    locale === 'it'
      ? {
          verified: 'Verificato',
          stale: 'Da aggiornare',
          share: 'Condividi',
          moreInfo: 'Più info',
          activity: 'Apri attività',
          place: 'Apri luogo',
          organizer: 'Apri organizzatore',
          level: {
            beginner: 'Principianti',
            open: 'Aperti a tutti',
            intermediate: 'Intermedio',
            advanced: 'Avanzato'
          },
          format: {
            in_person: 'In presenza',
            hybrid: 'Hybrid',
            online: 'Online'
          },
          attendance: {
            drop_in: 'Drop-in',
            trial: 'Prova',
            cycle: 'Ciclo',
            term: 'Trimestre'
          },
          price: 'Costo',
          age: 'Età',
          adultRequired: 'Con adulto',
          audience: {
            kids: 'Bambini',
            families: 'Famiglie',
            mixed: 'Misto',
            adults: 'Adulti'
          },
          ageBand: {
            '0-2': '0-2 anni',
            '3-5': '3-5 anni',
            '6-10': '6-10 anni',
            '11-14': '11-14 anni',
            'mixed-kids': '3-14 anni'
          },
          saveProgram: 'Segui programma',
          savedProgram: 'Programma seguito',
          savedSchedule: 'In piano'
        }
      : {
          verified: 'Verified',
          stale: 'Needs refresh',
          share: 'Share',
          moreInfo: 'More info',
          activity: 'Open activity',
          place: 'View place',
          organizer: 'View organizer',
          level: {
            beginner: 'Beginner',
            open: 'Open',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
          },
          format: {
            in_person: 'In person',
            hybrid: 'Hybrid',
            online: 'Online'
          },
          attendance: {
            drop_in: 'Drop-in',
            trial: 'Trial',
            cycle: 'Cycle',
            term: 'Term'
          },
          price: 'Price',
          age: 'Age',
          adultRequired: 'With adult',
          audience: {
            kids: 'Kids',
            families: 'Families',
            mixed: 'Mixed',
            adults: 'Adults'
          },
          ageBand: {
            '0-2': '0-2',
            '3-5': '3-5',
            '6-10': '6-10',
            '11-14': '11-14',
            'mixed-kids': '3-14'
          },
          saveProgram: 'Follow program',
          savedProgram: 'Program followed',
          savedSchedule: 'In plan'
        };

  const start = DateTime.fromISO(session.startAt).setZone('Europe/Rome');
  const end = DateTime.fromISO(session.endAt).setZone('Europe/Rome');
  const durationMinutes = Math.max(30, Math.round(end.diff(start, 'minutes').minutes));
  const priceNote = getPriceNoteForLocale(session.priceNote, locale);
  const activityPath = getOccurrencePath(locale, session.citySlug, session.id);
  const shareText = `${session.title[locale]} · ${formatSessionTime(session.startAt, locale)} · ${place.name}`;

  return (
    <article className="session-card panel chefamo-session-card">
      <div className="session-card-shell">
        <div className="session-time-block">
          <span className="session-time-main">{start.toFormat('HH:mm')}</span>
          <span className="session-time-sub">{durationMinutes} min</span>
        </div>
        <div className="session-card-body">
          <div className="session-card-top">
            <div>
              <p className="eyebrow">{style.name[locale]}</p>
              <h3>
                <ServerLink href={activityPath} className="inline-link">
                  {session.title[locale]}
                </ServerLink>
              </h3>
            </div>
            <span className={`status-pill ${session.verificationStatus}`}>
              {session.verificationStatus === 'verified' ? labels.verified : labels.stale}
            </span>
          </div>
          <p className="session-meta">{formatSessionTime(session.startAt, locale)}</p>
          <p className="muted">
            <ServerLink href={`/${locale}/${session.citySlug}/places/${place.slug}`} className="inline-link">
              {place.name}
            </ServerLink>{' '}
            ·{' '}
            <ServerLink href={`/${locale}/${session.citySlug}/organizers/${organizer.slug}`} className="inline-link">
              {organizer.name}
            </ServerLink>
          </p>
          <p className="muted">{place.address}</p>
          <div className="session-tags">
            <ServerChip>{style.name[locale]}</ServerChip>
            <ServerChip>{labels.audience[session.audience]}</ServerChip>
            <ServerChip>{labels.level[session.level]}</ServerChip>
            <ServerChip>{labels.attendance[session.attendanceModel]}</ServerChip>
            <ServerChip>{session.language}</ServerChip>
            <ServerChip>{labels.format[session.format]}</ServerChip>
            {session.ageBand ? <ServerChip>{labels.ageBand[session.ageBand]}</ServerChip> : null}
            {session.guardianRequired ? <ServerChip>{labels.adultRequired}</ServerChip> : null}
          </div>
          {typeof session.ageMin === 'number' && typeof session.ageMax === 'number' ? (
            <p className="muted">
              <strong>{labels.age}:</strong> {session.ageMin}-{session.ageMax}
            </p>
          ) : null}
          {priceNote ? (
            <p className="muted">
              <strong>{labels.price}:</strong> {priceNote}
            </p>
          ) : null}
          <div className="session-card-footer">
            <div className="stack-list">
              <div className="session-card-links">
                <ServerLink href={activityPath} className="inline-link">
                  {labels.activity}
                </ServerLink>
                <ServerLink href={`/${locale}/${session.citySlug}/places/${place.slug}`} className="inline-link">
                  {labels.place}
                </ServerLink>
                <ServerLink href={`/${locale}/${session.citySlug}/organizers/${organizer.slug}`} className="inline-link">
                  {labels.organizer}
                </ServerLink>
              </div>
            </div>
            <div className="session-actions">
              <ShareButton
                url={activityPath}
                title={`${session.title[locale]} · chefamo`}
                text={shareText}
                locale={locale}
                label={labels.share}
                tracking={{
                  occurrenceId: session.id,
                  citySlug: session.citySlug,
                  categorySlug: session.categorySlug,
                  venueSlug: session.placeSlug
                }}
              />
              <FavoriteButton
                entitySlug={session.programSlug}
                entityType="program"
                locale={locale}
                signedInEmail={signedInEmail}
                label={labels.saveProgram}
                savedLabel={labels.savedProgram}
                runtimeCapabilities={runtimeCapabilities}
              />
              <BookingLink
                citySlug={session.citySlug}
                categorySlug={session.categorySlug}
                venueSlug={session.placeSlug}
                sessionId={session.id}
                sourceUrl={session.sourceUrl}
                target={target}
                label={labels.moreInfo}
              />
              <ScheduleButton
                occurrenceId={session.id}
                locale={locale}
                signedInEmail={signedInEmail}
                label={scheduleLabel}
                savedLabel={labels.savedSchedule}
                runtimeCapabilities={runtimeCapabilities}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
