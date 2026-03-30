import type { AttendanceModel, Audience, KidsAgeBand, Occurrence, PlaceProfile } from '@/lib/catalog/types';

export const PRIMARY_CATEGORY_SLUGS = ['culture', 'movement', 'stem', 'reading', 'outdoors'] as const;
export const ADJACENT_CATEGORY_SLUGS = [] as const;
export const EXCLUDED_SPORT_HINTS = ['tennis', 'rugby', 'football', 'basketball', 'volleyball', 'nuoto', 'swim'] as const;

export const SUPPORTED_PLACE_PROFILES: PlaceProfile[] = [
  'arts_center',
  'club',
  'community_hub',
  'library',
  'museum',
  'park',
  'school',
  'sports_center',
  'studio',
  'association',
  'event_series'
];

export const KIDS_AGE_BANDS: Record<KidsAgeBand, { min: number; max: number }> = {
  '0-2': { min: 0, max: 2 },
  '3-5': { min: 3, max: 5 },
  '6-10': { min: 6, max: 10 },
  '11-14': { min: 11, max: 14 },
  'mixed-kids': { min: 3, max: 14 }
};

export const SUPPORTED_VENUE_PROFILES = SUPPORTED_PLACE_PROFILES;
export const isPlaceProfileSupported = (profile: PlaceProfile) => SUPPORTED_PLACE_PROFILES.includes(profile);
export const isVenueProfileSupported = isPlaceProfileSupported;

export const isCategoryInScope = (categorySlug: string) =>
  PRIMARY_CATEGORY_SLUGS.includes(categorySlug as (typeof PRIMARY_CATEGORY_SLUGS)[number]) ||
  ADJACENT_CATEGORY_SLUGS.includes(categorySlug as (typeof ADJACENT_CATEGORY_SLUGS)[number]);

export const normalizeAttendanceModel = (value: string | null | undefined): AttendanceModel => {
  if (!value) return 'drop_in';
  if (value === 'trial' || value === 'cycle' || value === 'term' || value === 'drop_in') return value;
  return 'drop_in';
};

export const deriveKidsAgeBand = (ageMin?: number, ageMax?: number): KidsAgeBand | undefined => {
  if (typeof ageMin !== 'number' || typeof ageMax !== 'number') return undefined;
  if (ageMin <= 0 && ageMax <= 2) return '0-2';
  if (ageMin >= 3 && ageMax <= 5) return '3-5';
  if (ageMin >= 6 && ageMax <= 10) return '6-10';
  if (ageMin >= 11 && ageMax <= 14) return '11-14';
  if (ageMin >= 0 && ageMax <= 14) return 'mixed-kids';
  return undefined;
};

export const inferKidsAgeRangeFromStyle = (styleSlug: string): { min?: number; max?: number; ageBand?: KidsAgeBand } => {
  const key = styleSlug.toLowerCase();
  if (key === 'kids-dance-pedagogy') return { min: 3, max: 4, ageBand: '3-5' };
  if (key === 'circomotricita') return { min: 3, max: 10, ageBand: 'mixed-kids' };
  if (key === 'kids-theater') return { min: 6, max: 10, ageBand: '6-10' };
  if (key === 'kids-contemporary-dance' || key === 'kids-dance-foundations') return { min: 6, max: 10, ageBand: '6-10' };
  if (key === 'kids-capoeira' || key === 'aerial-kids-lab' || key === 'mindful-movement-kids') return { min: 6, max: 14, ageBand: 'mixed-kids' };
  return {};
};

export const inferOccurrenceAudience = (occurrence: Pick<Occurrence, 'categorySlug' | 'styleSlug' | 'title'>): Audience => {
  if (occurrence.categorySlug === 'movement' || occurrence.categorySlug === 'stem' || occurrence.categorySlug === 'reading') return 'kids';
  const style = occurrence.styleSlug.toLowerCase();
  if (style.includes('kids') || style.includes('bimbi')) return 'kids';
  const title = `${occurrence.title.en} ${occurrence.title.it}`.toLowerCase();
  if (title.includes('kids') || title.includes('bimbi') || title.includes('bambin')) return 'kids';
  if (occurrence.categorySlug === 'culture' || occurrence.categorySlug === 'outdoors') return 'families';
  return 'mixed';
};

export const inferSessionAudience = inferOccurrenceAudience;

export const isOccurrenceInScope = (occurrence: Pick<Occurrence, 'categorySlug' | 'title' | 'attendanceModel' | 'ageMax'>) => {
  if (!isCategoryInScope(occurrence.categorySlug)) return false;
  const title = `${occurrence.title.en} ${occurrence.title.it}`.toLowerCase();
  if (EXCLUDED_SPORT_HINTS.some((hint) => title.includes(hint))) return false;
  if (occurrence.attendanceModel === 'term' && typeof occurrence.ageMax === 'number' && occurrence.ageMax > 14) return false;
  if (typeof occurrence.ageMax === 'number' && occurrence.ageMax > 14) return false;
  return true;
};

export const isSessionInScope = isOccurrenceInScope;
