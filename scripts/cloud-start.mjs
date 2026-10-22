#!/usr/bin/env node
/**
 * Cloud launcher — `npm run cloud`, the start command in render.yaml.
 *
 * Serves the production build (`npm run build` runs first, as the host's build
 * step) with `vite preview` on every interface at $PORT, behind a password.
 * A cloud URL is public, and this server brokers whatever provider keys the
 * host's environment holds, so it refuses to start without
 * GEV_ACCESS_PASSWORD. One correct password sets a year-long cookie, so a
 * Home Screen web app signs in once.
 *
 * The host's HTTPS proxy sits in front, so the routes that refuse forwarded
 * requests by design (OpenAI voice, Google search, TomTom, Mapillary) stay
 * off; everything keyless and the AISStream/FIRMS layers work. Provider
 * Settings is dev-server only, so keys go in the host's environment variables.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDirectInvocation } from './pinokio-install.mjs';
import { loadViteFromCanonicalRoot } from './pinokio-start.mjs';
import { withAllowedHost } from './iphone-start.mjs';

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = realpathSync(path.resolve(path.dirname(MODULE_PATH), '..'));

export const ACCESS_COOKIE = 'gev_access';
export const LOGIN_PATH = '/__login';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const MAX_LOGIN_BODY = 4096;
const LOGIN_FAILURE_DELAY_MS = 1000;

/**
 * Paths served without the cookie: what Safari fetches for Add to Home Screen
 * before anyone signs in, and scene data-pack assets, which the Director
 * fetches with `credentials: 'omit'` (src/director/packs/source.js). Both are
 * static public files that broker no keys.
 */
const PUBLIC_PATHS =
  /^\/(?:manifest\.webmanifest|favicon\.ico|logo\.svg|icons\/[\w.-]+\.png|scene-assets\/[\w-]+\/[\w-]+\.(?:png|json|geojson|mp4|webm|mp3|ogg|wav))$/;

/** The cookie value a password grants; changing the password revokes it. */
export function accessToken(password) {
  return createHmac('sha256', String(password))
    .update('gev-access-v1')
    .digest('hex');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Read one cookie from a Cookie header. */
export function readCookie(header, name) {
  for (const part of String(header ?? '').split(';')) {
    const eq = part.indexOf('=');
    if (eq !== -1 && part.slice(0, eq).trim() === name)
      return part.slice(eq + 1).trim();
  }
  return '';
}

/**
 * Decide what a request gets: 'pass' (signed in or a public icon), 'login'
 * (a password submission), 'page' (show the sign-in page) or 'deny' (401).
 */
export function gateDecision({ method, url, cookie, token }) {
  const pathname = String(url ?? '/').split(/[?#]/, 1)[0];
  if (pathname === LOGIN_PATH) return method === 'POST' ? 'login' : 'page';
  if (safeEqual(readCookie(cookie, ACCESS_COOKIE), token)) return 'pass';
  if (method === 'GET' && PUBLIC_PATHS.test(pathname)) return 'pass';
  if (
    method === 'GET' &&
    !pathname.startsWith('/api') &&
    !/\.\w+$/.test(pathname)
  )
    return 'page';
  return 'deny';
}

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The sign-in page: no script, so it runs under a CSP that allows none. */
export function loginPage(message = '') {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="God's Eye">
<link rel="apple-touch-icon" href="/icons/icon-180.png">
<link rel="manifest" href="/manifest.webmanifest">
<title>God's Eye View</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0f;color:#cfe;font:16px ui-monospace,Menlo,monospace}
form{display:grid;gap:12px;width:min(320px,90vw)}
h1{font-size:18px;letter-spacing:.2em;margin:0 0 8px;color:#5ef}
input,button{font:inherit;padding:12px;border-radius:8px;border:1px solid #2a4a5a;background:#101820;color:#cfe}
button{background:#0e3a4a;color:#5ef;letter-spacing:.15em}
p{color:#f88;margin:0}
</style></head><body>
<form method="post" action="${LOGIN_PATH}">
<h1>GOD'S EYE VIEW</h1>
<input type="password" name="password" placeholder="Password" autocomplete="current-password" autofocus required>
<button type="submit">ENTER</button>
${message ? `<p>${escapeHtml(message)}</p>` : ''}
</form></body></html>`;
}

/** Pull the password field out of a urlencoded form body. */
export function passwordFromForm(body) {
  return new URLSearchParams(String(body ?? '')).get('password') ?? '';
}

function sendPage(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; manifest-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  );
  res.end(loginPage(message));
}

/** Vite plugin that puts every preview request behind the password. */
export function accessGatePlugin(password) {
  const token = accessToken(password);
  const middleware = (req, res, next) => {
    const decision = gateDecision({
      method: req.method,
      url: req.url,
      cookie: req.headers.cookie,
      token,
    });
    if (decision === 'pass') return next();
    if (decision === 'page') return sendPage(res, 200, '');
    if (decision === 'deny') {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-store');
      return res.end('Sign in first.');
    }
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_LOGIN_BODY) req.destroy();
    });
    req.on('end', () => {
      if (safeEqual(accessToken(passwordFromForm(body)), token)) {
        res.statusCode = 303;
        res.setHeader(
          'Set-Cookie',
          `${ACCESS_COOKIE}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        );
        res.setHeader('Location', '/');
        return res.end();
      }
      // Slow guessing down; the password is the only thing guarding the keys.
      setTimeout(
        () => sendPage(res, 401, 'Wrong password.'),
        LOGIN_FAILURE_DELAY_MS,
      );
    });
  };
  return {
    name: 'cloud-access-gate',
    enforce: 'pre',
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

async function start() {
  const password = String(process.env.GEV_ACCESS_PASSWORD ?? '');
  if (password.length < 8)
    throw new Error(
      'Set GEV_ACCESS_PASSWORD (8+ characters) in the host environment. ' +
        'A cloud URL is public and this server brokers your provider keys.',
    );

  // Render names the public hostname; GEV_PUBLIC_HOST covers other hosts.
  for (const name of [
    process.env.RENDER_EXTERNAL_HOSTNAME,
    process.env.GEV_PUBLIC_HOST,
  ])
    if (String(name ?? '').trim())
      process.env.GEV_ALLOWED_HOSTS = withAllowedHost(
        process.env.GEV_ALLOWED_HOSTS,
        String(name).trim().toLowerCase(),
      );
  process.env.HOST = '0.0.0.0';
  const port = Number.parseInt(process.env.PORT, 10) || 4173;

  const { preview } = await loadViteFromCanonicalRoot(ROOT);
  const server = await preview({
    root: ROOT,
    plugins: [accessGatePlugin(password)],
    preview: { host: '0.0.0.0', port, strictPort: true },
  });
  server.printUrls();
  console.log(`[Cloud] Ready on port ${port}, password required.`);

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await server.close();
      process.exit(0);
    });
  }
}

if (isDirectInvocation(process.argv[1], MODULE_PATH)) {
  start().catch((error) => {
    console.error(`[Cloud] Start refused: ${error.message}`);
    process.exitCode = 1;
  });
}
