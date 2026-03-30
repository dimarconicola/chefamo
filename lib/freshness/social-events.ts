import { createHash } from 'node:crypto';

import { DateTime } from 'luxon';

import { chefamoPlaces as seedPlaces, chefamoPrograms as seedPrograms } from '@/lib/catalog/chefamo-seed';
import type {
  AttendanceModel,
  KidsAgeBand,
  Level,
  LocalizedText,
  Program,
  Session,
  SessionAudience,
  SessionFormat
} from '@/lib/catalog/types';

export type SourceEventCandidatePayload = Session & {
  confidence: number;
  detectedText: string;
};

type SourceEventDefaults = {
  programSlug: string;
  citySlug: string;
  venueSlug: string;
  instructorSlug: string;
  categorySlug: string;
  styleSlug: string;
  bookingTargetSlug: string;
  level: Level;
  language: string;
  format: SessionFormat;
  audience: SessionAudience;
  attendanceModel: AttendanceModel;
  durationMinutes: number;
  ageMin?: number;
  ageMax?: number;
  ageBand?: KidsAgeBand;
  guardianRequired?: boolean;
  title: LocalizedText;
  keywords: string[];
};

type SourceEventOverride = Partial<
  Omit<
    SourceEventDefaults,
    | 'programSlug'
    | 'citySlug'
    | 'venueSlug'
    | 'instructorSlug'
    | 'categorySlug'
    | 'styleSlug'
    | 'bookingTargetSlug'
    | 'level'
    | 'language'
    | 'format'
    | 'audience'
    | 'attendanceModel'
    | 'title'
  >
> & {
  programSlug: string;
  title?: LocalizedText;
  keywords?: string[];
  bookingTargetSlug?: string;
};

const monthMap: Record<string, number> = {
  january: 1,
  jan: 1,
  gennaio: 1,
  february: 2,
  feb: 2,
  febbraio: 2,
  march: 3,
  mar: 3,
  marzo: 3,
  april: 4,
  apr: 4,
  aprile: 4,
  may: 5,
  maggio: 5,
  june: 6,
  jun: 6,
  giugno: 6,
  july: 7,
  jul: 7,
  luglio: 7,
  august: 8,
  aug: 8,
  agosto: 8,
  september: 9,
  sep: 9,
  settembre: 9,
  october: 10,
  oct: 10,
  ottobre: 10,
  november: 11,
  nov: 11,
  novembre: 11,
  december: 12,
  dec: 12,
  dicembre: 12
};

const sourceEventOverrides: Record<string, SourceEventOverride> = {
  'https://www.instagram.com/minimupa/': {
    programSlug: 'minimupa-creative-lab',
    bookingTargetSlug: 'minimupa-booking',
    durationMinutes: 90,
    title: {
      it: 'Laboratorio creativo MiniMuPa',
      en: 'MiniMuPa Creative Lab'
    },
    keywords: ['minimupa', 'laboratorio creativo', 'laboratorio', 'family lab', 'famiglie']
  },
  'https://www.instagram.com/museomarionettepalermo/': {
    programSlug: 'marionette-weekend-show',
    bookingTargetSlug: 'museo-marionette-contact',
    durationMinutes: 60,
    title: {
      it: 'Teatro dei pupi del weekend',
      en: 'Weekend Puppet Theater'
    },
    keywords: ['marionette', 'pupi', 'spettacolo', 'famiglie']
  }
};

const normalizeSourceUrl = (raw: string) => {
  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return raw.trim();
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return raw.trim().replace(/\/$/, '');
  }
};

