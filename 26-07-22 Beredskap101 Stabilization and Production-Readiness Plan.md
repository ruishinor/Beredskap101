# Beredskap101 Stabilization and Production-Readiness Plan

## Summary and Current Verdict

**Status: RED — functional remediation candidate, not deployment-ready. Confidence: high.**

The intended product is a bilingual, privacy-preserving, local-first preparedness PWA that remains useful offline and communicates source authority and limitations honestly. A PWA is justified because offline search, browser persistence, interactive tools, and installability exceed what a static document can provide; printable/exportable reference material should remain a fallback.

Confirmed current state:

- Local `main` at `206e858` is 18 commits ahead of `origin/main`; the work is not remotely backed up or CI-verified.
- Phases 0, 1, 2, and 5 have candidate implementations. Phases 3, 4, 6, 7, and 8 remain materially unfinished.
- `npm run verify` fails in Module 7 because its CSP contract still demands local-AI origins in production while `vercel.json` correctly restricts production to same-origin.
- All 23 Playwright tests reported `ok`, but `npm run test:e2e` never exited and timed out after 600 seconds. This is a failed gate.
- The production build succeeds, but emits an 852 KB icon chunk and 1.055 MB MapLibre chunk; the precache is approximately 3.76 MiB before the PMTiles archive.
- Dependency security is currently **unverified**. The audit request could not reach npm’s advisory endpoint under the current data-egress policy.
- The public CI URL remains pending, package version is `0.0.0`, no release tag covers current `HEAD`, and no complete three-pass validation exists.
- No repository files were changed during this Plan Mode audit.

### Adversarial retrospective

- **Project Lead:** Claimed stage gates were bypassed. Work continued after Phase 0 remained externally unverified, checklists were not updated, and the only orchestration ledger is an untracked `plan.md`.
- **Design Thinking Coach:** Target audiences and emergency workflows are documented hypotheses rather than observed behavior. Feature accumulation has outpaced validated user need. Per the selected direction, the current UI structure will be stabilized rather than redesigned.
- **UX Designer:** The interface retains tactical-dashboard language, misleading progression metaphors, incorrect mobile labels, duplicated/hidden search, weak navigation semantics, and incomplete reduced-motion/accessibility behavior.
- **Senior Analyst:** Trust remains the bottleneck. “Quality-reviewed” claims lack external review evidence; readiness scores imply unsupported precision; unknown review dates are converted into precise dates; offline mode is sometimes styled as a failure even when it is the intended operating state.

### Principal findings requiring remediation

1. The canonical verification gate fails.
2. The E2E suite completes assertions but cannot terminate cleanly.
3. Current work is local-only and lacks durable CI evidence.
4. Progress documents contradict the repository state.
5. Persistence and restore flows can report success after failed or partial writes.
6. The “vault” stores documents unencrypted while its name implies stronger protection.
7. Readiness grades and scores are unvalidated substring heuristics.
8. Missing content-review dates are presented as fabricated precise dates.
9. The bundled PMTiles map is not guaranteed to work offline through the current service worker.
10. Immediate service-worker activation can strand old clients with missing lazy chunks.
11. Hosted feed endpoints lack equivalent operational bounds to the local Express server.
12. Local CORS, endpoint resolution, redirects, and model responses are insufficiently constrained.
13. Many contracts validate source strings rather than observable behavior.
14. TypeScript strictness and public-boundary validation are weak.
15. `App.tsx` combines routing, storage coordination, search, data loading, and most rendering.
16. Content review, accessibility evidence, release identity, rollback proof, and operations evidence remain absent.

## Locked Interfaces and Defaults

