'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { ResolvedSessionCardData } from '@/lib/catalog/session-card-data';
import type { ClassView, Locale, Session, Venue } from '@/lib/catalog/types';
import type { CalendarEntry } from '@/components/discovery/classes-results.types';

const ListResultsView = dynamic(() => import('@/components/discovery/ListResultsView').then((module) => module.ListResultsView));
const MapResultsView = dynamic(() => import('@/components/discovery/MapResultsView').then((module) => module.MapResultsView), {
  ssr: false
});
const CalendarResultsView = dynamic(
  () => import('@/components/discovery/CalendarResultsView').then((module) => module.CalendarResultsView),
  { ssr: false }
);

interface ClassesResultsClientProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  bounds: [number, number, number, number];
  initialView: ClassView;
  initialWeekOffset: number;
  visibleCount: number;
  pagedSessions: Session[];
  resolvedSessionCards: Record<string, ResolvedSessionCardData>;
  visibleVenues: Venue[];
  calendarEntries: CalendarEntry[];
  signedInEmail?: string;
  scheduleLabel: string;
  noResultsLabel: string;
  totalPages: number;
  currentPage: number;
  prevHref?: string;
  nextHref?: string;
}

export function ClassesResultsClient({
  locale,
  citySlug,
  cityName,
  bounds,
  initialView,
  initialWeekOffset,
  visibleCount,
  pagedSessions,
  resolvedSessionCards,
  visibleVenues,
  calendarEntries,
  signedInEmail,
  scheduleLabel,
  noResultsLabel,
  totalPages,
  currentPage,
  prevHref,
  nextHref
}: ClassesResultsClientProps) {
  const pathname = usePathname();
  const [view, setView] = useState<ClassView>(initialView);
  const [weekOffset, setWeekOffset] = useState(initialWeekOffset);

  const labels =
    locale === 'it'
      ? {
          list: 'Lista',
          map: 'Vista mappa',
          calendar: 'Calendario',
          studios: 'Studi',
          studiosOverview: 'Tutti gli studi visibili',
          visibleClasses: 'Classi visibili',
          filteredClasses: 'Lezioni filtrate',
          visible: 'classi visibili',
          page: 'Pagina',
          previous: 'Precedente',
          next: 'Successiva',
          previousWeek: 'Settimana precedente',
          nextWeek: 'Settimana successiva',
          noDaySessions: 'Nessuna classe in questo giorno.',
          noWeekSessions: 'Nessuna classe disponibile questa settimana.'
        }
      : {
          list: 'List',
          map: 'Map view',
          calendar: 'Calendar',
          studios: 'Studios',
          studiosOverview: 'All visible studios',
          visibleClasses: 'Visible classes',
          filteredClasses: 'Filtered classes',
          visible: 'visible classes',
          page: 'Page',
          previous: 'Previous',
          next: 'Next',
          previousWeek: 'Previous week',
          nextWeek: 'Next week',
          noDaySessions: 'No classes on this day.',
          noWeekSessions: 'No classes available this week.'
        };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = new URLSearchParams(window.location.search);
    next.set('view', view);
    if (weekOffset > 0) {
      next.set('week_offset', String(weekOffset));
    } else {
      next.delete('week_offset');
    }
    next.delete('page');
    const query = next.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [pathname, view, weekOffset]);

  return (
    <div className="stack-list">
      <section className="panel view-switcher-panel">
        <div className="view-switcher">
          <button type="button" className={`button ${view === 'list' ? 'button-primary' : 'button-ghost'}`} onClick={() => setView('list')}>
            {labels.list}
          </button>
          <button type="button" className={`button ${view === 'map' ? 'button-primary' : 'button-ghost'}`} onClick={() => setView('map')}>
            {labels.map}
          </button>
          <button type="button" className={`button ${view === 'calendar' ? 'button-primary' : 'button-ghost'}`} onClick={() => setView('calendar')}>
            {labels.calendar}
          </button>
        </div>
      </section>

      <section className="panel classes-visible-summary">
        <span className="meta-pill">
          {visibleCount} {labels.visible}
        </span>
      </section>

      {view === 'map' ? (
        <MapResultsView
          locale={locale}
          citySlug={citySlug}
          cityName={cityName}
          bounds={bounds}
          visibleVenues={visibleVenues}
          pagedSessions={pagedSessions}
          resolvedSessionCards={resolvedSessionCards}
          signedInEmail={signedInEmail}
          scheduleLabel={scheduleLabel}
          noResultsLabel={noResultsLabel}
        />
      ) : null}

      {view === 'list' ? (
        <ListResultsView
          locale={locale}
          pagedSessions={pagedSessions}
          resolvedSessionCards={resolvedSessionCards}
          signedInEmail={signedInEmail}
          scheduleLabel={scheduleLabel}
          noResultsLabel={noResultsLabel}
          totalPages={totalPages}
          currentPage={currentPage}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      ) : null}

      {view === 'calendar' ? (
        <CalendarResultsView locale={locale} citySlug={citySlug} weekOffset={weekOffset} setWeekOffset={setWeekOffset} calendarEntries={calendarEntries} />
      ) : null}
    </div>
  );
}
