# Beredskap101 return-to-project audit and implementation

Date: 2026-10-31 (Europe/Oslo). Final validation recorded at 23:38 Oslo / 22:38 UTC. Status: **LOCAL STABILIZATION VALIDATED; PRODUCTION APPROVAL NOT ESTABLISHED**. This is the current session's durable evidence ledger; older audit reports are historical inputs, not proof of current behavior. The local repair phases are complete; release tasks R1–R4 remain explicitly outstanding.

## Scope, baseline, and decision rules

- Starting HEAD: `206e858dc46f26d2d79e2d4ee6001312192a21fe`, branch `main`. Product, test, server, and tooling changes already existed in the working tree. Preserve them. No attribution of defects to a particular developer is established by this audit.
- Starting tracked product diff preserved in `scratch/audit-2026-10-31-starting-product.patch`. Untracked starting files include `server/localModelTransport.ts`, `scripts/verify-stabilization-data.mjs`, and the July status ledger; do not delete or overwrite them as cleanup.
- Runtime observed: Node 24.19.0, npm 11.10.1, Windows PowerShell. Existing installed dependencies are used for initial diagnosis. Clean installation and remote CI are separate evidence.
- Authorized scope: audit and reversible local implementation of evidence-backed stabilization; preserve routes, storage keys, NO/EN behavior, API contracts, and legacy backup imports. No production deployment, Git history rewrite, bulk cleanup, licensing choice, or source-content reingestion is needed to make the local deliverable reviewable.
- Acceptance: executable verification gate; truthful persistence and restore failure results; usable offline core and map responses; bounded local-model/feed behavior; preserved primary journeys; documented remaining release blockers. No claim of production readiness without the corresponding evidence.
- Trade-off: repair demonstrated defects before broad App.tsx extraction, design changes, full strict-mode conversion, or speculative infrastructure. The older plan's automatic three identical deterministic passes conflicts with the current proportionate-validation instruction and is not adopted.

## Methods researched and applied

These are documented professional practices, not a claim that any source ranks the world's best practitioners.

