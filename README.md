# Beredskap101

Mobile-first, offline-first preparedness reference for household self-preparedness, first aid, practical decision support, personal safety, digital privacy, and travel resilience.

Current audit, implementation progress, validation evidence and release limitations: [`docs/AUDIT_AND_IMPLEMENTATION_2026-10-31.md`](./docs/AUDIT_AND_IMPLEMENTATION_2026-10-31.md)
The July audit and validation records under `docs/` are historical evidence. They do not establish the current release status.
Repository boundaries and ingest rules: [`REPO_OPERATING_MODEL.md`](./REPO_OPERATING_MODEL.md)

## Local development

For cloning and continuing on another computer, see [Clone and setup](./docs/CLONE_AND_SETUP.md).

```bash
npm ci --no-audit
npm run dev
```

The development command starts the local API on port 3002 and Vite on port 3011. External feed calls are enhancements; core PWA content and local user records are designed to remain usable without them.

## Verification

Run the gates in dependency order:

```bash
npm ci --no-audit
npm run verify:text-integrity
npm run verify
npm run verify:security
npm run test:e2e
```

- `verify:text-integrity` is an explicit early stop condition for Norwegian text corruption.
- `verify` runs type-checking, text/localization checks, ingest validation, production build, bounded API/proxy checks, Modules 2–7 contracts, storage rollback checks and runtime boundary checks once. It needs permission to reach its own localhost test servers. It does not query npm advisories.
- `verify:security` fails on moderate-or-higher dependency advisories.
- `test:e2e` is the browser release gate and includes service-worker/offline coverage through the configured Chromium project.
- `verify:release` chains all gates, but running them separately gives clearer failure isolation.

The 2026-10-31 audit keeps dependency checking local at the owner's request. Current vulnerability-advisory status is **unverified**; the security/release commands above query the external npm registry and were not authorized for this audit. Local test success does not replace that release evidence, qualified safety-content review, or validation of the deployed site.

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
- `/api/contact` is an intentional compatibility stub: the contact feature is client-side (mailto handoff) by design, matching the app's local-first posture and avoiding PII transit. The endpoint is rate-limited (5 requests / 15 min per socket peer, never keyed on `x-forwarded-for`) and must not be wired to a server-side mail pipeline without an explicit owner decision (see the phase 5.2 decision gate in `docs/REMEDIATION_ROADMAP_2026-07-18.md`).
- Production CSP scopes `connect-src` to `'self'` only (`vercel.json`). The localhost / `*.local` `connect-src` entries exist solely in the dev-only header set (`server.js`) for the local-AI feature, which is local-server-only by design — do not copy them into the production header set.
- Self-hosted local PWA / LAN preview: run `npm run build` and `npm run preview:lan`. Plain `http://<lan-ip>:4173` supports a connected preview, but browsers generally require HTTPS or localhost for service workers and WebCrypto. Use HTTPS with a certificate trusted by the target device for LAN offline installation and authenticated encrypted backups. Opening an HTTP LAN preview once does not establish offline readiness.
- Local development API: `npm run dev:api` enables optional routing to a user-configured local OpenAI-compatible model. The endpoint must resolve to localhost, private LAN, loopback, or `.local`; cloud AI endpoints are rejected.

`/api/copilot/analyze` returns deterministic local analysis on hosted/serverless deployments. Local model failure must fall back to deterministic output and must not break the application.

## Data and privacy boundaries

Checklist progress, document-vault records, preferences, and feed snapshots are stored in the browser. No analytics, advertising scripts, or required cloud AI APIs are included.

The encrypted backup is a user-managed portability feature. Treat the passphrase and exported payload as sensitive. The current format is not a substitute for an independently reviewed password manager or authenticated archival system.

## Offline deployment checklist

1. Run all verification gates on the exact source revision.
2. Build with `npm run build`.
3. Serve with trusted HTTPS, or use localhost on the same device. Plain HTTP LAN preview is not an offline-installation mode.
4. Open the app once while connected and confirm service-worker readiness.
5. Test the core routes offline.
6. Verify checklist persistence, document vault export/import, shelter search, and map fallback.
7. Confirm live-feed failures show cache/static fallback rather than an empty-authority claim.
8. Confirm local AI is disabled by default and deterministic fallback remains available.
9. Record the deployed source revision and validation output.

Updates remain waiting until accepted in the app. Acceptance reloads every open app tab together to avoid leaving an older tab dependent on removed lazy chunks. Save in-progress edits first; persisted browser records remain on the same origin.

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
