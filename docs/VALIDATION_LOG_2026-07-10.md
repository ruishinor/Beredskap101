# Beredskap101 Validation Log

Date: 2026-07-10
Source: uploaded v1 archive only

## Baseline

| Check | Baseline result | Evidence summary |
|---|---|---|
| `npm run lint` | Pass | TypeScript completed without errors |
| `npm run verify:text-integrity` | Pass | Existing scan found no listed corrupt fragments |
| `npm run verify:localization` | Pass | Norwegian localization checks passed |
| `npm run ingest:validate` | Pass | Processed-asset validation passed |
| Module 2–5 contracts | Pass | Existing contract scripts passed |
| Module 6 contract | Fail | Product copy did not contain the exact no-cloud-fallback contract |
| Module 7 contract | Fail | Comment-sensitive import check failed; missing audit documents also blocked completion |
| `npm run build` | Pass | Production assets and service worker were generated |
| `npm run verify:module1:api` | Hang | External requests and child processes were not bounded robustly |
| `npm audit` | Fail at moderate threshold | One high-severity Vite advisory and one low-severity transitive esbuild advisory |
| Playwright | Environment-blocked | Managed Chromium policy blocked all URLs, including local preview |

## Corrective changes validated during implementation

| Change | Integrated check |
|---|---|
| Text detector self-test | `npm run verify:text-integrity` |
| Explicit no-cloud-fallback copy | `npm run verify:module6:contracts` |
| Active-import contract matching | `npm run verify:module7:contracts` |
| Bounded feed/API requests and process-tree cleanup | `npm run verify:module1:api` plus post-run process inspection |
| Shared local/serverless copilot handler | `npm run lint`, API contract, and Module 7 deployment contract |
| HTTP(S)-only feed link normalization | Module 1 contract checks |
| Escaped shelter popup fields | Type-check and Module 2 map contract |
| Validated map-progress storage input | Type-check and browser regression gate |
| Non-mutating ingest validation | Repeated `npm run ingest:validate` left the report hash unchanged |
| Vite/tsx/esbuild dependency refresh | `npm audit --audit-level=low` |
| Clean-package text gate | Legacy `scratch/process_uorganisert.py` is optional; clean source verification scans required production files and still scans the generator when present |

## Final gate

This section is updated only from the final clean-tree run.

| Command | Result | Notes |
|---|---|---|
| `npm ci` | Pass | Clean reinstall added 512 packages and reported zero known vulnerabilities |
| `npm run verify` | Pass | Clean-tree chain reached successful completion of type, text, localization, ingest, build, bounded API/proxy, and Modules 2–7 |
| `npm run verify:security` | Pass | Zero moderate, high, or critical advisories |
| `npm audit --audit-level=low` | Pass | Zero known advisories after lockfile refresh |
| Source mutation check | Pass | SHA-256 inventory before and after `npm run verify` was identical when generated output and logs were excluded |
| `npm run test:e2e` | Environment-blocked | Playwright browser binary was unavailable; download failed with `EAI_AGAIN cdn.playwright.dev`. Earlier system-Chromium fallback was blocked by managed URL policy. No browser-test pass is claimed. |

## Clean-package correction

The first verification attempt in the clean staging tree failed before scanning because the verifier unconditionally opened `scratch/process_uorganisert.py`, while the clean deliverable intentionally excludes the legacy scratch directory. The generator contains hard-coded Windows paths and is not part of the maintained production source. The gate was corrected so production targets remain mandatory and the generator is scanned only when present. This preserves the v1 text-integrity protection without making release validation depend on discarded scratch material.

## Failure-handling note

The first post-upgrade canonical run stalled during the Vite transform phase while using the incrementally modified `node_modules` tree. The run was stopped, `node_modules` and `dist` were removed, and `npm ci` was executed from the updated lockfile. A clean build then completed in approximately 19 seconds, and the subsequent canonical verification completed successfully. This is why `npm ci` is a prerequisite in the documented release procedure.

A later clean-tree invocation also stalled once during the PWA build path. The process was terminated rather than accepted. An isolated clean build then completed in about 20 seconds, followed by a complete canonical verification on the same source tree. This remains a reproducibility warning: deployment automation should enforce an explicit build timeout and retain the failed log if it recurs.

## Release rule

A successful non-browser gate is necessary but not sufficient. Production approval requires the browser E2E command to pass on the exact source revision being deployed.
