# Residual Risk Remediation Checklist

Date: 2026-06-06
Status: complete
Primary inputs:
- `docs/audit-remediation-checklist-2026-06-05.md`
- `PLAN-26-06-05.md`
- User follow-up request on residual risks dated `2026-06-06`

BMAD workflow usage:
- `bmad-investigate`: reopen the evidence trail and capture the new strongholds
- `bmad-brainstorming`: force option generation before settling on patches
- `bmad-tea`: risk-based quality and verification review
- `bmad-review-adversarial-general`: critical findings after implementation
- `bmad-retrospective`: close-out learning and next-session guardrails

Execution protocol:
1. Keep this file updated after every meaningful code change, verification run, review note, blocker, or decision.
2. Work modules in sequence.
3. Do not mark the run complete until the integrated gate passes three consecutive times with no errors, warnings, or flags.
4. Treat this file as the restart source of truth if the session drops.

## Baseline

Observed at start of run:
- Dirty tracked files carried from the prior remediation plus follow-up edits already present in the worktree:
  - `docs/offline-phase-4-pmtiles.md`
  - `public/maps/README.md`
  - `public/maps/norway-style.json`
  - `public/maps/norway.pmtiles`
  - `public/maps/pmtiles-manifest.json`
  - `scripts/verify-localization.mjs`
  - `scripts/verify-module2-contracts.mjs`
  - `scripts/verify-module4-contracts.mjs`
  - `scripts/verify-module6-contracts.mjs`
  - `scripts/verify-text-integrity.mjs`
  - `src/App.tsx`
  - `src/components/DynamicGearListBuilder.tsx`
  - `src/components/EditorialArticlesViewer.tsx`
  - `src/components/ExtendedAssetViewer.tsx`
  - `src/components/InteractiveFlowcharts.tsx`
  - `src/components/KnowledgeMap.tsx`
  - `src/components/LocalAiAssistant.tsx`
  - `src/components/LocalDocumentVault.tsx`
  - `src/components/SafetyChecklists.tsx`
  - `src/components/SecureSaveManager.tsx`
  - `src/components/ShelterMap.tsx`
  - `src/components/StaticPages.tsx`
  - `src/components/TrainingScenarios.tsx`
  - `src/components/knowledge-map/CorePreparednessNode.tsx`
  - `src/components/knowledge-map/KnowledgeMapSection.tsx`
  - `src/components/knowledge-map/ProgressiveDiscoveryStepper.tsx`
  - `src/data/glossaryData.ts`
  - `src/data/pillarsData.ts`
  - `src/i18n.ts`
  - `src/index.css`
  - `src/types.ts`
  - `tests/localization-state.spec.ts`
  - `tests/ui-regressions.spec.ts`
- Untracked files:
  - `.codex-dev.zip`
  - `PLAN-26-06-05.md`
  - `docs/audit-remediation-checklist-2026-06-05.md`
  - `scripts/build-bundled-norway-pmtiles.py`

Residual risks to reduce in this run:
- The bundled PMTiles basemap is a resilience fallback, not authoritative cartography.
- The main JS bundle is still large, so slower devices may still feel startup cost.
- Mojibake protection is stronger now, but still pattern-based rather than formally exhaustive.
- The worktree remains dirty and needs a current restart-safe audit trail instead of implicit state.

Strongholds confirmed at intake:
- `scripts/build-bundled-norway-pmtiles.py` currently generates a schematic raster fallback, not a precise cartographic product.
- `src/App.tsx` was still front-loading the largest content payload (`src/data/processedAssets.json`) and many heavy route components before this follow-up pass.
- `scratch/process_uorganisert.py` was outside the verification boundary, so a generator-side encoding regression could slip through unnoticed.
- Current verification needed explicit `.py` coverage and deeper recursive scanning of Norwegian content sources.

Chosen defaults for this run:
- Keep the bundled basemap, but label it clearly as orientation-only and direct users to shelter list/address data for dependable action.
- Prefer route-level and payload-level deferral over broad architectural rewrites.
- Extend mojibake prevention both upstream (generation scripts) and downstream (verification scripts and contract checks).
- Leave `.codex-dev.zip` untouched.

Integrated verification gate:
- `npm run verify:text-integrity`
- `npm run verify:localization`
- `npm run verify:module2:contracts`
- `npm run verify:module4:contracts`
- `npm run verify:module5:contracts`
- `npm run verify:module6:contracts`
- `npm run verify:module7:contracts`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `npx playwright test`

## Module Track

### Module 0: Restart-safe checkpoint
Status: complete
Goal:
- Capture current residual risks, worktree state, and gate commands in a new dated checklist.