const stripAccents = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const canonicalText = (value: string) =>
  stripAccents(value)
    .toLowerCase()
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const searchText = (value: string) =>
  canonicalText(value)
    .replace(/[^a-z0-9\s/:.-]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractLines = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\n+/)
    .map((line) => stripAccents(line).replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const normalizeTime = (raw: string) => {
  const match = raw.match(/([0-2]?\d)\s*[:.,h]\s*([0-5]\d)/i);
  if (!match) return null;
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
};

const parseDateFromChunk = (raw: string, reference: DateTime) => {
  const text = canonicalText(raw);
  const monthMatch = text.match(
    /(\d{1,2})\s+(january|jan|gennaio|february|feb|febbraio|march|mar|marzo|april|apr|aprile|may|maggio|june|jun|giugno|july|jul|luglio|august|aug|agosto|september|sep|settembre|october|oct|ottobre|november|nov|novembre|december|dec|dicembre)(?:\s+(\d{4}))?/i
  );
  if (monthMatch) {
    const day = Number(monthMatch[1]);
    const month = monthMap[monthMatch[2]];
    const explicitYear = monthMatch[3] ? Number(monthMatch[3]) : null;
    const year = explicitYear ?? reference.year;
    let candidate = DateTime.fromObject({ year, month, day }, { zone: 'Europe/Rome' });
    if (!explicitYear && candidate < reference.minus({ days: 45 })) {
      candidate = candidate.plus({ years: 1 });
    }
    return candidate.isValid ? candidate : null;
  }

  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const explicitYear = slashMatch[3] ? Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]) : null;
    const year = explicitYear ?? reference.year;
    let candidate = DateTime.fromObject({ year, month, day }, { zone: 'Europe/Rome' });
    if (!explicitYear && candidate < reference.minus({ days: 45 })) {
      candidate = candidate.plus({ years: 1 });
    }
    return candidate.isValid ? candidate : null;
  }

  return null;
};

const parseTimeRange = (raw: string, fallbackMinutes: number) => {
  const match = raw.match(/([0-2]?\d\s*[:.,h]\s*[0-5]\d)(?:\s*(?:-|–|a|to|\/)\s*([0-2]?\d\s*[:.,h]\s*[0-5]\d))?/i);
  const start = match ? normalizeTime(match[1]) : null;
  if (!start) return null;
  const end = match?.[2] ? normalizeTime(match[2]) : null;
  const startDate = DateTime.fromFormat(start, 'HH:mm', { zone: 'Europe/Rome' });
  const endDate = end ? DateTime.fromFormat(end, 'HH:mm', { zone: 'Europe/Rome' }) : startDate.plus({ minutes: fallbackMinutes });
  return {
    start,
    end: endDate.toFormat('HH:mm')
  };
};

const buildCandidateId = (sourceUrl: string, startAt: string, title: LocalizedText) =>
  `oneoff-${createHash('sha256').update(`${normalizeSourceUrl(sourceUrl)}|${startAt}|${canonicalText(title.it)}`).digest('hex').slice(0, 18)}`;

const hasKeyword = (text: string, keywords: string[]) => {
  const normalized = searchText(text);
  return keywords.some((keyword) => normalized.includes(searchText(keyword)));
};

const uniqueStrings = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const defaultDurationForProgram = (program: Program) => {
  if (program.scheduleKind === 'evergreen') return 120;
  if (program.attendanceModel === 'cycle') return 90;
  return 60;
};

const buildSeedKeywords = (title: LocalizedText, audience: SessionAudience, placeName: string) => {
  const keywords = [title.it, title.en, placeName];

  if (audience === 'kids' || audience === 'families') {
    keywords.push('bimbi', 'bambini', 'kids', 'famiglie', 'family');
  }

  return uniqueStrings(keywords);
};

const sourceEventDefaults = new Map<string, SourceEventDefaults>();

for (const [rawSourceUrl, override] of Object.entries(sourceEventOverrides)) {
  const sourceUrl = normalizeSourceUrl(rawSourceUrl);
  if (!sourceUrl) continue;

  const matchingProgram = seedPrograms.find((program) => program.slug === override.programSlug);
  if (!matchingProgram) continue;

  const place = seedPlaces.find((entry) => entry.slug === matchingProgram.placeSlug);
  const title = override.title ?? matchingProgram.title;

  sourceEventDefaults.set(sourceUrl, {
    programSlug: matchingProgram.slug,
    citySlug: matchingProgram.citySlug,
    venueSlug: matchingProgram.placeSlug,
    instructorSlug: matchingProgram.organizerSlug,
    categorySlug: matchingProgram.categorySlug,
    styleSlug: matchingProgram.styleSlug,
    bookingTargetSlug: override.bookingTargetSlug ?? matchingProgram.bookingTargetSlug,
    level: matchingProgram.level,
    language: matchingProgram.language,
    format: matchingProgram.format,
    audience: matchingProgram.audience,
    attendanceModel: matchingProgram.attendanceModel,
    durationMinutes: override.durationMinutes ?? defaultDurationForProgram(matchingProgram),
    ageMin: override.ageMin ?? matchingProgram.ageMin,
    ageMax: override.ageMax ?? matchingProgram.ageMax,
    ageBand: override.ageBand ?? matchingProgram.ageBand,
    guardianRequired: override.guardianRequired ?? matchingProgram.guardianRequired,
    title,
    keywords: uniqueStrings(override.keywords ?? buildSeedKeywords(title, matchingProgram.audience, place?.name ?? ''))
  });
}

