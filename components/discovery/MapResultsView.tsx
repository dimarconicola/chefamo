'use client';

import NextLink from 'next/link';
import dynamic from 'next/dynamic';

import { SessionCard } from '@/components/discovery/SessionCard';
import type { ResolvedSessionCardData } from '@/lib/catalog/session-card-data';
import type { Locale, Session, Venue } from '@/lib/catalog/types';
import type { RuntimeCapabilities } from '@/lib/runtime/capabilities';

const MapPanel = dynamic(() => import('@/components/discovery/MapPanel').then((module) => module.MapPanel), {
  ssr: false
});

interface MapResultsViewProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  bounds: [number, number, number, number];
  visibleVenues: Venue[];
  pagedSessions: Session[];
  resolvedSessionCards: Record<string, ResolvedSessionCardData>;
  signedInEmail?: string;
  scheduleLabel: string;
  runtimeCapabilities: RuntimeCapabilities;
  noResultsLabel: string;
}

export function MapResultsView({
  locale,
  citySlug,
  cityName,
  bounds,
  visibleVenues,
  pagedSessions,
  resolvedSessionCards,
  signedInEmail,
  scheduleLabel,
  runtimeCapabilities,
  noResultsLabel
}: MapResultsViewProps) {
  const labels =
    locale === 'it'
      ? {
          studios: 'Studi',
          studiosOverview: 'Tutti gli studi visibili',
          visibleClasses: 'Classi visibili',
          filteredClasses: 'Lezioni filtrate'
        }
      : {
          studios: 'Studios',
          studiosOverview: 'All visible studios',
          visibleClasses: 'Visible classes',
          filteredClasses: 'Filtered classes'
        };

  const orderedVenues = [...visibleVenues].sort((left, right) => left.name.localeCompare(right.name));

  return (
    <section className="stack-list map-view-stack">
      <div className="map-fullwidth-shell">
        <MapPanel locale={locale} cityName={cityName} venues={visibleVenues} bounds={bounds} />
      </div>
      <section className="panel map-overview-panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{labels.studios}</p>
            <h2>{labels.studiosOverview}</h2>
          </div>
          <span className="meta-pill">
            {orderedVenues.length}
          </span>
        </div>
        <div className="map-venues-grid">
          {orderedVenues.map((venue) => (
            <NextLink key={venue.slug} href={`/${locale}/${citySlug}/studios/${venue.slug}`} className="map-venue-item map-venue-card">
              <strong>{venue.name}</strong>
              <span>{venue.address}</span>
            </NextLink>
          ))}
        </div>
      </section>
      <div className="stack-list">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{labels.visibleClasses}</p>
            <h2>{labels.filteredClasses}</h2>
          </div>
        </div>
        {pagedSessions.length > 0 ? (
          pagedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              locale={locale}
              resolved={resolvedSessionCards[session.id]}
              signedInEmail={signedInEmail}
              scheduleLabel={scheduleLabel}
              runtimeCapabilities={runtimeCapabilities}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>{noResultsLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}