Completed:
- [x] Created `docs/audit-remediation-checklist-2026-06-06.md`.
- [x] Created `PLAN-26-06-06.md`.

Adversarial review:
- Yesterday's checklist is correct historical evidence, but it is not enough to restart today's residual-risk reduction safely.

Retrospective:
- The restart file needs to be versioned by day once a new remediation thread starts, even if it continues the same code area.

### Module 1: Shelter-map authority hardening
Status: complete
Goal:
- Prevent the bundled PMTiles package from being interpreted as authoritative navigation/cartography.

Implemented:
- [x] Added an orientation-only badge and warning copy to the shelter map UI.
- [x] Updated shelter-map helper text to frame the bundled offline package as a backdrop, not authoritative routing.
- [x] Updated FAQ and map-package docs to reflect the same stance.

Adversarial review:
- The app still ships the bundled PMTiles package, so users can still over-trust it if they ignore the warnings. The mitigation here is explicit labeling and list/address-first guidance, not magical data precision.

Retrospective:
- This risk was better addressed by truthful UI framing than by pretending a lightweight bundled basemap could become full cartography.

Gate evidence:
- Satisfied by the `3/3` integrated verification cycles recorded under Module 4.

### Module 2: Startup weight reduction
Status: complete
Goal:
- Reduce initial JS cost with safe splitting or deferral of heavy components and content payloads.

Implemented:
- [x] Replaced the static `processedAssets.json` bootstrap import with a deferred dynamic import.
- [x] Added `React.lazy` + `Suspense` around heavy route components and static-page routes.
- [x] Added deferred query values for local search and archive search.
- [x] Tightened Vite build chunking with explicit `manualChunks` and a stricter chunk warning limit.

Adversarial review:
- This reduces initial parse/compile pressure, but it does not make the app small. The default route still carries substantial offline content and map logic by design.

Retrospective:
- Deferring the heaviest optional payloads was lower-risk than trying to re-architect the whole app shell in one pass.

Gate evidence:
- Satisfied by the `3/3` integrated verification cycles recorded under Module 4.

### Module 3: Mojibake prevention strengthening
Status: complete
Goal:
- Fix known upstream corruption sources and make verification less dependent on narrow string-pattern scanning.

Implemented:
- [x] Expanded `verify:text-integrity` to scan the scratch ingestion script and to evaluate suspicious patterns against full lines as well as quoted fragments.
- [x] Expanded `verify:localization` with source-registry checks and recursive scanning of Norwegian processed-asset locales.
- [x] Confirmed `scratch/process_uorganisert.py` is UTF-8 clean, so the generator is now part of the prevention surface instead of a blind spot.

Adversarial review:
- The guards are materially better, but they are still heuristic. There is no formal proof of perfect encoding hygiene across all future imported assets.

Retrospective:
- Pulling the generator script into the verification boundary matters more than repeatedly adding UI-only string exceptions after corruption has already spread.

Gate evidence:
- Satisfied by the `3/3` integrated verification cycles recorded under Module 4.

### Module 4: Review, TEA, security, and triple gate
Status: complete
Goal:
- Run adversarial review, test-architecture review, security-sensitive validation, retrospective notes, and three consecutive clean full verification cycles.

Brainstorming notes:
- Option A for map authority risk was to replace the bundled archive with heavier authoritative cartography. Rejected for this pass because it would increase startup and offline package weight without guaranteeing licensing or freshness.
- Option B for startup risk was an app-shell rewrite. Rejected because route-level lazy loading and deferred content import address the measured bootstrap bottlenecks with much lower regression risk.
- Option C for mojibake risk was to rewrite ingest tooling immediately. Deferred because the verified defect was missing verification coverage, not confirmed corruption in `scratch/process_uorganisert.py`.

TEA review:
- Security NFR: PASS. `verify:module5:contracts`, `verify:module6:contracts`, `verify:module7:contracts`, and `npm audit --audit-level=moderate` show Article 17/20 controls, local-only AI endpoint enforcement, CSP hardening, offline-worker isolation, and zero moderate-or-higher dependency findings.
- Performance NFR: PASS with residual concern documented. `npm run build` confirms route/data splitting is active, with `processed-assets`, `maplibre`, and other heavy modules moved off the bootstrap path. Remaining concern: the `maplibre` chunk is still large, but it is no longer on the critical startup route.
- Reliability NFR: PASS. `verify:module4:contracts` validates map-provider fallback states, and Playwright offline smoke confirms service-worker-backed route refreshes still work offline.
- Test quality gate: PASS. The affected Playwright specs remain deterministic and completed in a single worker without flakes in the first formal pass.