- Preserve every existing hash route, query parameter, localStorage/IndexedDB key, NO/EN contract, and v1/v2/v3 backup import path.
- Preserve the current knowledge-map/dashboard information architecture. A task-first redesign is explicitly deferred.
- Keep `/api/healthz`, `/api/contact`, `/api/source-feeds`, `/api/norway-news`, and `/api/copilot/analyze` wire-compatible.
- Extend copilot responses additively with `advisory: true`, `methodology: "unvalidated-heuristic"`, and provenance metadata; do not remove existing fields in this release.
- Retain legacy CryptoJS formats for **decrypt/import only**. Never create new weakly encrypted exports.
- Add an internal `PersistenceResult` contract so storage callers receive truthful backend, success, and error information.
- Add a shared `ContentProvenance` model covering origin, review state, reviewer evidence, source revision, freshness, and generated/personal status.
- Add `B101_ALLOWED_ORIGINS` for explicit LAN development origins; do not accept arbitrary private-network origins.
- Use no Google or Gemini model/API. Optional AI remains local through Ollama, llama.cpp, or another local OpenAI-compatible endpoint.
- Use Node.js 24 consistently across local metadata, CI, and Vercel. Keep `vercel.json`; migrating to `vercel.ts` is unnecessary for stabilization.
- Add only one repository dev dependency if needed: `@axe-core/playwright`. No new runtime dependency or state framework.

## Sequential Modular Roadmap

### Phase 0 — Preserve Evidence and Establish Control

- `[0.1 Create cx/audit-stabilization-2026-07-22 from 206e858 and push it as a non-production review branch] → verify: [remote branch SHA equals local HEAD and origin/main remains unchanged].`
- `[0.2 Create docs/AUDIT_AND_REMEDIATION_STATUS_2026-07-22.md with baseline SHA, phase checklist, findings, open blockers, validation runs, and rollback points] → verify: [document is committed and updated after every subsequent step].`
- `[0.3 Preserve the existing untracked plan.md without overwriting it; reconcile useful facts into the new status ledger] → verify: [plan.md content/hash remains unchanged unless separately reviewed].`
- `[0.4 Record baseline build sizes, failing Module 7 output, E2E timeout, Git state, and unknown npm-audit status] → verify: [every claim names the exact command, result, timestamp, environment, and SHA].`
- `[0.5 Pin Node 24 in package metadata and CI; install the Vercel CLI with npm i -g vercel for later preview/env/log checks] → verify: [node, npm, and vercel versions are recorded and no secret values enter logs].`

**Phase gate:** documentation and remote recovery checks pass three consecutive times with a clean tracked tree.

### Phase 1 — Repair the Release Gate First

- `[1.1 Replace the stale Module 7 CSP assertions with separate behavioral contracts: production connect-src is self-only; the local Express policy permits only configured local origins] → verify: [the current production CSP passes, adding localhost to production fails, and removing configured local development support fails].`
- `[1.2 Include verify:phase5:contracts in the canonical verification chain and remove documentation/comment-string assertions from release-blocking contracts] → verify: [deliberately breaking each protected behavior causes its corresponding test to fail].`
- `[1.3 Silence expected negative-path stack traces without suppressing unexpected errors] → verify: [wrong-passphrase and corrupt-backup tests reject cleanly with typed codes and zero console warnings/errors].`
- `[1.4 Replace Playwright npm-wrapper web servers with direct Node/Vite processes and add bounded SIGINT/SIGTERM shutdown handling to the API server] → verify: [all tests finish, Playwright returns exit 0 within 180 seconds, ports 3002/4173 are released, and harness-owned child PIDs are gone].`
- `[1.5 If direct processes still hang, add a minimal e2e harness that starts both servers, runs Playwright, and tree-terminates them in finally] → verify: [normal, failing, interrupted, and timed-out runs all release ports and return the correct exit code].`
- `[1.6 Set Playwright retries to zero for release validation; add CI job timeouts and always-uploaded logs/reports keyed to SHA] → verify: [a forced failure remains failed and cannot become green through retry].`
- `[1.7 Add a three-pass release command and CI stage that runs static/contracts/build, security, and E2E sequentially on one SHA] → verify: [three independently logged passes complete with no retries, warnings, skips, flags, source mutation, or leaked processes].`
- `[1.8 Run npm audit --audit-level=low only in a trusted CI environment or explicitly authorized local session] → verify: [zero known advisories; inability to query remains a release blocker, never a pass].`

