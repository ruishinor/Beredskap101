# Audit Remediation Checklist

Date: 2026-06-05
Status: complete
Primary inputs:
- `PLAN-26-06-05.md`
- `docs/critical-audit-2026-06-04.md`
- `docs/audit-remediation-checklist-2026-06-04.md`

BMAD workflow usage:
- `bmad-investigate`: baseline evidence framing and restart-safe case record
- `bmad-review-adversarial-general`: adversarial review after each module
- `bmad-retrospective`: retrospective note before unlocking the next module

Execution protocol:
1. Work modules in sequence.
2. Do not advance a module until its verification gate passes three consecutive times with no errors, warnings, or flags.
3. Update this file after every meaningful code change, verification run, adversarial review, blocker, or decision.
4. Treat this file as the restart source of truth if the session drops.

## Baseline

Observed at start of run:
- Dirty tracked files:
  - `src/App.tsx`
  - `src/components/LocalAiAssistant.tsx`
  - `src/components/StaticPages.tsx`
  - `src/components/knowledge-map/ProgressiveDiscoveryStepper.tsx`
  - `tests/ui-regressions.spec.ts`
- Untracked files:
  - `.codex-dev.zip`
- `npm run lint`: pass
- `npm run build`: pass
- `npm run verify:text-integrity`: pass, but known false-negative risk
- `npm run verify:localization`: pass, but known false-negative risk
- `npx playwright test tests/ui-regressions.spec.ts`: pass against stale expectations
- `npx playwright test tests/localization-state.spec.ts`: pass against two-theme expectations
- `npm audit --audit-level=moderate`: pass (`0 vulnerabilities`)

Confirmed findings carried into this track:
- Support, legal, and data tools are still footer-scattered; no first-class `Support` route exists.
- Theme system still supports only `dark | light`; `Signal` is not implemented.
- The bundled shelter map package is invalid (`public/maps/norway.pmtiles` is placeholder-sized).
- Current map regressions are partially masked by tests that assert the offline package is absent.
- Real text integrity faults remain in `src/i18n.ts`, `src/types.ts`, and `src/components/knowledge-map/KnowledgeMapSection.tsx`.
- FAQ, glossary, and local-model guidance are incomplete relative to the requested product state.

Chosen defaults:
- Third theme label: `Signal`
- Support moves into primary navigation immediately after `Reading`
- Norwegian news remains source-based; the FAQ will document both real sources and a transparent preparedness keyword taxonomy
- Existing deep links (`#about`, `#contact`, `#faq`, `#privacy`, `#terms`, `#cookies`) must keep working
- Norway compliance baseline remains WCAG 2.1 A/AA, with WCAG 2.2 contrast guidance used as the engineering target

Standard verification gate for completed modules:
- `npm run verify:text-integrity`
- `npm run verify:localization`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `npx playwright test`

## Module Track

### Module 0: Restart-safe control docs
Status: complete
Goal:
- Create restart-safe planning and execution artifacts for this remediation run.

Completed:
- [x] Created `docs/audit-remediation-checklist-2026-06-05.md`.
- [x] Created `PLAN-26-06-05.md`.
- [x] Recorded the current dirty worktree, baseline verification facts, defaults, and next module.

Verification gate:
- Documentation gate only.

Adversarial review:
- Prior checklist was marked complete while several requested product goals were still absent. This run treats the older checklist as historical evidence, not as current compliance.

Retrospective:
- The previous run over-trusted green checks that did not encode the desired product state. This track will update tests before using them as completion evidence.

### Module 1: Navigation, support, legal/data, and contact consolidation
Status: complete
Goal:
- Add first-class `Support` navigation after `Reading`
- Centralize support, legal, and data controls
- Remove duplicated contact variants and keep backward-compatible deep links

Implemented files:
- `src/App.tsx`
- `src/components/StaticPages.tsx`
- `tests/ui-regressions.spec.ts`

Implemented:
- [x] Added `Support` to primary and mobile navigation immediately after `Reading`.
- [x] Added a support hub route and kept legacy support/legal deep links functional.
- [x] Consolidated legal/data/help entry points under Support.
- [x] Standardized contact rendering to `Contact info@holf.services` plus copy button.

Verification gate:
- `npm run lint`
- `npm run build`
- `npx playwright test tests/ui-regressions.spec.ts`
- Three consecutive clean passes required before Module 2 starts

Adversarial review:
- The footer still contains support guidance, but it now points into the support hub instead of splitting policy controls across multiple button clusters.
- Legacy hashes remain live because removing them would break existing user docs and bookmarks.

Retrospective:
- Centralizing support content reduced duplicated contact/legal strings and made backward-compatibility testing much clearer.

