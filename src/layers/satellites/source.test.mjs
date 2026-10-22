import test from 'node:test';
import assert from 'node:assert/strict';
import { twoline2satrec } from 'satellite.js';
import { createSatelliteSource } from './source.js';
import { createSatellitesLayer } from './index.js';

test('satellite sources confine catalog groups and reject a cancelled body', async () => {
  const controller = new AbortController();
  let requests = 0;
  const source = createSatelliteSource({
    fetchImpl: async (url) => {
      requests++;
      assert.equal(url, '/api/celestrak/stations');
      return {
        ok: true,
        status: 200,
        text: async () => {
          controller.abort();
          return 'late catalog';
        },
      };
    },
  });
  await assert.rejects(
    source.readGroup('../active'),
    /Unknown satellite group/,
  );
  assert.equal(requests, 0);
  await assert.rejects(
    source.readGroup('stations', { signal: controller.signal }),
    { name: 'AbortError' },
  );
});

test('satellite factories keep control state separate and construct without requests', () => {
  const source = {
    readGroup() {
      assert.fail('construction fetched a catalog');
    },
  };
  const services = Object.fromEntries(
    [
      'picking',
      'focus',
      'readout',
      'overlays',
      'context',
      'render',
      'layerState',
    ].map((key) => [key, {}]),
  );
  services.layerState.isExplicitLayerStateOrigin = () => false;
  const first = createSatellitesLayer({ source, services });
  const second = createSatellitesLayer({ source, services });
  first.setParams({ showPoints: false });
  assert.equal(first.getParams().showPoints, false);
  assert.equal(second.getParams().showPoints, true);
  assert.notEqual(first.getStats(), second.getStats());
});

test('satellite pass prediction methods report no-tle on cold catalog and coerce IDs', () => {
  const source = { readGroup() {} };
  const services = Object.fromEntries(
    [
      'picking',
      'focus',
      'readout',
      'overlays',
      'context',
      'render',
      'layerState',
    ].map((key) => [key, {}]),
  );
  services.layerState.isExplicitLayerStateOrigin = () => false;
  const layer = createSatellitesLayer({ source, services });

  // Cold catalog (no satellites loaded yet)
  assert.deepEqual(layer.getNextIssPass({ latDeg: 30, lonDeg: -97 }), {
    status: 'no-tle',
  });
  assert.deepEqual(
    layer.getNextSatellitePass(25544, { latDeg: 30, lonDeg: -97 }),
    { status: 'no-tle' },
  );

  // String NORAD ID coercion
  assert.deepEqual(
    layer.getNextSatellitePass('25544', { latDeg: 30, lonDeg: -97 }),
    { status: 'no-tle' },
  );

  // Invalid / non-finite ID handling
  assert.deepEqual(
    layer.getNextSatellitePass(NaN, { latDeg: 30, lonDeg: -97 }),
    { status: 'no-tle' },
  );
  assert.deepEqual(
    layer.getNextSatellitePass(null, { latDeg: 30, lonDeg: -97 }),
    { status: 'no-tle' },
  );

  // Populated catalog: verify numeric and string coercion succeed
  const L1 =
    '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927';
  const L2 =
    '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537';
  const satrec = twoline2satrec(L1, L2);
  layer._setTrackedSatelliteRefreshStateForTest({
    noradId: 25544,
    name: 'ISS (ZARYA)',
    satrec,
  });

  const FROM_MS = 1221868800000;
  const numericResult = layer.getNextSatellitePass(25544, {
    latDeg: 30.2672,
    lonDeg: -97.7431,
    fromMs: FROM_MS,
  });
  assert.equal(numericResult.status, 'ok');
  assert.ok(numericResult.pass);

  const stringResult = layer.getNextSatellitePass('25544', {
    latDeg: 30.2672,
    lonDeg: -97.7431,
    fromMs: FROM_MS,
  });
  assert.equal(stringResult.status, 'ok');
  assert.deepEqual(stringResult, numericResult);

  const issResult = layer.getNextIssPass({
    latDeg: 30.2672,
    lonDeg: -97.7431,
    fromMs: FROM_MS,
  });
  assert.equal(issResult.status, 'ok');
  assert.deepEqual(issResult, numericResult);

  layer._setTrackedSatelliteRefreshStateForTest({
    noradId: 25544,
    name: 'ISS (ZARYA)',
    satrec,
    neighbours: [
      { noradId: 10, name: 'STARLINK ONE', satrec },
      { noradId: 11, name: 'STARLINK TWO', satrec },
    ],
  });
  assert.equal(layer.resolveSatelliteForPass('25544').noradId, 25544);
  assert.equal(layer.resolveSatelliteForPass('iss (zarya)').noradId, 25544);
  assert.equal(layer.resolveSatelliteForPass('starlink').status, 'ambiguous');
  assert.equal(layer.resolveSatelliteForPass('starlink').totalMatches, 2);
  assert.equal(layer.resolveSatelliteForPass('STARLINK ONE').noradId, 10);
  assert.equal(layer.resolveSatelliteForPass('missing').status, 'not-found');
  layer._clearDenseCatalogStateForTest();
  assert.equal(layer.resolveSatelliteForPass('25544').status, 'not-found');

  // Non-existent satellite ID in populated catalog
  assert.deepEqual(
    layer.getNextSatellitePass(99999, {
      latDeg: 30.2672,
      lonDeg: -97.7431,
      fromMs: FROM_MS,
    }),
    { status: 'no-tle' },
  );
});

