
# BEREDSKAP101 — END-TO-END REMEDIATION PLAN & ROADMAP

**Execution framework:** Sequentially modular. Phases are stage-gated: a phase does not start until its predecessor's Master Checklist is 100% green. Every module carries the six mandatory protocols. Every task is written as `[Step] → verify: [check]` so an AI-assisted coder can execute and audit it mechanically.

**Global constraints (apply to every module):**
- No installs of new runtime dependencies (dev-only tooling allowed only in Phase 0 for CI).
- No files touched outside `C:\00 DEV\In Progress\beredskap101-app`. Anything to be "deleted" is moved to `C:\00 DEV\In Progress\_beredskap101-quarantine\<date>\` (outside the folder, per your rule) and `git rm --cached` where tracked.
- Backwards compatibility: every module must keep existing routes, localStorage/IndexedDB keys, backup file formats (read path), URL hashes, and the Norwegian/English UI contract working. A module that breaks a prior phase's checks is reverted, not patched forward.
- After each module: `npm run lint && npm run build` must pass, plus the module's own checks.

---

## PHASE 0 — FOUNDATION: TRUSTWORTHY RELEASE GATE (the bottleneck)

**Module 0.1 — Fix the browser gate so "green" means green**

**1. Bottleneck Identification:** Every other phase's validation depends on the e2e suite being executable and honest. Today it is neither: the only recorded run failed because `tests/ui-regressions.spec.ts:68` asserts on live `tile.openstreetmap.org` fetches — unpassable in an offline sandbox and impolite to OSM. This is the core dependency; solve it first.

**2. Anti-Complexity Guardrails:** Do not add a mock server, MSW, or new deps. One `page.route` stub returning a 1×1 PNG is sufficient. Do not split the mega-test yet (that's Module 0.2); minimal change to get a truthful green.

**3. Implementation & Validation:**

- [3.1] In `tests/ui-regressions.spec.ts`, add a `test.beforeEach` that intercepts tiles:
  ```ts
  test.beforeEach(async ({ page }) => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');
    await page.route('**/tile.openstreetmap.org/**', r => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
  });
  ```
  → verify: `npx playwright test tests/ui-regressions.spec.ts --project=chromium-offline` passes with network disabled at the OS level (unplug/disable adapter or block via hosts file) — proving no WAN dependency.
- [3.2] Fix the no-op click aggravator: the test clicks "Street" while already in street mode (localStorage coercion at `ShelterMap.tsx:143-145`). Before the street assertion, explicitly set `localStorage.setItem('shelter-map-layer','topographic')` and reload, *then* click Street so `setMapLayerMode` actually fires. → verify: the `/Street map active|Gatekart aktivt/` assertion passes deterministically in 3 consecutive local runs.
- [3.3] Make `test:e2e` self-contained: `package.json:37` → `"test:e2e": "npm run build && playwright test --project=chromium-offline"`. → verify: `npm run test:e2e` from a clean `dist/`-deleted state passes.
- [3.4] In `playwright.config.ts`, set `reuseExistingServer: !process.env.CI` and add `retries: process.env.CI ? 1 : 0`. → verify: config loads (`npx playwright test --list` prints the suite).

**4. Adversarial Review:** *Edge case* — stubbed tile PNG makes the Leaflet `load` event fire even offline; could this mask a real regression where street mode is broken? Mitigation: add one assertion that the *fallback* label appears when tiles 404 (add a second test with `route.abort()`), so both paths are pinned. *Logical fallacy* — a green suite now doesn't retroactively validate the shipped v1; the validation log must say so explicitly (Module 0.3).

**5. Failure Handling:** If the route stub fails under `chromium-offline` (project may set offline context), scope the stub to only intercept when online, or move the stub into the specific street-mode test rather than `beforeEach`. Fallback: assert the offline-grid label instead of street-active for that single assertion and file a follow-up task.

**6. Retrospective:** This module converts the release gate from aspirational to executable — the precondition for every later claim. Aligned with the repo's own evidence-hierarchy doctrine.

**Module 0.2 — Split the mega-test**

- [1] Bottleneck: one 110-line test × ~40 assertions means one red X voids all route coverage. → [2] Guardrail: split by existing route boundaries only; no new helpers beyond one shared `assertNoPageErrors`. → [3] Split `ui-regressions.spec.ts` into one `test()` per route (library, support, contact, shelters, checklists, faq, privacy, about) → verify: `npx playwright test --list` shows ≥8 tests; suite green. → [4] Adversarial: shared `beforeEach` stub duplicated? Keep the route stub in a `test.beforeEach` at file top so all splits inherit it. → [5] Failure: if a per-route test is flaky, quarantine it with `test.fixme` + a tracking comment rather than deleting. → [6] Retro: coverage granularity now matches failure isolation.

**Module 0.3 — Continuous integration + honest evidence**

- [1] Bottleneck: the entire verification apparatus runs only when one person remembers, on one Windows machine.
- [2] Guardrail: one workflow file, two jobs, no matrix, no caching cleverness beyond `actions/setup-node` npm cache. `.github/` currently holds only BMAD agent files — add `workflows/` alongside; do not disturb existing content.
- [3] Create `.github/workflows/verify.yml`:
  ```yaml
  name: verify
  on: [push, pull_request]
  jobs:
    gate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 22, cache: npm }
        - run: npm ci
        - run: npm run verify:text-integrity
        - run: npm run verify
        - run: npm run verify:security
    e2e:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 22, cache: npm }
        - run: npm ci
        - run: npx playwright install --with-deps chromium
        - run: npm run test:e2e
        - uses: actions/upload-artifact@v4
          if: failure()
          with: { name: playwright-report, path: test-results/ }
  ```
  → verify: push to a branch; both jobs green on the GitHub run page; the run URL is a durable public evidence record.
- [3b] Append the CI run URL + commit SHA to `docs/VALIDATION_LOG_2026-07-10.md` under a new `## CI gate record` section, with an explicit note that the 2026-07-11 "v1" merge predates a passing browser gate and is retroactively classified **RC**, not release. → verify: log diff committed in the same PR.
- [4] Adversarial: `verify` includes `verify:module1:api`, which spawns servers — confirm no port conflicts on shared runners (it uses bounded ports/timeouts; if EADDRINUSE flakes appear, set `B101_FEED_TIMEOUT_MS=1500` in the workflow env — the script already honors it). Secrets: workflow needs none; confirm no `.env` values are referenced.
- [5] Failure handling: if Playwright browser install is slow/flaky, pin `@playwright/test` version in the install step (`npx playwright@${version} install`). If `npm audit` (verify:security) fails on a transitive advisory with no fix, document the advisory ID + justification in the log rather than lowering `--audit-level` silently.
- [6] Retro: the gate now runs without human memory; the evidence layer is honest about the past. This is the project's single highest-leverage process fix.