### Module 2: Signal theme and accessibility system
Status: complete
Goal:
- Add `signal` theme state and persistence
- Implement compliant orange/black token set
- Extend theme behavior across theme-aware components

Implemented:
- [x] Expanded `ThemeType` and persistence to `dark | light | signal`.
- [x] Added `Signal` theme controls, meta color handling, and theme class plumbing.
- [x] Replaced the primary body/control font stack with `Atkinson Hyperlegible Next` centered tokens.
- [x] Extended theme typing and signal-theme styling across theme-aware surfaces.

Adversarial review:
- Contrast is materially better than the legacy orange/black mode, but the long-tail risk is component-specific token drift. Contract and browser tests now cover the third theme to catch regressions.

Retrospective:
- Converting the theme union at the type boundary was the lowest-friction way to force every consumer to acknowledge the third mode.

### Module 3: Shelter map restoration
Status: complete
Goal:
- Ship a valid bundled PMTiles archive
- Keep live map first, bundled offline map second, reserve background third
- Update tests and copy to match the shipped behavior

Implemented:
- [x] Replaced the placeholder `public/maps/norway.pmtiles` with a valid bundled PMTiles raster archive.
- [x] Updated the bundled map style and manifest to match the shipped archive.
- [x] Rewrote shelter-map copy so the default app state no longer tells users to install the default package manually.
- [x] Updated UI and contract tests to assert the bundled-offline path.

Adversarial review:
- The bundled basemap is intentionally simplified and should be treated as a resilience fallback, not as a precision cartography layer.
- The reserve fallback path remains necessary because PMTiles render failures and worker limitations still exist in hostile browser conditions.

Retrospective:
- Generating the PMTiles archive from a checked-in script makes the bundled map reproducible instead of leaving it as opaque binary debt.

### Module 4: Text integrity, glossary, FAQ, and content cleanup
Status: complete
Goal:
- Remove confirmed mojibake and broken glyph literals
- Expand glossary and FAQ transparency
- Strengthen UTF-8 verification coverage

Implemented:
- [x] Repaired confirmed mojibake in `src/i18n.ts`, `src/App.tsx`, `src/components/InteractiveFlowcharts.tsx`, and `src/data/pillarsData.ts`.
- [x] Replaced corrupted glyph literals in `src/components/knowledge-map/KnowledgeMapSection.tsx` with icon components.
- [x] Expanded the glossary with preparedness, privacy, local-AI, and warning-system terminology.
- [x] Updated FAQ content for real Norwegian news sources, keyword taxonomy, local-model runners, and bundled map behavior.
- [x] Expanded text-integrity and localization verification rules to catch the observed corruption patterns.

Adversarial review:
- Mojibake prevention is still only as strong as the verification patterns. The guardrails now cover the observed failures, but future copy imports can still introduce novel corruption sequences.

Retrospective:
- Replacing broken inline glyphs with icon components was safer than trying to preserve suspect encoded literals across editors and terminals.

### Module 5: Compliance, privacy, security, and reliability
Status: complete
Goal:
- Refresh policy and support copy for GDPR/DSR/HITL/local-storage boundaries
- Add DPIA appendix
- Normalize failure states and security review evidence

Implemented:
- [x] Refreshed support/policy/help copy to expose Article 17 deletion, Article 20 export, cookie controls, local-storage boundaries, local-only AI, and HITL limits.
- [x] Preserved crash-handling and explicit fallback/error messaging for map, offline, and local-AI flows.
- [x] Kept dependency review in the formal verification gate with `npm audit --audit-level=moderate`.

Adversarial review:
- This remains a content-and-client-surface hardening pass, not a full legal sign-off. No code here can substitute for organization-level retention/process governance.

Retrospective:
- Compliance copy is easier to keep truthful when it describes the actual runtime behavior instead of aspirational platform promises.

## Verification Log

### Baseline
- `2026-06-05`: `npm run lint` -> pass
- `2026-06-05`: `npm run build` -> pass
- `2026-06-05`: `npm run verify:text-integrity` -> pass
- `2026-06-05`: `npm run verify:localization` -> pass
- `2026-06-05`: `npx playwright test tests/ui-regressions.spec.ts` -> pass
- `2026-06-05`: `npx playwright test tests/localization-state.spec.ts` -> pass
- `2026-06-05`: `npm audit --audit-level=moderate` -> pass

### Integrated gate cycle 1 of 3
- `2026-06-05`: `npm run verify:text-integrity` -> pass
- `2026-06-05`: `npm run verify:localization` -> pass
- `2026-06-05`: `npm run lint` -> pass
- `2026-06-05`: `npm run build` -> pass
- `2026-06-05`: `npm audit --audit-level=moderate` -> pass
- `2026-06-05`: `npx playwright test` -> pass

