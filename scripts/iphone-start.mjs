#!/usr/bin/env node
/**
 * iPhone launcher — `npm run iphone`.
 *
 * Serves this computer's copy of the app to your own phone over Tailscale, so
 * it opens from anywhere (Wi-Fi or cellular) and nobody outside your tailnet
 * can reach it. iOS Safari grants the microphone only to HTTPS pages, so the
 * launcher fetches this machine's real `*.ts.net` certificate with
 * `tailscale cert` and Vite serves TLS itself: no reverse proxy sits in front,
 * so the cost-bearing routes (voice, Google search) keep working — they refuse
 * forwarded requests by design (see SECURITY.md).
 *
 * The server binds to the Tailscale address only, never 0.0.0.0, so the LAN
 * and the internet cannot reach it. It runs a production build through
 * `vite preview`: one bundle instead of the dev server's thousands of module
 * requests, which matters on a phone link. Keys come from `.env` as usual and
 * the Google Maps / Cesium ion keys are baked into the build, so restart this
 * after changing them. Provider Settings stays loopback-only here; add keys
 * with `npm run dev` on the computer first, or edit `.env`.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDirectInvocation } from './pinokio-install.mjs';
import { loadViteFromCanonicalRoot } from './pinokio-start.mjs';

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = realpathSync(path.resolve(path.dirname(MODULE_PATH), '..'));
const TLS_DIR = path.join(ROOT, '.gev-tls');

/** Where the Tailscale CLI usually lives, first match wins. */
export const TAILSCALE_CANDIDATES = Object.freeze([
  'tailscale',
  '/Applications/Tailscale.app/Contents/MacOS/Tailscale',
  'C:\\Program Files\\Tailscale\\tailscale.exe',
]);

/**
 * Pull what the launcher needs out of `tailscale status --json`.
 * @param {string} text Raw JSON from the CLI.
 * @returns {{running: boolean, dnsName: string, ipv4: string, httpsEnabled: boolean}}
 */
export function parseTailscaleStatus(text) {
  let status;
  try {
    status = JSON.parse(String(text || ''));
  } catch {
    status = {};
  }
  const self = status?.Self ?? {};
  const dnsName = String(self.DNSName ?? '')
    .trim()
    .replace(/\.$/, '')
    .toLowerCase();
  const ipv4 =
    (Array.isArray(self.TailscaleIPs) ? self.TailscaleIPs : []).find((ip) =>
      /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(ip)),
    ) ?? '';
  const certDomains = Array.isArray(status?.CertDomains)
    ? status.CertDomains.map((d) => String(d).toLowerCase())
    : [];
  return {
    running: status?.BackendState === 'Running',
    dnsName,
    ipv4,
    httpsEnabled: Boolean(dnsName) && certDomains.includes(dnsName),
  };
}

/**
 * Add the machine's Tailscale name to an existing GEV_ALLOWED_HOSTS list.
 * @param {string|undefined} existing
 * @param {string} dnsName
 * @returns {string}
 */
export function withAllowedHost(existing, dnsName) {
  const hosts = String(existing ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);
  if (!hosts.includes(dnsName)) hosts.push(dnsName);
  return hosts.join(',');
}

function run(bin, args) {
  return spawnSync(bin, args, { encoding: 'utf8' });
}

function findTailscale() {
  const configured = String(process.env.TAILSCALE_BIN ?? '').trim();
  for (const bin of configured ? [configured] : TAILSCALE_CANDIDATES) {
    if (bin.includes(path.sep) && !existsSync(bin)) continue;
    const probe = run(bin, ['version']);
    if (!probe.error && probe.status === 0) return bin;
  }
  return null;
}

function fail(message) {
  throw new Error(message);
}

async function start() {
  const tailscale = findTailscale();
  if (!tailscale)
    fail(
      'Tailscale CLI not found. Install Tailscale on this computer ' +
        '(https://tailscale.com/download), sign in, then run this again. ' +
        'Set TAILSCALE_BIN if it is installed somewhere unusual.',
    );

  const status = parseTailscaleStatus(run(tailscale, ['status', '--json']).stdout);
  if (!status.running)
    fail('Tailscale is installed but not connected. Open it, sign in, and run this again.');
  if (!status.dnsName || !status.ipv4)
    fail('Tailscale reported no MagicDNS name or IPv4 address for this machine.');
  if (!status.httpsEnabled)
    fail(
      'HTTPS certificates are off for your tailnet. In the Tailscale admin console ' +
        '(https://login.tailscale.com/admin/dns) turn on MagicDNS and HTTPS Certificates, ' +
        'then run this again.',
    );

  mkdirSync(TLS_DIR, { recursive: true, mode: 0o700 });
  const certFile = path.join(TLS_DIR, `${status.dnsName}.crt`);
  const keyFile = path.join(TLS_DIR, `${status.dnsName}.key`);
  // Reuses Tailscale's cached certificate and renews it when it nears expiry.
  const cert = run(tailscale, [
    'cert',
    '--cert-file',
    certFile,
    '--key-file',
    keyFile,
    status.dnsName,
  ]);
  if (cert.error || cert.status !== 0) {
    const detail = String(cert.stderr || cert.error?.message || '').trim();
    fail(
      `tailscale cert failed: ${detail}\n` +
        'On Linux, allow your user once with: sudo tailscale set --operator=$USER\n' +
        'On macOS, the App Store build cannot write certificates outside its sandbox; ' +
        'use the standalone download or `brew install tailscale`.',
    );
  }

  // Set before Vite is imported: the config reads process.env when it loads.
  process.env.GEV_HTTPS_CERT = certFile;
  process.env.GEV_HTTPS_KEY = keyFile;
  process.env.HOST = status.ipv4;
  process.env.GEV_ALLOWED_HOSTS = withAllowedHost(
    process.env.GEV_ALLOWED_HOSTS,
    status.dnsName,
  );
  const port = Number.parseInt(process.env.PORT, 10) || 4173;

  const { build, preview } = await loadViteFromCanonicalRoot(ROOT);
  console.log('[iPhone] Building the app (about 20 seconds)...');
  await build({ root: ROOT, logLevel: 'warn' });
  const server = await preview({
    root: ROOT,
    preview: { host: status.ipv4, port, strictPort: true },
  });

  const url = `https://${status.dnsName}:${port}/`;
  console.log('');
  console.log(`[iPhone] Ready at ${url}`);
  console.log('[iPhone] On your phone: turn Tailscale on, open that link in Safari,');
  console.log('[iPhone] then Share > Add to Home Screen. Keep this window running.');

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await server.close();
      process.exit(0);
    });
  }
}

if (isDirectInvocation(process.argv[1], MODULE_PATH)) {
  start().catch((error) => {
    console.error(`[iPhone] Start refused: ${error.message}`);
    process.exitCode = 1;
  });
}
