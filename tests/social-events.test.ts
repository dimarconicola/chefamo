import test from 'node:test';
import assert from 'node:assert/strict';

import { extractSourceEventCandidates, mapSourceEventCandidateToSession } from '@/lib/freshness/social-events';

test('MiniMuPa social extractor emits a one-off creative lab when date and time are present', () => {
  const html = `
    <div>13 January · LABORATORIO CREATIVO MINIMUPA</div>
    <div>Per bambini e famiglie, ore 10:30 - 12:00 a Palermo.</div>
  `;

  const candidates = extractSourceEventCandidates(
    'https://www.instagram.com/minimupa/',
    html,
    '2026-01-10T09:00:00+01:00'
  );

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].venueSlug, 'minimupa-palermo');
  assert.equal(candidates[0].categorySlug, 'stem');
  assert.equal(candidates[0].title.it, 'Laboratorio creativo MiniMuPa');
  assert.equal(candidates[0].startAt, '2026-01-13T10:30:00.000+01:00');
  assert.equal(candidates[0].endAt, '2026-01-13T12:00:00.000+01:00');
  assert.ok(candidates[0].confidence >= 0.8);
});

test('social extractor tolerates punctuation-heavy text from posts', () => {
  const html = `
    <div>✨ LABORATORIO CREATIVO MINIMUPA ✨</div>
    <div>13 Gennaio - ore 10:30 / 12:00</div>
  `;

  const candidates = extractSourceEventCandidates(
    'https://www.instagram.com/minimupa/',
    html,
    '2026-01-10T09:00:00+01:00'
  );

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title.it, 'Laboratorio creativo MiniMuPa');
});

test('candidate payload maps back into a public session shape', () => {
  const [candidate] = extractSourceEventCandidates(
    'https://www.instagram.com/minimupa/',
    '<div>13 January · LABORATORIO CREATIVO MINIMUPA ore 10:30 - 12:00</div>',
    '2026-01-10T09:00:00+01:00'
  );

  const session = mapSourceEventCandidateToSession(candidate);
  assert.equal(session.id, candidate.id);
  assert.equal(session.sourceUrl, 'https://www.instagram.com/minimupa/');
  assert.equal(session.bookingTargetSlug, 'minimupa-booking');
  assert.equal(session.verificationStatus, 'verified');
});
