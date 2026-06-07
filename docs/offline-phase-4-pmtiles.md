# Offline Phase 4 PMTiles Notes

Phase 4 adds a bundled PMTiles renderer while preserving the shelter-safe fallback renderer.
The bundled PMTiles package is treated as an orientation-only fallback, not authoritative routing/cartography.

## Provider Abstraction

Renderer IDs:
- `fallback-shelter-map`
- `pmtiles-vector-map`

Map package status states:
- `not-installed`
- `installed`
- `stale`
- `failed-to-load`

Map package modes:
- `fallback-included`
- `local-public-file`
- `cached-download`

## Bundled Local PMTiles Mode

The app now ships with:

1. `public/maps/pmtiles-manifest.json`
2. `public/maps/norway-style.json`
3. `public/maps/norway.pmtiles`

If you regenerate the archive, ensure the style continues to reference a local `pmtiles://` source.

Manifest schema:

```json
{
  "version": 1,
  "packageId": "norway-basemap-v1",
  "mode": "local-public-file",
  "styleUrl": "/maps/norway-style.json",
  "installedAt": "2026-06-01T00:00:00.000Z",
  "lastUpdatedAt": "2026-06-01T00:00:00.000Z",
  "staleAfterDays": 180
}
```

## Cached-Download Mode

The renderer can also be activated from persisted local settings (for user pre-cached map packages) using localStorage key:

- `beredskap101.pmtiles.mapPack.v1`

Value shape is the same as the manifest schema, but `mode` should be `cached-download`.

## Backward Validation Protocol

After PMTiles integration changes, run:

```powershell
npm run lint
npm run build
```

Then enforce non-regression checks from `docs/offline-phase-0-1-audit.md`:
- no banned runtime dependencies
- no removal of existing tabs/modules
- shelter list remains available offline fallback
- missing PMTiles package must not break shelter list/search/selection
