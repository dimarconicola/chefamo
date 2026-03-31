import test from 'node:test';
import assert from 'node:assert/strict';

import { getOccurrences } from '@/lib/catalog/server-data';
import { getTimeBucket } from '@/lib/catalog/filters';

test('Italian filter returns only Italian sessions', async () => {
  const results = await getOccurrences('palermo', { language: 'Italian' });
  assert.ok(results.length > 0);
  assert.equal(results.every((session) => session.language === 'Italian'), true);
});

test('Weekend filter returns weekend sessions only', async () => {
  const results = await getOccurrences('palermo', { date: 'weekend' });
  assert.ok(results.length > 0);
  assert.equal(results.every((session) => ['morning', 'midday', 'evening', 'early'].includes(getTimeBucket(session.startAt))), true);
});

test('Age-band filter narrows to kids-active supply', async () => {
  const results = await getOccurrences('palermo', { category: 'movement', age_band: '6-10' });
  assert.ok(results.length > 0);
  assert.equal(results.every((session) => session.categorySlug === 'movement'), true);
  assert.equal(results.every((session) => session.ageBand === '6-10'), true);
});
