# Beredskap101 Audit Checklist - 2026-06-03

Status: in progress
Owner: Codex
Workspace: `c:\00 DEV\In Progress\beredskap101-app`
Git state: no `.git` repository detected in this workspace

## Operating Rules

- Execute autonomously; do not wait for approvals.
- Keep work modular and sequential.
- Include adversarial review and retrospective analysis in audit, verification, and validation.
- Require three consecutive 100% successful passes with no errors, warnings, or flags for completion.
- Preserve backward compatibility for routes, offline behavior, content ingestion, local storage, and existing user data.
- Exclude Google/Gemini models and APIs from recommendations unless explicitly necessary.

## Product Context

- Product: Beredskap101, an offline-first Norwegian preparedness PWA.
- Primary audience: Norwegian/EEA households and non-specialist users preparing under stress.
- User emotional state: uncertainty, urgency, low patience for visual clutter, need for calm trust.
- Real-world context: mobile use, intermittent connectivity, emergency reference, local privacy expectations.
- Brand/tone target: public-service, calm, readable, source-transparent, non-tactical.
- Must not resemble: tactical gear shop, cyberpunk dashboard, AI SaaS, crypto dashboard, military simulator, generic Webflow template.

## Stage Checklist

- [x] Stage 0 - Establish restart-safe checklist and operating context.
- [x] Stage 1 - Inventory app, lab/content engine, docs, scripts, APIs, and tests.
- [x] Stage 2 - Standards baseline: WCAG 2.1 contrast, GDPR Articles 17/20, DPIA, OWASP Top 10.
- [x] Stage 3 - Critical audit with adversarial review: app, lab/content engine, security, privacy, accessibility, UX, offline reliability.
- [x] Stage 4 - Implement required white-on-orange contrast remediation across light/dark modes.
- [x] Stage 5 - Validate dark/light mode behavior, contrast tokens, legal/support modules, crash/offline behavior.
- [x] Stage 6 - Run three consecutive 100% successful verification passes.
- [x] Stage 7 - Retrospective analysis and final concise report.

## Audit Surfaces

- [x] App shell: `src/App.tsx`, routing/hash state, navigation, footer, legal/support modules.
- [x] Global theme/color system: `src/index.css`.
- [x] Open tabs: `src/components/ShelterMap.tsx`, `src/components/StaticPages.tsx`.
- [x] Local storage/export/delete: `src/components/SecureSaveManager.tsx`, `src/components/LocalDocumentVault.tsx`, `src/utils/saveSystem.ts`.
- [x] Local AI: `src/components/LocalAiAssistant.tsx`, `src/utils/localAiSettings.ts`.
- [x] Content engine: `scripts/parse-assets.ts`, `scripts/validate-processed-assets.ts`, `src/data/processedAssets*.json`.
- [x] Lab boundary: `REPO_OPERATING_MODEL.md`, `scratch/`, `assets/`, upstream ingest assumptions.
- [x] APIs/server: `server.js`, `api/*.ts`, CORS, headers, feed/contact behavior.
- [x] Tests and gates: `package.json`, `tests/*.spec.ts`, `scripts/run-module*-verification.mjs`.

## White-on-Orange Remediation Targets

- [x] Locate all hard-coded orange/background and white/on-orange combinations.
- [x] Replace failing white-on-orange pairings with accessible semantic tokens.
- [x] Verify replacement contrast ratios for normal text and UI components in light and dark modes.
- [x] Confirm no visual style regression into prohibited tactical/cyber/AI-SaaS patterns.

## Verification Pass Log

Pass 1: passed full gate (`lint`, `build`, `ingest:validate`, module 1-7 contracts, Playwright chromium-offline)
Pass 2: passed full gate (`lint`, `build`, `ingest:validate`, module 1-7 contracts, Playwright chromium-offline)
Pass 3: passed full gate (`lint`, `build`, `ingest:validate`, module 1-7 contracts, Playwright chromium-offline)

Full pass command set:

- `npm run lint`
- `npm run build`
- `npm run ingest:validate`
- `npm run verify:module1:api`
- `npm run verify:module2:contracts`
- `npm run verify:module3:contracts`
- `npm run verify:module4:contracts`
- `npm run verify:module5:contracts`
- `npm run verify:module6:contracts`
- `npm run verify:module7:contracts`
- `npx playwright test --project=chromium-offline`

## Open Findings

- Resolved: theme internals moved to `dark`/`light`; accessible teal token pairs replaced orange accent usage.
- Resolved: print-window HTML in `src/components/ExtendedAssetViewer.tsx` is escaped before `document.write`.
- Resolved: PMTiles placeholder is rejected by manifest/archive size validation and UI tests assert fallback behavior.
- Resolved: `package.json` `clean` no longer deletes `server.js`.
- Resolved: local API CORS is restricted to local/private/configured origins and JSON bodies are size-limited.
- Resolved: server optional local-AI path validates local-only endpoint and minimizes prompt/history fields.
- Resolved: app-level crash boundary added with reload and explicit local app-data erasure recovery.
- Resolved: Article 17 local erasure and Article 20 full local export helpers are implemented and contract-tested.
- Resolved: user-facing Google/Gemini/Gmail references removed from app copy; verification guardrails remain in scripts.
- Residual audit note: some older Norwegian metadata/content strings still contain mojibake. Current type-breaking pillar-id mojibake is fixed; broader editorial cleanup should be handled separately because it is content churn, not a blocking runtime failure.
- Residual security note: local `.env` secret material was removed from this workspace. Any exposed external key must still be revoked/rotated at the provider.

## Retrospective Notes

- Initial audits correctly found theme mismatch, print injection, PMTiles false-positive install, unsafe clean script, broad CORS, weak backup passkey, missing crash boundary, incomplete Article 17/20 coverage, and light-mode contrast failures beyond orange.
- The adversarial accessibility pass was necessary: it found status-chip and knowledge-map light-mode failures that the first orange-only scan missed.
- Verification drift in tests was real in two directions: one stale SourceLinks contract and one stale PMTiles-active Playwright expectation. Both were aligned to current safer behavior.
