# Orchestration Plan — REMEDIATION_ROADMAP_2026-07-18 Execution

**Freeze point:** tag `pre-remediation-freeze-2026-07-18` @ ce0245f (rollback point).
**Source of truth:** `docs/REMEDIATION_ROADMAP_2026-07-18.md` (phases 0–8, stage-gated).

## Execution strategy

Phases are stage-gated per the roadmap, but phases with **disjoint file ownership** run in parallel swarms. Phases that share `App.tsx` / `vite.config.ts` run sequentially to avoid merge conflicts between agents (parallel agents cannot see each other's output).

| Wave | Agents (role labels) | Scope | Mode |
|---|---|---|---|
| 0 | — | Freeze + tag | Done |
| 1 | `Phase0_Gatekeeper` | Phase 0: e2e tile stub, mega-test split, CI workflow, validation log | Single agent — **stage gate for everything** |
| 2 | `Phase2_Crypto`, `Phase5_ServerHardening`, `Phase7_RepoHygiene` | Disjoint files: `saveSystem.ts` / `server.js`+`api/` / repo purge+docs | Parallel swarm (after Phase 0 green) |
| 3 | `Phase1_TrustUX` | Phase 1: pillars, cookie banner, KnowledgeMap search, telemetry (owns App.tsx) | Sequential |
| 4 | `Phase34_OfflinePerf` | Phase 3 + 4: pmtiles precache, SW, icon registry, chunks, router extraction | Sequential |
| 5 | `Phase6_TypesI18n` | Phase 6: tsconfig strictness, i18n consolidation, a11y | Sequential |
| 6 | `Phase8_ReleasePrep` | Phase 8: disclaimer gate, release prep | Sequential |

## Owner decision gates (cannot be completed autonomously)
- **CI run URL (0.3):** workflow file created locally; pushing branch + verifying green GitHub run requires repo push.
- **Phase 7.3.3 LICENSE choice:** owner must pick (suggestion: CC-BY-4.0 content + MIT code).
- **Phase 8.1 external content review:** requires human medical/preparedness reviewer — ship as RC until done.
- **`git filter-repo` history rewrite:** explicitly owner-approved-only; default = skip.
- **`.github/agents` BMAD files:** keep-or-drop depends on owner's Copilot usage.

## Global constraints (from roadmap, enforced on every agent)
- No new runtime deps. No files outside workspace except quarantine moves to `C:\00 DEV\In Progress\_beredskap101-quarantine\2026-07-18\`.
- Backwards compat: hash routes, storage keys, v1/v2 backup read path, NO/EN UI contract.
- After each module: `npm run lint && npm run build` green + module checks.
- Commit per module, on `main`, small reversible units.
