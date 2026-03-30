import { createHash } from 'node:crypto';

export type ParsedSessionSignal = {
  title: string;
  weekday: string;
  startTime: string;
  endTime: string | null;
  confidence: 'high' | 'medium';
  signature: string;
};

export type AdapterAutoReverifyThresholds = {
  minSignals: number;
  minMatches: number;
  minMatchRatio: number;
};

export type AdapterAutoReverifyEvaluation = {
  accepted: boolean;
  reason: 'accepted' | 'insufficient_signals' | 'insufficient_matches' | 'low_match_ratio';
  parsedSignals: number;
  matchedSignals: number;
  matchRatio: number;
  thresholds: AdapterAutoReverifyThresholds;
};

type SourceAdapter = {
  id: string;
  matches: (sourceUrl: string) => boolean;
  parse: (html: string) => ParsedSessionSignal[];
  thresholds: AdapterAutoReverifyThresholds;
};

const htmlEntityMap: Record<string, string> = {
  '&nbsp;': ' ',
  '&#160;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#34;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&agrave;': 'a',
  '&Agrave;': 'A',
  '&egrave;': 'e',
  '&Egrave;': 'E',
  '&igrave;': 'i',
  '&Igrave;': 'I',
  '&ograve;': 'o',
  '&Ograve;': 'O',
  '&ugrave;': 'u',
  '&Ugrave;': 'U'
};

const decodeHtml = (value: string) => {
  let output = value;
  for (const [key, replacement] of Object.entries(htmlEntityMap)) {
    output = output.split(key).join(replacement);
  }
  output = output.replace(/&#(\d+);/g, (_raw, code) => {
    const numeric = Number(code);
    return Number.isFinite(numeric) ? String.fromCharCode(numeric) : '';
  });
  return output;
};

const stripAccents = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const canonicalLower = (value: string) => stripAccents(value).toLowerCase().trim();

const weekdayAliases: Record<string, string> = {
  lun: 'Monday',
  lunedi: 'Monday',
  monday: 'Monday',
  mar: 'Tuesday',
  martedi: 'Tuesday',
  tuesday: 'Tuesday',
  mer: 'Wednesday',
  mercoledi: 'Wednesday',
  wednesday: 'Wednesday',
  gio: 'Thursday',
  giovedi: 'Thursday',
  thursday: 'Thursday',
  ven: 'Friday',
  venerdi: 'Friday',
  friday: 'Friday',
  sab: 'Saturday',
  sabato: 'Saturday',
  saturday: 'Saturday',
  dom: 'Sunday',
  domenica: 'Sunday',
  sunday: 'Sunday'
};

const normalizeWeekday = (raw: string) => {
  const key = canonicalLower(raw).replace(/[^a-z]/g, '');
  return weekdayAliases[key] ?? null;
};

const normalizeTime = (raw: string) => {
  const match = canonicalLower(raw).match(/([0-2]?\d)\s*[:.,h]\s*([0-5]\d)/);
  if (!match) return null;
  const hours = String(Number(match[1])).padStart(2, '0');
  return `${hours}:${match[2]}`;
};

const extractTimes = (value: string) =>
  (value.match(/([0-2]?\d)\s*[:.,h]\s*([0-5]\d)/g) ?? [])
    .map((chunk) => normalizeTime(chunk))
    .filter((item): item is string => Boolean(item));

const toTextLines = (html: string) =>
  decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<\/(p|div|li|h1|h2|h3|h4|tr|td|section|article)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const buildSignature = (title: string, weekday: string, startTime: string, endTime: string | null) =>
  createHash('sha256')
    .update(`${canonicalLower(title)}|${weekday}|${startTime}|${endTime ?? ''}`)
    .digest('hex')
    .slice(0, 24);

export const buildSessionTimeSignature = (weekday: string, startTime: string) => `${weekday}|${startTime}`;

const pushSignal = (out: ParsedSessionSignal[], payload: Omit<ParsedSessionSignal, 'signature'>) => {
  out.push({
    ...payload,
    signature: buildSignature(payload.title, payload.weekday, payload.startTime, payload.endTime)
  });
};

const dedupeSignals = (signals: ParsedSessionSignal[]) => {
  const dedup = new Map<string, ParsedSessionSignal>();
  for (const signal of signals) {
    dedup.set(signal.signature, signal);
  }
  return Array.from(dedup.values());
};

