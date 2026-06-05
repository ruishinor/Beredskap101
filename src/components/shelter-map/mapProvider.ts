import { resolveMapPackConfig, type MapPackConfig } from './mapPackConfig';

export type ShelterMapProviderId = 'fallback-shelter-map' | 'pmtiles-vector-map';
export type ShelterMapPackageStatus = 'not-installed' | 'installed' | 'stale' | 'failed-to-load';
export type ShelterMapPackageMode = 'fallback-included' | 'local-public-file' | 'cached-download';

export type ShelterMapProviderState = {
  preferredProvider: ShelterMapProviderId;
  activeProvider: ShelterMapProviderId;
  packageStatus: ShelterMapPackageStatus;
  packageMode: ShelterMapPackageMode;
  config: MapPackConfig | null;
  statusReason?: string;
};

const DEFAULT_STALE_AFTER_DAYS = 180;
const DEFAULT_MIN_ARCHIVE_BYTES = 1024 * 1024;

const FALLBACK_PROVIDER_STATE: ShelterMapProviderState = {
  preferredProvider: 'fallback-shelter-map',
  activeProvider: 'fallback-shelter-map',
  packageStatus: 'not-installed',
  packageMode: 'fallback-included',
  config: null,
};

function isMapPackStale(config: MapPackConfig): boolean {
  const staleAfterDays = config.staleAfterDays ?? DEFAULT_STALE_AFTER_DAYS;
  const referenceDate = config.lastUpdatedAt || config.installedAt;
  const thresholdMs = staleAfterDays * 24 * 60 * 60 * 1000;
  return Date.now() - Date.parse(referenceDate) > thresholdMs;
}

async function isDeclaredArchiveAvailable(config: MapPackConfig): Promise<boolean> {
  if (!config.archiveUrl) return true;

  try {
    const response = await fetch(config.archiveUrl, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) return false;
    const contentLength = Number(response.headers.get('content-length') || 0);
    const minimumBytes = config.minArchiveBytes ?? DEFAULT_MIN_ARCHIVE_BYTES;
    return Number.isFinite(contentLength) && contentLength >= minimumBytes;
  } catch {
    return false;
  }
}

export async function resolveShelterMapProviderState(): Promise<ShelterMapProviderState> {
  const config = await resolveMapPackConfig();
  if (!config) return FALLBACK_PROVIDER_STATE;

  const archiveAvailable = await isDeclaredArchiveAvailable(config);
  if (!archiveAvailable) {
    return {
      ...FALLBACK_PROVIDER_STATE,
      statusReason: 'Declared PMTiles archive is missing or below the minimum package size.',
    };
  }

  const packageStatus: ShelterMapPackageStatus = isMapPackStale(config) ? 'stale' : 'installed';

  return {
    preferredProvider: 'pmtiles-vector-map',
    activeProvider: 'pmtiles-vector-map',
    packageStatus,
    packageMode: config.mode,
    config,
  };
}

export function markShelterMapProviderFailure(
  state: ShelterMapProviderState,
  reason?: string
): ShelterMapProviderState {
  return {
    ...state,
    activeProvider: 'fallback-shelter-map',
    packageStatus: 'failed-to-load',
    statusReason: reason,
  };
}

export function getFallbackProviderState(): ShelterMapProviderState {
  return { ...FALLBACK_PROVIDER_STATE };
}
