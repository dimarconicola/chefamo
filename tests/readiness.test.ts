import test from 'node:test';
import assert from 'node:assert/strict';

import { getCityReadiness } from '@/lib/catalog/readiness';

test('Palermo readiness reflects live supply and CTA thresholds', () => {
  const readiness = getCityReadiness('palermo');
  assert.ok(readiness.places >= 6);
  assert.ok(readiness.upcomingOccurrences >= 8);
  assert.ok(readiness.neighborhoods >= 3);
  assert.ok(readiness.styles >= 4);
  assert.ok(readiness.ctaCoverage >= 0.8);
  assert.equal(readiness.passesGate, true);
});
