export type MapPackMode = 'local-public-file' | 'cached-download';

export type MapPackConfig = {
  version: 1;
  packageId: string;
  mode: MapPackMode;
  styleUrl: string;
  archiveUrl?: string;
  minArchiveBytes?: number;
  installedAt: string;
  lastUpdatedAt?: string;
  staleAfterDays?: number;
};

export const MAP_PACK_MANIFEST_PATH = '/maps/pmtiles-manifest.json';
export const MAP_PACK_LOCAL_STORAGE_KEY = 'beredskap101.pmtiles.mapPack.v1';

function isMapPackMode(value: unknown): value is MapPackMode {
  return value === 'local-public-file' || value === 'cached-download';
}

function isIsoDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function normalizeMapPackConfig(candidate: unknown): MapPackConfig | null {
  if (!candidate || typeof candidate !== 'object') return null;

  const row = candidate as Record<string, unknown>;
  const version = row.version;
  const packageId = typeof row.packageId === 'string' ? row.packageId.trim() : '';
  const mode = row.mode;
  const styleUrl = typeof row.styleUrl === 'string' ? row.styleUrl.trim() : '';
  const archiveUrl = typeof row.archiveUrl === 'string' ? row.archiveUrl.trim() : '';
  const minArchiveBytesRaw = row.minArchiveBytes;
  const installedAt = typeof row.installedAt === 'string' ? row.installedAt : '';
  const lastUpdatedAt = typeof row.lastUpdatedAt === 'string' ? row.lastUpdatedAt : undefined;
  const staleAfterDaysRaw = row.staleAfterDays;

  if (version !== 1) return null;
  if (!packageId) return null;
  if (!isMapPackMode(mode)) return null;
  if (!styleUrl) return null;
  if (!installedAt || !isIsoDateString(installedAt)) return null;
  if (lastUpdatedAt && !isIsoDateString(lastUpdatedAt)) return null;

  const staleAfterDays = typeof staleAfterDaysRaw === 'number' && staleAfterDaysRaw > 0
    ? Math.floor(staleAfterDaysRaw)
    : undefined;
  const minArchiveBytes = typeof minArchiveBytesRaw === 'number' && minArchiveBytesRaw > 0
    ? Math.floor(minArchiveBytesRaw)
    : undefined;

  return {
    version: 1,
    packageId,
    mode,
    styleUrl,
    ...(archiveUrl ? { archiveUrl } : {}),
    ...(minArchiveBytes ? { minArchiveBytes } : {}),
    installedAt,
    ...(lastUpdatedAt ? { lastUpdatedAt } : {}),
    ...(staleAfterDays ? { staleAfterDays } : {}),
  };
}

export function readPersistedMapPackConfig(): MapPackConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MAP_PACK_LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeMapPackConfig(parsed);
  } catch {
    return null;
  }
}

export async function readManifestMapPackConfig(): Promise<MapPackConfig | null> {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch(MAP_PACK_MANIFEST_PATH, { cache: 'no-store' });
    if (!response.ok) return null;
    const parsed = await response.json();

    // Support either direct schema or wrapped JSON for future extension.
    const fromRoot = normalizeMapPackConfig(parsed);
    if (fromRoot) return fromRoot;

    if (parsed && typeof parsed === 'object' && 'mapPack' in (parsed as Record<string, unknown>)) {
      return normalizeMapPackConfig((parsed as Record<string, unknown>).mapPack);
    }

    return null;
  } catch {
    return null;
  }
}

export async function resolveMapPackConfig(): Promise<MapPackConfig | null> {
  const persisted = readPersistedMapPackConfig();
  if (persisted) return persisted;
  return readManifestMapPackConfig();
}