### Phase 0 Master Checklist
- [ ] e2e green locally with WAN physically unavailable
- [ ] e2e green in CI (public run URL)
- [ ] `test:e2e` builds before testing; no stale-dist path
- [ ] Mega-test split; failure isolation per route
- [ ] Validation log updated: v1 retroactively RC; CI URL recorded
- [ ] `npm run lint && npm run build` green

---

## PHASE 1 — TRUST-BLOCKING UX (ship-blockers on the landing path)

**Module 1.1 — Repair the pillar progression system (feature kept, made honest)**

**1. Bottleneck:** `isUnlocked` in `src/data/knowledgeMapData.ts:53–133` is never mutated — 5 of 6 pillars are permanently locked behind a progression promise that cannot be fulfilled. The constraint is data-flow, not design: there is no state path from "user completed topics" to `isUnlocked`.

**2. Guardrails:** Keep the progression *feature* (completion checkmarks, visual lock→unlock transition) — it is established. The repair: **default all pillars to accessible; locks become informational completion gates, never content gates.** No new state management library; reuse the existing checklist-persistence in `saveSystem.ts`.

**3. Implementation & Validation:**
- [3.1] In `knowledgeMapData.ts`, set `isUnlocked: true` for all six pillars and add `progressionOrder: 1..6` (preserves the intended sequence as guidance, not gate). → verify: `npm run verify:module2:contracts` still passes (update its assertion if it pins locked state — the contract should assert *order exists*, not *locked on load*).
- [3.2] Replace the lying tooltip in `KnowledgePillarCard.tsx:81` ("Locked. Complete previous step to unlock.") with an honest progress label via i18n: `"pillar_progress": { no: "{done}/{total} fullført", en: "{done}/{total} done" }`. → verify: grep confirms no string "Complete previous step" remains; both locales render.
- [3.3] Wire completion state: read existing per-topic completion from the checklist store and compute `done` per pillar; render a progress ring/checkmark on each card (visual progression preserved). → verify: unit-level check in a new `tests/` e2e: complete one topic → pillar card shows 1/N. (Reuse module5's storage shim pattern for a node-level logic test if faster.)
- [3.4] Remove the "Bypass: OFF" toggle (`KnowledgeMapSection.tsx:375-390`) *only after* 3.1–3.3 make it meaningless; the toggle's function (unlocking) is superseded, not the progression feature. → verify: no `lockOverride` references remain; UI e2e green.
- [4] Adversarial: *Backwards-compat* — users with stored `lockOverride=true` in localStorage: the key becomes inert; ensure reading it can't throw (leave the reader tolerant). *Edge* — zero completed topics must render "0/N", not NaN (guard empty arrays).
- [5] Failure handling: if the completion store read fails (blocked storage), pillars render with no progress badge rather than crashing — wrap in the same in-memory fallback pattern used by `CookiePreferences.tsx`.
- [6] Retro: the feature now delivers what its copy always promised; the landing surface stops lying. This was the single worst UX decision in the app; the fix is ~1 day.

**Module 1.2 — Cookie banner settings dead-end**

- [1] Bottleneck: `onOpenSettings` (`App.tsx:2519-2522`) sets tab `'cookies'`, which has no render branch — blank main area on the privacy-trust path.
- [2] Guardrail: one-line-class fix; do not build a new settings page.
- [3] Change handler to `setActiveTab('support'); setSettingsSubTab('cookies');` (matching the existing hashchange mapping at `App.tsx:416-423`). → verify: e2e — click "Innstillinger" in the banner → cookies settings panel visible, in both locales. Add this to `tests/cookie-consent-and-reading.spec.ts` (it already exists — extend, don't create).
- [4] Adversarial: also audit the *other* entry points into `'cookies'` (grep `setActiveTab('cookies')`) — the hashchange path works because it maps to support+subtab; ensure the direct-set path is the only broken one. *Edge:* banner re-open from footer link must land identically.
- [5] Failure: if `setSettingsSubTab` is not in scope at the banner's call site, lift the handler to where both setters exist (App root) and pass down — do not duplicate state.
- [6] Retro: a one-PR fix closing a trust-critical dead end.

**Module 1.3 — KnowledgeMap search: wire it, don't remove it**

- [1] Bottleneck: `searchQuery` (`KnowledgeMap.tsx:39`) is write-only; typing does nothing while a working search pipeline (`localSearchResults`) exists one scroll down.
- [2] Guardrail: reuse the existing search pipeline; no second index.
- [3] Pass a callback from `App.tsx` into `<KnowledgeMap onSearch={...} />` that sets the existing deferred query state and scrolls to the results section (`#knowledge` results block); render the typed query into the existing results UI. → verify: e2e — type "bleeding"/"blødning" in the KnowledgeMap field → real results list renders; pageErrors empty. → verify: `npx tsc --noEmit` clean.
- [4] Adversarial: three competing search fields is IA noise — resolve by *differentiating*: KnowledgeMap field gets `placeholder` via i18n "Søk i alt innhold…"/"Search all content…" and library archive search keeps its scoped label; do not merge the fields (feature preservation). *Edge:* empty query must not navigate.
- [5] Failure: if search index isn't ready (assets still loading), show the existing loading-indexing notice (`App.tsx:1314-1327`) — reuse, don't duplicate.
- [6] Retro: the landing surface gains a working primary action for crisis use.

**Module 1.4 — Telemetry: make status signals real**

- [1] Bottleneck: `KnowledgeMap.tsx:132-153` renders "OFFLINE CACHE: Ready"/"BATTERY SAVER: Enabled" as static red literals — fabricated status in an emergency tool.
- [2] Guardrail: bind to signals that already exist: `connState` (App.tsx:299), `navigator.serviceWorker.controller`, `navigator.onLine`. Do **not** add the Battery API (deprecated/fingerprinting — anti-complexity + privacy).
- [3] Replace the static cards with a real status component: online/offline (from `connState`), offline-cache ready (SW controller present + precache complete flag), last feed refresh (from `feedCache.ts` freshness stamp). Swap `#ff3b30` for `var(--status-success-text)`/`var(--accent)` per semantics. → verify: e2e — go offline via `context.setOffline(true)` → status flips to offline label; contrast check in `verify-module2-contracts.mjs` still passes with new tokens.
- [4] Adversarial: SW-controller check can be true while precache failed — gate the "cache ready" label on the SW's existing readiness handshake, not controller alone. *Semantic risk:* don't render red for "offline" — offline is this app's *designed* mode; use neutral/warn tokens, reserve red for actual failure.
- [5] Failure: if `navigator.serviceWorker` is undefined (non-secure context, LAN http), render "Cache: unavailable on this connection" — honest degraded label.
- [6] Retro: telemetry becomes a trust asset instead of a liability; aligns with the brand's honesty doctrine.

### Phase 1 Master Checklist
- [ ] All 6 pillars accessible; progression shown as completion, never gating
- [ ] No "Complete previous step to unlock" string; no `lockOverride` references
- [ ] Cookie settings reachable from banner (e2e, both locales)
- [ ] KnowledgeMap search returns real results (e2e, both locales)
- [ ] Status panel reflects real signals; flips offline in e2e
- [ ] `npm run lint && npm run build && npm run test:e2e` green in CI

---

## PHASE 2 — BACKUP CRYPTOGRAPHY v3 (security-critical, format-compatible)

**Module 2.1 — WebCrypto PBKDF2 + AES-GCM with legacy read path**

**1. Bottleneck:** `saveSystem.ts:326,354` uses crypto-js passphrase mode (EVP_BytesToKey = MD5×1, AES-CBC, no MAC). The constraint that jeopardizes the project: **any migration that can't read existing v1/v2 backups strands user data** — backwards compatibility is the hard requirement, and it dictates a versioned envelope with a retained legacy decryptor.

**2. Guardrails:** WebCrypto only (native, no new deps). Keep crypto-js import for the legacy *decrypt-only* path; no re-architecture of the vault.

**3. Implementation & Validation:**
- [3.1] Define the v3 envelope in `saveSystem.ts`:
  ```ts
  // { v: 3, kdf: 'PBKDF2-SHA-256', iter: 600000, salt: b64, iv: b64, ct: b64 }
  async function deriveKeyV3(passkey: string, salt: Uint8Array, iter: number) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passkey), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter },
      material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  ```
  Random 16-byte salt, random 12-byte IV per export. → verify: round-trip test — export → import restores byte-identical vault payload.
- [3.2] `encodeEncryptedPayload` routes: `v:1/2` → legacy crypto-js decrypt (existing code, moved verbatim into `decryptLegacy()`); `v:3` → WebCrypto AES-GCM; unknown `v` → typed error `UNSUPPORTED_BACKUP_VERSION`. Tampered v3 ciphertext → GCM auth failure → user-facing "backup file is corrupted or passphrase is wrong" (i18n, both locales). → verify: extend `verify-module5-contracts.mjs` — it already shim-tests backup round-trip; add (a) v3 round-trip, (b) v1 legacy decode (existing vectors), (c) bit-flipped v3 ciphertext → clean rejection, (d) wrong passphrase → clean rejection.
- [3.3] **Migration-on-save:** after a successful legacy import, immediately re-export as v3 on the next save; show a one-time notice "Backup upgraded to stronger encryption" (i18n). → verify: contract test — import v1 → export → envelope is v3.
- [3.4] Raise the passphrase floor for *new* exports: ≥12 chars kept, add zxcvbn-free entropy hint (length + class mix warning only — no new dep); keep the explicit rejection of the old `BEREDSKAP101` default. → verify: UI test on validation messages in both locales.
- [3.5] Fix the per-keystroke re-encryption (`SecureSaveManager.tsx:39-41`): encrypt on export-button click only. → verify: typing in the passkey field triggers zero IndexedDB reads (spy in component test or manual devtools check documented in the module checklist).
- [4] Adversarial: *Edge* — `crypto.subtle` is unavailable on non-secure contexts (LAN http self-host mode, README's documented deployment!). **This is the module's killer edge case:** fallback must keep the *existing* crypto-js path (with a UI warning "encryption strength reduced on non-HTTPS connection") rather than failing — feature preservation + honesty. *Security* — GCM IV reuse: IV is random per export, never derived; add a code comment + test that two exports of identical plaintext differ. *Logical* — 600k iterations on low-end phones: measure; if >2s on a 2019 device, drop to 310k (OWASP floor) with the iteration count stored in the envelope (it is), so per-file cost is self-describing.
- [5] Failure handling: decrypt failures never partially apply state — current code `JSON.parse`s decrypted output; wrap the whole decode→validate→apply in a transaction that applies nothing unless the existing normalizer/validator (`saveSystem.ts:63-131`) accepts the full payload. → verify: contract test with structurally-valid-but-semantically-corrupt payload → zero state mutation.
- [6] Retro: the "Secure save" label becomes true; legacy users are carried forward, not abandoned. This closes the audit's highest-severity security finding.

### Phase 2 Master Checklist
- [ ] v3 envelope export/import round-trips (contract test)
- [ ] v1/v2 legacy imports still decode (regression vectors)
- [ ] Tampered/wrong-passphrase → clean rejection, zero state mutation
- [ ] Non-HTTPS fallback path works with explicit UI warning
- [ ] Two exports of identical data differ (IV randomness test)
- [ ] No per-keystroke encryption
- [ ] Full gate green in CI

---

## PHASE 3 — OFFLINE MAP REALITY (feature-complete offline)

**Module 3.1 — Make the bundled map actually available offline**

**1. Bottleneck:** `public/maps/norway.pmtiles` is excluded from the precache (`vite.config.ts:20` globPatterns), the runtime cache doesn't match `.pmtiles` (`sw.ts:125-130`), and the Cache API refuses HTTP 206 partial responses that PMTiles' Range requests produce. The core dependency: SW must serve the archive as a *synthesized full 200*.

**2. Guardrails:** Keep both engines (established three-tier feature). 27 KB archive — precache it; do not build a tile-server abstraction.

**3. Implementation & Validation:**
- [3.1] Add `pmtiles` to `globPatterns` in `vite.config.ts:20`. → verify: `npm run build` → `dist/sw.js` manifest contains `maps/norway.pmtiles` with a revision hash.
- [3.2] In `src/sw.ts`, add an explicit route *before* the runtime cache: on fetch matching `/maps/*.pmtiles`, respond with the precached archive as a full 200 response regardless of Range headers (PMTiles' protocol adapter accepts a full-body response when Range is unsupported — confirm against `pmtiles` v4.4.1's `FetchSource`; it falls back to full fetch when the server ignores Range). If the adapter insists on Range, intercept at the `mapProvider.ts` layer instead: register a custom PMTiles `Source` that reads the whole archive from `caches.match()` once and serves byte ranges from the in-memory ArrayBuffer. → verify: **new Playwright test `tests/offline-map.spec.ts`** — load `/` online, wait SW ready, `context.setOffline(true)`, navigate to shelters, assert the bundled-package label renders (not the "PMTiles failed" label) and no console pageerror.
- [3.3] Remove `maps/pmtiles-manifest.example.json` from `public/` (move to quarantine) — it ships to every user. → verify: absent from `dist/` after build; `mapPackConfig.ts` doesn't reference it (grep).
- [3.4] Version the runtime cache name per build (`import.meta.env` build id or `__WB_MANIFEST` hash) and prune old caches in `activate` — closing the stale-forever eviction hole without deleting the runtime-cache feature. → verify: two consecutive builds produce different cache names; old cache absent after update.
- [3.5] Add a `waiting` → "Update available — reload" toast (i18n, both locales) instead of silent `skipWaiting` data loss risk; keep `skipWaiting` only after user confirms. → verify: manual checklist step — deploy new build, observe toast, confirm reload updates.
- [4] Adversarial: *Edge* — 27 KB is today's archive; a real Norway extract is 50–500 MB. The precache + in-memory approach **must not** silently scale to that: add a build-time size assertion in `verify-module4-contracts.mjs` (it already has PMTiles size gates — extend: fail build if archive > 5 MB without an explicit config bump). *Logical* — synthesizing 200 for Range requests changes semantics; the custom-Source alternative (3.2 fallback) is cleaner if the adapter misbehaves — decide by test, not preference.
- [5] Failure handling: if the precached archive is missing/corrupt, the existing three-tier fallback (street → bundled → simple grid) already degrades — assert the *grid* label appears in a test variant where the pmtiles request is aborted.
- [6] Retro: the flagship offline claim becomes literally true. Optional future consolidation to one engine is documented as a follow-up (out of scope per feature-preservation constraint).

### Phase 3 Master Checklist
- [ ] pmtiles in precache manifest (hashed)
- [ ] Offline map e2e green (bundled label offline, grid label on abort)
- [ ] Example manifest out of `public/`
- [ ] Versioned runtime cache + prune on activate
- [ ] Update-available toast in both locales
- [ ] Archive size gate in module4 contracts
- [ ] Full gate green in CI

---

## PHASE 4 — PERFORMANCE & BUNDLE INTEGRITY

**Module 4.1 — Icon registry (FeatureItem feature preserved)**

- [1] Bottleneck: `import * as Icons from 'lucide-react'` (`FeatureItem.tsx:2`) ships ~1,600 icons (~852 KB) eagerly — 22% of dist.
- [2] Guardrail: keep the dynamic-icon *feature* (data-driven `iconName`); change only the resolution mechanism.
- [3] Replace with a static registry: `const iconRegistry: Record<string, LucideIcon> = { WifiOff, Zap, Shield, Users, ... }` importing only the icons enumerated in `knowledgeMapData.ts` (grep `iconName` for the full set — ~15). Unknown name → fallback icon (e.g., `Circle`) instead of `(Icons as any)[name]` returning undefined. → verify: `npm run build` → no `icons-*.js` chunk > 50 KB; dist total ≤ ~3.1 MB; `FeatureItem` renders all data-driven icons (visual e2e or screenshot in ui-regressions). Type-safety bonus: registry keys typed as a union from the data file.
- [4] Adversarial: *Edge* — future content adds an iconName not in the registry → fallback icon + build-time check: add a `verify-text-integrity`-style script assertion that every `iconName` in data exists in the registry. 
- [5] Failure: missing key → fallback icon renders, no throw.
- [6] Retro: biggest win-per-line in the repo; critical-path weight drops ~22%.

**Module 4.2 — Restore lazy-boundary integrity**

- [3.1] In `vite.config.ts:77` `manualChunks`, give `html5-qrcode`, `qrcode`, `crypto-js` their own named chunks so they stay behind the `SecureSaveManager` lazy boundary instead of collapsing into the preloaded `vendor` chunk. → verify: build → those packages absent from `vendor-*.js` (grep chunk); present only in a chunk loaded on demand (check `dist/index.html` modulepreload list).
- [3.2] Defer MiniSearch index construction (`App.tsx:672-688`, `offlineKnowledge.ts:485-832`) until first non-empty query; show the existing indexing notice meanwhile. → verify: mount with no query → no index build (instrument with a counter in dev); first query → results correct.
- [3.3] Restore `chunkSizeWarningLimit: 500` (from 1100) now that 4.1 + Phase 3 removed the offenders. → verify: build completes with no warnings (fail loudly restored).
- [4] Adversarial: chunk-naming changes SW precache contents — Phase 3's versioned cache handles rollover; confirm update toast flow covers it. *Edge* — first-query indexing on a low-end phone may take >1s: keep the loading notice, do not pre-build on idle (anti-complexity; `requestIdleCallback` pre-warm is an optional later optimization, explicitly deferred).
- [5] Failure: index build failure → existing partial-failure notice; app stays navigable.
- [6] Retro: the original lazy-splitting *intent* (already good) is now actually delivered.

**Module 4.3 — App.tsx decompression (no behavior change)**

- [3.1] Extract `useHashRouter` hook: single tab→hash map, inverse derived — eliminates the dual `hashToTab`/`tabToHash` tables (`App.tsx:51-96`) and the three duplicated URL-parse sites. → verify: all existing hash URLs (`/#knowledge`, `/#shelters`, `/#library`, `/#checklists`, …) route identically — e2e already covers these routes; green suite = proof.
- [3.2] Move dead code to quarantine: `getPillarMockTopics` (`:785-795` — English mock data in prod), unused imports `BarChart3`, `Copy`, unused `cookiePrefs` (`:264`). → verify: grep zero references before removal; `tsc --noEmit` + build green after.
- [3.3] Move the 60-second clock re-render into a small child component so the tree doesn't re-render (`:371-376`). → verify: dev-only render counter on App root shows no 60s re-render.
- [4] Adversarial: *backwards-compat* — deep links and back/forward behavior must be byte-identical; the hashchange listener semantics (including the cookies→support mapping fixed in 1.2) are the regression surface — covered by e2e + the extended cookie spec.
- [5] Failure: hook extraction is mechanical; revert unit = single commit per extraction.
- [6] Retro: routing drift bug-class eliminated; App.tsx stays large but stops being a god-router.

### Phase 4 Master Checklist
- [ ] dist ≤ ~3.0 MB; no icon chunk > 50 KB
- [ ] QR/crypto chunks not preloaded
- [ ] No index build before first query
- [ ] chunkSizeWarningLimit back to 500, zero warnings
- [ ] Single-source router; all hash routes green in e2e
- [ ] Full gate green in CI

---

## PHASE 5 — SERVER & API HARDENING (features kept)

**Module 5.1 — Rate limiting that limits**

- [3.1] `server.js:96` — key limiters on `req.socket.remoteAddress` (or `req.ip` with `app.set('trust proxy', ...)` configured *only* behind a known proxy); never the raw `x-forwarded-for` header. Cap the store Map size (LRU-ish: reject-new-keys when >10k entries) to close the memory-growth vector. → verify: new contract test in `verify-module1-api.mjs` style — 65 requests with rotating spoofed XFF → requests 61+ receive 429.
- [3.2] Add a generous limiter (30/min) + in-memory TTL cache (60s) to `/api/source-feeds` and `/api/norway-news` in the local server — closing the LAN amplification path while preserving the feature. → verify: test — burst of 40 → 10× 429; two sequential calls within TTL → second is served from cache (assert single upstream fetch via counter).
- [4] Adversarial: behind Vercel, `remoteAddress` semantics differ — the serverless handlers are separate files; the fix targets local `server.js` only; Vercel's platform-level protections + `s-maxage` cache remain the hosted mitigation (document this split in code comments to prevent future drift).
- [5] Failure: cache backend is in-memory only — on cold start, first N requests pass through; that's acceptable and documented.
- [6] Retro: decorative security becomes real.

**Module 5.2 — `/api/contact`: wire or quarantine — feature preserved**

- [1] Bottleneck: the endpoint accepts PII and is uncalled by the client; the serverless version has no rate limit.
- [2] Guardrail: keep the contact *feature*. Decision point for the owner: (a) wire the client to it properly, or (b) keep client-side mailto and reduce the endpoint to a documented, rate-limited stub. Default to (b) — it matches the app's local-first posture and minimizes PII transit.
- [3] (b-path) Add the same limiter to `api/contact.ts` (serverless) as `server.js`; add a comment + README line that contact is intentionally client-side and the endpoint is a compatibility stub. → verify: contract test — 61st POST → 429; response shape unchanged.
- [4] Adversarial: if (a) is ever chosen, PII-in-logs on Vercel becomes a privacy-policy issue — record this as a decision gate in the module checklist, not a footnote.
- [5] Failure: endpoint errors return generic 500 with no PII echo.
- [6] Retro: honest surface, no PII round-trip by default.

**Module 5.3 — CSP & config coherence**

- [3.1] Fix the JSON-LD conflict: move the inline `<script type="application/ld+json">` (`index.html:25-35`) to a hashed CSP source, or emit it as `/structured-data.json` + `<link>`. → verify: deploy preview → DevTools console shows zero CSP violations; JSON-LD parses (Rich Results test or `JSON.parse` on extracted block).
- [3.2] Scope production `connect-src` to `'self'`; keep the localhost/`*.local` entries in the dev-only header set (server.js) — not in `vercel.json`. → verify: `vercel.json` CSP contains no `localhost`/`*.local`; app e2e still green (feeds are same-origin serverless).
- [3.3] Deduplicate the three copies of private-IP parsing (`server.js:15-32`, `server/copilot.ts:17-34`, `localAiSettings.ts:16-34`) into one shared util imported by all three. → verify: existing module-contract tests for local-AI allowlist still green (they cover `api.openai.com` rejection).
- [3.4] Unify the two healthz implementations (`server.js:141-147` vs `api/healthz.ts`) — local server delegates to the shared handler. → verify: `verify:module1:api` health check green; ISO timestamp + `no-store` on both.
- [4] Adversarial: tightening `connect-src` could break the local-AI feature on hosted deployments — but that feature is local-server-only by design; the production CSP tightening is safe *because* of that. Document the reasoning inline so a future contributor doesn't "fix" it back.
- [5] Failure: if JSON-LD move breaks SEO validation, fallback is hash-source (no structural change).
- [6] Retro: config stops silently breaking the features it was written to allow.

### Phase 5 Master Checklist
- [ ] XFF-spoof burst → 429 (contract test)
- [ ] Feed routes limited + TTL-cached (contract test)
- [ ] Contact endpoint limited on serverless; posture documented
- [ ] Zero CSP violations in prod preview; JSON-LD valid
- [ ] Prod `connect-src 'self'` only; single private-IP util; one healthz
- [ ] Full gate green in CI

---

## PHASE 6 — TYPE SAFETY & LOCALIZATION INTEGRITY

**Module 6.1 — Incremental strictness**

- [3.1] `tsconfig.json`: enable `noUnusedLocals` + `noUnusedParameters` first (mechanical), then `strictNullChecks`, then full `strict`. Fix surfacing errors in small batches; convert `AppErrorBoundary.jsx` → `.tsx` with typed props/state (preserving the erase-data escape hatch and adding an English path — i18n via existing `i18n.ts`). → verify after each batch: `npm run lint` exit 0; e2e green.
- [3.2] Remove the `as any[]` bypass at the `buildOfflineKnowledgeArtifacts` call site (`App.tsx:586-594`) — the callee's `*Like` types already exist; conform the call. → verify: `tsc` clean with strict on.
- [4] Adversarial: strict-mode migration on a 13.5k-line codebase can balloon — timebox: if >40 errors remain after the first batch, land `strict` per-directory via a second tsconfig for `src/components/` and track the remainder as debt with a CI-enforced error-count ceiling (`tsc` output diff gate), not a big-bang.
- [5] Failure: each batch is its own commit; revert = one commit.
- [6] Retro: `npm run lint` stops being theater — it would have caught the mock-data and dead-import findings automatically.

**Module 6.2 — One i18n system, one IA**

- [3.1] Migrate all `currentLang === 'no' ? … : …` ternaries (App.tsx ~`1110,1212`, KnowledgeMap.tsx:49-152) and hardcoded English ("PROGRESSIVE DISCOVERY", "System Lock State", "Bypass: ACTIVE", "{done}/{total} Done", "12 topics") into `i18n.ts` resources with interpolation; delete dead keys (`hero_*`, `metric_*`, etc.) **only after** grep proves zero references. → verify: `verify:localization` green + new e2e: toggle EN→NO on landing → zero English fragments in rendered text (DOM scan for a denylist of English strings).
- [3.2] Mobile dock labels: reuse desktop keys (`nav_knowledge`, `nav_scenarios`, `nav_flowcharts`, `nav_checklists`) — keeping all four dock destinations, fixing only the labels. Raise `text-[9px]` to ≥11px. → verify: visual e2e or screenshot diff; `verify-module2` contrast gate green.
- [3.3] Accessibility batch: `aria-label` on all placeholder-only search inputs; `aria-current="page"` on active nav items; `aria-label` on the `<nav>`; skip-to-content link; extend the `prefers-reduced-motion` block to cover `animate-pulse`, `.animate-edge-pulse`, `.animate-fade-in`. → verify: axe-core pass is optional (no new dep) — manual checklist + one e2e asserting `document.querySelector('[aria-current]')` exists per route.
- [4] Adversarial: i18n key deletions are the risk — the verify-localization script must assert *used* keys exist (it partially does); extend it to fail on referenced-but-missing keys, which converts this whole class to build-time errors. `select-none` on content surfaces (`KnowledgeMap.tsx:42`, footer, header): restrict to nav/button chrome — copy-to-notes is an emergency workflow.
- [5] Failure: missing key → i18next fallback renders key name visibly — acceptable failure signal, caught by the DOM denylist e2e.
- [6] Retro: the bilingual claim becomes true exactly where users land first.

### Phase 6 Master Checklist
- [ ] `strict` on (or debt-ceiling gate recorded); boundary is `.tsx`
- [ ] Zero `as any` at typed-API call sites
- [ ] No hardcoded locale strings in landing components (DOM denylist e2e, both directions)
- [ ] Mobile/desktop nav labels identical; ≥11px dock text
- [ ] aria/skip-link/reduced-motion batch landed
- [ ] Full gate green in CI

---

## PHASE 7 — REPO HYGIENE, DOCS & IDENTITY

**Module 7.1 — The purge (quarantine, never delete-in-place)**

- [3.1] `git rm -r --cached .agent .agents .claude .qwen .opencode _bmad scratch test-results` then move the on-disk folders to `C:\00 DEV\In Progress\_beredskap101-quarantine\2026-07-18\` → verify: `git ls-files | wc -l` drops from 8,290 to <200; `npm run build && npm run verify` green (nothing in `src/` or `scripts/` references those dirs — grep first).
- [3.2] Move `tmp_cookie.txt`, `tmp_date.txt`, `tmp_feed.txt`, `metadata.json`, `debug.log` to quarantine (`git rm` the tracked ones) → verify: `git ls-files` clean of them; build green.
- [3.3] Move `scripts/run_verification.js` + 6 of 7 `run-moduleN-verification.mjs` to quarantine; keep `run-verification.mjs`, the `:contracts` verifiers, and one module runner if still referenced. Remove their npm scripts. → verify: `npm run verify` green; no package.json script references a missing file (`npm run` lists all scripts — execute each `verify:*` once).
- [4] Adversarial: `.github/agents/` BMAD files are *also* tooling junk but live under `.github` — confirm they aren't referenced by any GitHub feature you use (they're Copilot agent definitions; harmless on GitHub, dead locally). Decision gate: quarantine locally, keep-or-drop on GitHub per owner's Copilot usage. History still carries 69 MB of loose objects — `git filter-repo` is flagged as an *optional, destructive, owner-approved* follow-up; default is to leave history alone.
- [5] Failure: quarantine move is reversible by copying back; nothing is deleted.
- [6] Retro: repo becomes reviewable; 98% noise gone.

**Module 7.2 — Docs consolidation & identity**

- [3.1] Create `docs/history/`; move the 5 `PLAN-26-06-*.md`, pre-July audits, and `app_audit_report-26-06-04.md` there with a uniform banner (`> Historical record. Current gates: see docs/VALIDATION_LOG.md`). → verify: root contains only README, REPO_OPERATING_MODEL, LICENSE, config; `docs/` contains only current evidence + history/.
- [3.2] Correct the false claim in `AUDIT_AND_STABILIZATION_2026-07-10.md:210` (run_verification.js removal) — the file is *actually* quarantined in 7.1.3, so amend the doc to reference the Phase 7 commit. → verify: doc claim matches tree.
- [3.3] Add `LICENSE` (owner decision: CC-BY-4.0 for content + MIT for code is typical for this shape; **gate on owner choice**), set `version: "1.0.0-rc.2"` in package.json, strip "release" from README language until Phase 8 completes. → verify: files present; README wording diff reviewed.
- [3.4] De-grep the gate: remove doc/spec string-grep assertions from `verify-module7-contracts.mjs:162-207` (README headings, spec-source assertions, log-sentence assertions) or downgrade to a non-blocking `verify:docs` lint script. → verify: module7 contracts still green on behavior checks.
- [4] Adversarial: consolidation can orphan inbound links — grep all md files for relative links and fix before moving.
- [5] Failure: moves are plain `git mv`; revertible.
- [6] Retro: three living documents; the trust-the-docs instruction in the README becomes safe to follow.

### Phase 7 Master Checklist
- [ ] <200 tracked files; build/verify green post-purge
- [ ] Root/docs consolidated; historical banner uniform; links valid
- [ ] LICENSE present; version bumped; README de-hyped
- [ ] Gate measures behavior, not prose
- [ ] Full gate green in CI

---

## PHASE 8 — CONTENT GOVERNANCE & RELEASE

**Module 8.1 — Content-safety review gate (the unpriced risk)**

- [3.1] Owner commissions at least one external human review of first-aid/preparedness content in `src/data/processedAssets.json` + `editorialArticles.ts` (the audit itself deferred this to P1). Until then, add/keep the existing "assistive, not authoritative" disclaimers on medical flows — verify each first-aid surface shows one (extend `verify:localization` or a contracts check). → verify: reviewer sign-off recorded in `docs/CONTENT_REVIEW_<date>.md` with scope + findings.
- [3.2] Publish the content-lab dataset as a versioned artifact: export `processed-assets` + ingest manifest to a dated archive in quarantine-adjacent storage (outside repo), record `B101_SOURCE_REVISION` in the validation log. → verify: a second machine can regenerate `processedAssets.json` from the artifact via documented `ingest:*` steps.
- [5] Failure: if external review is unavailable before target date, ship as RC with the disclaimer gate green — do not call it v1.0.0.
- [6] Retro: converts bus-factor-1 content provenance into reproducible infrastructure.

**Module 8.2 — Release**

- [3.1] Full gate on the exact revision: `npm run verify:release` + CI e2e green + content disclaimer gate → [3.2] `git tag v1.0.0`, `version: "1.0.0"`, validation log keyed to tag SHA → [3.3] deploy `dist` per README checklist; record deployed SHA + gate output in the log → verify: post-deploy smoke (offline routes on a real device, per README checklist items 4–8).
- [5] Rollback: revert to prior tag; `dist` rebuild from tag is deterministic (`npm ci` + lockfile-portability gate).
- [6] Retro: release identity is a tag with evidence, not a zip filename.

---

## MASTER BACKWARDS-COMPATIBILITY MATRIX (audit every phase against this)

| Contract | Preserved by |
|---|---|
| All `/#…` hash routes | Phase 4.3 e2e parity |
| localStorage/IndexedDB keys incl. legacy `lockOverride` | tolerant readers; no key renames |
| v1/v2 backup files import | Phase 2 legacy decryptor + vectors |
| Three-tier map fallback incl. both engines | Phase 3 (kept, hardened) |
| Non-HTTPS LAN self-host mode | Phase 2.4 crypto fallback, 5.3 dev CSP |
| Norwegian + English UI parity | Phase 6.2 denylist e2e |
| `verify`/`verify:security`/`test:e2e` commands | scripts pruned only where quarantined |
| No installs; no out-of-folder writes; quarantine-not-delete | global constraints |

## CRITICAL PATH (highest-priority, in order)
1. **Phase 0** (gate truth) — without it, nothing else can be validated.
2. **Phase 1** (trust-blockers) — the product currently lies to users on its landing path.
3. **Phase 2** (backup crypto) — the only place user secrets are at rest.
4. **Phase 3** (offline map) — flagship claim currently false.
5. Phases 4–8 as capacity allows; 4 and 7 are cheapest-per-impact.

**Effort estimate:** Phases 0–3 ≈ 1–2 focused weeks for an AI-assisted coder; 4–7 ≈ 2–3 weeks part-time; Phase 8 gated on external review availability.
