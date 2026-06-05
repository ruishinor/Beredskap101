import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, ExternalLink, Printer, Rss, RefreshCw } from 'lucide-react';
import { sourceRegistry } from '../data/sourceRegistry';
import type { OfflineSnapshotSource } from '../types/offline';
import { escapeHtml, formatOsloDateTime } from '../utils/dateTime';
import { downloadJson } from '../utils/download';
import { readCachedFeedSnapshot, saveCachedFeedSnapshot } from '../utils/feedCache';

type FeedItem = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
};

type FeedSourceResponse = {
  sourceId: string;
  name: string;
  homepageUrl: string;
  rssUrl: string | null;
  status: 'ok' | 'error' | 'no_feed';
  items: FeedItem[];
};

type FeedResponse = {
  fetchedAt: string;
  sources: FeedSourceResponse[];
  partialFailures?: string[];
  source?: OfflineSnapshotSource;
};

type SourceFeedSnapshot = {
  fetchedAt: string;
  cachedAt?: number;
  sources: FeedSourceResponse[];
  partialFailures: string[];
  source: OfflineSnapshotSource;
};

const CACHE_KEY_PREFIX = 'beredskap101:source-feeds:snapshot:v2';

function getCacheKey(currentLang: string) {
  return `${CACHE_KEY_PREFIX}:${currentLang === 'no' ? 'no' : 'en'}`;
}

function normalizeResponse(payload: FeedResponse, source: OfflineSnapshotSource): SourceFeedSnapshot {
  return {
    fetchedAt: payload.fetchedAt || new Date().toISOString(),
    cachedAt: payload.source === 'cache' ? Date.now() : undefined,
    sources: Array.isArray(payload.sources) ? payload.sources : [],
    partialFailures: Array.isArray(payload.partialFailures) ? payload.partialFailures : [],
    source,
  };
}

function createStaticSnapshot(currentLang: string): SourceFeedSnapshot {
  return {
    fetchedAt: new Date().toISOString(),
    source: 'static',
    partialFailures: [
      currentLang === 'no'
        ? 'Live kildefeeder er utilgjengelige. Viser bundlete offisielle lenker.'
        : 'Live source feeds are unavailable. Showing bundled official links.',
    ],
    sources: sourceRegistry.map((source) => ({
      sourceId: source.id,
      name: currentLang === 'no' ? source.nameNo : source.nameEn,
      homepageUrl: source.homepageUrl,
      rssUrl: source.rssUrl || null,
      status: source.rssUrl ? 'error' : 'no_feed',
      items: [],
    })),
  };
}

function sourceLabel(source: OfflineSnapshotSource, currentLang: string): string {
  if (source === 'live') return currentLang === 'no' ? 'Live feeder' : 'Live feeds';
  if (source === 'cache') return currentLang === 'no' ? 'Bufrede feeder' : 'Cached feeds';
  return currentLang === 'no' ? 'Statisk kildeliste' : 'Static source list';
}

