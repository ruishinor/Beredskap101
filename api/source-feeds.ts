import {
  dedupeAndSortFeedItems,
  extractPolitiloggenLinks,
  extractPolitiloggenThreads,
  fetchJson,
  fetchText,
  cachedFeedResponse,
  mapWithConcurrency,
  normalizeMetAlertItems,
  normalizePolitiloggenThreads,
  normalizeRssItems
} from './feed-utils';

type SourceConfig = {
  id: string;
  name: string;
  homepageUrl: string;
  rssUrl?: string;
  jsonUrl?: string;
  parser?: 'rss' | 'politiloggen' | 'metalerts';
};

const FEED_SOURCES: SourceConfig[] = [
  {
    id: 'dsb',
    name: 'DSB',
    homepageUrl: 'https://www.dsb.no/',
    rssUrl: 'https://www.dsb.no/rss/rss-dsb---aktuelt/'
  },
  {
    id: 'politiet-news',
    name: 'Politiloggen',
    homepageUrl: 'https://www.politiet.no/politiloggen',
    parser: 'politiloggen'
  },
  {
    id: 'jd',
    name: 'Justis- og beredskapsdepartementet',
    homepageUrl: 'https://www.regjeringen.no/no/dep/jd/id463/',
    rssUrl: 'https://www.regjeringen.no/no/rss/Rss/2581966/?ownerid=463'
  },
  {
    id: 'nve',
    name: 'NVE',
    homepageUrl: 'https://www.nve.no/nyheter/nyhetsarkiv/'
  },
  {
    id: 'sivilforsvaret',
    name: 'Sivilforsvaret',
    homepageUrl: 'https://www.sivilforsvaret.no/aktuelt/'
  },
  {
    id: 'politiet-beredskap',
    name: 'Politiets rad om beredskap',
    homepageUrl: 'https://www.politiet.no/rad/beredskap'
  },
  {
    id: 'met-no',
    name: 'Meteorologisk institutt farevarsler',
    homepageUrl: 'https://www.met.no/vaer-og-klima/ekstremvaervarsler-og-andre-farevarsler',
    jsonUrl: 'https://api.met.no/weatherapi/metalerts/2.0/current.json',
    parser: 'metalerts'
  }
];

function readLang(req: any): 'en' | 'no' {
  const raw = String(req.query?.lang || new URL(req.url || '/', 'http://localhost').searchParams.get('lang') || 'en').toLowerCase();
  return raw === 'no' ? 'no' : 'en';
}

async function fetchPolitiloggen(source: SourceConfig) {
  const html = await fetchText(source.homepageUrl, 'text/html, application/xhtml+xml, */*;q=0.8');
  const threads = extractPolitiloggenThreads(html);
  const links = extractPolitiloggenLinks(html);
  const items = normalizePolitiloggenThreads(threads, links, 4);

  return {
    sourceId: source.id,
    name: source.name,
    homepageUrl: source.homepageUrl,
    rssUrl: null,
    status: items.length > 0 ? 'ok' : 'error',
    items
  };
}

async function fetchRssFeed(source: SourceConfig) {
  if (!source.rssUrl) {
    return {
      sourceId: source.id,
      name: source.name,
      homepageUrl: source.homepageUrl,
      rssUrl: null,
      status: 'no_feed',
      items: []
    };
  }

  const text = await fetchText(source.rssUrl);
  const items = dedupeAndSortFeedItems(normalizeRssItems(text, { limit: 4 }));

  return {
    sourceId: source.id,
    name: source.name,
    homepageUrl: source.homepageUrl,
    rssUrl: source.rssUrl,
    status: 'ok',
    items
  };
}

async function fetchMetAlerts(source: SourceConfig, lang: 'en' | 'no') {
  if (!source.jsonUrl) {
    return {
      sourceId: source.id,
      name: source.name,
      homepageUrl: source.homepageUrl,
      rssUrl: null,
      status: 'no_feed',
      items: []
    };
  }

  const url = new URL(source.jsonUrl);
  url.searchParams.set('lang', lang);
  const payload = await fetchJson(url.toString());
  const items = dedupeAndSortFeedItems(
    normalizeMetAlertItems(payload, {
      limit: 4,
      locale: lang === 'no' ? 'nb-NO' : 'en-GB'
    })
  );

  return {
    sourceId: source.id,
    name: source.name,
    homepageUrl: source.homepageUrl,
    rssUrl: null,
    status: 'ok',
    items
  };
}

async function fetchFeed(source: SourceConfig, lang: 'en' | 'no') {
  try {
    if (source.parser === 'politiloggen') {
      return await fetchPolitiloggen(source);
    }

    if (source.parser === 'metalerts') {
      return await fetchMetAlerts(source, lang);
    }

    return await fetchRssFeed(source);
  } catch {
    return {
      sourceId: source.id,
      name: source.name,
      homepageUrl: source.homepageUrl,
      rssUrl: source.rssUrl || null,
      status: 'error',
      items: []
    };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const lang = readLang(req);
  const payload = await cachedFeedResponse(`source-feeds:${lang}`, async () => ({
    fetchedAt: new Date().toISOString(),
    sources: await mapWithConcurrency(FEED_SOURCES, 4, (source) => fetchFeed(source, lang)),
  }));
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.status(200).json(payload);
}
