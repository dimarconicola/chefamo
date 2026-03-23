'use client';

import { useEffect, useRef, useState } from 'react';

import type { Locale, Venue } from '@/lib/catalog/types';
import { env } from '@/lib/env';

interface MapPanelProps {
  locale: Locale;
  cityName: string;
  venues: Venue[];
  bounds: [number, number, number, number];
}

export function MapPanel({ locale, cityName, venues, bounds }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const hasInteractiveMap = Boolean(env.mapboxToken);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>(hasInteractiveMap ? 'loading' : 'ready');
  const labels =
    locale === 'it'
      ? {
          eyebrow: 'Map view',
          title: `${cityName} sulla mappa`,
          copy: 'Mostriamo solo studi con percorsi di prenotazione o contatto attivi.',
          loadingTitle: 'Caricamento mappa',
          loadingBody: 'Recupero tile e marker in corso.',
          staticTitle: 'Panoramica studi',
          staticBody: 'La vista mappa resta consultabile con un tracciato locale semplificato delle sedi.',
          errorTitle: 'Mappa non disponibile',
          errorBody: 'Impossibile caricare la mappa in questo momento. Riprova tra poco.'
        }
      : {
          eyebrow: 'Map view',
          title: `${cityName} on the ground`,
          copy: 'Only venues with live booking or contact paths are shown.',
          loadingTitle: 'Loading map',
          loadingBody: 'Fetching map tiles and venue markers.',
          staticTitle: 'Venue overview',
          staticBody: 'The map stays browsable with a simplified local venue layout.',
          errorTitle: 'Map unavailable',
          errorBody: 'Could not load map tiles right now. Try again shortly.'
        };

  const fallbackMarkers = venues.map((venue) => ({
    venue,
    x: ((venue.geo.lng - bounds[0]) / Math.max(bounds[2] - bounds[0], 0.0001)) * 100,
    y: (1 - (venue.geo.lat - bounds[1]) / Math.max(bounds[3] - bounds[1], 0.0001)) * 100
  }));

  useEffect(() => {
    if (!mapRef.current) return;
    if (!hasInteractiveMap) {
      return;
    }

    let mounted = true;
    let cleanup = () => {};
    setMapStatus('loading');

    void import('mapbox-gl')
      .then(({ default: mapboxgl }) => {
        if (!mounted || !mapRef.current) return;

        mapboxgl.accessToken = env.mapboxToken ?? '';
        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2],
          zoom: 11.3,
          attributionControl: false
        });

        map.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
          ],
          { padding: 28, duration: 0 }
        );

        venues.forEach((venue) => {
          new mapboxgl.Marker({ color: '#ff704a' }).setLngLat([venue.geo.lng, venue.geo.lat]).addTo(map);
        });

        map.once('load', () => {
          if (mounted) setMapStatus('ready');
        });
        map.on('error', () => {
          if (mounted) setMapStatus('error');
        });

        cleanup = () => {
          map.remove();
        };
      })
      .catch(() => {
        if (mounted) setMapStatus('error');
      });

    return () => {
      mounted = false;
      cleanup();
    };
  }, [bounds, hasInteractiveMap, venues]);
  return (
    <aside className="map-shell panel">
      <div className="map-panel-copy">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h3>{labels.title}</h3>
        <p className="muted">{labels.copy}</p>
      </div>
      <div ref={mapRef} className={`map-panel ${hasInteractiveMap && mapStatus === 'ready' ? 'map-panel-live' : 'map-panel-setup'}`}>
        {!hasInteractiveMap ? (
          <div className="map-fallback-surface" aria-label={labels.staticTitle}>
            <svg viewBox="0 0 100 100" className="map-fallback-grid" role="img" aria-hidden="true">
              <rect x="0" y="0" width="100" height="100" rx="8" />
              {fallbackMarkers.map(({ venue, x, y }) => (
                <g key={venue.slug} transform={`translate(${Math.min(Math.max(x, 6), 94)} ${Math.min(Math.max(y, 8), 92)})`}>
                  <circle r="2.7" className="map-fallback-marker" />
                  <circle r="5.5" className="map-fallback-marker-ring" />
                </g>
              ))}
            </svg>
            <div className="map-setup-state">
              <strong>{labels.staticTitle}</strong>
              <span>{labels.staticBody}</span>
            </div>
          </div>
        ) : mapStatus !== 'ready' ? (
          <div className="map-setup-state" role="status">
            <strong>
              {mapStatus === 'loading'
                ? labels.loadingTitle
                : labels.errorTitle}
            </strong>
            <span>
              {mapStatus === 'loading'
                ? labels.loadingBody
                : labels.errorBody}
            </span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