**Phase gate:** the entire current release gate passes three consecutive times before any product changes proceed.

### Phase 2 — Make Local Data and Backup Behavior Truthful

- `[2.1 Return failure when both IndexedDB and localStorage writes fail; expose the actual persistence backend to callers] → verify: [forced denial/quota errors never produce a success message].`
- `[2.2 Make restore/import transactional: snapshot current state, validate the complete payload, apply all stores, read back, and roll back every changed store on failure] → verify: [failure at each write position leaves byte-equivalent prior state].`
- `[2.3 Keep v1/v2 decrypt-only compatibility and v3 PBKDF2/AES-GCM export; remove new legacy weak-encryption export] → verify: [v1/v2/v3 imports work, v3 exports differ by salt/IV, and tampering/wrong passwords cause zero mutation].`
- `[2.4 When WebCrypto is unavailable, disable encrypted export and offer clearly labelled plaintext export only after an explicit warning] → verify: [no UI or file claims encryption when authenticated encryption was unavailable].`
- `[2.5 Rename user-facing “vault” language to “Local documents” and disclose that browser storage is not encrypted at rest] → verify: [the warning appears before sensitive-document creation and plaintext export in both locales].`
- `[2.6 Replace fabricated review-date fallbacks with null/unverified state] → verify: [missing evidence renders “Not externally reviewed,” never a generated date].`

**Phase gate:** storage, migration, failure, security, UI, and E2E tests pass three consecutive times with legacy fixtures preserved.

### Phase 3 — Bound Server, Feed, and Local-AI Risk

- `[3.1 Restrict CORS to exact defaults plus B101_ALLOWED_ORIGINS; require explicit configuration for LAN origins] → verify: [localhost and configured LAN origins pass; hostile .local, null, malformed, and unrelated private origins fail].`
- `[3.2 Apply shared feed timeouts, concurrency limits, maximum decoded body size, query normalization, TTL caching, and bounded cache keys to local and hosted handlers] → verify: [slow, oversized, malformed, burst, and upstream-failure cases stay bounded and return stable fallback contracts].`
- `[3.3 Add hosted cache headers and per-instance abuse protection while documenting that this is not a global distributed rate limit] → verify: [repeated normalized requests use cached responses and do not multiply upstream fan-out].`
- `[3.4 Validate local-model DNS results, reject public/mixed resolution, disable automatic redirects, revalidate any permitted redirect, and cap response size/time] → verify: [DNS rebinding, redirect-to-public, oversized JSON, invalid schema, and timeout cases fall back deterministically].`
- `[3.5 Validate every local-model response field and stop presenting heuristic readiness scores as validated assessment] → verify: [negation/repetition cannot improve authoritative status and all responses expose advisory methodology].`
- `[3.6 Make live and offline health responses use the same ISO timestamp contract] → verify: [local, hosted, cached, and offline health tests share one type and response shape].`

**Phase gate:** API integration, SSRF, abuse, cache, schema, and backwards-compatibility suites pass three consecutive times.

### Phase 4 — Make Offline and Update Claims Real

- `[4.1 Add the bundled PMTiles archive to an explicit offline-map strategy with HEAD and single-range response support] → verify: [MapLibre requests receive correct 200/206 headers and bytes from cache after WAN loss].`
- `[4.2 Test the rendered bundled map, not only labels or shelter-list fallback] → verify: [a fresh installed build renders the actual map offline and a corrupt/missing archive falls back honestly].`
- `[4.3 Replace unconditional skipWaiting/clientsClaim activation with an update-ready prompt and controlled reload handshake] → verify: [build A remains usable after build B is available; accepting the update loads B without losing local state].`
- `[4.4 Version runtime caches and remove obsolete caches only after controlled activation] → verify: [two-build upgrade tests retain required old assets until clients transition].`
- `[4.5 Make first-install, cache-ready, cached-stale, live, and offline-unavailable states explicit in both locales] → verify: [offline is not displayed as a critical failure when core content is ready].`

