# Beredskap101 Critical Audit Report - 2026-06-04

Status: completed
Workspace: `c:\00 DEV\In Progress\beredskap101-app`
Restart checklist: `docs/audit-checklist-2026-06-03.md`

## Audit Baseline

- Product aim: offline-first Norwegian/EEA preparedness PWA for non-specialist households under stress.
- Audience state: urgency, low tolerance for clutter, need for calm public-service trust.
- Visual rule: public-service and readable; not tactical, cyberpunk, AI SaaS, crypto, military, or generic template styling.
- Standards baseline:
  - WCAG 2.1 SC 1.4.3 text contrast and SC 1.4.11 non-text contrast.
  - GDPR Articles 17 and 20 for local erasure and local portability.
  - Datatilsynet DPIA guidance for data protection impact assessment and proportionality.
  - OWASP Top 10:2021 for web application security risks.

## Implemented Findings

- Replaced old orange accent path with accessible dark/light theme tokens:
  - Dark primary: `#8FD3C7` on `#06201C`, `10.00:1`.
  - Light primary: `#225C52` on `#FFFFFF`, `7.72:1`.
  - Status tokens now pass AA in both themes: success, warning, error, info all >= `7.60:1`.
- Removed white-on-orange and stale orange PWA metadata/icon color.
- Added accessible dark/light segmented control with icons and `aria-pressed`.
- Fixed light-mode contrast failures in the knowledge map, status chips, map advisory, primary buttons, and QR generated state.
- Hardened Article 17/20 local data controls:
  - Full local export bundle.
  - Full local erasure for app localStorage keys, app caches, and IndexedDB.
  - Vault fallback no longer resurrects stale deleted records.
  - Vault import now enforces file size, document count, and attachment size limits.
- Hardened local backup:
  - Removed old default passkey.
  - Enforced 12-character minimum and rejected `BEREDSKAP101`.
  - Password fields no longer expose backup passkeys as plain text.
- Hardened local AI:
  - Default local model changed to non-Google local options.
  - Local endpoints are validated as local/private/.local only.
  - Server-side optional local-LLM prompt input is minimized to bounded, known scenario fields.
  - No cloud fallback is used.
- Hardened server/API:
  - Local CORS restricted to local/private/configured origins.
  - JSON request body size limited.
  - Contact remains mailto handoff to `info@holf.services`.
- Added app-level crash handling:
  - React root error boundary.
  - Recovery by reload.
  - Explicit local app-data erasure path for corrupted local state.
- Fixed PMTiles package reliability:
  - Placeholder-size archives are rejected and do not claim installed status.
  - Playwright now asserts safe fallback behavior.
- Fixed print-window XSS risk in `ExtendedAssetViewer` by escaping dynamic HTML.
- Fixed verification drift in module 2, module 4, module 5, module 6, and UI regression expectations.
- Removed user-facing Google/Gemini/Gmail references from app copy. Guardrail mentions remain only in verification scripts.

## Adversarial Review

- Initial orange-only contrast scanning was insufficient. A separate adversarial accessibility pass found additional light-mode failures in status chips, knowledge-map labels, primary buttons, and the QR label.
- The map package manifest previously created a false sense of offline readiness. The app now requires declared archive size validation before enabling PMTiles mode.
- Local-only/privacy language was reviewed against actual behavior. The implementation now avoids claiming strict air-gapping where optional local-network model calls may be configured.
- Article 17/20 controls are now app-wide for local browser data instead of limited to vault records.
- The dev API previously trusted broad CORS and arbitrary local-AI base URLs. Both are now constrained.

## Residual Risks

- Some older Norwegian metadata/content strings still contain mojibake. The type-breaking `førstehjelp` id mismatch is fixed, but a broader editorial encoding cleanup remains content work.
- Local `.env` secret material was removed from this workspace. Any key that was exposed before removal must still be revoked/rotated outside the repository.
- This audit verifies local/browser behavior, API parity, CSP/static deployment hardening, and Playwright flows. It does not certify legal compliance; it implements controls aligned to the cited standards.

## Verification

Three consecutive full passes completed successfully.

Each pass ran:

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

Final Playwright result in each pass: `5 passed`.

## Retrospective

- The most important catch came from adversarial accessibility, not from the initial targeted orange scan.
- Test expectations had to be corrected where they encoded outdated behavior, especially around PMTiles placeholder activation.
- Backwards compatibility held for routes, local search, checklists, local vault, backup import/export, offline PWA routes, and shelter-map fallback.
- Future audits should add computed contrast sweeps across all route/theme pairs and a content-encoding cleanup gate.

## Standards References

- W3C WCAG 2.1 SC 1.4.3 Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- W3C WCAG 2.1 SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- GDPR Regulation 2016/679, Articles 17 and 20: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- Datatilsynet DPIA guidance: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/
- OWASP Top 10:2021: https://owasp.org/Top10/2021/
