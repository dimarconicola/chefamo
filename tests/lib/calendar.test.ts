import { describe, expect, it } from 'vitest';

import { buildSavedScheduleIcs } from '@/lib/calendar/ics';

describe('saved schedule calendar export', () => {
  it('builds an escaped ICS feed for saved activities', () => {
    const ics = buildSavedScheduleIcs({
      calendarName: 'Chefamo - attività salvate',
      calendarDescription: 'Le attività salvate su Chefamo.',
      siteOrigin: 'https://chefamo.vercel.app',
      events: [
        {
          id: 'occ-1',
          title: 'Laboratorio, speciale',
          startAt: '2026-04-04T15:00:00+02:00',
          endAt: '2026-04-04T16:00:00+02:00',
          href: '/it/palermo/activities/occ-1',
          placeName: 'Dudi',
          placeAddress: 'Via Quintino Sella 71, Palermo',
          organizerName: 'Giulia Agnello',
          sourceUrl: 'https://example.com'
        }
      ]
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('X-WR-CALNAME:Chefamo - attività salvate');
    expect(ics).toContain('SUMMARY:Laboratorio\\, speciale');
    expect(ics).toContain('LOCATION:Dudi - Via Quintino Sella 71\\, Palermo');
    expect(ics).toContain('URL:https://chefamo.vercel.app/it/palermo/activities/occ-1');
    expect(ics).toContain('DTSTART:20260404T130000Z');
    expect(ics).toContain('DTEND:20260404T140000Z');
  });
});