**Phase gate:** install, offline navigation, actual map, cache corruption, and A→B upgrade scenarios pass three consecutive times.

### Phase 5 — Stabilize the Existing UI and Accessibility

- `[5.1 Keep the present navigation and knowledge-map structure, but replace unsupported terms such as unlock, SOP, selected core, and readiness authority with plain factual language] → verify: [layout/routes remain unchanged and no copy promises functionality or validation that does not exist].`
- `[5.2 Correct mobile labels so every label matches its route; enforce at least 44×44 px targets and 12 px dock text] → verify: [320, 360, 390, and 430 px layouts have no clipping or mismatched destinations].`
- `[5.3 Keep one visible primary knowledge search and distinguish genuinely scoped Library, Shelter, and Local-document searches] → verify: [priority queries work offline, results open correctly, and back navigation preserves state].`
- `[5.4 Add skip navigation, semantic nav/main regions, aria-current, persistent labels, focus restoration, selectable content, visible focus, and complete reduced-motion behavior] → verify: [keyboard-only journeys pass and axe reports zero serious/critical findings].`
- `[5.5 Replace alarm-style offline status with task-relevant language and reserve red for actual failure] → verify: [cache-ready offline mode is calm and every live module shows live/cached/static freshness].`
- `[5.6 Apply ContentProvenance labels consistently to official-live, official-cached, official-link, app-authored/unreviewed, generated, personal, local-model, and deterministic content] → verify: [origin and freshness are visible and machine-testable in both locales].`

**Phase gate:** localization, keyboard, accessibility, reduced-motion, responsive, provenance, offline, and primary user-flow tests pass three consecutive times.

### Phase 6 — Type Safety, Architecture, and Performance

- `[6.1 Enable noUnusedLocals, noUnusedParameters, strictNullChecks, then full strict mode in separate reversible commits] → verify: [each increment passes the full compatibility suite before the next flag].`
- `[6.2 Type API handlers, processed assets, search documents, persistence results, and backup boundaries; remove boundary-level any casts] → verify: [invalid wire/data shapes fail validation rather than being cast through].`
- `[6.3 Extract only high-risk pure seams from App.tsx: route codec, search/index builder, and periodic status clock] → verify: [all hashes, query parameters, browser history, and rendering behavior remain identical].`
- `[6.4 Replace broad Lucide loading with a typed static icon registry and fallback icon] → verify: [every configured icon resolves and the icon chunk is at most 60 KB raw].`
- `[6.5 Keep QR/crypto/search/map code behind actual lazy boundaries and defer search-index construction until first query] → verify: [initial route does not preload those modules or construct the index].`
- `[6.6 Add explicit build budgets instead of hiding MapLibre behind a generic warning ceiling] → verify: [entry, vendor, icon, map, total precache, and offline-map sizes each meet recorded limits with zero unexplained build warnings].`

**Phase gate:** strict typing, routing parity, lazy loading, performance budgets, and full browser compatibility pass three consecutive times.

### Phase 7 — Repository, Documentation, and Release Identity

- `[7.1 Remove only confirmed generated/stale artifacts: tracked test output, temporary feed files, debug logs, and duplicate unreferenced verification runners] → verify: [reference scan is empty and clean checkout still builds/verifies].`
- `[7.2 Preserve .agents, _bmad, and related project tooling; exclude non-runtime tooling from deployment rather than deleting it] → verify: [developer workflows remain available and deployment contents contain only required runtime files].`
- `[7.3 Move superseded plans/audits into docs/history with clear historical banners; keep the new status ledger, validation log, README, and operating model authoritative] → verify: [all relative links resolve and no historical claim is presented as current evidence].`
- `[7.4 Document Vercel-root, static-only, and LAN deployment as distinct capability matrices] → verify: [each runbook states exactly which API/offline features are and are not available].`
- `[7.5 Set package version to 1.0.0-rc.1 and license metadata to UNLICENSED pending an explicit rights decision] → verify: [package, UI metadata, tag candidate, validation ledger, and deployed SHA agree].`
- `[7.6 Do not rewrite Git history, purge tool directories, overwrite plan.md, or create a final release tag] → verify: [all cleanup remains reversible and user-owned material is intact].`

