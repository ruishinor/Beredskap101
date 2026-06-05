# Repository Operating Model (`beredskap101-app`)

## 1) Purpose and Ownership
This repository is the product and deployment source for Beredskap101.

- Owns: UI/UX, runtime behavior, localization, build, test, release, Vercel deployment.
- Does not own: raw scraping experiments, large upstream corpus management, source harvesting workflows.

Primary maintainers (human or AI) treat this repo as production-grade application code.

## 2) Scope Boundaries
In scope:
- `src/` application code and curated runtime dataset.
- `scripts/parse-assets.ts` ingestion from approved upstream processed assets.
- Build and validation scripts used for release quality gates.

Out of scope:
- Raw source dumps and browser sidecar downloads (`*.download`, `*_files/`).
- Content crawling or exploratory processing pipelines.

## 3) Relationship to `beredskap101-content-lab`
`beredskap101-content-lab` is upstream content workspace.

- This repo pulls curated content from upstream, then freezes it into `src/data/processedAssets.json`.
- Runtime app must not read sibling folders directly.
- Any upstream refresh is a deliberate manual ingest-and-review step.

## 4) Canonical Data Flow
1. Upstream prepares data in `beredskap101-content-lab/processed-assets`.
2. This repo ingests via `B101_ASSETS_DIR`:
   - `npm run ingest:preview`
   - Review rejection summary and quality.
3. Build curated bundle:
   - `npm run ingest:build`
4. Validate contract and runtime assumptions:
   - `npm run ingest:validate`
   - `npm run lint`
   - `npm run build`
5. Commit only curated runtime dataset changes and relevant app code/docs.

## 5) Git and Vercel Rules
- This repo is the only Vercel-linked deploy target.
- Vercel project root must point to this repo root.
- Do not configure Vercel to include sibling workspaces.
- Runtime uses committed JSON only (`src/data/processedAssets.json`).

## 6) Naming and Directory Map
- Repo name: `beredskap101-app`
- Key paths:
  - `src/` app runtime
  - `src/data/processedAssets.json` curated ingest output
  - `scripts/parse-assets.ts` ingest pipeline
  - `scripts/validate-processed-assets.ts` contract checks

## 7) Daily Workflow (Human + AI)
Read first:
1. `REPO_OPERATING_MODEL.md`
2. `README.md`
3. `package.json` scripts
4. `scripts/parse-assets.ts` before content refresh changes

Safe command baseline:
- `npm run lint`
- `npm run build`
- `npm run ingest:preview` (requires `B101_ASSETS_DIR`)

Anti-footgun:
- Never commit raw upstream dumps or sidecar asset folders.
- Never bypass ingest validation when updating `processedAssets.json`.
- Never add runtime dependency on `beredskap101-content-lab` filesystem paths.

## 8) Manual Release Process (Content Refresh)
1. Ensure upstream content is stable in content-lab.
2. Set env:
   - `B101_ASSETS_DIR=<absolute-path-to-beredskap101-content-lab/processed-assets>`
   - Optional: `B101_SOURCE_REVISION=<git-sha-or-tag>`
3. Run preview and inspect top rejection reasons.
4. Run build ingest and validate outputs.
5. Run app checks (`lint`, `build`), smoke test search/library/stress-mode.
6. Commit curated dataset + any parser changes with clear ingest context.

Rollback:
- Revert `src/data/processedAssets.json` to prior known-good commit.
- Re-run `npm run build` and smoke checks.

## 9) Troubleshooting Matrix
| Symptom | Likely Cause | Action |
|---|---|---|
| `B101_ASSETS_DIR` missing error | Env not set | Export env var and rerun ingest |
| Many `MISSING_COMPANION_FILES` rejects | Upstream processing incomplete | Complete upstream generation first |
| Mojibake text (`Ã¸`, `Ã¥`) appears | Encoding from upstream files | Re-run ingest; verify normalization output |
| High `OFF_DOMAIN_CONTENT` rejects | Noisy upstream corpus | Tighten upstream curation or adjust relevance filters |
| App library empty | Invalid ingest output shape | Run `npm run ingest:validate` and inspect report |

## 10) Do / Don't (Vibecoder + AI + Coder)
Do:
- Keep this repo deploy-focused and deterministic.
- Validate before committing dataset updates.
- Document ingest assumptions in commit messages.

Don't:
- Mix raw lab artifacts into app runtime.
- Link Vercel to upstream lab repo.
- Skip preview/rejection review and push blind ingest updates.
