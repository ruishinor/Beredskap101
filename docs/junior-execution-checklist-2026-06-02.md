# Junior Execution Checklist (Modules 3-7)

Use this as the handoff checklist for a junior developer or vibe coder. Do not start the next module until the current one reaches `3/3 clean passes`.

## Module 3 - Local Search

1. Keep search local-only. Do not call any API during search.
2. Make sure the search index includes manuals, processed assets, glossary, editorial articles, shelters, source links, checklists, and content packs.
3. Keep filters for type, pillar, language, and criticality.
4. Test these searches: `tilfluktsrom`, `vann`, `forstehjelp`, `DAB`, `personvern`.
5. Run verification until you get `3/3 clean passes`.

## Module 4 - Offline Maps V2

1. Keep the shelter-safe fallback map working even if PMTiles fails.
2. Support map package states: `not-installed`, `installed`, `stale`, `failed-to-load`.
3. Support package modes: `fallback-included`, `local-public-file`, `cached-download`.
4. Do not break shelter list, shelter count (`556`), or nearest-shelter flow.
5. Run verification until you get `3/3 clean passes`.

## Module 5 - Local Document Vault

1. Keep all vault actions local-only: add, edit, search, tag, export, import, delete, clear.
2. Preserve metadata fields: title, category, household member, source, review date, sensitive flag, tags, note, optional attachment.
3. Keep Article 17 delete-all and manual Article 20 export/import available.
4. Reject malformed imports and oversized attachments.
5. Run verification until you get `3/3 clean passes`.

## Module 6 - Optional Local-Only AI

1. Keep AI disabled by default.
2. Only allow local endpoints. Block cloud/public endpoints.
3. Keep assistive tasks only: checklist explanation, content summary, household drill, scenario analysis.
4. Always keep deterministic fallback working if local AI fails.
5. Run verification until you get `3/3 clean passes`.

## Module 7 - Deployment Hardening

1. Keep CSP narrow. Do not add external runtime scripts, images, tile hosts, or wildcard connect rules.
2. Keep service worker precache plus `/index.html` offline navigation fallback intact.
3. Keep two documented deployment modes:
   hosted/static PWA
   self-hosted local PWA over LAN
4. Keep README deployment checklist and release notes updated when behavior changes.
5. Keep `preview:lan` working for LAN validation.
6. Keep `tests/offline-smoke.spec.ts` passing against the local preview server.
7. Run verification until you get `3/3 clean passes`.

## Final Gate

1. Run backward validation through all prior module contract checks.
2. Treat any error, warning, or flag as a failed cycle.
3. Only mark the work complete after `3/3 clean passes` on the current module.
