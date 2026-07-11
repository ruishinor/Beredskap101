# Package portability correction — 2026-07-11

## Defect

The previous stabilized archive contained 29 `package-lock.json` tarball URLs that referenced an OpenAI-internal npm gateway. That gateway is not reachable from a normal local development machine. A clean `npm ci` could therefore remove the existing dependency tree and then fail partway through installation, leaving commands such as `tsc` and `playwright` unavailable.

## Correction

- Replaced every internal tarball URL with its canonical `https://registry.npmjs.org/` URL.
- Added a project-local `.npmrc` that selects the public npm registry.
- Added `npm run verify:portability`, which rejects internal, loopback, malformed, or non-public lockfile URLs.
- Added a bounded cross-platform verification runner. Each major gate has a hard timeout and failed child-process trees are terminated rather than left running indefinitely.

## Release status

This correction restores package portability and bounded failure handling. It does not convert the remaining browser E2E condition into a pass. Production deployment still requires `npm run verify:release` to pass on the target Windows environment with a usable Playwright Chromium installation.
