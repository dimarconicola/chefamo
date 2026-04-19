import { chefamoOccurrences as seedOccurrences, chefamoPlaces as seedPlaces } from '@/lib/catalog/chefamo-seed';
import type { SourceCadence, SourceRegistryEntry } from '@/lib/catalog/types';

const cadenceRank: Record<SourceCadence, number> = {
  daily: 1,
  weekly: 2,
  quarterly: 3
};

const trustRank: Record<SourceRegistryEntry['trustTier'], number> = {
  tier_a: 1,
  tier_b: 2,
  tier_c: 3
};

const normalizeSourceUrl = (raw: string) => {
  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    const normalized = url.toString();
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  } catch {
    return null;
  }
};

const classifySeedSource = (
  sourceUrl: string
): Pick<SourceRegistryEntry, 'sourceType' | 'cadence' | 'trustTier' | 'notes'> => {
  const key = sourceUrl.toLowerCase();
  if (key.includes('instagram.com') || key.includes('facebook.com')) {
    return {
      sourceType: 'social',
      cadence: 'weekly',
      trustTier: 'tier_c',
      notes: 'Weekly social check for one-off events and schedule changes.'
    };
  }

  return {
    sourceType: 'official_site',
    cadence: 'daily',
    trustTier: 'tier_a',
    notes: undefined
  };
};

const palermoDiscoverySources: SourceRegistryEntry[] = [
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.palermobimbi.it',
    sourceType: 'directory',
    cadence: 'quarterly',
    trustTier: 'tier_b',
    purpose: 'discovery',
    tags: ['palermo', 'kids', 'families'],
    active: true,
    notes: 'Quarterly lead sweep for Palermo family activities and weekend programming.'
  },
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.balarm.it/laboratori-e-attivita-per-bambini-a-palermo-e-provincia-del-weekend',
    sourceType: 'directory',
    cadence: 'weekly',
    trustTier: 'tier_b',
    purpose: 'discovery',
    tags: ['palermo', 'kids', 'families', 'weekend', 'cinema'],
    active: true,
    notes: 'Weekly editorial sweep for Palermo children listings, including labs, shows, and family cinema picks.'
  },
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.cinemacitypalermo.it/programma-film/',
    sourceType: 'directory',
    cadence: 'weekly',
    trustTier: 'tier_b',
    purpose: 'discovery',
    tags: ['palermo', 'cinema', 'families', 'summer'],
    active: true,
    notes: 'Weekly scan for open-air film programming, with family-safe screenings and civic cinema events.'
  },
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.comune.palermo.it',
    sourceType: 'official_site',
    cadence: 'quarterly',
    trustTier: 'tier_b',
    purpose: 'discovery',
    tags: ['palermo', 'civic', 'families'],
    active: true,
    notes: 'Quarterly civic scan for municipal museums, libraries, and family-facing spaces.'
  },
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.instagram.com/minimupa/',
    sourceType: 'social',
    cadence: 'weekly',
    trustTier: 'tier_c',
    purpose: 'catalog',
    tags: ['palermo', 'kids', 'stem', 'social'],
    active: true,
    notes: 'Weekly social check for one-off MiniMuPa labs and family events.'
  },
  {
    citySlug: 'palermo',
    sourceUrl: 'https://www.instagram.com/museomarionettepalermo/',
    sourceType: 'social',
    cadence: 'weekly',
    trustTier: 'tier_c',
    purpose: 'catalog',
    tags: ['palermo', 'culture', 'families', 'social'],
    active: true,
    notes: 'Weekly social check for puppet theater announcements and family specials.'
  }
];

const buildSeedCatalogSources = (citySlug: string): SourceRegistryEntry[] => {
  const rows: SourceRegistryEntry[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const sourceUrl = normalizeSourceUrl(raw);
    if (!sourceUrl || seen.has(sourceUrl)) return;
    seen.add(sourceUrl);
    const profile = classifySeedSource(sourceUrl);
    rows.push({
      citySlug,
      sourceUrl,
      sourceType: profile.sourceType,
      cadence: profile.cadence,
      trustTier: profile.trustTier,
      purpose: 'catalog',
      parserAdapter: undefined,
      tags: ['catalog', citySlug],
      active: true,
      notes: profile.notes
    });
  };

  for (const place of seedPlaces) {
    if (place.citySlug !== citySlug) continue;
    push(place.sourceUrl);
  }

  for (const occurrence of seedOccurrences) {
    if (occurrence.citySlug !== citySlug) continue;
    push(occurrence.sourceUrl);
  }

  return rows;
};

const mergeSourceEntries = (entries: SourceRegistryEntry[]) => {
  const merged = new Map<string, SourceRegistryEntry>();

  for (const entry of entries) {
    const sourceUrl = normalizeSourceUrl(entry.sourceUrl);
    if (!sourceUrl) continue;
    const normalized: SourceRegistryEntry = {
      ...entry,
      sourceUrl,
      tags: Array.from(new Set(entry.tags))
    };

    const existing = merged.get(sourceUrl);
    if (!existing) {
      merged.set(sourceUrl, normalized);
      continue;
    }

    const cadence =
      cadenceRank[normalized.cadence] < cadenceRank[existing.cadence] ? normalized.cadence : existing.cadence;
    const trustTier =
      trustRank[normalized.trustTier] < trustRank[existing.trustTier] ? normalized.trustTier : existing.trustTier;
    merged.set(sourceUrl, {
      ...existing,
      cadence,
      trustTier,
      purpose: existing.purpose === 'catalog' || normalized.purpose === 'catalog' ? 'catalog' : 'discovery',
      parserAdapter: existing.parserAdapter ?? normalized.parserAdapter,
      tags: Array.from(new Set([...existing.tags, ...normalized.tags])),
      active: existing.active || normalized.active,
      notes: existing.notes ?? normalized.notes
    });
  }

  return Array.from(merged.values()).sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));
};

export const cadenceIncludes = (runCadence: SourceCadence, sourceCadence: SourceCadence) =>
  cadenceRank[sourceCadence] <= cadenceRank[runCadence];

export const getSeedSourceRegistry = (citySlug: string): SourceRegistryEntry[] => {
  const base = buildSeedCatalogSources(citySlug);
  if (citySlug !== 'palermo') return base;
  return mergeSourceEntries([...base, ...palermoDiscoverySources]);
};

export const getSourceUrlsForCadence = (entries: SourceRegistryEntry[], runCadence: SourceCadence) =>
  Array.from(
    new Set(
      entries
        .filter((entry) => entry.active && cadenceIncludes(runCadence, entry.cadence))
        .map((entry) => entry.sourceUrl)
    )
  ).sort();
