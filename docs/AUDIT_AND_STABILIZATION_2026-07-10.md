# Beredskap101 Architecture, Product, UX, and Release Audit

Date: 2026-07-10
Source of truth: `beredskap101-app 26-06-07 1850 minus node_modules(1).zip`
Audit posture: adversarial, evidence-led, local-first

## Executive decision

The source contains a viable offline-first React/PWA application, but the supplied archive was not a reproducible release artifact. The code compiled and most module contracts passed, while release evidence, API verification, dependency security, and deployment parity had material defects.

The stabilization work in this audit preserves the existing Norwegian content and strengthens the text-integrity guard. It does not perform a broad component refactor. Large-file decomposition, information architecture redesign, and cryptographic backup modernization remain separate follow-up work because combining them with release stabilization would increase regression risk.

Release classification after this pass:

- Non-browser engineering gates: passed after a clean `npm ci`, including build, API/proxy checks, all module contracts, and a zero-vulnerability npm audit.
- Browser release gate: not executed successfully because the audit environment could neither download Playwright Chromium nor use its policy-blocked system Chromium.
- Deployment status: release candidate, not an unconditional production approval until the browser gate passes on the exact source revision.

## Scope and evidence rules

Only the uploaded v1 archive is in scope. No previous archive, branch, generated comparison, or prior assistant conclusion is treated as evidence.

Evidence hierarchy:

1. Executed commands and current source code.
2. Static contract checks that inspect current source.
3. Documentation only when it matches executable evidence.
4. Historical completion claims are non-authoritative when their referenced evidence is absent.

The archive contains no `.git` history. Commit ancestry, original branch, and whether all files were intentionally committed cannot be established from this artifact.

## Assumptions and trade-offs

- The Norwegian text in v1 is a protected product constraint. Any change that weakens text-integrity detection or rewrites large content surfaces is rejected.
- The intended deployment modes are a hosted/static PWA and a locally served PWA with an optional local API.
- Live feeds are enhancements. Core guidance, checklists, map fallback, and local records must remain usable without them.
- The simplest viable path is stabilization, not redesign. Existing component boundaries are retained unless a defect crosses deployment boundaries.
- Serverless and local API behavior should share handlers wherever practical. Duplicated business logic is treated as drift risk.
- Browser E2E results cannot be inferred from type-checks or static contracts.
- “Production-ready” is a gate, not a writing style. A blocked or unexecuted browser gate remains a release condition.

## Adversarial retrospective

### Project Lead perspective

Confirmed weaknesses:

- The archive mixed source with generated output, an `.env`, scratch files, test output, agent material, and temporary files. This obscures the authoritative release surface.
- `PLAN-26-06-06.md` claimed three clean verification cycles, but the referenced evidence files were absent and the supplied tree did not reproduce all claimed passes.
- There was no single canonical, one-pass verification command. Seven historical module runners each repeated expanding command sets three times, creating high execution cost without increasing defect isolation.
- The project version remained `0.0.0`, and the archive had no Git metadata. Release identity and rollback provenance were therefore weak.
- README links pointed to missing audit documents.

Decision:

Stabilize executable gates, create current evidence, provide a clean source package, and retain historical plans only with an explicit non-authoritative warning.

### Design Thinking Coach perspective

Confirmed weaknesses:

- The product serves several distinct jobs: immediate crisis reference, preparedness learning, live information monitoring, shelter orientation, document storage, encrypted backup, and optional local AI assistance.
- These jobs have different urgency and cognitive-load requirements. Combining them in one dense shell risks making the “what do I do now?” path compete with exploratory and administrative functions.
- The app’s value proposition is strongest when it converts official guidance into concrete action. Live feeds, scoring, and AI features can distract from that core if their status and limitations are not explicit.
- The current release evidence focuses more on implementation presence than on user task completion under stress.

Decision:

Do not redesign during stabilization. Record a follow-up discovery task around three primary user modes: prepare, act now, and maintain. Validate those modes with task-based usability sessions before changing navigation.

### UX Designer perspective

Confirmed weaknesses:

- `App.tsx` is approximately 2,500 lines and defines a large tab/hash surface. Several feature components exceed 600–1,200 lines. This raises change risk and makes state/navigation regressions harder to isolate.
- Existing browser tests cover localization state, cookie preferences, UI regressions, and offline behavior, but no automated accessibility engine is configured.
- Large map and icon chunks remain a startup/performance concern, although code splitting already exists and the build completes.
- Browser storage failures are handled in many components, but map-progress initialization accepted arbitrary parsed JSON and its write path previously had no failure guard.
- Shelter popup HTML was built as a string from dataset fields without escaping.

Decision:

Patch concrete storage and output-encoding defects now. Defer navigation restructuring and component decomposition until browser regression coverage is executable in the target environment.

### Senior Analyst perspective

Confirmed weaknesses:

