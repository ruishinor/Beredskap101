import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { formatOsloDateTimeRange, type OsloDateLocale } from '../src/utils/dateTime';

export type NormalizedFeedItem = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
  source?: string;
  severity?: string;
  image?: string;
};

export type NorwayNewsItem = {
  id: string;
  title: string;
  summary: string;
  link: string;
  published: string | null;
  source: string;
  severity: string;
  image?: string;
  kind: 'news' | 'politiloggen' | 'weather' | 'official';
};

type MetAlertFeature = {
  properties?: {
    area?: string;
    awarenessResponse?: string;
    awarenessSeriousness?: string;
    awareness_type?: string;
    awareness_level?: string;
    contact?: string;
    county?: string[];
    description?: string;
    event?: string;
    eventAwarenessName?: string;
    eventEndingTime?: string;
    instruction?: string;
    municipality?: string[];
    resources?: Array<{ description?: string; mimeType?: string; uri?: string }>;
    riskMatrixColor?: string;
    severity?: string;
    status?: string;
    title?: string;
    web?: string;
  };
  when?: {
    interval?: [string, string];
  };
};

type PolitiloggenMessage = {
  text?: string;
  createdOn?: string;
};

type PolitiloggenThread = {
  id?: string;
  district?: string;
  category?: string;
  municipality?: string;
  area?: string;
  createdOn?: string;
  updatedOn?: string;
  lastMessageOn?: string;
  isActive?: boolean;
  messages?: PolitiloggenMessage[];
};

const POLITILOGGEN_URL = 'https://www.politiet.no/politiloggen';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true
});

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity in named) return named[entity];
    if (entity.startsWith('#x')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return match;
  });
}

export function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  for (const key of ['#text', '#cdata-section', 'text']) {
    if (typeof record[key] === 'string') return record[key] as string;
  }

  return '';
}

