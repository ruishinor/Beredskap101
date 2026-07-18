import type { OfflineSnapshotSource } from '../types/offline';

export const FEED_CACHE_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;
export const FEED_CACHE_STAMP_HEADER = 'x-beredskap101-feed-cached-at';

export type FeedCacheSnapshot = {
  fetchedAt: string;
  cachedAt?: number;
  source: OfflineSnapshotSource;
};

function isFreshCachedAt(cachedAt: number, now = Date.now()): boolean {
  return Number.isFinite(cachedAt) && cachedAt > 0 && now - cachedAt <= FEED_CACHE_RETENTION_MS;
}

function resolveCachedAt(snapshot: Record<string, unknown>): number | null {
  const directCachedAt = snapshot.cachedAt;
  if (typeof directCachedAt === 'number' && Number.isFinite(directCachedAt)) {
    return directCachedAt;
  }

  const fetchedAt = snapshot.fetchedAt;
  if (typeof fetchedAt === 'string') {
    const parsed = Date.parse(fetchedAt);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
}

export function readCachedFeedSnapshot<T extends FeedCacheSnapshot>(storageKey: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as T;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.fetchedAt !== 'string' || !parsed.fetchedAt) return null;
    if (parsed.source !== 'live' && parsed.source !== 'cache' && parsed.source !== 'static') return null;

    const cachedAt = resolveCachedAt(parsed as Record<string, unknown>);
    if (!cachedAt || !isFreshCachedAt(cachedAt)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return {
      ...parsed,
      source: 'cache',
      cachedAt,
    };
  } catch {
    return null;
  }
}

export function saveCachedFeedSnapshot<T extends FeedCacheSnapshot>(storageKey: string, snapshot: T) {
  if (typeof window === 'undefined' || snapshot.source !== 'live') return;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...snapshot,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Storage is optional; the live feed still renders without it.
  }
}

export function purgeCachedFeedSnapshot(storageKey: string) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors.
  }
}

export async function stampFeedResponse(response: Response, cachedAt = Date.now()): Promise<Response> {
  const body = await response.clone().arrayBuffer();
  const headers = new Headers(response.headers);
  headers.set(FEED_CACHE_STAMP_HEADER, String(cachedAt));

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function readCachedAtFromResponse(response: Response): number | null {
  const raw = response.headers.get(FEED_CACHE_STAMP_HEADER);
  if (!raw) return null;

  const cachedAt = Number(raw);
  return Number.isFinite(cachedAt) && cachedAt > 0 ? cachedAt : null;
}

export function isFreshFeedResponse(response: Response, now = Date.now()): boolean {
  const cachedAt = readCachedAtFromResponse(response);
  return cachedAt !== null && isFreshCachedAt(cachedAt, now);
}

export function isFreshFeedCacheTimestamp(cachedAt: number, now = Date.now()): boolean {
  return isFreshCachedAt(cachedAt, now);
}

/**
 * Non-destructive freshness probe for status displays: returns the newest
 * cachedAt/fetchedAt stamp across the given feed snapshot keys, or null when
 * no feed has been fetched yet. Never purges entries — read-only.
 */
export function readFeedCacheFreshness(storageKeys: string[]): number | null {
  if (typeof window === 'undefined') return null;

  let latest: number | null = null;
  for (const storageKey of storageKeys) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as Record<string, unknown> | null;
      if (!parsed || typeof parsed !== 'object') continue;

      const cachedAt = resolveCachedAt(parsed);
      if (cachedAt && (latest === null || cachedAt > latest)) {
        latest = cachedAt;
      }
    } catch {
      // Storage may be blocked; the status display falls back to "not fetched yet".
    }
  }

  return latest;
}