- Structural validation does not prove that preparedness, medical, legal, or shelter content is current or substantively correct.
- Live source feeds are fallible and time-sensitive. The system has cache/static fallback behavior, but users must not infer that “no items” means “no incident.”
- The deterministic copilot score is a keyword-based assistive heuristic, not a validated readiness measure. Its grade and score may appear more authoritative than the underlying method supports.
- The local backup format uses CryptoJS passphrase-based AES without a separately verified authentication tag. It provides password-based confidentiality but should not be represented as modern authenticated archival protection.
- The bundled shelter map is suitable for orientation and discovery, not authoritative routing or safety assurance.

Decision:

Keep explicit advisory/fallback language. Establish content-review ownership and dates before claiming operational authority. Treat backup cryptography and readiness-score presentation as priority follow-up work.

## Architecture assessment

### Strengths

- React, TypeScript, Vite, and a generated Workbox service worker form a conventional local-first web stack.
- Core user data is stored locally through localStorage and IndexedDB, with export/import paths.
- External scripts, analytics, advertising, and cloud AI SDKs are absent from the runtime.
- Feed failures are isolated and return partial/static responses instead of crashing the UI.
- CSP, frame blocking, referrer policy, HSTS, and permissions policy are configured for hosted deployment.
- Existing module contracts provide meaningful coverage of content, offline, vault, and local-AI invariants.

### Material weaknesses found at baseline

| Priority | Finding | Evidence | Stabilization action |
|---|---|---|---|
| P0 | Text-integrity work could be weakened without proving the detector still detects corruption | Detector scanned files but did not test itself | Added positive and negative detector self-tests |
| P0 | Module 6 release gate failed on wording drift | Contract expected an explicit no-cloud-fallback statement | Aligned product copy with the actual deterministic fallback contract |
| P0 | Module 7 release gate false-failed on a commented static import and then required missing documents | Brittle substring assertion and absent docs | Replaced static-import check with an active-import regex; current docs become the evidence target |
| P0 | API verifier could hang and leave child processes | Unbounded fetches and process termination based on signal state rather than exit state | Added request/feed timeouts and process-tree termination |
| P0 | Hosted `/api/copilot/analyze` compatibility route was absent | Express implemented it; `api/` did not | Extracted shared handler and added serverless route |
| P0 | Vite dependency was inside a published vulnerable range | Installed 6.4.2 at baseline | Updated to 6.4.3 and refreshed lockfile |
| P1 | Remote feed URLs were not protocol-normalized | RSS/Atom links passed through to UI anchors | Centralized HTTP(S)-only URL normalization and contract checks |
| P1 | Shelter popup interpolated unescaped dataset text into HTML | `setHTML()` received raw address/room values | Escaped all dataset-derived popup fields |
| P1 | Corrupt map-progress JSON could break state operations | Parsed value was used without array/type validation | Normalized to a string array and preserved in-memory behavior on storage failure |
| P1 | `ingest:validate` rewrote a timestamped source report on every run | Validation changed `processedAssets.validation-report.json` | Made validation non-mutating and added explicit `ingest:report` generation |
| P1 | Source package contained ignored/generated/private files | Archive inventory | Produce a clean source deliverable excluding those files |

## Bottleneck and priority decision

The primary bottleneck was not component size. It was the inability to trust the release gate. Refactoring before restoring a reproducible gate would make regressions harder to detect and rollback.

Priority order:

1. Protect Norwegian text integrity.
2. Restore deterministic, bounded validation.
3. Restore local/hosted API parity.
4. Remove known dependency and output-encoding defects.
5. Produce current audit evidence and a clean source artifact.
6. Only then address maintainability and product-structure debt.

## Modular roadmap

### Phase 0 — Establish a trustworthy baseline

`[0.1] Inventory source, generated files, environment files, scripts, and tests → verify: archive manifest identifies source contamination and missing evidence.`

`[0.2] Install dependencies from the lockfile without altering source → verify: type-check, contracts, build, and audit can be executed from an isolated directory.`

`[0.3] Run each baseline gate once and record actual results → verify: passing, failing, hanging, and environment-blocked checks are distinguished.`

### Phase 1 — Protect text integrity

`[1.1] Preserve v1 Norwegian content and avoid broad text rewrites → verify: source diff contains no unrelated content replacement.`

`[1.2] Add detector self-tests with known corrupt and valid Norwegian samples → verify: the verifier fails if corrupt samples are not detected or valid samples are rejected.`

`[1.3] Run text and localization checks after every content-bearing patch → verify: both checks pass.`

### Phase 2 — Repair the release gate

`[2.1] Replace brittle comment-sensitive contract matching with active-code matching → verify: commented stale text cannot fail the Module 7 import contract.`

`[2.2] Make API and feed verification time-bounded → verify: every request has a timeout and failed feeds return within the test window.`

`[2.3] Terminate verifier child process trees on success and failure → verify: no API or Vite child process remains after the command exits.`

`[2.4] Add a canonical one-pass verification chain → verify: npm run verify executes type, text, localization, ingest, build, API, and module contracts sequentially.`

### Phase 3 — Restore deployment parity and harden boundaries

`[3.1] Extract copilot analysis into one shared handler → verify: local Express and serverless deployment import the same deterministic logic.`

