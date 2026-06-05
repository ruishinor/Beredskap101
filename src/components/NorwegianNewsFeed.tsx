import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { sourceRegistry } from '../data/sourceRegistry';
import type { OfflineFeedSnapshot, OfflineSnapshotSource } from '../types/offline';
import { escapeHtml, formatOsloDateTime } from '../utils/dateTime';
import { downloadJson } from '../utils/download';
import { readCachedFeedSnapshot, saveCachedFeedSnapshot } from '../utils/feedCache';

type NorwayNewsItem = {
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

type NorwayNewsResponse = {
  fetchedAt: string;
  items: NorwayNewsItem[];
  partialFailures: string[];
  source?: OfflineSnapshotSource;
};

type LimitOption = 5 | 10 | 20 | 50 | 100 | 'all';

const LIMIT_OPTIONS: LimitOption[] = [5, 10, 20, 50, 100, 'all'];
const CACHE_KEY_PREFIX = 'beredskap101:norway-news:snapshot:v2';

function getCacheKey(currentLang: string) {
  return `${CACHE_KEY_PREFIX}:${currentLang === 'no' ? 'no' : 'en'}`;
}

function normalizeSnapshot(payload: NorwayNewsResponse, source: OfflineSnapshotSource): OfflineFeedSnapshot<NorwayNewsItem> {
  return {
    fetchedAt: payload.fetchedAt || new Date().toISOString(),
    cachedAt: payload.source === 'cache' ? Date.now() : undefined,
    items: Array.isArray(payload.items) ? payload.items : [],
    partialFailures: Array.isArray(payload.partialFailures) ? payload.partialFailures : [],
    source,
  };
}

function createStaticSnapshot(currentLang: string): OfflineFeedSnapshot<NorwayNewsItem> {
  return {
    fetchedAt: new Date().toISOString(),
    source: 'static',
    partialFailures: [
      currentLang === 'no'
        ? 'Live nyheter er utilgjengelige. Viser bundlete offisielle kilder.'
        : 'Live news is unavailable. Showing bundled official sources.',
    ],
    items: sourceRegistry.map((source) => ({
      id: `static-source-${source.id}`,
      title: currentLang === 'no' ? source.nameNo : source.nameEn,
      summary: currentLang === 'no' ? source.summaryNo : source.summaryEn,
      link: source.homepageUrl,
      published: null,
      source: currentLang === 'no' ? source.nameNo : source.nameEn,
      severity: 'SOURCE',
      kind: 'official',
    })),
  };
}

function limitLabel(option: LimitOption, currentLang: string): string {
  return option === 'all' ? (currentLang === 'no' ? 'Alle' : 'All') : String(option);
}

function sourceInitials(source: string): string {
  const words = source
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('');
  return initials || 'B101';
}

function safeBundledImage(src?: string): string | null {
  if (!src || typeof window === 'undefined') return null;

  try {
    const url = new URL(src, window.location.origin);
    if (url.origin === window.location.origin || url.protocol === 'data:') {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function sourceLabel(source: OfflineSnapshotSource, currentLang: string): string {
  if (source === 'live') return currentLang === 'no' ? 'Live data' : 'Live data';
  if (source === 'cache') return currentLang === 'no' ? 'Bufret data' : 'Cached data';
  return currentLang === 'no' ? 'Statisk kildefallback' : 'Static source fallback';
}

export default function NorwegianNewsFeed({ currentLang }: { currentLang: string }) {
  const [snapshot, setSnapshot] = useState<OfflineFeedSnapshot<NorwayNewsItem>>(() => createStaticSnapshot(currentLang));
  const [selectedLimit, setSelectedLimit] = useState<LimitOption>(5);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadFeed = useCallback(async () => {
    const cacheKey = getCacheKey(currentLang);
    setStatusMessage('');
    setRefreshing(true);
    setLoading(true);

    try {
      const response = await fetch(`/api/norway-news?limit=100&lang=${currentLang === 'no' ? 'no' : 'en'}`);
      if (!response.ok) throw new Error('Norway news request failed');

      const payload = (await response.json()) as NorwayNewsResponse;
      const responseSource = payload.source === 'static' || payload.source === 'cache' ? payload.source : 'live';
      const nextSnapshot =
        responseSource === 'static' && (!Array.isArray(payload.items) || payload.items.length === 0)
          ? createStaticSnapshot(currentLang)
          : normalizeSnapshot(payload, responseSource);

      setSnapshot(nextSnapshot);
      saveCachedFeedSnapshot(cacheKey, nextSnapshot);
    } catch {
      const cached = readCachedFeedSnapshot<OfflineFeedSnapshot<NorwayNewsItem>>(cacheKey);
      if (cached) {
        setSnapshot(cached);
        setStatusMessage(
          currentLang === 'no'
            ? 'Live feed er utilgjengelig. Viser siste bufrede nyhetssnapshot.'
            : 'Live feed is unavailable. Showing the latest cached news snapshot.'
        );
      } else {
        setSnapshot(createStaticSnapshot(currentLang));
        setStatusMessage(
          currentLang === 'no'
            ? 'Live feed er utilgjengelig og ingen cache finnes. Viser offisielle kildekort.'
            : 'Live feed is unavailable and no cache exists. Showing official source cards.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLang]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const visibleItems = useMemo(() => {
    if (selectedLimit === 'all') return snapshot.items;
    return snapshot.items.slice(0, selectedLimit);
  }, [snapshot.items, selectedLimit]);

  const handleSaveJson = useCallback(() => {
    downloadJson(`beredskap101-norway-news-${Date.now()}.json`, {
      fetchedAt: snapshot.fetchedAt,
      cachedAt: snapshot.cachedAt ?? null,
      source: snapshot.source,
      partialFailures: snapshot.partialFailures,
      items: snapshot.items,
      savedAt: new Date().toISOString(),
      visibleLimit: selectedLimit,
    });
  }, [selectedLimit, snapshot]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank', 'width=960,height=1024');
    if (!printWindow) return;

    const locale = currentLang === 'no' ? 'nb-NO' : 'en-GB';
    const title = currentLang === 'no' ? 'Norske nyheter' : 'Norwegian news';
    const entries = visibleItems
      .map((item) => {
        const published = item.published ? formatOsloDateTime(item.published, locale) : (currentLang === 'no' ? 'Ukjent tidspunkt' : 'Time unknown');
        return `
          <article class="item">
            <div class="meta">
              <span class="chip">${escapeHtml(item.severity)}</span>
              <span>${escapeHtml(published)}</span>
            </div>
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.summary)}</p>
            <p class="source">${escapeHtml(item.source)}</p>
            <p class="link">${escapeHtml(item.link)}</p>
          </article>
        `;
      })
      .join('');

    const partialFailures = snapshot.partialFailures.length
      ? `<p class="alert">${escapeHtml(snapshot.partialFailures.join(', '))}</p>`
      : '';

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
              padding: 32px;
              color: #111827;
              background: #fff;
              line-height: 1.5;
            }
            header {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              align-items: flex-start;
              border-bottom: 2px solid #d1d5db;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            h1 { margin: 0; font-size: 24px; }
            .meta-row { font-size: 12px; color: #4b5563; margin-top: 6px; }
            .summary { font-size: 13px; color: #4b5563; max-width: 72ch; }
            .alert {
              border: 1px solid #f59e0b;
              background: #fffbeb;
              color: #92400e;
              border-radius: 8px;
              padding: 10px 12px;
              font-size: 13px;
              margin: 0 0 16px 0;
            }
            .item {
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              padding: 14px;
              margin: 0 0 14px 0;
              break-inside: avoid;
            }
            .item h2 { margin: 8px 0 8px; font-size: 18px; }
            .item p { margin: 0 0 8px; }
            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              align-items: center;
              font-size: 12px;
              color: #6b7280;
            }
            .chip {
              display: inline-flex;
              align-items: center;
              min-height: 28px;
              padding: 0 10px;
              border: 1px solid #d1d5db;
              border-radius: 999px;
              color: #0f172a;
              background: #f8fafc;
              font-weight: 700;
            }
            .source,
            .link {
              font-size: 12px;
              color: #6b7280;
              word-break: break-word;
            }
            @media print {
              body { padding: 0; }
              header { margin-top: 0; }
            }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>${escapeHtml(title)}</h1>
              <div class="meta-row">${escapeHtml(sourceLabel(snapshot.source, currentLang))}</div>
              <div class="meta-row">${escapeHtml(currentLang === 'no' ? 'Oppdatert' : 'Updated')}: ${escapeHtml(formatOsloDateTime(snapshot.fetchedAt, locale))}</div>
            </div>
            <div class="meta-row">${escapeHtml(currentLang === 'no' ? 'Viser' : 'Showing')} ${visibleItems.length} / ${snapshot.items.length}</div>
          </header>
          <p class="summary">${escapeHtml(
            currentLang === 'no'
              ? 'Utskriften bruker kun tekstinnhold fra feeden og er fri for innbakt HTML.'
              : 'The print view uses text content only and strips embedded HTML.'
          )}</p>
          ${partialFailures}
          <main>
            ${entries || `<p>${escapeHtml(currentLang === 'no' ? 'Ingen saker å vise akkurat nå.' : 'No items to show right now.')}</p>`}
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
  }, [currentLang, snapshot, visibleItems]);

  return (
    <section
      id="norway-monitoring-section"
      className="section px-4 sm:px-8 max-w-[1400px] mx-auto border-t border-[var(--border)]"
    >
      <div className="bg-[var(--bg-alt)] border border-[var(--border)] rounded-lg p-4 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold">
              {currentLang === 'no' ? 'Norske nyheter' : 'Norwegian news'}
            </h3>
            <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
              {currentLang === 'no'
                ? 'Siste saker fra norske nyhetskilder, politiloggen, farevarsler og offentlige beredskapskilder. Live data er en online-forbedring; cache og offisielle kildekort fungerer offline.'
                : 'Latest items from Norwegian news sources, the police log, weather alerts, and official preparedness sources. Live data is an online enhancement; cache and official source cards work offline.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
              {sourceLabel(snapshot.source, currentLang)}
            </span>
            {snapshot.fetchedAt && (
              <span className="text-[10px] font-mono text-[var(--muted)]">
                {currentLang === 'no' ? 'Oppdatert' : 'Updated'}: {formatOsloDateTime(snapshot.fetchedAt, currentLang === 'no' ? 'nb-NO' : 'en-GB')}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-alt)]"
              aria-label={isOpen ? (currentLang === 'no' ? 'Skjul nyhetsfeed' : 'Collapse news feed') : (currentLang === 'no' ? 'Vis nyhetsfeed' : 'Expand news feed')}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-11 items-center gap-2 px-4 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-alt)]"
            >
              <Printer className="w-3.5 h-3.5" />
              {currentLang === 'no' ? 'Skriv ut' : 'Print'}
            </button>
            <button
              type="button"
              onClick={handleSaveJson}
              className="inline-flex h-11 items-center gap-2 px-4 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-alt)]"
            >
              <Download className="w-3.5 h-3.5" />
              {currentLang === 'no' ? 'Lagre JSON' : 'Save JSON'}
            </button>
            <button
              type="button"
              onClick={loadFeed}
              className="inline-flex h-11 items-center gap-2 px-4 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold hover:border-[var(--accent)]/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-alt)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {currentLang === 'no' ? 'Oppdater feed' : 'Refresh feed'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="space-y-5">
            <div className="feed-controls norway-feed-controls" role="group" aria-label={currentLang === 'no' ? 'Lengde på norsk nyhetsfeed' : 'Norwegian news feed length'}>
              <div id="norway-limit-controls" className="feed-limit-controls flex flex-wrap items-center gap-2" aria-live="polite">
                <span className="text-sm text-[var(--muted)]">{currentLang === 'no' ? 'Vis:' : 'Show:'}</span>
                <div className="feed-control-buttons flex flex-wrap gap-2">
                  {LIMIT_OPTIONS.map((option) => (
                    <button
                      key={String(option)}
                      type="button"
                      className={`norway-size-button min-w-12 px-3 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer min-h-11 ${
                        selectedLimit === option
                          ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:border-[var(--accent)]/60'
                      }`}
                      data-norway-limit={option}
                      onClick={() => setSelectedLimit(option)}
                    >
                      {limitLabel(option, currentLang)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {snapshot.partialFailures.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted)]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {currentLang === 'no'
                    ? `Noen kilder svarte ikke: ${snapshot.partialFailures.join(', ')}.`
                    : `Some sources did not respond: ${snapshot.partialFailures.join(', ')}.`}
                </span>
              </div>
            )}

            {statusMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted)]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {loading && snapshot.items.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
                {currentLang === 'no' ? 'Henter norske nyheter...' : 'Loading Norwegian news...'}
              </div>
            )}

            {!loading && visibleItems.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
                {currentLang === 'no' ? 'Ingen saker å vise akkurat nå.' : 'No items to show right now.'}
              </div>
            )}

            <div className="space-y-4">
              {visibleItems.map((item) => {
                const safeImage = safeBundledImage(item.image);
                return (
                  <article
                    key={item.id}
                    className="feed-card bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 sm:p-5 transition-all hover:border-[var(--accent)]/45"
                    data-severity={item.severity}
                    data-search-label={`${item.title} ${item.summary} ${item.severity}`}
                    data-search-source={item.source}
                    data-feed-link={item.link}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {safeImage && (
                        <img
                          src={safeImage}
                          alt=""
                          loading="lazy"
                          className="h-28 w-full md:w-40 rounded-lg object-cover border border-[var(--border)] bg-[var(--bg)]"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-mono uppercase text-[var(--accent)]">
                            {item.severity}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted)]">
                            {item.published ? formatOsloDateTime(item.published, currentLang === 'no' ? 'nb-NO' : 'en-GB') : (currentLang === 'no' ? 'Tidspunkt ukjent' : 'Time unknown')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-base md:text-xl font-extrabold leading-snug text-[var(--text)]">{item.title}</h4>
                          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">{item.summary}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent)] hover:underline"
                          >
                            {currentLang === 'no' ? 'Vis kilde' : 'View source'}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg)] px-1 text-[10px] font-mono font-bold text-[var(--accent)]">
                              {sourceInitials(item.source)}
                            </span>
                            {item.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
