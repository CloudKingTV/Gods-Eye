import assert from 'node:assert/strict';
import test from 'node:test';
import { openSkyProxy } from './opensky.js';

// A shared cloud address can exhaust one free feed: when OpenSky and adsb.lol
// both fail, adsb.fi's open-data feed still serves the regional snapshot.
test('flights fall back from OpenSky to adsb.lol to adsb.fi', async (t) => {
  const calls = [];
  const realFetch = globalThis.fetch;
  const realMode = process.env.OPENSKY_AUTH_MODE;
  process.env.OPENSKY_AUTH_MODE = 'anon';
  t.after(() => {
    globalThis.fetch = realFetch;
    if (realMode === undefined) delete process.env.OPENSKY_AUTH_MODE;
    else process.env.OPENSKY_AUTH_MODE = realMode;
  });
  globalThis.fetch = async (url) => {
    const target = String(url);
    calls.push(new URL(target).host);
    if (
      target.startsWith(
        'https://opendata.adsb.fi/api/v2/lat/40/lon/-75/dist/250',
      )
    )
      return new Response(
        JSON.stringify({
          now: 1792705686.001,
          aircraft: [
            {
              hex: 'abc123',
              flight: 'TEST1',
              lat: 40.1,
              lon: -75.2,
              alt_baro: 30000,
              gs: 420,
              track: 80,
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    return new Response('unavailable', { status: 503 });
  };

  let handler;
  openSkyProxy().configureServer({
    middlewares: {
      use(path, callback) {
        if (path === '/api/flights') handler = callback;
      },
    },
  });
  const res = {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    writeHead(status, headers) {
      this.status = status;
      Object.assign(this.headers, headers);
    },
    end(body) {
      this.body = body;
    },
  };
  await handler(
    { url: '/?lat=40&lon=-75', method: 'GET', headers: {}, socket: {} },
    res,
    () => assert.fail('next'),
  );

  assert.equal(res.status, 200);
  assert.equal(res.headers['X-Flight-Source'], 'adsb.fi');
  const body = JSON.parse(res.body);
  assert.equal(body.states.length, 1);
  assert.equal(body.states[0][0], 'abc123');
  assert.ok(calls.includes('opensky-network.org'));
  assert.ok(calls.indexOf('api.adsb.lol') < calls.indexOf('opendata.adsb.fi'));
});