`[3.2] Add the hosted compatibility route → verify: api/copilot/analyze.ts exists, type-checks, and exports the deterministic handler.`

`[3.3] Restrict externally supplied feed links to HTTP(S) → verify: HTTPS is accepted; javascript: and data: are rejected by contract.`

`[3.4] Escape dataset fields used in map popup HTML → verify: no raw shelter address, room number, or capacity is interpolated into setHTML content.`

### Phase 4 — Dependency and failure-path stabilization

`[4.1] Upgrade Vite to the first patched 6.x release and refresh the lockfile → verify: installed Vite is at least 6.4.3.`

`[4.2] Refresh the nested esbuild dependency selected for tsx → verify: npm audit reports zero known vulnerabilities.`

`[4.3] Validate browser-storage input and catch writes where failure must not break UI state → verify: invalid JSON shapes fall back to an empty list and blocked storage preserves in-memory operation.`

### Phase 5 — Evidence and packaging

`[5.1] Replace missing historical documentation dependencies with current audit and validation records → verify: README links resolve and Module 7 checks current evidence files.`

`[5.2] Mark historical completion claims as non-current evidence → verify: PLAN-26-06-06.md directs readers to the current validation log.`

`[5.3] Build a clean source archive excluding node_modules, dist, .env, scratch, temporary, agent, and test-output artifacts → verify: archive inspection contains .env.example but none of the excluded paths.`

`[5.4] Run the complete non-browser release gate from the clean tree → verify: npm ci followed by npm run verify and npm run verify:security pass.`

`[5.5] Run Playwright on an unrestricted local machine → verify: npm run test:e2e passes with service-worker and offline route coverage.`

## Implemented changes

- Added `server/copilot.ts` and `api/copilot/analyze.ts` to share the compatibility handler across local and hosted runtimes.
- Bounded feed fetches and verification requests.
- Reworked dev/verification shutdown handling to terminate process trees.
- Added text-detector self-tests.
- Repaired Module 6 and Module 7 contract drift.
- Added HTTP(S)-only feed URL normalization.
- Escaped shelter popup fields.
- Hardened map-progress storage parsing and writes.
- Updated Vite, tsx, and resolved esbuild versions in the lockfile.
- Added `.env.example` and canonical verification scripts.
- Separated non-mutating `ingest:validate` from explicit `ingest:report` output generation.
- Removed the stale, unreferenced `scripts/run_verification.js`, whose assertions contradicted the current dynamic-import architecture and required absent files.
- Decoupled the mandatory text-integrity gate from the legacy Windows-specific `scratch/process_uorganisert.py` generator. The clean source package excludes `scratch`; when that optional file exists locally it is still scanned, but its absence no longer breaks validation.

## Deferred work and residual risk

### Release condition

The Playwright browser gate is not waived. In this audit environment, Chromium was governed by a managed `URLBlocklist: ["*"]` policy and returned `ERR_BLOCKED_BY_ADMINISTRATOR` even for a local preview that was reachable with command-line HTTP tools. This is an environment limitation, not a passing application result.

### P1 follow-up

- Replace the current passphrase-based CryptoJS backup format with a versioned authenticated-encryption format and migration support.
- Change readiness grade/score presentation so the heuristic basis and non-validation status are impossible to miss.
- Establish an explicit content owner, source revision, and review date for high-consequence guidance and shelter data.
- Add automated accessibility testing and keyboard/screen-reader task checks.

### P2 follow-up

- Decompose `App.tsx`, `ShelterMap.tsx`, `StaticPages.tsx`, and other large components only after browser tests are executable.
- Test a simpler prepare / act now / maintain information architecture with representative users.
- Define performance budgets for startup JavaScript and map/icon chunks.
- Add CI that runs the canonical verification gate from a clean checkout and stores evidence by commit.
- Enforce a bounded build timeout in CI and investigate if the intermittent PWA transform stall recurs; two later clean-tree builds completed normally, so no speculative plugin rewrite was made.

## Local-first PowerShell validation

Run from the clean project root in dependency order:

```powershell
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }

npm run verify:text-integrity
if ($LASTEXITCODE -ne 0) { throw "Text-integrity gate failed" }

npm run verify
if ($LASTEXITCODE -ne 0) { throw "Non-browser verification failed" }

npm run verify:security
if ($LASTEXITCODE -ne 0) { throw "Dependency security gate failed" }

npm run test:e2e
if ($LASTEXITCODE -ne 0) { throw "Browser E2E gate failed" }
```

Check that verification did not leave local processes:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match 'Beredskap101|vite.*3011|server\.js' } |
  Select-Object ProcessId, ParentProcessId, Name, CommandLine
```

Build and inspect the production package only after all gates pass:

```powershell
npm run build
if ($LASTEXITCODE -ne 0) { throw "Production build failed" }

Get-ChildItem .\dist -Recurse -File |
  Sort-Object FullName |
  Select-Object FullName, Length
```

## Rollback rule

Do not patch forward after a text-integrity, localization, or browser regression. Restore the last clean source package or commit, rerun the failing gate, and reapply only the smallest isolated change. No completion claim is valid without command output tied to the exact source revision.
