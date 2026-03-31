import { DateTime } from 'luxon';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { ServerCardLink } from '@/components/ui/server';
import type { ResolvedOccurrenceCardData } from '@/lib/catalog/session-card-data';
import type { Locale, Occurrence } from '@/lib/catalog/types';

interface OccurrenceSpotlightCardProps {
  occurrence: Occurrence;
  resolved: ResolvedOccurrenceCardData;
  locale: Locale;
  href: string;
  tone: 'red' | 'blue' | 'yellow' | 'green';
}

const getAgeLabel = (occurrence: Occurrence, locale: Locale) => {
  if (typeof occurrence.ageMin === 'number' && typeof occurrence.ageMax === 'number') {
    return locale === 'it' ? `${occurrence.ageMin}-${occurrence.ageMax} anni` : `${occurrence.ageMin}-${occurrence.ageMax}`;
  }

  if (!occurrence.ageBand) return locale === 'it' ? 'Per famiglie' : 'Family pick';

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

  return labels[locale][occurrence.ageBand];
};

export function OccurrenceSpotlightCard({ occurrence, resolved, locale, href, tone }: OccurrenceSpotlightCardProps) {
  const start = DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome');
  const ageLabel = getAgeLabel(occurrence, locale);

  return (
    <ServerCardLink href={href} className={`chefamo-spotlight-card chefamo-tone-${tone}`}>
      <div className="chefamo-spotlight-cover">
        <span className="chefamo-spotlight-age">{ageLabel}</span>
        <div className="chefamo-spotlight-cover-copy">
          <p className="chefamo-spotlight-day">{start.toFormat(locale === 'it' ? 'ccc d LLL' : 'ccc LLL d')}</p>
          <strong>{start.toFormat('HH:mm')}</strong>
          <span>{resolved.style.name[locale]}</span>
        </div>
        <div className="chefamo-spotlight-orb chefamo-spotlight-orb-a" aria-hidden="true" />
        <div className="chefamo-spotlight-orb chefamo-spotlight-orb-b" aria-hidden="true" />
      </div>
      <div className="chefamo-spotlight-body">
        <p className="chefamo-card-kicker">{resolved.style.name[locale]}</p>
        <h3>{occurrence.title[locale]}</h3>
        <p className="chefamo-spotlight-meta">
          <PlayfulIcon name="pin" className="chefamo-inline-icon" />
          <span>{resolved.place.name}</span>
        </p>
        <p className="chefamo-spotlight-meta">
          <PlayfulIcon name="calendar" className="chefamo-inline-icon" />
          <span>{resolved.organizer.name}</span>
        </p>
        <span className="chefamo-card-link">
          {locale === 'it' ? 'Apri luogo' : 'Open place'}
          <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
        </span>
      </div>
    </ServerCardLink>
  );
}
