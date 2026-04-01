export type Locale = 'en' | 'it';
export type CityStatus = 'seed' | 'private_preview' | 'public';
export type CategoryVisibility = 'hidden' | 'beta' | 'live';
export type VerificationStatus = 'verified' | 'stale' | 'hidden';
export type ActivityFormat = 'in_person' | 'online' | 'hybrid';
export type SessionFormat = ActivityFormat;
export type Level = 'beginner' | 'open' | 'intermediate' | 'advanced';
export type Audience = 'adults' | 'kids' | 'families' | 'mixed';
export type SessionAudience = Audience;
export type AttendanceModel = 'drop_in' | 'trial' | 'cycle' | 'term';
export type KidsAgeBand = '0-2' | '3-5' | '6-10' | '11-14' | 'mixed-kids';
export type TimeBucket = 'early' | 'morning' | 'midday' | 'evening';
export type DatePreset = 'today' | 'tomorrow' | 'weekend' | 'week';
export type WeekdayFilter = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ActivityView = 'list' | 'map' | 'calendar';
export type ClassView = ActivityView;
export type SourceCadence = 'daily' | 'weekly' | 'quarterly';
export type SourceTrustTier = 'tier_a' | 'tier_b' | 'tier_c';
export type SourcePurpose = 'catalog' | 'discovery';
export type DiscoveryLeadStatus = 'new' | 'reviewed' | 'imported' | 'rejected';
export type ReviewStatus = 'new' | 'reviewing' | 'approved' | 'rejected' | 'imported' | 'resolved';
export type PlaceProfile =
  | 'arts_center'
  | 'association'
  | 'club'
  | 'community_hub'
  | 'event_series'
  | 'library'
  | 'museum'
  | 'park'
  | 'school'
  | 'sports_center'
  | 'studio';
export type VenueProfile = PlaceProfile;
export type ProgramScheduleKind = 'recurring' | 'seasonal' | 'variable' | 'evergreen';
export type EnvironmentFit = 'indoor' | 'outdoor' | 'mixed';

export type LocalizedText = Record<Locale, string>;
export type PartialLocalizedText = Partial<Record<Locale, string>>;

export interface City {
  slug: string;
  name: LocalizedText;
  countryCode: string;
  timezone: string;
  status: CityStatus;
  hero: LocalizedText;
  bounds: [number, number, number, number];
}

export interface Neighborhood {
  slug: string;
  citySlug: string;
  name: LocalizedText;
  description: LocalizedText;
  center: { lat: number; lng: number };
}

export interface ActivityCategory {
  slug: string;
  citySlug: string;
  name: LocalizedText;
  description: LocalizedText;
  visibility: CategoryVisibility;
  heroMetric: LocalizedText;
}