export default function SourceLinksSection({ currentLang }: { currentLang: string }) {
  const [data, setData] = useState<SourceFeedSnapshot>(() => createStaticSnapshot(currentLang));
  const [loading, setLoading] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState('');

  useEffect(() => {
    let canceled = false;
    const cacheKey = getCacheKey(currentLang);

    async function loadSourceFeeds() {
      setLoading(true);
      setFallbackMessage('');

      try {
        const res = await fetch(`/api/source-feeds?lang=${currentLang === 'no' ? 'no' : 'en'}`);
        if (!res.ok) throw new Error('Feed request failed');
        const payload = (await res.json()) as FeedResponse;
        const responseSource = payload.source === 'static' || payload.source === 'cache' ? payload.source : 'live';
        const snapshot =
          responseSource === 'static' && (!Array.isArray(payload.sources) || payload.sources.length === 0)
            ? createStaticSnapshot(currentLang)
            : normalizeResponse(payload, responseSource);

        if (!canceled) {
          setData(snapshot);
          saveCachedFeedSnapshot(cacheKey, snapshot);
        }
      } catch {
        const cached = readCachedFeedSnapshot<SourceFeedSnapshot>(cacheKey);
        if (!canceled && cached) {
          setData(cached);
          setFallbackMessage(
            currentLang === 'no'
              ? 'Feed-tjenesten er utilgjengelig. Viser siste bufrede kildefeed.'
              : 'Feed service is unavailable. Showing the latest cached source feed.'
          );
        } else if (!canceled) {
          setData(createStaticSnapshot(currentLang));
          setFallbackMessage(
            currentLang === 'no'
              ? 'Feed-tjenesten er utilgjengelig og ingen cache finnes. Viser offisielle lenker.'
              : 'Feed service is unavailable and no cache exists. Showing official links.'
          );
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    loadSourceFeeds();

    return () => {
      canceled = true;
    };
  }, [currentLang]);

  const sourceMap = useMemo(() => {
    const map = new Map<string, FeedSourceResponse>();
    for (const source of data.sources) {
      map.set(source.sourceId, source);
    }
    return map;
  }, [data.sources]);

  const handleSaveJson = () => {
    downloadJson(`beredskap101-official-sources-${Date.now()}.json`, {
      fetchedAt: data.fetchedAt,
      cachedAt: data.cachedAt ?? null,
      source: data.source,
      partialFailures: data.partialFailures,
      sources: data.sources,
      savedAt: new Date().toISOString(),
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1024,height=1024');
    if (!printWindow) return;

    const locale = currentLang === 'no' ? 'nb-NO' : 'en-GB';
    const title = currentLang === 'no' ? 'Offisielle kilder' : 'Official sources';
    const sourceCards = sourceRegistry
      .map((source) => {
        const feed = sourceMap.get(source.id);
        const itemList = feed?.status === 'ok' && feed.items.length > 0
          ? `
              <div class="items">
                ${feed.items.map((item) => `
                  <article class="item">
                    <div class="meta">
                      <span class="chip">${escapeHtml(item.publishedAt ? formatOsloDateTime(item.publishedAt, locale) : (currentLang === 'no' ? 'Ukjent tidspunkt' : 'Time unknown'))}</span>
                    </div>
                    <h2>${escapeHtml(item.title)}</h2>
                    <p>${escapeHtml(item.summary)}</p>
                    <p class="link">${escapeHtml(item.url || source.homepageUrl)}</p>
                  </article>
                `).join('')}
              </div>
            `
          : `
              <p class="muted">
                ${escapeHtml(
                  feed?.status === 'no_feed'
                    ? (currentLang === 'no' ? 'Ingen bekreftet RSS-feed. Bruker offisiell lenke.' : 'No confirmed RSS feed. Using official site link.')
                    : feed?.status === 'error'
                      ? (currentLang === 'no' ? 'Kunne ikke hente feed nå.' : 'Unable to fetch feed right now.')
                      : (currentLang === 'no' ? 'Feed er aktiv, men ingen nye varsler akkurat nå.' : 'Feed is active, but there are no new alerts right now.')
                )}
              </p>
            `;

        return `
          <section class="source-card">
            <header>
              <div>
                <h2>${escapeHtml(currentLang === 'no' ? source.nameNo : source.nameEn)}</h2>
                <p class="summary">${escapeHtml(currentLang === 'no' ? source.summaryNo : source.summaryEn)}</p>
              </div>
              <div class="meta">
                <a href="${escapeHtml(source.homepageUrl)}">${escapeHtml(currentLang === 'no' ? 'Kilde' : 'Source')}</a>
              </div>
            </header>
            <p class="muted">${escapeHtml(sourceLabel(data.source, currentLang))}</p>
            ${itemList}
          </section>
        `;
      })
      .join('');

    const html = `<!doctype html>
      <html lang="${currentLang === 'no' ? 'nb' : 'en'}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(title)}</title>
          <style>
            :root { color-scheme: light; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
              margin: 0;
              padding: 28px;
              color: #111827;
              background: #fff;
              line-height: 1.5;
            }
            header.page-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              border-bottom: 2px solid #d1d5db;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            h1 { margin: 0; font-size: 24px; }
            .meta, .muted, .summary { font-size: 12px; color: #4b5563; }
            .summary { max-width: 72ch; margin-top: 6px; }
            .grid {
              column-count: 2;
              column-gap: 16px;
            }
            .source-card {
              break-inside: avoid;
              display: inline-block;
              width: 100%;
              margin: 0 0 16px;
              padding: 14px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              background: #fff;
            }
            .source-card header {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              align-items: flex-start;
            }
            .source-card h2 { margin: 0 0 6px; font-size: 18px; }
            .source-card p { margin: 0 0 10px; }
            .items { display: block; margin-top: 10px; }
            .item {
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
              margin-top: 10px;
            }
            .item h2 { margin: 8px 0 8px; font-size: 16px; }
            .item p { margin: 0 0 8px; }
            .chip {
              display: inline-flex;
              align-items: center;
              min-height: 28px;
              padding: 0 10px;
              border-radius: 999px;
              border: 1px solid #d1d5db;
              background: #f8fafc;
              color: #0f172a;
              font-weight: 700;
            }
            .link { word-break: break-word; font-size: 12px; color: #6b7280; }
            .warning {
              border: 1px solid #f59e0b;
              background: #fffbeb;
              color: #92400e;
              border-radius: 8px;
              padding: 10px 12px;
              margin-bottom: 16px;
            }
            @media print {
              body { padding: 0; }
              .grid { column-count: 1; }
            }
          </style>
        </head>
        <body>
          <header class="page-header">
            <div>
              <h1>${escapeHtml(title)}</h1>
              <p class="summary">${escapeHtml(currentLang === 'no'
                ? 'Printvisningen bruker kun tekstdata. Feed-HTML blir ikke gjengitt direkte.'
                : 'The print view uses text data only. Feed HTML is never rendered directly.')}</p>
              <p class="meta">${escapeHtml(currentLang === 'no' ? 'Oppdatert' : 'Updated')}: ${escapeHtml(formatOsloDateTime(data.fetchedAt, locale))}</p>
            </div>
            <div class="meta">${escapeHtml(currentLang === 'no' ? 'Kilde' : 'Source')}: ${escapeHtml(sourceLabel(data.source, currentLang))}</div>
          </header>
          ${data.partialFailures.length > 0 ? `<div class="warning">${escapeHtml(data.partialFailures.join(', '))}</div>` : ''}
          <main class="grid">
            ${sourceCards}
          </main>
        </body>
      </html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <section id="official-sources-section" className="section py-12 px-4 sm:px-8 max-w-[1400px] mx-auto border-t border-[var(--border)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold">
            {currentLang === 'no' ? 'Offisielle kilder' : 'Official sources'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {currentLang === 'no'
              ? 'Live feeder er valgfrie online-forbedringer. De offisielle kildekortene er bundlet for offline bruk.'
              : 'Live feeds are optional online enhancements. Official source cards are bundled for offline use.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
            {sourceLabel(data.source, currentLang)}
          </span>
          {data.fetchedAt && (
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {currentLang === 'no' ? 'Oppdatert' : 'Updated'}: {formatOsloDateTime(data.fetchedAt, currentLang === 'no' ? 'nb-NO' : 'en-GB')}
            </span>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <Printer className="w-3.5 h-3.5" />
            {currentLang === 'no' ? 'Skriv ut' : 'Print'}
          </button>
          <button
            type="button"
            onClick={handleSaveJson}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <Download className="w-3.5 h-3.5" />
            {currentLang === 'no' ? 'Lagre JSON' : 'Save JSON'}
          </button>
          <button
            type="button"
            onClick={() => {
              const cacheKey = getCacheKey(currentLang);
              setLoading(true);
              void (async () => {
                try {
                  const res = await fetch('/api/source-feeds');
                  if (!res.ok) throw new Error('Feed request failed');
                  const payload = (await res.json()) as FeedResponse;
                  const responseSource = payload.source === 'static' || payload.source === 'cache' ? payload.source : 'live';
                  const snapshot =
                    responseSource === 'static' && (!Array.isArray(payload.sources) || payload.sources.length === 0)
                      ? createStaticSnapshot(currentLang)
                      : normalizeResponse(payload, responseSource);
                  setData(snapshot);
                  saveCachedFeedSnapshot(cacheKey, snapshot);
                } catch {
                  const cached = readCachedFeedSnapshot<SourceFeedSnapshot>(cacheKey);
                  if (cached) {
                    setData(cached);
                    setFallbackMessage(
                      currentLang === 'no'
                        ? 'Feed-tjenesten er utilgjengelig. Viser siste bufrede kildefeed.'
                        : 'Feed service is unavailable. Showing the latest cached source feed.'
                    );
                  } else {
                    setData(createStaticSnapshot(currentLang));
                  }
                } finally {
                  setLoading(false);
                }
              })();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {currentLang === 'no' ? 'Oppdater' : 'Refresh'}
          </button>
        </div>
      </div>

      {(fallbackMessage || data.partialFailures.length > 0) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted)]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{fallbackMessage || data.partialFailures.join(', ')}</span>
        </div>
      )}

      {loading && data.sources.length === 0 && (
        <div className="mb-4 rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          {currentLang === 'no' ? 'Henter offisielle kildefeeder...' : 'Loading official source feeds...'}
        </div>
      )}

      <div className="columns-1 lg:columns-2 gap-4">
        {sourceRegistry.map((source) => {
          const feed = sourceMap.get(source.id);
          return (
            <article key={source.id} className="mb-4 break-inside-avoid bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm md:text-base font-bold">
                    {currentLang === 'no' ? source.nameNo : source.nameEn}
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    {currentLang === 'no' ? source.summaryNo : source.summaryEn}
                  </p>
                </div>
                <a
                  href={source.homepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-xs font-bold text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{currentLang === 'no' ? 'Kilde' : 'Source'}</span>
                </a>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
                  {sourceLabel(data.source, currentLang)}
                </span>
                {feed?.status === 'ok' && (
                  <span className="text-[10px] font-mono text-[var(--muted)]">
                    {currentLang === 'no' ? 'Feed aktiv' : 'Feed active'}
                  </span>
                )}
              </div>

              {feed?.status === 'ok' && feed.items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {feed.items.slice(0, 4).map((item, idx) => (
                    <a
                      key={`${source.id}-${item.url || item.title || idx}`}
                      href={item.url || source.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] mb-1">
                        <Rss className="w-3 h-3" />
                        <span>{item.publishedAt ? formatOsloDateTime(item.publishedAt, currentLang === 'no' ? 'nb-NO' : 'en-GB') : '-'}</span>
                      </div>
                      <p className="text-xs font-semibold leading-snug">{item.title}</p>
                    </a>
                  ))}
                </div>
              )}

              {feed?.status === 'ok' && feed.items.length === 0 && (
                <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === 'no'
                      ? 'Feed er aktiv, men ingen nye varsler akkurat nå.'
                      : 'Feed is active, but there are no new alerts right now.'}
                  </span>
                </div>
              )}

              {(feed?.status === 'no_feed' || (!feed && !loading)) && (
                <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === 'no'
                      ? 'Ingen bekreftet RSS-feed. Bruker offisiell lenke.'
                      : 'No confirmed RSS feed. Using official site link.'}
                  </span>
                </div>
              )}

              {feed?.status === 'error' && (
                <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {data.source === 'static'
                      ? currentLang === 'no'
                        ? 'Live feed ikke tilgjengelig offline. Bruk offisiell lenke.'
                        : 'Live feed is not available offline. Use the official link.'
                      : currentLang === 'no'
                        ? 'Kunne ikke hente feed nå.'
                        : 'Unable to fetch feed right now.'}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