const parseStructuredSchedule = (html: string, fallbackTitle: string) => {
  const signals: ParsedSessionSignal[] = [];
  const lines = toTextLines(html);
  let currentWeekday: string | null = null;

  for (const line of lines) {
    const explicit = line.match(
      /\b(lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b[\s:,-]*([0-2]?\d[:.,h][0-5]\d)(?:\s*[-–]\s*([0-2]?\d[:.,h][0-5]\d))?\s*(.*)/i
    );
    if (explicit) {
      const weekday = normalizeWeekday(explicit[1]);
      const startTime = normalizeTime(explicit[2]);
      const endTime = explicit[3] ? normalizeTime(explicit[3]) : null;
      const title = explicit[4]?.trim() || fallbackTitle;
      if (weekday && startTime && title) {
        pushSignal(signals, {
          title,
          weekday,
          startTime,
          endTime,
          confidence: 'high'
        });
      }
      currentWeekday = weekday;
      continue;
    }

    const weekdayOnly = normalizeWeekday(line);
    if (weekdayOnly) {
      currentWeekday = weekdayOnly;
      continue;
    }

    if (!currentWeekday) continue;

    const times = extractTimes(line);
    if (times.length === 0) continue;

    const title = line.replace(/^[^A-Za-z]*([0-2]?\d[:.,h][0-5]\d)(?:\s*[-–]\s*[0-2]?\d[:.,h][0-5]\d)?\s*/i, '').trim() || fallbackTitle;
    pushSignal(signals, {
      title,
      weekday: currentWeekday,
      startTime: times[0],
      endTime: times[1] ?? null,
      confidence: 'medium'
    });
  }

  return dedupeSignals(signals);
};

const normalizeThresholds = (thresholds: AdapterAutoReverifyThresholds): AdapterAutoReverifyThresholds => ({
  minSignals: Math.max(1, Math.floor(thresholds.minSignals)),
  minMatches: Math.max(1, Math.floor(thresholds.minMatches)),
  minMatchRatio: Math.min(1, Math.max(0, thresholds.minMatchRatio))
});

export const evaluateAdapterAutoReverify = (
  thresholds: AdapterAutoReverifyThresholds,
  parsedSignals: number,
  matchedSignals: number
): AdapterAutoReverifyEvaluation => {
  const safeThresholds = normalizeThresholds(thresholds);
  const safeParsedSignals = Math.max(0, Math.floor(parsedSignals));
  const safeMatchedSignals = Math.max(0, Math.floor(matchedSignals));
  const matchRatio = safeParsedSignals > 0 ? safeMatchedSignals / safeParsedSignals : 0;

  if (safeParsedSignals < safeThresholds.minSignals) {
    return {
      accepted: false,
      reason: 'insufficient_signals',
      parsedSignals: safeParsedSignals,
      matchedSignals: safeMatchedSignals,
      matchRatio,
      thresholds: safeThresholds
    };
  }

  if (safeMatchedSignals < safeThresholds.minMatches) {
    return {
      accepted: false,
      reason: 'insufficient_matches',
      parsedSignals: safeParsedSignals,
      matchedSignals: safeMatchedSignals,
      matchRatio,
      thresholds: safeThresholds
    };
  }

  if (matchRatio < safeThresholds.minMatchRatio) {
    return {
      accepted: false,
      reason: 'low_match_ratio',
      parsedSignals: safeParsedSignals,
      matchedSignals: safeMatchedSignals,
      matchRatio,
      thresholds: safeThresholds
    };
  }

  return {
    accepted: true,
    reason: 'accepted',
    parsedSignals: safeParsedSignals,
    matchedSignals: safeMatchedSignals,
    matchRatio,
    thresholds: safeThresholds
  };
};

const adapters: SourceAdapter[] = [
  {
    id: 'planetario-program',
    matches: (sourceUrl) => canonicalLower(sourceUrl).includes('planetariopalermo.it'),
    parse: (html) => parseStructuredSchedule(html, 'Weekend Planetarium Show'),
    thresholds: {
      minSignals: 2,
      minMatches: 1,
      minMatchRatio: 0.5
    }
  },
  {
    id: 'museo-marionette-program',
    matches: (sourceUrl) => canonicalLower(sourceUrl).includes('museomarionettepalermo.it'),
    parse: (html) => parseStructuredSchedule(html, 'Weekend Puppet Theater'),
    thresholds: {
      minSignals: 2,
      minMatches: 1,
      minMatchRatio: 0.5
    }
  },
  {
    id: 'teatro-massimo-family-tour',
    matches: (sourceUrl) => canonicalLower(sourceUrl).includes('teatromassimo.it'),
    parse: (html) => parseStructuredSchedule(html, 'Family Theater Tour'),
    thresholds: {
      minSignals: 2,
      minMatches: 1,
      minMatchRatio: 0.5
    }
  }
];

export const getAdapterForSource = (sourceUrl: string) => adapters.find((adapter) => adapter.matches(sourceUrl)) ?? null;

export const parseSourceWithAdapter = (sourceUrl: string, html: string) => {
  const adapter = getAdapterForSource(sourceUrl);
  if (!adapter) {
    return {
      adapterId: null,
      thresholds: null as AdapterAutoReverifyThresholds | null,
      sessions: [] as ParsedSessionSignal[]
    };
  }

  return {
    adapterId: adapter.id,
    thresholds: adapter.thresholds,
    sessions: adapter.parse(html)
  };
};

export const normalizeWeekdayForSignals = (raw: string) => normalizeWeekday(raw);
