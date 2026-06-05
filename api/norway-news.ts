import {
  dedupeAndSortNorwayItems,
  extractPolitiloggenLinks,
  extractPolitiloggenThreads,
  feedItemToNorwayNewsItem,
  fetchJson,
  fetchText,
  normalizeMetAlertItems,
  normalizePolitiloggenThreads,
  normalizeRssItems,
  type NorwayNewsItem
} from './feed-utils';

export type NorwayNewsResponse = {
  fetchedAt: string;
  items: NorwayNewsItem[];
  partialFailures: string[];
};

const SOURCES = {
  nrk: {
    url: 'https://www.nrk.no/nyheter/siste.rss',
    source: 'NRK',
    severity: 'Nyheter',
    kind: 'news' as const,
    fallbackLink: 'https://www.nrk.no/nyheter/'
  },
  digi: {
    url: 'https://www.digi.no/feeds/general.xml',
    source: 'Digi.no',
    severity: 'Teknologi',
    kind: 'news' as const,
    fallbackLink: 'https://www.digi.no/'
  },
  politiloggen: {
    url: 'https://www.politiet.no/politiloggen',
    source: 'Politiet',
    severity: 'Politiloggen',
    kind: 'politiloggen' as const,
    fallbackLink: 'https://www.politiet.no/politiloggen'
  },
  met: {
    jsonUrl: 'https://api.met.no/weatherapi/metalerts/2.0/current.json',
    source: 'MET Norway',
    severity: 'Farevarsel',
    kind: 'weather' as const,
    fallbackLink: 'https://www.met.no/vaer-og-klima/ekstremvaervarsler-og-andre-farevarsler'
  },
  dsb: {
    url: 'https://www.dsb.no/rss/rss-dsb---aktuelt/',
    source: 'DSB',
    severity: 'Beredskap',
    kind: 'official' as const,
    fallbackLink: 'https://www.dsb.no/'
  }
};

type RssSourceId = 'nrk' | 'digi' | 'dsb';

function readLimit(req: any): number {
  const raw = req.query?.limit || new URL(req.url || '/', 'http://localhost').searchParams.get('limit') || '20';
  if (raw === 'all') return 100;

  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.max(1, Math.min(parsed, 100));
}

function readLang(req: any): 'en' | 'no' {
  const raw = String(req.query?.lang || new URL(req.url || '/', 'http://localhost').searchParams.get('lang') || 'en').toLowerCase();
  return raw === 'no' ? 'no' : 'en';
}

async function fetchRssSource(sourceId: RssSourceId): Promise<NorwayNewsItem[]> {
  const source = SOURCES[sourceId];
  const xml = await fetchText(source.url);
  return normalizeRssItems(xml, { limit: 100, defaultSeverity: source.severity }).map((item) =>
    feedItemToNorwayNewsItem(item, source.source, source.kind, source.severity, source.fallbackLink)
  );
}

async function fetchPolitiloggenSource(): Promise<NorwayNewsItem[]> {
  const source = SOURCES.politiloggen;
  const html = await fetchText(source.url, 'text/html, application/xhtml+xml, */*;q=0.8');
  const threads = extractPolitiloggenThreads(html);
  const links = extractPolitiloggenLinks(html);

  return normalizePolitiloggenThreads(threads, links, 100).map((item) =>
    feedItemToNorwayNewsItem(item, source.source, source.kind, source.severity, source.fallbackLink)
  );
}

async function fetchMetSource(lang: 'en' | 'no'): Promise<NorwayNewsItem[]> {
  const source = SOURCES.met;
  const url = new URL(source.jsonUrl);
  url.searchParams.set('lang', lang);
  const payload = await fetchJson(url.toString());
  return normalizeMetAlertItems(payload, {
    limit: 100,
    locale: lang === 'no' ? 'nb-NO' : 'en-GB',
    defaultSeverity: source.severity
  }).map((item) =>
    feedItemToNorwayNewsItem(item, source.source, source.kind, source.severity, source.fallbackLink)
  );
}

async function collectItems(lang: 'en' | 'no') {
  const tasks = [
    ['nrk', () => fetchRssSource('nrk')],
    ['digi', () => fetchRssSource('digi')],
    ['politiloggen', fetchPolitiloggenSource],
    ['met', () => fetchMetSource(lang)],
    ['dsb', () => fetchRssSource('dsb')]
  ] as const;

  const settled = await Promise.allSettled(tasks.map(([, task]) => task()));
  const partialFailures: string[] = [];
  const items: NorwayNewsItem[] = [];

  settled.forEach((result, index) => {
    const sourceId = tasks[index][0];
    if (result.status === 'fulfilled') {
      items.push(...result.value);
      return;
    }
    partialFailures.push(sourceId);
  });

  return {
    items: dedupeAndSortNorwayItems(items),
    partialFailures
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const limit = readLimit(req);
  const lang = readLang(req);
  const { items, partialFailures } = await collectItems(lang);
  const payload: NorwayNewsResponse = {
    fetchedAt: new Date().toISOString(),
    items: items.slice(0, limit),
    partialFailures
  };

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
  res.status(200).json(payload);
}
