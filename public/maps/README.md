# PMTiles Map Package (Optional)

Do not commit large `.pmtiles` files to this repository.

To enable the Phase 4 PMTiles renderer for self-hosted builds:

1. Copy `pmtiles-manifest.example.json` to `pmtiles-manifest.json`.
2. Place your PMTiles style JSON at the `styleUrl` path in that manifest.
3. Place referenced `.pmtiles` files in `public/maps` (or another path your style references).
4. Build and preview the app (`npm run build` + `npm run preview`).

Supported manifest modes:
- `local-public-file`
- `cached-download`

Fallback behavior:
- If `pmtiles-manifest.json` is missing, invalid, stale, or fails to load, the app keeps the shelter-safe fallback renderer active.
