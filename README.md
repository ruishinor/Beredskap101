# Beredskap101

Mobile-first, offline-first preparedness reference for household self-preparedness, first aid, practical decision support, personal safety, digital privacy, and travel resilience.

Current audit and implementation record: [`docs/AUDIT_AND_STABILIZATION_2026-07-10.md`](./docs/AUDIT_AND_STABILIZATION_2026-07-10.md)
Current validation evidence: [`docs/VALIDATION_LOG_2026-07-10.md`](./docs/VALIDATION_LOG_2026-07-10.md)
Repository boundaries and ingest rules: [`REPO_OPERATING_MODEL.md`](./REPO_OPERATING_MODEL.md)

## Local development

```bash
npm ci
npm run dev
```

The development command starts the local API on port 3002 and Vite on port 3011. External feed calls are enhancements; core PWA content and local user records are designed to remain usable without them.

## Verification

Run the gates in dependency order:

```bash
npm ci
npm run verify:text-integrity
npm run verify
npm run verify:security
npm run test:e2e
```

- `verify:text-integrity` is an explicit early stop condition for Norwegian text corruption.
- `verify` runs type-checking, text/localization checks, ingest validation, production build, bounded API/proxy checks, and Modules 2–7 contracts once.
- `verify:security` fails on moderate-or-higher dependency advisories.
- `test:e2e` is the browser release gate and includes service-worker/offline coverage through the configured Chromium project.
- `verify:release` chains all gates, but running them separately gives clearer failure isolation.

Do not proceed to later commands after an earlier failure.

## Offline PWA testing

```bash
npm run build
npm run preview
```

Open the preview once while online, wait for service-worker readiness, switch the browser offline, then refresh `/`, `/#knowledge`, `/#shelters`, `/#library`, and `/#checklists`.

Focused offline smoke test:

```bash
npm run test:offline:smoke
```

## Supported deployment modes

- Hosted/static PWA: deploy `dist` to Vercel or another static host. Serverless handlers under `api/` provide optional live feeds, contact handoff, health, and deterministic copilot compatibility.
- Self-hosted local PWA: run `npm run build` and `npm run preview:lan`, then open `http://<lan-ip>:4173` from the target device while connected once before offline use.
- Local development API: `npm run dev:api` enables optional routing to a user-configured local OpenAI-compatible model. The endpoint must resolve to localhost, private LAN, loopback, or `.local`; cloud AI endpoints are rejected.

`/api/copilot/analyze` returns deterministic local analysis on hosted/serverless deployments. Local model failure must fall back to deterministic output and must not break the application.

## Data and privacy boundaries

Checklist progress, document-vault records, preferences, and feed snapshots are stored in the browser. No analytics, advertising scripts, or required cloud AI APIs are included.

The encrypted backup is a user-managed portability feature. Treat the passphrase and exported payload as sensitive. The current format is not a substitute for an independently reviewed password manager or authenticated archival system.

## Offline deployment checklist

1. Run all verification gates on the exact source revision.
2. Build with `npm run build`.
3. Serve with HTTPS in hosted mode, or use the documented local/LAN mode.
4. Open the app once while connected and confirm service-worker readiness.
5. Test the core routes offline.
6. Verify checklist persistence, document vault export/import, shelter search, and map fallback.
7. Confirm live-feed failures show cache/static fallback rather than an empty-authority claim.
8. Confirm local AI is disabled by default and deterministic fallback remains available.
9. Record the deployed source revision and validation output.

## Release boundaries

Offline-guaranteed intent:

- Core guides, checklists, scenarios, flowcharts, glossary, source cards, shelter list, and map fallback
- Local document vault
- Manual backup/import
- Deterministic assistive responses

Online-enhanced behavior:

- Official source feeds and Norwegian news refresh
- Optional local OpenAI-compatible model calls in supported local deployment contexts

The shelter map is an orientation aid, not authoritative routing. Live-feed absence is not evidence that no incident exists. Copilot grades and scores are assistive heuristics, not validated readiness assessments.