Security review:
- OWASP-style input/output review found no new cloud endpoints, wildcard CSP allowances, or external script/style dependencies introduced in this pass.
- The map warning changes fail safer than before because the UI now reduces the risk of users over-trusting schematic offline basemaps.

Adversarial review:
- The app still cannot claim authoritative offline cartography; the honest mitigation is disclosure and shelter-list-first guidance, not overstatement.
- Startup cost is reduced, not eliminated. The app still ships substantial offline knowledge and icon/map dependencies by design.
- Mojibake detection is materially broader, but still verification-driven rather than mathematically exhaustive.

Risk governance snapshot:
- `DATA` map-authority overtrust risk: probability `1`, impact `2`, score `2`, status `ACCEPTED`.
  Mitigation evidence: bundled map is labeled orientation-only, street/live fallback remains primary, and shelter list/address flow remains intact.
- `PERF` startup-weight risk: probability `2`, impact `2`, score `4`, status `ACCEPTED`.
  Mitigation evidence: large optional modules and `processedAssets.json` moved off bootstrap; three consecutive clean build and offline-flow passes recorded.
- `DATA` mojibake reintroduction risk: probability `1`, impact `2`, score `2`, status `ACCEPTED`.
  Mitigation evidence: expanded recursive localization checks plus `.py` text-integrity coverage.

Retrospective:
- The most effective residual-risk reductions were truthfulness and scope control: clear authority labeling, targeted deferral, and broader verification boundaries.
- Future large content imports should default to deferred loading instead of entering the bootstrap path first and being optimized later.
- Node-based UTF-8 verification is more trustworthy than raw PowerShell rendering for Norwegian text audits and should remain the default audit method.

## Verification Log

Pre-gate spot checks already completed once after implementation:
- [pass] `npm run verify:text-integrity`
- [pass] `npm run verify:localization`
- [pass] `npm run verify:module2:contracts`
- [pass] `npm run verify:module4:contracts`
- [pass] `npm run verify:module5:contracts`
- [pass] `npm run verify:module6:contracts`
- [pass] `npm run verify:module7:contracts`
- [pass] `npm run lint`
- [pass] `npm run build`
- [pass] `npm audit --audit-level=moderate`
- [pass] `npx playwright test`

TEA review inputs loaded for Module 4:
- `nfr-criteria.md`
- `test-quality.md`
- `risk-governance.md`
- `confidence-gate.md`

Formal integrated gate:
- Cycle 1/3: pass
  - `npm run verify:text-integrity`
  - `npm run verify:localization`
  - `npm run verify:module2:contracts`
  - `npm run verify:module4:contracts`
  - `npm run verify:module5:contracts`
  - `npm run verify:module6:contracts`
  - `npm run verify:module7:contracts`
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=moderate`
  - `npx playwright test`
- Cycle 2/3: pass
  - `npm run verify:text-integrity`
  - `npm run verify:localization`
  - `npm run verify:module2:contracts`
  - `npm run verify:module4:contracts`
  - `npm run verify:module5:contracts`
  - `npm run verify:module6:contracts`
  - `npm run verify:module7:contracts`
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=moderate`
  - `npx playwright test`
- Cycle 3/3: pass
  - `npm run verify:text-integrity`
  - `npm run verify:localization`
  - `npm run verify:module2:contracts`
  - `npm run verify:module4:contracts`
  - `npm run verify:module5:contracts`
  - `npm run verify:module6:contracts`
  - `npm run verify:module7:contracts`
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=moderate`
  - `npx playwright test`

Gate decision:
- PASS
- Three consecutive integrated verification cycles completed with no errors, warnings, or flags.
- `.codex-dev.zip` remains untouched.

## Follow-up: resumed after interruption

Status:
- Confirmed complete on re-entry.

Actions taken on resume:
- Reopened `PLAN-26-06-06.md` and this checklist as the restart source of truth.
- Reconfirmed that no implementation module was still pending.
- Normalized Module 1, Module 2, and Module 3 statuses from "implemented, awaiting gate evidence" to `complete` because the `3/3` gate had already been satisfied.
- Expanded `PLAN-26-06-06.md` into a fuller module-by-module remediation roadmap so the repo contains both an execution log and a clean roadmap artifact.

Adversarial review:
- The only real defect on re-entry was documentation drift, not missing implementation.

Retrospective:
- If a run completes near a session boundary, normalize all module statuses before closing the final response to avoid false ambiguity on restart.
