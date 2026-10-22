import { ERROR_BACKOFF_INTERVAL } from './recordPolicy.js';

// Marks English the Layers panel translates when it shows the error. Kept
// local: this module stays free of browser globals (package boundaries).
const msg = (text) => text;

const REGIONAL_REFRESH_KM = 150;

/** Great-circle distance between two {latitude, longitude} points. */
function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Own acquisition, cancellation, freshness and backoff independently of rendering. */
export function createIngestion({
  feed,
  getQuery,
  applySnapshot,
  setSourceLabel,
  applyPendingTrackingRestore,
}) {
  const methods = {
    /**
     * Whether the camera has settled far from the anchor of the last
     * regional snapshot. A fallback feed covers ~250 nm around the camera it
     * was asked for, and the poll runs every 30 s, so a scene shot that flies
     * across the planet would otherwise hold over an empty map.
     * @returns {boolean}
     */
    regionalAnchorMoved(viewer) {
      const anchor = feed._lastQueryAnchor;
      if (!anchor || !/regional/i.test(String(feed._lastCoverage || '')))
        return false;
      const query = getQuery(viewer);
      if (
        !Number.isFinite(query?.latitude) ||
        !Number.isFinite(query?.longitude)
      )
        return false;
      return distanceKm(anchor, query) > REGIONAL_REFRESH_KM;
    },

    async update(viewer, { signal = null } = {}) {
      const nowMs = Date.now();
      const trackingRefreshEpoch = ++feed._trackingRefreshEpoch;
      feed._lastTrackingRefreshOutcome = {
        epoch: trackingRefreshEpoch,
        status: 'source-unavailable',
        ids: new Set(),
        source: feed._lastSource,
        coverage: feed._lastCoverage,
      };
      if (feed._retryAt && nowMs < feed._retryAt) {
        feed._backoff = true;
        return;
      }

      const resourceController = new AbortController();
      feed._activeUpdateControllers.add(resourceController);
      const updateSignal = signal
        ? AbortSignal.any([signal, resourceController.signal])
        : resourceController.signal;
      try {
        updateSignal.throwIfAborted();
        const query = getQuery(viewer);
        const snapshot = await feed._source.getSnapshot(query, {
          signal: updateSignal,
        });
        updateSignal.throwIfAborted();
        feed._lastStatus = snapshot.status ?? 200;
        const sourceEpochMs = snapshot.observedAtMs;
        const sourceAgeMs = snapshot.ageMs;
        const sourceStale = snapshot.stale || snapshot.freshness === 'unknown';
        feed._backoff = sourceStale;
        feed._retryAt = 0;
        // i18n-ignore: English data; the panel shows it through FEED_ERROR_PATTERNS (ui/statusText.js)
        feed._lastError = sourceStale
          ? sourceAgeMs == null
            ? msg('Source snapshot time unavailable')
            : `Source snapshot ${Math.max(2, Math.round(sourceAgeMs / 60_000))} min old`
          : null;
        feed._lastSource = snapshot.source;
        feed._lastCoverage = snapshot.coverage;
        feed._lastQueryAnchor = Number.isFinite(query?.latitude) ? query : null;
        setSourceLabel(feed._lastSource);
        const accepted = applySnapshot(snapshot, viewer);
        feed._count = accepted.count;
        // Freshness belongs to the source snapshot, not the moment this browser
        // received a cached 200 response.
        feed._lastUpdate = sourceEpochMs;
        feed._lastTrackingRefreshOutcome = {
          epoch: trackingRefreshEpoch,
          status: 'accepted',
          ids: accepted.ids,
          source: feed._lastSource,
          coverage: feed._lastCoverage,
        };
        console.log(`[Data:Flights] Updated: ${feed._count} aircraft`);
        applyPendingTrackingRestore();
      } catch (e) {
        if (updateSignal.aborted || e?.name === 'AbortError') {
          throw new DOMException('Flights update aborted', 'AbortError');
        }
        console.warn('[Data:Flights] Fetch error:', e);
        feed._backoff = true;
        feed._retryAt =
          Date.now() + (e?.retryAfterMs ?? ERROR_BACKOFF_INTERVAL);
        feed._lastStatus = e?.status ?? null;
        if (e?.source) {
          feed._lastSource = e.source;
          setSourceLabel(feed._lastSource);
        }
        feed._lastError =
          e?.name === 'LiveSourceError'
            ? e.message
            : msg('Live data unavailable');
      } finally {
        feed._activeUpdateControllers.delete(resourceController);
      }
    },
  };

  return { methods };
}

/** Construct a fresh source lifetime and its refresh status. */
export function createFlightFeed(source) {
  const feed = {};
  feed._source = source;
  feed._count = 0;
  feed._lastUpdate = null;
  feed._backoff = false;
  feed._retryAt = 0;
  feed._lastError = null;
  feed._activeUpdateControllers = new Set();
  feed._lastStatus = null;
  feed._lastSource = source?.label || 'Aircraft';
  feed._lastCoverage = 'worldwide upstream snapshot';
  feed._lastQueryAnchor = null;
  feed._trackingRefreshEpoch = 0;
  feed._lastTrackingRefreshOutcome = {
    epoch: 0,
    status: 'unavailable',
    ids: new Set(),
    source: feed._lastSource,
    coverage: null,
  };
  return feed;
}
