import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAdapterAutoReverify, parseSourceWithAdapter } from '@/lib/freshness/adapters';

test('planetario adapter parses weekday slots from simple program HTML', () => {
  const html = `
    <ul>
      <li>Sabato 17:00 Weekend Planetarium Show</li>
      <li>Domenica 12:00 Weekend Planetarium Show</li>
    </ul>
  `;

  const parsed = parseSourceWithAdapter('https://www.planetariopalermo.it/', html);
  assert.equal(parsed.adapterId, 'planetario-program');
  assert.ok(parsed.sessions.some((item) => item.title === 'Weekend Planetarium Show' && item.weekday === 'Saturday' && item.startTime === '17:00'));
  assert.ok(parsed.sessions.some((item) => item.title === 'Weekend Planetarium Show' && item.weekday === 'Sunday' && item.startTime === '12:00'));
});

test('marionette adapter parses heading-plus-line schedules', () => {
  const html = `
    <h3>Sabato</h3>
    <p>16:30 Weekend Puppet Theater</p>
    <h3>Domenica</h3>
    <p>12:00 Weekend Puppet Theater</p>
  `;

  const parsed = parseSourceWithAdapter('https://www.museomarionettepalermo.it/', html);
  assert.equal(parsed.adapterId, 'museo-marionette-program');
  assert.ok(parsed.sessions.some((item) => item.title === 'Weekend Puppet Theater' && item.weekday === 'Saturday' && item.startTime === '16:30'));
  assert.ok(parsed.sessions.some((item) => item.title === 'Weekend Puppet Theater' && item.weekday === 'Sunday' && item.startTime === '12:00'));
});

test('teatro massimo adapter parses entity-heavy family visit schedule blocks', () => {
  const html = `
    <html>
      <head>
        <style>.dummy { color: red; }</style>
        <script>window.debug = true;</script>
      </head>
      <body>
        <p>Sabato</p>
        <p>10:30 Family Theater Tour</p>
        <p>Domenica</p>
        <p>11.20 Family Theater Tour</p>
      </body>
    </html>
  `;

  const parsed = parseSourceWithAdapter('https://www.teatromassimo.it/', html);
  assert.equal(parsed.adapterId, 'teatro-massimo-family-tour');
  assert.equal(parsed.sessions.length, 2);
  assert.ok(parsed.sessions.some((item) => item.weekday === 'Saturday' && item.startTime === '10:30' && item.title === 'Family Theater Tour'));
  assert.ok(parsed.sessions.some((item) => item.weekday === 'Sunday' && item.startTime === '11:20' && item.title === 'Family Theater Tour'));
});

test('adapter confidence threshold rejects low signal coverage', () => {
  const evaluation = evaluateAdapterAutoReverify(
    {
      minSignals: 10,
      minMatches: 6,
      minMatchRatio: 0.5
    },
    12,
    4
  );

  assert.equal(evaluation.accepted, false);
  assert.equal(evaluation.reason, 'insufficient_matches');
  assert.equal(Number(evaluation.matchRatio.toFixed(2)), 0.33);
});

test('adapter confidence threshold accepts healthy signal coverage', () => {
  const evaluation = evaluateAdapterAutoReverify(
    {
      minSignals: 10,
      minMatches: 6,
      minMatchRatio: 0.5
    },
    14,
    9
  );

  assert.equal(evaluation.accepted, true);
  assert.equal(evaluation.reason, 'accepted');
});