export interface Style {
  slug: string;
  categorySlug: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface OrganizerImage {
  url: string;
  alt: LocalizedText;
  sourceUrl: string;
  lastVerifiedAt: string;
}

export interface OrganizerSocialLink {
  type: 'instagram' | 'facebook' | 'website';
  label: LocalizedText;
  href: string;
  sourceUrl: string;
  lastVerifiedAt: string;
}

export interface Organizer {
  slug: string;
  citySlug: string;
  name: string;
  shortBio: LocalizedText;
  specialties: string[];
  languages: string[];
  headshot?: OrganizerImage;
  socialLinks?: OrganizerSocialLink[];
}

export interface BookingTarget {
  slug: string;
  type: 'direct' | 'platform' | 'whatsapp' | 'phone' | 'email' | 'website';
  label: string;
  href: string;
}

export interface PlaceImage {
  url: string;
  alt: LocalizedText;
  sourceUrl: string;
  lastVerifiedAt: string;
}

export interface Place {
  slug: string;
  citySlug: string;
  neighborhoodSlug: string;
  name: string;
  tagline: LocalizedText;
  description: LocalizedText;
  address: string;
  geo: { lat: number; lng: number };
  amenities: string[];
  languages: string[];
  styleSlugs: string[];
  categorySlugs: string[];
  bookingTargetOrder: string[];
  freshnessNote: LocalizedText;
  sourceUrl: string;
  lastVerifiedAt: string;
  coverImage?: PlaceImage;
  profile?: PlaceProfile;
  environment?: EnvironmentFit;
  goodAnytime?: boolean;
  accessibilityNote?: PartialLocalizedText;
}

export interface Program {
  slug: string;
  citySlug: string;
  placeSlug: string;
  organizerSlug: string;
  categorySlug: string;
  styleSlug: string;
  title: LocalizedText;
  summary: LocalizedText;
  level: Level;
  language: string;
  format: ActivityFormat;
  bookingTargetSlug: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  audience: Audience;
  attendanceModel: AttendanceModel;
  ageMin?: number;
  ageMax?: number;
  ageBand?: KidsAgeBand;
  guardianRequired?: boolean;
  priceNote?: PartialLocalizedText;
  scheduleKind: ProgramScheduleKind;
  occurrenceCount?: number;
  venueSlug: string;
  instructorSlug: string;
}

export interface Occurrence {
  id: string;
  programSlug: string;
  citySlug: string;
  placeSlug: string;
  organizerSlug: string;
  categorySlug: string;
  styleSlug: string;
  title: LocalizedText;
  startAt: string;
  endAt: string;
  level: Level;
  language: string;
  format: ActivityFormat;
  bookingTargetSlug: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  audience: Audience;
  attendanceModel: AttendanceModel;
  ageMin?: number;
  ageMax?: number;
  ageBand?: KidsAgeBand;
  guardianRequired?: boolean;
  priceNote?: PartialLocalizedText;
  venueSlug: string;
  instructorSlug: string;
}

export type Instructor = Organizer;
export type InstructorImage = OrganizerImage;
export type InstructorSocialLink = OrganizerSocialLink;
export type Venue = Place;
export type VenueImage = PlaceImage;
export type Session = Occurrence;

export interface EditorialCollection {
  slug: string;
  citySlug: string;
  title: LocalizedText;
  description: LocalizedText;
  cta: LocalizedText;
  kind: 'rule' | 'editorial';
}

export interface ClaimSubmission {
  id?: string;
  placeSlug: string;
  studioSlug?: string;
  locale: Locale;
  name: string;
  email: string;
  role: string;
  notes: string;
  reviewStatus?: ReviewStatus;
  assignedTo?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface DigestSubscription {
  email: string;
  locale: Locale;
  citySlug: string;
  preferences: string[];
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  homeCitySlug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundEvent {
  occurrenceId?: string;
  sessionId?: string;
  programSlug?: string;
  placeSlug: string;
  venueSlug?: string;
  citySlug: string;
  categorySlug: string;
  eventKind?: 'outbound' | 'share';
  shareMethod?: 'native' | 'copy';
  targetType: BookingTarget['type'];
  href: string;
  createdAt: string;
}

export interface DiscoveryFilters {
  date?: DatePreset;
  weekday?: WeekdayFilter;
  time_bucket?: TimeBucket;
  time_buckets?: TimeBucket[];
  category?: string;
  style?: string;
  level?: Level;
  language?: string;
  neighborhood?: string;
  format?: ActivityFormat;
  open_now?: 'true';
  drop_in?: 'true';
  age_band?: KidsAgeBand;
  audience?: Audience;
  view?: ActivityView;
}

export interface CalendarSubmission {
  id?: string;
  locale: Locale;
  citySlug: string;
  submitterType: 'place' | 'organizer' | 'studio' | 'teacher';
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  sourceUrls: string[];
  scheduleText: string;
  consent: boolean;
  reviewStatus?: ReviewStatus;
  assignedTo?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ImportBatch {
  id: string;
  citySlug: string;
  locale: Locale;
  fileName: string;
  sourceLabel?: string;
  csvContent: string;
  rowsCount: number;
  errorsCount: number;
  warningsCount: number;
  validationSummary: Record<string, unknown>;
  reviewStatus: ReviewStatus;
  assignedTo?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  importedAt?: string;
  createdAt: string;
}

export interface SourceRegistryEntry {
  citySlug: string;
  sourceUrl: string;
  sourceType: 'official_site' | 'events_calendar' | 'directory' | 'social' | 'community_board';
  cadence: SourceCadence;
  trustTier: SourceTrustTier;
  purpose: SourcePurpose;
  parserAdapter?: string;
  tags: string[];
  active: boolean;
  notes?: string;
  lastCheckedAt?: string;
  nextCheckAt?: string;
}

export interface DiscoveryLead {
  id?: string;
  citySlug: string;
  sourceUrl: string;
  title: string;
  snippet?: string;
  discoveredFromUrl: string;
  status: DiscoveryLeadStatus;
  assignedTo?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  confidence: number;
  tags: string[];
  lastSeenAt: string;
  createdAt: string;
}

export interface FreshnessRunSourceCheck {
  runId: string;
  citySlug: string;
  sourceUrl: string;
  reachable: boolean;
  changed: boolean;
  impacted: boolean;
  status: number;
  finalUrl: string;
  error?: string;
  parserSignals: number;
  autoReverified: number;
  checkedAt: string;
}

export interface CityReadiness {
  citySlug: string;
  places: number;
  venues: number;
  programs: number;
  upcomingOccurrences: number;
  upcomingSessions: number;
  neighborhoods: number;
  styles: number;
  ctaCoverage: number;
  passesGate: boolean;
}
