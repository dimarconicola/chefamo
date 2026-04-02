'use client';

import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { buildSavedScheduleIcs, type SavedScheduleCalendarEntry } from '@/lib/calendar/ics';
import { readStoredSchedule } from '@/components/state/storage';

interface SavedScheduleItem extends SavedScheduleCalendarEntry {
  meta: string;
}

interface SavedScheduleClientProps {
  signedInEmail: string;
  initialScheduleIds: string[];
  occurrences: SavedScheduleItem[];
  emptyLabel: string;
  calendarExportLabel: string;
  calendarExportHint: string;
  calendarFileName: string;
  calendarName: string;
  calendarDescription: string;
}

export function SavedScheduleClient({
  signedInEmail,
  initialScheduleIds,
  occurrences,
  emptyLabel,
  calendarExportLabel,
  calendarExportHint,
  calendarFileName,
  calendarName,
  calendarDescription
}: SavedScheduleClientProps) {
  const [scheduleIds, setScheduleIds] = useState(initialScheduleIds);

  useEffect(() => {
    const localScheduleIds = readStoredSchedule(signedInEmail);
    setScheduleIds([...new Set([...initialScheduleIds, ...localScheduleIds])]);
  }, [initialScheduleIds, signedInEmail]);

  const scheduleItems = useMemo(
    () => scheduleIds.map((id) => occurrences.find((occurrence) => occurrence.id === id)).filter(Boolean) as typeof occurrences,
    [scheduleIds, occurrences]
  );

  const downloadCalendar = () => {
    if (scheduleItems.length === 0 || typeof window === 'undefined') return;

    const ics = buildSavedScheduleIcs({
      calendarName,
      calendarDescription,
      siteOrigin: window.location.origin,
      events: scheduleItems.map((item) => ({
        id: item.id,
        title: item.title,
        startAt: item.startAt,
        endAt: item.endAt,
        href: item.href,
        placeName: item.placeName,
        placeAddress: item.placeAddress,
        organizerName: item.organizerName,
        sourceUrl: item.sourceUrl
      }))
    });

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = calendarFileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (scheduleItems.length === 0) {
    return <p className="muted saved-empty-copy">{emptyLabel}</p>;
  }

  return (
    <div className="stack-list">
      <div className="stack-list saved-schedule-actions">
        <div className="site-actions">
          <button type="button" className="button button-primary" onClick={downloadCalendar}>
            {calendarExportLabel}
          </button>
        </div>
        <p className="muted saved-calendar-hint">{calendarExportHint}</p>
      </div>
      {scheduleItems.map((item) => (
        <NextLink href={item.href} key={item.id} className="list-link">
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
        </NextLink>
      ))}
    </div>
  );
}
