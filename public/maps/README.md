# PMTiles Map Package

This directory now ships with a bundled offline PMTiles basemap for the shelter map.
The bundled archive is an orientation fallback, not authoritative routing or cartography.

To regenerate the included package:

1. Ensure Python can import `Pillow` and `pmtiles`.
2. Run `python scripts/build-bundled-norway-pmtiles.py`.
3. Keep `public/maps/pmtiles-manifest.json` and `public/maps/norway-style.json` aligned with the generated archive.

Supported manifest modes:
- `local-public-file`
- `cached-download`

Fallback behavior:
- If `pmtiles-manifest.json` is missing, invalid, stale, or fails to load, the app keeps the shelter-safe fallback renderer active.
