# Audit and Remediation Status Ledger


## Reconciled facts from plan.md

# Orchestration Plan â€” REMEDIATION_ROADMAP_2026-07-18 Execution

**Freeze point:** tag `pre-remediation-freeze-2026-07-18` @ ce0245f (rollback point).
**Source of truth:** `docs/REMEDIATION_ROADMAP_2026-07-18.md` (phases 0â€“8, stage-gated).

## Execution strategy

Phases are stage-gated per the roadmap, but phases with **disjoint file ownership** run in parallel swarms. Phases that share `App.tsx` / `vite.config.ts` run sequentially to avoid merge conflicts between agents (parallel agents cannot see each other's output).

| Wave | Agents (role labels) | Scope | Mode |
|---|---|---|---|
| 0 | â€” | Freeze + tag | Done |
| 1 | `Phase0_Gatekeeper` | Phase 0: e2e tile stub, mega-test split, CI workflow, validation log | Single agent â€” **stage gate for everything** |
| 2 | `Phase2_Crypto`, `Phase5_ServerHardening`, `Phase7_RepoHygiene` | Disjoint files: `saveSystem.ts` / `server.js`+`api/` / repo purge+docs | Parallel swarm (after Phase 0 green) |
| 3 | `Phase1_TrustUX` | Phase 1: pillars, cookie banner, KnowledgeMap search, telemetry (owns App.tsx) | Sequential |
| 4 | `Phase34_OfflinePerf` | Phase 3 + 4: pmtiles precache, SW, icon registry, chunks, router extraction | Sequential |
| 5 | `Phase6_TypesI18n` | Phase 6: tsconfig strictness, i18n consolidation, a11y | Sequential |
| 6 | `Phase8_ReleasePrep` | Phase 8: disclaimer gate, release prep | Sequential |

## Owner decision gates (cannot be completed autonomously)
- **CI run URL (0.3):** workflow file created locally; pushing branch + verifying green GitHub run requires repo push.
- **Phase 7.3.3 LICENSE choice:** owner must pick (suggestion: CC-BY-4.0 content + MIT code).
- **Phase 8.1 external content review:** requires human medical/preparedness reviewer â€” ship as RC until done.
- **`git filter-repo` history rewrite:** explicitly owner-approved-only; default = skip.
- **`.github/agents` BMAD files:** keep-or-drop depends on owner's Copilot usage.

## Global constraints (from roadmap, enforced on every agent)
- No new runtime deps. No files outside workspace except quarantine moves to `C:\00 DEV\In Progress\_beredskap101-quarantine\2026-07-18\`.
- Backwards compat: hash routes, storage keys, v1/v2 backup read path, NO/EN UI contract.
- After each module: `npm run lint && npm run build` green + module checks.
- Commit per module, on `main`, small reversible units.
Build command: npm run build
Start time: 07/22/2026 02:07:44
End time: 07/22/2026 02:09:02
Duration: 00:01:18.2710809
Exit code: 0
Build output size: 3897143 bytes
--- Log excerpt (first 20 lines) ---
 > beredskap101@0.0.0 build > node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build  [36mvite v6.4.3 [32mbuilding for production...[36m[39m transforming... [32m✓[39m 1915 modules transformed. rendering chunks... computing gzip size... [2mdist/[22m[32mindex.html                                  [39m[1m[2m    4.17 kB[22m[1m[22m[2m │ gzip:   1.73 kB[22m [2mdist/[22m[35massets/leaflet-CIGW-MKW.css                 [39m[1m[2m   15.61 kB[22m[1m[22m[2m │ gzip:   6.46 kB[22m [2mdist/[22m[35massets/maplibre-B-YMMjus.css                [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.06 kB[22m [2mdist/[22m[35massets/index-DbBlAXEa.css                   [39m[1m[2m   80.79 kB[22m[1m[22m[2m │ gzip:  14.10 kB[22m [2mdist/[22m[36massets/download-D4nV_GaD.js                 [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m [2mdist/[22m[36massets/feedCache-PnYGKYR_.js                [39m[1m[2m    1.07 kB[22m[1m[22m[2m │ gzip:   0.47 kB[22m [2mdist/[22m[36massets/localAiSettings-D0jUlSzc.js          [39m[1m[2m    1.47 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m [2mdist/[22m[36massets/SafetyChecklists-DOKZm6cY.js         [39m[1m[2m    4.92 kB[22m[1m[22m[2m │ gzip:   1.95 kB[22m [2mdist/[22m[36massets/TrainingScenarios-TcP1d4hl.js        [39m[1m[2m    7.86 kB[22m[1m[22m[2m │ gzip:   2.67 kB[22m [2mdist/[22m[36massets/EditorialArticlesViewer-ai0Cm2Jt.js  [39m[1m[2m    9.31 kB[22m[1m[22m[2m │ gzip:   2.69 kB[22m [2mdist/[22m[36massets/SecureSaveManager-CisyHSlJ.js        [39m[1m[2m   10.84 kB[22m[1m[22m[2m │ gzip:   3.69 kB[22m
--- End of excerpt ---


## Baseline

### Build

### Build

Command: npm run build
Start time: 07/22/2026 02:10:03
End time: 07/22/2026 02:10:25
Duration: 00:00:21.8285238
Exit code: 0
Build output size: 3897143 bytes
--- Log excerpt (first 20 lines) ---
 > beredskap101@0.0.0 build > node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build  [36mvite v6.4.3 [32mbuilding for production...[36m[39m transforming... [32m✓[39m 1915 modules transformed. rendering chunks... computing gzip size... [2mdist/[22m[32mindex.html                                  [39m[1m[2m    4.17 kB[22m[1m[22m[2m │ gzip:   1.73 kB[22m [2mdist/[22m[35massets/leaflet-CIGW-MKW.css                 [39m[1m[2m   15.61 kB[22m[1m[22m[2m │ gzip:   6.46 kB[22m [2mdist/[22m[35massets/maplibre-B-YMMjus.css                [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.06 kB[22m [2mdist/[22m[35massets/index-DbBlAXEa.css                   [39m[1m[2m   80.79 kB[22m[1m[22m[2m │ gzip:  14.10 kB[22m [2mdist/[22m[36massets/download-D4nV_GaD.js                 [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m [2mdist/[22m[36massets/feedCache-PnYGKYR_.js                [39m[1m[2m    1.07 kB[22m[1m[22m[2m │ gzip:   0.47 kB[22m [2mdist/[22m[36massets/localAiSettings-D0jUlSzc.js          [39m[1m[2m    1.47 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m [2mdist/[22m[36massets/SafetyChecklists-DOKZm6cY.js         [39m[1m[2m    4.92 kB[22m[1m[22m[2m │ gzip:   1.95 kB[22m [2mdist/[22m[36massets/TrainingScenarios-TcP1d4hl.js        [39m[1m[2m    7.86 kB[22m[1m[22m[2m │ gzip:   2.67 kB[22m [2mdist/[22m[36massets/EditorialArticlesViewer-ai0Cm2Jt.js  [39m[1m[2m    9.31 kB[22m[1m[22m[2m │ gzip:   2.69 kB[22m [2mdist/[22m[36massets/SecureSaveManager-CisyHSlJ.js        [39m[1m[2m   10.84 kB[22m[1m[22m[2m │ gzip:   3.69 kB[22m
--- End of excerpt ---

### Verification

### Verification (timeout)

Command: npm run verify
Result: Timed out after 120 seconds during lint step (tsc --noEmit).
### Verification (timeout)

Command: npm run verify
Result: Timed out after 120 seconds during build step (part of verify).
Log (last 40 lines):
[PASS] Offline knowledge NO title pack-norway-hazards:no is free of mojibake and blocked transliterations.
[PASS] Offline knowledge NO title pack-medical-and-first-aid:no is populated.
[PASS] Offline knowledge NO title pack-medical-and-first-aid:no is free of mojibake and blocked transliterations.
[PASS] Offline knowledge NO title pack-maps-and-shelter-data:no is populated.
[PASS] Offline knowledge NO title pack-maps-and-shelter-data:no is free of mojibake and blocked transliterations.
[PASS] Offline knowledge NO title pack-privacy-and-personal-safety:no is populated.
[PASS] Offline knowledge NO title pack-privacy-and-personal-safety:no is free of mojibake and blocked transliterations.
[PASS] Offline knowledge NO title pack-travel-resilience:no is populated.
[PASS] Offline knowledge NO title pack-travel-resilience:no is free of mojibake and blocked transliterations.
[PASS] Offline knowledge exposes Norwegian documents for type manual-topic.
[PASS] Offline knowledge exposes Norwegian documents for type processed-asset.
[PASS] Offline knowledge exposes Norwegian documents for type editorial-article.
[PASS] Offline knowledge exposes Norwegian documents for type checklist-item.
[PASS] Offline knowledge exposes Norwegian documents for type content-pack.
[PASS] Glossary includes article 17 erasure.
[PASS] Glossary includes article 20 portability.
[PASS] Glossary includes pmtiles.
[PASS] Glossary includes dsb.
[PASS] Glossary includes nve.
[PASS] Glossary includes sivilforsvaret.
[PASS] Glossary includes lokal ki-kjører.

[SUCCESS] Localization verification completed with no errors or flags.
[verify] PASS verify:localization

[verify] START ingest:validate (timeout 60s)

> beredskap101@0.0.0 ingest:validate
> tsx scripts/validate-processed-assets.ts

[validate] OK - validated 18 accepted assets without modifying source files.
[verify] PASS ingest:validate

[verify] START build (timeout 120s)

> beredskap101@0.0.0 build
> node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build

[36mvite v6.4.3 [32mbuilding for production...[36m[39m
transforming...
--- End of log ---

### E2E Test (timeout)

Command: npm run test:e2e
Result: Timed out after 120 seconds (shell tool timeout) during Playwright test execution.
Log (last 40 lines):
[2mdist/[22m[36massets/EditorialArticlesViewer-ai0Cm2Jt.js  [39m[1m[2m    9.31 kB[22m[1m[22m[2m │ gzip:   2.69 kB[22m
[2mdist/[22m[36massets/SecureSaveManager-CisyHSlJ.js        [39m[1m[2m   10.84 kB[22m[1m[22m[2m │ gzip:   3.69 kB[22m
[2mdist/[22m[36massets/DynamicGearListBuilder-B4BdsPqJ.js   [39m[1m[2m   11.38 kB[22m[1m[22m[2m │ gzip:   4.20 kB[22m
[2mdist/[22m[36massets/pmtiles-QtzJEy4C.js                  [39m[1m[2m   13.95 kB[22m[1m[22m[2m │ gzip:   5.12 kB[22m
[2mdist/[22m[36massets/InteractiveFlowcharts--JJQUBCG.js    [39m[1m[2m   14.07 kB[22m[1m[22m[2m │ gzip:   5.03 kB[22m
[2mdist/[22m[36massets/NorwegianNewsFeed-DrYkUwIo.js        [39m[1m[2m   14.66 kB[22m[1m[22m[2m │ gzip:   4.46 kB[22m
[2mdist/[22m[36massets/SourceLinksSection-Bll59p0F.js       [39m[1m[2m   14.69 kB[22m[1m[22m[2m │ gzip:   4.15 kB[22m
[2mdist/[22m[36massets/search-D7oNtqOG.js                   [39m[1m[2m   18.02 kB[22m[1m[22m[2m │ gzip:   5.92 kB[22m
[2mdist/[22m[36massets/LocalAiAssistant-DcOmuNrM.js         [39m[1m[2m   18.51 kB[22m[1m[22m[2m │ gzip:   6.66 kB[22m
[2mdist/[22m[36massets/LocalDocumentVault-DZlhVSPl.js       [39m[1m[2m   19.12 kB[22m[1m[22m[2m │ gzip:   5.85 kB[22m
[2mdist/[22m[36massets/ExtendedAssetViewer-DaqAqXMm.js      [39m[1m[2m   29.22 kB[22m[1m[22m[2m │ gzip:   6.60 kB[22m
[2mdist/[22m[36massets/KnowledgeMap-D-fch4rB.js             [39m[1m[2m   34.29 kB[22m[1m[22m[2m │ gzip:   9.97 kB[22m
[2mdist/[22m[36massets/ShelterMap-J7BqGYot.js               [39m[1m[2m   34.47 kB[22m[1m[22m[2m │ gzip:  10.67 kB[22m
[2mdist/[22m[36massets/i18n-BFTVpoLc.js                     [39m[1m[2m   49.20 kB[22m[1m[22m[2m │ gzip:  16.13 kB[22m
[2mdist/[22m[36massets/StaticPages-C4iVXoj-.js              [39m[1m[2m   51.36 kB[22m[1m[22m[2m │ gzip:  14.60 kB[22m
[2mdist/[22m[36massets/leaflet-Bff4WeeJ.js                  [39m[1m[2m  149.66 kB[22m[1m[22m[2m │ gzip:  43.40 kB[22m
[2mdist/[22m[36massets/react-core-BJXdKOwA.js               [39m[1m[2m  194.46 kB[22m[1m[22m[2m │ gzip:  60.73 kB[22m
[2mdist/[22m[36massets/processed-assets-D6_eNyjV.js         [39m[1m[2m  227.13 kB[22m[1m[22m[2m │ gzip:  10.11 kB[22m
[2mdist/[22m[36massets/index-Bh-xokBG.js                    [39m[1m[2m  359.98 kB[22m[1m[22m[2m │ gzip: 116.92 kB[22m
[2mdist/[22m[36massets/vendor-2ZQB13pp.js                   [39m[1m[2m  478.12 kB[22m[1m[22m[2m │ gzip: 151.08 kB[22m
[2mdist/[22m[36massets/icons-aqCd-EQ9.js                    [39m[1m[2m  852.38 kB[22m[1m[22m[2m │ gzip: 157.48 kB[22m
[2mdist/[22m[36massets/maplibre-BQDVRfec.js                 [39m[1m[2m1,055.19 kB[22m[1m[22m[2m │ gzip: 285.09 kB[22m
[32m✓ built in 59.33s[39m

PWA v1.3.0
Building src/sw.ts service worker ("es" format)...
[36mvite v6.4.3 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 54 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[36msw.mjs  [39m[1m[2m18.44 kB[22m[1m[22m[2m │ gzip: 6.26 kB[22m
[32m✓ built in 4.29s[39m

PWA v1.3.0
mode      injectManifest
format:   es
precache  37 entries (3758.34 KiB)
files generated
  dist/sw.js
--- End of log ---

### Git State

SHA: 206e858dc46f26d2d79e2d4ee6001312192a21fe
Branch: main
Status:
 M .agent/skills/bmad-advanced-elicitation/SKILL.md
 M .agent/skills/bmad-advanced-elicitation/methods.csv
 M .agent/skills/bmad-agent-analyst/SKILL.md
 M .agent/skills/bmad-agent-analyst/customize.toml
 M .agent/skills/bmad-agent-architect/SKILL.md
 M .agent/skills/bmad-agent-architect/customize.toml
 M .agent/skills/bmad-agent-dev/SKILL.md
 M .agent/skills/bmad-agent-dev/customize.toml
 M .agent/skills/bmad-agent-pm/SKILL.md
 M .agent/skills/bmad-agent-pm/customize.toml
 M .agent/skills/bmad-agent-tech-writer/SKILL.md
 M .agent/skills/bmad-agent-tech-writer/customize.toml
 M .agent/skills/bmad-agent-tech-writer/explain-concept.md
 M .agent/skills/bmad-agent-tech-writer/mermaid-gen.md
 M .agent/skills/bmad-agent-tech-writer/validate-doc.md
 M .agent/skills/bmad-agent-tech-writer/write-document.md
 M .agent/skills/bmad-agent-ux-designer/SKILL.md
 M .agent/skills/bmad-agent-ux-designer/customize.toml
 M .agent/skills/bmad-brainstorming/SKILL.md
 D .agent/skills/bmad-brainstorming/brain-methods.csv
 D .agent/skills/bmad-brainstorming/steps/step-01-session-setup.md
 D .agent/skills/bmad-brainstorming/steps/step-01b-continue.md
 D .agent/skills/bmad-brainstorming/steps/step-02a-user-selected.md
 D .agent/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md
 D .agent/skills/bmad-brainstorming/steps/step-02c-random-selection.md
 D .agent/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md
 D .agent/skills/bmad-brainstorming/steps/step-03-technique-execution.md
 D .agent/skills/bmad-brainstorming/steps/step-04-idea-organization.md
 D .agent/skills/bmad-brainstorming/template.md
 D .agent/skills/bmad-brainstorming/workflow.md
 M .agent/skills/bmad-check-implementation-readiness/SKILL.md
 M .agent/skills/bmad-check-implementation-readiness/customize.toml
 M .agent/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md
 M .agent/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md
 M .agent/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md
 M .agent/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md
 M .agent/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md
 M .agent/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md
 M .agent/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md
 M .agent/skills/bmad-checkpoint-preview/SKILL.md
 M .agent/skills/bmad-checkpoint-preview/customize.toml
 M .agent/skills/bmad-checkpoint-preview/generate-trail.md
 M .agent/skills/bmad-checkpoint-preview/step-01-orientation.md
 M .agent/skills/bmad-checkpoint-preview/step-02-walkthrough.md
 M .agent/skills/bmad-checkpoint-preview/step-03-detail-pass.md
 M .agent/skills/bmad-checkpoint-preview/step-04-testing.md
 M .agent/skills/bmad-checkpoint-preview/step-05-wrapup.md
 M .agent/skills/bmad-code-review/SKILL.md
 M .agent/skills/bmad-code-review/customize.toml
 M .agent/skills/bmad-code-review/steps/step-01-gather-context.md
 M .agent/skills/bmad-code-review/steps/step-02-review.md
 M .agent/skills/bmad-code-review/steps/step-03-triage.md
 M .agent/skills/bmad-code-review/steps/step-04-present.md
 M .agent/skills/bmad-correct-course/SKILL.md
 M .agent/skills/bmad-correct-course/checklist.md
 M .agent/skills/bmad-correct-course/customize.toml
 M .agent/skills/bmad-create-architecture/SKILL.md
 D .agent/skills/bmad-create-architecture/architecture-decision-template.md
 M .agent/skills/bmad-create-architecture/customize.toml
 D .agent/skills/bmad-create-architecture/data/domain-complexity.csv
 D .agent/skills/bmad-create-architecture/data/project-types.csv
 D .agent/skills/bmad-create-architecture/steps/step-01-init.md
 D .agent/skills/bmad-create-architecture/steps/step-01b-continue.md
 D .agent/skills/bmad-create-architecture/steps/step-02-context.md
 D .agent/skills/bmad-create-architecture/steps/step-03-starter.md
 D .agent/skills/bmad-create-architecture/steps/step-04-decisions.md
 D .agent/skills/bmad-create-architecture/steps/step-05-patterns.md
 D .agent/skills/bmad-create-architecture/steps/step-06-structure.md
 D .agent/skills/bmad-create-architecture/steps/step-07-validation.md
 D .agent/skills/bmad-create-architecture/steps/step-08-complete.md
 M .agent/skills/bmad-create-epics-and-stories/SKILL.md
 M .agent/skills/bmad-create-epics-and-stories/customize.toml
 M .agent/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md
 M .agent/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md
 M .agent/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md
 M .agent/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md
 M .agent/skills/bmad-create-epics-and-stories/templates/epics-template.md
 M .agent/skills/bmad-create-prd/SKILL.md
 M .agent/skills/bmad-create-prd/customize.toml
 M .agent/skills/bmad-create-story/SKILL.md
 M .agent/skills/bmad-create-story/checklist.md
 M .agent/skills/bmad-create-story/customize.toml
 M .agent/skills/bmad-create-story/discover-inputs.md
 M .agent/skills/bmad-create-story/template.md
 M .agent/skills/bmad-customize/SKILL.md
 M .agent/skills/bmad-customize/scripts/list_customizable_skills.py
 M .agent/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py
 M .agent/skills/bmad-dev-story/SKILL.md
 M .agent/skills/bmad-dev-story/checklist.md
 M .agent/skills/bmad-dev-story/customize.toml
 M .agent/skills/bmad-document-project/SKILL.md
 M .agent/skills/bmad-document-project/checklist.md
 M .agent/skills/bmad-document-project/customize.toml
 M .agent/skills/bmad-document-project/documentation-requirements.csv
 M .agent/skills/bmad-document-project/instructions.md
 M .agent/skills/bmad-document-project/templates/deep-dive-template.md
 M .agent/skills/bmad-document-project/templates/index-template.md
 M .agent/skills/bmad-document-project/templates/project-overview-template.md
 M .agent/skills/bmad-document-project/templates/project-scan-report-schema.json
 M .agent/skills/bmad-document-project/templates/source-tree-template.md
 M .agent/skills/bmad-document-project/workflows/deep-dive-instructions.md
 M .agent/skills/bmad-document-project/workflows/deep-dive-workflow.md
 M .agent/skills/bmad-document-project/workflows/full-scan-instructions.md
 M .agent/skills/bmad-document-project/workflows/full-scan-workflow.md
 M .agent/skills/bmad-domain-research/SKILL.md
 M .agent/skills/bmad-domain-research/customize.toml
 M .agent/skills/bmad-domain-research/domain-steps/step-01-init.md
 M .agent/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md
 M .agent/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md
 M .agent/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md
 M .agent/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md
 M .agent/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md
 M .agent/skills/bmad-domain-research/research.template.md
 M .agent/skills/bmad-edit-prd/SKILL.md
 M .agent/skills/bmad-edit-prd/customize.toml
 M .agent/skills/bmad-editorial-review-prose/SKILL.md
 M .agent/skills/bmad-editorial-review-structure/SKILL.md
 M .agent/skills/bmad-generate-project-context/SKILL.md
 M .agent/skills/bmad-generate-project-context/customize.toml
 M .agent/skills/bmad-generate-project-context/project-context-template.md
 M .agent/skills/bmad-generate-project-context/steps/step-01-discover.md
 M .agent/skills/bmad-generate-project-context/steps/step-02-generate.md
 M .agent/skills/bmad-generate-project-context/steps/step-03-complete.md
 M .agent/skills/bmad-help/SKILL.md
 M .agent/skills/bmad-index-docs/SKILL.md
 D .agent/skills/bmad-investigate/SKILL.md
 D .agent/skills/bmad-investigate/customize.toml
 D .agent/skills/bmad-investigate/references/case-file-template.md
 M .agent/skills/bmad-market-research/SKILL.md
 M .agent/skills/bmad-market-research/customize.toml
 M .agent/skills/bmad-market-research/research.template.md
 M .agent/skills/bmad-market-research/steps/step-01-init.md
 M .agent/skills/bmad-market-research/steps/step-02-customer-behavior.md
 M .agent/skills/bmad-market-research/steps/step-03-customer-pain-points.md
 M .agent/skills/bmad-market-research/steps/step-04-customer-decisions.md
 M .agent/skills/bmad-market-research/steps/step-05-competitive-analysis.md
 M .agent/skills/bmad-market-research/steps/step-06-research-completion.md
 M .agent/skills/bmad-party-mode/SKILL.md
 M .agent/skills/bmad-prd/SKILL.md
 M .agent/skills/bmad-prd/assets/headless-schemas.md
 M .agent/skills/bmad-prd/assets/prd-template.md
 M .agent/skills/bmad-prd/assets/prd-validation-checklist.md
 M .agent/skills/bmad-prd/assets/validation-report-template.html
 M .agent/skills/bmad-prd/customize.toml
 M .agent/skills/bmad-prd/references/headless.md
 M .agent/skills/bmad-prd/references/validate.md
 M .agent/skills/bmad-prfaq/SKILL.md
 M .agent/skills/bmad-prfaq/agents/artifact-analyzer.md
 M .agent/skills/bmad-prfaq/agents/web-researcher.md
 M .agent/skills/bmad-prfaq/assets/prfaq-template.md
 M .agent/skills/bmad-prfaq/bmad-manifest.json
 M .agent/skills/bmad-prfaq/customize.toml
 M .agent/skills/bmad-prfaq/references/customer-faq.md
 M .agent/skills/bmad-prfaq/references/internal-faq.md
 M .agent/skills/bmad-prfaq/references/press-release.md
 M .agent/skills/bmad-prfaq/references/verdict.md
 M .agent/skills/bmad-product-brief/SKILL.md
 M .agent/skills/bmad-product-brief/assets/brief-template.md
 M .agent/skills/bmad-product-brief/customize.toml
 M .agent/skills/bmad-qa-generate-e2e-tests/SKILL.md
 M .agent/skills/bmad-qa-generate-e2e-tests/checklist.md
 M .agent/skills/bmad-qa-generate-e2e-tests/customize.toml
 M .agent/skills/bmad-quick-dev/SKILL.md
 M .agent/skills/bmad-quick-dev/compile-epic-context.md
 M .agent/skills/bmad-quick-dev/customize.toml
 M .agent/skills/bmad-quick-dev/spec-template.md
 M .agent/skills/bmad-quick-dev/step-01-clarify-and-route.md
 M .agent/skills/bmad-quick-dev/step-02-plan.md
 M .agent/skills/bmad-quick-dev/step-03-implement.md
 M .agent/skills/bmad-quick-dev/step-04-review.md
 M .agent/skills/bmad-quick-dev/step-05-present.md
 M .agent/skills/bmad-quick-dev/step-oneshot.md
 M .agent/skills/bmad-quick-dev/sync-sprint-status.md
 M .agent/skills/bmad-retrospective/SKILL.md
 M .agent/skills/bmad-retrospective/customize.toml
 M .agent/skills/bmad-review-adversarial-general/SKILL.md
 M .agent/skills/bmad-review-edge-case-hunter/SKILL.md
 M .agent/skills/bmad-shard-doc/SKILL.md
 M .agent/skills/bmad-spec/SKILL.md
 M .agent/skills/bmad-spec/assets/headless-schemas.md
 M .agent/skills/bmad-spec/assets/spec-template.md
 M .agent/skills/bmad-spec/customize.toml
 M .agent/skills/bmad-sprint-planning/SKILL.md
 M .agent/skills/bmad-sprint-planning/checklist.md
 M .agent/skills/bmad-sprint-planning/customize.toml
 M .agent/skills/bmad-sprint-planning/sprint-status-template.yaml
 M .agent/skills/bmad-sprint-status/SKILL.md
 M .agent/skills/bmad-sprint-status/customize.toml
 M .agent/skills/bmad-story-automator/data/monitoring-fallback.md
 M .agent/skills/bmad-story-automator/data/orchestration-policy.json
 M .agent/skills/bmad-story-automator/data/prompts/auto.md
 M .agent/skills/bmad-story-automator/data/prompts/create.md
 M .agent/skills/bmad-story-automator/data/prompts/dev.md
 M .agent/skills/bmad-story-automator/data/prompts/review.md
 M .agent/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py
 M .agent/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py
 M .agent/skills/bmad-story-automator/src/story_automator/commands/tmux.py
 M .agent/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py
 M .agent/skills/bmad-story-automator/src/story_automator/core/story_keys.py
 M .agent/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py
 M .agent/skills/bmad-story-automator/src/story_automator/core/utils.py
 M .agent/skills/bmad-story-automator/steps-c/step-01b-continue.md
 M .agent/skills/bmad-tea/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-technical-research/SKILL.md
 M .agent/skills/bmad-technical-research/customize.toml
 M .agent/skills/bmad-technical-research/research.template.md
 M .agent/skills/bmad-technical-research/technical-steps/step-01-init.md
 M .agent/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md
 M .agent/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md
 M .agent/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md
 M .agent/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md
 M .agent/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md
 M .agent/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md
 M .agent/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md
 M .agent/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md
 M .agent/skills/bmad-ux/SKILL.md
 M .agent/skills/bmad-ux/assets/color-themes.md
 M .agent/skills/bmad-ux/assets/design-directions.md
 M .agent/skills/bmad-ux/assets/design-example-editorial.md
 M .agent/skills/bmad-ux/assets/design-example-mobile.md
 M .agent/skills/bmad-ux/assets/design-example-shadcn.md
 M .agent/skills/bmad-ux/assets/excalidraw-wireframe.md
 M .agent/skills/bmad-ux/assets/experience-example-mobile.md
 M .agent/skills/bmad-ux/assets/experience-example-shadcn.md
 M .agent/skills/bmad-ux/assets/headless-schemas.md
 M .agent/skills/bmad-ux/assets/key-screens.md
 M .agent/skills/bmad-ux/assets/validation-report-template.html
 M .agent/skills/bmad-ux/customize.toml
 M .agent/skills/bmad-ux/references/creative-tools.md
 M .agent/skills/bmad-ux/references/design-md-spec.md
 M .agent/skills/bmad-ux/references/headless.md
 M .agent/skills/bmad-ux/references/validate.md
 M .agent/skills/bmad-validate-prd/SKILL.md
 M .agent/skills/bmad-validate-prd/customize.toml
 M .agents/skills/bmad-advanced-elicitation/SKILL.md
 M .agents/skills/bmad-advanced-elicitation/methods.csv
 M .agents/skills/bmad-agent-analyst/SKILL.md
 M .agents/skills/bmad-agent-analyst/customize.toml
 M .agents/skills/bmad-agent-architect/SKILL.md
 M .agents/skills/bmad-agent-architect/customize.toml
 M .agents/skills/bmad-agent-dev/SKILL.md
 M .agents/skills/bmad-agent-dev/customize.toml
 M .agents/skills/bmad-agent-pm/SKILL.md
 M .agents/skills/bmad-agent-pm/customize.toml
 M .agents/skills/bmad-agent-tech-writer/SKILL.md
 M .agents/skills/bmad-agent-tech-writer/customize.toml
 M .agents/skills/bmad-agent-tech-writer/explain-concept.md
 M .agents/skills/bmad-agent-tech-writer/mermaid-gen.md
 M .agents/skills/bmad-agent-tech-writer/validate-doc.md
 M .agents/skills/bmad-agent-tech-writer/write-document.md
 M .agents/skills/bmad-agent-ux-designer/SKILL.md
 M .agents/skills/bmad-agent-ux-designer/customize.toml
 M .agents/skills/bmad-brainstorming/SKILL.md
 D .agents/skills/bmad-brainstorming/brain-methods.csv
 D .agents/skills/bmad-brainstorming/steps/step-01-session-setup.md
 D .agents/skills/bmad-brainstorming/steps/step-01b-continue.md
 D .agents/skills/bmad-brainstorming/steps/step-02a-user-selected.md
 D .agents/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md
 D .agents/skills/bmad-brainstorming/steps/step-02c-random-selection.md
 D .agents/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md
 D .agents/skills/bmad-brainstorming/steps/step-03-technique-execution.md
 D .agents/skills/bmad-brainstorming/steps/step-04-idea-organization.md
 D .agents/skills/bmad-brainstorming/template.md
 D .agents/skills/bmad-brainstorming/workflow.md
 M .agents/skills/bmad-check-implementation-readiness/SKILL.md
 M .agents/skills/bmad-check-implementation-readiness/customize.toml
 M .agents/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md
 M .agents/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md
 M .agents/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md
 M .agents/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md
 M .agents/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md
 M .agents/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md
 M .agents/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md
 M .agents/skills/bmad-checkpoint-preview/SKILL.md
 M .agents/skills/bmad-checkpoint-preview/customize.toml
 M .agents/skills/bmad-checkpoint-preview/generate-trail.md
 M .agents/skills/bmad-checkpoint-preview/step-01-orientation.md
 M .agents/skills/bmad-checkpoint-preview/step-02-walkthrough.md
 M .agents/skills/bmad-checkpoint-preview/step-03-detail-pass.md
 M .agents/skills/bmad-checkpoint-preview/step-04-testing.md
 M .agents/skills/bmad-checkpoint-preview/step-05-wrapup.md
 M .agents/skills/bmad-code-review/SKILL.md
 M .agents/skills/bmad-code-review/customize.toml
 M .agents/skills/bmad-code-review/steps/step-01-gather-context.md
 M .agents/skills/bmad-code-review/steps/step-02-review.md
 M .agents/skills/bmad-code-review/steps/step-03-triage.md
 M .agents/skills/bmad-code-review/steps/step-04-present.md
 M .agents/skills/bmad-correct-course/SKILL.md
 M .agents/skills/bmad-correct-course/checklist.md
 M .agents/skills/bmad-correct-course/customize.toml
 M .agents/skills/bmad-create-architecture/SKILL.md
 D .agents/skills/bmad-create-architecture/architecture-decision-template.md
 M .agents/skills/bmad-create-architecture/customize.toml
 D .agents/skills/bmad-create-architecture/data/domain-complexity.csv
 D .agents/skills/bmad-create-architecture/data/project-types.csv
 D .agents/skills/bmad-create-architecture/steps/step-01-init.md
 D .agents/skills/bmad-create-architecture/steps/step-01b-continue.md
 D .agents/skills/bmad-create-architecture/steps/step-02-context.md
 D .agents/skills/bmad-create-architecture/steps/step-03-starter.md
 D .agents/skills/bmad-create-architecture/steps/step-04-decisions.md
 D .agents/skills/bmad-create-architecture/steps/step-05-patterns.md
 D .agents/skills/bmad-create-architecture/steps/step-06-structure.md
 D .agents/skills/bmad-create-architecture/steps/step-07-validation.md
 D .agents/skills/bmad-create-architecture/steps/step-08-complete.md
 M .agents/skills/bmad-create-epics-and-stories/SKILL.md
 M .agents/skills/bmad-create-epics-and-stories/customize.toml
 M .agents/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md
 M .agents/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md
 M .agents/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md
 M .agents/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md
 M .agents/skills/bmad-create-epics-and-stories/templates/epics-template.md
 M .agents/skills/bmad-create-prd/SKILL.md
 M .agents/skills/bmad-create-prd/customize.toml
 M .agents/skills/bmad-create-story/SKILL.md
 M .agents/skills/bmad-create-story/checklist.md
 M .agents/skills/bmad-create-story/customize.toml
 M .agents/skills/bmad-create-story/discover-inputs.md
 M .agents/skills/bmad-create-story/template.md
 M .agents/skills/bmad-customize/SKILL.md
 M .agents/skills/bmad-customize/scripts/list_customizable_skills.py
 M .agents/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py
 M .agents/skills/bmad-dev-story/SKILL.md
 M .agents/skills/bmad-dev-story/checklist.md
 M .agents/skills/bmad-dev-story/customize.toml
 M .agents/skills/bmad-document-project/SKILL.md
 M .agents/skills/bmad-document-project/checklist.md
 M .agents/skills/bmad-document-project/customize.toml
 M .agents/skills/bmad-document-project/documentation-requirements.csv
 M .agents/skills/bmad-document-project/instructions.md
 M .agents/skills/bmad-document-project/templates/deep-dive-template.md
 M .agents/skills/bmad-document-project/templates/index-template.md
 M .agents/skills/bmad-document-project/templates/project-overview-template.md
 M .agents/skills/bmad-document-project/templates/project-scan-report-schema.json
 M .agents/skills/bmad-document-project/templates/source-tree-template.md
 M .agents/skills/bmad-document-project/workflows/deep-dive-instructions.md
 M .agents/skills/bmad-document-project/workflows/deep-dive-workflow.md
 M .agents/skills/bmad-document-project/workflows/full-scan-instructions.md
 M .agents/skills/bmad-document-project/workflows/full-scan-workflow.md
 M .agents/skills/bmad-domain-research/SKILL.md
 M .agents/skills/bmad-domain-research/customize.toml
 M .agents/skills/bmad-domain-research/domain-steps/step-01-init.md
 M .agents/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md
 M .agents/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md
 M .agents/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md
 M .agents/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md
 M .agents/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md
 M .agents/skills/bmad-domain-research/research.template.md
 M .agents/skills/bmad-edit-prd/SKILL.md
 M .agents/skills/bmad-edit-prd/customize.toml
 M .agents/skills/bmad-editorial-review-prose/SKILL.md
 M .agents/skills/bmad-editorial-review-structure/SKILL.md
 M .agents/skills/bmad-generate-project-context/SKILL.md
 M .agents/skills/bmad-generate-project-context/customize.toml
 M .agents/skills/bmad-generate-project-context/project-context-template.md
 M .agents/skills/bmad-generate-project-context/steps/step-01-discover.md
 M .agents/skills/bmad-generate-project-context/steps/step-02-generate.md
 M .agents/skills/bmad-generate-project-context/steps/step-03-complete.md
 M .agents/skills/bmad-help/SKILL.md
 M .agents/skills/bmad-index-docs/SKILL.md
 D .agents/skills/bmad-investigate/SKILL.md
 D .agents/skills/bmad-investigate/customize.toml
 D .agents/skills/bmad-investigate/references/case-file-template.md
 M .agents/skills/bmad-market-research/SKILL.md
 M .agents/skills/bmad-market-research/customize.toml
 M .agents/skills/bmad-market-research/research.template.md
 M .agents/skills/bmad-market-research/steps/step-01-init.md
 M .agents/skills/bmad-market-research/steps/step-02-customer-behavior.md
 M .agents/skills/bmad-market-research/steps/step-03-customer-pain-points.md
 M .agents/skills/bmad-market-research/steps/step-04-customer-decisions.md
 M .agents/skills/bmad-market-research/steps/step-05-competitive-analysis.md
 M .agents/skills/bmad-market-research/steps/step-06-research-completion.md
 M .agents/skills/bmad-party-mode/SKILL.md
 M .agents/skills/bmad-prd/SKILL.md
 M .agents/skills/bmad-prd/assets/headless-schemas.md
 M .agents/skills/bmad-prd/assets/prd-template.md
 M .agents/skills/bmad-prd/assets/prd-validation-checklist.md
 M .agents/skills/bmad-prd/assets/validation-report-template.html
 M .agents/skills/bmad-prd/customize.toml
 M .agents/skills/bmad-prd/references/headless.md
 M .agents/skills/bmad-prd/references/validate.md
 M .agents/skills/bmad-prfaq/SKILL.md
 M .agents/skills/bmad-prfaq/agents/artifact-analyzer.md
 M .agents/skills/bmad-prfaq/agents/web-researcher.md
 M .agents/skills/bmad-prfaq/assets/prfaq-template.md
 M .agents/skills/bmad-prfaq/bmad-manifest.json
 M .agents/skills/bmad-prfaq/customize.toml
 M .agents/skills/bmad-prfaq/references/customer-faq.md
 M .agents/skills/bmad-prfaq/references/internal-faq.md
 M .agents/skills/bmad-prfaq/references/press-release.md
 M .agents/skills/bmad-prfaq/references/verdict.md
 M .agents/skills/bmad-product-brief/SKILL.md
 M .agents/skills/bmad-product-brief/assets/brief-template.md
 M .agents/skills/bmad-product-brief/customize.toml
 M .agents/skills/bmad-qa-generate-e2e-tests/SKILL.md
 M .agents/skills/bmad-qa-generate-e2e-tests/checklist.md
 M .agents/skills/bmad-qa-generate-e2e-tests/customize.toml
 M .agents/skills/bmad-quick-dev/SKILL.md
 M .agents/skills/bmad-quick-dev/compile-epic-context.md
 M .agents/skills/bmad-quick-dev/customize.toml
 M .agents/skills/bmad-quick-dev/spec-template.md
 M .agents/skills/bmad-quick-dev/step-01-clarify-and-route.md
 M .agents/skills/bmad-quick-dev/step-02-plan.md
 M .agents/skills/bmad-quick-dev/step-03-implement.md
 M .agents/skills/bmad-quick-dev/step-04-review.md
 M .agents/skills/bmad-quick-dev/step-05-present.md
 M .agents/skills/bmad-quick-dev/step-oneshot.md
 M .agents/skills/bmad-quick-dev/sync-sprint-status.md
 M .agents/skills/bmad-retrospective/SKILL.md
 M .agents/skills/bmad-retrospective/customize.toml
 M .agents/skills/bmad-review-adversarial-general/SKILL.md
 M .agents/skills/bmad-review-edge-case-hunter/SKILL.md
 M .agents/skills/bmad-shard-doc/SKILL.md
 M .agents/skills/bmad-spec/SKILL.md
 M .agents/skills/bmad-spec/assets/headless-schemas.md
 M .agents/skills/bmad-spec/assets/spec-template.md
 M .agents/skills/bmad-spec/customize.toml
 M .agents/skills/bmad-sprint-planning/SKILL.md
 M .agents/skills/bmad-sprint-planning/checklist.md
 M .agents/skills/bmad-sprint-planning/customize.toml
 M .agents/skills/bmad-sprint-planning/sprint-status-template.yaml
 M .agents/skills/bmad-sprint-status/SKILL.md
 M .agents/skills/bmad-sprint-status/customize.toml
 M .agents/skills/bmad-story-automator/data/monitoring-fallback.md
 M .agents/skills/bmad-story-automator/data/orchestration-policy.json
 M .agents/skills/bmad-story-automator/data/prompts/auto.md
 M .agents/skills/bmad-story-automator/data/prompts/create.md
 M .agents/skills/bmad-story-automator/data/prompts/dev.md
 M .agents/skills/bmad-story-automator/data/prompts/review.md
 M .agents/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py
 M .agents/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py
 M .agents/skills/bmad-story-automator/src/story_automator/commands/tmux.py
 M .agents/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py
 M .agents/skills/bmad-story-automator/src/story_automator/core/story_keys.py
 M .agents/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py
 M .agents/skills/bmad-story-automator/src/story_automator/core/utils.py
 M .agents/skills/bmad-story-automator/steps-c/step-01b-continue.md
 M .agents/skills/bmad-tea/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-technical-research/SKILL.md
 M .agents/skills/bmad-technical-research/customize.toml
 M .agents/skills/bmad-technical-research/research.template.md
 M .agents/skills/bmad-technical-research/technical-steps/step-01-init.md
 M .agents/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md
 M .agents/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md
 M .agents/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md
 M .agents/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md
 M .agents/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md
 M .agents/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md
 M .agents/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md
 M .agents/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md
 M .agents/skills/bmad-ux/SKILL.md
 M .agents/skills/bmad-ux/assets/color-themes.md
 M .agents/skills/bmad-ux/assets/design-directions.md
 M .agents/skills/bmad-ux/assets/design-example-editorial.md
 M .agents/skills/bmad-ux/assets/design-example-mobile.md
 M .agents/skills/bmad-ux/assets/design-example-shadcn.md
 M .agents/skills/bmad-ux/assets/excalidraw-wireframe.md
 M .agents/skills/bmad-ux/assets/experience-example-mobile.md
 M .agents/skills/bmad-ux/assets/experience-example-shadcn.md
 M .agents/skills/bmad-ux/assets/headless-schemas.md
 M .agents/skills/bmad-ux/assets/key-screens.md
 M .agents/skills/bmad-ux/assets/validation-report-template.html
 M .agents/skills/bmad-ux/customize.toml
 M .agents/skills/bmad-ux/references/creative-tools.md
 M .agents/skills/bmad-ux/references/design-md-spec.md
 M .agents/skills/bmad-ux/references/headless.md
 M .agents/skills/bmad-ux/references/validate.md
 M .agents/skills/bmad-validate-prd/SKILL.md
 M .agents/skills/bmad-validate-prd/customize.toml
 M .claude/skills/bmad-advanced-elicitation/SKILL.md
 M .claude/skills/bmad-advanced-elicitation/methods.csv
 M .claude/skills/bmad-agent-analyst/SKILL.md
 M .claude/skills/bmad-agent-analyst/customize.toml
 M .claude/skills/bmad-agent-architect/SKILL.md
 M .claude/skills/bmad-agent-architect/customize.toml
 M .claude/skills/bmad-agent-dev/SKILL.md
 M .claude/skills/bmad-agent-dev/customize.toml
 M .claude/skills/bmad-agent-pm/SKILL.md
 M .claude/skills/bmad-agent-pm/customize.toml
 M .claude/skills/bmad-agent-tech-writer/SKILL.md
 M .claude/skills/bmad-agent-tech-writer/customize.toml
 M .claude/skills/bmad-agent-tech-writer/explain-concept.md
 M .claude/skills/bmad-agent-tech-writer/mermaid-gen.md
 M .claude/skills/bmad-agent-tech-writer/validate-doc.md
 M .claude/skills/bmad-agent-tech-writer/write-document.md
 M .claude/skills/bmad-agent-ux-designer/SKILL.md
 M .claude/skills/bmad-agent-ux-designer/customize.toml
 M .claude/skills/bmad-brainstorming/SKILL.md
 D .claude/skills/bmad-brainstorming/brain-methods.csv
 D .claude/skills/bmad-brainstorming/steps/step-01-session-setup.md
 D .claude/skills/bmad-brainstorming/steps/step-01b-continue.md
 D .claude/skills/bmad-brainstorming/steps/step-02a-user-selected.md
 D .claude/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md
 D .claude/skills/bmad-brainstorming/steps/step-02c-random-selection.md
 D .claude/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md
 D .claude/skills/bmad-brainstorming/steps/step-03-technique-execution.md
 D .claude/skills/bmad-brainstorming/steps/step-04-idea-organization.md
 D .claude/skills/bmad-brainstorming/template.md
 D .claude/skills/bmad-brainstorming/workflow.md
 M .claude/skills/bmad-check-implementation-readiness/SKILL.md
 M .claude/skills/bmad-check-implementation-readiness/customize.toml
 M .claude/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md
 M .claude/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md
 M .claude/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md
 M .claude/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md
 M .claude/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md
 M .claude/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md
 M .claude/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md
 M .claude/skills/bmad-checkpoint-preview/SKILL.md
 M .claude/skills/bmad-checkpoint-preview/customize.toml
 M .claude/skills/bmad-checkpoint-preview/generate-trail.md
 M .claude/skills/bmad-checkpoint-preview/step-01-orientation.md
 M .claude/skills/bmad-checkpoint-preview/step-02-walkthrough.md
 M .claude/skills/bmad-checkpoint-preview/step-03-detail-pass.md
 M .claude/skills/bmad-checkpoint-preview/step-04-testing.md
 M .claude/skills/bmad-checkpoint-preview/step-05-wrapup.md
 M .claude/skills/bmad-code-review/SKILL.md
 M .claude/skills/bmad-code-review/customize.toml
 M .claude/skills/bmad-code-review/steps/step-01-gather-context.md
 M .claude/skills/bmad-code-review/steps/step-02-review.md
 M .claude/skills/bmad-code-review/steps/step-03-triage.md
 M .claude/skills/bmad-code-review/steps/step-04-present.md
 M .claude/skills/bmad-correct-course/SKILL.md
 M .claude/skills/bmad-correct-course/checklist.md
 M .claude/skills/bmad-correct-course/customize.toml
 M .claude/skills/bmad-create-architecture/SKILL.md
 D .claude/skills/bmad-create-architecture/architecture-decision-template.md
 M .claude/skills/bmad-create-architecture/customize.toml
 D .claude/skills/bmad-create-architecture/data/domain-complexity.csv
 D .claude/skills/bmad-create-architecture/data/project-types.csv
 D .claude/skills/bmad-create-architecture/steps/step-01-init.md
 D .claude/skills/bmad-create-architecture/steps/step-01b-continue.md
 D .claude/skills/bmad-create-architecture/steps/step-02-context.md
 D .claude/skills/bmad-create-architecture/steps/step-03-starter.md
 D .claude/skills/bmad-create-architecture/steps/step-04-decisions.md
 D .claude/skills/bmad-create-architecture/steps/step-05-patterns.md
 D .claude/skills/bmad-create-architecture/steps/step-06-structure.md
 D .claude/skills/bmad-create-architecture/steps/step-07-validation.md
 D .claude/skills/bmad-create-architecture/steps/step-08-complete.md
 M .claude/skills/bmad-create-epics-and-stories/SKILL.md
 M .claude/skills/bmad-create-epics-and-stories/customize.toml
 M .claude/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md
 M .claude/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md
 M .claude/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md
 M .claude/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md
 M .claude/skills/bmad-create-epics-and-stories/templates/epics-template.md
 M .claude/skills/bmad-create-prd/SKILL.md
 M .claude/skills/bmad-create-prd/customize.toml
 M .claude/skills/bmad-create-story/SKILL.md
 M .claude/skills/bmad-create-story/checklist.md
 M .claude/skills/bmad-create-story/customize.toml
 M .claude/skills/bmad-create-story/discover-inputs.md
 M .claude/skills/bmad-create-story/template.md
 M .claude/skills/bmad-customize/SKILL.md
 M .claude/skills/bmad-customize/scripts/list_customizable_skills.py
 M .claude/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py
 M .claude/skills/bmad-dev-story/SKILL.md
 M .claude/skills/bmad-dev-story/checklist.md
 M .claude/skills/bmad-dev-story/customize.toml
 M .claude/skills/bmad-document-project/SKILL.md
 M .claude/skills/bmad-document-project/checklist.md
 M .claude/skills/bmad-document-project/customize.toml
 M .claude/skills/bmad-document-project/documentation-requirements.csv
 M .claude/skills/bmad-document-project/instructions.md
 M .claude/skills/bmad-document-project/templates/deep-dive-template.md
 M .claude/skills/bmad-document-project/templates/index-template.md
 M .claude/skills/bmad-document-project/templates/project-overview-template.md
 M .claude/skills/bmad-document-project/templates/project-scan-report-schema.json
 M .claude/skills/bmad-document-project/templates/source-tree-template.md
 M .claude/skills/bmad-document-project/workflows/deep-dive-instructions.md
 M .claude/skills/bmad-document-project/workflows/deep-dive-workflow.md
 M .claude/skills/bmad-document-project/workflows/full-scan-instructions.md
 M .claude/skills/bmad-document-project/workflows/full-scan-workflow.md
 M .claude/skills/bmad-domain-research/SKILL.md
 M .claude/skills/bmad-domain-research/customize.toml
 M .claude/skills/bmad-domain-research/domain-steps/step-01-init.md
 M .claude/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md
 M .claude/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md
 M .claude/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md
 M .claude/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md
 M .claude/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md
 M .claude/skills/bmad-domain-research/research.template.md
 M .claude/skills/bmad-edit-prd/SKILL.md
 M .claude/skills/bmad-edit-prd/customize.toml
 M .claude/skills/bmad-editorial-review-prose/SKILL.md
 M .claude/skills/bmad-editorial-review-structure/SKILL.md
 M .claude/skills/bmad-generate-project-context/SKILL.md
 M .claude/skills/bmad-generate-project-context/customize.toml
 M .claude/skills/bmad-generate-project-context/project-context-template.md
 M .claude/skills/bmad-generate-project-context/steps/step-01-discover.md
 M .claude/skills/bmad-generate-project-context/steps/step-02-generate.md
 M .claude/skills/bmad-generate-project-context/steps/step-03-complete.md
 M .claude/skills/bmad-help/SKILL.md
 M .claude/skills/bmad-index-docs/SKILL.md
 D .claude/skills/bmad-investigate/SKILL.md
 D .claude/skills/bmad-investigate/customize.toml
 D .claude/skills/bmad-investigate/references/case-file-template.md
 M .claude/skills/bmad-market-research/SKILL.md
 M .claude/skills/bmad-market-research/customize.toml
 M .claude/skills/bmad-market-research/research.template.md
 M .claude/skills/bmad-market-research/steps/step-01-init.md
 M .claude/skills/bmad-market-research/steps/step-02-customer-behavior.md
 M .claude/skills/bmad-market-research/steps/step-03-customer-pain-points.md
 M .claude/skills/bmad-market-research/steps/step-04-customer-decisions.md
 M .claude/skills/bmad-market-research/steps/step-05-competitive-analysis.md
 M .claude/skills/bmad-market-research/steps/step-06-research-completion.md
 M .claude/skills/bmad-party-mode/SKILL.md
 M .claude/skills/bmad-prd/SKILL.md
 M .claude/skills/bmad-prd/assets/headless-schemas.md
 M .claude/skills/bmad-prd/assets/prd-template.md
 M .claude/skills/bmad-prd/assets/prd-validation-checklist.md
 M .claude/skills/bmad-prd/assets/validation-report-template.html
 M .claude/skills/bmad-prd/customize.toml
 M .claude/skills/bmad-prd/references/headless.md
 M .claude/skills/bmad-prd/references/validate.md
 M .claude/skills/bmad-prfaq/SKILL.md
 M .claude/skills/bmad-prfaq/agents/artifact-analyzer.md
 M .claude/skills/bmad-prfaq/agents/web-researcher.md
 M .claude/skills/bmad-prfaq/assets/prfaq-template.md
 M .claude/skills/bmad-prfaq/bmad-manifest.json
 M .claude/skills/bmad-prfaq/customize.toml
 M .claude/skills/bmad-prfaq/references/customer-faq.md
 M .claude/skills/bmad-prfaq/references/internal-faq.md
 M .claude/skills/bmad-prfaq/references/press-release.md
 M .claude/skills/bmad-prfaq/references/verdict.md
 M .claude/skills/bmad-product-brief/SKILL.md
 M .claude/skills/bmad-product-brief/assets/brief-template.md
 M .claude/skills/bmad-product-brief/customize.toml
 M .claude/skills/bmad-qa-generate-e2e-tests/SKILL.md
 M .claude/skills/bmad-qa-generate-e2e-tests/checklist.md
 M .claude/skills/bmad-qa-generate-e2e-tests/customize.toml
 M .claude/skills/bmad-quick-dev/SKILL.md
 M .claude/skills/bmad-quick-dev/compile-epic-context.md
 M .claude/skills/bmad-quick-dev/customize.toml
 M .claude/skills/bmad-quick-dev/spec-template.md
 M .claude/skills/bmad-quick-dev/step-01-clarify-and-route.md
 M .claude/skills/bmad-quick-dev/step-02-plan.md
 M .claude/skills/bmad-quick-dev/step-03-implement.md
 M .claude/skills/bmad-quick-dev/step-04-review.md
 M .claude/skills/bmad-quick-dev/step-05-present.md
 M .claude/skills/bmad-quick-dev/step-oneshot.md
 M .claude/skills/bmad-quick-dev/sync-sprint-status.md
 M .claude/skills/bmad-retrospective/SKILL.md
 M .claude/skills/bmad-retrospective/customize.toml
 M .claude/skills/bmad-review-adversarial-general/SKILL.md
 M .claude/skills/bmad-review-edge-case-hunter/SKILL.md
 M .claude/skills/bmad-shard-doc/SKILL.md
 M .claude/skills/bmad-spec/SKILL.md
 M .claude/skills/bmad-spec/assets/headless-schemas.md
 M .claude/skills/bmad-spec/assets/spec-template.md
 M .claude/skills/bmad-spec/customize.toml
 M .claude/skills/bmad-sprint-planning/SKILL.md
 M .claude/skills/bmad-sprint-planning/checklist.md
 M .claude/skills/bmad-sprint-planning/customize.toml
 M .claude/skills/bmad-sprint-planning/sprint-status-template.yaml
 M .claude/skills/bmad-sprint-status/SKILL.md
 M .claude/skills/bmad-sprint-status/customize.toml
 M .claude/skills/bmad-story-automator/data/monitoring-fallback.md
 M .claude/skills/bmad-story-automator/data/orchestration-policy.json
 M .claude/skills/bmad-story-automator/data/prompts/auto.md
 M .claude/skills/bmad-story-automator/data/prompts/create.md
 M .claude/skills/bmad-story-automator/data/prompts/dev.md
 M .claude/skills/bmad-story-automator/data/prompts/review.md
 M .claude/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py
 M .claude/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py
 M .claude/skills/bmad-story-automator/src/story_automator/commands/tmux.py
 M .claude/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py
 M .claude/skills/bmad-story-automator/src/story_automator/core/story_keys.py
 M .claude/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py
 M .claude/skills/bmad-story-automator/src/story_automator/core/utils.py
 M .claude/skills/bmad-story-automator/steps-c/step-01b-continue.md
 M .claude/skills/bmad-tea/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-technical-research/SKILL.md
 M .claude/skills/bmad-technical-research/customize.toml
 M .claude/skills/bmad-technical-research/research.template.md
 M .claude/skills/bmad-technical-research/technical-steps/step-01-init.md
 M .claude/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md
 M .claude/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md
 M .claude/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md
 M .claude/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md
 M .claude/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md
 M .claude/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md
 M .claude/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md
 M .claude/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md
 M .claude/skills/bmad-ux/SKILL.md
 M .claude/skills/bmad-ux/assets/color-themes.md
 M .claude/skills/bmad-ux/assets/design-directions.md
 M .claude/skills/bmad-ux/assets/design-example-editorial.md
 M .claude/skills/bmad-ux/assets/design-example-mobile.md
 M .claude/skills/bmad-ux/assets/design-example-shadcn.md
 M .claude/skills/bmad-ux/assets/excalidraw-wireframe.md
 M .claude/skills/bmad-ux/assets/experience-example-mobile.md
 M .claude/skills/bmad-ux/assets/experience-example-shadcn.md
 M .claude/skills/bmad-ux/assets/headless-schemas.md
 M .claude/skills/bmad-ux/assets/key-screens.md
 M .claude/skills/bmad-ux/assets/validation-report-template.html
 M .claude/skills/bmad-ux/customize.toml
 M .claude/skills/bmad-ux/references/creative-tools.md
 M .claude/skills/bmad-ux/references/design-md-spec.md
 M .claude/skills/bmad-ux/references/headless.md
 M .claude/skills/bmad-ux/references/validate.md
 M .claude/skills/bmad-validate-prd/SKILL.md
 M .claude/skills/bmad-validate-prd/customize.toml
 M .gitignore
 D .opencode/commands/bmad-investigate.md
 M .qwen/skills/bmad-advanced-elicitation/SKILL.md
 M .qwen/skills/bmad-advanced-elicitation/methods.csv
 M .qwen/skills/bmad-agent-analyst/SKILL.md
 M .qwen/skills/bmad-agent-analyst/customize.toml
 M .qwen/skills/bmad-agent-architect/SKILL.md
 M .qwen/skills/bmad-agent-architect/customize.toml
 M .qwen/skills/bmad-agent-dev/SKILL.md
 M .qwen/skills/bmad-agent-dev/customize.toml
 M .qwen/skills/bmad-agent-pm/SKILL.md
 M .qwen/skills/bmad-agent-pm/customize.toml
 M .qwen/skills/bmad-agent-tech-writer/SKILL.md
 M .qwen/skills/bmad-agent-tech-writer/customize.toml
 M .qwen/skills/bmad-agent-tech-writer/explain-concept.md
 M .qwen/skills/bmad-agent-tech-writer/mermaid-gen.md
 M .qwen/skills/bmad-agent-tech-writer/validate-doc.md
 M .qwen/skills/bmad-agent-tech-writer/write-document.md
 M .qwen/skills/bmad-agent-ux-designer/SKILL.md
 M .qwen/skills/bmad-agent-ux-designer/customize.toml
 M .qwen/skills/bmad-brainstorming/SKILL.md
 D .qwen/skills/bmad-brainstorming/brain-methods.csv
 D .qwen/skills/bmad-brainstorming/steps/step-01-session-setup.md
 D .qwen/skills/bmad-brainstorming/steps/step-01b-continue.md
 D .qwen/skills/bmad-brainstorming/steps/step-02a-user-selected.md
 D .qwen/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md
 D .qwen/skills/bmad-brainstorming/steps/step-02c-random-selection.md
 D .qwen/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md
 D .qwen/skills/bmad-brainstorming/steps/step-03-technique-execution.md
 D .qwen/skills/bmad-brainstorming/steps/step-04-idea-organization.md
 D .qwen/skills/bmad-brainstorming/template.md
 D .qwen/skills/bmad-brainstorming/workflow.md
 M .qwen/skills/bmad-check-implementation-readiness/SKILL.md
 M .qwen/skills/bmad-check-implementation-readiness/customize.toml
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md
 M .qwen/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md
 M .qwen/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md
 M .qwen/skills/bmad-checkpoint-preview/SKILL.md
 M .qwen/skills/bmad-checkpoint-preview/customize.toml
 M .qwen/skills/bmad-checkpoint-preview/generate-trail.md
 M .qwen/skills/bmad-checkpoint-preview/step-01-orientation.md
 M .qwen/skills/bmad-checkpoint-preview/step-02-walkthrough.md
 M .qwen/skills/bmad-checkpoint-preview/step-03-detail-pass.md
 M .qwen/skills/bmad-checkpoint-preview/step-04-testing.md
 M .qwen/skills/bmad-checkpoint-preview/step-05-wrapup.md
 M .qwen/skills/bmad-code-review/SKILL.md
 M .qwen/skills/bmad-code-review/customize.toml
 M .qwen/skills/bmad-code-review/steps/step-01-gather-context.md
 M .qwen/skills/bmad-code-review/steps/step-02-review.md
 M .qwen/skills/bmad-code-review/steps/step-03-triage.md
 M .qwen/skills/bmad-code-review/steps/step-04-present.md
 M .qwen/skills/bmad-correct-course/SKILL.md
 M .qwen/skills/bmad-correct-course/checklist.md
 M .qwen/skills/bmad-correct-course/customize.toml
 M .qwen/skills/bmad-create-architecture/SKILL.md
 D .qwen/skills/bmad-create-architecture/architecture-decision-template.md
 M .qwen/skills/bmad-create-architecture/customize.toml
 D .qwen/skills/bmad-create-architecture/data/domain-complexity.csv
 D .qwen/skills/bmad-create-architecture/data/project-types.csv
 D .qwen/skills/bmad-create-architecture/steps/step-01-init.md
 D .qwen/skills/bmad-create-architecture/steps/step-01b-continue.md
 D .qwen/skills/bmad-create-architecture/steps/step-02-context.md
 D .qwen/skills/bmad-create-architecture/steps/step-03-starter.md
 D .qwen/skills/bmad-create-architecture/steps/step-04-decisions.md
 D .qwen/skills/bmad-create-architecture/steps/step-05-patterns.md
 D .qwen/skills/bmad-create-architecture/steps/step-06-structure.md
 D .qwen/skills/bmad-create-architecture/steps/step-07-validation.md
 D .qwen/skills/bmad-create-architecture/steps/step-08-complete.md
 M .qwen/skills/bmad-create-epics-and-stories/SKILL.md
 M .qwen/skills/bmad-create-epics-and-stories/customize.toml
 M .qwen/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md
 M .qwen/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md
 M .qwen/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md
 M .qwen/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md
 M .qwen/skills/bmad-create-epics-and-stories/templates/epics-template.md
 M .qwen/skills/bmad-create-prd/SKILL.md
 M .qwen/skills/bmad-create-prd/customize.toml
 M .qwen/skills/bmad-create-story/SKILL.md
 M .qwen/skills/bmad-create-story/checklist.md
 M .qwen/skills/bmad-create-story/customize.toml
 M .qwen/skills/bmad-create-story/discover-inputs.md
 M .qwen/skills/bmad-create-story/template.md
 M .qwen/skills/bmad-customize/SKILL.md
 M .qwen/skills/bmad-customize/scripts/list_customizable_skills.py
 M .qwen/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py
 M .qwen/skills/bmad-dev-story/SKILL.md
 M .qwen/skills/bmad-dev-story/checklist.md
 M .qwen/skills/bmad-dev-story/customize.toml
 M .qwen/skills/bmad-document-project/SKILL.md
 M .qwen/skills/bmad-document-project/checklist.md
 M .qwen/skills/bmad-document-project/customize.toml
 M .qwen/skills/bmad-document-project/documentation-requirements.csv
 M .qwen/skills/bmad-document-project/instructions.md
 M .qwen/skills/bmad-document-project/templates/deep-dive-template.md
 M .qwen/skills/bmad-document-project/templates/index-template.md
 M .qwen/skills/bmad-document-project/templates/project-overview-template.md
 M .qwen/skills/bmad-document-project/templates/project-scan-report-schema.json
 M .qwen/skills/bmad-document-project/templates/source-tree-template.md
 M .qwen/skills/bmad-document-project/workflows/deep-dive-instructions.md
 M .qwen/skills/bmad-document-project/workflows/deep-dive-workflow.md
 M .qwen/skills/bmad-document-project/workflows/full-scan-instructions.md
 M .qwen/skills/bmad-document-project/workflows/full-scan-workflow.md
 M .qwen/skills/bmad-domain-research/SKILL.md
 M .qwen/skills/bmad-domain-research/customize.toml
 M .qwen/skills/bmad-domain-research/domain-steps/step-01-init.md
 M .qwen/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md
 M .qwen/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md
 M .qwen/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md
 M .qwen/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md
 M .qwen/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md
 M .qwen/skills/bmad-domain-research/research.template.md
 M .qwen/skills/bmad-edit-prd/SKILL.md
 M .qwen/skills/bmad-edit-prd/customize.toml
 M .qwen/skills/bmad-editorial-review-prose/SKILL.md
 M .qwen/skills/bmad-editorial-review-structure/SKILL.md
 M .qwen/skills/bmad-generate-project-context/SKILL.md
 M .qwen/skills/bmad-generate-project-context/customize.toml
 M .qwen/skills/bmad-generate-project-context/project-context-template.md
 M .qwen/skills/bmad-generate-project-context/steps/step-01-discover.md
 M .qwen/skills/bmad-generate-project-context/steps/step-02-generate.md
 M .qwen/skills/bmad-generate-project-context/steps/step-03-complete.md
 M .qwen/skills/bmad-help/SKILL.md
 M .qwen/skills/bmad-index-docs/SKILL.md
 D .qwen/skills/bmad-investigate/SKILL.md
 D .qwen/skills/bmad-investigate/customize.toml
 D .qwen/skills/bmad-investigate/references/case-file-template.md
 M .qwen/skills/bmad-market-research/SKILL.md
 M .qwen/skills/bmad-market-research/customize.toml
 M .qwen/skills/bmad-market-research/research.template.md
 M .qwen/skills/bmad-market-research/steps/step-01-init.md
 M .qwen/skills/bmad-market-research/steps/step-02-customer-behavior.md
 M .qwen/skills/bmad-market-research/steps/step-03-customer-pain-points.md
 M .qwen/skills/bmad-market-research/steps/step-04-customer-decisions.md
 M .qwen/skills/bmad-market-research/steps/step-05-competitive-analysis.md
 M .qwen/skills/bmad-market-research/steps/step-06-research-completion.md
 M .qwen/skills/bmad-party-mode/SKILL.md
 M .qwen/skills/bmad-prd/SKILL.md
 M .qwen/skills/bmad-prd/assets/headless-schemas.md
 M .qwen/skills/bmad-prd/assets/prd-template.md
 M .qwen/skills/bmad-prd/assets/prd-validation-checklist.md
 M .qwen/skills/bmad-prd/assets/validation-report-template.html
 M .qwen/skills/bmad-prd/customize.toml
 M .qwen/skills/bmad-prd/references/headless.md
 M .qwen/skills/bmad-prd/references/validate.md
 M .qwen/skills/bmad-prfaq/SKILL.md
 M .qwen/skills/bmad-prfaq/agents/artifact-analyzer.md
 M .qwen/skills/bmad-prfaq/agents/web-researcher.md
 M .qwen/skills/bmad-prfaq/assets/prfaq-template.md
 M .qwen/skills/bmad-prfaq/bmad-manifest.json
 M .qwen/skills/bmad-prfaq/customize.toml
 M .qwen/skills/bmad-prfaq/references/customer-faq.md
 M .qwen/skills/bmad-prfaq/references/internal-faq.md
 M .qwen/skills/bmad-prfaq/references/press-release.md
 M .qwen/skills/bmad-prfaq/references/verdict.md
 M .qwen/skills/bmad-product-brief/SKILL.md
 M .qwen/skills/bmad-product-brief/assets/brief-template.md
 M .qwen/skills/bmad-product-brief/customize.toml
 M .qwen/skills/bmad-qa-generate-e2e-tests/SKILL.md
 M .qwen/skills/bmad-qa-generate-e2e-tests/checklist.md
 M .qwen/skills/bmad-qa-generate-e2e-tests/customize.toml
 M .qwen/skills/bmad-quick-dev/SKILL.md
 M .qwen/skills/bmad-quick-dev/compile-epic-context.md
 M .qwen/skills/bmad-quick-dev/customize.toml
 M .qwen/skills/bmad-quick-dev/spec-template.md
 M .qwen/skills/bmad-quick-dev/step-01-clarify-and-route.md
 M .qwen/skills/bmad-quick-dev/step-02-plan.md
 M .qwen/skills/bmad-quick-dev/step-03-implement.md
 M .qwen/skills/bmad-quick-dev/step-04-review.md
 M .qwen/skills/bmad-quick-dev/step-05-present.md
 M .qwen/skills/bmad-quick-dev/step-oneshot.md
 M .qwen/skills/bmad-quick-dev/sync-sprint-status.md
 M .qwen/skills/bmad-retrospective/SKILL.md
 M .qwen/skills/bmad-retrospective/customize.toml
 M .qwen/skills/bmad-review-adversarial-general/SKILL.md
 M .qwen/skills/bmad-review-edge-case-hunter/SKILL.md
 M .qwen/skills/bmad-shard-doc/SKILL.md
 M .qwen/skills/bmad-spec/SKILL.md
 M .qwen/skills/bmad-spec/assets/headless-schemas.md
 M .qwen/skills/bmad-spec/assets/spec-template.md
 M .qwen/skills/bmad-spec/customize.toml
 M .qwen/skills/bmad-sprint-planning/SKILL.md
 M .qwen/skills/bmad-sprint-planning/checklist.md
 M .qwen/skills/bmad-sprint-planning/customize.toml
 M .qwen/skills/bmad-sprint-planning/sprint-status-template.yaml
 M .qwen/skills/bmad-sprint-status/SKILL.md
 M .qwen/skills/bmad-sprint-status/customize.toml
 M .qwen/skills/bmad-story-automator/data/monitoring-fallback.md
 M .qwen/skills/bmad-story-automator/data/orchestration-policy.json
 M .qwen/skills/bmad-story-automator/data/prompts/auto.md
 M .qwen/skills/bmad-story-automator/data/prompts/create.md
 M .qwen/skills/bmad-story-automator/data/prompts/dev.md
 M .qwen/skills/bmad-story-automator/data/prompts/review.md
 M .qwen/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py
 M .qwen/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py
 M .qwen/skills/bmad-story-automator/src/story_automator/commands/tmux.py
 M .qwen/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py
 M .qwen/skills/bmad-story-automator/src/story_automator/core/story_keys.py
 M .qwen/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py
 M .qwen/skills/bmad-story-automator/src/story_automator/core/utils.py
 M .qwen/skills/bmad-story-automator/steps-c/step-01b-continue.md
 M .qwen/skills/bmad-tea/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-technical-research/SKILL.md
 M .qwen/skills/bmad-technical-research/customize.toml
 M .qwen/skills/bmad-technical-research/research.template.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-01-init.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md
 M .qwen/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md
 M .qwen/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md
 M .qwen/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md
 M .qwen/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md
 M .qwen/skills/bmad-ux/SKILL.md
 M .qwen/skills/bmad-ux/assets/color-themes.md
 M .qwen/skills/bmad-ux/assets/design-directions.md
 M .qwen/skills/bmad-ux/assets/design-example-editorial.md
 M .qwen/skills/bmad-ux/assets/design-example-mobile.md
 M .qwen/skills/bmad-ux/assets/design-example-shadcn.md
 M .qwen/skills/bmad-ux/assets/excalidraw-wireframe.md
 M .qwen/skills/bmad-ux/assets/experience-example-mobile.md
 M .qwen/skills/bmad-ux/assets/experience-example-shadcn.md
 M .qwen/skills/bmad-ux/assets/headless-schemas.md
 M .qwen/skills/bmad-ux/assets/key-screens.md
 M .qwen/skills/bmad-ux/assets/validation-report-template.html
 M .qwen/skills/bmad-ux/customize.toml
 M .qwen/skills/bmad-ux/references/creative-tools.md
 M .qwen/skills/bmad-ux/references/design-md-spec.md
 M .qwen/skills/bmad-ux/references/headless.md
 M .qwen/skills/bmad-ux/references/validate.md
 M .qwen/skills/bmad-validate-prd/SKILL.md
 M .qwen/skills/bmad-validate-prd/customize.toml
 M _bmad/_config/bmad-help.csv
 M _bmad/_config/files-manifest.csv
 M _bmad/_config/manifest.yaml
 M _bmad/_config/skill-manifest.csv
 M _bmad/automator/config.yaml
 M _bmad/bmb/config.yaml
 M _bmad/bmm/config.yaml
 M _bmad/bmm/module-help.csv
 M _bmad/cis/config.yaml
 M _bmad/config.toml
 M _bmad/config.user.toml
 M _bmad/core/config.yaml
 M _bmad/core/module-help.csv
 M _bmad/gds/config.yaml
 M _bmad/scripts/resolve_config.py
 M _bmad/scripts/resolve_customization.py
 D _bmad/scripts/tests/test_resolve_customization.py
 M _bmad/tea/config.yaml
 M _bmad/wds/config.yaml
 M _bmad/wds/data/presentations/freya-intro.md
 M _bmad/wds/data/presentations/saga-intro.md
?? .bmad-loop/
?? "26-07-22 Beredskap101 Stabilization and Production-Readiness Plan.md"
?? docs/AUDIT_AND_REMEDIATION_STATUS_2026-07-22.md
?? plan.md
?? pyproject.toml


### npm audit (low)

Command: npm audit --audit-level=low
Result: Completed in 00:00:09.3674454 with exit code 1.

Log:
# npm audit report

body-parser  2.0.0 - 2.2.2
body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement - https://github.com/advisories/GHSA-v422-hmwv-36x6
fix available via `npm audit fix`
node_modules/body-parser

brace-expansion  2.0.0 - 2.1.1 || 3.0.0 - 5.0.6
Severity: high
brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups - https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups - https://github.com/advisories/GHSA-3jxr-9vmj-r5cp
fix available via `npm audit fix`
node_modules/brace-expansion
node_modules/filelist/node_modules/brace-expansion

fast-uri  3.0.0 - 3.1.3
Severity: high
fast-uri vulnerable to host confusion via failed IDN canonicalization - https://github.com/advisories/GHSA-4c8g-83qw-93j6
fast-uri vulnerable to host confusion via literal backslash authority delimiter - https://github.com/advisories/GHSA-v2hh-gcrm-f6hx
fix available via `npm audit fix`
node_modules/fast-uri

3 vulnerabilities (1 low, 2 high)

To address all issues, run:
  npm audit fix

### Git State

SHA: 206e858dc46f26d2d79e2d4ee6001312192a21fe
Branch: main
Status:  M .agent/skills/bmad-advanced-elicitation/SKILL.md  M .agent/skills/bmad-advanced-elicitation/methods.csv  M .agent/skills/bmad-agent-analyst/SKILL.md  M .agent/skills/bmad-agent-analyst/customize.toml  M .agent/skills/bmad-agent-architect/SKILL.md  M .agent/skills/bmad-agent-architect/customize.toml  M .agent/skills/bmad-agent-dev/SKILL.md  M .agent/skills/bmad-agent-dev/customize.toml  M .agent/skills/bmad-agent-pm/SKILL.md  M .agent/skills/bmad-agent-pm/customize.toml  M .agent/skills/bmad-agent-tech-writer/SKILL.md  M .agent/skills/bmad-agent-tech-writer/customize.toml  M .agent/skills/bmad-agent-tech-writer/explain-concept.md  M .agent/skills/bmad-agent-tech-writer/mermaid-gen.md  M .agent/skills/bmad-agent-tech-writer/validate-doc.md  M .agent/skills/bmad-agent-tech-writer/write-document.md  M .agent/skills/bmad-agent-ux-designer/SKILL.md  M .agent/skills/bmad-agent-ux-designer/customize.toml  M .agent/skills/bmad-brainstorming/SKILL.md  D .agent/skills/bmad-brainstorming/brain-methods.csv  D .agent/skills/bmad-brainstorming/steps/step-01-session-setup.md  D .agent/skills/bmad-brainstorming/steps/step-01b-continue.md  D .agent/skills/bmad-brainstorming/steps/step-02a-user-selected.md  D .agent/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  D .agent/skills/bmad-brainstorming/steps/step-02c-random-selection.md  D .agent/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md  D .agent/skills/bmad-brainstorming/steps/step-03-technique-execution.md  D .agent/skills/bmad-brainstorming/steps/step-04-idea-organization.md  D .agent/skills/bmad-brainstorming/template.md  D .agent/skills/bmad-brainstorming/workflow.md  M .agent/skills/bmad-check-implementation-readiness/SKILL.md  M .agent/skills/bmad-check-implementation-readiness/customize.toml  M .agent/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md  M .agent/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md  M .agent/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md  M .agent/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md  M .agent/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md  M .agent/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md  M .agent/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md  M .agent/skills/bmad-checkpoint-preview/SKILL.md  M .agent/skills/bmad-checkpoint-preview/customize.toml  M .agent/skills/bmad-checkpoint-preview/generate-trail.md  M .agent/skills/bmad-checkpoint-preview/step-01-orientation.md  M .agent/skills/bmad-checkpoint-preview/step-02-walkthrough.md  M .agent/skills/bmad-checkpoint-preview/step-03-detail-pass.md  M .agent/skills/bmad-checkpoint-preview/step-04-testing.md  M .agent/skills/bmad-checkpoint-preview/step-05-wrapup.md  M .agent/skills/bmad-code-review/SKILL.md  M .agent/skills/bmad-code-review/customize.toml  M .agent/skills/bmad-code-review/steps/step-01-gather-context.md  M .agent/skills/bmad-code-review/steps/step-02-review.md  M .agent/skills/bmad-code-review/steps/step-03-triage.md  M .agent/skills/bmad-code-review/steps/step-04-present.md  M .agent/skills/bmad-correct-course/SKILL.md  M .agent/skills/bmad-correct-course/checklist.md  M .agent/skills/bmad-correct-course/customize.toml  M .agent/skills/bmad-create-architecture/SKILL.md  D .agent/skills/bmad-create-architecture/architecture-decision-template.md  M .agent/skills/bmad-create-architecture/customize.toml  D .agent/skills/bmad-create-architecture/data/domain-complexity.csv  D .agent/skills/bmad-create-architecture/data/project-types.csv  D .agent/skills/bmad-create-architecture/steps/step-01-init.md  D .agent/skills/bmad-create-architecture/steps/step-01b-continue.md  D .agent/skills/bmad-create-architecture/steps/step-02-context.md  D .agent/skills/bmad-create-architecture/steps/step-03-starter.md  D .agent/skills/bmad-create-architecture/steps/step-04-decisions.md  D .agent/skills/bmad-create-architecture/steps/step-05-patterns.md  D .agent/skills/bmad-create-architecture/steps/step-06-structure.md  D .agent/skills/bmad-create-architecture/steps/step-07-validation.md  D .agent/skills/bmad-create-architecture/steps/step-08-complete.md  M .agent/skills/bmad-create-epics-and-stories/SKILL.md  M .agent/skills/bmad-create-epics-and-stories/customize.toml  M .agent/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md  M .agent/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md  M .agent/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md  M .agent/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md  M .agent/skills/bmad-create-epics-and-stories/templates/epics-template.md  M .agent/skills/bmad-create-prd/SKILL.md  M .agent/skills/bmad-create-prd/customize.toml  M .agent/skills/bmad-create-story/SKILL.md  M .agent/skills/bmad-create-story/checklist.md  M .agent/skills/bmad-create-story/customize.toml  M .agent/skills/bmad-create-story/discover-inputs.md  M .agent/skills/bmad-create-story/template.md  M .agent/skills/bmad-customize/SKILL.md  M .agent/skills/bmad-customize/scripts/list_customizable_skills.py  M .agent/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py  M .agent/skills/bmad-dev-story/SKILL.md  M .agent/skills/bmad-dev-story/checklist.md  M .agent/skills/bmad-dev-story/customize.toml  M .agent/skills/bmad-document-project/SKILL.md  M .agent/skills/bmad-document-project/checklist.md  M .agent/skills/bmad-document-project/customize.toml  M .agent/skills/bmad-document-project/documentation-requirements.csv  M .agent/skills/bmad-document-project/instructions.md  M .agent/skills/bmad-document-project/templates/deep-dive-template.md  M .agent/skills/bmad-document-project/templates/index-template.md  M .agent/skills/bmad-document-project/templates/project-overview-template.md  M .agent/skills/bmad-document-project/templates/project-scan-report-schema.json  M .agent/skills/bmad-document-project/templates/source-tree-template.md  M .agent/skills/bmad-document-project/workflows/deep-dive-instructions.md  M .agent/skills/bmad-document-project/workflows/deep-dive-workflow.md  M .agent/skills/bmad-document-project/workflows/full-scan-instructions.md  M .agent/skills/bmad-document-project/workflows/full-scan-workflow.md  M .agent/skills/bmad-domain-research/SKILL.md  M .agent/skills/bmad-domain-research/customize.toml  M .agent/skills/bmad-domain-research/domain-steps/step-01-init.md  M .agent/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md  M .agent/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md  M .agent/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md  M .agent/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md  M .agent/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md  M .agent/skills/bmad-domain-research/research.template.md  M .agent/skills/bmad-edit-prd/SKILL.md  M .agent/skills/bmad-edit-prd/customize.toml  M .agent/skills/bmad-editorial-review-prose/SKILL.md  M .agent/skills/bmad-editorial-review-structure/SKILL.md  M .agent/skills/bmad-generate-project-context/SKILL.md  M .agent/skills/bmad-generate-project-context/customize.toml  M .agent/skills/bmad-generate-project-context/project-context-template.md  M .agent/skills/bmad-generate-project-context/steps/step-01-discover.md  M .agent/skills/bmad-generate-project-context/steps/step-02-generate.md  M .agent/skills/bmad-generate-project-context/steps/step-03-complete.md  M .agent/skills/bmad-help/SKILL.md  M .agent/skills/bmad-index-docs/SKILL.md  D .agent/skills/bmad-investigate/SKILL.md  D .agent/skills/bmad-investigate/customize.toml  D .agent/skills/bmad-investigate/references/case-file-template.md  M .agent/skills/bmad-market-research/SKILL.md  M .agent/skills/bmad-market-research/customize.toml  M .agent/skills/bmad-market-research/research.template.md  M .agent/skills/bmad-market-research/steps/step-01-init.md  M .agent/skills/bmad-market-research/steps/step-02-customer-behavior.md  M .agent/skills/bmad-market-research/steps/step-03-customer-pain-points.md  M .agent/skills/bmad-market-research/steps/step-04-customer-decisions.md  M .agent/skills/bmad-market-research/steps/step-05-competitive-analysis.md  M .agent/skills/bmad-market-research/steps/step-06-research-completion.md  M .agent/skills/bmad-party-mode/SKILL.md  M .agent/skills/bmad-prd/SKILL.md  M .agent/skills/bmad-prd/assets/headless-schemas.md  M .agent/skills/bmad-prd/assets/prd-template.md  M .agent/skills/bmad-prd/assets/prd-validation-checklist.md  M .agent/skills/bmad-prd/assets/validation-report-template.html  M .agent/skills/bmad-prd/customize.toml  M .agent/skills/bmad-prd/references/headless.md  M .agent/skills/bmad-prd/references/validate.md  M .agent/skills/bmad-prfaq/SKILL.md  M .agent/skills/bmad-prfaq/agents/artifact-analyzer.md  M .agent/skills/bmad-prfaq/agents/web-researcher.md  M .agent/skills/bmad-prfaq/assets/prfaq-template.md  M .agent/skills/bmad-prfaq/bmad-manifest.json  M .agent/skills/bmad-prfaq/customize.toml  M .agent/skills/bmad-prfaq/references/customer-faq.md  M .agent/skills/bmad-prfaq/references/internal-faq.md  M .agent/skills/bmad-prfaq/references/press-release.md  M .agent/skills/bmad-prfaq/references/verdict.md  M .agent/skills/bmad-product-brief/SKILL.md  M .agent/skills/bmad-product-brief/assets/brief-template.md  M .agent/skills/bmad-product-brief/customize.toml  M .agent/skills/bmad-qa-generate-e2e-tests/SKILL.md  M .agent/skills/bmad-qa-generate-e2e-tests/checklist.md  M .agent/skills/bmad-qa-generate-e2e-tests/customize.toml  M .agent/skills/bmad-quick-dev/SKILL.md  M .agent/skills/bmad-quick-dev/compile-epic-context.md  M .agent/skills/bmad-quick-dev/customize.toml  M .agent/skills/bmad-quick-dev/spec-template.md  M .agent/skills/bmad-quick-dev/step-01-clarify-and-route.md  M .agent/skills/bmad-quick-dev/step-02-plan.md  M .agent/skills/bmad-quick-dev/step-03-implement.md  M .agent/skills/bmad-quick-dev/step-04-review.md  M .agent/skills/bmad-quick-dev/step-05-present.md  M .agent/skills/bmad-quick-dev/step-oneshot.md  M .agent/skills/bmad-quick-dev/sync-sprint-status.md  M .agent/skills/bmad-retrospective/SKILL.md  M .agent/skills/bmad-retrospective/customize.toml  M .agent/skills/bmad-review-adversarial-general/SKILL.md  M .agent/skills/bmad-review-edge-case-hunter/SKILL.md  M .agent/skills/bmad-shard-doc/SKILL.md  M .agent/skills/bmad-spec/SKILL.md  M .agent/skills/bmad-spec/assets/headless-schemas.md  M .agent/skills/bmad-spec/assets/spec-template.md  M .agent/skills/bmad-spec/customize.toml  M .agent/skills/bmad-sprint-planning/SKILL.md  M .agent/skills/bmad-sprint-planning/checklist.md  M .agent/skills/bmad-sprint-planning/customize.toml  M .agent/skills/bmad-sprint-planning/sprint-status-template.yaml  M .agent/skills/bmad-sprint-status/SKILL.md  M .agent/skills/bmad-sprint-status/customize.toml  M .agent/skills/bmad-story-automator/data/monitoring-fallback.md  M .agent/skills/bmad-story-automator/data/orchestration-policy.json  M .agent/skills/bmad-story-automator/data/prompts/auto.md  M .agent/skills/bmad-story-automator/data/prompts/create.md  M .agent/skills/bmad-story-automator/data/prompts/dev.md  M .agent/skills/bmad-story-automator/data/prompts/review.md  M .agent/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py  M .agent/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py  M .agent/skills/bmad-story-automator/src/story_automator/commands/tmux.py  M .agent/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py  M .agent/skills/bmad-story-automator/src/story_automator/core/story_keys.py  M .agent/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py  M .agent/skills/bmad-story-automator/src/story_automator/core/utils.py  M .agent/skills/bmad-story-automator/steps-c/step-01b-continue.md  M .agent/skills/bmad-tea/resources/knowledge/contract-testing.md  M .agent/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-technical-research/SKILL.md  M .agent/skills/bmad-technical-research/customize.toml  M .agent/skills/bmad-technical-research/research.template.md  M .agent/skills/bmad-technical-research/technical-steps/step-01-init.md  M .agent/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md  M .agent/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md  M .agent/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md  M .agent/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md  M .agent/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md  M .agent/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md  M .agent/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md  M .agent/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md  M .agent/skills/bmad-ux/SKILL.md  M .agent/skills/bmad-ux/assets/color-themes.md  M .agent/skills/bmad-ux/assets/design-directions.md  M .agent/skills/bmad-ux/assets/design-example-editorial.md  M .agent/skills/bmad-ux/assets/design-example-mobile.md  M .agent/skills/bmad-ux/assets/design-example-shadcn.md  M .agent/skills/bmad-ux/assets/excalidraw-wireframe.md  M .agent/skills/bmad-ux/assets/experience-example-mobile.md  M .agent/skills/bmad-ux/assets/experience-example-shadcn.md  M .agent/skills/bmad-ux/assets/headless-schemas.md  M .agent/skills/bmad-ux/assets/key-screens.md  M .agent/skills/bmad-ux/assets/validation-report-template.html  M .agent/skills/bmad-ux/customize.toml  M .agent/skills/bmad-ux/references/creative-tools.md  M .agent/skills/bmad-ux/references/design-md-spec.md  M .agent/skills/bmad-ux/references/headless.md  M .agent/skills/bmad-ux/references/validate.md  M .agent/skills/bmad-validate-prd/SKILL.md  M .agent/skills/bmad-validate-prd/customize.toml  M .agents/skills/bmad-advanced-elicitation/SKILL.md  M .agents/skills/bmad-advanced-elicitation/methods.csv  M .agents/skills/bmad-agent-analyst/SKILL.md  M .agents/skills/bmad-agent-analyst/customize.toml  M .agents/skills/bmad-agent-architect/SKILL.md  M .agents/skills/bmad-agent-architect/customize.toml  M .agents/skills/bmad-agent-dev/SKILL.md  M .agents/skills/bmad-agent-dev/customize.toml  M .agents/skills/bmad-agent-pm/SKILL.md  M .agents/skills/bmad-agent-pm/customize.toml  M .agents/skills/bmad-agent-tech-writer/SKILL.md  M .agents/skills/bmad-agent-tech-writer/customize.toml  M .agents/skills/bmad-agent-tech-writer/explain-concept.md  M .agents/skills/bmad-agent-tech-writer/mermaid-gen.md  M .agents/skills/bmad-agent-tech-writer/validate-doc.md  M .agents/skills/bmad-agent-tech-writer/write-document.md  M .agents/skills/bmad-agent-ux-designer/SKILL.md  M .agents/skills/bmad-agent-ux-designer/customize.toml  M .agents/skills/bmad-brainstorming/SKILL.md  D .agents/skills/bmad-brainstorming/brain-methods.csv  D .agents/skills/bmad-brainstorming/steps/step-01-session-setup.md  D .agents/skills/bmad-brainstorming/steps/step-01b-continue.md  D .agents/skills/bmad-brainstorming/steps/step-02a-user-selected.md  D .agents/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  D .agents/skills/bmad-brainstorming/steps/step-02c-random-selection.md  D .agents/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md  D .agents/skills/bmad-brainstorming/steps/step-03-technique-execution.md  D .agents/skills/bmad-brainstorming/steps/step-04-idea-organization.md  D .agents/skills/bmad-brainstorming/template.md  D .agents/skills/bmad-brainstorming/workflow.md  M .agents/skills/bmad-check-implementation-readiness/SKILL.md  M .agents/skills/bmad-check-implementation-readiness/customize.toml  M .agents/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md  M .agents/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md  M .agents/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md  M .agents/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md  M .agents/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md  M .agents/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md  M .agents/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md  M .agents/skills/bmad-checkpoint-preview/SKILL.md  M .agents/skills/bmad-checkpoint-preview/customize.toml  M .agents/skills/bmad-checkpoint-preview/generate-trail.md  M .agents/skills/bmad-checkpoint-preview/step-01-orientation.md  M .agents/skills/bmad-checkpoint-preview/step-02-walkthrough.md  M .agents/skills/bmad-checkpoint-preview/step-03-detail-pass.md  M .agents/skills/bmad-checkpoint-preview/step-04-testing.md  M .agents/skills/bmad-checkpoint-preview/step-05-wrapup.md  M .agents/skills/bmad-code-review/SKILL.md  M .agents/skills/bmad-code-review/customize.toml  M .agents/skills/bmad-code-review/steps/step-01-gather-context.md  M .agents/skills/bmad-code-review/steps/step-02-review.md  M .agents/skills/bmad-code-review/steps/step-03-triage.md  M .agents/skills/bmad-code-review/steps/step-04-present.md  M .agents/skills/bmad-correct-course/SKILL.md  M .agents/skills/bmad-correct-course/checklist.md  M .agents/skills/bmad-correct-course/customize.toml  M .agents/skills/bmad-create-architecture/SKILL.md  D .agents/skills/bmad-create-architecture/architecture-decision-template.md  M .agents/skills/bmad-create-architecture/customize.toml  D .agents/skills/bmad-create-architecture/data/domain-complexity.csv  D .agents/skills/bmad-create-architecture/data/project-types.csv  D .agents/skills/bmad-create-architecture/steps/step-01-init.md  D .agents/skills/bmad-create-architecture/steps/step-01b-continue.md  D .agents/skills/bmad-create-architecture/steps/step-02-context.md  D .agents/skills/bmad-create-architecture/steps/step-03-starter.md  D .agents/skills/bmad-create-architecture/steps/step-04-decisions.md  D .agents/skills/bmad-create-architecture/steps/step-05-patterns.md  D .agents/skills/bmad-create-architecture/steps/step-06-structure.md  D .agents/skills/bmad-create-architecture/steps/step-07-validation.md  D .agents/skills/bmad-create-architecture/steps/step-08-complete.md  M .agents/skills/bmad-create-epics-and-stories/SKILL.md  M .agents/skills/bmad-create-epics-and-stories/customize.toml  M .agents/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md  M .agents/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md  M .agents/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md  M .agents/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md  M .agents/skills/bmad-create-epics-and-stories/templates/epics-template.md  M .agents/skills/bmad-create-prd/SKILL.md  M .agents/skills/bmad-create-prd/customize.toml  M .agents/skills/bmad-create-story/SKILL.md  M .agents/skills/bmad-create-story/checklist.md  M .agents/skills/bmad-create-story/customize.toml  M .agents/skills/bmad-create-story/discover-inputs.md  M .agents/skills/bmad-create-story/template.md  M .agents/skills/bmad-customize/SKILL.md  M .agents/skills/bmad-customize/scripts/list_customizable_skills.py  M .agents/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py  M .agents/skills/bmad-dev-story/SKILL.md  M .agents/skills/bmad-dev-story/checklist.md  M .agents/skills/bmad-dev-story/customize.toml  M .agents/skills/bmad-document-project/SKILL.md  M .agents/skills/bmad-document-project/checklist.md  M .agents/skills/bmad-document-project/customize.toml  M .agents/skills/bmad-document-project/documentation-requirements.csv  M .agents/skills/bmad-document-project/instructions.md  M .agents/skills/bmad-document-project/templates/deep-dive-template.md  M .agents/skills/bmad-document-project/templates/index-template.md  M .agents/skills/bmad-document-project/templates/project-overview-template.md  M .agents/skills/bmad-document-project/templates/project-scan-report-schema.json  M .agents/skills/bmad-document-project/templates/source-tree-template.md  M .agents/skills/bmad-document-project/workflows/deep-dive-instructions.md  M .agents/skills/bmad-document-project/workflows/deep-dive-workflow.md  M .agents/skills/bmad-document-project/workflows/full-scan-instructions.md  M .agents/skills/bmad-document-project/workflows/full-scan-workflow.md  M .agents/skills/bmad-domain-research/SKILL.md  M .agents/skills/bmad-domain-research/customize.toml  M .agents/skills/bmad-domain-research/domain-steps/step-01-init.md  M .agents/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md  M .agents/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md  M .agents/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md  M .agents/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md  M .agents/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md  M .agents/skills/bmad-domain-research/research.template.md  M .agents/skills/bmad-edit-prd/SKILL.md  M .agents/skills/bmad-edit-prd/customize.toml  M .agents/skills/bmad-editorial-review-prose/SKILL.md  M .agents/skills/bmad-editorial-review-structure/SKILL.md  M .agents/skills/bmad-generate-project-context/SKILL.md  M .agents/skills/bmad-generate-project-context/customize.toml  M .agents/skills/bmad-generate-project-context/project-context-template.md  M .agents/skills/bmad-generate-project-context/steps/step-01-discover.md  M .agents/skills/bmad-generate-project-context/steps/step-02-generate.md  M .agents/skills/bmad-generate-project-context/steps/step-03-complete.md  M .agents/skills/bmad-help/SKILL.md  M .agents/skills/bmad-index-docs/SKILL.md  D .agents/skills/bmad-investigate/SKILL.md  D .agents/skills/bmad-investigate/customize.toml  D .agents/skills/bmad-investigate/references/case-file-template.md  M .agents/skills/bmad-market-research/SKILL.md  M .agents/skills/bmad-market-research/customize.toml  M .agents/skills/bmad-market-research/research.template.md  M .agents/skills/bmad-market-research/steps/step-01-init.md  M .agents/skills/bmad-market-research/steps/step-02-customer-behavior.md  M .agents/skills/bmad-market-research/steps/step-03-customer-pain-points.md  M .agents/skills/bmad-market-research/steps/step-04-customer-decisions.md  M .agents/skills/bmad-market-research/steps/step-05-competitive-analysis.md  M .agents/skills/bmad-market-research/steps/step-06-research-completion.md  M .agents/skills/bmad-party-mode/SKILL.md  M .agents/skills/bmad-prd/SKILL.md  M .agents/skills/bmad-prd/assets/headless-schemas.md  M .agents/skills/bmad-prd/assets/prd-template.md  M .agents/skills/bmad-prd/assets/prd-validation-checklist.md  M .agents/skills/bmad-prd/assets/validation-report-template.html  M .agents/skills/bmad-prd/customize.toml  M .agents/skills/bmad-prd/references/headless.md  M .agents/skills/bmad-prd/references/validate.md  M .agents/skills/bmad-prfaq/SKILL.md  M .agents/skills/bmad-prfaq/agents/artifact-analyzer.md  M .agents/skills/bmad-prfaq/agents/web-researcher.md  M .agents/skills/bmad-prfaq/assets/prfaq-template.md  M .agents/skills/bmad-prfaq/bmad-manifest.json  M .agents/skills/bmad-prfaq/customize.toml  M .agents/skills/bmad-prfaq/references/customer-faq.md  M .agents/skills/bmad-prfaq/references/internal-faq.md  M .agents/skills/bmad-prfaq/references/press-release.md  M .agents/skills/bmad-prfaq/references/verdict.md  M .agents/skills/bmad-product-brief/SKILL.md  M .agents/skills/bmad-product-brief/assets/brief-template.md  M .agents/skills/bmad-product-brief/customize.toml  M .agents/skills/bmad-qa-generate-e2e-tests/SKILL.md  M .agents/skills/bmad-qa-generate-e2e-tests/checklist.md  M .agents/skills/bmad-qa-generate-e2e-tests/customize.toml  M .agents/skills/bmad-quick-dev/SKILL.md  M .agents/skills/bmad-quick-dev/compile-epic-context.md  M .agents/skills/bmad-quick-dev/customize.toml  M .agents/skills/bmad-quick-dev/spec-template.md  M .agents/skills/bmad-quick-dev/step-01-clarify-and-route.md  M .agents/skills/bmad-quick-dev/step-02-plan.md  M .agents/skills/bmad-quick-dev/step-03-implement.md  M .agents/skills/bmad-quick-dev/step-04-review.md  M .agents/skills/bmad-quick-dev/step-05-present.md  M .agents/skills/bmad-quick-dev/step-oneshot.md  M .agents/skills/bmad-quick-dev/sync-sprint-status.md  M .agents/skills/bmad-retrospective/SKILL.md  M .agents/skills/bmad-retrospective/customize.toml  M .agents/skills/bmad-review-adversarial-general/SKILL.md  M .agents/skills/bmad-review-edge-case-hunter/SKILL.md  M .agents/skills/bmad-shard-doc/SKILL.md  M .agents/skills/bmad-spec/SKILL.md  M .agents/skills/bmad-spec/assets/headless-schemas.md  M .agents/skills/bmad-spec/assets/spec-template.md  M .agents/skills/bmad-spec/customize.toml  M .agents/skills/bmad-sprint-planning/SKILL.md  M .agents/skills/bmad-sprint-planning/checklist.md  M .agents/skills/bmad-sprint-planning/customize.toml  M .agents/skills/bmad-sprint-planning/sprint-status-template.yaml  M .agents/skills/bmad-sprint-status/SKILL.md  M .agents/skills/bmad-sprint-status/customize.toml  M .agents/skills/bmad-story-automator/data/monitoring-fallback.md  M .agents/skills/bmad-story-automator/data/orchestration-policy.json  M .agents/skills/bmad-story-automator/data/prompts/auto.md  M .agents/skills/bmad-story-automator/data/prompts/create.md  M .agents/skills/bmad-story-automator/data/prompts/dev.md  M .agents/skills/bmad-story-automator/data/prompts/review.md  M .agents/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py  M .agents/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py  M .agents/skills/bmad-story-automator/src/story_automator/commands/tmux.py  M .agents/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py  M .agents/skills/bmad-story-automator/src/story_automator/core/story_keys.py  M .agents/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py  M .agents/skills/bmad-story-automator/src/story_automator/core/utils.py  M .agents/skills/bmad-story-automator/steps-c/step-01b-continue.md  M .agents/skills/bmad-tea/resources/knowledge/contract-testing.md  M .agents/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-technical-research/SKILL.md  M .agents/skills/bmad-technical-research/customize.toml  M .agents/skills/bmad-technical-research/research.template.md  M .agents/skills/bmad-technical-research/technical-steps/step-01-init.md  M .agents/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md  M .agents/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md  M .agents/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md  M .agents/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md  M .agents/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md  M .agents/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md  M .agents/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md  M .agents/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md  M .agents/skills/bmad-ux/SKILL.md  M .agents/skills/bmad-ux/assets/color-themes.md  M .agents/skills/bmad-ux/assets/design-directions.md  M .agents/skills/bmad-ux/assets/design-example-editorial.md  M .agents/skills/bmad-ux/assets/design-example-mobile.md  M .agents/skills/bmad-ux/assets/design-example-shadcn.md  M .agents/skills/bmad-ux/assets/excalidraw-wireframe.md  M .agents/skills/bmad-ux/assets/experience-example-mobile.md  M .agents/skills/bmad-ux/assets/experience-example-shadcn.md  M .agents/skills/bmad-ux/assets/headless-schemas.md  M .agents/skills/bmad-ux/assets/key-screens.md  M .agents/skills/bmad-ux/assets/validation-report-template.html  M .agents/skills/bmad-ux/customize.toml  M .agents/skills/bmad-ux/references/creative-tools.md  M .agents/skills/bmad-ux/references/design-md-spec.md  M .agents/skills/bmad-ux/references/headless.md  M .agents/skills/bmad-ux/references/validate.md  M .agents/skills/bmad-validate-prd/SKILL.md  M .agents/skills/bmad-validate-prd/customize.toml  M .claude/skills/bmad-advanced-elicitation/SKILL.md  M .claude/skills/bmad-advanced-elicitation/methods.csv  M .claude/skills/bmad-agent-analyst/SKILL.md  M .claude/skills/bmad-agent-analyst/customize.toml  M .claude/skills/bmad-agent-architect/SKILL.md  M .claude/skills/bmad-agent-architect/customize.toml  M .claude/skills/bmad-agent-dev/SKILL.md  M .claude/skills/bmad-agent-dev/customize.toml  M .claude/skills/bmad-agent-pm/SKILL.md  M .claude/skills/bmad-agent-pm/customize.toml  M .claude/skills/bmad-agent-tech-writer/SKILL.md  M .claude/skills/bmad-agent-tech-writer/customize.toml  M .claude/skills/bmad-agent-tech-writer/explain-concept.md  M .claude/skills/bmad-agent-tech-writer/mermaid-gen.md  M .claude/skills/bmad-agent-tech-writer/validate-doc.md  M .claude/skills/bmad-agent-tech-writer/write-document.md  M .claude/skills/bmad-agent-ux-designer/SKILL.md  M .claude/skills/bmad-agent-ux-designer/customize.toml  M .claude/skills/bmad-brainstorming/SKILL.md  D .claude/skills/bmad-brainstorming/brain-methods.csv  D .claude/skills/bmad-brainstorming/steps/step-01-session-setup.md  D .claude/skills/bmad-brainstorming/steps/step-01b-continue.md  D .claude/skills/bmad-brainstorming/steps/step-02a-user-selected.md  D .claude/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  D .claude/skills/bmad-brainstorming/steps/step-02c-random-selection.md  D .claude/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md  D .claude/skills/bmad-brainstorming/steps/step-03-technique-execution.md  D .claude/skills/bmad-brainstorming/steps/step-04-idea-organization.md  D .claude/skills/bmad-brainstorming/template.md  D .claude/skills/bmad-brainstorming/workflow.md  M .claude/skills/bmad-check-implementation-readiness/SKILL.md  M .claude/skills/bmad-check-implementation-readiness/customize.toml  M .claude/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md  M .claude/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md  M .claude/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md  M .claude/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md  M .claude/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md  M .claude/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md  M .claude/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md  M .claude/skills/bmad-checkpoint-preview/SKILL.md  M .claude/skills/bmad-checkpoint-preview/customize.toml  M .claude/skills/bmad-checkpoint-preview/generate-trail.md  M .claude/skills/bmad-checkpoint-preview/step-01-orientation.md  M .claude/skills/bmad-checkpoint-preview/step-02-walkthrough.md  M .claude/skills/bmad-checkpoint-preview/step-03-detail-pass.md  M .claude/skills/bmad-checkpoint-preview/step-04-testing.md  M .claude/skills/bmad-checkpoint-preview/step-05-wrapup.md  M .claude/skills/bmad-code-review/SKILL.md  M .claude/skills/bmad-code-review/customize.toml  M .claude/skills/bmad-code-review/steps/step-01-gather-context.md  M .claude/skills/bmad-code-review/steps/step-02-review.md  M .claude/skills/bmad-code-review/steps/step-03-triage.md  M .claude/skills/bmad-code-review/steps/step-04-present.md  M .claude/skills/bmad-correct-course/SKILL.md  M .claude/skills/bmad-correct-course/checklist.md  M .claude/skills/bmad-correct-course/customize.toml  M .claude/skills/bmad-create-architecture/SKILL.md  D .claude/skills/bmad-create-architecture/architecture-decision-template.md  M .claude/skills/bmad-create-architecture/customize.toml  D .claude/skills/bmad-create-architecture/data/domain-complexity.csv  D .claude/skills/bmad-create-architecture/data/project-types.csv  D .claude/skills/bmad-create-architecture/steps/step-01-init.md  D .claude/skills/bmad-create-architecture/steps/step-01b-continue.md  D .claude/skills/bmad-create-architecture/steps/step-02-context.md  D .claude/skills/bmad-create-architecture/steps/step-03-starter.md  D .claude/skills/bmad-create-architecture/steps/step-04-decisions.md  D .claude/skills/bmad-create-architecture/steps/step-05-patterns.md  D .claude/skills/bmad-create-architecture/steps/step-06-structure.md  D .claude/skills/bmad-create-architecture/steps/step-07-validation.md  D .claude/skills/bmad-create-architecture/steps/step-08-complete.md  M .claude/skills/bmad-create-epics-and-stories/SKILL.md  M .claude/skills/bmad-create-epics-and-stories/customize.toml  M .claude/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md  M .claude/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md  M .claude/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md  M .claude/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md  M .claude/skills/bmad-create-epics-and-stories/templates/epics-template.md  M .claude/skills/bmad-create-prd/SKILL.md  M .claude/skills/bmad-create-prd/customize.toml  M .claude/skills/bmad-create-story/SKILL.md  M .claude/skills/bmad-create-story/checklist.md  M .claude/skills/bmad-create-story/customize.toml  M .claude/skills/bmad-create-story/discover-inputs.md  M .claude/skills/bmad-create-story/template.md  M .claude/skills/bmad-customize/SKILL.md  M .claude/skills/bmad-customize/scripts/list_customizable_skills.py  M .claude/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py  M .claude/skills/bmad-dev-story/SKILL.md  M .claude/skills/bmad-dev-story/checklist.md  M .claude/skills/bmad-dev-story/customize.toml  M .claude/skills/bmad-document-project/SKILL.md  M .claude/skills/bmad-document-project/checklist.md  M .claude/skills/bmad-document-project/customize.toml  M .claude/skills/bmad-document-project/documentation-requirements.csv  M .claude/skills/bmad-document-project/instructions.md  M .claude/skills/bmad-document-project/templates/deep-dive-template.md  M .claude/skills/bmad-document-project/templates/index-template.md  M .claude/skills/bmad-document-project/templates/project-overview-template.md  M .claude/skills/bmad-document-project/templates/project-scan-report-schema.json  M .claude/skills/bmad-document-project/templates/source-tree-template.md  M .claude/skills/bmad-document-project/workflows/deep-dive-instructions.md  M .claude/skills/bmad-document-project/workflows/deep-dive-workflow.md  M .claude/skills/bmad-document-project/workflows/full-scan-instructions.md  M .claude/skills/bmad-document-project/workflows/full-scan-workflow.md  M .claude/skills/bmad-domain-research/SKILL.md  M .claude/skills/bmad-domain-research/customize.toml  M .claude/skills/bmad-domain-research/domain-steps/step-01-init.md  M .claude/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md  M .claude/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md  M .claude/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md  M .claude/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md  M .claude/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md  M .claude/skills/bmad-domain-research/research.template.md  M .claude/skills/bmad-edit-prd/SKILL.md  M .claude/skills/bmad-edit-prd/customize.toml  M .claude/skills/bmad-editorial-review-prose/SKILL.md  M .claude/skills/bmad-editorial-review-structure/SKILL.md  M .claude/skills/bmad-generate-project-context/SKILL.md  M .claude/skills/bmad-generate-project-context/customize.toml  M .claude/skills/bmad-generate-project-context/project-context-template.md  M .claude/skills/bmad-generate-project-context/steps/step-01-discover.md  M .claude/skills/bmad-generate-project-context/steps/step-02-generate.md  M .claude/skills/bmad-generate-project-context/steps/step-03-complete.md  M .claude/skills/bmad-help/SKILL.md  M .claude/skills/bmad-index-docs/SKILL.md  D .claude/skills/bmad-investigate/SKILL.md  D .claude/skills/bmad-investigate/customize.toml  D .claude/skills/bmad-investigate/references/case-file-template.md  M .claude/skills/bmad-market-research/SKILL.md  M .claude/skills/bmad-market-research/customize.toml  M .claude/skills/bmad-market-research/research.template.md  M .claude/skills/bmad-market-research/steps/step-01-init.md  M .claude/skills/bmad-market-research/steps/step-02-customer-behavior.md  M .claude/skills/bmad-market-research/steps/step-03-customer-pain-points.md  M .claude/skills/bmad-market-research/steps/step-04-customer-decisions.md  M .claude/skills/bmad-market-research/steps/step-05-competitive-analysis.md  M .claude/skills/bmad-market-research/steps/step-06-research-completion.md  M .claude/skills/bmad-party-mode/SKILL.md  M .claude/skills/bmad-prd/SKILL.md  M .claude/skills/bmad-prd/assets/headless-schemas.md  M .claude/skills/bmad-prd/assets/prd-template.md  M .claude/skills/bmad-prd/assets/prd-validation-checklist.md  M .claude/skills/bmad-prd/assets/validation-report-template.html  M .claude/skills/bmad-prd/customize.toml  M .claude/skills/bmad-prd/references/headless.md  M .claude/skills/bmad-prd/references/validate.md  M .claude/skills/bmad-prfaq/SKILL.md  M .claude/skills/bmad-prfaq/agents/artifact-analyzer.md  M .claude/skills/bmad-prfaq/agents/web-researcher.md  M .claude/skills/bmad-prfaq/assets/prfaq-template.md  M .claude/skills/bmad-prfaq/bmad-manifest.json  M .claude/skills/bmad-prfaq/customize.toml  M .claude/skills/bmad-prfaq/references/customer-faq.md  M .claude/skills/bmad-prfaq/references/internal-faq.md  M .claude/skills/bmad-prfaq/references/press-release.md  M .claude/skills/bmad-prfaq/references/verdict.md  M .claude/skills/bmad-product-brief/SKILL.md  M .claude/skills/bmad-product-brief/assets/brief-template.md  M .claude/skills/bmad-product-brief/customize.toml  M .claude/skills/bmad-qa-generate-e2e-tests/SKILL.md  M .claude/skills/bmad-qa-generate-e2e-tests/checklist.md  M .claude/skills/bmad-qa-generate-e2e-tests/customize.toml  M .claude/skills/bmad-quick-dev/SKILL.md  M .claude/skills/bmad-quick-dev/compile-epic-context.md  M .claude/skills/bmad-quick-dev/customize.toml  M .claude/skills/bmad-quick-dev/spec-template.md  M .claude/skills/bmad-quick-dev/step-01-clarify-and-route.md  M .claude/skills/bmad-quick-dev/step-02-plan.md  M .claude/skills/bmad-quick-dev/step-03-implement.md  M .claude/skills/bmad-quick-dev/step-04-review.md  M .claude/skills/bmad-quick-dev/step-05-present.md  M .claude/skills/bmad-quick-dev/step-oneshot.md  M .claude/skills/bmad-quick-dev/sync-sprint-status.md  M .claude/skills/bmad-retrospective/SKILL.md  M .claude/skills/bmad-retrospective/customize.toml  M .claude/skills/bmad-review-adversarial-general/SKILL.md  M .claude/skills/bmad-review-edge-case-hunter/SKILL.md  M .claude/skills/bmad-shard-doc/SKILL.md  M .claude/skills/bmad-spec/SKILL.md  M .claude/skills/bmad-spec/assets/headless-schemas.md  M .claude/skills/bmad-spec/assets/spec-template.md  M .claude/skills/bmad-spec/customize.toml  M .claude/skills/bmad-sprint-planning/SKILL.md  M .claude/skills/bmad-sprint-planning/checklist.md  M .claude/skills/bmad-sprint-planning/customize.toml  M .claude/skills/bmad-sprint-planning/sprint-status-template.yaml  M .claude/skills/bmad-sprint-status/SKILL.md  M .claude/skills/bmad-sprint-status/customize.toml  M .claude/skills/bmad-story-automator/data/monitoring-fallback.md  M .claude/skills/bmad-story-automator/data/orchestration-policy.json  M .claude/skills/bmad-story-automator/data/prompts/auto.md  M .claude/skills/bmad-story-automator/data/prompts/create.md  M .claude/skills/bmad-story-automator/data/prompts/dev.md  M .claude/skills/bmad-story-automator/data/prompts/review.md  M .claude/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py  M .claude/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py  M .claude/skills/bmad-story-automator/src/story_automator/commands/tmux.py  M .claude/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py  M .claude/skills/bmad-story-automator/src/story_automator/core/story_keys.py  M .claude/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py  M .claude/skills/bmad-story-automator/src/story_automator/core/utils.py  M .claude/skills/bmad-story-automator/steps-c/step-01b-continue.md  M .claude/skills/bmad-tea/resources/knowledge/contract-testing.md  M .claude/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-technical-research/SKILL.md  M .claude/skills/bmad-technical-research/customize.toml  M .claude/skills/bmad-technical-research/research.template.md  M .claude/skills/bmad-technical-research/technical-steps/step-01-init.md  M .claude/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md  M .claude/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md  M .claude/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md  M .claude/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md  M .claude/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md  M .claude/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md  M .claude/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md  M .claude/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md  M .claude/skills/bmad-ux/SKILL.md  M .claude/skills/bmad-ux/assets/color-themes.md  M .claude/skills/bmad-ux/assets/design-directions.md  M .claude/skills/bmad-ux/assets/design-example-editorial.md  M .claude/skills/bmad-ux/assets/design-example-mobile.md  M .claude/skills/bmad-ux/assets/design-example-shadcn.md  M .claude/skills/bmad-ux/assets/excalidraw-wireframe.md  M .claude/skills/bmad-ux/assets/experience-example-mobile.md  M .claude/skills/bmad-ux/assets/experience-example-shadcn.md  M .claude/skills/bmad-ux/assets/headless-schemas.md  M .claude/skills/bmad-ux/assets/key-screens.md  M .claude/skills/bmad-ux/assets/validation-report-template.html  M .claude/skills/bmad-ux/customize.toml  M .claude/skills/bmad-ux/references/creative-tools.md  M .claude/skills/bmad-ux/references/design-md-spec.md  M .claude/skills/bmad-ux/references/headless.md  M .claude/skills/bmad-ux/references/validate.md  M .claude/skills/bmad-validate-prd/SKILL.md  M .claude/skills/bmad-validate-prd/customize.toml  M .gitignore  D .opencode/commands/bmad-investigate.md  M .qwen/skills/bmad-advanced-elicitation/SKILL.md  M .qwen/skills/bmad-advanced-elicitation/methods.csv  M .qwen/skills/bmad-agent-analyst/SKILL.md  M .qwen/skills/bmad-agent-analyst/customize.toml  M .qwen/skills/bmad-agent-architect/SKILL.md  M .qwen/skills/bmad-agent-architect/customize.toml  M .qwen/skills/bmad-agent-dev/SKILL.md  M .qwen/skills/bmad-agent-dev/customize.toml  M .qwen/skills/bmad-agent-pm/SKILL.md  M .qwen/skills/bmad-agent-pm/customize.toml  M .qwen/skills/bmad-agent-tech-writer/SKILL.md  M .qwen/skills/bmad-agent-tech-writer/customize.toml  M .qwen/skills/bmad-agent-tech-writer/explain-concept.md  M .qwen/skills/bmad-agent-tech-writer/mermaid-gen.md  M .qwen/skills/bmad-agent-tech-writer/validate-doc.md  M .qwen/skills/bmad-agent-tech-writer/write-document.md  M .qwen/skills/bmad-agent-ux-designer/SKILL.md  M .qwen/skills/bmad-agent-ux-designer/customize.toml  M .qwen/skills/bmad-brainstorming/SKILL.md  D .qwen/skills/bmad-brainstorming/brain-methods.csv  D .qwen/skills/bmad-brainstorming/steps/step-01-session-setup.md  D .qwen/skills/bmad-brainstorming/steps/step-01b-continue.md  D .qwen/skills/bmad-brainstorming/steps/step-02a-user-selected.md  D .qwen/skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  D .qwen/skills/bmad-brainstorming/steps/step-02c-random-selection.md  D .qwen/skills/bmad-brainstorming/steps/step-02d-progressive-flow.md  D .qwen/skills/bmad-brainstorming/steps/step-03-technique-execution.md  D .qwen/skills/bmad-brainstorming/steps/step-04-idea-organization.md  D .qwen/skills/bmad-brainstorming/template.md  D .qwen/skills/bmad-brainstorming/workflow.md  M .qwen/skills/bmad-check-implementation-readiness/SKILL.md  M .qwen/skills/bmad-check-implementation-readiness/customize.toml  M .qwen/skills/bmad-check-implementation-readiness/steps/step-01-document-discovery.md  M .qwen/skills/bmad-check-implementation-readiness/steps/step-02-prd-analysis.md  M .qwen/skills/bmad-check-implementation-readiness/steps/step-03-epic-coverage-validation.md  M .qwen/skills/bmad-check-implementation-readiness/steps/step-04-ux-alignment.md  M .qwen/skills/bmad-check-implementation-readiness/steps/step-05-epic-quality-review.md  M .qwen/skills/bmad-check-implementation-readiness/steps/step-06-final-assessment.md  M .qwen/skills/bmad-check-implementation-readiness/templates/readiness-report-template.md  M .qwen/skills/bmad-checkpoint-preview/SKILL.md  M .qwen/skills/bmad-checkpoint-preview/customize.toml  M .qwen/skills/bmad-checkpoint-preview/generate-trail.md  M .qwen/skills/bmad-checkpoint-preview/step-01-orientation.md  M .qwen/skills/bmad-checkpoint-preview/step-02-walkthrough.md  M .qwen/skills/bmad-checkpoint-preview/step-03-detail-pass.md  M .qwen/skills/bmad-checkpoint-preview/step-04-testing.md  M .qwen/skills/bmad-checkpoint-preview/step-05-wrapup.md  M .qwen/skills/bmad-code-review/SKILL.md  M .qwen/skills/bmad-code-review/customize.toml  M .qwen/skills/bmad-code-review/steps/step-01-gather-context.md  M .qwen/skills/bmad-code-review/steps/step-02-review.md  M .qwen/skills/bmad-code-review/steps/step-03-triage.md  M .qwen/skills/bmad-code-review/steps/step-04-present.md  M .qwen/skills/bmad-correct-course/SKILL.md  M .qwen/skills/bmad-correct-course/checklist.md  M .qwen/skills/bmad-correct-course/customize.toml  M .qwen/skills/bmad-create-architecture/SKILL.md  D .qwen/skills/bmad-create-architecture/architecture-decision-template.md  M .qwen/skills/bmad-create-architecture/customize.toml  D .qwen/skills/bmad-create-architecture/data/domain-complexity.csv  D .qwen/skills/bmad-create-architecture/data/project-types.csv  D .qwen/skills/bmad-create-architecture/steps/step-01-init.md  D .qwen/skills/bmad-create-architecture/steps/step-01b-continue.md  D .qwen/skills/bmad-create-architecture/steps/step-02-context.md  D .qwen/skills/bmad-create-architecture/steps/step-03-starter.md  D .qwen/skills/bmad-create-architecture/steps/step-04-decisions.md  D .qwen/skills/bmad-create-architecture/steps/step-05-patterns.md  D .qwen/skills/bmad-create-architecture/steps/step-06-structure.md  D .qwen/skills/bmad-create-architecture/steps/step-07-validation.md  D .qwen/skills/bmad-create-architecture/steps/step-08-complete.md  M .qwen/skills/bmad-create-epics-and-stories/SKILL.md  M .qwen/skills/bmad-create-epics-and-stories/customize.toml  M .qwen/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md  M .qwen/skills/bmad-create-epics-and-stories/steps/step-02-design-epics.md  M .qwen/skills/bmad-create-epics-and-stories/steps/step-03-create-stories.md  M .qwen/skills/bmad-create-epics-and-stories/steps/step-04-final-validation.md  M .qwen/skills/bmad-create-epics-and-stories/templates/epics-template.md  M .qwen/skills/bmad-create-prd/SKILL.md  M .qwen/skills/bmad-create-prd/customize.toml  M .qwen/skills/bmad-create-story/SKILL.md  M .qwen/skills/bmad-create-story/checklist.md  M .qwen/skills/bmad-create-story/customize.toml  M .qwen/skills/bmad-create-story/discover-inputs.md  M .qwen/skills/bmad-create-story/template.md  M .qwen/skills/bmad-customize/SKILL.md  M .qwen/skills/bmad-customize/scripts/list_customizable_skills.py  M .qwen/skills/bmad-customize/scripts/tests/test_list_customizable_skills.py  M .qwen/skills/bmad-dev-story/SKILL.md  M .qwen/skills/bmad-dev-story/checklist.md  M .qwen/skills/bmad-dev-story/customize.toml  M .qwen/skills/bmad-document-project/SKILL.md  M .qwen/skills/bmad-document-project/checklist.md  M .qwen/skills/bmad-document-project/customize.toml  M .qwen/skills/bmad-document-project/documentation-requirements.csv  M .qwen/skills/bmad-document-project/instructions.md  M .qwen/skills/bmad-document-project/templates/deep-dive-template.md  M .qwen/skills/bmad-document-project/templates/index-template.md  M .qwen/skills/bmad-document-project/templates/project-overview-template.md  M .qwen/skills/bmad-document-project/templates/project-scan-report-schema.json  M .qwen/skills/bmad-document-project/templates/source-tree-template.md  M .qwen/skills/bmad-document-project/workflows/deep-dive-instructions.md  M .qwen/skills/bmad-document-project/workflows/deep-dive-workflow.md  M .qwen/skills/bmad-document-project/workflows/full-scan-instructions.md  M .qwen/skills/bmad-document-project/workflows/full-scan-workflow.md  M .qwen/skills/bmad-domain-research/SKILL.md  M .qwen/skills/bmad-domain-research/customize.toml  M .qwen/skills/bmad-domain-research/domain-steps/step-01-init.md  M .qwen/skills/bmad-domain-research/domain-steps/step-02-domain-analysis.md  M .qwen/skills/bmad-domain-research/domain-steps/step-03-competitive-landscape.md  M .qwen/skills/bmad-domain-research/domain-steps/step-04-regulatory-focus.md  M .qwen/skills/bmad-domain-research/domain-steps/step-05-technical-trends.md  M .qwen/skills/bmad-domain-research/domain-steps/step-06-research-synthesis.md  M .qwen/skills/bmad-domain-research/research.template.md  M .qwen/skills/bmad-edit-prd/SKILL.md  M .qwen/skills/bmad-edit-prd/customize.toml  M .qwen/skills/bmad-editorial-review-prose/SKILL.md  M .qwen/skills/bmad-editorial-review-structure/SKILL.md  M .qwen/skills/bmad-generate-project-context/SKILL.md  M .qwen/skills/bmad-generate-project-context/customize.toml  M .qwen/skills/bmad-generate-project-context/project-context-template.md  M .qwen/skills/bmad-generate-project-context/steps/step-01-discover.md  M .qwen/skills/bmad-generate-project-context/steps/step-02-generate.md  M .qwen/skills/bmad-generate-project-context/steps/step-03-complete.md  M .qwen/skills/bmad-help/SKILL.md  M .qwen/skills/bmad-index-docs/SKILL.md  D .qwen/skills/bmad-investigate/SKILL.md  D .qwen/skills/bmad-investigate/customize.toml  D .qwen/skills/bmad-investigate/references/case-file-template.md  M .qwen/skills/bmad-market-research/SKILL.md  M .qwen/skills/bmad-market-research/customize.toml  M .qwen/skills/bmad-market-research/research.template.md  M .qwen/skills/bmad-market-research/steps/step-01-init.md  M .qwen/skills/bmad-market-research/steps/step-02-customer-behavior.md  M .qwen/skills/bmad-market-research/steps/step-03-customer-pain-points.md  M .qwen/skills/bmad-market-research/steps/step-04-customer-decisions.md  M .qwen/skills/bmad-market-research/steps/step-05-competitive-analysis.md  M .qwen/skills/bmad-market-research/steps/step-06-research-completion.md  M .qwen/skills/bmad-party-mode/SKILL.md  M .qwen/skills/bmad-prd/SKILL.md  M .qwen/skills/bmad-prd/assets/headless-schemas.md  M .qwen/skills/bmad-prd/assets/prd-template.md  M .qwen/skills/bmad-prd/assets/prd-validation-checklist.md  M .qwen/skills/bmad-prd/assets/validation-report-template.html  M .qwen/skills/bmad-prd/customize.toml  M .qwen/skills/bmad-prd/references/headless.md  M .qwen/skills/bmad-prd/references/validate.md  M .qwen/skills/bmad-prfaq/SKILL.md  M .qwen/skills/bmad-prfaq/agents/artifact-analyzer.md  M .qwen/skills/bmad-prfaq/agents/web-researcher.md  M .qwen/skills/bmad-prfaq/assets/prfaq-template.md  M .qwen/skills/bmad-prfaq/bmad-manifest.json  M .qwen/skills/bmad-prfaq/customize.toml  M .qwen/skills/bmad-prfaq/references/customer-faq.md  M .qwen/skills/bmad-prfaq/references/internal-faq.md  M .qwen/skills/bmad-prfaq/references/press-release.md  M .qwen/skills/bmad-prfaq/references/verdict.md  M .qwen/skills/bmad-product-brief/SKILL.md  M .qwen/skills/bmad-product-brief/assets/brief-template.md  M .qwen/skills/bmad-product-brief/customize.toml  M .qwen/skills/bmad-qa-generate-e2e-tests/SKILL.md  M .qwen/skills/bmad-qa-generate-e2e-tests/checklist.md  M .qwen/skills/bmad-qa-generate-e2e-tests/customize.toml  M .qwen/skills/bmad-quick-dev/SKILL.md  M .qwen/skills/bmad-quick-dev/compile-epic-context.md  M .qwen/skills/bmad-quick-dev/customize.toml  M .qwen/skills/bmad-quick-dev/spec-template.md  M .qwen/skills/bmad-quick-dev/step-01-clarify-and-route.md  M .qwen/skills/bmad-quick-dev/step-02-plan.md  M .qwen/skills/bmad-quick-dev/step-03-implement.md  M .qwen/skills/bmad-quick-dev/step-04-review.md  M .qwen/skills/bmad-quick-dev/step-05-present.md  M .qwen/skills/bmad-quick-dev/step-oneshot.md  M .qwen/skills/bmad-quick-dev/sync-sprint-status.md  M .qwen/skills/bmad-retrospective/SKILL.md  M .qwen/skills/bmad-retrospective/customize.toml  M .qwen/skills/bmad-review-adversarial-general/SKILL.md  M .qwen/skills/bmad-review-edge-case-hunter/SKILL.md  M .qwen/skills/bmad-shard-doc/SKILL.md  M .qwen/skills/bmad-spec/SKILL.md  M .qwen/skills/bmad-spec/assets/headless-schemas.md  M .qwen/skills/bmad-spec/assets/spec-template.md  M .qwen/skills/bmad-spec/customize.toml  M .qwen/skills/bmad-sprint-planning/SKILL.md  M .qwen/skills/bmad-sprint-planning/checklist.md  M .qwen/skills/bmad-sprint-planning/customize.toml  M .qwen/skills/bmad-sprint-planning/sprint-status-template.yaml  M .qwen/skills/bmad-sprint-status/SKILL.md  M .qwen/skills/bmad-sprint-status/customize.toml  M .qwen/skills/bmad-story-automator/data/monitoring-fallback.md  M .qwen/skills/bmad-story-automator/data/orchestration-policy.json  M .qwen/skills/bmad-story-automator/data/prompts/auto.md  M .qwen/skills/bmad-story-automator/data/prompts/create.md  M .qwen/skills/bmad-story-automator/data/prompts/dev.md  M .qwen/skills/bmad-story-automator/data/prompts/review.md  M .qwen/skills/bmad-story-automator/src/story_automator/commands/orchestrator.py  M .qwen/skills/bmad-story-automator/src/story_automator/commands/orchestrator_epic_agents.py  M .qwen/skills/bmad-story-automator/src/story_automator/commands/tmux.py  M .qwen/skills/bmad-story-automator/src/story_automator/commands/validate_story_creation.py  M .qwen/skills/bmad-story-automator/src/story_automator/core/story_keys.py  M .qwen/skills/bmad-story-automator/src/story_automator/core/success_verifiers.py  M .qwen/skills/bmad-story-automator/src/story_automator/core/utils.py  M .qwen/skills/bmad-story-automator/steps-c/step-01b-continue.md  M .qwen/skills/bmad-tea/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-tea/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-tea/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-technical-research/SKILL.md  M .qwen/skills/bmad-technical-research/customize.toml  M .qwen/skills/bmad-technical-research/research.template.md  M .qwen/skills/bmad-technical-research/technical-steps/step-01-init.md  M .qwen/skills/bmad-technical-research/technical-steps/step-02-technical-overview.md  M .qwen/skills/bmad-technical-research/technical-steps/step-03-integration-patterns.md  M .qwen/skills/bmad-technical-research/technical-steps/step-04-architectural-patterns.md  M .qwen/skills/bmad-technical-research/technical-steps/step-05-implementation-research.md  M .qwen/skills/bmad-technical-research/technical-steps/step-06-research-synthesis.md  M .qwen/skills/bmad-testarch-atdd/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-atdd/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-atdd/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-automate/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-automate/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-automate/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-ci/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-ci/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-ci/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-framework/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-framework/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-framework/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-nfr/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-nfr/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-nfr/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-test-design/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-test-design/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-test-design/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-test-review/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-test-review/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-test-review/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-testarch-trace/resources/knowledge/contract-testing.md  M .qwen/skills/bmad-testarch-trace/resources/knowledge/pact-broker-webhooks.md  M .qwen/skills/bmad-testarch-trace/resources/knowledge/pact-consumer-framework-setup.md  M .qwen/skills/bmad-ux/SKILL.md  M .qwen/skills/bmad-ux/assets/color-themes.md  M .qwen/skills/bmad-ux/assets/design-directions.md  M .qwen/skills/bmad-ux/assets/design-example-editorial.md  M .qwen/skills/bmad-ux/assets/design-example-mobile.md  M .qwen/skills/bmad-ux/assets/design-example-shadcn.md  M .qwen/skills/bmad-ux/assets/excalidraw-wireframe.md  M .qwen/skills/bmad-ux/assets/experience-example-mobile.md  M .qwen/skills/bmad-ux/assets/experience-example-shadcn.md  M .qwen/skills/bmad-ux/assets/headless-schemas.md  M .qwen/skills/bmad-ux/assets/key-screens.md  M .qwen/skills/bmad-ux/assets/validation-report-template.html  M .qwen/skills/bmad-ux/customize.toml  M .qwen/skills/bmad-ux/references/creative-tools.md  M .qwen/skills/bmad-ux/references/design-md-spec.md  M .qwen/skills/bmad-ux/references/headless.md  M .qwen/skills/bmad-ux/references/validate.md  M .qwen/skills/bmad-validate-prd/SKILL.md  M .qwen/skills/bmad-validate-prd/customize.toml  M _bmad/_config/bmad-help.csv  M _bmad/_config/files-manifest.csv  M _bmad/_config/manifest.yaml  M _bmad/_config/skill-manifest.csv  M _bmad/automator/config.yaml  M _bmad/bmb/config.yaml  M _bmad/bmm/config.yaml  M _bmad/bmm/module-help.csv  M _bmad/cis/config.yaml  M _bmad/config.toml  M _bmad/config.user.toml  M _bmad/core/config.yaml  M _bmad/core/module-help.csv  M _bmad/gds/config.yaml  M _bmad/scripts/resolve_config.py  M _bmad/scripts/resolve_customization.py  D _bmad/scripts/tests/test_resolve_customization.py  M _bmad/tea/config.yaml  M _bmad/wds/config.yaml  M _bmad/wds/data/presentations/freya-intro.md  M _bmad/wds/data/presentations/saga-intro.md ?? .bmad-loop/ ?? "26-07-22 Beredskap101 Stabilization and Production-Readiness Plan.md" ?? docs/AUDIT_AND_REMEDIATION_STATUS_2026-07-22.md ?? plan.md ?? pyproject.toml
