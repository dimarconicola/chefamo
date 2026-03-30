import test from 'node:test';
import assert from 'node:assert/strict';

import { validateImportCsv } from '@/lib/catalog/import-validator';

const validOccurrenceCsv = `city_slug,occurrence_id,program_slug,place_slug,organizer_slug,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,source_url,last_verified_at,verification_status,attendance_model,age_min,age_max,price_note_it
palermo,planetario-weekend-show-sat,planetario-weekend-show,planetario-palermo-place,planetario-palermo,stem,planetarium-show,Weekend Planetarium Show,2026-04-04T17:00:00+02:00,2026-04-04T18:00:00+02:00,open,Italian,in_person,planetario-contact,https://www.planetariopalermo.it/,2026-03-29T11:00:00+02:00,verified,drop_in,5,12,Da 5 a 10 EUR`;

const validPlaceCsv = `city_slug,place_slug,place_name,neighborhood_slug,address,lat,lng,category_slug,place_profile,booking_target_href,source_url,last_verified_at,verification_status,style_slugs,price_note_it
palermo,planetario-palermo-place,Planetario di Palermo,politeama,Piazza San Francesco di Paola 18,38.1244,13.3517,stem,museum,mailto:planetariopalermo@gmail.com,https://www.planetariopalermo.it/,2026-03-29T11:00:00+02:00,verified,planetarium-show,Prezzi disponibili su richiesta`;

test('import validator accepts scoped valid occurrence rows', () => {
  const result = validateImportCsv(validOccurrenceCsv);
  assert.equal(result.ok, true);
  assert.equal(result.importKind, 'occurrences');
  assert.equal(result.errors.length, 0);
});

test('import validator blocks out-of-scope place categories and invalid URLs', () => {
  const invalidPlaceCsv = validPlaceCsv
    .replace(',stem,', ',tennis,')
    .replace('mailto:planetariopalermo@gmail.com', 'notaurl')
    .replace('https://www.planetariopalermo.it/', 'notaurl');

  const result = validateImportCsv(invalidPlaceCsv);
  assert.equal(result.ok, false);
  assert.equal(result.importKind, 'places');
  assert.ok(result.errors.some((issue) => issue.field === 'category_slug'));
  assert.ok(result.errors.some((issue) => issue.field === 'booking_target_href'));
  assert.ok(result.errors.some((issue) => issue.field === 'source_url'));
});

test('import validator warns when attendance model and pricing are missing on occurrences', () => {
  const csv = validOccurrenceCsv
    .replace(',attendance_model,age_min,age_max,price_note_it', ',age_min,age_max')
    .replace(',drop_in,5,12,Da 5 a 10 EUR', ',5,12');

  const result = validateImportCsv(csv);
  assert.equal(result.ok, true);
  assert.equal(result.importKind, 'occurrences');
  assert.ok(result.warnings.some((issue) => issue.field === 'attendance_model'));
  assert.ok(result.warnings.some((issue) => issue.field === 'price_note_it'));
});