| Primary source | Practice applied here |
| --- | --- |
| [NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) | Preserve evidence, examine trust boundaries and dependencies, verify fixes and residual risks. |
| [Design Council Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/) | Establish user needs and intended outcome before choosing a repair; distinguish product hypotheses from observed user behavior. |
| [SRE release engineering](https://sre.google/workbook/canarying-releases/) | Automate repeatable checks, test the built artifact, record exact release limits and rollback paths. This is process guidance; no Google service or model is introduced. |
| [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) | Check that failures and async results are understandable and exposed to assistive technology. |

Tools: PowerShell, ripgrep, Git read-only evidence/diffs, existing TypeScript/Vite checks, Node behavioral contracts, Playwright against production output. Use local scripts and bounded logs rather than repeated manual source inspection. No new runtime dependency is planned.

## Intended end state versus current evidence

Sources of intent: README.md; REPO_OPERATING_MODEL.md; docs/ui-ux-functional-redesign-overview.md; July remediation roadmap and stabilization plan. The existing dashboard/navigation structure is preserved.

| Capability | Starting evidence | Confidence / gap |
| --- | --- | --- |
| Bilingual preparedness reference, library, checklists, shelters | Implemented routes/components and E2E suite exist | OBSERVED in source; current browser verification pending. |
| Search/progression/cookie settings/status | Recent commits implement these paths | OBSERVED; not yet revalidated. |
| User-owned backup and local documents | v3 WebCrypto and legacy read paths, cross-store restore candidate exist | OBSERVED; failure, storage-backend consistency, and legacy regression checks needed. |
| Offline maps | PMTiles precache glob and manual Range/HEAD handler exist | OBSERVED; handler rejects otherwise satisfiable overlong ranges; actual rendering not yet verified. |
| Safe updates | Waiting-worker prompt candidate exists | OBSERVED; two-version/multi-tab behavior not yet tested. |
| Optional local model and feeds | DNS-pinned transport and bounded upstream fetch candidate exist | OBSERVED; transport and hosted/local behavior require targeted tests. |
| Release assurance | Verification and CI configuration exist | UNKNOWN current result. Earlier assertion-only checks and hung browser exit are historical concerns. |
| External content review, human usability, deployed behavior | No current evidence established | UNKNOWN; local software checks cannot substitute for qualified content review or deployment checks. |

## Adversarial retrospective (pass 1: intent and delivery)

- **Project Lead:** Multiple dated plans and a large dirty working tree make completion claims difficult to reconstruct. Require one current ledger and executable checks. A successful build alone cannot establish a release.
- **Design Thinking Coach:** The audience and emergency-context workflows are documented assumptions. Preserve the existing product while testing urgent retrieval and failure recovery; do not convert a stabilization task into another redesign.
- **UX Designer:** Treat persistence failure, offline fallback, source authority, mobile access, and keyboard interaction as user journeys. The existing tactical vocabulary and dense presentation are debt to assess, not justification for a wholesale layout change.
- **Senior Analyst:** Separate source existence, browser observation, contract assertions, and actual verified behavior. Readiness heuristics, review dates, cache status, and external feeds must not imply authority or freshness beyond their evidence.

## Sequential roadmap and live checklist

### Phase A — Establish a trustworthy baseline

- [x] `[A1 Inspect intent, current code, Git state and old plans] → verify: [record HEAD, dirty paths, runtime and product contract above].`
- [x] `[A2 Preserve the starting product diff and create this ledger] → verify: [patch exists and existing user work remains intact].`
- [x] `[A3 Run npm run verify and diagnose the first failure] → verify: [bounded command returns a meaningful exit code and log identifies the failing behavior].`
- [x] `[A4 Run dependency advisory and browser baselines] → verify: [record successes, failures, environment restrictions, and clean process termination separately].` Advisory status remains UNKNOWN under the explicit owner decision below.

### Phase B — Repair demonstrated data and runtime defects

- [x] `[B1 Exercise persistence denial, backend changes and restore rollback] → verify: [failed writes cannot report success; reload sees the last successful write; failed restore preserves old records].`
- [x] `[B2 Repair only the proven persistence defects] → verify: [behavioral regression checks and legacy v1/v2/v3 imports pass].`
- [x] `[B3 Exercise offline archive ranges, cached navigation and update boundaries] → verify: [cached bytes/headers match HTTP semantics and core routes remain usable].`
- [x] `[B4 Exercise local-model and feed limits] → verify: [redirects, invalid responses, public/mixed DNS, body limits and deadlines fail safely].`

### Phase C — Close high-value usability and performance gaps

- [x] `[C1 Check bilingual main journeys, keyboard access and failure messages] → verify: [focused browser tests pass and limitations are recorded].` Coverage is focused; full assistive-technology and cross-device verification remains in R2.
- [x] `[C2 Remove confirmed bundle waste without redesigning components] → verify: [configured icons still render and production sizes improve if this bottleneck is confirmed].`

### Phase D — Review, validate and hand off

- [x] `[D1 Adversarially review the patch against malformed inputs and prior contracts] → verify: [new findings are corrected or explicitly classified].`
- [x] `[D2 Run applicable final gates against the final local source] → verify: [static/contracts/build and browser exit results recorded; advisory query result classified].`
- [x] `[D3 Reconcile README, release instructions and this ledger] → verify: [current status, commands, rollback, remaining blockers and next steps agree].`

## Review passes and validation log

1. Intent/delivery retrospective: started; findings and assumptions above.
2. Baseline/tooling and dependency review: completed. Type check, text/localization, ingest and build passed. Canonical verification stopped at API readiness because sandbox loopback returns `EACCES`, not because the API failed. With permitted localhost access, API/proxy suite passed (`scratch/audit-2026-10-31-api-baseline.log`); existing Chromium suite passed **24/24 in 40.7 seconds and exited 0** (`scratch/audit-2026-10-31-browser-baseline.log`). The historical hung browser exit did not reproduce: no harness rewrite is justified. Phase-5 contracts also passed. Baseline largest chunks: MapLibre 967,745 bytes; icons 852,375 bytes; vendor 478,116 bytes; entry 365,955 bytes. Precache 38 entries / 3719.23 KiB.
3. Data integrity and trust-boundary review: confirmed two failures in real Chromium IndexedDB before correction (`scratch/audit-2026-10-31-persistence-before.log`): fallback writes were hidden by stale database data; synchronous failure queuing the second restore store allowed the first store to commit while claiming rollback succeeded. Corrected tests passed **3/3** (`scratch/audit-2026-10-31-persistence-after.log`). Additional deletion-tombstone, user-journey and runtime-boundary checks are being added. Source inspection also found generated-list initialization never restored saved checks; legacy UI import rejected short existing passphrases; hardcoded review dates and quality claims lacked evidence. These are being corrected.
4. Built-artifact/offline/UX review: expanded browser run returned **33 passed / 3 failed** (`scratch/audit-2026-10-31-browser-pass4.log`). New tests verified short legacy passphrase import, generated-list persistence and keyboard operation, truthful review labels, actual IndexedDB rollback, fallback recovery, deletion tombstones, and two-version/multi-tab upgrades. Two mobile checks exposed checklist sub-tabs extending page width to 349px on a 320px viewport and 451px on a 390px viewport. The map test exposed a startup race: the initial unresolved provider state was treated as a missing package and overwrote the stored offline-package mode before asynchronous provider discovery completed. Corrections are a wrapping sub-tab container and an explicit provider-resolution state; rebuilt focused checks are pending. No test was weakened to accept these defects.
5. Final adversarial regression and release assessment: completed. The focused offline/mobile rerun passed **5/5 in 16.7 seconds** after fixing the actual causes. A compatibility counterexample then showed that always preferring a progress fallback could regress users of older versions that left stale copies behind. That test failed before the corrective patch (`scratch/audit-2026-10-31-legacy-precedence-before.log`). Newly written fallback progress now carries internal `_storageFallback` metadata; legacy copies are reconciled by `lastSynced`. This metadata is removed by the existing normalization/export path. An intentionally restored older snapshot still takes precedence as a new acknowledged write. No storage key or IndexedDB schema changed. Final gates passed, including this case, standard-checklist keyboard/storage-denial behavior, and stalled DNS/body deadlines. The final combined browser run passed **38/38 in 49.6 seconds**, exited 0, with no skipped tests or retries in this local run.

Each pass must reduce a different uncertainty; identical deterministic reruns do not count as independent evidence.

### Dependency advisory decision

The sandbox advisory query failed DNS resolution. Automatic approval review rejected the escalated npm query because it would send package/version metadata externally. The user explicitly chose **"Keep dependency audit local; mark advisories unverified"**. Do not retry, proxy, browse package inventories, or otherwise send dependency metadata. Installed version/lockfile checks remain permitted; current advisory status remains UNKNOWN. No new dependency or lockfile upgrade is authorized by this decision.

### Corrections in progress and rollback

- Real IndexedDB writes now explicitly abort on a synchronous queue failure and wait for transaction completion/abort. Fallback records take precedence until a successful database save clears them; empty document fallback arrays prevent resurrection. Database opens have a bounded timeout and late connections close.
- Four statically imported icons replace full-library dynamic lookup; IDs, styles, and fallback rendering remain unchanged.
- Cached archive single-range responses clamp overlong end positions and support suffix ranges rather than rejecting satisfiable requests.
- Legacy import strength checks apply to new exports only; restore and document status messages receive alert/status semantics.
- Generated checklist recovery and truthful review provenance are being validated.
- A two-version test reproduced a stale secondary tab after accepting an update. Controller-change reload is now registered in each production tab; the built-artifact test confirms both tabs transition and the new index remains available offline with stored state retained. The prompt explicitly states that all tabs reload; unsaved in-memory edits should be saved before acceptance.
- The feed body-limit test reproduced an uncancelled oversized stream. Rejection now cancels the reader; DNS resolution is included in a bounded local-model deadline. Runtime checks cover local success, redirect rejection, invalid JSON, oversized bodies, public/mixed DNS policy, bounded feed concurrency and cache deduplication.
- Exact pre-edit copies of touched candidates are stored under `scratch/audit-2026-10-31-originals/` with `.snapshot` appended to prevent TypeScript from compiling recovery copies. Initial copied `.ts` files caused a transient type-check failure; they were renamed and are no longer compiler input. This was an audit-workflow error, not a baseline product defect.
- Roll back a specific session change by comparing its `.snapshot` to the current file and restoring only that session's hunks. Do not `git reset` the dirty starting tree. New files may be removed individually after checking references. No data migration or schema change was introduced.

## Findings register

Priority describes impact if left unresolved, not attribution to the external developer. VERIFIED means the named test exercised that behavior, not proof against every possible failure.

| ID | Priority | Finding / evidence | Disposition |
| --- | --- | --- | --- |
| F01 | P1 | Restore could commit its first IndexedDB write after a synchronous failure queuing the second. Real browser test reproduced false rollback success. | Corrected; real IndexedDB regression passed. |
| F02 | P1 | Successful fallback writes were hidden when old IndexedDB records became readable again. Real browser reproduction. | Corrected; explicit new-fallback precedence and legacy timestamp reconciliation passed in the combined browser run. |
| F03 | P1 | Clearing fallback documents removed the only deletion record, allowing old database documents to reappear. | Corrected with an empty-array tombstone; browser regression passed. |
| F04 | P1 | A persisted offline-package selection was discarded before provider discovery completed. Offline rendered-map test failed. | Corrected by waiting for provider resolution; actual offline MapLibre canvas and shelter-marker test passed. |
| F05 | P1 | Update acceptance changed the worker for every tab but only reloaded the initiating tab. Two-version browser reproduction. | Corrected; both tabs reload and the B index is usable offline, with local state retained. |
| F06 | P1 | Hardcoded review dates and quality-reviewed copy were stronger than available evidence; existing validation report records 18 assets with missing evidence. | Copy/date fabrication corrected; external content review remains OPEN. No underlying guidance was independently medically validated. |
| F07 | P2 | Generated-list mount effect captured a null checklist and never applied stored completion; save results were ignored. | Corrected; regeneration/reload, keyboard toggling and denied-storage journeys passed. |
| F08 | P2 | New-export password-strength rules blocked valid short legacy import passphrases. | Corrected for import only; short legacy UI import passed, v3 export restrictions retained. |
| F09 | P2 | Cached archive code rejected satisfiable overlong ranges and suffix ranges. | Corrected; byte-for-byte Node checks and actual offline worker integration passed. |
| F10 | P2 | Oversized decoded feed bodies were rejected without cancelling the stream. Behavioral stream test reproduced this. | Corrected; stream-cancellation regression passed. |
| F11 | P2 | Local-model request deadline began after DNS resolution. | DNS now bounded and included in the overall deadline; stalled-DNS/body checks passed. This protects the Node transport, not browser-direct DNS. |
| F12 | P2 | Dynamic lookup of four fixed icons retained the entire icon library. Measured 852,375-byte chunk. | Corrected with a static registry; measured icon chunk 28,236 bytes, about 96.7% smaller. |
| F13 | P2 | Checklist sub-tabs forced 349px/451px document widths on 320px/390px phone viewports. | Corrected with wrapping; both widths and both languages passed. |
| F14 | P2 | Restore/document async status messages had no live-region semantics; checklist rows required a pointer and standard-list storage denial only reached the console. | Corrected on changed paths with alert/status and native keyboard-operable controls. Standard-list keyboard/reload/denial checks passed. Full WCAG conformance NOT TESTED. |
| F15 | P2 | LAN instructions implied plain HTTP could install an offline PWA. | README corrected: trusted HTTPS or same-device localhost is required for the relevant browser capabilities. Physical-device LAN HTTPS NOT TESTED. |
| F16 | Release evidence | Current advisory status cannot be established under the owner's local-only decision. | UNKNOWN; no advisory query will be retried. |
| F17 | Release evidence | Working main is 18 commits ahead of the local origin/main reference (0 behind), with substantial pre-existing uncommitted changes. No remote fetch was made. | Local snapshot preserved; remote recovery/CI status UNKNOWN. No push or commit of mixed user work performed. |
| F18 | Maintenance | App.tsx is approximately 2,600 lines; strict TypeScript is not enabled and some public boundaries use any. Several existing contracts inspect source strings. | OBSERVED debt; broad extraction/strict-mode conversion is deferred to avoid disguising refactoring as stabilization. Added tests exercise actual failures. |

## Remaining modular roadmap toward an actual release

These tasks are distinct from the local repairs above. They are not marked complete merely because a local build passes. Implement sequentially within each module; independent owner reviews can be scheduled separately.

### R1 — Establish content authority (release blocker)

Purpose: prevent unsupported safety claims. Starting state: app-authored/processed reference material exists, but independent review evidence is not established. Affected: `src/data/processedAssets.json`, its validation report, source metadata and the relevant first-aid/preparedness pages. Keep raw source harvesting and sibling content-lab runtime dependencies outside this repository.

1. `[R1.1 Inventory safety-relevant topics and the 18 accepted assets, mapping each to its original source, jurisdiction, revision and licensing evidence] → verify: [each record has evidence or is explicitly unreviewed; generation timestamps are never counted as review].`
2. `[R1.2 Have a qualified human review first-aid/medical and preparedness instructions against authoritative sources and record scope, reviewer, date and corrections] → verify: [no safety-critical discrepancy remains unresolved; unknown evidence stays unknown].`
3. `[R1.3 Apply only reviewed content corrections through the approved ingest process] → verify: [npm run ingest:validate, npm run verify and the affected bilingual browser journeys pass].`
4. `[R1.4 Audit UI/source labels against the review record] → verify: [reviewed claims identify actual evidence and unreviewed content is visibly labelled].`

Stop if source rights or medical correctness are unresolved. Rollback: restore only the prior curated dataset/metadata patch and rebuild. Do not fabricate missing reviewer information or independently generate replacement medical instructions as a shortcut.

### R2 — Complete targeted runtime assurance

Purpose: close consequential untested boundaries without adding a new framework. Starting state: targeted Chromium/Node checks exist; cross-browser, process-crash and concurrent-writer guarantees are absent.

1. `[R2.1 Exercise backup/import and offline/update journeys on Firefox, WebKit, and representative iOS/Android devices using the same source candidate] → verify: [real IndexedDB, WebCrypto, MapLibre, service workers and keyboard/touch paths succeed or a supported fallback is documented].`
2. `[R2.2 Inject a browser close/process interruption between localStorage and IndexedDB restore stages, and simultaneous document writes from two tabs] → verify: [old data is recoverable and no success claim hides lost writes].`
3. `[R2.3 If those tests demonstrate a defect, choose the smallest repair at src/utils/saveSystem.ts and the affected callers] → verify: [the new failing case passes, and existing v1/v2/v3 compatibility and denial tests remain green].`
4. `[R2.4 Exercise browser-direct LocalAiAssistant settings, redirects, response limits and unavailable endpoints separately from server/localModelTransport.ts] → verify: [configured local-only behavior and deterministic fallback are demonstrated; Node DNS tests are not counted as browser protection].`
5. `[R2.5 Run keyboard, focus, screen-reader, contrast and reduced-motion checks across the main destinations] → verify: [critical journeys complete without a pointer and actionable errors are announced].`

Stop on confirmed data loss or an unsupported privacy claim. Cross-engine storage rollback is currently best effort, not crash-atomic; concurrency and crash recovery must not be described as verified. Preserve current keys, schema and backup formats. Rollback: bounded file patch, with regression tests retained.

### R3 — Establish reproducible source and dependency evidence

Purpose: make a candidate reviewable and rebuildable. Affected: intended runtime/test changes, package metadata, CI and this ledger; exclude secrets, scratch evidence and unrelated agent-tool changes.

1. `[R3.1 Review the starting user changes and this session's delta separately, then commit only the agreed complete candidate] → verify: [all referenced runtime/test files are tracked and a clean checkout reproduces the candidate].`
2. `[R3.2 Run npm ci in an owner-approved build environment with the existing lockfile] → verify: [Node 24, install result and exact candidate SHA are recorded; no implicit dependency upgrades].`
3. `[R3.3 Keep advisory status unknown unless the owner later authorizes a trusted advisory process] → verify: [release documentation does not claim vulnerability clearance from a blocked query or package-version inspection].`
4. `[R3.4 Run npm run verify and npm run test:e2e in CI on that SHA] → verify: [jobs exit successfully, logs/artifacts identify the same SHA, and no retry-only pass conceals a persistent failure].`
5. `[R3.5 Confirm license/redistribution choices and assign an intentional prerelease version] → verify: [the owner approves the rights and package/release identity agree].`

No Git history rewrite or bulk tool cleanup is required. Stop before release if installation, required CI or content rights cannot be established. Rollback: previous reviewed candidate; preserve backups and user data.

### R4 — Validate deployment and operations

Purpose: distinguish local tests from production behavior. Starting state: no deployment was made by this audit. Affected: Vercel/static host configuration, `api/`, `vercel.json`, deployment runbook; do not publish `.env`, local documents or scratch logs.

1. `[R4.1 Create an approved preview from the reviewed candidate with the intended Node runtime and production headers] → verify: [deployed SHA matches and no sensitive build inputs appear in public output].`
2. `[R4.2 Exercise actual hosted functions, CSP, JSON-LD, feed failures, contact mailto handoff and deterministic copilot] → verify: [response contracts hold and failures do not claim live authority].`
3. `[R4.3 Install the deployed PWA online, then test offline routes, archive ranges, rendered map and A-to-B update on target devices] → verify: [the deployed artifact, not Vite preview alone, satisfies offline criteria].`
4. `[R4.4 Record logs, upstream/cache bounds, monitoring ownership and the previous deploy] → verify: [operational failures are visible without logging personal payloads and rollback can be exercised].`
5. `[R4.5 Promote only after R1–R4 acceptance evidence is recorded] → verify: [no unresolved release blocker is silently reclassified as complete].`

Rollback criterion: data loss, unusable offline core, update failure, wrong safety guidance, or sensitive-data exposure. Roll back the deployment to the preceding reviewed artifact; do not erase browser storage as a recovery shortcut.

## Final validation evidence and handoff

The final candidate is **HEAD 206e858 plus the preserved and amended working tree**, not the committed HEAD alone. A 122-file source/config/test/public-asset manifest is stored at `scratch/audit-2026-10-31-source-manifest.json`; its SHA-256 is `5F4C226ED5CA637F5611AC52FC412DC3289193D6B6A52D9C3C5614116409A668`. This ledger is excluded from that manifest to avoid self-referential hashes. No new dependency was installed or upgraded by this session; package-lock changes already existed at the start.

| Check | Final result | Local evidence |
| --- | --- | --- |
| `npm run verify` | PASS, exit 0 after the last runtime/UI source change | `scratch/audit-2026-10-31-final-verify.log` |
| TypeScript, text integrity, localization, ingest validation, production build | PASS as part of canonical verify | Same log; `lint` is the existing `tsc --noEmit`, not a full ESLint analysis |
| API/proxy parity and phase-5 checks | PASS; real localhost checks plus direct handler contracts | Same log |
| Modules 2–7 contracts | PASS; includes historical source-inspection checks, which are not independently proof of behavior | Same log |
| Storage rollback and compatibility | PASS: v1/v2/v3 contracts, all five localStorage write-failure positions, permanent rollback denial, real IndexedDB abort/recovery/tombstones/legacy precedence | Canonical log and browser log |
| Runtime boundaries | PASS: archive bytes/ranges; missing-review provenance; DNS policy and deadline; local-model redirect/body/schema/deadline cases; feed concurrency/dedup/retry/cancellation | Canonical log; `scratch/audit-2026-10-31-runtime-final.log` |
| `node node_modules/@playwright/test/cli.js test --project=chromium-offline` against the preceding final production build | **38 passed in 49.6s**, exit 0 | `scratch/audit-2026-10-31-browser-final.log` |
| Actual offline MapLibre map, markers and Range/HEAD responses | PASS in Chromium; package is a schematic orientation aid, not street routing | Browser log |
| Two-version upgrade with two tabs and offline B reload | PASS; persisted checklist data retained | Browser log |
| Mobile reflow | PASS on 320px and 390px viewports, NO and EN; not equivalent to physical-device testing | Browser log |
| Process cleanup | Ports 3002, 3011 and 4173 all returned ECONNREFUSED after checks, exit 0 | Explicit post-run Node socket check at 22:38 UTC |
| Patch whitespace and README local links | PASS | `git diff --check` and local link existence check |
| Dependency advisories | UNKNOWN, explicitly not queried further | Owner decision above |
| Clean install/remote CI/deployed site/full accessibility/qualified safety review | NOT TESTED or UNKNOWN as detailed in R1–R4 | No substitute claim made |

Non-blocking test-environment output: Playwright emits a `NO_COLOR`/`FORCE_COLOR` warning; this concerns terminal styling. The storage-denial contract deliberately logs `Simulated quota failure` while asserting a false save result. These expected diagnostics were classified, not silently hidden or counted as production faults.

Measured bundle change: icons **852,375 → 28,236 raw bytes** (about 96.7% smaller). Precache **3719.23 → 2916.11 KiB** (about 21.6% smaller). No runtime-latency benchmark was performed, and the 967,745-byte MapLibre chunk remains maintenance/performance debt rather than being hidden by a claim of comprehensive optimization.

### Process retrospective

The original 24 green browser tests were useful regression evidence but missed storage recovery, synchronous partial restore, multi-tab updates, rendered offline maps and phone reflow. Small discriminating tests found those defects; repeating the original green suite alone would not have done so. A new fallback rule required a second compatibility correction, caught before handoff. Recovery copies initially entered the TypeScript input set; non-source snapshot extensions corrected that workflow mistake. A README terminology change also tripped a source-string documentation contract; the label was preserved, and current audit checks now point to this ledger. These lessons favor executable behavior checks, explicit baselines, and one authoritative status record over additional process layers.

The five review passes are complete. Further deterministic reruns without a new change or unresolved behavior have low value. Continue at R1–R4 when the required reviewer, target-device, release-environment or owner evidence is available. Existing unrelated changes and tool directories remain intact. No commit, push, release tag, history rewrite, production deployment or content reingestion was performed.

## 2026-11-01 GitHub handoff

The owner subsequently authorized committing and publishing the project for use on another computer. The handoff branch is `cx/stabilization-2026-10-04` in `ruishinor/Beredskap101`; `docs/CLONE_AND_SETUP.md` contains the exact checkout and setup commands. The branch name was already selected in the workspace before this handoff.

Application source, pending runtime/config changes, tests, current audit and historical planning context are included. Unrelated local agent-tool updates, private `.env`, credentials, browser records, build output and scratch logs are excluded. Local runtime/config/test/public files matched the audit's source manifest before the handoff-only README and CI edits.

CI installation now uses `npm ci --no-audit`; advisory queries require an explicit manual workflow opt-in. This preserves the owner's local-only advisory decision. A local credential-pattern preflight of the 46 selected files found no matches; this is a bounded check, not proof against all possible secret formats. Lockfile portability and patch whitespace checks passed.

Handoff checks completed for application commit `063f6cfe8e74bf91619ebd6d657d8bbe6b0fdcbd`:

- Pushed the branch to GitHub and verified the remote SHA matched the local commit. The default `main` branch was not changed.
- Cloned that branch from GitHub into a fresh temporary directory. The checkout was clean.
- Ran `npm ci --offline --no-audit --no-fund`: installed 507 locked packages using local cache, exit 0. No advisory query was made. npm emitted existing dependency-deprecation notices for source-map and glob; no dependency upgrade was included in the handoff.
- Ran `npm run verify` from that fresh clone, without a private `.env`: all non-browser gates passed, exit 0. The checkout remained clean. Evidence logs remain local at `scratch/github-clean-install.log` and `scratch/github-clean-verify.log` in the original workspace.
- Both GitHub Actions jobs, `gate` and `e2e`, passed on Ubuntu/Node 24: [verification run 41332410364](https://github.com/ruishinor/Beredskap101/actions/runs/41332410364).
- Subsequent handoff-record edits are documentation only. The previously stated safety-content, full accessibility, target-device and advisory limitations remain; publication is not a production-readiness approval.

## Resume instructions

Read this file and the last relevant scratch log first. Inspect Git diff before editing; user changes predate this session. Continue the first unchecked dependency. Update this ledger after each meaningful finding or validation. Do not treat a pending process, inaccessible network service, old green log, or source-string contract as a current behavioral pass.
