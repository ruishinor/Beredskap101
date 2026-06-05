# Module 7 Audit (2026-06-02)

## Scope
- Module 7: Deployment hardening

The implementation and validation were executed after Modules 1-6 and kept the same backward-validation gate discipline before final acceptance.

## Module 7 (Deployment Hardening)

Implemented and validated:
- CSP tightened for offline-first runtime behavior:
  - same-origin scripts only
  - same-origin manifest only
  - no external runtime image/script allowances
  - localhost, loopback, and `.local` connect rules kept narrow for optional local AI
  - worker support added for blob-backed PMTiles renderer workers
- Supported deployment modes documented:
  - hosted/static PWA
  - self-hosted local PWA over LAN
- README now includes:
  - offline deployment checklist
  - offline guarantees vs online enhancements release notes
  - hosted HTTPS limitation notes for optional local AI
  - same-origin proxy guidance for hosted HTTPS deployments
- Added dedicated verification gates:
  - `npm run verify:module7:contracts`
  - `npm run verify:module7`
  - `npm run verify:offline:smoke`
- Added Playwright browser automation:
  - `playwright.config.ts`
  - `tests/offline-smoke.spec.ts`

Acceptance verification:
- Build output keeps service worker precache and index fallback intact.
- Runtime source contains no external script, stylesheet, favicon, or tile-host dependency for core views.
- CSP remains explicit and bounded instead of using wildcard connect rules.
- Self-hosted LAN preview path is documented with `npm run preview:lan`.
- Browser smoke test performs an actual offline click-through after service worker install.

Adversarial review:
- Scanned runtime source and CSP for banned hosts:
  - `unpkg`
  - `cartocdn`
  - `google.com/s2`
  - `googletagmanager`
  - `google-analytics.com`
  - `cdn.jsdelivr.net`
- Checked that service worker navigation fallback still targets `/index.html`.
- Checked that PMTiles worker execution remains compatible with strict CSP through `worker-src 'self' blob:`.
- Checked real browser offline route loads for `/#knowledge`, `/#shelters`, `/#library`, and `/#checklists`.

Retrospective:
- The highest-value hardening step was aligning CSP with the actual offline runtime rather than leaving it at a generic baseline.
- The remaining limitation is browser mixed-content policy for hosted HTTPS pages reaching plain-http local model endpoints; documentation and deterministic fallback remain the current control.
- The route-refresh confidence improved materially once browser automation was added to the gate instead of relying on source inspection alone.
