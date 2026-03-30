import { DateTime } from 'luxon';

import { FavoriteButton } from '@/components/state/FavoriteButton';
import { ScheduleButton } from '@/components/state/ScheduleButton';
import { getPriceNoteForLocale } from '@/lib/catalog/price-notes';
import { ServerChip, ServerLink } from '@/components/ui/server';
import type { ResolvedOccurrenceCardData } from '@/lib/catalog/session-card-data';
import type { Locale, Occurrence } from '@/lib/catalog/types';
import type { RuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatSessionTime } from '@/lib/ui/format';
import { BookingLink } from './BookingLink';

interface SessionCardProps {
  session: Occurrence;
  locale: Locale;
  resolved: ResolvedOccurrenceCardData;
  signedInEmail?: string;
  scheduleLabel: string;
  runtimeCapabilities?: RuntimeCapabilities;
}

export function SessionCard({ session, locale, resolved, signedInEmail, scheduleLabel, runtimeCapabilities }: SessionCardProps) {
  const { place, organizer, style, target } = resolved;
  const labels =
    locale === 'it'
      ? {
          verified: 'Verificato',
          stale: 'Da aggiornare',
          bookNow: 'Apri dettagli',
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
          price: 'Costo',
          saveProgram: 'Segui programma',
          savedProgram: 'Programma seguito',
          savedSchedule: 'In piano'
        }
      : {
          verified: 'Verified',
          stale: 'Needs refresh',
          bookNow: 'Open details',
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
          price: 'Price',
          saveProgram: 'Follow program',
          savedProgram: 'Program followed',
          savedSchedule: 'In plan'
        };

  const start = DateTime.fromISO(session.startAt).setZone('Europe/Rome');
  const end = DateTime.fromISO(session.endAt).setZone('Europe/Rome');
  const durationMinutes = Math.max(30, Math.round(end.diff(start, 'minutes').minutes));
  const priceNote = getPriceNoteForLocale(session.priceNote, locale);

  return (
    <article className="session-card panel">
      <div className="session-card-shell">
        <div className="session-time-block">
          <span className="session-time-main">{start.toFormat('HH:mm')}</span>
          <span className="session-time-sub">{durationMinutes} min</span>
        </div>
        <div className="session-card-body">
          <div className="session-card-top">
            <div>
              <p className="eyebrow">{style.name[locale]}</p>
              <h3>{session.title[locale]}</h3>
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
            <ServerChip>{labels.level[session.level]}</ServerChip>
            <ServerChip>{session.language}</ServerChip>
            <ServerChip>{labels.format[session.format]}</ServerChip>
            {session.ageBand ? <ServerChip>{session.ageBand}</ServerChip> : null}
          </div>
          {priceNote ? (
            <p className="muted">
              <strong>{labels.price}:</strong> {priceNote}
            </p>
          ) : null}
          <div className="session-card-footer">
            <div className="stack-list">
              <div className="session-card-links">
                <ServerLink href={`/${locale}/${session.citySlug}/places/${place.slug}`} className="inline-link">
                  {labels.place}
                </ServerLink>
                <ServerLink href={`/${locale}/${session.citySlug}/organizers/${organizer.slug}`} className="inline-link">
                  {labels.organizer}
                </ServerLink>
              </div>
            </div>
            <div className="session-actions">
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
                locale={locale}
                citySlug={session.citySlug}
                categorySlug={session.categorySlug}
                venueSlug={session.placeSlug}
                sessionId={session.id}
                target={target}
                label={labels.bookNow}
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
