import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  chefamoBookingTargets,
  chefamoCategories,
  chefamoCities,
  chefamoCollections,
  chefamoNeighborhoods,
  chefamoOccurrences,
  chefamoOrganizers,
  chefamoPlaces,
  chefamoPrograms,
  chefamoStyles
} from '@/lib/catalog/chefamo-seed';

const ROOT = process.cwd();
const RESEARCH_DIR = join(ROOT, 'data', 'research');
const IMPORTS_DIR = join(ROOT, 'data', 'imports');
const APP_JSON_PATH = join(RESEARCH_DIR, 'palermo_app_catalog.json');
const POSTGRES_SQL_PATH = join(RESEARCH_DIR, 'palermo_postgres_seed.sql');
const OCCURRENCES_CSV_PATH = join(IMPORTS_DIR, 'palermo_seed.csv');
const CITY_SLUG = 'palermo';

const palermoCities = chefamoCities.filter((city) => city.slug === CITY_SLUG);
const palermoNeighborhoods = chefamoNeighborhoods.filter((item) => item.citySlug === CITY_SLUG);
const palermoCategories = chefamoCategories.filter((item) => item.citySlug === CITY_SLUG);
const palermoOrganizers = chefamoOrganizers.filter((item) => item.citySlug === CITY_SLUG);
const palermoPlaces = chefamoPlaces.filter((item) => item.citySlug === CITY_SLUG);
const palermoPrograms = chefamoPrograms.filter((item) => item.citySlug === CITY_SLUG);
const palermoOccurrences = chefamoOccurrences.filter((item) => item.citySlug === CITY_SLUG);
const palermoCollections = chefamoCollections.filter((item) => item.citySlug === CITY_SLUG);

const snapshot = {
  generatedAt: new Date().toISOString(),
  citySlug: CITY_SLUG,
  source: 'chefamo-seed',
  cities: palermoCities,
  neighborhoods: palermoNeighborhoods,
  categories: palermoCategories,
  styles: chefamoStyles,
  organizers: palermoOrganizers,
  bookingTargets: chefamoBookingTargets,
  places: palermoPlaces,
  programs: palermoPrograms,
  occurrences: palermoOccurrences,
  collections: palermoCollections
};

const csvEscape = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replaceAll('"', '""')}"`;
};

const sqlLiteral = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${value.replaceAll("'", "''")}'`;
};

const sqlJson = (value: unknown) => sqlLiteral(JSON.stringify(value));