### Integrated gate cycle 2 of 3
- `2026-06-05`: `npm run verify:text-integrity` -> pass
- `2026-06-05`: `npm run verify:localization` -> pass
- `2026-06-05`: `npm run lint` -> pass
- `2026-06-05`: `npm run build` -> pass
- `2026-06-05`: `npm audit --audit-level=moderate` -> pass
- `2026-06-05`: `npx playwright test` -> pass

### Integrated gate cycle 3 of 3
- `2026-06-05`: `npm run verify:text-integrity` -> pass
- `2026-06-05`: `npm run verify:localization` -> pass
- `2026-06-05`: `npm run lint` -> pass
- `2026-06-05`: `npm run build` -> pass
- `2026-06-05`: `npm audit --audit-level=moderate` -> pass
- `2026-06-05`: `npx playwright test` -> pass

## DPIA Appendix

Scope:
- Single-page preparedness application with offline-first content, browser-local preferences, optional local AI connector, and bundled shelter-map assets.

Data categories:
- Interface preferences in browser storage: theme, language, cookie preferences, reading and UI state.
- User-authored local content when using save/export flows: checklists, notes, vault content, or other device-local artifacts.
- Optional prompts and model responses sent only to user-configured local AI runtimes.

Lawful-basis posture:
- Core local functionality relies on user action and device-local storage.
- No server-side personal-data processing path was introduced in this remediation.
- Any future remote telemetry, hosted AI, or account system would require a separate lawful-basis review and updated disclosures.

Data minimization controls:
- Support and FAQ copy now state that AI usage should remain local and prompt content should avoid unnecessary personal data.
- No Google or Gemini integrations were added.
- Contact and legal flows expose deletion/export paths without requiring remote account linkage.

Retention posture:
- Browser-stored state remains on the user's device until cleared by the user, browser, or export/delete tools.
- The app now documents these storage boundaries more clearly in Support and policy content.

Article 17 erasure flow:
- Support hub and policy content expose deletion controls and explain that browser-local data can be erased directly on-device.

Article 20 portability flow:
- Support hub and policy content expose export controls and explain how locally stored user data can be exported.

HITL posture:
- The app copy states that local AI outputs are advisory only and require user judgment.
- No autonomous high-impact decision loop was introduced.

Residual privacy risks:
- Users can still paste sensitive personal data into local notes or local AI prompts.
- Device compromise, shared-browser access, or insecure local model configuration remain outside app-only controls.
- Organization-level governance, retention schedules, and DSR process ownership are still needed if the project later adds server-side services.

Decision:
- Acceptable for the current client-side/local-only architecture, with the condition that any future networked personal-data processing triggers a new DPIA.

## Adversarial Review

Residual findings after the completed pass:
- The bundled PMTiles archive is a resilience fallback, not a detailed cartographic product; it should not be over-sold as authoritative navigation data.
- The build output remains large, with a main JS bundle in the multi-megabyte range, so low-end devices may still see slower startup.
- Text-integrity guardrails cover the observed mojibake patterns, but they are pattern-based and cannot prove the absence of every future encoding failure.
- Legacy deep-link preservation keeps routing complexity higher than a clean-slate support-nav design would.
- Compliance disclosures are now more accurate, but they still do not replace formal legal review for an organization-wide public release.
- Browser-local deletion/export works only on the local device; it cannot erase copies a user may already have exported elsewhere.
- Local-only AI guidance reduces privacy exposure, but unsafe prompts entered by users can still disclose personal data to whatever local runtime they configured.
- The app keeps explicit reserve/fallback states for maps and offline flows; those states are safer, but they also indicate that hostile browser conditions can still degrade functionality.
- Contrast targets were materially improved, but long-tail component regressions remain possible whenever new theme-aware surfaces are added without contract updates.
- `npm audit` is clean today, but dependency risk remains time-sensitive and needs recurring review rather than one-off sign-off.

## Retrospective

What worked:
- Converting target-state requirements into tests before final sign-off prevented the earlier false-positive green status from repeating.
- Replacing suspect glyph literals with icons and explicit UTF-8 text was more reliable than attempting to preserve questionable pasted characters.
- Reproducible generation of the bundled PMTiles archive turned a broken placeholder into maintainable project asset infrastructure.

What to keep doing:
- Keep the restart checklist current after every gate and every architectural decision; it materially reduced recovery risk.
- Add regression checks at the same time as user-visible changes, especially for themes, localization, and fallback states.
- Treat compliance copy as a reflection of actual product behavior, not aspirational roadmap language.

Next-session guardrails:
- If new UI surfaces are added, extend theme, contrast, and support-route coverage in the same change.
- If any remote service is introduced, reopen the DPIA and legal copy before release.
- If new content imports arrive, run the text-integrity and localization checks before merging.
