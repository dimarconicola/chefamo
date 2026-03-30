'use client';

import NextLink from 'next/link';
import { useMemo } from 'react';
import { DateTime } from 'luxon';

import type { Locale } from '@/lib/catalog/types';
import type { CalendarEntry } from '@/components/discovery/classes-results.types';

interface CalendarResultsViewProps {
  locale: Locale;
  citySlug: string;
  weekOffset: number;
  setWeekOffset: (updater: (value: number) => number) => void;
  calendarEntries: CalendarEntry[];
}

export function CalendarResultsView({ locale, citySlug, weekOffset, setWeekOffset, calendarEntries }: CalendarResultsViewProps) {
  const labels =
    locale === 'it'
      ? {
          calendar: 'Calendario',
          previousWeek: 'Settimana precedente',
          nextWeek: 'Settimana successiva',
          noDaySessions: 'Nessuna attività in questo giorno.',
          noWeekSessions: 'Nessuna attività disponibile questa settimana.'
        }
      : {
          calendar: 'Calendar',
          previousWeek: 'Previous week',
          nextWeek: 'Next week',
          noDaySessions: 'No activities on this day.',
          noWeekSessions: 'No activities available this week.'
        };

  const weekStart = useMemo(
    () => DateTime.now().setZone('Europe/Rome').startOf('week').plus({ weeks: weekOffset }),
    [weekOffset]
  );
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_item, index) => weekStart.plus({ days: index })), [weekStart]);
  const calendarRangeLabel = `${weekDays[0].toFormat(locale === 'it' ? 'd LLL' : 'LLL d')} - ${weekDays[6].toFormat(
    locale === 'it' ? 'd LLL' : 'LLL d'
  )}`;

  const calendarByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    weekDays.forEach((day) => {
      map.set(day.toISODate() ?? '', []);
    });

    calendarEntries.forEach((entry) => {
      const start = DateTime.fromISO(entry.startAt).setZone('Europe/Rome');
      const dayKey = start.toISODate();
      if (!dayKey || !map.has(dayKey)) return;
      map.get(dayKey)?.push(entry);
    });

    map.forEach((entries, key) => {
      map.set(
        key,
        entries.sort((left, right) => left.startAt.localeCompare(right.startAt))
      );
    });

    return map;
  }, [calendarEntries, weekDays]);

  const hasAnyCalendarSessions = useMemo(
    () => Array.from(calendarByDay.values()).some((entries) => entries.length > 0),
    [calendarByDay]
  );

  return (
    <section className="panel calendar-board">
      <div className="calendar-board-head">
        <div>
          <p className="eyebrow">{labels.calendar}</p>
          <h2>{calendarRangeLabel}</h2>
        </div>
        <div className="site-actions">
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setWeekOffset((value) => Math.max(0, value - 1))}
            disabled={weekOffset === 0}
          >
            {labels.previousWeek}
          </button>
          <button type="button" className="button button-secondary" onClick={() => setWeekOffset((value) => value + 1)}>
            {labels.nextWeek}
          </button>
        </div>
      </div>
      {hasAnyCalendarSessions ? (
        <div className="calendar-days-row">
          {weekDays.map((day) => {
            const dayKey = day.toISODate() ?? '';
            const entries = calendarByDay.get(dayKey) ?? [];
            return (
              <article key={dayKey} className="calendar-day-column">
                <div className="calendar-day-head">
                  <strong>{day.toFormat(locale === 'it' ? 'ccc d LLL' : 'ccc d LLL')}</strong>
                </div>
                <div className="calendar-day-list">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <NextLink key={entry.sessionId} href={`/${locale}/${citySlug}/places/${entry.placeSlug}`} className="calendar-session-card">
                        <span>{entry.startLabel} - {entry.endLabel}</span>
                        <strong>{entry.title}</strong>
                        <small>{entry.placeName}</small>
                      </NextLink>
                    ))
                  ) : (
                    <p className="muted calendar-empty">{labels.noDaySessions}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>{labels.noWeekSessions}</p>
        </div>
      )}
    </section>
  );
}