export const extractSourceEventCandidates = (sourceUrl: string, html: string, referenceIso = new Date().toISOString()): SourceEventCandidatePayload[] => {
  const defaults = sourceEventDefaults.get(normalizeSourceUrl(sourceUrl));
  if (!defaults) return [];

  const reference = DateTime.fromISO(referenceIso, { zone: 'Europe/Rome' });
  const lines = extractLines(html);
  const candidates = new Map<string, SourceEventCandidatePayload>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const windowText = [lines[index - 1], line, lines[index + 1], lines[index + 2]].filter(Boolean).join(' ');
    if (!hasKeyword(windowText, defaults.keywords)) continue;

    const date = parseDateFromChunk(windowText, reference);
    const timeRange = parseTimeRange(windowText, defaults.durationMinutes);
    if (!date || !timeRange) continue;

    const startAt = date.set({
      hour: Number(timeRange.start.slice(0, 2)),
      minute: Number(timeRange.start.slice(3, 5)),
      second: 0,
      millisecond: 0
    });
    const endAt = date.set({
      hour: Number(timeRange.end.slice(0, 2)),
      minute: Number(timeRange.end.slice(3, 5)),
      second: 0,
      millisecond: 0
    });

    const sessionId = buildCandidateId(sourceUrl, startAt.toISO() ?? startAt.toString(), defaults.title);

    candidates.set(sessionId, {
      id: sessionId,
      programSlug: defaults.programSlug,
      citySlug: defaults.citySlug,
      placeSlug: defaults.venueSlug,
      organizerSlug: defaults.instructorSlug,
      venueSlug: defaults.venueSlug,
      instructorSlug: defaults.instructorSlug,
      categorySlug: defaults.categorySlug,
      styleSlug: defaults.styleSlug,
      title: defaults.title,
      startAt: startAt.toISO() ?? '',
      endAt: endAt.toISO() ?? '',
      level: defaults.level,
      language: defaults.language,
      format: defaults.format,
      bookingTargetSlug: defaults.bookingTargetSlug,
      sourceUrl,
      lastVerifiedAt: reference.toISO() ?? new Date().toISOString(),
      verificationStatus: 'verified',
      audience: defaults.audience,
      attendanceModel: defaults.attendanceModel,
      ageMin: defaults.ageMin,
      ageMax: defaults.ageMax,
      ageBand: defaults.ageBand,
      guardianRequired: defaults.guardianRequired,
      confidence: 0.88,
      detectedText: windowText
    });
  }

  return Array.from(candidates.values()).filter((candidate) => Boolean(candidate.startAt && candidate.endAt));
};

export const mapSourceEventCandidateToSession = (payload: SourceEventCandidatePayload): Session => ({
  id: payload.id,
  programSlug: payload.programSlug,
  citySlug: payload.citySlug,
  placeSlug: payload.placeSlug,
  organizerSlug: payload.organizerSlug,
  venueSlug: payload.venueSlug,
  instructorSlug: payload.instructorSlug,
  categorySlug: payload.categorySlug,
  styleSlug: payload.styleSlug,
  title: payload.title,
  startAt: payload.startAt,
  endAt: payload.endAt,
  level: payload.level,
  language: payload.language,
  format: payload.format,
  bookingTargetSlug: payload.bookingTargetSlug,
  sourceUrl: payload.sourceUrl,
  lastVerifiedAt: payload.lastVerifiedAt,
  verificationStatus: payload.verificationStatus,
  audience: payload.audience,
  attendanceModel: payload.attendanceModel,
  ageMin: payload.ageMin,
  ageMax: payload.ageMax,
  ageBand: payload.ageBand,
  guardianRequired: payload.guardianRequired,
  priceNote: undefined
});