const sqlInsert = (table: string, columns: string[], rows: string[][], conflictTarget: string) => {
  const values = rows.map((row) => `(${row.join(', ')})`).join(',\n');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values}\nON CONFLICT (${conflictTarget}) DO NOTHING;`;
};

const occurrenceCsvHeaders = [
  'city_slug',
  'occurrence_id',
  'program_slug',
  'place_slug',
  'organizer_slug',
  'category_slug',
  'style_slug',
  'title',
  'start_at',
  'end_at',
  'level',
  'language',
  'format',
  'booking_target_slug',
  'source_url',
  'last_verified_at',
  'verification_status',
  'attendance_model',
  'age_min',
  'age_max',
  'price_note_it'
];

const occurrenceCsv = [
  occurrenceCsvHeaders.join(','),
  ...palermoOccurrences.map((occurrence) =>
    [
      occurrence.citySlug,
      occurrence.id,
      occurrence.programSlug,
      occurrence.placeSlug,
      occurrence.organizerSlug,
      occurrence.categorySlug,
      occurrence.styleSlug,
      occurrence.title.en,
      occurrence.startAt,
      occurrence.endAt,
      occurrence.level,
      occurrence.language,
      occurrence.format,
      occurrence.bookingTargetSlug,
      occurrence.sourceUrl,
      occurrence.lastVerifiedAt,
      occurrence.verificationStatus,
      occurrence.attendanceModel,
      occurrence.ageMin,
      occurrence.ageMax,
      occurrence.priceNote?.it ?? ''
    ]
      .map(csvEscape)
      .join(',')
  )
].join('\n');

const sqlStatements = [
  `-- Chefamo Palermo seed export`,
  `-- Generated at ${snapshot.generatedAt}`,
  sqlInsert(
    'cities',
    ['slug', 'country_code', 'timezone', 'status', 'bounds', 'name', 'hero'],
    palermoCities.map((city) => [
      sqlLiteral(city.slug),
      sqlLiteral(city.countryCode),
      sqlLiteral(city.timezone),
      sqlLiteral(city.status),
      sqlJson(city.bounds),
      sqlJson(city.name),
      sqlJson(city.hero)
    ]),
    'slug'
  ),
  sqlInsert(
    'neighborhoods',
    ['city_slug', 'slug', 'name', 'description', 'center_lat', 'center_lng'],
    palermoNeighborhoods.map((item) => [
      sqlLiteral(item.citySlug),
      sqlLiteral(item.slug),
      sqlJson(item.name),
      sqlJson(item.description),
      sqlLiteral(item.center.lat),
      sqlLiteral(item.center.lng)
    ]),
    'slug'
  ),
  sqlInsert(
    'activity_categories',
    ['city_slug', 'slug', 'visibility', 'name', 'description', 'hero_metric'],
    palermoCategories.map((item) => [
      sqlLiteral(item.citySlug),
      sqlLiteral(item.slug),
      sqlLiteral(item.visibility),
      sqlJson(item.name),
      sqlJson(item.description),
      sqlJson(item.heroMetric)
    ]),
    'slug'
  ),
  sqlInsert(
    'styles',
    ['category_slug', 'slug', 'name', 'description'],
    chefamoStyles.map((style) => [sqlLiteral(style.categorySlug), sqlLiteral(style.slug), sqlJson(style.name), sqlJson(style.description)]),
    'slug'
  ),
  sqlInsert(
    'instructors',
    ['city_slug', 'slug', 'name', 'short_bio', 'specialties', 'languages'],
    palermoOrganizers.map((item) => [
      sqlLiteral(item.citySlug),
      sqlLiteral(item.slug),
      sqlLiteral(item.name),
      sqlJson(item.shortBio),
      sqlJson(item.specialties),
      sqlJson(item.languages)
    ]),
    'slug'
  ),
  sqlInsert(
    'booking_targets',
    ['slug', 'type', 'label', 'href'],
    chefamoBookingTargets.map((item) => [sqlLiteral(item.slug), sqlLiteral(item.type), sqlLiteral(item.label), sqlLiteral(item.href)]),
    'slug'
  ),
  sqlInsert(
    'venues',
    [
      'city_slug',
      'neighborhood_slug',
      'slug',
      'name',
      'tagline',
      'description',
      'address',
      'lat',
      'lng',
      'amenities',
      'languages',
      'style_slugs',
      'category_slugs',
      'booking_target_order',
      'freshness_note',
      'source_url',
      'last_verified_at'
    ],
    palermoPlaces.map((item) => [
      sqlLiteral(item.citySlug),
      sqlLiteral(item.neighborhoodSlug),
      sqlLiteral(item.slug),
      sqlLiteral(item.name),
      sqlJson(item.tagline),
      sqlJson(item.description),
      sqlLiteral(item.address),
      sqlLiteral(item.geo.lat),
      sqlLiteral(item.geo.lng),
      sqlJson(item.amenities),
      sqlJson(item.languages),
      sqlJson(item.styleSlugs),
      sqlJson(item.categorySlugs),
      sqlJson(item.bookingTargetOrder),
      sqlJson(item.freshnessNote),
      sqlLiteral(item.sourceUrl),
      sqlLiteral(item.lastVerifiedAt)
    ]),
    'slug'
  ),
  sqlInsert(
    'sessions',
    [
      'id',
      'city_slug',
      'venue_slug',
      'instructor_slug',
      'category_slug',
      'style_slug',
      'title',
      'start_at',
      'end_at',
      'level',
      'language',
      'format',
      'booking_target_slug',
      'source_url',
      'last_verified_at',
      'verification_status',
      'audience',
      'attendance_model',
      'age_min',
      'age_max',
      'age_band',
      'guardian_required',
      'price_note'
    ],
    palermoOccurrences.map((item) => [
      sqlLiteral(item.id),
      sqlLiteral(item.citySlug),
      sqlLiteral(item.venueSlug),
      sqlLiteral(item.instructorSlug),
      sqlLiteral(item.categorySlug),
      sqlLiteral(item.styleSlug),
      sqlJson(item.title),
      sqlLiteral(item.startAt),
      sqlLiteral(item.endAt),
      sqlLiteral(item.level),
      sqlLiteral(item.language),
      sqlLiteral(item.format),
      sqlLiteral(item.bookingTargetSlug),
      sqlLiteral(item.sourceUrl),
      sqlLiteral(item.lastVerifiedAt),
      sqlLiteral(item.verificationStatus),
      sqlLiteral(item.audience),
      sqlLiteral(item.attendanceModel),
      sqlLiteral(item.ageMin),
      sqlLiteral(item.ageMax),
      sqlLiteral(item.ageBand),
      sqlLiteral(item.guardianRequired),
      item.priceNote ? sqlJson(item.priceNote) : 'NULL'
    ]),
    'id'
  ),
  sqlInsert(
    'editorial_collections',
    ['city_slug', 'slug', 'title', 'description', 'cta', 'kind'],
    palermoCollections.map((item) => [
      sqlLiteral(item.citySlug),
      sqlLiteral(item.slug),
      sqlJson(item.title),
      sqlJson(item.description),
      sqlJson(item.cta),
      sqlLiteral(item.kind)
    ]),
    'slug'
  )
].join('\n\n');

async function main() {
  await mkdir(RESEARCH_DIR, { recursive: true });
  await mkdir(IMPORTS_DIR, { recursive: true });

  await Promise.all([
    writeFile(APP_JSON_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8'),
    writeFile(POSTGRES_SQL_PATH, `${sqlStatements}\n`, 'utf8'),
    writeFile(OCCURRENCES_CSV_PATH, `${occurrenceCsv}\n`, 'utf8')
  ]);

  console.log(`Wrote ${APP_JSON_PATH}`);
  console.log(`Wrote ${POSTGRES_SQL_PATH}`);
  console.log(`Wrote ${OCCURRENCES_CSV_PATH}`);
}

void main();
