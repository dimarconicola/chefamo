import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveKidsAgeBand, inferKidsAgeRangeFromStyle, isCategoryInScope, isSessionInScope } from '@/lib/catalog/policy';

test('kids age band derivation maps expected ranges', () => {
  assert.equal(deriveKidsAgeBand(3, 5), '3-5');
  assert.equal(deriveKidsAgeBand(6, 10), '6-10');
  assert.equal(deriveKidsAgeBand(6, 14), 'mixed-kids');
});

test('kids style mapping includes known Palermo styles', () => {
  const capoeira = inferKidsAgeRangeFromStyle('kids-capoeira');
  assert.equal(capoeira.min, 6);
  assert.equal(capoeira.max, 14);
});

test('category scope keeps the core family activity surfaces', () => {
  assert.equal(isCategoryInScope('movement'), true);
  assert.equal(isCategoryInScope('culture'), true);
  assert.equal(isCategoryInScope('tennis'), false);
});

test('session policy allows age-scoped kids movement and sport wording', () => {
  const capoeira = isSessionInScope({
    categorySlug: 'movement',
    attendanceModel: 'drop_in',
    title: { en: 'Kids capoeira club', it: 'Capoeira bambini' }
  });
  const swim = isSessionInScope({
    categorySlug: 'movement',
    attendanceModel: 'drop_in',
    title: { en: 'Swim basics 6-10', it: 'Nuoto base 6-10' }
  });
  const tooOld = isSessionInScope({
    categorySlug: 'movement',
    attendanceModel: 'term',
    ageMax: 16,
    title: { en: 'Teen conditioning', it: 'Preparazione adolescenti' }
  });

  assert.equal(capoeira, true);
  assert.equal(swim, true);
  assert.equal(tooOld, false);
});