**Phase gate:** clean-clone, documentation, packaging, deployment-exclusion, and compatibility checks pass three consecutive times.

### Phase 8 — Human Gates, Preview Deployment, and Release

- `[8.1 Obtain qualified external review of first-aid/medical content and preparedness guidance; record scope, reviewer, findings, corrections, jurisdiction, and source revision] → verify: [every safety-relevant asset has evidence or remains explicitly unreviewed].`
- `[8.2 Run observed usability checks covering urgent guidance, offline retrieval, shelter use, backup/restore, source authority, keyboard use, and mobile constraints] → verify: [task outcomes and unresolved problems are recorded; critical failures block release].`
- `[8.3 Use vercel env pull and a Vercel preview deployment from the exact candidate SHA; never print secrets] → verify: [preview SHA matches, CSP is clean, functions respond correctly, service worker installs, and offline flows work].`
- `[8.4 Inspect Vercel logs for API failures, timeouts, PII leakage, and unexpected upstream fan-out] → verify: [no sensitive payload logging or unresolved runtime error remains].`
- `[8.5 Validate static-only and LAN deployments separately, including the explicit reduced-capability matrix] → verify: [all promised features work and unavailable features fail honestly].`
- `[8.6 Exercise rollback to the previous known-good deployment and restore the candidate] → verify: [both transitions preserve browser data and pass three smoke cycles].`
- `[8.7 Run the complete release protocol three consecutive times on the exact immutable SHA] → verify: [zero errors, warnings, advisories, retries, skips, flags, console failures, source mutations, or leaked harness processes].`
- `[8.8 Promote 1.0.0 only after content review, rights decision, preview evidence, and rollback proof] → verify: [tag, package version, deployed SHA, validation ledger, and post-deploy checks match].`

## Mandatory Verification Protocol

A pass counts only when all of the following are true:

- Exact same SHA, lockfile, Node/npm versions, browser version, and environment classification.
- No failures, retries, skipped/fixme/quarantined tests, warnings, flags, browser-console errors, dependency advisories, or unexpected network calls.
- No tracked source mutation and no remaining harness-owned processes or listeners.
- Logs, build manifest, test report, and source SHA are retained.
- Every backwards-compatibility row passes: hash routes, query parameters, storage keys, v1/v2/v3 imports, NO/EN state, LAN mode, map fallbacks, API shapes, and browser history.
- An adversarial review is performed after each module; all findings are corrected before the three-pass count starts.
- Any failure resets that module’s consecutive-pass count to zero.
- A short retrospective is appended to the status ledger before proceeding.

Local PowerShell execution after the gate repair:

```powershell
$env:CI = '1'
1..3 | ForEach-Object {
  npm run verify:release
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
git status --porcelain=v2
Get-NetTCPConnection -State Listen |
  Where-Object { $_.LocalPort -in @(3002, 4173) }
```

## Assumptions and Release Boundaries

- The selected scope is stabilization of the current UI, not a task-first redesign.
- External medical/preparedness review and licensing authority cannot be manufactured by engineering; the product remains an RC until those gates are satisfied.
- Browser document storage remains unencrypted at rest for this release; the interface must state that plainly. Optional at-rest encryption is deferred because secure key management requires a separate product decision.
- Vercel preview validation is included; automatic production deployment is not.
- Privacy-preserving operational logs are acceptable; analytics, advertising, cloud AI, and hidden telemetry remain excluded.
- The broad tactical/knowledge-map visual concept is accepted design debt, but misleading authority, status, accessibility, and navigation defects are not.
