import { celestrakTleUrl } from '../../data/spaceProviderRequests.js';

const GROUPS = new Set([
  'stations',
  'visual',
  'gps-ops',
  'glo-ops',
  'galileo',
  'geo',
  'starlink',
]);

const hasTleLines = (text) => /^1 /m.test(String(text || ''));

/**
 * Keep the last good catalog text per group in the browser's Cache Storage.
 * CelesTrak refuses (403) a repeat download of a group from one address until
 * the data updates, so a reload soon after a direct download needs this copy.
 * A browser without Cache Storage gets a store that keeps nothing.
 * @param {{caches?: CacheStorage}} [options]
 */
export function createTleCache({ caches = globalThis.caches } = {}) {
  const NAME = 'gev-celestrak-tle-v1';
  const key = (group) => `https://gev.invalid/celestrak/${group}`;
  const open = () => (caches?.open ? caches.open(NAME) : null);
  return {
    async get(group) {
      try {
        const response = await (await open())?.match(key(group));
        return response ? await response.text() : null;
      } catch {
        return null;
      }
    },
    async put(group, text) {
      try {
        await (
          await open()
        )?.put(
          key(group),
          new Response(text, { headers: { 'Content-Type': 'text/plain' } }),
        );
      } catch {
        // Storage refused (private mode, quota): the copy is a convenience.
      }
    },
  };
}

/**
 * Read catalog text from the existing group endpoint using a supplied transport.
 *
 * With `directFetchImpl` (the browser app), a failed proxy read falls back to
 * CelesTrak itself, which allows cross-origin reads: a shared cloud host is
 * refused repeat downloads, the viewer's own address usually is not. Every
 * good catalog is kept in `cache`, served marked stale when both fail.
 */
export function createSatelliteSource({
  fetchImpl = (...args) => globalThis.fetch(...args),
  directFetchImpl = null,
  cache = null,
} = {}) {
  async function readDirect(group, signal) {
    if (!directFetchImpl) return null;
    try {
      const response = await directFetchImpl(
        celestrakTleUrl(group).toString(),
        { signal, credentials: 'omit', referrerPolicy: 'no-referrer' },
      );
      const text = response.ok ? await response.text() : '';
      return hasTleLines(text) ? text : null;
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      return null;
    }
  }

  return {
    async readGroup(group, { signal } = {}) {
      if (!GROUPS.has(group)) throw new TypeError('Unknown satellite group');
      signal?.throwIfAborted();
      const response = await fetchImpl(`/api/celestrak/${group}`, { signal });
      const text = response.ok ? await response.text() : '';
      signal?.throwIfAborted();
      // The proxy serves its last copy, marked STALE-ERROR, when CelesTrak
      // is down.
      const stale = response.headers?.get?.('x-tle-cache') === 'STALE-ERROR';
      if (response.ok && hasTleLines(text)) {
        if (!stale) await cache?.put(group, text);
        return { ok: true, status: response.status, text, stale };
      }
      if (!directFetchImpl && !cache)
        return { ok: response.ok, status: response.status, text, stale };

      const direct = await readDirect(group, signal);
      signal?.throwIfAborted();
      if (direct) {
        await cache?.put(group, direct);
        return { ok: true, status: 200, text: direct, stale: false };
      }
      const kept = await cache?.get(group);
      signal?.throwIfAborted();
      if (hasTleLines(kept))
        return { ok: true, status: 200, text: kept, stale: true };
      return { ok: response.ok, status: response.status, text, stale };
    },
  };
}

/** The browser app's source: proxy first, then CelesTrak direct, then the kept copy. */
export function createBrowserSatelliteSource() {
  return createSatelliteSource({
    directFetchImpl: (...args) => globalThis.fetch(...args),
    cache: createTleCache(),
  });
}
