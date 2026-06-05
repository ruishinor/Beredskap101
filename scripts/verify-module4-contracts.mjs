import fs from 'node:fs';
import path from 'node:path';
import {
  MAP_PACK_LOCAL_STORAGE_KEY,
  resolveMapPackConfig,
} from '../src/components/shelter-map/mapPackConfig.ts';
import {
  getFallbackProviderState,
  markShelterMapProviderFailure,
  resolveShelterMapProviderState,
} from '../src/components/shelter-map/mapProvider.ts';
import { normalizeMetAlertItems } from '../api/feed-utils.ts';

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  pass(message);
}

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

async function runProviderResolutionScenarios() {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  globalThis.window = {
    localStorage: storage,
    indexedDB: undefined,
  };

  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({}),
  });

  storage.clear();
  let providerState = await resolveShelterMapProviderState();
  assert(providerState.activeProvider === 'fallback-shelter-map', 'Provider falls back when no map pack is installed.');
  assert(providerState.packageStatus === 'not-installed', 'Package status is not-installed when no config exists.');
  assert(providerState.packageMode === 'fallback-included', 'Fallback mode is reported when PMTiles package is absent.');

  storage.setItem(
    MAP_PACK_LOCAL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      packageId: 'local-pack-installed',
      mode: 'cached-download',
      styleUrl: '/maps/local-style.json',
      installedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      staleAfterDays: 180,
    })
  );

  providerState = await resolveShelterMapProviderState();
  assert(providerState.activeProvider === 'pmtiles-vector-map', 'Provider activates PMTiles renderer when a valid package exists.');
  assert(providerState.packageStatus === 'installed', 'Fresh PMTiles package is marked installed.');
  assert(providerState.packageMode === 'cached-download', 'Package mode is sourced from persisted config.');

  storage.setItem(
    MAP_PACK_LOCAL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      packageId: 'local-pack-stale',
      mode: 'local-public-file',
      styleUrl: '/maps/stale-style.json',
      installedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdatedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      staleAfterDays: 180,
    })
  );

  providerState = await resolveShelterMapProviderState();
  assert(providerState.packageStatus === 'stale', 'Old PMTiles package is marked stale.');

  storage.setItem(
    MAP_PACK_LOCAL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      packageId: 'persisted-preferred',
      mode: 'cached-download',
      styleUrl: '/maps/persisted-style.json',
      installedAt: new Date().toISOString(),
      staleAfterDays: 180,
    })
  );

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      version: 1,
      packageId: 'manifest-secondary',
      mode: 'local-public-file',
      styleUrl: '/maps/manifest-style.json',
      installedAt: new Date().toISOString(),
      staleAfterDays: 180,
    }),
  });

  const config = await resolveMapPackConfig();
  assert(config?.packageId === 'persisted-preferred', 'Persisted map-pack config takes precedence over manifest config.');

  const failed = markShelterMapProviderFailure(providerState, 'timeout');
  assert(failed.activeProvider === 'fallback-shelter-map', 'Provider failure switches active renderer back to fallback.');
  assert(failed.packageStatus === 'failed-to-load', 'Provider failure marks package status as failed-to-load.');

  const fallback = getFallbackProviderState();
  assert(fallback.activeProvider === 'fallback-shelter-map', 'Fallback provider helper returns fallback renderer state.');

  storage.clear();
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).endsWith('/maps/pmtiles-manifest.json')) {
      return {
        ok: true,
        json: async () => ({
          version: 1,
          packageId: 'manifest-placeholder',
          mode: 'local-public-file',
          styleUrl: '/maps/manifest-style.json',
          archiveUrl: '/maps/norway.pmtiles',
          minArchiveBytes: 1024 * 1024,
          installedAt: new Date().toISOString(),
          staleAfterDays: 180,
        }),
      };
    }
    if (options.method === 'HEAD' && String(url).endsWith('/maps/norway.pmtiles')) {
      return {
        ok: true,
        headers: {
          get: (name) => (name.toLowerCase() === 'content-length' ? '399' : null),
        },
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  providerState = await resolveShelterMapProviderState();
  assert(providerState.activeProvider === 'fallback-shelter-map', 'Provider rejects manifest packages below the declared archive size.');
  assert(providerState.packageStatus === 'not-installed', 'Undersized manifest packages do not claim installed status.');
}

function runStaticContractChecks() {
  const packageJson = JSON.parse(readText('package.json'));
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  assert(Boolean(dependencies['maplibre-gl']), 'maplibre-gl dependency is installed.');
  assert(Boolean(dependencies.pmtiles), 'pmtiles dependency is installed.');

  const mapProviderTs = readText('src/components/shelter-map/mapProvider.ts');
  assert(mapProviderTs.includes("'fallback-shelter-map'") && mapProviderTs.includes("'pmtiles-vector-map'"), 'Map provider abstraction exposes fallback and PMTiles provider IDs.');
  assert(mapProviderTs.includes("'not-installed'") && mapProviderTs.includes("'installed'") && mapProviderTs.includes("'stale'") && mapProviderTs.includes("'failed-to-load'"), 'Map provider exposes all package status states.');
  assert(mapProviderTs.includes('isDeclaredArchiveAvailable') && mapProviderTs.includes('content-length'), 'Map provider validates declared PMTiles archive size before enabling package mode.');

  const mapPackConfigTs = readText('src/components/shelter-map/mapPackConfig.ts');
  assert(mapPackConfigTs.includes("'local-public-file'") && mapPackConfigTs.includes("'cached-download'"), 'Map pack config supports local-public-file and cached-download modes.');
  assert(mapPackConfigTs.includes('MAP_PACK_MANIFEST_PATH') && mapPackConfigTs.includes('MAP_PACK_LOCAL_STORAGE_KEY'), 'Map pack config exposes manifest and local-storage keys.');

  const shelterMapTsx = readText('src/components/ShelterMap.tsx');
  assert(shelterMapTsx.includes('Offline package active') || shelterMapTsx.includes('Offline-pakke aktiv'), 'Shelter map displays offline package active overlay state.');
  assert(shelterMapTsx.includes('The offline package is not installed') || shelterMapTsx.includes('Offline-pakken er ikke installert'), 'Shelter map displays not-installed state copy.');
  assert(shelterMapTsx.includes('The offline package is not installed in this copy') || shelterMapTsx.includes('Offline-pakken er ikke installert i denne kopien'), 'Shelter map explains when the offline package is missing.');
  assert(shelterMapTsx.includes('Street is the default') || shelterMapTsx.includes('Gatekart er standard'), 'Shelter map explains the street-first default.');
  assert(shelterMapTsx.includes('tileLayer') || shelterMapTsx.includes('openstreetmap-standard'), 'Shelter map keeps the live street basemap fallback.');
  assert(shelterMapTsx.includes('future-poi-overlay'), 'Shelter map reserves future POI overlay layers above basemap.');

  const bannedTokens = ['unpkg', 'cartocdn', 'kartverket-topo', 'Topo is best'];
  for (const token of bannedTokens) {
    assert(!shelterMapTsx.includes(token), `Shelter map contains no banned token: ${token}.`);
  }

  const manifestPath = path.join(ROOT, 'public/maps/pmtiles-manifest.json');
  const stylePath = path.join(ROOT, 'public/maps/norway-style.json');
  const pmtilesPath = path.join(ROOT, 'public/maps/norway.pmtiles');
  assert(fs.existsSync(manifestPath), 'PMTiles manifest exists for the local offline basemap package.');
  assert(fs.existsSync(stylePath), 'PMTiles style JSON exists for the local offline basemap package.');
  assert(fs.existsSync(pmtilesPath) && fs.statSync(pmtilesPath).size > 0, 'PMTiles archive exists for local package probing.');

  const manifest = JSON.parse(readText('public/maps/pmtiles-manifest.json'));
  assert(manifest.version === 1, 'PMTiles manifest uses schema version 1.');
  assert(manifest.packageId === 'norway-basemap-v1', 'PMTiles manifest uses the Norway basemap package id.');
  assert(manifest.mode === 'local-public-file', 'PMTiles manifest marks the package as local-public-file.');
  assert(manifest.styleUrl === '/maps/norway-style.json', 'PMTiles manifest points at the local style JSON.');
  assert(manifest.archiveUrl === '/maps/norway.pmtiles', 'PMTiles manifest declares the local archive URL for size validation.');
  assert(typeof manifest.minArchiveBytes === 'number' && manifest.minArchiveBytes >= 1024 * 1024, 'PMTiles manifest declares a realistic minimum archive size.');
  const pmtilesSize = fs.statSync(pmtilesPath).size;
  assert(
    pmtilesSize >= manifest.minArchiveBytes || mapProviderTs.includes('Declared PMTiles archive is missing or below the minimum package size'),
    'Placeholder-sized PMTiles archives are rejected instead of reported as installed.'
  );

  const style = JSON.parse(readText('public/maps/norway-style.json'));
  assert(style.sources?.norway?.url === 'pmtiles:///maps/norway.pmtiles', 'Style references the local PMTiles archive.');
  assert(Array.isArray(style.layers) && style.layers.some((layer) => layer['source-layer'] === 'norway'), 'Style renders the Norway source layer.');
  assert(Array.isArray(style.layers) && style.layers.some((layer) => layer['source-layer'] === 'cities'), 'Style renders the cities source layer.');

  const sampleMetPayload = {
    features: [
      {
        properties: {
          area: 'Oslo',
          eventAwarenessName: 'Orange warning',
          instruction: 'Stay indoors and avoid exposed areas.',
          title: '2026-06-03T08:00:00+00:00, 2026-06-05T21:59:00+00:00',
        },
        when: {
          interval: ['2026-06-03T08:00:00+00:00', '2026-06-05T21:59:00+00:00'],
        },
      },
    ],
  };
  const normalizedMetItems = normalizeMetAlertItems(sampleMetPayload, {
    locale: 'nb-NO',
    defaultSeverity: 'Farevarsel',
  });
  assert(normalizedMetItems.length === 1, 'MET alert normalizer returns one item for a single alert.');
  assert(!/2026-06-03T08:00:00\+00:00/.test(normalizedMetItems[0].title), 'MET alert titles do not leak raw ISO timestamps.');
  assert(normalizedMetItems[0].title.includes('Oslo'), 'MET alert titles include the affected area.');
  assert(normalizedMetItems[0].summary === 'Stay indoors and avoid exposed areas.', 'MET alert summary prefers the instruction text.');

  const shelters = JSON.parse(readText('src/data/shelters.json'));
  assert(Array.isArray(shelters) && shelters.length === 556, 'Shelter dataset remains intact (556 records).');
}

async function run() {
  await runProviderResolutionScenarios();
  runStaticContractChecks();
  console.log('\n[SUCCESS] Module 4 contract verification completed with no errors or flags.');
}

run().catch((error) => {
  console.error('[FAIL]', error.message || error);
  process.exit(1);
});
