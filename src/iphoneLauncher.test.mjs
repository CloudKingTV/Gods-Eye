import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTailscaleStatus, withAllowedHost } from '../scripts/iphone-start.mjs';

// Trimmed `tailscale status --json` from a connected machine with MagicDNS
// and HTTPS certificates turned on.
const CONNECTED = JSON.stringify({
  BackendState: 'Running',
  Self: {
    DNSName: 'Studio.tail1234.ts.net.',
    TailscaleIPs: ['fd7a:115c:a1e0::1', '100.101.102.103'],
  },
  CertDomains: ['studio.tail1234.ts.net'],
});

test('the Tailscale name, IPv4 address and HTTPS state come from status JSON', () => {
  assert.deepEqual(parseTailscaleStatus(CONNECTED), {
    running: true,
    dnsName: 'studio.tail1234.ts.net',
    ipv4: '100.101.102.103',
    httpsEnabled: true,
  });
  const noCerts = JSON.parse(CONNECTED);
  delete noCerts.CertDomains;
  assert.equal(parseTailscaleStatus(JSON.stringify(noCerts)).httpsEnabled, false);
  const stopped = { ...JSON.parse(CONNECTED), BackendState: 'Stopped' };
  assert.equal(parseTailscaleStatus(JSON.stringify(stopped)).running, false);
  assert.deepEqual(parseTailscaleStatus('not json'), {
    running: false,
    dnsName: '',
    ipv4: '',
    httpsEnabled: false,
  });
});

test('the Tailscale name is appended to GEV_ALLOWED_HOSTS once', () => {
  assert.equal(withAllowedHost(undefined, 'studio.ts.net'), 'studio.ts.net');
  assert.equal(withAllowedHost('globe.lan, ', 'studio.ts.net'), 'globe.lan,studio.ts.net');
  assert.equal(withAllowedHost('studio.ts.net', 'studio.ts.net'), 'studio.ts.net');
});