export function cleanText(value: unknown): string {
  return decodeHtmlEntities(toText(value))
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stableId(...parts: Array<string | null | undefined>): string {
  return createHash('sha1')
    .update(parts.filter(Boolean).join('|').toLowerCase())
    .digest('hex')
    .slice(0, 16);
}

export function normalizeDate(value: unknown): string | null {
  const raw = toText(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function firstStringUrl(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  const candidates = [record['@_url'], record['@_href'], record.url, record.href, record['#text']];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

export function normalizeExternalUrl(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

export function extractLink(item: any): string {
  const links = toArray(item?.link);
  for (const link of links) {
    const url = normalizeExternalUrl(firstStringUrl(link));
    if (url) return url;
  }

  const guid = normalizeExternalUrl(firstStringUrl(item?.guid));
  if (guid) return guid;

  return '';
}

export function extractImage(item: any): string | undefined {
  const fields = [
    item?.['media:content'],
    item?.['media:thumbnail'],
    item?.enclosure,
    item?.image,
    item?.['itunes:image']
  ];

  for (const field of fields) {
    for (const candidate of toArray(field)) {
      const url = normalizeExternalUrl(firstStringUrl(candidate));
      if (url) return url;
    }
  }

  return undefined;
}

function extractSeverity(item: any, fallback?: string): string | undefined {
  const categories = toArray(item?.category);
  for (const category of categories) {
    const text = cleanText(category);
    if (text) return text;
  }
  return fallback;
}

export function normalizeRssItems(
  xmlBody: string,
  options: { limit?: number; defaultSeverity?: string } = {}
): NormalizedFeedItem[] {
  const parsed = parser.parse(xmlBody);
  const rssItems = toArray(parsed?.rss?.channel?.item);
  const atomItems = toArray(parsed?.feed?.entry);
  const base = rssItems.length > 0 ? rssItems : atomItems;
  const limit = options.limit ?? base.length;

  return base.slice(0, limit).map((item: any) => {
    const title = cleanText(item?.title) || 'Untitled';
    const summary = cleanText(item?.description) || cleanText(item?.summary) || cleanText(item?.content);
    const rawDate = item?.pubDate || item?.published || item?.updated || item?.['dc:date'] || null;

    return {
      title,
      url: extractLink(item),
      summary,
      publishedAt: normalizeDate(rawDate),
      severity: extractSeverity(item, options.defaultSeverity),
      image: extractImage(item)
    };
  });
}

function normalizeMetAlertInterval(feature: MetAlertFeature): [string | null, string | null] {
  const interval = Array.isArray(feature.when?.interval) ? feature.when?.interval : [];
  const start = normalizeDate(interval[0] || null);
  const end = normalizeDate(interval[1] || feature.properties?.eventEndingTime || null);
  return [start, end];
}

function normalizeMetAlertTitle(feature: MetAlertFeature, locale: OsloDateLocale): string {
  const properties = feature.properties || {};
  const eventName = cleanText(properties.eventAwarenessName) || cleanText(properties.event) || 'Weather alert';
  const area =
    cleanText(properties.area) ||
    toArray(properties.municipality).map(cleanText).filter(Boolean).join(', ') ||
    toArray(properties.county).map(cleanText).filter(Boolean).join(', ') ||
    'Norway';

  const [start, end] = normalizeMetAlertInterval(feature);
  const range = formatOsloDateTimeRange(start, end, locale);

  return [eventName, area, range === '—' ? null : range].filter(Boolean).join(', ');
}

export function normalizeMetAlertItems(
  payload: unknown,
  options: { limit?: number; locale?: OsloDateLocale; defaultSeverity?: string } = {}
): NormalizedFeedItem[] {
  const payloadRecord = payload as { features?: unknown };
  const features = Array.isArray(payloadRecord.features) ? (payloadRecord.features as MetAlertFeature[]) : [];
  const limit = options.limit ?? features.length;
  const locale = options.locale ?? 'en-GB';

  return features.slice(0, limit).map((feature) => {
    const properties = feature.properties || {};
    const [start, end] = normalizeMetAlertInterval(feature);
    const summary = cleanText(properties.instruction) || cleanText(properties.description) || cleanText(properties.title);
    const severity =
      cleanText(properties.riskMatrixColor) ||
      cleanText(properties.severity) ||
      cleanText(properties.awarenessSeriousness) ||
      options.defaultSeverity;
    const resourceUrl = toArray(properties.resources)
      .map((resource) => normalizeExternalUrl(cleanText(resource?.uri)))
      .find((candidate): candidate is string => Boolean(candidate));
    const url =
      normalizeExternalUrl(cleanText(properties.web)) ||
      resourceUrl ||
      '';

    return {
      title: normalizeMetAlertTitle(feature, locale),
      url,
      summary: summary || normalizeMetAlertTitle(feature, locale),
      publishedAt: start || end,
      severity,
      image: undefined
    };
  });
}

function getFeedFetchTimeoutMs(): number {
  const configured = Number.parseInt(process.env.B101_FEED_TIMEOUT_MS || '', 10);
  if (!Number.isFinite(configured)) return 15000;
  return Math.max(500, Math.min(configured, 15000));
}

const MAX_FEED_BODY_BYTES = 2 * 1024 * 1024;

async function readBoundedBody(response: Response, signal: AbortSignal): Promise<string> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const read = async () => {
    if (!response.body) {
      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > MAX_FEED_BODY_BYTES) throw new Error('Feed response is too large');
      return text;
    }
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_FEED_BODY_BYTES) throw new Error('Feed response is too large');
        chunks.push(value);
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      return new TextDecoder().decode(bytes);
    } catch (error) {
      void reader.cancel().catch(() => {});
      throw error;
    } finally { reader.releaseLock(); }
  };
  if (signal.aborted) throw new Error('Feed fetch timed out');
  let onAbort: (() => void) | undefined;
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => {
      void reader?.cancel().catch(() => {});
      reject(new Error('Feed fetch timed out'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try { return await Promise.race([read(), aborted]); }
  finally { if (onAbort) signal.removeEventListener('abort', onAbort); }
}

export async function mapWithConcurrency<T, R>(items: readonly T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }));
  return results;
}

const feedResponseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlightFeeds = new Map<string, Promise<unknown>>();

export async function cachedFeedResponse<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cached = feedResponseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const running = inFlightFeeds.get(key);
  if (running) return running as Promise<T>;
  const task = load().then((value) => {
    if (feedResponseCache.size >= 100) feedResponseCache.delete(feedResponseCache.keys().next().value!);
    feedResponseCache.set(key, { expiresAt: Date.now() + 60_000, value });
    return value;
  }).finally(() => inFlightFeeds.delete(key));
  inFlightFeeds.set(key, task);
  return task;
}

export async function fetchText(url: string, accept = 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getFeedFetchTimeoutMs());

  try {
    const response = await fetch(url, {
      headers: {
        Accept: accept,
        'User-Agent': 'Beredskap101/1.0 (+https://beredskap101.no)'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Fetch failed for ${url}: ${response.status}`);
    }

    return await readBoundedBody(response, controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJson(url: string, accept = 'application/json, text/json, */*;q=0.8') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getFeedFetchTimeoutMs());

  try {
    const response = await fetch(url, {
      headers: {
        Accept: accept,
        'User-Agent': 'Beredskap101/1.0 (+https://beredskap101.no)'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Fetch failed for ${url}: ${response.status}`);
    }

    return JSON.parse(await readBoundedBody(response, controller.signal));
  } finally {
    clearTimeout(timeout);
  }
}

