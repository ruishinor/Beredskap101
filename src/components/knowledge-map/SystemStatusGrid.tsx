import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ConnectivityState } from '../../utils/connectivityTelemetry';
import { readFeedCacheFreshness } from '../../utils/feedCache';
import { formatOsloDateTime } from '../../utils/dateTime';

type CacheStatus = 'unsupported' | 'preparing' | 'ready';

const FEED_CACHE_KEYS = [
  'beredskap101:norway-news:snapshot:v2:no',
  'beredskap101:norway-news:snapshot:v2:en',
  'beredskap101:source-feeds:snapshot:v2:no',
  'beredskap101:source-feeds:snapshot:v2:en',
];

function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Offline-cache readiness is gated on the service worker readiness handshake:
 * navigator.serviceWorker.ready only resolves after install + activate, and a
 * failed workbox precache fails install — so an active registration means the
 * precache completed. The raw controller flag alone is never treated as ready.
 */
function useOfflineCacheStatus(): CacheStatus {
  const [status, setStatus] = useState<CacheStatus>(() =>
    isServiceWorkerSupported() ? 'preparing' : 'unsupported'
  );

  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      setStatus('unsupported');
      return;
    }

    let cancelled = false;
    const evaluate = () => {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (!cancelled) setStatus(registration.active ? 'ready' : 'preparing');
        })
        .catch(() => {
          if (!cancelled) setStatus('preparing');
        });
    };

    evaluate();
    navigator.serviceWorker.addEventListener('controllerchange', evaluate);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', evaluate);
    };
  }, []);

  return status;
}

function useFeedFreshness(): number | null {
  const [freshness, setFreshness] = useState<number | null>(() => readFeedCacheFreshness(FEED_CACHE_KEYS));

  useEffect(() => {
    const refresh = () => setFreshness(readFeedCacheFreshness(FEED_CACHE_KEYS));
    const intervalId = window.setInterval(refresh, 60000);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return freshness;
}

function useBrowserOnline(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

function StatusCard({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'neutral' | 'accent';
  testId: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'text-[var(--status-success-text)]'
      : tone === 'warning'
      ? 'text-[var(--status-warning-text)]'
      : tone === 'accent'
      ? 'text-[var(--accent)]'
      : 'text-[var(--text-muted)]';

  return (
    <div className="border border-[var(--border-muted)] rounded-md p-3 bg-black/10" data-testid={testId}>
      <small className="text-[10px] text-[var(--text-dim)] font-mono block tracking-wider uppercase mb-0.5">
        {label}
      </small>
      <strong className={`text-[12px] font-mono tracking-wide ${toneClass}`}>{value}</strong>
    </div>
  );
}

export default function SystemStatusGrid({
  connState,
  guideCount,
  currentLang,
}: {
  connState: ConnectivityState;
  guideCount: number;
  currentLang: string;
}) {
  const { t } = useTranslation();
  const cacheStatus = useOfflineCacheStatus();
  const feedFreshness = useFeedFreshness();
  const browserOnline = useBrowserOnline();

  // The browser's own online/offline signal wins: offline is this app's
  // designed mode, so it renders as a warn/neutral state, never red.
  const effectiveConn: ConnectivityState = browserOnline ? connState : 'OFFLINE';
  const connectionValue =
    effectiveConn === 'ONLINE'
      ? t('status_online')
      : effectiveConn === 'DEGRADED'
      ? t('status_degraded')
      : t('status_offline');
  const connectionTone = effectiveConn === 'ONLINE' ? 'success' : 'warning';

  const cacheValue =
    cacheStatus === 'ready'
      ? t('status_cache_ready')
      : cacheStatus === 'preparing'
      ? t('status_cache_preparing')
      : t('status_cache_unavailable');
  const cacheTone = cacheStatus === 'ready' ? 'success' : cacheStatus === 'preparing' ? 'neutral' : 'warning';

  const feedValue = feedFreshness
    ? formatOsloDateTime(feedFreshness, currentLang === 'no' ? 'nb-NO' : 'en-GB')
    : t('status_feed_never');
  const feedTone = feedFreshness ? 'neutral' : 'neutral';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
      <StatusCard label={t('status_label_connection')} value={connectionValue} tone={connectionTone} testId="status-connection" />
      <StatusCard label={t('status_label_cache')} value={cacheValue} tone={cacheTone} testId="status-cache" />
      <StatusCard label={t('status_label_feed')} value={feedValue} tone={feedTone} testId="status-feed" />
      <StatusCard label={t('status_label_guides')} value={String(guideCount)} tone="accent" testId="status-guides" />
    </div>
  );
}
