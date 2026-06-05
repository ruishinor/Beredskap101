# Beredskap101

Mobile-first preparedness reference for one-week household self-preparedness, first aid, wilderness decisions, personal safety, digital privacy, and travel resilience.

Start here: see [`REPO_OPERATING_MODEL.md`](./REPO_OPERATING_MODEL.md) for repository boundaries, ingest workflow, and deploy rules.

## Local Development

1. Install dependencies: `npm install`
2. Run type validation: `npm run lint`
3. Build production assets: `npm run build`
4. Start local dev server: `npm run dev`

The app is an offline-first PWA surface. Checklist progress, document vault data, and feed snapshots are stored locally in the browser. No analytics, ad scripts, cloud AI APIs, or required external runtime scripts are used.

For offline PWA testing, use a production build:

1. Run `npm run build`
2. Run `npm run preview`
3. Open the preview URL once while online
4. Switch browser devtools to offline
5. Refresh `/`, `/#shelters`, `/#library`, and `/#checklists`

Automated browser smoke test:

1. Run `npm run test:offline:smoke`
2. The test builds the app, launches local preview on `127.0.0.1:4173`, installs the service worker online once, switches the browser offline, then verifies route refresh and core click-through for `/#knowledge`, `/#shelters`, `/#library`, and `/#checklists`

`/api/copilot/analyze` is preserved for compatibility, but it returns deterministic local analysis by default. Optional AI routing targets user-configured local OpenAI-compatible endpoints only; local AI failure must never break app behavior.

See [`docs/offline-phase-0-1-audit.md`](./docs/offline-phase-0-1-audit.md) for the Phase 0 non-regression rule, audit checklist, and Phase 1 offline validation steps.

Optional Phase 4 PMTiles support is documented in [`docs/offline-phase-4-pmtiles.md`](./docs/offline-phase-4-pmtiles.md). When PMTiles is not installed or fails, the shelter-safe fallback map renderer remains active.

Phase 5-7 audit and deployment hardening are documented in [`docs/offline-phase-5-7-audit.md`](./docs/offline-phase-5-7-audit.md).

## Supported Deployment Modes

- Hosted/static PWA: deploy the built app to Vercel or another static host. Core offline functionality remains available without live feeds or local AI.
- Self-hosted local PWA: run `npm run build` and `npm run preview:lan`, then open `http://<lan-ip>:4173` from the target device at least once before offline testing.

Hosted HTTPS note:
- Browsers often block `http://localhost` and plain-http LAN model endpoints from an HTTPS page.
- For hosted HTTPS deployments, prefer a same-origin proxy or a trusted HTTPS local endpoint for optional local AI.
- If local AI is unreachable, the app must continue with deterministic fallback behavior.

## Offline Deployment Checklist

1. Build: `npm run build`
2. Serve locally on one machine: `npm run preview`
3. Serve over LAN for another device if needed: `npm run preview:lan`
4. Open app once while online to install shell/assets
5. Switch browser devtools to offline
6. Refresh `/#knowledge`, `/#shelters`, `/#library`, `/#checklists`
7. Verify shelter search and checklist modules
8. Verify source/news sections show live, cache, or static fallback without crash
9. Verify local document vault add/export/import workflow offline
10. Verify local AI remains optional (disabled by default) and deterministic fallback works

## Release Notes (Offline Guarantees vs Online Enhancements)

Offline-guaranteed modules:
- Core guides, checklists, scenarios, flowcharts, glossary, source cards, shelters, map fallback
- Local document vault (notes + metadata + optional attachment)
- Manual encrypted backup/import (checklists + document metadata/notes + local AI settings)
- Deterministic local AI fallback for assistive tooling

Online-enhanced modules:
- Live official source feeds and Norwegian news refresh
- Optional local OpenAI-compatible endpoint calls (Ollama/LM Studio/llama.cpp), ideally exposed as localhost, `.local`, or same-origin HTTPS

Local AI hosted HTTPS limitation:
- Browsers often block `http://localhost` from HTTPS pages (mixed content).
- Browsers can also block plain-http LAN model endpoints from HTTPS pages.
- For hosted HTTPS deployments, local AI may require HTTPS local proxying or same-origin self-hosting.
- The app always falls back to deterministic local output if local endpoint calls fail.