function extractNextFlightStrings(html: string): string[] {
  const strings: string[] = [];
  const pattern = /self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    try {
      const payload = JSON.parse(match[1]);
      if (Array.isArray(payload)) {
        for (const entry of payload) {
          if (typeof entry === 'string') strings.push(entry);
        }
      }
    } catch {
      // Some script chunks may not be JSON-safe. Other chunks usually contain the data.
    }
  }

  return strings;
}

function parseObjectAfterKey(candidate: string, key: string): any | null {
  const keyIndex = candidate.indexOf(`"${key}"`);
  if (keyIndex < 0) return null;

  const colonIndex = candidate.indexOf(':', keyIndex);
  const objectStart = candidate.indexOf('{', colonIndex);
  if (colonIndex < 0 || objectStart < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < candidate.length; index += 1) {
    const char = candidate[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(objectStart, index + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function absolutePolitiloggenUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return POLITILOGGEN_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `https://www.politiet.no${pathOrUrl}`;
  return POLITILOGGEN_URL;
}

export function extractPolitiloggenLinks(html: string): Map<string, string> {
  const links = new Map<string, string>();
  const candidates = [
    html,
    ...extractNextFlightStrings(html),
    html.replace(/\\"/g, '"')
  ];

  for (const candidate of candidates) {
    const patterns = [
      /href="(\/politiloggen\/hendelse\/([^"\\/?#]+)[^"]*)"/g,
      /href":"(\/politiloggen\/hendelse\/([^"\\/?#]+)[^"]*)"/g
    ];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(candidate))) {
        links.set(match[2], absolutePolitiloggenUrl(match[1]));
      }
    }
  }

  return links;
}

export function extractPolitiloggenThreads(html: string): PolitiloggenThread[] {
  const candidates = [
    ...extractNextFlightStrings(html),
    html.replace(/\\"/g, '"'),
    html
  ];

  for (const candidate of candidates) {
    const initialThreads = parseObjectAfterKey(candidate, 'initialThreads');
    const threads = initialThreads?.messageThreads;

    if (Array.isArray(threads)) {
      return threads;
    }
  }

  return [];
}

export function normalizePolitiloggenThreads(
  threads: PolitiloggenThread[],
  linkMap = new Map<string, string>(),
  limit = 20
): NormalizedFeedItem[] {
  return threads.slice(0, limit).map((thread) => {
    const messages = toArray(thread.messages);
    const latestMessage = messages[messages.length - 1] || messages[0] || {};
    const municipality = cleanText(thread.municipality) || 'Norge';
    const area = cleanText(thread.area);
    const category = cleanText(thread.category) || (thread.isActive ? 'Aktiv hendelse' : 'Politiloggen');
    const title = `${category}: ${municipality}${area ? `, ${area}` : ''}`;
    const summary = cleanText(latestMessage.text) || title;
    const publishedAt = normalizeDate(thread.lastMessageOn || thread.updatedOn || thread.createdOn || latestMessage.createdOn || null);

    return {
      title,
      url: absolutePolitiloggenUrl(thread.id ? linkMap.get(thread.id) : undefined),
      summary,
      publishedAt,
      source: cleanText(thread.district) || 'Politiet',
      severity: category
    };
  });
}

function sortableTime(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizedKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function dedupeAndSortFeedItems(items: NormalizedFeedItem[]): NormalizedFeedItem[] {
  const seen = new Set<string>();
  const deduped: NormalizedFeedItem[] = [];

  for (const item of items) {
    const key = item.url || `${normalizedKey(item.title)}|${item.publishedAt || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.sort((a, b) => sortableTime(b.publishedAt) - sortableTime(a.publishedAt));
}

export function dedupeAndSortNorwayItems(items: NorwayNewsItem[]): NorwayNewsItem[] {
  const seen = new Set<string>();
  const deduped: NorwayNewsItem[] = [];

  for (const item of items) {
    const key = item.link || `${normalizedKey(item.title)}|${item.published || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.sort((a, b) => sortableTime(b.published) - sortableTime(a.published));
}

export function feedItemToNorwayNewsItem(
  item: NormalizedFeedItem,
  source: string,
  kind: NorwayNewsItem['kind'],
  fallbackSeverity: string,
  fallbackLink: string
): NorwayNewsItem {
  return {
    id: stableId(source, item.url || fallbackLink, item.title, item.publishedAt),
    title: item.title,
    summary: item.summary || item.title,
    link: item.url || fallbackLink,
    published: item.publishedAt,
    source: item.source || source,
    severity: item.severity || fallbackSeverity,
    image: item.image,
    kind
  };
}
