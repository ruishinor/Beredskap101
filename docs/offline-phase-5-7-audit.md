# Offline Phase 5-7 Audit

## Scope

This document defines implementation and validation guardrails for:
- Phase 5: Local document library and backup extension
- Phase 6: Optional local-only AI
- Phase 7: Deployment hardening

The protocol is modular and sequential. Do not progress to the next module until the current module reaches three consecutive 100% clean passes.

## Module Sequence And Gates

### Module A - Local Document Vault (Phase 5)

Implementation targets:
- Local-only vault storage with IndexedDB fallback-safe persistence.
- Metadata fields: title, category, household member, source, review date, sensitive flag, tags, note.
- Manual export/import of local notes.
- Explicit shared-device and sensitive-data warning.
- Article 17 local erase action for vault data.
- Extend encrypted backup bundle to include vault metadata/notes.

Validation gate (must pass 3/3 consecutively):
- Typecheck and build pass.
- Add, view, search, tag, export, import, and delete vault records offline.
- Legacy backup import remains functional.
- No network call is triggered by vault actions.

Adversarial review:
- Inject malformed JSON in vault import and verify fail-closed behavior.
- Use oversized attachment (>6MB) and verify explicit rejection.
- Verify sensitive content stays local and is never posted to `/api/*`.

Retrospective prompts:
- Which user flow still relies on implicit state assumptions?
- Which import edge case produced the lowest confidence?
- Which error copy needs clearer recovery instructions?

### Module B - Optional Local-Only AI (Phase 6)

Implementation targets:
- Local AI settings panel (disabled by default).
- Settings fields: mode, base URL, model, test connection, clear settings.
- Assistive tasks only:
  - explain checklist
  - summarize local content
  - generate household drill
  - analyze scenario history
- RAG-lite local context injection from local search documents.
- Deterministic fallback for all assistive tasks.
- Explicit advisory warning for medical/safety/legal/emergency decisions.

Validation gate (must pass 3/3 consecutively):
- Typecheck and build pass.
- App remains fully functional with AI disabled.
- Local AI call failures return deterministic fallback output without runtime error.
- No cloud AI endpoint or SDK is used.

Adversarial review:
- Use invalid local endpoint URL and verify controlled failure.
- Simulate HTTPS-hosted context calling `http://localhost` and verify fallback + warning copy.
- Prompt-injection style input should not produce claims of live/cloud access.

Retrospective prompts:
- Which task has the weakest deterministic fallback quality?
- Which local model assumptions should be moved into settings docs?
- Which failure mode needs stronger user-facing diagnosis?

### Module C - Deployment Hardening (Phase 7)

Implementation targets:
- Tighten CSP to remove broad external runtime dependencies.
- Keep local AI localhost support explicitly scoped in `connect-src`.
- Provide offline deployment checklist and release notes (offline-guaranteed vs online-enhanced modules).
- Ensure hosted/static and self-hosted LAN workflows remain supported.

Validation gate (must pass 3/3 consecutively):
- Typecheck and build pass.
- CSP reflects no required external runtime scripts/images.
- Offline route refresh works after install (`/`, `/#shelters`, `/#library`, `/#checklists`).
- Local AI limitation under HTTPS is documented.

Adversarial review:
- Scan for banned tokens and external runtime URLs.
- Verify no hidden dependency on external images/scripts for core views.
- Verify service worker path remains compatible with offline route refresh.

Retrospective prompts:
- Which CSP restriction risks false positives in future updates?
- Which route still has highest chance of offline regression?
- Which release-note claim requires additional automated checks?

## Backward Compatibility Protocol

For every phase module:
- Existing tabs/routes remain present.
- Theme switching remains functional.
- EN/NO language switching remains functional.
- Shelter count remains 556.
- Search, checklists, training scenarios, and reference library still render.
- Secure backup import/export remains available.

## Compliance Notes (Implementation-Level)

GDPR and user rights:
- Article 17: local delete action for vault records.
- Article 20: manual export/import for local data portability.
- Data minimization: no automatic cloud sync for vault or local AI settings.

OWASP and reliability:
- No cloud AI fallback.
- Local input validation for import payloads.
- Fail-closed behavior for malformed imports.
- Crash-safe fallback paths for storage and local AI unavailability.

DPIA and HITL strategy:
- Keep human decision authority explicit in advisory text.
- Treat AI output as assistive only, never authoritative.
- Minimize prompt context to bounded local snippets.

Accessibility and UI governance:
- Preserve high-contrast theme options and keyboard-accessible controls.
- Keep legal/support access points available (About, Contact, Privacy, Terms, Cookies).
- Contact path remains `info@holf.services`.

## Typography Recommendation (Readability-First)

Target specs:
- Body size: 16-19px, line-height 1.5-1.7
- Stroke weight: 400-500 for body, 600-700 for headings
- Letter spacing: 0% to +1% (avoid compressed tracking)
- X-height: medium-high for dense mobile readability
- Aperture: open counters and distinct glyph forms (`I`, `l`, `1`, `O`, `0`)

Font family candidates:
- `Atkinson Hyperlegible Next`
- `Inter Tight` (UI labels only where contrast remains compliant)
- `Source Sans 3`
- `Noto Sans` (broad character support)

Avoid:
- Decorative/cursive display fonts for instructional or emergency content
- Ultra-light weights in low-light and mobile conditions
