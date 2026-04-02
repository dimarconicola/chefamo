import { DateTime } from 'luxon';

export interface SavedScheduleCalendarEntry {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  href: string;
  placeName: string;
  placeAddress?: string;
  organizerName?: string;
  sourceUrl?: string;
}

export interface BuildSavedScheduleIcsInput {
  calendarName: string;
  calendarDescription: string;
  siteOrigin: string;
  events: SavedScheduleCalendarEntry[];
}

const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

const formatUtc = (value: string) => DateTime.fromISO(value, { setZone: true }).toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");

const foldIcsLine = (line: string) => {
  const chunks: string[] = [];
  let current = '';

  for (const char of line) {
    if ((current + char).length > 75) {
      chunks.push(current);
      current = char;
    } else {
      current += char;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.join('\r\n ');
};

const toAbsoluteUrl = (siteOrigin: string, href: string) => new URL(href, siteOrigin).toString();

const formatLocation = (event: SavedScheduleCalendarEntry) => {
  const pieces = [event.placeName, event.placeAddress].filter(Boolean);
  return pieces.join(' - ');
};

export const buildSavedScheduleIcs = ({ calendarName, calendarDescription, siteOrigin, events }: BuildSavedScheduleIcsInput) => {
  const timestamp = formatUtc(new Date().toISOString());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chefamo//Saved schedule//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALDESC:${escapeIcsText(calendarDescription)}`
  ];

  for (const event of events) {
    const absoluteUrl = toAbsoluteUrl(siteOrigin, event.href);
    const descriptionLines = [
      calendarDescription,
      event.organizerName ? `Organizzatore: ${event.organizerName}` : null,
      event.placeName ? `Luogo: ${event.placeName}` : null,
      event.placeAddress ? `Indirizzo: ${event.placeAddress}` : null,
      event.sourceUrl ? `Fonte: ${event.sourceUrl}` : null,
      `Apri su Chefamo: ${absoluteUrl}`
    ].filter(Boolean);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(`chefamo-${event.id}@chefamo.vercel.app`)}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${formatUtc(event.startAt)}`,
      `DTEND:${formatUtc(event.endAt)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `LOCATION:${escapeIcsText(formatLocation(event))}`,
      `DESCRIPTION:${escapeIcsText(descriptionLines.join('\n'))}`,
      `URL:${absoluteUrl}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.map((line) => foldIcsLine(line)).join('\r\n') + '\r\n';
};