test('a failed proxy read falls back to CelesTrak direct, then to the kept copy', async () => {
  const TLE =
    'ISS (ZARYA)\n1 25544U 98067A   26294.04791053  .00009575  00000+0  18188-3 0  9996\n2 25544  51.6327  37.2600 0004000  10.0000 350.0000 15.50000000000000\n';
  const kept = new Map();
  const cache = {
    get: async (group) => kept.get(group) ?? null,
    put: async (group, text) => kept.set(group, text),
  };
  const proxyDown = async () => ({
    ok: false,
    status: 502,
    text: async () => 'celestrak fetch failed',
    headers: { get: () => 'NONE' },
  });
  const direct = [];
  let directAnswer = { ok: true, status: 200, text: async () => TLE };
  const source = createSatelliteSource({
    fetchImpl: proxyDown,
    directFetchImpl: async (url, options) => {
      direct.push([url, options.credentials]);
      return directAnswer;
    },
    cache,
  });

  // Server refused: the browser reads CelesTrak itself and keeps the copy.
  assert.deepEqual(await source.readGroup('stations'), {
    ok: true,
    status: 200,
    text: TLE,
    stale: false,
  });
  assert.deepEqual(direct, [
    [
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
      'omit',
    ],
  ]);
  assert.equal(kept.get('stations'), TLE);

  // CelesTrak now refuses this address too (repeat download): the kept copy, marked stale.
  directAnswer = {
    ok: false,
    status: 403,
    text: async () =>
      'GP data has not updated since your last successful download',
  };
  assert.deepEqual(await source.readGroup('stations'), {
    ok: true,
    status: 200,
    text: TLE,
    stale: true,
  });

  // Nothing kept for this group: the proxy's failure stands.
  const result = await source.readGroup('starlink');
  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
});

test('a working proxy is used as before and its catalog is kept', async () => {
  const TLE = 'X\n1 00001U\n2 00001\n';
  const kept = new Map();
  let directCalls = 0;
  const source = createSatelliteSource({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      text: async () => TLE,
      headers: { get: () => 'MISS' },
    }),
    directFetchImpl: async () => {
      directCalls++;
    },
    cache: {
      get: async () => null,
      put: async (group, text) => kept.set(group, text),
    },
  });
  assert.deepEqual(await source.readGroup('geo'), {
    ok: true,
    status: 200,
    text: TLE,
    stale: false,
  });
  assert.equal(directCalls, 0);
  assert.equal(kept.get('geo'), TLE);
});
