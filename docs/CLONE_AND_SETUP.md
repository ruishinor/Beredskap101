# Clone and continue on another computer

Published development branch: `cx/stabilization-2026-10-04` in `ruishinor/Beredskap101`.

## Requirements

- Git and Node.js 24, including npm.
- GitHub authentication with access to the repository if it is private.
- Internet access for the initial clone and package downloads.

## Clone and start

```powershell
git clone --branch cx/stabilization-2026-10-04 https://github.com/ruishinor/Beredskap101.git
cd Beredskap101
npm ci --no-audit
npm run dev
```

Open `http://localhost:3011`. The development command starts the API on port 3002 and the UI on port 3011. Those ports must be available.

The core application does not require secret keys. Defaults work without an `.env` file. To configure optional local settings, copy `.env.example` to `.env` and edit the new local file. Never commit `.env` or copy another computer's credentials into the repository.

```powershell
Copy-Item .env.example .env
```

Run that copy only when you do not already have a local `.env` to preserve.

## Verify the checkout

```powershell
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` includes a production build and local API checks; it must be able to start and connect to its own localhost servers. The browser command builds again and runs the Chromium suite. Linux systems may need `npx playwright install --with-deps chromium` to install browser system dependencies.

`--no-audit` disables npm's automatic vulnerability-advisory query during installation. Current dependency-advisory status remains unverified at the owner's request. CI also leaves advisory queries disabled by default; an owner can explicitly opt in using the workflow's manual `run_dependency_audit` input. Package downloads still contact the package registry to install the locked dependencies.

## What is portable

Application source, curated data, bundled map, lockfile, tests, CI, configuration examples, and audit/planning records are versioned. `node_modules`, build output, `.env`, local credentials, scratch logs, and browser profiles are not transferred by Git.

Browser-local checklist progress, documents, preferences, and backups are separate from source code. Export any records you need from the app on the old computer and import the appropriate backup on the new one. Git cloning does not transfer browser storage. Keep personal backups outside the repository.

Python is optional for regenerating the schematic PMTiles archive; it is not needed to run the bundled application. See `public/maps/README.md` for that separate workflow.

## Continue later

```powershell
git status
git pull --ff-only
npm ci --no-audit
```

Commit or otherwise preserve your own work before pulling if Git reports local changes. Use a separate branch when making a new change.

The current audit is `docs/AUDIT_AND_IMPLEMENTATION_2026-10-31.md`. Its `scratch/` references identify evidence retained on the original machine; those ignored logs are not part of a fresh clone. The report includes the validation results and remaining release limitations. The July plans are historical context, not current completion claims.
