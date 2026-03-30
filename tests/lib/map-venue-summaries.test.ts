import { describe, expect, it } from 'vitest';

import { buildMapVenueSummaries } from '@/lib/map/venue-summaries';
import { createMockSession, createMockVenue } from '../setup';

describe('buildMapVenueSummaries', () => {
  it('aggregates filtered sessions into stable venue summaries', () => {
    const sessions = [
      createMockSession({
        id: 'session-a',
        venueSlug: 'venue-1',
        instructorSlug: 'organizer-1',
        styleSlug: 'guided-visit',
        bookingTargetSlug: 'direct-booking',
        startAt: '2026-03-25T08:00:00.000Z',
        endAt: '2026-03-25T09:00:00.000Z',
        title: { it: 'Visita famiglia del mattino', en: 'Morning family tour' }
      }),
      createMockSession({
        id: 'session-b',
        venueSlug: 'venue-1',
        instructorSlug: 'organizer-1',
        styleSlug: 'guided-visit',
        bookingTargetSlug: 'direct-booking',
        startAt: '2026-03-26T08:00:00.000Z',
        endAt: '2026-03-26T09:00:00.000Z',
        title: { it: 'Tour serale famiglie', en: 'Evening family tour' }
      }),
      createMockSession({
        id: 'session-c',
        venueSlug: 'venue-2',
        instructorSlug: 'organizer-2',
        styleSlug: 'hands-on-lab',
        bookingTargetSlug: 'website',
        startAt: '2026-03-25T10:00:00.000Z',
        endAt: '2026-03-25T11:00:00.000Z',
        title: { it: 'Laboratorio creativo', en: 'Creative lab' }
      })
    ];

    const summaries = buildMapVenueSummaries({
      locale: 'it',
      citySlug: 'palermo',
      sessions,
      venues: [
        createMockVenue({
          slug: 'venue-1',
          name: 'Teatro Massimo',
          bookingTargetOrder: ['direct-booking']
        }),
        createMockVenue({
          slug: 'venue-2',
          name: 'MiniMuPa',
          neighborhoodSlug: 'centre',
          geo: { lat: 38.118, lng: 13.37 },
          bookingTargetOrder: ['website']
        }),
        createMockVenue({
          slug: 'broken',
          geo: { lat: Number.NaN, lng: 181 }
        })
      ],
      neighborhoods: [
        {
          slug: 'mondello',
          citySlug: 'palermo',
          name: { it: 'Mondello', en: 'Mondello' },
          description: { it: 'Zona mare', en: 'Seaside' },
          center: { lat: 38.2, lng: 13.3 }
        },
        {
          slug: 'centre',
          citySlug: 'palermo',
          name: { it: 'Centro', en: 'Centre' },
          description: { it: 'Centro', en: 'Centre' },
          center: { lat: 38.12, lng: 13.36 }
        }
      ],
      instructors: [
        {
          slug: 'organizer-1',
          citySlug: 'palermo',
          name: 'Fondazione Teatro Massimo',
          shortBio: { it: 'Bio', en: 'Bio' },
          specialties: [],
          languages: ['it']
        },
        {
          slug: 'organizer-2',
          citySlug: 'palermo',
          name: 'MiniMuPa',
          shortBio: { it: 'Bio', en: 'Bio' },
          specialties: [],
          languages: ['it']
        }
      ],
      styles: [
        {
          slug: 'guided-visit',
          categorySlug: 'culture',
          name: { it: 'Visita guidata', en: 'Guided visit' },
          description: { it: 'Visita guidata', en: 'Guided visit' }
        },
        {
          slug: 'hands-on-lab',
          categorySlug: 'stem',
          name: { it: 'Laboratorio hands-on', en: 'Hands-on lab' },
          description: { it: 'Laboratorio hands-on', en: 'Hands-on lab' }
        }
      ],
      bookingTargets: [
        { slug: 'direct-booking', type: 'direct', label: 'Prenota', href: 'https://example.com/book' },
        { slug: 'website', type: 'website', label: 'Sito', href: 'https://example.com/studio' }
      ]
    });

    expect(summaries).toHaveLength(2);
    expect(summaries[0].venueSlug).toBe('venue-1');
    expect(summaries[0].matchingSessionCount).toBe(2);
    expect(summaries[0].nextSession?.title).toBe('Visita famiglia del mattino');
    expect(summaries[0].sessionsPreview).toHaveLength(2);
    expect(summaries[0].primaryCtaHref).toBe('https://example.com/book');
    expect(summaries[1].neighborhoodName).toBe('Centro');
  });
});
